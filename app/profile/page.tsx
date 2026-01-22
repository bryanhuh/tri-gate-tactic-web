'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User, LogOut, Trophy, Shield, Sword } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

type Profile = {
  username: string | null;
  avatar_url: string | null;
  mmr: number;
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserEmail(user.email || null);
      const { data } = await supabase
        .from('profiles')
        .select('username, avatar_url, mmr')
        .eq('id', user.id)
        .single();
      if (data) setProfile(data);
      setLoading(false);
    };
    getProfile();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-yellow-500 font-bold">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans relative">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12 border-b border-gray-800 pb-6">
          <Link href="/" className="text-2xl font-black italic uppercase text-yellow-500">
            Tri-Gate Tactic
          </Link>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-gray-400 hover:text-white uppercase font-bold">
            <LogOut size={16} /> Sign Out
          </button>
        </header>

        <main className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="bg-gray-900 border border-yellow-500/30 p-6 rounded-xl flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-gray-800 border-2 border-yellow-500 mb-4 flex items-center justify-center overflow-hidden relative">
                  {profile?.avatar_url ? (
                    <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" />
                  ) : (
                    <User size={48} className="text-yellow-500" />
                  )}
                </div>
                <h2 className="text-2xl font-bold mb-1">{profile?.username || 'Unknown Agent'}</h2>
                <p className="text-sm text-gray-500 mb-4">{userEmail}</p>
                <div className="w-full flex justify-between items-center text-sm font-bold text-gray-400 px-4">
                  <span>RANK</span> <span className="text-yellow-500">ROOKIE</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-900 p-6 rounded-xl flex items-center gap-4 border border-gray-800">
                  <Trophy size={24} className="text-yellow-500" />
                  <div>
                    <div className="text-3xl font-black">{profile?.mmr || 1000}</div>
                    <div className="text-xs text-gray-400">COMBAT RATING</div>
                  </div>
                </div>
                <div className="bg-gray-900 p-6 rounded-xl flex items-center gap-4 border border-gray-800">
                  <Shield size={24} className="text-blue-500" />
                  <div>
                    <div className="text-3xl font-black">0%</div>
                    <div className="text-xs text-gray-400">WIN RATE</div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 min-h-[200px] flex flex-col items-center justify-center text-gray-500">
                <Sword size={32} className="mb-2 opacity-50" />
                <p>No combat data found.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/deck-builder" className="block p-4 bg-yellow-600/20 border border-yellow-600/50 rounded-lg text-center text-yellow-500 font-bold uppercase">
                  Manage Decks
                </Link>
                <button disabled className="block p-4 bg-gray-800 border border-gray-700 rounded-lg text-center text-gray-500 font-bold uppercase">
                  Find Match
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
