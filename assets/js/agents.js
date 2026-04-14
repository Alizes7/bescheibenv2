'use strict';

// ── QUICK PROMPTS ─────────────────────────────────────

var QUICK_PROMPTS = {
  story: [
    'Crie um storytelling para meu próximo carrossel sobre marketing digital B2B',
    'Storytelling sobre transformação de marca para meu cliente',
    'Storytelling de dor → solução para agência de marketing',
    'Storytelling de autoridade para agência digital',
  ],
  ideas: [
    '5 ideias de carrossel para agência de marketing digital',
    'Ideias de carrossel para escritório de contabilidade B2B',
    'Ideias virais de post para marketing B2B no Instagram',
    'Posts educativos que geram autoridade e leads',
  ],
};

// ── SYSTEM PROMPTS ────────────────────────────────────

var SYSTEM_STORY =
  'Você é um especialista em storytelling para marketing digital B2B no Instagram.\n' +
  'Você escreve para a Bescheiben Digital Agency — uma agência com estética dark/tech, tom direto e premium.\n' +
  'Formato de carrossel: cada slide é numerado. Use linguagem impactante, frases curtas, sem floreios genéricos de IA.\n' +
  'Retorne o storytelling estruturado por slides, com: [SLIDE 1: COVER] título, subtítulo, CTA / [SLIDE 2-X: CONTEÚDO] etc.\n' +
  'Tom: provocador, inteligente, confiante. Nunca diga "hoje em dia" ou frases clichê.';

var SYSTEM_IDEAS =
  'Você é um estrategista de conteúdo B2B especialista em Instagram.\n' +
  'Você cria ideias de posts para a Bescheiben Digital Agency e seus clientes.\n' +
  'Retorne sempre uma lista numerada com: título do post, tipo (carrossel/reels/estático), gancho de primeira linha, ' +
  'estrutura de slides sugerida, e objetivo estratégico.\n' +
  'Tom: direto ao ponto, sem jargão vazio. Ideias acionáveis e baseadas em resultados.';

// ── AGENT TABS ────────────────────────────────────────

function switchAgent(name) {
  var tabs  = document.querySelectorAll('.agent-tab');
  var panes = document.querySelectorAll('.agent-pane');
  var order = ['story', 'ideas'];

  tabs.forEach(function (tab, i) {
    var active = order[i] === name;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });

  panes.forEach(function (pane, i) {
    var visible = order[i] === name;
    pane.classList.toggle('visible', visible);
    if (visible) pane.removeAttribute('hidden');
    else pane.setAttribute('hidden', '');
  });
}

// ── QUICK PROMPT ──────────────────────────────────────

function quickPrompt(agentId, promptIdx) {
  var text = QUICK_PROMPTS[agentId][promptIdx];
  if (!text) return;
  document.getElementById(agentId + 'Input').value = text;
  sendAgent(agentId);
}

// ── SEND MESSAGE ──────────────────────────────────────

async function sendAgent(agentId) {
  var inputEl    = document.getElementById(agentId + 'Input');
  var messagesEl = document.getElementById(agentId + 'Messages');
  var sendBtn    = document.getElementById(agentId + 'SendBtn');
  var userText   = inputEl.value.trim();
  if (!userText) return;

  // Mensagem do usuário
  var userMsg = document.createElement('div');
  userMsg.className   = 'msg user';
  userMsg.textContent = userText;
  messagesEl.appendChild(userMsg);
  inputEl.value    = '';
  sendBtn.disabled = true;

  // Indicador de carregamento
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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: systemPrompt,
        messages: [{ role: 'user', content: userText }],
      }),
    });

    // Tenta parsear JSON independente do status
    var data = null;
    try {
      data = await res.json();
    } catch (_) {
      data = null;
    }

    loadMsg.remove();

    if (!res.ok) {
      // Usa mensagem amigável do servidor se disponível, senão genérica
      var errText = (data && data.error) || getMensagemErro(res.status);
      appendErrorMsg(messagesEl, errText);
      sendBtn.disabled = false;
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return;
    }

    var reply = (data && data.content && data.content[0] && data.content[0].text) || '';
    if (!reply) {
      appendErrorMsg(messagesEl, 'O modelo retornou uma resposta vazia. Tente novamente.');
      sendBtn.disabled = false;
      return;
    }

    // Mensagem da IA
    var aiMsg = document.createElement('div');
    aiMsg.className = 'msg ai';
    aiMsg.innerHTML =
      '<span class="ai-badge">' +
        (agentId === 'story' ? '📖 Storytelling · Gemini' : '💡 Ideia gerada · Gemini') +
      '</span>' +
      reply.replace(/\n/g, '<br>');

    if (agentId === 'story') {
      var useBtn = document.createElement('button');
      useBtn.className   = 'use-result-btn';
      useBtn.type        = 'button';
      useBtn.textContent = '✦ Usar como base nos slides';
      useBtn.addEventListener('click', function () { applyStoryToSlides(reply); });
      aiMsg.appendChild(useBtn);
    }

    messagesEl.appendChild(aiMsg);

  } catch (networkErr) {
    loadMsg.remove();
    console.error('[agents] fetch error:', networkErr);
    appendErrorMsg(
      messagesEl,
      'Sem conexão com o servidor. Verifique sua internet e tente novamente.'
    );
  }

  sendBtn.disabled = false;
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// ── HELPERS ───────────────────────────────────────────

/**
 * Retorna uma mensagem amigável para códigos HTTP comuns.
 * @param {number} status
 * @returns {string}
 */
function getMensagemErro(status) {
  if (status === 429) return '⏳ Limite de requisições atingido. Aguarde alguns segundos e tente novamente.';
  if (status === 500) return '⚠️ Erro interno no servidor. Verifique se GEMINI_API_KEY está configurada no Vercel.';
  if (status === 502 || status === 503) return '⚠️ Serviço temporariamente indisponível. Tente novamente.';
  if (status === 400 || status === 403) return '🔑 Chave de API inválida. Verifique GEMINI_API_KEY no painel do Vercel.';
  return '⚠️ Algo deu errado (status ' + status + '). Tente novamente.';
}

/**
 * Adiciona uma bolha de erro amigável no chat.
 * @param {HTMLElement} container
 * @param {string} text
 */
function appendErrorMsg(container, text) {
  var errMsg = document.createElement('div');
  errMsg.className = 'msg ai error-msg';
  errMsg.textContent = text;
  container.appendChild(errMsg);
}

// ── APPLY STORY TO SLIDES ─────────────────────────────

function applyStoryToSlides(text) {
  var matches = Array.from(text.matchAll(/\[SLIDE\s*\d+[^\]]*\][^\[]*/gi));

  if (!matches.length) {
    alert('Não encontrei estrutura de slides no resultado. Use os textos manualmente.');
    return;
  }

  matches.forEach(function (m, i) {
    if (!slides[i]) {
      slides.push({
        type: 'content',
        step: 'PASSO 0' + (i + 1),
        headline: '',
        headlineHighlight: '',
        body: '',
        brand: 'BESCHEIBEN',
      });
    }

    var block = m[0].replace(/\[SLIDE[^\]]*\]/i, '').trim();
    var lines = block.split('\n').filter(Boolean);
    if (lines[0]) slides[i].headline = lines[0];
    if (lines.length > 1) slides[i].body = lines.slice(1).join(' ');
  });

  selectSlide(0);
  alert(matches.length + ' slides atualizados! Revise e ajuste os textos.');
}
