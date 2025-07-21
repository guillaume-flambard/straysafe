import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import {
  YStack,
  XStack,
  Text,
  Card,
  Button,
  ScrollView,
  View,
} from 'tamagui';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';
import { ArrowLeft, MapPin, Check } from 'lucide-react-native';

type Location = {
  id: string
  name: string
  country: string
}

export default function ChangeLocationScreen() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [countries, setCountries] = useState<string[]>([]);
  const [availableLocations, setAvailableLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const { userProfile, user } = useAuth();

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (userProfile) {
      setSelectedLocation(userProfile.location_id);
      // Find the country for the current user's location
      const userLocation = locations.find(loc => loc.id === userProfile.location_id);
      if (userLocation) {
        setSelectedCountry(userLocation.country);
      }
    }
  }, [userProfile, locations]);

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('country, name');
    
    if (error) {
      console.error('Error fetching locations:', error);
    } else {
      const allLocations = data || [];
      setLocations(allLocations);
      
      // Extract unique countries
      const uniqueCountries = [...new Set(allLocations.map(loc => loc.country))].sort();
      setCountries(uniqueCountries);
      
      // If user has a location, set the country and available locations
      if (userProfile?.location_id) {
        const userLocation = allLocations.find(loc => loc.id === userProfile.location_id);
        if (userLocation) {
          setSelectedCountry(userLocation.country);
          const countryLocations = allLocations.filter(loc => loc.country === userLocation.country);
          setAvailableLocations(countryLocations);
        }
      }
    }
  };

  // Update available locations when country changes
  useEffect(() => {
    if (selectedCountry) {
      const countryLocations = locations.filter(loc => loc.country === selectedCountry);
      setAvailableLocations(countryLocations);
      if (countryLocations.length > 0 && !countryLocations.find(loc => loc.id === selectedLocation)) {
        setSelectedLocation(countryLocations[0].id);
      }
    }
  }, [selectedCountry, locations]);

  const updateUserLocation = async () => {
    if (!selectedLocation || !user) {
      Alert.alert('Error', 'Please select a location');
      return;
    }

    setLoading(true);
    
    const { error } = await supabase
      .from('users')
      .update({ location_id: selectedLocation })
      .eq('id', user.id);

    if (error) {
      Alert.alert('Error', 'Failed to update location');
      console.error('Error updating location:', error);
    } else {
      Alert.alert('Success', 'Location updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
    
    setLoading(false);
  };

  const currentLocationName = locations.find(loc => loc.id === userProfile?.location_id);
  const selectedLocationName = availableLocations.find(loc => loc.id === selectedLocation);

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header */}
      <YStack
        paddingHorizontal="$6"
        paddingVertical="$4"
        paddingTop="$12"
        backgroundColor="$backgroundStrong"
        borderBottomLeftRadius="$glass"
        borderBottomRightRadius="$glass"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
        shadowColor="$shadowColor"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.15}
        shadowRadius={12}
        elevation={8}
        gap="$4"
      >
        <XStack alignItems="center" gap="$3">
          <Button
            size="$3"
            variant="outlined"
            backgroundColor="rgba(255, 255, 255, 0.9)"
            borderColor="rgba(203, 213, 225, 0.6)"
            color="#6b7280"
            borderRadius={8}
            onPress={() => router.back()}
            icon={ArrowLeft}
          />
          <Text fontSize="$7" fontWeight="bold" color="$gray12" flex={1}>
            Change Location
          </Text>
        </XStack>
        
        <Text fontSize="$3" color="#64748b" textAlign="center">
          Switch to see dogs from a different region
        </Text>
      </YStack>
      
      <ScrollView
        flex={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        {/* Current Location */}
        <Card
          elevate
          size="$4"
          bordered
          backgroundColor="rgba(255, 255, 255, 0.95)"
          borderColor="rgba(203, 213, 225, 0.6)"
          padding="$5"
          marginBottom="$6"
          borderRadius={12}
          shadowColor="rgba(0, 0, 0, 0.1)"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={4}
          elevation={4}
        >
          <XStack alignItems="center" gap="$3" marginBottom="$3">
            <View
              backgroundColor="#10b981"
              borderRadius={8}
              padding="$2"
            >
              <Check size={16} color="white" />
            </View>
            <Text fontSize="$5" fontWeight="600" color="#1e293b">
              Current Location
            </Text>
          </XStack>
          
          <View
            backgroundColor="rgba(16, 185, 129, 0.1)"
            borderColor="#10b981"
            borderWidth={1}
            padding="$4"
            borderRadius={8}
          >
            <XStack alignItems="center" gap="$2">
              <MapPin size={16} color="#10b981" />
              <Text fontSize="$4" color="#065f46" fontWeight="600">
                {currentLocationName ? `${currentLocationName.name}, ${currentLocationName.country}` : 'Not set'}
              </Text>
            </XStack>
          </View>
        </Card>

        {/* Change Location */}
        <Card
          elevate
          size="$4"
          bordered
          backgroundColor="rgba(255, 255, 255, 0.95)"
          borderColor="rgba(203, 213, 225, 0.6)"
          padding="$5"
          borderRadius={12}
          shadowColor="rgba(0, 0, 0, 0.1)"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={4}
          elevation={4}
        >
          <XStack alignItems="center" gap="$3" marginBottom="$4">
            <View
              backgroundColor="#3b82f6"
              borderRadius={8}
              padding="$2"
            >
              <MapPin size={16} color="white" />
            </View>
            <Text fontSize="$5" fontWeight="600" color="#1e293b">
              Select New Location
            </Text>
          </XStack>
          
          {/* Country Selection */}
          <YStack gap="$3" marginBottom="$4">
            <Text fontSize="$3" color="#6b7280" fontWeight="600">
              🌍 Country
            </Text>
            <View
              borderWidth={1}
              borderColor="rgba(203, 213, 225, 0.6)"
              borderRadius={8}
              backgroundColor="rgba(255, 255, 255, 0.9)"
              shadowColor="rgba(0, 0, 0, 0.1)"
              shadowOffset={{ width: 0, height: 1 }}
              shadowOpacity={0.1}
              shadowRadius={2}
            >
              <Picker
                selectedValue={selectedCountry}
                onValueChange={setSelectedCountry}
                style={{ marginHorizontal: 8 }}
              >
                {countries.map((country) => (
                  <Picker.Item
                    key={country}
                    label={country}
                    value={country}
                  />
                ))}
              </Picker>
            </View>
          </YStack>

          {/* Location Selection */}
          <YStack gap="$3" marginBottom="$4">
            <Text fontSize="$3" color="#6b7280" fontWeight="600">
              📍 City/Location
            </Text>
            <View
              borderWidth={1}
              borderColor="rgba(203, 213, 225, 0.6)"
              borderRadius={8}
              backgroundColor="rgba(255, 255, 255, 0.9)"
              shadowColor="rgba(0, 0, 0, 0.1)"
              shadowOffset={{ width: 0, height: 1 }}
              shadowOpacity={0.1}
              shadowRadius={2}
              opacity={selectedCountry ? 1 : 0.5}
            >
              <Picker
                selectedValue={selectedLocation}
                onValueChange={setSelectedLocation}
                style={{ marginHorizontal: 8 }}
                enabled={Boolean(selectedCountry && availableLocations.length > 0)}
              >
                {availableLocations.map((location) => (
                  <Picker.Item
                    key={location.id}
                    label={location.name}
                    value={location.id}
                  />
                ))}
              </Picker>
            </View>
          </YStack>

          {/* Preview */}
          {selectedLocationName && selectedLocation !== userProfile?.location_id && (
            <Card
              backgroundColor="rgba(59, 130, 246, 0.1)"
              borderColor="#3b82f6"
              borderWidth={1}
              padding="$4"
              borderRadius={8}
              marginBottom="$4"
            >
              <Text fontSize="$3" color="#1e40af" fontWeight="500" marginBottom="$1">
                You&apos;ll see dogs from:
              </Text>
              <XStack alignItems="center" gap="$2">
                <MapPin size={16} color="#3b82f6" />
                <Text fontSize="$4" color="#1e40af" fontWeight="bold">
                  {selectedLocationName.name}, {selectedCountry}
                </Text>
              </XStack>
            </Card>
          )}

          {/* Update Button */}
          <Button
            size="$5"
            backgroundColor={loading || selectedLocation === userProfile?.location_id ? "#9ca3af" : "#3b82f6"}
            borderColor={loading || selectedLocation === userProfile?.location_id ? "#9ca3af" : "#3b82f6"}
            color="white"
            borderRadius={12}
            onPress={updateUserLocation}
            disabled={loading || selectedLocation === userProfile?.location_id}
            hoverStyle={!loading && selectedLocation !== userProfile?.location_id ? { backgroundColor: '#1d4ed8' } : {}}
            pressStyle={!loading && selectedLocation !== userProfile?.location_id ? { backgroundColor: '#2563eb' } : {}}
            shadowColor={!loading && selectedLocation !== userProfile?.location_id ? "#3b82f6" : "transparent"}
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.3}
            shadowRadius={8}
            elevation={6}
            icon={loading ? undefined : Check}
          >
            <Text fontSize="$4" fontWeight="600" color="white">
              {loading ? 'Updating Location...' : 'Update Location'}
            </Text>
          </Button>
        </Card>
      </ScrollView>
    </YStack>
  );
}