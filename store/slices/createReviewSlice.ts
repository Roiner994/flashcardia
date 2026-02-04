import { DataService } from '@services/DataService';
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
});
