import { PlayerState } from '@/app/types/battle';
import { Card } from '../Card';
import Image from 'next/image';
import { GameCharacter } from '@/types/game';

interface PlayerUIProps {
  player: PlayerState;
  onCardClick?: (card: GameCharacter) => void;
  selectedCardId?: string;
}

export function PlayerUI({ player, onCardClick, selectedCardId }: PlayerUIProps) {
  return (
    <div className="w-full bg-gray-900 p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
            <Image 
                src="/assets/showcase.png" 
                alt="Player Avatar" 
                width={50} 
                height={50} 
                className="rounded-full mr-4 border-2 border-green-500 object-cover h-[50px] w-[50px]"
            />
            <h2 className="text-xl font-bold">Player</h2>
        </div>
        <div className="text-lg">HP: {player.hp}</div>
      </div>
      <div className="flex mt-4">
        <div className="w-1/2 pr-2">
          <h3 className="font-bold">Hand</h3>
          <div className="flex space-x-2 overflow-x-auto">
            {player.hand.map(card => (
              <Card 
                key={card.instanceId} 
                character={card} 
                onClick={() => onCardClick?.(card)}
                className={selectedCardId === card.instanceId ? "ring-4 ring-yellow-400" : ""}
              />
            ))}
          </div>
        </div>
        <div className="w-1/2 pl-2">
          <h3 className="font-bold">Deck</h3>
          <p>{player.deck.length} cards</p>
        </div>
      </div>
    </div>
  );
}
