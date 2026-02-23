import { useState } from 'react';
import { useAppContext } from '../AppContext';
import { buildTrackerUrl } from '../utils/helpers';

const MainStatsPage = ({ toast }) => {
  const { players, msRiotIds, setMsRiotIds, isAdmin } = useAppContext();

  const [selectedId,  setSelectedId]  = useState(null);
  const [viewMode,    setViewMode]     = useState('premier'); // 'premier' | 'ranked'
  const [iframeBlocked, setIframeBlocked] = useState(false);

  // local state for the setup form inputs (admin only)
  const [riotInputs, setRiotInputs] = useState(() => {
    const init = {};
    players.forEach((p) => { init[p.id] = msRiotIds[p.id] || ''; });
    return init;
  });

  const selectedPlayer = players.find((p) => p.id === selectedId);
  const riotId         = selectedId ? (msRiotIds[selectedId] || '') : '';
  const trackerUrl     = buildTrackerUrl(riotId, viewMode);

  const handleSelectPlayer = (id) => {
    setSelectedId(id);
    setIframeBlocked(false);
  };

  const handleSaveRiotIds = () => {
    const next = { ...msRiotIds };
    players.forEach((p) => { next[p.id] = riotInputs[p.id]?.trim() || ''; });
    setMsRiotIds(next);
    setSelectedId(null);
    toast('Riot IDs sauvegardés');
  };

  const handleIframeLoad = () => {
    // Attempt to detect block after a short delay
    setTimeout(() => {
      const iframe = document.getElementById('msIframe');
      try {
        const doc = iframe?.contentDocument || iframe?.contentWindow?.document;
        if (!doc || !doc.body || doc.body.innerHTML === '') setIframeBlocked(true);
      } catch {
        setIframeBlocked(true);
      }
    }, 4000);
  };

  return (
    <div className="page active" id="page-mainstats">
      <div className="section">
        <div className="section-head">
          <div>
            <div className="section-overline">// Valorant Tracker</div>
            <h2 className="section-title">Main Stats</h2>
          </div>
        </div>

        {/* Admin Setup Panel */}
        {isAdmin && (
          <div className="ms-api-setup">
            <div className="ms-api-setup-title">⚙ Config Riot IDs</div>
            <div className="ms-api-setup-sub">
              Associe les Riot IDs de chaque joueur pour charger leur profil Tracker.gg.<br />
              Format : <span>Pseudo#TAG</span> (ex: EZIO#EUW1).
            </div>
            <table className="ms-riotid-table">
              <tbody>
                <tr>
                  <td style={{ color:'var(--accent)', paddingBottom:12, fontSize:'0.6rem', letterSpacing:'0.15em', textTransform:'uppercase' }}>Joueur</td>
                  <td style={{ color:'var(--accent)', paddingBottom:12, fontSize:'0.6rem', letterSpacing:'0.15em', textTransform:'uppercase' }}>Riot ID</td>
                </tr>
                {players.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>
                      <input
                        type="text"
                        placeholder="Pseudo#EU1"
                        value={riotInputs[p.id] || ''}
                        onChange={(e) => setRiotInputs((prev) => ({ ...prev, [p.id]: e.target.value }))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-solid" style={{ fontSize:'0.62rem', padding:'9px 20px' }} onClick={handleSaveRiotIds}>
              Sauvegarder
            </button>
          </div>
        )}

        {/* Player Select Grid */}
        <div className="ms-player-select-grid">
          {players.map((p) => {
            const pid = msRiotIds[p.id] || '';
            return (
              <button
                key={p.id}
                className={`ms-player-btn${selectedId === p.id ? ' active' : ''}`}
                onClick={() => handleSelectPlayer(p.id)}
              >
                <div className="ms-player-btn-avatar">
                  {p.photo ? <img src={p.photo} alt="" /> : <span>{p.avatar || '🎮'}</span>}
                </div>
                <div>
                  <div className="ms-player-btn-name">{p.name}</div>
                  <div className="ms-player-btn-riotid">{pid || 'Riot ID manquant'}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Viewer Area */}
        <div className="ms-viewer-area">
          {!selectedId ? (
            <div className="ms-no-player" style={{ display:'flex' }}>
              <div className="ms-no-player-icon">📊</div>
              <div className="ms-no-player-label">Sélectionne un joueur</div>
              <div className="ms-no-player-sub">Clique sur un profil ci-dessus pour voir ses stats</div>
            </div>
          ) : (
            <div>
              {/* Header */}
              <div className="ms-viewer-header">
                <div className="ms-viewer-player-info">
                  <div className="ms-viewer-avatar">
                    {selectedPlayer?.photo
                      ? <img src={selectedPlayer.photo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} />
                      : selectedPlayer?.avatar || '⚡'
                    }
                  </div>
                  <div>
                    <div className="ms-viewer-name">{selectedPlayer?.name || '—'}</div>
                    <div className="ms-viewer-riotid">{riotId || '—'}</div>
                  </div>
                </div>
                <div className="ms-viewer-tabs">
                  {['premier', 'ranked'].map((mode) => (
                    <button
                      key={mode}
                      className={`ms-vtab${viewMode === mode ? ' active' : ''}`}
                      onClick={() => { setViewMode(mode); setIframeBlocked(false); }}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
                <a className="ms-open-btn" href={trackerUrl || '#'} target="_blank" rel="noreferrer">
                  ↗ Ouvrir Tracker.gg
                </a>
              </div>

              {/* iFrame */}
              <div className="ms-iframe-wrap">
                {riotId ? (
                  <>
                    <iframe
                      id="msIframe"
                      key={`${selectedId}-${viewMode}`}
                      src={trackerUrl}
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      loading="lazy"
                      onLoad={handleIframeLoad}
                      title="Tracker.gg"
                    />
                    {iframeBlocked && (
                      <div className="ms-blocked-msg show">
                        <div className="ms-blocked-icon">🔒</div>
                        <div className="ms-blocked-title">Embed bloqué</div>
                        <div className="ms-blocked-sub">
                          Tracker.gg bloque l'affichage en iframe.<br />
                          Clique sur "Ouvrir Tracker.gg" pour voir les stats dans un nouvel onglet.
                        </div>
                        <a className="btn btn-solid" href={trackerUrl} target="_blank" rel="noreferrer" style={{ marginTop: 8 }}>
                          ↗ Voir sur Tracker.gg
                        </a>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="ms-blocked-msg show">
                    <div className="ms-blocked-title">Riot ID manquant</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainStatsPage;
