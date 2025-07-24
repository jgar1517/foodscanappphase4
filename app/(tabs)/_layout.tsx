import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { View } from 'react-native';
import { Camera, House, Search, User } from 'lucide-react-native';

export default function TabLayout() {
  const TabIcon = ({ IconComponent, size, color, focused }: {
    IconComponent: any;
    size: number;
    color: string;
    focused: boolean;
  }) => (
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: focused ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
        borderWidth: focused ? 1 : 0,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <IconComponent size={size} color={color} />
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'transparent',
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
          position: 'absolute',
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint="light"
            style={{ flex: 1 }}
          />
        ),
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color, focused }) => (
            <TabIcon IconComponent={House} size={size} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ size, color, focused }) => (
            <TabIcon IconComponent={Camera} size={size} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: 'Results',
          tabBarIcon: ({ size, color, focused }) => (
            <TabIcon IconComponent={Search} size={size} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color, focused }) => (
            <TabIcon IconComponent={User} size={size} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}