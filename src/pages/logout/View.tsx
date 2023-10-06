import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ENDPOINTS } from "../../config/Endpoints";
import Loader from "../../components/Loader";

const LogoutView = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      const response = await fetch(ENDPOINTS.logout);

      if (response.status === 200) {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/login");
      }
    };

    logout();
  }, []);

  return <Loader />;
};

export default LogoutView;
