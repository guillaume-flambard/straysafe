export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      locations: {
        Row: {
          id: string
          name: string
          country: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          country: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          country?: string
          created_at?: string
        }
      }
      dogs: {
        Row: {
          id: string
          name: string
          gender: 'male' | 'female' | 'unknown'
          status: 'fostered' | 'available' | 'adopted' | 'injured' | 'missing' | 'hidden' | 'deceased'
          birth_date: string | null
          sterilized: boolean
          location_id: string
          location_text: string | null
          gps_latitude: number | null
          gps_longitude: number | null
          rescue_date: string | null
          rescuer_id: string | null
          foster_id: string | null
          vet_id: string | null
          adopter_id: string | null
          photo_url: string | null
          notes: string | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          gender: 'male' | 'female' | 'unknown'
          status: 'fostered' | 'available' | 'adopted' | 'injured' | 'missing' | 'hidden' | 'deceased'
          birth_date?: string | null
          sterilized?: boolean
          location_id: string
          location_text?: string | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          rescue_date?: string | null
          rescuer_id?: string | null
          foster_id?: string | null
          vet_id?: string | null
          adopter_id?: string | null
          photo_url?: string | null
          notes?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          gender?: 'male' | 'female' | 'unknown'
          status?: 'fostered' | 'available' | 'adopted' | 'injured' | 'missing' | 'hidden' | 'deceased'
          birth_date?: string | null
          sterilized?: boolean
          location_id?: string
          location_text?: string | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          rescue_date?: string | null
          rescuer_id?: string | null
          foster_id?: string | null
          vet_id?: string | null
          adopter_id?: string | null
          photo_url?: string | null
          notes?: string | null
          tags?: string[]
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'volunteer' | 'vet' | 'viewer'
          location_id: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'volunteer' | 'vet' | 'viewer'
          location_id: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'volunteer' | 'vet' | 'viewer'
          location_id?: string
        }
      }
      events: {
        Row: {
          id: string
          dog_id: string
          user_id: string
          event_type: 'vet' | 'adoption' | 'transfer' | 'note' | 'incident'
          title: string
          description: string | null
          privacy_level: 'public' | 'private' | 'sensitive'
          photo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          dog_id: string
          user_id: string
          event_type: 'vet' | 'adoption' | 'transfer' | 'note' | 'incident'
          title: string
          description?: string | null
          privacy_level?: 'public' | 'private' | 'sensitive'
          photo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          dog_id?: string
          user_id?: string
          event_type?: 'vet' | 'adoption' | 'transfer' | 'note' | 'incident'
          title?: string
          description?: string | null
          privacy_level?: 'public' | 'private' | 'sensitive'
          photo_url?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}