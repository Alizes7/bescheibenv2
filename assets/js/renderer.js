'use strict';

/* ═══════════════════════════════════════════════════════════════
   renderer.js — PNG download via html2canvas
   ═══════════════════════════════════════════════════════════════ */

var DL_SVG =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" ' +
  'aria-hidden="true" focusable="false">' +
  '<path d="M8 2v8M5 7l3 3 3-3M2 12h12"/>' +
  '</svg>';

async function downloadCurrent() {
  var el  = document.getElementById('slide-preview');
  var btn = document.getElementById('dlBtn');
  btn.textContent = 'Gerando…';
  btn.disabled = true;

  try {
    var scale = FORMAT[currentMode].exportScale;
    var canvas = await html2canvas(el, {
      scale:           scale,
      useCORS:         true,
      allowTaint:      true,
      backgroundColor: '#0c0a1e',
      logging:         false,
    });
    var link = document.createElement('a');
    link.download = 'bescheiben-slide-' + (currentSlide + 1) + '-' + currentMode + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    console.error('[download]', err);
    alert('Erro ao gerar imagem: ' + err.message);
  }

  btn.innerHTML = DL_SVG + ' Baixar Este Slide';
  btn.disabled = false;
}

async function downloadAll() {
  for (var i = 0; i < slides.length; i++) {
    currentSlide = i;
    renderSlidePreview();
    await new Promise(function (r) { setTimeout(r, 280); });
    await downloadCurrent();
    await new Promise(function (r) { setTimeout(r, 150); });
  }
}
