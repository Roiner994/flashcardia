import { DataService } from '@services/DataService';
import { Card } from '@types';
import { StateCreator } from 'zustand';
import { CardsSlice, StoreState } from '../types';

const selectCurrentCards = (
    allDeckCards: Card[],
    deckId: string,
    get: () => StoreState,
) => {
    const now = new Date();

    const dueCards = allDeckCards.filter((card) => {
        if (card.status === 'new') return false;
        if (!card.next_review_at) return true;
        return new Date(card.next_review_at) <= now;
    });

    const deck = get().decks.find((item) => item.id === deckId);
    const newCardsLimit = deck?.daily_new_limit ?? get().dailyNewLimit;
    const newCards = allDeckCards
        .filter((card) => card.status === 'new')
        .slice(0, newCardsLimit);

    return [...dueCards, ...newCards];
};

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
            set({ currentCards: selectCurrentCards(allDeckCards, deckId, get) });
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
            const createdCard = await DataService.createCard(card);
            const previousAllCards = get().allCards.filter((item) => item.id !== createdCard.id);

            set({
                allCards: [createdCard, ...previousAllCards],
            });

            const deckCards = await DataService.getCards(card.deck_id);
            set({
                currentCards: selectCurrentCards(deckCards, card.deck_id, get),
            });
        } catch (error) {
            console.error('Failed to add card', error);
            throw error;
        }
    },

    updateCard: async (id: string, updates: Partial<Omit<Card, 'id' | 'created_at'>>) => {
        try {
            const updatedCard = await DataService.updateCard(id, updates);
            if (!updatedCard) return;

            const replaceCard = (cards: Card[]) =>
                cards.map((card) => (card.id === id ? updatedCard : card));

            set({
                allCards: replaceCard(get().allCards),
                currentCards: replaceCard(get().currentCards),
            });

            const deckCards = await DataService.getCards(updatedCard.deck_id);
            set({
                currentCards: selectCurrentCards(deckCards, updatedCard.deck_id, get),
            });
        } catch (error) {
            console.error('Failed to update card', error);
            throw error;
        }
    },
});
