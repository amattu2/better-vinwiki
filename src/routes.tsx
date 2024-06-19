import React, { FC, lazy } from "react";
import { Navigate, RouteObject } from "react-router-dom";
import { useReadLocalStorage } from "usehooks-ts";
import { SnackbarProvider } from "notistack";
import { AuthProvider } from "./Providers/AuthProvider";
import { NotificationCountProvider } from "./Providers/NotificationCountProvider";
import { SuspenseWrapper } from "./components/SuspenseWrapper";
import { CacheKeys } from "./config/Cache";
import { AuthenticatedLayout } from "./layouts/AuthenticatedLayout";

const Login = SuspenseWrapper(lazy(() => import("./pages/login/Controller")));
const Register = SuspenseWrapper(lazy(() => import("./pages/register/Controller")));
const ForgotPassword = SuspenseWrapper(lazy(() => import("./pages/forgotPassword/Controller")));
const Logout = SuspenseWrapper(lazy(() => import("./pages/logout/Controller")));
const Home = SuspenseWrapper(lazy(() => import("./pages/index")));
const Documentation = SuspenseWrapper(lazy(() => import("./pages/documentation")));
const Lists = SuspenseWrapper(lazy(() => import("./pages/lists/Controller")));
const Post = SuspenseWrapper(lazy(() => import("./pages/post/Controller")));
const Profile = SuspenseWrapper(lazy(() => import("./pages/profile/Controller")));
const Search = SuspenseWrapper(lazy(() => import("./pages/search/Controller")));
const Vehicle = SuspenseWrapper(lazy(() => import("./pages/vehicle/Controller")));

const AuthenticatedWrapper: FC<{ Component: FC }> = ({ Component }) => {
  const token = useReadLocalStorage<string>("token");
  const profile = useReadLocalStorage<AuthProfile | null>(CacheKeys.AUTH_PROFILE);

  if (!token || !profile?.uuid) {
    return <Navigate to="/login" />;
  }

  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      autoHideDuration={3000}
      preventDuplicate
    >
      <AuthProvider>
        <NotificationCountProvider>
          <Component />
        </NotificationCountProvider>
      </AuthProvider>
    </SnackbarProvider>
  );
};

export const routes: RouteObject[] = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/logout",
    element: <Logout />,
  },
  {
    path: "/documentation",
    element: <Documentation />,
  },
  {
    path: "",
    element: <AuthenticatedWrapper Component={AuthenticatedLayout} />,
    children: [
      { path: "/profile/:uuid?", element: <Profile /> },
      { path: "/vehicle/:vin", element: <Vehicle /> },
      { path: "/list/:uuid?", element: <Lists /> },
      { path: "/lists", element: <Lists /> },
      { path: "/post/:uuid", element: <Post /> },
      { path: "/search", element: <Search /> },
      { path: "", element: <Home /> },
    ],
  },
  {
    path: "*",
    element: <p>404: Page not found</p>,
  },
];
