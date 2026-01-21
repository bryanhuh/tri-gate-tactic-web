"use client";

import { useState, useEffect } from "react";
import { GameCharacter } from "@/types/game";
import { BattleArena } from "@/components/BattleArena";
import Showcase from "@/components/sections/Showcase";
import LoadingTransition from "@/components/LoadingTransition";
import CharacterSelection from "@/components/CharacterSelection";
import OpponentReveal from "@/components/OpponentReveal";
import { useBattle } from "@/hooks/useBattle";
import { getCharacterDeck } from "@/lib/anilist-service";
import { Spinner } from "@/components/ui/Loaders";

export default function Home() {
  const { state, actions } = useBattle();
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    const initGame = async () => {
        const readyToPlay = localStorage.getItem('anime-battle-ready-to-play');
        const savedDeckStr = localStorage.getItem('anime-battle-saved-team');

        if (readyToPlay === 'true' && savedDeckStr) {
            try {
                setIsInitializing(true);
                const playerDeck = JSON.parse(savedDeckStr) as GameCharacter[];
                
                // Generate Opponent Deck
                // We need 5 characters for the opponent
                const opponentDeck = await getCharacterDeck(5);
                
                actions.setupGame(playerDeck, opponentDeck);
                
                // Clear the flag so a refresh doesn't auto-start again unexpectedly
                localStorage.removeItem('anime-battle-ready-to-play');
            } catch (error) {
                console.error("Failed to initialize game from deck builder", error);
            } finally {
                setIsInitializing(false);
            }
        }
    };

    initGame();
  }, [actions]);

  const handlePlayNow = () => {
    actions.startBattle();
  };

  const handleResume = () => {
      try {
          const savedStateStr = localStorage.getItem('anime-battle-state');
          if (savedStateStr) {
              const savedState = JSON.parse(savedStateStr);
              actions.resumeGame(savedState);
          }
      } catch (e) {
          console.error("Failed to resume game", e);
      }
  }

  const handleTransitionEnd = () => {
    // You can add any logic here for when the transition ends
  };

  const handleCharacterSelection = (playerDeck: GameCharacter[], opponentDeck: GameCharacter[]) => {
    actions.setupGame(playerDeck, opponentDeck);
  };

  const handleRevealComplete = () => {
    actions.beginFight();
  };

  if (isInitializing) {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
              <Spinner />
              <p className="mt-4 text-xl font-bold animate-pulse text-blue-400">Summoning Opponents...</p>
          </div>
      );
  }

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
    return <Showcase onPlayNow={handlePlayNow} onResume={handleResume} />;
  }

  return <Showcase onPlayNow={handlePlayNow} onResume={handleResume} />;
}
