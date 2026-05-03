import { PlayerState } from '@/app/types/battle';
import { Card } from '../Card';
import Image from 'next/image';
import { GameCharacter } from '@/types/game';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, memo } from 'react';
import { Layers, Skull } from 'lucide-react';
import { MAX_PLAYER_HP } from '@/lib/gameConfig';

interface PlayerUIProps {
  player: PlayerState;
  onCardClick?: (card: GameCharacter) => void;
  selectedCardId?: string;
  canSwap?: boolean;
}

export const PlayerUI = memo(function PlayerUI({ player, onCardClick, selectedCardId, canSwap }: PlayerUIProps) {
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);

  // Calculate fan positioning for the left-side "Reserve" look
  const handSize = player.hand.length;
  const angleStep = 6; // Degrees between cards
  const baseAngle = -15; // Start tilted
  const xOffsetStep = 45; // Overlap amount
  const baseX = 0; 

  const hasEmptySlot = player.field.some(slot => slot === null);
  const showReadyToSummon = canSwap || hasEmptySlot;

  return (
    <div className="w-full h-full flex flex-col justify-end pb-4 pointer-events-none relative">
      
      {/* Player Status HUD (Styled like Opponent UI) */}
      <div className="absolute bottom-4 left-4 pointer-events-auto z-50">
        <div className="bg-black/60 backdrop-blur-md border border-gray-700/50 rounded-xl p-3 flex items-center gap-4 shadow-2xl min-w-[400px]">
            
            {/* Avatar */}
            <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-green-500 overflow-hidden shadow-[0_0_15px_rgba(34,197,94,0.5)]">
                    <Image 
                        src="/assets/showcase.png" 
                        alt="Player Avatar" 
                        width={64} 
                        height={64} 
                        className="object-cover"
                    />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-900 text-[10px] font-bold px-2 py-0.5 rounded border border-green-500">
                    YOU
                </div>
            </div>

            {/* Stats */}
            <div className="flex-1 flex flex-col gap-1">
                <div className="flex justify-between items-end">
                    <h2 className="text-lg font-bold text-green-100 tracking-wider uppercase">Player</h2>
                    <span className="text-2xl font-mono font-bold text-green-400">{player.hp}</span>
                </div>

                {/* HP Bar */}
                <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-600 relative">
                    <motion.div 
                        initial={{ width: '100%' }}
                        animate={{ width: `${Math.max(0, (player.hp / MAX_PLAYER_HP) * 100)}%` }}
                        className="h-full bg-gradient-to-r from-green-700 to-green-500"
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    />
                </div>

                {/* Counters */}
                <div className="flex gap-4 mt-1 text-xs text-gray-400 font-mono">
                    <div className="flex items-center gap-1">
                        <Layers size={14} className="text-gray-500" />
                        <span>DECK: <span className="text-white">{player.deck.length}</span></span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-4 bg-gray-600 rounded-sm border border-gray-400" />
                        <span>HAND: <span className="text-white">{player.hand.length}</span></span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Skull size={14} className="text-gray-500" />
                        <span>GRAVE: <span className="text-white">{player.graveyard.length}</span></span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Reserve / Hand Container (Moved to Left) */}
      <div className="absolute bottom-20 left-8 h-64 w-1/3 flex justify-start items-end pointer-events-none perspective-2000">
         <div className="relative flex justify-start items-end h-full">
            <AnimatePresence>
                {player.hand.map((card, index) => {
                    const isHovered = hoveredCardIndex === index;
                    const isSelected = selectedCardId === card.instanceId;
                    
                    // Fan calculations for side fan
                    const rotation = baseAngle + (index * angleStep);
                    const xPos = baseX + (index * xOffsetStep);
                    const yPos = -index * 5; // Slight stair-step

                    return (
                        <motion.div
                            key={card.instanceId}
                            layoutId={card.instanceId}
                            className="absolute transform-gpu origin-bottom-left pointer-events-auto"
                            style={{
                                zIndex: isHovered ? 50 : index,
                                bottom: 0,
                            }}
                            initial={{ x: -100, opacity: 0, rotate: -45 }}
                            animate={{ 
                                x: isHovered ? xPos + 20 : xPos,
                                y: isHovered ? -40 : yPos, // Lift on hover
                                rotate: isHovered ? 0 : rotation,
                                scale: isHovered ? 1.1 : 0.85, // Smaller base scale to look "reserved"
                                opacity: 1 
                            }}
                            exit={{ x: -100, opacity: 0, transition: { duration: 0.2 } }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            onHoverStart={() => setHoveredCardIndex(index)}
                            onHoverEnd={() => setHoveredCardIndex(null)}
                            onClick={() => onCardClick?.(card)}
                        >
                            <Card 
                                character={card} 
                                className={`shadow-2xl transition-all duration-300 ${
                                    isSelected 
                                    ? "ring-4 ring-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.6)]" 
                                    : "shadow-black grayscale-[0.2] contrast-[0.9]" // Slightly muted look for reserve
                                } ${isHovered ? "grayscale-0 contrast-100" : ""}`}
                            />
                            
                            {/* Reserve Labels */}
                            {isHovered && (
                                <div className="absolute -top-16 left-0 right-0 flex flex-col gap-1 items-center pointer-events-none">
                                    {canSwap && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="w-full text-center text-[10px] font-bold uppercase tracking-widest py-1 rounded border text-blue-400 bg-blue-900/80 border-blue-400/50 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                        >
                                            Swap Available
                                        </motion.div>
                                    )}
                                    {showReadyToSummon && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="w-full text-center text-[10px] font-bold uppercase tracking-widest py-1 rounded border text-yellow-400 bg-black/80 border-yellow-400/50"
                                        >
                                            Ready to Summon
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
});