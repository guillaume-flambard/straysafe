import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';

type Dog = Database['public']['Tables']['dogs']['Row'];
type Event = Database['public']['Tables']['events']['Row'];

export default function DogProfileScreen() {
  const { id } = useLocalSearchParams();
  const [dog, setDog] = useState<Dog | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();

  useEffect(() => {
    if (id && userProfile) {
      fetchDogDetails();
      fetchDogEvents();
    }
  }, [id, userProfile]);

  const fetchDogDetails = async () => {
    const { data, error } = await supabase
      .from('dogs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching dog:', error);
      Alert.alert('Error', 'Failed to load dog details');
      router.back();
    } else {
      setDog(data);
    }
  };

  const fetchDogEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('dog_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching events:', error);
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#10b981';
      case 'fostered': return '#3b82f6';
      case 'adopted': return '#8b5cf6';
      case 'injured': return '#ef4444';
      case 'missing': return '#f59e0b';
      case 'hidden': return '#6b7280';
      case 'deceased': return '#374151';
      default: return '#6b7280';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'vet': return '🏥';
      case 'adoption': return '🏠';
      case 'transfer': return '🚐';
      case 'note': return '📝';
      case 'incident': return '⚠️';
      default: return '📅';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} old`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''} old`;
    } else {
      return 'Less than 1 month old';
    }
  };

  const canAddEvent = userProfile?.role === 'admin' || userProfile?.role === 'volunteer';

  if (!dog) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{dog.name}</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Dog Header */}
        <View style={styles.dogHeaderCard}>
          <View style={styles.dogImagePlaceholder}>
            <Text style={styles.dogInitial}>{dog.name.charAt(0)}</Text>
          </View>
          
          <View style={styles.dogHeaderInfo}>
            <Text style={styles.dogName}>{dog.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(dog.status) }]}>
              <Text style={styles.statusText}>{dog.status}</Text>
            </View>
            
            <View style={styles.dogBasicInfo}>
              <Text style={styles.dogDetail}>
                {dog.gender === 'male' ? '♂️' : '♀️'} {dog.gender}
              </Text>
              {dog.birth_date && (
                <Text style={styles.dogDetail}>
                  🎂 {calculateAge(dog.birth_date)}
                </Text>
              )}
              <Text style={styles.dogDetail}>
                {dog.sterilized ? '✅ Sterilized' : '❌ Not sterilized'}
              </Text>
            </View>
          </View>
        </View>

        {/* Location & People */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Location & People</Text>
          
          <View style={styles.infoCard}>
            {dog.location_text && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Location:</Text>
                <Text style={styles.infoValue}>{dog.location_text}</Text>
              </View>
            )}
            
            {dog.rescue_date && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Rescue Date:</Text>
                <Text style={styles.infoValue}>
                  {new Date(dog.rescue_date).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Notes */}
        {dog.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{dog.notes}</Text>
            </View>
          </View>
        )}

        {/* Tags */}
        {dog.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏷️ Tags</Text>
            <View style={styles.tagsContainer}>
              {dog.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Timeline */}
        <View style={styles.section}>
          <View style={styles.timelineHeader}>
            <Text style={styles.sectionTitle}>📅 Timeline</Text>
            {canAddEvent && (
              <TouchableOpacity 
                style={styles.addEventButton}
                onPress={() => Alert.alert('Add Event', 'This feature will be implemented soon!')}
              >
                <Text style={styles.addEventButtonText}>+ Add Event</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {events.length > 0 ? (
            <View style={styles.timelineContainer}>
              {events.map((event, index) => (
                <View key={event.id} style={styles.eventCard}>
                  <View style={styles.eventHeader}>
                    <View style={styles.eventTypeContainer}>
                      <Text style={styles.eventIcon}>
                        {getEventTypeIcon(event.event_type)}
                      </Text>
                      <Text style={styles.eventType}>{event.event_type}</Text>
                    </View>
                    <Text style={styles.eventDate}>
                      {formatDate(event.created_at)}
                    </Text>
                  </View>
                  
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  
                  {event.description && (
                    <Text style={styles.eventDescription}>{event.description}</Text>
                  )}
                  
                  <View style={styles.eventMeta}>
                    <Text style={styles.eventPrivacy}>
                      {event.privacy_level === 'public' ? '🌐' : 
                       event.privacy_level === 'private' ? '🔒' : '🔐'} 
                      {event.privacy_level}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyTimeline}>
              <Text style={styles.emptyTimelineText}>No events yet</Text>
              <Text style={styles.emptyTimelineSubtext}>
                {canAddEvent ? 'Add the first event for this dog!' : 'Check back later for updates'}
              </Text>
            </View>
          )}
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  dogHeaderCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  dogImagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#e0e7ff',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  dogInitial: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  dogHeaderInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  dogName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dogBasicInfo: {
    gap: 4,
  },
  dogDetail: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
  },
  notesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  notesText: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tagText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addEventButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addEventButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  timelineContainer: {
    gap: 12,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventIcon: {
    fontSize: 16,
  },
  eventType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    textTransform: 'capitalize',
  },
  eventDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  eventPrivacy: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'capitalize',
  },
  emptyTimeline: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyTimelineText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  emptyTimelineSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});