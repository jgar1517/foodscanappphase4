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
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Camera, ChevronRight, CircleCheck as CheckCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const PulsingButton = ({ children, style, onPress, activeOpacity }: any) => {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <TouchableOpacity style={style} onPress={onPress} activeOpacity={activeOpacity}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

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
  const router = useRouter();

  const handleScanPress = () => {
    router.push('/scan');
  };

  return (
    <LinearGradient
      colors={['#201A40', '#302860']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['#7c3aed', '#3730a3']}
            style={styles.heroBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>
                Scan with{'\n'}
                <Text style={styles.heroTitleAccent}>Foodscan AI</Text>
              </Text>
              <Text style={styles.heroSubtitle}>
                AI-powered ingredient safety analysis at your fingertips. Make informed dietary decisions with trusted scientific insights.
              </Text>
              
              <PulsingButton
                style={styles.ctaButton}
                onPress={handleScanPress}
                activeOpacity={0.9}
              >
                <Camera size={20} color="#ffffff" />
                <Text style={styles.ctaButtonText}>Start Scanning</Text>
                <ChevronRight size={20} color="#ffffff" />
              </PulsingButton>
            </View>
          </LinearGradient>
        </View>


        {/* How It Works Section */}
        <BlurView intensity={20} tint="light" style={[styles.section, styles.glassContainer]}>
          <View style={styles.glassContent}>
            <Text style={styles.sectionTitle}>How It Works</Text>
            <View style={styles.stepsContainer}>
              <View style={styles.stepCard}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Scan or Upload</Text>
                  <Text style={styles.stepDescription}>
                    Take a photo of any ingredient label or upload from your gallery
                  </Text>
                </View>
              </View>
              
              <View style={styles.stepCard}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>AI Analysis</Text>
                  <Text style={styles.stepDescription}>
                    Our AI identifies each ingredient and cross-references safety databases
                  </Text>
                </View>
              </View>
              
              <View style={styles.stepCard}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Get Results</Text>
                  <Text style={styles.stepDescription}>
                    Receive safety ratings, explanations, and healthier alternatives
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </BlurView>

        {/* Trust Indicators */}
        <BlurView intensity={20} tint="light" style={[styles.section, styles.glassContainer]}>
          <View style={styles.glassContent}>
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
        </BlurView>

        {/* Final CTA */}
        <BlurView intensity={25} tint="light" style={styles.finalCTA}>
          <View style={styles.glassContent}>
            <Text style={styles.finalCTATitle}>Ready to eat with confidence?</Text>
            <Text style={styles.finalCTASubtitle}>
              Join thousands of users making safer food choices every day
            </Text>
            <PulsingButton
              style={styles.finalCTAButton}
              onPress={handleScanPress}
              activeOpacity={0.9}
            >
              <Text style={styles.finalCTAButtonText}>Start Your First Scan</Text>
            </PulsingButton>
          </View>
        </BlurView>
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
    textShadowColor: '#a855f7',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
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
    backgroundColor: '#7c3aed',
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
    color: '#ffffff',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  dropdownTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
  },
  stepsContainer: {
    gap: 20,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  stepContent: {
    flex: 1,
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
    color: '#ffffff',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
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
    color: '#ffffff',
    fontWeight: '500',
  },
  finalCTA: {
    padding: 32,
    alignItems: 'center',
    borderRadius: 16,
    margin: 24,
    overflow: 'hidden',
  },
  finalCTATitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  finalCTASubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
  },
  finalCTAButton: {
    backgroundColor: '#7c3aed',
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
  glassContainer: {
    borderRadius: 16,
    margin: 24,
    marginTop: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  glassContent: {
    padding: 24,
  },
});