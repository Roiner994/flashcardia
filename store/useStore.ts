import { Session } from '@supabase/supabase-js';
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { DataService } from '../services/DataService';
import { MigrationService } from '../services/MigrationService';
import { Card, Deck } from '../types';

interface StoreState {
  decks: Deck[];
  currentCards: Card[];
  session: Session | null;
  isLoading: boolean;
  loadDecks: () => Promise<void>;
  createDeck: (title: string) => Promise<void>;
  loadCards: (deckId: string) => Promise<void>;
  addCard: (card: Omit<Card, 'id' | 'created_at'>) => Promise<void>;
  deleteDeck: (id: string) => Promise<void>;
  checkSession: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  decks: [],
  currentCards: [],
  session: null,
  isLoading: false,

  loadDecks: async () => {
    set({ isLoading: true });
    try {
      const decks = await DataService.getDecks();
      set({ decks });
    } catch (error) {
      console.error('Failed to load decks', error);
    } finally {
      set({ isLoading: false });
    }
  },

  loadCards: async (deckId: string) => {
    set({ isLoading: true });
    try {
        const cards = await DataService.getCards(deckId);
        set({ currentCards: cards });
    } catch (error) {
        console.error('Failed to load cards', error);
    } finally {
        set({ isLoading: false });
    }
  },

  createDeck: async (title: string) => {
    try {
      await DataService.createDeck(title);
      await get().loadDecks();
    } catch (error) {
      console.error('Failed to create deck', error);
      throw error;
    }
  },

  deleteDeck: async (id: string) => {
    try {
      await DataService.deleteDeck(id);
      await get().loadDecks();
    } catch (e) {
      console.error(e);
    }
  },

  addCard: async (card: Omit<Card, 'id' | 'created_at'>) => {
    try {
      await DataService.createCard(card);
      // Reload cards if we are in that deck
      if (get().currentCards.length > 0 && get().currentCards[0].deck_id === card.deck_id) {
          await get().loadCards(card.deck_id);
      }
    } catch (error) {
      console.error('Failed to add card', error);
      throw error;
    }
  },

  checkSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ session });

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      const previousSession = get().session;
      set({ session });
      
      if (session && !previousSession) {
        // Just logged in
        console.log("Logged in, attempting migration...");
        await MigrationService.migrateLocalDataToSupabase();
        get().loadDecks();
      } else if (!session && previousSession) {
        // Just logged out
        set({ decks: [], currentCards: [] }); // Clear remote data
        get().loadDecks(); // Load local data if any (probably empty unless we want to keep some)
      }
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
  }
}));
