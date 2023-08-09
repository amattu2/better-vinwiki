export const API_URL: string = 'https://rest.vinwiki.com/';

export const ENDPOINTS = {
  /* Auth Endpoints */
  authenticate: `${API_URL}auth/authenticate`,
  logout: `${API_URL}auth/logout`,

  /* User Endpoints */
  notifications: `${API_URL}person/notification_count/me`,
};

export const STATUS_OK = "ok";
