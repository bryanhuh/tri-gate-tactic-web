# Deck Builder Feature Plan

## Objective
Create a "Deck Builder" interface allowing users to search for anime characters via the AniList API, view their generated game stats, and assemble a custom deck of characters to use in battle.

## Core Features

1.  **Character Search:**
    -   Real-time (debounced) search against the AniList API.
    -   Display search results with character images and names.
    -   Ability to view generated game stats (HP, Power, Tier, etc.) before adding to the deck.

2.  **Deck Management:**
    -   Visual representation of the current deck.
    -   Add characters from search results.
    -   Remove characters from the deck.
    -   Deck Constraints:
        -   Minimum cards: 5
        -   Maximum cards: 10 (or 15?)
        -   Duplicate limit: Unique characters only (by ID).

3.  **Persistence (MVP):**
    -   Save the created deck to `localStorage`.
    -   Load the custom deck when starting a new battle.

4.  **Navigation:**
    -   Accessible from the main menu.
    -   "Start Battle" button in the Deck Builder to launch the game with the current deck.

## UI/UX Design

### Layout
-   **Split Screen / Two Columns:**
    -   **Left/Top Panel (Search & Discovery):** Search bar, results grid.
    -   **Right/Bottom Panel (My Deck):** Current deck slots, stat summary (Average Tier, etc.), "Start Game" button.

### Components
-   `DeckBuilder` (Page/Container): Manages state (search query, results, current deck).
-   `CharacterSearch`: Input field with debounce.
-   `SearchResults`: Grid of `Card` components (reusing existing `Card.tsx` if possible, or a simplified version).
-   `DeckSlot`: Droppable area or list for selected cards.
-   `StatPreview`: Modal or tooltip showing the calculated stats for a character.

## Technical Architecture

### 1. AniList Service Updates (`lib/anilist-service.ts`)
-   **New Query:** Implement a `searchCharacters` function using the AniList `Page` query to return multiple results, not just a single match.
-   **Stat Preview:** Expose the logic to calculate stats *without* finalizing the `GameCharacter` object (or just create them on the fly).

### 2. State Management
-   Local state within `DeckBuilder` for the drafting phase.
-   `localStorage` for saving the final deck.
-   Update `useGame` or `BattleArena` initialization to check for a custom deck or passed-in deck.

### 3. Routing
-   New Route: `/deck-builder`
-   Update `app/page.tsx` to include a link to the Deck Builder.

## Implementation Steps

### Phase 1: Service & Data
1.  [x] Update `lib/anilist-service.ts` to add `searchCharacters(query: string)` function.
2.  [x] Verify stat generation works for search results.

### Phase 2: UI Implementation
3.  [x] Create `app/deck-builder/page.tsx`.
4.  [x] Build `CharacterSearch` component.
5.  [x] Build `DeckView` component.
6.  [x] Implement Add/Remove logic.

### Phase 3: Integration
7.  [x] Save deck to `localStorage`.
8.  [x] Update Game Initialization to read from `localStorage` (or passed prop) instead of generating a random deck.
9.  [x] Add "Build Deck" button to Main Menu (`app/page.tsx`).

### Phase 4: Polish
10. [x] Add Loading states for search.
11. [x] Add Error handling for empty search results.
12. [x] Visual polish (animations when adding/removing cards).
