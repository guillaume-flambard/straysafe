import React, { useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  SafeAreaView,
} from 'react-native';
import { Colors, BorderRadius, Animation, Spacing } from '../../constants/DesignTokens';

interface SlideInModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  animationType?: 'slide' | 'fade' | 'scale';
  position?: 'bottom' | 'top' | 'center';
  backdropOpacity?: number;
  maxHeight?: number | string;
}

const { height: screenHeight } = Dimensions.get('window');

export function SlideInModal({
  visible,
  onClose,
  children,
  animationType = 'slide',
  position = 'bottom',
  backdropOpacity = 0.5,
  maxHeight = '80%'
}: SlideInModalProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Show animations
      const animations = [
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: Animation.timing.normal,
          useNativeDriver: true,
        }),
      ];

      if (animationType === 'slide') {
        animations.push(
          Animated.spring(slideAnim, {
            toValue: 1,
            tension: 280,
            friction: 20,
            useNativeDriver: true,
          })
        );
      } else if (animationType === 'scale') {
        animations.push(
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 280,
            friction: 20,
            useNativeDriver: true,
          })
        );
      }

      Animated.parallel(animations).start();
    } else {
      // Hide animations
      const animations = [
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: Animation.timing.fast,
          useNativeDriver: true,
        }),
      ];

      if (animationType === 'slide') {
        animations.push(
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: Animation.timing.fast,
            useNativeDriver: true,
          })
        );
      } else if (animationType === 'scale') {
        animations.push(
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: Animation.timing.fast,
            useNativeDriver: true,
          })
        );
      }

      Animated.parallel(animations).start();
    }
  }, [visible, animationType]);

  const getTransform = () => {
    if (animationType === 'scale') {
      return [{ scale: scaleAnim }];
    }

    if (animationType === 'slide') {
      const translateY = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: position === 'bottom' ? [screenHeight, 0] : position === 'top' ? [-screenHeight, 0] : [0, 0],
      });
      return [{ translateY }];
    }

    return [];
  };

  const contentStyle = {
    transform: getTransform(),
    maxHeight: typeof maxHeight === 'string' ? maxHeight : maxHeight,
  };

  const positionStyle = position === 'center' ? styles.centerContainer : 
                      position === 'top' ? styles.topContainer : styles.bottomContainer;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, backdropOpacity],
                }),
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Content */}
        <View style={[styles.container, positionStyle]}>
          <Animated.View style={[styles.content, contentStyle]}>
            <SafeAreaView style={styles.safeArea}>
              {/* Handle bar for bottom sheets */}
              {position === 'bottom' && (
                <View style={styles.handleContainer}>
                  <View style={styles.handle} />
                </View>
              )}
              {children}
            </SafeAreaView>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.neutral[900],
  },
  
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  
  bottomContainer: {
    justifyContent: 'flex-end',
  },
  
  topContainer: {
    justifyContent: 'flex-start',
  },
  
  centerContainer: {
    justifyContent: 'center',
    paddingHorizontal: Spacing.gutter,
  },
  
  content: {
    backgroundColor: Colors.neutral[0],
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    overflow: 'hidden',
  },
  
  safeArea: {
    flex: 1,
  },
  
  handleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.neutral[300],
    borderRadius: BorderRadius.pill,
  },
});