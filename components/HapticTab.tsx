import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

export function HapticTab(props: BottomTabBarButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

  const onPressIn = (ev: any) => {
    // Scale down animation for press feedback
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();

    // Ripple effect animation
    Animated.timing(rippleAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    props.onPressIn?.(ev);
  };

  const onPressOut = (ev: any) => {
    // Scale back to normal
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();

    // Reset ripple
    Animated.timing(rippleAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start();

    props.onPressOut?.(ev);
  };

  return (
    <Animated.View style={[
      styles.container,
      {
        transform: [{ scale: scaleAnim }],
      }
    ]}>
      <PlatformPressable
        {...props}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[props.style, styles.pressable]}
      />
      <Animated.View 
        style={[
          styles.ripple,
          {
            opacity: rippleAnim,
            transform: [
              {
                scale: rippleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.2],
                }),
              },
            ],
          }
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  pressable: {
    flex: 1,
  },
  ripple: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 40,
    height: 40,
    marginTop: -20,
    marginLeft: -20,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    pointerEvents: 'none',
  },
});
