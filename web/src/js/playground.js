import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';

hljs.registerLanguage('javascript', javascript);

const codeInput = document.querySelector('#code-input');
const codeOutput = document.querySelector('#code-output');
const runButton = document.querySelector('.run-button');
const resultBlock = document.querySelector('.result');

codeOutput.textContent = codeInput.value;
hljs.highlightElement(codeOutput);

codeInput.addEventListener('input', (event) => {
  codeOutput.removeAttribute('data-highlighted');
  let val = codeInput.value;
  if (val[val.length - 1] === "\n") val += ' ';
  codeOutput.textContent = val;
  hljs.highlightElement(codeOutput);
});

codeInput.addEventListener('scroll', (event) => {
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
runButton.addEventListener('click', (event) => {
  resultBlock.innerHTML = '';
  const code = codeInput.value;
  try {
    Function(code)();
  } catch (e) {
    console.error(e);
  }
})

resizeObserver.observe(codeInput);
