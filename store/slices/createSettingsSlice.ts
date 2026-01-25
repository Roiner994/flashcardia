import AsyncStorage from '@react-native-async-storage/async-storage';
import { StateCreator } from 'zustand';
import { SettingsSlice, StoreState } from '../types';

export const createSettingsSlice: StateCreator<
    StoreState,
    [],
    [],
    SettingsSlice
> = (set, get) => ({
    isLoading: false,
    dailyNewLimit: 10,
    themeMode: 'system',

    setDailyLimit: (limit: number) => {
        set({ dailyNewLimit: limit });
        AsyncStorage.setItem('daily_new_limit', limit.toString());
    },

    setThemeMode: (mode: 'light' | 'dark' | 'system') => {
        set({ themeMode: mode });
        AsyncStorage.setItem('theme_mode', mode);
    },

    loadSettings: async () => {
        try {
            const [limit, theme] = await Promise.all([
                AsyncStorage.getItem('daily_new_limit'),
                AsyncStorage.getItem('theme_mode'),
            ]);

            set({
                dailyNewLimit: limit ? parseInt(limit, 10) : 10,
                themeMode: (theme as 'light' | 'dark' | 'system') || 'system',
            });
        } catch (error) {
            console.error('Failed to load settings', error);
        }
    },
});
