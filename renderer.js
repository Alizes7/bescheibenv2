'use strict';

function renderSlideList() {
  const list = document.getElementById('slideList');
  list.innerHTML = '';
  slides.forEach(function (s, i) {
    const li = document.createElement('li');
    li.className = 'slide-item' + (i === currentSlide ? ' active' : '');
    li.setAttribute('data-slide-idx', i);
    li.setAttribute('tabindex', '0');
    li.setAttribute('role', 'button');
    li.setAttribute('aria-label', 'Slide ' + (i + 1) + ': ' + getSlideLabel(s));
    li.setAttribute('aria-pressed', String(i === currentSlide));
    li.innerHTML =
      '<div class="slide-item-header">' +
        '<div>' +
          '<div class="slide-num">SLIDE ' + String(i + 1).padStart(2, '0') + '</div>' +
          '<div class="slide-label">' + escHtml(getSlideLabel(s)) + '</div>' +
        '</div>' +
        '<div class="slide-actions">' +
          '<button class="icon-btn" type="button" data-action="move-up" aria-label="Mover para cima">↑</button>' +
          '<button class="icon-btn" type="button" data-action="move-down" aria-label="Mover para baixo">↓</button>' +
          '<button class="icon-btn del" type="button" data-action="delete" aria-label="Remover">×</button>' +
        '</div>' +
      '</div>';
    list.appendChild(li);
  });
  document.getElementById('navIndicator').textContent = (currentSlide + 1) + ' / ' + slides.length;
}

function getSlideLabel(s) {
  switch (s.type) {
    case 'cover':   return (s.headline || 'Cover').slice(0, 30);
    case 'content': return (s.step || '') + ': ' + (s.headline || '').slice(0, 20);
    case 'quote':   return (s.author || s.quote || 'Insight').slice(0, 28) + '…';
    case 'cta':     return s.headline || 'CTA';
    default:        return 'Slide';
  }
}

function renderSlidePreview() {
  const el  = document.getElementById('slide-preview');
  const fmt = FORMAT[currentMode];
  el.style.width  = fmt.previewW + 'px';
  el.style.height = fmt.previewH + 'px';
  el.style.setProperty('--font-scale', String(fontScale));
  el.innerHTML = buildSlideHtml(slides[currentSlide], currentSlide, slides.length);
  const badge = document.getElementById('formatBadge');
  if (badge) badge.textContent = fmt.label;
  const fsd = document.getElementById('fontScaleDisplay');
  if (fsd) fsd.textContent = Math.round(fontScale * 100) + '%';
}

function renderEditor() {
  const s = slides[currentSlide];
  const container = document.getElementById('editorFields');
  const ICONS  = { cover: '🖼️', content: '📄', quote: '💬', cta: '🎯' };
  const LABELS = { cover: 'Cover', content: 'Conteúdo', quote: 'Insight', cta: 'CTA' };

  const typeOpts = ['cover', 'content', 'quote', 'cta'].map(function (t) {
    return (
      '<div class="type-opt' + (s.type === t ? ' selected' : '') + '" ' +
        'data-type-opt="' + t + '" role="radio" ' +
        'aria-checked="' + (s.type === t) + '" ' +
        'tabindex="' + (s.type === t ? '0' : '-1') + '">' +
        '<span class="type-icon" aria-hidden="true">' + ICONS[t] + '</span>' + LABELS[t] +
      '</div>'
    );
  }).join('');

  let html =
    '<div class="editor-section">' +
      '<div class="field-label" id="type-label">Tipo de Slide</div>' +
      '<div class="type-grid" role="radiogroup" aria-labelledby="type-label">' + typeOpts + '</div>' +
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
  }

  container.innerHTML = html;
}

function fld(label, key, val, type, hint) {
  const sv = escHtml(val || '');
  const sk = escHtml(key);
  const h  = hint ? '<span class="badge">' + escHtml(hint) + '</span>' : '';
  const inp = type === 'textarea'
    ? '<textarea data-field-key="' + sk + '">' + sv + '</textarea>'
    : '<input type="text" value="' + sv + '" data-field-key="' + sk + '" />';
  return '<div class="editor-section"><div class="field-label">' + escHtml(label) + h + '</div>' + inp + '</div>';
}

function tog(label, key, val) {
  return (
    '<div class="editor-section"><div class="toggle-row">' +
      '<span class="toggle-label">' + escHtml(label) + '</span>' +
      '<label class="toggle"><input type="checkbox" data-field-key="' + escHtml(key) + '"' + (val ? ' checked' : '') + ' />' +
      '<span class="toggle-slider"></span></label>' +
    '</div></div>'
  );
}

function updateField(key, val) {
  slides[currentSlide][key] = val;
  renderSlidePreview();
  renderSlideList();
}

function changeType(type) {
  slides[currentSlide].type = type;
  renderEditor();
  renderSlidePreview();
  renderSlideList();
}

function adjustFontScale(delta) {
  fontScale = Math.min(1.8, Math.max(0.6, Math.round((fontScale + delta) * 10) / 10));
  renderSlidePreview();
}

function resetFontScale() {
  fontScale = 1.0;
  renderSlidePreview();
}
