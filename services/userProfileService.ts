// User Profile Service - Manages dietary preferences and personalization
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DietaryPreference {
  id: string;
  name: string;
  label: string;
  description: string;
  active: boolean;
  restrictions: string[];
  avoidIngredients: string[];
}

export interface CustomAvoidance {
  id: string;
  ingredientName: string;
  reason: string;
  severity: 'mild' | 'moderate' | 'severe';
  createdAt: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  dietaryPreferences: DietaryPreference[];
  customAvoidances: CustomAvoidance[];
  healthGoals: string[];
  createdAt: Date;
  updatedAt: Date;
}

class UserProfileService {
  private static instance: UserProfileService;
  private readonly PROFILE_STORAGE_KEY = 'user_profile';
  private readonly PREFERENCES_STORAGE_KEY = 'dietary_preferences';
  private readonly AVOIDANCES_STORAGE_KEY = 'custom_avoidances';

  public static getInstance(): UserProfileService {
    if (!UserProfileService.instance) {
      UserProfileService.instance = new UserProfileService();
    }
    return UserProfileService.instance;
  }

  /**
   * Get available dietary preference options
   */
  getAvailableDietaryPreferences(): Omit<DietaryPreference, 'id' | 'active'>[] {
    return [
      {
        name: 'gluten-free',
        label: 'Gluten-Free',
        description: 'Avoid wheat, barley, rye, and other gluten-containing ingredients',
        restrictions: ['celiac', 'gluten-sensitivity'],
        avoidIngredients: ['wheat', 'barley', 'rye', 'malt', 'wheat flour', 'enriched flour']
      },
      {
        name: 'vegan',
        label: 'Vegan',
        description: 'Avoid all animal products and by-products',
        restrictions: ['animal-products'],
        avoidIngredients: ['milk', 'eggs', 'honey', 'gelatin', 'whey', 'casein', 'albumin']
      },
      {
        name: 'vegetarian',
        label: 'Vegetarian',
        description: 'Avoid meat and fish, but allow dairy and eggs',
        restrictions: ['meat', 'fish'],
        avoidIngredients: ['beef', 'pork', 'chicken', 'fish', 'seafood', 'meat extract']
      },
      {
        name: 'diabetic',
        label: 'Diabetic-Friendly',
        description: 'Avoid high sugar content and refined carbohydrates',
        restrictions: ['high-sugar', 'refined-carbs'],
        avoidIngredients: ['sugar', 'high fructose corn syrup', 'corn syrup', 'dextrose', 'sucrose']
      },
      {
        name: 'keto',
        label: 'Keto',
        description: 'Very low carb, high fat diet',
        restrictions: ['carbohydrates', 'sugars'],
        avoidIngredients: ['sugar', 'wheat flour', 'rice', 'corn', 'potato starch', 'maltodextrin']
      },
      {
        name: 'paleo',
        label: 'Paleo',
        description: 'Avoid processed foods, grains, and legumes',
        restrictions: ['processed', 'grains', 'legumes'],
        avoidIngredients: ['wheat', 'corn', 'soy', 'peanuts', 'beans', 'artificial preservatives']
      },
      {
        name: 'low-sodium',
        label: 'Low Sodium',
        description: 'Limit sodium intake for heart health',
        restrictions: ['high-sodium'],
        avoidIngredients: ['sodium chloride', 'monosodium glutamate', 'sodium benzoate', 'sodium nitrate']
      },
      {
        name: 'dairy-free',
        label: 'Dairy-Free',
        description: 'Avoid all dairy products and lactose',
        restrictions: ['dairy', 'lactose'],
        avoidIngredients: ['milk', 'cheese', 'butter', 'cream', 'whey', 'casein', 'lactose']
      },
      {
        name: 'nut-free',
        label: 'Nut-Free',
        description: 'Avoid tree nuts and peanuts',
        restrictions: ['nuts', 'tree-nuts'],
        avoidIngredients: ['almonds', 'walnuts', 'peanuts', 'cashews', 'hazelnuts', 'pecans']
      },
      {
        name: 'soy-free',
        label: 'Soy-Free',
        description: 'Avoid soy products and derivatives',
        restrictions: ['soy'],
        avoidIngredients: ['soy', 'soybean oil', 'soy lecithin', 'tofu', 'tempeh', 'miso']
      }
    ];
  }

