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
  Spinner,
  View,
  useTheme
} from 'tamagui';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import { Settings, LogOut, ChevronRight } from 'lucide-react-native';

type Location = {
  id: string
  name: string
  country: string
}

export default function SettingsScreen() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [countries, setCountries] = useState<string[]>([]);
  const [availableLocations, setAvailableLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const { userProfile, user, signOut } = useAuth();
  const theme = useTheme();

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
      Alert.alert('Success', 'Location updated successfully!');
    }
    
    setLoading(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const currentLocationName = locations.find(loc => loc.id === userProfile?.location_id);
  const selectedLocationName = availableLocations.find(loc => loc.id === selectedLocation);

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Glassmorphism Header */}
      <XStack
        justifyContent="center"
        alignItems="center"
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
      >
        <Text fontSize="$8" fontWeight="bold" color="$color12">
          Settings
        </Text>
      </XStack>
      
      <ScrollView
        flex={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        {/* Location Settings */}
        <YStack marginBottom="$8">
          <Text fontSize="$6" fontWeight="bold" color="$color12" marginBottom="$4">
            📍 Location
          </Text>
          
          <Card
            elevate
            size="$4"
            bordered
            backgroundColor="$backgroundSoft"
            borderColor="$borderColor"
            padding="$5"
            marginBottom="$3"
          >
            <Text fontSize="$4" fontWeight="600" color="$color12" marginBottom="$2">
              Current Location
            </Text>
            <View
              backgroundColor="$gray3"
              padding="$3"
              borderRadius="$2"
            >
              <Text fontSize="$4" color="#6b7280">
                {currentLocationName ? `${currentLocationName.name}, ${currentLocationName.country}` : 'Not set'}
              </Text>
            </View>
          </Card>

          <Card
            elevate
            size="$4"
            bordered
            backgroundColor="$backgroundSoft"
            borderColor="$borderColor"
            padding="$5"
          >
            <Text fontSize="$4" fontWeight="600" color="$color12" marginBottom="$2">
              Change Location
            </Text>
            <Text fontSize="$3" color="#6b7280" marginBottom="$4">
              Switch to see dogs from a different region
            </Text>
            
            {/* Country Selection */}
            <View
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius="$3"
              backgroundColor="$gray2"
              marginBottom="$3"
            >
              <Text fontSize="$3" color="#6b7280" paddingHorizontal="$3" paddingTop="$2">
                🌍 Country
              </Text>
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

            {/* Location Selection */}
            <View
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius="$3"
              backgroundColor="$gray2"
              marginBottom="$4"
              opacity={selectedCountry ? 1 : 0.5}
            >
              <Text fontSize="$3" color="#6b7280" paddingHorizontal="$3" paddingTop="$2">
                📍 City/Location
              </Text>
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

            {selectedLocationName && selectedLocation !== userProfile?.location_id && (
              <Card
                backgroundColor="$blue3"
                padding="$4"
                borderRadius="$3"
                marginBottom="$4"
                borderWidth={1}
                borderColor="$blue8"
              >
                <Text fontSize="$3" color="$blue11" fontWeight="500">
                  You'll see dogs from:
                </Text>
                <Text fontSize="$4" color="$blue12" fontWeight="bold" marginTop="$1">
                  📍 {selectedLocationName.name}, {selectedCountry}
                </Text>
              </Card>
            )}

            <Button
              size="$4"
              backgroundColor={loading || selectedLocation === userProfile?.location_id ? "$gray8" : "#3b82f6"}
              borderColor={loading || selectedLocation === userProfile?.location_id ? "$gray8" : "#3b82f6"}
              color="white"
              borderRadius="$3"
              onPress={updateUserLocation}
              disabled={loading || selectedLocation === userProfile?.location_id}
              hoverStyle={!loading && selectedLocation !== userProfile?.location_id ? { backgroundColor: '$blue11' } : {}}
              pressStyle={!loading && selectedLocation !== userProfile?.location_id ? { backgroundColor: '$blue9' } : {}}
            >
              {loading ? 'Updating...' : 'Update Location'}
            </Button>
          </Card>
        </YStack>

        {/* Account Settings */}
        <YStack marginBottom="$8">
          <Text fontSize="$6" fontWeight="bold" color="$color12" marginBottom="$4">
            👤 Account
          </Text>
          
          <Card
            elevate
            size="$4"
            bordered
            animation="bouncy"
            scale={0.9}
            hoverStyle={{ scale: 0.925 }}
            pressStyle={{ scale: 0.875 }}
            backgroundColor="$backgroundSoft"
            borderColor="$borderColor"
            marginBottom="$2"
            padding="$5"
          >
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$4" color="#6b7280" fontWeight="500">
                Edit Profile
              </Text>
              <ChevronRight size={20} color={theme.color10?.val} />
            </XStack>
          </Card>
          
          <Card
            elevate
            size="$4"
            bordered
            animation="bouncy"
            scale={0.9}
            hoverStyle={{ scale: 0.925 }}
            pressStyle={{ scale: 0.875 }}
            backgroundColor="$backgroundSoft"
            borderColor="$borderColor"
            marginBottom="$2"
            padding="$5"
          >
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$4" color="#6b7280" fontWeight="500">
                Notifications
              </Text>
              <ChevronRight size={20} color={theme.color10?.val} />
            </XStack>
          </Card>
          
          <Card
            elevate
            size="$4"
            bordered
            animation="bouncy"
            scale={0.9}
            hoverStyle={{ scale: 0.925 }}
            pressStyle={{ scale: 0.875 }}
            backgroundColor="$backgroundSoft"
            borderColor="$borderColor"
            padding="$5"
          >
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$4" color="#6b7280" fontWeight="500">
                Privacy
              </Text>
              <ChevronRight size={20} color={theme.color10?.val} />
            </XStack>
          </Card>
        </YStack>

        {/* App Settings */}
        <YStack marginBottom="$8">
          <Text fontSize="$6" fontWeight="bold" color="$color12" marginBottom="$4">
            ⚙️ App
          </Text>
          
          <Card
            elevate
            size="$4"
            bordered
            animation="bouncy"
            scale={0.9}
            hoverStyle={{ scale: 0.925 }}
            pressStyle={{ scale: 0.875 }}
            backgroundColor="$backgroundSoft"
            borderColor="$borderColor"
            marginBottom="$2"
            padding="$5"
          >
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$4" color="#6b7280" fontWeight="500">
                Help & Support
              </Text>
              <ChevronRight size={20} color={theme.color10?.val} />
            </XStack>
          </Card>
          
          <Card
            elevate
            size="$4"
            bordered
            animation="bouncy"
            scale={0.9}
            hoverStyle={{ scale: 0.925 }}
            pressStyle={{ scale: 0.875 }}
            backgroundColor="$backgroundSoft"
            borderColor="$borderColor"
            padding="$5"
          >
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$4" color="#6b7280" fontWeight="500">
                About
              </Text>
              <ChevronRight size={20} color={theme.color10?.val} />
            </XStack>
          </Card>
        </YStack>

        {/* Sign Out */}
        <Button
          icon={LogOut}
          size="$5"
          backgroundColor="$red10"
          borderColor="$red10"
          color="white"
          borderRadius="$4"
          onPress={handleSignOut}
          marginTop="$5"
          marginBottom="$10"
          hoverStyle={{ backgroundColor: '$red11' }}
          pressStyle={{ backgroundColor: '$red9' }}
          shadowColor="$red10"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.3}
          shadowRadius={8}
          elevation={5}
        >
          <Text fontSize="$5" fontWeight="700" color="white">
            Sign Out
          </Text>
        </Button>
      </ScrollView>
    </YStack>
  );
}

