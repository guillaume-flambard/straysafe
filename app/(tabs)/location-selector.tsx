import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';

type Location = {
  id: string
  name: string
  country: string
}

export default function LocationSelectorScreen() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const { userProfile, user } = useAuth();

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
      Alert.alert(
        'Success', 
        'Location updated successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
    
    setLoading(false);
  };

  const selectedLocationName = locations.find(loc => loc.id === selectedLocation);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Changer de localisation</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Localisation actuelle</Text>
          <Text style={styles.currentLocation}>
            {userProfile ? `${locations.find(l => l.id === userProfile.location_id)?.name}, ${locations.find(l => l.id === userProfile.location_id)?.country}` : 'Non définie'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Nouvelle localisation</Text>
          <Text style={styles.description}>
            Changez votre localisation pour voir les chiens d'une autre région
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

          {selectedLocationName && (
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>Vous allez voir les chiens de :</Text>
              <Text style={styles.previewLocation}>
                📍 {selectedLocationName.name}, {selectedLocationName.country}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.updateButton, loading && styles.updateButtonDisabled]} 
          onPress={updateUserLocation}
          disabled={loading || selectedLocation === userProfile?.location_id}
        >
          <Text style={styles.updateButtonText}>
            {loading ? 'Mise à jour...' : 'Mettre à jour la localisation'}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 À savoir</Text>
          <Text style={styles.infoText}>
            • Vous verrez uniquement les chiens de la localisation sélectionnée{'\n'}
            • Vous pouvez changer à tout moment{'\n'}
            • Les vétérinaires et bénévoles travaillent par région
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2563eb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  currentLocation: {
    fontSize: 16,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  picker: {
    marginHorizontal: 8,
  },
  previewCard: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
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
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  updateButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#fefce8',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde047',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#a16207',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#a16207',
    lineHeight: 20,
  },
});