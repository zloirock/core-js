import '../scss/app.scss';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import plaintext from 'highlight.js/lib/languages/plaintext';
import RunButtonPlugin from './hljs-run.js';

hljs.registerLanguage('js', javascript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('plaintext', plaintext);

// toggles with what each opens, `[element, toggle]`: `aria-expanded` follows the `active` class of the element, and
// Escape closes the panels, which lie over the page with keyboard focus able to move under them; returns the sync
function trackDisclosures(panels, sections) {
  const disclosures = panels.concat(sections);

  function syncExpanded() {
    disclosures.forEach(([element, toggle]) => {
      toggle && toggle.setAttribute('aria-expanded', String(element.classList.contains('active')));
    });
  }

  document.addEventListener('keydown', e => {
    // KeyboardEvent#key is missing in Chrome < 51 and Safari < 10.1
    if (e.keyCode !== 27) return;
    panels.forEach(([panel, toggle]) => {
      if (!toggle || !panel.classList.contains('active')) return;
      panel.classList.remove('active');
      // the panel hides its own links
      if (panel.contains(document.activeElement)) toggle.focus();
    });
    syncExpanded();
  });

  return syncExpanded;
}

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
  const syncExpanded = trackDisclosures([
    [menu, menuSwitcher],
    [contentMenu, contentMenuTrigger],
    [sectionMenu, sectionMenuTrigger],
    ...[...dropdownTriggers].map(trigger => [trigger.parentElement.parentElement, trigger]),
  ], [...collapsibleTrigger].map(trigger => [trigger.parentElement, trigger]));

  function toggleMenu() {
    menu.classList.toggle('active');
    syncExpanded();
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
      syncExpanded();
    });
  });

  dropdownTriggers.forEach(el => {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      this.parentElement.parentElement.classList.toggle('active');
      syncExpanded();
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
      syncExpanded();
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
      // the links of a branch build have no version
      if (!defaultVersion) return;
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
    setTheme(isDark ? 'theme-light' : 'theme-dark');
  });

  function togglePanel(panel, other) {
    panel.classList.toggle('active');
    if (other && panel.classList.contains('active')) other.classList.remove('active');
    syncExpanded();
  }

  contentMenuTrigger && contentMenuTrigger.addEventListener('click', () => togglePanel(contentMenu, sectionMenu));
  sectionMenuTrigger && sectionMenuTrigger.addEventListener('click', () => togglePanel(sectionMenu, contentMenu));

  hljs.addPlugin(new RunButtonPlugin());
  hljs.highlightAll();

  processVersions();
  highlightActiveDocsMenuItem();
  openFirstCollapsibleMenuItem();
  highlightMainMenu();
  syncExpanded();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
