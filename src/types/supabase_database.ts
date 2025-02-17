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
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      account_user: {
        Row: {
          account_id: string
          account_role: Database["public"]["Enums"]["account_role"]
          id: string
          user_id: string
        }
        Insert: {
          account_id: string
          account_role: Database["public"]["Enums"]["account_role"]
          id?: string
          user_id: string
        }
        Update: {
          account_id?: string
          account_role?: Database["public"]["Enums"]["account_role"]
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_user_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "workplaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_user_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activities: {
        Row: {
          category_id: number | null
          created_at: string | null
          description: string | null
          enabled: boolean
          featured: boolean
          id: string
          image_url: string | null
          meta_data: Json | null
          name: string
          subcategory: string | null
          thumbnail_url: string | null
        }
        Insert: {
          category_id?: number | null
          created_at?: string | null
          description?: string | null
          enabled: boolean
          featured?: boolean
          id?: string
          image_url?: string | null
          meta_data?: Json | null
          name: string
          subcategory?: string | null
          thumbnail_url?: string | null
        }
        Update: {
          category_id?: number | null
          created_at?: string | null
          description?: string | null
          enabled?: boolean
          featured?: boolean
          id?: string
          image_url?: string | null
          meta_data?: Json | null
          name?: string
          subcategory?: string | null
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_progress: {
        Row: {
          activity_id: string
          current_task_order: number
          id: string
          onboarding_completed: boolean | null
          profile_id: string
          score: number | null
          total_score: number | null
        }
        Insert: {
          activity_id: string
          current_task_order?: number
          id?: string
          onboarding_completed?: boolean | null
          profile_id: string
          score?: number | null
          total_score?: number | null
        }
        Update: {
          activity_id?: string
          current_task_order?: number
          id?: string
          onboarding_completed?: boolean | null
          profile_id?: string
          score?: number | null
          total_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_progress_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_progress_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      answers: {
        Row: {
          answered_at: string
          assessment_id: string | null
          id: number
          question_id: number
          rating: number
          response: Json | null
          user_id: string
        }
        Insert: {
          answered_at?: string
          assessment_id?: string | null
          id?: number
          question_id: number
          rating: number
          response?: Json | null
          user_id: string
        }
        Update: {
          answered_at?: string
          assessment_id?: string | null
          id?: number
          question_id?: number
          rating?: number
          response?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          cover_url: string | null
          created_at: string | null
          description: string
          estimated_time: string | null
          id: string
          results_schema: Json | null
          strategy: Json | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          cover_url?: string | null
          created_at?: string | null
          description: string
          estimated_time?: string | null
          id?: string
          results_schema?: Json | null
          strategy?: Json | null
          title: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          cover_url?: string | null
          created_at?: string | null
          description?: string
          estimated_time?: string | null
          id?: string
          results_schema?: Json | null
          strategy?: Json | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: number
          name: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      constants: {
        Row: {
          created_at: string
          id: string
          key: string
          value: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          value?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          value?: Json | null
        }
        Relationships: []
      }
      evaluations: {
        Row: {
          assessment_id: string | null
          id: string
          results: Json | null
          user_id: string
          workplace_id: string | null
        }
        Insert: {
          assessment_id?: string | null
          id?: string
          results?: Json | null
          user_id: string
          workplace_id?: string | null
        }
        Update: {
          assessment_id?: string | null
          id?: string
          results?: Json | null
          user_id?: string
          workplace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_workplace_id_fkey"
            columns: ["workplace_id"]
            isOneToOne: false
            referencedRelation: "workplaces"
            referencedColumns: ["id"]
          },
        ]
      }
      game_info: {
        Row: {
          created_at: string | null
          durations: number[] | null
          game_id: string
          id: string
          levels_completed: boolean[] | null
          onboarding_completed: boolean | null
          profile_id: string
        }
        Insert: {
          created_at?: string | null
          durations?: number[] | null
          game_id: string
          id?: string
          levels_completed?: boolean[] | null
          onboarding_completed?: boolean | null
          profile_id: string
        }
        Update: {
          created_at?: string | null
          durations?: number[] | null
          game_id?: string
          id?: string
          levels_completed?: boolean[] | null
          onboarding_completed?: boolean | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_info_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          bottom_pos: number | null
          cluster_class: string | null
          createdAt: string
          description: string
          id: string
          left_pos: number | null
          name: string
          right_pos: number | null
          size_id: string | null
          top_pos: number | null
          updatedAt: string
          url: string
          vision_id: string
        }
        Insert: {
          bottom_pos?: number | null
          cluster_class?: string | null
          createdAt?: string
          description: string
          id?: string
          left_pos?: number | null
          name: string
          right_pos?: number | null
          size_id?: string | null
          top_pos?: number | null
          updatedAt?: string
          url: string
          vision_id: string
        }
        Update: {
          bottom_pos?: number | null
          cluster_class?: string | null
          createdAt?: string
          description?: string
          id?: string
          left_pos?: number | null
          name?: string
          right_pos?: number | null
          size_id?: string | null
          top_pos?: number | null
          updatedAt?: string
          url?: string
          vision_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "sizes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_vision_id_fkey"
            columns: ["vision_id"]
            isOneToOne: false
            referencedRelation: "vision_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      image_search: {
        Row: {
          id: string
          search_term: string
          url: string
        }
        Insert: {
          id: string
          search_term: string
          url: string
        }
        Update: {
          id?: string
          search_term?: string
          url?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          account_id: string
          account_role: Database["public"]["Enums"]["account_role"]
          account_team_name: string | null
          created_at: string | null
          id: string
          invitation_type: Database["public"]["Enums"]["invitation_type"]
          invited_by_user_id: string
          invitee_email: string
          message: string | null
          token: string
          updated_at: string | null
        }
        Insert: {
          account_id: string
          account_role: Database["public"]["Enums"]["account_role"]
          account_team_name?: string | null
          created_at?: string | null
          id?: string
          invitation_type: Database["public"]["Enums"]["invitation_type"]
          invited_by_user_id: string
          invitee_email: string
          message?: string | null
          token?: string
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          account_role?: Database["public"]["Enums"]["account_role"]
          account_team_name?: string | null
          created_at?: string | null
          id?: string
          invitation_type?: Database["public"]["Enums"]["invitation_type"]
          invited_by_user_id?: string
          invitee_email?: string
          message?: string | null
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "workplaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_invited_by_user_id_fkey"
            columns: ["invited_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      obstacles: {
        Row: {
          createdAt: string | null
          goal_id: string | null
          id: string
          is_completed: boolean | null
          name: string | null
          updatedAt: string | null
          vision_id: string | null
        }
        Insert: {
          createdAt?: string | null
          goal_id?: string | null
          id?: string
          is_completed?: boolean | null
          name?: string | null
          updatedAt?: string | null
          vision_id?: string | null
        }
        Update: {
          createdAt?: string | null
          goal_id?: string | null
          id?: string
          is_completed?: boolean | null
          name?: string | null
          updatedAt?: string | null
          vision_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bottomPos: number | null
          created_at: string | null
          email: string
          employment_status: string | null
          fdb_ref: string | null
          id: string
          institution_ref: string | null
          is_deleted: boolean | null
          leftPos: number | null
          name: string | null
          profile_photo: string | null
          rightPos: number | null
          topPos: number | null
          updated_at: string | null
          user_role: Database["public"]["Enums"]["role_status"]
          workplace: string | null
          workplace_ref: string | null
        }
        Insert: {
          bottomPos?: number | null
          created_at?: string | null
          email: string
          employment_status?: string | null
          fdb_ref?: string | null
          id?: string
          institution_ref?: string | null
          is_deleted?: boolean | null
          leftPos?: number | null
          name?: string | null
          profile_photo?: string | null
          rightPos?: number | null
          topPos?: number | null
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["role_status"]
          workplace?: string | null
          workplace_ref?: string | null
        }
        Update: {
          bottomPos?: number | null
          created_at?: string | null
          email?: string
          employment_status?: string | null
          fdb_ref?: string | null
          id?: string
          institution_ref?: string | null
          is_deleted?: boolean | null
          leftPos?: number | null
          name?: string | null
          profile_photo?: string | null
          rightPos?: number | null
          topPos?: number | null
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["role_status"]
          workplace?: string | null
          workplace_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_institution_ref_fkey"
            columns: ["institution_ref"]
            isOneToOne: false
            referencedRelation: "workplaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_workplace_ref_fkey"
            columns: ["workplace_ref"]
            isOneToOne: false
            referencedRelation: "workplaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles_copy: {
        Row: {
          bottomPos: number | null
          created_at: string | null
          email: string
          employment_status: string | null
          fdb_ref: string | null
          id: string
          institution_ref: string | null
          leftPos: number | null
          name: string | null
          profile_photo: string | null
          rightPos: number | null
          topPos: number | null
          updated_at: string | null
          user_role: Database["public"]["Enums"]["role_status"]
          workplace: string | null
          workplace_ref: string | null
        }
        Insert: {
          bottomPos?: number | null
          created_at?: string | null
          email: string
          employment_status?: string | null
          fdb_ref?: string | null
          id?: string
          institution_ref?: string | null
          leftPos?: number | null
          name?: string | null
          profile_photo?: string | null
          rightPos?: number | null
          topPos?: number | null
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["role_status"]
          workplace?: string | null
          workplace_ref?: string | null
        }
        Update: {
          bottomPos?: number | null
          created_at?: string | null
          email?: string
          employment_status?: string | null
          fdb_ref?: string | null
          id?: string
          institution_ref?: string | null
          leftPos?: number | null
          name?: string | null
          profile_photo?: string | null
          rightPos?: number | null
          topPos?: number | null
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["role_status"]
          workplace?: string | null
          workplace_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_copy_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_copy_institution_ref_fkey"
            columns: ["institution_ref"]
            isOneToOne: false
            referencedRelation: "workplaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_copy_workplace_ref_fkey"
            columns: ["workplace_ref"]
            isOneToOne: false
            referencedRelation: "workplaces"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          assessment_id: string | null
          category: string
          feat_label: string
          id: number
          metadata: Json | null
          question: string
        }
        Insert: {
          assessment_id?: string | null
          category: string
          feat_label: string
          id?: number
          metadata?: Json | null
          question: string
        }
        Update: {
          assessment_id?: string | null
          category?: string
          feat_label?: string
          id?: number
          metadata?: Json | null
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_questions_assessment"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      scores: {
        Row: {
          id: string
          score: number | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          score?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          score?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sizes: {
        Row: {
          height: number
          id: string
          width: number
        }
        Insert: {
          height?: number
          id?: string
          width?: number
        }
        Update: {
          height?: number
          id?: string
          width?: number
        }
        Relationships: []
      }
      status: {
        Row: {
          complete: boolean | null
          completed_at: string | null
          id: string
          locked: boolean | null
          progress: number | null
          started_at: string | null
          state: Database["public"]["Enums"]["taskstate"] | null
        }
        Insert: {
          complete?: boolean | null
          completed_at?: string | null
          id?: string
          locked?: boolean | null
          progress?: number | null
          started_at?: string | null
          state?: Database["public"]["Enums"]["taskstate"] | null
        }
        Update: {
          complete?: boolean | null
          completed_at?: string | null
          id?: string
          locked?: boolean | null
          progress?: number | null
          started_at?: string | null
          state?: Database["public"]["Enums"]["taskstate"] | null
        }
        Relationships: []
      }
      task_completion: {
        Row: {
          completion_timestamp: string | null
          id: string
          profile_id: string
          score: number | null
          task_id: string
        }
        Insert: {
          completion_timestamp?: string | null
          id?: string
          profile_id: string
          score?: number | null
          task_id: string
        }
        Update: {
          completion_timestamp?: string | null
          id?: string
          profile_id?: string
          score?: number | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_completion_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_completion_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          activity_id: string
          description: string | null
          difficulty_level: Database["public"]["Enums"]["difficulty"] | null
          id: string
          max_score: number
          name: string
          order: number | null
        }
        Insert: {
          activity_id: string
          description?: string | null
          difficulty_level?: Database["public"]["Enums"]["difficulty"] | null
          id?: string
          max_score?: number
          name: string
          order?: number | null
        }
        Update: {
          activity_id?: string
          description?: string | null
          difficulty_level?: Database["public"]["Enums"]["difficulty"] | null
          id?: string
          max_score?: number
          name?: string
          order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tasks: {
        Row: {
          created_at: string | null
          id: string
          score_id: string | null
          status_id: string | null
          task_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          score_id?: string | null
          status_id?: string | null
          task_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          score_id?: string | null
          status_id?: string | null
          task_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_tasks_profile_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tasks_score_id_fkey"
            columns: ["score_id"]
            isOneToOne: false
            referencedRelation: "scores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tasks_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "status"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_ratings: {
        Row: {
          created_at: string | null
          id: number
          rating: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          rating?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          rating?: number | null
        }
        Relationships: []
      }
      vision_boards: {
        Row: {
          created_at: string | null
          description: string
          id: string
          img_url: string | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          img_url?: string | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          img_url?: string | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vision_boards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vision_log: {
        Row: {
          device_id: string
          edited_at: string
          id: string
          updated_at: string
          vision_id: string
        }
        Insert: {
          device_id: string
          edited_at?: string
          id: string
          updated_at?: string
          vision_id: string
        }
        Update: {
          device_id?: string
          edited_at?: string
          id?: string
          updated_at?: string
          vision_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vision_log_vision_id_fkey"
            columns: ["vision_id"]
            isOneToOne: false
            referencedRelation: "vision_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      workplaces: {
        Row: {
          enabled_assessments: string[]
          id: string
          type: string | null
          workplace_address: Json | null
          workplace_description: string | null
          workplace_domain: string | null
          workplace_email: string | null
          workplace_logo: string | null
          workplace_name: string | null
        }
        Insert: {
          enabled_assessments?: string[]
          id?: string
          type?: string | null
          workplace_address?: Json | null
          workplace_description?: string | null
          workplace_domain?: string | null
          workplace_email?: string | null
          workplace_logo?: string | null
          workplace_name?: string | null
        }
        Update: {
          enabled_assessments?: string[]
          id?: string
          type?: string | null
          workplace_address?: Json | null
          workplace_description?: string | null
          workplace_domain?: string | null
          workplace_email?: string | null
          workplace_logo?: string | null
          workplace_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: {
        Args: {
          lookup_invitation_token: string
        }
        Returns: string
      }
      ban_user_function: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      generate_token: {
        Args: {
          length: number
        }
        Returns: string
      }
      get_accounts_for_current_user: {
        Args: {
          passed_in_role?: Database["public"]["Enums"]["account_role"]
        }
        Returns: string[]
      }
      get_creation_date_record_count: {
        Args: {
          start_date: string
          end_date: string
        }
        Returns: {
          creation_date: string
          record_count: number
        }[]
      }
      get_evaluations: {
        Args: {
          workplace_id_param: string
          assessment_id_param: string
          latest: boolean
        }
        Returns: {
          id: string
          user_id: string
          assessment_id: string
          is_completed: boolean
          results: Json
          created_at: string
          profile_id: string
          email: string
          name: string
        }[]
      }
      get_game_info_by_workplace_id: {
        Args: {
          workplaceid?: string
        }
        Returns: {
          game_info: unknown
        }[]
      }
      get_top_cluster_class_counts: {
        Args: {
          workplaceid?: string
        }
        Returns: {
          cluster_class: string
          goals_count: number
          user_count: number
        }[]
      }
      get_unanswered_questions: {
        Args: {
          iuser_id: string
        }
        Returns: {
          id: number
          question: string
          category: string
          feat_label: string
        }[]
      }
      get_unanswered_questions_count: {
        Args: {
          iuser_id: string
        }
        Returns: number
      }
      get_user_with_respect_date: {
        Args: {
          start_date: string
          end_date: string
          workplaceid?: string
        }
        Returns: {
          creation_date: string
          record_count: number
        }[]
      }
      get_users_with_goals_and_visions: {
        Args: Record<PropertyKey, never>
        Returns: {
          result_row: Record<string, unknown>
        }[]
      }
      lookup_invitation: {
        Args: {
          lookup_invitation_token: string
        }
        Returns: Json
      }
      search_posts: {
        Args: {
          keyword: string
        }
        Returns: {
          bottomPos: number | null
          created_at: string | null
          email: string
          employment_status: string | null
          fdb_ref: string | null
          id: string
          institution_ref: string | null
          is_deleted: boolean | null
          leftPos: number | null
          name: string | null
          profile_photo: string | null
          rightPos: number | null
          topPos: number | null
          updated_at: string | null
          user_role: Database["public"]["Enums"]["role_status"]
          workplace: string | null
          workplace_ref: string | null
        }[]
      }
      search_user:
        | {
            Args: Record<PropertyKey, never>
            Returns: {
              bottomPos: number | null
              created_at: string | null
              email: string
              employment_status: string | null
              fdb_ref: string | null
              id: string
              institution_ref: string | null
              is_deleted: boolean | null
              leftPos: number | null
              name: string | null
              profile_photo: string | null
              rightPos: number | null
              topPos: number | null
              updated_at: string | null
              user_role: Database["public"]["Enums"]["role_status"]
              workplace: string | null
              workplace_ref: string | null
            }[]
          }
        | {
            Args: {
              keyword: string
            }
            Returns: {
              bottomPos: number | null
              created_at: string | null
              email: string
              employment_status: string | null
              fdb_ref: string | null
              id: string
              institution_ref: string | null
              is_deleted: boolean | null
              leftPos: number | null
              name: string | null
              profile_photo: string | null
              rightPos: number | null
              topPos: number | null
              updated_at: string | null
              user_role: Database["public"]["Enums"]["role_status"]
              workplace: string | null
              workplace_ref: string | null
            }[]
          }
      update_account_user_role: {
        Args: {
          account_id: string
          user_id: string
          new_account_role: Database["public"]["Enums"]["account_role"]
        }
        Returns: string
      }
    }
    Enums: {
      account_role: "owner" | "member" | "super-owner"
      billing_providers: "stripe"
      difficulty: "easy" | "medium" | "hard"
      invitation_status: "pending" | "accepted" | "expired" | "deleted"
      invitation_type: "one-time" | "24-hour"
      pricing_plan_interval: "day" | "week" | "month" | "year"
      pricing_type: "one_time" | "recurring"
      role_status: "admin" | "user"
      subscription_status:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid"
      taskstate: "UNTOUCHED" | "ONGOING" | "COMPLETED"
      tasktype: "GAME" | "QUIZ" | "FLASHCARD"
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
