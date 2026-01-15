import { PlayerState } from '@/app/types/battle';
import Image from 'next/image';

interface OpponentUIProps {
  opponent: PlayerState;
}

export function OpponentUI({ opponent }: OpponentUIProps) {
  return (
    <div className="w-full bg-gray-900 p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
            <Image 
                src="/assets/opponent.png" 
                alt="Opponent Avatar" 
                width={70} 
                height={70} 
                className="rounded-full mr-4 border-2 border-red-500 object-cover h-[70px] w-[70px]"
            />
            <h2 className="text-xl font-bold">Opponent</h2>
        </div>
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
