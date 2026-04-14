'use strict';

// ── TEMPLATE MODAL ────────────────────────────────────

function buildTemplateGrid() {
  var grid = document.getElementById('templateGrid');
  if (!grid) return;
  TEMPLATES.forEach(function (tpl, idx) {
    var card = document.createElement('div');
    card.className = 'template-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', 'Carregar template ' + tpl.name);
    card.setAttribute('data-tpl-idx', idx);
    card.innerHTML =
      '<div class="tpl-icon" style="color:' + tpl.color + '">' + tpl.icon + '</div>' +
      '<div class="tpl-name">' + tpl.name + '</div>' +
      '<div class="tpl-desc">' + tpl.desc + '</div>' +
      '<div class="tpl-count">' + tpl.slides.length + ' slides</div>' +
      '<div class="tpl-slides-preview">' +
        tpl.slides.map(function (s) {
          var l = { cover:'Cover', content: s.step || 'Conteúdo', quote:'Insight', cta:'CTA' }[s.type] || s.type;
          return '<span class="tpl-slide-tag">' + l + '</span>';
        }).join('') +
      '</div>' +
      '<button class="tpl-load-btn" type="button" style="background:' + tpl.color +
        (tpl.color === '#c4f542' || tpl.color === '#22d3ee' || tpl.color === '#f59e0b' ? ';color:#0a0a0f' : '') +
        '">Usar este template →</button>';
    grid.appendChild(card);
  });

  grid.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-tpl-idx]');
    if (!btn) return;
    loadTemplate(parseInt(btn.dataset.tplIdx, 10));
  });
  grid.addEventListener('keydown', function (e) {
    var btn = e.target.closest('[data-tpl-idx]');
    if (btn && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); loadTemplate(parseInt(btn.dataset.tplIdx, 10)); }
  });
}

function openTemplateModal()  { document.getElementById('templateModal').classList.add('open'); }
function closeTemplateModal() { document.getElementById('templateModal').classList.remove('open'); }

document.getElementById('openTemplatesBtn').addEventListener('click', openTemplateModal);
document.getElementById('modalClose').addEventListener('click', closeTemplateModal);
document.getElementById('templateModal').addEventListener('click', function (e) { if (e.target === this) closeTemplateModal(); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeTemplateModal(); });

// ── MODE SWITCHING ────────────────────────────────────

function setMode(mode) {
  if (!FORMAT[mode]) return;
  currentMode = mode;
  document.querySelectorAll('.tab-btn[data-view]').forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset.view === mode);
  });
  renderSlidePreview();
}

// ── HEADER TABS ───────────────────────────────────────

document.querySelectorAll('.tab-btn[data-view]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var v = btn.dataset.view;
    if (v === 'carousel' || v === 'story') { setMode(v); return; }
    document.querySelectorAll('.tab-btn[data-view]').forEach(function (b) {
      b.classList.toggle('active', b.dataset.view === v);
    });
  });
});

// ── SLIDE LIST ────────────────────────────────────────

document.getElementById('slideList').addEventListener('click', function (e) {
  var item = e.target.closest('[data-slide-idx]');
  if (!item) return;
  var idx = parseInt(item.dataset.slideIdx, 10);
  if (e.target.closest('[data-action="move-up"]'))   { e.stopPropagation(); moveSlide(idx, -1); }
  else if (e.target.closest('[data-action="move-down"]')) { e.stopPropagation(); moveSlide(idx, 1); }
  else if (e.target.closest('[data-action="delete"]'))    { e.stopPropagation(); deleteSlide(idx); }
  else selectSlide(idx);
});
document.getElementById('slideList').addEventListener('keydown', function (e) {
  var item = e.target.closest('[data-slide-idx]');
  if (!item) return;
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectSlide(parseInt(item.dataset.slideIdx, 10)); }
});

// ── EDITOR ────────────────────────────────────────────

var editorEl = document.getElementById('editorFields');
editorEl.addEventListener('input', function (e) {
  var key = e.target.dataset.fieldKey;
  if (key) updateField(key, e.target.value);
});
editorEl.addEventListener('change', function (e) {
  var key = e.target.dataset.fieldKey;
  if (key && e.target.type === 'checkbox') updateField(key, e.target.checked);
});
editorEl.addEventListener('click', function (e) {
  var t = e.target.closest('[data-type-opt]');
  if (t) changeType(t.dataset.typeOpt);
});
editorEl.addEventListener('keydown', function (e) {
  var t = e.target.closest('[data-type-opt]');
  if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); changeType(t.dataset.typeOpt); }
});

// ── NAVIGATION ────────────────────────────────────────

document.getElementById('prevBtn').addEventListener('click', prevSlide);
document.getElementById('nextBtn').addEventListener('click', nextSlide);
document.addEventListener('keydown', function (e) {
  var tag = document.activeElement && document.activeElement.tagName;
  if (tag === 'TEXTAREA' || tag === 'INPUT') return;
  if (e.key === 'ArrowRight') nextSlide();
  if (e.key === 'ArrowLeft')  prevSlide();
});

// ── ADD SLIDE / DOWNLOAD ──────────────────────────────

document.getElementById('addSlideBtn').addEventListener('click', addSlide);
document.getElementById('dlBtn').addEventListener('click', downloadCurrent);
document.getElementById('dlAllBtn').addEventListener('click', downloadAll);

// ── FONT SCALE ────────────────────────────────────────

document.getElementById('fontIncrease').addEventListener('click', function () { adjustFontScale(0.1); });
document.getElementById('fontDecrease').addEventListener('click', function () { adjustFontScale(-0.1); });
document.getElementById('fontReset').addEventListener('click', resetFontScale);

// ── AGENTS ────────────────────────────────────────────

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

// ── INIT ─────────────────────────────────────────────

buildTemplateGrid();
renderSlideList();
renderSlidePreview();
renderEditor();
