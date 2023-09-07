import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ENDPOINTS } from "../../config/Endpoints";

const LogoutView = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      const response = await fetch(ENDPOINTS.logout);

      if (response.status === 200) {
        localStorage.clear();
        navigate("/login");
      }
    };

    logout();
  }, [navigate]);

  return (
    <div>
      Logging out...
    </div>
  );
};

export default LogoutView;
