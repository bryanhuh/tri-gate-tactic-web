# Multiplayer Implementation Worklog

## Overview
 This document tracks the progress, technical decisions, and steps taken to implement the multiplayer features for Tri-Gate Tactic.

## 1. Infrastructure Selection (Completed)
**Decision**: Use **Supabase** (Backend) and **Vercel** (Hosting).
**Reasoning**:
- **Cost**: Both have generous free tiers suitable for our current scale ($0/mo).
- **Speed**: Managed services reduce ops overhead. Supabase provides Auth + DB + Realtime in one SDK.
- **Integration**: Vercel owns Next.js, ensuring seamless deployment.

## 2. Initial Setup Steps
### A. Dependencies
- Need to install `@supabase/supabase-js`.

### B. Environment Variables
- Application requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- These are obtained from the Supabase Project Dashboard -> Settings -> API.

### C. Database Design (Schema)
We need the following tables to start:
1.  **`profiles`**: Extends the default `auth.users` table. Stores `username`, `avatar_url`, `mmr` (matchmaking rating).
2.  **`decks`**: Stores user-created decks. Reference to `profiles.id`.
3.  **`match_queue`**: A temporary table for users searching for a game.
4.  **`active_games`**: Stores the current state of live games.
5.  **`game_actions`**: (Optional) Could store a log of moves for replay/validation.

## 3. Implementation Log
- [x] **Step 1**: Install Supabase SDK.
- [x] **Step 2**: Configure `lib/supabase.ts` client.
- [x] **Step 3**: Create SQL Schema definitions.
- [x] **Step 4**: Implement basic Login/Register page.
