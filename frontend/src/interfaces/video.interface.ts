export interface Genre {
  id: number;
  name: string;
}

export interface Video {
  id: number;
  title: string;
  description: string;
  release_date: string;
  producer: string;
  star_actors: string;
  thumbnail: string;
  video_file: string;
  created_at: string;
  uploaded_by: string;
  genres: Genre[];
  likes_count: number;
  average_rating: number;
  has_liked: boolean;
}

export interface VideoFormData {
  title: string;
  description: string;
  release_date: string;
  producer: string;
  star_actors: string;
  thumbnail: File | null;
  video_file: File | null;
  genres: number[];
}

export interface Rating {
  id: number;
  user: string;
  rating: number;
}
