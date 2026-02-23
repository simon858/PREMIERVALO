import { useEffect, useState } from 'react';
import { useAppContext } from '../AppContext';
import { useCountdown } from '../hooks/useCountdown';

const MascotSVG = () => (
  <svg className="hero-mascot-bg" viewBox="0 0 300 400" fill="none">
    <ellipse cx="150" cy="260" rx="110" ry="130" fill="white"/>
    <ellipse cx="150" cy="245" rx="72" ry="90" fill="#666"/>
    <circle cx="150" cy="100" r="85" fill="white"/>
    <circle cx="115" cy="85" r="22" fill="#333"/>
    <circle cx="185" cy="85" r="22" fill="#333"/>
    <path d="M128 108 L150 128 L172 108Z" fill="#f60"/>
    <ellipse cx="50" cy="270" rx="38" ry="65" fill="white" transform="rotate(-18 50 270)"/>
    <ellipse cx="250" cy="270" rx="38" ry="65" fill="white" transform="rotate(18 250 270)"/>
  </svg>
);

const PhilosophySVG = () => (
  <svg viewBox="0 0 300 360" fill="none">
    <ellipse cx="150" cy="230" rx="90" ry="110" fill="#1a1a1a" stroke="rgba(232,255,0,0.2)" strokeWidth="1.5"/>
    <ellipse cx="150" cy="218" rx="58" ry="75" fill="rgba(240,237,232,0.08)"/>
    <circle cx="150" cy="95" r="68" fill="#1a1a1a" stroke="rgba(232,255,0,0.2)" strokeWidth="1.5"/>
    <circle cx="124" cy="82" r="17" fill="#0a0a0a"/>
    <circle cx="176" cy="82" r="17" fill="#0a0a0a"/>
    <circle cx="124" cy="82" r="17" fill="none" stroke="rgba(232,255,0,0.5)" strokeWidth="1"/>
    <circle cx="176" cy="82" r="17" fill="none" stroke="rgba(232,255,0,0.5)" strokeWidth="1"/>
    <circle cx="126.5" cy="80" r="6" fill="rgba(232,255,0,0.8)"/>
    <circle cx="178.5" cy="80" r="6" fill="rgba(232,255,0,0.8)"/>
    <path d="M136 102 L150 118 L164 102Z" fill="#ff8800"/>
    <ellipse cx="54" cy="238" rx="30" ry="62" fill="#1a1a1a" stroke="rgba(232,255,0,0.15)" strokeWidth="1" transform="rotate(-22 54 238)"/>
    <ellipse cx="246" cy="238" rx="30" ry="62" fill="#1a1a1a" stroke="rgba(232,255,0,0.15)" strokeWidth="1" transform="rotate(22 246 238)"/>
    <line x1="150" y1="27" x2="150" y2="0" stroke="rgba(232,255,0,0.4)" strokeWidth="1"/>
    <path d="M120 330 Q105 345 95 335 Q105 320 120 330Z" fill="#ff8800"/>
    <path d="M180 330 Q195 345 205 335 Q195 320 180 330Z" fill="#ff8800"/>
  </svg>
);

const FeaturedMatch = ({ match }) => {
  const countdown = useCountdown(match?.date);
  if (!match) return null;
  return (
    <div className="hero-center-block has-match" id="heroFeaturedMatch">
      <div className="hero-featured-label">⚡ Next Match</div>
      <div className={`hero-featured-match-type ${match.type || 'official'}`}>
        {match.type === 'training' ? '🏋 Training Match' : '🏆 Official Match'}
      </div>
      <div className="hero-featured-teams">
        <span className="us">Mododium</span>
        <span className="vs">VS</span>
        <span>{match.opponent}</span>
      </div>
      <div className="hero-featured-date">
        {new Date(match.date).toLocaleDateString('en', { weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
      </div>
      <div className="hero-featured-cd">{countdown}</div>
    </div>
  );
};

const MarqueeItems = () => {
  const items = ['Valorant', 'Mododium', 'Born to Compete', 'Play to Win'];
  const repeated = [...items, ...items, ...items, ...items, ...items, ...items];
  return (
    <>
      {repeated.map((item, i) => (
        <span key={i}>{item}</span>
      )).reduce((acc, el, i) => {
        if (i > 0) acc.push(<span key={`sep-${i}`} className="sep">✦</span>);
        acc.push(el);
        return acc;
      }, [])}
    </>
  );
};

const HomePage = ({ onNavigate }) => {
  const { players, matches, polls } = useAppContext();

  const nextMatch = matches
    .filter((m) => new Date(m.date) > Date.now())
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0] || null;

  return (
    <div className="page active" id="page-home">
      {/* HERO */}
      <div className="hero-panel">
        <div className="hero-bg" />
        <div className="hero-bg-lines" />
        <MascotSVG />
        <FeaturedMatch match={nextMatch} />
        <div className="hero-content">
          <div className="hero-eyebrow">Valorant Esports Organization</div>
          <div className="hero-title">
            <span className="outline-word">Team</span>
            <span className="accent-word">Mododium</span>
          </div>
        </div>
        <div className="hero-cta-center">
          <button className="btn-hero btn-hero-solid" onClick={() => onNavigate('roster')}>Join the Team</button>
          <button className="btn-hero btn-hero-ghost" onClick={() => onNavigate('tracker')}>View Stats</button>
        </div>
      </div>

      {/* MARQUEE */}
      <div className="marquee-band">
        <div className="marquee-inner">
          <MarqueeItems />
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="stats-strip">
        <div className="stat-cell">
          <span className="stat-num">{players.length}</span>
          <span className="stat-lbl">Active Players</span>
        </div>
        <div className="stat-cell">
          <span className="stat-num">{matches.length}</span>
          <span className="stat-lbl">Scheduled Matches</span>
        </div>
        <div className="stat-cell">
          <span className="stat-num">{polls.length}</span>
          <span className="stat-lbl">Active Polls</span>
        </div>
        <div className="stat-cell">
          <span className="stat-num">VAL<span>ORANT</span></span>
          <span className="stat-lbl">Game Division</span>
        </div>
      </div>

      {/* TWO-PANEL */}
      <div className="two-panel">
        <div className="panel-img">
          <div className="panel-img-inner">
            <PhilosophySVG />
          </div>
        </div>
        <div className="panel-content">
          <div className="panel-label">// Our Philosophy</div>
          <h2 className="panel-heading">Ice-cold<br/>precision</h2>
          <p className="panel-text">
            We don't play games — we solve them. Every round is a problem with an optimal solution.
            The Pigouins combine instinct with analysis to dominate the modern Valorant meta.
          </p>
          <div style={{ marginTop: '32px' }}>
            <button className="btn-text" onClick={() => onNavigate('roster')}>Meet the squad</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
