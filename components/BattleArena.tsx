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
import { RotateCcw, Volume2, VolumeX, Trophy, Skull, Sword, Shield, Sparkles, AlertTriangle } from 'lucide-react';

interface BattleActions {
  playCard: (card: GameCharacter, position: number) => void;
  swapCard: (handCard: GameCharacter, fieldPosition: number) => void;
  drawWildcard: () => void;
  clearWildcardAlert: () => void;
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

  // Check if Swap is available
  const canSwap = turnCount >= 3 && (turnCount - player.lastSwapTurn) >= 3;

  // Check if Wildcard Draw is available (1 or fewer active cards) for Player
  const activeCardsCount = player.hand.length + player.field.filter(c => c !== null).length;
  const canDrawWildcard = !player.wildcardUsed && activeCardsCount <= 1 && turn === 'player';

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

  // Wildcard Alert Effect
  useEffect(() => {
      if (gameState.wildcardAlert) {
          const timer = setTimeout(() => {
              actions.clearWildcardAlert();
          }, 3000); // Show alert for 3 seconds
          return () => clearTimeout(timer);
      }
  }, [gameState.wildcardAlert, actions]);


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
            // Check for Wildcard logic in Auto Mode (Desperation move)
            const playerActiveCount = player.hand.length + player.field.filter(c => c).length;
            if (playerActiveCount <= 1 && !player.wildcardUsed) {
                actions.drawWildcard();
                return;
            }

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
  }, [turn, isAutoMode, player.field, opponent.field, player.hand, actions, gameState.phase, player.wildcardUsed]);

  // Opponent AI
  useEffect(() => {
    if (turn === 'opponent' && gameState.phase !== 'game-over') {
      const timer = setTimeout(() => {
        // AI Wildcard Logic
        const opponentActiveCount = opponent.hand.length + opponent.field.filter(c => c).length;
        if (opponentActiveCount <= 1 && !opponent.wildcardUsed) {
            actions.drawWildcard();
            return; 
        }

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
  }, [turn, opponent.field, player.field, opponent.hand, actions, gameState.phase, opponent.wildcardUsed]);

  const handleCardClick = (card: GameCharacter) => {
    if (isAutoMode || gameState.phase === 'game-over') return;
    
    if (gameState.turn === 'player') {
      
      // If a hand card is selected and we click a field card (SWAP LOGIC)
      if (selectedHandCard && player.field.includes(card)) {
          if (canSwap) {
              const fieldIndex = player.field.findIndex(c => c?.instanceId === card.instanceId);
              if (fieldIndex !== -1) {
                  actions.swapCard(selectedHandCard, fieldIndex);
                  setSelectedHandCard(null);
              }
          }
          return;
      }

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

  // Helper for Wildcard Alert Styles
  const isPlayerAlert = gameState.wildcardAlert === 'PLAYER';
  const alertColorClass = isPlayerAlert 
      ? 'from-yellow-400 via-yellow-200 to-yellow-400 drop-shadow-[0_0_20px_rgba(234,179,8,0.8)]' 
      : 'from-red-500 via-white to-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]';
  const alertTextClass = isPlayerAlert ? 'text-yellow-200' : 'text-red-200';
  const alertBorderClass = isPlayerAlert ? 'via-yellow-500' : 'via-red-600';

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

      {/* Wildcard Button (Player Only) */}
      <AnimatePresence>
        {canDrawWildcard && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.8, x: -100 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.5, x: -100 }}
                className="absolute left-8 top-1/2 transform -translate-y-1/2 z-50 flex flex-col items-center gap-4 pointer-events-auto"
            >
                <div className="relative">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 rounded-full blur-xl opacity-50"
                    />
                    <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => actions.drawWildcard()}
                        className="relative w-32 h-32 rounded-full bg-black border-4 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.6)] flex flex-col items-center justify-center gap-1 group overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-[url('/assets/card.png')] bg-cover opacity-20 group-hover:opacity-40 transition-opacity" />
                        <Sparkles size={32} className="text-yellow-400 animate-pulse" />
                        <span className="font-black text-yellow-100 text-xs text-center leading-tight uppercase tracking-widest drop-shadow-md">
                            Draw<br/>Wildcard
                        </span>
                    </motion.button>
                </div>
                <div className="bg-black/80 backdrop-blur px-4 py-2 rounded text-center border border-yellow-500/30">
                    <p className="text-yellow-400 font-bold text-xs uppercase tracking-widest">Last Stand Available!</p>
                    <p className="text-gray-400 text-[10px]">Add 2 legendary heroes</p>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

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
                        className={`relative transition-all duration-300 ${
                             selectedAttacker?.instanceId === card?.instanceId 
                             ? "ring-4 ring-green-500 rounded-xl shadow-[0_0_40px_rgba(34,197,94,0.6)] z-20 scale-105" 
                             : selectedHandCard && canSwap ? "ring-4 ring-blue-500 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.5)] cursor-alias" : ""
                        }`}
                        whileHover={selectedHandCard && canSwap && card ? { scale: 1.1, z: 20 } : {}}
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

      {/* Wildcard Alert Overlay */}
      <AnimatePresence>
        {gameState.wildcardAlert && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
                className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
            >
                <div className="w-full bg-gradient-to-r from-transparent via-black/80 to-transparent py-10 flex flex-col items-center">
                    <h1 className={`text-5xl md:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r ${alertColorClass} animate-pulse uppercase`}>
                        {gameState.wildcardAlert} USED WILDCARD!
                    </h1>
                    <div className={`flex items-center gap-2 mt-2 font-mono tracking-widest text-sm uppercase ${alertTextClass}`}>
                        <AlertTriangle size={16} />
                        Reinforcements Incoming
                        <AlertTriangle size={16} />
                    </div>
                    <div className={`w-1/2 h-1 bg-gradient-to-r from-transparent ${alertBorderClass} to-transparent mt-4`} />
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Modal Overlay */}
      <AnimatePresence>
        {gameState.phase === 'game-over' && (
             <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
             >
                <motion.div
                    initial={{ scale: 0.9, y: 50, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.4 }}
                    className="w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl relative"
                >
                    {/* Header */}
                    <div className="relative h-48 flex items-center justify-center overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-b ${player.hp <= 0 ? 'from-red-900/50' : 'from-yellow-600/50'} to-gray-900 z-0`} />
                        <Image 
                             src={player.hp <= 0 ? '/assets/defeat.jpeg' : '/assets/victory.jpeg'} 
                             alt={player.hp <= 0 ? "Defeat" : "Victory"}
                             layout="fill"
                             objectFit="cover"
                             className="opacity-40 z-0"
                        />
                        <div className="z-10 flex flex-col items-center">
                            <h2 className={`text-6xl font-black tracking-tighter drop-shadow-lg ${player.hp <= 0 ? 'text-red-500' : 'text-yellow-400'}`}>
                                {player.hp <= 0 ? "DEFEAT" : "VICTORY"}
                            </h2>
                            <p className="text-gray-300 font-bold tracking-widest mt-2 uppercase">
                                {player.hp <= 0 ? "Better luck next time" : "You are the champion"}
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="p-8 grid grid-cols-2 gap-6 bg-gray-900/50 relative z-10">
                        <div className="flex items-center gap-4 bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                             <div className="p-3 bg-red-500/20 rounded-lg text-red-400">
                                 <Sword size={24} />
                             </div>
                             <div>
                                 <div className="text-sm text-gray-400 uppercase font-bold">Damage Dealt</div>
                                 <div className="text-2xl font-mono font-bold text-white">
                                     {1000 - opponent.hp}
                                 </div>
                             </div>
                        </div>

                        <div className="flex items-center gap-4 bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                             <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                                 <Shield size={24} />
                             </div>
                             <div>
                                 <div className="text-sm text-gray-400 uppercase font-bold">Damage Taken</div>
                                 <div className="text-2xl font-mono font-bold text-white">
                                     {1000 - player.hp}
                                 </div>
                             </div>
                        </div>

                         <div className="flex items-center gap-4 bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                             <div className="p-3 bg-green-500/20 rounded-lg text-green-400">
                                 <Skull size={24} />
                             </div>
                             <div>
                                 <div className="text-sm text-gray-400 uppercase font-bold">Enemies Slain</div>
                                 <div className="text-2xl font-mono font-bold text-white">
                                     {opponent.graveyard.length}
                                 </div>
                             </div>
                        </div>

                         <div className="flex items-center gap-4 bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                             <div className="p-3 bg-yellow-500/20 rounded-lg text-yellow-400">
                                 <Trophy size={24} />
                             </div>
                             <div>
                                 <div className="text-sm text-gray-400 uppercase font-bold">Rounds Played</div>
                                 <div className="text-2xl font-mono font-bold text-white">
                                     {turnCount}
                                 </div>
                             </div>
                        </div>
                    </div>

                    {/* Footer / Actions */}
                    <div className="p-6 border-t border-gray-700 bg-black/20 flex justify-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.location.reload()}
                            className={`px-12 py-4 rounded-full font-bold text-xl shadow-lg flex items-center gap-3 transition-colors ${player.hp <= 0 ? 'bg-red-600 hover:bg-red-500' : 'bg-yellow-500 hover:bg-yellow-400 text-black'}`}
                        >
                            <RotateCcw size={24} />
                            Play Again
                        </motion.button>
                    </div>

                </motion.div>
             </motion.div>
        )}
      </AnimatePresence>

      {/* Player UI (Hand) */}
      <div className="absolute bottom-0 w-full z-30 pointer-events-none">
          <PlayerUI 
            player={player} 
            onCardClick={handleHandCardClick}
            selectedCardId={selectedHandCard?.instanceId}
            canSwap={canSwap}
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