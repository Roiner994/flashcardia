import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { supabase } from '../lib/supabase';
import { Card, Deck } from '../types';

const LOCAL_DECKS_KEY = 'local_decks';
const LOCAL_CARDS_KEY = 'local_cards';
const CARD_MEDIA_BUCKET = 'avatars';

// Cache the userId to avoid repeated getSession() calls
let cachedUserId: string | null | undefined = undefined; // undefined = not yet fetched

// Listen for auth state changes to invalidate cache
supabase.auth.onAuthStateChange((_event, session) => {
  cachedUserId = session?.user?.id ?? null;
});

export const DataService = {
  normalizeCard(card: Partial<Card>): Card {
    return {
      id: card.id || Crypto.randomUUID(),
      deck_id: card.deck_id || '',
      front_word: card.front_word || '',
      definition: card.definition || '',
      spanish_meaning: card.spanish_meaning || '',
      phonetic: card.phonetic ?? null,
      examples: Array.isArray(card.examples) ? card.examples : [],
      image_url: card.image_url ?? null,
      audio_url: card.audio_url ?? null,
      audio_source: card.audio_source ?? 'tts',
      status: card.status || 'new',
      next_review_at: card.next_review_at ?? null,
      interval: card.interval ?? 0,
      ease_factor: card.ease_factor ?? 2.5,
      created_at: card.created_at || new Date().toISOString(),
    };
  },

  async getUserId(): Promise<string | null> {
    if (cachedUserId !== undefined) return cachedUserId;
    const { data: { session } } = await supabase.auth.getSession();
    cachedUserId = session?.user?.id ?? null;
    return cachedUserId;
  },

  async getDecks(): Promise<Deck[]> {
    const userId = await this.getUserId();

    if (userId) {
      const { data, error } = await supabase
        .from('decks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      const json = await AsyncStorage.getItem(LOCAL_DECKS_KEY);
      const decks: Deck[] = json ? JSON.parse(json) : [];
      return decks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  },

  async createDeck(title: string, isPublic: boolean = false): Promise<Deck> {
    const userId = await this.getUserId();
    const newDeck: Deck = {
      id: Crypto.randomUUID(),
      title,
      user_id: userId,
      created_at: new Date().toISOString(),
      is_public: isPublic,
      likes_count: 0,
      downloads_count: 0,
      tags: [],
    };

    if (userId) {
      const { data, error } = await supabase
        .from('decks')
        .insert([{ title, user_id: userId, is_public: isPublic }]) // Let Supabase generate ID/timestamp if desired, but we can also send.
        // Actually, best to let Supabase handle ID for remote, but for hybrid consistency we might want to standardize.
        // For this demo, let's let Supabase return the object.
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const decks = await this.getDecks();
      decks.unshift(newDeck);
      await AsyncStorage.setItem(LOCAL_DECKS_KEY, JSON.stringify(decks));
      return newDeck;
    }
  },

  async updateDeck(id: string, deckData: Partial<Deck>): Promise<void> {
    const userId = await this.getUserId();

    if (userId) {
      const { error } = await supabase
        .from('decks')
        .update(deckData)
        .eq('id', id);
      if (error) throw error;
    } else {
      const decks = await this.getDecks();
      const index = decks.findIndex(d => d.id === id);
      if (index !== -1) {
        decks[index] = { ...decks[index], ...deckData };
        await AsyncStorage.setItem(LOCAL_DECKS_KEY, JSON.stringify(decks));
      }
    }
  },

  async deleteDeck(id: string): Promise<void> {
    const userId = await this.getUserId();

    if (userId) {
      const { error } = await supabase.from('decks').delete().eq('id', id);
      if (error) throw error;
    } else {
      const decks = await this.getDecks();
      const filtered = decks.filter(d => d.id !== id);
      await AsyncStorage.setItem(LOCAL_DECKS_KEY, JSON.stringify(filtered));

      // Cascade delete cards
      const cards = await this.getAllLocalCards();
      const filteredCards = cards.filter(c => c.deck_id !== id);
      await AsyncStorage.setItem(LOCAL_CARDS_KEY, JSON.stringify(filteredCards));
    }
  },

  async getCards(deckId: string): Promise<Card[]> {
    const userId = await this.getUserId();

    if (userId) {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('deck_id', deckId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((card) => this.normalizeCard(card));
    } else {
      const cards = await this.getAllLocalCards();
      return cards
        .filter(c => c.deck_id === deckId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  },

  async getAllCards(): Promise<Card[]> {
    const userId = await this.getUserId();

    if (userId) {
      // Scope to user's decks for tenant isolation
      const userDecks = await this.getDecks();
      const deckIds = userDecks.map(d => d.id);
      if (deckIds.length === 0) return [];

      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .in('deck_id', deckIds);
      if (error) throw error;
      return (data || []).map((card) => this.normalizeCard(card));
    } else {
      return await this.getAllLocalCards();
    }
  },

  // Helper for local cards
  async getAllLocalCards(): Promise<Card[]> {
    const json = await AsyncStorage.getItem(LOCAL_CARDS_KEY);
    const cards: Partial<Card>[] = json ? JSON.parse(json) : [];
    return cards.map((card) => this.normalizeCard(card));
  },

  async createCard(cardData: Omit<Card, 'id' | 'created_at'>): Promise<Card> {
    const userId = await this.getUserId();

    // Note: Supabase implementation usually relies on DB defaults for ID/Created_at 
    // but the input might vary.

    if (userId) {
      const { data, error } = await supabase
        .from('cards')
        .insert([cardData])
        .select()
        .single();
      if (error) throw error;
      return this.normalizeCard(data);
    } else {
      const newCard: Card = this.normalizeCard({
        ...cardData,
        id: Crypto.randomUUID(),
        created_at: new Date().toISOString(),
      });

      const cards = await this.getAllLocalCards();
      cards.unshift(newCard);
      await AsyncStorage.setItem(LOCAL_CARDS_KEY, JSON.stringify(cards));
      return newCard;
    }
  },

  async updateCard(id: string, updates: Partial<Omit<Card, 'id' | 'created_at'>>): Promise<Card | null> {
    const userId = await this.getUserId();

    if (userId) {
      const { data, error } = await supabase
        .from('cards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return this.normalizeCard(data);
    } else {
      const cards = await this.getAllLocalCards();
      const index = cards.findIndex(c => c.id === id);
      if (index === -1) return null;

      const updatedCard = this.normalizeCard({
        ...cards[index],
        ...updates,
      });
      cards[index] = updatedCard;
      await AsyncStorage.setItem(LOCAL_CARDS_KEY, JSON.stringify(cards));
      return updatedCard;
    }
  },

  async updateCardSRS(id: string, srsData: Partial<Pick<Card, 'status' | 'next_review_at' | 'interval' | 'ease_factor'>>): Promise<void> {
    const userId = await this.getUserId();

    if (userId) {
      const { error } = await supabase
        .from('cards')
        .update(srsData)
        .eq('id', id);
      if (error) throw error;
    } else {
      const cards = await this.getAllLocalCards();
      const index = cards.findIndex(c => c.id === id);
      if (index !== -1) {
        cards[index] = { ...cards[index], ...srsData };
        await AsyncStorage.setItem(LOCAL_CARDS_KEY, JSON.stringify(cards));
      }
    }
  },

  async deleteCard(id: string): Promise<void> {
    const userId = await this.getUserId();

    if (userId) {
      const { error } = await supabase.from('cards').delete().eq('id', id);
      if (error) throw error;
    } else {
      const cards = await this.getAllLocalCards();
      const filtered = cards.filter(c => c.id !== id);
      await AsyncStorage.setItem(LOCAL_CARDS_KEY, JSON.stringify(filtered));
    }
  },

  async updateCardStatus(id: string, status: Card['status']): Promise<void> {
    const userId = await this.getUserId();

    if (userId) {
      const { error } = await supabase
        .from('cards')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    } else {
      const cards = await this.getAllLocalCards();
      const index = cards.findIndex(c => c.id === id);
      if (index !== -1) {
        cards[index].status = status;
        await AsyncStorage.setItem(LOCAL_CARDS_KEY, JSON.stringify(cards));
      }
    }
  },

  // Expose pure local getters for MigrationService
  async getLocalDecks(): Promise<Deck[]> {
    const json = await AsyncStorage.getItem(LOCAL_DECKS_KEY);
    return json ? JSON.parse(json) : [];
  },

  async clearLocalData(): Promise<void> {
    await AsyncStorage.removeItem(LOCAL_DECKS_KEY);
    await AsyncStorage.removeItem(LOCAL_CARDS_KEY);
  },

  async uploadCardMedia(uri: string, deckId: string, kind: 'image' | 'audio'): Promise<string> {
    const userId = await this.getUserId();
    if (!uri || !userId) return uri;

    const cleanUri = uri.split('?')[0];
    const extFromUri = cleanUri.includes('.') ? cleanUri.split('.').pop()?.toLowerCase() : undefined;
    const fileExt = extFromUri || (kind === 'image' ? 'jpg' : 'm4a');
    const contentType =
      kind === 'image'
        ? `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`
        : fileExt === 'wav'
          ? 'audio/wav'
          : fileExt === 'mp3'
            ? 'audio/mpeg'
            : 'audio/mp4';
    const response = await fetch(uri);
    const arrayBuffer = await response.arrayBuffer();
    const filePath = `cards/${userId}/${deckId}/${kind}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(CARD_MEDIA_BUCKET)
      .upload(filePath, arrayBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(CARD_MEDIA_BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
  }
};
