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

document.addEventListener('DOMContentLoaded', function(_event) {
  const menuSwitcher = document.getElementById('menu-switcher');
  const menuBackdrop = document.querySelector(".menu > .backdrop");
  const menu = document.getElementsByClassName('menu')[0];
  const collapsibleTrigger = document.querySelectorAll(".collapsible > a");
  const dropdownTriggers = document.querySelectorAll(".dropdown .dropdown-wrapper > a");
  const currentVersion = document.querySelector('.versions-menu a.current');
  const dropdownBackdrops = document.querySelectorAll('.dropdown .backdrop');
  const stickyBlocks = document.querySelectorAll('.sticky');

  function toggleMenu() {
    menu.classList.toggle('active');
  }

  menuBackdrop.addEventListener('click',function(_e) {
    toggleMenu();
  }, false);

  menuSwitcher.addEventListener('click',function(e){
    e.preventDefault();
    toggleMenu();
  },false);

  collapsibleTrigger.forEach(el => {
    el.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentElement.classList.toggle('active');
    });
  });

  dropdownTriggers.forEach(el => {
    el.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentElement.parentElement.classList.toggle('active');
    })
  })

  currentVersion.addEventListener('click', function(e) {
    e.preventDefault();
  });

  dropdownBackdrops.forEach(el => {
    el.addEventListener('click', function(e) {
      this.parentElement.classList.remove('active');
    })
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

  hljs.addPlugin(new RunButtonPlugin());
  hljs.highlightAll();
});
