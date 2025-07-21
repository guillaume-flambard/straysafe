import React, { useState, useEffect } from 'react'
import { Alert, Image } from 'react-native'
import {
  YStack,
  XStack,
  Text,
  Button,
  Input,
  ScrollView,
  Spinner
} from 'tamagui'
import { useAuth } from '../../contexts/AuthContext'
import { router } from 'expo-router'
import { UserPlus, MapPin } from 'lucide-react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function SignUpScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedZone, setSelectedZone] = useState<string>('koh-phangan')
  const { signUp } = useAuth()

  // Available locations
  const locations = [
    { id: 'koh-phangan', name: 'Koh Phangan', country: 'Thailand', flag: '🇹🇭' },
    { id: 'chiang-mai', name: 'Chiang Mai', country: 'Thailand', flag: '🇹🇭' },
    { id: 'bali', name: 'Bali', country: 'Indonesia', flag: '🇮🇩' },
    { id: 'athens', name: 'Athens', country: 'Greece', flag: '🇬🇷' },
  ]

  const handleLocationSelect = async (locationId: string) => {
    setSelectedZone(locationId)
    // Save to AsyncStorage for app-wide access
    try {
      await AsyncStorage.setItem('selected_rescue_zone', locationId)
    } catch (error) {
      console.error('Error saving selected zone:', error)
    }
  }

  useEffect(() => {
    // Get the selected rescue zone from AsyncStorage if available
    const getSelectedZone = async () => {
      try {
        const zone = await AsyncStorage.getItem('selected_rescue_zone')
        if (zone && locations.find(loc => loc.id === zone)) {
          setSelectedZone(zone)
        }
        // If no zone in storage or invalid zone, keep default 'koh-phangan'
      } catch (error) {
        console.error('Error getting selected zone:', error)
        // Keep default on error
      }
    }
    getSelectedZone()
  }, [])

  const handleSignUp = async () => {
    if (!email || !password || !fullName || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    if (!selectedZone) {
      Alert.alert('Error', 'Please select a rescue location')
      return
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match')
      return
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters')
      return
    }

    console.log('=== SIGNUP DEBUG ===')
    console.log('Email:', email)
    console.log('Full Name:', fullName)
    console.log('Selected Zone from AsyncStorage:', selectedZone)

    setLoading(true)
    
    try {
      const { error } = await signUp(email, password, fullName, selectedZone)
      
      if (error) {
        console.error('Signup error:', error)
        Alert.alert('Database error saving new user', error.message || 'Unknown error occurred')
      } else {
        Alert.alert(
          'Success', 
          'Account created successfully! Please check your email to confirm your account before signing in.',
          [
            { text: 'OK', onPress: () => router.replace('/(auth)/login') }
          ]
        )
      }
    } catch (error) {
      console.error('Unexpected signup error:', error)
      Alert.alert('Error', 'An unexpected error occurred: ' + (error as Error).message)
    }
    
    setLoading(false)
  }

  return (
    <ScrollView
      flex={1}
      backgroundColor="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingVertical: 48,
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}
    >
      <YStack gap="$6" maxWidth={400} alignSelf="center" width="100%">
        {/* Logo Section */}
        <YStack alignItems="center" marginBottom="$8">
          <Image 
            source={require('../../assets/images/straysafe_logo.png')} 
            style={{ width: 160, height: 160, marginBottom: 16 }}
            resizeMode="contain"
          />
          <Text 
            fontSize="$8" 
            fontWeight="300" 
            color="#1e293b" 
            textAlign="center"
            marginBottom="$2"
            fontFamily="System"
            letterSpacing={1}
            style={{
              fontFamily: 'System',
              fontWeight: '200'
            }}
          >
            Welcome to StraySafe
          </Text>
          <Text fontSize="$3" color="#64748b" textAlign="center" fontWeight="400">
            Create your account
          </Text>
        </YStack>

        {/* Form Section */}
        <YStack gap="$4">
          <Input
            size="$5"
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            backgroundColor="rgba(255, 255, 255, 0.9)"
            borderColor="rgba(203, 213, 225, 0.6)"
            borderRadius={12}
            fontSize="$4"
            paddingHorizontal="$4"
            paddingVertical="$4"
            shadowColor="rgba(0, 0, 0, 0.1)"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={4}
            focusStyle={{
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              shadowOpacity: 0.2
            }}
          />

          {/* Location Selection */}
          <YStack gap="$2">
            <XStack alignItems="center" gap="$2" paddingHorizontal="$2">
              <MapPin size={16} color="#6b7280" />
              <Text fontSize="$3" color="#6b7280" fontWeight="500">
                Rescue Location
              </Text>
            </XStack>
            <XStack gap="$2" flexWrap="wrap">
              {locations.map((location) => (
                <Button
                  key={location.id}
                  size="$3"
                  variant="outlined"
                  backgroundColor={selectedZone === location.id ? "#3b82f6" : "rgba(255, 255, 255, 0.9)"}
                  borderColor={selectedZone === location.id ? "#3b82f6" : "rgba(203, 213, 225, 0.6)"}
                  color={selectedZone === location.id ? "white" : "#6b7280"}
                  borderRadius={8}
                  onPress={() => handleLocationSelect(location.id)}
                  hoverStyle={{ 
                    backgroundColor: selectedZone === location.id ? '#1d4ed8' : 'rgba(255, 255, 255, 0.95)' 
                  }}
                  pressStyle={{ 
                    backgroundColor: selectedZone === location.id ? '#2563eb' : 'rgba(243, 244, 246, 0.9)' 
                  }}
                  flex={1}
                  minWidth="48%"
                >
                  <XStack alignItems="center" gap="$1">
                    <Text fontSize="$2">{location.flag}</Text>
                    <Text fontSize="$3" fontWeight="500">
                      {location.name}
                    </Text>
                  </XStack>
                </Button>
              ))}
            </XStack>
          </YStack>
          
          <Input
            size="$5"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            backgroundColor="rgba(255, 255, 255, 0.9)"
            borderColor="rgba(203, 213, 225, 0.6)"
            borderRadius={12}
            fontSize="$4"
            paddingHorizontal="$4"
            paddingVertical="$4"
            shadowColor="rgba(0, 0, 0, 0.1)"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={4}
            focusStyle={{
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              shadowOpacity: 0.2
            }}
          />
          
          <Input
            size="$5"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            backgroundColor="rgba(255, 255, 255, 0.9)"
            borderColor="rgba(203, 213, 225, 0.6)"
            borderRadius={12}
            fontSize="$4"
            paddingHorizontal="$4"
            paddingVertical="$4"
            shadowColor="rgba(0, 0, 0, 0.1)"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={4}
            focusStyle={{
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              shadowOpacity: 0.2
            }}
          />

          <Input
            size="$5"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            backgroundColor="rgba(255, 255, 255, 0.9)"
            borderColor="rgba(203, 213, 225, 0.6)"
            borderRadius={12}
            fontSize="$4"
            paddingHorizontal="$4"
            paddingVertical="$4"
            shadowColor="rgba(0, 0, 0, 0.1)"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={4}
            focusStyle={{
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              shadowOpacity: 0.2
            }}
          />
          
          <Button
            size="$5"
            backgroundColor="#3b82f6"
            borderColor="#3b82f6"
            color="white"
            borderRadius={12}
            onPress={handleSignUp}
            disabled={loading}
            hoverStyle={{ backgroundColor: '#1d4ed8' }}
            pressStyle={{ backgroundColor: '#2563eb' }}
            shadowColor="#3b82f6"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.3}
            shadowRadius={8}
            elevation={6}
            icon={loading ? undefined : UserPlus}
            marginTop="$4"
          >
            {loading ? (
              <XStack alignItems="center" gap="$2">
                <Spinner size="small" color="white" />
                <Text fontSize="$4" fontWeight="600" color="white">
                  Creating account...
                </Text>
              </XStack>
            ) : (
              <Text fontSize="$4" fontWeight="600" color="white">
                Create Account
              </Text>
            )}
          </Button>
          
          <Button
            size="$4"
            variant="outlined"
            backgroundColor="transparent"
            borderColor="transparent"
            color="#3b82f6"
            onPress={() => router.push('/(auth)/login')}
            hoverStyle={{ backgroundColor: '#dbeafe' }}
            pressStyle={{ backgroundColor: '#bfdbfe' }}
            marginTop="$2"
          >
            <Text fontSize="$3" color="#3b82f6">
              Already have an account? Sign in
            </Text>
          </Button>
        </YStack>
      </YStack>
    </ScrollView>
  )
}