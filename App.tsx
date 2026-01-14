
import React, { useState, useEffect } from 'react';
import { AppTab, StudySession, StudioSettings, FilterType, FontType, FaceStickerType } from './types.ts';
import { Icons } from './constants.tsx';
import RecordingView from './components/Recorder/RecordingView.tsx';
import StudyCalendar from './components/Calendar/StudyCalendar.tsx';
import SettingsView from './components/Settings/SettingsView.tsx';
import PrivacyView from './components/Privacy/PrivacyView.tsx';
import { storageService } from './services/storage.ts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.RECORDER);
  const [isRecording, setIsRecording] = useState(false);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isAdsTxt, setIsAdsTxt] = useState(false);
  
  const [settings, setSettings] = useState<StudioSettings>({
    filter: FilterType.NONE,
    font: FontType.MONO,
    theme: 'dark',
    timerMode: 'stopwatch',
    overlayX: 85,
    overlayY: 85,
    overlayScale: 1.0,
    sessionLabel: 'Deep Work Session',
    faceProtection: false,
    faceSticker: FaceStickerType.AVATAR,
    timerBgColor: '#0f172a',
    timerTextColor: '#10b981',
    timerOpacity: 0.75,
    timerBorderRadius: 16,
    timerPadding: 24,
    timerFontWeight: '700'
  });

  useEffect(() => {
    if (window.location.pathname === '/ads.txt') {
      setIsAdsTxt(true);
    }
    setSessions(storageService.getSessions());
  }, []);

  useEffect(() => {
    if (!isRecording) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {}
    }
  }, [activeTab, isRecording]);

  const handleSessionComplete = (newSession: StudySession) => {
    setSessions(prev => {
      const updated = [...prev, newSession];
      storageService.saveSession(newSession);
      return updated;
    });
  };

  if (isAdsTxt) {
    return (
      <pre style={{ padding: '20px', background: '#fff', color: '#000', height: '100vh', margin: 0 }}>
        google.com, pub-8461022130456850, DIRECT, f08c47fec0942fa0
      </pre>
    );
  }

  const isDark = settings.theme === 'dark';

  return (
    <div className={`h-screen flex flex-col transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} overflow-hidden`}>
      {!isRecording && (
        <header className={`px-6 py-4 flex items-center justify-between border-b backdrop-blur-xl z-50 transition-colors ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white/80'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Icons.Video />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold tracking-tight">StudyStream <span className="text-blue-500">Pro</span></h1>
              <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Cinematic Focus Studio</p>
            </div>
          </div>

          <nav className={`flex p-1 rounded-2xl border transition-colors ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
            {[
              { id: AppTab.RECORDER, label: 'Recorder', icon: <Icons.Video /> },
              { id: AppTab.SETTINGS, label: 'Studio', icon: <Icons.Play /> },
              { id: AppTab.CALENDAR, label: 'Insights', icon: <Icons.Calendar /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === tab.id 
                  ? (isDark ? 'bg-slate-800 text-white shadow-lg' : 'bg-white text-blue-600 shadow-sm') 
                  : (isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-800')
                }`}
              >
                {tab.icon}
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
             <input 
                type="text" 
                value={settings.sessionLabel}
                onChange={(e) => setSettings({...settings, sessionLabel: e.target.value})}
                className={`border rounded-xl px-4 py-2 text-xs focus:outline-none w-48 hidden md:block transition-colors ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-100 border-slate-200 text-slate-900'}`}
                placeholder="Session Name"
             />
             <button className={`p-2.5 rounded-xl border transition-colors ${isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200'}`}>
              <Icons.Drive />
            </button>
          </div>
        </header>
      )}

      {!isRecording && activeTab !== AppTab.PRIVACY && (
        <div className={`w-full border-b flex justify-center py-2 min-h-[60px] ${isDark ? 'bg-slate-900/20 border-slate-800' : 'bg-slate-100/50 border-slate-200'}`}>
          <ins className="adsbygoogle"
               style={{ display: 'block', width: '100%', height: '60px' }}
               data-ad-client="ca-pub-8461022130456850"
               data-ad-slot="0000000000"
               data-ad-format="horizontal"
               data-full-width-responsive="true"></ins>
        </div>
      )}

      <main className="flex-1 relative overflow-hidden">
        {activeTab === AppTab.RECORDER && (
          <RecordingView 
            settings={settings} 
            onSessionComplete={handleSessionComplete}
            onRecordingStateChange={setIsRecording}
          />
        )}
        {activeTab === AppTab.SETTINGS && (
          <SettingsView settings={settings} setSettings={setSettings} />
        )}
        {activeTab === AppTab.CALENDAR && (
          <div className="h-full overflow-y-auto custom-scrollbar">
            <StudyCalendar sessions={sessions} />
          </div>
        )}
        {activeTab === AppTab.PRIVACY && (
          <PrivacyView />
        )}
      </main>

      {!isRecording && (
        <footer className={`px-6 py-3 border-t text-[10px] flex justify-between items-center uppercase tracking-widest font-bold transition-colors ${isDark ? 'border-slate-800 bg-slate-900/30 text-slate-500' : 'border-slate-200 bg-white text-slate-400'}`}>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              System Live
            </span>
            <button 
              onClick={() => setActiveTab(AppTab.PRIVACY)}
              className={`hover:text-blue-500 transition-colors underline underline-offset-4 ${activeTab === AppTab.PRIVACY ? 'text-blue-500' : ''}`}
            >
              Privacy Policy (개인정보처리방침)
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span>{sessions.length} Recorded Sessions</span>
            <button 
              onClick={() => { if(confirm('Clear study history?')) { storageService.clearHistory(); setSessions([]); }}}
              className="hover:text-red-500 transition-colors"
            >
              Reset History
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
