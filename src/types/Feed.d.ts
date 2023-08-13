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
  person: Profile;
  post_date: string; // ISO 8601 incl. offset
  post_date_ago: string; // MMM DD, YYYY
  post_text: string;
  post_time: string; // Unix timestamp
  subject_uuid: string;
  type: "photo" | "generic";
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
