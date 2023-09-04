type FeedPost = {
  client: string;
  comment_count: number;
  data: any;
  dest_url: string;
  event_date: string; // ISO 8601 incl. offset
  event_time: string; // Unix timestamp
  id: string;
  image: FeedPostImage;
  locale: string;
  mileage?: number;
  person: Profile;
  post_date: string; // ISO 8601 incl. offset
  post_date_ago: string; // MMM DD, YYYY
  post_text: string;
  post_time: string; // Unix timestamp
  subject_uuid: string; // Contains a UUID for the action item (e.g. list)
  type: "photo" | "generic" | "list_add";
  uuid: string;
  vehicle: Vehicle;
};

type FeedPostImage = {
  id: string;
  large: string; // Large URL
  poster: string; // Poster URL
  thumb: string; // Thumbnail URL
  uuid: string;
};

type PostComment = {
  ago: string;
  created: string; // ISO 8601 incl. offset
  person: Profile;
  text: string;
  uuid: string;
};
