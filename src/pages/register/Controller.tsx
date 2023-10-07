import React from "react";
import RegisterView from "./View";
import usePageTitle from "../../hooks/usePageTitle";

const RegisterController = () => {
  usePageTitle("Register");

  return (<RegisterView />);
};

export default RegisterController;
