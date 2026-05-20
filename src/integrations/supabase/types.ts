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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      form_submissions: {
        Row: {
          created_at: string
          form_type: string
          id: string
          inputs: Json
          results: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          form_type: string
          id?: string
          inputs?: Json
          results?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          form_type?: string
          id?: string
          inputs?: Json
          results?: Json
          user_id?: string
        }
        Relationships: []
      }
      otp_codes: {
        Row: {
          accepted_terms: boolean | null
          code: string
          created_at: string | null
          custom_user_id: string | null
          email: string
          expires_at: string
          full_name: string | null
          id: string
          used: boolean | null
          user_type: string | null
        }
        Insert: {
          accepted_terms?: boolean | null
          code: string
          created_at?: string | null
          custom_user_id?: string | null
          email: string
          expires_at: string
          full_name?: string | null
          id?: string
          used?: boolean | null
          user_type?: string | null
        }
        Update: {
          accepted_terms?: boolean | null
          code?: string
          created_at?: string | null
          custom_user_id?: string | null
          email?: string
          expires_at?: string
          full_name?: string | null
          id?: string
          used?: boolean | null
          user_type?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accepted_terms: boolean
          created_at: string
          custom_user_id: string | null
          email: string
          full_name: string
          id: string
          last_login: string | null
          phone_number: string | null
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          accepted_terms?: boolean
          created_at?: string
          custom_user_id?: string | null
          email: string
          full_name: string
          id?: string
          last_login?: string | null
          phone_number?: string | null
          user_id: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          accepted_terms?: boolean
          created_at?: string
          custom_user_id?: string | null
          email?: string
          full_name?: string
          id?: string
          last_login?: string | null
          phone_number?: string | null
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      receipts: {
        Row: {
          amount: number
          created_at: string
          currency: string
          email_sent_at: string | null
          id: string
          payment_date: string
          paypal_subscription_id: string | null
          paypal_transaction_id: string | null
          pdf_base64: string | null
          plan_type: string
          receipt_number: string
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          email_sent_at?: string | null
          id?: string
          payment_date?: string
          paypal_subscription_id?: string | null
          paypal_transaction_id?: string | null
          pdf_base64?: string | null
          plan_type: string
          receipt_number: string
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          email_sent_at?: string | null
          id?: string
          payment_date?: string
          paypal_subscription_id?: string | null
          paypal_transaction_id?: string | null
          pdf_base64?: string | null
          plan_type?: string
          receipt_number?: string
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_blog_posts: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          body_md: string
          client_notes: string | null
          created_at: string
          deployed_at: string | null
          id: string
          internal_notes: string | null
          meta_description: string | null
          primary_keyword: string | null
          read_minutes: number | null
          scheduled_date: string | null
          secondary_keywords: string[]
          slug: string
          status: string
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          body_md: string
          client_notes?: string | null
          created_at?: string
          deployed_at?: string | null
          id?: string
          internal_notes?: string | null
          meta_description?: string | null
          primary_keyword?: string | null
          read_minutes?: number | null
          scheduled_date?: string | null
          secondary_keywords?: string[]
          slug: string
          status?: string
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          body_md?: string
          client_notes?: string | null
          created_at?: string
          deployed_at?: string | null
          id?: string
          internal_notes?: string | null
          meta_description?: string | null
          primary_keyword?: string | null
          read_minutes?: number | null
          scheduled_date?: string | null
          secondary_keywords?: string[]
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      seo_indexing_log: {
        Row: {
          action: string
          error: string | null
          http_status: number | null
          id: string
          pinged_at: string
          response: Json | null
          source: string | null
          status: string
          url: string
        }
        Insert: {
          action?: string
          error?: string | null
          http_status?: number | null
          id?: string
          pinged_at?: string
          response?: Json | null
          source?: string | null
          status?: string
          url: string
        }
        Update: {
          action?: string
          error?: string | null
          http_status?: number | null
          id?: string
          pinged_at?: string
          response?: Json | null
          source?: string | null
          status?: string
          url?: string
        }
        Relationships: []
      }
      seo_integrations: {
        Row: {
          access_token: string | null
          access_token_expires_at: string | null
          connected_at: string
          connected_by_user_id: string | null
          created_at: string
          id: string
          last_error: string | null
          last_refreshed_at: string | null
          property_url: string | null
          provider: string
          refresh_token: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          access_token_expires_at?: string | null
          connected_at?: string
          connected_by_user_id?: string | null
          created_at?: string
          id?: string
          last_error?: string | null
          last_refreshed_at?: string | null
          property_url?: string | null
          provider?: string
          refresh_token?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          access_token_expires_at?: string | null
          connected_at?: string
          connected_by_user_id?: string | null
          created_at?: string
          id?: string
          last_error?: string | null
          last_refreshed_at?: string | null
          property_url?: string | null
          provider?: string
          refresh_token?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      seo_keyword_cache: {
        Row: {
          fetched_at: string
          id: string
          payload: Json
          property_url: string
          range_end: string
          range_start: string
        }
        Insert: {
          fetched_at?: string
          id?: string
          payload?: Json
          property_url: string
          range_end: string
          range_start: string
        }
        Update: {
          fetched_at?: string
          id?: string
          payload?: Json
          property_url?: string
          range_end?: string
          range_start?: string
        }
        Relationships: []
      }
      seo_page_overrides: {
        Row: {
          applied_at: string | null
          created_at: string
          h1: string | null
          id: string
          intro_copy: string | null
          meta_description: string | null
          route_path: string
          secondary_keywords: string[]
          source_task_id: string | null
          target_keyword: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          applied_at?: string | null
          created_at?: string
          h1?: string | null
          id?: string
          intro_copy?: string | null
          meta_description?: string | null
          route_path: string
          secondary_keywords?: string[]
          source_task_id?: string | null
          target_keyword?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          applied_at?: string | null
          created_at?: string
          h1?: string | null
          id?: string
          intro_copy?: string | null
          meta_description?: string | null
          route_path?: string
          secondary_keywords?: string[]
          source_task_id?: string | null
          target_keyword?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      seo_settings: {
        Row: {
          auto_execute: boolean
          blog_approval_required: boolean
          id: number
          last_auto_run_at: string | null
          updated_at: string
        }
        Insert: {
          auto_execute?: boolean
          blog_approval_required?: boolean
          id?: number
          last_auto_run_at?: string | null
          updated_at?: string
        }
        Update: {
          auto_execute?: boolean
          blog_approval_required?: boolean
          id?: number
          last_auto_run_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      seo_tasks: {
        Row: {
          blog_slug: string | null
          category: string
          completed_at: string | null
          completed_by: string | null
          content_brief: string | null
          created_at: string
          day_end: number | null
          day_start: number | null
          deliverable_type: string | null
          description: string | null
          effort_minutes: number
          id: string
          meta_description: string | null
          notes: string | null
          page_title: string | null
          priority: string
          scheduled_date: string | null
          secondary_keywords: string[]
          section: string
          sort_order: number
          status: string
          target_keyword: string | null
          target_url: string | null
          title: string
          updated_at: string
          verified_at: string | null
          verified_snapshot: Json | null
          verified_status: string | null
          week: number
        }
        Insert: {
          blog_slug?: string | null
          category?: string
          completed_at?: string | null
          completed_by?: string | null
          content_brief?: string | null
          created_at?: string
          day_end?: number | null
          day_start?: number | null
          deliverable_type?: string | null
          description?: string | null
          effort_minutes?: number
          id?: string
          meta_description?: string | null
          notes?: string | null
          page_title?: string | null
          priority?: string
          scheduled_date?: string | null
          secondary_keywords?: string[]
          section?: string
          sort_order?: number
          status?: string
          target_keyword?: string | null
          target_url?: string | null
          title: string
          updated_at?: string
          verified_at?: string | null
          verified_snapshot?: Json | null
          verified_status?: string | null
          week?: number
        }
        Update: {
          blog_slug?: string | null
          category?: string
          completed_at?: string | null
          completed_by?: string | null
          content_brief?: string | null
          created_at?: string
          day_end?: number | null
          day_start?: number | null
          deliverable_type?: string | null
          description?: string | null
          effort_minutes?: number
          id?: string
          meta_description?: string | null
          notes?: string | null
          page_title?: string | null
          priority?: string
          scheduled_date?: string | null
          secondary_keywords?: string[]
          section?: string
          sort_order?: number
          status?: string
          target_keyword?: string | null
          target_url?: string | null
          title?: string
          updated_at?: string
          verified_at?: string | null
          verified_snapshot?: Json | null
          verified_status?: string | null
          week?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          id: string
          next_billing_date: string | null
          paypal_subscription_id: string | null
          plan_type: string
          start_date: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          next_billing_date?: string | null
          paypal_subscription_id?: string | null
          plan_type: string
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          next_billing_date?: string | null
          paypal_subscription_id?: string | null
          plan_type?: string
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      trigger_indexing_ping: {
        Args: { _action: string; _source: string; _url: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      user_type: "student" | "practitioner"
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
      app_role: ["admin", "moderator", "user"],
      user_type: ["student", "practitioner"],
    },
  },
} as const
