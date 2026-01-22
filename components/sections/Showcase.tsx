"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Sword, Play, Save, User } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

type HeroSectionProps = {
  onPlayNow: () => void;
  onResume?: () => void;
};

export default function HeroSection({ onPlayNow, onResume }: HeroSectionProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [hasSave, setHasSave] = useState(false);

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedState = localStorage.getItem('tri-gate-tactic-state');
    if (savedState) setHasSave(true);

    // Check auth state
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  const handlePlayNowClick = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(error => {
        console.log("Audio playback initiated by user click, prevented:", error);
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
    <section className="relative w-full min-h-screen flex flex-col justify-center overflow-hidden bg-black text-white selection:bg-yellow-400 selection:text-black">
      {/* Audio & Video Background */}
      <audio ref={audioRef} src="/assets/background.mp3" loop />
      <div className="absolute inset-0 opacity-40">
        <video 
          ref={videoRef}
          autoPlay 
          loop 
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover object-center scale-105"
        >
          <source src="/assets/video.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Cyberpunk Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_2px,3px_100%]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-0" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center justify-center text-center h-full">
        <motion.div
           initial={{ opacity: 0, y: -50 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
           className="relative"
        >
           <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase mb-4 relative z-10 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">Tri-Gate</span> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mx-2 md:mx-4">Tactic</span>
          </h1>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-xl md:text-2xl text-gray-300 max-w-2xl font-medium tracking-wide border-l-4 border-yellow-400 pl-6 py-2 bg-black/30 backdrop-blur-sm"
        >
          Forge your destiny. Collect heroes. Master the power scaling.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-12 flex flex-col md:flex-row flex-wrap gap-6 items-center w-full justify-center"
        >
          {/* PLAY NOW BUTTON */}
          <button 
            onClick={handlePlayNowClick}
            className="group relative px-10 py-5 bg-yellow-400 text-black font-black text-2xl uppercase tracking-wider clip-path-slant hover:bg-yellow-300 transition-all active:scale-95 min-w-[200px]"
            style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 80%, 90% 100%, 0 100%, 0 20%)' }}
          >
            <div className="flex items-center gap-3">
              <Play fill="currentColor" size={24} />
              <span>Play Now</span>
            </div>
            {/* Button Glitch Effect Overlay */}
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out skew-x-12" />
          </button>

           {/* RESUME BUTTON */}
           {hasSave && onResume && (
            <button 
                onClick={onResume}
                className="group relative px-10 py-5 bg-green-600 text-white font-black text-2xl uppercase tracking-wider hover:bg-green-500 transition-all active:scale-95 min-w-[200px]"
                style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 80%, 90% 100%, 0 100%, 0 20%)' }}
            >
                <div className="flex items-center gap-3">
                    <Save size={24} />
                    <span>Resume</span>
                </div>
                 <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out skew-x-12" />
            </button>
          )}

          {/* DECK BUILDER LINK */}
          <Link 
            href="/deck-builder"
            className="group relative px-10 py-5 bg-transparent border-2 border-white/20 text-white font-bold text-xl uppercase tracking-wider hover:bg-white/10 transition-all active:scale-95 min-w-[200px] flex items-center justify-center gap-3 backdrop-blur-md"
            style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 80%, 90% 100%, 0 100%, 0 20%)' }}
          >
             <Sword size={24} />
             <span>Deck Builder</span>
          </Link>

          {/* LOGIN / PROFILE LINK */}
           <Link 
            href={user ? "/profile" : "/login"}
            className="group relative px-10 py-5 bg-transparent border-2 border-yellow-500/50 text-yellow-500 font-bold text-xl uppercase tracking-wider hover:bg-yellow-500/10 transition-all active:scale-95 min-w-[200px] flex items-center justify-center gap-3 backdrop-blur-md"
            style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 80%, 90% 100%, 0 100%, 0 20%)' }}
          >
             <User size={24} />
             <span>{user ? "Profile" : "Login"}</span>
          </Link>
        </motion.div>
      </div>

      {/* Mute Toggle Control */}
      <button 
        onClick={toggleMute}
        className="absolute bottom-8 right-8 z-30 p-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-all hover:scale-110 shadow-lg"
        aria-label={isMuted ? "Unmute Video" : "Mute Video"}
      >
        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>

      {/* Decorative overlaid elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/90 to-transparent pointer-events-none z-0" />
    </section>
  );
}