"use client";

import { useState } from "react";
import { GameCharacter } from "@/types/game";
import { BattleArena } from "@/components/BattleArena";
import Showcase from "@/components/sections/Showcase";
import LoadingTransition from "@/components/LoadingTransition";
import CharacterSelection from "@/components/CharacterSelection";
import OpponentReveal from "@/components/OpponentReveal";
import { useBattle } from "@/hooks/useBattle";

export default function Home() {
  const { state, actions } = useBattle();

  const handlePlayNow = () => {
    actions.startBattle();
  };

  const handleTransitionEnd = () => {
    // You can add any logic here for when the transition ends
  };

  const handleCharacterSelection = (playerDeck: GameCharacter[], opponentDeck: GameCharacter[]) => {
    actions.setupGame(playerDeck, opponentDeck);
  };

  const handleRevealComplete = () => {
    actions.beginFight();
  };

  if (state.phase === 'setup') {
    return <CharacterSelection onBattleStart={handleCharacterSelection} />;
  }
  
  if (state.phase === 'reveal') {
    return <OpponentReveal opponentDeck={state.opponent.deck} onComplete={handleRevealComplete} />;
  }

  if (state.phase === 'battle' || state.phase === 'game-over') {
    return <BattleArena gameState={state} actions={actions} />;
  }

  if (state.phase === "character-selection") {
    return <Showcase onPlayNow={handlePlayNow} />;
  }

  return <Showcase onPlayNow={handlePlayNow} />;
}
