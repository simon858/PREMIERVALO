import { useState, useRef } from 'react';
import { useAppContext } from '../AppContext';
import { calcStars, ROLE_COLORS } from '../utils/helpers';
import { ROLE_OPTIONS, AGENT_OPTIONS } from '../utils/constants';

const PlayerCard = ({ player, index, isAdmin, stats, onEdit, onDelete }) => {
  const stars   = calcStars(player, stats);
  const roles   = player.roles || ['Duelist'];
  const agents  = player.agents || [];

  return (
    <div
      className={`player-card${isAdmin ? ' admin-mode' : ''}`}
      id={`pc-${player.id}`}
      data-name={player.name.toLowerCase()}
      data-roles={roles.join(',').toLowerCase()}
      data-agents={agents.join(',').toLowerCase()}
    >
      <div className="player-card-inner">
        <div className="player-number">{String(index + 1).padStart(2, '0')}</div>
        {player.photo
          ? <img src={player.photo} className="player-avatar-img" alt={player.name} />
          : <div className="player-avatar-placeholder">{player.avatar}</div>
        }
        <div className="player-card-name">{player.name}</div>
        <div className="role-badges">
          {roles.map((r) => (
            <span key={r} className="role-badge" style={{ color: ROLE_COLORS[r]||'var(--white3)', borderColor: (ROLE_COLORS[r]||'var(--white3)') + '33' }}>{r}</span>
          ))}
        </div>
        {agents.length > 0 && (
          <div className="agents-list">
            {agents.map((a) => <span key={a} className="agent-chip">{a}</span>)}
          </div>
        )}
        {player.note && <div className="player-card-note">{player.note}</div>}
        <div className="player-stars">
          {[1,2,3,4,5].map((n) => <span key={n} className={`star${n <= stars ? ' filled' : ''}`}>★</span>)}
        </div>
        <div style={{ fontFamily:'var(--mono)', fontSize:'0.55rem', letterSpacing:'0.1em', color:'var(--white3)', marginTop:'4px' }}>AUTO-RATED</div>
      </div>
      {isAdmin && (
        <div className="player-card-footer">
          <button className="btn btn-ghost" style={{ fontSize:'0.62rem', padding:'8px 14px' }} onClick={() => onEdit(player.id)}>Edit</button>
          <button className="btn btn-ghost" style={{ fontSize:'0.62rem', padding:'8px 14px', borderColor:'var(--red)', color:'var(--red)' }} onClick={() => onDelete(player.id)}>Remove</button>
        </div>
      )}
    </div>
  );
};

