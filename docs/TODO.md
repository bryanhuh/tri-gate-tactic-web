# Future Improvements & TODOs

## Immediate Tasks
- [x] **Testing:** Add Unit and Integration tests (Jest/React Testing Library).
    - [x] Test `gameReducer` logic (win conditions, damage calc).
    - [x] Test `BattleArena` component rendering.
- [x] **Error Handling:** Improve UI feedback when AniList API fails (currently logs to console).
- [x] **Performance:** Optimize `BattleArena` re-renders.

## Infrastructure & Multiplayer Plan (New)
To transform this into a fully playable online game with $0 cost, we will use the following stack:

### 1. Backend & Infrastructure (The "Backend-as-a-Service" Stack)
**Tool: Supabase** (Free Tier available)
-   **Why:** It provides Authentication, Database, and Realtime subscriptions in a single package.
-   **Cost:** $0/month (Free Tier: 500MB Database, 50,000 monthly active users).
-   **Components needed:**
    -   **Auth:** `Supabase Auth` for User Registration/Login (Email/Password or GitHub/Google). allows us to securely identify players.
    -   **Database:** `PostgreSQL` to store User Profiles (MMR, Rank), Deck Configurations, and Match History.
    -   **Realtime:** `Supabase Realtime` to listen for changes in the 'ActiveGames' table. When Player A plays a card, the database updates, and Player B's UI updates instantly.

### 2. Deployment
**Tool: Vercel** (Free Tier available)
-   **Why:** Built by the creators of Next.js. Seamless integration with our current repository.
-   **Cost:** $0/month (Hobby Tier: Generous limits for bandwidth and serverless function execution).
-   **Workflow:** Connect GitHub repo -> Push to main -> Auto-deploy.

### 3. Matchmaking Strategy
-   **Simple Queue:** Create a `MatchmakingQueue` table in Supabase.
-   **Logic:**
    1.  User clicks "Find Match".
    2.  Client inserts row into `MatchmakingQueue`.
    3.  Postgres Function (or simple client polling) checks for other waiting users.
    4.  If opponent found -> Create new Game ID -> Move both players to Game -> Delete from Queue.

### Cost Summary
-   **Development:** $0 (Open Source Libraries)
-   **Hosting:** $0 (Vercel Hobby Tier)
-   **Backend:** $0 (Supabase Free Tier)
-   **Total Estimated Running Cost:** **$0/month** (until significant scale).

## Features (Roadmap)
- [x] **Deck Builder:** Allow users to search and build their own custom deck before battle.
- [ ] **Multiplayer Implementation:**
    - [ ] Initialize Supabase project.
    - [ ] Implement Auth (Login/Signup page).
    - [ ] Create Database Schema (`profiles`, `decks`, `games`).
    - [ ] Implement Matchmaking Queue.
    - [ ] Refactor `BattleArena` to consume remote state instead of local reducer.
- [ ] **Advanced AI:** Implement Minimax or more strategic AI instead of random choices.
- [x] **Persistance:** Save game state to LocalStorage to resume later.
- [ ] **Mobile Optimization:** Improve UI scaling for mobile devices (currently optimized for desktop/tablet).
- [ ] **Elemental Types:** Add Rock-Paper-Scissors mechanics (e.g., Fire beats Grass) based on character traits.

## Technical Debt
- [ ] **Refactor AI:** Move AI logic out of `BattleArena.tsx` (UI) and into a custom hook or service.
- [ ] **Strict Typing:** Ensure all `any` types (if any) are removed.
- [ ] **Constants:** Move magic numbers (HP caps, damage multipliers) to a central config file.
