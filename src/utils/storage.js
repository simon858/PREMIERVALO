// ===================== STORAGE KEYS =====================
export const STORAGE_KEYS = {
  players: 'pg_players_v5',
  stats: 'pg_stats',
  polls: 'pg_polls_v5',
  matches: 'pg_matches_v5',
  admin: 'pg_admin',
  votes: 'pg_votes_v5',
  playerSession: 'pg_player_session',
  lineup: 'pg_lineup_v5',
  voterNames: 'pg_voter_names',
  riotIds: 'pg_riotids',
  themeColor: 'mododium-theme-color',
};

export const loadFromStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
};

export const saveToStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// ===================== DEFAULT DATA =====================
export const DEF_PLAYERS = [
  { id: 1, name: 'EZIO',    roles: ['Duelist'],           avatar: '⚔️',  agents: ['Jett', 'Harbor'],   note: '', photo: '', password: 'ezio123' },
  { id: 2, name: 'SIMON',   roles: ['IGL', 'Controller'], avatar: '👑',  agents: ['Omen'],              note: '', photo: '', password: 'simon123' },
  { id: 3, name: 'JULIEN',  roles: ['Initiator'],         avatar: '🎯',  agents: ['Sova', 'Fade'],     note: '', photo: '', password: 'julien123' },
  { id: 4, name: 'AJISHAN', roles: ['Controller', 'Flex'],avatar: '💨',  agents: ['Viper', 'Harbor'],  note: '', photo: '', password: 'ajishan123' },
  { id: 5, name: 'KLIPERR', roles: ['Sentinel'],          avatar: '🛡️', agents: ['Killjoy', 'Sage'],  note: '', photo: '', password: 'kliperr123' },
  { id: 6, name: 'ZED',     roles: ['Duelist'],           avatar: '⚡',  agents: ['Reyna', 'Jett'],    note: '', photo: '', password: 'zed123' },
];

export const DEF_STATS = {
  1: { labels: ['G1','G2','G3','G4','G5','G6'], kills: [22,18,30,25,28,33], deaths: [10,14,8,11,9,7],  wins: [1,0,1,1,1,1], losses: [0,1,0,0,0,0] },
  2: { labels: ['G1','G2','G3','G4','G5','G6'], kills: [14,17,12,20,15,18], deaths: [12,10,15,8,13,11], wins: [1,0,1,1,1,1], losses: [0,1,0,0,0,0] },
  3: { labels: ['G1','G2','G3','G4','G5','G6'], kills: [18,21,16,24,20,22], deaths: [11,9,13,7,10,12],  wins: [1,0,1,1,1,1], losses: [0,1,0,0,0,0] },
  4: { labels: ['G1','G2','G3','G4','G5','G6'], kills: [10,13,9,16,11,14],  deaths: [8,11,7,9,10,8],    wins: [1,0,1,1,1,1], losses: [0,1,0,0,0,0] },
  5: { labels: ['G1','G2','G3','G4','G5','G6'], kills: [16,14,19,17,21,20], deaths: [13,15,10,14,12,11], wins: [1,0,1,1,1,1], losses: [0,1,0,0,0,0] },
  6: { labels: ['G1','G2','G3','G4','G5','G6'], kills: [24,20,27,22,31,29], deaths: [9,12,8,11,7,10],   wins: [1,0,1,1,1,1], losses: [0,1,0,0,0,0] },
};

export const DEF_POLLS = [
  { id: 1, type: 'standard', question: 'Best agent in current meta?',        options: ['Jett','Omen','Sova','Reyna'], votes: [12,8,15,9], voters: [[],[],[],[]] },
  { id: 2, type: 'presence', question: "Can you attend Saturday's scrim?",   options: ['Yes','No'],                   votes: [4,1],       voters: [[],[]] },
  { id: 3, type: 'matches',  question: 'Who performed best vs Arctic Foxes?', options: ['EZIO','SIMON','ZED'],         votes: [8,4,6],     voters: [[],[],[]] },
];

export const DEF_MATCHES = [
  { id: 1, opponent: 'Arctic Foxes',  date: new Date(Date.now() + 3  * 864e5).toISOString(), map: 'Ascent', tournament: 'VCT Challengers', type: 'official' },
  { id: 2, opponent: 'Neon Wolves',   date: new Date(Date.now() + 7  * 864e5).toISOString(), map: 'Haven',  tournament: 'Internal League',  type: 'training' },
  { id: 3, opponent: 'Crypto Ravens', date: new Date(Date.now() + 14 * 864e5).toISOString(), map: 'TBD',    tournament: 'Open Cup S3',      type: 'official' },
];

export const DEF_LINEUP = {
  maps: ['Ascent', 'Haven', 'Bind', 'Icebox'],
  entries: {},
};

// ===================== DATA MIGRATIONS =====================
export const migratePlayers = (players) =>
  players.map((p) => ({
    ...p,
    roles: p.roles || (p.role ? [p.role] : ['Duelist']),
    agents: p.agents || (p.agent ? p.agent.split(',').map((a) => a.trim()).filter(Boolean) : []),
  }));

export const migratePolls = (polls) =>
  polls.map((p) => ({
    ...p,
    type: p.type || 'standard',
    voters: p.voters || p.options.map(() => []),
  }));

export const migrateMatches = (matches) =>
  matches.map((m) => ({ ...m, type: m.type || 'official' }));
