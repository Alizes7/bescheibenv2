'use strict';

/**
 * Vercel Serverless Function — POST /api/chat
 * Proxy seguro para a Gemini API (gemini-2.5-flash — free tier).
 * A chave fica em: Vercel → Project → Settings → Environment Variables → GEMINI_API_KEY
 */
module.exports = async function handler(req, res) {
  // ── CORS ──────────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  // ── VALIDAR CHAVE ─────────────────────────────────────
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    console.error('[api/chat] GEMINI_API_KEY não configurada no Vercel.');
    return res.status(500).json({
      error: 'Chave da API não configurada no servidor. Vá em Vercel → Settings → Environment Variables e adicione GEMINI_API_KEY.',
    });
  }

  // ── VALIDAR BODY ──────────────────────────────────────
  const body = req.body || {};
  const { system, messages } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Campo "messages" é obrigatório e deve ser um array.' });
  }

  // ── MONTAR PAYLOAD GEMINI ─────────────────────────────
  // Converte o formato { role, content } → { role, parts: [{ text }] }
  const contents = messages.map(function (m) {
    return {
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content || '') }],
    };
  });

  const payload = {
    contents,
    generationConfig: {
      maxOutputTokens: 1500,
      temperature: 0.85,
    },
  };

  // Instrução de sistema (suportada nativamente pelo Gemini)
  if (system && typeof system === 'string' && system.trim() !== '') {
    payload.systemInstruction = {
      parts: [{ text: system.trim() }],
    };
  }

  // ── CHAMAR GEMINI ─────────────────────────────────────
  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' +
    apiKey.trim();

  let geminiRes;
  try {
    geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (networkErr) {
    console.error('[api/chat] Erro de rede ao chamar Gemini:', networkErr.message);
    return res.status(502).json({
      error: 'Não foi possível conectar à API do Gemini. Tente novamente.',
    });
  }

  // ── PARSEAR RESPOSTA ──────────────────────────────────
  let data;
  try {
    data = await geminiRes.json();
  } catch (parseErr) {
    console.error('[api/chat] Resposta não é JSON válido. Status:', geminiRes.status);
    return res.status(502).json({ error: 'Resposta inválida da API do Gemini.' });
  }

  if (!geminiRes.ok) {
    const msg = (data.error && data.error.message) || 'Erro desconhecido do Gemini.';
    console.error('[api/chat] Gemini retornou erro:', geminiRes.status, msg);

    // Quota excedida → mensagem amigável
    if (geminiRes.status === 429) {
      return res.status(429).json({
        error: 'Limite de requisições atingido. Aguarde alguns segundos e tente novamente.',
      });
    }

    // Chave inválida
    if (geminiRes.status === 400 || geminiRes.status === 403) {
      return res.status(geminiRes.status).json({
        error: 'Chave da API inválida ou sem permissão. Verifique GEMINI_API_KEY no Vercel.',
      });
    }

    return res.status(geminiRes.status).json({ error: msg });
  }

  // ── EXTRAIR TEXTO ─────────────────────────────────────
  const text =
    data.candidates &&
    data.candidates[0] &&
    data.candidates[0].content &&
    data.candidates[0].content.parts &&
    data.candidates[0].content.parts[0] &&
    data.candidates[0].content.parts[0].text;

  if (!text) {
    console.error('[api/chat] Resposta do Gemini sem texto. Shape:', JSON.stringify(data).slice(0, 300));
    return res.status(500).json({ error: 'Resposta vazia do modelo. Tente novamente.' });
  }

  // ── RETORNAR ──────────────────────────────────────────
  // Normalizado para o formato que o frontend espera:
  // { content: [{ type: 'text', text: '...' }] }
  return res.status(200).json({
    content: [{ type: 'text', text }],
  });
};
