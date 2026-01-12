
import { StudySession } from '../types';

const STORAGE_KEY = 'studystream_sessions';

export const storageService = {
  saveSession: (session: StudySession) => {
    const sessions = storageService.getSessions();
    sessions.push(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  },
  
  getSessions: (): StudySession[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  clearHistory: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
