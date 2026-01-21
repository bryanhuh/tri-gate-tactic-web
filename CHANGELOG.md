# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Deck Builder:** A new dedicated interface for searching and selecting characters.
  - Integration with AniList API for real-time character search.
  - "Squad Roster" view with stat analysis (Average HP, Power, Defense).
  - Persistence using `localStorage` to save custom teams between sessions.
  - Direct "Initialize Battle" flow that skips random selection when a custom deck is ready.
- **UI/UX Enhancements:**
  - Glassmorphism design for the Deck Builder interface.
  - Background video integration for a more immersive "anime" vibe.
  - Sound effects and background music support in the builder.
  - Responsive grid layout for search results.
- **Game Persistence:**
  - Auto-save functionality for active battles using `localStorage`.
  - "Resume Battle" option on the main menu to restore interrupted games.
  - Updates to `useBattle` hook to handle state hydration.

### Changed
- **Character Selection:** Redesigned the character selection screen to match the "game vibe" of the Deck Builder.
    - Added background video and ambient audio.
    - Implemented glassmorphism UI with neon accents.
    - Improved animations for card interactions and transitions.
- **Showcase Component (`app/page.tsx`):**
  - Completely redesigned for a premium "Game Vibe".
  - Added entrance animations using `framer-motion`.
  - Implemented stylized "Cyberpunk" buttons with slanted edges (`clip-path`) and hover glitch effects.
  - Added a retro-futuristic grid overlay and dynamic ambient background.
  - Improved "Play Now", "Resume", and "Deck Builder" call-to-action visibility.
- **Home Page (`app/page.tsx`):** Added logic to detect `anime-battle-ready-to-play` flag and auto-start battles with the saved deck.
- **Showcase Component:** Updated the main menu to include a link to the Deck Builder.
- **AniList Service:** Added `searchCharacters` function to support paginated search queries.

### Fixed
- **Linting:** Resolved strict type issues in `anilist-service` and hook dependency warnings in `DeckBuilder`.
- Resolved type mismatch issues in `useBattle` hook regarding optional attackers.

## [0.1.0] - 2026-01-20
### Initial Release
- Core Battle Arena mechanics (Turn-based system, HP, Attacking).
- Random Character Selection.
- AniList API Integration for fetching single characters.
- Basic Win/Loss states.
