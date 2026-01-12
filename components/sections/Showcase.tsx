"use client";
import React, { useEffect, useRef } from 'react';

type HeroSectionProps = {
  onPlayNow: () => void;
};

export default function HeroSection({ onPlayNow }: HeroSectionProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayNowClick = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5; // Set volume programmatically
      audioRef.current.play().catch(error => {
        console.log("Audio playback initiated by user click, but still prevented:", error);
      });
    }
    onPlayNow();
  };

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center overflow-hidden shadow-2xl bg-indigo-950">
      <audio ref={audioRef} src="/assets/background.mp3" />
      <div className="absolute inset-0 opacity-60">
        <img 
          src="/assets/cards.png" 
          alt="Showcase" 
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-6xl font-black text-white italic tracking-tighter drop-shadow-[0_5px_5px_rgba(0,0,0,1)] uppercase">
          Anime <span className="text-yellow-400">Battle</span> Arena
        </h1>
        <p className="mt-4 text-xl text-gray-200 max-w-lg font-medium drop-shadow-md">
          Forge your destiny. Collect your favorite heroes. Master the power scaling.
        </p>
        
        <div className="mt-8 flex gap-4">
          <button 
            onClick={handlePlayNowClick}
            className="bg-yellow-400 text-black px-8 py-4 rounded-full font-black text-xl hover:bg-yellow-300 transition-transform hover:scale-105 shadow-[0_0_20px_rgba(251,191,36,0.5)]"
          >
            PLAY NOW
          </button>
          <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full font-black text-xl hover:bg-white/20 transition">
            COLLECTION
          </button>
        </div>
      </div>

      <div className="absolute bottom-[-80px] right-[-25px] w-64 h-128 rotate-[-10deg] opacity-80 hidden lg:block">
        <img src="/assets/showcase.png" alt="Cards preview" className="rounded-2xl shadow-2xl border-2 border-white/20" />
      </div>
    </section>
  );
}