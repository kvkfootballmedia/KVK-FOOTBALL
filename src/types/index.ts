export type UserRole = 'admin' | 'editor' | 'author';
export type ContentStatus = 'draft' | 'review' | 'published' | 'archived';
export type VideoPlatform = 'tiktok' | 'youtube_shorts';

export type BlockType =
  | 'paragraph'
  | 'heading'
  | 'image'
  | 'quote'
  | 'list'
  | 'embed'
  | 'html'
  | 'short_video';

export interface ShortVideoContent {
  url: string;
  platform: VideoPlatform;
  caption?: string;
}

export interface PostBlock {
  id?: string;
  block_type: BlockType;
  content: Record<string, any>; // ShortVideoContent pour short_video, sinon structure libre
  position: number;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  status: ContentStatus;
  published_at: string;
  is_featured: boolean;
  has_video: boolean;
  category_id?: string;
  author_id?: string;
  categories: { name: string; slug: string }[];
  author: { full_name: string; role?: string };
  meta_title?: string;
  meta_description?: string;
  view_count?: number;
  reading_time?: number;
  post_blocks: PostBlock[];
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
}

export interface AuthResponse {
  user: Profile;
  access_token: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface League {
  id: string;
  name: string;
  slug: string;
  api_id: string;
  category?: string;
  logo_url?: string;
  is_active: boolean;
  sort_order: number;
}
