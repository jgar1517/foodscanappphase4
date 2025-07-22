import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Heart, Shield, Star, FileText, CircleHelp as HelpCircle, ChevronRight, Zap, Calendar, ChartBar as BarChart3, Plus, X } from 'lucide-react-native';
import DietaryProfileService, { DietaryPreference, CustomIngredientAvoidance } from '@/services/dietaryProfileService';

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreference[]>([]);
  const [customAvoidances, setCustomAvoidances] = useState<CustomIngredientAvoidance[]>([]);
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientReason, setNewIngredientReason] = useState('');
  const [loading, setLoading] = useState(true);

  // Load dietary profile when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      loadDietaryProfile();
    }, [])
  );

  const loadDietaryProfile = async () => {
    try {
      setLoading(true);
      const profile = await DietaryProfileService.getDietaryProfile();
      setDietaryPreferences(profile.preferences);
      setCustomAvoidances(profile.customAvoidances);
    } catch (error) {
      console.error('Failed to load dietary profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDietaryPreference = (id: string) => {
    const updatedPreferences = dietaryPreferences.map(item =>
      item.id === id ? { ...item, isActive: !item.isActive } : item
    );
    setDietaryPreferences(updatedPreferences);
    
    // Save to storage
    DietaryProfileService.updateDietaryPreferences(updatedPreferences);
  };

  const addCustomIngredient = async () => {
    if (!newIngredientName.trim()) {
      Alert.alert('Error', 'Please enter an ingredient name');
      return;
    }

    try {
      await DietaryProfileService.addCustomAvoidance(
        newIngredientName.trim(),
        newIngredientReason.trim() || 'Personal preference',
        'avoid'
      );
      
      // Reload profile
      await loadDietaryProfile();
      
      // Reset form
      setNewIngredientName('');
      setNewIngredientReason('');
      setShowAddIngredient(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add custom ingredient');
    }
  };

  const removeCustomIngredient = async (avoidanceId: string) => {
    try {
      await DietaryProfileService.removeCustomAvoidance(avoidanceId);
      await loadDietaryProfile();
    } catch (error) {
      Alert.alert('Error', 'Failed to remove custom ingredient');
    }
  };

  const MenuSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.menuSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const MenuItem = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement 
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity 
      style={styles.menuItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.menuItemIcon}>
          <Icon size={20} color="#10b981" />
        </View>
        <View style={styles.menuItemContent}>
          <Text style={styles.menuItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || <ChevronRight size={16} color="#9ca3af" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* App Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings & Preferences</Text>
          <Text style={styles.headerSubtitle}>
            Customize your food safety scanning experience
          </Text>
        </View>

        {/* Dietary Preferences */}
        <MenuSection title="Dietary Preferences">
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading preferences...</Text>
            </View>
          ) : (
            <>
          <View style={styles.dietaryGrid}>
            {dietaryPreferences.map((preference) => (
              <TouchableOpacity
                key={preference.id}
                style={[
                  styles.dietaryChip,
                  preference.isActive && styles.dietaryChipActive,
                ]}
                onPress={() => toggleDietaryPreference(preference.id)}
              >
                <Text
                  style={[
                    styles.dietaryChipText,
                    preference.isActive && styles.dietaryChipTextActive,
                  ]}
                >
                  {preference.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.customAvoidances}>
            <Text style={styles.customAvoidancesTitle}>Custom Ingredients to Avoid:</Text>
            {customAvoidances.map((avoidance) => (
              <View key={avoidance.id} style={styles.avoidanceItem}>
                <View style={styles.avoidanceContent}>
                  <Text style={styles.avoidanceText}>• {avoidance.ingredientName}</Text>
                  {avoidance.reason && (
                    <Text style={styles.avoidanceReason}>({avoidance.reason})</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeCustomIngredient(avoidance.id)}
                >
                  <X size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
            
            {showAddIngredient ? (
              <View style={styles.addIngredientForm}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ingredient name"
                  value={newIngredientName}
                  onChangeText={setNewIngredientName}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Reason (optional)"
                  value={newIngredientReason}
                  onChangeText={setNewIngredientReason}
                />
                <View style={styles.formButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowAddIngredient(false);
                      setNewIngredientName('');
                      setNewIngredientReason('');
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={addCustomIngredient}
                  >
                    <Text style={styles.saveButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addAvoidanceButton}
                onPress={() => setShowAddIngredient(true)}
              >
                <Plus size={16} color="#10b981" />
                <Text style={styles.addAvoidanceText}>Add Custom Ingredient</Text>
              </TouchableOpacity>
            )}
          </View>
            </>
            )}
        </MenuSection>

        {/* Account Settings */}
        <MenuSection title="Account">
          <MenuItem
            icon={Settings}
            title="Notifications"
            subtitle="Push notifications and alerts"
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#e5e7eb', true: '#10b981' }}
                thumbColor={notificationsEnabled ? '#ffffff' : '#f3f4f6'}
              />
            }
          />
          <MenuItem
            icon={Settings}
            title="Dark Mode"
            subtitle="Toggle app appearance"
            rightElement={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#e5e7eb', true: '#10b981' }}
                thumbColor={darkMode ? '#ffffff' : '#f3f4f6'}
              />
            }
          />
        </MenuSection>

        {/* Health & Safety */}
        <MenuSection title="Health & Safety">
          <MenuItem
            icon={Heart}
            title="Health Goals"
            subtitle="Set your wellness objectives"
            onPress={() => {}}
          />
          <MenuItem
            icon={BarChart3}
            title="Safety Analytics"
            subtitle="View your dietary safety trends"
            onPress={() => {}}
          />
          <MenuItem
            icon={Shield}
            title="Data Privacy"
            subtitle="Manage your data and privacy settings"
            onPress={() => {}}
          />
        </MenuSection>

        {/* Support */}
        <MenuSection title="Support">
          <MenuItem
            icon={HelpCircle}
            title="Help Center"
            subtitle="Get answers to common questions"
            onPress={() => {}}
          />
          <MenuItem
            icon={FileText}
            title="Send Feedback"
            subtitle="Help us improve the app"
            onPress={() => {}}
          />
          <MenuItem
            icon={Star}
            title="Rate the App"
            subtitle="Share your experience"
            onPress={() => {}}
          />
        </MenuSection>

        {/* Legal */}
        <MenuSection title="Legal">
          <MenuItem
            icon={FileText}
            title="Terms of Service"
            subtitle="View our terms and conditions"
            onPress={() => {}}
          />
          <MenuItem
            icon={FileText}
            title="Privacy Policy"
            subtitle="How we handle your data"
            onPress={() => {}}
          />
        </MenuSection>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>
            Food Safety Scanner v1.0.0
          </Text>
        </View>
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
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  menuSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  dietaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  dietaryChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dietaryChipActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  dietaryChipText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  dietaryChipTextActive: {
    color: '#ffffff',
  },
  customAvoidances: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  customAvoidancesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  avoidanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingVertical: 4,
  },
  avoidanceContent: {
    flex: 1,
  },
  avoidanceText: {
    fontSize: 14,
    color: '#6b7280',
  },
  avoidanceReason: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 8,
  },
  removeButton: {
    padding: 4,
  },
  addAvoidanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  addAvoidanceText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  addIngredientForm: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 8,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  appInfoText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});