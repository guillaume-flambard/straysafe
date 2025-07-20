import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import { Typography } from '../../components/design-system/Typography';
import { Button } from '../../components/design-system/Button';
import { Card } from '../../components/design-system/Card';
import { BentoGrid, BentoItem } from '../../components/design-system/BentoGrid';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/DesignTokens';

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

  const renderDogCard = (item: Dog, index: number) => {
    // Create dynamic layout pattern for bento grid
    const isWide = index % 5 === 0; // Every 5th item is wide
    const span = isWide ? 2 : 1;
    const aspectRatio = isWide ? 1.2 : 1;

    return (
      <BentoItem 
        key={item.id} 
        span={span} 
        aspectRatio={aspectRatio}
      >
        <TouchableOpacity 
          style={styles.dogCard} 
          activeOpacity={0.8}
          onPress={() => router.push(`/dog/${item.id}`)}
        >
          <Card variant="neumorphic" padding="lg" style={styles.cardContainer}>
            {/* Dog Avatar */}
            <View style={styles.dogImagePlaceholder}>
              <Typography variant="display-small" color="brand">
                {item.name.charAt(0)}
              </Typography>
            </View>
            
            {/* Dog Info */}
            <View style={styles.dogContent}>
              <View style={styles.dogHeader}>
                <Typography 
                  variant={isWide ? "h2" : "h3"} 
                  color="primary" 
                  numberOfLines={1}
                  style={styles.dogName}
                >
                  {item.name}
                </Typography>
                
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Typography variant="caption" color="white">
                    {item.status}
                  </Typography>
                </View>
              </View>
              
              <View style={styles.dogMeta}>
                <Typography variant="body-small" color="secondary" numberOfLines={1}>
                  {item.gender === 'male' ? '♂️' : '♀️'} {item.gender}
                  {item.birth_date && ` • ${new Date().getFullYear() - new Date(item.birth_date).getFullYear()}y`}
                </Typography>
                
                {item.sterilized && (
                  <Typography variant="body-small" color="secondary">
                    ✅ Sterilized
                  </Typography>
                )}
              </View>
              
              {item.location_text && isWide && (
                <Typography variant="body-small" color="muted" numberOfLines={1}>
                  📍 {item.location_text}
                </Typography>
              )}
              
              {/* Tags - only show on wide cards */}
              {item.tags.length > 0 && isWide && (
                <View style={styles.tagsContainer}>
                  {item.tags.slice(0, 2).map((tag, tagIndex) => (
                    <View key={tagIndex} style={styles.tag}>
                      <Typography variant="caption" color="secondary">
                        {tag}
                      </Typography>
                    </View>
                  ))}
                  {item.tags.length > 2 && (
                    <Typography variant="caption" color="muted">
                      +{item.tags.length - 2}
                    </Typography>
                  )}
                </View>
              )}
            </View>
          </Card>
        </TouchableOpacity>
      </BentoItem>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with exaggerated minimalism */}
      <View style={styles.header}>
        <Typography variant="display-medium" color="primary">
          Dogs
        </Typography>
        <Button 
          title="+ Add Dog" 
          variant="primary"
          size="medium"
          onPress={() => {/* TODO: Implement add dog */}}
        />
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchDogs}
      >
        {dogs.length > 0 ? (
          <BentoGrid>
            {dogs.map((dog, index) => renderDogCard(dog, index))}
          </BentoGrid>
        ) : (
          <Card variant="glass" style={styles.emptyContainer}>
            <Typography variant="h1" color="primary" align="center">
              No dogs found
            </Typography>
            <Typography 
              variant="body-large" 
              color="secondary" 
              align="center"
              style={styles.emptySubtext}
            >
              Add your first dog to get started
            </Typography>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.gutter,
    paddingVertical: Spacing.lg,
    paddingTop: Spacing.xxxl,
    backgroundColor: Colors.neutral[0],
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
    ...Shadows.soft,
  },
  
  content: {
    flex: 1,
    padding: Spacing.gutter,
  },
  
  scrollContent: {
    paddingBottom: 120, // Extra space for floating tab bar
  },
  
  dogCard: {
    flex: 1,
    height: '100%',
  },
  
  cardContainer: {
    flex: 1,
    height: '100%',
  },
  
  dogImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.circle,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  
  dogContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  
  dogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  
  dogName: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    minWidth: 60,
    alignItems: 'center',
  },
  
  dogMeta: {
    gap: 4,
    marginBottom: Spacing.sm,
  },
  
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  
  tag: {
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl * 2,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xxxl,
  },
  
  emptySubtext: {
    marginTop: Spacing.md,
  },
});