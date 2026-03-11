import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ArrowLeft, Medal } from 'lucide-react';
import { motion } from 'motion/react';
import {apiFetch} from "../api";

interface ScoreEntry {
  username: string;
  highest_score: number;
  total_score: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('beginner');
  const navigate = useNavigate();


  useEffect(() => {
    setLoading(true);
  apiFetch("/api/leaderboard?mode=${mode}")
      .then(res => res.json())
      .then(data => {
        setLeaderboard(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch leaderboard', err);
        setLoading(false);
      });
  }, [mode]);

  return (
    <div className="flex flex-col items-center min-h-screen p-4 py-12">
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-2xl bg-white/10 backdrop-blur-md p-4 sm:p-8 rounded-3xl shadow-2xl border border-white/20"
      >
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigate('/app')}
            className="p-2 sm:p-3 bg-white/10 rounded-full hover:bg-white/20 transition shrink-0"
          >
            <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
          </button>
          <h2 className="text-3xl sm:text-5xl text-center bangers-font text-yellow-400 flex items-center gap-2 sm:gap-4">
            <Trophy size={28} className="text-yellow-400 sm:w-10 sm:h-10" />
            TOP HUNTERS
          </h2>
          <div className="w-10 sm:w-12 shrink-0"></div> {/* Spacer for alignment */}
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button 
            onClick={() => setMode('beginner')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm sm:text-base font-bold transition-colors ${mode === 'beginner' ? 'bg-green-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
          >
            Beginner
          </button>
          <button 
            onClick={() => setMode('intermediate')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm sm:text-base font-bold transition-colors ${mode === 'intermediate' ? 'bg-yellow-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
          >
            Intermediate
          </button>
          <button 
            onClick={() => setMode('advanced')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm sm:text-base font-bold transition-colors ${mode === 'advanced' ? 'bg-red-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
          >
            Advanced
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-white/50 animate-pulse text-xl">Loading scores...</div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                key={index} 
                className={`flex items-center justify-between p-4 rounded-2xl border ${
                  index === 0 ? 'bg-yellow-400/20 border-yellow-400/50' :
                  index === 1 ? 'bg-gray-300/20 border-gray-300/50' :
                  index === 2 ? 'bg-orange-400/20 border-orange-400/50' :
                  'bg-black/20 border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-base sm:text-lg shrink-0 ${
                    index === 0 ? 'bg-yellow-400 text-black shadow-[0_0_15px_rgba(255,215,0,0.5)]' :
                    index === 1 ? 'bg-gray-300 text-black' :
                    index === 2 ? 'bg-orange-400 text-black' :
                    'bg-white/10 text-white/70'
                  }`}>
                    {index < 3 ? <Medal size={16} className="sm:w-5 sm:h-5" /> : index + 1}
                  </div>
                  <span className="text-lg sm:text-xl font-bold truncate max-w-[100px] sm:max-w-[200px]">{entry.username}</span>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xl sm:text-2xl font-bold text-yellow-400 bangers-font tracking-wider">{entry.highest_score}</div>
                  <div className="text-[10px] sm:text-xs text-white/50 uppercase tracking-widest">Total: {entry.total_score}</div>
                </div>
              </motion.div>
            ))}
            
            {leaderboard.length === 0 && (
              <div className="text-center py-12 text-white/50 text-xl">No scores yet. Be the first!</div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
