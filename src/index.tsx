import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages';
import Login from './pages/login/Controller';
import Logout from './pages/logout/Controller';
import Profile from './pages/profile/Controller';
import Search from './pages/search/Controller';
import reportWebVitals from './reportWebVitals';
import { NotificationProvider } from './Providers/NotificationProvider';
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
      <NotificationProvider>
        <Routes>
          <Route path="/profile/:uuid?" element={<Profile />} />
          <Route path="/search" element={<Search />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  );
};

root.render(
  <React.StrictMode>
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
