'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import type { GameCharacter } from '@/types/game';

interface BattleArenaProps {
  playerCard: GameCharacter | null;
  opponentCard: GameCharacter | null;
}

const cardVariants = {
  hidden: { x: -100, opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: 100, opacity: 0 },
};

export const BattleArena = ({ playerCard, opponentCard }: BattleArenaProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto flex justify-around items-center gap-4 my-8 h-96 p-8 bg-black/20 rounded-xl shadow-2xl [perspective:1000px]">
      <AnimatePresence>
        {playerCard && (
          <motion.div
            key={`player-${playerCard.id}`}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.5 }}
            className="[transform-style:preserve-3d] [transform:rotateY(-20deg)]"
          >
            <Card character={playerCard} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-7xl font-black text-purple-400">VS</div>

      <AnimatePresence>
        {opponentCard && (
          <motion.div
            key={`opponent-${opponentCard.id}`}
            variants={{...cardVariants, hidden: { x: 100, opacity: 0}}}
            initial="hidden"
            animate="visible"
            exit={{...cardVariants.exit, x: -100}}
            transition={{ duration: 0.5 }}
            className="[transform-style:preserve-3d] [transform:rotateY(20deg)]"
          >
            <Card character={opponentCard} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
