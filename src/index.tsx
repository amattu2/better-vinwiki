import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Stack, CssBaseline, Box } from '@mui/material';
import Sidebar from './components/Sidebar';
import Home from './pages';
import Login from './pages/login/Controller';
import Logout from './pages/logout/Controller';
import Profile from './pages/profile/Controller';
import Vehicle from './pages/vehicle/Controller';
import List from './pages/list/Controller';
import Search from './pages/search/Controller';
import reportWebVitals from './reportWebVitals';
import { NotificationCountProvider } from './Providers/NotificationCountProvider';
import { AuthProvider } from './Providers/AuthProvider';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const ProtectedRoutes = () => {
  const token = localStorage.getItem("token") || null;
  if (!token) {
    return <Navigate to="/login" />;
  };

  return (
    <AuthProvider>
      <NotificationCountProvider>
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
      </NotificationCountProvider>
    </AuthProvider>
  );
};

root.render(
  <React.StrictMode>
    <CssBaseline />
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={<ProtectedRoutes />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
