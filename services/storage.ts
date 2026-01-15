
import { StudySession, StudioSettings } from '../types';
import { supabase } from './supabase';

const STORAGE_KEY = 'studystream_sessions';
const SETTINGS_KEY = 'studystream_settings';

export const storageService = {
  // --- Local Storage Fallbacks ---
  saveSessionLocal: (session: StudySession) => {
    const sessions = storageService.getSessionsLocal();
    sessions.push(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  },
  getSessionsLocal: (): StudySession[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveSettingsLocal: (settings: StudioSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },
  getSettingsLocal: (): StudioSettings | null => {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : null;
  },

  // --- Supabase Cloud Sync ---
  syncSession: async (session: StudySession, userId: string) => {
    const { error } = await supabase
      .from('study_sessions')
      .insert({
        user_id: userId,
        timestamp: session.timestamp,
        duration_seconds: session.durationSeconds,
        label: session.label,
        type: session.type
      });
    if (error) console.error("Cloud sync failed:", error);
  },

  getSessionsCloud: async (userId: string): Promise<StudySession[]> => {
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: true });
    
    if (error) {
      console.error("Cloud fetch failed:", error);
      return [];
    }
    
    return data.map(d => ({
      id: d.id,
      timestamp: d.timestamp,
      durationSeconds: d.duration_seconds,
      label: d.label,
      type: d.type
    }));
  },

  syncSettings: async (settings: StudioSettings, userId: string) => {
    const { error } = await supabase
      .from('user_settings')
      .upsert({ user_id: userId, settings });
    if (error) console.error("Settings sync failed:", error);
  },

  getSettingsCloud: async (userId: string): Promise<StudioSettings | null> => {
    const { data, error } = await supabase
      .from('user_settings')
      .select('settings')
      .eq('user_id', userId)
      .single();
    
    if (error) return null;
    return data.settings as StudioSettings;
  },

  clearHistory: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
