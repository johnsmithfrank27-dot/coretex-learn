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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      calendar_events: {
        Row: {
          all_day: boolean
          category: string
          color: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          location: string | null
          starts_at: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          all_day?: boolean
          category?: string
          color?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          location?: string | null
          starts_at: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          all_day?: boolean
          category?: string
          color?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          location?: string | null
          starts_at?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          ai_summary: string | null
          author_id: string
          body: string
          bookmarks_count: number
          comments_count: number
          created_at: string
          id: string
          is_featured: boolean
          likes_count: number
          post_type: string
          shares_count: number
          subject: string
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          ai_summary?: string | null
          author_id: string
          body: string
          bookmarks_count?: number
          comments_count?: number
          created_at?: string
          id?: string
          is_featured?: boolean
          likes_count?: number
          post_type?: string
          shares_count?: number
          subject?: string
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          ai_summary?: string | null
          author_id?: string
          body?: string
          bookmarks_count?: number
          comments_count?: number
          created_at?: string
          id?: string
          is_featured?: boolean
          likes_count?: number
          post_type?: string
          shares_count?: number
          subject?: string
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: []
      }
      flashcard_items: {
        Row: {
          answer: string
          audio_url: string | null
          created_at: string
          difficulty: string
          flashcard_id: string
          hint: string | null
          id: string
          image_url: string | null
          last_reviewed_at: string | null
          prompt: string
          review_count: number
        }
        Insert: {
          answer: string
          audio_url?: string | null
          created_at?: string
          difficulty?: string
          flashcard_id: string
          hint?: string | null
          id?: string
          image_url?: string | null
          last_reviewed_at?: string | null
          prompt: string
          review_count?: number
        }
        Update: {
          answer?: string
          audio_url?: string | null
          created_at?: string
          difficulty?: string
          flashcard_id?: string
          hint?: string | null
          id?: string
          image_url?: string | null
          last_reviewed_at?: string | null
          prompt?: string
          review_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_items_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcards: {
        Row: {
          card_count: number
          category: string
          created_at: string
          deck_type: string
          difficulty: string
          due_today: number
          id: string
          is_bookmarked: boolean
          is_favorite: boolean
          mastery_score: number
          owner_id: string
          source: string
          title: string
          updated_at: string
        }
        Insert: {
          card_count?: number
          category?: string
          created_at?: string
          deck_type?: string
          difficulty?: string
          due_today?: number
          id?: string
          is_bookmarked?: boolean
          is_favorite?: boolean
          mastery_score?: number
          owner_id: string
          source?: string
          title: string
          updated_at?: string
        }
        Update: {
          card_count?: number
          category?: string
          created_at?: string
          deck_type?: string
          difficulty?: string
          due_today?: number
          id?: string
          is_bookmarked?: boolean
          is_favorite?: boolean
          mastery_score?: number
          owner_id?: string
          source?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      gamification_challenges: {
        Row: {
          category: string
          completed: boolean
          created_at: string
          description: string
          id: string
          reward: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          completed?: boolean
          created_at?: string
          description: string
          id?: string
          reward: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          completed?: boolean
          created_at?: string
          description?: string
          id?: string
          reward?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gamification_challenges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gamification_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          reputation_delta: number
          user_id: string
          xp_delta: number
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          reputation_delta?: number
          user_id: string
          xp_delta?: number
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          reputation_delta?: number
          user_id?: string
          xp_delta?: number
        }
        Relationships: [
          {
            foreignKeyName: "gamification_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gamification_missions: {
        Row: {
          category: string
          completed: boolean
          created_at: string
          description: string
          id: string
          reward: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          completed?: boolean
          created_at?: string
          description: string
          id?: string
          reward: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          completed?: boolean
          created_at?: string
          description?: string
          id?: string
          reward?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gamification_missions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_progress: {
        Row: {
          created_at: string
          daily_missions: Json
          id: string
          lessons_completed: number
          mastery_score: number
          quizzes_completed: number
          streak_days: number
          subject: string
          updated_at: string
          user_id: string
          weekly_goals: Json
          xp_earned: number
        }
        Insert: {
          created_at?: string
          daily_missions?: Json
          id?: string
          lessons_completed?: number
          mastery_score?: number
          quizzes_completed?: number
          streak_days?: number
          subject?: string
          updated_at?: string
          user_id: string
          weekly_goals?: Json
          xp_earned?: number
        }
        Update: {
          created_at?: string
          daily_missions?: Json
          id?: string
          lessons_completed?: number
          mastery_score?: number
          quizzes_completed?: number
          streak_days?: number
          subject?: string
          updated_at?: string
          user_id?: string
          weekly_goals?: Json
          xp_earned?: number
        }
        Relationships: []
      }
      notes: {
        Row: {
          ai_summary: string | null
          content: string
          created_at: string
          folder: string
          id: string
          is_favorite: boolean
          is_pinned: boolean
          is_shared: boolean
          owner_id: string
          tags: string[]
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          ai_summary?: string | null
          content?: string
          created_at?: string
          folder?: string
          id?: string
          is_favorite?: boolean
          is_pinned?: boolean
          is_shared?: boolean
          owner_id: string
          tags?: string[]
          title?: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          ai_summary?: string | null
          content?: string
          created_at?: string
          folder?: string
          id?: string
          is_favorite?: boolean
          is_pinned?: boolean
          is_shared?: boolean
          owner_id?: string
          tags?: string[]
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          achievements: Json | null
          avatar_url: string | null
          badges: Json | null
          created_at: string
          current_season: string | null
          current_title: string | null
          display_name: string | null
          education_level: string | null
          featured_badges: Json | null
          focus: number
          focus_last_updated: string | null
          goals: string[]
          id: string
          level: number
          mastery_snapshot: Json | null
          next_title: string | null
          reputation: number
          school: string | null
          season_level: number
          season_xp: number
          streak_days: number
          subjects: string[]
          updated_at: string
          username: string | null
          xp: number
        }
        Insert: {
          achievements?: Json | null
          avatar_url?: string | null
          badges?: Json | null
          created_at?: string
          current_season?: string | null
          current_title?: string | null
          display_name?: string | null
          education_level?: string | null
          featured_badges?: Json | null
          focus?: number
          focus_last_updated?: string | null
          goals?: string[]
          id: string
          level?: number
          mastery_snapshot?: Json | null
          next_title?: string | null
          reputation?: number
          school?: string | null
          season_level?: number
          season_xp?: number
          streak_days?: number
          subjects?: string[]
          updated_at?: string
          username?: string | null
          xp?: number
        }
        Update: {
          achievements?: Json | null
          avatar_url?: string | null
          badges?: Json | null
          created_at?: string
          current_season?: string | null
          current_title?: string | null
          display_name?: string | null
          education_level?: string | null
          featured_badges?: Json | null
          focus?: number
          focus_last_updated?: string | null
          goals?: string[]
          id?: string
          level?: number
          mastery_snapshot?: Json | null
          next_title?: string | null
          reputation?: number
          school?: string | null
          season_level?: number
          season_xp?: number
          streak_days?: number
          subjects?: string[]
          updated_at?: string
          username?: string | null
          xp?: number
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          correct_answer: string | null
          created_at: string
          explanation: string | null
          id: string
          image_url: string | null
          options: Json
          prompt: string
          question_type: string
          quiz_id: string
        }
        Insert: {
          correct_answer?: string | null
          created_at?: string
          explanation?: string | null
          id?: string
          image_url?: string | null
          options?: Json
          prompt: string
          question_type?: string
          quiz_id: string
        }
        Update: {
          correct_answer?: string | null
          created_at?: string
          explanation?: string | null
          id?: string
          image_url?: string | null
          options?: Json
          prompt?: string
          question_type?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          ai_generated: boolean
          created_at: string
          difficulty: string
          id: string
          mode: string
          owner_id: string
          question_count: number
          subject: string
          time_limit: number | null
          title: string
          updated_at: string
          visibility: string
          xp_reward: number
        }
        Insert: {
          ai_generated?: boolean
          created_at?: string
          difficulty?: string
          id?: string
          mode?: string
          owner_id: string
          question_count?: number
          subject?: string
          time_limit?: number | null
          title: string
          updated_at?: string
          visibility?: string
          xp_reward?: number
        }
        Update: {
          ai_generated?: boolean
          created_at?: string
          difficulty?: string
          id?: string
          mode?: string
          owner_id?: string
          question_count?: number
          subject?: string
          time_limit?: number | null
          title?: string
          updated_at?: string
          visibility?: string
          xp_reward?: number
        }
        Relationships: []
      }
      reward_chests: {
        Row: {
          created_at: string
          id: string
          level_unlocked: number
          opened: boolean
          reward_name: string
          reward_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level_unlocked: number
          opened?: boolean
          reward_name: string
          reward_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level_unlocked?: number
          opened?: boolean
          reward_name?: string
          reward_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_chests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      streaks: {
        Row: {
          current_streak: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          streak_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          streak_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          streak_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      study_groups: {
        Row: {
          banner_url: string | null
          created_at: string
          description: string | null
          id: string
          invite_code: string
          name: string
          owner_id: string
          profile_image_url: string | null
          subject: string
          updated_at: string
          weekly_challenge: string | null
          xp: number
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          invite_code?: string
          name: string
          owner_id: string
          profile_image_url?: string | null
          subject?: string
          updated_at?: string
          weekly_challenge?: string | null
          xp?: number
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          invite_code?: string
          name?: string
          owner_id?: string
          profile_image_url?: string | null
          subject?: string
          updated_at?: string
          weekly_challenge?: string | null
          xp?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_group_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      is_group_moderator: {
        Args: { _group_id: string; _user_id: string }
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
