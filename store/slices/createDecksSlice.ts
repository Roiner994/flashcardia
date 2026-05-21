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
    isDecksLoading: false,

    loadDecks: async () => {
        set({ isDecksLoading: true });
        try {
            const decks = await DataService.getDecks();
            set({ decks });
        } catch (error) {
            console.error('Failed to load decks', error);
        } finally {
            set({ isDecksLoading: false });
        }
    },

    createDeck: async (title: string, isPublic?: boolean) => {
        try {
            await DataService.createDeck(title, isPublic);
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
