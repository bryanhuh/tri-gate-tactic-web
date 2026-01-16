'use client';

import { useEffect, useState, useRef } from 'react';
import { GameState } from '@/app/types/battle';
import { PlayerUI } from './ui/PlayerUI';
import { OpponentUI } from './ui/OpponentUI';
import { Card } from './Card';
import { FieldSlot } from './FieldSlot';
import { motion, AnimatePresence } from 'framer-motion';
import { GameCharacter } from '@/types/game';

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
    if (turn === 'player' && isAutoMode) {
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
  }, [turn, isAutoMode, player.field, opponent.field, player.hand, actions]);

  // Opponent AI
  useEffect(() => {
    if (turn === 'opponent') {
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
  }, [turn, opponent.field, player.field, opponent.hand, actions]);

  const handleCardClick = (card: any) => {
    if (isAutoMode) return;
    
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
    if (isAutoMode) return;
    if (gameState.turn === 'player') {
        setSelectedHandCard(selectedHandCard?.instanceId === card.instanceId ? null : card);
        actions.selectAttacker(undefined as any); // Clear attacker selection if choosing hand card
    }
  };

  const handleFieldSlotClick = (position: number) => {
    if (isAutoMode) return;
    if (gameState.turn === 'player' && selectedHandCard) {
        actions.playCard(selectedHandCard, position);
        setSelectedHandCard(null);
    }
  };

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
