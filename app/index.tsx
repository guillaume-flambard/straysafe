import React, { useEffect } from 'react'
import { YStack, Spinner, Text } from 'tamagui'
import { router } from 'expo-router'
import { useAuth } from '../contexts/AuthContext'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function IndexScreen() {
  const { session, loading } = useAuth()

  useEffect(() => {
    const checkInitialRoute = async () => {
      try {
        // Check if user has selected a rescue zone
        const selectedZone = await AsyncStorage.getItem('selected_rescue_zone')
        
        if (!selectedZone) {
          // No zone selected, go to location selection
          router.replace('/location-selection')
          return
        }

        // Zone is selected, check auth status
        if (session) {
          // User is authenticated, go to main app
          router.replace('/(tabs)')
        } else {
          // User not authenticated, go to login
          router.replace('/(auth)/login')
        }
      } catch (error) {
        console.error('Error checking initial route:', error)
        // Fallback to location selection
        router.replace('/location-selection')
      }
    }

    // Only proceed when auth loading is complete
    if (!loading) {
      checkInitialRoute()
    }
  }, [session, loading])

  return (
    <YStack 
      flex={1} 
      backgroundColor="$background" 
      justifyContent="center" 
      alignItems="center"
      gap="$4"
    >
      <Spinner size="large" color="#3b82f6" />
      <Text fontSize="$4" color="$color10">
        Loading StraySafe...
      </Text>
    </YStack>
  )
}