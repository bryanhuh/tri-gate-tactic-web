'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GameCharacter } from '@/types/game';
import { searchCharacters } from '@/lib/anilist-service';
import CharacterSearch from './CharacterSearch';
import { Card } from '@/components/Card';
import { Spinner } from '@/components/ui/Loaders';
import { Trash2, Play, ChevronLeft } from 'lucide-react';
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

  // Load deck from localStorage on mount
  useEffect(() => {
    const savedDeck = localStorage.getItem('anime-battle-saved-team');
    if (savedDeck) {
      try {
        const parsed = JSON.parse(savedDeck);
        if (Array.isArray(parsed)) {
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
        showToast("Deck is full! Max 5 characters.", 'error');
        return;
    }
    if (deck.some(c => c.id === char.id)) {
        showToast("Character already in deck!", 'error');
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
        showToast("You need 5 characters to start!", 'error');
        return;
    }
    router.push('/');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900 text-gray-100">
        <Toast
            message={toast.message}
            type={toast.type}
            isVisible={toast.isVisible}
            onClose={() => setToast({ ...toast, isVisible: false })}
        />

      {/* Left Panel: Search & Results */}
      <div className="flex-1 flex flex-col p-6 border-r border-gray-800 overflow-hidden relative">
        <div className="flex items-center gap-4 mb-6">
            <Link href="/" className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
                <ChevronLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                Deck Builder
            </h1>
        </div>
        
        <CharacterSearch onSearch={handleSearch} />

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 pr-2">
            {loading ? (
                <div className="flex justify-center mt-20"><Spinner /></div>
            ) : results.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 p-2">
                    {results.map(char => (
                        <motion.div 
                            key={char.id} 
                            className="relative group flex justify-center"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                             <Card character={char} onClick={() => addToDeck(char)} className="cursor-pointer hover:ring-2 hover:ring-green-400 transition-all" />
                             {deck.some(c => c.id === char.id) && (
                                 <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl pointer-events-none z-20">
                                     <span className="text-green-400 font-bold border-2 border-green-400 px-3 py-1 rounded-full -rotate-12 bg-black/50">IN DECK</span>
                                 </div>
                             )}
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500 mt-20 flex flex-col items-center">
                    <p className="text-xl mb-2">Search for characters to add to your deck.</p>
                    <p className="text-sm opacity-60">Type a name above to begin.</p>
                </div>
            )}
        </div>
      </div>

      {/* Right Panel: My Deck */}
      <div className="w-96 flex flex-col bg-gray-800/50 p-6 shadow-xl relative backdrop-blur-sm border-l border-gray-700/50">
        <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
                 Your Team <span className={`text-sm px-2 py-0.5 rounded-full font-mono ${deck.length === 5 ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-300'}`}>{deck.length}/5</span>
             </h2>
             {deck.length > 0 && (
                <button
                    onClick={() => setDeck([])}
                    className="text-gray-400 hover:text-red-400 transition-colors p-2 hover:bg-gray-700/50 rounded-lg"
                    title="Clear Deck"
                >
                    <Trash2 size={20} />
                </button>
             )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-600">
            <AnimatePresence>
                {deck.map((char) => (
                    <motion.div
                        key={char.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex items-center gap-3 bg-gray-900/80 p-3 rounded-lg border border-gray-700 group hover:border-red-500/50 transition-colors cursor-pointer relative overflow-hidden"
                        onClick={() => removeFromDeck(char.id)}
                    >
                        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-gray-600">
                            <img src={char.image} alt={char.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 z-10">
                            <div className="font-bold text-sm truncate text-gray-200">{char.name}</div>
                            <div className="text-xs text-gray-400 flex gap-3 mt-1 font-mono">
                                <span className={`font-bold ${char.tier.startsWith('S') ? 'text-yellow-400' : 'text-blue-400'}`}>{char.tier}</span>
                                <span>HP {char.stats.hp}</span>
                                <span>POW {char.stats.power}</span>
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-4">
                            <Trash2 size={18} className="text-red-400" />
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
            {deck.length === 0 && (
                <div className="text-center text-gray-500 mt-10 border-2 border-dashed border-gray-700 rounded-lg p-8 bg-gray-800/20">
                    <p className="font-semibold">Your deck is empty.</p>
                    <p className="text-sm mt-2 opacity-70">Add 5 characters to start.</p>
                </div>
            )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700">
            {deck.length > 0 && (
                <div className="mb-4 grid grid-cols-2 gap-2 text-xs text-gray-400 font-mono">
                    <div className="bg-gray-800 p-2 rounded text-center">
                        <div className="opacity-60">Avg HP</div>
                        <div className="text-white font-bold text-sm">{Math.round(deck.reduce((a, b) => a + b.stats.hp, 0) / deck.length)}</div>
                    </div>
                    <div className="bg-gray-800 p-2 rounded text-center">
                        <div className="opacity-60">Avg POW</div>
                        <div className="text-white font-bold text-sm">{Math.round(deck.reduce((a, b) => a + b.stats.power, 0) / deck.length)}</div>
                    </div>
                </div>
            )}
             <button
                onClick={startGame}
                disabled={deck.length !== 5}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    deck.length === 5
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-105 shadow-lg shadow-green-900/20'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
             >
                 <Play size={20} fill="currentColor" />
                 START BATTLE
             </button>
        </div>
      </div>
    </div>
  );
}
