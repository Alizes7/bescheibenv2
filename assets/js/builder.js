'use strict';

/**
 * Escape characters that are unsafe inside HTML attribute values and text nodes.
 * @param {string} s
 * @returns {string}
 */
function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Wraps the first occurrence of `phrase` inside `text` with an <em> tag.
 * Both arguments are treated as plain text (not regex patterns).
 * @param {string} text
 * @param {string} phrase
 * @returns {string}
 */
function highlight(text, phrase) {
  if (!phrase || !text) return escHtml(text || '');
  const safe = escHtml(text);
  const safePhrase = escHtml(phrase);
  return safe.replace(safePhrase, `<em>${safePhrase}</em>`);
}

/**
 * Builds the inner HTML for a slide based on its data object.
 * @param {object} s - slide data
 * @returns {string} HTML string
 */
function buildSlideHtml(s) {
  switch (s.type) {
    case 'cover':
      return buildCover(s);
    case 'content':
      return buildContent(s);
    case 'quote':
      return buildQuote(s);
    case 'cta':
      return buildCta(s);
    default:
      return '<div class="slide-canvas"></div>';
  }
}

/** @private */
function buildCover(s) {
  const ctaPill = s.showCta
    ? `<div class="cta-pill">${escHtml(s.cta || 'Próximo slide')}</div>`
    : '';

  return `
    <div class="slide-canvas slide-cover">
      <div class="noise-overlay" aria-hidden="true"></div>
      <div class="grid-lines"    aria-hidden="true"></div>
      <div class="bg-glow"       aria-hidden="true"></div>
      <div class="bg-glow2"      aria-hidden="true"></div>
      <div class="corner-brand">${escHtml(s.brand || 'BESCHEIBEN')}</div>
      <div class="slide-tag">${escHtml(s.tag || '')}</div>
      <div class="headline">${highlight(s.headline, s.headlineHighlight)}</div>
      <div class="sub">${escHtml(s.sub || '')}</div>
      ${ctaPill}
    </div>`;
}

/** @private */
function buildContent(s) {
  return `
    <div class="slide-canvas slide-content">
      <div class="bg-glow" aria-hidden="true"></div>
      <div class="step-badge">
        <span class="step-num">${escHtml(s.step || '01')}</span>
        <div class="step-line" aria-hidden="true"></div>
      </div>
      <div class="content-headline">${highlight(s.headline, s.headlineHighlight)}</div>
      <div class="content-body">${escHtml(s.body || '')}</div>
      <div class="content-footer">
        <span class="brand-mark">${escHtml(s.brand || 'BESCHEIBEN')}</span>
        <div class="page-dot" aria-hidden="true"></div>
      </div>
    </div>`;
}

/** @private */
function buildQuote(s) {
  return `
    <div class="slide-canvas slide-quote">
      <div class="q-mark" aria-hidden="true">"</div>
      <div class="q-text">${highlight(s.quote, s.quoteHighlight)}</div>
      <div class="q-author">${escHtml(s.author || '')}</div>
    </div>`;
}

/** @private */
function buildCta(s) {
  return `
    <div class="slide-canvas slide-cta">
      <div class="bg-glow"  aria-hidden="true"></div>
      <div class="bg-ring"  aria-hidden="true"></div>
      <div class="bg-ring2" aria-hidden="true"></div>
      <div class="cta-eyebrow">${escHtml(s.eyebrow || '')}</div>
      <div class="cta-headline">${highlight(s.headline, s.headlineHighlight)}</div>
      <div class="cta-body">${escHtml(s.body || '')}</div>
      <div class="cta-btn">
        ${escHtml(s.cta || 'Falar agora')}
        <span aria-hidden="true">${escHtml(s.ctaIcon || '→')}</span>
      </div>
    </div>`;
}
