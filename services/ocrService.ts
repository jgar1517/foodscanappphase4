import * as ImagePicker from 'expo-image-picker';

// OCR Service Interface
export interface OCRResult {
  text: string;
  confidence: number;
  blocks: TextBlock[];
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

class OCRService {
  private static instance: OCRService;

  public static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService();
    }
    return OCRService.instance;
  }

  /**
   * Extract text from image using OCR
   */
  async extractTextFromImage(imageUri: string): Promise<OCRResult> {
    const startTime = Date.now();
    
    try {
      // For now, we'll simulate OCR processing
      // In a real implementation, this would use Google ML Kit or Tesseract
      const mockResult = await this.simulateOCR(imageUri);
      
      const processingTime = Date.now() - startTime;
      console.log(`OCR processing completed in ${processingTime}ms`);
      
      return mockResult;
    } catch (error) {
      console.error('OCR processing failed:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  /**
   * Process extracted text to identify ingredients
   */
  async processIngredientsFromText(ocrResult: OCRResult): Promise<ProcessedIngredients> {
    const startTime = Date.now();
    
    try {
      const cleanedText = this.cleanText(ocrResult.text);
      const ingredients = this.parseIngredients(cleanedText);
      
      const processingTime = Date.now() - startTime;
      
      return {
        ingredients,
        rawText: ocrResult.text,
        confidence: ocrResult.confidence,
        processingTime
      };
    } catch (error) {
      console.error('Ingredient processing failed:', error);
      throw new Error('Failed to process ingredients from text');
    }
  }

  /**
   * Clean and normalize extracted text
   */
  private cleanText(text: string): string {
    return text
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove common label prefixes
      .replace(/^(ingredients?:?\s*)/i, '')
      // Remove parenthetical information that's not ingredients
      .replace(/\([^)]*\)/g, '')
      // Remove common suffixes
      .replace(/\.\s*$/, '')
      // Trim whitespace
      .trim();
  }

  /**
   * Parse ingredients from cleaned text
   */
  private parseIngredients(text: string): string[] {
    // Split by common delimiters
    const ingredients = text
      .split(/[,;]/)
      .map(ingredient => ingredient.trim())
      .filter(ingredient => ingredient.length > 0)
      // Remove very short or very long strings (likely not ingredients)
      .filter(ingredient => ingredient.length >= 2 && ingredient.length <= 50)
      // Clean up each ingredient
      .map(ingredient => this.cleanIngredientName(ingredient));

    return ingredients;
  }

  /**
   * Clean individual ingredient names
   */
  private cleanIngredientName(ingredient: string): string {
    return ingredient
      // Remove leading/trailing punctuation
      .replace(/^[^\w]+|[^\w]+$/g, '')
      // Capitalize first letter
      .replace(/^\w/, c => c.toUpperCase())
      // Remove extra spaces
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Simulate OCR processing for development
   * In production, this would be replaced with actual OCR implementation
   */
  private async simulateOCR(imageUri: string): Promise<OCRResult> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock OCR results for different types of products
    const mockResults = [
      {
        text: "Ingredients: Water, Organic Cane Sugar, Natural Flavors, Citric Acid, Sodium Benzoate, Ascorbic Acid (Vitamin C), Artificial Color Red 40, Gum Arabic",
        confidence: 92,
        blocks: []
      },
      {
        text: "INGREDIENTS: Enriched Flour, Sugar, Palm Oil, High Fructose Corn Syrup, Salt, Baking Soda, Natural and Artificial Flavors, Soy Lecithin",
        confidence: 88,
        blocks: []
      },
      {
        text: "Ingredients: Organic Tomatoes, Water, Organic Onions, Organic Garlic, Sea Salt, Organic Basil, Organic Oregano",
        confidence: 95,
        blocks: []
      }
    ];

    // Return a random mock result
    return mockResults[Math.floor(Math.random() * mockResults.length)];
  }

  /**
   * Validate image quality for OCR processing
   */
  async validateImageQuality(imageUri: string): Promise<{
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  }> {
    // In a real implementation, this would analyze image quality
    // For now, return a mock validation
    return {
      isValid: true,
      issues: [],
      suggestions: []
    };
  }
}

export default OCRService.getInstance();