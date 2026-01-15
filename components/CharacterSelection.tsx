'use client';

import { useState } from 'react';
import type { GameCharacter } from '@/types/game';
import { getRandomCharacter } from '@/lib/anilist-service';
import { Card } from './Card';
import { Spinner } from './ui/Loaders';
import { motion, AnimatePresence } from 'framer-motion';

interface CharacterSelectionProps {
  onBattleStart: (playerDeck: GameCharacter[], opponentDeck: GameCharacter[]) => void;
}

const CharacterSelection = ({ onBattleStart }: CharacterSelectionProps) => {
  const [characters, setCharacters] = useState<(GameCharacter | null)[]>(Array(5).fill(null));
  const [loading, setLoading] = useState<boolean[]>(Array(5).fill(false));
  const [flipped, setFlipped] = useState<boolean[]>(Array(5).fill(false));
  const [isFetchingDeck, setIsFetchingDeck] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleCardClick = async (index: number) => {
    if (characters[index] || loading[index]) return;

    setLoading(prev => {
      const newLoading = [...prev];
      newLoading[index] = true;
      return newLoading;
    });

    const excludeNames = characters.map(c => c?.name).filter(Boolean) as string[];
    const character = await getRandomCharacter(excludeNames);

    if (character) {
      setCharacters(prev => {
        const newCharacters = [...prev];
        newCharacters[index] = character;
        return newCharacters;
      });
      setFlipped(prev => {
        const newFlipped = [...prev];
        newFlipped[index] = true;
        return newFlipped;
      });
    }

    setLoading(prev => {
      const newLoading = [...prev];
      newLoading[index] = false;
      return newLoading;
    });
  };

  const handleStartBattle = async () => {
    setIsFetchingDeck(true);
    const playerDeck = characters.filter(c => c) as GameCharacter[];
    
    // Generate opponent deck
    const opponentDeck: GameCharacter[] = [];
    const excludeNames = [...playerDeck.map(c => c.name)];
    
    let attempts = 0;
    const maxAttempts = 20;

    while (opponentDeck.length < 5 && attempts < maxAttempts) {
        attempts++;
        const char = await getRandomCharacter(excludeNames);
        if (char) {
            opponentDeck.push(char);
            excludeNames.push(char.name);
        }
    }

    await onBattleStart(playerDeck, opponentDeck);
    setIsFetchingDeck(false);
  };

  const allCharactersSelected = characters.every(c => c !== null);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative">
      
      {/* Info Button */}
      <div className="absolute top-4 right-4 z-50">
        <button 
            onClick={() => setShowInfo(!showInfo)}
            className="w-10 h-10 rounded-full bg-gray-800 border border-gray-600 text-white font-bold hover:bg-gray-700 flex items-center justify-center"
        >
            ?
        </button>
      </div>

      {/* Info Modal/Tooltip */}
      <AnimatePresence>
        {showInfo && (
            <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="absolute top-16 right-4 w-80 bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-xl p-6 shadow-2xl z-50 text-sm text-gray-300"
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-bold text-lg">Game Mechanics</h3>
                    <button onClick={() => setShowInfo(false)} className="text-gray-500 hover:text-white">✕</button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <h4 className="text-purple-400 font-bold mb-1">Stats Generation</h4>
                        <p>Stats are based on real-world Anime Popularity & Ratings!</p>
                        <ul className="list-disc pl-4 mt-1 space-y-1 text-xs">
                            <li><strong className="text-red-400">Power:</strong> Based on Mean Score</li>
                            <li><strong className="text-blue-400">Defense:</strong> Based on Favorites count</li>
                            <li><strong className="text-green-400">Speed/Skill:</strong> Randomized (50-99)</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="text-yellow-400 font-bold mb-1">Tier System</h4>
                        <p>Tiers are calculated from total stats:</p>
                        <div className="grid grid-cols-5 gap-1 mt-2 text-center text-xs font-mono">
                            <span className="text-yellow-500">S++</span>
                            <span className="text-yellow-400">S+</span>
                            <span className="text-yellow-300">S</span>
                            
                            <span className="text-purple-400">A+</span>
                            <span className="text-purple-300">A</span>
                            
                            <span className="text-blue-400">B+</span>
                            <span className="text-blue-300">B</span>
                            
                            <span className="text-green-400">C+</span>
                            <span className="text-green-300">C</span>
                            
                            <span className="text-gray-400">D+</span>
                        </div>
                        <p className="mt-2 text-xs italic opacity-70">
                            (S++ is the highest, D- is the lowest)
                        </p>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center">
        <h2 className="text-4xl font-extrabold mb-2 text-white">ASSEMBLE YOUR TEAM</h2>
        <p className="text-lg text-gray-400 mb-8">Select 5 cards to reveal your champions.</p>
      </div>
      <div className="flex justify-center gap-4 mb-8 flex-wrap">
        {characters.map((character, index) => (
          <div key={index} className={`flip-card ${!flipped[index] ? 'glow' : ''}`} onClick={() => handleCardClick(index)}>
            <div className={`flip-card-inner ${flipped[index] ? 'flipped' : ''}`}>
              <div className="flip-card-front">
                <img src="/assets/card.png" alt="Card back" className="w-48 h-64 object-cover rounded-lg" />
              </div>
              <div className="flip-card-back">
                {loading[index] && <Spinner />}
                {character && <Card character={character} />}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={handleStartBattle}
        disabled={!allCharactersSelected || isFetchingDeck}
        className="px-8 py-4 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105"
      >
        {isFetchingDeck ? <Spinner /> : 'Start Battle'}
      </button>
    </div>
  );
};

export default CharacterSelection;