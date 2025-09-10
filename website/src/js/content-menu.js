import scrollToElement from './scroll-to.js';

document.addEventListener('DOMContentLoaded', () => {
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
        targetBoundaries[targetHash] = { top: element.getBoundingClientRect().top + window.scrollY };
      }
    });
    return targetBoundaries;
  }

  function observeMenu() {
    const scroll = window.scrollY;
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
      e.preventDefault();
      const { hash } = this.dataset;
      const href = this.getAttribute('href');
      const target = document.querySelector(hash);
      if (target) {
        scrollToElement(target, offset);
        globalThis.history.pushState(null, null, href);
      }
    }, false);
  });

  document.addEventListener('scroll', observeMenu);
});
