'use strict';

/* ═══════════════════════════════════════════════════════════════
   chat.js — Gemini 1.5 Flash AI agents
   ═══════════════════════════════════════════════════════════════ */

var QUICK_PROMPTS = {
  story: [
    'Crie um storytelling para carrossel sobre marketing digital B2B para a Bescheiben',
    'Storytelling sobre transformação de marca: antes sem presença, depois referência',
    'Storytelling de dor → solução para agência de marketing B2B',
    'Storytelling de autoridade para agência digital premium',
  ],
  ideas: [
    'Gere um carrossel de 5 slides para agência de marketing digital B2B com slide dinâmico de funil',
    'Crie um carrossel de 5 slides sobre como uma empresa B2B pode gerar leads no Instagram',
    'Monte um carrossel de 5 slides sobre os 3 erros de posicionamento digital mais comuns',
    'Crie um carrossel de 5 slides mostrando o processo de crescimento digital com funil',
  ],
};

var SYSTEM_STORY =
  'Você é especialista em storytelling para marketing digital B2B no Instagram.\n' +
  'Escreve para a Bescheiben Digital Agency — tom direto, premium e inteligente.\n' +
  'Fonte usada: Space Grotesk. Estética: dark tech.\n' +
  'Retorne o storytelling estruturado por slides:\n' +
  '[SLIDE 1: COVER] título, subtítulo\n' +
  '[SLIDE 2: CONTEÚDO] passo/badge, headline, corpo\n' +
  '... e assim por diante.\n' +
  'Tom: provocador, confiante, sem clichês. Nunca use "hoje em dia".';

var SYSTEM_IDEAS =
  'Você é estrategista de conteúdo B2B para a Bescheiben Digital Agency.\n' +
  'Gere um carrossel completo para Instagram.\n' +
  'RETORNE APENAS JSON VÁLIDO, sem markdown, sem texto antes ou depois, sem comentários.\n' +
  'Formato exato:\n' +
  '{\n' +
  '  "slides": [\n' +
  '    { "type": "cover", "theme": "dark", "tag": "TAG", "headline": "Título", "headlineHighlight": "palavra", "sub": "subtítulo", "showCta": true, "cta": "DESLIZE" },\n' +
  '    { "type": "content", "theme": "dark", "step": "PASSO 01", "headline": "Título", "headlineHighlight": "palavra", "body": "corpo do texto" },\n' +
  '    { "type": "dynamic", "theme": "dark", "tag": "CATEGORIA", "step": "SERVIÇO 01", "headline": "Título", "headlineHighlight": "palavra", "body": "texto", "funnelItems": [{"cat":"CAT1","label":"Item","sub":"detalhe","color":"#6B4EFF"}] },\n' +
  '    { "type": "quote", "theme": "dark", "quoteTag": "INSIGHT", "quote": "texto pequeno acima", "author": "Frase principal grande", "quoteHighlight": "palavra" },\n' +
  '    { "type": "cta", "theme": "dark", "eyebrow": "TAG", "headline": "Título CTA", "headlineHighlight": "palavra", "body": "Item 1\\nItem 2\\nItem 3", "cta": "Texto do botão" }\n' +
  '  ]\n' +
  '}\n' +
  'Regras:\n' +
  '- Crie entre 4 e 6 slides.\n' +
  '- Use "dynamic" para pelo menos 1 slide se falar de serviços ou processos.\n' +
  '- headlineHighlight deve ser UMA palavra ou frase curta já contida no headline.\n' +
  '- Tom: direto, premium, B2B. Sem clichês de IA. Sem "hoje em dia".';

/* ── Agent switcher ── */
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

/* ── Quick prompts ── */
function quickPrompt(agentId, promptIdx) {
  var text = QUICK_PROMPTS[agentId][promptIdx];
  if (!text) return;
  document.getElementById(agentId + 'Input').value = text;
  sendAgent(agentId);
}

