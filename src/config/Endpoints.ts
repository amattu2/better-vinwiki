export const API_URL: string = 'https://rest.vinwiki.com/';

export const ENDPOINTS = {
  /* Auth Endpoints */
  authenticate: `${API_URL}auth/authenticate`,
  logout: `${API_URL}auth/logout`,

  /* User Endpoints */
  profile: `${API_URL}person/profile/`,
  notifications: `${API_URL}person/notification_count/me`,
  feed: `${API_URL}person/feed/`,
  filtered_feed: `${API_URL}person/filtered_feed/`,
  posts: `${API_URL}person/posts/`,
  is_following: `${API_URL}person/is_following/`,
  recent_vins: `${API_URL}person/recent_vins`,

  /* Vehicle Endpoints */
  search: `${API_URL}vehicle/search`,
};

export const STATUS_OK = "ok";
