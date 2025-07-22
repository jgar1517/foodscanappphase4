// Dietary Profile Service for managing user preferences without authentication
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DietaryPreference {
  id: string;
  name: string;
  label: string;
  description: string;
  isActive: boolean;
  category: 'medical' | 'lifestyle' | 'religious' | 'allergy';
  ingredientsToAvoid: string[];
  ingredientsToFlag: string[];
}

export interface CustomIngredientAvoidance {
  id: string;
  ingredientName: string;
  reason: string;
  severity: 'avoid' | 'caution';
  dateAdded: Date;
}

export interface DietaryProfile {
  preferences: DietaryPreference[];
  customAvoidances: CustomIngredientAvoidance[];
  lastUpdated: Date;
}

class DietaryProfileService {
  private static instance: DietaryProfileService;
  private readonly PROFILE_STORAGE_KEY = 'dietary_profile';
  private readonly DEFAULT_PREFERENCES: Omit<DietaryPreference, 'isActive'>[] = [
    {
      id: 'gluten-free',
      name: 'gluten-free',
      label: 'Gluten-Free',
      description: 'Avoid wheat, barley, rye, and other gluten-containing ingredients',
      category: 'medical',
      ingredientsToAvoid: [
        'wheat flour', 'enriched flour', 'barley', 'rye', 'malt', 'wheat starch',
        'wheat protein', 'vital wheat gluten', 'modified wheat starch'
      ],
      ingredientsToFlag: ['natural flavors', 'modified food starch', 'caramel color']
    },
    {
      id: 'vegan',
      name: 'vegan',
      label: 'Vegan',
      description: 'Avoid all animal-derived ingredients',
      category: 'lifestyle',
      ingredientsToAvoid: [
        'milk', 'butter', 'cheese', 'whey', 'casein', 'lactose', 'eggs',
        'honey', 'gelatin', 'carmine', 'shellac', 'lanolin'
      ],
      ingredientsToFlag: ['natural flavors', 'vitamin d3', 'lactic acid']
    },
    {
      id: 'vegetarian',
      name: 'vegetarian',
      label: 'Vegetarian',
      description: 'Avoid meat and fish-derived ingredients',
      category: 'lifestyle',
      ingredientsToAvoid: [
        'gelatin', 'carmine', 'isinglass', 'anchovies', 'fish sauce',
        'chicken fat', 'beef tallow', 'lard'
      ],
      ingredientsToFlag: ['natural flavors', 'enzymes', 'vitamin d3']
    },
    {
      id: 'diabetic',
      name: 'diabetic',
      label: 'Diabetic-Friendly',
      description: 'Avoid high-sugar ingredients and monitor carbohydrates',
      category: 'medical',
      ingredientsToAvoid: [
        'high fructose corn syrup', 'corn syrup', 'dextrose', 'maltose',
        'sucrose', 'fructose', 'glucose syrup'
      ],
      ingredientsToFlag: ['sugar', 'organic cane sugar', 'brown sugar', 'honey', 'agave']
    },
    {
      id: 'keto',
      name: 'keto',
      label: 'Keto',
      description: 'Avoid high-carb ingredients for ketogenic diet',
      category: 'lifestyle',
      ingredientsToAvoid: [
        'sugar', 'high fructose corn syrup', 'wheat flour', 'rice', 'potato starch',
        'corn starch', 'maltodextrin', 'dextrose'
      ],
      ingredientsToFlag: ['natural flavors', 'modified food starch', 'tapioca starch']
    },
    {
      id: 'paleo',
      name: 'paleo',
      label: 'Paleo',
      description: 'Avoid processed foods and focus on whole ingredients',
      category: 'lifestyle',
      ingredientsToAvoid: [
        'wheat flour', 'corn syrup', 'soy lecithin', 'carrageenan',
        'xanthan gum', 'artificial colors', 'artificial flavors'
      ],
      ingredientsToFlag: ['natural flavors', 'guar gum', 'locust bean gum']
    },
    {
      id: 'low-sodium',
      name: 'low-sodium',
      label: 'Low Sodium',
      description: 'Monitor and limit sodium intake',
      category: 'medical',
      ingredientsToAvoid: [
        'sodium chloride', 'monosodium glutamate', 'sodium nitrate',
        'sodium nitrite', 'sodium phosphate'
      ],
      ingredientsToFlag: ['salt', 'sodium benzoate', 'sodium citrate', 'baking soda']
    },
    {
      id: 'dairy-free',
      name: 'dairy-free',
      label: 'Dairy-Free',
      description: 'Avoid all dairy and lactose-containing ingredients',
      category: 'allergy',
      ingredientsToAvoid: [
        'milk', 'butter', 'cheese', 'cream', 'whey', 'casein',
        'lactose', 'milk powder', 'buttermilk'
      ],
      ingredientsToFlag: ['natural flavors', 'caramel color', 'lactic acid']
    },
    {
      id: 'nut-free',
      name: 'nut-free',
      label: 'Nut-Free',
      description: 'Avoid tree nuts and peanuts',
      category: 'allergy',
      ingredientsToAvoid: [
        'peanuts', 'tree nuts', 'almonds', 'walnuts', 'pecans',
        'cashews', 'pistachios', 'hazelnuts', 'peanut oil'
      ],
      ingredientsToFlag: ['natural flavors', 'natural oils']
    },
    {
      id: 'soy-free',
      name: 'soy-free',
      label: 'Soy-Free',
      description: 'Avoid soy-derived ingredients',
      category: 'allergy',
      ingredientsToAvoid: [
        'soy', 'soy lecithin', 'soybean oil', 'soy protein',
        'soy flour', 'tofu', 'tempeh', 'miso'
      ],
      ingredientsToFlag: ['natural flavors', 'vegetable oil', 'vitamin e']
    }
  ];

