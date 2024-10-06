import React, { ElementType, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, LinkProps, useNavigate } from "react-router-dom";
import { Box, Button, Stack, TextField, Typography, alpha, styled } from "@mui/material";
import backgroundImage from "../../assets/images/shop-1864x1400.jpg";
import Loader from "../../components/Loader";
import { ENDPOINTS, STATUS_OK } from "../../config/Endpoints";
import { CONFIG } from "../../config/AppConfig";

type FormInput = {
  email: string;
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
  maxWidth: "470px",
  maxHeight: "100vh",
  margin: "0 auto",
  background:
    theme.palette.mode === "dark" ? theme.palette.modal.background : theme.palette.background.paper,
  borderRadius: "0 0 6px 6px",
  padding: "98px 35px",
  [theme.breakpoints.down("md")]: {
    paddingTop: "50px",
  },
  [theme.breakpoints.down("sm")]: {
    height: "100%",
    width: "100%",
    maxWidth: "100%",
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

const StyledError = styled(Typography)(({ theme }) => ({
  fontSize: "12px",
  lineHeight: "33px",
  color: theme.palette.error.main,
  textAlign: "right",
}));

const StyledForgotDetails = styled(Typography)<{ component: ElementType } & LinkProps>(
  ({ theme }) => ({
    fontWeight: 500,
    color: theme.palette.primary.main,
    marginLeft: theme.spacing(0.5),
    textDecoration: "none",
  })
);

const StyledCopyright = styled(Typography)({
  position: "absolute",
  bottom: "10px",
  left: "50%",
  transform: "translateX(-50%)",
  fontSize: "12px",
  textAlign: "center",
});

const ForgotView = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const { register, handleSubmit, formState, resetField } = useForm<FormInput>();
  const { errors } = formState;

  const onSubmit = async ({ email }: FormInput) => {
    setLoading(true);
    setError("");

    const response = await fetch(ENDPOINTS.reset_password, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    }).catch(() => null);

    const { status, mail_sent, message } = (await response?.json()) || {};
    if (status === STATUS_OK && !!mail_sent) {
      navigate("/login", { state: { message: "Password reset email sent" } });
    } else {
      resetField("email");
      setError(message || "Failed to send password reset email");
    }

    setLoading(false);
  };

  return (
    <StyledContainer>
      {loading && <Loader />}
      <FormContainer alignItems="center" justifyContent="center">
        <StyledHeaderBox>
          <StyledHeader variant="h3">{CONFIG.name}</StyledHeader>
          <StyledSubtitle variant="subtitle1">{CONFIG.slogan}</StyledSubtitle>
        </StyledHeaderBox>
        <StyledFormBox component="form" onSubmit={handleSubmit(onSubmit)}>
          <StyledTextField
            {...register("email", { required: true })}
            label="Email Address"
            type="email"
            autoComplete="username"
            error={!!errors.email}
            helperText={errors.email ? "Email address is required" : ""}
            variant="standard"
            size="medium"
            margin="normal"
            fullWidth
            autoFocus
          />
          {error && <StyledError>{error}</StyledError>}
          <StyledButton type="submit" fullWidth variant="contained">
            Reset Password
          </StyledButton>
        </StyledFormBox>
        <StyledFooterBox>
          <Typography component="p" variant="subtitle1">
            Already have an account?
            <StyledForgotDetails component={Link} to="/login" variant="subtitle1">
              Login.
            </StyledForgotDetails>
          </Typography>
        </StyledFooterBox>
      </FormContainer>
      <StyledCopyright>
        &copy; {new Date().getFullYear()}
        {" Alec M. "}
        <Link to="https://amattu.com" target="_blank" rel="noopener noreferrer">
          amattu.com
        </Link>
      </StyledCopyright>
    </StyledContainer>
  );
};

export default ForgotView;
