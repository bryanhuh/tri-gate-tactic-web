import { PlayerState } from '@/app/types/battle';
import { Card } from '../Card';
import Image from 'next/image';
import { GameCharacter } from '@/types/game';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface PlayerUIProps {
  player: PlayerState;
  onCardClick?: (card: GameCharacter) => void;
  selectedCardId?: string;
  canSwap?: boolean;
}

export function PlayerUI({ player, onCardClick, selectedCardId, canSwap }: PlayerUIProps) {
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
    <div className="w-full h-full flex flex-col justify-end pb-4 pointer-events-none">
      
      {/* Stats Bar */}
      <div className="pointer-events-auto bg-black/60 backdrop-blur-md border-t border-gray-700 p-2 flex justify-between items-center text-white w-full absolute bottom-0 z-50">
         <div className="flex items-center gap-4">
            <div className="relative">
                <Image 
                    src="/assets/showcase.png" 
                    alt="Player Avatar" 
                    width={60} 
                    height={60} 
                    className="rounded-full border-2 border-green-500 object-cover h-[60px] w-[60px] shadow-[0_0_10px_rgba(34,197,94,0.4)]"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center text-xs border border-gray-600">
                    LP
                </div>
            </div>
            
            <div className="flex flex-col">
                <span className="text-xl font-bold tracking-widest text-green-400">PLAYER</span>
                <div className="w-48 h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-600 relative">
                    <motion.div 
                        initial={{ width: '100%' }}
                        animate={{ width: `${Math.max(0, (player.hp / 8000) * 100)}%` }} // Assuming 8000 is max HP for scaling
                        className="h-full bg-gradient-to-r from-green-600 to-green-400"
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white shadow-black drop-shadow-md">
                        {player.hp} / 8000
                    </span>
                </div>
            </div>
         </div>

         <div className="flex gap-6 pr-8">
             <div className="text-center">
                 <div className="text-xs text-gray-400 uppercase tracking-wider">Deck</div>
                 <div className="text-xl font-mono">{player.deck.length}</div>
             </div>
             <div className="text-center">
                 <div className="text-xs text-gray-400 uppercase tracking-wider">Grave</div>
                 <div className="text-xl font-mono">{player.graveyard.length}</div>
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
}