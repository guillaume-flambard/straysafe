import React, { useState, useEffect } from 'react'
import { Alert, Image } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import {
  YStack,
  XStack,
  Text,
  Button,
  Input,
  Card,
  H1,
  H2,
  ScrollView,
  Spinner,
  useTheme
} from 'tamagui'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { router } from 'expo-router'
import { UserPlus, MapPin } from 'lucide-react-native'
import { Country, State, City } from 'country-state-city'
import type { ICountry, IState, ICity } from 'country-state-city'
import * as Location from 'expo-location'

export default function SignUpScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [countries, setCountries] = useState<ICountry[]>([])
  const [states, setStates] = useState<IState[]>([])
  const [cities, setCities] = useState<ICity[]>([])
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [detectedLocation, setDetectedLocation] = useState<string>('')
  const [locationDetected, setLocationDetected] = useState(false)
  const { signUp } = useAuth()

  useEffect(() => {
    loadCountries()
    if (!locationDetected) {
      detectCurrentLocation()
    }
  }, [])

  const detectCurrentLocation = async () => {
    try {
      setLocationLoading(true)
      
      // Don't detect again if already detected
      if (locationDetected) {
        setLocationLoading(false)
        return
      }
      
      // Request permission to access location
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        console.log('Location permission denied')
        setLocationLoading(false)
        setLocationDetected(true) // Mark as attempted
        return
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      // Reverse geocode to get address
      const reverseGeocodeResult = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })

      if (reverseGeocodeResult.length > 0) {
        const address = reverseGeocodeResult[0]
        console.log('Detected location:', address)
        
        // Set detected location info
        const locationText = `${address.city || address.district || address.subregion}, ${address.region}, ${address.country}`
        setDetectedLocation(locationText)
        
        // Try to find and set the country
        if (address.isoCountryCode) {
          // If countries aren't loaded yet, we'll retry after they load
          if (countries.length === 0) {
            // Retry after a short delay to let countries load, but only once
            setTimeout(() => {
              if (countries.length > 0 && !locationDetected) {
                setLocationDetected(false) // Allow one more attempt
                detectCurrentLocation()
              }
            }, 1000)
            return
          }
          const detectedCountry = countries.find(country => 
            country.isoCode === address.isoCountryCode?.toUpperCase()
          )
          if (detectedCountry) {
            setSelectedCountry(detectedCountry.isoCode)
            
            // Load states for this country
            const countryStates = State.getStatesOfCountry(detectedCountry.isoCode) || []
            setStates(countryStates)
            
            // Try to find and set the state/region
            if (address.region && countryStates.length > 0) {
              const detectedState = countryStates.find(state => 
                state.name.toLowerCase().includes(address.region?.toLowerCase() || '') ||
                address.region?.toLowerCase().includes(state.name.toLowerCase())
              )
              if (detectedState) {
                setSelectedState(detectedState.isoCode)
                
                // Load cities for this state
                const stateCities = City.getCitiesOfState(detectedCountry.isoCode, detectedState.isoCode) || []
                setCities(stateCities)
                
                // Try to find and set the city
                if (address.city) {
                  const detectedCity = stateCities.find(city =>
                    city.name.toLowerCase() === address.city?.toLowerCase()
                  )
                  if (detectedCity) {
                    setSelectedCity(detectedCity.name)
                  } else if (address.city) {
                    setSelectedCity(address.city)
                  }
                }
              }
            } else if (address.city) {
              // If no state but has city, try direct city lookup
              const countryCities = City.getCitiesOfCountry(detectedCountry.isoCode) || []
              setCities(countryCities)
              
              if (countryCities.length > 0) {
                const detectedCity = countryCities.find(city =>
                  city.name.toLowerCase() === address.city?.toLowerCase()
                )
                if (detectedCity) {
                  setSelectedCity(detectedCity.name)
                } else if (address.city) {
                  setSelectedCity(address.city)
                }
              } else if (address.city) {
                setSelectedCity(address.city)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error detecting location:', error)
    } finally {
      setLocationLoading(false)
      setLocationDetected(true) // Mark as completed (success or failure)
    }
  }

  const loadCountries = () => {
    try {
      const allCountries = Country.getAllCountries()
      setCountries(allCountries)
      
      // Don't set default country here anymore - let location detection handle it
      // Fallback to Thailand only if location detection fails
      if (!locationLoading && !selectedCountry) {
        const thailand = allCountries.find(country => country.isoCode === 'TH')
        if (thailand) {
          setSelectedCountry(thailand.isoCode)
          loadStates(thailand.isoCode)
        }
      }
    } catch (error) {
      console.error('Error loading countries:', error)
      Alert.alert('Error', 'Could not load countries list.')
    }
  }

  const loadStates = (countryCode: string) => {
    try {
      const countryStates = State.getStatesOfCountry(countryCode) || []
      setStates(countryStates)
      
      // Reset state and city selections
      setSelectedState('')
      setSelectedCity('')
      setCities([])
      
      // If states available, select first one
      if (countryStates.length > 0) {
        setSelectedState(countryStates[0].isoCode)
        loadCities(countryCode, countryStates[0].isoCode)
      } else {
        // If no states, load cities directly for the country
        loadCitiesForCountry(countryCode)
      }
    } catch (error) {
      console.error('Error loading states:', error)
    }
  }

  const loadCities = (countryCode: string, stateCode: string) => {
    try {
      const stateCities = City.getCitiesOfState(countryCode, stateCode) || []
      setCities(stateCities)
      
      // Reset city selection
      setSelectedCity('')
      
      // Select first city if available
      if (stateCities.length > 0) {
        setSelectedCity(stateCities[0].name)
      }
    } catch (error) {
      console.error('Error loading cities:', error)
    }
  }

  const loadCitiesForCountry = (countryCode: string) => {
    try {
      const countryCities = City.getCitiesOfCountry(countryCode) || []
      setCities(countryCities)
      
      // Reset city selection
      setSelectedCity('')
      
      // Select first city if available
      if (countryCities.length > 0) {
        setSelectedCity(countryCities[0].name)
      }
    } catch (error) {
      console.error('Error loading cities:', error)
    }
  }

  // Handle country change
  useEffect(() => {
    if (selectedCountry) {
      loadStates(selectedCountry)
    }
  }, [selectedCountry])

  // Handle state change
  useEffect(() => {
    if (selectedCountry && selectedState) {
      loadCities(selectedCountry, selectedState)
    }
  }, [selectedState])

  const handleSignUp = async () => {
    if (!email || !password || !fullName || !selectedCity) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    setLoading(true)
    
    // Create location string
    const selectedCountryObj = countries.find(c => c.isoCode === selectedCountry)
    const selectedStateObj = states.find(s => s.isoCode === selectedState)
    const locationString = selectedStateObj 
      ? `${selectedCity}, ${selectedStateObj.name}, ${selectedCountryObj?.name}`
      : `${selectedCity}, ${selectedCountryObj?.name}`
    
    // For now, we'll pass the location string to signUp function
    // In the future, you might want to create a locations table entry
    const { error } = await signUp(email, password, fullName, locationString)
    
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
    <ScrollView 
      flex={1} 
      backgroundColor="$background"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ 
        paddingHorizontal: 24, 
        paddingTop: 60, 
        paddingBottom: 80,
        justifyContent: 'center',
        minHeight: '100%'
      }}
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
          Join StraySafe
        </H1>
        <H2 fontSize="$5" color="$color11" marginTop="$2" textAlign="center">
          Create your account
        </H2>
        
        {/* Location Detection Status */}
        {locationLoading && (
          <XStack alignItems="center" gap="$2" marginTop="$3">
            <Spinner size="small" color="$color" />
            <Text fontSize="$3" color="$color">
              Detecting your location...
            </Text>
          </XStack>
        )}
        
        {detectedLocation && !locationLoading && (
          <XStack alignItems="center" gap="$2" marginTop="$3">
            <MapPin size={16} color="$green9" />
            <Text fontSize="$3" color="$green9">
              Detected: {detectedLocation}
            </Text>
          </XStack>
        )}
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
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
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
          
          {/* Detect Location Button */}
          <Button
            size="$4"
            variant="outlined"
            backgroundColor="transparent"
            borderColor="$blue7"
            color="$blue9"
            onPress={() => {
              setLocationDetected(false) // Allow re-detection
              detectCurrentLocation()
            }}
            disabled={locationLoading}
            hoverStyle={{ backgroundColor: '$blue3' }}
            pressStyle={{ backgroundColor: '$blue4' }}
            icon={locationLoading ? undefined : MapPin}
          >
            {locationLoading ? (
              <XStack alignItems="center" gap="$2">
                <Spinner size="small" color="$blue9" />
                <Text fontSize="$3" color="$blue9">
                  Detecting...
                </Text>
              </XStack>
            ) : (
              <Text fontSize="$3" color="$blue9">
                📍 Detect My Location
              </Text>
            )}
          </Button>

          {/* Country Selection */}
          <Card
            backgroundColor="$backgroundHover"
            borderColor="$borderColor"
            borderRadius="$button"
            padding="$0"
            bordered
          >
            <YStack>
              <Text fontSize="$3" color="$color11" paddingHorizontal="$4" paddingTop="$2">
                🌍 Country
              </Text>
              <Picker
                selectedValue={selectedCountry}
                onValueChange={setSelectedCountry}
                style={{ marginHorizontal: 8 }}
              >
                {countries.map((country) => (
                  <Picker.Item
                    key={country.isoCode}
                    label={`${country.flag} ${country.name}`}
                    value={country.isoCode}
                  />
                ))}
              </Picker>
            </YStack>
          </Card>

          {/* State/Province Selection (if available) */}
          {states.length > 0 && (
            <Card
              backgroundColor="$backgroundHover"
              borderColor="$borderColor"
              borderRadius="$button"
              padding="$0"
              bordered
              opacity={selectedCountry ? 1 : 0.5}
            >
              <YStack>
                <Text fontSize="$3" color="$color11" paddingHorizontal="$4" paddingTop="$2">
                  🏛️ State/Province
                </Text>
                <Picker
                  selectedValue={selectedState}
                  onValueChange={setSelectedState}
                  style={{ marginHorizontal: 8 }}
                  enabled={Boolean(selectedCountry && states.length > 0)}
                >
                  {states.map((state) => (
                    <Picker.Item
                      key={state.isoCode}
                      label={state.name}
                      value={state.isoCode}
                    />
                  ))}
                </Picker>
              </YStack>
            </Card>
          )}

          {/* City Selection */}
          <Card
            backgroundColor="$backgroundHover"
            borderColor="$borderColor"
            borderRadius="$button"
            padding="$0"
            bordered
            opacity={selectedCountry ? 1 : 0.5}
          >
            <YStack>
              <Text fontSize="$3" color="$color11" paddingHorizontal="$4" paddingTop="$2">
                📍 City
              </Text>
              <Picker
                selectedValue={selectedCity}
                onValueChange={setSelectedCity}
                style={{ marginHorizontal: 8 }}
                enabled={Boolean(selectedCountry && cities.length > 0)}
              >
                {cities.map((city) => (
                  <Picker.Item
                    key={`${city.countryCode}-${city.stateCode}-${city.name}`}
                    label={city.name}
                    value={city.name}
                  />
                ))}
              </Picker>
            </YStack>
          </Card>
          
          <Button
            size="$5"
            backgroundColor="$blue10"
            borderColor="$blue10"
            color="white"
            borderRadius="$button"
            onPress={handleSignUp}
            disabled={loading}
            hoverStyle={{ backgroundColor: '$blue11' }}
            pressStyle={{ backgroundColor: '$blue9' }}
            shadowColor="$blue10"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.3}
            shadowRadius={8}
            elevation={6}
            icon={loading ? undefined : UserPlus}
            marginTop="$2"
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
                Sign Up
              </Text>
            )}
          </Button>
          
          <Button
            size="$4"
            variant="outlined"
            backgroundColor="transparent"
            borderColor="transparent"
            color="$blue10"
            onPress={() => router.push('/(auth)/login')}
            hoverStyle={{ backgroundColor: '$blue3' }}
            pressStyle={{ backgroundColor: '$blue4' }}
            marginTop="$2"
          >
            <Text fontSize="$3" color="$blue10">
              Already have an account? Sign in
            </Text>
          </Button>
        </YStack>
      </Card>
    </ScrollView>
  )
}

