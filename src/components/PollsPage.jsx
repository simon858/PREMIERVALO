import { useState } from 'react';
import { useAppContext } from '../AppContext';

// ── Voter Modal ───────────────────────────────────────────
const VoterModal = ({ poll, onClose }) => {
  if (!poll) return null;
  const total = poll.votes.reduce((a, b) => a + b, 0);
  return (
    <div className="overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="voter-modal-box">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">{poll.question}</div>
        <div className="modal-sub">{total} Total Votes</div>
        {poll.options.map((opt, i) => {
          const pct    = total ? Math.round((poll.votes[i] / total) * 100) : 0;
          const vnames = (poll.voters && poll.voters[i]) || [];
          return (
            <div key={i} style={{ marginBottom: 20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <span style={{ fontFamily:'var(--mono)', fontSize:'0.68rem', color:'var(--white)' }}>{opt}</span>
                <span style={{ fontFamily:'var(--mono)', fontSize:'0.62rem', color:'var(--accent)' }}>{poll.votes[i]} ({pct}%)</span>
              </div>
              <div style={{ height:3, background:'var(--border)', marginBottom:8 }}>
                <div style={{ height:'100%', width:`${pct}%`, background:'var(--accent)', transition:'width 0.4s' }} />
              </div>
              {vnames.length ? (
                <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                  {vnames.map((n) => <span key={n} style={{ fontFamily:'var(--mono)', fontSize:'0.58rem', padding:'2px 8px', background:'var(--dark)', border:'1px solid var(--border2)', color:'var(--white3)' }}>{n}</span>)}
                </div>
              ) : (
                <div style={{ fontFamily:'var(--mono)', fontSize:'0.58rem', color:'var(--white3)' }}>Anonymous voters</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Poll Card ─────────────────────────────────────────────
const PollCard = ({ poll, index, myVote, isAdmin, onVote, onDelete, onOpenVoters, loggedPlayerName }) => {
  const total   = poll.votes.reduce((a, b) => a + b, 0);
  const voted   = myVote !== undefined;
  const typeLabel = { standard:'Standard', presence:'Presence', matches:'Match Poll' }[poll.type || 'standard'];
  const typeClass = poll.type || 'standard';

  const renderOption = (opt, i) => {
    const pct    = total ? Math.round((poll.votes[i] / total) * 100) : 0;
    const chosen = voted && myVote === i;
    const isYes  = poll.type === 'presence' && i === 0;
    const isNo   = poll.type === 'presence' && i === 1;
    return (
      <button
        key={i}
        className={`poll-opt-btn${isYes ? ' presence-yes' : ''}${isNo ? ' presence-no' : ''}${chosen ? ' was-chosen' : ''}`}
        disabled={voted}
        onClick={!voted ? () => onVote(poll.id, i) : undefined}
        style={{ '--pct': voted ? `${pct}%` : '0%' }}
      >
        <div className="poll-opt-row">
          <span>{chosen ? '✓ ' : ''}{opt}</span>
          {voted && <span className="poll-opt-pct">{pct}%</span>}
        </div>
      </button>
    );
  };

  return (
    <div className="poll-card">
      <div className="poll-card-index">Poll {String(index + 1).padStart(2, '0')}</div>
      <div><span className={`poll-type-badge ${typeClass}`}>{typeLabel}</span></div>
      <div className="poll-q">{poll.question}</div>
      {poll.type === 'presence'
        ? <div className="presence-btns">{poll.options.map((opt, i) => renderOption(opt, i))}</div>
        : poll.options.map((opt, i) => renderOption(opt, i))
      }
      <div className="poll-footer">
        <span className="poll-vote-count" onClick={() => onOpenVoters(poll.id)} title="Click to see voters">
          {total} vote{total !== 1 ? 's' : ''} ↗
        </span>
        {voted && (
          <span style={{ fontFamily:'var(--mono)', fontSize:'0.6rem', color:'var(--accent)', letterSpacing:'0.1em', textTransform:'uppercase' }}>
            ✓ Voted · <button className="btn-text" style={{ fontSize:'0.58rem', color:'var(--white3)' }} onClick={() => onVote(poll.id, null, true)}>Change</button>
          </span>
        )}
        {isAdmin && (
          <button className="btn btn-ghost" style={{ fontSize:'0.6rem', padding:'6px 12px', borderColor:'var(--red)', color:'var(--red)' }} onClick={() => onDelete(poll.id)}>Delete</button>
        )}
      </div>
    </div>
  );
};

// ── Main PollsPage ────────────────────────────────────────
const PollsPage = ({ toast }) => {
  const { polls, setPolls, votes, setVotes, isAdmin, loggedPlayerId, players } = useAppContext();

  const [showForm,  setShowForm]  = useState(false);
  const [pollQ,     setPollQ]     = useState('');
  const [pollType,  setPollType]  = useState('standard');
  const [pollOpts,  setPollOpts]  = useState(['', '']);
  const [voterPoll, setVoterPoll] = useState(null);

  const loggedPlayer = players.find((p) => p.id === loggedPlayerId);

  const handleVote = (pollId, idx, reset = false) => {
    if (reset) {
      setVotes((prev) => { const next = { ...prev }; delete next[pollId]; return next; });
      toast('You can vote again');
      return;
    }
    setPolls((prev) => prev.map((poll) => {
      if (poll.id !== pollId) return poll;
      const updated = { ...poll, votes: [...poll.votes], voters: poll.voters ? poll.voters.map((v) => [...v]) : poll.options.map(() => []) };
      const prevIdx = votes[pollId];
      if (prevIdx !== undefined) {
        updated.votes[prevIdx] = Math.max(0, updated.votes[prevIdx] - 1);
        if (loggedPlayer) updated.voters[prevIdx] = updated.voters[prevIdx].filter((n) => n !== loggedPlayer.name);
      }
      updated.votes[idx]++;
      if (loggedPlayer && !updated.voters[idx].includes(loggedPlayer.name)) updated.voters[idx].push(loggedPlayer.name);
      return updated;
    }));
    setVotes((prev) => ({ ...prev, [pollId]: idx }));
    toast('Vote cast');
  };

  const handleCreate = () => {
    if (!pollQ.trim()) { toast('Enter a question', true); return; }
    let opts = pollType === 'presence' ? ['Yes', 'No'] : pollOpts.filter(Boolean);
    if (pollType !== 'presence' && opts.length < 2) { toast('Need at least 2 options', true); return; }
    setPolls((prev) => [...prev, { id: Date.now(), type: pollType, question: pollQ.trim(), options: opts, votes: new Array(opts.length).fill(0), voters: opts.map(() => []) }]);
    setPollQ(''); setPollOpts(['', '']); setShowForm(false);
    toast('Poll created');
  };

  return (
    <div className="page active" id="page-polls">
      <div className="section">
        <div className="section-head">
          <div>
            <div className="section-overline">// Team Voice</div>
            <h2 className="section-title">Polls</h2>
          </div>
          {isAdmin && <button className="btn btn-solid" onClick={() => setShowForm((o) => !o)}>+ New Poll</button>}
        </div>

        <div className="polls-layout">
          {polls.length === 0
            ? <div className="empty" style={{ gridColumn:'1/-1' }}><div className="empty-label">No Polls</div></div>
            : polls.map((poll, idx) => (
              <PollCard
                key={poll.id}
                poll={poll}
                index={idx}
                myVote={votes[poll.id]}
                isAdmin={isAdmin}
                onVote={handleVote}
                onDelete={(id) => { setPolls((p) => p.filter((x) => x.id !== id)); toast('Poll deleted'); }}
                onOpenVoters={(id) => setVoterPoll(polls.find((p) => p.id === id))}
                loggedPlayerName={loggedPlayer?.name}
              />
            ))
          }
        </div>

        {showForm && (
          <div className="form-panel open">
            <div className="form-title">New Poll</div>
            <div className="form-group" style={{ marginBottom:16 }}>
              <label>Question</label>
              <input className="input" value={pollQ} onChange={(e) => setPollQ(e.target.value)} placeholder="Best agent to main?" />
            </div>
            <div className="form-group" style={{ marginBottom:16 }}>
              <label>Poll Type</label>
              <select className="input" value={pollType} onChange={(e) => setPollType(e.target.value)}>
                <option value="standard">Standard (Multiple Options)</option>
                <option value="presence">Presence (Yes / No)</option>
                <option value="matches">Match Poll</option>
              </select>
            </div>
            {pollType !== 'presence' && (
              <div>
                <div className="form-group" style={{ marginBottom:8 }}><label>Options</label></div>
                {pollOpts.map((opt, i) => (
                  <div key={i} style={{ display:'flex', gap:8, marginBottom:8 }}>
                    <input className="input" value={opt} onChange={(e) => { const next = [...pollOpts]; next[i] = e.target.value; setPollOpts(next); }} placeholder={`Option ${i+1}`} style={{ flex:1 }} />
                  </div>
                ))}
                <button className="btn-text" onClick={() => setPollOpts((prev) => [...prev, ''])} style={{ margin:'8px 0 20px' }}>+ Add Option</button>
              </div>
            )}
            <div className="form-actions">
              <button className="btn btn-solid" onClick={handleCreate}>Create Poll</button>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {voterPoll && <VoterModal poll={voterPoll} onClose={() => setVoterPoll(null)} />}
    </div>
  );
};

export default PollsPage;
