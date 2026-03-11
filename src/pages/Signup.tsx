import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bug, UserPlus, CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const validatePassword = (pwd: string) => {
    const errors = [];
    if (pwd.length > 0) {
      if (pwd.length < 8) errors.push("At least 8 characters");
      if (!/\d/.test(pwd)) errors.push("At least 1 number");
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) errors.push("At least 1 special character");
    }
    return errors;
  };

  const pwdErrors = validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (pwdErrors.length > 0) {
      setError('Please fix password errors to continue');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, country, phoneNumber, password }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      
      // Successfully created account, redirect to login
      navigate('/login');
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
          Join the Hunt!
        </h2>

        {error && <div className="bg-red-500/50 text-white p-3 rounded-xl mb-4 text-center">{error}</div>}

        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-top-2">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 rounded-xl bg-black/20 border border-white/10 focus:outline-none focus:border-yellow-400 text-white placeholder-white/50"
              required
            />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-xl bg-black/20 border border-white/10 focus:outline-none focus:border-yellow-400 text-white placeholder-white/50"
              required
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full p-4 rounded-xl bg-black/20 border border-white/10 focus:outline-none focus:border-yellow-400 text-white placeholder-white/50"
              required
            />
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full p-4 rounded-xl bg-black/20 border border-white/10 focus:outline-none focus:border-yellow-400 text-white placeholder-white/50 appearance-none"
              required
            >
              <option value="" disabled className="text-black">Select Country</option>
              <option value="US" className="text-black">United States</option>
              <option value="UK" className="text-black">United Kingdom</option>
              <option value="CA" className="text-black">Canada</option>
              <option value="IN" className="text-black">India</option>
              <option value="AU" className="text-black">Australia</option>
              <option value="OTHER" className="text-black">Other</option>
            </select>
            <div>
              <input
                type="password"
                placeholder="Create Strong Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full p-4 rounded-xl bg-black/20 border focus:outline-none text-white placeholder-white/50 ${
                  password.length > 0 && pwdErrors.length > 0 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-white/10 focus:border-yellow-400'
                }`}
                required
              />
              {password.length > 0 && pwdErrors.length > 0 && (
                <div className="mt-2 text-red-400 text-sm flex flex-col gap-1 bg-red-500/10 p-3 rounded-lg">
                  <span className="font-bold">Password must contain:</span>
                  <ul className="list-disc list-inside">
                    {pwdErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              {password.length > 0 && pwdErrors.length === 0 && (
                <div className="mt-2 text-green-400 text-sm flex items-center gap-1">
                  <CheckCircle2 size={16} /> Strong password!
                </div>
              )}
              {password.length === 0 && (
                <div className="mt-2 text-white/50 text-xs">
                  Must be at least 8 characters, include 1 number and 1 special character.
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || pwdErrors.length > 0}
              className="w-full py-4 bg-yellow-400 text-black font-bold rounded-xl text-xl animate-button-glow hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:animate-none"
            >
              <UserPlus size={24} />
              {loading ? 'Loading...' : 'Sign Up'}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-white/80 hover:text-white underline mb-4 block w-full"
          >
            Already have an account? Login
          </button>
        </div>
      </motion.div>
    </div>
  );
}
