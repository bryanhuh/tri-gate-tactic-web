'use client';

import { useEffect, useState, useRef } from 'react';
import { GameState } from '@/app/types/battle';
import { PlayerUI } from './ui/PlayerUI';
import { OpponentUI } from './ui/OpponentUI';
import { Card } from './Card';
import { FieldSlot } from './FieldSlot';
import { motion, AnimatePresence } from 'framer-motion';
import { GameCharacter } from '@/types/game';
import Image from 'next/image';
import { RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface BattleActions {
  playCard: (card: GameCharacter, position: number) => void;
  selectAttacker: (card: GameCharacter | undefined) => void;
  selectTarget: (card: GameCharacter) => void;
  attack: () => void;
  endTurn: () => void;
}

interface BattleArenaProps {
  gameState: GameState;
  actions: BattleActions;
}

export function BattleArena({ gameState, actions }: BattleArenaProps) {
  const { player, opponent, selectedAttacker, turn, battleLog = [], turnCount = 1 } = gameState;
  const [showPlayerDeck, setShowPlayerDeck] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [selectedHandCard, setSelectedHandCard] = useState<GameCharacter | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [showPhaseAnnouncement, setShowPhaseAnnouncement] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [battleLog]);

  // Phase Announcement Effect
  useEffect(() => {
      let phaseName = '';
      if (gameState.phase === 'setup') phaseName = "DUEL START";
      else if (gameState.turn === 'player') phaseName = "YOUR TURN";
      else if (gameState.turn === 'opponent') phaseName = "OPPONENT TURN";
      else if (gameState.phase === 'game-over') phaseName = "GAME OVER";

      if (phaseName) {
          // Wrap in setTimeout to avoid synchronous state update warning during render phase
          const showTimer = setTimeout(() => {
             setShowPhaseAnnouncement(phaseName);
          }, 0);
          
          const hideTimer = setTimeout(() => setShowPhaseAnnouncement(null), 2000);
          return () => {
              clearTimeout(showTimer);
              clearTimeout(hideTimer);
          };
      }
  }, [gameState.phase, gameState.turn]);


  // Music Control
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = 0.3;
        if (isPlayingMusic) audioRef.current.play().catch(e => console.log("Audio play failed", e));
        else audioRef.current.pause();
    }
  }, [isPlayingMusic]);

  // Player Auto Mode AI
  useEffect(() => {
    if (turn === 'player' && isAutoMode && gameState.phase !== 'game-over') {
        const timer = setTimeout(() => {
            // 1. Try to summon if there's an empty slot
            const emptySlotIndex = player.field.findIndex(slot => slot === null);
            if (emptySlotIndex !== -1 && player.hand.length > 0) {
                actions.playCard(player.hand[0], emptySlotIndex);
                return;
            }

            // 2. Attack logic
            const availableAttackers = player.field.filter(c => c && !c.hasAttacked);
            const availableTargets = opponent.field.filter(c => c !== null);

            if (availableAttackers.length > 0 && availableTargets.length > 0) {
                const attacker = availableAttackers[Math.floor(Math.random() * availableAttackers.length)];
                const target = availableTargets[Math.floor(Math.random() * availableTargets.length)];
                
                if (attacker && target) {
                    actions.selectAttacker(attacker);
                    setTimeout(() => {
                        actions.selectTarget(target);
                        setTimeout(() => {
                            actions.attack();
                            setTimeout(() => {
                                actions.endTurn();
                            }, 1000);
                        }, 500);
                    }, 500);
                }
            } else {
                 actions.endTurn();
            }
        }, 2000);
        return () => clearTimeout(timer);
    }
  }, [turn, isAutoMode, player.field, opponent.field, player.hand, actions, gameState.phase]);

  // Opponent AI
  useEffect(() => {
    if (turn === 'opponent' && gameState.phase !== 'game-over') {
      const timer = setTimeout(() => {
        // 1. Try to summon if there's an empty slot
        const emptySlotIndex = opponent.field.findIndex(slot => slot === null);
        if (emptySlotIndex !== -1 && opponent.hand.length > 0) {
            actions.playCard(opponent.hand[0], emptySlotIndex);
            return;
        }

        // AI Attack Logic
        const availableAttackers = opponent.field.filter(c => c && !c.hasAttacked);
        const availableTargets = player.field.filter(c => c !== null);

        if (availableAttackers.length > 0 && availableTargets.length > 0) {
            const attacker = availableAttackers[Math.floor(Math.random() * availableAttackers.length)];
            const target = availableTargets[Math.floor(Math.random() * availableTargets.length)];
            
            if (attacker && target) {
                actions.selectAttacker(attacker);
                setTimeout(() => {
                    actions.selectTarget(target);
                    setTimeout(() => {
                        actions.attack();
                        setTimeout(() => {
                            actions.endTurn();
                        }, 1000);
                    }, 500);
                }, 500);
            }
        } else {
            actions.endTurn();
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [turn, opponent.field, player.field, opponent.hand, actions, gameState.phase]);

  const handleCardClick = (card: GameCharacter) => {
    if (isAutoMode || gameState.phase === 'game-over') return;
    
    if (gameState.turn === 'player') {
      if (player.field.includes(card) && !card.hasAttacked) {
        actions.selectAttacker(card);
        setSelectedHandCard(null); // Clear hand selection if choosing attacker
      } else if (opponent.field.includes(card) && selectedAttacker) {
        actions.selectTarget(card);
        actions.attack();
      }
    }
  };

  const handleHandCardClick = (card: GameCharacter) => {
    if (isAutoMode || gameState.phase === 'game-over') return;
    if (gameState.turn === 'player') {
        setSelectedHandCard(selectedHandCard?.instanceId === card.instanceId ? null : card);
        actions.selectAttacker(undefined); // Clear attacker selection if choosing hand card
    }
  };

  const handleFieldSlotClick = (position: number) => {
    if (isAutoMode || gameState.phase === 'game-over') return;
    if (gameState.turn === 'player' && selectedHandCard) {
        actions.playCard(selectedHandCard, position);
        setSelectedHandCard(null);
    }
  };

  if (gameState.phase === 'game-over') {
      const playerLost = player.hp <= 0 || (player.field.every(c => c === null) && player.hand.length === 0);
      const winnerAvatar = playerLost ? '/assets/opponent.png' : '/assets/showcase.png';
      const resultImage = playerLost ? '/assets/defeat.jpeg' : '/assets/victory.jpeg';

      return (
          <div className="flex flex-col items-center justify-center w-full h-screen bg-gray-900 text-white overflow-hidden relative z-50">
              <div className={`absolute inset-0 bg-gradient-to-br ${playerLost ? 'from-red-900/90 via-black to-black' : 'from-yellow-600/80 via-black to-blue-900/80'} backdrop-blur-md z-0`}></div>
              
              <div className="z-10 flex flex-col items-center gap-8 w-full max-w-4xl">
                  <motion.div
                      initial={{ scale: 0, opacity: 0, y: -50 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      className="relative"
                  >
                      <Image 
                          src={resultImage} 
                          alt={playerLost ? "Defeat" : "Victory"} 
                          width={600} 
                          height={300}
                          className="object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border-4 border-white/10"
                      />
                  </motion.div>

                  <div className="relative w-full h-64 flex items-center justify-center">
                      <motion.div
                          className="absolute z-20"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1.5 }}
                          transition={{ duration: 0.5 }}
                      >
                          <Image 
                              src={winnerAvatar} 
                              alt="Winner Avatar" 
                              width={100} 
                              height={100} 
                              className={`rounded-full border-4 ${playerLost ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.6)]' : 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.6)]'} object-cover h-[100px] w-[100px]`}
                          />
                      </motion.div>
                  </div>

                  <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.location.reload()}
                      className={`mt-16 px-10 py-4 rounded-full font-bold text-2xl shadow-lg flex items-center gap-3 transition-colors ${playerLost ? 'bg-red-600 hover:bg-red-500' : 'bg-yellow-500 hover:bg-yellow-400 text-black'}`}
                  >
                      <RotateCcw size={24} />
                      Play Again
                  </motion.button>
              </div>
          </div>
      );
  }

  return (
    <div className="flex flex-col w-full h-screen bg-black text-white overflow-hidden relative font-sans">
      <audio ref={audioRef} src="/assets/background.mp3" loop />
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black z-0">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        {/* Animated Particles/Fog can go here */}
      </div>

      {/* Top HUD */}
      <div className="absolute top-0 w-full z-40 flex justify-between items-start p-4 pointer-events-none">
         <div className="pointer-events-auto flex items-center gap-4">
             <div className="bg-black/60 backdrop-blur border border-gray-600 rounded-full px-4 py-2 flex items-center gap-2">
                <span className="text-gray-400 font-bold tracking-widest text-xs">ROUND</span>
                <span className="text-xl font-bold">{turnCount}</span>
             </div>
             
             <button 
                onClick={() => setIsPlayingMusic(!isPlayingMusic)} 
                className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition"
             >
                {isPlayingMusic ? <Volume2 size={20} /> : <VolumeX size={20} />}
             </button>
         </div>

         <div className="pointer-events-auto">
             <OpponentUI opponent={opponent} />
         </div>
      </div>

      {/* Right Sidebar: Battle Log & Controls */}
      <div className="absolute right-0 top-1/4 bottom-32 w-64 p-4 z-40 pointer-events-none flex flex-col items-end gap-4">
          <div className="w-full h-48 bg-black/50 backdrop-blur-md border border-gray-700/50 rounded-lg p-2 overflow-y-auto pointer-events-auto shadow-lg">
             <h3 className="text-xs font-bold text-gray-500 uppercase mb-2 sticky top-0 bg-black/50 backdrop-blur pb-1">Battle Log</h3>
             <div className="flex flex-col gap-1.5 text-xs font-mono">
                {battleLog.map((log, index) => (
                    <div key={index} className="text-gray-300 border-l-2 border-gray-600 pl-2 py-0.5">
                        {log}
                    </div>
                ))}
                <div ref={logEndRef} />
             </div>
          </div>

          <div className="pointer-events-auto flex flex-col gap-2 w-full">
               <button 
                  onClick={() => setIsAutoMode(!isAutoMode)}
                  className={`w-full py-3 rounded font-bold uppercase tracking-wider text-xs shadow-lg transition-all ${isAutoMode ? 'bg-yellow-500/20 border border-yellow-500 text-yellow-500' : 'bg-gray-800/80 border border-gray-600 hover:bg-gray-700'}`}
               >
                  Auto Battle: {isAutoMode ? 'ON' : 'OFF'}
               </button>
               <button 
                  onClick={() => setShowPlayerDeck(true)}
                  className="w-full py-3 bg-blue-600/20 border border-blue-500 hover:bg-blue-600/40 text-blue-400 rounded font-bold uppercase tracking-wider text-xs shadow-lg transition-all"
               >
                  View Deck
               </button>
               <button 
                  onClick={() => actions.endTurn()}
                  disabled={turn !== 'player' || isAutoMode}
                  className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed rounded font-bold uppercase tracking-wider text-sm shadow-red-900/50 shadow-lg transition-all"
               >
                  End Phase
               </button>
          </div>
      </div>

      {/* Main 3D Battlefield */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden z-10 perspective-2000">
          <div className="relative w-[1200px] h-[800px] transform-style-3d rotate-x-30 transition-transform duration-700 ease-in-out">
             
             {/* Board Base / Mat */}
             <div className="absolute inset-0 bg-gray-900/40 rounded-3xl border border-gray-700/30 shadow-[0_0_100px_rgba(0,0,0,0.5)] backdrop-blur-sm transform-style-3d">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
                
                {/* Center Line */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
             </div>

             {/* Opponent Field */}
             <div className="absolute top-20 left-0 right-0 flex justify-center gap-6 transform-style-3d">
                {opponent.field.map((card, index) => (
                    <motion.div 
                        key={index} 
                        onClick={() => card && handleCardClick(card)}
                        whileHover={card && selectedAttacker ? { scale: 1.1, z: 20 } : {}}
                        className={`relative transition-all duration-300 ${selectedAttacker && card ? "ring-4 ring-red-500 rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.6)] cursor-crosshair" : ""}`}
                    >
                        {card ? (
                            <div className="relative shadow-2xl">
                                <Card character={card} />
                                {/* Opponent cards facing player but maybe darker or red tint if enemy? No, keep clear. */}
                            </div>
                        ) : (
                            <FieldSlot />
                        )}
                    </motion.div>
                ))}
             </div>

             {/* Player Field */}
             <div className="absolute bottom-40 left-0 right-0 flex justify-center gap-6 transform-style-3d">
                {player.field.map((card, index) => (
                    <motion.div 
                        key={index} 
                        onClick={() => card && handleCardClick(card)}
                        className={`relative transition-all duration-300 ${selectedAttacker?.instanceId === card?.instanceId ? "ring-4 ring-green-500 rounded-xl shadow-[0_0_40px_rgba(34,197,94,0.6)] z-20 scale-105" : ""}`}
                    >
                        {card ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 2, z: 200 }} 
                                animate={{ opacity: 1, scale: 1, z: 0 }} 
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                className="shadow-2xl"
                            >
                                <Card character={card} />
                                {card.hasAttacked && (
                                    <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                                        <span className="text-xs font-bold uppercase text-white/50 border border-white/20 px-2 py-1 rounded">Exhausted</span>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <FieldSlot onClick={() => handleFieldSlotClick(index)} isActive={!!selectedHandCard && gameState.turn === 'player'} />
                        )}
                    </motion.div>
                ))}
             </div>
          </div>
      </div>

      {/* Phase Announcement Overlay */}
      <AnimatePresence>
        {showPhaseAnnouncement && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
                className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            >
                <div className="w-full bg-gradient-to-r from-transparent via-black/80 to-transparent py-10 flex flex-col items-center">
                    <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-yellow-300 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)] animate-pulse">
                        {showPhaseAnnouncement}
                    </h1>
                    <div className="w-1/2 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mt-4" />
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Player UI (Hand) */}
      <div className="absolute bottom-0 w-full z-30 pointer-events-none">
          <PlayerUI 
            player={player} 
            onCardClick={handleHandCardClick}
            selectedCardId={selectedHandCard?.instanceId}
          />
      </div>

      {/* Deck Modal */}
      <AnimatePresence>
        {showPlayerDeck && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-10"
                onClick={() => setShowPlayerDeck(false)}
            >
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 max-w-5xl max-h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
                    <h2 className="text-2xl font-bold mb-4">Your Deck</h2>
                    <div className="flex flex-wrap gap-4 justify-center">
                        {player.deck.map(card => (
                            <Card key={card.instanceId} character={card} />
                        ))}
                    </div>
                    <button 
                        className="mt-6 w-full py-2 bg-gray-700 hover:bg-gray-600 rounded"
                        onClick={() => setShowPlayerDeck(false)}
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}