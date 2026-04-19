export const Colors = {
  // Primary — coral/orange (buttons, CTAs, active tabs)
  primary: '#F47B4F',
  primaryPressed: '#D85A30',
  primaryLight: '#FFF0EB',
  primaryBorder: '#FFD0BF',

  // Accent — teal (streaks, progress, success, "Done today")
  teal: '#1D9E75',
  tealLight: '#E1F5EE',
  tealDark: '#085041',

  // Neutrals
  white: '#FFFFFF',
  surface: '#F7F5F2',
  border: '#E8E6E1',
  muted: '#888780',
  text: '#2C2C2A',

  // Semantic
  danger: '#B91C1C',
  dangerLight: '#FEE2E2',
};

// Pastel chip colours for categories.
// Each entry: bg = chip background, text = readable label from same colour family.
export const CategoryPastels = [
  { bg: '#C8F7DC', text: '#1A5C3A' }, // mint green   — Health
  { bg: '#C4DEF6', text: '#1B4F8A' }, // sky blue     — Learning
  { bg: '#FFD9C4', text: '#8B3A1A' }, // peach        — Productivity
  { bg: '#F5C6D0', text: '#7A1F35' }, // soft pink    — Money
  { bg: '#DDD6FE', text: '#3B0764' }, // lavender     — Mindfulness
  { bg: '#FEF3C7', text: '#78350F' }, // pale amber   — Health alt
  { bg: '#CCFBF1', text: '#0D5446' }, // pale teal    — Fitness
  { bg: '#FFE4E6', text: '#9F1239' }, // blush rose   — Wellness
  { bg: '#E0E7FF', text: '#312E81' }, // periwinkle   — Study
  { bg: '#DCFCE7', text: '#14532D' }, // pale lime    — Nature
  { bg: '#F3E8FF', text: '#581C87' }, // pale purple  — Creative
  { bg: '#FEF9C3', text: '#713F12' }, // pale yellow  — Finance
];

export const PASTEL_BG_LIST = CategoryPastels.map((p) => p.bg);

export function pastelTextColor(bg: string): string {
  const match = CategoryPastels.find((p) => p.bg.toLowerCase() === bg.toLowerCase());
  return match ? match.text : Colors.text;
}
