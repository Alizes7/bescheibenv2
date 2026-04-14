'use strict';

var DL_SVG =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" ' +
  'aria-hidden="true" focusable="false">' +
  '<path d="M8 2v8M5 7l3 3 3-3M2 12h12"/>' +
  '</svg>';

/**
 * Captures the current slide preview as a PNG (1080×1350) and triggers download.
 * @returns {Promise<void>}
 */
async function downloadCurrent() {
  var el  = document.getElementById('slide-preview');
  var btn = document.getElementById('dlBtn');

  btn.textContent = 'Gerando…';
  btn.disabled = true;

  try {
    var canvas = await html2canvas(el, {
      scale: 2.7,           // 400 × 2.7 = 1080px width, 500 × 2.7 = 1350px height
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#0d0d14',
      logging: false,
    });

    var link = document.createElement('a');
    link.download = 'bescheiben-slide-' + (currentSlide + 1) + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    console.error('[download] html2canvas error:', err);
    alert('Erro ao gerar imagem: ' + err.message);
  }

  btn.innerHTML = DL_SVG + ' Baixar Este Slide';
  btn.disabled = false;
}

/**
 * Downloads every slide sequentially.
 * @returns {Promise<void>}
 */
async function downloadAll() {
  for (var i = 0; i < slides.length; i++) {
    currentSlide = i;
    renderSlidePreview();
    await new Promise(function (resolve) { setTimeout(resolve, 300); });
    await downloadCurrent();
    await new Promise(function (resolve) { setTimeout(resolve, 200); });
  }
}
