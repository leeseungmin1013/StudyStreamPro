
import React, { useRef, useEffect, useCallback } from 'react';
import { FilterType, FontType, StudioSettings } from '../../types.ts';
import { Icons } from '../../constants.tsx';

interface SettingsViewProps {
  settings: StudioSettings;
  setSettings: (s: StudioSettings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, setSettings }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        console.error("Preview camera failed", err);
      }
    };
    initCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || video.readyState < 2) {
      requestRef.current = requestAnimationFrame(drawPreview);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas.width !== video.videoWidth) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    ctx.save();
    ctx.filter = settings.filter;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    const fs = 40 * settings.overlayScale;
    const weight = settings.timerFontWeight === '700' ? 'bold' : 'normal';
    ctx.font = `${weight} ${fs}px ${settings.font}`;
    const text = settings.timerMode === 'pomodoro' ? "25:00" : "00:00:00";
    const metrics = ctx.measureText(text);
    const p = settings.timerPadding * settings.overlayScale;
    const w = metrics.width + p * 2;
    const h = (fs + p * 1.5);
    
    let px = (settings.overlayX / 100) * canvas.width - (w / 2);
    let py = (settings.overlayY / 100) * canvas.height - (h / 2);
    px = Math.max(10, Math.min(canvas.width - w - 10, px));
    py = Math.max(10, Math.min(canvas.height - h - 10, py));

    ctx.fillStyle = hexToRgba(settings.timerBgColor, settings.timerOpacity);
    ctx.beginPath();
    const radius = settings.timerBorderRadius * settings.overlayScale;
    if (ctx.roundRect) {
      ctx.roundRect(px, py, w, h, [radius]);
    } else {
      ctx.rect(px, py, w, h);
    }
    ctx.fill();

    ctx.fillStyle = settings.timerTextColor;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, px + p, py + (h / 2));

    requestRef.current = requestAnimationFrame(drawPreview);
  }, [settings]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(drawPreview);
    return () => cancelAnimationFrame(requestRef.current);
  }, [drawPreview]);

  const isDark = settings.theme === 'dark';

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 p-6 max-w-7xl mx-auto overflow-y-auto custom-scrollbar pb-24">
      {/* Left Column: Studio Controls (Optimized Grid) */}
      <div className="w-full lg:w-1/2 space-y-4">
        {/* Core Config Card */}
        <section className={`${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} p-4 rounded-2xl border space-y-4 shadow-sm`}>
          <div className="flex items-center justify-between border-b pb-2 mb-2 transition-colors border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Studio Engine
            </h2>
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border dark:border-slate-800 border-slate-200">
               <button onClick={() => setSettings({...settings, theme: 'dark'})} className={`p-1.5 rounded-md transition-all ${isDark ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400'}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
               </button>
               <button onClick={() => setSettings({...settings, theme: 'light'})} className={`p-1.5 rounded-md transition-all ${!isDark ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
               </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Focus Mode</label>
              <div className={`flex p-1 rounded-xl border transition-colors ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <button 
                  onClick={() => setSettings({...settings, timerMode: 'stopwatch'})}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${settings.timerMode === 'stopwatch' ? (isDark ? 'bg-slate-800 text-white' : 'bg-white text-blue-600 shadow-sm') : 'text-slate-500'}`}
                >Stopwatch</button>
                <button 
                  onClick={() => setSettings({...settings, timerMode: 'pomodoro'})}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${settings.timerMode === 'pomodoro' ? (isDark ? 'bg-slate-800 text-white' : 'bg-white text-blue-600 shadow-sm') : 'text-slate-500'}`}
                >Pomodoro</button>
              </div>
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Visual Filter</label>
              <select 
                value={settings.filter} 
                onChange={(e) => setSettings({...settings, filter: e.target.value as FilterType})}
                className={`w-full border rounded-xl px-3 py-1.5 text-xs focus:outline-none transition-colors ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
              >
                {Object.entries(FilterType).map(([k, v]) => <option key={k} value={v}>{k}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Timer Aesthetics Card */}
        <section className={`${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} p-4 rounded-2xl border space-y-4 shadow-sm`}>
          <h2 className="text-sm font-bold flex items-center gap-2 border-b pb-2 mb-2 transition-colors border-slate-200 dark:border-slate-800">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Timer Aesthetics
          </h2>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Typography</label>
              <select 
                value={settings.font} 
                onChange={(e) => setSettings({...settings, font: e.target.value as FontType})}
                className={`w-full border rounded-xl px-3 py-1.5 text-xs focus:outline-none transition-colors ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
              >
                <option value={FontType.INTER}>Inter (Modern)</option>
                <option value={FontType.MONO}>JetBrains (Dev)</option>
                <option value={FontType.POPPINS}>Poppins (Soft)</option>
                <option value={FontType.MONTSERRAT}>Montserrat (Bold)</option>
                <option value={FontType.OSWALD}>Oswald (Compact)</option>
                <option value={FontType.BEBAS}>Bebas Neue (Impact)</option>
                <option value={FontType.ROBOTO_MONO}>Roboto Mono</option>
                <option value={FontType.SERIF}>Playfair (Elegant)</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Weight</label>
              <div className={`flex p-0.5 rounded-lg border transition-colors ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <button onClick={() => setSettings({...settings, timerFontWeight: '400'})} className={`flex-1 py-1 rounded-md text-[10px] font-bold ${settings.timerFontWeight === '400' ? (isDark ? 'bg-slate-800 text-white' : 'bg-white shadow-sm') : 'text-slate-500'}`}>Thin</button>
                <button onClick={() => setSettings({...settings, timerFontWeight: '700'})} className={`flex-1 py-1 rounded-md text-[10px] font-bold ${settings.timerFontWeight === '700' ? (isDark ? 'bg-slate-800 text-white' : 'bg-white shadow-sm') : 'text-slate-500'}`}>Bold</button>
              </div>
            </div>

            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Colors</label>
              <div className="flex gap-2">
                <input type="color" value={settings.timerTextColor} onChange={(e) => setSettings({...settings, timerTextColor: e.target.value})} className="w-full h-8 rounded-lg bg-transparent border-0 cursor-pointer" title="Text" />
                <input type="color" value={settings.timerBgColor} onChange={(e) => setSettings({...settings, timerBgColor: e.target.value})} className="w-full h-8 rounded-lg bg-transparent border-0 cursor-pointer" title="Background" />
              </div>
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Opacity ({Math.round(settings.timerOpacity * 100)}%)</label>
              <input type="range" min="0" max="1" step="0.05" value={settings.timerOpacity} onChange={(e) => setSettings({...settings, timerOpacity: Number(e.target.value)})} className="w-full accent-blue-500 h-2 mt-2" />
            </div>

            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Corners ({settings.timerBorderRadius}px)</label>
              <input type="range" min="0" max="50" value={settings.timerBorderRadius} onChange={(e) => setSettings({...settings, timerBorderRadius: Number(e.target.value)})} className="w-full accent-blue-500 h-2 mt-2" />
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Padding ({settings.timerPadding}px)</label>
              <input type="range" min="8" max="64" value={settings.timerPadding} onChange={(e) => setSettings({...settings, timerPadding: Number(e.target.value)})} className="w-full accent-blue-500 h-2 mt-2" />
            </div>
          </div>
        </section>

        {/* Layout Card */}
        <section className={`${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} p-4 rounded-2xl border space-y-4 shadow-sm`}>
          <h2 className="text-sm font-bold flex items-center gap-2 border-b pb-2 mb-2 transition-colors border-slate-200 dark:border-slate-800">
            <span className="w-2 h-2 bg-amber-500 rounded-full"></span> Geometry & Position
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[9px] text-slate-500 mb-1 font-bold"><span>HORIZONTAL</span><span>{settings.overlayX}%</span></div>
                <input type="range" min="5" max="95" value={settings.overlayX} onChange={(e) => setSettings({...settings, overlayX: Number(e.target.value)})} className="w-full accent-blue-500 h-2" />
              </div>
              <div>
                <div className="flex justify-between text-[9px] text-slate-500 mb-1 font-bold"><span>VERTICAL</span><span>{settings.overlayY}%</span></div>
                <input type="range" min="5" max="95" value={settings.overlayY} onChange={(e) => setSettings({...settings, overlayY: Number(e.target.value)})} className="w-full accent-blue-500 h-2" />
              </div>
            </div>
            <div className="flex flex-col justify-center border-l dark:border-slate-800 border-slate-200 pl-4">
               <div className="flex justify-between text-[9px] text-slate-500 mb-1 font-bold"><span>SCALE</span><span>{settings.overlayScale.toFixed(1)}x</span></div>
               <input type="range" min="0.5" max="2.0" step="0.1" value={settings.overlayScale} onChange={(e) => setSettings({...settings, overlayScale: Number(e.target.value)})} className="w-full accent-blue-500 h-4" />
            </div>
          </div>
        </section>
      </div>

      {/* Right Column: Preview & Status */}
      <div className="flex-1 space-y-4 lg:sticky lg:top-0">
        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Live Studio Preview</label>
        <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-xl group">
          <video ref={videoRef} className="hidden" muted playsInline />
          <canvas ref={canvasRef} className="w-full h-full object-cover" />
          <div className="absolute inset-0 border-2 border-white/5 pointer-events-none rounded-2xl group-hover:border-blue-500/20 transition-colors"></div>
        </div>
        
        <div className={`${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} p-3 rounded-2xl border flex items-center gap-3`}>
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
             <Icons.Drive />
          </div>
          <p className="text-[10px] text-slate-400">Settings are applied instantly. Every font provided is **royalty-free** and safe for monetized content on YouTube and TikTok.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
