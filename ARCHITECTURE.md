# Project Architecture & Development Guidelines

These guidelines reflect the architectural standards established during the "Magic Deck AI" refactor. Follow these rules for all future feature development to maintain codebase consistency, scalability, and modularity.

## 1. State Management (Zustand)

- **Modular Slices**: Do not add state directly to `useStore.ts`. Instead, create a new slice in `store/slices/create[Feature]Slice.ts`.
- **Combined Store**: Import and spread the new slice in `store/useStore.ts`.
- **Types**: Define the slice interface in `store/types.ts` and export it.

**Example Pattern:**

```typescript
// store/slices/createExampleSlice.ts
export const createExampleSlice: StateCreator<StoreState, [], [], ExampleSlice> = (set, get) => ({ ... });
```

## 2. Component Organization

- **Feature-Based Directories**: Group components by their specific feature domain inside `components/`.
  - `components/deck/`
  - `components/review/`
  - `components/home/`
- **Generic UI**: Only truly reusable, generic components (buttons, inputs, layout wrappers) belong in `components/ui/`.
- **Colocation**: Keep related sub-components close to their parent feature folder.

## 3. Screen vs. Logic Separation

- **Screens are Views**: Screen components (in `app/`) should strictly handle layout and rendering. They should contain **minimal logic**.
- **Hooks for Logic**: Complex business logic, state handling, and side effects must be extracted into custom hooks in `hooks/`.

**Example:**

- `app/review/[id].tsx` (View) -> uses `useReviewSession.ts` (Logic) -> renders `ReviewCard.tsx` (Component).

## 4. Styling & Theming

- **Themed Styles**: Always use the `useTheme()` hook to access colors. Do not hardcode hex values.
- **Memoized Styles**: Wrap `StyleSheet.create` in `useMemo` if it depends on the theme dynamic values, or pass colors to a factory function.

```typescript
const colors = useTheme();
const styles = useMemo(() => createStyles(colors), [colors]);
```

## 5. TypeScript

- **Strict Typing**: Avoid `any`. Define interfaces for all component props and store slices.
- **Shared Types**: Domain entities (e.g., `Deck`, `Card`) should be exported from `store/types.ts` or a dedicated `types/` directory if they grow too large.

## 6. File Naming Conventions

- **React Components** (`.tsx`): Use **PascalCase**. The file name should match the component name.
  - ✅ `DeckList.tsx`, `ReviewCard.tsx`
  - ❌ `deckList.tsx`, `deck-list.tsx`
- **Hooks & Logic** (`.ts/tsx`): Use **camelCase**.
  - ✅ `useReviewSession.ts`, `createAuthSlice.ts`
- **Expo Routes / Screens** (`app/**/*.tsx`): Use **kebab-case**. This ensures URLs are clean and readable.
  - ✅ `change-password.tsx`, `user-profile.tsx`
  - ❌ `ChangePassword.tsx`
- **Constants / Config** (`.ts`): Use **camelCase** (or PascalCase if it's a class/singleton).
  - ✅ `colors.ts`, `constants.ts`
