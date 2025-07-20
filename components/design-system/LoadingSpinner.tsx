import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/DesignTokens';
import { Typography } from './Typography';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
  overlay?: boolean;
}

export function LoadingSpinner({
  size = 'medium',
  color = Colors.primary[500],
  message,
  overlay = false
}: LoadingSpinnerProps) {
  const fadeValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const containerStyle = overlay ? [styles.container, styles.overlay] : styles.container;

  return (
    <Animated.View style={[containerStyle, { opacity: fadeValue }]}>
      <ActivityIndicator size={size} color={color} />
      
      {message && (
        <Typography 
          variant="body-medium" 
          color="secondary" 
          align="center"
          style={styles.message}
        >
          {message}
        </Typography>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.glass.whiteStrong,
    zIndex: 1000,
  },
  
  message: {
    marginTop: 16,
  },
});