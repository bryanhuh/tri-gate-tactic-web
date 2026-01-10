"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/hooks/useGame";
import { Card } from "@/components/Card";
import { GameStatus } from "@/components/GameStatus";
import confetti from "canvas-confetti";
import { motion, AnimatePresence, useAnimation } from "framer-motion";

export default function Home() {
  const { state, startGame, playRound, nextRound, resetGame } = useGame();
  const {
    gameStatus,
    playerDeck,
    opponentDeck,
    playerCard,
    opponentCard,
    playerScore,
    opponentScore,
    roundWinner,
    gameWinner,
  } = state;

  const controls = useAnimation(); // For the shake effect
  const [showFlash, setShowFlash] = useState(false);

  // Trigger Flash and Shake when a round result is declared
  useEffect(() => {
    if (gameStatus === "round-result") {
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 150);

      // Shake sequence
      controls.start({
        x: [-10, 10, -10, 10, 0],
        transition: { duration: 0.2 },
      });
    }

    if (gameWinner === "player") {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  }, [gameStatus, gameWinner, controls]);

  return (
    <motion.main
      animate={controls}
      className="relative min-h-screen bg-black text-white overflow-hidden flex items-center justify-center p-8"
    >
      {/* 1. IMPACT FLASH EFFECT */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[100] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* 2. SIDEBARS (Scaled down without changing Card props) */}
      {/* Player Sidebar (Left) */}
      <div className="fixed left-4 top-0 bottom-0 flex flex-col justify-center items-center z-20 pointer-events-none">
        <div className="flex flex-col -space-y-60">
          {" "}
          {/* Overlap to save space */}
          {playerDeck.map((card, index) => (
            <motion.div
              key={card.id}
              layoutId={`card-${card.id}`}
              className="origin-left scale-[0.6] hover:scale-[0.65] transition-transform pointer-events-auto"
            >
              <Card character={card} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Opponent Sidebar (Right) */}
      <div className="fixed right-4 top-0 bottom-0 flex flex-col justify-center items-center z-20 pointer-events-none">
        <div className="flex flex-col -space-y-60">
          {opponentDeck.map((card, index) => (
            <motion.div
              key={card.id}
              layoutId={`card-${card.id}`}
              className="origin-right scale-[0.6] grayscale opacity-50"
            >
              <Card character={card} isFaceDown />
            </motion.div>
          ))}
        </div>
      </div>

      {/* 3. CENTER BATTLE STAGE */}
      <div className="z-10 flex flex-col items-center gap-12">
        <header className="text-center">
          <h1 className="text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-purple-400 to-blue-600 uppercase">
            Anime Battle
          </h1>
          <GameStatus
            status={gameStatus}
            playerScore={playerScore}
            opponentScore={opponentScore}
            roundWinner={roundWinner}
            gameWinner={gameWinner}
          />
        </header>

        <div className="relative flex items-center justify-center gap-16 min-h-[400px]">
          <AnimatePresence>
            {/* Player Card in Arena */}
            {playerCard && (
              <motion.div
                layoutId={`card-${playerCard.id}`}
                initial={{ x: -200, opacity: 0, rotate: -10 }}
                animate={{ x: 0, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative"
              >
                <Card character={playerCard} />
                {roundWinner === "player" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.2 }}
                    className="absolute -top-12 inset-x-0 text-center text-yellow-400 font-black text-3xl drop-shadow-[0_0_10px_rgba(250,204,21,1)]"
                  >
                    VICTORY
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* VS Divider */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-6xl font-black italic text-zinc-800"
            >
              VS
            </motion.div>

            {/* Opponent Card in Arena */}
            {opponentCard && (
              <motion.div
                layoutId={`card-${opponentCard.id}`}
                initial={{ x: 200, opacity: 0, rotate: 10 }}
                animate={{ x: 0, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative"
              >
                <Card character={opponentCard} />
                {roundWinner === "opponent" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.2 }}
                    className="absolute -top-12 inset-x-0 text-center text-red-500 font-black text-3xl drop-shadow-[0_0_10px_rgba(239,68,68,1)]"
                  >
                    DEFEAT
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4. CONTROLS */}
        <div className="h-20 flex items-center justify-center">
          {gameStatus === "initial" && (
            <button
              onClick={startGame}
              className="px-12 py-4 bg-purple-600 text-white font-black rounded-full hover:bg-purple-500 transition-all uppercase tracking-tighter"
            >
              Begin Duel
            </button>
          )}

          {gameStatus === "playing" && playerCard === null && (
            <button
              onClick={playRound}
              className="px-12 py-4 bg-blue-600 text-white font-black rounded-lg hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]"
            >
              DRAW CARD
            </button>
          )}

          {gameStatus === "round-result" && (
            <button
              onClick={nextRound}
              className="px-12 py-4 bg-white text-black font-black rounded-lg hover:bg-gray-200 transition-all animate-pulse"
            >
              Next Turn
            </button>
          )}

          {gameStatus === "game-over" && (
            <button
              onClick={() => {
                resetGame();
                startGame();
              }}
              className="px-12 py-4 bg-red-600 text-white font-black rounded-lg"
            >
              Restart Duel
            </button>
          )}
        </div>
      </div>
    </motion.main>
  );
}
