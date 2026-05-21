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

export interface PublicDeckProfile {
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
}

export interface PublicDeck extends Deck {
  profiles?: PublicDeckProfile | null;
  liked_by_user?: boolean;
}

export interface Card {
  id: string;
  deck_id: string;
  front_word: string;
  definition: string; // "Concept" in the UI
  spanish_meaning: string; // "Meaning" in the UI
  phonetic: string | null;
  examples: string[]; // "Usage Examples" in the UI
  image_url: string | null;
  audio_url: string | null;
  audio_source: 'tts' | 'recorded';
  status: 'new' | 'learning' | 'review' | 'mastered';
  next_review_at: string | null;
  interval: number; // in days
  ease_factor: number; // default 2.5
  created_at: string;
}

export interface CardDraft {
  front_word: string;
  definition: string;
  spanish_meaning: string;
  phonetic: string;
  examples: string[];
  image_url: string | null;
  audio_url: string | null;
  audio_source: 'tts' | 'recorded';
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
  public_deck_count?: number;
}

export interface PublicDeckPreviewCard {
  id: string;
  front_word: string;
  definition: string;
  spanish_meaning: string;
  phonetic: string | null;
  examples: string[];
  image_url?: string | null;
  audio_url?: string | null;
  audio_source?: 'tts' | 'recorded';
  example_sentence?: string | null;
}

export interface PublicDeckPreviewResponse {
  deck: PublicDeck;
  cards: PublicDeckPreviewCard[];
}

export interface CommunityPersonDecksResponse {
  person: Profile;
  decks: PublicDeck[];
}
