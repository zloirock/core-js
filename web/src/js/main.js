/* eslint-disable import/no-unresolved -- dependencies are not installed */
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
  const menuBackdrop = document.querySelector('.menu > .backdrop');
  const [menu] = document.getElementsByClassName('menu');
  const collapsibleTrigger = document.querySelectorAll('.collapsible > a');
  const dropdownTriggers = document.querySelectorAll('.dropdown .dropdown-wrapper > a');
  const versionsMenu = document.querySelectorAll('.versions-menu');
  const currentVersions = document.querySelectorAll('.versions-menu a.current');
  const dropdownBackdrops = document.querySelectorAll('.dropdown .backdrop');
  const stickyBlocks = document.querySelectorAll('.sticky');
  const themeSwitcher = document.querySelector('.theme-switcher');
  const docsVersionLinks = document.querySelectorAll('.with-docs-version');
  let isDocs, docsVersion;

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

  function addStuck() {
    stickyBlocks.forEach(stickyBlock => {
      stickyBlock.classList.add('stuck');
    });
  }

  function removeStuck() {
    stickyBlocks.forEach(stickyBlock => {
      stickyBlock.classList.remove('stuck');
    });
  }

  function getRelativePath() {
    const path = globalThis.location.pathname;
    const base = document.querySelector('base')?.getAttribute('href') || '';

    return path.replace(base, '');
  }

  function isDocsPage() {
    if (isDocs !== undefined) return isDocs;
    isDocs = getRelativePath().includes('docs/');
    return isDocs;
  }

  function hasDocsVersion() {
    if (docsVersion !== undefined) return docsVersion;
    docsVersion = !getRelativePath().startsWith('docs/');
    return docsVersion;
  }

  function setDefaultVersion() {
    versionsMenu.forEach(menu => {
      const currentVersion = menu.querySelector('a.current');
      currentVersion.innerHTML = `${ currentVersion.innerHTML } (default)`;
      const versionsMenuLinks = menu.querySelectorAll('.dropdown-block a');
      versionsMenuLinks.forEach(link => link.classList.remove('active'));
      versionsMenuLinks[0].classList.add('active');
    });
  }

  function processDocsVersions() {
    const hasVersion = hasDocsVersion();
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

  let stuck = window.scrollY > 170;
  if (stuck) addStuck();
  window.addEventListener('scroll', () => {
    if (!stuck && window.scrollY > 170) {
      stuck = true;
      addStuck();
    }
    if (stuck && window.scrollY <= 170) {
      stuck = false;
      removeStuck();
    }
  });

  themeSwitcher.addEventListener('click', e => {
    e.preventDefault();
    const html = document.querySelector('html');
    const isDark = html.classList.contains('theme-dark');
    // eslint-disable-next-line no-undef, sonarjs/no-reference-error -- global function
    isDark ? setTheme('theme-light') : setTheme('theme-dark');
  });

  hljs.addPlugin(new RunButtonPlugin());
  hljs.highlightAll();

  processDocsVersions();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
