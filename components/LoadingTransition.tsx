'use client';

import { useEffect, useState } from 'react';
import { CardSpinner, Spinner } from './ui/Loaders';

interface LoadingTransitionProps {
  onTransitionEnd: () => void;
}

const LoadingTransition = ({ onTransitionEnd }: LoadingTransitionProps) => {
  const [loadingText, setLoadingText] = useState('Initializing Battle...');

  useEffect(() => {
    const timer = setTimeout(() => {
      onTransitionEnd();
    }, 2000); // 2 second delay for transition

    return () => clearTimeout(timer);
  }, [onTransitionEnd]);

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <CardSpinner />
      <p className="text-xl text-white mt-4">{loadingText}</p>
    </div>
  );
};

export default LoadingTransition;