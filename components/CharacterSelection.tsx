'use client';

import { useState, useEffect } from 'react';
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
  const [savedTeam, setSavedTeam] = useState<GameCharacter[] | null>(null);

  // Load saved team on mount
  useEffect(() => {
    const saved = localStorage.getItem('anime-battle-saved-team');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 5) {
          // eslint-disable-next-line
          setSavedTeam(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved team", e);
      }
    }
  }, []);

  // Save team when all characters are selected
  useEffect(() => {
    if (characters.every(c => c !== null)) {
      localStorage.setItem('anime-battle-saved-team', JSON.stringify(characters));
    }
  }, [characters]);

  const handleUseSavedTeam = () => {
    if (savedTeam) {
      setCharacters(savedTeam);
      setFlipped(Array(5).fill(true));
    }
  };

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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden">
      
      {/* Info Button */}
      <div className="absolute top-4 right-4 z-50">
        <button 
            onClick={() => setShowInfo(!showInfo)}
            className="w-10 h-10 rounded-full bg-gray-800 border border-gray-600 text-white font-bold hover:bg-gray-700 flex items-center justify-center transition-transform hover:scale-110"
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

      <motion.div 
        className="text-center z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-5xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 drop-shadow-sm">
          ASSEMBLE YOUR TEAM
        </h2>
        <p className="text-lg text-gray-400 mb-8 tracking-wide">Select 5 cards to reveal your champions.</p>
        
        <AnimatePresence>
          {savedTeam && characters.every(c => c === null) && (
             <motion.button
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.8 }}
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={handleUseSavedTeam}
               className="mb-8 px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-full shadow-lg border border-indigo-400/30 hover:shadow-indigo-500/50 transition-all"
             >
               ↺ Reuse Previous Team
             </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div 
        className="flex justify-center gap-6 mb-12 flex-wrap z-10"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {characters.map((character, index) => (
          <motion.div 
            key={index} 
            className={`flip-card ${!flipped[index] ? 'glow' : ''}`} 
            onClick={() => handleCardClick(index)}
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
          >
            <div className={`flip-card-inner ${flipped[index] ? 'flipped' : ''}`}>
              <div className="flip-card-front shadow-xl shadow-blue-900/20">
                <img src="/assets/card.png" alt="Card back" className="w-48 h-64 object-cover rounded-lg" />
              </div>
              <div className="flip-card-back shadow-xl shadow-purple-900/20">
                {loading[index] && <Spinner />}
                {character && <Card character={character} />}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={handleStartBattle}
          disabled={!allCharactersSelected || isFetchingDeck}
          className={`px-10 py-4 font-bold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 ${
            !allCharactersSelected || isFetchingDeck
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/30 hover:shadow-green-500/50'
          }`}
        >
          {isFetchingDeck ? (
             <div className="flex items-center gap-2">
               <Spinner /> <span>Preparing Battle...</span>
             </div>
          ) : (
             'START BATTLE'
          )}
        </button>
      </motion.div>
    </div>
  );
};

export default CharacterSelection;
