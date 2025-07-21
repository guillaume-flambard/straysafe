import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { AlertTriangle, Filter, Grid, List, Plus, Search } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Modal } from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Input,
  ScrollView,
  Spinner,
  Text,
  View,
  XStack,
  YStack
} from 'tamagui';
import { useAuth } from '../../contexts/AuthContext';
import { Database } from '../../lib/database.types';
import { supabase } from '../../lib/supabase';

type Dog = Database['public']['Tables']['dogs']['Row'];

export default function DogsScreen() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [filteredDogs, setFilteredDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const { userProfile } = useAuth();

  useEffect(() => {
    loadSelectedZone();
    if (userProfile) {
      fetchDogs();
    }
  }, [userProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    applyFilters();
  }, [dogs, searchQuery, statusFilter, genderFilter]);

  const loadSelectedZone = async () => {
    try {
      const zone = await AsyncStorage.getItem('selected_rescue_zone');
      if (zone) {
        setSelectedZone(zone);
      }
    } catch (error) {
      console.error('Error loading selected zone:', error);
    }
  };

  const applyFilters = () => {
    let filtered = dogs;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(dog => 
        dog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dog.location_text?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(dog => dog.status === statusFilter);
    }

    // Gender filter
    if (genderFilter !== 'all') {
      filtered = filtered.filter(dog => dog.gender === genderFilter);
    }

    setFilteredDogs(filtered);
  };

  const getZoneDisplayName = (zoneId: string) => {
    const zoneMap: Record<string, string> = {
      'koh-phangan': 'Koh Phangan 🇹🇭',
      'chiang-mai': 'Chiang Mai 🇹🇭',
      'bali': 'Bali 🇮🇩',
      'athens': 'Athens 🇬🇷'
    };
    return zoneMap[zoneId] || zoneId;
  };

  const fetchDogs = async () => {
    if (!userProfile) return;

    setLoading(true);
    
    let query = supabase
      .from('dogs')
      .select('*')
      .eq('location_id', userProfile.location_id);

    // Apply role-based filtering
    switch (userProfile.role) {
      case 'viewer':
        // Viewers can only see available dogs (not hidden, sensitive, or deceased)
        query = query.in('status', ['available', 'fostered', 'adopted', 'injured']);
        break;
        
      case 'volunteer':
        // Volunteers can see dogs they're assigned to + available dogs
        query = query.or(`rescuer_id.eq.${userProfile.id},foster_id.eq.${userProfile.id},status.in.(available,fostered,adopted,injured)`);
        break;
        
      case 'vet':
        // Vets can see dogs assigned to them + dogs needing medical attention
        query = query.or(`vet_id.eq.${userProfile.id},status.in.(injured,available,fostered)`);
        break;
        
      case 'admin':
        // Admins can see all dogs (no additional filtering)
        break;
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching dogs:', error);
    } else {
      console.log('Fetched dogs:', data?.length || 0, 'dogs for role:', userProfile.role);
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

  const getTagIcon = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'urgent': return '🚨';
      case 'puppy': return '🐶';
      case 'senior': return '👴';
      case 'shy': return '😟';
      case 'friendly': return '😊';
      case 'medical': return '🏥';
      case 'special': return '⭐';
      default: return '';
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'urgent': return { bg: '#fef2f2', text: '#dc2626' };
      case 'puppy': return { bg: '#f0f9ff', text: '#0369a1' };
      case 'senior': return { bg: '#fefce8', text: '#ca8a04' };
      case 'shy': return { bg: '#f3f4f6', text: '#6b7280' };
      case 'friendly': return { bg: '#f0fdf4', text: '#16a34a' };
      case 'medical': return { bg: '#fef2f2', text: '#dc2626' };
      case 'special': return { bg: '#faf5ff', text: '#9333ea' };
      default: return { bg: '#f3f4f6', text: '#6b7280' };
    }
  };

  const renderDogCard = (item: Dog) => {
    const isGridMode = viewMode === 'grid';
    
    return (
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
        backgroundColor="rgba(255, 255, 255, 0.95)"
        borderColor="rgba(203, 213, 225, 0.6)"
        marginBottom="$3"
        marginRight={isGridMode ? "$3" : undefined}
        padding="$4"
        borderRadius={12}
        shadowColor="rgba(0, 0, 0, 0.1)"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.15}
        shadowRadius={8}
        elevation={6}
        width={isGridMode ? "48%" : undefined}
      >
        {isGridMode ? (
          // Grid layout (vertical)
          <YStack gap="$3">
            {/* Photo */}
            <View position="relative">
              {item.photo_url ? (
                <View
                  width="100%"
                  height={120}
                  borderRadius={8}
                  overflow="hidden"
                  backgroundColor="#f3f4f6"
                >
                  <Avatar size="$10" width="100%" height="100%" borderRadius={8}>
                    <Avatar.Image src={item.photo_url} style={{ width: '100%', height: '100%' }} />
                    <Avatar.Fallback backgroundColor="$blue4" justifyContent="center" alignItems="center">
                      <Text fontSize="$8" fontWeight="bold" color="#3b82f6">
                        {item.name.charAt(0)}
                      </Text>
                    </Avatar.Fallback>
                  </Avatar>
                </View>
              ) : (
                <View
                  width="100%"
                  height={120}
                  borderRadius={8}
                  backgroundColor="$blue4"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Text fontSize="$8" fontWeight="bold" color="#3b82f6">
                    {item.name.charAt(0)}
                  </Text>
                </View>
              )}
              
              {/* Status badge */}
              <View
                position="absolute"
                top={8}
                right={8}
                backgroundColor={getStatusColor(item.status)}
                paddingHorizontal="$2"
                paddingVertical="$1"
                borderRadius={6}
              >
                <Text fontSize="$1" color="white" fontWeight="700" textTransform="uppercase">
                  {item.status}
                </Text>
              </View>

              {/* Urgent/Priority indicators */}
              {item.tags.includes('urgent') && (
                <View
                  position="absolute"
                  top={8}
                  left={8}
                  backgroundColor="#dc2626"
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius={6}
                >
                  <XStack alignItems="center" gap="$1">
                    <AlertTriangle size={12} color="white" />
                    <Text fontSize="$1" color="white" fontWeight="700">
                      URGENT
                    </Text>
                  </XStack>
                </View>
              )}
            </View>

            {/* Info */}
            <YStack gap="$2">
              <Text fontSize="$4" fontWeight="700" color="#1e293b" numberOfLines={1}>
                {item.name}
              </Text>
              
              <XStack alignItems="center" gap="$2">
                <Text fontSize="$2" color="#6b7280">
                  {item.gender === 'male' ? '♂️' : '♀️'} {item.gender}
                </Text>
                {item.birth_date && (
                  <Text fontSize="$2" color="#6b7280">
                    • {new Date().getFullYear() - new Date(item.birth_date).getFullYear()}y
                  </Text>
                )}
              </XStack>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <XStack gap="$1" flexWrap="wrap">
                  {item.tags.slice(0, 3).map((tag, index) => {
                    const tagColors = getTagColor(tag);
                    return (
                      <View
                        key={index}
                        backgroundColor={tagColors.bg}
                        paddingHorizontal="$1.5"
                        paddingVertical="$0.5"
                        borderRadius={4}
                      >
                        <XStack alignItems="center" gap="$0.5">
                          <Text fontSize="$1">{getTagIcon(tag)}</Text>
                          <Text fontSize="$1" color={tagColors.text} fontWeight="600">
                            {tag}
                          </Text>
                        </XStack>
                      </View>
                    );
                  })}
                  {item.tags.length > 3 && (
                    <View
                      backgroundColor="#f3f4f6"
                      paddingHorizontal="$1.5"
                      paddingVertical="$0.5"
                      borderRadius={4}
                    >
                      <Text fontSize="$1" color="#6b7280" fontWeight="600">
                        +{item.tags.length - 3}
                      </Text>
                    </View>
                  )}
                </XStack>
              )}
            </YStack>
          </YStack>
        ) : (
          // List layout (horizontal)
          <XStack alignItems="center" gap="$3">
            {/* Photo */}
            <View position="relative">
              {item.photo_url ? (
                <Avatar circular size="$7">
                  <Avatar.Image src={item.photo_url} />
                  <Avatar.Fallback backgroundColor="$blue4">
                    <Text fontSize="$6" fontWeight="bold" color="#3b82f6">
                      {item.name.charAt(0)}
                    </Text>
                  </Avatar.Fallback>
                </Avatar>
              ) : (
                <Avatar circular size="$7" backgroundColor="$blue4">
                  <Text fontSize="$6" fontWeight="bold" color="#3b82f6">
                    {item.name.charAt(0)}
                  </Text>
                </Avatar>
              )}
              
              {/* Priority indicator */}
              {item.tags.includes('urgent') && (
                <View
                  position="absolute"
                  top={-2}
                  right={-2}
                  backgroundColor="#dc2626"
                  borderRadius={10}
                  width={20}
                  height={20}
                  justifyContent="center"
                  alignItems="center"
                >
                  <AlertTriangle size={12} color="white" />
                </View>
              )}
            </View>
            
            {/* Main content */}
            <YStack flex={1} gap="$1">
              <XStack alignItems="center" justifyContent="space-between">
                <Text fontSize="$5" fontWeight="700" color="#1e293b" numberOfLines={1} flex={1}>
                  {item.name}
                </Text>
                <View
                  backgroundColor={getStatusColor(item.status)}
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius={6}
                >
                  <Text fontSize="$2" color="white" fontWeight="600">
                    {item.status}
                  </Text>
                </View>
              </XStack>
              
              <XStack alignItems="center" gap="$2">
                <Text fontSize="$3" color="#6b7280">
                  {item.gender === 'male' ? '♂️' : '♀️'} {item.gender}
                </Text>
                {item.birth_date && (
                  <Text fontSize="$3" color="#6b7280">
                    • {new Date().getFullYear() - new Date(item.birth_date).getFullYear()}y
                  </Text>
                )}
                {item.sterilized && (
                  <XStack alignItems="center" gap="$1">
                    <Text fontSize="$3" color="#059669">• ✅ Sterilized</Text>
                  </XStack>
                )}
              </XStack>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <XStack gap="$1" flexWrap="wrap" marginTop="$1">
                  {item.tags.slice(0, 4).map((tag, index) => {
                    const tagColors = getTagColor(tag);
                    return (
                      <View
                        key={index}
                        backgroundColor={tagColors.bg}
                        paddingHorizontal="$1.5"
                        paddingVertical="$0.5"
                        borderRadius={4}
                      >
                        <XStack alignItems="center" gap="$0.5">
                          <Text fontSize="$1">{getTagIcon(tag)}</Text>
                          <Text fontSize="$1" color={tagColors.text} fontWeight="600">
                            {tag}
                          </Text>
                        </XStack>
                      </View>
                    );
                  })}
                  {item.tags.length > 4 && (
                    <View
                      backgroundColor="#f3f4f6"
                      paddingHorizontal="$1.5"
                      paddingVertical="$0.5"
                      borderRadius={4}
                    >
                      <Text fontSize="$1" color="#6b7280" fontWeight="600">
                        +{item.tags.length - 4}
                      </Text>
                    </View>
                  )}
                </XStack>
              )}

              {/* Location */}
              {item.location_text && (
                <Text fontSize="$2" color="#6b7280" marginTop="$1">
                  📍 {item.location_text}
                </Text>
              )}
            </YStack>
          </XStack>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Spinner size="large" color="#3b82f6" />
        <Text fontSize="$4" color="#6b7280" marginTop="$4">
          Loading dogs...
        </Text>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Glassmorphism Header */}
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
        gap="$4"
      >
        {/* Title and Location */}
        <XStack justifyContent="space-between" alignItems="center">
          <YStack flex={1}>
            <Text fontSize="$8" fontWeight="bold" color="$gray12">
              Dogs in {selectedZone ? getZoneDisplayName(selectedZone) : 'Unknown Location'}
            </Text>
            <Text fontSize="$4" color="#6b7280">
              {filteredDogs.length} {filteredDogs.length === 1 ? 'dog' : 'dogs'} found
            </Text>
          </YStack>
          
          <XStack gap="$2" alignItems="center">
            {/* View toggle */}
            <XStack backgroundColor="rgba(255, 255, 255, 0.9)" borderRadius={8} padding="$1" gap="$1">
              <Button
                size="$3"
                backgroundColor={viewMode === 'list' ? "#3b82f6" : "transparent"}
                color={viewMode === 'list' ? "white" : "#6b7280"}
                borderRadius={6}
                onPress={() => setViewMode('list')}
                icon={List}
                scaleIcon={0.9}
              />
              <Button
                size="$3"
                backgroundColor={viewMode === 'grid' ? "#3b82f6" : "transparent"}
                color={viewMode === 'grid' ? "white" : "#6b7280"}
                borderRadius={6}
                onPress={() => setViewMode('grid')}
                icon={Grid}
                scaleIcon={0.9}
              />
            </XStack>
            
            <Button
              icon={Plus}
              size="$4"
              variant="outlined"
              backgroundColor="#3b82f6"
              borderColor="#3b82f6"
              color="white"
              borderRadius="$button"
              onPress={() => Alert.alert('Add Dog', 'Feature coming soon!')}
              hoverStyle={{ backgroundColor: '$blue11' }}
              pressStyle={{ backgroundColor: '$blue9' }}
            >
              Add Dog
            </Button>
          </XStack>
        </XStack>

        {/* Search and Filter */}
        <XStack gap="$3" alignItems="center">
          <XStack flex={1} alignItems="center" backgroundColor="$backgroundHover" borderColor="$borderColor" borderRadius="$button" borderWidth={1} paddingHorizontal="$3">
            <Search size={16} color="#6b7280" />
            <Input
              flex={1}
              size="$4"
              placeholder="Search dogs..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              backgroundColor="transparent"
              borderWidth={0}
              fontSize="$3"
              paddingHorizontal="$2"
            />
          </XStack>
          <Button
            size="$4"
            variant="outlined"
            backgroundColor="$backgroundHover"
            borderColor="$borderColor"
            color="#6b7280"
            borderRadius="$button"
            onPress={() => setFilterOpen(true)}
            icon={Filter}
          >
            Filter
          </Button>
        </XStack>
      </YStack>
      
      <ScrollView
        flex={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        {filteredDogs.length > 0 ? (
          viewMode === 'grid' ? (
            <XStack flexWrap="wrap" justifyContent="space-between" gap="$3">
              {filteredDogs.map(renderDogCard)}
            </XStack>
          ) : (
            <YStack gap="$3">
              {filteredDogs.map(renderDogCard)}
            </YStack>
          )
        ) : (
          <Card
            elevate
            size="$4"
            bordered
            backgroundColor="rgba(255, 255, 255, 0.95)"
            borderColor="rgba(203, 213, 225, 0.6)"
            padding="$8"
            marginTop="$8"
            alignItems="center"
            borderRadius={12}
            shadowColor="rgba(0, 0, 0, 0.1)"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.15}
            shadowRadius={8}
            elevation={6}
          >
            <Text fontSize="$6" fontWeight="600" color="#6b7280" textAlign="center">
              {dogs.length === 0 ? '🐕 No dogs found' : '🔍 No dogs match your filters'}
            </Text>
            <Text fontSize="$4" color="#6b7280" textAlign="center" marginTop="$2" lineHeight="$1">
              {dogs.length === 0 ? 'Add your first dog to get started with rescue operations' : 'Try adjusting your search terms or filters'}
            </Text>
            {dogs.length > 0 && (
              <Button
                size="$3"
                backgroundColor="transparent"
                borderColor="#3b82f6"
                color="#3b82f6"
                borderRadius={8}
                marginTop="$4"
                onPress={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setGenderFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </Card>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={filterOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterOpen(false)}
      >
        <View flex={1} backgroundColor="rgba(0,0,0,0.5)" justifyContent="flex-end">
          <Card
            backgroundColor="$background"
            borderTopLeftRadius="$6"
            borderTopRightRadius="$6"
            padding="$4"
            gap="$4"
            minHeight={400}
          >
            <Text fontSize="$6" fontWeight="bold" color="$gray12" textAlign="center">
              Filter Dogs
            </Text>
            
            {/* Status Filter */}
            <YStack gap="$2">
              <Text fontSize="$4" fontWeight="600" color="#6b7280">Status</Text>
              <XStack gap="$2" flexWrap="wrap">
                {['all', 'available', 'fostered', 'adopted', 'injured', 'missing'].map((status) => (
                  <Button
                    key={status}
                    size="$3"
                    variant="outlined"
                    backgroundColor={statusFilter === status ? "#3b82f6" : "transparent"}
                    borderColor="#3b82f6"
                    color={statusFilter === status ? "white" : "#3b82f6"}
                    onPress={() => setStatusFilter(status)}
                    marginBottom="$2"
                  >
                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </XStack>
            </YStack>

            {/* Gender Filter */}
            <YStack gap="$2">
              <Text fontSize="$4" fontWeight="600" color="#6b7280">Gender</Text>
              <XStack gap="$2">
                {['all', 'male', 'female'].map((gender) => (
                  <Button
                    key={gender}
                    size="$3"
                    variant="outlined"
                    backgroundColor={genderFilter === gender ? "#3b82f6" : "transparent"}
                    borderColor="#3b82f6"
                    color={genderFilter === gender ? "white" : "#3b82f6"}
                    onPress={() => setGenderFilter(gender)}
                    flex={1}
                  >
                    {gender === 'all' ? 'All' : gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </Button>
                ))}
              </XStack>
            </YStack>

            {/* Reset and Close */}
            <XStack gap="$3" marginTop="$4">
              <Button
                flex={1}
                size="$4"
                variant="outlined"
                backgroundColor="transparent"
                borderColor="$gray8"
                color="#6b7280"
                onPress={() => {
                  setStatusFilter('all');
                  setGenderFilter('all');
                  setSearchQuery('');
                }}
              >
                Reset All
              </Button>
              <Button
                flex={1}
                size="$4"
                backgroundColor="#3b82f6"
                borderColor="#3b82f6"
                color="white"
                onPress={() => setFilterOpen(false)}
              >
                Apply Filters
              </Button>
            </XStack>
          </Card>
        </View>
      </Modal>
    </YStack>
  );
}