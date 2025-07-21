import React, { useState } from 'react'
import { Alert, Image } from 'react-native'
import {
  YStack,
  XStack,
  Text,
  Button,
  Card,
  ScrollView
} from 'tamagui'
import { router } from 'expo-router'
import { MapPin, ChevronRight, Waves, Mountain, Building2, Trees } from 'lucide-react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

type RescueZone = {
  id: string
  name: string
  country: string
  flag: string
  description: string
  active: boolean
  icon: any
  gradient: [string, string]
}

export default function LocationSelectionScreen() {
  const [selectedZone, setSelectedZone] = useState<string>('')
  const [loading, setLoading] = useState(false)

  // Predefined rescue zones - can be expanded
  const rescueZones: RescueZone[] = [
    {
      id: 'koh-phangan',
      name: 'Koh Phangan',
      country: 'Thailand',
      flag: '🇹🇭',
      description: 'Tropical island rescue operations',
      active: true,
      icon: Waves,
      gradient: ['#06b6d4', '#0891b2']
    },
    {
      id: 'chiang-mai',
      name: 'Chiang Mai',
      country: 'Thailand', 
      flag: '🇹🇭',
      description: 'Northern Thailand rescue network',
      active: true,
      icon: Mountain,
      gradient: ['#10b981', '#059669']
    },
    {
      id: 'bali',
      name: 'Bali',
      country: 'Indonesia',
      flag: '🇮🇩',
      description: 'Island rescue community',
      active: true,
      icon: Trees,
      gradient: ['#f59e0b', '#d97706']
    },
    {
      id: 'athens',
      name: 'Athens',
      country: 'Greece',
      flag: '🇬🇷',
      description: 'Urban rescue operations',
      active: false,
      icon: Building2,
      gradient: ['#6b7280', '#4b5563']
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
      backgroundColor="linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
    >
      {/* Header with Hero Section */}
      <YStack
        paddingHorizontal="$6"
        paddingTop="$16"
        paddingBottom="$8"
        backgroundColor="transparent"
        alignItems="center"
        gap="$4"
      >
        <Image 
          source={require('../assets/images/straysafe_logo.png')} 
          style={{ width: 120, height: 120, marginBottom: 8 }}
          resizeMode="contain"
        />
        <Text 
          fontSize="$9" 
          fontWeight="200" 
          color="#1e293b" 
          textAlign="center"
          letterSpacing={1}
        >
          Welcome to StraySafe
        </Text>
        <Text 
          fontSize="$5" 
          color="#475569" 
          textAlign="center"
          fontWeight="500"
        >
          Choose your rescue zone
        </Text>
        <Text 
          fontSize="$3" 
          color="#64748b" 
          textAlign="center" 
          lineHeight="$1"
          maxWidth="280px"
        >
          Select the region where you'll be helping stray dogs find safety and homes
        </Text>
      </YStack>

      {/* Zone Selection */}
      <ScrollView 
        flex={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingHorizontal: 24, 
          paddingBottom: 140, 
          gap: 16 
        }}
      >
        {rescueZones.map((zone) => {
          const IconComponent = zone.icon
          const isSelected = selectedZone === zone.id
          
          return (
            <Card
              key={zone.id}
              elevate
              size="$4"
              bordered
              backgroundColor={isSelected ? "rgba(59, 130, 246, 0.1)" : "rgba(255, 255, 255, 0.9)"}
              borderColor={isSelected ? "#3b82f6" : "rgba(203, 213, 225, 0.6)"}
              borderWidth={isSelected ? 2 : 1}
              padding="$5"
              borderRadius={16}
              shadowColor="rgba(0, 0, 0, 0.1)"
              shadowOffset={{ width: 0, height: 8 }}
              shadowOpacity={0.15}
              shadowRadius={16}
              elevation={12}
              onPress={() => zone.active && setSelectedZone(zone.id)}
              opacity={zone.active ? 1 : 0.6}
              animation="bouncy"
              scale={isSelected ? 1.02 : 1}
              hoverStyle={zone.active ? { 
                scale: 1.03,
                backgroundColor: isSelected ? "rgba(59, 130, 246, 0.15)" : "rgba(255, 255, 255, 0.95)"
              } : {}}
              pressStyle={zone.active ? { 
                scale: 0.98,
                backgroundColor: isSelected ? "rgba(59, 130, 246, 0.2)" : "rgba(243, 244, 246, 0.9)"
              } : {}}
              marginBottom="$3"
            >
              <XStack alignItems="center" gap="$4">
                {/* Icon and Flag */}
                <YStack alignItems="center" gap="$2">
                  <Card
                    backgroundColor={isSelected ? zone.gradient[0] : "#f1f5f9"}
                    borderRadius={12}
                    padding="$3"
                    shadowColor={zone.gradient[0]}
                    shadowOffset={{ width: 0, height: 4 }}
                    shadowOpacity={isSelected ? 0.3 : 0.1}
                    shadowRadius={8}
                    elevation={6}
                  >
                    <IconComponent 
                      size={24} 
                      color={isSelected ? "white" : zone.gradient[0]} 
                    />
                  </Card>
                  <Text fontSize="$6">{zone.flag}</Text>
                </YStack>

                {/* Content */}
                <YStack flex={1} gap="$1">
                  <XStack alignItems="center" justifyContent="space-between">
                    <XStack alignItems="center" gap="$2" flex={1}>
                      <Text 
                        fontSize="$6" 
                        fontWeight="700" 
                        color={isSelected ? "#3b82f6" : "#1e293b"}
                      >
                        {zone.name}
                      </Text>
                      {!zone.active && (
                        <Card
                          backgroundColor="#fef3c7"
                          borderColor="#f59e0b"
                          borderWidth={1}
                          paddingHorizontal="$2"
                          paddingVertical="$0.5"
                          borderRadius={8}
                        >
                          <Text fontSize="$1" color="#92400e" fontWeight="600">
                            Coming Soon
                          </Text>
                        </Card>
                      )}
                    </XStack>
                    
                    {zone.active && (
                      <XStack alignItems="center" gap="$2">
                        {isSelected && (
                          <Card
                            backgroundColor="#3b82f6"
                            borderRadius={10}
                            padding="$1"
                          >
                            <MapPin size={16} color="white" />
                          </Card>
                        )}
                        <ChevronRight 
                          size={20} 
                          color={isSelected ? "#3b82f6" : "#94a3b8"} 
                        />
                      </XStack>
                    )}
                  </XStack>
                  
                  <Text fontSize="$3" color="#64748b" fontWeight="500">
                    {zone.country}
                  </Text>
                  
                  <Text fontSize="$3" color="#64748b" marginTop="$1" lineHeight="$1">
                    {zone.description}
                  </Text>
                </YStack>
              </XStack>
            </Card>
          )
        })}
      </ScrollView>

      {/* Continue Button */}
      <Card
        position="absolute"
        bottom="$6"
        left="$6"
        right="$6"
        backgroundColor="rgba(255, 255, 255, 0.95)"
        borderColor="rgba(203, 213, 225, 0.6)"
        borderWidth={1}
        padding="$4"
        borderRadius={16}
        shadowColor="rgba(0, 0, 0, 0.1)"
        shadowOffset={{ width: 0, height: 8 }}
        shadowOpacity={0.15}
        shadowRadius={16}
        elevation={12}
      >
        <Button
          size="$5"
          backgroundColor={selectedZone ? "#3b82f6" : "#e2e8f0"}
          borderColor={selectedZone ? "#3b82f6" : "#e2e8f0"}
          color={selectedZone ? "white" : "#94a3b8"}
          borderRadius={12}
          onPress={handleZoneSelection}
          disabled={!selectedZone || loading}
          hoverStyle={{ 
            backgroundColor: selectedZone ? '#1d4ed8' : '#e2e8f0',
            scale: selectedZone ? 1.02 : 1
          }}
          pressStyle={{ 
            backgroundColor: selectedZone ? '#2563eb' : '#e2e8f0',
            scale: selectedZone ? 0.98 : 1
          }}
          shadowColor={selectedZone ? "#3b82f6" : "transparent"}
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={selectedZone ? 0.3 : 0}
          shadowRadius={8}
          elevation={selectedZone ? 6 : 0}
          icon={loading ? undefined : ChevronRight}
          animation="bouncy"
        >
          <XStack alignItems="center" gap="$2">
            {loading && (
              <Card
                backgroundColor="rgba(255, 255, 255, 0.2)"
                borderRadius={8}
                padding="$1"
                animation="slow"
                scale={1.2}
              >
                <MapPin size={16} color="white" />
              </Card>
            )}
            <Text fontSize="$5" fontWeight="600" color={selectedZone ? "white" : "#94a3b8"}>
              {loading ? 'Saving location...' : selectedZone ? 'Continue to StraySafe' : 'Select a zone first'}
            </Text>
          </XStack>
        </Button>
      </Card>
    </YStack>
  )
}