import { Session } from '@supabase/supabase-js';
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { DataService } from '../services/DataService';
import { MigrationService } from '../services/MigrationService';
import { Card, Deck } from '../types';

interface StoreState {
  decks: Deck[];
  currentCards: Card[];
  allCards: Card[];
  session: Session | null;
  isLoading: boolean;
  dailyNewLimit: number;
  
  loadDecks: () => Promise<void>;
  createDeck: (title: string) => Promise<void>;
  loadCards: (deckId: string) => Promise<void>;
  loadAllCards: () => Promise<void>;
  addCard: (card: Omit<Card, 'id' | 'created_at'>) => Promise<void>;
  updateCardSRS: (id: string, rating: 'again' | 'hard' | 'good' | 'easy') => Promise<void>;
  deleteDeck: (id: string) => Promise<void>;
  updateDeck: (id: string, deckData: Partial<Deck>) => Promise<void>;
  setDailyLimit: (limit: number) => void;
  checkSession: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  decks: [],
  currentCards: [],
  allCards: [],
  session: null,
  isLoading: false,
  dailyNewLimit: 10,

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
        const allDeckCards = await DataService.getCards(deckId);
        const now = new Date();
        
        // 1. Due Cards: cards with status learning/review/mastered where next_review_at <= now
        const dueCards = allDeckCards.filter(c => {
            if (c.status === 'new') return false;
            if (!c.next_review_at) return true;
            return new Date(c.next_review_at) <= now;
        });

        // 2. New Cards: Up to deck-specific or global limit
        const deck = get().decks.find(d => d.id === deckId);
        const newCardsLimit = deck?.daily_new_limit ?? get().dailyNewLimit;
        const newCards = allDeckCards.filter(c => c.status === 'new').slice(0, newCardsLimit);

        set({ currentCards: [...dueCards, ...newCards] });
    } catch (error) {
        console.error('Failed to load cards', error);
    } finally {
        set({ isLoading: false });
    }
  },

  loadAllCards: async () => {
    set({ isLoading: true });
    try {
      const cards = await DataService.getAllCards();
      set({ allCards: cards });
    } catch (error) {
      console.error('Failed to load all cards', error);
    } finally {
      set({ isLoading: false });
    }
  },

  setDailyLimit: (limit: number) => {
    set({ dailyNewLimit: limit });
  },

  updateCardSRS: async (id: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
      const card = get().allCards.find(c => c.id === id) || get().currentCards.find(c => c.id === id);
      if (!card) return;

      const currentInterval = card.interval ?? 0;
      const currentEase = card.ease_factor ?? 2.5;

      let nextInterval = 0;
      let nextEase = currentEase;
      let nextStatus = card.status;

      switch (rating) {
          case 'again':
              nextInterval = 0;
              nextEase = Math.max(1.3, currentEase - 0.2);
              nextStatus = 'learning';
              break;
          case 'hard':
              nextInterval = currentInterval === 0 ? 1 : currentInterval * 1.2;
              nextEase = Math.max(1.3, currentEase - 0.15);
              nextStatus = 'learning';
              break;
          case 'good':
              nextInterval = currentInterval === 0 ? 1 : (currentInterval === 1 ? 3 : currentInterval * currentEase);
              nextStatus = 'review';
              break;
          case 'easy':
              nextInterval = currentInterval === 0 ? 4 : (currentInterval === 1 ? 7 : currentInterval * currentEase * 1.3);
              nextEase = currentEase + 0.15;
              nextStatus = 'mastered';
              break;
      }

      // Sanity check: prevent NaN, Infinity, or extreme values
      if (isNaN(nextInterval) || !isFinite(nextInterval)) nextInterval = 0;
      if (isNaN(nextEase) || !isFinite(nextEase)) nextEase = 2.5;

      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + Math.ceil(nextInterval));

      const updateData = {
          status: nextStatus as Card['status'],
          interval: nextInterval,
          ease_factor: nextEase,
          next_review_at: nextReviewDate.toISOString()
      };

      try {
          await DataService.updateCardSRS(id, updateData);
          const updateLocal = (cards: Card[]) => cards.map(c => c.id === id ? { ...c, ...updateData } : c);
          set({ 
              allCards: updateLocal(get().allCards),
              currentCards: updateLocal(get().currentCards)
          });
      } catch (e) {
          console.error("SRS Update failed", e);
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

  updateDeck: async (id: string, deckData: Partial<Deck>) => {
    try {
      await DataService.updateDeck(id, deckData);
      set({
        decks: get().decks.map(d => d.id === id ? { ...d, ...deckData } : d)
      });
    } catch (e) {
      console.error('Failed to update deck', e);
    }
  },

  addCard: async (card: Omit<Card, 'id' | 'created_at'>) => {
    try {
      await DataService.createCard(card);
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

    supabase.auth.onAuthStateChange(async (_event, session) => {
      const previousSession = get().session;
      set({ session });
      
      if (session && !previousSession) {
        await MigrationService.migrateLocalDataToSupabase();
        get().loadDecks();
      } else if (!session && previousSession) {
        set({ decks: [], currentCards: [] });
        get().loadDecks();
      }
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
  }
}));
