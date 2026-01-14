
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

export enum FaceStickerType {
  AVATAR = 'avatar',
  BLUR = 'blur',
  PIXELATE = 'pixelate'
}

export enum FontType {
  INTER = "'Inter', sans-serif",
  MONO = "'JetBrains Mono', monospace",
  SERIF = "'Playfair Display', serif",
  MONTSERRAT = "'Montserrat', sans-serif",
  OSWALD = "'Oswald', sans-serif",
  ROBOTO_MONO = "'Roboto Mono', monospace",
  POPPINS = "'Poppins', sans-serif",
  BEBAS = "'Bebas Neue', cursive"
}

export interface StudioSettings {
  filter: FilterType;
  font: FontType;
  theme: 'dark' | 'light';
  timerMode: 'stopwatch' | 'pomodoro';
  overlayX: number;
  overlayY: number;
  overlayScale: number;
  sessionLabel: string;
  // Face Privacy
  faceProtection: boolean;
  faceSticker: FaceStickerType;
  // Aesthetic customization
  timerBgColor: string;
  timerTextColor: string;
  timerOpacity: number;
  timerBorderRadius: number;
  timerPadding: number;
  timerFontWeight: '400' | '700';
}

export interface StudySession {
  id: string;
  timestamp: number;
  durationSeconds: number;
  label: string;
  type: 'pomodoro' | 'stopwatch';
}
