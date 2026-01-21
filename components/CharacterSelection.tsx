'use client';

import { useState, useEffect, useRef } from 'react';
import type { GameCharacter } from '@/types/game';
import { getRandomCharacter } from '@/lib/anilist-service';
import { Card } from './Card';
import { Spinner } from './ui/Loaders';
import { motion, AnimatePresence } from 'framer-motion';
import { Toast, ToastType } from './ui/Toast';
import { Volume2, VolumeX, Info, RefreshCw, Play, Sparkles } from 'lucide-react';

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
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // Audio Control
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = 0.3;
        if (!isMuted) {
            // Attempt to play, but browsers might block autoplay until interaction
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // Auto-play was prevented.
                    setIsMuted(true);
                });
            }
        } else {
             audioRef.current.pause();
        }
    }
  }, [isMuted]);

  // Load saved team on mount
  useEffect(() => {
    const saved = localStorage.getItem('anime-battle-saved-team');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 5) {
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
      showToast('Previous squad deployed!', 'success');
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
    
    try {
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
        } else {
            showToast('Summon failed. Retry protocol initiated.', 'error');
        }
    } catch {
        showToast('Network uplink failed.', 'error');
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

    try {
        while (opponentDeck.length < 5 && attempts < maxAttempts) {
            attempts++;
            const char = await getRandomCharacter(excludeNames);
            if (char) {
                opponentDeck.push(char);
                excludeNames.push(char.name);
            }
        }

        if (opponentDeck.length === 5) {
            await onBattleStart(playerDeck, opponentDeck);
        } else {
            showToast('Opponent matching failed. Retry.', 'error');
        }
    } catch {
        showToast('Battle simulation failed to start.', 'error');
    } finally {
        setIsFetchingDeck(false);
    }
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
    hidden: { y: 20, opacity: 0, scale: 0.9 },
    show: { y: 0, opacity: 1, scale: 1 }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden bg-black font-sans">
      <audio ref={audioRef} src="/assets/background.mp3" loop />

      {/* Background Video/Effects */}
      <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover opacity-40"
          >
              <source src="/assets/video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-yellow-900/20" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30" />
      </div>

      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={closeToast} 
      />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-50">
          <div className="flex items-center gap-4">
               {/* Brand or Back button could go here */}
          </div>
          <div className="flex gap-4">
              <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-12 h-12 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 group"
              >
                  {isMuted ? <VolumeX size={20} className="text-gray-400" /> : <Volume2 size={20} className="text-yellow-400 group-hover:text-yellow-300" />}
              </button>
              <button 
                  onClick={() => setShowInfo(!showInfo)}
                  className="w-12 h-12 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 group"
              >
                  <Info size={20} className="text-yellow-400 group-hover:text-yellow-300" />
              </button>
          </div>
      </div>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfo && (
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute top-24 right-6 w-96 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl z-50 text-sm text-gray-300"
            >
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                    <h3 className="text-white font-black italic text-xl uppercase tracking-wider">Battle Manual</h3>
                    <button onClick={() => setShowInfo(false)} className="text-gray-500 hover:text-white transition-colors">✕</button>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <h4 className="text-yellow-400 font-bold mb-2 uppercase text-xs tracking-widest flex items-center gap-2">
                             <Sparkles size={14} /> Neural Interface
                        </h4>
                        <p className="text-gray-400 leading-relaxed">
                            Initialize your combat squad by selecting 5 data cards. Each selection pulls a random champion from the global database.
                        </p>
                    </div>

                    <div>
                         <h4 className="text-orange-400 font-bold mb-2 uppercase text-xs tracking-widest">
                            Stat Algorithms
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                             <div className="bg-white/5 p-2 rounded border border-white/5">
                                 <div className="text-red-400 font-bold text-xs">POWER</div>
                                 <div className="text-[10px] text-gray-500">Based on Global Score</div>
                             </div>
                             <div className="bg-white/5 p-2 rounded border border-white/5">
                                 <div className="text-blue-400 font-bold text-xs">DEFENSE</div>
                                 <div className="text-[10px] text-gray-500">Based on Fan Base</div>
                             </div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="text-yellow-400 font-bold mb-2 uppercase text-xs tracking-widest">
                            Class Tiers
                        </h4>
                        <div className="flex flex-wrap gap-1">
                            {['S++', 'S+', 'S', 'A+', 'A', 'B', 'C', 'D'].map((tier) => (
                                <span key={tier} className={`px-2 py-1 rounded text-[10px] font-mono font-bold border ${
                                    tier.startsWith('S') ? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10' :
                                    tier.startsWith('A') ? 'border-orange-500/50 text-orange-400 bg-orange-500/10' :
                                    tier.startsWith('B') ? 'border-red-500/50 text-red-400 bg-red-500/10' :
                                    'border-gray-500/50 text-gray-400 bg-gray-500/10'
                                }`}>
                                    {tier}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="text-center z-10 mb-10 relative"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
         <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-yellow-500/10 blur-[100px] -z-10 rounded-full pointer-events-none" />
        
        <h2 className="text-7xl font-black italic tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
          INITIALIZE SQUAD
        </h2>
        <p className="text-lg text-yellow-200/60 tracking-[0.2em] font-mono uppercase">
            Reveal <span className="text-yellow-400 font-bold">5 Champions</span> to engage
        </p>
        
        <AnimatePresence>
          {savedTeam && characters.every(c => c === null) && (
             <motion.button
               initial={{ opacity: 0, scale: 0.8, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.8, y: 20 }}
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={handleUseSavedTeam}
               className="mt-8 px-8 py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-yellow-500/50 text-yellow-400 font-bold rounded-full backdrop-blur-md flex items-center gap-2 mx-auto transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] group"
             >
               <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
               <span>RELOAD LAST CONFIG</span>
             </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div 
        className="flex justify-center gap-6 mb-16 flex-wrap z-10 w-full max-w-[1400px] px-4 perspective-1000"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {characters.map((character, index) => (
          <motion.div 
            key={index} 
            className={`flip-card w-48 h-72 cursor-pointer relative group ${!flipped[index] ? 'hover:scale-105 transition-transform duration-300' : ''}`} 
            onClick={() => handleCardClick(index)}
            variants={itemVariants}
          >
            <div className={`flip-card-inner transition-all duration-700 ${flipped[index] ? 'flipped' : ''}`}>
              
              {/* Front (Back of Card) */}
              <div className="flip-card-front rounded-xl overflow-hidden shadow-2xl relative border border-white/10 bg-gray-900">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black" />
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-60">
                    <img src="/assets/card.png" alt="Card Back" className="w-full h-full object-cover opacity-50 grayscale contrast-125" />
                </div>
                {/* Holographic overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-2 border-yellow-500/30 flex items-center justify-center bg-black/50 backdrop-blur-sm group-hover:scale-110 transition-transform duration-500 group-hover:border-yellow-400">
                        <span className="text-2xl font-black text-yellow-500/50 group-hover:text-yellow-400 transition-colors">?</span>
                    </div>
                    <p className="mt-4 text-xs font-mono text-yellow-500/50 tracking-widest uppercase group-hover:text-yellow-400">Click to Reveal</p>
                </div>
              </div>

              {/* Back (Character Revealed) */}
              <div className="flip-card-back rounded-xl overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.3)] relative bg-gray-900 border border-yellow-500/30">
                {loading[index] ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-20">
                        <Spinner />
                        <span className="mt-4 text-xs font-mono text-yellow-400 animate-pulse tracking-widest">DECRYPTING...</span>
                    </div>
                ) : null}
                {character && <Card character={character} className="w-full h-full" />}
              </div>
            </div>
            
            {/* Glow effect for unrevealed cards */}
            {!flipped[index] && (
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-500 -z-10" />
            )}
          </motion.div>
        ))}
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: 'spring' }}
        className="z-20 pb-10"
      >
        <button
          onClick={handleStartBattle}
          disabled={!allCharactersSelected || isFetchingDeck}
          className={`group relative px-12 py-5 font-black italic text-xl tracking-wider rounded-lg overflow-hidden transition-all duration-300 ${
            !allCharactersSelected || isFetchingDeck
              ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed border border-white/5'
              : 'bg-transparent text-white shadow-[0_0_40px_rgba(234,179,8,0.3)] hover:shadow-[0_0_60px_rgba(234,179,8,0.5)] border border-yellow-500/50'
          }`}
        >
          {allCharactersSelected && !isFetchingDeck && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                
                {/* Button shine effect */}
                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 skew-x-12" />
              </>
          )}

          <div className="relative flex items-center gap-3">
            {isFetchingDeck ? (
               <>
                 <Spinner />  
                 <span className="animate-pulse">SYNCHRONIZING BATTLEFIELD...</span>
               </>
            ) : (
               <>
                 <span className="group-hover:translate-x-1 transition-transform">INITIATE COMBAT</span>
                 <Play fill="currentColor" size={20} className="group-hover:translate-x-1 transition-transform" />
               </>
            )}
          </div>
        </button>
      </motion.div>
    </div>
  );
};

export default CharacterSelection;