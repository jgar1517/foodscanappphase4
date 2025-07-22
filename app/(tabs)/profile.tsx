import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Heart, Shield, Star, FileText, CircleHelp as HelpCircle, ChevronRight, Zap, Calendar, ChartBar as BarChart3 } from 'lucide-react-native';

const dietaryOptions = [
  { id: 'gluten-free', label: 'Gluten-Free', active: true },
  { id: 'vegan', label: 'Vegan', active: false },
  { id: 'vegetarian', label: 'Vegetarian', active: false },
  { id: 'diabetic', label: 'Diabetic-Friendly', active: true },
  { id: 'keto', label: 'Keto', active: false },
  { id: 'paleo', label: 'Paleo', active: false },
  { id: 'low-sodium', label: 'Low Sodium', active: false },
  { id: 'dairy-free', label: 'Dairy-Free', active: false },
];

const customAvoidances = [
  'Artificial colors',
  'High fructose corn syrup',
  'Sodium benzoate',
];

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [dietaryPreferences, setDietaryPreferences] = useState(dietaryOptions);

  const toggleDietaryPreference = (id: string) => {
    setDietaryPreferences(prev =>
      prev.map(item =>
        item.id === id ? { ...item, active: !item.active } : item
      )
    );
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
          <View style={styles.dietaryGrid}>
            {dietaryPreferences.map((preference) => (
              <TouchableOpacity
                key={preference.id}
                style={[
                  styles.dietaryChip,
                  preference.active && styles.dietaryChipActive,
                ]}
                onPress={() => toggleDietaryPreference(preference.id)}
              >
                <Text
                  style={[
                    styles.dietaryChipText,
                    preference.active && styles.dietaryChipTextActive,
                  ]}
                >
                  {preference.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.customAvoidances}>
            <Text style={styles.customAvoidancesTitle}>Custom Ingredients to Avoid:</Text>
            {customAvoidances.map((item, index) => (
              <View key={index} style={styles.avoidanceItem}>
                <Text style={styles.avoidanceText}>• {item}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.addAvoidanceButton}>
              <Text style={styles.addAvoidanceText}>+ Add Custom Ingredient</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: 4,
  },
  avoidanceText: {
    fontSize: 14,
    color: '#6b7280',
  },
  addAvoidanceButton: {
    marginTop: 8,
  },
  addAvoidanceText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
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