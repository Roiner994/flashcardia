import { create } from 'zustand';
import { createAuthSlice } from './slices/createAuthSlice';
import { createCardsSlice } from './slices/createCardsSlice';
import { createDecksSlice } from './slices/createDecksSlice';
import { createReviewSlice } from './slices/createReviewSlice';
import { createSettingsSlice } from './slices/createSettingsSlice';
import { StoreState } from './types';

// Export StoreState so types are available to consumers
export type { StoreState } from './types';

export const useStore = create<StoreState>((...a) => ({
  ...createAuthSlice(...a),
  ...createSettingsSlice(...a),
  ...createDecksSlice(...a),
  ...createCardsSlice(...a),
  ...createReviewSlice(...a),
}));
