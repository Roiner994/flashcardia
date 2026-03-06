import AsyncStorage from '@react-native-async-storage/async-storage';
import { StateCreator } from 'zustand';
import { SettingsSlice, StoreState } from '../types';

export const createSettingsSlice: StateCreator<
    StoreState,
    [],
    [],
    SettingsSlice
> = (set, get) => ({
    dailyNewLimit: 10,
    themeMode: 'light',

    hasSeenOnboarding: false,

    setDailyLimit: (limit: number) => {
        set({ dailyNewLimit: limit });
        AsyncStorage.setItem('daily_new_limit', limit.toString());
    },

    setThemeMode: (mode: 'light' | 'dark' | 'system') => {
        set({ themeMode: mode });
        AsyncStorage.setItem('theme_mode', mode);
    },

    completeOnboarding: async () => {
        set({ hasSeenOnboarding: true });
        await AsyncStorage.setItem('has_seen_onboarding', 'true');
    },

    loadSettings: async () => {
        try {
            const [limit, theme, onboarded] = await Promise.all([
                AsyncStorage.getItem('daily_new_limit'),
                AsyncStorage.getItem('theme_mode'),
                AsyncStorage.getItem('has_seen_onboarding'),
            ]);

            set({
                dailyNewLimit: limit ? parseInt(limit, 10) : 10,
                themeMode: (theme as 'light' | 'dark' | 'system') || 'light',
                hasSeenOnboarding: onboarded === 'true',
            });
        } catch (error) {
            console.error('Failed to load settings', error);
        }
    },
});
