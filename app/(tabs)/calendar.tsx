import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  type: 'vet' | 'adoption' | 'transfer' | 'sterilization' | 'other';
  dog_name?: string;
  description?: string;
};

export default function CalendarScreen() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { userProfile } = useAuth();

  useEffect(() => {
    if (userProfile) {
      fetchEvents();
    }
  }, [userProfile]);

  const fetchEvents = async () => {
    if (!userProfile) return;

    setLoading(true);
    
    // For now, we'll create mock events since we don't have a calendar events table yet
    // In a real implementation, you'd fetch from a calendar_events table
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Vet Checkup - Aisha',
        date: '2025-07-22',
        type: 'vet',
        dog_name: 'Aisha',
        description: 'Regular checkup and vaccination'
      },
      {
        id: '2',
        title: 'Adoption Meeting - Max',
        date: '2025-07-24',
        type: 'adoption',
        dog_name: 'Max',
        description: 'Meet potential adopters'
      },
      {
        id: '3',
        title: 'Transfer to Foster - Luna',
        date: '2025-07-26',
        type: 'transfer',
        dog_name: 'Luna',
        description: 'Move to temporary foster home'
      }
    ];

    setEvents(mockEvents);
    setLoading(false);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'vet': return '#10b981';
      case 'adoption': return '#8b5cf6';
      case 'transfer': return '#f59e0b';
      case 'sterilization': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'vet': return '🏥';
      case 'adoption': return '🏠';
      case 'transfer': return '🚐';
      case 'sterilization': return '⚕️';
      default: return '📅';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderEvent = (event: CalendarEvent) => (
    <TouchableOpacity key={event.id} style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <View style={styles.eventTypeContainer}>
          <Text style={styles.eventIcon}>{getEventTypeIcon(event.type)}</Text>
          <View style={[styles.eventTypeBadge, { backgroundColor: getEventTypeColor(event.type) }]}>
            <Text style={styles.eventTypeText}>{event.type}</Text>
          </View>
        </View>
        <Text style={styles.eventDate}>{formatDate(event.date)}</Text>
      </View>
      
      <Text style={styles.eventTitle}>{event.title}</Text>
      
      {event.description && (
        <Text style={styles.eventDescription}>{event.description}</Text>
      )}
    </TouchableOpacity>
  );

  const canManageEvents = userProfile?.role === 'admin' || userProfile?.role === 'volunteer';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
        {canManageEvents && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => Alert.alert('Add Event', 'This feature will be implemented soon!')}
          >
            <Text style={styles.addButtonText}>+ Add Event</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Upcoming Events</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading events...</Text>
            </View>
          ) : events.length > 0 ? (
            <View style={styles.eventsContainer}>
              {events.map(renderEvent)}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No upcoming events</Text>
              <Text style={styles.emptySubtext}>
                {canManageEvents ? 'Add your first event!' : 'Check back later for updates'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Quick Stats</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.statLabel}>Overdue</Text>
            </View>
          </View>
        </View>

        {!canManageEvents && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>ℹ️ Limited Access</Text>
            <Text style={styles.infoText}>
              You can view events but cannot create or modify them. Contact an admin for more permissions.
            </Text>
          </View>
        )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
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
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  eventsContainer: {
    gap: 12,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
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
    marginBottom: 12,
  },
  eventTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventIcon: {
    fontSize: 20,
  },
  eventTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventTypeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  eventDate: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fbbf24',
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
});