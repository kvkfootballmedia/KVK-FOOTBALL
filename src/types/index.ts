export type UserRole = 'admin' | 'editor' | 'author';
export type ContentStatus = 'draft' | 'review' | 'published' | 'archived';

export type BlockType = "paragraph" | "heading" | "image" | "quote" | "list" | "embed" | "html";

export interface PostBlock {
  id?: string; // uuid from DB
  block_type: BlockType;
  content: Record<string, any>; // JSONB (e.g., { text: "...", url: "..." })
  position: number;
}

export interface Post {
  id: string; // uuid
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  status: ContentStatus;
  published_at: string;
  is_featured: boolean;
  category_id?: string;
  author_id?: string;
  categories: { name: string; slug: string }[];
  author: { full_name: string; role?: string };
  meta_title?: string;
  meta_description?: string;
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

// For Admin usage (simplified)
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
