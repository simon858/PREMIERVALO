import { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { useAppContext } from '../AppContext';
import { PCOLORS, SCOL, calcStars, computePlayerTotals } from '../utils/helpers';

Chart.register(...registerables);

// ── Player Tab ────────────────────────────────────────────
const PlayerTab = ({ player, isActive, onClick }) => (
  <div className={`player-tab${isActive ? ' active' : ''}`} onClick={onClick}>
    <div className="player-tab-avatar">
      {player.photo
        ? <img src={player.photo} alt="" />
        : player.avatar}
    </div>
    <div className="player-tab-info">
      <div className="player-tab-name">{player.name}</div>
      <div className="player-tab-role">{(player.roles || []).join(' · ')}</div>
    </div>
  </div>
);

// ── Grid View ─────────────────────────────────────────────
const GridView = ({ players, stats, duelSelected, duelMode }) => {
  const displayPlayers = duelMode && duelSelected.length === 2
    ? players.filter((p) => duelSelected.includes(p.id))
    : players;

  if (!displayPlayers.length)
    return <div className="empty"><div className="empty-label">No Players</div></div>;

  const totals = displayPlayers.map((p) => computePlayerTotals(p, stats));
  const maxKills  = Math.max(...totals.map((t) => t.kills));
  const maxWins   = Math.max(...totals.map((t) => t.wins));
  const maxKda    = Math.max(...totals.map((t) => t.kda));
  const minDeaths = Math.min(...totals.map((t) => t.deaths));
  const minLoss   = Math.min(...totals.map((t) => t.losses));
  const many      = displayPlayers.length > 1;

  return (
    <table className="grid-compare-table">
      <thead>
        <tr>{['Player','Kills','Deaths','Wins','Losses','KDA'].map((h) => <th key={h}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {totals.map((t) => (
          <tr key={t.p.id}>
            <td className="player-header-cell">{t.p.avatar} {t.p.name}</td>
            <td className={many && t.kills  === maxKills  ? 'best-stat' : ''}>{t.kills}</td>
            <td className={many && t.deaths === minDeaths ? 'best-stat' : ''}>{t.deaths}</td>
            <td className={many && t.wins   === maxWins   ? 'best-stat' : ''}>{t.wins}</td>
            <td className={many && t.losses === minLoss   ? 'best-stat' : ''}>{t.losses}</td>
            <td className={many && t.kda    === maxKda    ? 'best-stat' : ''}>{t.kda}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// ── Main Chart ────────────────────────────────────────────
const StatsChart = ({ players, stats, selectedPlayer, compareMode, duelMode, duelSelected, activeStats }) => {
  const canvasRef  = useRef(null);
  const chartRef   = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

    let datasets = [], labels = [];
    const statNames = ['kills', 'deaths', 'wins', 'losses'];

    if (duelMode && duelSelected.length === 2) {
      const activeStat = statNames.find((s) => activeStats[s]) || 'kills';
      const allLabelSet = new Set();
      duelSelected.forEach((pid) => (stats[pid]?.labels || []).forEach((l) => allLabelSet.add(l)));
      labels = [...allLabelSet];
      if (!labels.length) labels = ['G1','G2','G3','G4','G5','G6'];
      duelSelected.forEach((pid, i) => {
        const p = players.find((x) => x.id === pid);
        const d = stats[pid]; if (!d) return;
        const col = i === 0 ? '#e8ff00' : '#00aaff';
        datasets.push({ label: p?.name || '?', data: d[activeStat] || [], borderColor: col, backgroundColor: col + '14', fill: false, tension: 0.45, pointBackgroundColor: col, pointRadius: 4, pointHoverRadius: 8, borderWidth: 2 });
      });
    } else if (!compareMode) {
      const pid = selectedPlayer || players[0]?.id;
      const d = stats[pid];
      if (!d) return;
      labels = d.labels;
      statNames.forEach((s) => {
        if (!activeStats[s]) return;
        datasets.push({ label: s.charAt(0).toUpperCase() + s.slice(1), data: d[s], borderColor: SCOL[s], backgroundColor: SCOL[s] + '14', fill: s === 'kills', tension: 0.45, pointBackgroundColor: SCOL[s], pointRadius: 4, pointHoverRadius: 8, borderWidth: 2 });
      });
    } else {
      const activeStat = statNames.find((s) => activeStats[s]) || 'kills';
      const allLabelSet = new Set();
      players.forEach((p) => (stats[p.id]?.labels || []).forEach((l) => allLabelSet.add(l)));
      labels = [...allLabelSet];
      if (!labels.length) labels = ['G1','G2','G3','G4','G5','G6'];
      players.forEach((p, i) => {
        const d = stats[p.id]; if (!d) return;
        const col = PCOLORS[i % PCOLORS.length];
        datasets.push({ label: p.name, data: d[activeStat] || [], borderColor: col, backgroundColor: col + '10', fill: false, tension: 0.45, pointBackgroundColor: col, pointRadius: 4, pointHoverRadius: 8, borderWidth: 2 });
      });
    }

    chartRef.current = new Chart(ctx, {
      type: 'line', data: { labels, datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: !compareMode && !duelMode, labels: { color: 'rgba(240,237,232,0.5)', font: { family: 'DM Mono', size: 11 }, usePointStyle: true, padding: 20, pointStyleWidth: 8 } },
          tooltip: { backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, titleColor: '#f0ede8', bodyColor: 'rgba(240,237,232,0.6)', titleFont: { family: 'Bebas Neue', size: 14 }, bodyFont: { family: 'DM Mono', size: 11 }, padding: 14 },
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(240,237,232,0.3)', font: { family: 'DM Mono', size: 10 } } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(240,237,232,0.3)', font: { family: 'DM Mono', size: 10 } }, beginAtZero: true },
        },
      },
    });

    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [players, stats, selectedPlayer, compareMode, duelMode, duelSelected, activeStats]);

  return <canvas ref={canvasRef} />;
};

// ── Add Stat Form (Admin) ─────────────────────────────────
const AddStatForm = ({ players, onAdd }) => {
  const [pid, setPid]     = useState(players[0]?.id || '');
  const [label, setLabel] = useState('');
  const [kills, setKills] = useState('');
  const [deaths, setDeaths] = useState('');
  const [result, setResult] = useState('1');

  const handleSubmit = () => {
    onAdd({ pid: parseInt(pid), label, kills: parseInt(kills)||0, deaths: parseInt(deaths)||0, win: parseInt(result) });
    setLabel(''); setKills(''); setDeaths('');
  };

  return (
    <div className="tracker-admin-panel on" id="trackerAdminPanel">
      <div className="form-title">Add Stat Entry</div>
      <div className="form-grid">
        <div className="form-group">
          <label>Player</label>
          <select className="input" value={pid} onChange={(e) => setPid(e.target.value)}>
            {players.map((p) => <option key={p.id} value={p.id}>{p.avatar} {p.name}</option>)}
          </select>
        </div>
        <div className="form-group"><label>Match Label</label><input className="input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="G7 vs. Team X" /></div>
        <div className="form-group"><label>Kills</label><input type="number" className="input" value={kills} onChange={(e) => setKills(e.target.value)} placeholder="0" min="0" /></div>
        <div className="form-group"><label>Deaths</label><input type="number" className="input" value={deaths} onChange={(e) => setDeaths(e.target.value)} placeholder="0" min="0" /></div>
        <div className="form-group">
          <label>Result</label>
          <select className="input" value={result} onChange={(e) => setResult(e.target.value)}>
            <option value="1">Win</option><option value="0">Loss</option>
          </select>
        </div>
      </div>
      <div className="form-actions"><button className="btn btn-solid" onClick={handleSubmit}>Add Entry</button></div>
    </div>
  );
};

// ── Reset Stats Panel (Admin) ─────────────────────────────
const ResetStatsPanel = ({ players, onReset }) => {
  const [confirmId, setConfirmId] = useState(null);

  const handleReset = (pid) => {
    if (confirmId === pid) {
      onReset(pid);
      setConfirmId(null);
    } else {
      setConfirmId(pid);
      setTimeout(() => setConfirmId(null), 3000);
    }
  };

  return (
    <div className="tracker-admin-panel on" style={{ marginTop: 16 }}>
      <div className="form-title">Reset Stats par Joueur</div>
      <div className="form-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
        {players.map((p) => (
          <button
            key={p.id}
            className={`btn${confirmId === p.id ? "" : " btn-solid"}`}
            style={confirmId === p.id ? { border: "1px solid #ff4444", color: "#ff4444", background: "transparent" } : {}}
            onClick={() => handleReset(p.id)}
          >
            {confirmId === p.id ? `⚠ Confirmer ${p.name}` : `🗑 ${p.name}`}
          </button>
        ))}
      </div>
      <div style={{ fontSize: "0.6rem", color: "var(--muted)", marginTop: 8, letterSpacing: "0.05em" }}>
        Clique une fois pour sélectionner, une 2e fois pour confirmer le reset.
      </div>
    </div>
  );
};

// ── Main TrackerPage ──────────────────────────────────────
const TrackerPage = ({ toast }) => {
  const { players, stats, setStats, isAdmin } = useAppContext();

  const [selectedPlayer, setSelectedPlayer] = useState(players[0]?.id);
  const [compareMode, setCompareMode]       = useState(false);
  const [duelMode, setDuelMode]             = useState(false);
  const [duelSelected, setDuelSelected]     = useState([]);
  const [activeStats, setActiveStats]       = useState({ kills: true, deaths: true, wins: true, losses: false });
  const [chartView, setChartView]           = useState('chart'); // 'chart' | 'grid'

  const legend = (() => {
    if (!compareMode && !duelMode) return null;
    const list = duelMode && duelSelected.length === 2
      ? duelSelected.map((pid, i) => ({ p: players.find((x) => x.id === pid), col: i === 0 ? '#e8ff00' : '#00aaff' }))
      : players.map((p, i) => ({ p, col: PCOLORS[i % PCOLORS.length] }));
    return list.filter((x) => x.p).map(({ p, col }) => (
      <div key={p.id} className="legend-item">
        <div className="legend-dot" style={{ background: col }} />
        {p.avatar} {p.name}
      </div>
    ));
  })();

  const handleSelectPlayer = (id) => {
    setSelectedPlayer(id); setCompareMode(false); setDuelMode(false);
  };

  const handleToggleCompare = () => {
    setCompareMode((c) => !c); setDuelMode(false);
  };

  const handleToggleDuel = () => {
    setDuelMode((d) => !d); setCompareMode(false);
    if (duelMode) setDuelSelected([]);
  };

  const handleSelectDuel = (id) => {
    setDuelSelected((prev) => {
      if (prev[0] === id) return prev.slice(1);
      if (prev[1] === id) return [prev[0]];
      if (prev.length < 2) return [...prev, id];
      return [prev[0], id];
    });
  };

  const handleToggleStat = (s) => {
    setActiveStats((prev) => ({ ...prev, [s]: !prev[s] }));
  };

  const handleAddStat = ({ pid, label, kills, deaths, win }) => {
    const resolvedLabel = label || ('G' + ((stats[pid]?.labels?.length || 0) + 1));
    setStats((prev) => {
      const next = { ...prev };
      if (!next[pid]) next[pid] = { labels: [], kills: [], deaths: [], wins: [], losses: [] };
      else next[pid] = { ...next[pid], labels: [...next[pid].labels], kills: [...next[pid].kills], deaths: [...next[pid].deaths], wins: [...next[pid].wins], losses: [...next[pid].losses] };
      next[pid].labels.push(resolvedLabel);
      next[pid].kills.push(kills);
      next[pid].deaths.push(deaths);
      next[pid].wins.push(win);
      next[pid].losses.push(1 - win);
      return next;
    });
    toast('Stat entry added');
  };

  const handleResetStats = (pid) => {
    setStats((prev) => ({
      ...prev,
      [pid]: { labels: [], kills: [], deaths: [], wins: [], losses: [] },
    }));
    toast(`Stats de ${players.find(p => p.id === pid)?.name || pid} réinitialisées`);
  };

  return (
    <div className="page active" id="page-tracker">
      <div className="section">
        <div className="section-head">
          <div>
            <div className="section-overline">// Performance Data</div>
            <h2 className="section-title">Player Stats</h2>
          </div>
          <div style={{ display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap' }}>
            <button className={`compare-btn${compareMode ? ' active' : ''}`} onClick={handleToggleCompare} style={{ maxWidth:'140px' }}>Compare All</button>
            <button className="btn btn-ghost" style={{ fontSize:'0.6rem', padding:'8px 16px' }} onClick={handleToggleDuel}>⚔ 1v1 Compare</button>
          </div>
        </div>

        {/* Duel select */}
        {duelMode && (
          <div className="compare-select-area on">
            <div className="compare-select-title">Select 2 players to compare</div>
            <div className="compare-player-btns">
              {players.map((p) => {
                let cls = '';
                if (duelSelected[0] === p.id) cls = 'sel1';
                else if (duelSelected[1] === p.id) cls = 'sel2';
                return (
                  <button key={p.id} className={`compare-player-btn ${cls}`} onClick={() => handleSelectDuel(p.id)}>
                    {p.avatar} {p.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="tracker-layout">
          {/* Sidebar */}
          <div className="tracker-sidebar">
            <div className="tracker-sidebar-title">Players</div>
            {players.map((p) => (
              <PlayerTab
                key={p.id}
                player={p}
                isActive={p.id === selectedPlayer && !compareMode && !duelMode}
                onClick={() => handleSelectPlayer(p.id)}
              />
            ))}
          </div>

          {/* Main */}
          <div className="tracker-main">
            <div className="tracker-controls">
              <div className="stat-pills">
                {['kills','deaths','wins','losses'].map((s) => (
                  <button
                    key={s}
                    className="stat-pill"
                    data-stat={s}
                    data-active={activeStats[s] ? 'true' : 'false'}
                    onClick={() => handleToggleStat(s)}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
              <div className="view-toggle-btns">
                <button className={`view-toggle-btn${chartView === 'chart' ? ' active' : ''}`} onClick={() => setChartView('chart')}>Chart</button>
                <button className={`view-toggle-btn${chartView === 'grid' ? ' active' : ''}`} onClick={() => setChartView('grid')}>Grid</button>
              </div>
            </div>

            {legend && (
              <div className="compare-legend" style={{ display: 'flex' }}>{legend}</div>
            )}

            {chartView === 'chart' ? (
              <div className="chart-box">
                <StatsChart
                  players={players}
                  stats={stats}
                  selectedPlayer={selectedPlayer}
                  compareMode={compareMode}
                  duelMode={duelMode}
                  duelSelected={duelSelected}
                  activeStats={activeStats}
                />
              </div>
            ) : (
              <GridView players={players} stats={stats} duelSelected={duelSelected} duelMode={duelMode} />
            )}
          </div>
        </div>

        {isAdmin && <AddStatForm players={players} onAdd={handleAddStat} />}
        {isAdmin && <ResetStatsPanel players={players} onReset={handleResetStats} />}
      </div>
    </div>
  );
};

export default TrackerPage;
