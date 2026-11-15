import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'online', service: 'OmniShield:D Node.js API', version: '1.0.0' });
});

app.listen(config.port, () => {
  console.log(`🚀 OmniShield Node.js backend server running on http://127.0.0.1:${config.port}`);
});