import React, { useState, FC, useEffect} from "react";
import { useAuthProvider } from "./AuthProvider";
import { ENDPOINTS, STATUS_OK } from "../config/Endpoints";

export type ProviderState = {
  status: ProviderStatus;
  vehicle?: VehicleResponse;
  posts?: FeedPost[];
  following?: boolean;
};

export enum ProviderStatus {
  LOADING = "LOADING",
  LOADED = "LOADED",
  ERROR = "ERROR",
}

const defaultState: ProviderState = { status: ProviderStatus.LOADING };

const Context = React.createContext<ProviderState | null>(null);

export const useVehicleProvider = (): ProviderState => {
  const contextState = React.useContext(Context);

  if (contextState === null) {
    throw new Error("useVehicleProvider must be used within a VehicleProvider");
  }

  return contextState;
};

const fetchVehicle = async (vin: Vehicle["vin"], token: string): Promise<VehicleResponse> => {
  const response = await fetch(ENDPOINTS.vehicle + vin, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const { status, vehicle } = await response.json();
  if (status === STATUS_OK) {
    return vehicle;
  }

  throw new Error("Error fetching profile");
};

const fetchPosts = async (vin: Vehicle["vin"], token: string): Promise<{ post: FeedPost }[]> => {
  const response = await fetch(ENDPOINTS.vehicle_feed + vin, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const { status, feed } = await response.json();
  if (status === STATUS_OK) {
    return feed;
  }

  throw new Error("Error fetching posts");
};

const fetchFollowing = async (vin: Vehicle["vin"], token: string): Promise<boolean> => {
  const response = await fetch(ENDPOINTS.vehicle_is_following + vin, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const { status, following } = await response.json();
  if (status === STATUS_OK) {
    return following;
  }

  return false;
};

type Props = {
  vin: Vehicle["vin"];
  withPosts?: true;
  withFollowing?: true;
  children?: React.ReactNode;
};

export const VehicleProvider: FC<Props> = ({ vin, withPosts, withFollowing, children }: Props) => {
  const { token } = useAuthProvider();
  const [state, setState] = useState<ProviderState>(defaultState);

  useEffect(() => {
    if (!token || !vin) {
      return;
    }

    setState(defaultState);

    (async () => {
      const [vehicle, posts, following] = (await Promise.allSettled([
        fetchVehicle(vin, token),
        withPosts ? fetchPosts(vin, token) : Promise.resolve([]),
        withFollowing ? fetchFollowing(vin, token) : Promise.resolve(false),
      ])).map((r) => r.status === "fulfilled" ? r.value : null);

      if (vehicle) {
        setState({
          status: ProviderStatus.LOADED,
          vehicle: vehicle as VehicleResponse,
          posts: (posts as { post: FeedPost}[])?.map(r => r?.post),
          following: following as boolean,
        });
      } else {
        setState({
          status: ProviderStatus.ERROR,
        });
      }
    })();
  }, [token, vin, withPosts, withFollowing]);  

  return (
    <Context.Provider value={state}>
      {children}
    </Context.Provider>
  );
};
