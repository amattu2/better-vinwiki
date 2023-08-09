import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ENDPOINTS, STATUS_OK } from "../../config/Endpoints";

type Inputs = {
  username: string,
  password: string,
};

const LoginView = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState } = useForm<Inputs>();
  const { errors } = formState;

  const onSubmit = async ({ username, password }: Inputs) => {
    const response = await fetch(ENDPOINTS.authenticate, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ login: username, password }),
    });

    const { person, token: { token }, status } = await response.json();
    if (status === STATUS_OK) {
      localStorage.setItem("user", JSON.stringify(person));
      localStorage.setItem("token", token);
      navigate("/");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <input type="text" placeholder="Username" {...register("username", { required: true })} />
          {errors.username && <span>This field is required</span>}
        </div>
        <div>
          <input type="password" placeholder="Password" {...register("password", { required: true })} />
          {errors.password && <span>This field is required</span>}
        </div>
        <input type="submit" />
      </form>
    </div>
  );
};

export default LoginView;
