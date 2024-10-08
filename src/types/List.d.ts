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

type ListResponse = List & {
  vehicles: {
    count: number;
    end: boolean;
    last_id: string;
    vehicles: Vehicle[];
  };
};

type ProfileLists = {
  following: List[];
  owned: List[];
  // other: List[];
};
