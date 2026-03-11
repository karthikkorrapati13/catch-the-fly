import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';
import { Settings as SettingsIcon, ArrowLeft, Volume2, VolumeX, Music, Bell, BellOff } from 'lucide-react';
import { motion } from 'motion/react';

export default function Settings() {
  const { soundEnabled, beepEnabled, bgMusicEnabled, volume, toggleSound, toggleBeep, toggleBgMusic, setVolume } = useAudio();
  const navigate = useNavigate();

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
          <h2 className="text-3xl sm:text-4xl text-center bangers-font text-gray-300 flex items-center gap-2 sm:gap-3">
            <SettingsIcon size={28} className="sm:w-8 sm:h-8" />
            SETTINGS
          </h2>
          <div className="w-12"></div>
        </div>

        <div className="space-y-6">
          <div className="bg-black/20 p-6 rounded-2xl border border-white/10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {soundEnabled ? <Volume2 size={24} className="text-green-400" /> : <VolumeX size={24} className="text-red-400" />}
                <span className="text-xl font-bold">Sound Effects</span>
              </div>
              <button 
                onClick={toggleSound}
                className={`w-16 h-8 rounded-full p-1 transition-colors ${soundEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
              >
                <motion.div 
                  className="w-6 h-6 bg-white rounded-full shadow-md"
                  animate={{ x: soundEnabled ? 32 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <div className="flex items-center justify-between text-white/70 text-sm">
                <span className="uppercase tracking-wider">Volume</span>
                <span>{Math.round(volume * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                disabled={!soundEnabled}
                className={`w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer ${!soundEnabled ? 'opacity-50' : ''}`}
              />
            </div>
          </div>

          <div className="bg-black/20 p-6 rounded-2xl border border-white/10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {beepEnabled ? <Bell size={24} className="text-yellow-400" /> : <BellOff size={24} className="text-red-400" />}
                <span className="text-xl font-bold">Beep Sounds</span>
              </div>
              <button 
                onClick={toggleBeep}
                className={`w-16 h-8 rounded-full p-1 transition-colors ${beepEnabled ? 'bg-yellow-500' : 'bg-gray-600'}`}
              >
                <motion.div 
                  className="w-6 h-6 bg-white rounded-full shadow-md"
                  animate={{ x: beepEnabled ? 32 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>

          <div className="bg-black/20 p-6 rounded-2xl border border-white/10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Music size={24} className="text-sky-400" />
                <span className="text-xl font-bold">Music mode</span>
              </div>
              <button 
                onClick={toggleBgMusic}
                className={`w-16 h-8 rounded-full p-1 transition-colors ${bgMusicEnabled ? 'bg-sky-500' : 'bg-gray-600'}`}
              >
                <motion.div 
                  className="w-6 h-6 bg-white rounded-full shadow-md"
                  animate={{ x: bgMusicEnabled ? 32 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>

          <div className="pt-8 text-center text-white/50 text-sm">
            <p>Catch The Annoying Fly v1.0.0</p>
            <p className="mt-2">Developed by KarthikRoyal</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
