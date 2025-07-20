import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Spacing, Layout } from '../../constants/DesignTokens';

interface BentoGridProps {
  children: React.ReactNode[];
  columns?: number;
  gap?: number;
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
  columns = 2, 
  gap = Spacing.cardGap,
  style 
}: BentoGridProps) {
  return (
    <View style={[styles.grid, { gap }, style]}>
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
  const containerPadding = Layout.container.padding * 2;
  const totalGap = Spacing.cardGap * (Layout.bentoGrid.columns - 1);
  const availableWidth = screenWidth - containerPadding - totalGap;
  
  const itemWidth = span === 2 
    ? availableWidth 
    : (availableWidth / Layout.bentoGrid.columns);
  
  const itemHeight = itemWidth / aspectRatio;

  return (
    <View 
      style={[
        styles.item,
        {
          width: itemWidth,
          height: itemHeight,
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
  },
  
  item: {
    overflow: 'hidden',
  },
});