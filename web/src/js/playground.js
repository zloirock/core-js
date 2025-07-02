import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';

hljs.registerLanguage('javascript', javascript);

const codeInput = document.querySelector('#code-input');
const codeOutput = document.querySelector('#code-output');
const runButton = document.querySelector('.run-button');
const resultBlock = document.querySelector('.result');

codeOutput.textContent = codeInput.value;
hljs.highlightElement(codeOutput);

codeInput.addEventListener('input', () => {
  codeOutput.removeAttribute('data-highlighted');
  let val = codeInput.value;
  if (val[val.length - 1] === "\n") val += ' ';
  codeOutput.textContent = val;
  hljs.highlightElement(codeOutput);
});

codeInput.addEventListener('scroll', () => {
  codeOutput.scrollTop = codeInput.scrollTop;
  codeOutput.scrollLeft = codeInput.scrollLeft;
});

const resizeObserver = new ResizeObserver((entries) => {
  for (let entry of entries) {
    if (entry.target === codeInput) {
      codeOutput.style.height = (codeInput.offsetHeight) + 'px';
      codeOutput.style.width = (codeInput.offsetWidth) + 'px';
      codeOutput.style.paddingRight = (codeInput.offsetWidth - codeInput.clientWidth) + 'px';
    }
  }
});

console.log = function (...args) {
  args.forEach(function (arg) {
    resultBlock.innerHTML += `<div class="console log">${arg}</div>`;
  });
}
console.error = function (...args) {
  args.forEach(function (arg) {
    resultBlock.innerHTML += `<div class="console error">${arg}</div>`;
  });
}
console.warn = function (...args) {
  args.forEach(function (arg) {
    resultBlock.innerHTML += `<div class="console warn">${arg}</div>`;
  });
}
runButton.addEventListener('click', () => {
  resultBlock.innerHTML = '';
  const code = codeInput.value;
  try {
    Function(code)();
  } catch (e) {
    console.error(e);
  }
});

resizeObserver.observe(codeInput);

addEventListener("DOMContentLoaded", (event) => {
  let hash = location.hash.slice(1);
  if (hash) {
    try {
      hash = decodeURIComponent(hash);
    } catch (error) {
      hash = hash.replace(/%[0-F]{2}/ig, decodeURIComponent);
    }
    codeInput.value = hash;
    codeInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
});
