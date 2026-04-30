// api/chat.js — Vercel Serverless · Gemini 1.5 Flash proxy
'use strict';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { system, messages, geminiKey } = req.body || {};

  // Key: env var (production) or client key (local/dev)
  const key = process.env.GEMINI_API_KEY || geminiKey || '';

  if (!key) {
    return res.status(400).json({
      error:
        'Chave Gemini não configurada. Adicione GEMINI_API_KEY no painel do Vercel ou configure na UI (⚙).',
    });
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Mensagens inválidas.' });
  }

  try {
    const geminiRes = await fetch(`${GEMINI_URL}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: system ? { parts: [{ text: system }] } : undefined,
        contents: messages.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 3000,
        },
      }),
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      const msg =
        data?.error?.message ||
        (geminiRes.status === 429
          ? 'Limite de requisições atingido. Aguarde 30 segundos e tente novamente.'
          : geminiRes.status === 400 || geminiRes.status === 403
          ? 'Chave API inválida. Verifique nas configurações.'
          : `Erro Gemini: ${geminiRes.status}`);
      return res.status(geminiRes.status).json({ error: msg });
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Return in format compatible with original frontend expectation
    return res.json({ content: [{ type: 'text', text }] });
  } catch (err) {
    console.error('[api/chat]', err);
    return res.status(503).json({
      error: 'Sem conexão com a IA. Verifique sua internet e tente novamente.',
    });
  }
}
