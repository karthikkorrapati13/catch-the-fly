import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

interface AudioContextType {
  soundEnabled: boolean;
  beepEnabled: boolean;
  bgMusicEnabled: boolean;
  volume: number;
  toggleSound: () => void;
  toggleBeep: () => void;
  toggleBgMusic: () => void;
  setVolume: (vol: number) => void;
  playSound: (name: string) => void;
  startBuzz: () => void;
  stopBuzz: () => void;
  startBgMusic: () => void;
  stopBgMusic: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [beepEnabled, setBeepEnabled] = useState(true);
  const [bgMusicEnabled, setBgMusicEnabled] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  
  // Using AudioContext for better control, but simple Audio objects for ease
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const buzzRef = useRef<HTMLAudioElement | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const storedSound = localStorage.getItem('fly_sound');
    const storedBeep = localStorage.getItem('fly_beep');
    const storedBgMusic = localStorage.getItem('fly_bgmusic');
    const storedVol = localStorage.getItem('fly_volume');
    
    if (storedSound !== null) setSoundEnabled(storedSound === 'true');
    if (storedBeep !== null) setBeepEnabled(storedBeep === 'true');
    if (storedBgMusic !== null) setBgMusicEnabled(storedBgMusic === 'true');
    if (storedVol !== null) setVolumeState(parseFloat(storedVol));

    // Initialize sounds
    audioRefs.current = {
      hit: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'),
      miss: new Audio('https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3'),
      click: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'),
      gameover: new Audio('https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3'),
    };
    
    buzzRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    if (buzzRef.current) {
      buzzRef.current.loop = true;
    }

    // AI Generated English Song (Placeholder royalty-free track)
    bgMusicRef.current = new Audio('https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=electronic-rock-king-around-here-15045.mp3');
    if (bgMusicRef.current) {
      bgMusicRef.current.loop = true;
    }
  }, []);

  useEffect(() => {
    Object.values(audioRefs.current).forEach((audio: HTMLAudioElement) => {
      audio.volume = volume;
    });
    if (buzzRef.current) buzzRef.current.volume = volume * 0.5;
    if (bgMusicRef.current) bgMusicRef.current.volume = volume * 0.3;
  }, [volume]);

  useEffect(() => {
    if (bgMusicEnabled && bgMusicRef.current) {
      bgMusicRef.current.play().catch(e => console.log('BgMusic play failed:', e));
    } else if (!bgMusicEnabled && bgMusicRef.current) {
      bgMusicRef.current.pause();
    }
  }, [bgMusicEnabled]);

  const toggleSound = () => {
    const newSound = !soundEnabled;
    setSoundEnabled(newSound);
    localStorage.setItem('fly_sound', String(newSound));
    if (!newSound && buzzRef.current) {
      buzzRef.current.pause();
    }
  };

  const toggleBeep = () => {
    const newBeep = !beepEnabled;
    setBeepEnabled(newBeep);
    localStorage.setItem('fly_beep', String(newBeep));
  };

  const toggleBgMusic = () => {
    const newBgMusic = !bgMusicEnabled;
    setBgMusicEnabled(newBgMusic);
    localStorage.setItem('fly_bgmusic', String(newBgMusic));
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
    localStorage.setItem('fly_volume', String(vol));
  };

  const playSound = (name: string) => {
    if (!soundEnabled || !audioRefs.current[name]) return;
    if (name === 'hit' || name === 'miss') {
      if (!beepEnabled) return; // Beep controls hit/miss sounds
    }
    const audio = audioRefs.current[name];
    audio.currentTime = 0;
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const startBuzz = () => {
    if (!soundEnabled || !buzzRef.current) return;
    buzzRef.current.play().catch(e => console.log('Buzz play failed:', e));
  };

  const stopBuzz = () => {
    if (buzzRef.current) {
      buzzRef.current.pause();
      buzzRef.current.currentTime = 0;
    }
  };

  const startBgMusic = () => {
    if (bgMusicEnabled && bgMusicRef.current) {
      bgMusicRef.current.play().catch(e => console.log('BgMusic play failed:', e));
    }
  };

  const stopBgMusic = () => {
    if (bgMusicRef.current) {
      bgMusicRef.current.pause();
    }
  };

  return (
    <AudioContext.Provider value={{ 
      soundEnabled, beepEnabled, bgMusicEnabled, volume, 
      toggleSound, toggleBeep, toggleBgMusic, setVolume, 
      playSound, startBuzz, stopBuzz, startBgMusic, stopBgMusic 
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
