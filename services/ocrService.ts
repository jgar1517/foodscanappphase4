import * as FileSystem from 'expo-file-system';

export interface OCRResult {
  text: string;
  confidence: number;
  blocks: TextBlock[];
  processingTime: number;
  source: string;
}

export interface TextBlock {
  text: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
}

export interface ProcessedIngredients {
  ingredients: string[];
  rawText: string;
  confidence: number;
  processingTime: number;
}

export interface ImageQualityCheck {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
}

class OCRService {
  private static instance: OCRService;
  private readonly SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
  private readonly SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  public static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService();
    }
    return OCRService.instance;
  }

  /**
   * Validate image quality before processing
   */
  async validateImageQuality(imageUri: string): Promise<ImageQualityCheck> {
    const issues: string[] = [];
    const suggestions: string[] = [];

    try {
      // Get image info
      const imageInfo = await FileSystem.getInfoAsync(imageUri);
      
      if (!imageInfo.exists) {
        issues.push('Image file not found');
        suggestions.push('Please take a new photo');
        return { isValid: false, issues, suggestions };
      }

      // Check file size (should be reasonable for processing)
      if (imageInfo.size && imageInfo.size > 10 * 1024 * 1024) { // 10MB
        issues.push('Image file too large');
        suggestions.push('Try taking a photo with lower resolution');
      }

      if (imageInfo.size && imageInfo.size < 50 * 1024) { // 50KB
        issues.push('Image file too small');
        suggestions.push('Ensure the image is clear and well-lit');
      }

      // Basic validation passed
      if (issues.length === 0) {
        return { isValid: true, issues: [], suggestions: [] };
      }

      // If there are issues but they're not critical, suggest improvements
      if (issues.length > 0) {
        suggestions.push('Ensure good lighting and clear focus');
        suggestions.push('Keep the label flat and avoid shadows');
      }

      return { 
        isValid: issues.length === 0, 
        issues, 
        suggestions 
      };
    } catch (error) {
      console.error('Image quality validation failed:', error);
      return {
        isValid: false,
        issues: ['Unable to validate image'],
        suggestions: ['Please try taking a new photo']
      };
    }
  }

  /**
   * Extract text from image using Supabase Edge Function
   */
  async extractTextFromImage(imageUri: string): Promise<OCRResult> {
    const startTime = Date.now();

    try {
      if (!this.SUPABASE_URL || !this.SUPABASE_ANON_KEY) {
        throw new Error('Supabase configuration missing. Please check your environment variables.');
      }

      console.log('Converting image to base64...');
      const base64Image = await this.convertImageToBase64(imageUri);
      
      console.log('Calling OCR Edge Function...');
      const response = await this.callOCREdgeFunction(base64Image);
      
      const processingTime = Date.now() - startTime;
      
      return {
        ...response,
        processingTime
      };
    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert image to base64 format
   */
  private async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      return base64;
    } catch (error) {
      console.error('Failed to convert image to base64:', error);
      throw new Error('Failed to process image file');
    }
  }

  /**
   * Call the OCR Edge Function
   */
  private async callOCREdgeFunction(base64Image: string): Promise<OCRResult> {
    const functionUrl = `${this.SUPABASE_URL}/functions/v1/ocr-process`;
    
    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          base64Image
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge Function error response:', errorText);
        throw new Error(`Edge Function failed with status ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'OCR processing failed');
      }

      return result.data;
    } catch (error) {
      console.error('Edge Function call failed:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Network request failed')) {
          throw new Error('Network connection failed. Please check your internet connection.');
        }
        if (error.message.includes('404')) {
          throw new Error('OCR service not found. Please ensure the Edge Function is deployed.');
        }
        throw error;
      }
      
      throw new Error('Failed to connect to OCR service');
    }
  }

  /**
   * Process raw OCR text into structured ingredient list
   */
  async processIngredientsFromText(ocrResult: OCRResult): Promise<ProcessedIngredients> {
    const startTime = Date.now();
    
    try {
      console.log('Processing OCR text:', ocrResult.text.substring(0, 100) + '...');
      
      const ingredients = this.parseIngredientsFromText(ocrResult.text);
      const processingTime = Date.now() - startTime;

      console.log(`Extracted ${ingredients.length} ingredients:`, ingredients);

      return {
        ingredients,
        rawText: ocrResult.text,
        confidence: ocrResult.confidence,
        processingTime
      };
    } catch (error) {
      console.error('Text processing failed:', error);
      throw new Error('Failed to process ingredient text');
    }
  }

  /**
   * Parse ingredients from raw text using intelligent parsing
   */
  private parseIngredientsFromText(text: string): string[] {
    if (!text || text.trim().length === 0) {
      throw new Error('No text found in image');
    }

    // Clean and normalize the text
    let cleanText = text
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();

    // Find the ingredients section
    const ingredientsMatch = cleanText.match(/ingredients?[:\s]+(.*?)(?:nutrition|allergen|contains|directions|net\s*wt|best\s*by|exp|$)/i);
    
    if (ingredientsMatch) {
      cleanText = ingredientsMatch[1];
    }

    // Remove common non-ingredient text
    cleanText = cleanText
      .replace(/\b(contains?|may contain|allergen|warning|caution)\b.*$/i, '')
      .replace(/\b(nutrition facts?|nutritional information)\b.*$/i, '')
      .replace(/\b(net\s*wt|weight|oz|lb|g|kg|ml|l)\b.*$/i, '')
      .replace(/\b(best\s*by|exp\s*date|use\s*by)\b.*$/i, '')
      .replace(/[()[\]]/g, '') // Remove parentheses and brackets
      .trim();

    // Split by common delimiters
    let ingredients = cleanText
      .split(/[,;]/) // Split by comma or semicolon
      .map(ingredient => ingredient.trim())
      .filter(ingredient => ingredient.length > 0);

    // Clean individual ingredients
    ingredients = ingredients.map(ingredient => {
      return ingredient
        .replace(/^and\s+/i, '') // Remove leading "and"
        .replace(/\.$/, '') // Remove trailing period
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
    }).filter(ingredient => {
      // Filter out non-ingredient text
      if (ingredient.length < 2) return false;
      if (/^\d+$/.test(ingredient)) return false; // Pure numbers
      if (/^[^a-zA-Z]*$/.test(ingredient)) return false; // No letters
      return true;
    });

    // Handle special cases where ingredients might be separated by periods or other delimiters
    if (ingredients.length === 1 && ingredients[0].includes('.')) {
      const periodSplit = ingredients[0].split('.')
        .map(s => s.trim())
        .filter(s => s.length > 2);
      
      if (periodSplit.length > 1) {
        ingredients = periodSplit;
      }
    }

    // Limit to reasonable number of ingredients (most products have 2-20 ingredients)
    if (ingredients.length > 25) {
      ingredients = ingredients.slice(0, 25);
    }

    if (ingredients.length === 0) {
      throw new Error('No ingredients could be identified in the text');
    }

    return ingredients;
  }

  /**
   * Test OCR service connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.SUPABASE_URL || !this.SUPABASE_ANON_KEY) {
        console.error('Supabase configuration missing');
        return false;
      }

      const functionUrl = `${this.SUPABASE_URL}/functions/v1/ocr-process`;
      
      // Test with a minimal request to check if the function is accessible
      const response = await fetch(functionUrl, {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${this.SUPABASE_ANON_KEY}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('OCR service connection test failed:', error);
      return false;
    }
  }

  /**
   * Get service status and configuration
   */
  getServiceInfo(): {
    configured: boolean;
    supabaseUrl: string | undefined;
    hasApiKey: boolean;
  } {
    return {
      configured: !!(this.SUPABASE_URL && this.SUPABASE_ANON_KEY),
      supabaseUrl: this.SUPABASE_URL,
      hasApiKey: !!this.SUPABASE_ANON_KEY
    };
  }
}

export default OCRService.getInstance();