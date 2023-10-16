import React, { FC } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useDarkMode } from 'usehooks-ts';
import reportWebVitals from './reportWebVitals';
import { DarkTheme } from './themes/dark';
import { LightTheme } from './themes/light';
import { routes } from './routes';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

declare module '@mui/material/styles' {
  interface Palette {
    modal: {
      background: string;
      contrast: string
    };
  }
  interface PaletteOptions {
    modal?: {
      background?: string;
      contrast?: string
    };
  }
}

const router = createBrowserRouter(routes);

const App: FC = () => {
  const { isDarkMode } = useDarkMode();

  return (
    <ThemeProvider theme={isDarkMode ? DarkTheme : LightTheme}>
      <CssBaseline />
      <RouterProvider router={router} fallbackElement={<p>Error!</p>} />
    </ThemeProvider>
  );
};

root.render(
  <React.StrictMode>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <App />
    </LocalizationProvider>
  </React.StrictMode>,
);

reportWebVitals();
