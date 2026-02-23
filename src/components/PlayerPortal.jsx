import { useState, useRef } from 'react';
import { useAppContext } from '../AppContext';
import { calcStars } from '../utils/helpers';

// ── Portal Stats Tab ──────────────────────────────────────
const PortalStatsTab = ({ player, stats }) => {
  const d = stats[player.id];
  if (!d || !d.labels.length)
    return <div className="empty" style={{ border:'none' }}><div className="empty-label">No Stats Yet</div></div>;

  const totalKills  = d.kills.reduce((a, b) => a + b, 0);
  const totalDeaths = d.deaths.reduce((a, b) => a + b, 0);
  const totalWins   = d.wins.reduce((a, b) => a + b, 0);
  const kda         = totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(2) : totalKills;

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:1, background:'var(--border)', border:'1px solid var(--border)', marginBottom:24 }}>
        {[['Total Kills',totalKills,'var(--accent)'],['Total Deaths',totalDeaths,'var(--red)'],['Wins',totalWins,'#00ff88'],['KDA Ratio',kda,'var(--blue)']].map(([lbl,val,col]) => (
          <div key={lbl} style={{ background:'var(--black)', padding:'24px 20px' }}>
            <div style={{ fontFamily:'var(--serif)', fontSize:'2.5rem', color:col, lineHeight:1 }}>{val}</div>
            <div style={{ fontFamily:'var(--mono)', fontSize:'0.58rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--white3)', marginTop:6 }}>{lbl}</div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily:'var(--mono)', fontSize:'0.6rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--white3)', marginBottom:12 }}>Game History</div>
      <div style={{ display:'flex', flexDirection:'column', gap:1, background:'var(--border)', border:'1px solid var(--border)' }}>
        {d.labels.map((lbl, i) => (
          <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr repeat(3,80px)', background:'var(--off-black)', padding:'12px 16px', alignItems:'center', gap:16 }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:'0.72rem', color:'var(--white)' }}>{lbl}</div>
            <div style={{ textAlign:'center' }}><span style={{ fontFamily:'var(--mono)', fontSize:'0.65rem', color:'var(--accent)' }}>{d.kills[i]} K</span></div>
            <div style={{ textAlign:'center' }}><span style={{ fontFamily:'var(--mono)', fontSize:'0.65rem', color:'var(--red)' }}>{d.deaths[i]} D</span></div>
            <div style={{ textAlign:'center' }}><span style={{ fontFamily:'var(--mono)', fontSize:'0.65rem', color:d.wins[i] ? '#00ff88' : 'var(--white3)' }}>{d.wins[i] ? 'WIN' : 'LOSS'}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Portal Security Tab ───────────────────────────────────
const PortalSecurityTab = ({ player, setPlayers, toast }) => {
  const [oldPass,  setOldPass]  = useState('');
  const [newPass,  setNewPass]  = useState('');
  const [confirm,  setConfirm]  = useState('');

  const handleChange = () => {
    if (player.password && oldPass !== player.password) { toast('Current password is wrong', true); return; }
    if (!newPass) { toast('New password cannot be empty', true); return; }
    if (newPass !== confirm) { toast('Passwords do not match', true); return; }
    setPlayers((prev) => prev.map((p) => p.id === player.id ? { ...p, password: newPass } : p));
    setOldPass(''); setNewPass(''); setConfirm('');
    toast('Password updated!');
  };

  return (
    <div style={{ maxWidth: 500, marginTop: 32 }}>
      <div style={{ background:'var(--off-black)', border:'1px solid var(--border)', padding:36 }}>
        <div className="portal-panel-title">Security</div>
        <p style={{ fontFamily:'var(--mono)', fontSize:'0.65rem', letterSpacing:'0.08em', color:'var(--white3)', marginBottom:24, lineHeight:1.8 }}>
          Logged in as: <span style={{ color:'var(--accent)' }}>{player.name}</span> · <span style={{ color:'var(--white2)' }}>{(player.roles||[]).join(', ')}</span>
        </p>
        <div className="profile-section-title">Change Password</div>
        <div className="form-group" style={{ marginBottom:14 }}><label>Current Password</label><input type="password" className="input" value={oldPass} onChange={(e) => setOldPass(e.target.value)} placeholder="Leave blank if none set" /></div>
        <div className="form-group" style={{ marginBottom:14 }}><label>New Password</label><input type="password" className="input" value={newPass} onChange={(e) => setNewPass(e.target.value)} /></div>
        <div className="form-group" style={{ marginBottom:20 }}><label>Confirm Password</label><input type="password" className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
        <button className="btn btn-solid" onClick={handleChange}>Update Password</button>
      </div>
    </div>
  );
};

// ── Main PlayerPortal ─────────────────────────────────────
const PlayerPortal = ({ toast, onLogout }) => {
  const { players, setPlayers, stats, loggedPlayerId } = useAppContext();
  const [tab, setTab] = useState('profile');
  const [tempPhoto, setTempPhoto] = useState(null);
  const avatarInputRef = useRef(null);

  const player = players.find((p) => p.id === loggedPlayerId);
  if (!player) return null;

  const stars   = calcStars(player, stats);
  const roles   = player.roles || ['Player'];
  const displayPhoto = tempPhoto && tempPhoto !== '__remove__' ? tempPhoto : (tempPhoto === '__remove__' ? null : player.photo);

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setTempPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const [formName,  setFormName]  = useState(player.name);
  const [formAgent, setFormAgent] = useState((player.agents||[]).join(', '));
  const [formRole,  setFormRole]  = useState((player.roles||[]).join(', '));
  const [formNote,  setFormNote]  = useState(player.note || '');

  const handleSave = () => {
    setPlayers((prev) => prev.map((p) => {
      if (p.id !== loggedPlayerId) return p;
      const agents = formAgent.trim() ? formAgent.split(',').map((a) => a.trim()).filter(Boolean) : p.agents;
      const proles = formRole.trim()  ? formRole.split(',').map((r) => r.trim()).filter(Boolean)  : p.roles;
      const photo  = tempPhoto === '__remove__' ? '' : (tempPhoto || p.photo);
      return { ...p, name: formName.trim() || p.name, agents, roles: proles, note: formNote.trim(), photo };
    }));
    setTempPhoto(null);
    toast('Profile updated!');
  };

  const avatarPreviewEl = displayPhoto
    ? <img src={displayPhoto} style={{ width:100, height:100, borderRadius:'50%', objectFit:'cover', border:'3px solid var(--accent)', marginBottom:16 }} alt="" />
    : <div style={{ width:100, height:100, borderRadius:'50%', background:'var(--dark)', border:'3px solid var(--accent)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'3rem', marginBottom:16 }}>{player.avatar}</div>;

  return (
    <div className="page active" id="page-portal">
      {/* Portal Header */}
      <div className="portal-header">
        <div className="portal-header-avatar">
          {player.photo
            ? <img src={player.photo} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} alt="" />
            : <span>{player.avatar}</span>
          }
        </div>
        <div className="portal-header-info">
          <div className="portal-header-role">{roles.join(' · ')}</div>
          <div className="portal-header-name">{player.name}</div>
        </div>
        <button className="portal-logout-btn" onClick={onLogout}>⏻ Sign Out</button>
      </div>

      <div style={{ maxWidth:1400, margin:'0 auto', padding:'0 0 80px' }}>
        {/* Tabs */}
        <div className="portal-tabs" style={{ padding:'0 40px', marginTop:32 }}>
          {['profile','stats','security'].map((t) => (
            <button key={t} className={`portal-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="portal-tab-content active" style={{ padding:'0 40px' }}>
            <div className="portal-grid" style={{ border:'1px solid var(--border)', background:'var(--border)' }}>
              {/* Edit panel */}
              <div className="portal-panel">
                <div className="portal-panel-title">Edit Profile</div>
                <div className="avatar-upload-area">
                  <div className="avatar-preview" onClick={() => avatarInputRef.current?.click()}>
                    {displayPhoto
                      ? <img src={displayPhoto} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%', position:'absolute', inset:0 }} />
                      : <span style={{ position:'relative', zIndex:1 }}>{player.avatar}</span>
                    }
                    <div className="avatar-preview-hint">Change Photo</div>
                  </div>
                  <div className="avatar-upload-label">Click to upload profile picture</div>
                  <input type="file" ref={avatarInputRef} accept="image/*" style={{ display:'none' }} onChange={handleAvatarUpload} />
                  <div style={{ display:'flex', gap:8, marginTop:4 }}>
                    <button className="btn btn-ghost" style={{ fontSize:'0.6rem', padding:'6px 12px' }} onClick={() => avatarInputRef.current?.click()}>Upload Image</button>
                    <button className="btn btn-ghost" style={{ fontSize:'0.6rem', padding:'6px 12px', borderColor:'var(--red)', color:'var(--red)' }} onClick={() => setTempPhoto('__remove__')}>Remove</button>
                  </div>
                </div>
                <div className="profile-section-title">Player Info</div>
                <div className="form-group" style={{ marginBottom:14 }}><label>Gamertag</label><input className="input" value={formName} onChange={(e) => setFormName(e.target.value)} /></div>
                <div className="form-group" style={{ marginBottom:14 }}><label>Agents (comma-separated)</label><input className="input" value={formAgent} onChange={(e) => setFormAgent(e.target.value)} placeholder="Jett, Omen, Sova..." /></div>
                <div className="form-group" style={{ marginBottom:14 }}><label>Roles (comma-separated)</label><input className="input" value={formRole} onChange={(e) => setFormRole(e.target.value)} placeholder="Duelist, IGL" /></div>
                <div className="form-group" style={{ marginBottom:20 }}><label>Bio / Note</label><textarea className="input" value={formNote} onChange={(e) => setFormNote(e.target.value)} rows={3} placeholder="Short bio..." style={{ resize:'vertical' }} /></div>
                <button className="btn btn-solid" onClick={handleSave}>Save Changes</button>
              </div>

              {/* Preview panel */}
              <div className="portal-panel">
                <div className="portal-panel-title">Current Profile</div>
                <div style={{ textAlign:'center', padding:'20px 0' }}>
                  {avatarPreviewEl}
                  <div style={{ fontFamily:'var(--serif)', fontSize:'2.2rem', textTransform:'uppercase', color:'var(--white)', marginBottom:4 }}>{player.name}</div>
                  <div style={{ fontFamily:'var(--mono)', fontSize:'0.6rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--accent)', marginBottom:12 }}>{roles.join(' · ')}</div>
                  <div style={{ display:'flex', gap:3, justifyContent:'center' }}>
                    {[1,2,3,4,5].map((n) => <span key={n} className={`star${n <= stars ? ' filled' : ''}`}>★</span>)}
                  </div>
                  <div style={{ fontFamily:'var(--mono)', fontSize:'0.55rem', color:'var(--white3)', marginTop:4, letterSpacing:'0.1em' }}>AUTO-RATED ★</div>
                </div>
                <div className="profile-section-title">Info</div>
                <div className="portal-stat-row"><span className="portal-stat-label">Agents</span><span className="portal-stat-value" style={{ color:'var(--blue)' }}>{(player.agents||[]).join(', ') || '—'}</span></div>
                <div className="portal-stat-row"><span className="portal-stat-label">Roles</span><span className="portal-stat-value" style={{ color:'var(--accent)' }}>{roles.join(', ')}</span></div>
                <div className="portal-stat-row"><span className="portal-stat-label">Stars</span><span className="portal-stat-value">{stars} / 5</span></div>
                {player.note && <div className="portal-stat-row"><span className="portal-stat-label">Bio</span><span className="portal-stat-value" style={{ fontStyle:'italic', color:'var(--white2)' }}>{player.note}</span></div>}
              </div>
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {tab === 'stats' && (
          <div className="portal-tab-content active" style={{ padding:'0 40px' }}>
            <PortalStatsTab player={player} stats={stats} />
          </div>
        )}

        {/* Security Tab */}
        {tab === 'security' && (
          <div className="portal-tab-content active" style={{ padding:'0 40px' }}>
            <PortalSecurityTab player={player} setPlayers={setPlayers} toast={toast} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerPortal;
