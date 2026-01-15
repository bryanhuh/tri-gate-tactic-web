'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { GameCharacter } from '@/types/game';

interface CardProps {
  character: GameCharacter;
  isFaceDown?: boolean;
  onClick?: () => void;
  className?: string;
}

export const Card = ({ character, isFaceDown = false, onClick, className = '' }: CardProps) => {
  if (isFaceDown) {
    return (
      <motion.div
        className={`w-40 h-60 rounded-xl overflow-hidden shadow-2xl border-2 border-purple-500/50 relative cursor-pointer ${className}`}
        whileHover={{ scale: 1.05 }}
        onClick={onClick}
      >
        <Image
          src="/assets/card.png"
          alt="Card Back"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0"
        />
      </motion.div>
    );
  }

  const getTierColor = (tier: string) => {
    if (tier.startsWith('S')) return 'text-yellow-400 border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]'; // Gold
    if (tier.startsWith('A')) return 'text-purple-400 border-purple-400'; // Purple
    if (tier.startsWith('B')) return 'text-blue-400 border-blue-400'; // Blue
    if (tier.startsWith('C')) return 'text-green-400 border-green-400'; // Green
    if (tier.startsWith('D')) return 'text-gray-400 border-gray-400'; // Gray
    return 'text-gray-300 border-gray-300';
  };

  const tierColor = getTierColor(character.tier || 'B');

  return (
    <motion.div
      className={`w-40 h-60 rounded-xl overflow-hidden shadow-2xl bg-gray-900 border-2 border-gray-700 relative text-white group ${className}`}
      whileHover={{ scale: 1.05, y: -5, borderColor: '#a855f7' }}
      onClick={onClick}
    >
      <Image
        src={character.image}
        alt={character.name}
        layout="fill"
        objectFit="cover"
        className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
      />
      
      {/* Tier Badge */}
      <div className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-black/80 border-2 flex items-center justify-center font-bold text-sm ${tierColor} z-10`}>
        {character.tier || '-'}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/90 to-transparent">
        <h3 className="text-sm font-bold truncate mb-1 text-purple-200 drop-shadow-md">{character.name}</h3>
        <div className="grid grid-cols-3 gap-1 text-[10px] font-mono opacity-90">
          <div className="flex flex-col items-center bg-gray-800/80 rounded p-0.5 border border-gray-700">
            <span className="text-red-400">ATK</span>
            <span className="font-bold">{character.stats.power}</span>
          </div>
          <div className="flex flex-col items-center bg-gray-800/80 rounded p-0.5 border border-gray-700">
            <span className="text-blue-400">DEF</span>
            <span className="font-bold">{character.stats.defense}</span>
          </div>
           <div className="flex flex-col items-center bg-gray-800/80 rounded p-0.5 border border-gray-700">
            <span className="text-green-400">SPD</span>
            <span className="font-bold">{character.stats.speed}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

