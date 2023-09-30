type Profile = {
  avatar: string;
  bio: string;
  display_name: string;
  email: string;
  first_name: string;
  follower_count: number;
  following_count: number;
  following_vehicle_count: number;
  full_name: string;
  id: number;
  last_name: string;
  location: string;
  post_count: number;
  // profile: never;
  profile_picture_uuid: string;
  social_facebook: string;
  social_instagram: string;
  social_linkedin: string;
  social_twitter: string;
  username: string;
  uuid: string;
  website_url: string;
};

type AuthProfile = Profile;

type ProfileNotification = {
  created: string; // Unix timestamp
  created_ago: string; // Human readable time
  created_date: string; // ISO 8601 date with offset
  post: Pick<FeedPost, "post_text" | "uuid">;
  recipient_id: "string";
  recipient_uuid: "string";
  seen: boolean;
  sender: Pick<Profile, "avatar" | "username" | "uuid">;
  text: string;
  type: "post_mention" | "origin_author"; // TODO: Add more types
  uuid: string;
};

type ProfileFollower = Pick<Profile, "id" | "avatar" | "username" | "uuid" | "first_name" | "follower_count" | "profile_picture_uuid">;

type ProfileSearchResult = Pick<Profile, "display_name" | "avatar" | "username" | "uuid">;
