'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { GameCharacter } from '@/types/game';
import { Shield, Sword, Heart, Zap, Star } from 'lucide-react';

interface CardProps {
  character: GameCharacter;
  isFaceDown?: boolean;
}

const Stat = ({ icon: Icon, value }: { icon: React.ElementType, value: number }) => (
  <div className="flex items-center text-sm">
    <Icon className="w-4 h-4 mr-1 text-yellow-400" />
    <span>{value}</span>
  </div>
);

export const Card = ({ character, isFaceDown = false }: CardProps) => {
  if (isFaceDown) {
    return (
      <div className="w-48 h-72 rounded-xl bg-gray-800 border-2 border-purple-500 shadow-lg shadow-purple-500/50 flex items-center justify-center">
        <span className="text-purple-300 text-2xl font-bold">ANIME BATTLE</span>
      </div>
    );
  }

  return (
    <motion.div
      className="w-48 h-72 rounded-xl overflow-hidden shadow-lg bg-gray-900 border-2 border-gray-700 relative text-white"
      whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)' }}
    >
      <div className="absolute top-0 left-0 right-0 h-1/2">
        <Image
          src={character.image}
          alt={character.name}
          layout="fill"
          objectFit="cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col justify-end h-full">
        <div className="flex-grow" />
        <h3 className="text-lg font-bold truncate">{character.name}</h3>
        <div className="flex justify-between items-center mb-2">
            <span className={`font-bold text-xl text-${character.tier.startsWith('S') ? 'red' : 'yellow'}-400`}>
            {character.tier} Tier
            </span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat icon={Heart} value={character.stats.hp} />
          <Stat icon={Sword} value={character.stats.power} />
          <Stat icon={Shield} value={character.stats.defense} />
          <Stat icon={Zap} value={character.stats.speed} />
          <Stat icon={Star} value={character.stats.skill} />
        </div>
      </div>
    </motion.div>
  );
};
