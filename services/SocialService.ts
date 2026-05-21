import { CommunityPersonDecksResponse, Profile, PublicDeck, PublicDeckPreviewResponse } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_FLASHCARD_API_URL || 'http://192.168.1.18:3000';

export const SocialService = {
  async getExploreDecks(page: number = 1, userId?: string): Promise<PublicDeck[]> {
    const params = new URLSearchParams({
      page: String(page),
      limit: '20',
    });
    if (userId) params.set('user_id', userId);

    const response = await fetch(`${API_BASE_URL}/api/community/explore?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch explore decks');
    return response.json();
  },

  async searchPeople(query: string = '', page: number = 1): Promise<Profile[]> {
    const response = await fetch(`${API_BASE_URL}/api/community/people?query=${encodeURIComponent(query)}&page=${page}&limit=20`);
    if (!response.ok) throw new Error('Failed to search people');
    return response.json();
  },

  async getPersonPublicDecks(userId: string, viewerUserId?: string): Promise<CommunityPersonDecksResponse> {
    const params = new URLSearchParams({ user_id: userId });
    if (viewerUserId) params.set('viewer_user_id', viewerUserId);

    const response = await fetch(`${API_BASE_URL}/api/community/person-decks?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch public decks for person');
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

  async getDeckPreview(deckId: string): Promise<PublicDeckPreviewResponse> {
    const response = await fetch(`${API_BASE_URL}/api/community/deck-preview?deck_id=${encodeURIComponent(deckId)}`);
    if (!response.ok) throw new Error('Failed to fetch deck preview');
    return response.json();
  },

  async importSelectedCards(deckId: string, userId: string, cardIds: string[], deckTitle?: string): Promise<{ new_deck_id: string; imported_count: number }> {
    const response = await fetch(`${API_BASE_URL}/api/community/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deck_id: deckId, user_id: userId, card_ids: cardIds, deck_title: deckTitle }),
    });
    if (!response.ok) throw new Error('Failed to import selected cards');
    return response.json();
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
