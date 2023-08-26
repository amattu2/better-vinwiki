import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Avatar, Box, Button, Container, TextField, Typography, styled } from "@mui/material";
import { ENDPOINTS, STATUS_OK } from "../../config/Endpoints";
import { LockOutlined } from "@mui/icons-material";

const StyledBox = styled(Box)({
  marginTop: 8,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const StyledFormBox = styled(Box)({
  marginTop: "15px",
});

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
    <Container component="main" maxWidth="xs">
      <StyledBox>
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlined />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <StyledFormBox component="form" onSubmit={handleSubmit(onSubmit)}>
          <TextField
            fullWidth
            margin="normal"
            label="Username"
            type="text"
            autoComplete="username"
            autoFocus
            {...register("username", { required: true })}
            error={!!errors.username}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            type="password"
            autoComplete="current-password"
            {...register("password", { required: true })}
            error={!!errors.password}
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
      </StyledBox>
    </Container>
  );
};

export default LoginView;
