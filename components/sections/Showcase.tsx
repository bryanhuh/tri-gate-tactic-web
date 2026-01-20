"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';

type HeroSectionProps = {
  onPlayNow: () => void;
};

export default function HeroSection({ onPlayNow }: HeroSectionProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const handlePlayNowClick = () => {
    // If we have a background audio element (for non-video cases), play it
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(error => {
        console.log("Audio playback initiated by user click, but still prevented:", error);
      });
    }
    onPlayNow();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center overflow-hidden shadow-2xl bg-indigo-950">
      <audio ref={audioRef} src="/assets/background.mp3" />
      <div className="absolute inset-0 opacity-60">
        <video 
          ref={videoRef}
          autoPlay 
          loop 
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover object-center"
        >
          <source src="/assets/video.mp4" type="video/mp4" />
        </video>
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
          <Link 
            href="/deck-builder"
            className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full font-black text-xl hover:bg-white/20 transition hover:scale-105"
          >
            DECK BUILDER
          </Link>
        </div>
      </div>

      {/* Mute Toggle Control */}
      <button 
        onClick={toggleMute}
        className="absolute bottom-8 right-8 z-20 p-3 bg-black/50 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-all hover:scale-110"
        aria-label={isMuted ? "Unmute Video" : "Mute Video"}
      >
        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>
    </section>
  );
}