import express from 'express';
import Admin from '../models/Admin.js';

const router = express.Router();

// Seed default admin password
const seed = async () => {
  const count = await Admin.countDocuments();
  if (count === 0) await Admin.create({ password: process.env.ADMIN_PASSWORD || 'admin123' });
};
seed();

// POST /api/admin/login — verify password
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    const admin = await Admin.findOne();
    if (!admin) return res.status(500).json({ error: 'No admin configured' });
    if (admin.password === password) {
      res.json({ ok: true });
    } else {
      res.status(401).json({ ok: false, error: 'Wrong password' });
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/admin/password — change password
router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findOne();
    if (admin.password !== currentPassword) return res.status(401).json({ error: 'Wrong current password' });
    admin.password = newPassword;
    await admin.save();
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
