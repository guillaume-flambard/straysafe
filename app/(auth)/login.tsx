import React, { useState, useEffect } from 'react'
import { Alert, Image, Keyboard, KeyboardAvoidingView, Platform } from 'react-native'
import {
  YStack,
  XStack,
  Text,
  Button,
  Input,
  Spinner,
  ScrollView
} from 'tamagui'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { router } from 'expo-router'
import { LogIn } from 'lucide-react-native'
import * as LocalAuthentication from 'expo-local-authentication'
import * as SecureStore from 'expo-secure-store'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const { signIn } = useAuth()

  useEffect(() => {
    // Setup keyboard listeners
    const keyboardShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true)
    })
    const keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false)
    })

    // Check and setup biometrics
    setupBiometrics()

    return () => {
      keyboardShowListener?.remove()
      keyboardHideListener?.remove()
    }
  }, [])

  const setupBiometrics = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync()
      const enrolled = await LocalAuthentication.isEnrolledAsync()
      const storedEmail = await SecureStore.getItemAsync('stored_email')
      const storedPassword = await SecureStore.getItemAsync('stored_password')
      
      // Auto-fill email if stored
      if (storedEmail) {
        setEmail(storedEmail)
      }
      
      // Auto-authenticate if biometrics available and credentials stored
      if (compatible && enrolled && storedEmail && storedPassword) {
        // Small delay to let UI render
        setTimeout(async () => {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Sign in to StraySafe',
            cancelLabel: 'Use Password',
            disableDeviceFallback: false,
          })

          if (result.success) {
            const { error } = await signIn(storedEmail, storedPassword)
            if (!error) {
              router.replace('/(tabs)')
            }
          }
        }, 500)
      }
    } catch (error) {
      console.error('Biometric setup error:', error)
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
      } catch (storeError) {
        console.error('Error storing credentials:', storeError)
      }
      
      router.replace('/(tabs)')
    }
    setLoading(false)
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        flex={1}
        backgroundColor="linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: keyboardVisible ? 'flex-start' : 'center',
          paddingHorizontal: 32,
          paddingVertical: keyboardVisible ? 20 : 48,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

