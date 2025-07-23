import React, { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import ScanService, { ScanSession } from '@/services/scanService';
import { AnalysisResult } from '@/services/ingredientService';
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
  const [scanSession, setScanSession] = useState<ScanSession | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();

  // Load scan results on component mount
  React.useEffect(() => {
    loadScanResults();
  }, [sessionId]);

  const loadScanResults = async () => {
    if (!sessionId) {
      setError('No scan session found');
      setLoading(false);
      return;
    }

    try {
      const session = await ScanService.getScanSession(sessionId);
      if (!session) {
        setError('Scan session not found');
        setLoading(false);
        return;
      }

      if (session.status !== 'completed' || !session.analysisResult) {
        setError('Scan analysis not completed');
        setLoading(false);
        return;
      }

      setScanSession(session);
      setAnalysisResult(session.analysisResult);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load scan results:', err);
      setError('Failed to load scan results');
      setLoading(false);
    }
  };
  
  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading scan results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error || !scanSession || !analysisResult) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'No scan data available'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const safetySummary = analysisResult.summary;

  const renderIngredientItem = (ingredient: any) => {
    const IconComponent = getRatingIcon(ingredient.rating);
    const color = getRatingColor(ingredient.rating);
    const isPersonalized = ingredient.isPersonalized;
    
    return (
      <View key={ingredient.name} style={styles.ingredientCard}>
        <View style={styles.ingredientHeader}>
          <View style={styles.ingredientInfo}>
            <View style={styles.ingredientNameRow}>
              <Text style={styles.ingredientName}>{ingredient.name}</Text>
              {isPersonalized && (
                <View style={styles.personalizedBadge}>
                  <Text style={styles.personalizedBadgeText}>✨</Text>
                </View>
              )}
            </View>
            <View style={styles.ingredientMeta}>
              <Text style={styles.ingredientPosition}>Position #{ingredient.position}</Text>
              <Text style={styles.ingredientConfidence}>
                {ingredient.confidence}% confidence
              </Text>
              {isPersonalized && ingredient.originalRating !== ingredient.rating && (
                <Text style={styles.originalRating}>
                  Originally: {ingredient.originalRating}
                </Text>
              )}
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
        
        {/* Show personalization reasons if applicable */}
        {isPersonalized && ingredient.personalizationReasons && ingredient.personalizationReasons.length > 0 && (
          <View style={styles.personalizationReasons}>
            <Text style={styles.personalizationReasonsTitle}>Personalized because:</Text>
            {ingredient.personalizationReasons.map((reason: string, index: number) => (
              <Text key={index} style={styles.personalizationReason}>• {reason}</Text>
            ))}
          </View>
        )}
        
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
      {mockScanResult.recommendations.map((rec, index) => (
        <View key={index} style={styles.recommendationCard}>
          <Image source={{ uri: rec.imageUrl }} style={styles.recommendationImage} />
          <View style={styles.recommendationContent}>
            <View style={styles.recommendationHeader}>
              <Text style={styles.recommendationName}>{rec.productName}</Text>
              <View style={styles.recommendationScore}>
                <Star size={12} color="#f59e0b" fill="#f59e0b" />
                <Text style={styles.scoreValue}>{rec.safetyScore}</Text>
              </View>
            </View>
            <View>
              <Text style={styles.recommendationBrand}>{rec.brand}</Text>
              <Text style={styles.recommendationDescription}>{rec.description}</Text>
              <Text style={styles.recommendationReason}>{rec.reason}</Text>
            </View>
            
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
            <Image source={{ uri: scanSession.imageUri }} style={styles.headerImage} />
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Scan Results</Text>
              <Text style={styles.headerSubtitle}>
                {analysisResult.ingredients.length} ingredients analyzed in {(analysisResult.processingTime / 1000).toFixed(1)}s
              </Text>
            </View>
            <TouchableOpacity style={styles.shareButton}>
              <Share size={20} color="#10b981" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Safety Overview */}
        <View style={styles.overviewSection}>
          <SafetyScoreCircle score={analysisResult.overallSafetyScore} />
          
          {/* Show personalization indicator if applicable */}
          {analysisResult.ingredients.some((ing: any) => ing.isPersonalized) && (
            <View style={styles.personalizationBanner}>
              <Text style={styles.personalizationText}>
                ✨ Results personalized for your dietary preferences
              </Text>
            </View>
          )}
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: '#10b98115' }]}>
                <CheckCircle size={16} color="#10b981" />
              </View>
              <Text style={styles.summaryCount}>{safetySummary.safe || 0}</Text>
              <Text style={styles.summaryLabel}>Safe</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: '#f59e0b15' }]}>
                <AlertTriangle size={16} color="#f59e0b" />
              </View>
              <Text style={styles.summaryCount}>{safetySummary.caution || 0}</Text>
              <Text style={styles.summaryLabel}>Caution</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: '#ef444415' }]}>
                <XCircle size={16} color="#ef4444" />
              </View>
              <Text style={styles.summaryCount}>{safetySummary.avoid || 0}</Text>
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
            {analysisResult.ingredients.map(renderIngredientItem)}
          </View>
        )}
        
        {activeTab === 'alternatives' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Healthier Alternatives</Text>
            <View style={styles.comingSoonContainer}>
              <Text style={styles.comingSoonText}>Product recommendations coming soon!</Text>
              <Text style={styles.comingSoonSubtext}>
                We're working on integrating with retailers to bring you the best alternative products.
              </Text>
            </View>
          </View>
        )}
        
        {activeTab === 'recipes' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Homemade Alternatives</Text>
            <View style={styles.comingSoonContainer}>
              <Text style={styles.comingSoonText}>Recipe suggestions coming soon!</Text>
              <Text style={styles.comingSoonSubtext}>
                We're developing a recipe engine to suggest healthier homemade alternatives.
              </Text>
            </View>
          </View>
        )}
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
  personalizationBanner: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  personalizationText: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: '600',
    textAlign: 'center',
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
  ingredientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    flex: 1,
  },
  personalizedBadge: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  personalizedBadgeText: {
    fontSize: 10,
    color: '#0369a1',
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
  originalRating: {
    fontSize: 11,
    color: '#9ca3af',
    fontStyle: 'italic',
    textTransform: 'capitalize',
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
  personalizationReasons: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#0ea5e9',
  },
  personalizationReasonsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369a1',
    marginBottom: 4,
  },
  personalizationReason: {
    fontSize: 12,
    color: '#0369a1',
    lineHeight: 16,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  comingSoonContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  comingSoonSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});