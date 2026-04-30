'use strict';

/* ═══════════════════════════════════════════════════════════════
   nav.js — slide list, navigation, editor
   ═══════════════════════════════════════════════════════════════ */

/* ── Render slide list ── */
function renderSlideList() {
  var list = document.getElementById('slideList');
  list.innerHTML = '';
  slides.forEach(function (s, i) {
    var li = document.createElement('li');
    li.className = 'slide-item' + (i === currentSlide ? ' active' : '');
    li.setAttribute('data-slide-idx', i);
    li.setAttribute('tabindex', '0');
    li.setAttribute('role', 'button');
    li.setAttribute('aria-label', 'Slide ' + (i + 1) + ': ' + getSlideLabel(s));
    li.innerHTML =
      '<div class="slide-item-header">' +
        '<div>' +
          '<div class="slide-num">SLIDE ' + String(i + 1).padStart(2, '0') + '</div>' +
          '<div class="slide-label">' + escHtml(getSlideLabel(s)) + '</div>' +
        '</div>' +
        '<div class="slide-actions">' +
          '<button class="icon-btn" type="button" data-action="move-up"   aria-label="Mover para cima">↑</button>' +
          '<button class="icon-btn" type="button" data-action="move-down" aria-label="Mover para baixo">↓</button>' +
          '<button class="icon-btn del" type="button" data-action="delete" aria-label="Remover">×</button>' +
        '</div>' +
      '</div>';
    list.appendChild(li);
  });
  document.getElementById('navIndicator').textContent =
    (currentSlide + 1) + ' / ' + slides.length;
}

function getSlideLabel(s) {
  switch (s.type) {
    case 'cover':   return (s.headline || 'Cover').slice(0, 28);
    case 'content': return (s.step || '') + (s.step ? ': ' : '') + (s.headline || '').slice(0, 18);
    case 'quote':   return (s.author || s.quote || 'Insight').slice(0, 26) + '…';
    case 'cta':     return s.headline || 'CTA';
    case 'dynamic': return 'Dynamic: ' + (s.headline || '').slice(0, 16);
    default:        return 'Slide';
  }
}

/* ── Render preview ── */
function renderSlidePreview() {
  var el  = document.getElementById('slide-preview');
  var fmt = FORMAT[currentMode];
  el.style.width  = fmt.previewW + 'px';
  el.style.height = fmt.previewH + 'px';
  el.style.setProperty('--font-scale', String(fontScale));
  el.innerHTML = buildSlideHtml(slides[currentSlide], currentSlide, slides.length);
  var badge = document.getElementById('formatBadge');
  if (badge) badge.textContent = fmt.label;
  var fsd = document.getElementById('fontScaleDisplay');
  if (fsd) fsd.textContent = Math.round(fontScale * 100) + '%';
}

