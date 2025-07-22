// AI Analysis Service for enhanced ingredient analysis
export interface AIAnalysisConfig {
  apiKey?: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface AIIngredientAnalysis {
  ingredient: string;
  category: string;
  safetyRating: 'safe' | 'caution' | 'avoid';
  confidence: number;
  reasoning: string;
  healthImpacts: string[];
  alternatives: string[];
  sources: string[];
}

export interface AIBatchAnalysis {
  ingredients: AIIngredientAnalysis[];
  overallAssessment: string;
  keyFindings: string[];
  recommendations: string[];
  processingTime: number;
}

class AIAnalysisService {
  private static instance: AIAnalysisService;
  private config: AIAnalysisConfig;

  private constructor() {
    this.config = {
      model: 'gpt-3.5-turbo',
      temperature: 0.3, // Lower temperature for more consistent results
      maxTokens: 2000
    };
  }

  public static getInstance(): AIAnalysisService {
    if (!AIAnalysisService.instance) {
      AIAnalysisService.instance = new AIAnalysisService();
    }
    return AIAnalysisService.instance;
  }

  /**
   * Analyze ingredients using AI for enhanced accuracy
   */
  async analyzeIngredientsBatch(ingredients: string[]): Promise<AIBatchAnalysis> {
    const startTime = Date.now();

    try {
      // For now, simulate AI analysis with enhanced logic
      // In production, this would call OpenAI API
      const analyses = await Promise.all(
        ingredients.map(ingredient => this.analyzeIngredientWithAI(ingredient))
      );

      const overallAssessment = this.generateOverallAssessment(analyses);
      const keyFindings = this.extractKeyFindings(analyses);
      const recommendations = this.generateRecommendations(analyses);

      return {
        ingredients: analyses,
        overallAssessment,
        keyFindings,
        recommendations,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      console.error('AI analysis failed:', error);
      throw new Error('AI ingredient analysis failed');
    }
  }

  /**
   * Analyze single ingredient with AI enhancement
   */
  private async analyzeIngredientWithAI(ingredient: string): Promise<AIIngredientAnalysis> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Enhanced analysis using pattern matching and knowledge base
    const analysis = this.getEnhancedIngredientAnalysis(ingredient);
    
    return {
      ingredient,
      category: analysis.category,
      safetyRating: analysis.safetyRating,
      confidence: analysis.confidence,
      reasoning: analysis.reasoning,
      healthImpacts: analysis.healthImpacts,
      alternatives: analysis.alternatives,
      sources: analysis.sources
    };
  }

