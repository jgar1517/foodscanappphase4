// Ingredient Safety Rating Types
export type SafetyRating = 'safe' | 'caution' | 'avoid';

import AIAnalysisService from './aiAnalysisService';
import PersonalizationService from './personalizationService';

export interface IngredientInfo {
  id: string;
  name: string;
  category: string;
  safetyRating: SafetyRating;
  confidence: number;
  explanation: string;
  sources: string[];
  healthConcerns?: string[];
  alternatives?: string[];
}

export interface AnalysisResult {
  ingredients: IngredientAnalysis[];
  overallSafetyScore: number;
  processingTime: number;
  summary: {
    safe: number;
    caution: number;
    avoid: number;
  };
}

export interface IngredientAnalysis {
  name: string;
  position: number;
  rating: SafetyRating;
  personalizedRating?: SafetyRating;
  confidence: number;
  explanation: string;
  sources: string[];
  healthConcerns: string[];
  alternatives: string[];
}

class IngredientService {
  private static instance: IngredientService;
  private ingredientDatabase: Map<string, IngredientInfo> = new Map();

  public static getInstance(): IngredientService {
    if (!IngredientService.instance) {
      IngredientService.instance = new IngredientService();
      IngredientService.instance.initializeDatabase();
    }
    return IngredientService.instance;
  }

