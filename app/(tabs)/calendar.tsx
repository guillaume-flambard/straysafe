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
  View,
  useTheme
} from 'tamagui';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Calendar } from 'lucide-react-native';

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
  const theme = useTheme();

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
    <Card
      key={event.id}
      elevate
      size="$4"
      bordered
      animation="bouncy"
      scale={0.9}
      hoverStyle={{ scale: 0.925 }}
      pressStyle={{ scale: 0.875 }}
      backgroundColor="$backgroundSoft"
      borderColor="$borderColor"
      marginBottom="$3"
      padding="$4"
    >
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
        <XStack alignItems="center" gap="$2">
          <Text fontSize="$5">{getEventTypeIcon(event.type)}</Text>
          <View
            backgroundColor={getEventTypeColor(event.type)}
            paddingHorizontal="$3"
            paddingVertical="$1"
            borderRadius="$3"
          >
            <Text fontSize="$2" color="white" fontWeight="700" textTransform="uppercase">
              {event.type}
            </Text>
          </View>
        </XStack>
        <Text fontSize="$3" color="#6b7280" fontWeight="600">
          {formatDate(event.date)}
        </Text>
      </XStack>
      
      <Text fontSize="$5" fontWeight="600" color="$color12" marginBottom="$2">
        {event.title}
      </Text>
      
      {event.description && (
        <Text fontSize="$3" color="#6b7280" lineHeight="$1">
          {event.description}
        </Text>
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
      {/* Glassmorphism Header */}
      <XStack
        justifyContent="space-between"
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
          Calendar
        </Text>
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
            + Event
          </Button>
        )}
      </XStack>
      
      <ScrollView
        flex={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        <YStack marginBottom="$8">
          <Text fontSize="$6" fontWeight="bold" color="$color12" marginBottom="$4">
            📅 Upcoming Events
          </Text>
          
          {events.length > 0 ? (
            <YStack gap="$3">
              {events.map(renderEvent)}
            </YStack>
          ) : (
            <Card
              elevate
              size="$4"
              bordered
              backgroundColor="$backgroundSoft"
              borderColor="$borderColor"
              padding="$8"
              alignItems="center"
            >
              <Text fontSize="$5" fontWeight="600" color="#6b7280" textAlign="center">
                No upcoming events
              </Text>
              <Text fontSize="$3" color="$color10" textAlign="center" marginTop="$2">
                {canManageEvents ? 'Add your first event!' : 'Check back later for updates'}
              </Text>
            </Card>
          )}
        </YStack>

        <YStack marginBottom="$8">
          <Text fontSize="$6" fontWeight="bold" color="$color12" marginBottom="$4">
            📊 Quick Stats
          </Text>
          
          <XStack gap="$3">
            <Card
              flex={1}
              elevate
              size="$4"
              bordered
              backgroundColor="$backgroundSoft"
              borderColor="$borderColor"
              padding="$5"
              alignItems="center"
            >
              <Text fontSize="$9" fontWeight="bold" color="#3b82f6" marginBottom="$1">
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
              backgroundColor="$backgroundSoft"
              borderColor="$borderColor"
              padding="$5"
              alignItems="center"
            >
              <Text fontSize="$9" fontWeight="bold" color="#3b82f6" marginBottom="$1">
                8
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
              backgroundColor="$backgroundSoft"
              borderColor="$borderColor"
              padding="$5"
              alignItems="center"
            >
              <Text fontSize="$9" fontWeight="bold" color="$red10" marginBottom="$1">
                2
              </Text>
              <Text fontSize="$2" color="#6b7280" fontWeight="600" textAlign="center">
                Overdue
              </Text>
            </Card>
          </XStack>
        </YStack>

        {!canManageEvents && (
          <Card
            backgroundColor="$yellow3"
            padding="$4"
            borderRadius="$4"
            borderWidth={1}
            borderColor="$yellow8"
            marginTop="$5"
          >
            <Text fontSize="$4" fontWeight="bold" color="$yellow11" marginBottom="$2">
              ℹ️ Limited Access
            </Text>
            <Text fontSize="$3" color="$yellow11" lineHeight="$1">
              You can view events but cannot create or modify them. Contact an admin for more permissions.
            </Text>
          </Card>
        )}
      </ScrollView>
    </YStack>
  );
}

