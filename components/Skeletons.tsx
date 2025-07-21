import React from 'react';
import { View, XStack, YStack, Card } from 'tamagui';

// Composant de base pour les animations de skeleton
export function SkeletonBox({ width, height, borderRadius }: { width?: number | string; height?: number | string; borderRadius?: number }) {
  return (
    <View
      width={width || '100%'}
      height={height || 20}
      backgroundColor="#f3f4f6"
      borderRadius={borderRadius || 4}
      animation="bouncy"
      animateOnly={['opacity']}
      opacity={0.6}
      style={{
        animationDuration: '1.5s',
        animationIterationCount: 'infinite',
        animationDirection: 'alternate',
      }}
    />
  );
}

// Skeleton pour la liste des chiens (mode list)
export function DogListSkeleton() {
  return (
    <YStack gap="$3" padding="$4">
      {[...Array(5)].map((_, index) => (
        <Card
          key={index}
          elevate
          size="$4"
          bordered
          backgroundColor="rgba(255, 255, 255, 0.95)"
          borderColor="rgba(203, 213, 225, 0.6)"
          padding="$4"
          borderRadius={12}
        >
          <XStack alignItems="center" gap="$3">
            {/* Avatar skeleton */}
            <SkeletonBox width={60} height={60} borderRadius={30} />
            
            {/* Content skeleton */}
            <YStack flex={1} gap="$2">
              <SkeletonBox width="70%" height={24} />
              <SkeletonBox width="50%" height={16} />
              <XStack gap="$2">
                <SkeletonBox width={60} height={20} borderRadius={10} />
                <SkeletonBox width={60} height={20} borderRadius={10} />
              </XStack>
            </YStack>
            
            {/* Status skeleton */}
            <SkeletonBox width={80} height={28} borderRadius={14} />
          </XStack>
        </Card>
      ))}
    </YStack>
  );
}

// Skeleton pour la grille des chiens (mode grid)
export function DogGridSkeleton() {
  return (
    <XStack flexWrap="wrap" justifyContent="space-between" padding="$4" gap="$3">
      {[...Array(6)].map((_, index) => (
        <Card
          key={index}
          elevate
          size="$4"
          bordered
          backgroundColor="rgba(255, 255, 255, 0.95)"
          borderColor="rgba(203, 213, 225, 0.6)"
          padding="$4"
          borderRadius={12}
          width="48%"
        >
          <YStack gap="$3">
            {/* Photo skeleton */}
            <SkeletonBox width="100%" height={120} borderRadius={8} />
            
            {/* Info skeleton */}
            <YStack gap="$2">
              <SkeletonBox width="80%" height={20} />
              <SkeletonBox width="60%" height={16} />
              <XStack gap="$1">
                <SkeletonBox width={40} height={16} borderRadius={8} />
                <SkeletonBox width={40} height={16} borderRadius={8} />
              </XStack>
            </YStack>
          </YStack>
        </Card>
      ))}
    </XStack>
  );
}

// Skeleton pour le profil d'un chien
export function DogProfileSkeleton() {
  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header skeleton */}
      <YStack
        paddingHorizontal="$6"
        paddingVertical="$4"
        paddingTop="$12"
        backgroundColor="$backgroundStrong"
        gap="$4"
      >
        <XStack alignItems="center" gap="$3">
          <SkeletonBox width={40} height={40} borderRadius={8} />
          <SkeletonBox width="60%" height={28} />
        </XStack>
      </YStack>

      {/* Content skeleton */}
      <YStack padding="$4" gap="$4">
        {/* Photo section */}
        <Card padding="$5" borderRadius={12}>
          <YStack alignItems="center" gap="$3">
            <SkeletonBox width={200} height={200} borderRadius={12} />
            <SkeletonBox width="50%" height={20} />
          </YStack>
        </Card>

        {/* Info sections */}
        {[...Array(3)].map((_, index) => (
          <Card key={index} padding="$5" borderRadius={12}>
            <YStack gap="$3">
              <XStack alignItems="center" gap="$3">
                <SkeletonBox width={24} height={24} borderRadius={8} />
                <SkeletonBox width="40%" height={20} />
              </XStack>
              <YStack gap="$2">
                <SkeletonBox width="100%" height={16} />
                <SkeletonBox width="80%" height={16} />
                <SkeletonBox width="60%" height={16} />
              </YStack>
            </YStack>
          </Card>
        ))}
      </YStack>
    </YStack>
  );
}

// Skeleton pour la liste des utilisateurs
export function UserListSkeleton() {
  return (
    <YStack gap="$3" padding="$4">
      {[...Array(4)].map((_, index) => (
        <Card
          key={index}
          elevate
          size="$4"
          bordered
          backgroundColor="rgba(255, 255, 255, 0.95)"
          borderColor="rgba(203, 213, 225, 0.6)"
          padding="$4"
          borderRadius={12}
        >
          <XStack alignItems="center" gap="$3">
            <SkeletonBox width={50} height={50} borderRadius={25} />
            <YStack flex={1} gap="$2">
              <SkeletonBox width="70%" height={20} />
              <SkeletonBox width="50%" height={16} />
              <SkeletonBox width={80} height={20} borderRadius={10} />
            </YStack>
          </XStack>
        </Card>
      ))}
    </YStack>
  );
}

// Skeleton générique pour les formulaires
export function FormSkeleton() {
  return (
    <YStack gap="$4" padding="$4">
      {[...Array(4)].map((_, index) => (
        <Card key={index} padding="$5" borderRadius={12}>
          <YStack gap="$3">
            <XStack alignItems="center" gap="$3">
              <SkeletonBox width={24} height={24} borderRadius={8} />
              <SkeletonBox width="40%" height={20} />
            </XStack>
            <YStack gap="$2">
              <SkeletonBox width="30%" height={16} />
              <SkeletonBox width="100%" height={40} borderRadius={8} />
            </YStack>
          </YStack>
        </Card>
      ))}
      <SkeletonBox width="100%" height={50} borderRadius={12} />
    </YStack>
  );
}