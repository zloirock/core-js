// Fresh workers keep constructor namespaces independent across rows and emitters.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { importSet } from '../transpiler-differential/harness.mjs';
import { createChecker, scenarioSource } from '../polyfill-provider/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { check, finish } = createChecker('deferred-receiver-runtime');
const TMP = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(TMP);
const DIR = await fs.mkdtemp(path.join(TMP, 'deferred-receiver-'));
let count = 0;

// Each source owns its imports and stripped realm; nested work must settle before copying.
const cases = [
  [
    'callback-inner-static', `
    const R = [];
    function sink(value) {
      R[R.length] = value;
    }
    function useMemo(fn) {
      return fn();
    }
    function call(fn) {
      fn();
      return [1, 2];
    }
    const {
      values
    } = useMemo(() => {
      const {
        fromEntries
      } = Object;
      return fromEntries([['a', 1]]);
    });
    sink(typeof values);
    export { R as r };
    export const effects = [];
  `,
    ['undefined'],
  ],
  [
    'callback-inner-static-assign', `
    const R = [];
    function sink(value) {
      R[R.length] = value;
    }
    function useMemo(fn) {
      return fn();
    }
    function call(fn) {
      fn();
      return [1, 2];
    }
    let values;
    ({
      values
    } = useMemo(() => {
      const {
        fromEntries
      } = Object;
      return fromEntries([['a', 1]]);
    }));
    sink(typeof values);
    export { R as r };
    export const effects = [];
  `,
    ['undefined'],
  ],
  [
    'callback-inner-instance', `
    const R = [];
    function sink(value) {
      R[R.length] = value;
    }
    function useMemo(fn) {
      return fn();
    }
    function call(fn) {
      fn();
      return [1, 2];
    }
    const {
      at
    } = call(() => {
      const {
        includes
      } = [1];
      sink(includes.call([1], 1));
    });
    sink(at.call([1, 2], -1));
    export { R as r };
    export const effects = [];
  `,
    [true, 2],
  ],
  [
    'callback-inner-default', `
    const R = [];
    function sink(value) {
      R[R.length] = value;
    }
    function useMemo(fn) {
      return fn();
    }
    function call(fn) {
      fn();
      return [1, 2];
    }
    const {
      at = 0
    } = call(() => {
      const {
        includes
      } = [1];
      sink(includes.call([1], 1));
    });
    sink(at.call([1, 2], -1));
    export { R as r };
    export const effects = [];
  `,
    [true, 2],
  ],
  [
    'for-init-inner', `
    const R = [];
    function sink(value) {
      R[R.length] = value;
    }
    function useMemo(fn) {
      return fn();
    }
    function call(fn) {
      fn();
      return [1, 2];
    }
    for (const {
        at
      } = call(() => {
        const {
          includes
        } = [1];
        sink(includes.call([1], 1));
      }), i = 0; i < 1;) {
      sink(at.call([1, 2], -1));
      break;
    }
    export { R as r };
    export const effects = [];
  `,
    [true, 2],
  ],
  [
    'bodyless-inner', `
    const R = [];
    function sink(value) {
      R[R.length] = value;
    }
    function useMemo(fn) {
      return fn();
    }
    function call(fn) {
      fn();
      return [1, 2];
    }
    if (R) var {
      at
    } = call(() => {
      const {
        includes
      } = [1];
      sink(includes.call([1], 1));
    });
    sink(at.call([1, 2], -1));
    export { R as r };
    export const effects = [];
  `,
    [true, 2],
  ],
  [
    'nested-outer-inner', `
    const R = [];
    function sink(value) {
      R[R.length] = value;
    }
    function useMemo(fn) {
      return fn();
    }
    function call(fn) {
      fn();
      return [1, 2];
    }
    const {
      w: {
        at
      }
    } = {
      w: call(() => {
        const {
          includes
        } = [1];
        sink(includes.call([1], 1));
      })
    };
    sink(at.call([1, 2], -1));
    export { R as r };
    export const effects = [];
  `,
    [true, 2],
  ],
  [
    'iife-inner-instance', `
    const R = [];
    function sink(value) {
      R[R.length] = value;
    }
    function useMemo(fn) {
      return fn();
    }
    function call(fn) {
      fn();
      return [1, 2];
    }
    const {
      at
    } = (() => {
      const {
        flat
      } = [[1], [2]];
      sink(flat.call([[1], [2]]).length);
      return [1, 2];
    })();
    sink(at.call([1, 2], -1));
    export { R as r };
    export const effects = [];
  `,
    [2, 2],
  ],
  [
    'realistic-filter', `
    const R = [];
    function sink(value) {
      R[R.length] = value;
    }
    function useMemo(fn) {
      return fn();
    }
    function call(fn) {
      fn();
      return [1, 2];
    }
    const items = [{
      tags: ['a']
    }, {
      tags: ['b']
    }];
    const {
      find
    } = items.filter(item => {
      const {
        includes
      } = item.tags;
      return includes.call(item.tags, 'a');
    });
    sink(find.call([1, 2], x => x > 1));
    export { R as r };
    export const effects = [];
  `,
    [2],
  ],
  [
    'inner-hop-host', `
    const R = [];
    function sink(value) {
      R[R.length] = value;
    }
    function useMemo(fn) {
      return fn();
    }
    function call(fn) {
      fn();
      return [1, 2];
    }
    const {
      at
    } = call(() => {
      const {
        Iterator: {
          customI
        }
      } = globalThis;
      sink(typeof customI);
    });
    sink(at.call([1, 2], -1));
    export { R as r };
    export const effects = [];
  `,
    ['undefined', 2],
  ],
  [
    'depth2', `
    const R = [];
    function sink(value) {
      R[R.length] = value;
    }
    function useMemo(fn) {
      return fn();
    }
    function call(fn) {
      fn();
      return [1, 2];
    }
    const {
      at
    } = call(() => {
      const {
        includes
      } = call(() => {
        const {
          flat
        } = [[1], [2]];
        sink(flat.call([[1], [2]]).length);
      });
      sink(includes.call([1], 1));
    });
    sink(at.call([1, 2], -1));
    export { R as r };
    export const effects = [];
  `,
    [2, true, 2],
  ],
  [
    'control-two-outer-claims', `
    const R = [];
    function sink(value) {
      R[R.length] = value;
    }
    function useMemo(fn) {
      return fn();
    }
    function call(fn) {
      fn();
      return [1, 2];
    }
    const {
      at,
      includes
    } = call(() => {
      const {
        flat
      } = [[1], [2]];
      sink(flat.call([[1], [2]]).length);
    });
    sink(at.call([1, 2], -1));
    sink(includes.call([1], 1));
    export { R as r };
    export const effects = [];
  `,
    [2, 2, true],
  ],
  [
    'push-wrapper-control', `
    const R = [];
    function sink(value) {
      R[R.length] = value;
    }
    function getA(fn) {
      fn();
      return Array;
    }
    const out = [];
    out.push(1);
    sink(out.length);
    export { R as r };
    export const effects = [];
  `,
    [1],
  ],
  [
    'iife-static-inner-synth', `
    const R = [];
    function sink(value) {
      R[R.length] = value;
    }
    function getA(fn) {
      fn();
      return Array;
    }
    const res = (({
      of
    }) => typeof of)(getA(() => {
      function g({
        from
      } = Array) {
        return from([1]).length;
      }
      sink(g());
    }));
    sink(res);
    export { R as r };
    export const effects = [];
  `,
    [1, 'function'],
  ],
  [
    'iife-static-arrow-inner-synth', `
    const R = [];
    function sink(value) {
      R[R.length] = value;
    }
    function getA(fn) {
      fn();
      return Array;
    }
    const res = (({
      of
    }) => typeof of)(getA(() => {
      const g = ({
        from
      } = Array) => from([1]).length;
      sink(g());
    }));
    sink(res);
    export { R as r };
    export const effects = [];
  `,
    [1, 'function'],
  ],
  [
    'iife-static-inner-iife-synth', `
    const R = [];
    function sink(value) {
      R[R.length] = value;
    }
    function getA(fn) {
      fn();
      return Array;
    }
    const res = (({
      of
    }) => typeof of)(getA(() => {
      sink((({
        from
      }) => from([1]).length)(Array));
    }));
    sink(res);
    export { R as r };
    export const effects = [];
  `,
    [1, 'function'],
  ],
  [
    'partial-synth-inner-synth', `
    const R = [];
    function sink(value) {
      R[R.length] = value;
    }
    function getA(fn) {
      fn();
      return Array;
    }
    const res = (({
      of,
      isArray
    }) => typeof of + typeof isArray)(getA(() => {
      function g({
        from
      } = Array) {
        return from([1]).length;
      }
      sink(g());
    }));
    sink(res);
    export { R as r };
    export const effects = [];
  `,
    [1, 'functionfunction'],
  ],
  [
    'fallback-receiver', `
    const R = [];
    function sink(value) {
      R[R.length] = value;
    }
    function getA(fn) {
      fn();
      return Array;
    }
    const U = undefined;
    const res = (({
      of
    }) => typeof of)(U || getA(() => {
      function g({
        from
      } = Array) {
        return from([1]).length;
      }
      sink(g());
    }));
    sink(res);
    export { R as r };
    export const effects = [];
  `,
    [1, 'function'],
  ],
  [
    'control-walk-claim-inside', `
    const R = [];
    function sink(value) {
      R[R.length] = value;
    }
    function getA(fn) {
      fn();
      return Array;
    }
    const res = (({
      of
    }) => typeof of)(getA(() => {
      sink([7].at(0));
    }));
    sink(res);
    export { R as r };
    export const effects = [];
  `,
    [7, 'function'],
  ],
  [
    'control-param-default-seq', `
    const R = [];
    function sink(value) {
      R[R.length] = value;
    }
    function getA(fn) {
      fn();
      return Array;
    }
    function f({
      of
    } = (sink(0), Array)) {
      return typeof of;
    }
    sink(f());
    export { R as r };
    export const effects = [];
  `,
    [0, 'function'],
  ],
  [
    'call-root', `
    export let r;
    export const effects = [];
    function eff(x) {
      effects[effects.length] = x;
    }
    function getWin() {
      return globalThis.window;
    }
    const {
      resolve
    } = getWin()?.Promise;
    r = typeof resolve;
  `,
    'function', [], 'ERR|TypeError',
  ],
  [
    'stored-root', `
    export let r;
    export const effects = [];
    function eff(x) {
      effects[effects.length] = x;
    }
    let held;
    const {
      resolve
    } = (held = globalThis.window)?.Promise;
    r = typeof resolve;
  `,
    'function', [], 'ERR|TypeError',
  ],
  [
    'prefix-at', `
    export let r;
    export const effects = [];
    function eff(x) {
      effects[effects.length] = x;
    }
    const list = [1];
    const {
      resolve
    } = (list.at(0), globalThis.window)?.Promise;
    r = typeof resolve;
  `,
    'function', [], 'ERR|TypeError',
  ],
  [
    'prefix-has-own', `
    export let r;
    export const effects = [];
    function eff(x) {
      effects[effects.length] = x;
    }
    const list = [1];
    const {
      resolve
    } = (Object.hasOwn(list, 0), globalThis.window)?.Promise;
    r = typeof resolve;
  `,
    'function', [], 'ERR|TypeError',
  ],
  [
    'prefix-alias', `
    export let r;
    export const effects = [];
    function eff(x) {
      effects[effects.length] = x;
    }
    const list = [1];
    const w = globalThis.window;
    const {
      resolve
    } = (list.flat(), eff("p"), w).Promise;
    r = typeof resolve;
  `,
    'function', ['p'], 'ERR|TypeError',
  ],
  [
    'assignment-nested', `
    export let r;
    export const effects = [];
    function eff(x) {
      effects[effects.length] = x;
    }
    let name;
    ({
      resolve: {
        name
      }
    } = (globalThis.window?.self).Promise);
    r = name;
  `,
    'resolve', [], 'ERR|TypeError',
  ],
  [
    'fallback-prefix', `
    export let r;
    export const effects = [];
    function eff(x) {
      effects[effects.length] = x;
    }
    const {
      resolve
    } = ((eff("p"), globalThis.window)?.self).Promise ?? {};
    r = typeof resolve;
  `,
    'function', ['p'], 'ERR|TypeError',
  ],
  [
    'quiet-tail', `
    export let r;
    export const effects = [];
    function eff(x) {
      effects[effects.length] = x;
    }
    const holder = {
      get box() {
        eff("box");
        return {
          A: Array
        };
      }
    };
    const {
      A: {
        from
      }
    } = (eff("p"), holder.box);
    r = typeof from;
  `,
    'function', ['p', 'box'], null,
  ],
  [
    'quiet-tail-let', `
    export let r;
    export const effects = [];
    function eff(x) {
      effects[effects.length] = x;
    }
    const holder = {
      get box() {
        eff("box");
        return {
          A: Array
        };
      }
    };
    let {
      A: {
        from
      }
    } = (eff("p"), holder.box);
    r = typeof from;
  `,
    'function', ['p', 'box'],
  ],
  [
    'quiet-tail-throw', `
    export let r;
    export const effects = [];
    function eff(x) {
      effects[effects.length] = x;
    }
    const holder = {
      get box() {
        eff("box");
        throw new RangeError();
      }
    };
    try {
      const {
        A: {
          from
        }
      } = (eff("p"), holder.box);
      r = typeof from;
    } catch (error) {
      r = error.name;
    }
  `,
    'RangeError', ['p', 'box'],
  ],
  [
    'quiet-tail-two-prefixes', `
    export let r;
    export const effects = [];
    function eff(x) {
      effects[effects.length] = x;
    }
    const holder = {
      get box() {
        eff("box");
        return {
          A: Array
        };
      }
    };
    const {
      A: {
        from
      }
    } = (eff("p"), eff("q"), holder.box);
    r = typeof from;
  `,
    'function', ['p', 'q', 'box'],
  ],
  [
    'quiet-tail-instance-control', `
    export let r;
    export const effects = [];
    function eff(x) {
      effects[effects.length] = x;
    }
    const holder = {
      get box() {
        eff("box");
        return [7];
      }
    };
    const {
      at
    } = (eff("p"), holder.box);
    r = at.call([7], 0);
  `,
    7, ['p', 'box'],
  ],
  [
    'quiet-tail-residual-control', `
    export let r;
    export const effects = [];
    function eff(x) {
      effects[effects.length] = x;
    }
    const holder = {
      get box() {
        eff("box");
        return {
          A: Array,
          other: 3
        };
      }
    };
    const {
      A: {
        from
      },
      other
    } = (eff("p"), holder.box);
    r = [typeof from, other];
  `,
    ['function', 3], ['p', 'box'],
  ],
  [
    'nested-synth-in-declaration', `
    export let r;
    export const effects = [];
    function eff(x) {
      effects[effects.length] = x;
    }
    function source(cb) {
      cb();
      return [3];
    }
    const {
      at
    } = source(() => {
      function f({
        from
      } = Array) {
        return from([7])[0];
      }
      eff(f());
    });
    r = at.call([3], 0);
  `,
    3, [7],
  ],
  [
    'nested-declaration-in-synth', `
    export let r;
    export const effects = [];
    function eff(x) {
      effects[effects.length] = x;
    }
    function source(cb) {
      cb();
      return Array;
    }
    const value = (({
      of,
      isArray
    }) => [typeof of, typeof isArray])(source(() => {
      const {
        fromEntries
      } = Object;
      eff(fromEntries([["x", 7]]).x);
    }));
    r = value;
  `,
    ['function', 'function'], [7],
  ],
  [
    'sequence-assignment-inner', `
    export let r;
    export const effects = [];
    function eff(x) {
      effects[effects.length] = x;
    }
    let at;
    function source(cb) {
      cb();
      return [3];
    }
    const result = ({
      at
    } = source(() => {
      const {
        fromEntries
      } = Object;
      eff(fromEntries([["x", 7]]).x);
    }), at.call([3], 0));
    r = result;
  `,
    3, [7],
  ],
  [
    'sibling-callback-hosts', `
    export let r;
    export const effects = [];
    function eff(x) {
      effects[effects.length] = x;
    }
    function source(cb) {
      cb();
      return [3];
    }
    const {
      at
    } = source(() => {
      const {
        fromEntries
      } = Object;
      const {
        includes
      } = [7];
      eff(fromEntries([["x", includes.call([7], 7)]]).x);
    });
    r = at.call([3], 0);
  `,
    3, [true],
  ],
  [
    'throwing-inner-host', `
    export let r;
    export const effects = [];
    function eff(x) {
      effects[effects.length] = x;
    }
    function source(cb) {
      cb();
      return [3];
    }
    try {
      const {
        at
      } = source(() => {
        const {
          fromEntries
        } = Object;
        eff(fromEntries(null));
      });
      r = at;
    } catch (error) {
      r = error.name;
    }
  `,
    'TypeError', [],
  ],
  [
    'probe-nested-host', `
    export let r;
    export const effects = [];
    function eff(x) {
      effects[effects.length] = x;
    }
    function getWin(cb) {
      cb();
      return globalThis.window;
    }
    const {
      resolve
    } = getWin(() => {
      const {
        fromEntries
      } = Object;
      eff(fromEntries([["x", 7]]).x);
    })?.Promise;
    r = typeof resolve;
  `,
    'function', [7], 'ERR|TypeError',
  ],
  [
    'probe-nested-synth', `
    export let r;
    export const effects = [];
    function eff(x) {
      effects[effects.length] = x;
    }
    function getWin(cb) {
      cb();
      return globalThis.window;
    }
    const {
      resolve
    } = getWin(() => {
      function f({
        from
      } = Array) {
        return from([7])[0];
      }
      eff(f());
    })?.Promise;
    r = typeof resolve;
  `,
    'function', [7], 'ERR|TypeError',
  ],
  [
    'prefix-nested-host', `
    export let r;
    export const effects = [];
    function eff(x) {
      effects[effects.length] = x;
    }
    function call(cb) {
      cb();
    }
    const {
      resolve
    } = (call(() => {
      const {
        fromEntries
      } = Object;
      eff(fromEntries([["x", 7]]).x);
    }), globalThis.window)?.Promise;
    r = typeof resolve;
  `,
    'function', [7], 'ERR|TypeError',
  ],
  [
    'flat-guarded-residual-prefix', `
    export let r;
    export const effects = [];
    function record(value) {
      effects[effects.length] = value;
    }
    class Box {
      static get value() {
        record('get');
        return globalThis;
      }
    }
    const { groupBy, other } = (record('prefix'), Box.value.Map);
    r = [typeof groupBy, typeof other];
  `,
    ['function', 'undefined'], ['prefix', 'get'],
  ],
];

