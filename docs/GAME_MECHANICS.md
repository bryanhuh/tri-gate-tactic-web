# Game Mechanics

## Overview
Tri-Gate Tactic is a turn-based strategy game where players command a team of anime characters to defeat their opponent. The goal is to either reduce the opponent's HP to zero or eliminate all their combatants.

## Core Stats
Each character has the following stats derived from their popularity and score on AniList:

- **HP (Health Points):** Determines how much damage a character can take before being sent to the Graveyard.
- **Power:** The raw damage output of the character.
- **Defense:** Reduces incoming damage.
- **Speed:** Determines turn order at the start of each round. The side with the higher total Speed among cards on the field acts first.
- **Skill:** Determines critical hit chance. Critical hits deal 1.5x damage.
- **Tier:** A rank (S++ to D-) calculated based on total stats.

### Damage Formula
Damage is calculated simply as:
`Damage = max(0, Attacker.Power - Target.Defense)`

When a character takes damage, their HP is reduced. If HP reaches 0, they are removed from the field and placed in the Graveyard.
Damage dealt to a character is also dealt to the **Player/Opponent's Main HP**.

## Turn Structure
The game alternates between the **Player** and the **Opponent**.

### Player Turn
During your turn, you can perform the following actions:
1.  **Play a Card:** Place a character from your Hand into an empty Field Slot (3 slots total).
2.  **Attack:** Select a character on your field (that hasn't attacked yet) and target an enemy character.
3.  **Swap:** (After Turn 3) Swap a card from your Hand with a card on the Field.
4.  **End Turn:** Pass control to the opponent.

### Opponent Turn
The AI performs similar actions:
1.  Summons characters if slots are empty.
2.  Attacks your characters based on its logic (currently random selection of valid targets).
3.  Ends turn automatically.

## Special Mechanics

### Wildcard (The "Last Stand")
If a player (you or the opponent) has **1 or fewer active combatants** (Hand + Field combined), they can draw a **Wildcard**.
-   **Effect:** Adds 2 powerful "Reinforcement" characters to your hand.
-   **Limit:** Can only be used **once per game**.
-   **Trigger:** Automatically available when conditions are met.

### Swapping
Allows tactical repositioning of units.
-   **Availability:** Unlocked after **Turn 3**.
-   **Cooldown:** Once used, it has a **3-turn cooldown**.
-   **Cost:** Takes the card from the field back to hand and places the new card on the field.

### Victory Conditions
You win if:
1.  **Opponent HP reaches 0.**
2.  **Opponent has no cards left** (Wipeout) and cannot draw a Wildcard.

You lose if:
1.  **Your HP reaches 0.**
2.  **You have no cards left** and cannot draw a Wildcard.
