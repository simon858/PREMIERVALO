import express from 'express';
import Player from '../models/Player.js';

const router = express.Router();

const DEF_PLAYERS = [
  { id: 1, name: 'EZIO',    roles: ['Duelist'],            avatar: '⚔️',  agents: ['Jett','Harbor'],  note: '', photo: '', password: 'ezio123' },
  { id: 2, name: 'SIMON',   roles: ['IGL','Controller'],   avatar: '👑',  agents: ['Omen'],           note: '', photo: '', password: 'simon123' },
  { id: 3, name: 'JULIEN',  roles: ['Initiator'],          avatar: '🎯',  agents: ['Sova','Fade'],    note: '', photo: '', password: 'julien123' },
  { id: 4, name: 'AJISHAN', roles: ['Controller','Flex'],  avatar: '💨',  agents: ['Viper','Harbor'], note: '', photo: '', password: 'ajishan123' },
  { id: 5, name: 'KLIPERR', roles: ['Sentinel'],           avatar: '🛡️', agents: ['Killjoy','Sage'], note: '', photo: '', password: 'kliperr123' },
  { id: 6, name: 'ZED',     roles: ['Duelist'],            avatar: '⚡',  agents: ['Reyna','Jett'],   note: '', photo: '', password: 'zed123' },
];

// Seed if empty
const seed = async () => {
  const count = await Player.countDocuments();
  if (count === 0) await Player.insertMany(DEF_PLAYERS);
};
seed();

// GET all players
router.get('/', async (_, res) => {
  try {
    const players = await Player.find().sort('id');
    res.json(players);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT update a player
router.put('/:id', async (req, res) => {
  try {
    const player = await Player.findOneAndUpdate(
      { id: Number(req.params.id) },
      req.body,
      { new: true }
    );
    if (!player) return res.status(404).json({ error: 'Player not found' });
    res.json(player);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST add a player
router.post('/', async (req, res) => {
  try {
    const last = await Player.findOne().sort('-id');
    const newId = (last?.id || 0) + 1;
    const player = await Player.create({ ...req.body, id: newId });
    res.status(201).json(player);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE a player
router.delete('/:id', async (req, res) => {
  try {
    await Player.findOneAndDelete({ id: Number(req.params.id) });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
