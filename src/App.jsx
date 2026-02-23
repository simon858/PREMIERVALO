import { useState } from 'react';
import { useAppContext } from './AppContext';
import { useToast } from './hooks/useToast';

import './styles/App.css';

import Cursor          from './components/Cursor';
import NavBar          from './components/NavBar';
import Toast           from './components/Toast';
import HomePage        from './components/HomePage';
import TrackerPage     from './components/TrackerPage';
import RosterPage      from './components/RosterPage';
import PollsPage       from './components/PollsPage';
import MatchesPage     from './components/MatchesPage';
import LineupPage      from './components/LineupPage';
import MainStatsPage   from './components/MainStatsPage';
import PlayerPortal    from './components/PlayerPortal';
import { AdminModal, PlayerLoginModal } from './components/Modals';

const App = () => {
  const { loggedPlayerId, setLoggedPlayerId } = useAppContext();
  const { toasts, toast } = useToast();

  const [currentPage,   setCurrentPage]   = useState('home');
  const [showAdmin,     setShowAdmin]      = useState(false);
  const [showPlayerLogin, setShowPlayerLogin] = useState(false);

  const navigate = (page) => setCurrentPage(page);

  const handleOpenPlayerPortal = () => {
    if (loggedPlayerId) {
      setCurrentPage('portal');
    } else {
      setShowPlayerLogin(true);
    }
  };

  const handlePlayerLogout = () => {
    setLoggedPlayerId(null);
    setCurrentPage('home');
    toast('Signed out');
  };

  const handleLoginSuccess = (id) => {
    setCurrentPage('portal');
  };

  return (
    <>
      <Cursor />

      <NavBar
        currentPage={currentPage}
        onNavigate={navigate}
        onOpenAdmin={() => setShowAdmin(true)}
        onOpenPlayerLogin={() => setShowPlayerLogin(true)}
        onOpenPlayerPortal={handleOpenPlayerPortal}
      />

      {/* Pages — only the active one renders */}
      {currentPage === 'home'       && <HomePage      onNavigate={navigate} />}
      {currentPage === 'tracker'    && <TrackerPage    toast={toast} />}
      {currentPage === 'roster'     && <RosterPage     toast={toast} />}
      {currentPage === 'polls'      && <PollsPage      toast={toast} />}
      {currentPage === 'matches'    && <MatchesPage    toast={toast} onNavigateLineup={() => navigate('lineup')} />}
      {currentPage === 'lineup'     && <LineupPage     toast={toast} />}
      {currentPage === 'mainstats'  && <MainStatsPage  toast={toast} />}
      {currentPage === 'portal'     && <PlayerPortal   toast={toast} onLogout={handlePlayerLogout} />}

      {/* Modals */}
      {showAdmin && (
        <AdminModal onClose={() => setShowAdmin(false)} toast={toast} />
      )}
      {showPlayerLogin && (
        <PlayerLoginModal
          onClose={() => setShowPlayerLogin(false)}
          onLoginSuccess={handleLoginSuccess}
          toast={toast}
        />
      )}

      <Toast toasts={toasts} />

      <footer>
        <div className="footer-brand">⚡ Mododium — Valorant</div>
        <div className="footer-copy">© 2025 Mododium Esports · Play to Win</div>
      </footer>
    </>
  );
};

export default App;
