'use strict';

var QUICK_PROMPTS = {
  story: [
    'Crie um storytelling para carrossel sobre marketing digital B2B',
    'Storytelling sobre transformação de marca para meu cliente',
    'Storytelling de dor → solução para agência de marketing',
    'Storytelling de autoridade para agência digital',
  ],
  ideas: [
    'Gere um carrossel completo com 5 slides para agência de marketing digital B2B',
    'Crie um carrossel de 5 slides sobre como uma empresa B2B pode gerar leads no Instagram',
    'Monte um carrossel de 5 slides sobre os erros de posicionamento digital mais comuns',
    'Crie um carrossel de 5 slides mostrando o processo de crescimento digital da Bescheiben',
  ],
};

var SYSTEM_STORY =
  'Você é especialista em storytelling para marketing digital B2B no Instagram.\n' +
  'Escreve para a Bescheiben Digital Agency — estética dark/tech, tom direto e premium.\n' +
  'Retorne o storytelling estruturado por slides: [SLIDE 1: COVER] título, subtítulo, CTA / [SLIDE 2-X: CONTEÚDO] etc.\n' +
  'Tom: provocador, inteligente, confiante. Nunca use "hoje em dia" ou frases clichê.';

var SYSTEM_IDEAS =
  'Você é estrategista de conteúdo B2B e vai gerar um carrossel completo para Instagram.\n' +
  'Retorne EXATAMENTE neste formato JSON (sem markdown, sem texto fora do JSON):\n' +
  '{\n' +
  '  "slides": [\n' +
  '    { "type": "cover", "tag": "TAG AQUI", "headline": "Título aqui", "headlineHighlight": "palavra", "sub": "subtítulo aqui", "showCta": true, "cta": "Deslize para ver" },\n' +
  '    { "type": "content", "step": "PASSO 01", "headline": "Título aqui", "headlineHighlight": "palavra", "body": "Texto do corpo aqui" },\n' +
  '    { "type": "quote", "quoteTag": "INSIGHT", "quote": "Texto acima da linha", "author": "Frase principal aqui", "quoteHighlight": "palavra" },\n' +
  '    { "type": "cta", "eyebrow": "TAG", "headline": "Título CTA", "headlineHighlight": "palavra", "body": "Item 1\nItem 2\nItem 3", "cta": "Texto do botão" }\n' +
  '  ]\n' +
  '}\n' +
  'Crie entre 4 e 6 slides. Tom: direto, premium, B2B. Nunca use clichês de IA.';

// ── AGENT TABS ────────────────────────────────────────

function switchAgent(name) {
  var tabs  = document.querySelectorAll('.agent-tab');
  var panes = document.querySelectorAll('.agent-pane');
  ['story', 'ideas'].forEach(function (id, i) {
    var active = id === name;
    tabs[i].classList.toggle('active', active);
    tabs[i].setAttribute('aria-selected', String(active));
    panes[i].classList.toggle('visible', active);
    if (active) panes[i].removeAttribute('hidden');
    else panes[i].setAttribute('hidden', '');
  });
}

function quickPrompt(agentId, promptIdx) {
  var text = QUICK_PROMPTS[agentId][promptIdx];
  if (!text) return;
  document.getElementById(agentId + 'Input').value = text;
  sendAgent(agentId);
}

// ── SEND ──────────────────────────────────────────────

async function sendAgent(agentId) {
  var inputEl    = document.getElementById(agentId + 'Input');
  var messagesEl = document.getElementById(agentId + 'Messages');
  var sendBtn    = document.getElementById(agentId + 'SendBtn');
  var userText   = inputEl.value.trim();
  if (!userText) return;

  var userMsg = document.createElement('div');
  userMsg.className = 'msg user';
  userMsg.textContent = userText;
  messagesEl.appendChild(userMsg);
  inputEl.value    = '';
  sendBtn.disabled = true;

  var loadMsg = document.createElement('div');
  loadMsg.className = 'msg ai loading';
  loadMsg.innerHTML = '<div class="dot-loader" aria-label="Gerando resposta"><span></span><span></span><span></span></div>';
  messagesEl.appendChild(loadMsg);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  var systemPrompt = agentId === 'story' ? SYSTEM_STORY : SYSTEM_IDEAS;

  try {
    var res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: systemPrompt,
        messages: [{ role: 'user', content: userText }],
      }),
    });

    var data = null;
    try { data = await res.json(); } catch (_) { data = null; }

    loadMsg.remove();

    if (!res.ok) {
      appendError(messagesEl, getMsgErro(res.status, data));
      sendBtn.disabled = false;
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return;
    }

    var reply = (data && data.content && data.content[0] && data.content[0].text) || '';
    if (!reply) {
      appendError(messagesEl, 'O modelo retornou uma resposta vazia. Tente novamente.');
      sendBtn.disabled = false;
      return;
    }

    // ── IDEIAS: tenta parsear JSON e carregar slides direto
    if (agentId === 'ideas') {
      var parsed = tryParseSlides(reply);
      if (parsed && parsed.length > 0) {
        renderIdeasResult(messagesEl, parsed, reply);
        sendBtn.disabled = false;
        messagesEl.scrollTop = messagesEl.scrollHeight;
        return;
      }
    }

    // ── STORY: resultado de texto com botão de aplicar
    var aiMsg = document.createElement('div');
    aiMsg.className = 'msg ai';
    aiMsg.innerHTML =
      '<span class="ai-badge">' +
        (agentId === 'story' ? '📖 Storytelling · Gemini' : '💡 Ideia · Gemini') +
      '</span>' +
      escapeHtmlBasic(reply).replace(/\n/g, '<br>');

    if (agentId === 'story') {
      var useBtn = document.createElement('button');
      useBtn.className   = 'use-result-btn';
      useBtn.type        = 'button';
      useBtn.textContent = '✦ Aplicar nos slides';
      useBtn.addEventListener('click', function () { applyStoryToSlides(reply); });
      aiMsg.appendChild(useBtn);
    }

    messagesEl.appendChild(aiMsg);

  } catch (err) {
    loadMsg.remove();
    appendError(messagesEl, 'Sem conexão com o servidor. Verifique sua internet.');
  }

  sendBtn.disabled = false;
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// ── IDEAS: render rich result + load button ───────────

