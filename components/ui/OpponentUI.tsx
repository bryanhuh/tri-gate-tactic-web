import { PlayerState } from '@/app/types/battle';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Layers,  Skull } from 'lucide-react';
import { memo } from 'react';

interface OpponentUIProps {
  opponent: PlayerState;
}

export const OpponentUI = memo(function OpponentUI({ opponent }: OpponentUIProps) {
  return (
    <div className="pointer-events-none"> {/* Removed absolute positioning wrapper */}
      <div className="bg-black/60 backdrop-blur-md border border-gray-700/50 rounded-xl p-3 flex items-center gap-4 shadow-2xl min-w-[400px]">
        
        {/* Avatar */}
        <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-red-500 overflow-hidden shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                <Image 
                    src="/assets/opponent.png" 
                    alt="Opponent Avatar" 
                    width={64} 
                    height={64} 
                    className="object-cover"
                />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-red-900 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500">
                ENEMY
            </div>
        </div>

        {/* Stats */}
        <div className="flex-1 flex flex-col gap-1">
            <div className="flex justify-between items-end">
                <h2 className="text-lg font-bold text-red-100 tracking-wider">OPPONENT</h2>
                <span className="text-2xl font-mono font-bold text-red-500">{opponent.hp}</span>
            </div>

            {/* HP Bar */}
            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-600 relative">
                <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: `${Math.max(0, (opponent.hp / 1000) * 100)}%` }} // Assuming 1000 max HP
                    className="h-full bg-gradient-to-r from-red-700 to-red-500"
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                />
            </div>

            {/* Counters */}
            <div className="flex gap-4 mt-1 text-xs text-gray-400 font-mono">
                <div className="flex items-center gap-1">
                    <Layers size={14} className="text-gray-500" />
                    <span>DECK: <span className="text-white">{opponent.deck.length}</span></span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-4 bg-gray-600 rounded-sm border border-gray-400" /> {/* Hand Icon placeholder */}
                    <span>HAND: <span className="text-white">{opponent.hand.length}</span></span>
                </div>
                 <div className="flex items-center gap-1">
                    <Skull size={14} className="text-gray-500" />
                    <span>GRAVE: <span className="text-white">{opponent.graveyard.length}</span></span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
});