# Future Improvements & TODOs

## Completed
- [x] **Testing:** Add Unit and Integration tests (Jest/React Testing Library).
    - [x] Test `gameReducer` logic (win conditions, damage calc).
    - [x] Test `BattleArena` component rendering.
- [x] **Error Handling:** Improve UI feedback when AniList API fails (currently logs to console).
- [x] **Performance:** Optimize `BattleArena` re-renders.
- [x] **Deck Builder:** Allow users to search and build their own custom deck before battle.
- [x] **Persistence:** Save game state to LocalStorage to resume later.

---

## 🐛 Bug Fixes (Critical)

- [x] **All Cards Exhaust On Single Attack:** In `useGame.ts`, when any card attacks, ALL player field cards get `hasAttacked = true`. Each card should track its own attack state independently so players can attack once per card per turn (up to 3 attacks with a full field).
    - File: `hooks/useGame.ts` → `ATTACK` case (lines ~239-241 and ~272-274)
- [x] **Hardcoded 1000 HP Max:** HP bar percentages in `PlayerUI.tsx` and `OpponentUI.tsx` hardcode `1000` as max HP. The game over screen also uses `1000 - opponent.hp`. These should reference a shared constant from a config file.
    - Files: `components/ui/PlayerUI.tsx`, `components/ui/OpponentUI.tsx`, `components/BattleArena.tsx`
- [x] **Damage Formula Too Simple:** `Damage = max(0, Attacker.Power - Target.Defense)` means any character with Defense ≥ opponent's Power takes 0 damage forever. Needs scaling or minimum damage.
    - File: `hooks/useGame.ts` → `ATTACK` case (line ~209)

---

## 🎮 Gameplay — Make Stats Matter

- [ ] **Implement Critical Hits (Skill stat):** `Skill / 200` = crit chance. Crits deal 1.5x damage. Makes the Skill stat functional and adds excitement/randomness.
    - File: `hooks/useGame.ts` → `ATTACK` case
- [ ] **Implement Turn Order (Speed stat):** Higher total Speed on field determines who goes first each round, or Speed determines attack order within a turn. Gives Speed actual value.
    - File: `hooks/useGame.ts` → `END_TURN` case
- [ ] **Elemental Types:** Add Rock-Paper-Scissors mechanics (e.g., Fire > Wind > Earth > Water > Fire) based on character traits. Type advantage = 1.5x damage, disadvantage = 0.75x.
    - Files: `types/game.ts`, `hooks/useGame.ts`, `components/Card.tsx`, `lib/anilist-service.ts`
- [ ] **Card Abilities / Special Moves:** Give higher-tier cards unique abilities (e.g., "Pierce: Ignore 50% defense", "Heal: Restore 50 HP", "Shield: Reduce next attack by 50%"). This is the #1 feature that makes card games addictive.
    - Files: `types/game.ts`, `hooks/useGame.ts`, `components/Card.tsx`, `components/BattleArena.tsx`
- [ ] **Energy / Mana System:** Limit actions per turn with a resource. Playing a card costs energy, attacking costs 1, abilities cost more. Forces meaningful choices per turn.
    - Files: `app/types/battle.ts`, `hooks/useGame.ts`, `components/BattleArena.tsx`

---

## 🎨 UI/UX — Polish & Quality of Life

- [ ] **Show HP on Field Cards:** During battle, cards on the field don't show their current HP. Players can't tell how close an enemy card is to dying. Add a mini HP bar or HP number overlay on field cards.
    - Files: `components/Card.tsx`, `components/BattleArena.tsx`
- [ ] **Attack Animations:** When a card attacks, animate it flying toward the target with impact particles. Currently attacks are invisible — just a log message appears.
    - File: `components/BattleArena.tsx`
- [ ] **Damage Numbers:** Float `-120` damage numbers above cards when they take damage. Standard card game UX pattern.
    - File: `components/BattleArena.tsx`
- [ ] **Sound Effects & Music:** Add attack slash, card summon whoosh, HP damage thud, victory fanfare, and background music. Zero audio currently exists.
    - Files: New `lib/audio-service.ts`, `components/BattleArena.tsx`, `components/CharacterSelection.tsx`
- [ ] **Interactive Tutorial:** First-time player walkthrough: "Click this card to select your attacker" → "Now click an enemy" → "Great! That's how you attack!" No onboarding currently exists.
    - Files: New `components/Tutorial.tsx`, `components/BattleArena.tsx`
- [ ] **Graveyard Viewer:** Click to see defeated cards with their final stats. Adds emotional weight to losses.
    - File: `components/BattleArena.tsx`
- [ ] **Deck Stats Summary:** In deck builder, show average tier, total power, type distribution chart to help players build balanced decks.
    - File: `components/deck-builder/DeckBuilder.tsx`
