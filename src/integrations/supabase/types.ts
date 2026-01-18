export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          category: string | null
          id: string
          user_id: string
          video_id: string
          video_title: string
          watch_duration_seconds: number | null
          watched_at: string
        }
        Insert: {
          category?: string | null
          id?: string
          user_id: string
          video_id: string
          video_title: string
          watch_duration_seconds?: number | null
          watched_at?: string
        }
        Update: {
          category?: string | null
          id?: string
          user_id?: string
          video_id?: string
          video_title?: string
          watch_duration_seconds?: number | null
          watched_at?: string
        }
        Relationships: []
      }
      blocked_categories: {
        Row: {
          blocked_by: string
          category: string
          child_user_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_by: string
          category: string
          child_user_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_by?: string
          category?: string
          child_user_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      daily_watch_time: {
        Row: {
          id: string
          total_seconds: number | null
          user_id: string
          watch_date: string
        }
        Insert: {
          id?: string
          total_seconds?: number | null
          user_id: string
          watch_date?: string
        }
        Update: {
          id?: string
          total_seconds?: number | null
          user_id?: string
          watch_date?: string
        }
        Relationships: []
      }
      parent_child_links: {
        Row: {
          child_user_id: string
          created_at: string
          id: string
          parent_user_id: string
        }
        Insert: {
          child_user_id: string
          created_at?: string
          id?: string
          parent_user_id: string
        }
        Update: {
          child_user_id?: string
          created_at?: string
          id?: string
          parent_user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          created_at: string
          created_by_parent: string | null
          display_name: string
          email: string | null
          id: string
          is_parent: boolean | null
          pin_hash: string | null
          selected_theme: Database["public"]["Enums"]["app_theme"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          created_by_parent?: string | null
          display_name: string
          email?: string | null
          id?: string
          is_parent?: boolean | null
          pin_hash?: string | null
          selected_theme?: Database["public"]["Enums"]["app_theme"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          created_by_parent?: string | null
          display_name?: string
          email?: string | null
          id?: string
          is_parent?: boolean | null
          pin_hash?: string | null
          selected_theme?: Database["public"]["Enums"]["app_theme"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      time_limits: {
        Row: {
          bedtime_end: string | null
          bedtime_start: string | null
          child_user_id: string
          created_at: string
          daily_limit_minutes: number | null
          id: string
          is_enabled: boolean | null
          updated_at: string
        }
        Insert: {
          bedtime_end?: string | null
          bedtime_start?: string | null
          child_user_id: string
          created_at?: string
          daily_limit_minutes?: number | null
          id?: string
          is_enabled?: boolean | null
          updated_at?: string
        }
        Update: {
          bedtime_end?: string | null
          bedtime_start?: string | null
          child_user_id?: string
          created_at?: string
          daily_limit_minutes?: number | null
          id?: string
          is_enabled?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      user_video_preferences: {
        Row: {
          category: Database["public"]["Enums"]["video_category"]
          id: string
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["video_category"]
          id?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["video_category"]
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      video_child_access: {
        Row: {
          child_user_id: string
          created_at: string
          granted_by: string
          id: string
          video_id: string
        }
        Insert: {
          child_user_id: string
          created_at?: string
          granted_by: string
          id?: string
          video_id: string
        }
        Update: {
          child_user_id?: string
          created_at?: string
          granted_by?: string
          id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_child_access_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          available_from: string | null
          available_until: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          uploaded_by: string
          video_url: string
        }
        Insert: {
          available_from?: string | null
          available_until?: string | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          uploaded_by: string
          video_url: string
        }
        Update: {
          available_from?: string | null
          available_until?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          uploaded_by?: string
          video_url?: string
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
      app_theme:
        | "rainbow"
        | "princess"
        | "ocean"
        | "space"
        | "jungle"
        | "candy"
        | "superhero"
        | "dinosaur"
      video_category:
        | "music"
        | "animals"
        | "crafts"
        | "stories"
        | "science"
        | "games"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_theme: [
        "rainbow",
        "princess",
        "ocean",
        "space",
        "jungle",
        "candy",
        "superhero",
        "dinosaur",
      ],
      video_category: [
        "music",
        "animals",
        "crafts",
        "stories",
        "science",
        "games",
      ],
    },
  },
} as const
