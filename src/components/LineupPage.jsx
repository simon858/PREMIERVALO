import { useState, useRef } from 'react';
import { useAppContext } from '../AppContext';

// ── Upload Modal ──────────────────────────────────────────
const LineupUploadModal = ({ context, onSave, onClose }) => {
  const [agent, setAgent] = useState('');
  const [desc,  setDesc]  = useState('');
  const fileRef = useRef(null);

  const handleSave = () => {
    const file = fileRef.current?.files[0];
    if (!agent && !desc && !file) { alert('Add at least a description or file'); return; }

    const saveEntry = (mediaData, mediaType) => {
      onSave({ context, agent, desc, media: mediaData, mediaType });
    };

    if (file) {
      const reader  = new FileReader();
      const isVideo = file.type.startsWith('video/');
      reader.onload = (ev) => saveEntry(ev.target.result, isVideo ? 'video' : 'image');
      reader.readAsDataURL(file);
    } else {
      saveEntry(null, null);
    }
  };

  return (
    <div className="overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 500 }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">Add Lineup</div>
        <div className="form-group" style={{ marginBottom: 14 }}>
          <label>Agent</label>
          <input className="input" value={agent} onChange={(e) => setAgent(e.target.value)} placeholder="e.g. Jett" />
        </div>
        <div className="form-group" style={{ marginBottom: 14 }}>
          <label>Description</label>
          <input className="input" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="e.g. A-site spike plant smoke" />
        </div>
        <div className="form-group" style={{ marginBottom: 20 }}>
          <label>Image or Video</label>
          <input type="file" ref={fileRef} accept="image/*,video/*" className="input" style={{ padding: 8 }} />
        </div>
        <div className="form-actions">
          <button className="btn btn-solid" onClick={handleSave}>Add Lineup</button>
        </div>
      </div>
    </div>
  );
};

// ── Lineup Card ───────────────────────────────────────────
const LineupCard = ({ entry, entryKey, isAdmin, onDelete }) => {
  const isVideo = entry.mediaType === 'video';
  return (
    <div className="lineup-card">
      <div className="lineup-card-media">
        {entry.media ? (
          isVideo ? (
            <>
              <video
                src={entry.media}
                onClick={(e) => e.target.paused ? e.target.play() : e.target.pause()}
              />
              <div className="play-icon">▶</div>
            </>
          ) : (
            <img src={entry.media} alt="" />
          )
        ) : (
          <span style={{ color: 'var(--white3)', fontSize: '0.6rem', fontFamily: 'var(--mono)' }}>No media</span>
        )}
      </div>
      <div className="lineup-card-agent">{entry.agent || '—'}</div>
      <div className="lineup-card-desc">{entry.desc || ''}</div>
      {isAdmin && (
        <button
          onClick={() => onDelete(entryKey)}
          style={{ marginTop: 8, background: 'none', border: 'none', color: 'var(--red)', fontFamily: 'var(--mono)', fontSize: '0.58rem', cursor: 'pointer', letterSpacing: '0.1em' }}
        >
          ✕ Remove
        </button>
      )}
    </div>
  );
};

// ── Main LineupPage ───────────────────────────────────────
const LineupPage = ({ toast }) => {
  const { lineupData, setLineupData, isAdmin } = useAppContext();
  const [activeMap,     setActiveMap]     = useState(lineupData.maps[0] || null);
  const [agentFilter,   setAgentFilter]   = useState('');
  const [uploadContext, setUploadContext] = useState(null); // { map, side }

  const entries = lineupData.entries || {};

  // Collect all agents for current map
  const allAgents = new Set();
  Object.keys(entries).forEach((k) => {
    if (activeMap && k.startsWith(activeMap + '_')) {
      const e = entries[k];
      if (e.agent) allAgents.add(e.agent);
    }
  });

  const handleAddMap = () => {
    const name = prompt('Map name:');
    if (!name || !name.trim()) return;
    const n = name.trim();
    if (!lineupData.maps.includes(n)) {
      setLineupData((prev) => ({ ...prev, maps: [...prev.maps, n] }));
      setActiveMap(n);
    }
  };

  const handleSaveEntry = ({ context, agent, desc, media, mediaType }) => {
    const key = `${context.map}_${context.side}_${Date.now()}`;
    setLineupData((prev) => ({
      ...prev,
      entries: { ...prev.entries, [key]: { agent, desc, media, mediaType } },
    }));
    setUploadContext(null);
    toast('Lineup added');
  };

  const handleDeleteEntry = (key) => {
    setLineupData((prev) => {
      const next = { ...prev, entries: { ...prev.entries } };
      delete next.entries[key];
      return next;
    });
    toast('Entry removed');
  };

  const renderSide = (side) => {
    const sideEntries = Object.entries(entries)
      .filter(([k]) => activeMap && k.startsWith(`${activeMap}_${side}_`))
      .map(([k, v]) => ({ ...v, _key: k }))
      .filter((e) => !agentFilter || e.agent === agentFilter);

    return (
      <div className="lineup-side" key={side}>
        <div className="lineup-side-header">
          <div className={`lineup-side-title ${side}`}>
            {side.charAt(0).toUpperCase() + side.slice(1)}
          </div>
        </div>
        <div className="lineup-grid">
          {sideEntries.map((e) => (
            <LineupCard key={e._key} entry={e} entryKey={e._key} isAdmin={isAdmin} onDelete={handleDeleteEntry} />
          ))}
        </div>
        {isAdmin && (
          <button className="lineup-add-btn" onClick={() => setUploadContext({ map: activeMap, side })}>
            + Add {side.charAt(0).toUpperCase() + side.slice(1)} Lineup
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="page active" id="page-lineup">
      <div className="lineup-layout">
        {/* Sidebar */}
        <div className="lineup-sidebar">
          <div className="lineup-sidebar-title" style={{ marginBottom: 24, fontSize: '1.2rem', fontFamily: 'var(--serif)', letterSpacing: '0.08em', color: 'var(--white)' }}>
            Lineup
          </div>
          <div className="lineup-sidebar-title">Maps</div>
          {lineupData.maps.map((map) => (
            <button
              key={map}
              className={`lineup-map-btn${activeMap === map ? ' active' : ''}`}
              onClick={() => setActiveMap(map)}
            >
              <span className="lineup-map-dot" />
              {map}
            </button>
          ))}
          {isAdmin && (
            <button className="lineup-add-btn" style={{ marginTop: 16 }} onClick={handleAddMap}>
              + Add Map
            </button>
          )}
        </div>

        {/* Main */}
        <div className="lineup-main">
          {!activeMap ? (
            <div className="empty" style={{ border: 'none', padding: '120px 40px' }}>
              <div className="empty-label">Select a Map</div>
            </div>
          ) : (
            <>
              <div className="lineup-map-header">
                <div className="lineup-map-name">{activeMap}</div>
                <div className="lineup-agent-filter">
                  <button
                    className={`lineup-agent-btn${!agentFilter ? ' active' : ''}`}
                    onClick={() => setAgentFilter('')}
                  >
                    All
                  </button>
                  {[...allAgents].map((a) => (
                    <button
                      key={a}
                      className={`lineup-agent-btn${agentFilter === a ? ' active' : ''}`}
                      onClick={() => setAgentFilter(a)}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div className="lineup-sides">
                {renderSide('attack')}
                {renderSide('defense')}
              </div>
            </>
          )}
        </div>
      </div>

      {uploadContext && (
        <LineupUploadModal
          context={uploadContext}
          onSave={handleSaveEntry}
          onClose={() => setUploadContext(null)}
        />
      )}
    </div>
  );
};

export default LineupPage;
