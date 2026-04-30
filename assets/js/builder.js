'use strict';

/* ═══════════════════════════════════════════════════════════════
   builder.js — slide HTML generation
   Font: Space Grotesk · Brand: #6B4EFF / #A58BFF
   ═══════════════════════════════════════════════════════════════ */

/* ── Helpers ── */
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

/* ── Sub-components ── */
function brandBadge() {
  /* Text-only logo as per brand manual — no icon pixel */
  return (
    '<div class="dk-brand">' +
      '<div class="dk-brand-name">Bescheiben</div>' +
      '<div class="dk-brand-sub">DIGITAL AGENCY</div>' +
    '</div>'
  );
}

function slideCounter(idx, total) {
  return (
    '<div class="dk-counter">' +
      pad2(idx + 1) + ' <span>/</span> ' + pad2(total) +
    '</div>'
  );
}

function progressBar(idx, total) {
  var pct = Math.round(((idx + 1) / total) * 100);
  return (
    '<div class="dk-progress-bar">' +
      '<div class="dk-progress-fill" style="width:' + pct + '%"></div>' +
    '</div>'
  );
}

function nextArrow() {
  return (
    '<div class="dk-next-arrow" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
        '<path d="M9 18l6-6-6-6"/>' +
      '</svg>' +
    '</div>'
  );
}

function swipeCue(text, total) {
  var n = total || 5;
  var dots = '';
  for (var i = 0; i < n; i++) {
    dots += '<span class="dk-nav-dot' + (i === 0 ? ' dk-nav-dot--active' : '') + '"></span>';
  }
  return (
    '<div class="dk-swipe-cue">' +
      '<span class="dk-swipe-label">' +
        escHtml(text || 'DESLIZE') +
        ' <span class="dk-swipe-arrow">→</span>' +
      '</span>' +
    '</div>' +
    '<div class="dk-nav-dots">' + dots + '</div>'
  );
}

function navDotsRight(idx, total) {
  var dots = '';
  for (var i = 0; i < total; i++) {
    dots += '<span class="dk-nav-dot' + (i === idx ? ' dk-nav-dot--active' : '') + '"></span>';
  }
  return '<div class="dk-nav-dots">' + dots + '</div>';
}

function igStrip() {
  return (
    '<div class="dk-ig-strip">' +
      '<div class="dk-ig-item">💾 Salve esse post</div>' +
      '<div class="dk-ig-item">💬 Comente CRESCER</div>' +
      '<div class="dk-ig-item">👆 Siga @bescheiben</div>' +
    '</div>'
  );
}

function getThemeClass(s) {
  if (s.theme === 'purple') return ' dk-theme-purple';
  if (s.theme === 'white')  return ' dk-theme-white';
  return '';
}

/* ══════════════════════════════════════════════════════════════
   SLIDE TYPE BUILDERS
══════════════════════════════════════════════════════════════ */

/* ── COVER ── */
function buildCover(s, idx, total) {
  var tc = getThemeClass(s);
  return (
    '<div class="slide-canvas dk-base dk-cover' + tc + '">' +
      '<div class="dk-glow dk-glow--tr" aria-hidden="true"></div>' +
      '<div class="dk-glow dk-glow--bl" aria-hidden="true"></div>' +
      '<div class="dk-grid-lines" aria-hidden="true"></div>' +

      /* top bar */
      '<div class="dk-topbar">' +
        brandBadge() +
        slideCounter(idx, total) +
      '</div>' +

      /* main content */
      '<div class="dk-cover-body">' +
        '<div class="dk-tag">' + escHtml(s.tag || 'BESCHEIBEN') + '</div>' +
        '<h1 class="dk-cover-headline">' + highlight(s.headline, s.headlineHighlight) + '</h1>' +
        (s.sub ? '<p class="dk-cover-sub">' + escHtml(s.sub) + '</p>' : '') +
      '</div>' +

      /* bottom bar — swipe left, nav dots right */
      '<div class="dk-cover-bottom">' +
        (s.showCta ? swipeCue(s.cta, total) : navDotsRight(idx, total)) +
      '</div>' +
    '</div>'
  );
}

/* ── CONTENT ── */
function buildContent(s, idx, total) {
  var tc = getThemeClass(s);
  var gn    = String(s.step || '').match(/\d+/);
  var ghost = gn ? gn[0].padStart(2, '0') : pad2(idx + 1);
  return (
    '<div class="slide-canvas dk-base dk-content' + tc + '">' +
      '<div class="dk-ghost-num" aria-hidden="true">' + ghost + '</div>' +
      '<div class="dk-glow dk-glow--br" aria-hidden="true"></div>' +

      '<div class="dk-topbar">' +
        brandBadge() +
        slideCounter(idx, total) +
      '</div>' +

      '<div class="dk-content-body">' +
        '<div class="dk-step-row">' +
          '<div class="dk-step-badge">' + escHtml(s.step || 'CONTEÚDO') + '</div>' +
          '<div class="dk-step-line" aria-hidden="true"></div>' +
        '</div>' +
        '<h2 class="dk-content-headline">' + highlight(s.headline, s.headlineHighlight) + '</h2>' +
        '<p class="dk-content-text">' + escHtml(s.body || '') + '</p>' +
      '</div>' +

      '<div class="dk-footer">' +
        '<div class="dk-footer-brand">@bescheiben</div>' +
        progressBar(idx, total) +
        nextArrow() +
      '</div>' +
    '</div>'
  );
}

