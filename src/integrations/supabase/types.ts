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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      button_templates: {
        Row: {
          action_type: string
          background_color: string | null
          created_at: string
          icon: string | null
          id: string
          label: string
          name: string
          status_background_color: string | null
          status_icon: string | null
          status_message: string | null
          tenant_id: string
          updated_at: string
          variant: string
        }
        Insert: {
          action_type?: string
          background_color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          label: string
          name: string
          status_background_color?: string | null
          status_icon?: string | null
          status_message?: string | null
          tenant_id?: string
          updated_at?: string
          variant?: string
        }
        Update: {
          action_type?: string
          background_color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          label?: string
          name?: string
          status_background_color?: string | null
          status_icon?: string | null
          status_message?: string | null
          tenant_id?: string
          updated_at?: string
          variant?: string
        }
        Relationships: []
      }
      call_steps: {
        Row: {
          action_buttons: Json | null
          category: string | null
          communication: string
          condition_label: string | null
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_end_step: boolean | null
          is_service_plus_step: boolean | null
          is_start_step: boolean | null
          is_topic_step: boolean | null
          next_step_conditions: Json | null
          parent_step_id: string | null
          parent_topic_id: string | null
          position_x: number | null
          position_y: number | null
          required: boolean
          sort_order: number
          status_background_color: string | null
          status_icon: string | null
          step_id: string
          step_type: string
          tenant_id: string
          title: string
          topic_id: string | null
          updated_at: string
          workflow_name: string
        }
        Insert: {
          action_buttons?: Json | null
          category?: string | null
          communication: string
          condition_label?: string | null
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          is_end_step?: boolean | null
          is_service_plus_step?: boolean | null
          is_start_step?: boolean | null
          is_topic_step?: boolean | null
          next_step_conditions?: Json | null
          parent_step_id?: string | null
          parent_topic_id?: string | null
          position_x?: number | null
          position_y?: number | null
          required?: boolean
          sort_order?: number
          status_background_color?: string | null
          status_icon?: string | null
          step_id: string
          step_type?: string
          tenant_id?: string
          title: string
          topic_id?: string | null
          updated_at?: string
          workflow_name?: string
        }
        Update: {
          action_buttons?: Json | null
          category?: string | null
          communication?: string
          condition_label?: string | null
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_end_step?: boolean | null
          is_service_plus_step?: boolean | null
          is_start_step?: boolean | null
          is_topic_step?: boolean | null
          next_step_conditions?: Json | null
          parent_step_id?: string | null
          parent_topic_id?: string | null
          position_x?: number | null
          position_y?: number | null
          required?: boolean
          sort_order?: number
          status_background_color?: string | null
          status_icon?: string | null
          step_id?: string
          step_type?: string
          tenant_id?: string
          title?: string
          topic_id?: string | null
          updated_at?: string
          workflow_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_steps_parent_step_id_fkey"
            columns: ["parent_step_id"]
            isOneToOne: false
            referencedRelation: "call_steps"
            referencedColumns: ["step_id"]
          },
          {
            foreignKeyName: "call_steps_parent_topic_id_fkey"
            columns: ["parent_topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_steps_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      game_runs: {
        Row: {
          coins: number | null
          correct: number | null
          created_at: string | null
          duration_seconds: number | null
          finished_at: string | null
          game_id: string | null
          id: string
          meta: Json | null
          profile_id: string | null
          score: number | null
          started_at: string | null
          wrong: number | null
        }
        Insert: {
          coins?: number | null
          correct?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          finished_at?: string | null
          game_id?: string | null
          id?: string
          meta?: Json | null
          profile_id?: string | null
          score?: number | null
          started_at?: string | null
          wrong?: number | null
        }
        Update: {
          coins?: number | null
          correct?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          finished_at?: string | null
          game_id?: string | null
          id?: string
          meta?: Json | null
          profile_id?: string | null
          score?: number | null
          started_at?: string | null
          wrong?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_runs_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_runs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "alltime_leaderboard"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "game_runs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "monthly_leaderboard"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "game_runs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          completed: boolean
          created_at: string
          date: string
          end_time: string | null
          game_id: string
          game_title: string
          id: string
          play_time: number
          profile_id: string | null
          score: number | null
          start_time: string
          user_id: string
          user_name: string
          xp_earned: number
        }
        Insert: {
          completed?: boolean
          created_at?: string
          date: string
          end_time?: string | null
          game_id: string
          game_title: string
          id: string
          play_time?: number
          profile_id?: string | null
          score?: number | null
          start_time: string
          user_id: string
          user_name: string
          xp_earned?: number
        }
        Update: {
          completed?: boolean
          created_at?: string
          date?: string
          end_time?: string | null
          game_id?: string
          game_title?: string
          id?: string
          play_time?: number
          profile_id?: string | null
          score?: number | null
          start_time?: string
          user_id?: string
          user_name?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "alltime_leaderboard"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "game_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "monthly_leaderboard"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "game_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          cover: string
          created_at: string
          created_by: string | null
          description: string
          difficulty: string
          embed_code: string
          embed_url: string | null
          featured: boolean
          icon_url: string | null
          id: string
          play_time: string
          players: number
          rating: number
          slug: string | null
          sort_index: number | null
          tags: string[]
          title: string
          type: string | null
          updated_at: string
          url: string
          visible: boolean | null
        }
        Insert: {
          cover: string
          created_at?: string
          created_by?: string | null
          description: string
          difficulty?: string
          embed_code?: string
          embed_url?: string | null
          featured?: boolean
          icon_url?: string | null
          id: string
          play_time?: string
          players?: number
          rating?: number
          slug?: string | null
          sort_index?: number | null
          tags?: string[]
          title: string
          type?: string | null
          updated_at?: string
          url?: string
          visible?: boolean | null
        }
        Update: {
          cover?: string
          created_at?: string
          created_by?: string | null
          description?: string
          difficulty?: string
          embed_code?: string
          embed_url?: string | null
          featured?: boolean
          icon_url?: string | null
          id?: string
          play_time?: string
          players?: number
          rating?: number
          slug?: string | null
          sort_index?: number | null
          tags?: string[]
          title?: string
          type?: string | null
          updated_at?: string
          url?: string
          visible?: boolean | null
        }
        Relationships: []
      }
      objections: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          keywords: string[]
          priority: number
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          keywords?: string[]
          priority?: number
          tenant_id?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          keywords?: string[]
          priority?: number
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          current_level: number
          display_name: string | null
          email: string | null
          first_name: string | null
          id: string
          is_active: boolean | null
          last_activity_at: string | null
          last_name: string | null
          moodle_user_id: string
          password_hash: string | null
          password_last_set_at: string | null
          password_salt: string | null
          profile_image_url: string | null
          project: string | null
          role: string | null
          temp_password_expires_at: string | null
          total_xp: number
          updated_at: string
          user_id: string | null
          username: string
          welcome_bonus_received: boolean
          work_email: string | null
          workplace: string | null
        }
        Insert: {
          created_at?: string
          current_level?: number
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_activity_at?: string | null
          last_name?: string | null
          moodle_user_id: string
          password_hash?: string | null
          password_last_set_at?: string | null
          password_salt?: string | null
          profile_image_url?: string | null
          project?: string | null
          role?: string | null
          temp_password_expires_at?: string | null
          total_xp?: number
          updated_at?: string
          user_id?: string | null
          username: string
          welcome_bonus_received?: boolean
          work_email?: string | null
          workplace?: string | null
        }
        Update: {
          created_at?: string
          current_level?: number
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_activity_at?: string | null
          last_name?: string | null
          moodle_user_id?: string
          password_hash?: string | null
          password_last_set_at?: string | null
          password_salt?: string | null
          profile_image_url?: string | null
          project?: string | null
          role?: string | null
          temp_password_expires_at?: string | null
          total_xp?: number
          updated_at?: string
          user_id?: string | null
          username?: string
          welcome_bonus_received?: boolean
          work_email?: string | null
          workplace?: string | null
        }
        Relationships: []
      }
      responses: {
        Row: {
          created_at: string
          follow_up_steps: Json | null
          id: string
          objection_id: string | null
          response_text: string
          sort_order: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          follow_up_steps?: Json | null
          id?: string
          objection_id?: string | null
          response_text: string
          sort_order?: number
          tenant_id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          follow_up_steps?: Json | null
          id?: string
          objection_id?: string | null
          response_text?: string
          sort_order?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "responses_objection_id_fkey"
            columns: ["objection_id"]
            isOneToOne: false
            referencedRelation: "objections"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string | null
          domain: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain?: string | null
          id: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      topics: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
          step_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          step_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          step_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "call_steps"
            referencedColumns: ["step_id"]
          },
        ]
      }
      user_activities: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          profile_id: string
          xp_earned: number
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          profile_id: string
          xp_earned?: number
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          profile_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "alltime_leaderboard"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_activities_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "monthly_leaderboard"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_activities_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          created_at: string | null
          last_login_at: string | null
          profile_id: string
          rank_snapshot: Json | null
          updated_at: string | null
          xp_month: number | null
          xp_total: number | null
        }
        Insert: {
          created_at?: string | null
          last_login_at?: string | null
          profile_id: string
          rank_snapshot?: Json | null
          updated_at?: string | null
          xp_month?: number | null
          xp_total?: number | null
        }
        Update: {
          created_at?: string | null
          last_login_at?: string | null
          profile_id?: string
          rank_snapshot?: Json | null
          updated_at?: string | null
          xp_month?: number | null
          xp_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "alltime_leaderboard"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_stats_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "monthly_leaderboard"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_stats_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_xp_actions: {
        Row: {
          completed_at: string
          id: string
          metadata: Json | null
          profile_id: string
          xp_action_id: string
          xp_earned: number
        }
        Insert: {
          completed_at?: string
          id?: string
          metadata?: Json | null
          profile_id: string
          xp_action_id: string
          xp_earned?: number
        }
        Update: {
          completed_at?: string
          id?: string
          metadata?: Json | null
          profile_id?: string
          xp_action_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_xp_actions_xp_action_id_fkey"
            columns: ["xp_action_id"]
            isOneToOne: false
            referencedRelation: "xp_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_actions: {
        Row: {
          action_type: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          action_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: []
      }
    }
    Views: {
      alltime_leaderboard: {
        Row: {
          best_score: number | null
          display_name: string | null
          game_id: string | null
          profile_id: string | null
          profile_image_url: string | null
          rank: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_runs_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_leaderboard: {
        Row: {
          best_score: number | null
          display_name: string | null
          game_id: string | null
          month_year: string | null
          profile_id: string | null
          profile_image_url: string | null
          rank: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_runs_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_level: {
        Args: { xp: number }
        Returns: number
      }
      calculate_monthly_xp: {
        Args: { target_month?: string; target_profile_id: string }
        Returns: number
      }
      generate_temp_password: {
        Args: { target_user_id: string }
        Returns: string
      }
      get_leaderboard_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          current_level: number
          id: string
          profile_image_url: string
          total_xp: number
          username: string
        }[]
      }
      get_user_rank_changes: {
        Args: { target_profile_id: string }
        Returns: Json
      }
      increment_profile_xp: {
        Args: { profile_id: string; xp_amount: number }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
