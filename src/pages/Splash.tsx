import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Bug, Play, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Splash() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect to app
    if (user) {
      navigate('/app');
      return;
    }
  }, [user, navigate]);

  const handleFreeTrial = () => {
    navigate('/game?mode=free_trial');
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: 'spring' }}
        className="relative z-10 flex flex-col items-center w-full max-w-lg px-8 py-12 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl mx-4"
      >
        <div className="relative mb-6">
          <motion.div
            animate={{ 
              x: [0, 15, 0, -15, 0],
              y: [0, -15, -30, -15, 0],
              rotate: [0, 15, -15, 10, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Bug size={100} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
          </motion.div>
          <motion.div 
            className="absolute -top-2 -right-4 text-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            ✨
          </motion.div>
        </div>
        
        <h1 className="text-6xl sm:text-7xl mb-4 text-center text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] bangers-font tracking-wider">
          Catch The<br/>Annoying Fly
        </h1>
        
        <p className="text-lg sm:text-xl text-center text-sky-200 mb-10 font-medium max-w-md drop-shadow-md">
          Test your reflexes! Squish the annoying fly before time runs out. Are you fast enough?
        </p>

        <div className="w-full flex flex-col gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFreeTrial}
            className="w-full py-4 bg-yellow-400 text-black font-bold rounded-2xl text-xl sm:text-2xl animate-button-glow hover:bg-yellow-300 transition-colors flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(250,204,21,0.4)]"
          >
            <Play size={28} fill="currentColor" />
            PLAY FREE TRIAL
          </motion.button>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full mt-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="flex-1 py-4 bg-sky-500 text-white font-bold rounded-2xl text-lg hover:bg-sky-400 transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <LogIn size={20} />
              LOGIN
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/signup')}
              className="flex-1 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-2xl text-lg hover:bg-white/20 transition-colors border border-white/20 flex items-center justify-center gap-2"
            >
              <UserPlus size={20} />
              SIGN UP
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
