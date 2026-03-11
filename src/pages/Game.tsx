import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import { Bug, Pause, Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch } from '../api';

const MISS_MESSAGES = [
  "You missed again 🤡",
  "Too slow human!",
  "Fly 1 – Human 0",
  "Is your finger broken?",
  "Even my grandma taps faster!"
];

const HIT_MESSAGES = [
  "Nice catch!",
  "Fly defeated!",
  "That fly regrets existing",
  "Squish!",
  "One less mosquito!"
];

export default function Game() {
  const { user, token } = useAuth();
  const { playSound, startBuzz, stopBuzz, startBgMusic, stopBgMusic } = useAudio();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mode = queryParams.get('mode') || 'beginner';

  const getBaseSpeed = () => {
    if (mode === 'advanced') return 2.0;
    if (mode === 'intermediate') return 1.2;
    return 0.6; // beginner
  };

  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  
  const [flyPos, setFlyPos] = useState({ x: 50, y: 50 });
  const [flySpeed, setFlySpeed] = useState(getBaseSpeed()); // multiplier
  const [isHit, setIsHit] = useState(false);
  const [isMiss, setIsMiss] = useState(false);
  
  const [popupMsg, setPopupMsg] = useState<{ text: string, type: 'hit' | 'miss', id: number } | null>(null);
  const popupIdRef = useRef(0);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>();
  
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  // Orientation Detection
  useEffect(() => {
    const handleOrientationChange = () => {
      if (window.matchMedia("(orientation: portrait)").matches) {
        setOrientation('portrait');
      } else {
        setOrientation('landscape');
      }
    };

    handleOrientationChange();
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Prevent Scroll During Gameplay
  useEffect(() => {
    if (isPlaying && !gameOver) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.touchAction = '';
    };
  }, [isPlaying, gameOver]);

  const targetPosRef = useRef({ x: 50, y: 50 });
  const currentPosRef = useRef({ x: 50, y: 50 });

  // Initialize game
  useEffect(() => {
    if (!user && mode !== 'free_trial') {
      navigate('/login');
      return;
    }
    startBuzz();
    startBgMusic();
    return () => {
      stopBuzz();
      stopBgMusic();
    };
  }, [user, navigate, startBuzz, stopBuzz, startBgMusic, stopBgMusic, mode]);

  // Timer
  useEffect(() => {
    if (!isPlaying || gameOver) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleGameOver();
          return 0;
        }
        return prev - 1;
      });
      // Increase speed every 10 seconds (optional, but let's keep it or rely on levels)
      if (timeLeft % 10 === 0 && timeLeft < 60) {
        setFlySpeed(prev => prev + 0.1);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isPlaying, gameOver, timeLeft]);

  const handleGameOver = async () => {
    setGameOver(true);
    stopBuzz();
    stopBgMusic();
    playSound('gameover');
    
    if (mode === 'free_trial') {
      localStorage.setItem('hasPlayedFreeTrial', 'true');
    }
    
    if (score > 0 && user) {
      try {
        await apiFetch("api/submit-score", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            score,
            mode,
            play_time: 60 - timeLeft,
            device_type: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'
          })
        });
      } catch (err) {
        console.error('Failed to submit score:', err);
      }
    }
  };

  // Fly Movement Logic
  const updateFlyPosition = useCallback((time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const deltaTime = time - lastTimeRef.current;
    
    if (isPlaying && !gameOver && !isHit) {
      const dx = targetPosRef.current.x - currentPosRef.current.x;
      const dy = targetPosRef.current.y - currentPosRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // If close to target, pick new target
      if (dist < 5) {
        targetPosRef.current = {
          x: Math.random() * 80 + 10, // 10% to 90% of screen
          y: Math.random() * 80 + 10
        };
      } else {
        // Move towards target
        const speed = 0.05 * flySpeed * deltaTime;
        currentPosRef.current.x += (dx / dist) * speed;
        currentPosRef.current.y += (dy / dist) * speed;
        setFlyPos({ ...currentPosRef.current });
      }
    }
    
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(updateFlyPosition);
  }, [isPlaying, gameOver, isHit, flySpeed]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateFlyPosition);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [updateFlyPosition]);

  const showPopup = (type: 'hit' | 'miss') => {
    const msgList = type === 'hit' ? HIT_MESSAGES : MISS_MESSAGES;
    const msg = msgList[Math.floor(Math.random() * msgList.length)];
    popupIdRef.current += 1;
    setPopupMsg({ text: msg, type, id: popupIdRef.current });
    
    setTimeout(() => {
      setPopupMsg(prev => prev?.id === popupIdRef.current ? null : prev);
    }, 1500);
  };

  const handleFlyClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent default touch behavior
    e.stopPropagation();
    if (!isPlaying || gameOver || isHit) return;
    
    playSound('hit');
    setScore(prev => {
      const newScore = prev + 1;
      if (newScore % 10 === 0) {
        setLevel(l => l + 1);
        setFlySpeed(s => s + (mode === 'advanced' ? 0.4 : mode === 'intermediate' ? 0.2 : 0.1));
      }
      return newScore;
    });
    setIsHit(true);
    showPopup('hit');
    
    // Respawn fly
    setTimeout(() => {
      currentPosRef.current = {
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10
      };
      targetPosRef.current = {
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10
      };
      setFlyPos({ ...currentPosRef.current });
      setIsHit(false);
    }, 300);
  };

  const handleBackgroundClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isPlaying || gameOver) return;
    playSound('miss');
    setIsMiss(true);
    showPopup('miss');
    setTimeout(() => setIsMiss(false), 400);
  };

  return (
    <div className="flex items-center justify-center w-full h-[100dvh] bg-black/90 overflow-hidden">
      <div 
        ref={gameAreaRef}
        className={`relative w-full h-full 
          sm:w-[95vw] sm:h-[90vh] sm:rounded-3xl sm:border-4 sm:border-white/20
          md:w-[90vw] md:h-[85vh] md:max-w-3xl
          lg:max-w-4xl xl:max-w-5xl
          landscape:w-[95vw] landscape:h-[90vh] landscape:rounded-3xl landscape:border-4 landscape:border-white/20
          overflow-hidden bg-animated-sky shadow-2xl ${isMiss ? 'animate-miss-shake' : ''}`}
        onClick={handleBackgroundClick}
        onTouchStart={handleBackgroundClick}
        onTouchEnd={(e) => e.preventDefault()}
        style={{ touchAction: 'none' }}
      >
        {/* HUD */}
        <div className={`absolute top-0 left-0 w-full p-2 sm:p-4 flex justify-between items-center z-10 pointer-events-none ${orientation === 'landscape' ? 'px-4 sm:px-8' : 'px-2 sm:px-4'}`}>
          <div className="flex gap-1 sm:gap-4 pointer-events-auto">
            <div className="bg-black/40 backdrop-blur-sm px-2 py-1 sm:px-6 sm:py-2 rounded-xl sm:rounded-2xl border border-white/20">
              <p className="text-yellow-400 bangers-font text-lg sm:text-3xl tracking-wider">SCORE: {score}</p>
            </div>
            <div className="bg-black/40 backdrop-blur-sm px-2 py-1 sm:px-6 sm:py-2 rounded-xl sm:rounded-2xl border border-white/20">
              <p className="text-sky-400 bangers-font text-lg sm:text-3xl tracking-wider">LVL: {level}</p>
            </div>
          </div>
          
          <div className="flex gap-1 sm:gap-4 pointer-events-auto">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
              onTouchStart={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
              onTouchEnd={(e) => e.preventDefault()}
              className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition border border-white/20"
            >
              {isPlaying ? <Pause size={16} className="sm:w-6 sm:h-6" /> : <Play size={16} className="sm:w-6 sm:h-6" />}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); navigate('/app'); }}
              onTouchStart={(e) => { e.stopPropagation(); navigate('/app'); }}
              onTouchEnd={(e) => e.preventDefault()}
              className="w-8 h-8 sm:w-12 sm:h-12 bg-red-500/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-500 transition border border-white/20"
            >
              <X size={16} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        <div className="absolute top-12 sm:top-20 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className={`bg-black/40 backdrop-blur-sm px-3 py-1 sm:px-6 sm:py-2 rounded-xl sm:rounded-2xl border border-white/20 ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            <p className="bangers-font text-xl sm:text-4xl tracking-wider">{timeLeft}s</p>
          </div>
        </div>

      {/* The Fly */}
      {!gameOver && (
        <div 
          className="absolute z-20 cursor-crosshair transform -translate-x-1/2 -translate-y-1/2"
          style={{ 
            left: `${flyPos.x}%`, 
            top: `${flyPos.y}%`,
            transition: 'left 0.1s linear, top 0.1s linear',
            touchAction: 'none'
          }}
          onClick={handleFlyClick}
          onTouchStart={handleFlyClick}
          onTouchEnd={(e) => e.preventDefault()}
        >
          <div className={`${isHit ? 'animate-hit-squash text-red-500' : 'animate-fly-flap text-black'}`}>
            <Bug size={orientation === 'landscape' ? 40 : 50} className="drop-shadow-2xl sm:w-16 sm:h-16" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Popups */}
      <AnimatePresence>
        {popupMsg && (
          <motion.div
            key={popupMsg.id}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: -50, scale: 1.2 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 font-bold text-base sm:text-2xl px-3 sm:px-6 py-1.5 sm:py-3 rounded-xl sm:rounded-2xl shadow-2xl border-2 pointer-events-none whitespace-nowrap ${
              popupMsg.type === 'hit' 
                ? 'bg-green-500/90 text-white border-green-300' 
                : 'bg-red-500/90 text-white border-red-300'
            }`}
          >
            {popupMsg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Screen */}
      <AnimatePresence>
        {gameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white/10 p-6 sm:p-8 rounded-3xl border border-white/20 text-center max-w-md w-full"
            >
              <h2 className="text-4xl sm:text-6xl text-yellow-400 bangers-font mb-2">TIME'S UP!</h2>
              <p className="text-lg sm:text-2xl mb-6 sm:mb-8">You squashed <span className="font-bold text-yellow-400 text-2xl sm:text-4xl mx-2">{score}</span> flies</p>
              
              <div className="space-y-3 sm:space-y-4">
                {mode === 'free_trial' ? (
                  <>
                    <div className="text-yellow-400 font-bold mb-4 animate-pulse text-sm sm:text-base">
                      Free trial completed! Sign up to save your score.
                    </div>
                    <button 
                      onClick={() => navigate('/signup')}
                      className="w-full py-3 sm:py-4 bg-sky-500 text-white font-bold rounded-xl text-base sm:text-xl hover:bg-sky-400 transition-colors flex items-center justify-center gap-2 shadow-lg"
                    >
                      SIGN UP TO PLAY MORE
                    </button>
                    <button 
                      onClick={() => navigate('/login')}
                      className="w-full py-3 sm:py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors border border-white/20 text-sm sm:text-base"
                    >
                      LOGIN
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        setScore(0);
                        setLevel(1);
                        setTimeLeft(60);
                        setFlySpeed(getBaseSpeed());
                        setGameOver(false);
                        setIsPlaying(true);
                        startBuzz();
                        startBgMusic();
                      }}
                      className="w-full py-3 sm:py-4 bg-yellow-400 text-black font-bold rounded-xl text-base sm:text-xl animate-button-glow hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2"
                    >
                      <Play size={20} className="sm:w-6 sm:h-6" fill="currentColor" />
                      PLAY AGAIN
                    </button>
                    <button 
                      onClick={() => navigate('/leaderboard')}
                      className="w-full py-3 sm:py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors border border-white/20 text-sm sm:text-base"
                    >
                      VIEW LEADERBOARD
                    </button>
                    <button 
                      onClick={() => navigate('/app')}
                      className="w-full py-3 sm:py-4 bg-black/40 text-white/70 font-bold rounded-xl hover:bg-black/60 transition-colors text-sm sm:text-base"
                    >
                      MAIN MENU
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
