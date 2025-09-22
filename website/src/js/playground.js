/* eslint-disable import/no-unresolved -- dependencies are not installed */
/* global Babel -- global scope directive */
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import { createPopper } from '@popperjs/core';

hljs.registerLanguage('javascript', javascript);

const hash = location.hash.slice(1);
const pageParams = new URLSearchParams(hash);
const defaultCode = `import 'core-js/actual';

await Promise.try(() => 42); // => 42

Array.from(new Set([1, 2, 3]).union(new Set([3, 4, 5]))); // => [1, 2, 3, 4, 5]

[1, 2].flatMap(it => [it, it]); // => [1, 1, 2, 2]

Iterator.concat([1, 2], function * (i) { while (true) yield i++; }(3))
  .drop(1).take(5)
  .filter(it => it % 2)
  .map(it => it ** 2)
  .toArray(); // => [9, 25]
  
structuredClone(new Set([1, 2, 3])); // => new Set([1, 2, 3])`;

const specSymbols = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&apos;',
};

let initialized = false;
function init() {
  if (initialized) return;
  initialized = true;

  const codeInput = document.querySelector('#code-input');
  const codeOutput = document.querySelector('#code-output');
  const runButtons = document.querySelectorAll('.run-button');
  const linkButtons = document.querySelectorAll('.link-button');
  const resultBlock = document.querySelector('.result');
  const backLinkBlock = document.querySelector('.back-link');
  const backLink = document.querySelector('.back-link a');
  const tooltip = document.querySelector('#tooltip');
  const tooltipText = document.querySelector('#tooltip-text');

  if (!codeInput) return;

  function writeResult(text, type = 'log') {
    const serializedText = serializeLog(text).replaceAll(/["&'<>]/g, it => specSymbols[it]);
    resultBlock.innerHTML += `<div class="console ${ type }">${ serializedText }</div>`;
  }

  Babel.registerPlugin('playground-plugin', babel => {
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
        ImportDeclaration(path) {
          const { node } = path;
          if (!node.specifiers.length && /^core-js\/|$/.test(node.source.value)) {
            path.remove();
          }
        },
      },
    };
  });

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
      code = Babel.transform(code, { plugins: ['playground-plugin'] }).code;
      code = Babel.transform(`(async function () { ${ code } \n})().catch(console.error)`, { presets: ['env'] }).code;
      // eslint-disable-next-line no-new-func -- it's needed to run code with monkey-patched console
      const executeCode = new Function('console', code);
      executeCode(console);
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

  function elementInViewport(el) {
    const rect = el.getBoundingClientRect();

    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }

    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) return Promise.resolve();
      return Promise.reject(new Error('Copy command was unsuccessful'));
    } catch (err) {
      document.body.removeChild(textArea);
      return Promise.reject(err);
    }
  }

  function showTooltip(element, message, time = 3000) {
    tooltipText.innerHTML = message;
    tooltip.setAttribute('data-show', '');
    createPopper(element, tooltip, { placement: 'bottom' });
    setTimeout(() => {
      tooltip.removeAttribute('data-show');
    }, time);
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

  runButtons.forEach(runButton => {
    runButton.addEventListener('click', e => {
      e.preventDefault();
      resultBlock.innerHTML = '';
      runCode(codeInput.value);
      if (!elementInViewport(resultBlock)) {
        window.scrollTo({
          top: resultBlock.getBoundingClientRect().top,
          behavior: 'smooth',
        });
      }
    });
  });

  linkButtons.forEach(linkButton => {
    linkButton.addEventListener('click', e => {
      e.preventDefault();
      pageParams.set('code', codeInput.value);
      location.hash = pageParams.toString();
      try {
        copyToClipboard(location.toString());
        showTooltip(linkButton, 'Link copied');
      } catch {
        showTooltip(linkButton, 'Can\'t copy link. Please copy the link manually');
      }
    });
  });

  setInterval(() => {
    localStorage.setItem('code', codeInput.value);
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
    codeInput.value = code && code !== '' ? code : defaultCode;
    codeInput.dispatchEvent(event);
  }

  if (document.referrer !== '') {
    backLinkBlock.classList.add('active');
    backLink.addEventListener('click', e => {
      e.preventDefault();
      history.back();
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
