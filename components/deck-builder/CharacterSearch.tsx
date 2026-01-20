import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface CharacterSearchProps {
  onSearch: (query: string) => void;
}

export default function CharacterSearch({ onSearch }: CharacterSearchProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <div className="relative w-full max-w-md mx-auto mb-6">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg leading-5 bg-gray-800 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
        placeholder="Search for anime characters..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
}
