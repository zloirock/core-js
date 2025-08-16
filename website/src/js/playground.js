/* eslint-disable import/no-unresolved -- dependencies are not installed */
/* global Babel -- global scope directive */
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

  function importPlugin() {
    return {
      visitor: {
        ImportDeclaration(path) {
          const { node } = path;
          if (!node.specifiers.length && /^core-js\/|$/.test(node.source.value)) {
            path.remove();
          }
        },
      },
    };
  }

  Babel.registerPlugin('console-plugin', consolePlugin);
  Babel.registerPlugin('import-plugin', importPlugin);

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
      const output = Babel.transform(code, { presets: ['env'], plugins: ['console-plugin', 'import-plugin'] }).code;
      // eslint-disable-next-line no-new-func -- it's needed to run code with monkey-patched console
      const context = new Function('console', output);
      context(console);
    } catch (error) {
      writeResult(`Error: ${ error.message }`, 'error');
    }
  }

  function serializeLog(value, visited = new WeakSet()) {
    if (typeof value == 'string') return JSON.stringify(value);
    if (typeof value == 'function') return `[Function ${ value.name || 'anonymous' }]`;
    if (typeof value != 'object' || value === null) return String(value);

    if (value instanceof Promise) {
      return 'Promise { <value> }';
    }

    if (typeof value === 'object') {
      if (visited.has(value)) return '[Circular]';
      visited.add(value);
    }

    if (value instanceof Set) {
      const arr = Array.from(value, v => serializeLog(v, visited));
      return `Set { ${ arr.join(', ') } }`;
    }

    if (value instanceof Map) {
      const arr = Array.from(
        value,
        ([k, v]) => `${ serializeLog(k, visited) } => ${ serializeLog(v, visited) }`,
      );
      return `Map { ${ arr.join(', ') } }`;
    }

    if (value instanceof ArrayBuffer) {
      return `ArrayBuffer(${ value.byteLength })`;
    }

    if (value instanceof DataView) {
      return `DataView(${ value.byteLength })`;
    }

    if (value instanceof Blob) {
      return `Blob { size: ${ value.size }, type: "${ value.type }" }`;
    }

    if (value instanceof DOMPoint) {
      return `DOMPoint { x: ${ value.x }, y: ${ value.y }, z: ${ value.z }, w: ${ value.w } }`;
    }

    if (ArrayBuffer.isView(value)) {
      const type = value.constructor.name;
      const objFormat = Array.from(value, (v, i) => `"${ i }": ${ serializeLog(v, visited) }`);
      return `${ type } { ${ objFormat.join(', ') } }`;
    }

    if (Array.isArray(value)) {
      const arr = value.map(v => serializeLog(v, visited));
      return `[${ arr.join(', ') }]`;
    }

    if (value instanceof Error) {
      return `${ value.name || 'Error' }: ${ value.message }`;
    }

    if (value instanceof Date) {
      return `Date "${ value.toString() }"`;
    }

    if (value instanceof RegExp) {
      return `RegExp ${ value.toString() }`;
    }

    if (typeof value === 'object') {
      const isPlain = Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null;
      const keys = Reflect.ownKeys(value);
      const props = keys.map(k => {
        // eslint-disable-next-line unicorn/no-instanceof-builtins -- it's needed here
        const displayKey = Object(k) instanceof Symbol ? `[${ k.toString() }]` : k;
        return `${ displayKey }: ${ serializeLog(value[k], visited) }`;
      });
      if (visited.has(value)) visited.delete(value);

      return isPlain
        ? `{ ${ props.join(', ') } }`
        : `${ value.constructor?.name || 'Object' } { ${ props.join(', ') } }`;
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
