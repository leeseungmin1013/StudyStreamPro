
import React from 'react';
import { supabase } from '../../services/supabase';
import { Icons } from '../../constants';

const Login: React.FC = () => {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo:  'https://study-stream-pro.vercel.app/dashboard',
      },
    });
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-950 overflow-hidden relative">
      {/* Aesthetic Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-float"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 blur-[120px] rounded-full animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="z-10 w-full max-w-md p-8 flex flex-col items-center text-center space-y-8">
        <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20 rotate-3">
          <Icons.Video />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-white">StudyStream <span className="text-blue-500">Pro</span></h1>
          <p className="text-slate-400 font-medium leading-relaxed">
            Your cinematic focus sanctuary. Cloud-sync your sessions and settings across all devices.
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white text-black py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-100 transition-all shadow-xl active:scale-95 group"
        >
          <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              style={{ fill: '#4285F4' }}
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              style={{ fill: '#34A853' }}
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              style={{ fill: '#FBBC05' }}
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              style={{ fill: '#EA4335' }}
            />
          </svg>
          Continue with Google
        </button>

        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
          Secured by Supabase Local-First Auth
        </p>
      </div>
    </div>
  );
};

export default Login;