- [ ] **Forfeit / Surrender Button:** Let players concede instead of playing out a lost game.
    - Files: `components/BattleArena.tsx`, `hooks/useGame.ts`
- [ ] **Settings Menu:** Volume controls, animation speed toggle, theme options.
    - Files: New `components/Settings.tsx`, `app/page.tsx`
- [ ] **Mobile Optimization:** Battle arena uses fixed pixel dimensions (`w-[1200px] h-[800px]`) with 3D transforms. Cards go off-screen on mobile, hand overlaps field, sidebar covers board. Needs responsive layout and touch-friendly interactions.
    - Files: `components/BattleArena.tsx`, `components/ui/PlayerUI.tsx`

---

## 🏆 Progression & Social

- [ ] **Match History:** Store win/loss/stats per game in Supabase. Show on profile page ("You've won 15 of 23 games").
    - Files: `app/profile/page.tsx`, `hooks/useBattle.ts`, `docs/schema.sql`
- [ ] **Ranked Ladder / MMR:** The MMR field exists in the DB but never changes. Implement Elo-style ratings with rank tiers (Bronze → Silver → Gold → Diamond → Legend).
    - Files: `app/profile/page.tsx`, new `lib/mmr-service.ts`
- [ ] **Leaderboard:** Global top 50 players by MMR. Simple Supabase query on `profiles` table, sorted by MMR desc.
    - Files: New `app/leaderboard/page.tsx`
- [ ] **Daily Challenges:** "Win a game using only C-tier or lower cards" — rewards custom card skins or title badges.
    - Files: New `app/challenges/page.tsx`, new `lib/challenges-service.ts`
- [ ] **Achievement System:** "First Blood", "Wildcard Warrior", "Flawless Victory". Unlockable badges shown on profile.
    - Files: New `lib/achievements.ts`, `app/profile/page.tsx`
- [ ] **Friend Battles:** Share a room code to fight friends directly. Easier to implement than full matchmaking.
    - Files: New `app/room/[code]/page.tsx`, Supabase Realtime

---

## 🌐 Multiplayer Implementation

- [ ] Initialize Supabase project and run schema migrations.
- [ ] Implement Auth (Login/Signup page) — *scaffolded, needs integration with game flow*.
- [ ] Create Database Schema (`profiles`, `decks`, `games`) — *designed, needs deployment*.
- [ ] Implement Matchmaking Queue logic.
- [ ] Implement Supabase Realtime for live game state sync.
- [ ] Refactor `BattleArena` to consume remote state instead of local reducer.
- [ ] Add turn timer (30s per turn) for multiplayer games.
- [ ] Add reconnection handling for dropped connections.

### Infrastructure
- **Backend:** Supabase (Free Tier: 500MB DB, 50K MAU)
- **Hosting:** Vercel (Hobby Tier)
- **Realtime:** Supabase Realtime for game state sync
- **Cost:** $0/month until significant scale

---

## 🔧 Technical Debt

- [ ] **Refactor AI:** Move AI logic out of `BattleArena.tsx` (UI component) and into a custom hook or service (`hooks/useAI.ts`).
- [ ] **Strict Typing:** Remove `any` types (e.g., `user` state in `Showcase.tsx` line 16).
- [ ] **Constants Config:** Move magic numbers (HP caps, damage multipliers, swap cooldown, deck sizes) to a central `lib/constants.ts` config file.
- [ ] **Consistent localStorage Keys:** `CharacterSelection.tsx` uses `anime-battle-saved-team` while `useBattle.ts` uses `tri-gate-tactic-state`. Standardize all keys.
- [ ] **Remove Unused `GameStatus` Component:** `components/GameStatus.tsx` appears unused — it tracks round-based scoring that doesn't match the current HP-based system.
- [ ] **Type Split:** `app/types/battle.ts` and `types/game.ts` should be consolidated or clearly separated with a defined boundary.

---

## 🎯 Suggested Priority Order

```
Phase 1 — Fix & Feel (1-2 days)
  1. Fix "All cards exhaust" bug
  2. Show HP on field cards
  3. Add basic sound effects
  4. Damage numbers on attack
  5. Extract constants to config file

Phase 2 — Make Stats Matter (2-3 days)
  6. Implement Critical Hits (Skill stat)
  7. Implement Speed-based turn order
  8. Improve damage formula (min damage, scaling)
  9. Attack animations

Phase 3 — Strategic Depth (1 week)
  10. Elemental type system
  11. Card abilities (at least for S/A tier)
  12. Energy/mana system
  13. Interactive tutorial

Phase 4 — Progression (1 week)
  14. Match history tracking
  15. MMR / ranked system
  16. Leaderboard
  17. Achievement system

Phase 5 — Multiplayer (2+ weeks)
  18. Full Supabase integration
  19. Matchmaking queue
  20. Realtime game sync
  21. Friend battles / room codes
```
