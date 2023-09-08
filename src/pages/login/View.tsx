import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useLocalStorage } from "usehooks-ts";
import { Box, Button, Container, TextField, Typography, styled } from "@mui/material";
import { ENDPOINTS, STATUS_OK } from "../../config/Endpoints";
import Loader from "../../components/Loader";

const StyledContainer = styled(Container)({
  height: "100%",
});

const FormContainer = styled(Box)({
  marginTop: 8,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: "100%",
});

const StyledFormBox = styled(Box)({
  marginTop: "5px",
});

const StyledTextField = styled(TextField)({
  marginTop: "25px",
});

type Inputs = {
  username: string,
  password: string,
};

const LoginView = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_profile, setProfile] = useLocalStorage<AuthProfile | null>("profile", null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_token, setToken] = useLocalStorage<string>("token", "");
  const [loading, setLoading] = useState<boolean>(false);

  const { register, handleSubmit, formState } = useForm<Inputs>();
  const { errors } = formState;

  const onSubmit = async ({ username, password }: Inputs) => {
    setLoading(true);

    const response = await fetch(ENDPOINTS.authenticate, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ login: username, password }),
    });

    const { person, token: { token }, status } = await response.json();
    if (status === STATUS_OK) {
      setProfile(person);
      setToken(token);
      navigate("/");
    }

    setLoading(false);
  };

  return (
    <StyledContainer maxWidth="xs">
      {loading && <Loader />}
      <FormContainer>
        <Typography component="h1" variant="h4">
          Sign in
        </Typography>
        <StyledFormBox component="form" onSubmit={handleSubmit(onSubmit)}>
          <StyledTextField
            fullWidth
            label="Username"
            type="text"
            autoComplete="username"
            autoFocus
            {...register("username", { required: true })}
            error={!!errors.username}
            helperText={errors.username ? "Username is required" : ""}
          />
          <StyledTextField
            fullWidth
            label="Password"
            type="password"
            autoComplete="current-password"
            {...register("password", { required: true })}
            error={!!errors.password}
            helperText={errors.password ? "Password is required" : ""}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
        </StyledFormBox>
      </FormContainer>
    </StyledContainer>
  );
};

export default LoginView;
