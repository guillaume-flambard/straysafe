import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Typography } from './design-system/Typography';
import { AnimatedButton } from './design-system/AnimatedButton';
import { AnimatedCard } from './design-system/AnimatedCard';
import { SlideInModal } from './design-system/SlideInModal';
import { FadeInView } from './design-system/FadeInView';
import { Colors, Spacing, BorderRadius } from '../constants/DesignTokens';

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
    <SlideInModal
      visible={visible}
      onClose={handleClose}
      animationType="slide"
      position="bottom"
      maxHeight="90%"
    >
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header with glassmorphism and animation */}
        <FadeInView duration={300}>
          <AnimatedCard variant="glass" style={styles.header}>
            <AnimatedButton
              title="Cancel"
              variant="ghost"
              size="small"
              hapticFeedback={true}
              onPress={handleClose}
            />
            
            <Typography variant="h1" color="primary">
              Add Event
            </Typography>
            
            <AnimatedButton
              title={loading ? 'Saving...' : 'Save'}
              variant="primary"
              size="small"
              loading={loading}
              disabled={loading}
              hapticFeedback={true}
              bounceEffect={true}
              onPress={handleSubmit}
            />
          </AnimatedCard>
        </FadeInView>

          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Event Type with staggered animation */}
            <FadeInView delay={100} slideFromBottom>
              <View style={styles.section}>
                <Typography variant="h2" color="primary" style={styles.sectionTitle}>
                  Event Type
                </Typography>
                <AnimatedCard variant="neumorphic" style={styles.pickerCard}>
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
                </AnimatedCard>
                {selectedEventType && (
                  <Typography variant="body-small" color="muted" style={styles.description}>
                    {selectedEventType.description}
                  </Typography>
                )}
              </View>
            </FadeInView>

            {/* Title with animation */}
            <FadeInView delay={200} slideFromBottom>
              <View style={styles.section}>
                <Typography variant="h2" color="primary" style={styles.sectionTitle}>
                  Title
                </Typography>
                <AnimatedCard variant="neumorphic" style={styles.inputCard}>
                  <TextInput
                    style={styles.textInput}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Enter event title..."
                    placeholderTextColor={Colors.neutral[400]}
                    maxLength={100}
                    autoCapitalize="sentences"
                    returnKeyType="next"
                  />
                </AnimatedCard>
                <Typography variant="caption" color="muted" align="right" style={styles.characterCount}>
                  {title.length}/100
                </Typography>
              </View>
            </FadeInView>

            {/* Description with animation */}
            <FadeInView delay={300} slideFromBottom>
              <View style={styles.section}>
                <Typography variant="h2" color="primary" style={styles.sectionTitle}>
                  Description (Optional)
                </Typography>
                <AnimatedCard variant="neumorphic" style={styles.inputCard}>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Add more details about this event..."
                    placeholderTextColor={Colors.neutral[400]}
                    multiline
                    numberOfLines={4}
                    maxLength={500}
                    autoCapitalize="sentences"
                    textAlignVertical="top"
                  />
                </AnimatedCard>
                <Typography variant="caption" color="muted" align="right" style={styles.characterCount}>
                  {description.length}/500
                </Typography>
              </View>
            </FadeInView>

            {/* Privacy Level with animation */}
            <FadeInView delay={400} slideFromBottom>
              <View style={styles.section}>
                <Typography variant="h2" color="primary" style={styles.sectionTitle}>
                  Privacy Level
                </Typography>
                <AnimatedCard variant="neumorphic" style={styles.pickerCard}>
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
                </AnimatedCard>
                {selectedPrivacyLevel && (
                  <Typography variant="body-small" color="muted" style={styles.description}>
                    {selectedPrivacyLevel.description}
                  </Typography>
                )}
              </View>
            </FadeInView>
          </ScrollView>
        </KeyboardAvoidingView>
    </SlideInModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  
  keyboardAvoid: {
    flex: 1,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: Spacing.gutter,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  
  content: {
    flex: 1,
    paddingHorizontal: Spacing.gutter,
  },
  
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  
  section: {
    marginBottom: Spacing.sectionGap,
  },
  
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  
  pickerCard: {
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  
  picker: {
    marginHorizontal: Spacing.sm,
  },
  
  inputCard: {
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  
  textInput: {
    fontSize: 16,
    color: Colors.neutral[800],
    padding: 0, // Card provides the padding
    minHeight: 24,
  },
  
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  
  description: {
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  
  characterCount: {
    marginTop: Spacing.xs,
  },
});