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
import { Play, RotateCcw } from 'lucide-react';

interface BattleArenaProps {
  gameState: GameState;
  actions: any;
}

export function BattleArena({ gameState, actions }: BattleArenaProps) {
  const { player, opponent, selectedAttacker, turn, battleLog = [], turnCount = 1 } = gameState;
  const [showPlayerDeck, setShowPlayerDeck] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [selectedHandCard, setSelectedHandCard] = useState<GameCharacter | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [battleLog]);

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

  const handleCardClick = (card: any) => {
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
        actions.selectAttacker(undefined as any); // Clear attacker selection if choosing hand card
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
      const winner = playerLost ? 'Opponent' : 'Player';
      const winnerAvatar = playerLost ? '/assets/opponent.png' : '/assets/showcase.png';
      const winnerCards = playerLost ? opponent.field : player.field;
      const resultImage = playerLost ? '/assets/defeat.jpeg' : '/assets/victory.jpeg';

      // Animation start positions
      const initialAvatarPos = playerLost 
          ? { top: '10%', left: '10%', scale: 0.5 } 
          : { bottom: '10%', left: '10%', scale: 0.5 };

      return (
          <div className="flex flex-col items-center justify-center w-full h-screen bg-gray-900 text-white overflow-hidden relative z-50">
              {/* Dynamic Background */}
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
                      <div className="absolute inset-0 rounded-2xl shadow-inner pointer-events-none"></div>
                  </motion.div>

                  <div className="relative w-full h-64 flex items-center justify-center">
                      <motion.div
                          className="absolute z-20"
                          initial={initialAvatarPos as any}
                          animate={{ top: '50%', left: '50%', x: '-50%', y: '-50%', scale: 1.5, bottom: 'auto' }}
                          transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
                      >
                          <Image 
                              src={winnerAvatar} 
                              alt="Winner Avatar" 
                              width={100} 
                              height={100} 
                              className={`rounded-full border-4 ${playerLost ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.6)]' : 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.6)]'} object-cover h-[100px] w-[100px]`}
                          />
                      </motion.div>
                      
                      {/* Winner's Cards animating in */}
                      <div className="flex gap-6 items-center justify-center absolute top-28 w-full">
                          {winnerCards.map((card, index) => card ? (
                              <motion.div
                                  key={card.instanceId}
                                  initial={{ opacity: 0, y: 100, rotate: -10 }}
                                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                                  transition={{ delay: 0.8 + (index * 0.15), type: "spring" }}
                              >
                                  <Card character={card} className={`scale-75 shadow-xl ${playerLost ? 'border-red-500/50' : 'border-yellow-400/50'}`} />
                              </motion.div>
                          ) : null)}
                      </div>
                  </div>

                  <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255,255,255,0.3)" }}
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
    <div className="flex flex-col items-center justify-between w-full h-screen bg-gray-900 text-white overflow-hidden relative">
      
      {/* Round Indicator */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-black/50 backdrop-blur-md border border-gray-600 px-6 py-2 rounded-full shadow-lg">
         <h2 className="text-xl font-bold tracking-widest text-white">ROUND {turnCount}</h2>
      </div>

      {/* Battle Status / Turn Indicator */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 opacity-20">
         <h1 className="text-9xl font-bold uppercase tracking-widest">{turn}</h1>
      </div>

      {/* Battle Log */}
      <div className="absolute top-20 right-4 w-80 h-48 bg-black/60 backdrop-blur-sm border border-gray-700 rounded-lg p-2 overflow-y-auto z-20 text-sm font-mono shadow-lg">
          <h3 className="text-gray-400 text-xs uppercase mb-2 border-b border-gray-700 pb-1">Battle Log</h3>
          <div className="flex flex-col gap-1">
             {battleLog.map((log, index) => (
                 <div key={index} className="text-gray-200 break-words leading-tight">
                     <span className="text-gray-500 mr-2">[{index + 1}]</span>
                     {log}
                 </div>
             ))}
             <div ref={logEndRef} />
          </div>
      </div>

      <div className="w-full z-10 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700">
          <OpponentUI opponent={opponent} />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center gap-12 w-full z-10 px-4">
        {/* Opponent Field */}
        <div className="flex gap-4">
          {opponent.field.map((card, index) => (
            <motion.div 
                key={index} 
                onClick={() => card && handleCardClick(card)}
                whileHover={card && selectedAttacker ? { scale: 1.1, cursor: 'crosshair' } : {}}
                className={selectedAttacker && card ? "ring-2 ring-red-500 rounded-xl" : ""}
            >
              {card ? <Card character={card} /> : <FieldSlot />}
            </motion.div>
          ))}
        </div>

        {/* Player Field */}
        <div className="flex gap-4">
          {player.field.map((card, index) => (
            <motion.div 
                key={index} 
                onClick={() => card && handleCardClick(card)}
                whileHover={gameState.turn === 'player' && card && !card.hasAttacked ? { scale: 1.1, cursor: 'pointer' } : {}}
                className={selectedAttacker?.instanceId === card?.instanceId ? "ring-4 ring-green-500 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.5)]" : ""}
            >
              {card ? <Card character={card} /> : <FieldSlot onClick={() => handleFieldSlotClick(index)} />}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="w-full z-10 bg-gray-800/80 backdrop-blur-sm border-t border-gray-700 relative">
          <PlayerUI 
            player={player} 
            onCardClick={handleHandCardClick}
            selectedCardId={selectedHandCard?.instanceId}
          />
          
          <div className="absolute bottom-4 right-4 flex gap-2">
             <button 
                onClick={() => setIsAutoMode(!isAutoMode)}
                className={`px-4 py-2 rounded font-bold ${isAutoMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-500'}`}
             >
                Mode: {isAutoMode ? 'Auto' : 'Manual'}
             </button>
             <button 
                onClick={() => setShowPlayerDeck(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-bold"
             >
                View Deck
             </button>
             <button 
                onClick={() => actions.endTurn()}
                disabled={turn !== 'player' || isAutoMode}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded font-bold"
             >
                End Turn
             </button>
          </div>
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
