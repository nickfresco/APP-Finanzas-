export interface Theme {
  bg: string;
  card: string;
  cardAlt: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
  green: string;
  red: string;
  orange: string;
  purple: string;
  navBg: string;
  overlay: string;
}

export function getTheme(dark: boolean): Theme {
  return dark
    ? {
        bg: '#000000', card: '#1C1C1E', cardAlt: '#2A2A2C',
        text: '#F5F5F7', textSecondary: '#98989D', border: '#2C2C2E',
        accent: '#0A84FF', green: '#32D74B', red: '#FF453A', orange: '#FF9F0A', purple: '#BF5AF2',
        navBg: 'rgba(20,20,22,0.92)', overlay: 'rgba(0,0,0,0.65)',
      }
    : {
        bg: '#F2F2F7', card: '#FFFFFF', cardAlt: '#F2F2F7',
        text: '#1D1D1F', textSecondary: '#6E6E73', border: '#E5E5EA',
        accent: '#0A84FF', green: '#30D158', red: '#FF3B30', orange: '#FF9500', purple: '#AF52DE',
        navBg: 'rgba(255,255,255,0.92)', overlay: 'rgba(0,0,0,0.35)',
      };
}
