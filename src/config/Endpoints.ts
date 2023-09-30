export const API_URL: string = 'https://rest.vinwiki.com/';
export const MEDIA_URL: string = "https://media.vinwiki.com/media/";

export const DEFAULT_DATE = "1970-01-01T00:00:00+00:00";

export const ENDPOINTS = {
  /* Auth Endpoints */
  authenticate: `${API_URL}auth/authenticate`,
  logout: `${API_URL}auth/logout`,
  // TODO: Password Change Endpoint...

  /* Person Endpoints */
  profile: `${API_URL}person/profile/`,
  profile_update: `${API_URL}person/id/`,
  profile_picture: `${API_URL}person/profile_picture/`,
  profile_search: `${API_URL}person/search/`,
  profile_username_search: `${API_URL}person/for_username/`,
  notification_count: `${API_URL}person/notification_count/me`,
  notifications: `${API_URL}person/notifications`,
  feed: `${API_URL}person/feed/`,
  filtered_feed: `${API_URL}person/filtered_feed/`,
  posts: `${API_URL}person/posts/`,
  is_following: `${API_URL}person/is_following/`,
  follow: `${API_URL}person/follow/`,
  following: `${API_URL}person/following/`,
  followers: `${API_URL}person/followers/`,
  following_vehicles: `${API_URL}person/following_vehicles/`,
  recent_vins: `${API_URL}person/recent_vins/`,
  lists: `${API_URL}person/lists/`,

  /* Vehicle Endpoints */
  vehicle: `${API_URL}vehicle/vin/`,
  vehicle_update: `${API_URL}vehicle/vin/`,
  vehicle_search: `${API_URL}vehicle/search/`,
  vehicle_feed: `${API_URL}vehicle/feed/`,
  vehicle_is_following: `${API_URL}vehicle/is_following/`,
  vehicle_follow: `${API_URL}vehicle/follow/`,
  vehicle_followers: `${API_URL}vehicle/followers/`,
  vehicle_post: `${API_URL}vehicle/post/`,
  plate_lookup: `${API_URL}vehicle/plate_lookup`,

  /* Post Endpoints */
  post_delete: `${API_URL}post/delete/`,
  post_report: `${API_URL}post/report/`,
  comments: `${API_URL}post/comments/`,
  post_comment_create: `${API_URL}post/comment/`,
  post_comment_delete: `${API_URL}post/delete_comment/`,
  post_comment_report: `${API_URL}comment/report/`,

  /* List Endpoints */
  list: `${API_URL}lists/id/`,
  list_update: `${API_URL}lists/id/`,
  list_search: `${API_URL}lists/search`,
  list_is_following: `${API_URL}lists/is_following/`,
  list_follow: `${API_URL}lists/follow/`,
  list_followers: `${API_URL}lists/followers/`,
  list_vehicles: `${API_URL}lists/vehicles/`,
  list_create: `${API_URL}lists/add`,
  list_delete: `${API_URL}lists/delete/`,
  list_add_vehicle: `${API_URL}lists/addvin/`,
  // TODO: List Vehicle Removal...
};

export const MEDIA_ENDPOINTS = {
  /* Vehicle Endpoints */
  vehicle_image_add: `${MEDIA_URL}add/photo/vehicle/`,
  vehicle_image: `${MEDIA_URL}photo/vehicle/`,
  person_image_add: `${MEDIA_URL}photo/person/`,
};

export const STATUS_OK = "ok";
export const STATUS_ERROR = "error";
