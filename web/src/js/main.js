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
  const menuBackdrop = document.querySelectorAll(".menu .backdrop")[0];
  const menu = document.getElementsByClassName('menu')[0];
  const collapsibleTrigger = document.querySelectorAll(".collapsible > a")

  function toggleMenu() {
    if (menu.classList.contains('active')) {
      menu.classList.remove('active');
    } else {
      menu.classList.add('active');
    }
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
  })

  hljs.highlightAll();
});
