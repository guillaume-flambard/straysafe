import React, { useState, useEffect } from 'react'
import { Alert, Image } from 'react-native'
import {
  YStack,
  XStack,
  Text,
  Button,
  Card,
  H1,
  H2,
  ScrollView,
  useTheme
} from 'tamagui'
import { router } from 'expo-router'
import { MapPin, ChevronRight } from 'lucide-react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

type RescueZone = {
  id: string
  name: string
  country: string
  flag: string
  description: string
  active: boolean
}

export default function LocationSelectionScreen() {
  const [selectedZone, setSelectedZone] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const theme = useTheme()

  // Predefined rescue zones - can be expanded
  const rescueZones: RescueZone[] = [
    {
      id: 'koh-phangan',
      name: 'Koh Phangan',
      country: 'Thailand',
      flag: '🇹🇭',
      description: 'Tropical island rescue operations',
      active: true
    },
    {
      id: 'chiang-mai',
      name: 'Chiang Mai',
      country: 'Thailand', 
      flag: '🇹🇭',
      description: 'Northern Thailand rescue network',
      active: true
    },
    {
      id: 'bali',
      name: 'Bali',
      country: 'Indonesia',
      flag: '🇮🇩',
      description: 'Island rescue community',
      active: true
    },
    {
      id: 'athens',
      name: 'Athens',
      country: 'Greece',
      flag: '🇬🇷',
      description: 'Urban rescue operations',
      active: false
    }
  ]

  const handleZoneSelection = async () => {
    if (!selectedZone) {
      Alert.alert('Selection Required', 'Please select a rescue zone to continue')
      return
    }

    setLoading(true)
    
    try {
      // Store selected zone in AsyncStorage
      await AsyncStorage.setItem('selected_rescue_zone', selectedZone)
      
      // Navigate to auth screens
      router.replace('/(auth)/login')
    } catch (error) {
      console.error('Error saving location preference:', error)
      Alert.alert('Error', 'Could not save location preference')
    } finally {
      setLoading(false)
    }
  }

  return (
    <YStack 
      flex={1} 
      backgroundColor="$background" 
      justifyContent="center" 
      paddingHorizontal="$6"
      paddingVertical="$8"
    >
      {/* Header */}
      <Card
        elevate
        size="$4"
        bordered
        backgroundColor="$backgroundStrong"
        borderColor="$borderColor"
        padding="$8"
        marginBottom="$8"
        alignItems="center"
        shadowColor="$shadowColor"
        shadowOffset={{ width: 0, height: 8 }}
        shadowOpacity={0.2}
        shadowRadius={16}
        elevation={12}
        borderRadius="12"
      >
        <Image 
          source={require('../assets/images/straysafe_logo.png')} 
          style={{ width: 100, height: 100, marginBottom: 16 }}
          resizeMode="contain"
        />
        <H1 fontSize="$11" fontWeight="bold" color="#3b82f6" textAlign="center">
          Welcome to StraySafe
        </H1>
        <H2 fontSize="$6" color="#6b7280" marginTop="$3" textAlign="center">
          Select your rescue zone
        </H2>
        <Text fontSize="$4" color="$color10" marginTop="$2" textAlign="center">
          Choose the region where you&apos;ll be helping stray dogs
        </Text>
      </Card>

      {/* Zone Selection */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <YStack gap="$4">
          {rescueZones.map((zone) => (
            <Card
              key={zone.id}
              elevate
              size="$4"
              bordered
              backgroundColor={selectedZone === zone.id ? "$blue3" : "$backgroundSoft"}
              borderColor={selectedZone === zone.id ? "$blue8" : "$borderColor"}
              padding="$4"
              borderRadius="12"
              shadowColor="$shadowColor"
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.15}
              shadowRadius={12}
              elevation={8}
              onPress={() => zone.active && setSelectedZone(zone.id)}
              opacity={zone.active ? 1 : 0.6}
              hoverStyle={zone.active ? { backgroundColor: '$blue4' } : {}}
              pressStyle={zone.active ? { backgroundColor: '$blue5' } : {}}
            >
              <XStack alignItems="center" justifyContent="space-between">
                <XStack alignItems="center" gap="$4" flex={1}>
                  <Text fontSize="$8">{zone.flag}</Text>
                  <YStack flex={1}>
                    <XStack alignItems="center" gap="$2">
                      <Text 
                        fontSize="$6" 
                        fontWeight="bold" 
                        color={selectedZone === zone.id ? "$blue11" : "$color"}
                      >
                        {zone.name}
                      </Text>
                      {!zone.active && (
                        <Text fontSize="$2" color="$orange9" backgroundColor="$orange3" 
                              paddingHorizontal="$2" paddingVertical="$1" borderRadius="12">
                          Coming Soon
                        </Text>
                      )}
                    </XStack>
                    <Text fontSize="$4" color="$color10" marginTop="$1">
                      {zone.country}
                    </Text>
                    <Text fontSize="$3" color="$color9" marginTop="$2">
                      {zone.description}
                    </Text>
                  </YStack>
                </XStack>
                
                {zone.active && (
                  <XStack alignItems="center" gap="$2">
                    {selectedZone === zone.id && (
                      <MapPin size={20} color="$blue9" />
                    )}
                    <ChevronRight 
                      size={20} 
                      color={selectedZone === zone.id ? "$blue9" : "$color9"} 
                    />
                  </XStack>
                )}
              </XStack>
            </Card>
          ))}
        </YStack>
      </ScrollView>

      {/* Continue Button */}
      <Card
        position="absolute"
        bottom="$6"
        left="$6"
        right="$6"
        backgroundColor="$backgroundSoft"
        borderColor="$borderColor"
        padding="$4"
        borderRadius="12"
        elevation={8}
      >
        <Button
          size="$5"
          backgroundColor="#3b82f6"
          borderColor="#3b82f6"
          color="white"
          borderRadius="12"
          onPress={handleZoneSelection}
          disabled={!selectedZone || loading}
          hoverStyle={{ backgroundColor: '$blue11' }}
          pressStyle={{ backgroundColor: '$blue9' }}
          shadowColor="#3b82f6"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.3}
          shadowRadius={8}
          elevation={6}
          icon={ChevronRight}
        >
          <Text fontSize="$5" fontWeight="600" color="white">
            {loading ? 'Saving...' : 'Continue to StraySafe'}
          </Text>
        </Button>
      </Card>
    </YStack>
  )
}