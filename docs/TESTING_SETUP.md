# Testing Setup & Change Log

This document outlines the steps taken to set up the testing infrastructure for the **Tri-Gate Tactic** project, along with a summary of the error handling and performance optimizations implemented. Use this as a reference for creating future tests.

## 1. Summary of Changes

### A. Testing Infrastructure
We implemented a robust testing environment using **Jest** and **React Testing Library**.
- **Unit Tests (`__tests__/hooks/gameReducer.test.ts`)**: Verify core game logic (state transitions, damage calculation, win/loss conditions).
- **Component Tests (`__tests__/components/BattleArena.test.tsx`)**: Verify UI rendering and user interactions within the main battle arena.

### B. Error Handling
- **New Component (`Toast.tsx`)**: A reusable toast notification component was added to `components/ui/Toast.tsx`.
- **Integration**: `CharacterSelection.tsx` now uses the Toast component to display user-friendly error messages when:
    - The AniList API fails to fetch character data.
    - Network connectivity issues occur.
    - Not enough characters can be found for an opponent deck.

### C. Performance Optimization
- **`BattleArena.tsx`**: Wrapped internal event handlers (e.g., `handleCardClick`) in `useCallback` to prevent unnecessary function re-creations on every render.
- **`PlayerUI.tsx` & `OpponentUI.tsx`**: Wrapped these components in `React.memo`. This ensures they only re-render when their specific props (like HP or Hand) change, rather than every time the parent `BattleArena` updates.

---

## 2. Testing Setup Guide

If you need to replicate this setup or understand how it works, here are the steps we took:

### Step 1: Install Dependencies
We installed the necessary packages for running tests in a Next.js/TypeScript environment.

```bash
npm install --save-dev jest @testing-library/react @testing-library/dom @testing-library/jest-dom jest-environment-jsdom ts-node ts-jest @types/jest
```

### Step 2: Configure Jest (`jest.config.ts`)
We created a configuration file to tell Jest how to handle Next.js features and path aliases (like `@/components/...`).

```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest'

const createJestConfig = nextJest({
  dir: './',
})

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

export default createJestConfig(config)
```

### Step 3: Setup Environment (`jest.setup.ts`)
We created a setup file to extend Jest's matchers with DOM-specific assertions (like `toBeInTheDocument`).

```typescript
import '@testing-library/jest-dom'
```

### Step 4: Handling Mocks (Important!)
Since we are testing in `jsdom` (which simulates a browser in Node.js), some browser APIs are missing. We handled this in our test files:

**Example from `__tests__/components/BattleArena.test.tsx`:**
```typescript
// Mocking scrollIntoView (used by the Battle Log)
window.HTMLElement.prototype.scrollIntoView = jest.fn();

// Mocking Audio (used by background music)
window.HTMLMediaElement.prototype.play = jest.fn().mockImplementation(() => Promise.resolve());
window.HTMLMediaElement.prototype.pause = jest.fn();
```

---

## 3. How to Create New Tests

### Folder Structure
Place your tests in the `__tests__` directory, mirroring your source code structure:
- `__tests__/components/` for UI components.
- `__tests__/hooks/` for custom hooks and logic.

### Example: Component Test Template
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders the title correctly', () => {
    render(<MyComponent title="Hello World" />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('handles clicks', () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Running Tests
To run all tests:
```bash
npx jest
# OR if you added the script to package.json:
npm test
```
