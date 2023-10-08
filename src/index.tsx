import React from 'react';
import ReactDOM from 'react-dom/client';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Box, CssBaseline, Stack, ThemeProvider, createTheme } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useReadLocalStorage } from 'usehooks-ts';
import { AuthProvider } from './Providers/AuthProvider';
import { NotificationCountProvider } from './Providers/NotificationCountProvider';
import AutoScroll from './components/ScrollToTop/AutoScroll';
import Sidebar from './components/Sidebar';
import { CacheKeys } from './config/Cache';
import Home from './pages';
import Documentation from './pages/documentation';
import Lists from './pages/lists/Controller';
import Login from './pages/login/Controller';
import Register from './pages/register/Controller';
import ForgotPassword from './pages/forgotPassword/Controller';
import Logout from './pages/logout/Controller';
import Post from './pages/post/Controller';
import Profile from './pages/profile/Controller';
import Search from './pages/search/Controller';
import Vehicle from './pages/vehicle/Controller';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          height: "100vh",
          backgroundColor: "rgb(244, 247, 250)",
        },
      },
    },
  },
});

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

root.render(
  <React.StrictMode>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="*" element={<ProtectedRoutes />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </LocalizationProvider>
  </React.StrictMode>,
);

reportWebVitals();
