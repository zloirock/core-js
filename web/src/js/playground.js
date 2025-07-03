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

function writeResult(text, type = 'log') {
  resultBlock.innerHTML += `<div class="console ${type}">${text}</div>`;

}
function runCode(code) {
  const console = {
    log: (...args) => {
      args.forEach((arg) => { writeResult(arg, 'log') });
    },
    warn: (...args) => {
      args.forEach((arg) => { writeResult(arg, 'warn') });
    },
    error: (...args) => {
      args.forEach((arg) => { writeResult(arg, 'error') });
    },
  }

  const context = new Function('console', code);
  try {
    context(console);
  } catch (error) {
    writeResult(`Error: ${error.message}`, 'error');
  }
}

runButton.addEventListener('click', () => {
  resultBlock.innerHTML = '';
  runCode(codeInput.value);
});

resizeObserver.observe(codeInput);

addEventListener("DOMContentLoaded", () => {
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
