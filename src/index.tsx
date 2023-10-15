import React, { FC, Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Box, CssBaseline, Stack, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useReadLocalStorage, useDarkMode } from 'usehooks-ts';
import { AuthProvider } from './Providers/AuthProvider';
import { NotificationCountProvider } from './Providers/NotificationCountProvider';
import AutoScroll from './components/ScrollToTop/AutoScroll';
import Sidebar from './components/Sidebar';
import { CacheKeys } from './config/Cache';
import reportWebVitals from './reportWebVitals';
import { CONFIG } from './config/AppConfig';
import Loader from './components/Loader';
import { DarkTheme } from './themes/dark';
import { LightTheme } from './themes/light';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

declare module '@mui/material/styles' {
  interface Palette {
    modal: {
      background: string;
      contrast: string
    };
  }
  interface PaletteOptions {
    modal?: {
      background?: string;
      contrast?: string
    };
  }
}

const Login = lazy(() => import('./pages/login/Controller'));
const Register = lazy(() => import('./pages/register/Controller'));
const ForgotPassword = lazy(() => import('./pages/forgotPassword/Controller'));
const Logout = lazy(() => import('./pages/logout/Controller'));
const Home = lazy(() => import('./pages/index'));
const Documentation = lazy(() => import('./pages/documentation'));
const Lists = lazy(() => import('./pages/lists/Controller'));
const Post = lazy(() => import('./pages/post/Controller'));
const Profile = lazy(() => import('./pages/profile/Controller'));
const Search = lazy(() => import('./pages/search/Controller'));
const Vehicle = lazy(() => import('./pages/vehicle/Controller'));

const ProtectedRoutes = () => {
  const token = useReadLocalStorage<string>("token");
  const profile = useReadLocalStorage<AuthProfile | null>(CacheKeys.AUTH_PROFILE);
  if (!token || !profile?.uuid) {
    return <Navigate to="/login" />;
  }

  return (
    <AuthProvider>
      <NotificationCountProvider>
        <AutoScroll />
        <Stack direction="row">
          <Sidebar />
          <Box sx={{ flexGrow: 1, ml: "72px" }}>
            <Routes>
              <Route path="/profile/:uuid?" element={<Profile />} />
              <Route path="/vehicle/:vin" element={<Vehicle />} />
              <Route path="/list/:uuid?" element={<Lists />} />
              <Route path="/lists" element={<Lists />} />
              <Route path="/post/:uuid" element={<Post />} />
              <Route path="/search" element={<Search />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </Box>
        </Stack>
      </NotificationCountProvider>
    </AuthProvider>
  );
};

const App: FC = () => {
  const { isDarkMode } = useDarkMode();

  return (
    <ThemeProvider theme={isDarkMode ? DarkTheme : LightTheme}>
      <CssBaseline />
      <Router basename={CONFIG.PUBLIC_URL}>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="*" element={<ProtectedRoutes />} />
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
};

root.render(
  <React.StrictMode>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <App />
    </LocalizationProvider>
  </React.StrictMode>,
);

reportWebVitals();
