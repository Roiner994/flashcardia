import { DataService } from './DataService';
import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';

export const MigrationService = {
  async migrateLocalDataToSupabase() {
    try {
      const localDecks = await DataService.getLocalDecks();
      const localCards = await DataService.getAllLocalCards();

      if (localDecks.length === 0) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Migrate Decks
      // usage of Promise.all for parallel insertion or sequential loop
      // We need to map local IDs to new remote IDs if we want to rely on DB gen, 
      // OR we just use the UUIDs we generated locally if Supabase table is configured to accept them.
      // Standard Supabase: id is usually default uuid_generate_v4().
      // If we insert 'id', it works if constraints allow.
      // Let's retry inserting with the same IDs to preserve relationships.
      
      const decksToInsert = localDecks.map(d => ({
        ...d,
        user_id: user.id, // Assign ownership
      }));

      const { error: deckError } = await supabase.from('decks').insert(decksToInsert);
      if (deckError) {
        console.error('Migration Deck Error', deckError);
        // Fallback: If ID conflict, maybe we should just create new entries? 
        // For MVP, we assume no conflict or we accept fail.
        throw deckError;
      }

      // 2. Migrate Cards
      // If we kept deck IDs, we can keep card deck_ids.
      if (localCards.length > 0) {
        const cardsToInsert = localCards.map(c => ({
          ...c,
          // user_id might not be on card if it relies on deck ownership, 
          // but if RLS requires it, we might need it. 
          // Our Type definition didn't have user_id on Card.
        }));
        
        const { error: cardError } = await supabase.from('cards').insert(cardsToInsert);
        if (cardError) throw cardError;
      }

      // 3. Clear Local
      await DataService.clearLocalData();
      // Alert.alert('Success', 'Local data synced to cloud!'); 
      
    } catch (error) {
      console.error('Migration failed:', error);
      // Alert.alert('Migration Failed', 'Could not sync local data.');
    }
  }
};
