import { PlayerState } from '@/app/types/battle';

interface OpponentUIProps {
  opponent: PlayerState;
}

export function OpponentUI({ opponent }: OpponentUIProps) {
  return (
    <div className="w-full bg-gray-900 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Opponent</h2>
        <div className="text-lg">HP: {opponent.hp}</div>
      </div>
      <div className="flex mt-4">
        <div className="w-1/2 pr-2">
          <h3 className="font-bold">Hand</h3>
          <p>{opponent.hand.length} cards</p>
        </div>
        <div className="w-1/2 pl-2">
          <h3 className="font-bold">Deck</h3>
          <p>{opponent.deck.length} cards</p>
        </div>
      </div>
    </div>
  );
}
