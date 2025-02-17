import { Database } from "./supabase_database";

export type TableKey = keyof Database["public"]["Tables"];
export type TableRow<T extends TableKey> =
  Database["public"]["Tables"][T]["Row"];

export interface workplaces {
  id: string;
  type?: string | null;
  workplace_address?: any | null;
  workplace_description?: string | null;
  workplace_domain: string | null;
  workplace_email?: string | null;
  workplace_logo?: string | null;
  workplace_name?: string | null;
}

export enum AccountRole {
  MEMBER = "member",
  OWNER = "owner",
}

export type SendInvite = {
  userId: string;
  workplaceId: string;
  role: AccountRole;
  email: string;
  message: string;
};

export type SendInviteMultiple = {
  userId: string;
  workplaceId: string;
  role: AccountRole;
  emails: string[];
  message: string;
};

export type AlgoliaUser = {
  id: string;
  email: string;
  name: string | null;
  profile_photo: string | null;
  workplace: string | null;
  workplace_ref: workplaces | null;
  created_at: string | null;
  vision_boards: {
    id: string;
    name: string;
    description: string;
    img_url: string | null;
    created_at: string | null;
  }[];
  goals: {
    id: string;
    name: string;
    description: string;
    url: string;
    vision_id: string;
    createdAt: string | null;
  }[];
  game_info: {
    id: string;
    game_id: string;
    levels_completed: boolean[];
    durations: number[];
  }[];
};

interface Workplace {
  workplace_name: string;
  workplace_domain: string; // Change the type accordingly
}

interface Institution {
  workplace_name: string;
  workplace_domain: string; // Change the type accordingly
}

export type AllUsersProfile = {
  id: string;
  name: string;
  email: string;
  user_role: any;
  created_at: string; // Change the type accordingly
  workplace_ref: Workplace;
  institution_ref: Institution;
};

export type GameInfo = {
  id: string;
  created_at: string;
  levels_completed: boolean[];
  onboarding_completed: boolean;
  game_id: string;
  profile_id: string;
  durations: number[];
};

export type UserWithGameInfo = {
  email: string;
  name: string;
  workplace: string | null;
  workplace_ref: any | null;
  created_at: string;
  updated_at: string;
  fdb_ref: string;
  id: string;
  topPos: number | null;
  bottomPos: number | null;
  leftPos: number | null;
  rightPos: number | null;
  profile_photo: string | null;
  user_role: string;
  game_info: GameInfo[];
};

export interface ActivitiesWithTasks {
  id: string;
  name: string;
  category_id: number;
  subcategory: string | null;
  description: string;
  image_url: string;
  thumbnail_url: string;
  enabled: boolean;
  meta_data: { totalLevels: number };
  featured: boolean;
  created_at: string;
  tasks: {
    id: string;
    activity_id: string;
    name: string;
    description: string | null;
    max_score: number;
    order: number;
    difficulty_level: string;
  }[];
}

export interface GameResponseTypes {
  id: string;
  created_at: string;
  levels_completed: boolean[];
  onboarding_completed: boolean;
  game_id: string;
  profile_id: string;
  durations: number[];
}

export interface GroupedData {
  [gameId: string]: {
    gameName: string;
    levels: {
      level: string;
      successRate: number;
    }[];
  };
}

export interface gameLevelSuccessStatsForGraph {
  name: string;
  [gameName: string]: any;
}
[];