/* ── QUOTE ── */
function buildQuote(s, idx, total) {
  var tc = getThemeClass(s);
  return (
    '<div class="slide-canvas dk-base dk-quote' + tc + '">' +
      '<div class="dk-glow dk-glow--center" aria-hidden="true"></div>' +

      '<div class="dk-topbar">' +
        brandBadge() +
        slideCounter(idx, total) +
      '</div>' +

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

      '<div class="dk-footer">' +
        '<div class="dk-footer-brand">@bescheiben</div>' +
        progressBar(idx, total) +
        nextArrow() +
      '</div>' +
    '</div>'
  );
}

/* ── CTA ── */
function buildCta(s, idx, total) {
  var tc    = getThemeClass(s);
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
    '<div class="slide-canvas dk-base dk-cta' + tc + '">' +
      '<div class="dk-glow dk-glow--tr" aria-hidden="true"></div>' +
      '<div class="dk-glow dk-glow--bl-sm" aria-hidden="true"></div>' +

      '<div class="dk-topbar">' +
        brandBadge() +
        slideCounter(idx, total) +
      '</div>' +

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

      igStrip() +
    '</div>'
  );
}

/* ── DYNAMIC (funnel split) ── */
function buildDynamic(s, idx, total) {
  var tc    = getThemeClass(s);
  var items = s.funnelItems || [];
  var gn    = String(s.step || '').match(/\d+/);
  var ghost = gn ? gn[0].padStart(2, '0') : pad2(idx + 1);

  var funnelHtml = items.map(function (item, i) {
    var isLast = i === items.length - 1;
    return (
      '<div class="dk-fi-entry">' +
        '<div class="dk-fi-cat">' + escHtml(item.cat || '') + '</div>' +
        '<div class="dk-fi-pill-row">' +
          '<div class="dk-fi-pill" style="background:' + escHtml(item.color || '#6B4EFF') + '">' +
            escHtml(item.label || '') +
          '</div>' +
          (item.sub
            ? '<div class="dk-fi-sub-pill">' + escHtml(item.sub) + '</div>'
            : '') +
        '</div>' +
        (!isLast ? '<div class="dk-fi-connector"></div>' : '') +
      '</div>'
    );
  }).join('');

  return (
    '<div class="slide-canvas dk-base dk-dynamic' + tc + '">' +
      '<div class="dk-ghost-num" aria-hidden="true">' + ghost + '</div>' +
      '<div class="dk-glow dk-glow--tr" aria-hidden="true"></div>' +
      '<div class="dk-glow dk-glow--bl" aria-hidden="true"></div>' +

      '<div class="dk-topbar">' +
        brandBadge() +
        slideCounter(idx, total) +
      '</div>' +

      /* vertical divider */
      '<div class="dk-dyn-divider" aria-hidden="true"></div>' +

      /* left — text content */
      '<div class="dk-dyn-left">' +
        '<div class="dk-tag">' + escHtml(s.tag || '') + '</div>' +
        '<div class="dk-step-row">' +
          '<div class="dk-step-badge">' + escHtml(s.step || 'CONTEÚDO') + '</div>' +
          '<div class="dk-step-line" aria-hidden="true"></div>' +
        '</div>' +
        '<h2 class="dk-content-headline">' + highlight(s.headline, s.headlineHighlight) + '</h2>' +
        '<p class="dk-content-text">' + escHtml(s.body || '') + '</p>' +
      '</div>' +

      /* right — funnel pills */
      '<div class="dk-dyn-right">' +
        '<div class="dk-fi-wrap">' + funnelHtml + '</div>' +
      '</div>' +

      '<div class="dk-footer">' +
        '<div class="dk-footer-brand">@bescheiben</div>' +
        progressBar(idx, total) +
        nextArrow() +
      '</div>' +
    '</div>'
  );
}

/* ── ROUTER ── */
function buildSlideHtml(s, idx, total) {
  switch (s.type) {
    case 'cover':   return buildCover(s, idx, total);
    case 'content': return buildContent(s, idx, total);
    case 'quote':   return buildQuote(s, idx, total);
    case 'cta':     return buildCta(s, idx, total);
    case 'dynamic': return buildDynamic(s, idx, total);
    default:        return '<div class="slide-canvas dk-base"></div>';
  }
}
