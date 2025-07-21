import { router } from 'expo-router';
import { UserPlus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import {
  Avatar,
  Button,
  Card,
  ScrollView,
  Spinner,
  Text,
  View,
  XStack,
  YStack,
} from 'tamagui';
import { useAuth } from '../../contexts/AuthContext';
import { useLoading } from '../../contexts/LoadingContext';
import { Database } from '../../lib/database.types';
import { supabase } from '../../lib/supabase';
import { UserListSkeleton } from '../../components/Skeletons';

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

  const handleRoleChange = async (userId: string, newRole: string) => {
    Alert.alert(
      'Change Role',
      `Are you sure you want to change this user's role to ${newRole}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('users')
                .update({ role: newRole })
                .eq('id', userId);

              if (error) {
                Alert.alert('Error', 'Failed to update user role');
              } else {
                Alert.alert('Success', 'User role updated successfully');
                fetchUsers(); // Refresh the list
              }
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred');
            }
          }
        }
      ]
    );
  };

  const renderUser = (item: User) => (
    <Card
      key={item.id}
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
      <XStack alignItems="center" gap="$4">
        {/* Avatar with role-colored border */}
        <View position="relative">
          <Avatar circular size="$7" backgroundColor="$blue4">
            <Text fontFamily="$body" fontSize="$5" color="#3b82f6" fontWeight="bold">
              {getInitials(item.full_name, item.email)}
            </Text>
          </Avatar>
          {/* Role indicator dot */}
          <View
            position="absolute"
            bottom={-2}
            right={-2}
            backgroundColor={getRoleColor(item.role)}
            borderRadius={12}
            width={24}
            height={24}
            justifyContent="center"
            alignItems="center"
            borderWidth={2}
            borderColor="white"
          >
            <Text fontSize="$1">{getRoleIcon(item.role)}</Text>
          </View>
        </View>

        <YStack flex={1} gap="$2">
          {/* Name and role badge */}
          <XStack justifyContent="space-between" alignItems="flex-start">
            <YStack flex={1}>
              <Text fontSize="$5" fontWeight="700" color="#1e293b" numberOfLines={1}>
                {item.full_name || 'Anonymous User'}
              </Text>
              <Text fontSize="$3" color="#64748b" marginTop="$0.5">
                {item.email}
              </Text>
            </YStack>
            
            <XStack alignItems="center" gap="$2">
              <View
                backgroundColor={`${getRoleColor(item.role)}15`}
                borderColor={getRoleColor(item.role)}
                borderWidth={1}
                paddingHorizontal="$3"
                paddingVertical="$1"
                borderRadius={8}
              >
                <Text 
                  fontSize="$2" 
                  color={getRoleColor(item.role)} 
                  fontWeight="700" 
                  textTransform="uppercase"
                >
                  {item.role}
                </Text>
              </View>
            </XStack>
          </XStack>

          {/* Join date and actions */}
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$2" color="#94a3b8">
              Joined {formatDate(item.created_at)}
            </Text>
            
            {/* Role management buttons */}
            {item.id !== userProfile?.id && (
              <XStack gap="$2">
                {['viewer', 'volunteer', 'admin'].map((role) => (
                  item.role !== role && (
                    <Button
                      key={role}
                      size="$2"
                      variant="outlined"
                      backgroundColor="transparent"
                      borderColor={getRoleColor(role)}
                      borderWidth={1}
                      color={getRoleColor(role)}
                      borderRadius={6}
                      paddingHorizontal="$2"
                      onPress={() => handleRoleChange(item.id, role)}
                      hoverStyle={{ backgroundColor: `${getRoleColor(role)}10` }}
                      pressStyle={{ backgroundColor: `${getRoleColor(role)}20` }}
                    >
                      <XStack alignItems="center" gap="$1">
                        <Text fontSize="$1">{getRoleIcon(role)}</Text>
                        <Text fontSize="$1" fontWeight="600" textTransform="capitalize">
                          {role}
                        </Text>
                      </XStack>
                    </Button>
                  )
                ))}
              </XStack>
            )}
          </XStack>
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
      <YStack flex={1} backgroundColor="$background">
        {/* Header */}
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
          <YStack alignItems="center" marginBottom="$3">
            <Text fontSize="$8" fontWeight="bold" color="$gray12" textAlign="center">
              Team Members
            </Text>
            <Text fontSize="$4" color="#6b7280" textAlign="center">
              Loading users...
            </Text>
          </YStack>
        </YStack>
        
        <UserListSkeleton />
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
              Team Management
            </Text>
            <Text fontSize="$4" color="#6b7280">
              Manage users and permissions for this location
            </Text>
          </YStack>
          
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
            Invite User
          </Button>
        </XStack>
        
        {/* Quick Stats */}
        <XStack gap="$4" marginTop="$2">
          <XStack alignItems="center" gap="$2">
            <View
              backgroundColor="#dc2626"
              borderRadius={6}
              padding="$1"
            >
              <Text fontSize="$2">👑</Text>
            </View>
            <Text fontSize="$3" color="#6b7280" fontWeight="500">
              {users.filter(u => u.role === 'admin').length} admins
            </Text>
          </XStack>
          <XStack alignItems="center" gap="$2">
            <View
              backgroundColor="#2563eb"
              borderRadius={6}
              padding="$1"
            >
              <Text fontSize="$2">🤝</Text>
            </View>
            <Text fontSize="$3" color="#6b7280" fontWeight="500">
              {users.filter(u => u.role === 'volunteer').length} volunteers
            </Text>
          </XStack>
          <XStack alignItems="center" gap="$2">
            <View
              backgroundColor="#059669"
              borderRadius={6}
              padding="$1"
            >
              <Text fontSize="$2">🩺</Text>
            </View>
            <Text fontSize="$3" color="#6b7280" fontWeight="500">
              {users.filter(u => u.role === 'vet').length} vets
            </Text>
          </XStack>
        </XStack>
      </YStack>
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

