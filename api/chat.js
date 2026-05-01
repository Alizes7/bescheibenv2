// api/chat.js — Vercel Serverless Function (CommonJS)
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { system, messages, geminiKey } = req.body || {};
  const key = process.env.GEMINI_API_KEY || geminiKey || '';

  if (!key) {
    return res.status(400).json({
      error: 'Chave Gemini não configurada. Adicione GEMINI_API_KEY no Vercel ou configure em ⚙.',
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
        generationConfig: { temperature: 0.9, maxOutputTokens: 3000 },
      }),
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      const status = geminiRes.status;
      let msg = (data && data.error && data.error.message) || 'Erro desconhecido';
      if (status === 429) msg = 'Limite de requisições atingido. Aguarde 30 segundos.';
      if (status === 400 || status === 403) msg = 'Chave API inválida. Verifique nas configurações (⚙).';
      return res.status(status).json({ error: msg });
    }

    const text =
      (data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0] &&
        data.candidates[0].content.parts[0].text) || '';

    return res.json({ content: [{ type: 'text', text: text }] });
  } catch (err) {
    console.error('[api/chat]', err);
    return res.status(503).json({ error: 'Sem conexão com a IA. Tente novamente.' });
  }
};
