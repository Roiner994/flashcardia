import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { supabase } from '../lib/supabase';
import { Card, Deck } from '../types';

const LOCAL_DECKS_KEY = 'local_decks';
const LOCAL_CARDS_KEY = 'local_cards';

export const DataService = {
  async getUserId(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
  },

  async getDecks(): Promise<Deck[]> {
    const userId = await this.getUserId();

    if (userId) {
      const { data, error } = await supabase
        .from('decks')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      const json = await AsyncStorage.getItem(LOCAL_DECKS_KEY);
      const decks: Deck[] = json ? JSON.parse(json) : [];
      return decks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  },

  async createDeck(title: string): Promise<Deck> {
    const userId = await this.getUserId();
    const newDeck: Deck = {
      id: Crypto.randomUUID(),
      title,
      user_id: userId,
      created_at: new Date().toISOString(),
    };

    if (userId) {
      const { data, error } = await supabase
        .from('decks')
        .insert([{ title, user_id: userId }]) // Let Supabase generate ID/timestamp if desired, but we can also send.
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
      return data || [];
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
      const { data, error } = await supabase
        .from('cards')
        .select('*');
      if (error) throw error;
      return data || [];
    } else {
      return await this.getAllLocalCards();
    }
  },

  // Helper for local cards
  async getAllLocalCards(): Promise<Card[]> {
    const json = await AsyncStorage.getItem(LOCAL_CARDS_KEY);
    return json ? JSON.parse(json) : [];
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
      return data;
    } else {
      const newCard: Card = {
        ...cardData,
        id: Crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };

      const cards = await this.getAllLocalCards();
      cards.unshift(newCard);
      await AsyncStorage.setItem(LOCAL_CARDS_KEY, JSON.stringify(cards));
      return newCard;
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
  }
};
