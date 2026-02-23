import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from './utils/api.js';
import {
  loadFromStorage, saveToStorage, STORAGE_KEYS,
  DEF_PLAYERS, DEF_STATS, DEF_POLLS, DEF_MATCHES, DEF_LINEUP,
  migratePlayers, migratePolls, migrateMatches,
} from './utils/storage.js';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [players,       setPlayersRaw]       = useState([]);
  const [stats,         setStatsRaw]         = useState(() => loadFromStorage(STORAGE_KEYS.stats)  || DEF_STATS);
  const [polls,         setPollsRaw]         = useState([]);
  const [matches,       setMatchesRaw]       = useState([]);
  const [isAdmin,       setIsAdminRaw]       = useState(() => loadFromStorage(STORAGE_KEYS.admin)  || false);
  const [votes,         setVotesRaw]         = useState(() => loadFromStorage(STORAGE_KEYS.votes)  || {});
  const [loggedPlayerId,setLoggedPlayerIdRaw]= useState(() => loadFromStorage(STORAGE_KEYS.playerSession) || null);
  const [lineupData,    setLineupDataRaw]    = useState(() => loadFromStorage(STORAGE_KEYS.lineup) || DEF_LINEUP);
  const [msRiotIds,     setMsRiotIdsRaw]     = useState(() => loadFromStorage(STORAGE_KEYS.riotIds) || {});
  const [loading,       setLoading]          = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, m, po] = await Promise.all([
          api.getPlayers(),
          api.getMatches(),
          api.getPolls(),
        ]);
        setPlayersRaw(migratePlayers(p));
        setMatchesRaw(migrateMatches(m));
        setPollsRaw(migratePolls(po));
      } catch (err) {
        console.warn('API unavailable, falling back to localStorage', err);
        setPlayersRaw(migratePlayers(loadFromStorage(STORAGE_KEYS.players) || DEF_PLAYERS));
        setMatchesRaw(migrateMatches(loadFromStorage(STORAGE_KEYS.matches) || DEF_MATCHES));
        setPollsRaw(migratePolls(loadFromStorage(STORAGE_KEYS.polls) || DEF_POLLS));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const setPlayers = useCallback((v) => {
    const val = typeof v === 'function' ? v(players) : v;
    setPlayersRaw(val);
    saveToStorage(STORAGE_KEYS.players, val);
  }, [players]);

  const updatePlayer = useCallback(async (id, data) => {
    try {
      const updated = await api.updatePlayer(id, data);
      setPlayersRaw(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    } catch {}
  }, []);

  const createPlayer = useCallback(async (data) => {
    try {
      const created = await api.createPlayer(data);
      setPlayersRaw(prev => [...prev, created]);
    } catch {}
  }, []);

  const deletePlayer = useCallback(async (id) => {
    try {
      await api.deletePlayer(id);
      setPlayersRaw(prev => prev.filter(p => p.id !== id));
    } catch {}
  }, []);

  const setMatches = useCallback((v) => {
    const val = typeof v === 'function' ? v(matches) : v;
    setMatchesRaw(val);
    saveToStorage(STORAGE_KEYS.matches, val);
  }, [matches]);

  const createMatch = useCallback(async (data) => {
    try {
      const created = await api.createMatch(data);
      setMatchesRaw(prev => [...prev, created]);
    } catch {}
  }, []);

  const updateMatch = useCallback(async (id, data) => {
    try {
      const updated = await api.updateMatch(id, data);
      setMatchesRaw(prev => prev.map(m => m.id === id ? { ...m, ...updated } : m));
    } catch {}
  }, []);

  const deleteMatch = useCallback(async (id) => {
    try {
      await api.deleteMatch(id);
      setMatchesRaw(prev => prev.filter(m => m.id !== id));
    } catch {}
  }, []);

  const setPolls = useCallback((v) => {
    const val = typeof v === 'function' ? v(polls) : v;
    setPollsRaw(val);
    saveToStorage(STORAGE_KEYS.polls, val);
  }, [polls]);

  const updatePoll = useCallback(async (id, data) => {
    try {
      const updated = await api.updatePoll(id, data);
      setPollsRaw(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    } catch {}
  }, []);

  const createPoll = useCallback(async (data) => {
    try {
      const created = await api.createPoll(data);
      setPollsRaw(prev => [...prev, created]);
    } catch {}
  }, []);

  const deletePoll = useCallback(async (id) => {
    try {
      await api.deletePoll(id);
      setPollsRaw(prev => prev.filter(p => p.id !== id));
    } catch {}
  }, []);

  const setIsAdmin = useCallback((v) => {
    setIsAdminRaw(v);
    saveToStorage(STORAGE_KEYS.admin, v);
  }, []);

  const adminLogin = useCallback(async (password) => {
    try {
      const { ok } = await api.adminLogin(password);
      if (ok) setIsAdmin(true);
      return ok;
    } catch { return false; }
  }, [setIsAdmin]);

  const setStats = useCallback((v) => {
    const val = typeof v === 'function' ? v(stats) : v;
    setStatsRaw(val);
    saveToStorage(STORAGE_KEYS.stats, val);
  }, [stats]);

  const setVotes = useCallback((v) => {
    const val = typeof v === 'function' ? v(votes) : v;
    setVotesRaw(val);
    saveToStorage(STORAGE_KEYS.votes, val);
  }, [votes]);

  const setLoggedPlayerId = useCallback((v) => {
    setLoggedPlayerIdRaw(v);
    saveToStorage(STORAGE_KEYS.playerSession, v);
  }, []);

  const setLineupData = useCallback((v) => {
    const val = typeof v === 'function' ? v(lineupData) : v;
    setLineupDataRaw(val);
    saveToStorage(STORAGE_KEYS.lineup, val);
  }, [lineupData]);

  const setMsRiotIds = useCallback((v) => {
    const val = typeof v === 'function' ? v(msRiotIds) : v;
    setMsRiotIdsRaw(val);
    saveToStorage(STORAGE_KEYS.riotIds, val);
  }, [msRiotIds]);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0f0f0f', color:'#e8ff00', fontFamily:'Bebas Neue, sans-serif', fontSize:'2rem', letterSpacing:'0.1em' }}>
      LOADING...
    </div>
  );

  return (
    <AppContext.Provider value={{
      players, setPlayers, updatePlayer, createPlayer, deletePlayer,
      stats, setStats,
      polls, setPolls, updatePoll, createPoll, deletePoll,
      matches, setMatches, createMatch, updateMatch, deleteMatch,
      isAdmin, setIsAdmin, adminLogin,
      votes, setVotes,
      loggedPlayerId, setLoggedPlayerId,
      lineupData, setLineupData,
      msRiotIds, setMsRiotIds,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};
