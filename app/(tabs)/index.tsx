import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';

type Dog = Database['public']['Tables']['dogs']['Row'];

export default function DogsScreen() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();

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

  const renderDog = ({ item }: { item: Dog }) => (
    <TouchableOpacity style={styles.dogCard} activeOpacity={0.7}>
      <View style={styles.dogImagePlaceholder}>
        <Text style={styles.dogInitial}>{item.name.charAt(0)}</Text>
      </View>
      
      <View style={styles.dogContent}>
        <View style={styles.dogHeader}>
          <Text style={styles.dogName}>{item.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.dogInfo}>
          <Text style={styles.dogDetail}>
            {item.gender === 'male' ? '♂️' : '♀️'} {item.gender} • {item.sterilized ? '✅ Sterilized' : '❌ Not sterilized'}
          </Text>
          {item.birth_date && (
            <Text style={styles.dogAge}>
              🎂 {new Date().getFullYear() - new Date(item.birth_date).getFullYear()} years old
            </Text>
          )}
        </View>
        
        {item.location_text && (
          <Text style={styles.dogLocation}>📍 {item.location_text}</Text>
        )}
        
        {item.notes && (
          <Text style={styles.dogNotes} numberOfLines={2}>💭 {item.notes}</Text>
        )}
        
        {item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {item.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{item.tags.length - 3} more</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dogs</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Dog</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={dogs}
        renderItem={renderDog}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={fetchDogs}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No dogs found</Text>
            <Text style={styles.emptySubtext}>Add your first dog to get started</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  listContainer: {
    padding: 20,
    paddingTop: 16,
  },
  dogCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  dogImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#e0e7ff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16,
  },
  dogInitial: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  dogContent: {
    flex: 1,
    padding: 16,
    paddingLeft: 0,
  },
  dogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dogName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dogInfo: {
    marginBottom: 8,
  },
  dogDetail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  dogAge: {
    fontSize: 13,
    color: '#64748b',
  },
  dogLocation: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 8,
  },
  dogNotes: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 18,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  tag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tagText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  moreTagsText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
  },
});