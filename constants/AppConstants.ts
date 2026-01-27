export const CARD_STATUS = {
    NEW: 'new',
    LEARNING: 'learning',
    REVIEW: 'review',
    MASTERED: 'mastered',
} as const;

export type CardStatus = typeof CARD_STATUS[keyof typeof CARD_STATUS];

export const CHALLENGE_DIFFICULTY = {
    EASY: 'easy',
    HARD: 'hard',
} as const;

export type ChallengeDifficulty = typeof CHALLENGE_DIFFICULTY[keyof typeof CHALLENGE_DIFFICULTY];

export const SRS_RATING = {
    AGAIN: 'again',
    HARD: 'hard',
    GOOD: 'good',
    EASY: 'easy',
} as const;

export type SRSRating = typeof SRS_RATING[keyof typeof SRS_RATING];

export const ROUTES = {
    CHALLENGE_SETUP: '/challenge/setup',
    CHALLENGE_ACTIVE: '/challenge/active',
    REVIEW_SESSION: (id: string) => `/review/${id}` as const,
    DECK_DETAILS: (id: string) => `/deck/${id}` as const,
    DECK_CARDS: (id: string) => `/deck/${id}/cards` as const,
    AUTH_LOGIN: '/(auth)/login',
    CHANGE_PASSWORD: '/change-password',
} as const;
