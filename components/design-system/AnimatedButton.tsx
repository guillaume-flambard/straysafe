import React, { useRef } from 'react';
import { 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  ActivityIndicator,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, BorderRadius, Shadows, Spacing, Animation } from '../../constants/DesignTokens';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
  size?: 'small' | 'medium' | 'large' | 'oversized';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  hapticFeedback?: boolean;
  bounceEffect?: boolean;
  pulseEffect?: boolean;
}

export function AnimatedButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  hapticFeedback = true,
  bounceEffect = true,
  pulseEffect = false
}: AnimatedButtonProps) {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const shadowValue = useRef(new Animated.Value(1)).current;
  
  const isDisabled = disabled || loading;

  // Pulse animation for primary buttons
  React.useEffect(() => {
    if (pulseEffect && variant === 'primary' && !isDisabled) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [pulseEffect, variant, isDisabled]);

  const handlePressIn = () => {
    if (!isDisabled) {
      if (hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      const animations = [];
      
      if (bounceEffect) {
        animations.push(
          Animated.timing(scaleValue, {
            toValue: 0.95,
            duration: Animation.timing.fast,
            useNativeDriver: true,
          })
        );
      }
      
      // Enhanced shadow on press for elevated buttons
      if (variant === 'primary' || variant === 'secondary') {
        animations.push(
          Animated.timing(shadowValue, {
            toValue: 1.5,
            duration: Animation.timing.fast,
            useNativeDriver: false,
          })
        );
      }
      
      Animated.parallel(animations).start();
    }
  };

  const handlePressOut = () => {
    if (!isDisabled) {
      const animations = [];
      
      if (bounceEffect) {
        animations.push(
          Animated.spring(scaleValue, {
            toValue: 1,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
          })
        );
      }
      
      if (variant === 'primary' || variant === 'secondary') {
        animations.push(
          Animated.timing(shadowValue, {
            toValue: 1,
            duration: Animation.timing.normal,
            useNativeDriver: false,
          })
        );
      }
      
      Animated.parallel(animations).start();
    }
  };

  const handlePress = () => {
    if (!isDisabled) {
      if (hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      onPress();
    }
  };

  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[`${size}Size`],
    isDisabled && styles.disabled,
    style
  ];
  
  const textStyles = [
    styles.baseText,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    isDisabled && styles.disabledText,
    textStyle
  ];

  const animatedStyle = {
    transform: [
      { scale: Animated.multiply(scaleValue, pulseValue) }
    ],
  };

  const shadowStyle = (variant === 'primary' || variant === 'secondary') ? {
    shadowOpacity: shadowValue.interpolate({
      inputRange: [1, 1.5],
      outputRange: [0.3, 0.5],
    }),
    shadowRadius: shadowValue.interpolate({
      inputRange: [1, 1.5],
      outputRange: [12, 20],
    }),
    elevation: shadowValue.interpolate({
      inputRange: [1, 1.5],
      outputRange: [5, 8],
    }),
  } : {};

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={isDisabled}
    >
      <Animated.View style={[buttonStyles, animatedStyle, shadowStyle]}>
        {loading ? (
          <ActivityIndicator 
            color={variant === 'primary' ? Colors.neutral[0] : Colors.primary[500]} 
            size="small" 
          />
        ) : (
          <Text style={textStyles}>{title}</Text>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.pill,
    flexDirection: 'row',
  },
  
  // Variants
  primary: {
    backgroundColor: Colors.primary[500],
    ...Shadows.brand,
  },
  
  secondary: {
    backgroundColor: Colors.neutral[100],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    ...Shadows.soft,
  },
  
  ghost: {
    backgroundColor: 'transparent',
  },
  
  glass: {
    backgroundColor: Colors.glass.whiteStrong,
    borderWidth: 1,
    borderColor: Colors.glass.white,
    ...Shadows.soft,
  },
  
  // Sizes - Exaggerated for minimalism
  smallSize: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 36,
  },
  
  mediumSize: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 48,
  },
  
  largeSize: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    minHeight: 56,
  },
  
  // Oversized buttons for key actions
  oversizedSize: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.xl,
    minHeight: 72,
  },
  
  // Disabled state
  disabled: {
    backgroundColor: Colors.neutral[300],
    shadowOpacity: 0,
    elevation: 0,
  },
  
  // Text styles
  baseText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  
  primaryText: {
    color: Colors.neutral[0],
  },
  
  secondaryText: {
    color: Colors.neutral[700],
  },
  
  ghostText: {
    color: Colors.primary[500],
  },
  
  glassText: {
    color: Colors.neutral[800],
  },
  
  smallText: {
    ...Typography.body.small,
    fontWeight: '600',
  },
  
  mediumText: {
    ...Typography.body.medium,
    fontWeight: '600',
  },
  
  largeText: {
    ...Typography.body.large,
    fontWeight: '700',
  },
  
  oversizedText: {
    ...Typography.heading.h2,
    fontWeight: '700',
  },
  
  disabledText: {
    color: Colors.neutral[500],
  },
});