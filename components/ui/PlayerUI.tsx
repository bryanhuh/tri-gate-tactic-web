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
}

export function PlayerUI({ player, onCardClick, selectedCardId }: PlayerUIProps) {
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);

  // Calculate fan positioning
  const handSize = player.hand.length;
  const angleStep = 5; // Degrees between cards
  const baseAngle = -((handSize - 1) * angleStep) / 2;
  const xOffsetStep = 60; // Overlap amount
  const baseX = -((handSize - 1) * xOffsetStep) / 2;

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

      {/* Hand Container */}
      <div className="relative h-48 w-full flex justify-center items-end mb-24 pointer-events-none perspective-1000">
         <div className="relative w-full max-w-4xl flex justify-center items-end h-full">
            <AnimatePresence>
                {player.hand.map((card, index) => {
                    const isHovered = hoveredCardIndex === index;
                    const isSelected = selectedCardId === card.instanceId;
                    
                    // Fan calculations
                    const rotation = baseAngle + (index * angleStep);
                    const xPos = baseX + (index * xOffsetStep);
                    const yPos = Math.abs(index - (handSize - 1) / 2) * 5; // Slight arch

                    return (
                        <motion.div
                            key={card.instanceId}
                            layoutId={card.instanceId}
                            className="absolute transform-gpu origin-bottom pointer-events-auto"
                            style={{
                                zIndex: isHovered ? 50 : index,
                                bottom: 0,
                            }}
                            initial={{ y: 200, opacity: 0 }}
                            animate={{ 
                                x: isHovered ? xPos : xPos,
                                y: isHovered ? -80 : yPos, // Pop up on hover
                                rotate: isHovered ? 0 : rotation, // Straighten on hover
                                scale: isHovered ? 1.3 : 1,
                                opacity: 1 
                            }}
                            exit={{ y: 200, opacity: 0, transition: { duration: 0.2 } }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            onHoverStart={() => setHoveredCardIndex(index)}
                            onHoverEnd={() => setHoveredCardIndex(null)}
                            onClick={() => onCardClick?.(card)}
                        >
                            <Card 
                                character={card} 
                                className={`shadow-2xl ${isSelected ? "ring-4 ring-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.6)]" : "shadow-black"}`}
                            />
                        </motion.div>
                    );
                })}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
}