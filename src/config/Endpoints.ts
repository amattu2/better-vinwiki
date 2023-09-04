export const API_URL: string = 'https://rest.vinwiki.com/';

export const ENDPOINTS = {
  /* Auth Endpoints */
  authenticate: `${API_URL}auth/authenticate`,
  logout: `${API_URL}auth/logout`,

  /* Person Endpoints */
  profile: `${API_URL}person/profile/`,
  profile_search: `${API_URL}person/search/`,
  profile_username_search: `${API_URL}person/for_username/`,
  notification_count: `${API_URL}person/notification_count/me`,
  notifications: `${API_URL}person/notifications`,
  feed: `${API_URL}person/feed/`, // PATH: me/:count/:last_id
  filtered_feed: `${API_URL}person/filtered_feed/`, // PATH: me/:count/:last_id
  posts: `${API_URL}person/posts/`,
  comments: `${API_URL}post/comments/`,
  is_following: `${API_URL}person/is_following/`,
  follow: `${API_URL}person/follow/`,
  recent_vins: `${API_URL}person/recent_vins`,
  lists: `${API_URL}person/lists/`,
  following_vehicles: `${API_URL}person/following_vehicles/`, // TODO: implement (vehicles following)
  following: `${API_URL}person/following/`, // TODO: implement (user following)
  followers: `${API_URL}person/followers/`, // TODO: implement (people following user)

  /* Vehicle Endpoints */
  vehicle_search: `${API_URL}vehicle/search`,
  vehicle: `${API_URL}vehicle/vin/`,
  vehicle_feed: `${API_URL}/vehicle/feed/`,
  vehicle_is_following: `${API_URL}vehicle/is_following/`,

  /* List Endpoints */
  list_search: `${API_URL}lists/search`,
  list: `${API_URL}lists/id/`,
  list_vehicles: `${API_URL}lists/vehicles/`, // PATH: :uuid/:count
};

export const STATUS_OK = "ok";
