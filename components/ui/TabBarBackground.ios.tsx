import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function BlurTabBarBackground() {
  const colorScheme = useColorScheme();
  
  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView
        // Enhanced glassmorphism effect with liquid glass aesthetic
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        intensity={80}
        style={[
          StyleSheet.absoluteFill,
          styles.glassContainer
        ]}
      />
      <View style={[
        styles.shadowLayer,
        {
          shadowColor: colorScheme === 'dark' ? '#000' : '#000',
          shadowOpacity: colorScheme === 'dark' ? 0.5 : 0.15,
        }
      ]} />
    </View>
  );
}

const styles = StyleSheet.create({
  glassContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  shadowLayer: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    height: 20,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowRadius: 8,
    elevation: 8,
  },
});

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
