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
      assets: {
        Row: {
          client: string | null
          comments: number
          created_at: string
          duration: string | null
          id: string
          name: string
          size: string | null
          status: string
          type: string
          updated_at: string
          user_id: string | null
          views: number
        }
        Insert: {
          client?: string | null
          comments?: number
          created_at?: string
          duration?: string | null
          id?: string
          name: string
          size?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string | null
          views?: number
        }
        Update: {
          client?: string | null
          comments?: number
          created_at?: string
          duration?: string | null
          id?: string
          name?: string
          size?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string | null
          views?: number
        }
        Relationships: []
      }
      build_projects: {
        Row: {
          branch: string
          created_at: string
          feedback: number
          id: string
          last_deploy: string | null
          name: string
          progress: number
          status: string
          updated_at: string
          url: string | null
          user_id: string | null
        }
        Insert: {
          branch?: string
          created_at?: string
          feedback?: number
          id?: string
          last_deploy?: string | null
          name: string
          progress?: number
          status?: string
          updated_at?: string
          url?: string | null
          user_id?: string | null
        }
        Update: {
          branch?: string
          created_at?: string
          feedback?: number
          id?: string
          last_deploy?: string | null
          name?: string
          progress?: number
          status?: string
          updated_at?: string
          url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      call_sheet_entries: {
        Row: {
          call_sheet_id: string
          call_time: string
          created_at: string
          id: string
          notes: string | null
          person_name: string
          role: string
          user_id: string
        }
        Insert: {
          call_sheet_id: string
          call_time?: string
          created_at?: string
          id?: string
          notes?: string | null
          person_name: string
          role: string
          user_id: string
        }
        Update: {
          call_sheet_id?: string
          call_time?: string
          created_at?: string
          id?: string
          notes?: string | null
          person_name?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_sheet_entries_call_sheet_id_fkey"
            columns: ["call_sheet_id"]
            isOneToOne: false
            referencedRelation: "call_sheets"
            referencedColumns: ["id"]
          },
        ]
      }
      call_sheets: {
        Row: {
          call_time: string
          created_at: string
          general_notes: string | null
          id: string
          location: string | null
          project_id: string
          shoot_date: string
          updated_at: string
          user_id: string
          weather_notes: string | null
        }
        Insert: {
          call_time?: string
          created_at?: string
          general_notes?: string | null
          id?: string
          location?: string | null
          project_id: string
          shoot_date: string
          updated_at?: string
          user_id: string
          weather_notes?: string | null
        }
        Update: {
          call_time?: string
          created_at?: string
          general_notes?: string | null
          id?: string
          location?: string | null
          project_id?: string
          shoot_date?: string
          updated_at?: string
          user_id?: string
          weather_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_sheets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      gear_items: {
        Row: {
          category: string
          condition: string
          created_at: string
          id: string
          last_used: string | null
          location: string | null
          name: string
          reserved_for: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category: string
          condition?: string
          created_at?: string
          id?: string
          last_used?: string | null
          location?: string | null
          name: string
          reserved_for?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          condition?: string
          created_at?: string
          id?: string
          last_used?: string | null
          location?: string | null
          name?: string
          reserved_for?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      productions: {
        Row: {
          created_at: string
          crew: number
          date: string
          id: string
          location: string
          name: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          crew?: number
          date: string
          id?: string
          location: string
          name: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          crew?: number
          date?: string
          id?: string
          location?: string
          name?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      project_assets: {
        Row: {
          category: string
          created_at: string
          file_type: string
          file_url: string | null
          id: string
          name: string
          notes: string | null
          project_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          file_type?: string
          file_url?: string | null
          id?: string
          name: string
          notes?: string | null
          project_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          file_type?: string
          file_url?: string | null
          id?: string
          name?: string
          notes?: string | null
          project_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_assets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      script_breakdowns: {
        Row: {
          created_at: string
          description: string | null
          element_type: string
          id: string
          name: string
          project_id: string
          scene_reference: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          element_type?: string
          id?: string
          name: string
          project_id: string
          scene_reference?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          element_type?: string
          id?: string
          name?: string
          project_id?: string
          scene_reference?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "script_breakdowns_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      shots: {
        Row: {
          angle: string | null
          created_at: string
          description: string | null
          id: string
          lens: string | null
          location_notes: string | null
          movement: string | null
          project_id: string
          shot_number: string
          shot_type: string
          sort_order: number
          status: string
          storyboard_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          angle?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lens?: string | null
          location_notes?: string | null
          movement?: string | null
          project_id: string
          shot_number: string
          shot_type?: string
          sort_order?: number
          status?: string
          storyboard_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          angle?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lens?: string | null
          location_notes?: string | null
          movement?: string | null
          project_id?: string
          shot_number?: string
          shot_type?: string
          sort_order?: number
          status?: string
          storyboard_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shots_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