  /**
   * Enhanced ingredient analysis with AI-like reasoning
   */
  private getEnhancedIngredientAnalysis(ingredient: string): AIIngredientAnalysis {
    const normalizedIngredient = ingredient.toLowerCase();

    // Enhanced knowledge base with AI-like categorization
    const knowledgeBase: { [key: string]: Partial<AIIngredientAnalysis> } = {
      'water': {
        category: 'natural',
        safetyRating: 'safe',
        confidence: 100,
        reasoning: 'Water is essential for life and poses no safety concerns when properly treated.',
        healthImpacts: ['Essential for hydration', 'Supports all bodily functions'],
        alternatives: [],
        sources: ['FDA', 'WHO', 'Scientific consensus']
      },
      'organic cane sugar': {
        category: 'sweetener',
        safetyRating: 'caution',
        confidence: 85,
        reasoning: 'While organic, high sugar intake is linked to various health issues including obesity, diabetes, and dental problems.',
        healthImpacts: ['Blood sugar spikes', 'Weight gain risk', 'Dental health concerns', 'Diabetes risk'],
        alternatives: ['Stevia', 'Monk fruit sweetener', 'Erythritol', 'Xylitol'],
        sources: ['American Heart Association', 'WHO', 'EWG']
      },
      'natural flavors': {
        category: 'flavoring',
        safetyRating: 'caution',
        confidence: 70,
        reasoning: 'While derived from natural sources, "natural flavors" is a broad term that can include hundreds of chemicals. Lack of transparency makes assessment difficult.',
        healthImpacts: ['Potential allergen exposure', 'Unknown chemical composition', 'Possible sensitivities'],
        alternatives: ['Specific spices', 'Pure fruit extracts', 'Essential oils', 'Whole food ingredients'],
        sources: ['FDA', 'EWG', 'Consumer advocacy groups']
      },
      'citric acid': {
        category: 'preservative',
        safetyRating: 'safe',
        confidence: 95,
        reasoning: 'Naturally occurring acid found in citrus fruits. Generally recognized as safe and widely used as a preservative and flavor enhancer.',
        healthImpacts: ['Antioxidant properties', 'Aids mineral absorption'],
        alternatives: [],
        sources: ['FDA GRAS list', 'Scientific studies']
      },
      'sodium benzoate': {
        category: 'preservative',
        safetyRating: 'avoid',
        confidence: 80,
        reasoning: 'Can form benzene (a known carcinogen) when combined with vitamin C. Linked to hyperactivity in children and allergic reactions in sensitive individuals.',
        healthImpacts: ['Potential carcinogen formation', 'Hyperactivity in children', 'Allergic reactions', 'Asthma triggers'],
        alternatives: ['Potassium sorbate', 'Vitamin E (tocopherols)', 'Rosemary extract', 'Natural preservation methods'],
        sources: ['EWG', 'European Food Safety Authority', 'Peer-reviewed studies']
      },
      'ascorbic acid': {
        category: 'vitamin',
        safetyRating: 'safe',
        confidence: 100,
        reasoning: 'Vitamin C is an essential nutrient with powerful antioxidant properties. Beneficial for immune system and overall health.',
        healthImpacts: ['Immune system support', 'Antioxidant protection', 'Collagen synthesis', 'Iron absorption'],
        alternatives: [],
        sources: ['NIH', 'FDA', 'Scientific consensus']
      },
      'artificial color red 40': {
        category: 'coloring',
        safetyRating: 'avoid',
        confidence: 85,
        reasoning: 'Synthetic dye linked to hyperactivity and behavioral issues in children. Banned in several European countries due to safety concerns.',
        healthImpacts: ['Hyperactivity in children', 'Behavioral changes', 'Allergic reactions', 'Potential carcinogenic concerns'],
        alternatives: ['Beet juice powder', 'Paprika extract', 'Annatto', 'Fruit and vegetable extracts'],
        sources: ['EWG', 'European Food Safety Authority', 'Pediatric studies']
      },
      'high fructose corn syrup': {
        category: 'sweetener',
        safetyRating: 'avoid',
        confidence: 90,
        reasoning: 'Highly processed sweetener linked to obesity, diabetes, and metabolic syndrome. Metabolized differently than regular sugar, potentially causing more harm.',
        healthImpacts: ['Obesity risk', 'Diabetes development', 'Metabolic syndrome', 'Liver damage', 'Increased appetite'],
        alternatives: ['Pure maple syrup', 'Raw honey', 'Coconut sugar', 'Date syrup'],
        sources: ['American Heart Association', 'Journal of Clinical Investigation', 'EWG']
      }
    };

    // Try to find exact match first
    let analysis = knowledgeBase[normalizedIngredient];
    
    // If no exact match, try partial matching with AI-like fuzzy logic
    if (!analysis) {
      for (const [key, value] of Object.entries(knowledgeBase)) {
        if (this.isIngredientMatch(normalizedIngredient, key)) {
          analysis = value;
          break;
        }
      }
    }

    // If still no match, provide AI-generated default analysis
    if (!analysis) {
      analysis = this.generateDefaultAnalysis(ingredient);
    }

    return {
      ingredient,
      category: analysis.category || 'unknown',
      safetyRating: analysis.safetyRating || 'caution',
      confidence: analysis.confidence || 50,
      reasoning: analysis.reasoning || `${ingredient} requires further research for comprehensive safety assessment.`,
      healthImpacts: analysis.healthImpacts || ['Unknown health impacts'],
      alternatives: analysis.alternatives || [],
      sources: analysis.sources || ['Requires additional research']
    };
  }

