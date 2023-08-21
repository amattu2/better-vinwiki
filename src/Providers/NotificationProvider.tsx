import React, { useState, FC, useEffect } from "react";
import { useAuthProvider } from "./AuthProvider";
import { ENDPOINTS, STATUS_OK } from "../config/Endpoints";

export type ProviderState = {
  status: ProviderStatus;
  notifications: Notification[];
  count: number;
}

export enum ProviderStatus {
  LOADING = "LOADING",
  LOADED = "LOADED",
  ERROR = "ERROR",
}

const defaultState: ProviderState = { status: ProviderStatus.LOADING, notifications: [], count: 0 };

const Context = React.createContext<ProviderState | null>(null);

export const useNotificationProvider = (): ProviderState => {
  const contextState = React.useContext(Context);

  if (contextState === null) {
    throw new Error("useNotificationProvider must be used within a NotificationProvider");
  }

  return contextState;
};

type Props = {
  children?: React.ReactNode;
};

export const NotificationProvider: FC<Props> = ({ children }: Props) => {
  const { token } = useAuthProvider();
  const [state, setState] = useState<ProviderState>(defaultState);
  const [trigger, setTrigger] = useState<number>(null);

  useEffect(() => {
    refetch();
  
    setTrigger(setInterval(refetch, 30 * 1000));
    () => clearInterval(trigger);
  }, [])


  const refetch = async () => {
    if (!token) {
      return;
    }
    
    const response = await fetch(ENDPOINTS.notifications, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const { notification_count, status } = await response.json();
    const { unseen } = notification_count;

    if (status === STATUS_OK) {
      setState({
        status: ProviderStatus.LOADED,
        notifications: [],
        count: unseen,
      });
    }
  };

  return (
    <Context.Provider value={state}>
      {children}
    </Context.Provider>
  );
};
