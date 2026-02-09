import { StreakService } from '@services/StreakService';
import { StateCreator } from 'zustand';
import { StoreState, StreakSlice } from '../types';

export const createStreakSlice: StateCreator<
    StoreState,
    [],
    [],
    StreakSlice
> = (set, get) => ({
    profile: null,

    loadProfile: async (userId: string) => {
        const profile = await StreakService.getStreak(userId);
        if (profile) {
            set({ profile });
        }
    },

    checkStreak: async (userId: string) => {
        const result = await StreakService.checkAndIncrementStreak(userId);
        if (result) {
            set(state => ({
                profile: state.profile ? {
                    ...state.profile,
                    current_streak: result.current_streak,
                    longest_streak: result.longest_streak,
                    streak_shields_count: result.streak_shields,
                    last_completed_date: new Date().toISOString() // Or result.updatedAt if service returned it
                } : null
            }));

            return {
                celebration: result.celebration,
                shieldUsed: result.shield_used,
                current_streak: result.current_streak
            };
        }
        return null;
    }
});
