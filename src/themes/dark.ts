import { Theme, createTheme } from "@mui/material";

export const DarkTheme: Theme = createTheme({
  palette: {
    mode: 'dark',
    modal: {
      background: "#3b3b3b",
      contrast: "#3b3b3b",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          height: "100vh",
          backgroundColor: "rgb(24, 25, 26)",
        },
      },
    },
  },
});
