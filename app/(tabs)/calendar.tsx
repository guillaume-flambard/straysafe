import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  YStack,
  XStack,
  Text,
  Card,
  Button,
  ScrollView,
  Spinner,
  View
} from 'tamagui';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Calendar, Clock, MapPin, User } from 'lucide-react-native';

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
    
    // Enhanced mock events with more detail for modern UI
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Vet Checkup - Aisha',
        date: '2025-07-22',
        type: 'vet',
        dog_name: 'Aisha',
        description: 'Regular checkup and vaccination - Dr. Noon Clinic'
      },
      {
        id: '2',
        title: 'Adoption Meeting - Max',
        date: '2025-07-24',
        type: 'adoption',
        dog_name: 'Max',
        description: 'Meet potential adopters - Family visit at 2:00 PM'
      },
      {
        id: '3',
        title: 'Transfer to Foster - Luna',
        date: '2025-07-26',
        type: 'transfer',
        dog_name: 'Luna',
        description: 'Move to temporary foster home - Alexandra\'s place'
      },
      {
        id: '4',
        title: 'Sterilization - Buddy',
        date: '2025-07-28',
        type: 'sterilization',
        dog_name: 'Buddy',
        description: 'Scheduled sterilization surgery - Morning appointment'
      },
      {
        id: '5',
        title: 'Adoption Follow-up - Sandy',
        date: '2025-07-30',
        type: 'adoption',
        dog_name: 'Sandy',
        description: '1-week adoption check-in call'
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
    <Card
      key={event.id}
      elevate
      size="$4"
      bordered
      animation="bouncy"
      scale={1}
      hoverStyle={{ scale: 1.02 }}
      pressStyle={{ scale: 0.98 }}
      backgroundColor="rgba(255, 255, 255, 0.95)"
      borderColor="rgba(203, 213, 225, 0.6)"
      marginBottom="$3"
      padding="$5"
      borderRadius={16}
      shadowColor="rgba(0, 0, 0, 0.1)"
      shadowOffset={{ width: 0, height: 4 }}
      shadowOpacity={0.15}
      shadowRadius={8}
      elevation={6}
    >
      {/* Header Row */}
      <XStack justifyContent="space-between" alignItems="flex-start" marginBottom="$3">
        <XStack alignItems="center" gap="$3" flex={1}>
          {/* Icon Circle */}
          <View
            backgroundColor={getEventTypeColor(event.type)}
            borderRadius={12}
            padding="$2.5"
            shadowColor={getEventTypeColor(event.type)}
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.3}
            shadowRadius={4}
          >
            <Text fontSize="$4">{getEventTypeIcon(event.type)}</Text>
          </View>
          
          {/* Type Badge */}
          <View
            backgroundColor={`${getEventTypeColor(event.type)}15`}
            borderColor={getEventTypeColor(event.type)}
            borderWidth={1}
            paddingHorizontal="$3"
            paddingVertical="$1"
            borderRadius={8}
          >
            <Text 
              fontSize="$2" 
              color={getEventTypeColor(event.type)} 
              fontWeight="700" 
              textTransform="uppercase"
            >
              {event.type}
            </Text>
          </View>
        </XStack>
        
        {/* Date */}
        <YStack alignItems="flex-end">
          <XStack alignItems="center" gap="$1">
            <Clock size={14} color="#6b7280" />
            <Text fontSize="$2" color="#6b7280" fontWeight="600">
              {formatDate(event.date)}
            </Text>
          </XStack>
        </YStack>
      </XStack>
      
      {/* Title */}
      <Text fontSize="$5" fontWeight="700" color="#1e293b" marginBottom="$2" lineHeight="$2">
        {event.title}
      </Text>
      
      {/* Dog Name */}
      {event.dog_name && (
        <XStack alignItems="center" gap="$2" marginBottom="$2">
          <User size={14} color="#6b7280" />
          <Text fontSize="$3" color="#6b7280" fontWeight="600">
            Dog: {event.dog_name}
          </Text>
        </XStack>
      )}
      
      {/* Description */}
      {event.description && (
        <XStack alignItems="flex-start" gap="$2">
          <MapPin size={14} color="#6b7280" style={{ marginTop: 2 }} />
          <Text fontSize="$3" color="#64748b" lineHeight="$1" flex={1}>
            {event.description}
          </Text>
        </XStack>
      )}
    </Card>
  );

  const canManageEvents = userProfile?.role === 'admin' || userProfile?.role === 'volunteer';

  if (loading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Spinner size="large" color="#3b82f6" />
        <Text fontSize="$4" color="#6b7280" marginTop="$4">
          Loading calendar...
        </Text>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Modern Header */}
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
        gap="$3"
      >
        <XStack justifyContent="space-between" alignItems="center">
          <YStack flex={1}>
            <Text fontSize="$8" fontWeight="bold" color="$gray12">
              Calendar
            </Text>
            <Text fontSize="$4" color="#6b7280">
              Upcoming events and appointments
            </Text>
          </YStack>
          
          {canManageEvents && (
            <Button
              icon={Calendar}
              size="$4"
              variant="outlined"
              backgroundColor="#3b82f6"
              borderColor="#3b82f6"
              color="white"
              borderRadius="$button"
              onPress={() => Alert.alert('Add Event', 'To add an event, go to a specific dog\'s profile and use the timeline section.')}
              hoverStyle={{ backgroundColor: '$blue11' }}
              pressStyle={{ backgroundColor: '$blue9' }}
            >
              Add Event
            </Button>
          )}
        </XStack>
        
        {/* Quick Summary */}
        <XStack gap="$4" marginTop="$2">
          <XStack alignItems="center" gap="$2">
            <View
              backgroundColor="#10b981"
              borderRadius={6}
              padding="$1"
            >
              <Text fontSize="$2">🏥</Text>
            </View>
            <Text fontSize="$3" color="#6b7280" fontWeight="500">
              2 vet visits
            </Text>
          </XStack>
          <XStack alignItems="center" gap="$2">
            <View
              backgroundColor="#8b5cf6"
              borderRadius={6}
              padding="$1"
            >
              <Text fontSize="$2">🏠</Text>
            </View>
            <Text fontSize="$3" color="#6b7280" fontWeight="500">
              2 adoptions
            </Text>
          </XStack>
          <XStack alignItems="center" gap="$2">
            <View
              backgroundColor="#ef4444"
              borderRadius={6}
              padding="$1"
            >
              <Text fontSize="$2">⚕️</Text>
            </View>
            <Text fontSize="$3" color="#6b7280" fontWeight="500">
              1 surgery
            </Text>
          </XStack>
        </XStack>
      </YStack>
      
      <ScrollView
        flex={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        <YStack marginBottom="$6">
          <XStack alignItems="center" justifyContent="space-between" marginBottom="$4">
            <Text fontSize="$6" fontWeight="bold" color="$color12">
              📅 Upcoming Events
            </Text>
            <Text fontSize="$3" color="#6b7280" fontWeight="500">
              {events.length} events
            </Text>
          </XStack>
          
          {events.length > 0 ? (
            <YStack gap="$3">
              {events.map(renderEvent)}
            </YStack>
          ) : (
            <Card
              elevate
              size="$4"
              bordered
              backgroundColor="rgba(255, 255, 255, 0.95)"
              borderColor="rgba(203, 213, 225, 0.6)"
              padding="$8"
              alignItems="center"
              borderRadius={16}
              shadowColor="rgba(0, 0, 0, 0.1)"
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.15}
              shadowRadius={8}
              elevation={6}
            >
              <Text fontSize="$6" marginBottom="$2">📅</Text>
              <Text fontSize="$5" fontWeight="600" color="#6b7280" textAlign="center">
                No upcoming events
              </Text>
              <Text fontSize="$3" color="$color10" textAlign="center" marginTop="$2" lineHeight="$1">
                {canManageEvents ? 'Add your first event by visiting a dog\'s profile!' : 'Check back later for updates'}
              </Text>
            </Card>
          )}
        </YStack>

        <YStack marginBottom="$6">
          <Text fontSize="$6" fontWeight="bold" color="$color12" marginBottom="$4">
            📊 Quick Stats
          </Text>
          
          <XStack gap="$3">
            <Card
              flex={1}
              elevate
              size="$4"
              bordered
              backgroundColor="rgba(59, 130, 246, 0.05)"
              borderColor="rgba(59, 130, 246, 0.2)"
              padding="$4"
              alignItems="center"
              borderRadius={12}
              shadowColor="rgba(59, 130, 246, 0.1)"
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.2}
              shadowRadius={4}
              elevation={4}
            >
              <Text fontSize="$8" fontWeight="bold" color="#3b82f6" marginBottom="$1">
                3
              </Text>
              <Text fontSize="$2" color="#6b7280" fontWeight="600" textAlign="center">
                This Week
              </Text>
            </Card>
            <Card
              flex={1}
              elevate
              size="$4"
              bordered
              backgroundColor="rgba(16, 185, 129, 0.05)"
              borderColor="rgba(16, 185, 129, 0.2)"
              padding="$4"
              alignItems="center"
              borderRadius={12}
              shadowColor="rgba(16, 185, 129, 0.1)"
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.2}
              shadowRadius={4}
              elevation={4}
            >
              <Text fontSize="$8" fontWeight="bold" color="#10b981" marginBottom="$1">
                5
              </Text>
              <Text fontSize="$2" color="#6b7280" fontWeight="600" textAlign="center">
                This Month
              </Text>
            </Card>
            <Card
              flex={1}
              elevate
              size="$4"
              bordered
              backgroundColor="rgba(239, 68, 68, 0.05)"
              borderColor="rgba(239, 68, 68, 0.2)"
              padding="$4"
              alignItems="center"
              borderRadius={12}
              shadowColor="rgba(239, 68, 68, 0.1)"
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.2}
              shadowRadius={4}
              elevation={4}
            >
              <Text fontSize="$8" fontWeight="bold" color="#ef4444" marginBottom="$1">
                0
              </Text>
              <Text fontSize="$2" color="#6b7280" fontWeight="600" textAlign="center">
                Overdue
              </Text>
            </Card>
          </XStack>
        </YStack>

        {!canManageEvents && (
          <Card
            backgroundColor="rgba(251, 191, 36, 0.1)"
            borderColor="rgba(251, 191, 36, 0.3)"
            borderWidth={1}
            padding="$4"
            borderRadius={12}
            shadowColor="rgba(251, 191, 36, 0.1)"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.15}
            shadowRadius={4}
            elevation={4}
          >
            <XStack alignItems="center" gap="$2" marginBottom="$2">
              <View
                backgroundColor="#fbbf24"
                borderRadius={6}
                padding="$1"
              >
                <Text fontSize="$2">ℹ️</Text>
              </View>
              <Text fontSize="$4" fontWeight="bold" color="#92400e">
                Limited Access
              </Text>
            </XStack>
            <Text fontSize="$3" color="#92400e" lineHeight="$1">
              You can view events but cannot create or modify them. Contact an admin for more permissions.
            </Text>
          </Card>
        )}
      </ScrollView>
    </YStack>
  );
}

