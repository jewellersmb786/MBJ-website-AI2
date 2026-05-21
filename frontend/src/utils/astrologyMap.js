export function getRashiFromDOB(dobString) {
  const date = new Date(dobString);
  const m = date.getMonth() + 1;
  const d = date.getDate();

  if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return 'Mesh';
  if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return 'Vrishabh';
  if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return 'Mithun';
  if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return 'Karka';
  if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return 'Simha';
  if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return 'Kanya';
  if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return 'Tula';
  if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return 'Vrishchik';
  if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return 'Dhanu';
  if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return 'Makar';
  if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return 'Kumbh';
  if ((m === 2 && d >= 19) || (m === 3 && d <= 20)) return 'Meen';
  return null;
}

export function getBirthMonthFromDOB(dobString) {
  return new Date(dobString).getMonth() + 1;
}

export const RASHI_LIST = [
  'Mesh', 'Vrishabh', 'Mithun', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrishchik', 'Dhanu', 'Makar', 'Kumbh', 'Meen',
];

export const PLANETS_LIST = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu',
];

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const RASHI_DEVANAGARI = {
  Mesh: 'मेष', Vrishabh: 'वृषभ', Mithun: 'मिथुन', Karka: 'कर्क',
  Simha: 'सिंह', Kanya: 'कन्या', Tula: 'तुला', Vrishchik: 'वृश्चिक',
  Dhanu: 'धनु', Makar: 'मकर', Kumbh: 'कुम्भ', Meen: 'मीन',
};
