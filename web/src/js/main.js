import '../scss/app.scss';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';

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
  const dropdownBackdrop = document.querySelector('.dropdown .backdrop');

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

  dropdownBackdrop.addEventListener('click', function(e) {
    this.parentElement.classList.remove('active');
  })

  hljs.highlightAll();
});
