type List = {
  created_date: string;
  created_time: number;
  description: string;
  follower_count: number;
  name: string;
  owner: Pick<Profile, "avatar" | "first_name" | "last_name" | "username" | "uuid">;
  uuid: string;
  vehicle_count: number;
};
