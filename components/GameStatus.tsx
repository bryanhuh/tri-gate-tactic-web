'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface GameStatusProps {
  playerScore: number;
  opponentScore: number;
  roundWinner: 'player' | 'opponent' | 'tie' | null;
  gameWinner: 'player' | 'opponent' | null;
  status: 'initial' | 'loading' | 'playing' | 'round-result' | 'game-over';
}

const bannerVariants = {
  hidden: { y: -50, opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { y: 50, opacity: 0 },
};

export const GameStatus = ({ playerScore, opponentScore, roundWinner, gameWinner, status }: GameStatusProps) => {
  const getWinnerText = () => {
    if (gameWinner) {
      return gameWinner === 'player' ? 'You Win The Game!' : 'Opponent Wins The Game!';
    }
    if (roundWinner) {
      if (roundWinner === 'tie') return "It's a Tie!";
      return roundWinner === 'player' ? 'You Win The Round!' : 'Opponent Wins!';
    }
    return null;
  };

  const winnerText = getWinnerText();

  return (
    <div className="text-center text-white my-4">
      <div className="flex justify-center items-center gap-8 text-2xl font-bold">
        <div>
          <span className="text-blue-400">Player: </span>
          <span>{playerScore}</span>
        </div>
        <div>
          <span className="text-red-400">Opponent: </span>
          <span>{opponentScore}</span>
        </div>
      </div>
      
      <div className="h-16 mt-4">
        <AnimatePresence>
          {status === 'loading' && (
            <motion.div
              key="loading"
              variants={bannerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-2xl font-bold text-gray-400"
            >
              Loading...
            </motion.div>
          )}
          {winnerText && (status === 'round-result' || status === 'game-over') && (
            <motion.div
              key={winnerText}
              variants={bannerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-4xl font-extrabold text-yellow-400"
            >
              {winnerText}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
