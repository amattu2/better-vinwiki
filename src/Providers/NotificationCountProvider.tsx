import React, { useState, FC, useEffect, useRef } from "react";
import { useAuthProvider } from "./AuthProvider";
import { ENDPOINTS, STATUS_OK } from "../config/Endpoints";

export type ProviderState = {
  status: ProviderStatus;
  unseen: number;
};

export enum ProviderStatus {
  LOADING = "LOADING",
  LOADED = "LOADED",
  ERROR = "ERROR",
}

const defaultState: ProviderState = { status: ProviderStatus.LOADING, unseen: 0 };

const Context = React.createContext<ProviderState | null>(null);

export const useNotificationCountProvider = (): ProviderState => {
  const contextState = React.useContext(Context);

  if (contextState === null) {
    throw new Error("useNotificationCountProvider must be used within a NotificationCountProvider");
  }

  return contextState;
};

type Props = {
  children?: React.ReactNode;
};

export const NotificationCountProvider: FC<Props> = ({ children }: Props) => {
  const { token } = useAuthProvider();
  const [state, setState] = useState<ProviderState>(defaultState);
  const [trigger, setTrigger] = useState<NodeJS.Timeout>();
  const controllerRef = useRef<AbortController>();

  const refetch = async () => {
    if (!token) {
      return;
    }
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    controllerRef.current = new AbortController();
    const { signal } = controllerRef.current;

    setState((prevState) => ({
      ...prevState,
      status: ProviderStatus.LOADING,
    }));

    const response = await fetch(ENDPOINTS.notification_count, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    }).catch(() => null);

    const { notification_count, status } = (await response?.json()) || {};
    const { unseen } = notification_count || {};

    if (status === STATUS_OK) {
      setState({
        status: ProviderStatus.LOADED,
        unseen,
      });
    }
  };

  useEffect(() => {
    refetch();

    setTrigger(setInterval(refetch, 30 * 1000));
    return () => clearInterval(trigger);
  }, []);

  return <Context.Provider value={state}>{children}</Context.Provider>;
};
