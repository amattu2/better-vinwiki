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
import { CONFIG } from './config/AppConfig';

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

const router = createBrowserRouter(routes, { basename: CONFIG.PUBLIC_URL });

const App: FC = () => {
  const { isDarkMode } = useDarkMode();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={isDarkMode ? DarkTheme : LightTheme}>
        <CssBaseline />
        <RouterProvider router={router} fallbackElement={<p>Error!</p>} />
      </ThemeProvider>
    </LocalizationProvider>
  );
};

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

reportWebVitals();
