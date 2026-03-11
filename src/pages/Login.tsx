import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bug, LogIn, User, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch("https://catch-the-fly.onrender.com/api/login", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'username or password mismatch');
      
      login(data.token, data.user);
      navigate('/app');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/guest', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      login(data.token, data.user);
      navigate('/app');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20 relative"
      >
        <button 
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition text-white"
          aria-label="Back to Home"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex justify-center mb-6">
          <Bug size={64} className="text-yellow-400 animate-fly-flap" />
        </div>
        <h2 className="text-4xl text-center mb-8 bangers-font tracking-wider">
          Welcome Back!
        </h2>

        {error && <div className="bg-red-500/50 text-white p-3 rounded-xl mb-4 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username, Email, or Phone Number"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full p-4 rounded-xl bg-black/20 border border-white/10 focus:outline-none focus:border-yellow-400 text-white placeholder-white/50"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 rounded-xl bg-black/20 border border-white/10 focus:outline-none focus:border-yellow-400 text-white placeholder-white/50"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-yellow-400 text-black font-bold rounded-xl text-xl animate-button-glow hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2"
          >
            <LogIn size={24} />
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/signup')}
            className="text-white/80 hover:text-white underline mb-4 block w-full"
          >
            Don't have an account? Sign up
          </button>
          
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/20"></div>
            <span className="flex-shrink-0 mx-4 text-white/50">OR</span>
            <div className="flex-grow border-t border-white/20"></div>
          </div>

          <button
            onClick={handleGuest}
            disabled={loading}
            className="w-full mt-4 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center gap-2 border border-white/20"
          >
            <User size={24} />
            Play as Guest
          </button>
        </div>
      </motion.div>
    </div>
  );
}