function renderIdeasResult(messagesEl, parsedSlides, rawText) {
  var aiMsg = document.createElement('div');
  aiMsg.className = 'msg ai';

  var preview = parsedSlides.slice(0, 3).map(function (s, i) {
    var label = { cover: '🖼 Cover', content: '📄 ' + (s.step || 'Conteúdo'), quote: '💬 Insight', cta: '🎯 CTA' }[s.type] || s.type;
    var title = s.headline || s.author || '';
    return '<div class="idea-slide-row"><span class="idea-slide-badge">' + escapeHtmlBasic(label) + '</span>' +
      '<span class="idea-slide-title">' + escapeHtmlBasic(title.slice(0, 40)) + (title.length > 40 ? '…' : '') + '</span></div>';
  }).join('');

  aiMsg.innerHTML =
    '<span class="ai-badge">💡 Carrossel gerado · Gemini</span>' +
    '<div class="idea-preview">' +
      '<div class="idea-count">✦ ' + parsedSlides.length + ' slides criados</div>' +
      preview +
      (parsedSlides.length > 3 ? '<div class="idea-more">+ ' + (parsedSlides.length - 3) + ' mais slides</div>' : '') +
    '</div>';

  var loadBtn = document.createElement('button');
  loadBtn.className   = 'use-result-btn';
  loadBtn.type        = 'button';
  loadBtn.textContent = '✦ Carregar esses slides no editor';
  loadBtn.addEventListener('click', function () {
    slides.length = 0;
    parsedSlides.forEach(function (s) { slides.push(Object.assign({ brand: 'BESCHEIBEN' }, s)); });
    currentSlide = 0;
    renderSlideList();
    renderSlidePreview();
    renderEditor();

    var notice = document.createElement('div');
    notice.className = 'msg ai';
    notice.innerHTML = '<span class="ai-badge">✓ Slides carregados</span>Revise os textos no painel esquerdo e ajuste o que precisar. Os slides já estão no editor!';
    messagesEl.appendChild(notice);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  });

  aiMsg.appendChild(loadBtn);
  messagesEl.appendChild(aiMsg);
}

function tryParseSlides(text) {
  try {
    var clean = text.replace(/```json|```/g, '').trim();
    var obj   = JSON.parse(clean);
    if (Array.isArray(obj.slides) && obj.slides.length > 0) return obj.slides;
  } catch (_) {}
  return null;
}

// ── STORY: apply text to slides ───────────────────────

function applyStoryToSlides(text) {
  var matches = Array.from(text.matchAll(/\[SLIDE\s*\d+[^\]]*\][^\[]*/gi));
  if (!matches.length) {
    alert('Não encontrei estrutura de slides. Use os textos manualmente.');
    return;
  }
  matches.forEach(function (m, i) {
    if (!slides[i]) {
      slides.push({ type: 'content', step: 'PASSO 0' + (i + 1), headline: '', body: '', brand: 'BESCHEIBEN' });
    }
    var block = m[0].replace(/\[SLIDE[^\]]*\]/i, '').trim();
    var lines = block.split('\n').filter(Boolean);
    if (lines[0]) slides[i].headline = lines[0];
    if (lines.length > 1) slides[i].body = lines.slice(1).join(' ');
  });
  selectSlide(0);
  alert(matches.length + ' slides atualizados!');
}

// ── HELPERS ───────────────────────────────────────────

function getMsgErro(status, data) {
  var srv = data && data.error;
  if (status === 429) return '⏳ Limite de requisições. Aguarde e tente novamente.';
  if (status === 500) return '⚠️ ' + (srv || 'Erro interno. Verifique GEMINI_API_KEY no Vercel.');
  if (status === 400 || status === 403) return '🔑 Chave de API inválida. Verifique GEMINI_API_KEY.';
  return srv || '⚠️ Algo deu errado (status ' + status + ').';
}

function appendError(container, text) {
  var d = document.createElement('div');
  d.className = 'msg ai error-msg';
  d.textContent = text;
  container.appendChild(d);
}

function escapeHtmlBasic(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
