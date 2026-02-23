# Mododium — Valorant Team Dashboard

A fully-featured Valorant esports team management app built with **React 18**.

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 16
- npm ≥ 8

### Install & Run

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm start
```

The app opens at **http://localhost:3000**

### Production Build

```bash
npm run build
```

Outputs to `build/` — ready to deploy on Vercel, Netlify, GitHub Pages, etc.

---

## 📁 Project Structure

```
mododium-react/
├── public/
│   └── index.html              # Bare HTML shell
├── src/
│   ├── index.js                # React 18 entry point (ReactDOM.createRoot)
│   ├── App.jsx                 # Root component — page routing & modal orchestration
│   ├── AppContext.jsx          # Global state (React Context + localStorage persistence)
│   │
│   ├── components/
│   │   ├── Cursor.jsx          # Custom animated cursor
│   │   ├── NavBar.jsx          # Top navigation bar
│   │   ├── Toast.jsx           # Toast notification display
│   │   ├── Personalization.jsx # Theme color picker panel
│   │   ├── HomePage.jsx        # Landing page with hero, stats strip, marquee
│   │   ├── TrackerPage.jsx     # Player stats with Chart.js line chart + grid view
│   │   ├── RosterPage.jsx      # Player roster with filters, add/edit/delete
│   │   ├── PollsPage.jsx       # Team polls (standard, presence, match-type)
│   │   ├── MatchesPage.jsx     # Match schedule with countdown timers & detail modal
│   │   ├── LineupPage.jsx      # Map lineup manager with image/video uploads
│   │   ├── MainStatsPage.jsx   # Tracker.gg embed viewer per player
│   │   ├── PlayerPortal.jsx    # Per-player profile portal (profile/stats/security)
│   │   └── Modals.jsx          # AdminModal + PlayerLoginModal
│   │
│   ├── hooks/
│   │   ├── useToast.js         # Toast notification hook
│   │   └── useCountdown.js     # Live countdown timer hook
│   │
│   ├── styles/
│   │   └── App.css             # All styles (CSS custom properties, responsive design)
│   │
│   └── utils/
│       ├── storage.js          # localStorage helpers, default data, migrations
│       ├── helpers.js          # Pure utility functions (stars, countdown, theme, chart colors)
│       └── constants.js        # Theme presets, admin password ref, route names
│
├── .env                        # Environment variables
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables

All vars in `.env` — prefix with `REACT_APP_` to expose to React:

| Variable | Default | Description |
|---|---|---|
| `REACT_APP_ADMIN_PASSWORD` | `admin123` | Admin panel password |
| `REACT_APP_TITLE` | `Mododium — Valorant` | App title |
| `REACT_APP_DEFAULT_THEME_COLOR` | `#e8ff00` | Default accent color |

> ⚠️ Change the admin password before deploying to production!

---

## 🎮 Features

| Feature | Description |
|---|---|
| **Roster** | Add, edit, delete players with emoji/photo avatars, roles, agents, bio |
| **Stats Tracker** | Per-player Chart.js line charts, compare-all mode, 1v1 duel mode, grid view |
| **Polls** | Create standard, presence (Yes/No), and match polls with voter tracking |
| **Matches** | Schedule matches with live countdowns, match detail modal, linked polls |
| **Lineup** | Per-map attack/defense lineups with image & video uploads |
| **Main Stats** | Tracker.gg embed viewer per player (requires Riot ID config) |
| **Player Portal** | Per-player login, profile editing, stats view, password management |
| **Admin Panel** | Password-protected controls to add/edit/delete all content |
| **Personalization** | 10 theme color presets + custom hex color picker, persisted to localStorage |

---

## 🛠 Tech Stack

- **React 18** with hooks (no class components)
- **Chart.js 4** + react-chartjs-2 for data visualisation
- **CSS Custom Properties** for theming
- **localStorage** for persistence (no backend required)
- Google Fonts: Bebas Neue, DM Sans, DM Mono
