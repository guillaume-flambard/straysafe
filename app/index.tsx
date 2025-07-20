import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { router } from 'expo-router'

export default function Index() {
  const { session, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (session) {
        router.replace('/(tabs)')
      } else {
        router.replace('/(auth)/login')
      }
    }
  }, [session, loading])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  )
}