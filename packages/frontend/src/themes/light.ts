import { Theme, createTheme } from "@mui/material";

export const LightTheme: Theme = createTheme({
  palette: {
    mode: "light",
    modal: {
      background: "#f4f7fa",
      contrast: "#fff",
    },
    divider: "#ddd",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          height: "100vh",
          backgroundColor: "rgb(244, 247, 250)",
        },
      },
    },
  },
});
