import { DataService } from '@services/DataService';
import { calculateSRS } from '@services/SRSCalculator';
import { Card } from '@types';
import { StateCreator } from 'zustand';
import { ReviewSlice, StoreState } from '../types';

export const createReviewSlice: StateCreator<
    StoreState,
    [],
    [],
    ReviewSlice
> = (set, get) => ({
    updateCardSRS: async (id: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
        const card = get().allCards.find(c => c.id === id) || get().currentCards.find(c => c.id === id);
        if (!card) return;

        const updateData = calculateSRS(card, rating);

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
});
