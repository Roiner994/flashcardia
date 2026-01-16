export interface Deck {
  id: string;
  title: string;
  user_id: string | null;
  created_at: string;
}

export interface Card {
  id: string;
  deck_id: string;
  front_word: string;
  definition: string; // "Concept" in the UI
  spanish_meaning: string; // "Meaning" in the UI
  phonetic: string | null;
  examples: string[]; // "Usage Examples" in the UI
  status: 'new' | 'learning' | 'mastered';
  created_at: string;
}
