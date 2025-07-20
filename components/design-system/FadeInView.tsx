import React, { useRef, useEffect } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { Animation } from '../../constants/DesignTokens';

interface FadeInViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
  slideFromBottom?: boolean;
  slideDistance?: number;
}

export function FadeInView({
  children,
  duration = Animation.timing.normal,
  delay = 0,
  style,
  slideFromBottom = false,
  slideDistance = 20
}: FadeInViewProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(slideFromBottom ? slideDistance : 0)).current;

  useEffect(() => {
    const animations = [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      })
    ];

    if (slideFromBottom) {
      animations.push(
        Animated.timing(slideAnim, {
          toValue: 0,
          duration,
          delay,
          useNativeDriver: true,
        })
      );
    }

    Animated.parallel(animations).start();
  }, [fadeAnim, slideAnim, duration, delay, slideFromBottom]);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: slideFromBottom ? [{ translateY: slideAnim }] : [],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}