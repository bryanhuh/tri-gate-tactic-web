'use client';

import { useEffect, useState } from 'react';
import { GameState } from '@/app/types/battle';
import { PlayerUI } from './ui/PlayerUI';
import { OpponentUI } from './ui/OpponentUI';
import { Card } from './Card';
import { FieldSlot } from './FieldSlot';
import { motion, AnimatePresence } from 'framer-motion';

interface BattleArenaProps {
  gameState: GameState;
  actions: any;
}

export function BattleArena({ gameState, actions }: BattleArenaProps) {
  const { player, opponent, selectedAttacker, turn } = gameState;
  const [showPlayerDeck, setShowPlayerDeck] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(false);

  // Player Auto Mode AI
  useEffect(() => {
    if (turn === 'player' && isAutoMode) {
        const timer = setTimeout(() => {
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
  }, [turn, isAutoMode, player.field, opponent.field, actions]);

  // Opponent AI
  useEffect(() => {
    if (turn === 'opponent') {
      const timer = setTimeout(() => {
        // AI Logic
        const availableAttackers = opponent.field.filter(c => c && !c.hasAttacked);
        const availableTargets = player.field.filter(c => c !== null);

        if (availableAttackers.length > 0 && availableTargets.length > 0) {
            const attacker = availableAttackers[Math.floor(Math.random() * availableAttackers.length)];
            const target = availableTargets[Math.floor(Math.random() * availableTargets.length)];
            
            if (attacker && target) {
                // We need to simulate the selection steps or just expose a direct attack action
                // But the reducer expects SELECT_ATTACKER -> SELECT_TARGET -> ATTACK
                // Or we can just dispatch them in sequence?
                // The reducer logic:
                // SELECT_ATTACKER sets selectedAttacker
                // SELECT_TARGET sets selectedTarget
                // ATTACK uses those.
                
                // However, the AI acts on behalf of the opponent. 
                // The reducer might need to know WHO is acting, or we just trust the state.
                // Current reducer checks "if (!selectedAttacker || !selectedTarget)"
                
                actions.selectAttacker(attacker);
                setTimeout(() => {
                    actions.selectTarget(target);
                    setTimeout(() => {
                        actions.attack();
                        // Check if turn should end? 
                        // The player manually ends turn usually, but AI should end turn after attack?
                        // If we only allow 1 attack per turn or multiple?
                        // Assuming 1 attack for now or untill all attacked.
                        // For simplicity, AI attacks once then ends turn.
                        setTimeout(() => {
                            actions.endTurn();
                        }, 1000);
                    }, 500);
                }, 500);
            }
        } else {
            // No attacks possible
             actions.endTurn();
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [turn, opponent.field, player.field, actions]);

  const handleCardClick = (card: any) => {
    if (isAutoMode) return;
    
    if (gameState.turn === 'player') {
      if (player.field.includes(card) && !card.hasAttacked) {
        actions.selectAttacker(card);
      } else if (opponent.field.includes(card) && selectedAttacker) {
        actions.selectTarget(card);
        actions.attack();
        // Optional: Auto end turn after attack? Or let user button do it?
        // Let's add an End Turn button.
      }
    }
  };

  const handleFieldSlotClick = (position: number) => {
    // Implement logic to play a card from hand to this slot
    // For now, if we have a card selected in hand... (Logic not fully present in current useBattle)
  };

  return (
    <div className="flex flex-col items-center justify-between w-full h-screen bg-gray-900 text-white overflow-hidden relative">
      
      {/* Battle Status / Turn Indicator */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 opacity-20">
         <h1 className="text-9xl font-bold uppercase tracking-widest">{turn}</h1>
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
          <PlayerUI player={player} />
          
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
