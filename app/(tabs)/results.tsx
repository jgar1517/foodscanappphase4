import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Circle as XCircle, ExternalLink, Lightbulb, Clock, Star, ShoppingCart, ChevronRight, Share } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Mock data for demonstration
const mockScanResult = {
  id: '1',
  imageUrl: 'https://images.pexels.com/photos/4110008/pexels-photo-4110008.jpeg?auto=compress&cs=tinysrgb&w=400',
  totalIngredients: 8,
  safetyScore: 72,
  processingTime: 4.2,
  ingredients: [
    {
      name: 'Water',
      rating: 'safe',
      confidence: 100,
      explanation: 'Water is essential for life and poses no safety concerns.',
      sources: ['FDA', 'EWG'],
      position: 1,
    },
    {
      name: 'Organic Cane Sugar',
      rating: 'caution',
      confidence: 85,
      explanation: 'High sugar content may contribute to weight gain and dental issues. Moderate consumption recommended.',
      sources: ['EWG', 'WHO'],
      position: 2,
    },
    {
      name: 'Natural Flavors',
      rating: 'caution',
      confidence: 70,
      explanation: 'While generally safe, "natural flavors" can be vague and may contain allergens or chemicals not listed.',
      sources: ['FDA', 'EWG'],
      position: 3,
    },
    {
      name: 'Citric Acid',
      rating: 'safe',
      confidence: 95,
      explanation: 'Commonly used preservative and flavor enhancer, generally recognized as safe by FDA.',
      sources: ['FDA'],
      position: 4,
    },
    {
      name: 'Sodium Benzoate',
      rating: 'avoid',
      confidence: 80,
      explanation: 'May form benzene (a carcinogen) when combined with vitamin C. Can cause hyperactivity in children.',
      sources: ['EWG', 'Scientific Studies'],
      position: 5,
    },
    {
      name: 'Ascorbic Acid (Vitamin C)',
      rating: 'safe',
      confidence: 100,
      explanation: 'Essential vitamin with antioxidant properties. Beneficial for immune system health.',
      sources: ['FDA', 'NIH'],
      position: 6,
    },
    {
      name: 'Artificial Color Red 40',
      rating: 'avoid',
      confidence: 85,
      explanation: 'Linked to hyperactivity in children and may cause allergic reactions. Banned in some countries.',
      sources: ['EWG', 'European Food Safety Authority'],
      position: 7,
    },
    {
      name: 'Gum Arabic',
      rating: 'safe',
      confidence: 90,
      explanation: 'Natural fiber that acts as a thickener and stabilizer. Generally safe for consumption.',
      sources: ['FDA'],
      position: 8,
    },
  ],
  recommendations: [
    {
      rank: 1,
      productName: 'Simply Organic Orange Juice',
      brand: 'Simply Orange',
      description: '100% pure orange juice with no added sugars or artificial ingredients',
      imageUrl: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=300',
      retailer: 'Amazon',
      price: 4.99,
      safetyScore: 92,
      reason: 'Contains only natural ingredients with no artificial additives',
    },
    {
      rank: 2,
      productName: 'Honest Kids Organic Juice',
      brand: 'Honest Tea',
      description: 'Organic fruit juice with no artificial flavors or preservatives',
      imageUrl: 'https://images.pexels.com/photos/1233319/pexels-photo-1233319.jpeg?auto=compress&cs=tinysrgb&w=300',
      retailer: 'Target',
      price: 3.49,
      safetyScore: 88,
      reason: 'USDA organic certification ensures cleaner ingredients',
    },
  ],
  recipes: [
    {
      name: 'Homemade Orange Refresher',
      description: 'Fresh orange juice with natural sweeteners',
      imageUrl: 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=300',
      prepTime: 5,
      difficulty: 'Easy',
      ingredients: ['2 fresh oranges', '1 cup sparkling water', '1 tsp honey', 'Ice cubes'],
    },
  ],
};

