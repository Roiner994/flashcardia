import { Session } from '@supabase/supabase-js';
import { Card, Deck } from '../types';

export interface AuthSlice {
    session: Session | null;
    checkSession: () => Promise<void>;
    signOut: () => Promise<void>;
    updateProfile: (updates: { full_name?: string; avatar_url?: string }) => Promise<void>;
    updatePassword: (password: string) => Promise<void>;
}

export interface SettingsSlice {
    isLoading: boolean;
    dailyNewLimit: number;
    themeMode: 'light' | 'dark' | 'system';
    setDailyLimit: (limit: number) => void;
    setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
    loadSettings: () => Promise<void>;
}

export interface DecksSlice {
    decks: Deck[];
    loadDecks: () => Promise<void>;
    createDeck: (title: string) => Promise<void>;
    updateDeck: (id: string, deckData: Partial<Deck>) => Promise<void>;
    deleteDeck: (id: string) => Promise<void>;
}

export interface CardsSlice {
    currentCards: Card[];
    allCards: Card[];
    loadCards: (deckId: string) => Promise<void>;
    loadAllCards: () => Promise<void>;
    addCard: (card: Omit<Card, 'id' | 'created_at'>) => Promise<void>;
}

export interface ReviewSlice {
    updateCardSRS: (id: string, rating: 'again' | 'hard' | 'good' | 'easy') => Promise<void>;
}

export type StoreState = AuthSlice & SettingsSlice & DecksSlice & CardsSlice & ReviewSlice;
