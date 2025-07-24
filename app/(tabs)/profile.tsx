import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { User, Settings, Heart, Shield, Download, Upload, Trash2 } from 'lucide-react-native';
import DietaryProfileService, { DietaryPreference } from '@/services/dietaryProfileService';
import ScanService from '@/services/scanService';

export default function ProfileScreen() {
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreference[]>([]);
  const [scanStats, setScanStats] = useState({
    totalScans: 0,
    completedScans: 0,
    averageSafetyScore: 0,
    lastScanDate: undefined as Date | undefined
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const profile = await DietaryProfileService.getDietaryProfile();
      setDietaryPreferences(profile.preferences);
      
      const stats = await ScanService.getScanStatistics();
      setScanStats(stats);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load profile data:', error);
      setLoading(false);
    }
  };

  const togglePreference = async (preferenceId: string) => {
    try {
      const updatedPreferences = dietaryPreferences.map(pref =>
        pref.id === preferenceId ? { ...pref, isActive: !pref.isActive } : pref
      );
      
      await DietaryProfileService.updateDietaryPreferences(updatedPreferences);
      setDietaryPreferences(updatedPreferences);
    } catch (error) {
      Alert.alert('Error', 'Failed to update dietary preferences');
    }
  };

  const clearScanHistory = async () => {
    Alert.alert(
      'Clear Scan History',
      'Are you sure you want to delete all scan history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await ScanService.clearScanHistory();
              setScanStats({
                totalScans: 0,
                completedScans: 0,
                averageSafetyScore: 0,
                lastScanDate: undefined
              });
              Alert.alert('Success', 'Scan history cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear scan history');
            }
          }
        }
      ]
    );
  };

  const exportProfile = async () => {
    try {
      const profileData = await DietaryProfileService.exportProfile();
      // In a real app, you would share this data or save to files
      Alert.alert('Export Ready', 'Profile data exported successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to export profile');
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#201A40', '#302860']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#201A40', '#302860']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.avatarContainer}>
                <User size={32} color="#10b981" />
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.headerTitle}>Your Profile</Text>
                <Text style={styles.headerSubtitle}>
                  Manage your dietary preferences and scan history
                </Text>
              </View>
            </View>
          </View>

          {/* Scan Statistics */}
          <BlurView intensity={20} tint="light" style={[styles.glassContainer, styles.sectionGlass]}>
            <View style={styles.glassContent}>
            <Text style={styles.sectionTitle}>Scan Statistics</Text>
            <View style={styles.statsContainer}>
              <BlurView intensity={15} tint="light" style={[styles.glassContainer, styles.statCardGlass]}>
                <View style={[styles.glassContent, styles.statCardContent]}>
                  <Text style={styles.statNumber}>{scanStats.totalScans}</Text>
                  <Text style={styles.statLabel}>Total Scans</Text>
                </View>
              </BlurView>
              <BlurView intensity={15} tint="light" style={[styles.glassContainer, styles.statCardGlass]}>
                <View style={[styles.glassContent, styles.statCardContent]}>
                  <Text style={styles.statNumber}>{scanStats.averageSafetyScore}</Text>
                  <Text style={styles.statLabel}>Avg Safety Score</Text>
                </View>
              </BlurView>
              <BlurView intensity={15} tint="light" style={[styles.glassContainer, styles.statCardGlass]}>
                <View style={[styles.glassContent, styles.statCardContent]}>
                  <Text style={styles.statNumber}>{scanStats.completedScans}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
              </BlurView>
            </View>
            </View>
          </BlurView>

          {/* Dietary Preferences */}
          <BlurView intensity={20} tint="light" style={[styles.glassContainer, styles.sectionGlass]}>
            <View style={styles.glassContent}>
            <Text style={styles.sectionTitle}>Dietary Preferences</Text>
            <View style={styles.preferencesContainer}>
              {dietaryPreferences.map((preference) => (
                <BlurView key={preference.id} intensity={15} tint="light" style={[styles.glassContainer, styles.preferenceCardGlass]}>
                  <View style={[styles.glassContent, styles.preferenceCardContent]}>
                    <View style={styles.preferenceInfo}>
                      <Text style={styles.preferenceName}>{preference.label}</Text>
                      <Text style={styles.preferenceDescription}>
                        {preference.description}
                      </Text>
                    </View>
                    <Switch
                      value={preference.isActive}
                      onValueChange={() => togglePreference(preference.id)}
                      trackColor={{ false: '#374151', true: '#10b981' }}
                      thumbColor={preference.isActive ? '#ffffff' : '#9ca3af'}
                    />
                  </View>
                </BlurView>
              ))}
            </View>
            </View>
          </BlurView>

          {/* Profile Actions */}
          <BlurView intensity={20} tint="light" style={[styles.glassContainer, styles.sectionGlass]}>
            <View style={styles.glassContent}>
            <Text style={styles.sectionTitle}>Profile Actions</Text>
            <View style={styles.actionsContainer}>
              <BlurView intensity={15} tint="light" style={[styles.glassContainer, styles.actionButtonGlass]}>
                <TouchableOpacity style={[styles.glassContent, styles.actionButtonContent]} onPress={exportProfile}>
                  <Download size={20} color="#10b981" />
                  <Text style={styles.actionButtonText}>Export Profile</Text>
                </TouchableOpacity>
              </BlurView>
              
              <BlurView intensity={15} tint="light" style={[styles.glassContainer, styles.actionButtonGlass]}>
                <TouchableOpacity style={[styles.glassContent, styles.actionButtonContent]} onPress={clearScanHistory}>
                  <Trash2 size={20} color="#ef4444" />
                  <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>
                    Clear Scan History
                  </Text>
                </TouchableOpacity>
              </BlurView>
            </View>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  section: {
    paddingVertical: 20,
  },
  sectionGlass: {
    marginHorizontal: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  statCardGlass: {
    flex: 1,
    marginHorizontal: 6,
  },
  statCardContent: {
    alignItems: 'center',
    padding: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  preferencesContainer: {
    gap: 12,
  },
  preferenceCard: {
    backgroundColor: 'transparent',
  },
  preferenceCardGlass: {
    marginBottom: 12,
  },
  preferenceCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 16,
  },
  preferenceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: 'transparent',
  },
  actionButtonGlass: {
    marginBottom: 12,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  glassContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  glassContent: {
    padding: 24,
  },
});