'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { GameCharacter } from '@/types/game';

interface CardProps {
  character: GameCharacter;
  isFaceDown?: boolean;
}

export const Card = ({ character, isFaceDown = false }: CardProps) => {
  if (isFaceDown) {
    return (
      <div className="w-40 h-60 rounded-lg bg-gray-800 border border-purple-500 flex items-center justify-center">
        <span className="text-purple-300 font-bold">DRAW</span>
      </div>
    );
  }

  return (
    <motion.div
      className="w-40 h-60 rounded-lg overflow-hidden shadow-lg bg-gray-900 border border-gray-700 relative text-white"
      whileHover={{ scale: 1.05, y: -5 }}
    >
      <Image
        src={character.image}
        alt={character.name}
        layout="fill"
        objectFit="cover"
        className="absolute inset-0"
      />
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
        <h3 className="text-md font-bold truncate">{character.name}</h3>
        <div className="flex justify-between text-sm">
          <span>HP: {character.stats.hp}</span>
          <span>ATK: {character.stats.power}</span>
          <span>DEF: {character.stats.defense}</span>
        </div>
      </div>
    </motion.div>
  );
};

