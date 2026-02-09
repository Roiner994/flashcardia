import { supabase } from '@lib/supabase';
import { differenceInCalendarDays, subMinutes } from 'date-fns';

export interface StreakResult {
    current_streak: number;
    longest_streak: number;
    streak_shields: number;
    celebration: boolean; // True if streak increased
    shield_used: boolean;
}

export const StreakService = {
    async getOrCreateProfile(userId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error && error.code === 'PGRST116') {
            // Profile doesn't exist, create it
            const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert([{ id: userId }])
                .select()
                .single();

            if (createError) {
                console.error("Failed to create profile", createError);
                throw createError;
            }
            return newProfile;
        }

        if (error) throw error;
        return data;
    },

    /**
     * Updates the user's streak based on activity completion.
     * Uses a 30-minute grace period (activity before 12:30 AM counts for previous day).
     */
    async checkAndIncrementStreak(userId: string): Promise<StreakResult | null> {
        if (!userId) return null;

        try {
            // 1. Get (or create) current profile
            const profile = await this.getOrCreateProfile(userId);

            const now = new Date();
            // Grace Period: If it's 00:00 - 00:30, count as yesterday
            // We use "Virtual Date" to determine which day this activity belongs to.
            const virtualDate = subMinutes(now, 30);

            const lastDate = profile.last_completed_date ? new Date(profile.last_completed_date) : null;

            // Calculate Day Difference based on Local Time (Client) perspective
            // Since we can't easily know user's timezone on server without passing it, 
            // we'll rely on the fact that 'virtualDate' is generated on the client device (if this runs on client).
            // NOTE: date-fns differenceInCalendarDays compares local dates if passed Date objects.

            let dayDiff = lastDate ? differenceInCalendarDays(virtualDate, lastDate) : 1;

            // Initialize result
            let newStreak = profile.current_streak;
            let newLongest = profile.longest_streak;
            let newShields = profile.streak_shields_count;
            let celebration = false;
            let shieldUsed = false;

            if (!lastDate) {
                // First ever activity
                newStreak = 1;
                newLongest = 1;
                celebration = true;
            } else if (dayDiff === 0) {
                // Already completed today (or virtual today)
                // No change
                return {
                    current_streak: newStreak,
                    longest_streak: newLongest,
                    streak_shields: newShields,
                    celebration: false,
                    shield_used: false
                };
            } else if (dayDiff === 1) {
                // Consecutive day
                newStreak += 1;
                celebration = true;
            } else {
                // Missed day(s) -> Check Shields
                if (newShields > 0) {
                    // Use a shield
                    newShields -= 1;
                    shieldUsed = true;
                    // Streak continues incrementing because shield saved the gap
                    newStreak += 1;
                    celebration = true;
                } else {
                    // No shields -> Reset
                    newStreak = 1;
                    celebration = true; // Started new streak
                }
            }

            // Update Longest
            if (newStreak > newLongest) {
                newLongest = newStreak;
            }

            // 2. Perform Update
            const updates = {
                current_streak: newStreak,
                longest_streak: newLongest,
                streak_shields_count: newShields,
                last_completed_date: virtualDate.toISOString(),
            };

            const { error: updateError } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId);

            if (updateError) throw updateError;

            return {
                current_streak: newStreak,
                longest_streak: newLongest,
                streak_shields: newShields,
                celebration,
                shield_used: shieldUsed
            };

        } catch (error) {
            console.error('Streak update failed:', error);
            return null;
        }
    },

    async getStreak(userId: string) {
        try {
            return await this.getOrCreateProfile(userId);
        } catch (e) {
            console.error("Error getting streak:", e);
            return null;
        }
    }
};
