import React, { useState, useEffect } from 'react'
import { Alert, Image } from 'react-native'
import {
  YStack,
  XStack,
  Text,
  Button,
  Input,
  Card,
  H1,
  H2,
  Spinner,
  useTheme
} from 'tamagui'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { router } from 'expo-router'
import { LogIn, Fingerprint } from 'lucide-react-native'
import * as LocalAuthentication from 'expo-local-authentication'
import * as SecureStore from 'expo-secure-store'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [biometricLoading, setBiometricLoading] = useState(false)
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [hasStoredCredentials, setHasStoredCredentials] = useState(false)
  const { signIn } = useAuth()
  const theme = useTheme()

  useEffect(() => {
    checkBiometricAvailability()
    checkStoredCredentials()
  }, [])

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync()
      const enrolled = await LocalAuthentication.isEnrolledAsync()
      setBiometricAvailable(compatible && enrolled)
    } catch (error) {
      console.error('Error checking biometric availability:', error)
    }
  }

  const checkStoredCredentials = async () => {
    try {
      const storedEmail = await SecureStore.getItemAsync('stored_email')
      const storedPassword = await SecureStore.getItemAsync('stored_password')
      setHasStoredCredentials(!!(storedEmail && storedPassword))
      
      if (storedEmail) {
        setEmail(storedEmail)
      }
    } catch (error) {
      console.error('Error checking stored credentials:', error)
    }
  }

  const authenticateWithBiometrics = async () => {
    try {
      setBiometricLoading(true)
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Sign in to StraySafe',
        subtitle: 'Use your fingerprint or Face ID',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      })

      if (result.success) {
        // Retrieve stored credentials
        const storedEmail = await SecureStore.getItemAsync('stored_email')
        const storedPassword = await SecureStore.getItemAsync('stored_password')
        
        if (storedEmail && storedPassword) {
          const { error } = await signIn(storedEmail, storedPassword)
          
          if (error) {
            Alert.alert('Error', 'Automatic login failed')
          } else {
            router.replace('/(tabs)')
          }
        } else {
          Alert.alert('Error', 'No saved login credentials found')
        }
      }
    } catch (error) {
      console.error('Biometric authentication error:', error)
      Alert.alert('Error', 'Biometric authentication failed')
    } finally {
      setBiometricLoading(false)
    }
  }

  const resendConfirmation = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email')
      return
    }
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    })
    
    if (error) {
      Alert.alert('Error', error.message)
    } else {
      Alert.alert('Success', 'Confirmation email sent!')
    }
  }

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    setLoading(true)
    const { error } = await signIn(email, password)
    
    if (error) {
      if (error.message.includes('email not confirmed')) {
        Alert.alert(
          'Email not confirmed', 
          'Please check your email and click the confirmation link before signing in.',
          [
            { text: 'OK' },
            { text: 'Resend email', onPress: () => resendConfirmation() }
          ]
        )
      } else {
        Alert.alert('Error', error.message)
      }
    } else {
      // Successful login - save credentials for biometric authentication
      try {
        await SecureStore.setItemAsync('stored_email', email)
        await SecureStore.setItemAsync('stored_password', password)
        setHasStoredCredentials(true)
      } catch (storeError) {
        console.error('Error storing credentials:', storeError)
      }
      
      router.replace('/(tabs)')
    }
    setLoading(false)
  }

  return (
    <YStack 
      flex={1} 
      backgroundColor="$background" 
      justifyContent="center" 
      paddingHorizontal="$6"
      paddingVertical="$8"
    >
      {/* Glassmorphism Header */}
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
        borderRadius="$glass"
      >
        <Image 
          source={require('../../assets/images/straysafe_logo.png')} 
          style={{ width: 80, height: 80, marginBottom: 8 }}
          resizeMode="contain"
        />
        <H1 fontSize="$10" fontWeight="bold" color="$blue10" marginTop="$4" textAlign="center">
          StraySafe
        </H1>
        <H2 fontSize="$5" color="$color11" marginTop="$2" textAlign="center">
          Sign in to continue
        </H2>
      </Card>
      
      <Card
        elevate
        size="$4"
        bordered
        backgroundColor="$backgroundSoft"
        borderColor="$borderColor"
        padding="$6"
        borderRadius="$card"
        shadowColor="$shadowColor"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.15}
        shadowRadius={12}
        elevation={8}
      >
        <YStack gap="$4">
          <Input
            size="$5"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            backgroundColor="$backgroundHover"
            borderColor="$borderColor"
            borderRadius="$button"
            fontSize="$4"
            paddingHorizontal="$4"
            paddingVertical="$4"
            focusStyle={{
              borderColor: '$blue10',
              backgroundColor: '$backgroundFocus'
            }}
          />
          
          <Input
            size="$5"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            backgroundColor="$backgroundHover"
            borderColor="$borderColor"
            borderRadius="$button"
            fontSize="$4"
            paddingHorizontal="$4"
            paddingVertical="$4"
            focusStyle={{
              borderColor: '$blue10',
              backgroundColor: '$backgroundFocus'
            }}
          />
          
          {/* Biometric Authentication Button */}
          {biometricAvailable && hasStoredCredentials && (
            <Button
              size="$5"
              backgroundColor="$green9"
              borderColor="$green9"
              color="white"
              borderRadius="$button"
              onPress={authenticateWithBiometrics}
              disabled={biometricLoading}
              hoverStyle={{ backgroundColor: '$green10' }}
              pressStyle={{ backgroundColor: '$green8' }}
              shadowColor="$green9"
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.3}
              shadowRadius={8}
              elevation={6}
              icon={biometricLoading ? undefined : Fingerprint}
            >
              {biometricLoading ? (
                <XStack alignItems="center" gap="$2">
                  <Spinner size="small" color="white" />
                  <Text fontSize="$4" fontWeight="600" color="white">
                    Authenticating...
                  </Text>
                </XStack>
              ) : (
                <Text fontSize="$4" fontWeight="600" color="white">
                  🔐 Quick Sign In
                </Text>
              )}
            </Button>
          )}
          
          <Button
            size="$5"
            backgroundColor="$blue10"
            borderColor="$blue10"
            color="white"
            borderRadius="$button"
            onPress={handleSignIn}
            disabled={loading}
            hoverStyle={{ backgroundColor: '$blue11' }}
            pressStyle={{ backgroundColor: '$blue9' }}
            shadowColor="$blue10"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.3}
            shadowRadius={8}
            elevation={6}
            icon={loading ? undefined : LogIn}
            marginTop="$2"
          >
            {loading ? (
              <XStack alignItems="center" gap="$2">
                <Spinner size="small" color="white" />
                <Text fontSize="$4" fontWeight="600" color="white">
                  Signing in...
                </Text>
              </XStack>
            ) : (
              <Text fontSize="$4" fontWeight="600" color="white">
                Sign In
              </Text>
            )}
          </Button>
          
          <Button
            size="$4"
            variant="outlined"
            backgroundColor="transparent"
            borderColor="transparent"
            color="$blue10"
            onPress={() => router.push('/(auth)/signup')}
            hoverStyle={{ backgroundColor: '$blue3' }}
            pressStyle={{ backgroundColor: '$blue4' }}
            marginTop="$2"
          >
            <Text fontSize="$3" color="$blue10">
              Don't have an account? Sign up
            </Text>
          </Button>
        </YStack>
      </Card>
    </YStack>
  )
}

