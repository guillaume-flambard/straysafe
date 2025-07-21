import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  YStack,
  XStack,
  Text,
  Card,
  Button,
  ScrollView,
  View,
  Avatar
} from 'tamagui';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import { LogOut, ChevronRight, MapPin, User, Bell, Shield, HelpCircle, Info } from 'lucide-react-native';

type Location = {
  id: string
  name: string
  country: string
}

export default function SettingsScreen() {
  const [locations, setLocations] = useState<Location[]>([]);
  const { userProfile, user, signOut } = useAuth();

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('country, name');
    
    if (error) {
      console.error('Error fetching locations:', error);
    } else {
      setLocations(data || []);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const currentLocationName = locations.find(loc => loc.id === userProfile?.location_id);

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

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Modern Header with Profile */}
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
        <Text fontSize="$8" fontWeight="bold" color="$gray12" textAlign="center">
          Settings
        </Text>
        
        {/* Profile Card */}
        <Card
          backgroundColor="rgba(255, 255, 255, 0.9)"
          borderColor="rgba(203, 213, 225, 0.6)"
          borderWidth={1}
          padding="$4"
          borderRadius={12}
          shadowColor="rgba(0, 0, 0, 0.1)"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={4}
          elevation={4}
        >
          <XStack alignItems="center" gap="$3">
            {/* Avatar with role indicator */}
            <View position="relative">
              <Avatar circular size="$6" backgroundColor="$blue4">
                <Text fontSize="$5" color="#3b82f6" fontWeight="bold">
                  {getInitials(userProfile?.full_name || null, userProfile?.email || '')}
                </Text>
              </Avatar>
              {/* Role indicator */}
              <View
                position="absolute"
                bottom={-2}
                right={-2}
                backgroundColor={getRoleColor(userProfile?.role || 'viewer')}
                borderRadius={10}
                width={20}
                height={20}
                justifyContent="center"
                alignItems="center"
                borderWidth={2}
                borderColor="white"
              >
                <Text fontSize="$1">{getRoleIcon(userProfile?.role || 'viewer')}</Text>
              </View>
            </View>
            
            <YStack flex={1}>
              <Text fontSize="$5" fontWeight="700" color="#1e293b">
                {userProfile?.full_name || 'Anonymous User'}
              </Text>
              <Text fontSize="$3" color="#64748b">
                {userProfile?.email}
              </Text>
              <XStack alignItems="center" gap="$2" marginTop="$1">
                <View
                  backgroundColor={`${getRoleColor(userProfile?.role || 'viewer')}15`}
                  borderColor={getRoleColor(userProfile?.role || 'viewer')}
                  borderWidth={1}
                  paddingHorizontal="$2"
                  paddingVertical="$0.5"
                  borderRadius={6}
                >
                  <Text 
                    fontSize="$1" 
                    color={getRoleColor(userProfile?.role || 'viewer')} 
                    fontWeight="700" 
                    textTransform="uppercase"
                  >
                    {userProfile?.role || 'viewer'}
                  </Text>
                </View>
                {currentLocationName && (
                  <XStack alignItems="center" gap="$1">
                    <MapPin size={12} color="#6b7280" />
                    <Text fontSize="$2" color="#6b7280">
                      {currentLocationName.name}
                    </Text>
                  </XStack>
                )}
              </XStack>
            </YStack>
          </XStack>
        </Card>
      </YStack>
      
      <ScrollView
        flex={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        {/* Location Settings */}
        <YStack marginBottom="$8">
          <Text fontSize="$6" fontWeight="bold" color="$color12" marginBottom="$4">
            📍 Location
          </Text>
          
          <Card
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
            padding="$4"
            borderRadius={12}
            shadowColor="rgba(0, 0, 0, 0.1)"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={4}
            elevation={4}
            onPress={() => router.push('/change-location')}
          >
            <XStack justifyContent="space-between" alignItems="center">
              <XStack alignItems="center" gap="$3" flex={1}>
                <View
                  backgroundColor="#10b981"
                  borderRadius={8}
                  padding="$2"
                >
                  <MapPin size={16} color="white" />
                </View>
                <YStack flex={1}>
                  <Text fontSize="$4" color="#1e293b" fontWeight="600">
                    Change Location
                  </Text>
                  <Text fontSize="$2" color="#64748b">
                    {currentLocationName ? `Currently: ${currentLocationName.name}, ${currentLocationName.country}` : 'Not set'}
                  </Text>
                </YStack>
              </XStack>
              <ChevronRight size={20} color="#94a3b8" />
            </XStack>
          </Card>
        </YStack>

        {/* Account Settings */}
        <YStack marginBottom="$8">
          <Text fontSize="$6" fontWeight="bold" color="$color12" marginBottom="$4">
            👤 Account
          </Text>
          
          <Card
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
            padding="$4"
            borderRadius={12}
            shadowColor="rgba(0, 0, 0, 0.1)"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={4}
            elevation={4}
          >
            <XStack justifyContent="space-between" alignItems="center">
              <XStack alignItems="center" gap="$3">
                <View
                  backgroundColor="#3b82f6"
                  borderRadius={8}
                  padding="$2"
                >
                  <User size={16} color="white" />
                </View>
                <Text fontSize="$4" color="#1e293b" fontWeight="600">
                  Edit Profile
                </Text>
              </XStack>
              <ChevronRight size={20} color="#94a3b8" />
            </XStack>
          </Card>
          
          <Card
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
            padding="$4"
            borderRadius={12}
            shadowColor="rgba(0, 0, 0, 0.1)"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={4}
            elevation={4}
          >
            <XStack justifyContent="space-between" alignItems="center">
              <XStack alignItems="center" gap="$3">
                <View
                  backgroundColor="#f59e0b"
                  borderRadius={8}
                  padding="$2"
                >
                  <Bell size={16} color="white" />
                </View>
                <Text fontSize="$4" color="#1e293b" fontWeight="600">
                  Notifications
                </Text>
              </XStack>
              <ChevronRight size={20} color="#94a3b8" />
            </XStack>
          </Card>
          
          <Card
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
            padding="$4"
            borderRadius={12}
            shadowColor="rgba(0, 0, 0, 0.1)"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={4}
            elevation={4}
          >
            <XStack justifyContent="space-between" alignItems="center">
              <XStack alignItems="center" gap="$3">
                <View
                  backgroundColor="#10b981"
                  borderRadius={8}
                  padding="$2"
                >
                  <Shield size={16} color="white" />
                </View>
                <Text fontSize="$4" color="#1e293b" fontWeight="600">
                  Privacy
                </Text>
              </XStack>
              <ChevronRight size={20} color="#94a3b8" />
            </XStack>
          </Card>
        </YStack>

        {/* App Settings */}
        <YStack marginBottom="$8">
          <Text fontSize="$6" fontWeight="bold" color="$color12" marginBottom="$4">
            ⚙️ App
          </Text>
          
          <Card
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
            padding="$4"
            borderRadius={12}
            shadowColor="rgba(0, 0, 0, 0.1)"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={4}
            elevation={4}
          >
            <XStack justifyContent="space-between" alignItems="center">
              <XStack alignItems="center" gap="$3">
                <View
                  backgroundColor="#8b5cf6"
                  borderRadius={8}
                  padding="$2"
                >
                  <HelpCircle size={16} color="white" />
                </View>
                <Text fontSize="$4" color="#1e293b" fontWeight="600">
                  Help & Support
                </Text>
              </XStack>
              <ChevronRight size={20} color="#94a3b8" />
            </XStack>
          </Card>
          
          <Card
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
            padding="$4"
            borderRadius={12}
            shadowColor="rgba(0, 0, 0, 0.1)"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={4}
            elevation={4}
          >
            <XStack justifyContent="space-between" alignItems="center">
              <XStack alignItems="center" gap="$3">
                <View
                  backgroundColor="#6b7280"
                  borderRadius={8}
                  padding="$2"
                >
                  <Info size={16} color="white" />
                </View>
                <Text fontSize="$4" color="#1e293b" fontWeight="600">
                  About StraySafe
                </Text>
              </XStack>
              <ChevronRight size={20} color="#94a3b8" />
            </XStack>
          </Card>
        </YStack>

        {/* Sign Out */}
        <Button
          icon={LogOut}
          size="$5"
          backgroundColor="$red10"
          borderColor="$red10"
          color="white"
          borderRadius="$4"
          onPress={handleSignOut}
          marginTop="$5"
          marginBottom="$10"
          hoverStyle={{ backgroundColor: '$red11' }}
          pressStyle={{ backgroundColor: '$red9' }}
          shadowColor="$red10"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.3}
          shadowRadius={8}
          elevation={5}
        >
          <Text fontSize="$5" fontWeight="700" color="white">
            Sign Out
          </Text>
        </Button>
      </ScrollView>
    </YStack>
  );
}

