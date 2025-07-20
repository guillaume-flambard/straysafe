import { StyleSheet, View } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

// Enhanced tab bar background for Android and web with glassmorphism effect
export default function TabBarBackground() {
  const colorScheme = useColorScheme();
  
  return (
    <View style={[
      styles.container,
      {
        backgroundColor: colorScheme === 'dark' 
          ? 'rgba(28, 28, 30, 0.85)' 
          : 'rgba(255, 255, 255, 0.85)',
        borderTopColor: colorScheme === 'dark'
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.1)',
      }
    ]} />
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 0.5,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowRadius: 8,
    shadowOpacity: 0.15,
    elevation: 8,
  },
});

export function useBottomTabOverflow() {
  return 0;
}
