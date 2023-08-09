import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages';
import Login from './pages/login/Controller';
import Logout from './pages/logout/Controller';
import reportWebVitals from './reportWebVitals';
import { UserProvider } from './Providers/UserProvider';
import { NotificationProvider } from './Providers/NotificationProvider';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const ProtectedRoutes = () => {
  const token = localStorage.getItem("token") || null;
  if (!token) {
    return <Navigate to="/login" />;
  };

  return (
    <UserProvider token={token}>
      <NotificationProvider>
        <Routes>
          <Route path="*" element={<Home />} />
        </Routes>
      </NotificationProvider>
    </UserProvider>
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
