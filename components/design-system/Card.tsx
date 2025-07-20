import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Shadows, Spacing } from '../../constants/DesignTokens';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'neumorphic';
  padding?: keyof typeof Spacing;
  style?: ViewStyle;
}

export function Card({ 
  children, 
  variant = 'default', 
  padding = 'lg',
  style 
}: CardProps) {
  const cardStyles = [
    styles.base,
    styles[variant],
    { padding: Spacing[padding] },
    style
  ];

  return (
    <View style={cardStyles}>
      {children}
    </View>
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