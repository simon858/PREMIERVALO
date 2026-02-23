import { useState } from 'react';
import { useAppContext } from '../AppContext';
import Personalization from './Personalization';

const LogoSVG = () => (
  <svg className="nav-logo-icon" viewBox="0 0 32 32" fill="none">
    <ellipse cx="16" cy="20" rx="10" ry="11" fill="#141414" stroke="currentColor" strokeWidth="1"/>
    <ellipse cx="16" cy="19" rx="6.5" ry="8" fill="white" opacity="0.9"/>
    <circle cx="12.5" cy="15" r="2.2" fill="#080808"/>
    <circle cx="19.5" cy="15" r="2.2" fill="#080808"/>
    <circle cx="13" cy="14.4" r="0.7" fill="white"/>
    <circle cx="20" cy="14.4" r="0.7" fill="white"/>
    <path d="M14 17.5 L16 20 L18 17.5Z" fill="#ff8800"/>
    <ellipse cx="7" cy="22" rx="3.5" ry="6" fill="#141414" stroke="currentColor" strokeWidth="0.8" transform="rotate(-15 7 22)"/>
    <ellipse cx="25" cy="22" rx="3.5" ry="6" fill="#141414" stroke="currentColor" strokeWidth="0.8" transform="rotate(15 25 22)"/>
  </svg>
);

const NavBar = ({ currentPage, onNavigate, onOpenAdmin, onOpenPlayerLogin, onOpenPlayerPortal }) => {
  const { isAdmin, loggedPlayerId, players } = useAppContext();
  const [menuOpen, setMenuOpen] = useState(false);

  const loggedPlayer = players.find((p) => p.id === loggedPlayerId);

  const navLinks = [
    { page: 'home',       label: 'Home' },
    { page: 'tracker',    label: 'Stats' },
    { page: 'roster',     label: 'Roster' },
    { page: 'polls',      label: 'Polls' },
    { page: 'matches',    label: 'Matches' },
    { page: 'lineup',     label: 'Lineup' },
    { page: 'mainstats',  label: 'Main Stats' },
  ];

  return (
    <nav id="mainNav">
      <div className="nav-logo" onClick={() => onNavigate('home')}>
        <LogoSVG />
        MODODIUM
      </div>

      <ul className={`nav-links${menuOpen ? ' open' : ''}`} id="navLinks">
        {navLinks.map(({ page, label }) => (
          <a
            key={page}
            className={currentPage === page ? 'active' : ''}
            data-page={page}
            onClick={() => { onNavigate(page); setMenuOpen(false); }}
          >
            {label}
          </a>
        ))}
        {loggedPlayerId && (
          <a
            data-page="portal"
            className={currentPage === 'portal' ? 'active' : ''}
            onClick={() => { onOpenPlayerPortal(); setMenuOpen(false); }}
          >
            My Profile
          </a>
        )}
      </ul>

      <div className="nav-right">
        <span className={`admin-pill${isAdmin ? ' on' : ''}`} id="adminPill">Admin</span>

        {loggedPlayer ? (
          <span className="player-pill on" onClick={onOpenPlayerPortal}>
            <span className="player-pill-avatar">
              {loggedPlayer.photo
                ? <img src={loggedPlayer.photo} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} alt="" />
                : loggedPlayer.avatar || '👤'
              }
            </span>
            <span>{loggedPlayer.name}</span>
          </span>
        ) : (
          <button className="player-login-btn" onClick={onOpenPlayerLogin}>My Profile</button>
        )}

        <button className="btn-nav" onClick={onOpenAdmin}>Admin Panel</button>
        <Personalization />
        <button className="hamburger" onClick={() => setMenuOpen((o) => !o)}>
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