  /**
   * Initialize the ingredient database with mock data
   * In production, this would load from Supabase
   */
  private initializeDatabase(): void {
    const mockIngredients: IngredientInfo[] = [
      {
        id: '1',
        name: 'Water',
        category: 'natural',
        safetyRating: 'safe',
        confidence: 100,
        explanation: 'Water is essential for life and poses no safety concerns.',
        sources: ['FDA', 'EWG'],
        healthConcerns: [],
        alternatives: []
      },
      {
        id: '2',
        name: 'Organic Cane Sugar',
        category: 'sweetener',
        safetyRating: 'caution',
        confidence: 85,
        explanation: 'High sugar content may contribute to weight gain and dental issues. Moderate consumption recommended.',
        sources: ['EWG', 'WHO'],
        healthConcerns: ['Weight gain', 'Dental health', 'Blood sugar spikes'],
        alternatives: ['Stevia', 'Monk fruit', 'Erythritol']
      },
      {
        id: '3',
        name: 'Natural Flavors',
        category: 'flavoring',
        safetyRating: 'caution',
        confidence: 70,
        explanation: 'While generally safe, "natural flavors" can be vague and may contain allergens or chemicals not listed.',
        sources: ['FDA', 'EWG'],
        healthConcerns: ['Hidden allergens', 'Undefined chemicals'],
        alternatives: ['Specific spices', 'Fruit extracts', 'Essential oils']
      },
      {
        id: '4',
        name: 'Citric Acid',
        category: 'preservative',
        safetyRating: 'safe',
        confidence: 95,
        explanation: 'Commonly used preservative and flavor enhancer, generally recognized as safe by FDA.',
        sources: ['FDA'],
        healthConcerns: [],
        alternatives: []
      },
      {
        id: '5',
        name: 'Sodium Benzoate',
        category: 'preservative',
        safetyRating: 'avoid',
        confidence: 80,
        explanation: 'May form benzene (a carcinogen) when combined with vitamin C. Can cause hyperactivity in children.',
        sources: ['EWG', 'Scientific Studies'],
        healthConcerns: ['Potential carcinogen formation', 'Hyperactivity in children', 'Allergic reactions'],
        alternatives: ['Potassium sorbate', 'Vitamin E', 'Rosemary extract']
      },
      {
        id: '6',
        name: 'Ascorbic Acid',
        category: 'vitamin',
        safetyRating: 'safe',
        confidence: 100,
        explanation: 'Essential vitamin with antioxidant properties. Beneficial for immune system health.',
        sources: ['FDA', 'NIH'],
        healthConcerns: [],
        alternatives: []
      },
      {
        id: '7',
        name: 'Artificial Color Red 40',
        category: 'coloring',
        safetyRating: 'avoid',
        confidence: 85,
        explanation: 'Linked to hyperactivity in children and may cause allergic reactions. Banned in some countries.',
        sources: ['EWG', 'European Food Safety Authority'],
        healthConcerns: ['Hyperactivity in children', 'Allergic reactions', 'Potential behavioral issues'],
        alternatives: ['Beet juice', 'Paprika extract', 'Annatto']
      },
      {
        id: '8',
        name: 'Gum Arabic',
        category: 'thickener',
        safetyRating: 'safe',
        confidence: 90,
        explanation: 'Natural fiber that acts as a thickener and stabilizer. Generally safe for consumption.',
        sources: ['FDA'],
        healthConcerns: [],
        alternatives: []
      },
      {
        id: '9',
        name: 'High Fructose Corn Syrup',
        category: 'sweetener',
        safetyRating: 'avoid',
        confidence: 90,
        explanation: 'Linked to obesity, diabetes, and metabolic syndrome. Processed differently than regular sugar.',
        sources: ['EWG', 'American Heart Association'],
        healthConcerns: ['Obesity', 'Diabetes risk', 'Metabolic syndrome', 'Liver damage'],
        alternatives: ['Pure maple syrup', 'Honey', 'Coconut sugar']
      },
      {
        id: '10',
        name: 'Enriched Flour',
        category: 'grain',
        safetyRating: 'caution',
        confidence: 75,
        explanation: 'Processed flour with added vitamins. Lower nutritional value than whole grain alternatives.',
        sources: ['FDA', 'Nutrition experts'],
        healthConcerns: ['Blood sugar spikes', 'Lower fiber content', 'Reduced nutrients'],
        alternatives: ['Whole wheat flour', 'Almond flour', 'Oat flour']
      },
      {
        id: '11',
        name: 'Salt',
        category: 'seasoning',
        safetyRating: 'safe',
        confidence: 95,
        explanation: 'Essential mineral for bodily functions. Safe in normal amounts, but excessive consumption may contribute to high blood pressure.',
        sources: ['FDA', 'WHO'],
        healthConcerns: ['High blood pressure (excessive amounts)'],
        alternatives: ['Sea salt', 'Himalayan salt', 'Herb seasonings']
      },
      {
        id: '12',
        name: 'Paprika',
        category: 'spice',
        safetyRating: 'safe',
        confidence: 100,
        explanation: 'Natural spice made from ground peppers. Rich in antioxidants and vitamin A. Generally safe for consumption.',
        sources: ['FDA', 'Nutritional studies'],
        healthConcerns: [],
        alternatives: []
      },
      {
        id: '13',
        name: 'Turmeric',
        category: 'spice',
        safetyRating: 'safe',
        confidence: 100,
        explanation: 'Natural spice with anti-inflammatory properties. Contains curcumin, which has numerous health benefits.',
        sources: ['FDA', 'Scientific studies'],
        healthConcerns: [],
        alternatives: []
      },
      {
        id: '14',
        name: 'Garlic',
        category: 'spice',
        safetyRating: 'safe',
        confidence: 100,
        explanation: 'Natural ingredient with antimicrobial and cardiovascular benefits. Safe and beneficial for most people.',
        sources: ['FDA', 'Nutritional studies'],
        healthConcerns: [],
        alternatives: []
      },
      {
        id: '15',
        name: 'Onion',
        category: 'vegetable',
        safetyRating: 'safe',
        confidence: 100,
        explanation: 'Natural vegetable ingredient rich in antioxidants and beneficial compounds. Safe for consumption.',
        sources: ['FDA', 'Nutritional studies'],
        healthConcerns: [],
        alternatives: []
      },
      {
        id: '16',
        name: 'Black Pepper',
        category: 'spice',
        safetyRating: 'safe',
        confidence: 100,
        explanation: 'Common spice that enhances nutrient absorption and has antioxidant properties. Safe for consumption.',
        sources: ['FDA', 'Nutritional studies'],
        healthConcerns: [],
        alternatives: []
      },
      {
        id: '17',
        name: 'Olive Oil',
        category: 'oil',
        safetyRating: 'safe',
        confidence: 100,
        explanation: 'Healthy fat source rich in monounsaturated fats and antioxidants. Beneficial for heart health.',
        sources: ['FDA', 'Mediterranean diet studies'],
        healthConcerns: [],
        alternatives: []
      },
      {
        id: '18',
        name: 'Vinegar',
        category: 'acid',
        safetyRating: 'safe',
        confidence: 95,
        explanation: 'Natural preservative and flavoring agent. Safe for consumption and may have digestive benefits.',
        sources: ['FDA', 'Traditional use'],
        healthConcerns: [],
        alternatives: []
      },
      {
        id: '19',
        name: 'Lemon Juice',
        category: 'natural',
        safetyRating: 'safe',
        confidence: 100,
        explanation: 'Natural source of vitamin C and citric acid. Safe and beneficial for health.',
        sources: ['FDA', 'Nutritional studies'],
        healthConcerns: [],
        alternatives: []
      },
      {
        id: '20',
        name: 'Rosemary Extract',
        category: 'natural preservative',
        safetyRating: 'safe',
        confidence: 95,
        explanation: 'Natural antioxidant and preservative derived from rosemary herb. Safe alternative to synthetic preservatives.',
        sources: ['FDA', 'Natural products studies'],
        healthConcerns: [],
        alternatives: []
      }
    ];

    // Populate the database
    mockIngredients.forEach(ingredient => {
      this.ingredientDatabase.set(ingredient.name.toLowerCase(), ingredient);
      
      // Add common variations and aliases
      if (ingredient.name === 'Ascorbic Acid') {
        this.ingredientDatabase.set('vitamin c', ingredient);
      }
      if (ingredient.name === 'Artificial Color Red 40') {
        this.ingredientDatabase.set('red 40', ingredient);
        this.ingredientDatabase.set('red dye 40', ingredient);
      }
      if (ingredient.name === 'Salt') {
        this.ingredientDatabase.set('sodium chloride', ingredient);
        this.ingredientDatabase.set('table salt', ingredient);
        this.ingredientDatabase.set('sea salt', ingredient);
      }
      if (ingredient.name === 'Black Pepper') {
        this.ingredientDatabase.set('pepper', ingredient);
        this.ingredientDatabase.set('ground black pepper', ingredient);
      }
      if (ingredient.name === 'Olive Oil') {
        this.ingredientDatabase.set('extra virgin olive oil', ingredient);
        this.ingredientDatabase.set('evoo', ingredient);
      }
      if (ingredient.name === 'Lemon Juice') {
        this.ingredientDatabase.set('lemon', ingredient);
        this.ingredientDatabase.set('citrus', ingredient);
      }
    });
  }

