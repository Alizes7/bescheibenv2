'use strict';

/**
 * Selects the slide at index `i` and re-renders all dependent UI.
 * @param {number} i
 */
function selectSlide(i) {
  currentSlide = i;
  renderSlideList();
  renderSlidePreview();
  renderEditor();
}

function prevSlide() {
  if (currentSlide > 0) selectSlide(currentSlide - 1);
}

function nextSlide() {
  if (currentSlide < slides.length - 1) selectSlide(currentSlide + 1);
}

function addSlide() {
  slides.push({
    type: 'content',
    step: 'PASSO 0' + slides.length,
    headline: 'Novo slide',
    headlineHighlight: '',
    body: 'Escreva o conteúdo aqui.',
    brand: 'BESCHEIBEN',
  });
  selectSlide(slides.length - 1);
}

/**
 * Removes the slide at index `i`. Guards against removing the last slide.
 * @param {number} i
 */
function deleteSlide(i) {
  if (slides.length === 1) return;
  slides.splice(i, 1);
  if (currentSlide >= slides.length) {
    currentSlide = slides.length - 1;
  }
  renderSlideList();
  renderSlidePreview();
  renderEditor();
}

/**
 * Moves the slide at index `i` by `dir` positions (+1 down, -1 up).
 * @param {number} i
 * @param {number} dir
 */
function moveSlide(i, dir) {
  var j = i + dir;
  if (j < 0 || j >= slides.length) return;

  var tmp = slides[i];
  slides[i] = slides[j];
  slides[j] = tmp;

  if (currentSlide === i)      currentSlide = j;
  else if (currentSlide === j) currentSlide = i;

  renderSlideList();
  renderSlidePreview();
  renderEditor();
}
