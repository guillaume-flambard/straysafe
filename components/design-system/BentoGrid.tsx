import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Spacing } from '../../constants/DesignTokens';

interface BentoGridProps {
  children: React.ReactNode[];
  style?: any;
}

interface BentoItemProps {
  children: React.ReactNode;
  span?: 1 | 2; // How many columns to span
  aspectRatio?: number;
  style?: any;
}

const { width: screenWidth } = Dimensions.get('window');

export function BentoGrid({ 
  children, 
  style 
}: BentoGridProps) {
  return (
    <View style={[styles.grid, style]}>
      {children}
    </View>
  );
}

export function BentoItem({ 
  children, 
  span = 1, 
  aspectRatio = 1,
  style 
}: BentoItemProps) {
  const gap = Spacing.cardGap;
  const containerPadding = Spacing.gutter * 2;
  const availableWidth = screenWidth - containerPadding;
  
  // Simplified width calculation
  const calculatedWidth = span === 2 
    ? availableWidth 
    : (availableWidth - gap) / 2;
  
  const itemHeight = calculatedWidth / aspectRatio;

  return (
    <View 
      style={[
        styles.item,
        span === 2 ? styles.fullWidth : styles.halfWidth,
        {
          height: itemHeight,
          marginBottom: gap,
        },
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  
  item: {
    overflow: 'hidden',
  },
  
  fullWidth: {
    width: '100%',
  },
  
  halfWidth: {
    width: '48%', // Slightly less than 50% to account for gap
  },
});