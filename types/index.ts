export interface Deck {
  id: string;
  title: string;
  user_id: string | null;
  daily_new_limit?: number;
  created_at: string;
  is_public?: boolean;
  likes_count?: number;
  downloads_count?: number;
  tags?: string[];
}

export interface Card {
  id: string;
  deck_id: string;
  front_word: string;
  definition: string; // "Concept" in the UI
  spanish_meaning: string; // "Meaning" in the UI
  phonetic: string | null;
  examples: string[]; // "Usage Examples" in the UI
  status: 'new' | 'learning' | 'review' | 'mastered';
  next_review_at: string | null;
  interval: number; // in days
  ease_factor: number; // default 2.5
  created_at: string;
}

export interface Profile {
  id: string;
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
  streak_shields_count: number;
  username?: string;
  full_name?: string;
  avatar_url?: string;
}
