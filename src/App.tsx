/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'motion/react';
import Splash from './pages/Splash';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AppPage from './pages/AppPage';
import Game from './pages/Game';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import { AuthProvider } from './context/AuthContext';
import { AudioProvider } from './context/AudioContext';

export default function App() {
  return (
    <AuthProvider>
      <AudioProvider>
        <Router>
          <div className="relative min-h-screen w-full text-white bg-slate-900 overflow-hidden">
            {/* Global Animated Map/Grid Background */}
            <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
              <div className="absolute inset-0" style={{
                backgroundImage: `linear-gradient(to right, #4f46e5 2px, transparent 2px), linear-gradient(to bottom, #4f46e5 2px, transparent 2px)`,
                backgroundSize: '60px 60px',
                maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
                WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 80%)'
              }}></div>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-blue-500/40"
                style={{ backgroundSize: '200% 100%' }}
                animate={{
                  backgroundPosition: ['0% 0%', '-200% 0%'],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              />
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full h-full min-h-screen">
              <Routes>
                <Route path="/" element={<Splash />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/app" element={<AppPage />} />
                <Route path="/game" element={<Game />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </div>
        </Router>
      </AudioProvider>
    </AuthProvider>
  );
}
