
export enum AppTab {
  RECORDER = 'recorder',
  CALENDAR = 'calendar',
  SETTINGS = 'settings',
  PRIVACY = 'privacy'
}

export enum FilterType {
  NONE = 'none',
  GRAYSCALE = 'grayscale(100%)',
  SEPIA = 'sepia(100%)',
  WARM = 'brightness(1.1) sepia(0.3)',
  COOL = 'brightness(0.9) hue-rotate(30deg)'
}

export enum FontType {
  INTER = 'Inter, sans-serif',
  MONO = 'JetBrains Mono, monospace',
  SERIF = 'serif'
}

export interface StudioSettings {
  filter: FilterType;
  font: FontType;
  timerMode: 'stopwatch' | 'pomodoro';
  overlayX: number;
  overlayY: number;
  overlayScale: number;
  sessionLabel: string;
}

export interface StudySession {
  id: string;
  timestamp: number;
  durationSeconds: number;
  label: string;
  type: 'pomodoro' | 'stopwatch';
}
