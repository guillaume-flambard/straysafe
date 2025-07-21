import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Plus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import {
  Avatar,
  Button,
  Card,
  H3,
  H4,
  Paragraph,
  ScrollView,
  Spinner,
  Text,
  View,
  XStack,
  YStack,
} from 'tamagui';
import TimelineEventModal from '../../components/TimelineEventModal';
import { useAuth } from '../../contexts/AuthContext';
import { Database } from '../../lib/database.types';
import { supabase } from '../../lib/supabase';

type Dog = Database['public']['Tables']['dogs']['Row'];
type Event = Database['public']['Tables']['events']['Row'];

export default function DogProfileScreen() {
  const { id } = useLocalSearchParams();
  const [dog, setDog] = useState<Dog | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const { userProfile } = useAuth();

  useEffect(() => {
    if (id && userProfile) {
      fetchDogDetails();
      fetchDogEvents();
    }
  }, [id, userProfile]);

  const fetchDogDetails = async () => {
    if (!userProfile) return;

    const { data, error } = await supabase
      .from('dogs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching dog:', error);
      Alert.alert('Error', 'Failed to load dog details');
      router.back();
      return;
    }

    // Check if user has access to this dog based on role and status
    const canViewDog = () => {
      switch (userProfile.role) {
        case 'viewer':
          // Viewers cannot see hidden dogs
          return data.status !== 'hidden';
          
        case 'volunteer':
          // Volunteers can see dogs they're assigned to or non-hidden dogs
          return data.rescuer_id === userProfile.id || 
                 data.foster_id === userProfile.id || 
                 data.status !== 'hidden';
          
        case 'vet':
          // Vets can see dogs assigned to them or dogs needing medical attention
          return data.vet_id === userProfile.id || 
                 ['injured', 'available', 'fostered'].includes(data.status);
          
        case 'admin':
          // Admins can see all dogs
          return true;
          
        default:
          return false;
      }
    };

    if (!canViewDog()) {
      Alert.alert('Access Denied', 'You do not have permission to view this dog profile.');
      router.back();
      return;
    }

    setDog(data);
  };

  const fetchDogEvents = async () => {
    if (!userProfile) return;

    let query = supabase
      .from('events')
      .select('*')
      .eq('dog_id', id);

    // Apply privacy filtering based on user role
    switch (userProfile.role) {
      case 'viewer':
        // Viewers can only see public events
        query = query.eq('privacy_level', 'public');
        break;
        
      case 'volunteer':
        // Volunteers can see public and private events, but not sensitive
        query = query.in('privacy_level', ['public', 'private']);
        break;
        
      case 'vet':
        // Vets can see public and private events (medical focus)
        query = query.in('privacy_level', ['public', 'private']);
        break;
        
      case 'admin':
        // Admins can see all events including sensitive
        break;
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching events:', error);
    } else {
      console.log('Fetched events:', data?.length || 0, 'events for role:', userProfile.role);
      setEvents(data || []);
    }
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
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Spinner size="large" color="#3b82f6" />
        <Text fontSize="$4" color="#6b7280" marginTop="$4">
          Loading dog profile...
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
        <Button
          size="$4"
          variant="outlined"
          backgroundColor="transparent"
          color="#3b82f6"
          onPress={() => router.back()}
          icon={ArrowLeft}
        >
          Back
        </Button>
        <Text fontSize="$7" fontWeight="bold" color="$color12" numberOfLines={1} flex={1} textAlign="center">
          {dog.name}
        </Text>
        <View width="$8" />
      </XStack>
      
      <ScrollView 
        flex={1}
        padding="$4"
        showsVerticalScrollIndicator={false}
      >
        {/* Dog Header */}
        <Card
          backgroundColor="$backgroundStrong"
          borderRadius="$glass"
          borderWidth={1}
          borderColor="$borderColor"
          shadowColor="$shadowColor"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.15}
          shadowRadius={12}
          elevation={8}
          padding="$6"
          marginBottom="$4"
        >
          <XStack gap="$4" alignItems="center">
            <Avatar
              size="$10"
              backgroundColor="$blue5"
              borderRadius="$round"
            >
              <Text fontSize="$8" fontWeight="bold" color="$blue11">
                {dog.name.charAt(0)}
              </Text>
            </Avatar>
            
            <YStack flex={1} gap="$2">
              <H3 color="$color12" numberOfLines={1}>{dog.name}</H3>
              <View
                backgroundColor={getStatusColor(dog.status)}
                borderRadius="$4"
                paddingHorizontal="$3"
                paddingVertical="$1"
                alignSelf="flex-start"
              >
                <Text fontSize="$3" fontWeight="600" color="white">
                  {dog.status}
                </Text>
              </View>
              
              <YStack gap="$1">
                <Text fontSize="$3" color="#6b7280">
                  {dog.gender === 'male' ? '♂️' : '♀️'} {dog.gender}
                </Text>
                {dog.birth_date && (
                  <Text fontSize="$3" color="#6b7280">
                    🎂 {calculateAge(dog.birth_date)}
                  </Text>
                )}
                <Text fontSize="$3" color="#6b7280">
                  {dog.sterilized ? '✅ Sterilized' : '❌ Not sterilized'}
                </Text>
              </YStack>
            </YStack>
          </XStack>
        </Card>

        {/* Location & People */}
        <YStack gap="$3" marginBottom="$4">
          <H4 color="$color12" fontSize="$5" fontWeight="600">
            📍 Location & People
          </H4>
          
          <Card
            backgroundColor="$backgroundStrong"
            borderRadius="$glass"
            borderWidth={1}
            borderColor="$borderColor"
            shadowColor="$shadowColor"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={8}
            elevation={4}
            padding="$4"
          >
            {dog.location_text && (
              <XStack justifyContent="space-between" alignItems="center" paddingVertical="$2">
                <Text fontSize="$4" fontWeight="500" color="#6b7280">Location:</Text>
                <Text fontSize="$4" color="$color12" flex={1} textAlign="right">
                  {dog.location_text}
                </Text>
              </XStack>
            )}
            
            {dog.rescue_date && (
              <XStack justifyContent="space-between" alignItems="center" paddingVertical="$2">
                <Text fontSize="$4" fontWeight="500" color="#6b7280">Rescue Date:</Text>
                <Text fontSize="$4" color="$color12" flex={1} textAlign="right">
                  {new Date(dog.rescue_date).toLocaleDateString()}
                </Text>
              </XStack>
            )}
          </Card>
        </YStack>

        {/* Notes */}
        {dog.notes && (
          <YStack gap="$3" marginBottom="$4">
            <XStack alignItems="center" gap="$2">
              <H4 color="$color12" fontSize="$5" fontWeight="600">
                📝 Notes
              </H4>
              {userProfile?.role === 'viewer' && (
                <View
                  backgroundColor="$orange3"
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$2"
                >
                  <Text fontSize="$1" color="$orange11" fontWeight="600">
                    Limited View
                  </Text>
                </View>
              )}
            </XStack>
            <Card
              backgroundColor="$backgroundStrong"
              borderRadius="$glass"
              borderWidth={1}
              borderColor="$borderColor"
              shadowColor="$shadowColor"
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.1}
              shadowRadius={8}
              elevation={4}
              padding="$4"
            >
              <Paragraph fontSize="$4" color="#6b7280" lineHeight="$5">
                {dog.notes}
              </Paragraph>
            </Card>
          </YStack>
        )}

        {/* Tags */}
        {dog.tags.length > 0 && (
          <YStack gap="$3" marginBottom="$4">
            <H4 color="$color12" fontSize="$5" fontWeight="600">
              🏷️ Tags
            </H4>
            <XStack flexWrap="wrap" gap="$2">
              {dog.tags.map((tag, index) => (
                <View
                  key={index}
                  backgroundColor="$blue5"
                  borderRadius="$4"
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  borderWidth={1}
                  borderColor="$blue7"
                >
                  <Text fontSize="$3" fontWeight="500" color="$blue11">
                    {tag}
                  </Text>
                </View>
              ))}
            </XStack>
          </YStack>
        )}

        {/* Timeline */}
        <YStack gap="$3" marginBottom="$4">
          <XStack justifyContent="space-between" alignItems="center">
            <XStack alignItems="center" gap="$2">
              <H4 color="$color12" fontSize="$5" fontWeight="600">
                📅 Timeline
              </H4>
              {userProfile?.role === 'viewer' && (
                <View
                  backgroundColor="$blue3"
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$2"
                >
                  <Text fontSize="$1" color="$blue11" fontWeight="600">
                    Public Only
                  </Text>
                </View>
              )}
              {userProfile?.role === 'volunteer' && (
                <View
                  backgroundColor="$green3"
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$2"
                >
                  <Text fontSize="$1" color="$green11" fontWeight="600">
                    Standard Access
                  </Text>
                </View>
              )}
            </XStack>
            {canAddEvent && (
              <Button
                size="$3"
                backgroundColor="$blue9"
                color="white"
                borderRadius="$4"
                fontWeight="600"
                onPress={() => setModalVisible(true)}
                icon={Plus}
                scaleIcon={1.2}
              >
                Add Event
              </Button>
            )}
          </XStack>
          
          {events.length > 0 ? (
            <YStack gap="$3">
              {events.map((event, index) => (
                <Card
                  key={event.id}
                  backgroundColor="$backgroundStrong"
                  borderRadius="$glass"
                  borderWidth={1}
                  borderColor="$borderColor"
                  shadowColor="$shadowColor"
                  shadowOffset={{ width: 0, height: 2 }}
                  shadowOpacity={0.1}
                  shadowRadius={8}
                  elevation={4}
                  padding="$4"
                >
                  <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
                    <XStack gap="$2" alignItems="center">
                      <Text fontSize="$4">
                        {getEventTypeIcon(event.event_type)}
                      </Text>
                      <Text fontSize="$4" fontWeight="600" color="$color12" textTransform="capitalize">
                        {event.event_type}
                      </Text>
                      {event.privacy_level === 'sensitive' && userProfile?.role === 'admin' && (
                        <View
                          backgroundColor="$red3"
                          paddingHorizontal="$2"
                          paddingVertical="$1"
                          borderRadius="$2"
                        >
                          <Text fontSize="$1" color="$red11" fontWeight="600">
                            SENSITIVE
                          </Text>
                        </View>
                      )}
                      {event.privacy_level === 'private' && (
                        <View
                          backgroundColor="$yellow3"
                          paddingHorizontal="$2"
                          paddingVertical="$1"
                          borderRadius="$2"
                        >
                          <Text fontSize="$1" color="$yellow11" fontWeight="600">
                            PRIVATE
                          </Text>
                        </View>
                      )}
                    </XStack>
                    <Text fontSize="$3" color="$color10">
                      {formatDate(event.created_at)}
                    </Text>
                  </XStack>
                  
                  <Text fontSize="$5" fontWeight="600" color="$color12" marginBottom="$2">
                    {event.title}
                  </Text>
                  
                  {event.description && (
                    <Paragraph fontSize="$4" color="#6b7280" lineHeight="$5" marginBottom="$3">
                      {event.description}
                    </Paragraph>
                  )}
                  
                  <XStack justifyContent="flex-end">
                    <Text fontSize="$3" color="$color10">
                      {event.privacy_level === 'public' ? '🌐' : 
                       event.privacy_level === 'private' ? '🔒' : '🔐'} 
                      {event.privacy_level}
                    </Text>
                  </XStack>
                </Card>
              ))}
            </YStack>
          ) : (
            <Card
              backgroundColor="$backgroundStrong"
              borderRadius="$glass"
              borderWidth={1}
              borderColor="$borderColor"
              shadowColor="$shadowColor"
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.1}
              shadowRadius={8}
              elevation={4}
              padding="$6"
              alignItems="center"
            >
              <Text fontSize="$5" fontWeight="600" color="#6b7280" marginBottom="$2">
                No events yet
              </Text>
              <Text fontSize="$4" color="$color10" textAlign="center">
                {canAddEvent ? 'Add the first event for this dog!' : 'Check back later for updates'}
              </Text>
            </Card>
          )}
        </YStack>
      </ScrollView>

      <TimelineEventModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        dogId={id as string}
        onEventAdded={() => {
          fetchDogEvents();
        }}
      />
    </YStack>
  );
}