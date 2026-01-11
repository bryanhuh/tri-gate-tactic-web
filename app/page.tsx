"use client";

import { useEffect, useRef, useState } from "react";
import { useGame } from "@/hooks/useGame";
import { GameCharacter } from "@/types/game";
import BattleArena from "@/components/BattleArena";
import Showcase from "@/components/sections/Showcase";
import LoadingTransition from "@/components/LoadingTransition";
import CharacterSelection from "@/components/CharacterSelection";

type GameView = "showcase" | "loading" | "character-selection" | "arena";

export default function Home() {
  const [view, setView] = useState<GameView>("showcase");
  const [playerDeck, setPlayerDeck] = useState<GameCharacter[]>([]);

  const handlePlayNow = () => {
    setView("loading");
  };

  const handleTransitionEnd = () => {
    setView("character-selection");
  };

  const handleBattleStart = (deck: GameCharacter[]) => {
    setPlayerDeck(deck);
    setView("arena");
  };

  if (view === "showcase") {
    return <Showcase onPlayNow={handlePlayNow} />;
  }

  if (view === "loading") {
    return <LoadingTransition onTransitionEnd={handleTransitionEnd} />;
  }

  if (view === "character-selection") {
    return <CharacterSelection onBattleStart={handleBattleStart} />;
  }

  if (view === "arena") {
    return <BattleArena playerDeck={playerDeck} />;
  }

  return null;
}
