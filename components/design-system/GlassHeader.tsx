import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from './Typography';
import { Colors, Spacing, BorderRadius } from '../../constants/DesignTokens';
import { useColorScheme } from '@/hooks/useColorScheme';

interface GlassHeaderProps {
  title: string;
  rightAction?: React.ReactNode;
  leftAction?: React.ReactNode;
  scrollY?: Animated.Value;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export function GlassHeader({
  title,
  rightAction,
  leftAction,
  scrollY,
  showBackButton = false,
  onBackPress,
}: GlassHeaderProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const headerHeight = useRef(new Animated.Value(1)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;

  // Scroll-based animations
  useEffect(() => {
    if (scrollY) {
      const listener = scrollY.addListener(({ value }) => {
        // Collapse header when scrolling down
        const collapseThreshold = 50;
        const progress = Math.min(value / collapseThreshold, 1);
        
        headerHeight.setValue(1 - progress * 0.3); // Shrink by 30%
        headerOpacity.setValue(1 - progress * 0.2); // Fade by 20%
      });

      return () => scrollY.removeListener(listener);
    }
  }, [scrollY, headerHeight, headerOpacity]);

  const isDark = colorScheme === 'dark';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          transform: [{ scale: headerHeight }],
          opacity: headerOpacity,
        },
      ]}
    >
      {Platform.OS === 'ios' ? (
        <BlurView
          tint={isDark ? 'dark' : 'light'}
          intensity={85}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: isDark
                ? 'rgba(28, 28, 30, 0.85)'
                : 'rgba(255, 255, 255, 0.85)',
            },
          ]}
        />
      )}
      
      {/* Shadow overlay */}
      <View
        style={[
          styles.shadowOverlay,
          {
            shadowColor: isDark ? '#000' : '#000',
            shadowOpacity: isDark ? 0.3 : 0.12,
          },
        ]}
      />

      <View style={styles.content}>
        {/* Left side */}
        <View style={styles.leftSection}>
          {leftAction || (showBackButton && (
            <Typography 
              variant="h2" 
              color="primary" 
              onPress={onBackPress}
              style={styles.backButton}
            >
              ←
            </Typography>
          ))}
        </View>

        {/* Center title */}
        <View style={styles.titleSection}>
          <Typography 
            variant="display-small" 
            color="primary" 
            numberOfLines={1}
            style={styles.title}
          >
            {title}
          </Typography>
        </View>

        {/* Right side */}
        <View style={styles.rightSection}>
          {rightAction}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    overflow: 'hidden',
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
  },
  shadowOverlay: {
    position: 'absolute',
    bottom: -10,
    left: 0,
    right: 0,
    height: 20,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.gutter,
    paddingVertical: Spacing.lg,
    minHeight: 60,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  titleSection: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  backButton: {
    padding: Spacing.sm,
    marginLeft: -Spacing.sm,
  },
});