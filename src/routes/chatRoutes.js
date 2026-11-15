import express from 'express';
import { aiRouter } from '../services/aiEngine.js';

const router = express.Router();
const chatSessions = new Map();

router.post('/send', async (req, res) => {
  const { session_id, message, primary_provider } = req.body;
  if (!message || !session_id) {
    return res.status(400).json({ detail: 'Message and session_id are required.' });
  }

  try {
    const { text, providerUsed, backupChain } = await aiRouter.generate(message, primary_provider);
    if (!chatSessions.has(session_id)) chatSessions.set(session_id, []);
    chatSessions.get(session_id).push({ sender: 'user', text: message });
    chatSessions.get(session_id).push({ sender: 'assistant', text, provider: providerUsed });

    return res.json({
      session_id,
      response_text: text,
      provider_used: providerUsed,
      backup_chain: backupChain
    });
  } catch (error) {
    return res.status(500).json({ detail: 'Internal engine processing error.' });
  }
});

export default router;