/* ── Main send function ── */
async function sendAgent(agentId) {
  var inputEl    = document.getElementById(agentId + 'Input');
  var messagesEl = document.getElementById(agentId + 'Messages');
  var sendBtn    = document.getElementById(agentId + 'SendBtn');
  var userText   = inputEl.value.trim();
  if (!userText) return;

  /* user bubble */
  var userMsg = document.createElement('div');
  userMsg.className = 'msg user';
  userMsg.textContent = userText;
  messagesEl.appendChild(userMsg);
  inputEl.value    = '';
  sendBtn.disabled = true;

  /* loading bubble */
  var loadMsg = document.createElement('div');
  loadMsg.className = 'msg ai loading';
  loadMsg.innerHTML =
    '<div class="dot-loader" aria-label="Gerando resposta">' +
      '<span></span><span></span><span></span>' +
    '</div>';
  messagesEl.appendChild(loadMsg);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  var systemPrompt = agentId === 'story' ? SYSTEM_STORY : SYSTEM_IDEAS;

  try {
    var res = await fetch('/api/chat', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system:     systemPrompt,
        messages:   [{ role: 'user', content: userText }],
        geminiKey:  localStorage.getItem('bescheiben_gemini_key') || '',
      }),
    });

    var data = null;
    try { data = await res.json(); } catch (_) { data = null; }
    loadMsg.remove();

    if (!res.ok) {
      var errMsg = (data && data.error) || 'Erro desconhecido.';
      appendErrorMsg(messagesEl, errMsg, agentId, userText);
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

    /* Ideas agent — parse JSON and load slides */
    if (agentId === 'ideas') {
      var parsed = tryParseSlides(reply);
      if (parsed && parsed.length > 0) {
        renderIdeasResult(messagesEl, parsed);
        sendBtn.disabled = false;
        messagesEl.scrollTop = messagesEl.scrollHeight;
        return;
      }
      appendError(messagesEl, 'Não consegui parsear os slides. Tente reformular o prompt.');
      sendBtn.disabled = false;
      return;
    }

    /* Story agent — text result with "apply" button */
    var aiMsg = document.createElement('div');
    aiMsg.className = 'msg ai';
    aiMsg.innerHTML =
      '<span class="ai-badge">📖 Storytelling · Gemini 1.5 Flash</span>' +
      escapeHtmlBasic(reply).replace(/\n/g, '<br>');

    var useBtn = document.createElement('button');
    useBtn.className   = 'use-result-btn';
    useBtn.type        = 'button';
    useBtn.textContent = '✦ Aplicar nos slides';
    useBtn.addEventListener('click', function () { applyStoryToSlides(reply); });
    aiMsg.appendChild(useBtn);
    messagesEl.appendChild(aiMsg);

  } catch (err) {
    loadMsg.remove();
    appendErrorMsg(
      messagesEl,
      '⚠️ Sem conexão com o servidor. Verifique sua internet.',
      agentId, userText
    );
  }

  sendBtn.disabled = false;
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

