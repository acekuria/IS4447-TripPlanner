export interface ThemeColors {
  // Brand (same in both modes)
  primary: string;
  primaryPressed: string;
  primaryLight: string;
  primaryBorder: string;
  teal: string;
  tealLight: string;
  tealDark: string;
  danger: string;
  dangerLight: string;

  // Surfaces
  bg: string;
  card: string;

  // Borders & dividers
  border: string;
  inputBorder: string;
  divider: string;

  // Text
  text: string;
  textStrong: string;
  textMuted: string;
  textLabel: string;
  textSubdued: string;

  // Inputs
  inputBg: string;

  // UI accents
  avatarBg: string;
  selectedBg: string;
  selectedText: string;
  tabBar: string;
  swatchBorder: string;
}

export const LightTheme: ThemeColors = {
  primary: '#F47B4F',
  primaryPressed: '#D85A30',
  primaryLight: '#FFF0EB',
  primaryBorder: '#FFD0BF',
  teal: '#1D9E75',
  tealLight: '#E1F5EE',
  tealDark: '#085041',
  danger: '#B91C1C',
  dangerLight: '#FEE2E2',

  bg: '#F7F5F2',
  card: '#FFFFFF',
  border: '#E8E6E1',
  inputBorder: '#CBD5E1',
  divider: '#F1F5F9',

  text: '#2C2C2A',
  textStrong: '#111827',
  textMuted: '#888780',
  textLabel: '#374151',
  textSubdued: '#6B7280',

  inputBg: '#FFFFFF',

  avatarBg: '#0F172A',
  selectedBg: '#0F172A',
  selectedText: '#FFFFFF',
  tabBar: '#FFFFFF',
  swatchBorder: '#0F172A',
};

export const DarkTheme: ThemeColors = {
  primary: '#F47B4F',
  primaryPressed: '#D85A30',
  primaryLight: '#3D1F10',
  primaryBorder: '#5A2E1A',
  teal: '#1D9E75',
  tealLight: '#0D3326',
  tealDark: '#6EE7B7',
  danger: '#EF4444',
  dangerLight: '#450A0A',

  bg: '#0F0F0F',
  card: '#1C1C1C',
  border: '#2D2D2D',
  inputBorder: '#3A3A3A',
  divider: '#262626',

  text: '#F1F0EE',
  textStrong: '#F9FAFB',
  textMuted: '#9CA3AF',
  textLabel: '#D1D5DB',
  textSubdued: '#9CA3AF',

  inputBg: '#222222',

  avatarBg: '#1D9E75',
  selectedBg: '#F1F5F9',
  selectedText: '#0F172A',
  tabBar: '#1C1C1C',
  swatchBorder: '#FFFFFF',
};

// Keep Colors as alias for LightTheme for any legacy usage
export const Colors = LightTheme;

// Pastel chip colours for categories
export const CategoryPastels = [
  { bg: '#C8F7DC', text: '#1A5C3A', midtone: '#5DCAA5' }, // mint green   — Health
  { bg: '#C4DEF6', text: '#1B4F8A', midtone: '#85B7EB' }, // sky blue     — Learning
  { bg: '#FFD9C4', text: '#8B3A1A', midtone: '#F0997B' }, // peach        — Productivity
  { bg: '#F5C6D0', text: '#7A1F35', midtone: '#ED93B1' }, // soft pink    — Money
  { bg: '#DDD6FE', text: '#3B0764', midtone: '#9B8EE8' }, // lavender     — Mindfulness
  { bg: '#FEF3C7', text: '#78350F', midtone: '#F5C842' }, // pale amber   — Health alt
  { bg: '#CCFBF1', text: '#0D5446', midtone: '#34C9A8' }, // pale teal    — Fitness
  { bg: '#FFE4E6', text: '#9F1239', midtone: '#F87497' }, // blush rose   — Wellness
  { bg: '#E0E7FF', text: '#312E81', midtone: '#7B8FE8' }, // periwinkle   — Study
  { bg: '#DCFCE7', text: '#14532D', midtone: '#4CAF78' }, // pale lime    — Nature
  { bg: '#F3E8FF', text: '#581C87', midtone: '#C47BE8' }, // pale purple  — Creative
  { bg: '#FEF9C3', text: '#713F12', midtone: '#E8C84A' }, // pale yellow  — Finance
];

export const PASTEL_BG_LIST = CategoryPastels.map((p) => p.bg);

export function pastelTextColor(bg: string): string {
  const match = CategoryPastels.find((p) => p.bg.toLowerCase() === bg.toLowerCase());
  return match ? match.text : LightTheme.text;
}

export function midtoneColor(bg: string): string {
  const match = CategoryPastels.find((p) => p.bg.toLowerCase() === bg.toLowerCase());
  return match ? match.midtone : bg;
}
