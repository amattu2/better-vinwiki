import React, { ElementType, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, LinkProps, useLocation, useNavigate } from "react-router-dom";
import { Alert, Box, Button, Stack, TextField, Typography, alpha, styled } from "@mui/material";
import { useLocalStorage } from "usehooks-ts";
import backgroundImage from "../../assets/images/shop-1864x1400.jpg";
import Loader from "../../components/Loader";
import { CacheKeys } from "../../config/Cache";
import { ENDPOINTS, STATUS_OK } from "../../config/Endpoints";
import { CONFIG } from "../../config/AppConfig";

type Inputs = {
  username: string,
  password: string,
};

const StyledContainer = styled(Box)(({ theme }) => ({
  height: "100vh",
  backgroundImage: `linear-gradient(${alpha(theme.palette.background.default, 0.75)} 5%,
  ${alpha(theme.palette.background.default, 0.93)} 70%),
    url(${backgroundImage})`,
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundAttachment: "fixed",
}));

const FormContainer = styled(Stack)(({ theme }) => ({
  maxWidth: '470px',
  maxHeight: '100vh',
  margin: '0 auto',
  background: theme.palette.mode === 'dark' ? theme.palette.modal.background : theme.palette.background.paper,
  borderRadius: "0 0 6px 6px",
  padding: "98px 35px",
  [theme.breakpoints.down('md')]: {
    paddingTop: "50px",
  },
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

const StyledHeader = styled(Typography)(({ theme }) => ({
  background: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(1),
  borderRadius: "6px",
}));

const StyledSubtitle = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
  fontStyle: "italic",
  fontWeight: 400,
  color: theme.palette.text.secondary,
}));

const StyledFormBox = styled(Box)({
  width: "100%",
});

const StyledFooterBox = styled(Box)({
  marginTop: "30px",
  textAlign: "center",
  width: "100%",
});

const StyledTextField = styled(TextField)({
  marginBottom: "30px",
  "& .MuiFormLabel-root": {
    fontSize: "18px",
  },
});

const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  margin: theme.spacing(2, 0),
  textTransform: "none",
  boxShadow: theme.shadows[4],
}));

const StyledForgotDetails = styled(Typography)<{ component: ElementType } & LinkProps>(({ theme }) => ({
  fontWeight: 500,
  color: theme.palette.primary.main,
  marginLeft: theme.spacing(0.5),
  textDecoration: "none",
}));

const StyledCopyright = styled(Typography)({
  position: "absolute",
  bottom: "10px",
  left: "50%",
  transform: "translateX(-50%)",
  fontSize: "12px",
  textAlign: "center",
});

const LoginView = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
          <StyledHeader variant="h3">
            {CONFIG.name}
          </StyledHeader>
          <StyledSubtitle variant="subtitle1">
            {CONFIG.slogan}
          </StyledSubtitle>
        </StyledHeaderBox>
        <StyledFormBox component="form" onSubmit={handleSubmit(onSubmit)}>
          {location.state?.message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {location.state.message}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <StyledTextField
            {...register("username", { required: true })}
            label="Username or Email"
            type="text"
            autoComplete="username"
            error={!!errors.username}
            helperText={errors.username ? "Username or email address is required" : ""}
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
          <StyledButton type="submit" fullWidth variant="contained">
            Sign In
          </StyledButton>
        </StyledFormBox>
        <StyledFooterBox>
          <Typography component="p" variant="subtitle1">
            Forgot your login details?
            <StyledForgotDetails component={Link} to="/forgot-password" variant="subtitle1">
              Let&apos;s find them.
            </StyledForgotDetails>
            <br />
            Need to register?
            <StyledForgotDetails component={Link} to="/register" variant="subtitle1">
              Sign up now.
            </StyledForgotDetails>
          </Typography>
        </StyledFooterBox>
      </FormContainer>
      <StyledCopyright>
        &copy;
        {" "}
        {new Date().getFullYear()}
        {" Alec M. "}
        <Link to="https://amattu.com" target="_blank" rel="noopener noreferrer">amattu.com</Link>
      </StyledCopyright>
    </StyledContainer>
  );
};

export default LoginView;