/* ── Render editor ── */
function renderEditor() {
  var s = slides[currentSlide];
  var container = document.getElementById('editorFields');

  var ICONS  = { cover:'🖼️', content:'📄', quote:'💬', cta:'🎯', dynamic:'📊' };
  var LABELS = { cover:'Cover', content:'Conteúdo', quote:'Insight', cta:'CTA', dynamic:'Dinâmico' };

  var typeOpts = ['cover', 'content', 'quote', 'cta', 'dynamic'].map(function (t) {
    return (
      '<div class="type-opt' + (s.type === t ? ' selected' : '') + '"' +
        ' data-type-opt="' + t + '" role="radio"' +
        ' aria-checked="' + (s.type === t) + '"' +
        ' tabindex="' + (s.type === t ? '0' : '-1') + '">' +
        '<span class="type-icon" aria-hidden="true">' + ICONS[t] + '</span>' +
        LABELS[t] +
      '</div>'
    );
  }).join('');

  var themeOpts = [
    { id:'dark',   icon:'🌑', label:'Dark' },
    { id:'purple', icon:'🟣', label:'Roxo' },
    { id:'white',  icon:'⬜', label:'Branco' },
  ].map(function (t) {
    var active = (s.theme || 'dark') === t.id;
    return (
      '<div class="theme-opt' + (active ? ' selected' : '') + '"' +
        ' data-theme-opt="' + t.id + '" role="radio"' +
        ' aria-checked="' + active + '"' +
        ' tabindex="' + (active ? '0' : '-1') + '">' +
        t.icon + ' ' + t.label +
      '</div>'
    );
  }).join('');

  var html =
    '<div class="editor-section">' +
      '<div class="field-label" id="type-label">Tipo de Slide</div>' +
      '<div class="type-grid" role="radiogroup" aria-labelledby="type-label">' + typeOpts + '</div>' +
    '</div>' +
    '<div class="editor-section">' +
      '<div class="field-label" id="theme-label">Tema</div>' +
      '<div class="theme-grid" role="radiogroup" aria-labelledby="theme-label">' + themeOpts + '</div>' +
    '</div>';

  if (s.type === 'cover') {
    html += fld('Tag da pílula', 'tag', s.tag, 'text');
    html += fld('Título principal', 'headline', s.headline, 'textarea');
    html += fld('Palavra em destaque', 'headlineHighlight', s.headlineHighlight, 'text', 'roxo');
    html += fld('Subtítulo', 'sub', s.sub, 'textarea');
    html += tog('Mostrar texto de arraste', 'showCta', s.showCta);
    if (s.showCta) html += fld('Texto do swipe cue', 'cta', s.cta, 'text');

  } else if (s.type === 'content') {
    html += fld('Badge / Categoria', 'step', s.step, 'text', 'pílula + nº fantasma');
    html += fld('Título', 'headline', s.headline, 'textarea');
    html += fld('Palavra em destaque', 'headlineHighlight', s.headlineHighlight, 'text', 'roxo');
    html += fld('Corpo do texto', 'body', s.body, 'textarea');

  } else if (s.type === 'quote') {
    html += fld('Tag da pílula', 'quoteTag', s.quoteTag, 'text', 'ex: DIAGNÓSTICO');
    html += fld('Texto acima da linha (pequeno)', 'quote', s.quote, 'textarea');
    html += fld('Frase principal (grande)', 'author', s.author, 'textarea');
    html += fld('Palavra em destaque', 'quoteHighlight', s.quoteHighlight, 'text', 'roxo na frase principal');

  } else if (s.type === 'cta') {
    html += fld('Tag da pílula', 'eyebrow', s.eyebrow, 'text');
    html += fld('Título', 'headline', s.headline, 'textarea');
    html += fld('Palavra em destaque', 'headlineHighlight', s.headlineHighlight, 'text', 'roxo');
    html += fld('Itens do checklist (1 por linha)', 'body', s.body, 'textarea', 'cada linha = ✓ item');
    html += fld('Texto do botão', 'cta', s.cta, 'text');

  } else if (s.type === 'dynamic') {
    html += fld('Tag da pílula (esq.)', 'tag', s.tag, 'text', 'ex: AQUISIÇÃO');
    html += fld('Badge / Categoria', 'step', s.step, 'text', 'pílula + nº fantasma');
    html += fld('Título', 'headline', s.headline, 'textarea');
    html += fld('Palavra em destaque', 'headlineHighlight', s.headlineHighlight, 'text', 'roxo');
    html += fld('Corpo do texto (esquerda)', 'body', s.body, 'textarea');
    html += funnelEditorHtml(s.funnelItems || []);
  }

  container.innerHTML = html;
}

function funnelEditorHtml(items) {
  var rows = items.map(function (item, i) {
    return (
      '<div class="fi-row" data-fi="' + i + '">' +
        '<input type="text" placeholder="Categoria (ex: ALCANCE)" data-fi-key="cat"   data-fi-idx="' + i + '" value="' + escHtml(item.cat   || '') + '"/>' +
        '<input type="text" placeholder="Label (ex: Tráfego)"     data-fi-key="label" data-fi-idx="' + i + '" value="' + escHtml(item.label || '') + '"/>' +
        '<input type="text" placeholder="Sub (ex: paid + organic)" data-fi-key="sub"   data-fi-idx="' + i + '" value="' + escHtml(item.sub   || '') + '"/>' +
        '<div class="fi-color-row">' +
          '<span class="fi-color-label">Cor do pill:</span>' +
          '<input type="color" data-fi-key="color" data-fi-idx="' + i + '" value="' + escHtml(item.color || '#6B4EFF') + '"/>' +
          '<button type="button" class="fi-del-btn" data-fi-del="' + i + '" aria-label="Remover item">×</button>' +
        '</div>' +
      '</div>'
    );
  }).join('');

  return (
    '<div class="editor-section">' +
      '<div class="field-label">Itens do Funil <span class="badge">lado direito</span></div>' +
      '<div id="funnelItemsEditor">' + rows + '</div>' +
      '<button type="button" class="add-fi-btn" id="addFiBtn">+ Adicionar item ao funil</button>' +
    '</div>'
  );
}

