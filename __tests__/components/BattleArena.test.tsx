import { render, screen, fireEvent, act } from '@testing-library/react';
import { BattleArena } from '@/components/BattleArena';
import { GameState, BattleAction } from '@/app/types/battle';
import { GameCharacter } from '@/types/game';
import '@testing-library/jest-dom';

// Mock matchMedia for Framer Motion or other responsive bits
window.matchMedia = window.matchMedia || function() {
    return {
        matches: false,
        addListener: function() {},
        removeListener: function() {}
    };
};

// Mock Audio
const mockPlay = jest.fn().mockImplementation(() => Promise.resolve());
const mockPause = jest.fn();

window.HTMLMediaElement.prototype.play = mockPlay;
window.HTMLMediaElement.prototype.pause = mockPause;
window.HTMLMediaElement.prototype.load = jest.fn();

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();


const mockCharacter: GameCharacter = {
  id: 1,
  instanceId: 'char-1',
  name: 'Test Hero',
  image: '/test.jpg',
  tier: 'B',
  stats: {
    hp: 100,
    power: 50,
    defense: 20,
    speed: 10,
    skill: 10,
  },
};

const mockActions = {
  playCard: jest.fn(),
  swapCard: jest.fn(),
  drawWildcard: jest.fn(),
  clearWildcardAlert: jest.fn(),
  selectAttacker: jest.fn(),
  selectTarget: jest.fn(),
  attack: jest.fn(),
  endTurn: jest.fn(),
};

const defaultGameState: GameState = {
  phase: 'battle',
  turn: 'player',
  turnCount: 1,
  player: {
    hp: 1000,
    hand: [mockCharacter],
    field: [null, null, null],
    deck: [],
    graveyard: [],
    lastSwapTurn: 0,
    wildcardUsed: false,
  },
  opponent: {
    hp: 1000,
    hand: [],
    field: [null, null, null],
    deck: [],
    graveyard: [],
    lastSwapTurn: 0,
    wildcardUsed: false,
  },
  battleLog: [],
  wildcardAlert: null,
};

describe('BattleArena', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders player and opponent HP', () => {
    render(<BattleArena gameState={defaultGameState} actions={mockActions} />);
    
    // PlayerUI and OpponentUI should display HP. 
    // Since we didn't inspect those subcomponents, assuming they show the number.
    // If they render the text "1000", we can find it.
    // However, there are two "1000"s.
    
    const hpElements = screen.getAllByText('1000');
    expect(hpElements.length).toBeGreaterThanOrEqual(2);
  });

  it('allows player to end turn', () => {
    render(<BattleArena gameState={defaultGameState} actions={mockActions} />);
    
    const endTurnBtn = screen.getByText(/End Phase/i);
    fireEvent.click(endTurnBtn);
    
    expect(mockActions.endTurn).toHaveBeenCalled();
  });

  it('disables End Phase button when it is opponent turn', () => {
    const opponentTurnState: GameState = {
        ...defaultGameState,
        turn: 'opponent',
    };
    
    render(<BattleArena gameState={opponentTurnState} actions={mockActions} />);
    
    const endTurnBtn = screen.getByText(/End Phase/i);
    expect(endTurnBtn).toBeDisabled();
  });

  it('shows deck modal when "View Deck" is clicked', () => {
      render(<BattleArena gameState={defaultGameState} actions={mockActions} />);
      
      const viewDeckBtn = screen.getByText(/View Deck/i);
      fireEvent.click(viewDeckBtn);
      
      expect(screen.getByText('Your Deck')).toBeInTheDocument();
  });
});
