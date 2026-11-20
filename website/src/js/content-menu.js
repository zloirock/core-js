import scrollToElement, { smoothScroll } from './scroll-to.js';

function init() {
  const triggers = document.querySelectorAll('.scroll-to');
  const offset = 10;
  let activeItem;

  function observeMenu() {
    let nextItem;
    for (const trigger of triggers) {
      const target = document.querySelector(trigger.dataset.hash);
      if (!target) continue;
      const { top } = target.getBoundingClientRect();
      if (top > window.innerHeight / 2) break;
      nextItem = trigger.parentElement;
      if (top >= 0) break;
    }
    if (nextItem !== activeItem) {
      activeItem?.classList.remove('active');
      nextItem?.classList.add('active');
      activeItem = nextItem;
    }
  }

  triggers.forEach(trigger => {
    trigger.addEventListener('click', function (e) {
      // the scripted scroll is only for smoothness, without it the native jump to the fragment serves
      if (smoothScroll) {
        e.preventDefault();
        const { hash } = this.dataset;
        const href = this.getAttribute('href');
        const target = document.querySelector(hash);
        if (target) {
          // a scripted scroll leaves the keyboard where it was, so the section takes the focus
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
          scrollToElement(target, offset);
          history.pushState(null, null, href);
        }
      }
    }, false);
  });

  document.addEventListener('scroll', observeMenu);
  observeMenu();
}

// the legacy chunks run after DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
