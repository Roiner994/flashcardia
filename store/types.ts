# Task: Phase 1 - Store Refactoring

## Planning
    - [x] Create implementation plan for store refactoring
        - [x] Create new directory structure`store/slices`

## Implementation
    - [x] Create `store/types.ts` to consolidate store types
        - [] Create`store/slices/createAuthSlice.ts`
            - [] Create`store/slices/createSettingsSlice.ts`
                - [] Create`store/slices/createDecksSlice.ts`
                    - [] Create`store/slices/createCardsSlice.ts`
                        - [] Create`store/slices/createReviewSlice.ts`(SRS logic)
                            - [] Refactor `store/useStore.ts` to combine all slices

## Verification
    - [] meaningful Verification of app functionality(Add / Edit Deck, Add / Edit Card, Review Flow, Settings, Auth)
        - [] Verify no regressions in existing features
