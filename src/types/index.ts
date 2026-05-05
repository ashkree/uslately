export type PostType = "music" | "photo";

export interface Post {
  id: string;
  type: PostType;
  title: string;
  sub?: string;
  note: string;
  sender: string;
  image_url?: string;
  created_at: string;
}

export interface Reply {
  id: string;
  post_id: string;
  author: string;
  text: string;
  created_at: string;
}