const getRatingColor = (rating: string) => {
  switch (rating) {
    case 'safe':
      return '#10b981';
    case 'caution':
      return '#f59e0b';
    case 'avoid':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

const getRatingIcon = (rating: string) => {
  switch (rating) {
    case 'safe':
      return CheckCircle;
    case 'caution':
      return AlertTriangle;
    case 'avoid':
      return XCircle;
    default:
      return CheckCircle;
  }
};

const SafetyScoreCircle = ({ score }: { score: number }) => {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  
  return (
    <View style={[styles.scoreCircle, { borderColor: color }]}>
      <Text style={[styles.scoreText, { color }]}>{score}</Text>
      <Text style={styles.scoreLabel}>Safety Score</Text>
    </View>
  );
};

export default function ResultsScreen() {
  const [activeTab, setActiveTab] = useState('ingredients');
  
  const safetySummary = mockScanResult.ingredients.reduce((acc, ingredient) => {
    acc[ingredient.rating] = (acc[ingredient.rating] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const renderIngredientItem = (ingredient: any) => {
    const IconComponent = getRatingIcon(ingredient.rating);
    const color = getRatingColor(ingredient.rating);
    
    return (
      <View key={ingredient.name} style={styles.ingredientCard}>
        <View style={styles.ingredientHeader}>
          <View style={styles.ingredientInfo}>
            <Text style={styles.ingredientName}>{ingredient.name}</Text>
            <View style={styles.ingredientMeta}>
              <Text style={styles.ingredientPosition}>Position #{ingredient.position}</Text>
              <Text style={styles.ingredientConfidence}>
                {ingredient.confidence}% confidence
              </Text>
            </View>
          </View>
          <View style={[styles.ratingBadge, { backgroundColor: `${color}15` }]}>
            <IconComponent size={16} color={color} />
            <Text style={[styles.ratingText, { color }]}>
              {ingredient.rating.charAt(0).toUpperCase() + ingredient.rating.slice(1)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.ingredientExplanation}>{ingredient.explanation}</Text>
        
        <View style={styles.sourcesContainer}>
          <Text style={styles.sourcesLabel}>Sources:</Text>
          <View style={styles.sourcesRow}>
            {ingredient.sources.map((source: string, index: number) => (
              <View key={index} style={styles.sourceTag}>
                <Text style={styles.sourceText}>{source}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderRecommendations = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Healthier Alternatives</Text>
      {mockScanResult.recommendations.map((rec) => (
        <View key={rec.rank} style={styles.recommendationCard}>
          <Image source={{ uri: rec.imageUrl }} style={styles.recommendationImage} />
          <View style={styles.recommendationContent}>
            <View style={styles.recommendationHeader}>
              <Text style={styles.recommendationName}>{rec.productName}</Text>
              <View style={styles.recommendationScore}>
                <Star size={12} color="#f59e0b" fill="#f59e0b" />
                <Text style={styles.scoreValue}>{rec.safetyScore}</Text>
              </View>
            </View>
            <Text style={styles.recommendationBrand}>{rec.brand}</Text>
            <Text style={styles.recommendationDescription}>{rec.description}</Text>
            <Text style={styles.recommendationReason}>{rec.reason}</Text>
            
            <View style={styles.recommendationFooter}>
              <Text style={styles.recommendationPrice}>${rec.price}</Text>
              <TouchableOpacity style={styles.buyButton}>
                <ShoppingCart size={14} color="#10b981" />
                <Text style={styles.buyButtonText}>Buy on {rec.retailer}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderRecipes = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Homemade Alternatives</Text>
      {mockScanResult.recipes.map((recipe, index) => (
        <View key={index} style={styles.recipeCard}>
          <Image source={{ uri: recipe.imageUrl }} style={styles.recipeImage} />
          <View style={styles.recipeContent}>
            <Text style={styles.recipeName}>{recipe.name}</Text>
            <Text style={styles.recipeDescription}>{recipe.description}</Text>
            
            <View style={styles.recipeDetails}>
              <View style={styles.recipeDetail}>
                <Clock size={14} color="#6b7280" />
                <Text style={styles.recipeDetailText}>{recipe.prepTime} min</Text>
              </View>
              <View style={styles.recipeDetail}>
                <Lightbulb size={14} color="#6b7280" />
                <Text style={styles.recipeDetailText}>{recipe.difficulty}</Text>
              </View>
            </View>
            
            <View style={styles.ingredientsList}>
              {recipe.ingredients.map((ingredient, idx) => (
                <Text key={idx} style={styles.recipeIngredient}>• {ingredient}</Text>
              ))}
            </View>
            
            <TouchableOpacity style={styles.viewRecipeButton}>
              <Text style={styles.viewRecipeText}>View Full Recipe</Text>
              <ChevronRight size={14} color="#10b981" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Image source={{ uri: mockScanResult.imageUrl }} style={styles.headerImage} />
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Scan Results</Text>
              <Text style={styles.headerSubtitle}>
                {mockScanResult.totalIngredients} ingredients analyzed in {mockScanResult.processingTime}s
              </Text>
            </View>
            <TouchableOpacity style={styles.shareButton}>
              <Share size={20} color="#10b981" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Safety Overview */}
        <View style={styles.overviewSection}>
          <SafetyScoreCircle score={mockScanResult.safetyScore} />
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: '#10b98115' }]}>
                <CheckCircle size={16} color="#10b981" />
              </View>
              <Text style={styles.summaryLabel}>Safe</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: '#f59e0b15' }]}>
                <AlertTriangle size={16} color="#f59e0b" />
              </View>
              <Text style={styles.summaryLabel}>Caution</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: '#ef444415' }]}>
                <XCircle size={16} color="#ef4444" />
              </View>
              <Text style={styles.summaryLabel}>Avoid</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'ingredients' && styles.activeTab]}
            onPress={() => setActiveTab('ingredients')}
          >
            <Text style={[styles.tabText, activeTab === 'ingredients' && styles.activeTabText]}>
              Ingredients
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'alternatives' && styles.activeTab]}
            onPress={() => setActiveTab('alternatives')}
          >
            <Text style={[styles.tabText, activeTab === 'alternatives' && styles.activeTabText]}>
              Alternatives
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'recipes' && styles.activeTab]}
            onPress={() => setActiveTab('recipes')}
          >
            <Text style={[styles.tabText, activeTab === 'recipes' && styles.activeTabText]}>
              Recipes
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'ingredients' && (
          <View style={styles.tabContent}>
            {mockScanResult.ingredients.map(renderIngredientItem)}
          </View>
        )}
        
        {activeTab === 'alternatives' && renderRecommendations()}
        
        {activeTab === 'recipes' && renderRecipes()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  overviewSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: '800',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  summaryItem: {
    alignItems: 'center',
    gap: 8,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    marginHorizontal: 24,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#10b981',
  },
  tabContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  ingredientCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  ingredientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  ingredientMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  ingredientPosition: {
    fontSize: 12,
    color: '#6b7280',
  },
  ingredientConfidence: {
    fontSize: 12,
    color: '#6b7280',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ingredientExplanation: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  sourcesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sourcesLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  sourcesRow: {
    flexDirection: 'row',
    gap: 6,
  },
  sourceTag: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sourceText: {
    fontSize: 10,
    color: '#374151',
    fontWeight: '600',
  },
  recommendationCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    gap: 12,
  },
  recommendationImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  recommendationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  recommendationScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  recommendationBrand: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 6,
  },
  recommendationReason: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    marginBottom: 12,
  },
  recommendationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendationPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b98115',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  buyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  recipeCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  recipeImage: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginBottom: 12,
  },
  recipeContent: {
    gap: 8,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  recipeDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  recipeDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  recipeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recipeDetailText: {
    fontSize: 12,
    color: '#6b7280',
  },
  ingredientsList: {
    gap: 2,
  },
  recipeIngredient: {
    fontSize: 12,
    color: '#374151',
  },
  viewRecipeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b98115',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 4,
  },
  viewRecipeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
});