  /**
   * Get user's current dietary preferences
   */
  async getDietaryPreferences(): Promise<DietaryPreference[]> {
    try {
      const preferencesJson = await AsyncStorage.getItem(this.PREFERENCES_STORAGE_KEY);
      if (!preferencesJson) {
        return this.getDefaultPreferences();
      }

      const preferences = JSON.parse(preferencesJson);
      return preferences.map((pref: any) => ({
        ...pref,
        createdAt: new Date(pref.createdAt),
        updatedAt: new Date(pref.updatedAt)
      }));
    } catch (error) {
      console.error('Failed to load dietary preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  /**
   * Update user's dietary preferences
   */
  async updateDietaryPreferences(preferences: DietaryPreference[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save dietary preferences:', error);
      throw error;
    }
  }

  /**
   * Toggle a dietary preference on/off
   */
  async toggleDietaryPreference(preferenceName: string): Promise<DietaryPreference[]> {
    const preferences = await this.getDietaryPreferences();
    const updatedPreferences = preferences.map(pref => 
      pref.name === preferenceName 
        ? { ...pref, active: !pref.active }
        : pref
    );
    
    await this.updateDietaryPreferences(updatedPreferences);
    return updatedPreferences;
  }

  /**
   * Get custom ingredient avoidances
   */
  async getCustomAvoidances(): Promise<CustomAvoidance[]> {
    try {
      const avoidancesJson = await AsyncStorage.getItem(this.AVOIDANCES_STORAGE_KEY);
      if (!avoidancesJson) return [];

      const avoidances = JSON.parse(avoidancesJson);
      return avoidances.map((avoidance: any) => ({
        ...avoidance,
        createdAt: new Date(avoidance.createdAt)
      }));
    } catch (error) {
      console.error('Failed to load custom avoidances:', error);
      return [];
    }
  }

  /**
   * Add custom ingredient to avoid
   */
  async addCustomAvoidance(ingredientName: string, reason: string, severity: 'mild' | 'moderate' | 'severe' = 'moderate'): Promise<void> {
    try {
      const avoidances = await this.getCustomAvoidances();
      const newAvoidance: CustomAvoidance = {
        id: this.generateId(),
        ingredientName: ingredientName.toLowerCase().trim(),
        reason,
        severity,
        createdAt: new Date()
      };

      const updatedAvoidances = [...avoidances, newAvoidance];
      await AsyncStorage.setItem(this.AVOIDANCES_STORAGE_KEY, JSON.stringify(updatedAvoidances));
    } catch (error) {
      console.error('Failed to add custom avoidance:', error);
      throw error;
    }
  }

  /**
   * Remove custom ingredient avoidance
   */
  async removeCustomAvoidance(avoidanceId: string): Promise<void> {
    try {
      const avoidances = await this.getCustomAvoidances();
      const updatedAvoidances = avoidances.filter(avoidance => avoidance.id !== avoidanceId);
      await AsyncStorage.setItem(this.AVOIDANCES_STORAGE_KEY, JSON.stringify(updatedAvoidances));
    } catch (error) {
      console.error('Failed to remove custom avoidance:', error);
      throw error;
    }
  }

  /**
   * Get all ingredients to avoid based on preferences and custom avoidances
   */
  async getAllIngredientsToAvoid(): Promise<string[]> {
    const preferences = await this.getDietaryPreferences();
    const customAvoidances = await this.getCustomAvoidances();

    const preferenceIngredients = preferences
      .filter(pref => pref.active)
      .flatMap(pref => pref.avoidIngredients);

    const customIngredients = customAvoidances.map(avoidance => avoidance.ingredientName);

    return [...new Set([...preferenceIngredients, ...customIngredients])];
  }

  /**
   * Check if an ingredient should be avoided
   */
  async shouldAvoidIngredient(ingredientName: string): Promise<{
    shouldAvoid: boolean;
    reason: string;
    severity: 'mild' | 'moderate' | 'severe';
    source: 'dietary-preference' | 'custom-avoidance' | 'none';
  }> {
    const preferences = await this.getDietaryPreferences();
    const customAvoidances = await this.getCustomAvoidances();
    const normalizedName = ingredientName.toLowerCase().trim();

    // Check custom avoidances first (highest priority)
    const customAvoidance = customAvoidances.find(avoidance => 
      avoidance.ingredientName === normalizedName ||
      normalizedName.includes(avoidance.ingredientName) ||
      avoidance.ingredientName.includes(normalizedName)
    );

    if (customAvoidance) {
      return {
        shouldAvoid: true,
        reason: customAvoidance.reason,
        severity: customAvoidance.severity,
        source: 'custom-avoidance'
      };
    }

    // Check dietary preferences
    const activePreferences = preferences.filter(pref => pref.active);
    for (const preference of activePreferences) {
      const shouldAvoid = preference.avoidIngredients.some(avoidIngredient =>
        normalizedName.includes(avoidIngredient.toLowerCase()) ||
        avoidIngredient.toLowerCase().includes(normalizedName)
      );

      if (shouldAvoid) {
        return {
          shouldAvoid: true,
          reason: `Restricted by ${preference.label} diet`,
          severity: 'moderate',
          source: 'dietary-preference'
        };
      }
    }

    return {
      shouldAvoid: false,
      reason: '',
      severity: 'mild',
      source: 'none'
    };
  }

  /**
   * Get personalized safety rating for an ingredient
   */
  async getPersonalizedRating(
    ingredientName: string, 
    baseSafetyRating: 'safe' | 'caution' | 'avoid'
  ): Promise<{
    rating: 'safe' | 'caution' | 'avoid';
    explanation: string;
    isPersonalized: boolean;
  }> {
    const avoidanceInfo = await this.shouldAvoidIngredient(ingredientName);

    if (avoidanceInfo.shouldAvoid) {
      return {
        rating: avoidanceInfo.severity === 'severe' ? 'avoid' : 'caution',
        explanation: `${avoidanceInfo.reason}. This ingredient conflicts with your dietary preferences.`,
        isPersonalized: true
      };
    }

    // If no personal restrictions, return base rating
    return {
      rating: baseSafetyRating,
      explanation: 'Rating based on general safety guidelines.',
      isPersonalized: false
    };
  }

  /**
   * Get default dietary preferences (all inactive)
   */
  private getDefaultPreferences(): DietaryPreference[] {
    const availablePreferences = this.getAvailableDietaryPreferences();
    return availablePreferences.map(pref => ({
      ...pref,
      id: this.generateId(),
      active: false
    }));
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `pref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get user profile statistics
   */
  async getProfileStatistics(): Promise<{
    activePreferences: number;
    customAvoidances: number;
    totalRestrictedIngredients: number;
  }> {
    const preferences = await this.getDietaryPreferences();
    const customAvoidances = await this.getCustomAvoidances();
    const allRestricted = await this.getAllIngredientsToAvoid();

    return {
      activePreferences: preferences.filter(pref => pref.active).length,
      customAvoidances: customAvoidances.length,
      totalRestrictedIngredients: allRestricted.length
    };
  }
}

export default UserProfileService.getInstance();