import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages';
import Login from './pages/login/Controller';
import reportWebVitals from './reportWebVitals';
import { UserProvider } from './Providers/UserProvider';

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
      <Routes>
        <Route path="*" element={<Home />} />
      </Routes>
    </UserProvider>
  );
};

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<ProtectedRoutes />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