  /**
   * Analyze a list of ingredients and return safety ratings
   */
  async analyzeIngredients(ingredients: string[]): Promise<AnalysisResult> {
    const startTime = Date.now();
    
    try {
      // Use AI-enhanced analysis for better accuracy
      const aiAnalysis = await AIAnalysisService.analyzeIngredientsBatch(ingredients);
      
      const analyses: IngredientAnalysis[] = [];

      for (let i = 0; i < ingredients.length; i++) {
        const ingredient = ingredients[i];
        const aiIngredientAnalysis = aiAnalysis.ingredients[i];
        const analysis = await this.analyzeIngredient(ingredient, i + 1, aiIngredientAnalysis);
        analyses.push(analysis);
      }

      // Apply personalization to the analysis
      const personalizedResult = await PersonalizationService.personalizeAnalysis(analyses);
      
      // Count personalized ratings for summary
      const safeCount = personalizedResult.ingredients.filter(i => i.rating === 'safe').length;
      const cautionCount = personalizedResult.ingredients.filter(i => i.rating === 'caution').length;
      const avoidCount = personalizedResult.ingredients.filter(i => i.rating === 'avoid').length;

      const processingTime = Date.now() - startTime;

      return {
        ingredients: personalizedResult.ingredients,
        overallSafetyScore: personalizedResult.personalizedScore,
        processingTime,
        summary: {
          safe: safeCount,
          caution: cautionCount,
          avoid: avoidCount
        }
      };
    } catch (error) {
      console.error('Ingredient analysis failed:', error);
      throw new Error('Failed to analyze ingredients');
    }
  }

