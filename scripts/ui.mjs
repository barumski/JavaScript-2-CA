document.addEventListener('DOMContentLoaded', () => {
  const toTopBtn =
    document.getElementById('toTopBtn') ||
    document.querySelector('.to-top');

  if (!toTopBtn) {
    console.warn('No to-top button found in the document (#toTopBtn / .to-top)');
    return;
  }

  const footer = document.querySelector('footer');
  const baseBottom = 30;
  
  const onScroll = () => {
    const scrolled = window.scrollY || document.documentElement.scrollTop;

    if (scrolled > 300) {
      toTopBtn.classList.add('show');
    } else {
      toTopBtn.classList.remove('show');
    }

    if (footer) {
      const windowHeight = window.innerHeight;
      const footerRect = footer.getBoundingClientRect();
      const overlap = windowHeight - footerRect.top;

      if (overlap > 0) {
        toTopBtn.style.bottom = `${overlap + baseBottom}px`;
      } else {
        toTopBtn.style.bottom = `${baseBottom}px`;
      }
    }
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  toTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});














