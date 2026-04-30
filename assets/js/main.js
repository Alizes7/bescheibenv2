'use strict';

/* ═══════════════════════════════════════════════════════════════
   main.js — event listeners, modals, init
   ═══════════════════════════════════════════════════════════════ */

/* ── API key ── */
var GEMINI_KEY = localStorage.getItem('bescheiben_gemini_key') || '';

function updateKeyBadge() {
  var badge = document.getElementById('keyBadge');
  if (GEMINI_KEY) {
    badge.className   = 'key-badge ok';
    badge.textContent = 'IA ativa';
  } else {
    badge.className   = 'key-badge missing';
    badge.textContent = 'Sem chave';
  }
}

/* ── Modals ── */
function openSettingsModal() {
  document.getElementById('settingsModal').classList.add('open');
  document.getElementById('geminiKeyInput').value = GEMINI_KEY;
}
function closeSettingsModal() {
  document.getElementById('settingsModal').classList.remove('open');
}
function openTemplateModal() {
  document.getElementById('templateModal').classList.add('open');
}
function closeTemplateModal() {
  document.getElementById('templateModal').classList.remove('open');
}

/* ── Build template grid ── */
function buildTemplateGrid() {
  var grid = document.getElementById('templateGrid');
  if (!grid) return;
  TEMPLATES.forEach(function (tpl, idx) {
    var card = document.createElement('div');
    card.className = 'template-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('data-tpl-idx', idx);
    card.innerHTML =
      '<div class="tpl-icon" style="color:' + tpl.color + '">' + tpl.icon + '</div>' +
      '<div class="tpl-name">' + tpl.name + '</div>' +
      '<div class="tpl-desc">' + tpl.desc + '</div>' +
      '<div class="tpl-count">' + tpl.slides.length + ' slides</div>' +
      '<div class="tpl-slides-preview">' +
        tpl.slides.map(function (s) {
          var l = { cover:'Cover', content: s.step || 'Conteúdo', quote:'Insight', cta:'CTA', dynamic:'Dinâmico' }[s.type] || s.type;
          return '<span class="tpl-slide-tag">' + l + '</span>';
        }).join('') +
      '</div>' +
      '<button class="tpl-load-btn" type="button">Usar este template →</button>';
    grid.appendChild(card);
  });

  grid.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-tpl-idx]');
    if (btn) loadTemplate(parseInt(btn.dataset.tplIdx, 10));
  });
  grid.addEventListener('keydown', function (e) {
    var btn = e.target.closest('[data-tpl-idx]');
    if (btn && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      loadTemplate(parseInt(btn.dataset.tplIdx, 10));
    }
  });
}

/* ════════════════════════════════════════════════
   EVENT LISTENERS
════════════════════════════════════════════════ */

/* Header format tabs */
document.querySelectorAll('.tab-btn[data-view]').forEach(function (btn) {
  btn.addEventListener('click', function () { setMode(btn.dataset.view); });
});

/* Slide list */
document.getElementById('slideList').addEventListener('click', function (e) {
  var item = e.target.closest('[data-slide-idx]');
  if (!item) return;
  var idx = parseInt(item.dataset.slideIdx, 10);
  if      (e.target.closest('[data-action="move-up"]'))   { e.stopPropagation(); moveSlide(idx, -1); }
  else if (e.target.closest('[data-action="move-down"]')) { e.stopPropagation(); moveSlide(idx,  1); }
  else if (e.target.closest('[data-action="delete"]'))    { e.stopPropagation(); deleteSlide(idx); }
  else selectSlide(idx);
});
document.getElementById('slideList').addEventListener('keydown', function (e) {
  var item = e.target.closest('[data-slide-idx]');
  if (item && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    selectSlide(parseInt(item.dataset.slideIdx, 10));
  }
});

