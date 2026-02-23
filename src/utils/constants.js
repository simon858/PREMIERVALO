export const THEME_PRESETS = [
  { name: 'Volt',    hex: '#e8ff00' },
  { name: 'Violet',  hex: '#7C3AED' },
  { name: 'Indigo',  hex: '#4F46E5' },
  { name: 'Sky',     hex: '#0EA5E9' },
  { name: 'Teal',    hex: '#0D9488' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Amber',   hex: '#F59E0B' },
  { name: 'Rose',    hex: '#F43F5E' },
  { name: 'Pink',    hex: '#EC4899' },
  { name: 'Slate',   hex: '#94A3B8' },
];

export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
export const DEFAULT_THEME  = import.meta.env.VITE_DEFAULT_THEME_COLOR || '#e8ff00';

export const PAGES = ['home', 'tracker', 'roster', 'polls', 'matches', 'lineup', 'mainstats', 'portal'];

export const ROLE_OPTIONS   = ['Duelist', 'Controller', 'Initiator', 'Sentinel', 'IGL', 'Flex'];
export const AGENT_OPTIONS  = ['Jett', 'Omen', 'Sova', 'Viper', 'Killjoy', 'Reyna', 'Harbor', 'Fade', 'Breach', 'Sage'];
