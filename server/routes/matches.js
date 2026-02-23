import express from 'express';
import Match from '../models/Match.js';

const router = express.Router();

const DEF_MATCHES = [
  { id: 1, opponent: 'Arctic Foxes',  date: new Date(Date.now() + 3  * 864e5).toISOString(), map: 'Ascent', tournament: 'VCT Challengers', type: 'official' },
  { id: 2, opponent: 'Neon Wolves',   date: new Date(Date.now() + 7  * 864e5).toISOString(), map: 'Haven',  tournament: 'Internal League',  type: 'training' },
  { id: 3, opponent: 'Crypto Ravens', date: new Date(Date.now() + 14 * 864e5).toISOString(), map: 'TBD',    tournament: 'Open Cup S3',      type: 'official' },
];

const seed = async () => {
  const count = await Match.countDocuments();
  if (count === 0) await Match.insertMany(DEF_MATCHES);
};
seed();

router.get('/', async (_, res) => {
  try { res.json(await Match.find().sort('date')); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const last = await Match.findOne().sort('-id');
    const match = await Match.create({ ...req.body, id: (last?.id || 0) + 1 });
    res.status(201).json(match);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const match = await Match.findOneAndUpdate({ id: Number(req.params.id) }, req.body, { new: true });
    if (!match) return res.status(404).json({ error: 'Match not found' });
    res.json(match);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Match.findOneAndDelete({ id: Number(req.params.id) });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
