/* eslint-disable import/no-unresolved -- dependencies are not installed */
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';

hljs.registerLanguage('javascript', javascript);

const hash = globalThis.location.hash.slice(1);
const pageParams = new URLSearchParams(hash);

const specSymbols = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

let initialized = false;
function init() {
  if (initialized) return;
  initialized = true;

  const codeInput = document.querySelector('#code-input');
  const codeOutput = document.querySelector('#code-output');
  const runButton = document.querySelector('.run-button');
  const linkButton = document.querySelector('.link-button');
  const resultBlock = document.querySelector('.result');

  if (!codeInput) return;

  function writeResult(text, type = 'log') {
    const serializedText = serializeLog(text).replaceAll(/["&'<>]/g, it => specSymbols[it]);
    resultBlock.innerHTML += `<div class="console ${ type }">${ serializedText }</div>`;
  }

  function consolePlugin(babel) {
    const { types: t } = babel;
    return {
      visitor: {
        ExpressionStatement(path) {
          const { expression, trailingComments } = path.node;
          if (trailingComments && trailingComments[0] && trailingComments[0].value.startsWith(' =>')) {
            if (
              t.isCallExpression(expression) &&
              t.isMemberExpression(expression.callee) &&
              expression.callee.object.name === 'console'
            ) return;
            path.replaceWith(
              t.callExpression(
                t.memberExpression(t.identifier('console'), t.identifier('log')),
                [t.clone(expression)],
              )
            );
          }
        }
      }
    };
  }

  function runCode(code) {
    const origConsole = globalThis.console;
    const console = {
      log: (...args) => {
        args.forEach(arg => { writeResult(arg, 'log'); });
        origConsole.log(...args);
      },
      warn: (...args) => {
        args.forEach(arg => { writeResult(arg, 'warn'); });
        origConsole.warn(...args);
      },
      error: (...args) => {
        args.forEach(arg => { writeResult(arg, 'error'); });
        origConsole.error(...args);
      },
    };

    try {
      // eslint-disable-next-line no-undef, sonarjs/no-reference-error -- babel global added to page
      Babel.registerPlugin('console-plugin', consolePlugin);
      // eslint-disable-next-line no-undef, sonarjs/no-reference-error -- babel global added to page
      const output = Babel.transform(code, { presets: ['env'], plugins: ['console-plugin'] }).code;
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

  runButton.addEventListener('click', () => {
    resultBlock.innerHTML = '';
    runCode(codeInput.value);
  });

  linkButton.addEventListener('click', () => {
    pageParams.set('code', codeInput.value);
    globalThis.location.hash = pageParams.toString();
  });

  setInterval(() => {
    globalThis.localStorage.setItem('code', codeInput.value);
  }, 2000);

  codeOutput.textContent = codeInput.value;
  hljs.highlightElement(codeOutput);
  let event;
  if (typeof Event === 'function') {
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
