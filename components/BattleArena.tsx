'use client';

import { GameState } from '@/app/types/battle';
import { PlayerUI } from './ui/PlayerUI';
import { OpponentUI } from './ui/OpponentUI';
import { Card } from './Card';
import { FieldSlot } from './FieldSlot';

interface BattleArenaProps {
  gameState: GameState;
  actions: any;
}

export function BattleArena({ gameState, actions }: BattleArenaProps) {
  const { player, opponent, selectedAttacker } = gameState;

  const handleCardClick = (card: any) => {
    if (gameState.turn === 'player') {
      if (player.field.includes(card) && !card.hasAttacked) {
        actions.selectAttacker(card);
      } else if (opponent.field.includes(card) && selectedAttacker) {
        actions.selectTarget(card);
        actions.attack();
      }
    }
  };

  const handleFieldSlotClick = (position: number) => {
    // Implement logic to play a card from hand to this slot
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-gray-800 text-white">
      <OpponentUI opponent={opponent} />
      <div className="flex w-full justify-center items-center py-4">
        {opponent.field.map((card, index) => (
          <div key={index} onClick={() => card && handleCardClick(card)}>
            {card ? <Card character={card} /> : <FieldSlot />}
          </div>
        ))}
      </div>

      <div className="flex w-full justify-center items-center py-4">
        {player.field.map((card, index) => (
          <div key={index} onClick={() => card && handleCardClick(card)}>
            {card ? <Card character={card} /> : <FieldSlot onClick={() => handleFieldSlotClick(index)} />}
          </div>
        ))}
      </div>
      <PlayerUI player={player} />
    </div>
  );
}
