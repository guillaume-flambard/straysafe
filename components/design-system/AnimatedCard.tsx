import React, { useRef } from 'react';
import { 
  StyleSheet, 
  ViewStyle, 
  Animated, 
  TouchableWithoutFeedback,
} from 'react-native';
import { Colors, BorderRadius, Shadows, Spacing, Animation } from '../../constants/DesignTokens';

interface AnimatedCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'neumorphic';
  padding?: keyof typeof Spacing;
  style?: ViewStyle;
  onPress?: () => void;
  hapticFeedback?: boolean;
  scaleOnPress?: boolean;
  elevateOnPress?: boolean;
}

export function AnimatedCard({ 
  children, 
  variant = 'default', 
  padding = 'lg',
  style,
  onPress,
  hapticFeedback = true,
  scaleOnPress = true,
  elevateOnPress = true
}: AnimatedCardProps) {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const elevationValue = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    if (onPress) {
      const animations = [];
      
      if (scaleOnPress) {
        animations.push(
          Animated.timing(scaleValue, {
            toValue: 0.98,
            duration: Animation.timing.fast,
            useNativeDriver: true,
          })
        );
      }
      
      if (elevateOnPress) {
        animations.push(
          Animated.timing(elevationValue, {
            toValue: 8,
            duration: Animation.timing.fast,
            useNativeDriver: false,
          })
        );
      }
      
      Animated.parallel(animations).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      const animations = [];
      
      if (scaleOnPress) {
        animations.push(
          Animated.spring(scaleValue, {
            toValue: 1,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
          })
        );
      }
      
      if (elevateOnPress) {
        animations.push(
          Animated.timing(elevationValue, {
            toValue: 0,
            duration: Animation.timing.normal,
            useNativeDriver: false,
          })
        );
      }
      
      Animated.parallel(animations).start();
    }
  };

  const cardStyles = [
    styles.base,
    styles[variant],
    { padding: Spacing[padding] },
    style
  ];

  const animatedStyle = {
    transform: [{ scale: scaleValue }],
  };

  const shadowStyle = elevateOnPress ? {
    elevation: elevationValue,
    shadowOpacity: elevationValue.interpolate({
      inputRange: [0, 8],
      outputRange: [0.1, 0.25],
    }),
    shadowRadius: elevationValue.interpolate({
      inputRange: [0, 8],
      outputRange: [8, 16],
    }),
  } : {};

  if (onPress) {
    return (
      <TouchableWithoutFeedback
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <Animated.View style={[cardStyles, animatedStyle, shadowStyle]}>
          {children}
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }

  return (
    <Animated.View style={[cardStyles, animatedStyle, shadowStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  
  default: {
    backgroundColor: Colors.neutral[0],
    ...Shadows.soft,
  },
  
  glass: {
    backgroundColor: Colors.glass.whiteStrong,
    borderWidth: 1,
    borderColor: Colors.glass.white,
    ...Shadows.soft,
  },
  
  neumorphic: {
    backgroundColor: Colors.neutral[50],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    ...Shadows.medium,
  }
});