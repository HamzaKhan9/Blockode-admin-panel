import { Database } from "./supabase_database";

export type TableKey = keyof Database["public"]["Tables"];
export type TableRow<T extends TableKey> =
  Database["public"]["Tables"][T]["Row"];

export type AlgoliaUser = {
  objectID: string;
  email: string;
  name: string;
  profile_photo: string | null;
  workplace: string | null;
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
};

type DBUpdatePayload<TKey extends TableKey> = {
  type: "UPDATE";
  table: TKey;
  schema: Record<string, any>;
  record: TableRow<TKey>;
  old_record: TableRow<TKey>;
};

type DBInsertPayload<TKey extends TableKey> = {
  type: "INSERT";
  table: TKey;
  schema: Record<string, any>;
  record: TableRow<TKey>;
  old_record: null;
};

type DBDeletePayload<TKey extends TableKey> = {
  type: "DELETE";
  table: TKey;
  schema: Record<string, any>;
  record: null;
  old_record: TableRow<TKey>;
};

export type DBChangePayload<TKey extends TableKey> =
  | DBUpdatePayload<TKey>
  | DBInsertPayload<TKey>
  | DBDeletePayload<TKey>;
