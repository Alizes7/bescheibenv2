'use strict';

// ── SLIDE DATA ────────────────────────────────────────

/** @type {Array<object>} */
const slides = [
  {
    type: 'cover',
    tag: 'MARKETING DIGITAL',
    headline: 'Sua marca merece ser lembrada.',
    headlineHighlight: 'lembrada.',
    sub: 'Descubra como transformamos presença digital em resultados concretos para negócios B2B.',
    cta: 'Arraste e veja',
    showCta: true,
    brand: 'BESCHEIBEN',
  },
  {
    type: 'content',
    step: 'PASSO 01',
    headline: 'O problema que ninguém fala',
    headlineHighlight: 'ninguém fala',
    body: 'A maioria das empresas B2B investe em produto, mas esquece de investir em como esse produto é percebido. Branding não é luxo — é sobrevivência no mercado digital.',
    brand: 'BESCHEIBEN',
  },
  {
    type: 'content',
    step: 'PASSO 02',
    headline: 'Presença que converte',
    headlineHighlight: 'converte',
    body: 'Uma estratégia bem posicionada no Instagram gera leads qualificados, fortalece autoridade e reduz o ciclo de vendas. Isso é o que a Bescheiben entrega.',
    brand: 'BESCHEIBEN',
  },
  {
    type: 'quote',
    quote: 'Empresas que dominam o digital hoje colhem os contratos de amanhã.',
    quoteHighlight: 'contratos de amanhã.',
    author: 'Bescheiben Digital Agency',
  },
  {
    type: 'cta',
    eyebrow: 'VAMOS CONSTRUIR JUNTOS',
    headline: 'Pronto para crescer?',
    headlineHighlight: 'crescer?',
    body: 'Fale com nosso time e descubra como a Bescheiben pode transformar sua presença digital.',
    cta: 'Falar com especialista',
    ctaIcon: '→',
  },
];

/** Index of the currently active slide. */
let currentSlide = 0;

/**
 * Current post format.
 * 'carousel' → 1080×1350 (4:5)
 * 'story'    → 1080×1920 (9:16)
 */
let currentMode = 'carousel';

/**
 * Font scale multiplier applied to all slide text.
 * Default 1.0. Steps of 0.1 via + / − buttons.
 * Clamped to [0.6 … 1.8].
 */
let fontScale = 1.0;

// ── FORMAT CONFIGS ────────────────────────────────────

/**
 * Preview pixel dimensions and html2canvas export scale per mode.
 * Preview width × exportScale ≈ target export width.
 */
const FORMAT = {
  carousel: {
    previewW: 400,
    previewH: 500,
    exportScale: 2.7,   // 400 × 2.7 = 1080px,  500 × 2.7 = 1350px
    label: '1080 × 1350 · Carrossel 4:5',
    downloadSuffix: 'carousel',
  },
  story: {
    previewW: 281,
    previewH: 500,
    exportScale: 3.84,  // 281 × 3.84 ≈ 1080px,  500 × 3.84 = 1920px
    label: '1080 × 1920 · Story 9:16',
    downloadSuffix: 'story',
  },
};