/* ── Render ideas result ── */
function renderIdeasResult(messagesEl, parsedSlides) {
  var aiMsg = document.createElement('div');
  aiMsg.className = 'msg ai';

  var LABELS = { cover:'🖼 Cover', content:'📄', quote:'💬 Insight', cta:'🎯 CTA', dynamic:'📊 Dinâmico' };
  var preview = parsedSlides.slice(0, 3).map(function (s) {
    var label = LABELS[s.type] || s.type;
    if (s.type === 'content') label += ' ' + (s.step || 'Conteúdo');
    var title = s.headline || s.author || '';
    return (
      '<div class="idea-slide-row">' +
        '<span class="idea-slide-badge">' + escapeHtmlBasic(label) + '</span>' +
        '<span class="idea-slide-title">' +
          escapeHtmlBasic(title.slice(0, 38)) + (title.length > 38 ? '…' : '') +
        '</span>' +
      '</div>'
    );
  }).join('');

  aiMsg.innerHTML =
    '<span class="ai-badge">💡 Carrossel gerado · Gemini 1.5 Flash</span>' +
    '<div class="idea-preview">' +
      '<div class="idea-count">✦ ' + parsedSlides.length + ' slides criados</div>' +
      preview +
      (parsedSlides.length > 3
        ? '<div class="idea-more">+ ' + (parsedSlides.length - 3) + ' mais slides</div>'
        : '') +
    '</div>';

  var loadBtn = document.createElement('button');
  loadBtn.className   = 'use-result-btn';
  loadBtn.type        = 'button';
  loadBtn.textContent = '✦ Carregar esses slides no editor';
  loadBtn.addEventListener('click', function () {
    slides.length = 0;
    parsedSlides.forEach(function (s) {
      slides.push(Object.assign({ theme: 'dark', brand: 'BESCHEIBEN' }, s));
    });
    currentSlide = 0;
    renderSlideList();
    renderSlidePreview();
    renderEditor();

    var notice = document.createElement('div');
    notice.className = 'msg ai';
    notice.innerHTML =
      '<span class="ai-badge">✓ Slides carregados</span>' +
      'Revise e ajuste no painel esquerdo. Os slides já estão no editor!';
    messagesEl.appendChild(notice);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  });

  aiMsg.appendChild(loadBtn);
  messagesEl.appendChild(aiMsg);
}

/* ── Parse JSON slides from AI reply ── */
function tryParseSlides(text) {
  try {
    var clean = text.replace(/```json|```/g, '').trim();
    /* Sometimes Gemini wraps in extra text — extract the JSON object */
    var match = clean.match(/\{[\s\S]*\}/);
    if (match) clean = match[0];
    var obj = JSON.parse(clean);
    if (Array.isArray(obj.slides) && obj.slides.length > 0) return obj.slides;
  } catch (_) {}
  return null;
}

/* ── Apply storytelling text to existing slides ── */
function applyStoryToSlides(text) {
  var matches = Array.from(text.matchAll(/\[SLIDE\s*[^\]]*\][^\[]*/gi));
  if (!matches.length) {
    alert('Não encontrei estrutura de slides. Use os textos manualmente.');
    return;
  }
  matches.forEach(function (m, i) {
    if (!slides[i]) {
      slides.push({
        type: 'content', theme: 'dark',
        step: 'PASSO 0' + (i + 1),
        headline: '', body: '', brand: 'BESCHEIBEN',
      });
    }
    var block = m[0].replace(/\[SLIDE[^\]]*\]/i, '').trim();
    var lines  = block.split('\n').filter(Boolean);
    if (lines[0]) slides[i].headline = lines[0];
    if (lines.length > 1) slides[i].body = lines.slice(1).join(' ');
  });
  selectSlide(0);
  alert(matches.length + ' slides atualizados!');
}

/* ── Error helpers ── */
function appendErrorMsg(container, text, agentId, originalPrompt) {
  var d = document.createElement('div');
  d.className = 'msg ai error-msg';
  d.innerHTML = '<div style="margin-bottom:8px;">⚠️ ' + escapeHtmlBasic(text) + '</div>';

  if (text.includes('chave') || text.includes('Configure') || text.includes('nválida') || text.includes('400') || text.includes('403')) {
    var cfgBtn = document.createElement('button');
    cfgBtn.className   = 'use-result-btn';
    cfgBtn.type        = 'button';
    cfgBtn.textContent = '⚙ Configurar chave Gemini';
    cfgBtn.addEventListener('click', openSettingsModal);
    d.appendChild(cfgBtn);
  } else {
    var retryBtn = document.createElement('button');
    retryBtn.className   = 'use-result-btn';
    retryBtn.type        = 'button';
    retryBtn.textContent = '🔄 Tentar novamente';
    retryBtn.addEventListener('click', function () {
      document.getElementById(agentId + 'Input').value = originalPrompt;
      sendAgent(agentId);
    });
    d.appendChild(retryBtn);
  }
  container.appendChild(d);
}

function appendError(container, text) {
  var d = document.createElement('div');
  d.className   = 'msg ai error-msg';
  d.textContent = text;
  container.appendChild(d);
}

function escapeHtmlBasic(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
