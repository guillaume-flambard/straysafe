import React from 'react';
import { Modal } from 'react-native';
import { YStack, Text, Spinner, View } from 'tamagui';
import { useLoading } from '../contexts/LoadingContext';

export function LoadingOverlay() {
  const { isLoading, loadingMessage } = useLoading();

  if (!isLoading) return null;

  return (
    <Modal
      visible={isLoading}
      transparent={true}
      animationType="fade"
    >
      <View
        flex={1}
        backgroundColor="rgba(0, 0, 0, 0.5)"
        justifyContent="center"
        alignItems="center"
      >
        <YStack
          backgroundColor="rgba(255, 255, 255, 0.95)"
          borderRadius={16}
          padding="$6"
          alignItems="center"
          gap="$4"
          shadowColor="rgba(0, 0, 0, 0.3)"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.3}
          shadowRadius={8}
          elevation={8}
          minWidth={200}
        >
          <Spinner size="large" color="#3b82f6" />
          <Text
            fontSize="$4"
            fontWeight="600"
            color="#1e293b"
            textAlign="center"
          >
            {loadingMessage || 'Loading...'}
          </Text>
        </YStack>
      </View>
    </Modal>
  );
}