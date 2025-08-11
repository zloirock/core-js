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
          if (trailingComments?.[0]?.value.startsWith(' =>')) {
            if (
              t.isCallExpression(expression) &&
              t.isMemberExpression(expression.callee) &&
              expression.callee.object.name === 'console'
            ) return;
            path.replaceWith(
              t.callExpression(
                t.memberExpression(t.identifier('console'), t.identifier('log')),
                [t.clone(expression)],
              ),
            );
          }
        },
      },
    };
  }

  // eslint-disable-next-line no-undef, sonarjs/no-reference-error -- babel global added to page
  Babel.registerPlugin('console-plugin', consolePlugin);

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
      const output = Babel.transform(code, { presets: ['env'], plugins: ['console-plugin'] }).code;
      // eslint-disable-next-line no-new-func -- it's needed to run code with monkey-patched console
      const context = new Function('console', output);
      context(console);
    } catch (error) {
      writeResult(`Error: ${ error.message }`, 'error');
    }
  }

  function serializeLog(value, visited = new WeakSet()) {
    if (value === null) return 'null';
    if (typeof value === 'string') return JSON.stringify(value);
    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'undefined') return String(value);
    if (typeof value === 'function') return `[Function ${value.name || 'anonymous'}]`;

    if (typeof value === 'object') {
      if (visited.has(value)) return '[Circular]';
      visited.add(value);
    }

    if (value instanceof Set) {
      const arr = Array.from(value).map(v => serializeLog(v, visited));
      return `Set {${ arr.join(', ') }}`;
    }

    if (value instanceof Map) {
      const arr = Array.from(value.entries())
        .map(([k, v]) => `${ serializeLog(k, visited) } => ${ serializeLog(v, visited) }`);
      return `Map {${ arr.join(', ') }}`;
    }

    if (ArrayBuffer.isView(value) && !(value instanceof DataView)) {
      const type = value.constructor.name;
      let objFormat = Array.from(value)
        .map((v, i) => `"${ i }": ${ serializeLog(v, visited) }`);
      return `${ type } {${ objFormat.join(', ') }}`;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      const arr = value.map(v => serializeLog(v, visited));
      return `[${ arr.join(', ') }]`;
    }

    if (value instanceof Date) {
      return `Date "${ value.toISOString() }"`;
    }

    if (value instanceof RegExp) {
      return value.toString();
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (!keys.length) return '{}';
      const props = keys.map(k =>
        `${ JSON.stringify(k) }: ${ serializeLog(value[k], visited) }`
      );
      return `{${ props.join(', ') }}`;
    }

    return String(value);
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
