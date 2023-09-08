export const API_URL: string = 'https://rest.vinwiki.com/';
export const MEDIA_URL: string = "https://media.vinwiki.com/media/";

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
  recent_vins: `${API_URL}person/recent_vins/`, // PATH: :uuid/:count
  lists: `${API_URL}person/lists/`, // PATH: :uuid/:count
  following_vehicles: `${API_URL}person/following_vehicles/`, // PATH: :uuid
  following: `${API_URL}person/following/`, // TODO: implement (user following)
  followers: `${API_URL}person/followers/`, // TODO: implement (people following user)

  /* Vehicle Endpoints */
  vehicle_search: `${API_URL}vehicle/search`,
  plate_lookup: `${API_URL}vehicle/plate_lookup`,
  vehicle: `${API_URL}vehicle/vin/`,
  vehicle_feed: `${API_URL}/vehicle/feed/`,
  vehicle_is_following: `${API_URL}vehicle/is_following/`,
  vehicle_follow: `${API_URL}vehicle/follow/`, // TODO: follow a vehicle GET :/vin
  vehicle_post: `${API_URL}vehicle/post/`,

  /* Post Endpoints */
  post_delete: `${API_URL}post/delete/`,

  /* List Endpoints */
  list_search: `${API_URL}lists/search`,
  list: `${API_URL}lists/id/`,
  list_following: `${API_URL}lists/is_following/`,
  list_followers: `${API_URL}lists/followers/`, // TODO: list the followers implement PATH: list :id
  list_vehicles: `${API_URL}lists/vehicles/`,
  list_follow: `${API_URL}lists/follow/`, // TODO: follow a list PATH: :uuid
  list_create: `${API_URL}lists/add`, // TODO: create a list POST name and description
  list_add_vehicle: `${API_URL}lists/addvin/`, // TODO: add a vehicle to a list GET vehicle /:uuid
};

export const MEDIA_ENDPOINTS = {
  /* Vehicle Endpoints */
  vehicle_image_add: `${MEDIA_URL}add/photo/vehicle/`, // PATH: /:vin
};

export const STATUS_OK = "ok";
