import React, { useState } from 'react';
import { ShieldCheck, KeyRound, Lock, Eye, EyeOff, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AdminPinGateProps {
  onSuccess: (token: string, user: any) => void;
  onExit: () => void;
}

export default function AdminPinGate({ onSuccess, onExit }: AdminPinGateProps) {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin.trim()) {
      setErrorMsg('Please enter the security PIN');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.trim() })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('jaydev_token', data.token);
        toast.success('Master Administrator access verified');
        onSuccess(data.token, data.user);
      } else {
        setErrorMsg(data.error || 'Incorrect security PIN. Access denied.');
        toast.error(data.error || 'Incorrect PIN');
      }
    } catch (err: any) {
      setErrorMsg('Connection failure during PIN verification.');
      toast.error('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeypadPress = (val: string) => {
    if (pin.length < 12) {
      setPin(prev => prev + val);
      setErrorMsg('');
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 sm:p-6 text-white relative font-sans selection:bg-yellow-500 selection:text-black">
      {/* Subtle luxury ambient glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-yellow-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main PIN Container */}
      <div className="w-full max-w-md bg-neutral-900/90 backdrop-blur-2xl border border-yellow-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        
        {/* Crest & Title Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neutral-800 border border-yellow-500/30 text-yellow-500 shadow-inner mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-mono font-bold tracking-[0.3em] uppercase text-yellow-500 block mb-1">
            Jaydev Fragrances
          </span>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
            Master Admin Security Portal
          </h1>
          <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
            Enter the administrative PIN configured in your environment secrets to access product catalog, orders, and system controls.
          </p>
        </div>

        {/* PIN Entry Form */}
        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-yellow-500/70">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setErrorMsg('');
              }}
              placeholder="Enter PIN Code..."
              autoFocus
              className="w-full bg-neutral-950/80 border border-neutral-700 focus:border-yellow-500 text-white rounded-xl pl-10 pr-12 py-3.5 text-center text-lg tracking-[0.25em] font-mono focus:outline-none transition-colors shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {errorMsg && (
            <div className="bg-red-950/50 border border-red-800/60 rounded-xl px-3.5 py-2 text-xs text-red-300 text-center font-medium">
              {errorMsg}
            </div>
          )}

          {/* Quick Number Keypad for Easy PIN entry */}
          <div className="grid grid-cols-3 gap-2 my-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeypadPress(digit)}
                className="py-3 bg-neutral-800/80 hover:bg-neutral-700/80 active:scale-95 text-white font-mono text-base font-semibold rounded-xl border border-neutral-700/50 transition-all cursor-pointer"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="py-3 bg-neutral-800/40 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-mono font-bold rounded-xl border border-neutral-700/40 transition-all cursor-pointer uppercase"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress('0')}
              className="py-3 bg-neutral-800/80 hover:bg-neutral-700/80 active:scale-95 text-white font-mono text-base font-semibold rounded-xl border border-neutral-700/50 transition-all cursor-pointer"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="py-3 bg-neutral-800/40 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-mono font-bold rounded-xl border border-neutral-700/40 transition-all cursor-pointer uppercase"
            >
              ⌫
            </button>
          </div>

          {/* Unlock Submit Button */}
          <button
            type="submit"
            disabled={loading || !pin.trim()}
            className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-neutral-950 font-bold rounded-xl text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying Security PIN...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Unlock Admin Dashboard
              </>
            )}
          </button>
        </form>

        {/* Exit link */}
        <div className="mt-6 pt-4 border-t border-neutral-800 text-center">
          <button
            onClick={onExit}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-yellow-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Storefront
          </button>
        </div>

      </div>
    </div>
  );
}