const AvatarEditor = ({ photo, avatar, onUpload, onRemove }) => {
  const inputRef = useRef(null);
  return (
    <div className="avatar-preview" onClick={() => inputRef.current?.click()} style={{ width:80, height:80, flexShrink:0 }}>
      {photo
        ? <img src={photo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%', position:'absolute', inset:0 }} />
        : <span style={{ position:'relative', zIndex:1, fontSize:'2rem' }}>{avatar || '🎮'}</span>
      }
      <div className="avatar-preview-hint">Change</div>
      <input type="file" accept="image/*" ref={inputRef} style={{ display:'none' }} onChange={onUpload} />
    </div>
  );
};

const RosterPage = ({ toast }) => {
  const { players, setPlayers, stats, setStats, isAdmin } = useAppContext();

  const [filterName,  setFilterName]  = useState('');
  const [filterRole,  setFilterRole]  = useState('');
  const [filterAgent, setFilterAgent] = useState('');
  const [showAddForm,  setShowAddForm]  = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  // Add form state
  const [npName,   setNpName]   = useState('');
  const [npRole,   setNpRole]   = useState('');
  const [npAvatar, setNpAvatar] = useState('');
  const [npAgent,  setNpAgent]  = useState('');
  const [npNote,   setNpNote]   = useState('');

  // Edit form state
  const [epId,     setEpId]     = useState(null);
  const [epName,   setEpName]   = useState('');
  const [epRole,   setEpRole]   = useState('');
  const [epAvatar, setEpAvatar] = useState('');
  const [epAgent,  setEpAgent]  = useState('');
  const [epNote,   setEpNote]   = useState('');
  const [epPhoto,  setEpPhoto]  = useState('');
  const [epTempPhoto, setEpTempPhoto] = useState(null);

  const filtered = players.filter((p) => {
    const nameOk  = !filterName  || p.name.toLowerCase().includes(filterName.toLowerCase());
    const roleOk  = !filterRole  || (p.roles||[]).join(',').toLowerCase().includes(filterRole.toLowerCase());
    const agentOk = !filterAgent || (p.agents||[]).join(',').toLowerCase().includes(filterAgent.toLowerCase());
    return nameOk && roleOk && agentOk;
  });

  const handleAddPlayer = () => {
    if (!npName.trim()) { toast('Enter a gamertag', true); return; }
    const id    = Date.now();
    const roles = npRole.trim() ? npRole.split(',').map((r) => r.trim()).filter(Boolean) : ['Duelist'];
    const agents = npAgent.trim() ? npAgent.split(',').map((a) => a.trim()).filter(Boolean) : [];
    setPlayers((prev) => [...prev, { id, name: npName.trim(), roles, avatar: npAvatar.trim() || '🎮', agents, note: npNote.trim(), photo: '' }]);
    setStats((prev) => ({ ...prev, [id]: { labels:[], kills:[], deaths:[], wins:[], losses:[] } }));
    setNpName(''); setNpRole(''); setNpAvatar(''); setNpAgent(''); setNpNote('');
    setShowAddForm(false);
    toast(`${npName.trim()} added to roster`);
  };

  const handleOpenEdit = (id) => {
    const p = players.find((x) => x.id === id); if (!p) return;
    setEpId(id); setEpName(p.name); setEpRole((p.roles||[]).join(', ')); setEpAvatar(p.avatar);
    setEpAgent((p.agents||[]).join(', ')); setEpNote(p.note || ''); setEpPhoto(p.photo || '');
    setEpTempPhoto(null); setShowEditForm(true);
  };

  const handleSaveEdit = () => {
    setPlayers((prev) => prev.map((p) => {
      if (p.id !== epId) return p;
      const roles  = epRole.trim()  ? epRole.split(',').map((r) => r.trim()).filter(Boolean)  : p.roles;
      const agents = epAgent.trim() ? epAgent.split(',').map((a) => a.trim()).filter(Boolean) : p.agents;
      const photo  = epTempPhoto === '__remove__' ? '' : (epTempPhoto || p.photo);
      return { ...p, name: epName.trim() || p.name, roles, avatar: epAvatar.trim() || p.avatar, agents, note: epNote.trim(), photo };
    }));
    setShowEditForm(false);
    setEpTempPhoto(null);
    toast('Player updated');
  };

  const handleDeletePlayer = (id) => {
    if (!window.confirm('Remove this player from the roster?')) return;
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    toast('Player removed');
  };

  const handleEpAvatarUpload = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setEpTempPhoto(ev.target.result); setEpPhoto(ev.target.result); };
    reader.readAsDataURL(file);
  };

  return (
    <div className="page active" id="page-roster">
      <div className="section">
        <div className="section-head">
          <div>
            <div className="section-overline">// The Squad</div>
            <h2 className="section-title">Roster</h2>
          </div>
          {isAdmin && (
            <button className="btn btn-solid" onClick={() => setShowAddForm((o) => !o)}>+ Add Player</button>
          )}
        </div>

        {/* Filters */}
        <div className="roster-filters">
          <input className="filter-input" placeholder="Search name..." value={filterName} onChange={(e) => setFilterName(e.target.value)} />
          <select className="filter-select" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="">All Roles</option>
            {ROLE_OPTIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
          <select className="filter-select" value={filterAgent} onChange={(e) => setFilterAgent(e.target.value)}>
            <option value="">All Agents</option>
            {AGENT_OPTIONS.map((a) => <option key={a}>{a}</option>)}
          </select>
          <button className="filter-clear-btn" onClick={() => { setFilterName(''); setFilterRole(''); setFilterAgent(''); }}>Clear Filters</button>
        </div>

        <div className="roster-grid">
          {filtered.map((p, i) => (
            <PlayerCard key={p.id} player={p} index={players.indexOf(p)} isAdmin={isAdmin} stats={stats} onEdit={handleOpenEdit} onDelete={handleDeletePlayer} />
          ))}
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="form-panel open">
            <div className="form-title">New Player</div>
            <div className="form-grid">
              <div className="form-group"><label>Gamertag</label><input className="input" value={npName} onChange={(e) => setNpName(e.target.value)} placeholder="e.g. EZIO" /></div>
              <div className="form-group"><label>Roles (comma-separated)</label><input className="input" value={npRole} onChange={(e) => setNpRole(e.target.value)} placeholder="Duelist, IGL" /></div>
              <div className="form-group"><label>Emoji Avatar</label><input className="input" value={npAvatar} onChange={(e) => setNpAvatar(e.target.value)} placeholder="🎮" maxLength={4} /></div>
              <div className="form-group"><label>Agents (comma-separated)</label><input className="input" value={npAgent} onChange={(e) => setNpAgent(e.target.value)} placeholder="Jett, Harbor, Omen" /></div>
              <div className="form-group"><label>Bio / Note</label><input className="input" value={npNote} onChange={(e) => setNpNote(e.target.value)} placeholder="Short bio or note" /></div>
            </div>
            <div className="form-actions">
              <button className="btn btn-solid" onClick={handleAddPlayer}>Add to Roster</button>
              <button className="btn btn-ghost" onClick={() => setShowAddForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Edit Form */}
        {showEditForm && (
          <div className="form-panel open">
            <div className="form-title">Edit Player</div>
            <div className="avatar-upload-area" style={{ alignItems:'flex-start', flexDirection:'row', gap:20, marginBottom:28, paddingBottom:24, borderBottom:'1px solid var(--border)' }}>
              <AvatarEditor
                photo={epPhoto}
                avatar={epAvatar}
                onUpload={handleEpAvatarUpload}
                onRemove={() => { setEpTempPhoto('__remove__'); setEpPhoto(''); }}
              />
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:'var(--mono)', fontSize:'0.6rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--white3)', marginBottom:10 }}>Profile Picture</div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  <button className="btn btn-ghost" style={{ fontSize:'0.6rem', padding:'7px 14px' }} onClick={() => document.querySelector('#ep-file-input')?.click()}>Upload Image</button>
                  <button className="btn btn-ghost" style={{ fontSize:'0.6rem', padding:'7px 14px', borderColor:'var(--red)', color:'var(--red)' }} onClick={() => { setEpTempPhoto('__remove__'); setEpPhoto(''); }}>Remove Photo</button>
                </div>
                <input type="file" id="ep-file-input" accept="image/*" style={{ display:'none' }} onChange={handleEpAvatarUpload} />
                <div style={{ marginTop:10, fontFamily:'var(--mono)', fontSize:'0.58rem', color:'var(--white3)', letterSpacing:'0.1em' }}>Or use emoji:</div>
                <input className="input" value={epAvatar} onChange={(e) => setEpAvatar(e.target.value)} maxLength={4} placeholder="🎮" style={{ marginTop:6, maxWidth:90 }} />
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group"><label>Gamertag</label><input className="input" value={epName} onChange={(e) => setEpName(e.target.value)} /></div>
              <div className="form-group"><label>Roles (comma-separated)</label><input className="input" value={epRole} onChange={(e) => setEpRole(e.target.value)} placeholder="Duelist, IGL" /></div>
              <div className="form-group"><label>Agents (comma-separated)</label><input className="input" value={epAgent} onChange={(e) => setEpAgent(e.target.value)} placeholder="Jett, Harbor, Omen" /></div>
              <div className="form-group" style={{ gridColumn:'1/-1' }}><label>Bio / Note</label><input className="input" value={epNote} onChange={(e) => setEpNote(e.target.value)} placeholder="Short bio or note" /></div>
            </div>
            <div className="form-actions">
              <button className="btn btn-solid" onClick={handleSaveEdit}>Save Changes</button>
              <button className="btn btn-ghost" onClick={() => setShowEditForm(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RosterPage;
