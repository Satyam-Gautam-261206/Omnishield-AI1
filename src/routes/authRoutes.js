import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

const router = express.Router();
const users = new Map();

router.post('/signup', async (req, res) => {
  const { full_name, email, password } = req.body;
  if (!email || !password || !full_name) {
    return res.status(400).json({ detail: 'All fields are required.' });
  }
  if (users.has(email)) {
    return res.status(400).json({ detail: 'User with this email already exists.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.set(email, { full_name, email, password: hashedPassword });

  const token = jwt.sign({ email, full_name }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  return res.json({ access_token: token, token_type: 'bearer', user_name: full_name });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.get(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ detail: 'Invalid email or password.' });
  }

  const token = jwt.sign({ email: user.email, full_name: user.full_name }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  return res.json({ access_token: token, token_type: 'bearer', user_name: user.full_name });
});

export default router;