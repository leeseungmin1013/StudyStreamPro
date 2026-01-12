
import React, { useState, useEffect } from 'react';
import { AppTab, StudySession, StudioSettings, FilterType, FontType } from './types';
import { Icons } from './constants';
import RecordingView from './components/Recorder/RecordingView';
import StudyCalendar from './components/Calendar/StudyCalendar';
import SettingsView from './components/Settings/SettingsView';
import { storageService } from './services/storage';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.RECORDER);
  const [isRecording, setIsRecording] = useState(false);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  
  const [settings, setSettings] = useState<StudioSettings>({
    filter: FilterType.NONE,
    font: FontType.MONO,
    timerMode: 'stopwatch',
    overlayX: 85,
    overlayY: 85,
    overlayScale: 1.0,
    sessionLabel: 'Deep Work Session'
  });

  useEffect(() => {
    setSessions(storageService.getSessions());
  }, []);

  const handleSessionComplete = (newSession: StudySession) => {
    const updated = [...sessions, newSession];
    setSessions(updated);
    storageService.saveSession(newSession);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header - Hidden during recording */}
      {!isRecording && (
        <header className="px-6 py-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl z-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Icons.Video />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold tracking-tight">StudyStream <span className="text-blue-500">Pro</span></h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Cinematic Focus Studio</p>
            </div>
          </div>

          <nav className="flex bg-slate-950/50 p-1 rounded-2xl border border-slate-800">
            {[
              { id: AppTab.RECORDER, label: 'Recorder', icon: <Icons.Video /> },
              { id: AppTab.SETTINGS, label: 'Studio', icon: <Icons.Play /> },
              { id: AppTab.CALENDAR, label: 'Insights', icon: <Icons.Calendar /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === tab.id ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
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
                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none w-48 hidden md:block"
                placeholder="Session Name"
             />
             <button className="bg-slate-800 hover:bg-slate-700 p-2.5 rounded-xl border border-slate-700 transition-colors">
              <Icons.Drive />
            </button>
          </div>
        </header>
      )}

      {/* Main Content */}
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
          <div className="h-full overflow-y-auto">
            <StudyCalendar sessions={sessions} />
          </div>
        )}
      </main>

      {/* Footer / Status Bar - Hidden during recording */}
      {!isRecording && (
        <footer className="px-6 py-3 border-t border-slate-800 bg-slate-900/30 text-[10px] text-slate-500 flex justify-between items-center uppercase tracking-widest font-bold">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              System Live
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>{sessions.length} Recorded Sessions</span>
            <button 
              onClick={() => { if(confirm('Clear study history?')) { storageService.clearHistory(); setSessions([]); }}}
              className="hover:text-red-400 transition-colors"
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
