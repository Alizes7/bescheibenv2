'use strict';

// ── HELPERS ───────────────────────────────────────────

function escHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function highlight(text, phrase) {
  if (!phrase || !text) return escHtml(text || '');
  var safe = escHtml(text);
  var sp   = escHtml(phrase);
  return safe.replace(sp, '<em>' + sp + '</em>');
}

function pad2(n) { return String(n).padStart(2, '0'); }

function slideCounter(idx, total) {
  return '<div class="dk-counter">' + pad2(idx + 1) + ' <span>/</span> ' + pad2(total) + '</div>';
}

// Swipe cue shown on cover slides
function swipeCue(text) {
  return (
    '<div class="dk-swipe-cue">' +
      '<span class="dk-swipe-label">' + escHtml(text || 'DESLIZE PARA VER') + '</span>' +
      '<div class="dk-swipe-dots">' +
        '<span class="dk-dot dk-dot--active"></span>' +
        '<span class="dk-dot"></span>' +
        '<span class="dk-dot"></span>' +
        '<span class="dk-dot"></span>' +
      '</div>' +
    '</div>'
  );
}

// Arrow button shown on content/quote/cta slides
function nextArrow() {
  return (
    '<div class="dk-next-arrow" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
        '<path d="M9 18l6-6-6-6"/>' +
      '</svg>' +
    '</div>'
  );
}

// Bescheiben brand in top-left
function brandBadge(dark) {
  return (
    '<div class="dk-brand ' + (dark ? 'dk-brand--on-dark' : 'dk-brand--on-dark') + '">' +
      '<div class="dk-brand-dot" aria-hidden="true"></div>' +
      '<span class="dk-brand-name">BESCHEIBEN</span>' +
    '</div>'
  );
}

// Instagram engagement CTA strip (save, comment, follow)
function igStrip(actions) {
  var items = (actions || ['💾 Salve', '💬 Comente', '👆 Siga']).map(function (a) {
    return '<div class="dk-ig-item">' + a + '</div>';
  }).join('');
  return '<div class="dk-ig-strip">' + items + '</div>';
}

// ── MAIN BUILDER ──────────────────────────────────────

function buildSlideHtml(s, idx, total) {
  switch (s.type) {
    case 'cover':   return buildCover(s, idx, total);
    case 'content': return buildContent(s, idx, total);
    case 'quote':   return buildQuote(s, idx, total);
    case 'cta':     return buildCta(s, idx, total);
    default:        return '<div class="slide-canvas dk-base"></div>';
  }
}

// ── COVER ─────────────────────────────────────────────
// Dark bg · large headline · swipe cue · glow
function buildCover(s, idx, total) {
  return (
    '<div class="slide-canvas dk-base dk-cover">' +
      '<div class="dk-glow dk-glow--tr" aria-hidden="true"></div>' +
      '<div class="dk-glow dk-glow--bl" aria-hidden="true"></div>' +
      '<div class="dk-grid-lines" aria-hidden="true"></div>' +

      /* top bar */
      '<div class="dk-topbar">' +
        brandBadge() +
        slideCounter(idx, total) +
      '</div>' +

      /* main */
      '<div class="dk-cover-body">' +
        '<div class="dk-tag">' + escHtml(s.tag || 'BESCHEIBEN') + '</div>' +
        '<h1 class="dk-cover-headline">' + highlight(s.headline, s.headlineHighlight) + '</h1>' +
        (s.sub ? '<p class="dk-cover-sub">' + escHtml(s.sub) + '</p>' : '') +
      '</div>' +

      /* bottom */
      '<div class="dk-cover-bottom">' +
        (s.showCta ? swipeCue(s.cta) : '') +
      '</div>' +

    '</div>'
  );
}

