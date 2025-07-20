import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { 
  YStack, 
  XStack, 
  Text, 
  useTheme,
  View,
  Card,
  Button,
  ScrollView,
  Spinner,
  Avatar
} from 'tamagui';
import { Plus } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';

type Dog = Database['public']['Tables']['dogs']['Row'];

export default function DogsScreen() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    if (userProfile) {
      fetchDogs();
    }
  }, [userProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDogs = async () => {
    if (!userProfile) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('dogs')
      .select('*')
      .eq('location_id', userProfile.location_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching dogs:', error);
    } else {
      console.log('Fetched dogs:', data?.length || 0, 'dogs');
      setDogs(data || []);
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

  const renderDogCard = (item: Dog) => (
    <Card
      key={item.id}
      elevate
      size="$4"
      bordered
      animation="bouncy"
      scale={0.9}
      hoverStyle={{ scale: 0.925 }}
      pressStyle={{ scale: 0.875 }}
      onPress={() => router.push(`/dog/${item.id}` as any)}
      backgroundColor="$backgroundSoft"
      borderColor="$borderColor"
      marginBottom="$3"
      padding="$4"
    >
      <XStack alignItems="center" gap="$3">
        <Avatar circular size="$6" backgroundColor="$blue4">
          <Text fontFamily="$body" fontSize="$6" color="$blue10">
            {item.name.charAt(0)}
          </Text>
        </Avatar>
        
        <YStack flex={1} gap="$1">
          <Text fontSize="$5" fontWeight="600" color="$color12" numberOfLines={1}>
            {item.name}
          </Text>
          <Text fontSize="$3" color="$color11">
            {item.gender === 'male' ? '♂️' : '♀️'} {item.gender}
            {item.birth_date && ` • ${new Date().getFullYear() - new Date(item.birth_date).getFullYear()}y`}
          </Text>
        </YStack>
        
        <View
          backgroundColor={getStatusColor(item.status)}
          paddingHorizontal="$2"
          paddingVertical="$1"
          borderRadius="$2"
        >
          <Text fontSize="$2" color="white" fontWeight="600">
            {item.status}
          </Text>
        </View>
      </XStack>
      
      {item.location_text && (
        <Text fontSize="$3" color="$color10" marginTop="$2">
          📍 {item.location_text}
        </Text>
      )}
      
      {item.sterilized && (
        <Text fontSize="$3" color="$green10" marginTop="$2">
          ✅ Sterilized
        </Text>
      )}
    </Card>
  );

  if (loading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Spinner size="large" color="$blue10" />
        <Text fontSize="$4" color="$color11" marginTop="$4">
          Loading dogs...
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
          Dogs
        </Text>
        <Button
          icon={Plus}
          size="$4"
          variant="outlined"
          backgroundColor="$blue10"
          borderColor="$blue10"
          color="white"
          borderRadius="$button"
          onPress={() => Alert.alert('Add Dog', 'Feature coming soon!')}
          hoverStyle={{ backgroundColor: '$blue11' }}
          pressStyle={{ backgroundColor: '$blue9' }}
        >
          Add Dog
        </Button>
      </XStack>
      
      <ScrollView
        flex={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        {dogs.length > 0 ? (
          <YStack space="$3">
            {dogs.map(renderDogCard)}
          </YStack>
        ) : (
          <Card
            elevate
            size="$4"
            bordered
            backgroundColor="$backgroundSoft"
            borderColor="$borderColor"
            padding="$8"
            marginTop="$8"
            alignItems="center"
          >
            <Text fontSize="$6" fontWeight="600" color="$color11" textAlign="center">
              No dogs found
            </Text>
            <Text fontSize="$4" color="$color10" textAlign="center" marginTop="$2">
              Add your first dog to get started
            </Text>
          </Card>
        )}
      </ScrollView>
    </YStack>
  );
}