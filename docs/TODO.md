# Future Improvements & TODOs

## Immediate Tasks
- [x] **Testing:** Add Unit and Integration tests (Jest/React Testing Library).
    - [x] Test `gameReducer` logic (win conditions, damage calc).
    - [x] Test `BattleArena` component rendering.
- [x] **Error Handling:** Improve UI feedback when AniList API fails (currently logs to console).
- [x] **Performance:** Optimize `BattleArena` re-renders.

## Features (Roadmap)
- [x] **Deck Builder:** Allow users to search and build their own custom deck before battle.
- [ ] **Multiplayer:** Implement real-time PvP.
    <!-- Reason: Pure frontend multiplayer isn't possible without a signaling server. Using managed services (Pusher/Firebase) avoids building a custom backend. -->
    - [ ] **Tech Stack:** Use a managed service (Pusher or Firebase) to avoid custom backend infrastructure. (Target Free Tiers)
    - [ ] **Lobby System:** Create/Join rooms via unique codes.
    - [ ] **Game Sync:** Broadcast actions (play card, attack) to update opponent's UI.
- [ ] **Advanced AI:** Implement Minimax or more strategic AI instead of random choices.
- [x] **Persistance:** Save game state to LocalStorage to resume later.
- [ ] **Mobile Optimization:** Improve UI scaling for mobile devices (currently optimized for desktop/tablet).
- [ ] **Elemental Types:** Add Rock-Paper-Scissors mechanics (e.g., Fire beats Grass) based on character traits.

## Technical Debt
- [ ] **Refactor AI:** Move AI logic out of `BattleArena.tsx` (UI) and into a custom hook or service.
- [ ] **Strict Typing:** Ensure all `any` types (if any) are removed.
- [ ] **Constants:** Move magic numbers (HP caps, damage multipliers) to a central config file.
