import { DataService } from '@services/DataService';
import { Deck } from '@types';
import { StateCreator } from 'zustand';
import { DecksSlice, StoreState } from '../types';

export const createDecksSlice: StateCreator<
    StoreState,
    [],
    [],
    DecksSlice
> = (set, get) => ({
    decks: [],

    loadDecks: async () => {
        // Note: isLoading is managed in createSettingsSlice, but here we can't easily access
        // set({ isLoading: true }) without explicitly being part of that slice.
        // However, Zustand's set merges state, so we can set any property of StoreState.
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

    createDeck: async (title: string) => {
        try {
            await DataService.createDeck(title);
            await get().loadDecks();
        } catch (error) {
            console.error('Failed to create deck', error);
            throw error;
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

    deleteDeck: async (id: string) => {
        try {
            await DataService.deleteDeck(id);
            await get().loadDecks();
        } catch (e) {
            console.error(e);
        }
    },
});
