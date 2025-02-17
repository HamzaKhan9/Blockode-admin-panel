export interface UserTypes {
  id?: string;
  banned: boolean | null;
  email: string;
  isAdmin: boolean;
  planName: string | null;
  reSeller: string | null;
  userName: string;
  user_id?: string;
}

export type Location = {
  lat: number;
  lng: number;
};

export type WorkplaceAddress = {
  location: Location;
  formatted_address: string;
};

export type WorkplaceRef = {
  workplace_address: WorkplaceAddress;
  workplace_name: string;
  type: string | null;
};

export type UserProfleCSVCols = {
  id: string;
  name: string;
  email: string;
  profile_photo: null | string;
  created_at: string;
  user_role: string;
  workplace_ref: WorkplaceRef;
};
