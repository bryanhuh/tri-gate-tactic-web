# Game Persistence Feature

## Overview
The Persistence feature allows users to close the browser tab or refresh the page without losing their current battle progress. The active game state is automatically saved to the browser's `localStorage` and can be resumed from the main menu.

## Implementation Details

### State Management
- **Key:** `anime-battle-state`
- **Format:** JSON serialization of the `GameState` object.
- **Auto-Save:** The game state is saved automatically whenever the state changes during the `reveal` (Opponent Reveal) or `battle` phases.
- **Cleanup:** The save file is automatically removed when the `game-over` phase is reached (Win or Loss).

### Components

#### `hooks/useBattle.ts`
- **`resumeGame` Action:** Dispatches `LOAD_GAME` to the reducer with the hydrated state.
- **Persistence Effect:** A `useEffect` hook monitors the `state` and writes to `localStorage` if the phase is active.

#### `Showcase.tsx` (Main Menu)
- Detects if a save exists on mount using `localStorage.getItem('anime-battle-state')`.
- Displays a **"RESUME BATTLE"** button if a valid save is found.

#### `app/page.tsx`
- Handles the resume logic by parsing the stored JSON and calling `actions.resumeGame()`.

## Usage
1. Start a battle.
2. At any point during the fight, you can leave the page.
3. Return to the home page.
4. Click **"RESUME BATTLE"** to continue exactly where you left off.