// ── CONTENT ───────────────────────────────────────────
// Dark bg · ghost number · step badge · body text · next arrow
function buildContent(s, idx, total) {
  var gn = String(s.step || '').match(/\d+/);
  var ghost = gn ? gn[0].padStart(2, '0') : pad2(idx + 1);

  return (
    '<div class="slide-canvas dk-base dk-content">' +
      '<div class="dk-ghost-num" aria-hidden="true">' + ghost + '</div>' +
      '<div class="dk-glow dk-glow--br" aria-hidden="true"></div>' +

      /* top bar */
      '<div class="dk-topbar">' +
        brandBadge() +
        slideCounter(idx, total) +
      '</div>' +

      /* body */
      '<div class="dk-content-body">' +
        '<div class="dk-step-row">' +
          '<div class="dk-step-badge">' + escHtml(s.step || 'CONTEÚDO') + '</div>' +
          '<div class="dk-step-line" aria-hidden="true"></div>' +
        '</div>' +
        '<h2 class="dk-content-headline">' + highlight(s.headline, s.headlineHighlight) + '</h2>' +
        '<p class="dk-content-text">' + escHtml(s.body || '') + '</p>' +
      '</div>' +

      /* footer */
      '<div class="dk-footer">' +
        '<div class="dk-footer-brand">@bescheiben</div>' +
        nextArrow() +
      '</div>' +

    '</div>'
  );
}

// ── QUOTE ─────────────────────────────────────────────
// Dark bg · pre-text above line · bold statement · vertical accent
function buildQuote(s, idx, total) {
  return (
    '<div class="slide-canvas dk-base dk-quote">' +
      '<div class="dk-glow dk-glow--center" aria-hidden="true"></div>' +

      /* top bar */
      '<div class="dk-topbar">' +
        brandBadge() +
        slideCounter(idx, total) +
      '</div>' +

      /* body */
      '<div class="dk-quote-body">' +
        '<div class="dk-quote-tag">' + escHtml(s.quoteTag || 'INSIGHT') + '</div>' +
        (s.quote
          ? '<p class="dk-quote-pre">' + escHtml(s.quote) + '</p>' +
            '<div class="dk-quote-sep" aria-hidden="true"></div>'
          : '') +
        '<div class="dk-quote-main-wrap">' +
          '<div class="dk-quote-bar" aria-hidden="true"></div>' +
          '<h2 class="dk-quote-main">' + highlight(s.author || '', s.quoteHighlight) + '</h2>' +
        '</div>' +
      '</div>' +

      /* footer */
      '<div class="dk-footer">' +
        '<div class="dk-footer-brand">@bescheiben</div>' +
        nextArrow() +
      '</div>' +

    '</div>'
  );
}

// ── CTA ───────────────────────────────────────────────
// Dark bg · headline · full-width button · checklist · IG strip
function buildCta(s, idx, total) {
  var lines = (s.body || '').split('\n').filter(Boolean);
  var checks = lines.map(function (l) {
    return (
      '<div class="dk-check-row">' +
        '<div class="dk-check-icon" aria-hidden="true">' +
          '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">' +
            '<polyline points="3 8 6.5 11.5 13 5"/>' +
          '</svg>' +
        '</div>' +
        '<span>' + escHtml(l) + '</span>' +
      '</div>'
    );
  }).join('');

  return (
    '<div class="slide-canvas dk-base dk-cta">' +
      '<div class="dk-glow dk-glow--tr" aria-hidden="true"></div>' +
      '<div class="dk-glow dk-glow--bl-sm" aria-hidden="true"></div>' +

      /* top bar */
      '<div class="dk-topbar">' +
        brandBadge() +
        slideCounter(idx, total) +
      '</div>' +

      /* body */
      '<div class="dk-cta-body">' +
        '<div class="dk-cta-tag">' + escHtml(s.eyebrow || 'PRÓXIMO PASSO') + '</div>' +
        '<h2 class="dk-cta-headline">' + highlight(s.headline, s.headlineHighlight) + '</h2>' +
        '<div class="dk-cta-btn">' +
          escHtml(s.cta || 'Falar com a Bescheiben') +
          '<svg class="dk-btn-arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">' +
            '<path d="M4 10h12M11 5l5 5-5 5"/>' +
          '</svg>' +
        '</div>' +
        (checks ? '<div class="dk-checks">' + checks + '</div>' : '') +
      '</div>' +

      /* IG engagement strip */
      igStrip(['💾 Salve esse post', '💬 Comente CRESCER', '👆 Siga @bescheiben']) +

    '</div>'
  );
}
