// Recommendation Service for product and recipe suggestions
import { AnalysisResult } from './ingredientService';
import { ScanSession } from './scanService';

export interface ProductRecommendation {
  id: string;
  productName: string;
  brand: string;
  description: string;
  imageUrl: string;
  retailer: 'amazon' | 'walmart' | 'target' | 'whole-foods';
  productUrl: string;
  price: number;
  safetyScore: number;
  recommendationReason: string;
  rank: number;
  ingredients: string[];
  nutritionHighlights: string[];
}

export interface RecipeRecommendation {
  id: string;
  recipeName: string;
  description: string;
  imageUrl: string;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  ingredients: RecipeIngredient[];
  instructions: string[];
  nutritionInfo: NutritionInfo;
  tags: string[];
  sourceUrl?: string;
  safetyScore: number;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
  unit: string;
  notes?: string;
}

export interface NutritionInfo {
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  sugar: string;
  sodium: string;
}

export interface RecommendationResult {
  products: ProductRecommendation[];
  recipes: RecipeRecommendation[];
  processingTime: number;
  recommendationReason: string;
}

class RecommendationService {
  private static instance: RecommendationService;

  public static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService();
    }
    return RecommendationService.instance;
  }

  /**
   * Generate recommendations based on scan analysis
   */
  async generateRecommendations(
    scanSession: ScanSession,
    analysisResult: AnalysisResult
  ): Promise<RecommendationResult> {
    const startTime = Date.now();

    try {
      // Analyze the scanned product to understand what type of product it is
      const productCategory = this.determineProductCategory(analysisResult);
      const problematicIngredients = this.identifyProblematicIngredients(analysisResult);

      // Generate product recommendations
      const products = await this.generateProductRecommendations(
        productCategory,
        problematicIngredients,
        analysisResult
      );

      // Generate recipe recommendations
      const recipes = await this.generateRecipeRecommendations(
        productCategory,
        problematicIngredients,
        analysisResult
      );

      const processingTime = Date.now() - startTime;
      const recommendationReason = this.generateRecommendationReason(
        problematicIngredients,
        productCategory
      );

      return {
        products,
        recipes,
        processingTime,
        recommendationReason
      };
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      throw new Error('Recommendation generation failed');
    }
  }

  /**
   * Determine product category from ingredients
   */
  private determineProductCategory(analysisResult: AnalysisResult): string {
    const ingredients = analysisResult.ingredients.map(i => i.name.toLowerCase());
    
    // Beverage indicators
    if (ingredients.some(ing => 
      ing.includes('water') || ing.includes('juice') || ing.includes('carbonated')
    )) {
      return 'beverage';
    }

    // Snack indicators
    if (ingredients.some(ing => 
      ing.includes('flour') || ing.includes('oil') || ing.includes('salt')
    )) {
      return 'snack';
    }

    // Sauce/condiment indicators
    if (ingredients.some(ing => 
      ing.includes('vinegar') || ing.includes('tomato') || ing.includes('garlic')
    )) {
      return 'sauce';
    }

    // Dairy indicators
    if (ingredients.some(ing => 
      ing.includes('milk') || ing.includes('cream') || ing.includes('cheese')
    )) {
      return 'dairy';
    }

    return 'general';
  }

  /**
   * Identify problematic ingredients that need alternatives
   */
  private identifyProblematicIngredients(analysisResult: AnalysisResult): string[] {
    return analysisResult.ingredients
      .filter(ingredient => ingredient.rating === 'avoid' || ingredient.rating === 'caution')
      .map(ingredient => ingredient.name);
  }

  /**
   * Generate product recommendations
   */
  private async generateProductRecommendations(
    category: string,
    problematicIngredients: string[],
    analysisResult: AnalysisResult
  ): Promise<ProductRecommendation[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const recommendations: ProductRecommendation[] = [];

    // Generate category-specific recommendations
    switch (category) {
      case 'beverage':
        recommendations.push(...this.getBeverageRecommendations(problematicIngredients));
        break;
      case 'snack':
        recommendations.push(...this.getSnackRecommendations(problematicIngredients));
        break;
      case 'sauce':
        recommendations.push(...this.getSauceRecommendations(problematicIngredients));
        break;
      case 'dairy':
        recommendations.push(...this.getDairyRecommendations(problematicIngredients));
        break;
      default:
        recommendations.push(...this.getGeneralRecommendations(problematicIngredients));
    }

    // Sort by safety score and return top 3
    return recommendations
      .sort((a, b) => b.safetyScore - a.safetyScore)
      .slice(0, 3)
      .map((rec, index) => ({ ...rec, rank: index + 1 }));
  }

  /**
   * Generate recipe recommendations
   */
  private async generateRecipeRecommendations(
    category: string,
    problematicIngredients: string[],
    analysisResult: AnalysisResult
  ): Promise<RecipeRecommendation[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const recipes: RecipeRecommendation[] = [];

    // Generate category-specific recipes
    switch (category) {
      case 'beverage':
        recipes.push(...this.getBeverageRecipes());
        break;
      case 'snack':
        recipes.push(...this.getSnackRecipes());
        break;
      case 'sauce':
        recipes.push(...this.getSauceRecipes());
        break;
      default:
        recipes.push(...this.getGeneralRecipes());
    }

    // Return top 2 recipes
    return recipes.slice(0, 2);
  }

  /**
   * Beverage product recommendations
   */
  private getBeverageRecommendations(problematicIngredients: string[]): ProductRecommendation[] {
    return [
      {
        id: 'bev-1',
        productName: 'Organic Pure Orange Juice',
        brand: 'Simply Orange',
        description: '100% pure orange juice with no added sugars or preservatives',
        imageUrl: 'https://images.pexels.com/photos/1337825/pexels-photo-1337825.jpeg',
        retailer: 'amazon',
        productUrl: 'https://amazon.com/simply-orange-juice',
        price: 4.99,
        safetyScore: 95,
        recommendationReason: 'Contains only natural ingredients with no artificial additives',
        rank: 1,
        ingredients: ['Orange Juice', 'Natural Orange Flavor'],
        nutritionHighlights: ['High in Vitamin C', 'No added sugars', 'No preservatives']
      },
      {
        id: 'bev-2',
        productName: 'Sparkling Water with Natural Fruit',
        brand: 'LaCroix',
        description: 'Naturally flavored sparkling water with no calories or artificial ingredients',
        imageUrl: 'https://images.pexels.com/photos/1292294/pexels-photo-1292294.jpeg',
        retailer: 'target',
        productUrl: 'https://target.com/lacroix-sparkling-water',
        price: 3.99,
        safetyScore: 98,
        recommendationReason: 'Zero calories, no artificial sweeteners or colors',
        rank: 2,
        ingredients: ['Carbonated Water', 'Natural Flavor'],
        nutritionHighlights: ['Zero calories', 'No artificial sweeteners', 'Natural flavoring']
      }
    ];
  }

  /**
   * Snack product recommendations
   */
  private getSnackRecommendations(problematicIngredients: string[]): ProductRecommendation[] {
    return [
      {
        id: 'snack-1',
        productName: 'Organic Whole Grain Crackers',
        brand: 'Mary\'s Gone Crackers',
        description: 'Gluten-free, organic crackers made with whole grains and seeds',
        imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        retailer: 'whole-foods',
        productUrl: 'https://wholefoodsmarket.com/marys-crackers',
        price: 5.49,
        safetyScore: 92,
        recommendationReason: 'Made with organic whole grains, no artificial preservatives',
        rank: 1,
        ingredients: ['Organic Brown Rice', 'Organic Quinoa', 'Organic Flax Seeds', 'Sea Salt'],
        nutritionHighlights: ['Gluten-free', 'High fiber', 'Organic ingredients']
      },
      {
        id: 'snack-2',
        productName: 'Raw Almonds',
        brand: 'Blue Diamond',
        description: 'Natural raw almonds with no added oils or preservatives',
        imageUrl: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg',
        retailer: 'amazon',
        productUrl: 'https://amazon.com/blue-diamond-almonds',
        price: 7.99,
        safetyScore: 96,
        recommendationReason: 'Single ingredient, no processing or additives',
        rank: 2,
        ingredients: ['Almonds'],
        nutritionHighlights: ['High protein', 'Healthy fats', 'No additives']
      }
    ];
  }

  /**
   * Sauce product recommendations
   */
  private getSauceRecommendations(problematicIngredients: string[]): ProductRecommendation[] {
    return [
      {
        id: 'sauce-1',
        productName: 'Organic Marinara Sauce',
        brand: 'Rao\'s',
        description: 'Premium marinara sauce made with organic tomatoes and herbs',
        imageUrl: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg',
        retailer: 'target',
        productUrl: 'https://target.com/raos-marinara',
        price: 8.99,
        safetyScore: 94,
        recommendationReason: 'No sugar added, made with high-quality organic ingredients',
        rank: 1,
        ingredients: ['Organic Tomatoes', 'Organic Olive Oil', 'Organic Onions', 'Sea Salt', 'Organic Garlic', 'Organic Basil'],
        nutritionHighlights: ['No added sugar', 'Organic ingredients', 'No preservatives']
      }
    ];
  }

  /**
   * Dairy product recommendations
   */
  private getDairyRecommendations(problematicIngredients: string[]): ProductRecommendation[] {
    return [
      {
        id: 'dairy-1',
        productName: 'Organic Grass-Fed Milk',
        brand: 'Horizon Organic',
        description: 'Organic milk from grass-fed cows with no artificial hormones',
        imageUrl: 'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg',
        retailer: 'whole-foods',
        productUrl: 'https://wholefoodsmarket.com/horizon-organic-milk',
        price: 4.49,
        safetyScore: 90,
        recommendationReason: 'Organic, grass-fed, no artificial hormones or antibiotics',
        rank: 1,
        ingredients: ['Organic Grade A Milk', 'Vitamin D3'],
        nutritionHighlights: ['Grass-fed', 'No artificial hormones', 'High in protein']
      }
    ];
  }

  /**
   * General product recommendations
   */
  private getGeneralRecommendations(problematicIngredients: string[]): ProductRecommendation[] {
    return [
      {
        id: 'general-1',
        productName: 'Organic Multi-Grain Bread',
        brand: 'Dave\'s Killer Bread',
        description: 'Organic whole grain bread with seeds and no artificial preservatives',
        imageUrl: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg',
        retailer: 'walmart',
        productUrl: 'https://walmart.com/daves-killer-bread',
        price: 5.99,
        safetyScore: 88,
        recommendationReason: 'Organic whole grains, no artificial preservatives or high fructose corn syrup',
        rank: 1,
        ingredients: ['Organic Whole Wheat Flour', 'Water', 'Organic Cane Sugar', 'Organic Sunflower Seeds'],
        nutritionHighlights: ['Organic ingredients', 'High fiber', 'No artificial preservatives']
      }
    ];
  }

  /**
   * Beverage recipe recommendations
   */
  private getBeverageRecipes(): RecipeRecommendation[] {
    return [
      {
        id: 'recipe-bev-1',
        recipeName: 'Fresh Orange Ginger Juice',
        description: 'Refreshing homemade orange juice with a hint of fresh ginger',
        imageUrl: 'https://images.pexels.com/photos/1337825/pexels-photo-1337825.jpeg',
        prepTime: 10,
        cookTime: 0,
        servings: 2,
        difficultyLevel: 'easy',
        ingredients: [
          { name: 'Fresh oranges', amount: '4', unit: 'large', notes: 'preferably organic' },
          { name: 'Fresh ginger', amount: '1', unit: 'inch piece' },
          { name: 'Water', amount: '1/2', unit: 'cup', notes: 'optional for dilution' }
        ],
        instructions: [
          'Wash and peel the oranges',
          'Peel and slice the fresh ginger',
          'Juice the oranges using a juicer or by hand',
          'Grate the ginger and add to juice',
          'Strain if desired and serve immediately',
          'Add water if you prefer a lighter taste'
        ],
        nutritionInfo: {
          calories: 120,
          protein: '2g',
          carbs: '30g',
          fat: '0g',
          fiber: '3g',
          sugar: '24g',
          sodium: '0mg'
        },
        tags: ['fresh', 'natural', 'vitamin-c', 'antioxidant'],
        safetyScore: 98
      }
    ];
  }

  /**
   * Snack recipe recommendations
   */
  private getSnackRecipes(): RecipeRecommendation[] {
    return [
      {
        id: 'recipe-snack-1',
        recipeName: 'Homemade Almond Crackers',
        description: 'Crispy, nutritious crackers made with almond flour and seeds',
        imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        prepTime: 15,
        cookTime: 20,
        servings: 4,
        difficultyLevel: 'medium',
        ingredients: [
          { name: 'Almond flour', amount: '2', unit: 'cups' },
          { name: 'Sesame seeds', amount: '2', unit: 'tablespoons' },
          { name: 'Sea salt', amount: '1/2', unit: 'teaspoon' },
          { name: 'Olive oil', amount: '2', unit: 'tablespoons' },
          { name: 'Water', amount: '2-3', unit: 'tablespoons' }
        ],
        instructions: [
          'Preheat oven to 350°F (175°C)',
          'Mix almond flour, sesame seeds, and salt in a bowl',
          'Add olive oil and mix until crumbly',
          'Gradually add water until dough forms',
          'Roll dough between parchment paper to 1/8 inch thickness',
          'Cut into squares and place on baking sheet',
          'Bake for 15-20 minutes until golden brown',
          'Cool completely before storing'
        ],
        nutritionInfo: {
          calories: 180,
          protein: '6g',
          carbs: '6g',
          fat: '16g',
          fiber: '3g',
          sugar: '1g',
          sodium: '150mg'
        },
        tags: ['gluten-free', 'low-carb', 'healthy-fats', 'homemade'],
        safetyScore: 95
      }
    ];
  }

  /**
   * Sauce recipe recommendations
   */
  private getSauceRecipes(): RecipeRecommendation[] {
    return [
      {
        id: 'recipe-sauce-1',
        recipeName: 'Simple Tomato Basil Sauce',
        description: 'Fresh, homemade tomato sauce with basil and garlic',
        imageUrl: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg',
        prepTime: 10,
        cookTime: 25,
        servings: 6,
        difficultyLevel: 'easy',
        ingredients: [
          { name: 'Fresh tomatoes', amount: '6', unit: 'large', notes: 'or 28oz can crushed tomatoes' },
          { name: 'Fresh basil', amount: '1/4', unit: 'cup', notes: 'chopped' },
          { name: 'Garlic', amount: '3', unit: 'cloves', notes: 'minced' },
          { name: 'Olive oil', amount: '2', unit: 'tablespoons' },
          { name: 'Sea salt', amount: '1/2', unit: 'teaspoon' },
          { name: 'Black pepper', amount: '1/4', unit: 'teaspoon' }
        ],
        instructions: [
          'If using fresh tomatoes, blanch and peel them, then crush',
          'Heat olive oil in a large pan over medium heat',
          'Add minced garlic and sauté for 1 minute',
          'Add crushed tomatoes and bring to a simmer',
          'Season with salt and pepper',
          'Simmer for 20-25 minutes, stirring occasionally',
          'Stir in fresh basil during last 5 minutes',
          'Taste and adjust seasoning as needed'
        ],
        nutritionInfo: {
          calories: 45,
          protein: '1g',
          carbs: '6g',
          fat: '2g',
          fiber: '2g',
          sugar: '4g',
          sodium: '200mg'
        },
        tags: ['fresh', 'no-preservatives', 'low-sodium', 'homemade'],
        safetyScore: 96
      }
    ];
  }

  /**
   * General recipe recommendations
   */
  private getGeneralRecipes(): RecipeRecommendation[] {
    return [
      {
        id: 'recipe-general-1',
        recipeName: 'Whole Grain Banana Bread',
        description: 'Healthy banana bread made with whole wheat flour and natural sweeteners',
        imageUrl: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg',
        prepTime: 15,
        cookTime: 60,
        servings: 8,
        difficultyLevel: 'easy',
        ingredients: [
          { name: 'Whole wheat flour', amount: '2', unit: 'cups' },
          { name: 'Ripe bananas', amount: '3', unit: 'large', notes: 'mashed' },
          { name: 'Pure maple syrup', amount: '1/3', unit: 'cup' },
          { name: 'Coconut oil', amount: '1/4', unit: 'cup', notes: 'melted' },
          { name: 'Eggs', amount: '2', unit: 'large' },
          { name: 'Baking soda', amount: '1', unit: 'teaspoon' },
          { name: 'Sea salt', amount: '1/2', unit: 'teaspoon' },
          { name: 'Vanilla extract', amount: '1', unit: 'teaspoon' }
        ],
        instructions: [
          'Preheat oven to 350°F (175°C) and grease a loaf pan',
          'In a large bowl, mash bananas until smooth',
          'Mix in maple syrup, melted coconut oil, eggs, and vanilla',
          'In separate bowl, whisk together flour, baking soda, and salt',
          'Fold dry ingredients into wet ingredients until just combined',
          'Pour batter into prepared loaf pan',
          'Bake for 55-60 minutes until toothpick comes out clean',
          'Cool in pan for 10 minutes, then turn out onto wire rack'
        ],
        nutritionInfo: {
          calories: 220,
          protein: '5g',
          carbs: '42g',
          fat: '5g',
          fiber: '4g',
          sugar: '18g',
          sodium: '280mg'
        },
        tags: ['whole-grain', 'natural-sweeteners', 'no-refined-sugar', 'homemade'],
        safetyScore: 92
      }
    ];
  }

  /**
   * Generate recommendation reason
   */
  private generateRecommendationReason(
    problematicIngredients: string[],
    category: string
  ): string {
    if (problematicIngredients.length === 0) {
      return `While your scanned product has a decent safety profile, these alternatives offer even cleaner ingredients and better nutritional value.`;
    }

    const ingredientList = problematicIngredients.slice(0, 3).join(', ');
    return `Based on concerning ingredients like ${ingredientList} in your scanned product, these alternatives offer cleaner, safer options with better ingredient profiles.`;
  }
}

export default RecommendationService.getInstance();