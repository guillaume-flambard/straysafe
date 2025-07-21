import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Database } from '../lib/database.types'

type UserProfile = Database['public']['Tables']['users']['Row']

interface AuthContextType {
  session: Session | null
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName?: string, locationId?: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  userProfile: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setUserProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
      } else {
        setUserProfile(data)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, fullName?: string, locationId?: string) => {
    try {
      console.log('🚀 Starting signup process...')
      console.log('📧 Email:', email)
      console.log('👤 Full Name:', fullName)
      console.log('📍 Location ID:', locationId)
      
      // First, ensure we have a location before creating the auth user
      // This is needed because there might be a database trigger
      console.log('0️⃣ Ensuring location exists first...')
      
      const zoneMapping: Record<string, {name: string, country: string}> = {
        'koh-phangan': { name: 'Koh Phangan', country: 'Thailand' },
        'chiang-mai': { name: 'Chiang Mai', country: 'Thailand' },
        'bali': { name: 'Bali', country: 'Indonesia' },
        'athens': { name: 'Athens', country: 'Greece' }
      }
      
      const selectedZone = locationId || 'koh-phangan'
      const locationData = zoneMapping[selectedZone]
      
      if (!locationData) {
        return { error: new Error('Invalid location selected') }
      }

      // Create location if it doesn't exist (simplified approach)
      console.log('🔍 Checking if location exists...')
      let { data: existingLocation, error: locationCheckError } = await supabase
        .from('locations')
        .select('id')
        .eq('name', locationData.name)
        .eq('country', locationData.country)
        .single()

      if (existingLocation) {
        console.log('✅ Location already exists:', existingLocation.id)
      } else {
        console.log('🏗️ Creating new location...')
        const { data: newLocation, error: locationCreateError } = await supabase
          .from('locations')
          .insert({
            name: locationData.name,
            country: locationData.country
          })
          .select('id')
          .single()

        if (locationCreateError) {
          console.error('❌ Location creation failed:', locationCreateError)
          // Try to find any existing location as fallback
          const { data: fallbackLocation } = await supabase
            .from('locations')
            .select('id')
            .limit(1)
            .single()

          if (fallbackLocation) {
            console.log('✅ Using fallback location:', fallbackLocation.id)
            existingLocation = fallbackLocation
          } else {
            return { error: new Error('No locations available and failed to create location') }
          }
        } else {
          console.log('✅ Location created:', newLocation.id)
          existingLocation = newLocation
        }
      }
      
      // Now try to sign up the user with Supabase Auth
      console.log('1️⃣ Creating Supabase auth user...')
      console.log('📍 Will use location ID:', existingLocation.id)
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            location_id: existingLocation.id,
            location_name: locationData.name,
            location_country: locationData.country,
          },
        },
      })

      if (authError) {
        console.error('❌ Auth signup failed:', authError)
        return { error: authError }
      }

      console.log('✅ Auth signup successful, user ID:', authData.user?.id)

      // Check if user profile was created automatically by a database trigger
      if (authData.user) {
        console.log('2️⃣ Checking if user profile was created automatically...')
        
        // Wait a moment for any triggers to complete
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('users')
          .select('id, email, full_name, role, location_id')
          .eq('id', authData.user.id)
          .single()

        if (existingProfile) {
          console.log('✅ User profile exists (created by trigger):', existingProfile)
        } else {
          console.log('3️⃣ No profile found, creating manually...')
          
          // Get location ID for the selected zone
          const { data: location } = await supabase
            .from('locations')
            .select('id')
            .eq('name', locationData.name)
            .eq('country', locationData.country)
            .single()

          if (!location) {
            return { error: new Error('Location not found after creation') }
          }

          // Create user profile manually
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              email: email,
              full_name: fullName || null,
              role: 'viewer',
              location_id: location.id,
            })

          if (profileError) {
            console.error('❌ Manual profile creation failed:', profileError)
            return { error: new Error('Failed to create user profile: ' + profileError.message) }
          }

          console.log('✅ User profile created manually')
        }
      }

      return { error: null }
    } catch (error) {
      console.error('Signup error:', error)
      return { error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    session,
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}