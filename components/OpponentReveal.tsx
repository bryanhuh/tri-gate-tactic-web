'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { GameCharacter } from '@/types/game';
import { Card } from './Card';

interface OpponentRevealProps {
  opponentDeck: GameCharacter[];
  onComplete: () => void;
}

export default function OpponentReveal({ opponentDeck, onComplete }: OpponentRevealProps) {
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    // Start revealing cards one by one
    const interval = setInterval(() => {
      setRevealedCount((prev) => {
        if (prev < opponentDeck.length) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 1000); // Reveal one every second

    return () => clearInterval(interval);
  }, [opponentDeck]);

  useEffect(() => {
    if (revealedCount === opponentDeck.length) {
       // Wait a bit after all revealed before completing
       const timeout = setTimeout(() => {
         onComplete();
       }, 2000);
       return () => clearTimeout(timeout);
    }
  }, [revealedCount, opponentDeck, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 opacity-40">
            <Image
                src="/assets/opponent.png"
                alt="Opponent Background"
                layout="fill"
                objectFit="cover"
            />
        </div>

        <div className="z-10 text-center mb-10 w-full">
            <motion.h2 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-extrabold text-red-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wider"
            >
                OPPONENT'S DECK REVEAL
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white text-xl mt-2 font-mono"
            >
              Prepare yourself...
            </motion.p>
        </div>

        <div className="z-10 flex flex-wrap justify-center gap-6 px-4">
            {opponentDeck.map((character, index) => (
                <div key={character.instanceId} className="w-40 h-60 relative perspective-1000">
                     <motion.div
                        className="w-full h-full relative preserve-3d"
                        initial={{ rotateY: 0 }}
                        animate={{ rotateY: index < revealedCount ? 180 : 0 }}
                        transition={{ duration: 0.8, type: "spring", stiffness: 50 }}
                        style={{ transformStyle: "preserve-3d" }}
                     >
                        {/* Front (Face Down) - Visible when rotateY is 0 */}
                        <div 
                            className="absolute inset-0 backface-hidden"
                            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                        >
                             <Card character={character} isFaceDown={true} className="w-full h-full shadow-2xl shadow-purple-900/50" />
                        </div>
                        
                        {/* Back (Face Up Character) - Visible when rotateY is 180 */}
                        <div 
                            className="absolute inset-0 backface-hidden"
                            style={{ 
                                backfaceVisibility: 'hidden', 
                                WebkitBackfaceVisibility: 'hidden',
                                transform: "rotateY(180deg)" 
                            }}
                        >
                            <Card character={character} isFaceDown={false} className="w-full h-full shadow-2xl shadow-red-900/50 border-red-500/50" />
                        </div>
                     </motion.div>
                </div>
            ))}
        </div>
    </div>
  );
}
