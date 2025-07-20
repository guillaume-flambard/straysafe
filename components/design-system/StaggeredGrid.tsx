import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Animation, Spacing } from '../../constants/DesignTokens';

interface StaggeredGridProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  initialDelay?: number;
  animationType?: 'fadeIn' | 'slideUp' | 'scale';
  style?: any;
}

interface StaggeredItemProps {
  children: React.ReactNode;
  index: number;
  delay: number;
  animationType: 'fadeIn' | 'slideUp' | 'scale';
}

function StaggeredItem({ children, index, delay, animationType }: StaggeredItemProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const animations = [
      Animated.timing(opacity, {
        toValue: 1,
        duration: Animation.timing.normal,
        delay: delay * index,
        useNativeDriver: true,
      }),
    ];

    if (animationType === 'slideUp') {
      animations.push(
        Animated.timing(translateY, {
          toValue: 0,
          duration: Animation.timing.normal,
          delay: delay * index,
          useNativeDriver: true,
        })
      );
    } else if (animationType === 'scale') {
      animations.push(
        Animated.spring(scale, {
          toValue: 1,
          tension: 280,
          friction: 20,
          delay: delay * index,
          useNativeDriver: true,
        })
      );
    }

    Animated.parallel(animations).start();
  }, [index, delay, animationType]);

  const getTransform = () => {
    const transforms = [];
    
    if (animationType === 'slideUp') {
      transforms.push({ translateY });
    }
    
    if (animationType === 'scale') {
      transforms.push({ scale });
    }
    
    return transforms;
  };

  return (
    <Animated.View
      style={{
        opacity,
        transform: getTransform(),
      }}
    >
      {children}
    </Animated.View>
  );
}

export function StaggeredGrid({
  children,
  staggerDelay = 100,
  initialDelay = 0,
  animationType = 'fadeIn',
  style
}: StaggeredGridProps) {
  return (
    <View style={[styles.container, style]}>
      {React.Children.map(children, (child, index) => (
        <StaggeredItem
          key={index}
          index={index}
          delay={staggerDelay + initialDelay}
          animationType={animationType}
        >
          {child}
        </StaggeredItem>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.cardGap,
  },
});