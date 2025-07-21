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
import { LogIn, Fingerprint, Scan } from 'lucide-react-native'
import * as LocalAuthentication from 'expo-local-authentication'
import * as SecureStore from 'expo-secure-store'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [biometricLoading, setBiometricLoading] = useState(false)
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [hasStoredCredentials, setHasStoredCredentials] = useState(false)
  const [biometricType, setBiometricType] = useState('')
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
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync()
      
      // Types: 1 = Face ID, 2 = Touch ID, 3 = Iris (Android)
      const hasFaceID = supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
      const hasTouchID = supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
      
      console.log('Biometric check:', { 
        compatible, 
        enrolled, 
        supportedTypes, 
        hasFaceID, 
        hasTouchID 
      })
      
      setBiometricAvailable(compatible && enrolled && (hasFaceID || hasTouchID))
      
      // Set biometric type for UI display
      if (hasFaceID) {
        setBiometricType('Face ID')
      } else if (hasTouchID) {
        setBiometricType('Touch ID')
      } else {
        setBiometricType('Biometric')
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error)
    }
  }

  const checkStoredCredentials = async () => {
    try {
      const storedEmail = await SecureStore.getItemAsync('stored_email')
      const storedPassword = await SecureStore.getItemAsync('stored_password')
      const hasStored = !!(storedEmail && storedPassword)
      
      console.log('Stored credentials check:', { hasStored, hasEmail: !!storedEmail, hasPassword: !!storedPassword })
      setHasStoredCredentials(hasStored)
      
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
        cancelLabel: 'Cancel',
        disableDeviceFallback: true, // Force biometric only, no passcode fallback
        fallbackLabel: '', // Remove fallback option
      })

      if (result.success) {
        // Retrieve stored credentials
        const storedEmail = await SecureStore.getItemAsync('stored_email')
        const storedPassword = await SecureStore.getItemAsync('stored_password')
        
        if (storedEmail && storedPassword) {
          const { error } = await signIn(storedEmail, storedPassword)
          
          if (error) {
            Alert.alert('Error', 'Automatic login failed: ' + error.message)
          } else {
            router.replace('/(tabs)')
          }
        } else {
          // Fallback: show regular login if no stored credentials
          Alert.alert(
            'No stored credentials', 
            'Please sign in with your email and password to enable biometric authentication.',
            [{ text: 'OK' }]
          )
        }
      } else if (result.error) {
        Alert.alert('Authentication cancelled', result.error)
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
      backgroundColor="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      justifyContent="center" 
      paddingHorizontal="$8"
      paddingVertical="$12"
      style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}
    >
      {/* Logo Section */}
      <YStack alignItems="center" marginBottom="$12">
        <Image 
          source={require('../../assets/images/straysafe_logo.png')} 
          style={{ width: 180, height: 180, marginBottom: 16 }}
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
          Sign in to continue
        </Text>
      </YStack>
      
      {/* Form Section */}
      <YStack gap="$6" maxWidth={400} alignSelf="center" width="100%">
        <YStack gap="$4">
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
          
          {/* Debug info - remove in production */}
          <Text fontSize="$2" color="$gray9" textAlign="center">
            {biometricType}: {biometricAvailable ? '✅' : '❌'} | Stored: {hasStoredCredentials ? '✅' : '❌'}
          </Text>
          
          {/* Biometric Authentication Buttons */}
          {biometricAvailable && (
            <XStack gap="$3" justifyContent="center" alignItems="center">
              {/* Face ID Button - only show if Face ID is available */}
              {biometricType === 'Face ID' && (
                <Button
                  size="$3"
                  circular
                  backgroundColor="transparent"
                  borderColor="#6b7280"
                  borderWidth={1}
                  onPress={authenticateWithBiometrics}
                  disabled={biometricLoading}
                  hoverStyle={{ backgroundColor: '#f3f4f6' }}
                  pressStyle={{ backgroundColor: '#e5e7eb' }}
                  padding="$3"
                >
                  {biometricLoading ? (
                    <Spinner size="small" color="#6b7280" />
                  ) : (
                    <Scan size={20} color="#6b7280" />
                  )}
                </Button>
              )}
              
              {/* Touch ID Button - only show if Touch ID is available */}
              {biometricType === 'Touch ID' && (
                <Button
                  size="$3"
                  circular
                  backgroundColor="transparent"
                  borderColor="#6b7280"
                  borderWidth={1}
                  onPress={authenticateWithBiometrics}
                  disabled={biometricLoading}
                  hoverStyle={{ backgroundColor: '#f3f4f6' }}
                  pressStyle={{ backgroundColor: '#e5e7eb' }}
                  padding="$3"
                >
                  {biometricLoading ? (
                    <Spinner size="small" color="#6b7280" />
                  ) : (
                    <Fingerprint size={20} color="#6b7280" />
                  )}
                </Button>
              )}
              
              {/* Both available - show both buttons */}
              {biometricType === 'Biometric' && (
                <>
                  <Button
                    size="$3"
                    circular
                    backgroundColor="transparent"
                    borderColor="#6b7280"
                    borderWidth={1}
                    onPress={authenticateWithBiometrics}
                    disabled={biometricLoading}
                    hoverStyle={{ backgroundColor: '#f3f4f6' }}
                    pressStyle={{ backgroundColor: '#e5e7eb' }}
                    padding="$3"
                  >
                    {biometricLoading ? (
                      <Spinner size="small" color="#6b7280" />
                    ) : (
                      <Scan size={20} color="#6b7280" />
                    )}
                  </Button>
                  
                  <Button
                    size="$3"
                    circular
                    backgroundColor="transparent"
                    borderColor="#6b7280"
                    borderWidth={1}
                    onPress={authenticateWithBiometrics}
                    disabled={biometricLoading}
                    hoverStyle={{ backgroundColor: '#f3f4f6' }}
                    pressStyle={{ backgroundColor: '#e5e7eb' }}
                    padding="$3"
                  >
                    {biometricLoading ? (
                      <Spinner size="small" color="#6b7280" />
                    ) : (
                      <Fingerprint size={20} color="#6b7280" />
                    )}
                  </Button>
                </>
              )}
            </XStack>
          )}
          
          <Button
            size="$5"
            backgroundColor="#3b82f6"
            borderColor="#3b82f6"
            color="white"
            borderRadius={12}
            onPress={handleSignIn}
            disabled={loading}
            hoverStyle={{ backgroundColor: '#1d4ed8' }}
            pressStyle={{ backgroundColor: '#2563eb' }}
            shadowColor="#3b82f6"
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
            color="#3b82f6"
            onPress={() => router.push('/(auth)/signup')}
            hoverStyle={{ backgroundColor: '#dbeafe' }}
            pressStyle={{ backgroundColor: '#bfdbfe' }}
            marginTop="$2"
          >
            <Text fontSize="$3" color="#3b82f6">
              Don&apos;t have an account? Sign up
            </Text>
          </Button>
        </YStack>
      </YStack>
    </YStack>
  )
}

