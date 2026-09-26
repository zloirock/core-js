// A persistent plugin must release the last parsed tree, including the class helper's
// callback installed on its adapter. Observe the parser boundary without changing the
// production sources; a child process provides explicit GC and isolated module hooks.
import { registerHooks } from 'node:module';
import { setImmediate as nextTurn } from 'node:timers/promises';

const RESULT_PREFIX = 'unplugin-teardown-result ';

if (typeof globalThis.gc === 'function') {
  const CODE = `export function read(receiver, fallback) {
    const [{ at = fallback(), other }] = [receiver];
    return [at, other];
  }
  class Derived extends Array {
    static read() { const { from } = this; return from; }
  }`;
  const parserURL = import.meta.resolve('oxc-parser');
  const pluginURL = new URL('../../packages/core-js-unplugin/internals/plugin.js', import.meta.url).href;
  const wrapperURL = new URL('./teardown-parser.js', import.meta.url).href;
  let ref;
  let retained;
  let retain = false;
  globalThis.observeTeardownTree = node => {
    ref = new WeakRef(node);
    if (retain) retained = node;
  };
  registerHooks({
    resolve(specifier, context, next) {
      if (specifier === 'oxc-parser' && context.parentURL === pluginURL) return { url: wrapperURL, shortCircuit: true };
      return next(specifier, context);
    },
    load(url, context, next) {
      if (url !== wrapperURL) return next(url, context);
      return {
        format: 'module',
        shortCircuit: true,
        source: `import { parseSync as parse } from ${ JSON.stringify(parserURL) };
          export function parseSync(...args) {
            const result = parse(...args);
            globalThis.observeTeardownTree(result.program);
            return result;
          }`,
      };
    },
  });
  const { default: createPlugin } = await import(pluginURL);
  const plugins = new Map(['usage-global', 'usage-pure'].map(method => [method, createPlugin({ method, targets: { ie: 11 } })]));
  const results = {};
  for (const [method, plugin] of plugins) {
    for (const pass of ['single', 'pre', 'post']) {
      for (const control of [true, false]) {
        retain = control;
        ref = null;
        const output = plugin.transform(CODE, 'input.mjs', pass);
        if (pass !== 'pre' && !output?.code.includes('core-js')) throw new Error('transform did not inject');
        if (!ref) throw new Error('parser observer did not run');
        await nextTurn();
        globalThis.gc();
        globalThis.gc();
        results[`${ method }/${ pass }/${ control ? 'retained' : 'released' }`] = ref.deref() === undefined;
        retained = null;
      }
    }
  }
  // Keep the control and plugin roots live through every collection.
  if (retained || plugins.size !== 2) throw new Error('invalid lifetime control');
  console.log(RESULT_PREFIX + JSON.stringify(results));
} else {
  const { createChecker } = await import('../polyfill-provider/harness.mjs');
  const { check, checkTruthy, finish } = createChecker('unplugin-per-file-teardown');
  const node = process.execPath.replaceAll('\\', '/');
  const { stdout } = await $({ quiet: true, cwd: import.meta.dirname })`${ node } --expose-gc ./per-file-teardown.mjs`;
  const line = stdout.split('\n').find(row => row.startsWith(RESULT_PREFIX));
  checkTruthy('child produced measurements', !!line);
  if (line) for (const [label, collected] of Object.entries(JSON.parse(line.slice(RESULT_PREFIX.length)))) {
    check(label, collected, label.endsWith('/released'));
  }
  finish();
}