async function checkCase([name, code, result, effects = [], absent = null]) {
  const source = scenarioSource(code);
  for (const method of ['usage-global', 'usage-pure']) {
    const options = { method, version: '4.0', targets: { ie: 11 } };
    const babel = (await transformAsync(source, { filename: 'input.mjs', configFile: false, babelrc: false, plugins: [[babelPlugin, options]] })).code;
    const plugin = createUnplugin(options);
    const single = createUnplugin(options).transform(source, 'input.mjs')?.code ?? source;
    const pre = plugin.transform(source, 'input.mjs', 'pre')?.code ?? source;
    const post = plugin.transform(pre, 'input.mjs', 'post')?.code ?? pre;
    check(`${ name }/${ method }/imports`, JSON.stringify([...importSet(single)].sort()), JSON.stringify([...importSet(babel)].sort()));
    check(`${ name }/${ method }/phase imports`, JSON.stringify([...importSet(post)].sort()), JSON.stringify([...importSet(single)].sort()));
    for (const present of absent === null ? [true] : [false, true]) {
      const expected = !present && absent ? absent : `OK|${ JSON.stringify(result) }|${ JSON.stringify(effects) }`;
      for (const [host, output] of [['native', source], ['babel', babel], ['unplugin', single], ['pre+post', post]]) {
        if (host === 'native' && method === 'usage-pure') continue;
        const file = path.join(DIR, `case-${ count++ }.mjs`);
        await fs.outputFile(file, `${ present ? 'global.window = global;' : 'delete global.window;' }\n${ output }`);
        check(`${ name }/${ method }/${ present }/${ host }/full`, await runInWorker(file, { strip: false }), expected);
        if (host !== 'native') check(`${ name }/${ method }/${ present }/${ host }/stripped`, await runInWorker(file, { stripGlobals: ['Promise', 'Iterator', 'globalThis'] }), expected);
      }
    }
  }
}

try {
  for (const item of cases) await checkCase(item);
} finally {
  await fs.remove(DIR);
}
finish();
