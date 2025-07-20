import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  ActivityIndicator 
} from 'react-native';
import { Colors, Typography, BorderRadius, Shadows, Spacing } from '../../constants/DesignTokens';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
  size?: 'small' | 'medium' | 'large' | 'oversized';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle
}: ButtonProps) {
  const isDisabled = disabled || loading;
  
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

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? Colors.neutral[0] : Colors.primary[500]} 
          size="small" 
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
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