  /**
   * AI-like ingredient matching with fuzzy logic
   */
  private isIngredientMatch(ingredient: string, knownIngredient: string): boolean {
    // Remove common words and check for partial matches
    const cleanIngredient = ingredient.replace(/\b(acid|extract|oil|powder|natural|artificial)\b/g, '').trim();
    const cleanKnown = knownIngredient.replace(/\b(acid|extract|oil|powder|natural|artificial)\b/g, '').trim();

    // Check for substring matches
    if (cleanIngredient.includes(cleanKnown) || cleanKnown.includes(cleanIngredient)) {
      return true;
    }

    // Check for common variations
    const variations: { [key: string]: string[] } = {
      'sugar': ['cane sugar', 'organic sugar', 'raw sugar'],
      'vitamin c': ['ascorbic acid', 'l-ascorbic acid'],
      'red 40': ['red dye 40', 'fd&c red 40', 'artificial color red 40'],
      'corn syrup': ['high fructose corn syrup', 'hfcs']
    };

    for (const [base, vars] of Object.entries(variations)) {
      if ((ingredient.includes(base) && vars.some(v => knownIngredient.includes(v))) ||
          (knownIngredient.includes(base) && vars.some(v => ingredient.includes(v)))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate default analysis for unknown ingredients
   */
  private generateDefaultAnalysis(ingredient: string): Partial<AIIngredientAnalysis> {
    // AI-like categorization based on ingredient name patterns
    let category = 'unknown';
    let safetyRating: 'safe' | 'caution' | 'avoid' = 'caution';
    let confidence = 40;

    const ingredientLower = ingredient.toLowerCase();

    // Pattern-based categorization
    if (ingredientLower.includes('acid')) {
      category = 'preservative';
      safetyRating = 'caution';
      confidence = 60;
    } else if (ingredientLower.includes('vitamin') || ingredientLower.includes('mineral')) {
      category = 'vitamin';
      safetyRating = 'safe';
      confidence = 80;
    } else if (ingredientLower.includes('color') || ingredientLower.includes('dye')) {
      category = 'coloring';
      safetyRating = 'avoid';
      confidence = 70;
    } else if (ingredientLower.includes('flavor')) {
      category = 'flavoring';
      safetyRating = 'caution';
      confidence = 65;
    } else if (ingredientLower.includes('sugar') || ingredientLower.includes('syrup')) {
      category = 'sweetener';
      safetyRating = 'caution';
      confidence = 75;
    } else if (ingredientLower.includes('oil') || ingredientLower.includes('fat')) {
      category = 'fat';
      safetyRating = 'caution';
      confidence = 60;
    }

    return {
      category,
      safetyRating,
      confidence,
      reasoning: `${ingredient} is not in our comprehensive database. Based on naming patterns, it appears to be a ${category}. We recommend researching this ingredient further.`,
      healthImpacts: ['Unknown health impacts - requires research'],
      alternatives: [],
      sources: ['Pattern analysis - requires verification']
    };
  }

  /**
   * Generate overall assessment from individual analyses
   */
  private generateOverallAssessment(analyses: AIIngredientAnalysis[]): string {
    const safeCount = analyses.filter(a => a.safetyRating === 'safe').length;
    const cautionCount = analyses.filter(a => a.safetyRating === 'caution').length;
    const avoidCount = analyses.filter(a => a.safetyRating === 'avoid').length;
    const total = analyses.length;

    if (avoidCount > 0) {
      return `This product contains ${avoidCount} ingredient${avoidCount > 1 ? 's' : ''} that should be avoided. Consider looking for alternatives with cleaner ingredient profiles.`;
    } else if (cautionCount > total / 2) {
      return `This product has several ingredients that warrant caution. While not necessarily harmful, there may be better options available.`;
    } else if (safeCount === total) {
      return `This product has a clean ingredient profile with all ingredients considered safe for most people.`;
    } else {
      return `This product has a mixed ingredient profile. Most ingredients are acceptable, but some may require consideration based on your dietary needs.`;
    }
  }

  /**
   * Extract key findings from analyses
   */
  private extractKeyFindings(analyses: AIIngredientAnalysis[]): string[] {
    const findings: string[] = [];
    
    const avoidIngredients = analyses.filter(a => a.safetyRating === 'avoid');
    const cautionIngredients = analyses.filter(a => a.safetyRating === 'caution');
    
    if (avoidIngredients.length > 0) {
      findings.push(`Contains ${avoidIngredients.length} ingredient${avoidIngredients.length > 1 ? 's' : ''} to avoid: ${avoidIngredients.map(a => a.ingredient).join(', ')}`);
    }
    
    if (cautionIngredients.length > 0) {
      findings.push(`${cautionIngredients.length} ingredient${cautionIngredients.length > 1 ? 's' : ''} require caution: ${cautionIngredients.map(a => a.ingredient).join(', ')}`);
    }

    // Find common health impacts
    const allHealthImpacts = analyses.flatMap(a => a.healthImpacts);
    const commonImpacts = this.findCommonItems(allHealthImpacts);
    if (commonImpacts.length > 0) {
      findings.push(`Common health concerns: ${commonImpacts.join(', ')}`);
    }

    return findings;
  }

  /**
   * Generate recommendations based on analyses
   */
  private generateRecommendations(analyses: AIIngredientAnalysis[]): string[] {
    const recommendations: string[] = [];
    
    const avoidIngredients = analyses.filter(a => a.safetyRating === 'avoid');
    if (avoidIngredients.length > 0) {
      recommendations.push('Look for products without artificial colors, preservatives, or high fructose corn syrup');
    }

    const alternatives = analyses.flatMap(a => a.alternatives).filter(alt => alt.length > 0);
    if (alternatives.length > 0) {
      const uniqueAlternatives = [...new Set(alternatives)];
      recommendations.push(`Consider products with: ${uniqueAlternatives.slice(0, 3).join(', ')}`);
    }

    recommendations.push('Choose products with shorter, more recognizable ingredient lists');
    recommendations.push('Look for organic or naturally preserved alternatives when possible');

    return recommendations;
  }

  /**
   * Find common items in an array
   */
  private findCommonItems(items: string[]): string[] {
    const counts: { [key: string]: number } = {};
    items.forEach(item => {
      counts[item] = (counts[item] || 0) + 1;
    });

    return Object.entries(counts)
      .filter(([_, count]) => count > 1)
      .map(([item, _]) => item)
      .slice(0, 3);
  }
}

export default AIAnalysisService.getInstance();