  public static getInstance(): DietaryProfileService {
    if (!DietaryProfileService.instance) {
      DietaryProfileService.instance = new DietaryProfileService();
    }
    return DietaryProfileService.instance;
  }

  /**
   * Get current dietary profile
   */
  async getDietaryProfile(): Promise<DietaryProfile> {
    try {
      const profileJson = await AsyncStorage.getItem(this.PROFILE_STORAGE_KEY);
      
      if (!profileJson) {
        // Return default profile with all preferences inactive
        return this.createDefaultProfile();
      }

      const profile = JSON.parse(profileJson);
      
      // Convert date strings back to Date objects
      return {
        ...profile,
        lastUpdated: new Date(profile.lastUpdated),
        customAvoidances: profile.customAvoidances.map((avoidance: any) => ({
          ...avoidance,
          dateAdded: new Date(avoidance.dateAdded)
        }))
      };
    } catch (error) {
      console.error('Failed to load dietary profile:', error);
      return this.createDefaultProfile();
    }
  }

  /**
   * Update dietary preferences
   */
  async updateDietaryPreferences(preferences: DietaryPreference[]): Promise<void> {
    try {
      const currentProfile = await this.getDietaryProfile();
      const updatedProfile: DietaryProfile = {
        ...currentProfile,
        preferences,
        lastUpdated: new Date()
      };

      await AsyncStorage.setItem(this.PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
    } catch (error) {
      console.error('Failed to update dietary preferences:', error);
      throw error;
    }
  }

  /**
   * Add custom ingredient avoidance
   */
  async addCustomAvoidance(ingredientName: string, reason: string, severity: 'avoid' | 'caution' = 'avoid'): Promise<void> {
    try {
      const currentProfile = await this.getDietaryProfile();
      
      const newAvoidance: CustomIngredientAvoidance = {
        id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ingredientName: ingredientName.trim(),
        reason: reason.trim(),
        severity,
        dateAdded: new Date()
      };

      const updatedProfile: DietaryProfile = {
        ...currentProfile,
        customAvoidances: [...currentProfile.customAvoidances, newAvoidance],
        lastUpdated: new Date()
      };

      await AsyncStorage.setItem(this.PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
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
      const currentProfile = await this.getDietaryProfile();
      
      const updatedProfile: DietaryProfile = {
        ...currentProfile,
        customAvoidances: currentProfile.customAvoidances.filter(avoidance => avoidance.id !== avoidanceId),
        lastUpdated: new Date()
      };

      await AsyncStorage.setItem(this.PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
    } catch (error) {
      console.error('Failed to remove custom avoidance:', error);
      throw error;
    }
  }

  /**
   * Get active dietary preferences
   */
  async getActivePreferences(): Promise<DietaryPreference[]> {
    const profile = await this.getDietaryProfile();
    return profile.preferences.filter(pref => pref.isActive);
  }

  /**
   * Get all ingredients to avoid based on active preferences
   */
  async getIngredientsToAvoid(): Promise<string[]> {
    const activePreferences = await this.getActivePreferences();
    const profile = await this.getDietaryProfile();
    
    const preferencesAvoidances = activePreferences.flatMap(pref => pref.ingredientsToAvoid);
    const customAvoidances = profile.customAvoidances
      .filter(avoidance => avoidance.severity === 'avoid')
      .map(avoidance => avoidance.ingredientName);
    
    return [...new Set([...preferencesAvoidances, ...customAvoidances])];
  }

  /**
   * Get all ingredients to flag as caution based on active preferences
   */
  async getIngredientsToFlag(): Promise<string[]> {
    const activePreferences = await this.getActivePreferences();
    const profile = await this.getDietaryProfile();
    
    const preferencesFlags = activePreferences.flatMap(pref => pref.ingredientsToFlag);
    const customFlags = profile.customAvoidances
      .filter(avoidance => avoidance.severity === 'caution')
      .map(avoidance => avoidance.ingredientName);
    
    return [...new Set([...preferencesFlags, ...customFlags])];
  }

  /**
   * Check if an ingredient should be avoided or flagged
   */
  async checkIngredientRestriction(ingredientName: string): Promise<{
    shouldAvoid: boolean;
    shouldFlag: boolean;
    reasons: string[];
  }> {
    const activePreferences = await this.getActivePreferences();
    const profile = await this.getDietaryProfile();
    
    const normalizedIngredient = ingredientName.toLowerCase().trim();
    const reasons: string[] = [];
    let shouldAvoid = false;
    let shouldFlag = false;

    // Check against dietary preferences
    for (const preference of activePreferences) {
      const avoidsIngredient = preference.ingredientsToAvoid.some(avoid => 
        normalizedIngredient.includes(avoid.toLowerCase()) || avoid.toLowerCase().includes(normalizedIngredient)
      );
      
      const flagsIngredient = preference.ingredientsToFlag.some(flag => 
        normalizedIngredient.includes(flag.toLowerCase()) || flag.toLowerCase().includes(normalizedIngredient)
      );

      if (avoidsIngredient) {
        shouldAvoid = true;
        reasons.push(`${preference.label}: ${preference.description}`);
      } else if (flagsIngredient) {
        shouldFlag = true;
        reasons.push(`${preference.label}: May contain restricted ingredients`);
      }
    }

    // Check against custom avoidances
    for (const avoidance of profile.customAvoidances) {
      const matchesCustom = normalizedIngredient.includes(avoidance.ingredientName.toLowerCase()) ||
                           avoidance.ingredientName.toLowerCase().includes(normalizedIngredient);
      
      if (matchesCustom) {
        if (avoidance.severity === 'avoid') {
          shouldAvoid = true;
        } else {
          shouldFlag = true;
        }
        reasons.push(`Custom restriction: ${avoidance.reason}`);
      }
    }

    return { shouldAvoid, shouldFlag, reasons };
  }

  /**
   * Create default profile with all preferences inactive
   */
  private createDefaultProfile(): DietaryProfile {
    return {
      preferences: this.DEFAULT_PREFERENCES.map(pref => ({
        ...pref,
        isActive: false
      })),
      customAvoidances: [],
      lastUpdated: new Date()
    };
  }

  /**
   * Reset dietary profile to defaults
   */
  async resetProfile(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.PROFILE_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to reset dietary profile:', error);
      throw error;
    }
  }

  /**
   * Export dietary profile for backup
   */
  async exportProfile(): Promise<string> {
    const profile = await this.getDietaryProfile();
    return JSON.stringify(profile, null, 2);
  }

  /**
   * Import dietary profile from backup
   */
  async importProfile(profileJson: string): Promise<void> {
    try {
      const profile = JSON.parse(profileJson);
      
      // Validate profile structure
      if (!profile.preferences || !Array.isArray(profile.preferences)) {
        throw new Error('Invalid profile format');
      }

      await AsyncStorage.setItem(this.PROFILE_STORAGE_KEY, profileJson);
    } catch (error) {
      console.error('Failed to import dietary profile:', error);
      throw error;
    }
  }
}

export default DietaryProfileService.getInstance();