// ===================== STAT COLORS =====================
export const PCOLORS = ['#e8ff00', '#00aaff', '#00ff88', '#ff2d2d', '#ff8800', '#aa55ff', '#00ffdd'];
export const SCOL = { kills: '#e8ff00', deaths: '#ff2d2d', wins: '#00ff88', losses: 'rgba(255,255,255,0.3)' };
export const ROLE_COLORS = {
  Duelist: '#ff2d2d',
  Controller: '#00aaff',
  Initiator: '#00ff88',
  Sentinel: '#aa55ff',
  IGL: '#e8ff00',
  Flex: '#ff8800',
};

// ===================== STAR RATING =====================
export const calcStars = (player, stats) => {
  const d = stats[player.id];
  if (!d || !d.labels.length) return 1;
  const kills  = d.kills.reduce((a, b) => a + b, 0);
  const deaths = d.deaths.reduce((a, b) => a + b, 0);
  const wins   = d.wins.reduce((a, b) => a + b, 0);
  const games  = d.labels.length;
  const kda    = deaths > 0 ? kills / deaths : kills;
  const wr     = games > 0 ? wins / games : 0;
  const score  = kda * 0.4 + wr * 5 * 0.4 + (kills / Math.max(games, 1) / 10) * 0.2;
  return Math.min(5, Math.max(1, Math.round(score)));
};

// ===================== COUNTDOWN =====================
export const formatCountdown = (targetDate) => {
  const diff = new Date(targetDate) - Date.now();
  if (diff <= 0) return 'LIVE NOW';
  const d  = Math.floor(diff / 864e5);
  const h  = Math.floor((diff % 864e5) / 36e5);
  const mn = Math.floor((diff % 36e5) / 6e4);
  const s  = Math.floor((diff % 6e4) / 1e3);
  return d > 0 ? `${d}d ${h}h ${mn}m` : `${h}h ${mn}m ${s}s`;
};

export const formatCountdownUppercase = (targetDate) => {
  const diff = new Date(targetDate) - Date.now();
  if (diff <= 0) return 'LIVE / PAST';
  const d  = Math.floor(diff / 864e5);
  const h  = Math.floor((diff % 864e5) / 36e5);
  const mn = Math.floor((diff % 36e5) / 6e4);
  const s  = Math.floor((diff % 6e4) / 1e3);
  return d > 0 ? `${d}D ${h}H ${mn}M` : `${h}H ${mn}M ${s}S`;
};

export const isMatchHot = (targetDate) => {
  const diff = new Date(targetDate) - Date.now();
  const d = Math.floor(diff / 864e5);
  const h = Math.floor((diff % 864e5) / 36e5);
  return d === 0 && h < 2;
};

// ===================== THEME / COLOR =====================
export const hexToHsl = (hex) => {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
      default: h = 0;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

export const applyTheme = (hex) => {
  const [h, s, l] = hexToHsl(hex);
  document.documentElement.style.setProperty('--accent', `hsl(${h}, ${s}%, ${l}%)`);
  document.documentElement.style.setProperty('--accent2', `hsl(${h}, ${s}%, ${Math.max(l - 12, 10)}%)`);
  localStorage.setItem('mododium-theme-color', hex);
};

export const buildTrackerUrl = (riotId, mode) => {
  if (!riotId) return null;
  const encoded = encodeURIComponent(riotId);
  const base = `https://tracker.gg/valorant/profile/riot/${encoded}/overview`;
  return base + (mode === 'premier' ? '?playlist=premier' : '?playlist=competitive');
};

// ===================== GRID VIEW HELPERS =====================
export const computePlayerTotals = (player, stats) => {
  const d = stats[player.id];
  if (!d || !d.labels.length) return { p: player, kills: 0, deaths: 0, wins: 0, losses: 0, kda: 0 };
  const kills  = d.kills.reduce((a, b) => a + b, 0);
  const deaths = d.deaths.reduce((a, b) => a + b, 0);
  const wins   = d.wins.reduce((a, b) => a + b, 0);
  const losses = d.losses.reduce((a, b) => a + b, 0);
  const kda    = deaths > 0 ? +(kills / deaths).toFixed(2) : kills;
  return { p: player, kills, deaths, wins, losses, kda };
};
