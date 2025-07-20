import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import { Database } from '../../lib/database.types';

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

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity style={styles.userCard} activeOpacity={0.7}>
      <View style={styles.userAvatar}>
        <Text style={styles.userInitials}>
          {getInitials(item.full_name, item.email)}
        </Text>
      </View>
      
      <View style={styles.userContent}>
        <View style={styles.userHeader}>
          <Text style={styles.userName}>
            {item.full_name || 'Anonymous User'}
          </Text>
          <View style={styles.roleContainer}>
            <Text style={styles.roleIcon}>{getRoleIcon(item.role)}</Text>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) }]}>
              <Text style={styles.roleText}>{item.role}</Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.userEmail}>{item.email}</Text>
        
        <View style={styles.userMeta}>
          <Text style={styles.joinDate}>
            Joined {formatDate(item.created_at)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
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
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDeniedContainer}>
          <Text style={styles.accessDeniedTitle}>🚫 Access Denied</Text>
          <Text style={styles.accessDeniedText}>
            This section is only available to administrators.
          </Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Users</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => Alert.alert('Invite User', 'This feature will be implemented soon!')}
        >
          <Text style={styles.addButtonText}>+ Invite</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {/* Filter Buttons */}
        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            data={filterButtons}
            keyExtractor={(item) => item.key}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filter === item.key && styles.filterButtonActive
                ]}
                onPress={() => setFilter(item.key as any)}
              >
                <Text style={[
                  styles.filterButtonText,
                  filter === item.key && styles.filterButtonTextActive
                ]}>
                  {item.label} ({item.count})
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Users List */}
        <FlatList
          data={filteredUsers}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContainer, { paddingBottom: 100 }]}
          refreshing={loading}
          onRefresh={fetchUsers}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No users found</Text>
              <Text style={styles.emptySubtext}>
                {filter === 'all' ? 'No users in this location yet' : `No ${filter}s found`}
              </Text>
            </View>
          }
        />
      </View>
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
  },
  filtersContainer: {
    paddingVertical: 16,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userAvatar: {
    width: 60,
    height: 60,
    backgroundColor: '#e0e7ff',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInitials: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  userContent: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleIcon: {
    fontSize: 16,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  joinDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 40,
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
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});