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
      histories: {
        Row: {
          id: string
          user_id: string
          tmdb_id: number
          content_type: string
          title: string
          poster_path: string | null
          progress: number
          duration: number
          season_number: number | null
          episode_number: number | null
          watched_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tmdb_id: number
          content_type: string
          title: string
          poster_path?: string | null
          progress: number
          duration: number
          season_number?: number | null
          episode_number?: number | null
          watched_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tmdb_id?: number
          content_type?: string
          title?: string
          poster_path?: string | null
          progress?: number
          duration?: number
          season_number?: number | null
          episode_number?: number | null
          watched_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          tmdb_id: number
          content_type: string
          title: string
          poster_path: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tmdb_id: number
          content_type: string
          title: string
          poster_path?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tmdb_id?: number
          content_type?: string
          title?: string
          poster_path?: string | null
          created_at?: string
        }
        Relationships: []
      }
      ads: {
        Row: {
          id: string
          title: string
          image_url: string
          link_url: string | null
          position: string
          is_active: boolean
          click_count: number
          created_at: string
          updated_at: string
          end_date: string | null
        }
        Insert: {
          id?: string
          title: string
          image_url: string
          link_url?: string | null
          position: string
          is_active?: boolean
          click_count?: number
          created_at?: string
          updated_at?: string
          end_date?: string | null
        }
        Update: {
          id?: string
          title?: string
          image_url?: string
          link_url?: string | null
          position?: string
          is_active?: boolean
          click_count?: number
          created_at?: string
          updated_at?: string
          end_date?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      watchlist: {
        Row: {
          user_id: string
          id: number
          content_type: string
          adult: boolean
          backdrop_path: string | null
          poster_path: string | null
          release_date: string
          title: string
          vote_average: number
          created_at: string
        }
        Insert: {
          user_id: string
          id: number
          content_type: string
          adult: boolean
          backdrop_path?: string | null
          poster_path?: string | null
          release_date: string
          title: string
          vote_average: number
          created_at?: string
        }
        Update: {
          user_id?: string
          id?: number
          content_type?: string
          adult?: boolean
          backdrop_path?: string | null
          poster_path?: string | null
          release_date?: string
          title?: string
          vote_average?: number
          created_at?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never
