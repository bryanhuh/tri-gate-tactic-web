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
  const [isFetchingDeck, setIsFetchingDeck] = useState(false);

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

  const handleStartBattle = async () => {
    setIsFetchingDeck(true);
    await onBattleStart(characters.filter(c => c) as GameCharacter[]);
    setIsFetchingDeck(false);
  };

  const allCharactersSelected = characters.every(c => c !== null);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold mb-2 text-white">CHOOSE YOUR FIVE</h2>
        <p className="text-lg text-gray-400 mb-8">Select a card to reveal your character.</p>
      </div>
      <div className="flex justify-center gap-4 mb-8">
        {characters.map((character, index) => (
          <div key={index} className={`flip-card ${!flipped[index] ? 'glow' : ''}`} onClick={() => handleCardClick(index)}>
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
        onClick={handleStartBattle}
        disabled={!allCharactersSelected || isFetchingDeck}
        className="px-8 py-4 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none"
      >
        {isFetchingDeck ? <Spinner /> : 'Start Battle'}
      </button>
    </div>
  );
};

export default CharacterSelection;