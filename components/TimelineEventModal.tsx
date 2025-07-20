import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type TimelineEventModalProps = {
  visible: boolean;
  onClose: () => void;
  dogId: string;
  onEventAdded: () => void;
};

export default function TimelineEventModal({
  visible,
  onClose,
  dogId,
  onEventAdded,
}: TimelineEventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState('note');
  const [privacyLevel, setPrivacyLevel] = useState('public');
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAuth();

  const eventTypes = [
    { value: 'vet', label: '🏥 Vet Visit', description: 'Medical checkup, vaccination, treatment' },
    { value: 'adoption', label: '🏠 Adoption', description: 'Adoption meeting or process' },
    { value: 'transfer', label: '🚐 Transfer', description: 'Moving to new location or foster' },
    { value: 'note', label: '📝 General Note', description: 'General update or observation' },
    { value: 'incident', label: '⚠️ Incident', description: 'Important event or concern' },
  ];

  const privacyLevels = [
    { value: 'public', label: '🌐 Public', description: 'Visible to all users' },
    { value: 'private', label: '🔒 Private', description: 'Visible to volunteers and admins' },
    { value: 'sensitive', label: '🔐 Sensitive', description: 'Visible to admins only' },
  ];

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEventType('note');
    setPrivacyLevel('public');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the event');
      return;
    }

    if (!userProfile) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('events').insert({
        dog_id: dogId,
        title: title.trim(),
        description: description.trim() || null,
        event_type: eventType,
        privacy_level: privacyLevel,
        created_by: userProfile.id,
      });

      if (error) {
        console.error('Error creating event:', error);
        Alert.alert('Error', 'Failed to create event');
      } else {
        Alert.alert('Success', 'Event added successfully!');
        onEventAdded();
        handleClose();
      }
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const selectedEventType = eventTypes.find(type => type.value === eventType);
  const selectedPrivacyLevel = privacyLevels.find(level => level.value === privacyLevel);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Add Event</Text>
            <TouchableOpacity 
              onPress={handleSubmit} 
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Event Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Event Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={eventType}
                  onValueChange={setEventType}
                  style={styles.picker}
                >
                  {eventTypes.map((type) => (
                    <Picker.Item
                      key={type.value}
                      label={type.label}
                      value={type.value}
                    />
                  ))}
                </Picker>
              </View>
              {selectedEventType && (
                <Text style={styles.typeDescription}>
                  {selectedEventType.description}
                </Text>
              )}
            </View>

            {/* Title */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Title</Text>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter event title..."
                maxLength={100}
                autoCapitalize="sentences"
                returnKeyType="next"
              />
              <Text style={styles.characterCount}>{title.length}/100</Text>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Add more details about this event..."
                multiline
                numberOfLines={4}
                maxLength={500}
                autoCapitalize="sentences"
                textAlignVertical="top"
              />
              <Text style={styles.characterCount}>{description.length}/500</Text>
            </View>

            {/* Privacy Level */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Privacy Level</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={privacyLevel}
                  onValueChange={setPrivacyLevel}
                  style={styles.picker}
                >
                  {privacyLevels.map((level) => (
                    <Picker.Item
                      key={level.value}
                      label={level.label}
                      value={level.value}
                    />
                  ))}
                </Picker>
              </View>
              {selectedPrivacyLevel && (
                <Text style={styles.privacyDescription}>
                  {selectedPrivacyLevel.description}
                </Text>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  cancelButton: {
    padding: 4,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 8,
  },
  picker: {
    marginHorizontal: 8,
  },
  typeDescription: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
  privacyDescription: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 4,
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },
  characterCount: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
  },
});