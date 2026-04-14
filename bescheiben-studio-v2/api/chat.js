'use strict';

/**
 * Vercel Serverless Function — POST /api/chat
 *
 * Secure proxy to the Google Gemini API.
 * GEMINI_API_KEY is set in Vercel dashboard → Settings → Environment Variables.
 *
 * Request body:
 * {
 *   system:   string,
 *   messages: Array<{ role: 'user' | 'assistant', content: string }>
 * }
 */
module.exports = async function handler(req, res) {
  // CORS headers (needed for local vercel dev)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[api/chat] GEMINI_API_KEY is not set');
    return res.status(500).json({ error: 'API key not configured on the server.' });
  }

  const { system, messages } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required.' });
  }

  // Convert messages to Gemini format
  const contents = messages.map(function (m) {
    return {
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    };
  });

  const requestBody = {
    contents,
    generationConfig: {
      maxOutputTokens: 1500,
      temperature: 0.85,
    },
  };

  // System instruction (Gemini supports it as top-level field)
  if (system) {
    requestBody.systemInstruction = {
      parts: [{ text: system }],
    };
  }

  const endpoint =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' +
    apiKey;

  try {
    const geminiRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error('[api/chat] Gemini error:', JSON.stringify(data));
      const msg =
        (data.error && data.error.message) || 'Gemini API error ' + geminiRes.status;
      return res.status(geminiRes.status).json({ error: msg });
    }

    // Normalize to the same shape the frontend expects:
    // { content: [{ type: 'text', text: '...' }] }
    const text =
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] &&
      data.candidates[0].content.parts[0].text;

    if (!text) {
      console.error('[api/chat] Unexpected Gemini shape:', JSON.stringify(data));
      return res.status(500).json({ error: 'Resposta vazia do modelo.' });
    }

    return res.status(200).json({
      content: [{ type: 'text', text }],
    });
  } catch (err) {
    console.error('[api/chat] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
};
