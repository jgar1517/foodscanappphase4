// Personalization Service for adjusting ingredient ratings based on dietary preferences
import DietaryProfileService, { DietaryProfile } from './dietaryProfileService';
import { IngredientAnalysis, SafetyRating } from './ingredientService';

export interface PersonalizedAnalysis extends IngredientAnalysis {
  originalRating: SafetyRating;
  personalizedRating: SafetyRating;
  personalizationReasons: string[];
  isPersonalized: boolean;
}

export interface PersonalizationResult {
  ingredients: PersonalizedAnalysis[];
  overallSafetyScore: number;
  personalizedScore: number;
  personalizationSummary: {
    totalPersonalized: number;
    upgradedToAvoid: number;
    upgradedToCaution: number;
    reasonsApplied: string[];
  };
}

class PersonalizationService {
  private static instance: PersonalizationService;

  public static getInstance(): PersonalizationService {
    if (!PersonalizationService.instance) {
      PersonalizationService.instance = new PersonalizationService();
    }
    return PersonalizationService.instance;
  }

  /**
   * Apply personalization to ingredient analysis results
   */
  async personalizeAnalysis(ingredients: IngredientAnalysis[]): Promise<PersonalizationResult> {
    const dietaryProfile = await DietaryProfileService.getDietaryProfile();
    const personalizedIngredients: PersonalizedAnalysis[] = [];
    
    let totalPersonalized = 0;
    let upgradedToAvoid = 0;
    let upgradedToCaution = 0;
    const reasonsApplied: string[] = [];

    for (const ingredient of ingredients) {
      const personalized = await this.personalizeIngredient(ingredient, dietaryProfile);
      personalizedIngredients.push(personalized);

      if (personalized.isPersonalized) {
        totalPersonalized++;
        reasonsApplied.push(...personalized.personalizationReasons);

        if (personalized.originalRating !== 'avoid' && personalized.personalizedRating === 'avoid') {
          upgradedToAvoid++;
        } else if (personalized.originalRating === 'safe' && personalized.personalizedRating === 'caution') {
          upgradedToCaution++;
        }
      }
    }

    // Calculate scores
    const originalScore = this.calculateSafetyScore(personalizedIngredients.map(p => p.originalRating));
    const personalizedScore = this.calculateSafetyScore(personalizedIngredients.map(p => p.personalizedRating));

    return {
      ingredients: personalizedIngredients,
      overallSafetyScore: originalScore,
      personalizedScore,
      personalizationSummary: {
        totalPersonalized,
        upgradedToAvoid,
        upgradedToCaution,
        reasonsApplied: [...new Set(reasonsApplied)]
      }
    };
  }

  /**
   * Personalize a single ingredient analysis
   */
  private async personalizeIngredient(
    ingredient: IngredientAnalysis, 
    dietaryProfile: DietaryProfile
  ): Promise<PersonalizedAnalysis> {
    const restriction = await DietaryProfileService.checkIngredientRestriction(ingredient.name);
    
    let personalizedRating = ingredient.rating;
    const personalizationReasons: string[] = [];
    let isPersonalized = false;

    // Apply dietary restrictions
    if (restriction.shouldAvoid) {
      personalizedRating = 'avoid';
      isPersonalized = true;
      personalizationReasons.push(...restriction.reasons);
    } else if (restriction.shouldFlag && ingredient.rating === 'safe') {
      personalizedRating = 'caution';
      isPersonalized = true;
      personalizationReasons.push(...restriction.reasons);
    }

    // Enhanced explanation for personalized ratings
    let enhancedExplanation = ingredient.explanation;
    if (isPersonalized) {
      enhancedExplanation += `\n\nPersonalized for your dietary preferences: ${personalizationReasons.join('; ')}`;
    }

    return {
      ...ingredient,
      originalRating: ingredient.rating,
      personalizedRating,
      personalizationReasons,
      isPersonalized,
      rating: personalizedRating, // Update the main rating field
      explanation: enhancedExplanation
    };
  }

  /**
   * Calculate safety score from ratings array
   */
  private calculateSafetyScore(ratings: SafetyRating[]): number {
    if (ratings.length === 0) return 100;

    const safeCount = ratings.filter(r => r === 'safe').length;
    const cautionCount = ratings.filter(r => r === 'caution').length;
    const avoidCount = ratings.filter(r => r === 'avoid').length;
    const total = ratings.length;

    return Math.round(((safeCount * 100) + (cautionCount * 60) + (avoidCount * 20)) / total);
  }

  /**
   * Get personalization insights for user
   */
  async getPersonalizationInsights(): Promise<{
    activePreferences: number;
    customAvoidances: number;
    totalRestrictions: number;
    mostRestrictiveCategory: string;
  }> {
    const dietaryProfile = await DietaryProfileService.getDietaryProfile();
    const activePreferences = dietaryProfile.preferences.filter(p => p.isActive);
    
    // Count restrictions by category
    const categoryCount: { [key: string]: number } = {};
    activePreferences.forEach(pref => {
      categoryCount[pref.category] = (categoryCount[pref.category] || 0) + 1;
    });

    const mostRestrictiveCategory = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';

    return {
      activePreferences: activePreferences.length,
      customAvoidances: dietaryProfile.customAvoidances.length,
      totalRestrictions: activePreferences.length + dietaryProfile.customAvoidances.length,
      mostRestrictiveCategory
    };
  }

  /**
   * Suggest dietary preferences based on scan history
   */
  async suggestPreferences(scanHistory: IngredientAnalysis[][]): Promise<{
    suggestedPreferences: string[];
    reasons: string[];
  }> {
    // Analyze common problematic ingredients across scans
    const allIngredients = scanHistory.flat();
    const problematicIngredients = allIngredients.filter(ing => ing.rating === 'avoid' || ing.rating === 'caution');
    
    const ingredientCounts: { [key: string]: number } = {};
    problematicIngredients.forEach(ing => {
      const normalized = ing.name.toLowerCase();
      ingredientCounts[normalized] = (ingredientCounts[normalized] || 0) + 1;
    });

    const suggestions: string[] = [];
    const reasons: string[] = [];

    // Check for common dietary restriction patterns
    if (ingredientCounts['gluten'] || ingredientCounts['wheat flour'] || ingredientCounts['enriched flour']) {
      suggestions.push('gluten-free');
      reasons.push('Frequently scanned products contain gluten-based ingredients');
    }

    if (ingredientCounts['high fructose corn syrup'] || ingredientCounts['sugar'] || ingredientCounts['corn syrup']) {
      suggestions.push('diabetic');
      reasons.push('Many scanned products contain high-sugar ingredients');
    }

    if (ingredientCounts['artificial color red 40'] || ingredientCounts['artificial flavors']) {
      suggestions.push('paleo');
      reasons.push('Scanned products often contain artificial additives');
    }

    return { suggestedPreferences: suggestions, reasons };
  }
}

export default PersonalizationService.getInstance();