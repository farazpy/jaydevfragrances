import React, { useState } from 'react';
import { Mail, Key, User as UserIcon, ArrowRight, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (user: any, token: string) => void;
  onNavigate: (page: string, slug?: string) => void;
}

export default function Auth({ onAuthSuccess, onNavigate }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  
  // Registration and login fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  // State alerts
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const url = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { name, email, password, phone };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok) {
        if (isLogin) {
          onAuthSuccess(data.user, data.token);
          onNavigate('home');
        } else {
          setSuccessMsg('Your connoisseur account registration is complete! Loading login portal...');
          setTimeout(() => {
            setIsLogin(true);
            setSuccessMsg('');
          }, 2500);
        }
      } else {
        setErrorMsg(data.error || 'Authenticating state check failed.');
      }
    } catch {
      setErrorMsg('Connection error verifying credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-[85vh] flex items-center justify-center py-16">
      <div className="max-w-md w-full mx-auto px-4 font-serif">
        
        {/* Outer Elegant Card Frame */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-xl flex flex-col gap-6">
          
          {/* Logo Title Segment */}
          <div className="text-center flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-full border border-yellow-500/40 shadow-inner">
              <span className="font-serif font-semibold text-lg tracking-widest text-yellow-500">J</span>
            </div>
            <h2 className="text-lg font-bold tracking-widest text-neutral-900 mt-2">
              {isLogin ? 'LOG IN MEMBERSHIP' : 'REGISTER CONNOISSEUR'}
            </h2>
            <span className="text-[9px] font-mono tracking-[0.25em] text-gray-400 uppercase leading-none mt-0.5">
              JAYDEV FRAGRANCES
            </span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
            
            {/* Registration field inputs */}
            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">Recipient Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Anand Sharma"
                    className="w-full bg-gray-50 border border-gray-100 rounded px-3 py-2.5 pl-9 focus:outline-none focus:border-yellow-600 focus:bg-white text-gray-800"
                  />
                  <UserIcon className="absolute left-3 top-3.5 w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. anand@care.com"
                  className="w-full bg-gray-50 border border-gray-100 rounded px-3 py-2.5 pl-9 focus:outline-none focus:border-yellow-600 focus:bg-white text-gray-800 font-mono"
                />
                <Mail className="absolute left-3 top-3.5 w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>

            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">Contact Phone Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full bg-gray-50 border border-gray-100 rounded px-3 py-2.5 pl-9 focus:outline-none focus:border-yellow-600 focus:bg-white text-gray-800 font-mono"
                  />
                  <UserIcon className="absolute left-3 top-3.5 w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-baseline">
                <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">Password Key</label>
                {isLogin && (
                  <span className="text-[10px] text-gray-400 hover:text-black cursor-pointer underline">Forgot key?</span>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-100 rounded px-3 py-2.5 pl-9 focus:outline-none focus:border-yellow-600 focus:bg-white text-gray-800"
                />
                <Key className="absolute left-3 top-3.5 w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>

            {errorMsg && (
              <p className="text-[10.5px] text-red-500 font-mono italic mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errorMsg}
              </p>
            )}

            {successMsg && (
              <p className="text-[10.5px] text-emerald-600 font-mono italic mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {successMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-black hover:bg-yellow-600 text-white rounded font-serif font-bold text-xs uppercase tracking-widest shadow hover:scale-102 active:scale-98 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" /> Verifying...
                </>
              ) : (
                <>
                  {isLogin ? 'Log In to Portal' : 'Register Account'} <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle triggers */}
          <div className="border-t border-gray-100 pt-4 text-center">
            {isLogin ? (
              <p className="text-xs text-gray-500">
                New to Jaydev Fragrances?{' '}
                <button 
                  onClick={() => { setIsLogin(false); setErrorMsg(''); }}
                  className="text-black font-bold hover:underline cursor-pointer"
                >
                  Create connoisseur membership
                </button>
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                Already have a membership?{' '}
                <button 
                  onClick={() => { setIsLogin(true); setErrorMsg(''); }}
                  className="text-black font-bold hover:underline cursor-pointer"
                >
                  Log into your account
                </button>
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