/* Editor — field changes */
var editorEl = document.getElementById('editorFields');
editorEl.addEventListener('input', function (e) {
  var key = e.target.dataset.fieldKey;
  if (key && e.target.type !== 'checkbox' && e.target.type !== 'color') {
    updateField(key, e.target.value);
  }
  var fiKey = e.target.dataset.fiKey;
  var fiIdx = e.target.dataset.fiIdx;
  if (fiKey !== undefined && fiIdx !== undefined && e.target.type !== 'color') {
    updateFunnelItem(parseInt(fiIdx, 10), fiKey, e.target.value);
  }
});
editorEl.addEventListener('change', function (e) {
  var key = e.target.dataset.fieldKey;
  if (key && e.target.type === 'checkbox') updateField(key, e.target.checked);
  var fiKey = e.target.dataset.fiKey;
  var fiIdx = e.target.dataset.fiIdx;
  if (fiKey === 'color' && fiIdx !== undefined) {
    updateFunnelItem(parseInt(fiIdx, 10), 'color', e.target.value);
  }
});
editorEl.addEventListener('click', function (e) {
  var typeOpt  = e.target.closest('[data-type-opt]');
  if (typeOpt)  { changeType(typeOpt.dataset.typeOpt); return; }
  var themeOpt = e.target.closest('[data-theme-opt]');
  if (themeOpt) { changeTheme(themeOpt.dataset.themeOpt); return; }
  var delBtn   = e.target.closest('[data-fi-del]');
  if (delBtn)   { deleteFunnelItem(parseInt(delBtn.dataset.fiDel, 10)); return; }
  if (e.target.id === 'addFiBtn' || e.target.closest('#addFiBtn')) { addFunnelItem(); }
});
editorEl.addEventListener('keydown', function (e) {
  var t = e.target.closest('[data-type-opt]');
  if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); changeType(t.dataset.typeOpt); }
  var th = e.target.closest('[data-theme-opt]');
  if (th && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); changeTheme(th.dataset.themeOpt); }
});

/* Navigation buttons */
document.getElementById('prevBtn').addEventListener('click', prevSlide);
document.getElementById('nextBtn').addEventListener('click', nextSlide);
document.addEventListener('keydown', function (e) {
  var tag = document.activeElement && document.activeElement.tagName;
  if (tag === 'TEXTAREA' || tag === 'INPUT') return;
  if (e.key === 'ArrowRight') nextSlide();
  if (e.key === 'ArrowLeft')  prevSlide();
});

/* Add slide / download */
document.getElementById('addSlideBtn').addEventListener('click', addSlide);
document.getElementById('dlBtn').addEventListener('click', downloadCurrent);
document.getElementById('dlAllBtn').addEventListener('click', downloadAll);

/* Font scale */
document.getElementById('fontIncrease').addEventListener('click', function () { adjustFontScale(0.1); });
document.getElementById('fontDecrease').addEventListener('click', function () { adjustFontScale(-0.1); });
document.getElementById('fontReset').addEventListener('click', resetFontScale);

/* AI agents */
document.querySelectorAll('[data-agent-tab]').forEach(function (btn) {
  btn.addEventListener('click', function () { switchAgent(btn.dataset.agentTab); });
});
document.querySelectorAll('[data-quick-agent]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    quickPrompt(btn.dataset.quickAgent, parseInt(btn.dataset.promptIdx, 10));
  });
});
document.getElementById('storySendBtn').addEventListener('click', function () { sendAgent('story'); });
document.getElementById('ideasSendBtn').addEventListener('click', function () { sendAgent('ideas'); });

/* Modals — open/close */
document.getElementById('openTemplatesBtn').addEventListener('click', openTemplateModal);
document.getElementById('modalClose').addEventListener('click', closeTemplateModal);
document.getElementById('templateModal').addEventListener('click', function (e) {
  if (e.target === this) closeTemplateModal();
});
document.getElementById('openSettingsBtn').addEventListener('click', openSettingsModal);
document.getElementById('settingsClose').addEventListener('click', closeSettingsModal);
document.getElementById('settingsModal').addEventListener('click', function (e) {
  if (e.target === this) closeSettingsModal();
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') { closeTemplateModal(); closeSettingsModal(); }
});

/* Save API key */
document.getElementById('saveKeyBtn').addEventListener('click', function () {
  var val = document.getElementById('geminiKeyInput').value.trim();
  GEMINI_KEY = val;
  localStorage.setItem('bescheiben_gemini_key', val);
  updateKeyBadge();
  var fb = document.getElementById('saveKeyFeedback');
  fb.style.display = 'inline';
  setTimeout(function () { fb.style.display = 'none'; closeSettingsModal(); }, 1200);
});

/* ════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════ */
updateKeyBadge();
buildTemplateGrid();
renderSlideList();
renderSlidePreview();
renderEditor();

/* First-run hint if no key */
if (!GEMINI_KEY) {
  var hint = document.createElement('div');
  hint.className = 'msg ai';
  hint.innerHTML =
    '<span class="ai-badge">⚙ Configuração</span>' +
    'Configure sua chave Gemini gratuita clicando em <strong>⚙</strong> no cabeçalho para ativar a IA.';
  document.getElementById('storyMessages').appendChild(hint);
  document.getElementById('ideasMessages').appendChild(hint.cloneNode(true));
}
