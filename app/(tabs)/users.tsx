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
  Avatar,
} from 'tamagui';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import { Database } from '../../lib/database.types';
import { UserPlus } from 'lucide-react-native';

type User = Database['public']['Tables']['users']['Row'];

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'admin' | 'volunteer' | 'vet' | 'viewer'>('all');
  const { userProfile } = useAuth();

  useEffect(() => {
    // Redirect if not admin
    if (userProfile && userProfile.role !== 'admin') {
      router.replace('/(tabs)');
      return;
    }
    
    if (userProfile) {
      fetchUsers();
    }
  }, [userProfile, filter]);

  const fetchUsers = async () => {
    if (!userProfile) return;

    setLoading(true);
    
    let query = supabase
      .from('users')
      .select('*')
      .eq('location_id', userProfile.location_id)
      .order('created_at', { ascending: false });
    
    if (filter !== 'all') {
      query = query.eq('role', filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to fetch users');
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#dc2626';
      case 'volunteer': return '#2563eb';
      case 'vet': return '#059669';
      case 'viewer': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return '👑';
      case 'volunteer': return '🤝';
      case 'vet': return '🩺';
      case 'viewer': return '👁️';
      default: return '👤';
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
    }
    return email.charAt(0).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderUser = (item: User) => (
    <Card
      key={item.id}
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
      <XStack alignItems="center" gap="$4">
        <Avatar circular size="$6" backgroundColor="$blue4">
          <Text fontFamily="$body" fontSize="$5" color="#3b82f6">
            {getInitials(item.full_name, item.email)}
          </Text>
        </Avatar>
        
        <YStack flex={1} gap="$1">
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$5" fontWeight="bold" color="$color12" numberOfLines={1} flex={1}>
              {item.full_name || 'Anonymous User'}
            </Text>
            <XStack alignItems="center" gap="$2">
              <Text fontSize="$4">{getRoleIcon(item.role)}</Text>
              <View
                backgroundColor={getRoleColor(item.role)}
                paddingHorizontal="$2"
                paddingVertical="$1"
                borderRadius="$3"
              >
                <Text fontSize="$1" color="white" fontWeight="700" textTransform="uppercase">
                  {item.role}
                </Text>
              </View>
            </XStack>
          </XStack>
          
          <Text fontSize="$3" color="#6b7280">
            {item.email}
          </Text>
          
          <Text fontSize="$2" color="$color10">
            Joined {formatDate(item.created_at)}
          </Text>
        </YStack>
      </XStack>
    </Card>
  );

  const filterButtons = [
    { key: 'all', label: 'All', count: users.length },
    { key: 'admin', label: 'Admins', count: users.filter(u => u.role === 'admin').length },
    { key: 'volunteer', label: 'Volunteers', count: users.filter(u => u.role === 'volunteer').length },
    { key: 'vet', label: 'Vets', count: users.filter(u => u.role === 'vet').length },
    { key: 'viewer', label: 'Viewers', count: users.filter(u => u.role === 'viewer').length },
  ];

  const filteredUsers = filter === 'all' ? users : users.filter(user => user.role === filter);

  if (userProfile?.role !== 'admin') {
    return (
      <YStack flex={1} backgroundColor="$background">
        <XStack
          justifyContent="center"
          alignItems="center"
          paddingHorizontal="$6"
          paddingVertical="$4"
          paddingTop="$12"
          backgroundColor="$backgroundStrong"
          borderBottomLeftRadius="$glass"
          borderBottomRightRadius="$glass"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <Text fontSize="$8" fontWeight="bold" color="$color12">
            Users
          </Text>
        </XStack>
        
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$8">
          <Text fontSize="$8" fontWeight="bold" color="$red10" marginBottom="$4" textAlign="center">
            🚫 Access Denied
          </Text>
          <Text fontSize="$4" color="#6b7280" textAlign="center" marginBottom="$8" lineHeight="$2">
            This section is only available to administrators.
          </Text>
          <Button
            size="$4"
            backgroundColor="#3b82f6"
            borderColor="#3b82f6"
            color="white"
            borderRadius="$button"
            onPress={() => router.replace('/(tabs)')}
            hoverStyle={{ backgroundColor: '$blue11' }}
            pressStyle={{ backgroundColor: '$blue9' }}
          >
            Go Back
          </Button>
        </YStack>
      </YStack>
    );
  }

  if (loading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Spinner size="large" color="#3b82f6" />
        <Text fontSize="$4" color="#6b7280" marginTop="$4">
          Loading users...
        </Text>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="$background">
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
          Users
        </Text>
        <Button
          icon={UserPlus}
          size="$4"
          variant="outlined"
          backgroundColor="#3b82f6"
          borderColor="#3b82f6"
          color="white"
          borderRadius="$button"
          onPress={() => Alert.alert('Invite User', 'This feature will be implemented soon!')}
          hoverStyle={{ backgroundColor: '$blue11' }}
          pressStyle={{ backgroundColor: '$blue9' }}
        >
          + Invite
        </Button>
      </XStack>
      {/* Filter Buttons */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} paddingVertical="$4">
        <XStack gap="$2" paddingHorizontal="$4">
          {filterButtons.map((item) => (
            <Button
              key={item.key}
              size="$3"
              variant="outlined"
              backgroundColor={filter === item.key ? "#3b82f6" : "$backgroundSoft"}
              borderColor={filter === item.key ? "#3b82f6" : "$borderColor"}
              color={filter === item.key ? "white" : "#6b7280"}
              borderRadius="$5"
              onPress={() => setFilter(item.key as any)}
              hoverStyle={{ 
                backgroundColor: filter === item.key ? '$blue11' : '$backgroundHover' 
              }}
              pressStyle={{ 
                backgroundColor: filter === item.key ? '$blue9' : '$backgroundPress' 
              }}
            >
              {item.label} ({item.count})
            </Button>
          ))}
        </XStack>
      </ScrollView>

      {/* Users List */}
      <ScrollView
        flex={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        {filteredUsers.length > 0 ? (
          <YStack gap="$3">
            {filteredUsers.map((user) => renderUser(user))}
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
            <Text fontSize="$5" fontWeight="600" color="#6b7280" textAlign="center">
              No users found
            </Text>
            <Text fontSize="$3" color="$color10" textAlign="center" marginTop="$2">
              {filter === 'all' ? 'No users in this location yet' : `No ${filter}s found`}
            </Text>
          </Card>
        )}
      </ScrollView>
    </YStack>
  );
}