  /**
   * Analyze a single ingredient
   */
  private async analyzeIngredient(
    ingredientName: string, 
    position: number, 
    aiAnalysis?: any
  ): Promise<IngredientAnalysis> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const normalizedName = ingredientName.toLowerCase().trim();
    const ingredientInfo = this.findIngredientInfo(normalizedName);

    // Use AI analysis if available and more confident
    if (aiAnalysis && aiAnalysis.confidence > 70) {
      return {
        name: ingredientName,
        position,
        rating: aiAnalysis.safetyRating,
        confidence: aiAnalysis.confidence,
        explanation: aiAnalysis.reasoning,
        sources: aiAnalysis.sources,
        healthConcerns: aiAnalysis.healthImpacts,
        alternatives: aiAnalysis.alternatives
      };
    }

    if (ingredientInfo) {
      return {
        name: ingredientName,
        position,
        rating: ingredientInfo.safetyRating,
        confidence: ingredientInfo.confidence,
        explanation: ingredientInfo.explanation,
        sources: ingredientInfo.sources,
        healthConcerns: ingredientInfo.healthConcerns || [],
        alternatives: ingredientInfo.alternatives || []
      };
    } else {
      // Unknown ingredient - default to caution
      return {
        name: ingredientName,
        position,
        rating: 'caution',
        confidence: aiAnalysis?.confidence || 50,
        explanation: aiAnalysis?.reasoning || 'This ingredient is not in our database. We recommend researching it further or consulting with a healthcare professional.',
        sources: aiAnalysis?.sources || ['Unknown'],
        healthConcerns: aiAnalysis?.healthImpacts || ['Unknown safety profile'],
        alternatives: aiAnalysis?.alternatives || []
      };
    }
  }

  /**
   * Find ingredient info with fuzzy matching
   */
  private findIngredientInfo(ingredientName: string): IngredientInfo | null {
    // Direct match
    if (this.ingredientDatabase.has(ingredientName)) {
      return this.ingredientDatabase.get(ingredientName)!;
    }

    // Fuzzy matching for common variations
    for (const [key, value] of this.ingredientDatabase.entries()) {
      if (this.isSimilarIngredient(ingredientName, key)) {
        return value;
      }
    }

    return null;
  }

  /**
   * Check if two ingredient names are similar
   */
  private isSimilarIngredient(name1: string, name2: string): boolean {
    // Remove common words and check for partial matches
    const cleanName1 = name1.replace(/\b(acid|extract|oil|powder|natural|artificial)\b/g, '').trim();
    const cleanName2 = name2.replace(/\b(acid|extract|oil|powder|natural|artificial)\b/g, '').trim();

    return cleanName1.includes(cleanName2) || cleanName2.includes(cleanName1);
  }

  /**
   * Get ingredient suggestions for autocomplete
   */
  async getIngredientSuggestions(query: string, limit: number = 10): Promise<string[]> {
    const normalizedQuery = query.toLowerCase();
    const suggestions: string[] = [];

    for (const [key, value] of this.ingredientDatabase.entries()) {
      if (key.includes(normalizedQuery) || value.name.toLowerCase().includes(normalizedQuery)) {
        suggestions.push(value.name);
        if (suggestions.length >= limit) break;
      }
    }

    return suggestions;
  }
}

export default IngredientService.getInstance();