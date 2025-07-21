import React, { useState, useEffect } from 'react';
import { Alert, Platform, Keyboard, KeyboardAvoidingView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  YStack,
  XStack,
  Text,
  Card,
  Button,
  Input,
  ScrollView,
  View,
  Switch,
  Avatar
} from 'tamagui';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';
import { ArrowLeft, Camera, Calendar, MapPin, Plus, Tag, User } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';

export default function AddDogScreen() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'unknown'>('unknown');
  const [status, setStatus] = useState<'fostered' | 'available' | 'adopted' | 'injured' | 'missing' | 'hidden' | 'deceased'>('available');
  const [birthDate, setBirthDate] = useState('');
  const [sterilized, setSterilized] = useState(false);
  const [locationText, setLocationText] = useState('');
  const [rescueDate, setRescueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const [showRescueDatePicker, setShowRescueDatePicker] = useState(false);
  const [birthDateObj, setBirthDateObj] = useState<Date | null>(null);
  const [rescueDateObj, setRescueDateObj] = useState<Date | null>(null);
  const { userProfile } = useAuth();
  const { setLoading: setGlobalLoading } = useLoading();

  useEffect(() => {
    // Don't set rescue date automatically - let user choose

    // Setup keyboard listeners
    const keyboardShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardShowListener?.remove();
      keyboardHideListener?.remove();
    };
  }, []);

  const predefinedTags = [
    'urgent', 'puppy', 'senior', 'shy', 'friendly', 'medical', 'special',
    'aggressive', 'calm', 'playful', 'trained', 'needs_attention'
  ];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to add photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Select Photo',
      'Choose how to add a photo for this dog',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleBirthDateChange = (event: any, selectedDate?: Date) => {
    setShowBirthDatePicker(false);
    if (selectedDate) {
      setBirthDateObj(selectedDate);
      setBirthDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  const handleRescueDateChange = (event: any, selectedDate?: Date) => {
    setShowRescueDatePicker(false);
    if (selectedDate) {
      setRescueDateObj(selectedDate);
      setRescueDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  const uploadPhoto = async (uri: string): Promise<string | null> => {
    try {
      const filename = `dog_${Date.now()}.jpg`;
      
      // For React Native, we need to use the file URI directly
      const file = {
        uri,
        type: 'image/jpeg',
        name: filename,
      };

      const { data, error } = await supabase.storage
        .from('dogs-photos')
        .upload(filename, file as any, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        // Don't fail the whole process if photo upload fails
        Alert.alert('Photo Upload Warning', 'The dog was added but the photo could not be uploaded. You can add a photo later.');
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('dogs-photos')
        .getPublicUrl(filename);

      console.log('Generated photo URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Photo Upload Warning', 'The dog was added but the photo could not be uploaded. You can add a photo later.');
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name for the dog');
      return;
    }

    if (!userProfile?.location_id) {
      Alert.alert('Error', 'Could not determine your location');
      return;
    }

    setLoading(true);
    setGlobalLoading(true, 'Adding dog...');

    try {
      let photoUrl: string | null = null;
      
      // Upload photo if one was selected
      if (photoUri) {
        photoUrl = await uploadPhoto(photoUri);
      }

      const dogData = {
        name: name.trim(),
        gender,
        status,
        birth_date: birthDate || null,
        sterilized,
        location_id: userProfile.location_id,
        location_text: locationText.trim() || null,
        rescue_date: rescueDate || null,
        rescuer_id: userProfile.id,
        notes: notes.trim() || null,
        tags,
        photo_url: photoUrl,
      };

      const { error } = await supabase
        .from('dogs')
        .insert([dogData]);

      if (error) {
        console.error('Error adding dog:', error);
        console.error('User profile:', userProfile);
        console.error('Dog data being inserted:', dogData);
        Alert.alert('Error', `Failed to add dog: ${error.message}\n\nUser ID: ${userProfile?.id}\nLocation ID: ${userProfile?.location_id}\nRole: ${userProfile?.role}`);
      } else {
        Alert.alert(
          'Success!', 
          `${name} has been added successfully!`,
          [
            { text: 'OK', onPress: () => router.back() }
          ]
        );
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }

    setLoading(false);
    setGlobalLoading(false);
  };

  const getTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'urgent': return { bg: '#fef2f2', text: '#dc2626', border: '#fca5a5' };
      case 'puppy': return { bg: '#f0f9ff', text: '#0369a1', border: '#7dd3fc' };
      case 'senior': return { bg: '#fefce8', text: '#ca8a04', border: '#fde047' };
      case 'shy': return { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' };
      case 'friendly': return { bg: '#f0fdf4', text: '#16a34a', border: '#86efac' };
      case 'medical': return { bg: '#fef2f2', text: '#dc2626', border: '#fca5a5' };
      case 'special': return { bg: '#faf5ff', text: '#9333ea', border: '#d8b4fe' };
      default: return { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' };
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
        <XStack alignItems="center" gap="$3">
          <Button
            size="$3"
            variant="outlined"
            backgroundColor="rgba(255, 255, 255, 0.9)"
            borderColor="rgba(203, 213, 225, 0.6)"
            color="#6b7280"
            borderRadius={8}
            onPress={() => router.back()}
            icon={ArrowLeft}
          />
          <Text fontSize="$7" fontWeight="bold" color="$gray12" flex={1}>
            Add New Dog
          </Text>
        </XStack>
        
        <Text fontSize="$3" color="#64748b" textAlign="center">
          Register a new rescue dog in the system
        </Text>
      </YStack>
      
      <ScrollView
        flex={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        {/* Photo Section */}
        <Card
          elevate
          size="$4"
          bordered
          backgroundColor="rgba(255, 255, 255, 0.95)"
          borderColor="rgba(203, 213, 225, 0.6)"
          padding="$5"
          marginBottom="$4"
          borderRadius={12}
          shadowColor="rgba(0, 0, 0, 0.1)"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={4}
          elevation={4}
        >
          <XStack alignItems="center" gap="$3" marginBottom="$3">
            <View
              backgroundColor="#8b5cf6"
              borderRadius={8}
              padding="$2"
            >
              <Camera size={16} color="white" />
            </View>
            <Text fontSize="$5" fontWeight="600" color="#1e293b">
              Photo
            </Text>
          </XStack>
          
          <YStack alignItems="center" gap="$3">
            {photoUri ? (
              <Avatar size="$12" borderRadius={12}>
                <Avatar.Image src={photoUri} />
              </Avatar>
            ) : (
              <View
                width={120}
                height={120}
                borderRadius={12}
                backgroundColor="#f3f4f6"
                borderWidth={2}
                borderColor="#d1d5db"
                borderStyle="dashed"
                justifyContent="center"
                alignItems="center"
              >
                <Camera size={32} color="#6b7280" />
                <Text fontSize="$2" color="#6b7280" textAlign="center" marginTop="$1">
                  No photo
                </Text>
              </View>
            )}
            
            <Button
              size="$3"
              variant="outlined"
              backgroundColor="rgba(139, 92, 246, 0.1)"
              borderColor="#8b5cf6"
              color="#8b5cf6"
              borderRadius={8}
              onPress={showImagePicker}
            >
              {photoUri ? 'Change Photo' : 'Add Photo'}
            </Button>
          </YStack>
        </Card>

        {/* Basic Information */}
        <Card
          elevate
          size="$4"
          bordered
          backgroundColor="rgba(255, 255, 255, 0.95)"
          borderColor="rgba(203, 213, 225, 0.6)"
          padding="$5"
          marginBottom="$4"
          borderRadius={12}
          shadowColor="rgba(0, 0, 0, 0.1)"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={4}
          elevation={4}
        >
          <XStack alignItems="center" gap="$3" marginBottom="$4">
            <View
              backgroundColor="#3b82f6"
              borderRadius={8}
              padding="$2"
            >
              <User size={16} color="white" />
            </View>
            <Text fontSize="$5" fontWeight="600" color="#1e293b">
              Basic Information
            </Text>
          </XStack>

          <YStack gap="$3">
            {/* Name */}
            <YStack gap="$2">
              <Text fontSize="$3" color="#6b7280" fontWeight="600">
                Name *
              </Text>
              <Input
                size="$4"
                placeholder="Enter dog's name"
                value={name}
                onChangeText={setName}
                backgroundColor="rgba(255, 255, 255, 0.9)"
                borderColor="rgba(203, 213, 225, 0.6)"
                borderRadius={8}
                fontSize="$3"
                paddingHorizontal="$3"
              />
            </YStack>

            {/* Gender */}
            <YStack gap="$2">
              <Text fontSize="$3" color="#6b7280" fontWeight="600">
                Gender
              </Text>
              <View
                borderWidth={1}
                borderColor="rgba(203, 213, 225, 0.6)"
                borderRadius={8}
                backgroundColor="rgba(255, 255, 255, 0.9)"
              >
                <Picker
                  selectedValue={gender}
                  onValueChange={(value) => setGender(value)}
                  style={{ marginHorizontal: 8 }}
                >
                  <Picker.Item label="Unknown" value="unknown" />
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                </Picker>
              </View>
            </YStack>

            {/* Status */}
            <YStack gap="$2">
              <Text fontSize="$3" color="#6b7280" fontWeight="600">
                Status
              </Text>
              <View
                borderWidth={1}
                borderColor="rgba(203, 213, 225, 0.6)"
                borderRadius={8}
                backgroundColor="rgba(255, 255, 255, 0.9)"
              >
                <Picker
                  selectedValue={status}
                  onValueChange={(value) => setStatus(value)}
                  style={{ marginHorizontal: 8 }}
                >
                  <Picker.Item label="Available" value="available" />
                  <Picker.Item label="Fostered" value="fostered" />
                  <Picker.Item label="Adopted" value="adopted" />
                  <Picker.Item label="Injured" value="injured" />
                  <Picker.Item label="Missing" value="missing" />
                  <Picker.Item label="Hidden" value="hidden" />
                  <Picker.Item label="Deceased" value="deceased" />
                </Picker>
              </View>
            </YStack>

            {/* Sterilized */}
            <XStack justifyContent="space-between" alignItems="center" paddingVertical="$2">
              <Text fontSize="$3" color="#6b7280" fontWeight="600">
                Sterilized
              </Text>
              <Switch
                size="$3"
                checked={sterilized}
                onCheckedChange={setSterilized}
              >
                <Switch.Thumb backgroundColor="white" />
              </Switch>
            </XStack>
          </YStack>
        </Card>

        {/* Dates */}
        <Card
          elevate
          size="$4"
          bordered
          backgroundColor="rgba(255, 255, 255, 0.95)"
          borderColor="rgba(203, 213, 225, 0.6)"
          padding="$5"
          marginBottom="$4"
          borderRadius={12}
          shadowColor="rgba(0, 0, 0, 0.1)"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={4}
          elevation={4}
        >
          <XStack alignItems="center" gap="$3" marginBottom="$4">
            <View
              backgroundColor="#10b981"
              borderRadius={8}
              padding="$2"
            >
              <Calendar size={16} color="white" />
            </View>
            <Text fontSize="$5" fontWeight="600" color="#1e293b">
              Important Dates
            </Text>
          </XStack>

          <YStack gap="$3">
            {/* Birth Date */}
            <YStack gap="$2">
              <Text fontSize="$3" color="#6b7280" fontWeight="600">
                Birth Date (optional)
              </Text>
              <Button
                size="$4"
                variant="outlined"
                backgroundColor="rgba(255, 255, 255, 0.9)"
                borderColor="rgba(203, 213, 225, 0.6)"
                color="#6b7280"
                borderRadius={8}
                justifyContent="flex-start"
                paddingHorizontal="$3"
                onPress={() => {
                  if (!birthDateObj) {
                    setBirthDateObj(new Date());
                  }
                  setShowBirthDatePicker(true);
                }}
              >
                <XStack alignItems="center" gap="$2">
                  <Calendar size={16} color="#6b7280" />
                  <Text fontSize="$3" color="#6b7280">
                    {birthDate || 'Select birth date'}
                  </Text>
                </XStack>
              </Button>
              {showBirthDatePicker && birthDateObj && (
                <DateTimePicker
                  value={birthDateObj}
                  mode="date"
                  display="default"
                  onChange={handleBirthDateChange}
                />
              )}
            </YStack>

            {/* Rescue Date */}
            <YStack gap="$2">
              <Text fontSize="$3" color="#6b7280" fontWeight="600">
                Rescue Date
              </Text>
              <Button
                size="$4"
                variant="outlined"
                backgroundColor="rgba(255, 255, 255, 0.9)"
                borderColor="rgba(203, 213, 225, 0.6)"
                color="#6b7280"
                borderRadius={8}
                justifyContent="flex-start"
                paddingHorizontal="$3"
                onPress={() => {
                  if (!rescueDateObj) {
                    setRescueDateObj(new Date());
                  }
                  setShowRescueDatePicker(true);
                }}
              >
                <XStack alignItems="center" gap="$2">
                  <Calendar size={16} color="#6b7280" />
                  <Text fontSize="$3" color="#6b7280">
                    {rescueDate || 'Select rescue date'}
                  </Text>
                </XStack>
              </Button>
              {showRescueDatePicker && rescueDateObj && (
                <DateTimePicker
                  value={rescueDateObj}
                  mode="date"
                  display="default"
                  onChange={handleRescueDateChange}
                />
              )}
            </YStack>
          </YStack>
        </Card>

        {/* Location */}
        <Card
          elevate
          size="$4"
          bordered
          backgroundColor="rgba(255, 255, 255, 0.95)"
          borderColor="rgba(203, 213, 225, 0.6)"
          padding="$5"
          marginBottom="$4"
          borderRadius={12}
          shadowColor="rgba(0, 0, 0, 0.1)"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={4}
          elevation={4}
        >
          <XStack alignItems="center" gap="$3" marginBottom="$4">
            <View
              backgroundColor="#f59e0b"
              borderRadius={8}
              padding="$2"
            >
              <MapPin size={16} color="white" />
            </View>
            <Text fontSize="$5" fontWeight="600" color="#1e293b">
              Location
            </Text>
          </XStack>

          <YStack gap="$2">
            <Text fontSize="$3" color="#6b7280" fontWeight="600">
              Specific Location (optional)
            </Text>
            <Input
              size="$4"
              placeholder="e.g., Beach Road, Thong Sala"
              value={locationText}
              onChangeText={setLocationText}
              backgroundColor="rgba(255, 255, 255, 0.9)"
              borderColor="rgba(203, 213, 225, 0.6)"
              borderRadius={8}
              fontSize="$3"
              paddingHorizontal="$3"
            />
          </YStack>
        </Card>

        {/* Tags */}
        <Card
          elevate
          size="$4"
          bordered
          backgroundColor="rgba(255, 255, 255, 0.95)"
          borderColor="rgba(203, 213, 225, 0.6)"
          padding="$5"
          marginBottom="$4"
          borderRadius={12}
          shadowColor="rgba(0, 0, 0, 0.1)"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={4}
          elevation={4}
        >
          <XStack alignItems="center" gap="$3" marginBottom="$4">
            <View
              backgroundColor="#ef4444"
              borderRadius={8}
              padding="$2"
            >
              <Tag size={16} color="white" />
            </View>
            <Text fontSize="$5" fontWeight="600" color="#1e293b">
              Tags
            </Text>
          </XStack>

          <YStack gap="$3">
            {/* Current Tags */}
            {tags.length > 0 && (
              <XStack gap="$2" flexWrap="wrap">
                {tags.map((tag, index) => {
                  const tagColors = getTagColor(tag);
                  return (
                    <XStack
                      key={index}
                      backgroundColor={tagColors.bg}
                      borderColor={tagColors.border}
                      borderWidth={1}
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                      borderRadius={6}
                      alignItems="center"
                      gap="$1"
                    >
                      <Text fontSize="$2" color={tagColors.text} fontWeight="600">
                        {tag}
                      </Text>
                      <Button
                        size="$1"
                        backgroundColor="transparent"
                        color={tagColors.text}
                        onPress={() => removeTag(tag)}
                        padding="$0"
                        minHeight={16}
                        minWidth={16}
                      >
                        ×
                      </Button>
                    </XStack>
                  );
                })}
              </XStack>
            )}

            {/* Predefined Tags */}
            <Text fontSize="$3" color="#6b7280" fontWeight="600">
              Quick Tags
            </Text>
            <XStack gap="$2" flexWrap="wrap">
              {predefinedTags.map((tag) => (
                <Button
                  key={tag}
                  size="$2"
                  variant="outlined"
                  backgroundColor={tags.includes(tag) ? "#3b82f6" : "transparent"}
                  borderColor="#3b82f6"
                  color={tags.includes(tag) ? "white" : "#3b82f6"}
                  borderRadius={6}
                  onPress={() => tags.includes(tag) ? removeTag(tag) : addTag(tag)}
                >
                  {tag}
                </Button>
              ))}
            </XStack>

            {/* Custom Tag Input */}
            <YStack gap="$2">
              <Text fontSize="$3" color="#6b7280" fontWeight="600">
                Add Custom Tag
              </Text>
              <XStack gap="$2" alignItems="center">
                <Input
                  flex={1}
                  size="$3"
                  placeholder="Enter tag name"
                  value={newTag}
                  onChangeText={setNewTag}
                  backgroundColor="rgba(255, 255, 255, 0.9)"
                  borderColor="rgba(203, 213, 225, 0.6)"
                  borderRadius={8}
                  fontSize="$3"
                  paddingHorizontal="$3"
                />
                <Button
                  size="$3"
                  backgroundColor="#3b82f6"
                  borderColor="#3b82f6"
                  color="white"
                  borderRadius={8}
                  onPress={() => addTag(newTag)}
                  icon={Plus}
                />
              </XStack>
            </YStack>
          </YStack>
        </Card>

        {/* Notes */}
        <Card
          elevate
          size="$4"
          bordered
          backgroundColor="rgba(255, 255, 255, 0.95)"
          borderColor="rgba(203, 213, 225, 0.6)"
          padding="$5"
          marginBottom="$6"
          borderRadius={12}
          shadowColor="rgba(0, 0, 0, 0.1)"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={4}
          elevation={4}
        >
          <XStack alignItems="center" gap="$3" marginBottom="$4">
            <View
              backgroundColor="#6b7280"
              borderRadius={8}
              padding="$2"
            >
              <Text fontSize="$3" color="white">📝</Text>
            </View>
            <Text fontSize="$5" fontWeight="600" color="#1e293b">
              Notes
            </Text>
          </XStack>

          <YStack gap="$2">
            <Text fontSize="$3" color="#6b7280" fontWeight="600">
              Additional Information (optional)
            </Text>
            <Input
              size="$4"
              placeholder="Any additional information about the dog..."
              value={notes}
              onChangeText={setNotes}
              backgroundColor="rgba(255, 255, 255, 0.9)"
              borderColor="rgba(203, 213, 225, 0.6)"
              borderRadius={8}
              fontSize="$3"
              paddingHorizontal="$3"
              multiline
              numberOfLines={4}
            />
          </YStack>
        </Card>

        {/* Submit Button */}
        <Button
          size="$5"
          backgroundColor="#3b82f6"
          borderColor="#3b82f6"
          color="white"
          borderRadius={12}
          onPress={handleSubmit}
          disabled={loading}
          shadowColor="#3b82f6"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.3}
          shadowRadius={8}
          elevation={6}
          marginBottom="$4"
        >
          <Text fontSize="$4" fontWeight="600" color="white">
            {loading ? 'Adding Dog...' : 'Add Dog'}
          </Text>
        </Button>
      </ScrollView>
    </YStack>
    </KeyboardAvoidingView>
  );
}