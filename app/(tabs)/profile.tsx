import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, Heart, Shield, Star, FileText, CircleHelp as HelpCircle, LogOut, ChevronRight, Crown, Zap, Calendar, ChartBar as BarChart3 } from 'lucide-react-native';
import StarBackground from '@/components/StarBackground';

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

const userStats = {
  totalScans: 127,
  scansThisWeek: 8,
  safetyScore: 85,
  memberSince: 'January 2025',
};

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
    <StarBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=300' }}
                style={styles.profileImage}
              />
              <TouchableOpacity style={styles.editImageButton}>
                <Settings size={16} color="#1f2937" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Sarah Johnson</Text>
              <Text style={styles.profileEmail}>sarah.johnson@email.com</Text>
              <View style={styles.membershipBadge}>
                <Star size={14} color="#f59e0b" fill="#f59e0b" />
                <Text style={styles.membershipText}>Free Member</Text>
              </View>
            </View>
          </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Zap size={20} color="#10b981" />
              </View>
              <Text style={styles.statValue}>{userStats.totalScans}</Text>
              <Text style={styles.statLabel}>Total Scans</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Calendar size={20} color="#3b82f6" />
              </View>
              <Text style={styles.statValue}>{userStats.scansThisWeek}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Shield size={20} color="#f59e0b" />
              </View>
              <Text style={styles.statValue}>{userStats.safetyScore}</Text>
              <Text style={styles.statLabel}>Safety Score</Text>
            </View>
          </View>
        </View>

        {/* Upgrade Banner */}
        <View style={styles.upgradeCard}>
          <View style={styles.upgradeIcon}>
            <Crown size={24} color="#fbbf24" />
          </View>
          <View style={styles.upgradeContent}>
            <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
            <Text style={styles.upgradeDescription}>
              Get unlimited scans, advanced analytics, and priority support
            </Text>
          </View>
          <TouchableOpacity style={styles.upgradeButton}>
            <Text style={styles.upgradeButtonText}>Upgrade</Text>
          </TouchableOpacity>
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
            icon={User}
            title="Edit Profile"
            subtitle="Update your personal information"
            onPress={() => {}}
          />
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

        {/* Logout */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton}>
            <LogOut size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>
            Food Safety Scanner v1.0.0
          </Text>
          <Text style={styles.appInfoText}>
            Member since {userStats.memberSince}
          </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </StarBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fbbf24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  membershipText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
  },
  statsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  upgradeIcon: {
    marginRight: 12,
  },
  upgradeContent: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  upgradeDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  upgradeButton: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  menuSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    paddingHorizontal: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
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
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
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
    color: '#ffffff',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  dietaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  dietaryChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dietaryChipActive: {
    backgroundColor: '#fbbf24',
    borderColor: '#fbbf24',
  },
  dietaryChipText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  dietaryChipTextActive: {
    color: '#1f2937',
  },
  customAvoidances: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  customAvoidancesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  avoidanceItem: {
    marginBottom: 4,
  },
  avoidanceText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  addAvoidanceButton: {
    marginTop: 8,
  },
  addAvoidanceText: {
    fontSize: 14,
    color: '#fbbf24',
    fontWeight: '600',
  },
  logoutContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  appInfoText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
});