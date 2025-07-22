import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Zap, Users, TrendingUp, Camera, ChevronRight, Star, CircleCheck as CheckCircle, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const features = [
  {
    icon: Shield,
    title: 'AI-Powered Safety Analysis',
    description: 'Get instant safety ratings for every ingredient based on trusted scientific sources',
    color: '#10b981',
  },
  {
    icon: Zap,
    title: 'Instant Results',
    description: 'Scan any ingredient label and get results in under 5 seconds',
    color: '#f59e0b',
  },
  {
    icon: Users,
    title: 'Personalized for You',
    description: 'Custom dietary profiles adapt safety ratings to your specific needs',
    color: '#8b5cf6',
  },
  {
    icon: TrendingUp,
    title: 'Smart Recommendations',
    description: 'Discover healthier alternatives and simple recipes using safer ingredients',
    color: '#ef4444',
  },
];

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Mom of 2',
    text: 'Finally, an app that makes ingredient labels simple to understand!',
    rating: 5,
  },
  {
    name: 'Dr. James L.',
    role: 'Nutritionist',
    text: 'Accurate, science-based information that I recommend to my patients.',
    rating: 5,
  },
  {
    name: 'Mike R.',
    role: 'Fitness Enthusiast',
    text: 'Helped me identify hidden ingredients affecting my performance.',
    rating: 5,
  },
];

export default function HomeScreen() {
  const [featuresExpanded, setFeaturesExpanded] = React.useState(false);
  const router = useRouter();

  const handleScanPress = () => {
    router.push('/scan');
  };

  return (
    <LinearGradient
      colors={['#9333ea', '#4f46e5']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <ImageBackground
            source={require('@/assets/images/image.png')}
            style={styles.heroBackground}
            resizeMode="cover"
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>
                Scan with{'\n'}
                <Text style={styles.heroTitleAccent}>Confidence</Text>
              </Text>
              <Text style={styles.heroSubtitle}>
                AI-powered ingredient safety analysis at your fingertips. Make informed dietary decisions with trusted scientific insights.
              </Text>
              
              <TouchableOpacity 
                style={styles.ctaButton}
                onPress={handleScanPress}
                activeOpacity={0.9}
              >
                <Camera size={20} color="#10b981" />
                <Text style={styles.ctaButtonText}>Start Scanning</Text>
                <ChevronRight size={20} color="#10b981" />
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.dropdownHeader}
            onPress={() => setFeaturesExpanded(!featuresExpanded)}
            activeOpacity={0.7}
          >
            <Text style={styles.dropdownTitle}>Why Choose Food Safety Scanner?</Text>
            {featuresExpanded ? (
              <ChevronUp size={24} color="#10b981" />
            ) : (
              <ChevronDown size={24} color="#10b981" />
            )}
          </TouchableOpacity>
          
          {featuresExpanded && (
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureCard}>
                  <View style={[styles.featureIcon, { backgroundColor: `${feature.color}15` }]}>
                    <feature.icon size={24} color={feature.color} />
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* How It Works Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.stepsContainer}>
            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepTitle}>Scan or Upload</Text>
              <Text style={styles.stepDescription}>
                Take a photo of any ingredient label or upload from your gallery
              </Text>
            </View>
            
            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepTitle}>AI Analysis</Text>
              <Text style={styles.stepDescription}>
                Our AI identifies each ingredient and cross-references safety databases
              </Text>
            </View>
            
            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepTitle}>Get Results</Text>
              <Text style={styles.stepDescription}>
                Receive safety ratings, explanations, and healthier alternatives
              </Text>
            </View>
          </View>
        </View>

        {/* Trust Indicators */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trusted by Health Professionals</Text>
          <View style={styles.trustIndicators}>
            <View style={styles.trustItem}>
              <CheckCircle size={20} color="#10b981" />
              <Text style={styles.trustText}>FDA Database Integration</Text>
            </View>
            <View style={styles.trustItem}>
              <CheckCircle size={20} color="#10b981" />
              <Text style={styles.trustText}>EWG Food Scores</Text>
            </View>
            <View style={styles.trustItem}>
              <CheckCircle size={20} color="#10b981" />
              <Text style={styles.trustText}>Scientific Research Backed</Text>
            </View>
            <View style={styles.trustItem}>
              <CheckCircle size={20} color="#10b981" />
              <Text style={styles.trustText}>Regular Database Updates</Text>
            </View>
          </View>
        </View>

        {/* Final CTA */}
        <View style={styles.finalCTA}>
          <Text style={styles.finalCTATitle}>Ready to eat with confidence?</Text>
          <Text style={styles.finalCTASubtitle}>
            Join thousands of users making safer food choices every day
          </Text>
          <TouchableOpacity 
            style={styles.finalCTAButton}
            onPress={handleScanPress}
            activeOpacity={0.9}
          >
            <Text style={styles.finalCTAButtonText}>Start Your First Scan</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingBottom: 100, // Add padding for tab bar
  },
  heroSection: {
    height: 400,
    marginBottom: 32,
  },
  heroBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 44,
  },
  heroTitleAccent: {
    color: '#10b981',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#f3f4f6',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  dropdownTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
  },
  featuresGrid: {
    gap: 20,
  },
  featureCard: {
    backgroundColor: '#f9fafb',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  stepsContainer: {
    gap: 20,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    flex: 1,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    flex: 1,
  },
  trustIndicators: {
    gap: 12,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trustText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  finalCTA: {
    backgroundColor: '#f9fafb',
    padding: 32,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  finalCTATitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  finalCTASubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  finalCTAButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  finalCTAButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});