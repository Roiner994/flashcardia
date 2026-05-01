import { Deck, Profile } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_FLASHCARD_API_URL || 'http://192.168.1.18:3000';

export const SocialService = {
  async getExploreDecks(page: number = 1): Promise<Deck[]> {
    const response = await fetch(`${API_BASE_URL}/api/community/explore?page=${page}&limit=20`);
    if (!response.ok) throw new Error('Failed to fetch explore decks');
    return response.json();
  },

  async searchPeople(query: string = '', page: number = 1): Promise<Profile[]> {
    const response = await fetch(`${API_BASE_URL}/api/community/people?query=${encodeURIComponent(query)}&page=${page}&limit=20`);
    if (!response.ok) throw new Error('Failed to search people');
    return response.json();
  },

  async toggleLike(deckId: string, userId: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/api/community/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deck_id: deckId, user_id: userId }),
    });
    if (!response.ok) throw new Error('Failed to toggle like');
    const data = await response.json();
    return data.liked;
  },

  async forkDeck(deckId: string, userId: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/community/fork`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deck_id: deckId, user_id: userId }),
    });
    if (!response.ok) throw new Error('Failed to fork deck');
    const data = await response.json();
    return data.new_deck_id;
  }
};
