// A read counts as present only through its own pure definition, backed by the build: a static with
// no own definition resolves to the instance methods of its key, which back no static, a definition of
// the global flavor alone may list only what a use of it needs, and a global with no definition at all
// decides nothing - unless core-js extends it in place and ships no pure replacement of it (none at all, or a
// global module patching the engine's own), every static under its own entries, which every engine it supports
// carries (`Array`, `Math`, `Number`, not `WebAssembly` or `Int8Array`). The build here backs every definition it
// is asked about, so each verdict below is the read's definition alone.
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { servedRead } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { adapters, createChecker } from './harness.mjs';

const { checkDeep, finish } = createChecker('served-reads');

for (const parser of adapters) for (const method of ['usage-pure', 'usage-global']) {
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method });
  adapter.served = () => ({ substituted: false });
  for (const [source, expected] of [
    ['Promise', { global: 'Promise', type: 'function', substituted: false }],
    ['Promise.resolve', { global: null, type: null, substituted: false }],
    ['Map.keys', null],
    ['Float16Array', null],
    ['Array', { global: 'Array', type: 'function', substituted: false }],
    ['Math', { global: 'Math', type: 'object', substituted: false }],
    ['JSON', { global: 'JSON', type: 'object', substituted: false }],
    ['Object', { global: 'Object', type: 'function', substituted: false }],
    ['String', { global: 'String', type: 'function', substituted: false }],
    ['Number', { global: 'Number', type: 'function', substituted: false }],
    ['RegExp', { global: 'RegExp', type: 'function', substituted: false }],
    ['ArrayBuffer', { global: 'ArrayBuffer', type: 'function', substituted: false }],
    ['Uint8Array', { global: 'Uint8Array', type: 'function', substituted: false }],
    ['Error', { global: 'Error', type: 'function', substituted: false }],
    ['EvalError', { global: 'EvalError', type: 'function', substituted: false }],
    ['RangeError', { global: 'RangeError', type: 'function', substituted: false }],
    ['ReferenceError', { global: 'ReferenceError', type: 'function', substituted: false }],
    ['SyntaxError', { global: 'SyntaxError', type: 'function', substituted: false }],
    ['TypeError', { global: 'TypeError', type: 'function', substituted: false }],
    ['URIError', { global: 'URIError', type: 'function', substituted: false }],
    ['Int8Array', null],
    ['Float32Array', null],
    ['Uint8ClampedArray', null],
    ['WebAssembly', null],
    ['WeakRef', null],
    ['Error.captureStackTrace', null],
  ]) {
    const program = parser.parseAndScope(`${ source };`);
    const path = parser.pickPath(program, 'ExpressionStatement').get('expression');
    checkDeep(`${ parser.name }/${ method }/${ source }`, servedRead(path.node, { scope: path.scope, adapter, path }), expected);
  }
}

finish();
