import { Card } from '@types';

export interface SRSResult {
    status: Card['status'];
    interval: number;
    ease_factor: number;
    next_review_at: string;
}

/**
 * SM-2 inspired spaced repetition algorithm.
 * Pure function — no side effects, easy to unit test.
 */
export function calculateSRS(card: Card, rating: 'again' | 'hard' | 'good' | 'easy'): SRSResult {
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

    return {
        status: nextStatus as Card['status'],
        interval: nextInterval,
        ease_factor: nextEase,
        next_review_at: nextReviewDate.toISOString(),
    };
}
