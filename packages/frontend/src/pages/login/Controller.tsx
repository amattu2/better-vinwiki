import React from "react";
import LoginView from "./View";
import usePageTitle from "../../hooks/usePageTitle";

const LoginController = () => {
  usePageTitle("Login");

  return <LoginView />;
};

export default LoginController;
