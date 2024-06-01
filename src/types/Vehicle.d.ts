type Vehicle = {
  icon_photo: string;
  long_name: string | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  vin: string;
  year: string | null;
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

type PlateDecodeResponse = Pick<Vehicle, "make" | "model" | "trim" | "year" | "vin"> & {
  description: string;
};

type VehicleFollower = VehicleResponse;

type EditVehicleInput = {
  year: Vehicle["year"];
  make: Vehicle["make"];
  model: Vehicle["model"];
  trim: Vehicle["trim"];
  image_uuid?: string;
  image: FileList;
};
