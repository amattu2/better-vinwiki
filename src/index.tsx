import React from 'react';
import ReactDOM from 'react-dom/client';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { useReadLocalStorage } from 'usehooks-ts';
import { Box, CssBaseline, Stack } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AuthProvider } from './Providers/AuthProvider';
import { NotificationCountProvider } from './Providers/NotificationCountProvider';
import Sidebar from './components/Sidebar';
import Home from './pages';
import Lists from './pages/lists/Controller';
import Login from './pages/login/Controller';
import Logout from './pages/logout/Controller';
import Profile from './pages/profile/Controller';
import Search from './pages/search/Controller';
import Vehicle from './pages/vehicle/Controller';
import Post from './pages/post/Controller';
import Documentation from './pages/documentation';
import reportWebVitals from './reportWebVitals';
import { CacheKeys } from './config/Cache';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

const ProtectedRoutes = () => {
  const token = useReadLocalStorage<string>("token");
  const profile = useReadLocalStorage<AuthProfile | null>(CacheKeys.AUTH_PROFILE);
  if (!token || !profile?.uuid) {
    return <Navigate to="/login" />;
  }

  return (
    <AuthProvider>
      <NotificationCountProvider>
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

root.render(
  <React.StrictMode>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="*" element={<ProtectedRoutes />} />
        </Routes>
      </Router>
    </LocalizationProvider>
  </React.StrictMode>,
);

reportWebVitals();
