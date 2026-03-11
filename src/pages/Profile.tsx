import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, ArrowLeft, Activity, Trophy, Calendar, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface UserProfile {
  username: string;
  total_score: number;
  highest_score: number;
  highest_score_beginner: number;
  highest_score_intermediate: number;
  highest_score_advanced: number;
  plays_today: number;
  created_at: string;
}

export default function Profile() {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetch(`https://catch-the-fly.onrender.com/api/profile/${user.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch profile', err);
        setLoading(false);
      });
  }, [user, token, navigate]);

  return (
    <div className="flex flex-col items-center min-h-screen p-4 py-12">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20"
      >
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/app')}
            className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-3xl sm:text-4xl text-center bangers-font text-sky-300 flex items-center gap-2 sm:gap-3">
            <User size={28} className="sm:w-8 sm:h-8" />
            PROFILE
          </h2>
          <div className="w-12"></div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-white/50 animate-pulse text-xl">Loading profile...</div>
        ) : profile ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center mb-8">
              <div className="w-32 h-32 bg-sky-300 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(135,206,235,0.5)] mb-4 border-4 border-white/20">
                <User size={64} className="text-black" />
              </div>
              <h3 className="text-3xl font-bold">{profile.username}</h3>
              <p className="text-white/50 text-sm mt-1 flex items-center gap-2">
                <Calendar size={14} />
                Joined {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/20 p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center">
                <Trophy size={32} className="text-yellow-400 mb-2" />
                <span className="text-sm text-white/50 uppercase tracking-wider">Highest Score</span>
                <span className="text-4xl font-bold text-yellow-400 bangers-font mt-1">{profile.highest_score}</span>
              </div>
              
              <div className="bg-black/20 p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center">
                <Star size={32} className="text-orange-400 mb-2" />
                <span className="text-sm text-white/50 uppercase tracking-wider">Total Score</span>
                <span className="text-4xl font-bold text-orange-400 bangers-font mt-1">{profile.total_score}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="bg-green-500/20 p-4 rounded-2xl border border-green-500/30 flex flex-col items-center text-center">
                <span className="text-xs text-white/70 uppercase tracking-wider">Beginner</span>
                <span className="text-2xl font-bold text-green-400 bangers-font mt-1">{profile.highest_score_beginner || 0}</span>
              </div>
              <div className="bg-yellow-500/20 p-4 rounded-2xl border border-yellow-500/30 flex flex-col items-center text-center">
                <span className="text-xs text-white/70 uppercase tracking-wider">Intermed.</span>
                <span className="text-2xl font-bold text-yellow-400 bangers-font mt-1">{profile.highest_score_intermediate || 0}</span>
              </div>
              <div className="bg-red-500/20 p-4 rounded-2xl border border-red-500/30 flex flex-col items-center text-center">
                <span className="text-xs text-white/70 uppercase tracking-wider">Advanced</span>
                <span className="text-2xl font-bold text-red-400 bangers-font mt-1">{profile.highest_score_advanced || 0}</span>
              </div>
            </div>

            <div className="bg-black/20 p-6 rounded-2xl border border-white/10 mt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-white/70">
                  <Activity size={20} className="text-green-400" />
                  <span className="uppercase tracking-wider text-sm">Daily Plays</span>
                </div>
                <span className="font-bold text-xl">{profile.plays_today} / 5</span>
              </div>
              
              <div className="w-full bg-white/10 rounded-full h-3 mt-4 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(profile.plays_today / 5) * 100}%` }}
                  className={`h-full rounded-full ${
                    profile.plays_today >= 5 ? 'bg-red-500' : 'bg-green-400'
                  }`}
                />
              </div>
              
              {profile.plays_today >= 5 && (
                <p className="text-red-400 text-xs mt-3 text-center">
                  Daily limit reached. Come back tomorrow!
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-red-400 text-xl">Failed to load profile.</div>
        )}
      </motion.div>
    </div>
  );
}
