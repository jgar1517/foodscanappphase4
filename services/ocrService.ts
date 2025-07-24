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
   * Enhanced parser with better filtering and text cleaning.
   */
  async processIngredientsFromText(ocrResult: OCRResult): Promise<ProcessedIngredients> {
    const startTime = Date.now();
    const rawText = ocrResult.text;
    let ingredients: string[] = [];

    // More comprehensive ingredient list indicators
    const ingredientKeywords = [
      'ingredients:', 'ingredientes:', 'contains:', 'composition:', 
      'made with:', 'made from:', 'ingrédients:', 'contiene:',
      'ingredient list:', 'contains the following:', 'made from:'
    ];
    let startIndex = -1;
    let endIndex = -1;

    for (const keyword of ingredientKeywords) {
      const index = rawText.toLowerCase().indexOf(keyword);
      if (index !== -1) {
        startIndex = index + keyword.length;
        break;
      }
    }

    if (startIndex !== -1) {
      let ingredientListText = rawText.substring(startIndex).trim();

      // More comprehensive stop keywords to end ingredient parsing
      const stopKeywords = [
        'nutrition facts', 'nutritional information', 'allergens', 'allergy information', 
        'directions', 'serving suggestion', 'distributed by', 'manufactured by',
        'best by', 'use by', 'expiration', 'exp', 'lot', 'upc', 'net wt',
        'calories', 'protein', 'carbohydrates', 'fat', 'sodium', 'sugar',
        'vitamin', 'mineral', 'daily value', '%dv', 'serving size',
        'packed for', 'packed by', 'processed for', 'processed by',
        'distributed for', 'made for', 'produced for', 'produced by',
        'address:', 'phone:', 'website:', 'www.', '.com', '.org',
        'city', 'state', 'zip', 'country', 'usa', 'america',
        'llc', 'inc', 'corp', 'ltd', 'company', 'co.',
        'restaurant', 'store', 'market', 'shop', 'brand'
      ];
      
      for (const keyword of stopKeywords) {
        const index = ingredientListText.toLowerCase().indexOf(keyword);
        if (index !== -1) {
          ingredientListText = ingredientListText.substring(0, index).trim();
          endIndex = index;
          break;
        }
      }

      // Split by common delimiters and clean up
      ingredients = ingredientListText
        .split(/[,.;\n]/)
        .map(item => this.cleanIngredientText(item))
        .filter(item => this.isValidIngredient(item))
        .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
    } else {
      // If no clear ingredient list found, return empty array
      // Better to return nothing than incorrect data
      ingredients = [];
    }

    return {
      ingredients: ingredients,
      rawText: rawText,
      confidence: ocrResult.confidence,
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Clean individual ingredient text
   */
  private cleanIngredientText(text: string): string {
    return text
      .replace(/[\(\)\[\]]/g, '') // Remove parentheses/brackets
      .replace(/\b(g|mg|mcg|iu|kcal|kj|oz|lb|ml|l)\b/gi, '') // Remove units
      .replace(/\d+(\.\d+)?%?/g, '') // Remove percentages and numbers
      .replace(/[\*\+\-–—]/g, '') // Remove common bullet/dash characters
      .replace(/\b(and|or|with|contains|may contain)\b/gi, '') // Remove connecting words
      .trim();
  }

  /**
   * Validate if text is likely a real ingredient
   */
  private isValidIngredient(text: string): boolean {
    if (!text || text.length < 2) return false;
    
    // Filter out pure numbers
    if (/^\d+$/.test(text)) return false;
    
    // Comprehensive filter for non-ingredient words
    const nonIngredientWords = [
      'nutrition', 'facts', 'information', 'label', 'product', 'brand',
      'company', 'inc', 'llc', 'corp', 'ltd', 'usa', 'america',
      'distributed', 'manufactured', 'packaged', 'processed',
      'best', 'use', 'exp', 'date', 'lot', 'code', 'upc', 'barcode',
      'calories', 'protein', 'carbs', 'fat', 'fiber', 'serving',
      'size', 'weight', 'net', 'gross', 'total', 'per', 'daily',
      'value', 'percent', 'vitamin', 'mineral', 'supplement',
      'warning', 'caution', 'allergen', 'gluten', 'dairy', 'soy',
      'keep', 'store', 'refrigerate', 'freeze', 'room', 'temperature',
      // Restaurant and location terms
      'restaurant', 'cafe', 'diner', 'grill', 'kitchen', 'food',
      'packed', 'prepared', 'made', 'for', 'by', 'at',
      // US states and common cities
      'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado',
      'connecticut', 'delaware', 'florida', 'georgia', 'hawaii', 'idaho',
      'illinois', 'indiana', 'iowa', 'kansas', 'kentucky', 'louisiana',
      'maine', 'maryland', 'massachusetts', 'michigan', 'minnesota',
      'mississippi', 'missouri', 'montana', 'nebraska', 'nevada',
      'hampshire', 'jersey', 'mexico', 'york', 'carolina', 'dakota',
      'ohio', 'oklahoma', 'oregon', 'pennsylvania', 'island', 'tennessee',
      'texas', 'utah', 'vermont', 'virginia', 'washington', 'wisconsin',
      'wyoming', 'atlanta', 'chicago', 'houston', 'phoenix', 'philadelphia',
      'antonio', 'diego', 'dallas', 'jose', 'austin', 'jacksonville',
      'francisco', 'columbus', 'worth', 'charlotte', 'seattle', 'denver',
      'vegas', 'detroit', 'memphis', 'boston', 'nashville', 'baltimore',
      'portland', 'milwaukee', 'albuquerque', 'tucson', 'fresno', 'sacramento',
      'mesa', 'kansas', 'miami', 'raleigh', 'omaha', 'cleveland', 'tulsa',
      // Common restaurant chains
      'mcdonalds', 'burger', 'king', 'subway', 'starbucks', 'pizza', 'hut',
      'dominos', 'kfc', 'taco', 'bell', 'wendys', 'arbys', 'sonic',
      'dairy', 'queen', 'jack', 'box', 'carl', 'hardees', 'popeyes',
      'chick', 'fil', 'chipotle', 'panda', 'express', 'five', 'guys',
      'shake', 'shack', 'in', 'out', 'whataburger', 'culvers', 'zaxbys'
    ];
    
    const lowerText = text.toLowerCase();
    
    // Check for exact matches or if the text is primarily a non-ingredient word
    if (nonIngredientWords.some(word => {
      return lowerText === word || 
             (lowerText.includes(word) && word.length > 3) ||
             (word.includes(lowerText) && lowerText.length > 3);
    })) {
      return false;
    }
    
    // Filter out US state abbreviations
    const stateAbbreviations = [
      'al', 'ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga',
      'hi', 'id', 'il', 'in', 'ia', 'ks', 'ky', 'la', 'me', 'md',
      'ma', 'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj',
      'nm', 'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc',
      'sd', 'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy'
    ];
    
    if (stateAbbreviations.includes(lowerText)) {
      return false;
    }
    
    // Filter out zip codes (5 digits or 5+4 format)
    if (/^\d{5}(-\d{4})?$/.test(text.trim())) {
      return false;
    }
    
    // Filter out phone numbers
    if (/\d{3}[-.]?\d{3}[-.]?\d{4}/.test(text)) {
      return false;
    }
    
    // Filter out text that looks like nutritional info
    if (/\d+\s*(cal|kcal|mg|g|oz|lb|ml|l)/.test(lowerText)) return false;
    
    // Filter out URLs, emails, phone numbers
    if (/(www\.|http|@|\.com|\.org|\d{3}-\d{3}-\d{4})/.test(lowerText)) return false;
    
    // Filter out text that's mostly numbers or special characters
    if (text.replace(/[a-zA-Z]/g, '').length > text.length * 0.5) return false;
    
    // Filter out single letters or very short abbreviations that aren't ingredients
    if (text.length <= 2 && !/^(mg|oz|lb|ml)$/i.test(text)) return false;
    
    // Must contain at least one letter
    if (!/[a-zA-Z]/.test(text)) return false;
    
    return true;
  }
}

export default OCRService.getInstance();
