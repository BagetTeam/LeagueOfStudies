export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      game: {
        Row: {
          date: string | null;
          email: string;
          id: number;
          mode: string | null;
          result: string | null;
          score: number | null;
          subject: string | null;
          topic: string | null;
        };
        Insert: {
          date?: string | null;
          email: string;
          id?: number;
          mode?: string | null;
          result?: string | null;
          score?: number | null;
          subject?: string | null;
          topic?: string | null;
        };
        Update: {
          date?: string | null;
          email?: string;
          id?: number;
          mode?: string | null;
          result?: string | null;
          score?: number | null;
          subject?: string | null;
          topic?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "game_email_fkey";
            columns: ["email"];
            isOneToOne: false;
            referencedRelation: "stats";
            referencedColumns: ["email"];
          },
        ];
      };
      notes: {
        Row: {
          prim: string;
          id: string;
          email: string | null;
          tags: string[] | null;
          title: string;
          path: string | null;
          subject: string | null;
          comments: string[] | null;
        };
        Insert: {
          prim: string;
          id: string;
          title: string;
          email: string;
          tags?: string[] | null;
          path?: string | null;
          comments: string[] | null;
          subject?: string | null;
        };
        Update: {
          prim: string;
          id: string;
          email: string;
          title: string;
          tags?: string[] | null;
          path?: string | null;
          subject?: string | null;
          comments: string[] | null;
        };
        Relationships: [
          {
            foreignKeyName: "notes_email_fkey";
            columns: ["email"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["email"];
          },
        ];
      };
      stats: {
        Row: {
          accuracy: number | null;
          email: string;
          level: number | null;
          questionAnswered: number | null;
          questionCorrect: number | null;
          studyStreak: number | null;
          totalGames: number | null;
          totalXp: number | null;
          winRate: number | null;
          wins: number | null;
        };
        Insert: {
          accuracy?: number | null;
          email: string;
          level?: number | null;
          questionAnswered?: number | null;
          questionCorrect?: number | null;
          studyStreak?: number | null;
          totalGames?: number | null;
          totalXp?: number | null;
          winRate?: number | null;
          wins?: number | null;
        };
        Update: {
          accuracy?: number | null;
          email?: string;
          level?: number | null;
          questionAnswered?: number | null;
          questionCorrect?: number | null;
          studyStreak?: number | null;
          totalGames?: number | null;
          totalXp?: number | null;
          winRate?: number | null;
          wins?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "stats_email_fkey";
            columns: ["email"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["email"];
          },
        ];
      };
      users: {
        Row: {
          created_at: string;
          email: string;
          name: string | null;
        };
        Insert: {
          created_at?: string;
          email?: string;
          name?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          name?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
