import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';

hljs.registerLanguage('javascript', javascript);

const codeInput = document.querySelector('#code-input');
const codeOutput = document.querySelector('#code-output');

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

resizeObserver.observe(codeInput);
