import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Generate random star positions
const generateStars = (count: number) => {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      left: Math.random() * width,
      top: Math.random() * height,
      size: Math.random() * 3 + 1, // Size between 1-4
      opacity: Math.random() * 0.8 + 0.2, // Opacity between 0.2-1
    });
  }
  return stars;
};

const stars = generateStars(150);

export default function StarBackground({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e1b4b', '#312e81', '#4c1d95', '#581c87']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Stars Layer */}
        <View style={styles.starsContainer}>
          {stars.map((star) => (
            <View
              key={star.id}
              style={[
                styles.star,
                {
                  left: star.left,
                  top: star.top,
                  width: star.size,
                  height: star.size,
                  opacity: star.opacity,
                },
              ]}
            />
          ))}
        </View>
        
        {/* Twinkling Stars Layer */}
        <View style={styles.twinkleContainer}>
          {stars.slice(0, 30).map((star) => (
            <View
              key={`twinkle-${star.id}`}
              style={[
                styles.twinkleStar,
                {
                  left: star.left,
                  top: star.top,
                },
              ]}
            />
          ))}
        </View>
        
        {/* Content */}
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    position: 'relative',
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 50,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  twinkleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  twinkleStar: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: '#fbbf24',
    borderRadius: 3,
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 8,
  },
});