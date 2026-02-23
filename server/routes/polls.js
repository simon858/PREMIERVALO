import express from 'express';
import Poll from '../models/Poll.js';

const router = express.Router();

const DEF_POLLS = [
  { id: 1, type: 'standard', question: 'Best agent in current meta?',        options: ['Jett','Omen','Sova','Reyna'], votes: [12,8,15,9], voters: [[],[],[],[]] },
  { id: 2, type: 'presence', question: "Can you attend Saturday's scrim?",   options: ['Yes','No'],                   votes: [4,1],       voters: [[],[]] },
  { id: 3, type: 'matches',  question: 'Who performed best vs Arctic Foxes?', options: ['EZIO','SIMON','ZED'],         votes: [8,4,6],     voters: [[],[],[]] },
];

const seed = async () => {
  const count = await Poll.countDocuments();
  if (count === 0) await Poll.insertMany(DEF_POLLS);
};
seed();

router.get('/', async (_, res) => {
  try { res.json(await Poll.find().sort('id')); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const last = await Poll.findOne().sort('-id');
    const poll = await Poll.create({ ...req.body, id: (last?.id || 0) + 1 });
    res.status(201).json(poll);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const poll = await Poll.findOneAndUpdate({ id: Number(req.params.id) }, req.body, { new: true });
    if (!poll) return res.status(404).json({ error: 'Poll not found' });
    res.json(poll);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Poll.findOneAndDelete({ id: Number(req.params.id) });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
