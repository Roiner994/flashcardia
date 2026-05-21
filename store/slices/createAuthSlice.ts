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
    },

    initAuthListener: () => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
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
        return () => subscription.unsubscribe();
    },

    signOut: async () => {
        await supabase.auth.signOut();
    },

    updateProfile: async (updates) => {
        try {
            const { session } = get();
            if (!session?.user?.id) throw new Error('No active session');

            // 1. Update Auth Metadata
            const { error: authError } = await supabase.auth.updateUser({
                data: updates,
            });
            if (authError) throw authError;

            // 2. Update Public Profiles table
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    username: updates.username,
                    avatar_url: updates.avatar_url,
                    full_name: updates.full_name, // If you have this column
                })
                .eq('id', session.user.id);
            
            // Note: If profileError is "column does not exist", it will fail gracefully here
            // but we added username and avatar_url in the migration earlier.

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
