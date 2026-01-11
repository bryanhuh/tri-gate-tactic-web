'use client';

import { useState } from 'react';
import type { GameCharacter } from '@/types/game';
import { getRandomCharacter } from '@/lib/anilist-service';
import { Card } from './Card';
import { Spinner } from './ui/Loaders';

interface CharacterSelectionProps {
  onBattleStart: (playerDeck: GameCharacter[]) => void;
}

const CharacterSelection = ({ onBattleStart }: CharacterSelectionProps) => {
  const [characters, setCharacters] = useState<(GameCharacter | null)[]>(Array(5).fill(null));
  const [loading, setLoading] = useState<boolean[]>(Array(5).fill(false));
  const [flipped, setFlipped] = useState<boolean[]>(Array(5).fill(false));

  const handleCardClick = async (index: number) => {
    if (characters[index] || loading[index]) return;

    setLoading(prev => {
      const newLoading = [...prev];
      newLoading[index] = true;
      return newLoading;
    });

    const excludeNames = characters.map(c => c?.name).filter(Boolean) as string[];
    const character = await getRandomCharacter(excludeNames);

    if (character) {
      setCharacters(prev => {
        const newCharacters = [...prev];
        newCharacters[index] = character;
        return newCharacters;
      });
      setFlipped(prev => {
        const newFlipped = [...prev];
        newFlipped[index] = true;
        return newFlipped;
      });
    }

    setLoading(prev => {
      const newLoading = [...prev];
      newLoading[index] = false;
      return newLoading;
    });
  };

  const allCharactersSelected = characters.every(c => c !== null);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <h2 className="text-3xl font-bold mb-8 text-white">Choose Your Fighters</h2>
      <div className="flex justify-center gap-4 mb-8">
        {characters.map((character, index) => (
          <div key={index} className="flip-card" onClick={() => handleCardClick(index)}>
            <div className={`flip-card-inner ${flipped[index] ? 'flipped' : ''}`}>
              <div className="flip-card-front">
                <img src="/assets/card.png" alt="Card back" className="w-48 h-64 object-cover rounded-lg" />
              </div>
              <div className="flip-card-back">
                {loading[index] && <Spinner />}
                {character && <Card character={character} />}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => onBattleStart(characters.filter(c => c) as GameCharacter[])}
        disabled={!allCharactersSelected}
        className="px-8 py-4 bg-green-500 text-white font-bold rounded-lg disabled:bg-gray-500"
      >
        Start Battle
      </button>
    </div>
  );
};

export default CharacterSelection;