/* eslint-disable import/no-unresolved -- dependencies are not installed */
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';

hljs.registerLanguage('javascript', javascript);

const codeInput = document.querySelector('#code-input');
const codeOutput = document.querySelector('#code-output');
const runButton = document.querySelector('.run-button');
const linkButton = document.querySelector('.link-button');
const resultBlock = document.querySelector('.result');

codeOutput.textContent = codeInput.value;
hljs.highlightElement(codeOutput);

const hash = globalThis.location.hash.slice(1);
const pageParams = new URLSearchParams(hash);

codeInput.addEventListener('input', () => {
  codeOutput.removeAttribute('data-highlighted');
  let val = codeInput.value;
  if (val.at(-1) === '\n') val += ' ';
  codeOutput.textContent = val;
  hljs.highlightElement(codeOutput);
});

codeInput.addEventListener('scroll', () => {
  codeOutput.scrollTop = codeInput.scrollTop;
  codeOutput.scrollLeft = codeInput.scrollLeft;
});

const specSymbols = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

function writeResult(text, type = 'log') {
  const serializedText = serializeLog(text).replaceAll(/["&'<>]/g, it => specSymbols[it]);
  resultBlock.innerHTML += `<div class="console ${ type }">${ serializedText }</div>`;
}
function runCode(code) {
  const console = {
    log: (...args) => {
      args.forEach(arg => { writeResult(arg, 'log'); });
    },
    warn: (...args) => {
      args.forEach(arg => { writeResult(arg, 'warn'); });
    },
    error: (...args) => {
      args.forEach(arg => { writeResult(arg, 'error'); });
    },
  };

  if (!Babel) return;

  try {
    const output = Babel.transform(code, { presets: ["env"] }).code;
    // eslint-disable-next-line no-new-func -- it's needed to run code with monkey-patched console
    const context = new Function('console', output);
    context(console);
  } catch (error) {
    writeResult(`Error: ${ error.message }`, 'error');
  }
}

function stringify(it) {
  try {
    return JSON.stringify(Array.from(it));
  } catch {
    return String(it);
  }
}

function serializeLog(it) {
  const klass = ({}).toString.call(it).slice(8, -1);
  if (['Array', 'Object'].includes(klass)) return stringify(it);
  if (['Set', 'Map'].includes(klass)) return `${ klass } ${ stringify(Array.from(it)) }`;
  return String(it);
}

runButton.addEventListener('click', () => {
  resultBlock.innerHTML = '';
  runCode(codeInput.value);
});

linkButton.addEventListener('click', () => {
  pageParams.set('code', codeInput.value);
  globalThis.location.hash = pageParams.toString();
});

setInterval(() => {
  localStorage.setItem('code', codeInput.value);
}, 2000);

function init() {
  let event;
  if (typeof(Event) === 'function') {
    event = new Event('input', { bubbles: true });
  } else {
    event = document.createEvent('Event');
    event.initEvent('input', true, true);
  }
  if (pageParams.has('code')) {
    codeInput.value = pageParams.get('code');
    codeInput.dispatchEvent(event);
  } else {
    const code = localStorage.getItem('code');
    if (code) {
      codeInput.value = code;
      codeInput.dispatchEvent(event);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