function fld(label, key, val, type, hint) {
  var sv  = escHtml(val || '');
  var sk  = escHtml(key);
  var h   = hint ? '<span class="badge">' + escHtml(hint) + '</span>' : '';
  var inp = type === 'textarea'
    ? '<textarea data-field-key="' + sk + '">' + sv + '</textarea>'
    : '<input type="text" value="' + sv + '" data-field-key="' + sk + '" />';
  return (
    '<div class="editor-section">' +
      '<div class="field-label">' + escHtml(label) + h + '</div>' +
      inp +
    '</div>'
  );
}

function tog(label, key, val) {
  return (
    '<div class="editor-section"><div class="toggle-row">' +
      '<span class="toggle-label">' + escHtml(label) + '</span>' +
      '<label class="toggle">' +
        '<input type="checkbox" data-field-key="' + escHtml(key) + '"' + (val ? ' checked' : '') + ' />' +
        '<span class="toggle-slider"></span>' +
      '</label>' +
    '</div></div>'
  );
}

/* ── Field & type updates ── */
function updateField(key, val) {
  slides[currentSlide][key] = val;
  renderSlidePreview();
  renderSlideList();
}

function updateFunnelItem(idx, key, val) {
  var s = slides[currentSlide];
  if (!s.funnelItems) s.funnelItems = [];
  if (!s.funnelItems[idx]) s.funnelItems[idx] = {};
  s.funnelItems[idx][key] = val;
  renderSlidePreview();
}

function addFunnelItem() {
  var s = slides[currentSlide];
  if (!s.funnelItems) s.funnelItems = [];
  s.funnelItems.push({ cat: 'CATEGORIA', label: 'Novo item', sub: '', color: '#6B4EFF' });
  renderEditor();
  renderSlidePreview();
}

function deleteFunnelItem(idx) {
  var s = slides[currentSlide];
  if (s.funnelItems) s.funnelItems.splice(idx, 1);
  renderEditor();
  renderSlidePreview();
}

function changeType(type) {
  slides[currentSlide].type = type;
  if (type === 'dynamic' && !slides[currentSlide].funnelItems) {
    slides[currentSlide].funnelItems = [
      { cat: 'ETAPA 1', label: 'Primeiro item', sub: 'sub-texto', color: '#6B4EFF' },
      { cat: 'ETAPA 2', label: 'Segundo item',  sub: 'sub-texto', color: '#A58BFF' },
    ];
  }
  renderEditor();
  renderSlidePreview();
  renderSlideList();
}

function changeTheme(theme) {
  slides[currentSlide].theme = theme;
  renderEditor();
  renderSlidePreview();
}

/* ── Slide navigation ── */
function selectSlide(i) {
  currentSlide = i;
  renderSlideList();
  renderSlidePreview();
  renderEditor();
}

function prevSlide() { if (currentSlide > 0) selectSlide(currentSlide - 1); }
function nextSlide() { if (currentSlide < slides.length - 1) selectSlide(currentSlide + 1); }

function addSlide() {
  slides.push({
    type: 'content', theme: 'dark',
    step: 'PASSO 0' + slides.length,
    headline: 'Novo slide',
    headlineHighlight: '',
    body: 'Escreva o conteúdo aqui.',
    brand: 'BESCHEIBEN',
  });
  selectSlide(slides.length - 1);
}

function deleteSlide(i) {
  if (slides.length === 1) return;
  slides.splice(i, 1);
  if (currentSlide >= slides.length) currentSlide = slides.length - 1;
  renderSlideList();
  renderSlidePreview();
  renderEditor();
}

function moveSlide(i, dir) {
  var j = i + dir;
  if (j < 0 || j >= slides.length) return;
  var tmp = slides[i]; slides[i] = slides[j]; slides[j] = tmp;
  if (currentSlide === i)      currentSlide = j;
  else if (currentSlide === j) currentSlide = i;
  renderSlideList();
  renderSlidePreview();
  renderEditor();
}

function setMode(mode) {
  if (!FORMAT[mode]) return;
  currentMode = mode;
  document.querySelectorAll('.tab-btn[data-view]').forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset.view === mode);
  });
  renderSlidePreview();
}

function adjustFontScale(delta) {
  fontScale = Math.min(1.8, Math.max(0.6, Math.round((fontScale + delta) * 10) / 10));
  renderSlidePreview();
}

function resetFontScale() {
  fontScale = 1.0;
  renderSlidePreview();
}
