type Vehicle = {
  icon_photo: string;
  long_name: string;
  make: string;
  model: string;
  trim: string;
  vin: string;
  year: string;
};

type VehicleResponse = Vehicle & {
  created: string; // ISO 8601 and offset
  decoder_fail: boolean;
  follower_count: number;
  id: number;
  post_count: number;
  poster_photo: string;
  updated: string; // ISO 8601 and offset
  user_updated: boolean;
  vdata: VehicleData;
};

type VehicleData = {
  make: string;
  model: string;
  trim: string;
  year: string;
};

type VehicleFollower = VehicleResponse;
