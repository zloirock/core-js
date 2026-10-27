import scrollToElement, { smoothScroll } from './scroll-to.js';

function init() {
  const triggers = document.querySelectorAll('.scroll-to');
  const menuItems = document.querySelectorAll('.toc-link');
  const offset = 10;

  function unactiveAllMenuItems() {
    menuItems.forEach(item => {
      item.classList.remove('active');
    });
  }

  function activateMenu(targetHash) {
    document.querySelector(`a[data-hash="${ targetHash }"]`).parentElement.classList.add('active');
  }

  function getBlocksBoundaries() {
    const targetBoundaries = {};
    triggers.forEach(trigger => {
      const targetHash = trigger.dataset.hash;
      const element = document.querySelector(targetHash);
      if (element) {
        // `scrollY` is missing in IE
        targetBoundaries[targetHash] = { top: element.getBoundingClientRect().top + window.pageYOffset };
      }
    });
    return targetBoundaries;
  }

  function observeMenu() {
    const scroll = window.pageYOffset;
    const targetBoundaries = getBlocksBoundaries();
    for (const [hash, target] of Object.entries(targetBoundaries)) {
      if (target.top > scroll && target.top < scroll + window.innerHeight / 2) {
        unactiveAllMenuItems();
        activateMenu(hash);
        return;
      }
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
}

// the legacy chunks run after DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
