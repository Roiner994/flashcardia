import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { DataService } from './DataService';

const MIGRATION_FLAG_KEY = 'migration_completed';

export const MigrationService = {
  async migrateLocalDataToSupabase() {
    try {
      // Check if migration has already been completed
      const alreadyMigrated = await AsyncStorage.getItem(MIGRATION_FLAG_KEY);
      if (alreadyMigrated === 'true') return;

      const localDecks = await DataService.getLocalDecks();
      const localCards = await DataService.getAllLocalCards();

      if (localDecks.length === 0) {
        // No data to migrate, mark as complete
        await AsyncStorage.setItem(MIGRATION_FLAG_KEY, 'true');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Migrate Decks (upsert to handle re-runs)
      const decksToInsert = localDecks.map(d => ({
        ...d,
        user_id: user.id,
      }));

      const { error: deckError } = await supabase
        .from('decks')
        .upsert(decksToInsert, { onConflict: 'id' });
      if (deckError) {
        console.error('Migration Deck Error', deckError);
        throw deckError;
      }

      // 2. Migrate Cards (upsert to handle re-runs)
      if (localCards.length > 0) {
        const cardsToInsert = localCards.map(c => ({ ...c }));

        const { error: cardError } = await supabase
          .from('cards')
          .upsert(cardsToInsert, { onConflict: 'id' });
        if (cardError) throw cardError;
      }

      // 3. Mark migration as complete and clear local data
      await AsyncStorage.setItem(MIGRATION_FLAG_KEY, 'true');
      await DataService.clearLocalData();

    } catch (error) {
      console.error('Migration failed:', error);
    }
  }
};
