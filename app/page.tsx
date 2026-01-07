'use client';

import { useEffect } from 'react';
import { useGame } from '@/hooks/useGame';
import { Card } from '@/components/Card';
import { BattleArena } from '@/components/BattleArena';
import { GameStatus } from '@/components/GameStatus';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

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
    gameWinner
  } = state;

  useEffect(() => {
    if (gameWinner === 'player') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [gameWinner]);

  const renderPlayerHand = () => (
    <div className="flex justify-center items-end h-48">
        {playerDeck.map((card, index) => (
            <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="-ml-16"
            >
                <Card character={card} />
            </motion.div>
        ))}
    </div>
  );

  const renderOpponentHand = () => (
    <div className="flex justify-center items-start h-48">
      {opponentDeck.map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="-mr-16"
        >
          <Card character={card} />
        </motion.div>
      ))}
    </div>
  );

  return (
    <main className="relative flex flex-col items-center justify-between min-h-screen bg-gray-900 text-white p-8 overflow-hidden">
      <div className="absolute top-0 w-full p-4">
        {renderOpponentHand()}
      </div>

      <div className="z-10 flex flex-col items-center">
        <h1 className="text-5xl font-bold text-purple-400 tracking-wider shadow-lg mb-4">
          Anime Battle Cards
        </h1>
        
        <GameStatus 
          status={gameStatus}
          playerScore={playerScore}
          opponentScore={opponentScore}
          roundWinner={roundWinner}
          gameWinner={gameWinner}
        />
      </div>

      <div className="z-10">
        <BattleArena playerCard={playerCard} opponentCard={opponentCard} />
      </div>

      <div className="w-full flex justify-center items-center h-48 z-10">
        {gameStatus === 'initial' && (
          <button onClick={startGame} className="px-8 py-4 bg-green-500 text-white font-bold rounded-lg shadow-lg hover:bg-green-600 transition-all">
            Start Game
          </button>
        )}
        {gameStatus === 'loading' && <div className="text-2xl">Loading Deck...</div>}
        {gameStatus === 'playing' && playerDeck.length > 0 && (
          <button onClick={playRound} className="px-8 py-4 bg-blue-500 text-white font-bold rounded-lg shadow-lg hover:bg-blue-600 transition-all">
            Play Card
          </button>
        )}
        {gameStatus === 'round-result' && (
           <button onClick={nextRound} className="px-8 py-4 bg-yellow-500 text-white font-bold rounded-lg shadow-lg hover:bg-yellow-600 transition-all">
            Next Round
          </button>
        )}
        {gameStatus === 'game-over' && (
          <button onClick={() => {
            resetGame();
            startGame();
          }} className="px-8 py-4 bg-red-500 text-white font-bold rounded-lg shadow-lg hover:bg-red-600 transition-all">
            Play Again
          </button>
        )}
      </div>
      
      <div className="absolute bottom-0 w-full p-4">
        {renderPlayerHand()}
      </div>
    </main>
  );
}