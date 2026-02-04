import { supabase } from '@lib/supabase';
import { MigrationService } from '@services/MigrationService';
import { StateCreator } from 'zustand';
import { AuthSlice, StoreState } from '../types';

export const createAuthSlice: StateCreator<
    StoreState,
    [],
    [],
    AuthSlice
> = (set, get) => ({
    session: null,

    checkSession: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        set({ session });

        supabase.auth.onAuthStateChange(async (_event, session) => {
            const previousSession = get().session;
            set({ session });

            if (session && !previousSession) {
                await MigrationService.migrateLocalDataToSupabase();
                get().loadDecks();
            } else if (!session && previousSession) {
                set({ decks: [], currentCards: [] });
                get().loadDecks();
            }
        });
    },

    signOut: async () => {
        await supabase.auth.signOut();
    },

    updateProfile: async (updates) => {
        try {
            const { error } = await supabase.auth.updateUser({
                data: updates,
            });
            if (error) throw error;
            await get().checkSession();
        } catch (error) {
            console.error('Failed to update profile', error);
            throw error;
        }
    },

    updatePassword: async (password) => {
        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });
            if (error) throw error;
        } catch (error) {
            console.error('Failed to update password', error);
            throw error;
        }
    },
});
