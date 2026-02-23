import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  loadFromStorage, saveToStorage, STORAGE_KEYS,
  DEF_PLAYERS, DEF_STATS, DEF_POLLS, DEF_MATCHES, DEF_LINEUP,
  migratePlayers, migratePolls, migrateMatches,
} from './utils/storage';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // ── Core state ──────────────────────────────────────────
  const [players, setPlayersRaw] = useState(() =>
    migratePlayers(loadFromStorage(STORAGE_KEYS.players) || DEF_PLAYERS)
  );
  const [stats, setStatsRaw] = useState(() =>
    loadFromStorage(STORAGE_KEYS.stats) || DEF_STATS
  );
  const [polls, setPollsRaw] = useState(() =>
    migratePolls(loadFromStorage(STORAGE_KEYS.polls) || DEF_POLLS)
  );
  const [matches, setMatchesRaw] = useState(() =>
    migrateMatches(loadFromStorage(STORAGE_KEYS.matches) || DEF_MATCHES)
  );
  const [isAdmin, setIsAdminRaw] = useState(() =>
    loadFromStorage(STORAGE_KEYS.admin) || false
  );
  const [votes, setVotesRaw] = useState(() =>
    loadFromStorage(STORAGE_KEYS.votes) || {}
  );
  const [loggedPlayerId, setLoggedPlayerIdRaw] = useState(() =>
    loadFromStorage(STORAGE_KEYS.playerSession) || null
  );
  const [lineupData, setLineupDataRaw] = useState(() =>
    loadFromStorage(STORAGE_KEYS.lineup) || DEF_LINEUP
  );
  const [msRiotIds, setMsRiotIdsRaw] = useState(() =>
    loadFromStorage(STORAGE_KEYS.riotIds) || {}
  );

  // ── Persisted setters ────────────────────────────────────
  const setPlayers = useCallback((v) => {
    const val = typeof v === 'function' ? v(players) : v;
    setPlayersRaw(val);
    saveToStorage(STORAGE_KEYS.players, val);
  }, [players]);

  const setStats = useCallback((v) => {
    const val = typeof v === 'function' ? v(stats) : v;
    setStatsRaw(val);
    saveToStorage(STORAGE_KEYS.stats, val);
  }, [stats]);

  const setPolls = useCallback((v) => {
    const val = typeof v === 'function' ? v(polls) : v;
    setPollsRaw(val);
    saveToStorage(STORAGE_KEYS.polls, val);
  }, [polls]);

  const setMatches = useCallback((v) => {
    const val = typeof v === 'function' ? v(matches) : v;
    setMatchesRaw(val);
    saveToStorage(STORAGE_KEYS.matches, val);
  }, [matches]);

  const setIsAdmin = useCallback((v) => {
    setIsAdminRaw(v);
    saveToStorage(STORAGE_KEYS.admin, v);
  }, []);

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

  return (
    <AppContext.Provider value={{
      players, setPlayers,
      stats, setStats,
      polls, setPolls,
      matches, setMatches,
      isAdmin, setIsAdmin,
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
