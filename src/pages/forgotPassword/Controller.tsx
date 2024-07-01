import React from "react";
import ForgotView from "./View";
import usePageTitle from "../../hooks/usePageTitle";

const ForgotController = () => {
  usePageTitle("Forgot Password");

  return <ForgotView />;
};

export default ForgotController;
