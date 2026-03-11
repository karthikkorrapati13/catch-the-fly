import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Play, Trophy, User, Settings as SettingsIcon, LogOut, Bug, Zap, Shield, Flame } from 'lucide-react';
import { motion } from 'motion/react';

export default function AppPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const startGame = (mode: string) => {
    navigate(`/game?mode=${mode}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20"
      >
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
              <User size={24} className="text-black" />
            </div>
            <div>
              <p className="text-sm text-white/70">Welcome,</p>
              <h3 className="text-xl font-bold">{user?.username || 'Guest'}</h3>
            </div>
          </button>
          <button onClick={handleLogout} className="p-2 bg-red-500/20 text-red-300 rounded-full hover:bg-red-500/40 transition">
            <LogOut size={20} />
          </button>
        </div>

        <div className="flex justify-center mb-6 relative">
          <Bug size={60} className="text-yellow-400 animate-fly-flap drop-shadow-lg" />
        </div>
        
        <h2 className="text-3xl text-center mb-6 bangers-font tracking-wider">Select Mode</h2>

        <div className="space-y-4 mb-8">
          <button
            onClick={() => startGame('beginner')}
            className="w-full py-4 bg-green-500/80 text-white font-bold rounded-2xl text-xl hover:bg-green-500 transition-colors flex items-center justify-center gap-3 shadow-lg"
          >
            <Shield size={24} />
            BEGINNER
          </button>
          
          <button
            onClick={() => startGame('intermediate')}
            className="w-full py-4 bg-yellow-500/80 text-white font-bold rounded-2xl text-xl hover:bg-yellow-500 transition-colors flex items-center justify-center gap-3 shadow-lg"
          >
            <Zap size={24} />
            INTERMEDIATE
          </button>
          
          <button
            onClick={() => startGame('advanced')}
            className="w-full py-4 bg-red-500/80 text-white font-bold rounded-2xl text-xl hover:bg-red-500 transition-colors flex items-center justify-center gap-3 shadow-lg"
          >
            <Flame size={24} />
            ADVANCED
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/leaderboard')}
            className="py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-colors flex flex-col items-center justify-center gap-2 border border-white/20"
          >
            <Trophy size={24} className="text-yellow-400" />
            Leaderboard
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-colors flex flex-col items-center justify-center gap-2 border border-white/20"
          >
            <SettingsIcon size={24} className="text-gray-300" />
            Settings
          </button>
        </div>
      </motion.div>
    </div>
  );
}
