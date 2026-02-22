import { DataService } from '@services/DataService';
import { Card } from '@types';
import { StateCreator } from 'zustand';
import { CardsSlice, StoreState } from '../types';

export const createCardsSlice: StateCreator<
    StoreState,
    [],
    [],
    CardsSlice
> = (set, get) => ({
    currentCards: [],
    allCards: [],
    isCardsLoading: false,

    loadCards: async (deckId: string) => {
        set({ isCardsLoading: true });
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
            set({ isCardsLoading: false });
        }
    },

    loadAllCards: async () => {
        set({ isCardsLoading: true });
        try {
            const cards = await DataService.getAllCards();
            set({ allCards: cards });
        } catch (error) {
            console.error('Failed to load all cards', error);
        } finally {
            set({ isCardsLoading: false });
        }
    },

    addCard: async (card: Omit<Card, 'id' | 'created_at'>) => {
        try {
            await DataService.createCard(card);

            // Forcefully refetch all cards from the database to ensure 100% accurate synchronization
            await get().loadAllCards();

            // If we are currently viewing this deck's due cards, reload them
            if (get().currentCards.length > 0 && get().currentCards[0].deck_id === card.deck_id) {
                await get().loadCards(card.deck_id);
            }
        } catch (error) {
            console.error('Failed to add card', error);
            throw error;
        }
    },
});
