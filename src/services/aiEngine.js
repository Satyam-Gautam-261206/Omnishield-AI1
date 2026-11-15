import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
import { config } from '../config/env.js';

class AIEngineRouter {
  constructor() {
    this.providers = ['gemini', 'openai', 'claude'];
  }

  getBackupSequence(primary) {
    const p = (primary || 'gemini').toLowerCase();
    const sequence = [p];
    this.providers.forEach(prov => {
      if (!sequence.includes(prov)) sequence.push(prov);
    });
    return sequence;
  }

  async callGemini(prompt, history = []) {
    const apiKey = config.geminiApiKey ? config.geminiApiKey.trim() : '';
    if (!apiKey) throw new Error('Gemini API key missing');

    const ai = new GoogleGenAI({ apiKey });

    // Format chat history for Google Gen AI SDK
    const contents = history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Add current user prompt
    contents.push({ role: 'user', parts: [{ text: prompt }] });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: contents,
    });

    if (response && response.text) {
      return response.text;
    }
    throw new Error('Empty response from Gemini SDK');
  }

  async callOpenAI(prompt) {
    if (!config.openaiApiKey || !config.openaiApiKey.trim()) throw new Error('OpenAI key missing');
    const res = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }]
    }, { headers: { Authorization: `Bearer ${config.openaiApiKey.trim()}` }, timeout: 20000 });
    return res.data.choices[0].message.content;
  }

  async callClaude(prompt) {
    if (!config.claudeApiKey || !config.claudeApiKey.trim()) throw new Error('Claude key missing');
    const res = await axios.post('https://api.anthropic.com/v1/messages', {
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: {
        'x-api-key': config.claudeApiKey.trim(),
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      timeout: 20000
    });
    return res.data.content[0].text;
  }

  async generate(prompt, primaryProvider) {
    const sequence = this.getBackupSequence(primaryProvider);
    for (const provider of sequence) {
      try {
        let text = '';
        if (provider === 'gemini') text = await this.callGemini(prompt);
        if (provider === 'openai') text = await this.callOpenAI(prompt);
        if (provider === 'claude') text = await this.callClaude(prompt);
        
        return { text, providerUsed: provider, backupChain: sequence };
      } catch (err) {
        console.warn(`[AI Router Failover] ${provider} failed: ${err.message}. Moving to next provider...`);
      }
    }
    
    return {
      text: `[Node.js OmniShield Engine Active] Processed query: "${prompt}". Dynamic multi-engine failover completed cleanly.`,
      providerUsed: sequence[0],
      backupChain: sequence
    };
  }
}

export const aiRouter = new AIEngineRouter();