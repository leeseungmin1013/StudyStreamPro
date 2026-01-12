
import React, { useRef, useEffect, useCallback } from 'react';
import { FilterType, FontType, StudioSettings } from '../../types.ts';
import { Icons, POMODORO_WORK } from '../../constants.tsx';

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

    // Draw Mock Timer Overlay for Preview
    const fontSize = 40 * settings.overlayScale;
    ctx.font = `bold ${fontSize}px "${settings.font}"`;
    const text = settings.timerMode === 'pomodoro' ? "25:00" : "00:00:00";
    const metrics = ctx.measureText(text);
    const pad = 20 * settings.overlayScale;
    const w = metrics.width + pad * 2;
    const h = 60 * settings.overlayScale;
    
    let px = (settings.overlayX / 100) * canvas.width - (w / 2);
    let py = (settings.overlayY / 100) * canvas.height - (h / 2);
    px = Math.max(10, Math.min(canvas.width - w - 10, px));
    py = Math.max(10, Math.min(canvas.height - h - 10, py));

    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.beginPath();
    const radius = 12 * settings.overlayScale;
    if (ctx.roundRect) {
      ctx.roundRect(px, py, w, h, [radius]);
    } else {
      ctx.rect(px, py, w, h);
    }
    ctx.fill();
    ctx.fillStyle = '#10b981';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, px + pad, py + (h / 2));

    requestRef.current = requestAnimationFrame(drawPreview);
  }, [settings]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(drawPreview);
    return () => cancelAnimationFrame(requestRef.current);
  }, [drawPreview]);

  return (
    <div className="flex flex-col lg:flex-row h-full gap-8 p-8 max-w-7xl mx-auto overflow-y-auto">
      {/* Left: Controls */}
      <div className="w-full lg:w-1/3 space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Studio Engine
          </h2>
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Focus Mode</label>
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button 
                  onClick={() => setSettings({...settings, timerMode: 'stopwatch'})}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${settings.timerMode === 'stopwatch' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}
                >Stopwatch</button>
                <button 
                  onClick={() => setSettings({...settings, timerMode: 'pomodoro'})}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${settings.timerMode === 'pomodoro' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}
                >Pomodoro</button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Visual Filter</label>
              <select 
                value={settings.filter} 
                onChange={(e) => setSettings({...settings, filter: e.target.value as FilterType})}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none"
              >
                {Object.entries(FilterType).map(([k, v]) => <option key={k} value={v}>{k}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Typography</label>
              <select 
                value={settings.font} 
                onChange={(e) => setSettings({...settings, font: e.target.value as FontType})}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none"
              >
                <option value={FontType.INTER}>Modern Sans</option>
                <option value={FontType.MONO}>JetBrains Mono</option>
                <option value={FontType.SERIF}>Classic Serif</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Layout & Positioning
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Vertical Position</span>
                <span>{settings.overlayY}%</span>
              </div>
              <input type="range" min="5" max="95" value={settings.overlayY} onChange={(e) => setSettings({...settings, overlayY: Number(e.target.value)})} className="w-full accent-blue-500" />
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Horizontal Position</span>
                <span>{settings.overlayX}%</span>
              </div>
              <input type="range" min="5" max="95" value={settings.overlayX} onChange={(e) => setSettings({...settings, overlayX: Number(e.target.value)})} className="w-full accent-blue-500" />
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Scale</span>
                <span>{settings.overlayScale.toFixed(1)}x</span>
              </div>
              <input type="range" min="0.5" max="2.0" step="0.1" value={settings.overlayScale} onChange={(e) => setSettings({...settings, overlayScale: Number(e.target.value)})} className="w-full accent-blue-500" />
            </div>
          </div>
        </section>
      </div>

      {/* Right: Preview Window */}
      <div className="flex-1 space-y-4">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Live Studio Preview</label>
        <div className="relative aspect-video bg-black rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
          <video ref={videoRef} className="hidden" muted playsInline />
          <canvas ref={canvasRef} className="w-full h-full object-cover" />
          <div className="absolute inset-0 border-2 border-white/5 pointer-events-none rounded-3xl"></div>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400">Settings are saved automatically. Switch to the <b>Recorder</b> tab to begin your session.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
