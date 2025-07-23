import * as FileSystem from 'expo-file-system';

export interface OCRResult {
  text: string;
  confidence: number;
  blocks: {
    text: string;
    boundingBox: { x: number; y: number; width: number; height: number };
    confidence: number;
  }[];
  processingTime: number;
  source: string;
}

export interface ProcessedIngredients {
  ingredients: string[];
  rawText: string;
  confidence: number;
  processingTime: number;
}

export interface ImageQualityCheckResult {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
}

class OCRService {
  private static instance: OCRService;
  // Replace with your actual Supabase Edge Function URL
  // This should be the URL of your deployed 'ocr-process' function
  private readonly OCR_FUNCTION_URL = 'https://nvphkphxcesefdtjngmd.supabase.co/functions/v1/ocr-process';


  public static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService();
    }
    return OCRService.instance;
  }

  /**
   * Validates image quality before sending for OCR.
   * This is a basic implementation and can be enhanced.
   */
  async validateImageQuality(imageUri: string): Promise<ImageQualityCheckResult> {
    // In a real app, you might analyze image metadata (resolution, size)
    // or even use a local ML model for blur detection.
    // For now, we'll assume basic validity.
    if (!imageUri || imageUri.trim() === '') {
      return {
        isValid: false,
        issues: ['Image URI is empty'],
        suggestions: ['Please provide a valid image.']
      };
    }
    // Simulate some checks
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Example: Check file size (very basic, requires actual file access)
    // This part would need to be more robust in a production app
    // For now, we'll just return true.
    
    return {
      isValid: issues.length === 0,
      issues,
      suggestions
    };
  }

  /**
   * Extracts text from an image using the Supabase Edge Function.
   */
  async extractTextFromImage(imageUri: string): Promise<OCRResult> {
  const startTime = Date.now();
  try {
    // Read the image file and convert to base64
    const base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Make a POST request to your Supabase Edge Function
    const response = await fetch(this.OCR_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // ADD THIS LINE:
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52cGhrcGh4Y2VzZWZkdGpuZ21kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMzEzMjQsImV4cCI6MjA2ODgwNzMyNH0.TW_mL_p6KmE97fTJ-QBXIZaD1iarH_39ScYpE3gMtuo`,
      },
      body: JSON.stringify({ base64Image }),
    });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OCR Edge Function error:', errorData);
        throw new Error(`OCR processing failed: ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(`OCR processing failed: ${result.error}`);
      }

      const processingTime = Date.now() - startTime;

      return {
        ...result.data,
        processingTime,
      };

    } catch (error) {
      console.error('Error extracting text from image:', error);
      throw new Error(`Failed to extract text from image: ${error.message}`);
    }
  }

  /**
   * Processes raw OCR text to extract a list of ingredients.
   * This is a simplified parser and can be greatly enhanced with NLP.
   */
  async processIngredientsFromText(ocrResult: OCRResult): Promise<ProcessedIngredients> {
    const startTime = Date.now();
    const rawText = ocrResult.text;
    let ingredients: string[] = [];

    // Simple heuristic: look for common ingredient list indicators
    const ingredientKeywords = ['ingredients:', 'ingredientes:', 'contains:', 'composition:'];
    let startIndex = -1;

    for (const keyword of ingredientKeywords) {
      const index = rawText.toLowerCase().indexOf(keyword);
      if (index !== -1) {
        startIndex = index + keyword.length;
        break;
      }
    }

    if (startIndex !== -1) {
      let ingredientListText = rawText.substring(startIndex).trim();

      // Remove common trailing text that is not part of ingredients
      const stopKeywords = ['nutrition facts', 'nutritional information', 'allergens', 'allergy information', 'directions', 'serving suggestion'];
      for (const keyword of stopKeywords) {
        const index = ingredientListText.toLowerCase().indexOf(keyword);
        if (index !== -1) {
          ingredientListText = ingredientListText.substring(0, index).trim();
          break;
        }
      }

      // Split by common delimiters (commas, periods, semicolons, new lines)
      ingredients = ingredientListText
        .split(/[,.;\n]/)
        .map(item => item.replace(/[\(\)\[\]]/g, '').trim()) // Remove parentheses/brackets
        .filter(item => item.length > 2 && !/^\d+$/.test(item)) // Filter out very short items or numbers
        .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
    } else {
      // If no clear ingredient list found, try to extract common food terms
      // This is a very basic fallback.
      const commonFoodTerms = ['sugar', 'salt', 'water', 'flour', 'oil', 'milk', 'egg', 'corn', 'soy', 'wheat', 'rice', 'acid', 'flavor', 'color'];
      ingredients = rawText.split(/\s+/)
        .map(word => word.toLowerCase().replace(/[^a-z]/g, ''))
        .filter(word => commonFoodTerms.includes(word))
        .filter((value, index, self) => self.indexOf(value) === index);
    }

    // Further clean and refine ingredients (e.g., remove numbers, symbols, common packaging terms)
    ingredients = ingredients.map(ing => 
      ing.replace(/\b(g|mg|mcg|iu|kcal|kj|oz|lb|ml|l)\b/gi, '') // Remove units
         .replace(/\d+(\.\d+)?%?/g, '') // Remove percentages and numbers
         .replace(/[\*\+\-–—]/g, '') // Remove common bullet/dash characters
         .trim()
    ).filter(ing => ing.length > 2); // Filter again after cleaning

    return {
      ingredients: ingredients,
      rawText: rawText,
      confidence: ocrResult.confidence,
      processingTime: Date.now() - startTime,
    };
  }
}

export default OCRService.getInstance();
