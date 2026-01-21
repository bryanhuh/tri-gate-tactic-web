'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { GameCharacter } from '@/types/game';
import { searchCharacters } from '@/lib/anilist-service';
import CharacterSearch from './CharacterSearch';
import { Card } from '@/components/Card';
import { Spinner } from '@/components/ui/Loaders';
import { Trash2, Play, ChevronLeft, Volume2, VolumeX, Search as SearchIcon, Shield, Zap, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toast, ToastType } from '@/components/ui/Toast';
import Link from 'next/link';

export default function DeckBuilder() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GameCharacter[]>([]);
  const [deck, setDeck] = useState<GameCharacter[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({ 
    message: '', 
    type: 'info', 
    isVisible: false 
  });
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load deck from localStorage on mount
  useEffect(() => {
    const savedDeck = localStorage.getItem('anime-battle-saved-team');
    if (savedDeck) {
      try {
        const parsed = JSON.parse(savedDeck);
        if (Array.isArray(parsed)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setDeck(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved deck", e);
      }
    }
  }, []);

  // Save deck to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('anime-battle-saved-team', JSON.stringify(deck));
  }, [deck]);

  // Audio Control
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = 0.4;
        if (!isMuted) {
             audioRef.current.play().catch(() => {});
        } else {
             audioRef.current.pause();
        }
    }
  }, [isMuted]);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const chars = await searchCharacters(q);
    setResults(chars);
    setLoading(false);
  };

  const addToDeck = (char: GameCharacter) => {
    if (deck.length >= 5) {
        showToast("Team is full! Max 5 champions.", 'error');
        return;
    }
    if (deck.some(c => c.id === char.id)) {
        showToast("Champion already drafted!", 'error');
        return;
    }
    const newChar = { ...char, instanceId: crypto.randomUUID() };
    setDeck([...deck, newChar]);
  };

  const removeFromDeck = (charId: number) => {
    setDeck(deck.filter(c => c.id !== charId));
  };

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const startGame = () => {
    if (deck.length < 5) {
        showToast("Recruit 5 champions to begin!", 'error');
        return;
    }
    localStorage.setItem('anime-battle-ready-to-play', 'true');
    router.push('/');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-black text-gray-100 relative font-sans">
         <audio ref={audioRef} src="/assets/background.mp3" loop />
        
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
             <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover opacity-30"
            >
                <source src="/assets/video.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-indigo-900/40" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        </div>

        <Toast
            message={toast.message}
            type={toast.type}
            isVisible={toast.isVisible}
            onClose={() => setToast({ ...toast, isVisible: false })}
        />

      {/* Left Panel: Search & Results */}
      <div className="flex-1 flex flex-col p-6 z-10 border-r border-white/10 relative backdrop-blur-sm">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <Link href="/" className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/20 transition-all hover:scale-110 group">
                    <ChevronLeft size={24} className="text-gray-300 group-hover:text-white" />
                </Link>
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-white drop-shadow-lg uppercase">
                        Archive
                    </h1>
                    <p className="text-xs text-blue-300/70 tracking-widest uppercase font-mono">Select your champions</p>
                </div>
            </div>
             <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
            >
                {isMuted ? <VolumeX size={20} className="text-gray-400" /> : <Volume2 size={20} className="text-blue-400" />}
            </button>
        </div>
        
        <div className="relative mb-8 group">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-cyan-500/70 group-focus-within:text-cyan-400 transition-colors" />
            </div>
             <CharacterSearch onSearch={handleSearch} />
             <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-900/50 scrollbar-track-transparent pr-2 mask-linear-fade">
            {loading ? (
                <div className="flex flex-col items-center justify-center mt-32 gap-4">
                    <Spinner />
                    <span className="text-cyan-400 font-mono text-sm animate-pulse">Scanning Database...</span>
                </div>
            ) : results.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 p-2 pb-20">
                    {results.map(char => {
                         const isInDeck = deck.some(c => c.id === char.id);
                         return (
                            <motion.div 
                                key={char.id} 
                                className="relative group perspective-1000"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <Card 
                                    character={char} 
                                    onClick={() => addToDeck(char)} 
                                    className={`cursor-pointer transition-all duration-300 ${isInDeck ? 'grayscale opacity-50' : 'hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:border-cyan-400'}`} 
                                />
                                {isInDeck && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                                        <div className="bg-black/80 backdrop-blur border border-green-500/50 text-green-400 font-bold px-4 py-2 rounded-lg -rotate-12 shadow-xl border-dashed border-2">
                                            DRAFTED
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
                    <SearchIcon size={64} className="mb-4 text-gray-700" />
                    <p className="text-xl font-bold uppercase tracking-widest text-gray-600">Database Ready</p>
                    <p className="text-sm font-mono text-gray-600 mt-2">Enter a name to begin search sequence.</p>
                </div>
            )}
        </div>
      </div>

      {/* Right Panel: My Deck */}
      <div className="w-[450px] flex flex-col bg-gray-900/60 backdrop-blur-xl border-l border-white/10 shadow-2xl z-20 relative">
         {/* Holographic Edge Line */}
         <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent" />

        <div className="p-6 border-b border-white/5 bg-gradient-to-r from-gray-900/50 to-transparent">
             <div className="flex justify-between items-end mb-2">
                 <div>
                    <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase drop-shadow-md">
                        Squad Roster
                    </h2>
                    <p className="text-xs text-purple-300/70 font-mono uppercase tracking-widest">Manage your team</p>
                 </div>
                 <div className="text-right">
                    <span className={`text-4xl font-black leading-none ${deck.length === 5 ? 'text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'text-gray-600'}`}>
                        {deck.length}
                    </span>
                    <span className="text-lg text-gray-600 font-bold">/5</span>
                 </div>
             </div>
             
             {/* Stats Bar */}
            {deck.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                     <div className="bg-white/5 rounded p-2 flex flex-col items-center border border-white/5">
                        <Heart size={14} className="text-red-400 mb-1" />
                        <span className="text-[10px] text-gray-400 uppercase font-bold">Avg HP</span>
                        <span className="text-white font-mono font-bold">{Math.round(deck.reduce((a, b) => a + b.stats.hp, 0) / deck.length)}</span>
                     </div>
                     <div className="bg-white/5 rounded p-2 flex flex-col items-center border border-white/5">
                        <Zap size={14} className="text-yellow-400 mb-1" />
                        <span className="text-[10px] text-gray-400 uppercase font-bold">Avg Pow</span>
                        <span className="text-white font-mono font-bold">{Math.round(deck.reduce((a, b) => a + b.stats.power, 0) / deck.length)}</span>
                     </div>
                     <div className="bg-white/5 rounded p-2 flex flex-col items-center border border-white/5">
                        <Shield size={14} className="text-blue-400 mb-1" />
                        <span className="text-[10px] text-gray-400 uppercase font-bold">Avg Def</span>
                        <span className="text-white font-mono font-bold">{Math.round(deck.reduce((a, b) => a + b.stats.defense, 0) / deck.length)}</span>
                     </div>
                </div>
            )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-700">
            <AnimatePresence>
                {deck.map((char, index) => (
                    <motion.div
                        key={char.id}
                        layout
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="group relative flex items-center gap-4 bg-gray-800/40 border border-white/5 p-3 rounded-xl hover:bg-gray-800/80 hover:border-purple-500/30 transition-all cursor-pointer overflow-hidden"
                    >
                         {/* Card Background Gradient */}
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                         
                         {/* Number Badge */}
                         <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-700 group-hover:bg-purple-500 transition-colors" />
                         
                         <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 border-gray-700 group-hover:border-purple-400 shadow-lg transition-colors">
                            <img src={char.image} alt={char.name} className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="flex-1 z-10 min-w-0">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-gray-200 group-hover:text-white truncate pr-2">{char.name}</h3>
                                <div className={`text-xs font-black px-1.5 py-0.5 rounded border ${
                                    char.tier.startsWith('S') ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' :
                                    char.tier.startsWith('A') ? 'bg-purple-500/20 border-purple-500 text-purple-400' :
                                    'bg-blue-500/20 border-blue-500 text-blue-400'
                                }`}>
                                    {char.tier}
                                </div>
                            </div>
                            
                            <div className="flex gap-3 mt-1.5">
                                <div className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-red-500" />
                                    POW {char.stats.power}
                                </div>
                                <div className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-blue-500" />
                                    DEF {char.stats.defense}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={(e) => { e.stopPropagation(); removeFromDeck(char.id); }}
                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors z-20"
                        >
                            <Trash2 size={18} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
            
            {Array.from({ length: Math.max(0, 5 - deck.length) }).map((_, i) => (
                <div key={`empty-${i}`} className="border-2 border-dashed border-gray-800 rounded-xl p-4 flex items-center justify-center h-[88px] opacity-50">
                    <span className="text-gray-700 font-mono text-xs uppercase tracking-widest">Empty Slot {deck.length + i + 1}</span>
                </div>
            ))}
        </div>

        <div className="p-6 border-t border-white/10 bg-black/40 backdrop-blur-md">
            {deck.length > 0 && (
                 <button
                    onClick={() => setDeck([])}
                    className="w-full mb-3 py-2 text-xs font-bold text-red-400/50 hover:text-red-400 uppercase tracking-widest hover:bg-red-900/10 rounded transition-colors"
                >
                    Clear Roster
                </button>
            )}
             <button
                onClick={startGame}
                disabled={deck.length !== 5}
                className={`w-full py-5 rounded-lg font-black italic tracking-wider text-lg flex items-center justify-center gap-3 transition-all relative overflow-hidden group ${
                    deck.length === 5
                    ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_50px_rgba(16,185,129,0.6)] hover:scale-[1.02]'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                }`}
             >
                 {deck.length === 5 && (
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
                 )}
                 <Play size={24} fill="currentColor" className={deck.length === 5 ? "animate-pulse" : ""} />
                 INITIALIZE BATTLE
             </button>
        </div>
      </div>
    </div>
  );
}
