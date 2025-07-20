import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { router } from 'expo-router'

type Location = {
  id: string
  name: string
  country: string
}

export default function SignUpScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      console.log('Fetching locations...')
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name')
      
      console.log('Locations response:', { data, error })
      
      if (error) {
        console.error('Error fetching locations:', error)
        Alert.alert('Network Error', 'Could not fetch locations. Please check your internet connection.')
      } else {
        setLocations(data || [])
        if (data && data.length > 0) {
          setSelectedLocation(data[0].id)
        }
      }
    } catch (err) {
      console.error('Network error:', err)
      Alert.alert('Network Error', 'Could not connect to server. Please check your internet connection.')
    }
  }

  const handleSignUp = async () => {
    if (!email || !password || !fullName || !selectedLocation) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    setLoading(true)
    const { error } = await signUp(email, password, fullName, selectedLocation)
    
    if (error) {
      Alert.alert('Error', error.message)
    } else {
      Alert.alert(
        'Success', 
        'Account created! Please check your email to verify your account.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      )
    }
    setLoading(false)
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Join StraySafe</Text>
        <Text style={styles.subtitle}>Create your account</Text>
        
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Location</Text>
            <Picker
              selectedValue={selectedLocation}
              onValueChange={setSelectedLocation}
              style={styles.picker}
            >
              {locations.map((location) => (
                <Picker.Item
                  key={location.id}
                  label={`${location.name}, ${location.country}`}
                  value={location.id}
                />
              ))}
            </Picker>
          </View>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.linkText}>
              Already have an account? Sign in
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2563eb',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#6b7280',
  },
  form: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 16,
    marginTop: 8,
  },
  picker: {
    marginHorizontal: 8,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 8,
  },
  linkText: {
    color: '#2563eb',
    fontSize: 14,
  },
})