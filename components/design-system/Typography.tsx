import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { Colors, Typography as TypographyTokens } from '../../constants/DesignTokens';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'display-large' | 'display-medium' | 'display-small' | 'h1' | 'h2' | 'h3' | 'body-large' | 'body-medium' | 'body-small' | 'caption';
  color?: 'primary' | 'secondary' | 'muted' | 'white' | 'brand';
  align?: 'left' | 'center' | 'right';
  style?: TextStyle;
  numberOfLines?: number;
}

export function Typography({
  children,
  variant = 'body-medium',
  color = 'primary',
  align = 'left',
  style,
  numberOfLines
}: TypographyProps) {
  const textStyles = [
    styles.base,
    styles[variant],
    styles[`${color}Color`],
    { textAlign: align },
    style
  ];

  return (
    <Text 
      style={textStyles} 
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
  
  // Display styles for exaggerated minimalism
  'display-large': {
    ...TypographyTokens.display.large,
  },
  
  'display-medium': {
    ...TypographyTokens.display.medium,
  },
  
  'display-small': {
    ...TypographyTokens.display.small,
  },
  
  // Heading styles
  h1: {
    ...TypographyTokens.heading.h1,
  },
  
  h2: {
    ...TypographyTokens.heading.h2,
  },
  
  h3: {
    ...TypographyTokens.heading.h3,
  },
  
  // Body styles
  'body-large': {
    ...TypographyTokens.body.large,
  },
  
  'body-medium': {
    ...TypographyTokens.body.medium,
  },
  
  'body-small': {
    ...TypographyTokens.body.small,
  },
  
  // Caption style
  caption: {
    ...TypographyTokens.caption,
  },
  
  // Color variants
  primaryColor: {
    color: Colors.neutral[800],
  },
  
  secondaryColor: {
    color: Colors.neutral[600],
  },
  
  mutedColor: {
    color: Colors.neutral[500],
  },
  
  whiteColor: {
    color: Colors.neutral[0],
  },
  
  brandColor: {
    color: Colors.primary[500],
  },
});