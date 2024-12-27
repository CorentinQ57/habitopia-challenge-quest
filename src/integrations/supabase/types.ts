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
      habit_logs: {
        Row: {
          completed_at: string
          experience_gained: number
          habit_id: string | null
          id: string
          notes: string | null
          status: string
        }
        Insert: {
          completed_at?: string
          experience_gained?: number
          habit_id?: string | null
          id?: string
          notes?: string | null
          status?: string
        }
        Update: {
          completed_at?: string
          experience_gained?: number
          habit_id?: string | null
          id?: string
          notes?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          experience_points: number
          icon: string | null
          id: string
          is_popular: boolean | null
          title: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          experience_points?: number
          icon?: string | null
          id?: string
          is_popular?: boolean | null
          title: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          experience_points?: number
          icon?: string | null
          id?: string
          is_popular?: boolean | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      rewards: {
        Row: {
          cost: number
          created_at: string
          description: string | null
          id: string
          is_freeze_token: boolean | null
          level: number
          title: string
        }
        Insert: {
          cost: number
          created_at?: string
          description?: string | null
          id?: string
          is_freeze_token?: boolean | null
          level?: number
          title: string
        }
        Update: {
          cost?: number
          created_at?: string
          description?: string | null
          id?: string
          is_freeze_token?: boolean | null
          level?: number
          title?: string
        }
        Relationships: []
      }
      skins: {
        Row: {
          cost: number
          created_at: string
          description: string | null
          id: string
          preview_url: string | null
          theme_colors: Json | null
          title: string
          type: string
        }
        Insert: {
          cost?: number
          created_at?: string
          description?: string | null
          id?: string
          preview_url?: string | null
          theme_colors?: Json | null
          title: string
          type: string
        }
        Update: {
          cost?: number
          created_at?: string
          description?: string | null
          id?: string
          preview_url?: string | null
          theme_colors?: Json | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      user_rewards: {
        Row: {
          id: string
          purchased_at: string
          reward_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          purchased_at?: string
          reward_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          purchased_at?: string
          reward_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_skins: {
        Row: {
          id: string
          is_active: boolean | null
          purchased_at: string
          skin_id: string
          user_id: string | null
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          purchased_at?: string
          skin_id: string
          user_id?: string | null
        }
        Update: {
          id?: string
          is_active?: boolean | null
          purchased_at?: string
          skin_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_skins_skin_id_fkey"
            columns: ["skin_id"]
            isOneToOne: false
            referencedRelation: "skins"
            referencedColumns: ["id"]
          },
        ]
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number
          freeze_tokens: number | null
          freeze_used_date: string | null
          id: string
          last_activity_date: string
          longest_streak: number
          tasks_completed_today: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_streak?: number
          freeze_tokens?: number | null
          freeze_used_date?: string | null
          id?: string
          last_activity_date?: string
          longest_streak?: number
          tasks_completed_today?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_streak?: number
          freeze_tokens?: number | null
          freeze_used_date?: string | null
          id?: string
          last_activity_date?: string
          longest_streak?: number
          tasks_completed_today?: number
          updated_at?: string
          user_id?: string | null
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
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
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
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
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
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
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
