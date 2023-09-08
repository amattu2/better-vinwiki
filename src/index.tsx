import React from 'react';
import ReactDOM from 'react-dom/client';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Box, CssBaseline, Stack } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AuthProvider } from './Providers/AuthProvider';
import { NotificationCountProvider } from './Providers/NotificationCountProvider';
import Sidebar from './components/Sidebar';
import Home from './pages';
import List from './pages/list/Controller';
import Login from './pages/login/Controller';
import Logout from './pages/logout/Controller';
import Profile from './pages/profile/Controller';
import Search from './pages/search/Controller';
import Vehicle from './pages/vehicle/Controller';
import reportWebVitals from './reportWebVitals';
import { RecentVehiclesProvider } from './Providers/RecentVehicles';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

const ProtectedRoutes = () => {
  const token = localStorage.getItem("token") || null;
  if (!token) {
    return <Navigate to="/login" />;
  }

  return (
    <AuthProvider>
      <NotificationCountProvider>
        <RecentVehiclesProvider>
          <Stack direction="row">
            <Sidebar />
            <Box sx={{ flexGrow: 1, ml: "72px" }}>
              <Routes>
                <Route path="/profile/:uuid?" element={<Profile />} />
                <Route path="/vehicle/:vin" element={<Vehicle />} />
                <Route path="/list/:uuid" element={<List />} />
                <Route path="/post/:uuid" element={<p>Todo</p>} />
                <Route path="/search" element={<Search />} />
                <Route path="*" element={<Home />} />
              </Routes>
            </Box>
          </Stack>
        </RecentVehiclesProvider>
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
          <Route path="*" element={<ProtectedRoutes />} />
        </Routes>
      </Router>
    </LocalizationProvider>
  </React.StrictMode>,
);

reportWebVitals();
