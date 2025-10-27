import '../scss/app.scss';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import RunButtonPlugin from './hljs-run.js';

hljs.registerLanguage('js', javascript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('sh', bash);

let initialized = false;
function init() {
  if (initialized) return;
  initialized = true;
  const menuSwitcher = document.getElementById('menu-switcher');
  const menuBackdrop = document.querySelector('#menu > .backdrop');
  const menu = document.querySelector('#menu');
  const collapsibleTrigger = document.querySelectorAll('.collapsible > a');
  const dropdownTriggers = document.querySelectorAll('.dropdown .dropdown-wrapper > a');
  const versionsMenu = document.querySelectorAll('.versions-menu');
  const currentVersions = document.querySelectorAll('.versions-menu a.current');
  const dropdownBackdrops = document.querySelectorAll('.dropdown .backdrop');
  const themeSwitcher = document.querySelector('.theme-switcher');
  const docsVersionLinks = document.querySelectorAll('.with-docs-version');
  const docsMenuItems = document.querySelectorAll('.docs-menu li > a');
  const docsCollapsibleMenuItems = document.querySelectorAll('.docs-menu .docs-links ul > li.collapsible');
  const contentMenu = document.querySelector('.table-of-contents');
  const contentMenuTrigger = document.querySelector('.table-of-contents .mobile-trigger');
  const sectionMenu = document.querySelector('.docs-menu');
  const sectionMenuTrigger = document.querySelector('.docs-menu .mobile-trigger');
  const mainMenuItems = document.querySelectorAll('.menu-item.highlightable > a');
  let isDocs, docsVersion;
  const currentPath = getRelativePath();

  function toggleMenu() {
    menu.classList.toggle('active');
  }

  menuBackdrop.addEventListener('click', () => {
    toggleMenu();
  }, false);

  menuSwitcher.addEventListener('click', e => {
    e.preventDefault();
    toggleMenu();
  }, false);

  collapsibleTrigger.forEach(el => {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      this.parentElement.classList.toggle('active');
    });
  });

  dropdownTriggers.forEach(el => {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      this.parentElement.parentElement.classList.toggle('active');
    });
  });

  currentVersions.length && currentVersions.forEach(version => {
    version.addEventListener('click', e => {
      e.preventDefault();
    });
  });

  dropdownBackdrops.forEach(el => {
    el.addEventListener('click', function () {
      this.parentElement.classList.remove('active');
    });
  });

  function getRelativePath() {
    const path = location.pathname;
    const base = document.querySelector('base')?.getAttribute('href') || '';

    return path.replace(base, '');
  }

  function isDocsPage() {
    if (isDocs !== undefined) return isDocs;
    isDocs = currentPath.startsWith('docs/') || currentPath.includes('/docs/');
    return isDocs;
  }

  function hasCurrentVersion() {
    if (docsVersion !== undefined) return docsVersion;
    docsVersion = !currentPath.startsWith('docs/') && !currentPath.startsWith('playground');
    return docsVersion;
  }

  function setDefaultVersion() {
    versionsMenu.forEach(menuItem => {
      const currentVersion = menuItem.querySelector('a.current');
      currentVersion.innerHTML = `${ currentVersion.innerHTML } (default)`;
      const versionsMenuLinks = menuItem.querySelectorAll('.dropdown-block a');
      versionsMenuLinks.forEach(link => link.classList.remove('active'));
      versionsMenuLinks[0].classList.add('active');
    });
  }

  function processVersions() {
    const hasVersion = hasCurrentVersion();
    if (!hasVersion) setDefaultVersion();
    if (!isDocsPage()) return;
    if (hasVersion) return;

    docsVersionLinks.forEach(link => {
      const defaultVersion = link.getAttribute('data-default-version');
      const re = new RegExp(`${ defaultVersion }/`);
      const newLink = link.getAttribute('href').replace(re, '');
      link.setAttribute('href', newLink);
    });
  }

  function setActiveDocsMenuItem(item) {
    item.classList.add('active');
    let parent = item.parentElement;
    while (parent && !parent.classList.contains('docs-menu')) {
      if (parent.tagName === 'LI' && parent.classList.contains('collapsible')) {
        parent.classList.add('active');
      }
      parent = parent.parentElement;
    }
  }

  function highlightActiveDocsMenuItem() {
    if (!isDocsPage()) return;

    let found = false;
    for (const link of docsMenuItems) {
      const href = link.getAttribute('href');
      if (href && href === currentPath) {
        setActiveDocsMenuItem(link);
        found = true;
        break;
      }
    }

    !found && setActiveDocsMenuItem(docsMenuItems[0]);
  }

  function openFirstCollapsibleMenuItem() {
    if (!isDocsPage()) return;
    docsCollapsibleMenuItems[0].classList.add('active');
  }

  function highlightMainMenu() {
    const path = getRelativePath();
    for (const item of mainMenuItems) {
      const href = item.getAttribute('href').replace('./', '');
      if (path.includes(href)) {
        item.classList.add('active');
        return;
      }
    }
  }

  themeSwitcher.addEventListener('click', e => {
    e.preventDefault();
    const html = document.querySelector('html');
    const isDark = html.classList.contains('theme-dark');
    // eslint-disable-next-line no-undef, sonarjs/no-reference-error -- global function
    isDark ? setTheme('theme-light') : setTheme('theme-dark');
  });

  contentMenuTrigger && contentMenuTrigger.addEventListener('click', e => {
    e.preventDefault();
    contentMenu.classList.toggle('active');
    if (contentMenu.classList.contains('active') && sectionMenu && sectionMenu.classList.contains('active')) {
      sectionMenu.classList.remove('active');
    }
  });

  sectionMenuTrigger && sectionMenuTrigger.addEventListener('click', e => {
    e.preventDefault();
    sectionMenu.classList.toggle('active');
    if (sectionMenu.classList.contains('active') && contentMenu && contentMenu.classList.contains('active')) {
      contentMenu.classList.remove('active');
    }
  });

  hljs.addPlugin(new RunButtonPlugin());
  hljs.highlightAll();

  processVersions();
  highlightActiveDocsMenuItem();
  openFirstCollapsibleMenuItem();
  highlightMainMenu();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
