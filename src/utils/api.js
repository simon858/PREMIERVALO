const BASE = import.meta.env.VITE_API_URL || '/api';

const req = async (method, path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
};

export const api = {
  // Players
  getPlayers:    ()           => req('GET',    '/players'),
  updatePlayer:  (id, data)   => req('PUT',    `/players/${id}`, data),
  createPlayer:  (data)       => req('POST',   '/players', data),
  deletePlayer:  (id)         => req('DELETE', `/players/${id}`),

  // Matches
  getMatches:    ()           => req('GET',    '/matches'),
  createMatch:   (data)       => req('POST',   '/matches', data),
  updateMatch:   (id, data)   => req('PUT',    `/matches/${id}`, data),
  deleteMatch:   (id)         => req('DELETE', `/matches/${id}`),

  // Polls
  getPolls:      ()           => req('GET',    '/polls'),
  createPoll:    (data)       => req('POST',   '/polls', data),
  updatePoll:    (id, data)   => req('PUT',    `/polls/${id}`, data),
  deletePoll:    (id)         => req('DELETE', `/polls/${id}`),

  // Admin
  adminLogin:    (password)   => req('POST',   '/admin/login', { password }),
  changePassword:(cur, next)  => req('PUT',    '/admin/password', { currentPassword: cur, newPassword: next }),
};
