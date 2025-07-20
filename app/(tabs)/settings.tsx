import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';

type Location = {
  id: string
  name: string
  country: string
}

export default function SettingsScreen() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const { userProfile, user, signOut } = useAuth();

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (userProfile) {
      setSelectedLocation(userProfile.location_id);
    }
  }, [userProfile]);

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching locations:', error);
    } else {
      setLocations(data || []);
    }
  };

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
  const selectedLocationName = locations.find(loc => loc.id === selectedLocation);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Location Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Location</Text>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Current Location</Text>
            <Text style={styles.currentLocation}>
              {currentLocationName ? `${currentLocationName.name}, ${currentLocationName.country}` : 'Not set'}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Change Location</Text>
            <Text style={styles.description}>
              Switch to see dogs from a different region
            </Text>
            
            <View style={styles.pickerContainer}>
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

            {selectedLocationName && selectedLocation !== userProfile?.location_id && (
              <View style={styles.previewCard}>
                <Text style={styles.previewTitle}>You'll see dogs from:</Text>
                <Text style={styles.previewLocation}>
                  📍 {selectedLocationName.name}, {selectedLocationName.country}
                </Text>
              </View>
            )}

            <TouchableOpacity 
              style={[
                styles.updateButton, 
                (loading || selectedLocation === userProfile?.location_id) && styles.updateButtonDisabled
              ]} 
              onPress={updateUserLocation}
              disabled={loading || selectedLocation === userProfile?.location_id}
            >
              <Text style={styles.updateButtonText}>
                {loading ? 'Updating...' : 'Update Location'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Account</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Edit Profile</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Notifications</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Privacy</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ App</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Help & Support</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>About</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  currentLocation: {
    fontSize: 16,
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    marginBottom: 16,
  },
  picker: {
    marginHorizontal: 8,
  },
  previewCard: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  previewTitle: {
    fontSize: 14,
    color: '#1d4ed8',
    fontWeight: '500',
  },
  previewLocation: {
    fontSize: 16,
    color: '#1e40af',
    fontWeight: 'bold',
    marginTop: 4,
  },
  updateButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  updateButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingText: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '500',
  },
  settingArrow: {
    fontSize: 20,
    color: '#94a3b8',
    fontWeight: '300',
  },
  signOutButton: {
    backgroundColor: '#ef4444',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});