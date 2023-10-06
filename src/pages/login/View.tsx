import React, { ElementType, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, LinkProps, useNavigate } from "react-router-dom";
import { Box, Button, Stack, TextField, Typography, styled } from "@mui/material";
import { useLocalStorage } from "usehooks-ts";
import backgroundImage from "../../assets/images/shop-1864x1400.jpg";
import Loader from "../../components/Loader";
import { CacheKeys } from "../../config/Cache";
import { ENDPOINTS, STATUS_OK } from "../../config/Endpoints";

type Inputs = {
  username: string,
  password: string,
};

const StyledContainer = styled(Box)({
  height: "100%",
  backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.75) 5%, rgba(255, 255, 255, 0.93) 70%), url(${backgroundImage})`,
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundAttachment: "fixed",
});

const FormContainer = styled(Stack)(({ theme }) => ({
  maxWidth: '470px',
  margin: '0 auto',
  background: "#fff",
  borderRadius: "0 0 6px 6px",
  padding: "98px 35px",
  [theme.breakpoints.down('sm')]: {
    height: '100%',
    width: '100%',
    maxWidth: '100%',
    borderRadius: "0",
    padding: "25px",
  },
}));

const StyledHeaderBox = styled(Box)({
  marginBottom: "50px",
  textAlign: "center",
});

const StyledFooterBox = styled(Box)({
  marginTop: "30px",
  textAlign: "center",
});

const StyledTextField = styled(TextField)({
  marginBottom: "30px",
  "& .MuiFormLabel-root": {
    fontSize: "18px",
  },
});

const StyledButton = styled(Button)(({ theme }) => ({
  color: "#fff",
  padding: theme.spacing(1.5, 2),
  margin: theme.spacing(2, 0),
  textTransform: "none",
  boxShadow: theme.shadows[4],
}));

const StyledError = styled(Typography)(({ theme }) => ({
  fontSize: "12px",
  lineHeight: "33px",
  color: theme.palette.error.main,
  textAlign: "right",
}));

const StyledForgotDetails = styled(Typography)<{ component: ElementType } & LinkProps>(({ theme }) => ({
  fontWeight: 500,
  color: theme.palette.primary.main,
  marginLeft: theme.spacing(0.5),
}));

const LoginView = () => {
  const navigate = useNavigate();

  const [, setProfile] = useLocalStorage<AuthProfile | null>(CacheKeys.AUTH_PROFILE, null);
  const [, setToken] = useLocalStorage<string>(CacheKeys.AUTH_TOKEN, "");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const { register, handleSubmit, formState, resetField } = useForm<Inputs>();
  const { errors } = formState;

  const onSubmit = async ({ username: login, password }: Inputs) => {
    setLoading(true);
    setError("");

    const response = await fetch(ENDPOINTS.authenticate, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ login, password }),
    }).catch(() => null);

    const { status, person, token, message } = await response?.json() || {};
    if (status === STATUS_OK && person && !!token?.token) {
      setProfile(person);
      setToken(token.token);
      navigate("/");
    } else {
      resetField("password");
      setError(message || "Invalid username or password");
    }

    setLoading(false);
  };

  return (
    <StyledContainer>
      {loading && <Loader />}
      <FormContainer alignItems="center" justifyContent="center">
        <StyledHeaderBox>
          <Typography component="h1" variant="h3">
            Better VINwiki
          </Typography>
          <Typography component="p" variant="subtitle1" sx={{ mt: 1, fontStyle: "italic", fontWeight: 400 }}>
            A reimagined VINwiki&trade; web experience.
          </Typography>
        </StyledHeaderBox>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <StyledTextField
            {...register("username", { required: true })}
            label="Username"
            type="text"
            autoComplete="username"
            error={!!errors.username}
            helperText={errors.username ? "Username or email is required" : ""}
            variant="standard"
            size="medium"
            margin="normal"
            fullWidth
            autoFocus
          />
          <StyledTextField
            {...register("password", { required: true })}
            label="Password"
            type="password"
            autoComplete="current-password"
            error={!!errors.password}
            helperText={errors.password ? "Password is required" : ""}
            variant="standard"
            size="medium"
            margin="normal"
            fullWidth
          />
          {error && (
            <StyledError>{error}</StyledError>
          )}
          <StyledButton type="submit" fullWidth variant="contained">
            Sign In
          </StyledButton>
        </Box>
        <StyledFooterBox>
          <Typography component="p" variant="subtitle1">
            Forgot your login details?
            <StyledForgotDetails component={Link} to="/forgot-password" variant="subtitle1">
              Let's find them.
            </StyledForgotDetails>
          </Typography>
        </StyledFooterBox>
      </FormContainer>
    </StyledContainer>
  );
};

export default LoginView;
