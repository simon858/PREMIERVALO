import { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { formatCountdown, formatCountdownUppercase, isMatchHot } from '../utils/helpers';

// ── Match Detail Modal ────────────────────────────────────
const MatchDetailModal = ({ match, polls, onClose, onNavigateLineup }) => {
  const [tab, setTab] = useState('info');
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (!match) return;
    const tick = () => setCountdown(formatCountdownUppercase(match.date));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [match]);

  if (!match) return null;
  const d         = new Date(match.date);
  const typeClass = match.type === 'training' ? 'training' : 'official';
  const typeLabel = match.type === 'training' ? '🏋 Training Match' : '🏆 Official Match';
  const matchPolls = polls.filter((p) => p.type === 'matches' || p.question.toLowerCase().includes(match.opponent.toLowerCase()));

  return (
    <div className="match-detail-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="match-detail-box">
        <button className="match-detail-close" onClick={onClose}>✕</button>
        <div className="match-detail-header">
          <span className={`match-type-badge ${typeClass}`} style={{ marginBottom:12, display:'inline-block' }}>{typeLabel}</span>
          <div style={{ fontFamily:'var(--serif)', fontSize:'2.5rem', color:'var(--white)', lineHeight:1, marginBottom:8 }}>
            <span style={{ color:'var(--accent)' }}>Mododium</span> <span style={{ fontSize:'1rem', fontFamily:'var(--mono)', color:'var(--white3)' }}>VS</span> {match.opponent}
          </div>
          <div style={{ fontFamily:'var(--mono)', fontSize:'0.62rem', color:'var(--white3)', letterSpacing:'0.1em' }}>
            {d.toLocaleDateString('en', { weekday:'long', month:'long', day:'numeric', year:'numeric' })} at {d.toLocaleTimeString('en', { hour:'2-digit', minute:'2-digit' })}
          </div>
        </div>

        <div className="match-detail-tabs">
          {['info','polls','lineup'].map((t) => (
            <button key={t} className={`match-detail-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
              {t === 'info' ? 'Match Info' : t === 'polls' ? 'Linked Polls' : 'Lineup'}
            </button>
          ))}
        </div>

        <div className="match-detail-content">
          {tab === 'info' && (
            <div className="match-detail-tab-panel active">
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:'var(--border)', border:'1px solid var(--border)', marginBottom:24 }}>
                {[['Map', `🗺️ ${match.map}`], ['Tournament', match.tournament], ['Type', typeLabel]].map(([l, v]) => (
                  <div key={l} style={{ background:'var(--black)', padding:20 }}>
                    <div style={{ fontFamily:'var(--mono)', fontSize:'0.58rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--white3)', marginBottom:6 }}>{l}</div>
                    <div style={{ fontFamily:'var(--mono)', fontSize:'0.8rem', color:'var(--white)' }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign:'center', padding:'20px 0' }}>
                <div style={{ fontFamily:'var(--mono)', fontSize:'0.6rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--white3)', marginBottom:8 }}>Time Until Match</div>
                <div style={{ fontFamily:'var(--serif)', fontSize:'3rem', color:'var(--accent)' }}>{countdown}</div>
              </div>
            </div>
          )}
          {tab === 'polls' && (
            <div className="match-detail-tab-panel active">
              {matchPolls.length ? matchPolls.map((p) => {
                const total = p.votes.reduce((a, b) => a + b, 0);
                return (
                  <div key={p.id} style={{ marginBottom:16, padding:20, background:'var(--black)', border:'1px solid var(--border)' }}>
                    <div style={{ fontFamily:'var(--serif)', fontSize:'1.2rem', textTransform:'uppercase', color:'var(--white)', marginBottom:12 }}>{p.question}</div>
                    {p.options.map((opt, i) => {
                      const pct = total ? Math.round(p.votes[i] / total * 100) : 0;
                      return (
                        <div key={i}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontFamily:'var(--mono)', fontSize:'0.62rem' }}>
                            <span style={{ color:'var(--white2)' }}>{opt}</span>
                            <span style={{ color:'var(--accent)' }}>{pct}%</span>
                          </div>
                          <div style={{ height:2, background:'var(--border)', marginBottom:8 }}>
                            <div style={{ width:`${pct}%`, height:'100%', background:'var(--accent)' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              }) : <div style={{ textAlign:'center', padding:40, color:'var(--white3)', fontFamily:'var(--mono)', fontSize:'0.65rem', letterSpacing:'0.1em' }}>No linked polls for this match</div>}
            </div>
          )}
          {tab === 'lineup' && (
            <div className="match-detail-tab-panel active" style={{ textAlign:'center', padding:40 }}>
              <div style={{ fontFamily:'var(--serif)', fontSize:'2rem', textTransform:'uppercase', color:'var(--white3)', marginBottom:16 }}>Map: {match.map}</div>
              <button className="btn btn-solid" onClick={() => { onClose(); onNavigateLineup(); }}>Go to Lineup →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Edit Match Modal ──────────────────────────────────────
const EditMatchModal = ({ match, onClose, onSave }) => {
  const toLocalDatetime = (iso) => {
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [form, setForm] = useState({
    opp:  match.opponent,
    date: toLocalDatetime(match.date),
    map:  match.map,
    tour: match.tournament,
    type: match.type,
  });

  const handleSave = () => {
    if (!form.opp.trim() || !form.date) return;
    onSave(match.id, {
      opponent:   form.opp.trim(),
      date:       new Date(form.date).toISOString(),
      map:        form.map.trim() || 'TBD',
      tournament: form.tour.trim() || 'Friendly',
      type:       form.type,
    });
    onClose();
  };

  return (
    <div className="match-detail-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="match-detail-box" style={{ maxWidth: 560 }}>
        <button className="match-detail-close" onClick={onClose}>✕</button>
        <div className="match-detail-header">
          <div style={{ fontFamily:'var(--serif)', fontSize:'1.8rem', color:'var(--accent)', marginBottom:4 }}>Edit Match</div>
          <div style={{ fontFamily:'var(--mono)', fontSize:'0.62rem', color:'var(--white3)', letterSpacing:'0.1em' }}>vs {match.opponent}</div>
        </div>

        <div className="form-grid" style={{ padding:'0 0 16px' }}>
          <div className="form-group">
            <label>Opponent</label>
            <input className="input" value={form.opp} onChange={(e) => setForm((f) => ({...f, opp: e.target.value}))} placeholder="Arctic Foxes" />
          </div>
          <div className="form-group">
            <label>Date & Time</label>
            <input type="datetime-local" className="input" value={form.date} onChange={(e) => setForm((f) => ({...f, date: e.target.value}))} />
          </div>
          <div className="form-group">
            <label>Map</label>
            <input className="input" value={form.map} onChange={(e) => setForm((f) => ({...f, map: e.target.value}))} placeholder="Ascent" />
          </div>
          <div className="form-group">
            <label>Tournament</label>
            <input className="input" value={form.tour} onChange={(e) => setForm((f) => ({...f, tour: e.target.value}))} placeholder="VCT Challengers" />
          </div>
          <div className="form-group">
            <label>Match Type</label>
            <select className="input" value={form.type} onChange={(e) => setForm((f) => ({...f, type: e.target.value}))}>
              <option value="official">Official Match</option>
              <option value="training">Training Match</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-solid" onClick={handleSave}>Save Changes</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

// ── Match Row ─────────────────────────────────────────────
const MatchRow = ({ match, isNext, isAdmin, onClick, onDelete, onEdit }) => {
  const [cd, setCd] = useState(formatCountdown(match.date));
  const hot = isMatchHot(match.date);

  useEffect(() => {
    const id = setInterval(() => setCd(formatCountdown(match.date)), 1000);
    return () => clearInterval(id);
  }, [match.date]);

  const d         = new Date(match.date);
  const typeClass = match.type === 'training' ? 'training' : 'official';
  const typeLabel = match.type === 'training' ? '🏋 Training' : '🏆 Official';

  return (
    <div className={`match-row${isNext ? ' next-match' : ''}`} onClick={onClick}>
      <div className="match-date-block">
        <div className="match-day">{d.getDate()}</div>
        <div className="match-month">{d.toLocaleString('en', { month:'short', year:'numeric' })}</div>
        <div className="match-month">{d.toLocaleTimeString('en', { hour:'2-digit', minute:'2-digit' })}</div>
      </div>
      <div className="match-teams-block">
        <div className="match-t-name us">Mododium</div>
        <div className="match-vs">vs</div>
        <div className="match-t-name">{match.opponent}</div>
      </div>
      <div className="match-meta">
        <div className="match-tournament">{match.tournament}</div>
        <div className="match-info-line">🗺️ {match.map}</div>
      </div>
      <div><span className={`match-type-badge ${typeClass}`}>{typeLabel}</span></div>
      <div style={{ textAlign:'right' }}>
        <div className={`match-countdown${hot ? ' hot' : ''}`}>{cd === 'LIVE NOW' ? 'LIVE / PAST' : cd}</div>
        {isAdmin && (
          <div style={{ display:'flex', gap:6, justifyContent:'flex-end', marginTop:8 }}>
            <button className="btn btn-ghost" style={{ fontSize:'0.6rem', padding:'6px 12px' }}
              onClick={(e) => { e.stopPropagation(); onEdit(match); }}>
              ✏ Edit
            </button>
            <button className="btn btn-ghost" style={{ fontSize:'0.6rem', padding:'6px 12px', borderColor:'var(--red)', color:'var(--red)' }}
              onClick={(e) => { e.stopPropagation(); onDelete(match.id); }}>
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main MatchesPage ──────────────────────────────────────
const MatchesPage = ({ toast, onNavigateLineup }) => {
  const { matches, setMatches, updateMatch, polls, isAdmin } = useAppContext();
  const [showForm,    setShowForm]    = useState(false);
  const [activeMatch, setActiveMatch] = useState(null);
  const [editMatch,   setEditMatch]   = useState(null);
  const [form, setForm] = useState({ opp:'', date:'', map:'', tour:'', type:'official' });

  const sorted      = [...matches].sort((a, b) => new Date(a.date) - new Date(b.date));
  const nextMatchId = matches
    .filter((m) => new Date(m.date) > Date.now())
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0]?.id;

  const handleAdd = () => {
    if (!form.opp.trim() || !form.date) { toast('Opponent and date required', true); return; }
    setMatches((prev) => [...prev, { id: Date.now(), opponent: form.opp.trim(), date: new Date(form.date).toISOString(), map: form.map.trim() || 'TBD', tournament: form.tour.trim() || 'Friendly', type: form.type }]);
    setForm({ opp:'', date:'', map:'', tour:'', type:'official' });
    setShowForm(false);
    toast('Match scheduled');
  };

  const handleDelete = (id) => {
    setMatches((prev) => prev.filter((m) => m.id !== id));
    toast('Match removed');
  };

  const handleSaveEdit = (id, data) => {
    if (updateMatch) {
      updateMatch(id, data);
    } else {
      setMatches((prev) => prev.map((m) => m.id === id ? { ...m, ...data } : m));
    }
    toast('Match updated ✓');
  };

  return (
    <div className="page active" id="page-matches">
      <div className="section">
        <div className="section-head">
          <div>
            <div className="section-overline">// Schedule</div>
            <h2 className="section-title">Upcoming Matches</h2>
          </div>
          {isAdmin && <button className="btn btn-solid" onClick={() => setShowForm((o) => !o)}>+ Schedule</button>}
        </div>

        <div className="match-list">
          {sorted.length === 0
            ? <div className="empty"><div className="empty-label">No Matches Scheduled</div></div>
            : sorted.map((m) => (
              <MatchRow
                key={m.id}
                match={m}
                isNext={m.id === nextMatchId}
                isAdmin={isAdmin}
                onClick={() => setActiveMatch(m)}
                onDelete={handleDelete}
                onEdit={(match) => setEditMatch(match)}
              />
            ))
          }
        </div>

        {showForm && (
          <div className="form-panel open">
            <div className="form-title">Schedule Match</div>
            <div className="form-grid">
              <div className="form-group"><label>Opponent</label><input className="input" value={form.opp} onChange={(e) => setForm((f) => ({...f, opp:e.target.value}))} placeholder="Arctic Foxes" /></div>
              <div className="form-group"><label>Date & Time</label><input type="datetime-local" className="input" value={form.date} onChange={(e) => setForm((f) => ({...f, date:e.target.value}))} /></div>
              <div className="form-group"><label>Map</label><input className="input" value={form.map} onChange={(e) => setForm((f) => ({...f, map:e.target.value}))} placeholder="Ascent" /></div>
              <div className="form-group"><label>Tournament</label><input className="input" value={form.tour} onChange={(e) => setForm((f) => ({...f, tour:e.target.value}))} placeholder="VCT Challengers" /></div>
              <div className="form-group">
                <label>Match Type</label>
                <select className="input" value={form.type} onChange={(e) => setForm((f) => ({...f, type:e.target.value}))}>
                  <option value="official">Official Match</option>
                  <option value="training">Training Match</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-solid" onClick={handleAdd}>Schedule Match</button>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {activeMatch && (
        <MatchDetailModal
          match={activeMatch}
          polls={polls}
          onClose={() => setActiveMatch(null)}
          onNavigateLineup={onNavigateLineup}
        />
      )}

      {editMatch && (
        <EditMatchModal
          match={editMatch}
          onClose={() => setEditMatch(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default MatchesPage;
