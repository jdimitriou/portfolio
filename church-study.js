(() => {
  const viewerImg = document.getElementById('viewerImg');
  const viewerCaption = document.getElementById('viewerCaption');
  const buttons = document.querySelectorAll('#levelBtns button[data-viewer-src]');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((button) => {
        button.classList.remove('active');
        button.setAttribute('aria-pressed', 'false');
      });

      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      viewerImg.src = btn.dataset.viewerSrc;
      viewerImg.alt = `${btn.textContent.trim()} view of the Sacred / Profane project`;
      viewerCaption.textContent = btn.dataset.viewerCaption || btn.textContent.trim();
    });
  });

  const modal = document.getElementById('image-modal');
  if (!modal) return;

  const modalImg = modal.querySelector('img');
  const closeBtn = modal.querySelector('button');

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    modalImg.removeAttribute('src');
  }

  document.addEventListener('click', (event) => {
    const img = event.target.closest('img.zoomable');
    if (!img) return;

    modalImg.src = img.currentSrc || img.src;
    modalImg.alt = img.alt || 'Expanded project image';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  });

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
})();
