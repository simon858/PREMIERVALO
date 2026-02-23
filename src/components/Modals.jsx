import { useState } from 'react';
import { useAppContext } from '../AppContext';
import { ADMIN_PASSWORD } from '../utils/constants';

// ── Admin Modal ───────────────────────────────────────────
export const AdminModal = ({ onClose, toast }) => {
  const { isAdmin, setIsAdmin } = useAppContext();
  const [pass, setPass] = useState('');

  const handleLogin = () => {
    if (pass === ADMIN_PASSWORD) {
      setIsAdmin(true); setPass(''); onClose(); toast('Admin mode activated');
    } else {
      toast('Wrong password', true); setPass('');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false); onClose(); toast('Admin mode deactivated');
  };

  return (
    <div className="overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">Admin Panel</div>
        <div className="modal-sub">
          {isAdmin ? 'Admin mode is currently active' : 'Enter password to unlock management controls'}
        </div>
        {!isAdmin ? (
          <div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <button className="btn btn-solid" style={{ width:'100%' }} onClick={handleLogin}>
              Authenticate
            </button>
          </div>
        ) : (
          <div>
            <p style={{ color:'var(--white2)', fontSize:'0.88rem', lineHeight:1.7, marginBottom:24 }}>
              Admin mode is active.
            </p>
            <button className="btn btn-ghost" style={{ width:'100%', borderColor:'var(--red)', color:'var(--red)' }} onClick={handleLogout}>
              Deactivate Admin Mode
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Player Login Modal ────────────────────────────────────
export const PlayerLoginModal = ({ onClose, onLoginSuccess, toast }) => {
  const { players, setLoggedPlayerId } = useAppContext();
  const [selectedId, setSelectedId]   = useState(null);
  const [pass, setPass]               = useState('');

  const selectedPlayer = players.find((p) => p.id === selectedId);

  const handleSelect = (id) => {
    setSelectedId(id); setPass('');
  };

  const handleLogin = () => {
    if (!selectedId) { toast('Select a player first', true); return; }
    const p = players.find((x) => x.id === selectedId);
    if (!p.password || pass === p.password) {
      setLoggedPlayerId(p.id);
      onClose();
      onLoginSuccess(p.id);
      toast(`Signed in as ${p.name}`);
    } else {
      toast('Wrong password', true); setPass('');
    }
  };

  return (
    <div className="overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="player-modal-box">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">Player Login</div>
        <div className="modal-sub">Select your profile</div>

        <div className="player-select-list">
          {players.map((p) => (
            <div
              key={p.id}
              className={`player-select-item${selectedId === p.id ? ' selected' : ''}`}
              onClick={() => handleSelect(p.id)}
            >
              <div className="player-select-avatar">
                {p.photo
                  ? <img src={p.photo} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} alt="" />
                  : p.avatar
                }
              </div>
              <div>
                <div className="player-select-name">{p.name}</div>
                <div className="player-select-role">{(p.roles||[p.role||'']).join(' · ')}</div>
              </div>
            </div>
          ))}
        </div>

        {selectedId && (
          <div>
            <div style={{ fontFamily:'var(--mono)', fontSize:'0.62rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--accent)', marginBottom:12 }}>
              Logging in as {selectedPlayer?.name}
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Password</label>
              <input
                type="password"
                className="input"
                placeholder="Leave blank if no password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-solid" onClick={handleLogin} style={{ flex:1 }}>Sign In</button>
              <button className="btn btn-ghost" onClick={() => { setSelectedId(null); setPass(''); }}>Back</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
