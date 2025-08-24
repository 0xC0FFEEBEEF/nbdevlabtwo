(() => {
  const modal = document.getElementById('project-modal');
  const body  = document.getElementById('project-modal-body');
  if (!modal || !body) return;

  /** @type {HTMLElement|null} */
  let lastFocus = null;

  /** @param {string} slug */
  function open(slug) {
    /** @type {HTMLTemplateElement|null} */
    const tpl = document.getElementById('tpl-' + slug);
    if (!tpl) return;
    body.innerHTML = '';
    body.appendChild(tpl.content.cloneNode(true));
    lastFocus = /** @type {HTMLElement|null} */ (document.activeElement);
    modal.classList.remove('hidden');
    document.documentElement.style.overflow = 'hidden';
    const btn = modal.querySelector('[data-close]');
    if (btn && 'focus' in btn) btn.focus();
  }

  function close() {
    modal.classList.add('hidden');
    document.documentElement.style.overflow = '';
    body.innerHTML = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  // Delegate clicks (works for all cards)
  document.addEventListener('click', (e) => {
    const target = /** @type {Element|null} */(e.target instanceof Element ? e.target : null);
    if (!target) return;

    const opener = target.closest('.card-btn');
    if (opener) {
      e.preventDefault();
      const slug = opener.getAttribute('data-slug');
      if (slug) open(slug);
      return;
    }

    if (target.closest('[data-close]')) {
      e.preventDefault();
      close();
    }
  });

  // ESC to close
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      e.preventDefault();
      close();
    }
  });
})();
