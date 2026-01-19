# System Architecture

## Tech Stack
-   **Framework:** Next.js 16 (App Router)
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS + Framer Motion (for animations)
-   **State Management:** React `useReducer` + Custom Hooks
-   **Icons:** Lucide React
-   **Data Source:** AniList GraphQL API

## Project Structure

```
├── app/                  # Next.js App Router pages and layout
│   ├── types/            # App-specific types
│   └── page.tsx          # Main entry point (Game Controller)
├── components/           # React Components
│   ├── ui/               # Reusable UI elements (PlayerUI, OpponentUI)
│   ├── BattleArena.tsx   # Main game board and visual logic
│   ├── Card.tsx          # Card display component
│   └── ...
├── hooks/                # Game Logic Hooks
│   ├── useBattle.ts      # Action dispatcher and async logic
│   └── useGame.ts        # Reducer and core state mutations
├── lib/                  # Services and Utilities
│   └── anilist-service.ts # API client for fetching characters
└── types/                # Shared TypeScript definitions
```

## State Management (`useGame.ts`)
The game state is a complex object managed by a reducer function.

**Core State (`GameState`):**
-   `phase`: 'setup' | 'reveal' | 'battle' | 'game-over'
-   `turn`: 'player' | 'opponent'
-   `player` / `opponent`: Contains `hp`, `hand`, `field` (array of 3), `deck`, `graveyard`.
-   `battleLog`: Array of strings for the UI log.

**Action Flow:**
1.  UI components (e.g., `BattleArena`) trigger actions via `useBattle` hook.
2.  `useBattle` handles async operations (like `drawWildcard` fetching data).
3.  `useBattle` dispatches plain objects to `gameReducer` in `useGame.ts`.
4.  `gameReducer` computes the new state (pure function).

## Data Integration (`anilist-service.ts`)
-   Fetches character data from [AniList GraphQL API](https://graphql.anilist.co).
-   **Normalization:** Converts raw API response into `GameCharacter` objects.
-   **Stats Generation:** Heuristic algorithm converts popularity (`favourites`) and score (`meanScore`) into game stats (HP, Power, etc.).
-   **Caching:** Implements a simple request queue to respect API rate limits.

## AI Logic
The opponent AI is currently implemented within `BattleArena.tsx` inside a `useEffect`.
-   **Behavior:** Reactive/Random.
-   **Decision Tree:**
    1.  **Wildcard Check:** If low on cards, draw wildcard.
    2.  **Summon:** If field has empty slot and hand has cards, play a card.
    3.  **Attack:** If capable of attacking, choose a random target.
    4.  **End Turn:** If no actions available.
