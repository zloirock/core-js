// Usage-PURE re-transform stability for the probe/seal canon renders: the guarded forms the
// first pass emits (`null == _globalThis.window ? void 0 : _self`, throw probes, delete
// re-hangs) must survive a second pass byte-for-byte in CONTENT - a re-render would double
// guards or re-probe an already-probed claim; a dropped import would strand the render
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';
import { createChecker } from '../polyfill-provider/harness.mjs';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');

const { check, finish } = createChecker('transform-idempotence-pure');

// one representative per probe/seal render family
const CASES = [
  ['several extracted keys share an unread sentinel', 'let from, of, rest; const held = ({ from, of, ...rest } = Array); use(held, from, of, rest);'],
  // Guarded scalar defaults retain the foreign read and its live fallback across passes.
  ['guarded static scalar default', 'export function read(source) { let M = source; if (!M) M = Array; const { of: value = [9].at(0) } = M; return value; }'],
  ['guarded static computed default', 'let M = pickConstructor(); if (!M) M = Array; const key = "of"; const { [key]: value = [9].at(0) } = M; use(value);'],
  ['guarded static default after a consumed instance', 'export function read(source) { let M = source; if (!M) M = Array; '
    + 'const { name: first, of: value = (M = {}, [9].at(0)), from: tail } = M; return [first, value, tail]; }'],
  ['guarded static default before native assignment value', 'export function read(source) { let M = source; if (!M) M = Array; '
    + 'let value, extra; return ({ of: value = (M = {}, 9), extra } = M); }'],
  ['guarded static default after native assignment value', 'export function read(source) { let M = source; if (!M) M = Array; '
    + 'let value, extra; return ({ extra = (M = {}, 9), of: value = 7 } = M); }'],
  ['array capture with a live default and native sibling', 'export function read(receiver) { const [{ other, at = () => "abc".at(-1) }] = [receiver]; return [at, other]; }'],
  ['array capture with exported siblings', 'export const head = before(), [{ other, at = fallback() }] = [receiver], tail = after();'],
  ['selecting declaration with an unknown key', 'export function read(source, key) { const { from, [key]: other } = source || Array; return [from, other]; }'],
  ['bare probe claimless', "let c = 0;\nexport const r = globalThis.window?.[(c++, 'self')]?.Array;"],
  ['bare probe plain tail', "let c = 0;\nexport const r = globalThis.window?.[(c++, 'self')].Number;"],
  ['sealed plain read', 'export const r = (globalThis.window?.self).Array;'],
  ['sealed claim with throw probe', 'export const r = (globalThis.window?.self).Array.of(6).at(0);'],
  ['sealed destructure probe', 'export const { of: r } = (globalThis.window?.self).Array;'],
  ['sealed synth default probe', 'export function f({ keys: r } = (globalThis.window?.self).Object) { return r; }'],
  ['owned parameter default beside an escaped instance',
    "import Keys from '@core-js/pure/actual/object/keys'; export function f({keys,at}={keys:Keys}){return[keys,at];}",
    null, ['@core-js/pure/actual/instance/at', '@core-js/pure/actual/object/keys']],
  ['owned parameter default before a body shadow',
    "import Keys from '@core-js/pure/actual/object/keys'; export function f({keys,at}={keys:Keys}){var Keys=99;return[keys,at,Keys];}",
    null, ['@core-js/pure/actual/instance/at', '@core-js/pure/actual/object/keys']],
  ['unowned parameter shadow remains an instance claim',
    "import Keys from '@core-js/pure/actual/object/keys'; export function f(Keys,{keys,at}={keys:Keys}){return[keys,at];}",
    null, ['@core-js/pure/actual/instance/at', '@core-js/pure/actual/instance/keys', '@core-js/pure/actual/object/keys']],
  ['sealed proto swap probe', 'export const r = (globalThis.window?.self).Map.prototype.has.call(new Map(), 1);'],
  ['delete through probe', 'export const r = delete globalThis.window?.self.customProp;'],
  // the LOGICAL-assignment patch: its detect is the operator's own read, which no node spells, so the
  // render leaves the `||=` host exactly as the source wrote it - and a pass that re-claims it
  // prepends a second dispatch, one per pass, converging on nothing. a single-pass fixture is blind
  // to it by construction
  ['logical-assignment patch', 'Array.prototype.flatMap ||= shim;\nexport const r = typeof Array.prototype.flatMap;'],
  ['nullish-assignment patch', 'Array.prototype.flatMap ??= shim;\nexport const r = typeof Array.prototype.flatMap;'],
  ['kept assign with seal', 'let d;\nexport const r = (d = globalThis.window?.self).Array;'],
  // the BRANCH MIRROR's own literal: the render replaces one arm of the receiver and leaves the
  // pattern where it stood, so a second pass meets a leaf whose paired slot already holds our
  // import - and claiming it again turns the static into an INSTANCE dispatch on that slot and
  // appends an entry per pass. a single-pass fixture cannot see it: pass one is correct
  ['nullable parameter mirror stays lazy',
    'const events = []; const receiver = JSON.parse("null");\n'
      + 'try { (({ [(events.push("key"), "at")]: at }, other) => [at, other])(receiver, events.push("argument")); }'
      + '\ncatch (error) {} export { events };'],
  ['branch mirror literal',
    "const src = { O: Object };\nlet gate = 1, se = 0, keys;\n({ [(se += 1, 'O')]: { keys } } = gate && src);\nexport const r = [typeof keys, se];"],
  // the RECEIVER a prior pass narrowed onto its own ponyfill (`realm === _globalThis ? _Promise :
  // realm.Promise`): the matching arm already IS the constructor's whole pure namespace, and
  // mirroring it again lays a literal over our own import, one entry per pass
  ['receiver narrowed onto its own ponyfill',
    'export function read(enabled) {\n  if (enabled) { var realm = globalThis; }\n'
      + '  const { allSettled } = realm.Promise;\n  return typeof allSettled;\n}'],
  // ... and the same render's other spelling: the SELECTING receiver whose diverging arm a prior pass
  // swapped for our own ponyfill (`nul || _Iterator.prototype`). the pattern here pairs a parameter
  // DEFAULT, so the receiver is the default's own value and the climb stops there
  ['selecting receiver arm swapped for its ponyfill',
    'const nul = null;\nexport const r = (function ({ map } = nul || Iterator.prototype) {\n'
      + '  return typeof map;\n})();'],
  // a receiver CONSTRUCTED by a ponyfill this pass substituted: pass one rewrites `new Map()` to
  // `new _Map()` while the name is still unbound, pass two reads that same `_Map` as the ordinary
  // import it became - and a callee taken for an unknown value costs the receiver its whole type, so
  // every method the ponyfill's own prototype carries is dispatched again
  ['receiver constructed by a substituted ctor', 'const m = new Map();\nexport const r = typeof m.keys;'],
  // a dropped REALM HOP whose SE key our render keeps beside the extraction the drop enabled: the
  // sentinel in that key's slot is ours, but the key names the REALM and the extraction reads a
  // member two levels down, so matching the two by entry leaves the sentinel unrecognised and the
  // next pass re-extracts it as a live binding
  ['realm-hop se key beside its extraction',
    "const eff = k => k;\nconst { [(eff('k'), 'self')]: { Array: { from: f } } } = globalThis;\nexport const r = typeof f;"],
  // the SUPER rewritten in place: pass one turns `extends Set` into `extends _Set` while the import
  // is not yet a binding, pass two reads that same `_Set` as the ordinary import it now is - and a
  // super that stops naming its global makes `this` untyped, so every instance method the polyfilled
  // super already carries is dispatched again. the class is deliberately UNREFERENCED: any escape
  // makes pass one dispatch too, and the row would measure nothing
  ['super rewritten to its polyfill import',
    'const C = class extends Set {\n  first() { return this.values().next().value; }\n};'],
  // a constructor the prior pass wrote as our own import (`picked.C = _Map`) is the global its entry names:
  // a selection of a pattern binding written with it ties the arms as the global did, or the next pass folds
  // the static read back through the container's path onto the literal's constructor
  ['constructor written as its own pure import through a selection of a pattern binding',
    'const holder = { inner: { C: Object } };\nconst spare = { C: Object };\nconst { inner: held } = holder;\n'
      + 'const picked = flag ? held : spare;\npicked.C = Map;\nexport const grouped = holder.inner.C.groupBy([1], x => x);'],
  // the ALIAS-held claim probe: the render leaves the source read as the non-final element of a
  // sequence whose tail is the ponyfill (`(held.of, _Array$of)`). the span check that recognises a
  // render inside one pass cannot see it after a RE-PARSE, so the claim owes a shape-level check -
  // without it the sequence grows by one copy per pass
  // the shapes whose renders this pass MINTS - a guarded read per prop, a residual rooted at a hop
  // memo, a renamed element with its levels. each spells a name the next pass reads back, so a
  // second pass must recognise its own output rather than claim it again
  ['guarded split, two statics', 'let M = globalThis.Array;\nif (!M) M = Array;\nexport const { from, of } = M;'],
  ['residual beside the claim', 'const pair = [{ y: [1, [2]], keep: 3 }];\nexport const [{ y: { at, ...rest } }] = pair;'],
  ['residual one level out', 'const pair = [{ y: [1, [2]], keep: 3 }];\nexport const [{ y: { at }, keep }] = pair;'],
  ['clouded binding, instance claim', 'let out;\nfor (const e of [Array]) { const { name } = e; out = name; }\nexport const r = out;'],
  ['alias-held probe call', 'const held = globalThis.window?.Array;\nexport const r = held.of(1);'],
  ['alias-held probe read', 'const held = globalThis.window?.Array;\nexport const r = held.from;'],
  // the rendered guard a STORE hands on, read through the source's own `?.`: the receiver is this
  // pass's own collapse, so the claim it deliberately left native comes back as a generic dispatch
  // unless the census walks the store - and the family has to be asked on BOTH member spellings,
  // since the other leg's parser calls an optional member a plain one
  ['stored rendered guard behind an optional claim',
    'let probeStored;\nexport const r = (probeStored = globalThis.window?.self.Object)?.keys({});\nuse(r);'],
  ['alias-held probe through a second alias',
    'const held = globalThis.window?.Array;\nconst chained = held;\nexport const r = chained.of(4);'],
  // a decided `??` whose left is read through a local alias: its presence answer claims the static in
  // the first pass, so the second meets our own import - left a member read, it was claimed there and
  // guarded on identity
  ['decided nullish over an alias left', 'const base = Promise;\nconst P = base ?? AggregateError;\nexport const r = typeof P.withResolvers;'],
  // the layer / sequence / chaining families: their renders are built from spans on the text side
  // and folded in place here, so both emitters owe the same fixed point
  ['paren layer over nav', 'globalThis.iBox = { arr: [3, [1, 2]] };\n'
    + 'export const r = (globalThis.window?.self.iBox).arr?.flat();'],
  ['sequence receiver', 'globalThis.iBox = { arr: [3, [1, 2]] };\n'
    + "export const r = ('x', globalThis.window?.self.iBox.arr)?.flat();"],
  ['sequence member dispatch', 'globalThis.iBox = { arr: [3, [1, 2]] };\n'
    + "export const r = ('x', globalThis.window?.self.iBox).arr?.flat();"],
  ['repeated nav chained consumer', 'globalThis.iBox = { arr: [3, [1, 2]] };\n'
    + 'export const r = (globalThis.window?.self.iBox.arr, globalThis.window?.self.iBox.arr)?.flat().concat([]);'],
  ['chained consumer over paren layer', 'globalThis.iBox = { arr: [3, [1, 2]] };\n'
    + 'export const r = (globalThis.window?.self.iBox).arr?.flat().concat([]);'],
  ['write target through the guard', 'globalThis.iBox = { n: 1 };\n'
    + 'export function w() { (globalThis.window?.self.iBox).n = 2; return globalThis.window?.self.iBox.n; }'],
  // the `in` probe whose test is KEPT: its output still reads as a foldable probe on a second
  // pass, so without recognising our own shape the wrap would wrap itself
  ['in kept test over short-circuiting receiver', 'const src = [3, [1, 2]];\n'
    + "export const r = (a => 'flat' in (a?.slice()))(src);"],
  ['in kept test over static proxy hop', "export const r = 'from' in globalThis.window?.Array;"],
  ['in fold stays folded', 'const src = [3, [1, 2]];\n'
    + "export const r = 'flat' in src.slice();"],
  ['mutated-self standdown', 'globalThis.self = globalThis.self;\n'
    + 'export const r = (globalThis.window?.self).Object.entries;\n'
    + 'export const { keys: k } = (globalThis.window?.self).Object;'],
  // a call HOST the pass rewrites into its own helper: the mutation census names the function a
  // call binds by the host's SOURCE spelling, and `Reflect.apply` is the one host this flavor
  // replaces with a minted import. without reading that import back the second pass no longer sees
  // the write, substitutes the read it deopted, and the file's own patch stops being served
  ['minted call host keeps its pairing', 'function install(t, v) { t.any = v; }\n'
    + 'Reflect.apply(install, null, [Promise, () => 1]);\nexport const r = Promise.any([]);'],
  // the own-output census family (provider own-output.js): each shape below re-claimed and
  // grew the file per pass before its census/adoption arm - the same classes the unplugin
  // engines lock, spelled through THIS emitter's renders
  ['overwrite rebind', 'let m;\n({ y: { flat: m } } = { y: [1, [2]] });\nconst { from } = Array;\nuse(m, from);'],
  // ... and the two spellings that are NOT a call: the static channel writes the import binding
  // itself, the defaulted one a memoized guard around the dispatch. a census that recognized only
  // the call form appended one more copy of each per pass
  ['static overwrite rebind under a multi wrapper', 'let g, zn;\n[{ Map: { groupBy: g } }, zn] = [globalThis, 7];\nuse(g, zn);'],
  ['defaulted rebind under a multi wrapper', 'const arr = [1, [2]];\nlet k, other;\n[{ findIndex: k = fb }, other] = [arr, 1];\nuse(k, other);'],
  ['shadow-alias guard alternate', 'const B = Array;\nexport const r = (function () {\n'
    + '  { const B = {}; var h = B; }\n  { const { of } = h; return typeof of; }\n})();\nuse(r);'],
  ['dead default in the extraction guard', 'const log = [];\nexport const r = (() => { try { throw [1]; }'
    + ' catch ({ [(log.push("k"), "includes")]: v = (log.push("dead"), 7) }) { return typeof v; } })();\nuse(r, log);'],
  ['sentinel pair under a bodyless if', 'const log = [];\nexport const r = (() => {'
    + ' if (1) var { [(log.push("k"), "at")]: a, other } = [3, [7]]; return [typeof a, typeof other]; })();\nuse(r, log);'],
  ['optional claim over a minted dispatch', 'export const r = [1, 2, 3].values()?.map(x => x * 2)?.toArray();\nuse(r);'],
  // ... and the INVOKER spelling of the same render: an optional dispatch prints as
  // `_x(_ref = recv)?.call(_ref, ...)`, whose hops one dialect spells with `Optional*` nodes while
  // the other flags plain ones - the census that reads a single spelling answers per LEG, and the
  // trailing member read pass one deliberately left native comes back a generic dispatch
  ['trailing read over an optional minted dispatch',
    'const arr = [1, 2];\nexport const r = arr?.at?.(1).includes?.(2);\nuse(r);'],
  // a sentinel standing in a PARAM pattern: our extraction for it went to the top of the
  // function BODY, so a census that only reads the list the FUNCTION sits in finds nothing and
  // the next pass re-extracts it as a live binding, minting a fresh sentinel every time. the
  // call site is what routes the pattern through the body-extract in the first place
  ['param sentinel extracted into the body',
    'function f({ from, ...rest } = globalThis.self.Array) { return from([1]); }\nuse(f());'],
  ['proxy hops in the rendered guard alternate', 'globalThis.probeHost = { tag: "h", read() { return this.tag; } };\n'
    + 'export const r = String(globalThis.window?.self.window.probeHost.read());\nuse(r);'],
  // the opt-outs the first pass honoured reach the second through its own reprint: every covered
  // node that the reprint separates from the author's directive is led by one of its own
  ['directive over two statements', '// core-js-disable-next-line\nuse(a.at(0)); use(b.flat());\nexport const r = c.includes(0);'],
  ['trailing -line over two statements', 'use(a.at(0)); use(b.flat()); // core-js-disable-line\nexport const r = c.includes(0);'],
  ['directive over two pattern properties', 'const {\n  // core-js-disable-next-line\n  at, flat,\n  includes,\n} = arr;\nexport const r = [at, flat, includes];'],
  ['directive over two object properties', 'const o = {\n  // core-js-disable-next-line\n  k: a.at(0), j: b.flat(),\n  m: c.includes(0),\n};\nexport const r = o;'],
  // the first pass leaves a sole constructor hop raw over its own proxy binding when the opt-out
  // covers the hop or a leaf; the second pass reads that residual and must not anchor it either
  ['opt-out on a sole ctor hop line', 'const {\n  // core-js-disable-next-line\n  Map: { groupBy: g },\n} = globalThis;\nexport const r = g;'],
  ['opt-out on a sole ctor hop leaf', 'const {\n  Object: {\n    // core-js-disable-next-line\n    groupBy: g,\n  },\n} = globalThis;\nexport const r = g;'],
  // a proxy-key sentinel a PRIOR pass printed under a wrapper a spread keeps alive: the pattern
  // binds nothing but the sentinel, and the unconditional hop trigger that consumes the residual
  // without asking the census extracts it as a live binding and mints one more on every pass
  ['nested iterator sentinel under a spread wrapper',
    'const { w: { [Symbol.iterator]: it } } = { ...extra, w: globalThis };\nuse(it);'],
  ['nested iterator sentinel beside a native sibling under a spread wrapper',
    'const { w: { [Symbol.iterator]: it, plain } } = { ...extra, w: globalThis };\nuse(it, plain);'],
  ['nested proxy-key sentinel under a spread wrapper', 'const { w: { Map: m } } = { ...extra, w: globalThis };\nuse(m);'],
  ['two-level proxy-key sentinel under a spread wrapper', 'const { w: { Array: { from: f } } } = { ...extra, w: globalThis };\nuse(f);'],
  // an identity guard compared through the realm entry - the build carries no safe raw name for an
  // excluded constructor - is our own render too, and its raw alternate must not be guarded again
  [
    'realm-compared identity guard',
    "const P = typeof Promise !== 'undefined' ? Promise : MyPromise;\nexport const r = P.withResolvers();",
    { exclude: ['promise/constructor'] },
  ],
  // the iterator key regenerator spells off an alias of the realm selection: the first pass already
  // drops the fallback the symbol leaves dead, so a second has nothing left to fold
  [
    'iterator key off a decided realm alias',
    "export function f() { var r = 'function' == typeof Symbol ? Symbol : {}, n = r.iterator || '@@iterator'; return e => e[n]; }",
  ],
];

for (const importStyle of ['import', 'require']) {
  const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 }, importStyle };
  const config = { configFile: false, babelrc: false, plugins: [[babelPlugin, OPTIONS]], filename: 'input.mjs' };

  for (const [label, source, extra = null, expectedImports = null] of CASES) {
    const caseConfig = extra ? { ...config, plugins: [[babelPlugin, { ...OPTIONS, ...extra }]] } : config;
    const first = (await transformAsync(source, caseConfig)).code;
    const second = (await transformAsync(first, caseConfig)).code;
    check(`pure re-transform is stable: ${ label } (${ importStyle })`, second, first);
    if (expectedImports) {
      const imports = new Set();
      for (const { groups } of first.matchAll(/["'](?<entry>@core-js\/pure\/[^"']+)["']/gu)) imports.add(groups.entry);
      check(`pure re-transform retains the exact entries: ${ label } (${ importStyle })`,
        JSON.stringify([...imports].sort()), JSON.stringify(expectedImports));
    }
  }
}

// A prior iterator sentinel has already been paired with its explicit terminal read.
// First-pass read counts matter too: later-pass byte stability alone hides one added getter.
for (const [label, source] of [
  ['return', 'import readIterator from "@core-js/pure/actual/get-iterator-method";\n'
    + 'export function read(extra){const{w:{[Symbol.iterator]:_unused}}={...extra,w:globalThis};return readIterator(globalThis);}'],
  ['throw', 'import readIterator from "@core-js/pure/actual/get-iterator-method";\n'
    + 'export function read(extra){const{w:{[Symbol.iterator]:_unused}}={...extra,w:globalThis};throw readIterator(globalThis);}'],
  ['require alias', 'const iteratorKey=require("@core-js/pure/actual/symbol/iterator");\n'
    + 'const readIterator=require("@core-js/pure/actual/get-iterator-method");\n'
    + 'function read(extra){const{w:{[iteratorKey]:_unused}}={...extra,w:globalThis};return readIterator(globalThis);}module.exports=read;'],
]) {
  const config = { configFile: false, babelrc: false, filename: label === 'require alias' ? 'input.cjs' : 'input.mjs',
    plugins: [[babelPlugin, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]] };
  let output = source;
  for (let pass = 1; pass <= 3; pass++) {
    output = (await transformAsync(output, config)).code;
    check(`terminal sentinel/${ label }/pass ${ pass }/only the source helper call`,
      output.matchAll(/\breadIterator\(/gu).toArray().length, 1);
    check(`terminal sentinel/${ label }/pass ${ pass }/no fresh sentinel name`, /_unused\d/u.test(output), false);
  }
}

// Expression and suspension hosts retain the already extracted iterator on their first pass.
for (const [label, kind, expression] of [
  ['effect', 'function', 'readIterator(globalThis);'],
  ['void', 'function', 'void readIterator(globalThis);'],
  ['yield', 'function*', 'yield readIterator(globalThis);'],
  ['await', 'async function', 'await readIterator(globalThis);'],
]) {
  const config = { configFile: false, babelrc: false, filename: 'input.mjs',
    plugins: [[babelPlugin, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]] };
  let output = 'import readIterator from "@core-js/pure/actual/get-iterator-method";\n'
    + `export ${ kind } read(extra){const{w:{[Symbol.iterator]:_unused}}={...extra,w:globalThis};${ expression }}`;
  for (let pass = 1; pass <= 3; pass++) {
    output = (await transformAsync(output, config)).code;
    check(`expression sentinel/${ label }/pass ${ pass }/only the source helper call`,
      output.matchAll(/\breadIterator\(/gu).toArray().length, 1);
    check(`expression sentinel/${ label }/pass ${ pass }/no fresh sentinel name`, /_unused\d/u.test(output), false);
  }
}

// Exporting a source binding keeps it live beside a factory value or call.
for (const held of ['dispatch', 'dispatch([])']) for (const entry of ['instance/at', 'array/instance/at']) {
  const config = { configFile: false, babelrc: false, filename: 'input.mjs',
    plugins: [[babelPlugin, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]] };
  let output = `import dispatch from "@core-js/pure/actual/${ entry }";export const{at:_unused}=[];export const held=${ held };`;
  for (let pass = 1; pass <= 3; pass++) {
    output = (await transformAsync(output, config)).code;
    check(`factory sentinel/${ entry }/${ held }/pass ${ pass }/exported value reads its receiver`,
      /^export const _unused = [\w$]+\(\[\]\);$/mu.test(output), true);
    check(`factory sentinel/${ entry }/${ held }/pass ${ pass }/factory binding remains a value`,
      output.includes(`export const held = ${ held };`), true);
  }
}

// A ready static import beside the source pattern does not make its exported binding unread.
{
  const config = { configFile: false, babelrc: false, filename: 'input.mjs',
    plugins: [[babelPlugin, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]] };
  let output = 'import method from "@core-js/pure/actual/array/from";export const{from:_unused}=Array;export const held=method;';
  for (let pass = 1; pass <= 3; pass++) {
    output = (await transformAsync(output, config)).code;
    check(`static sentinel/pass ${ pass }/exported binding receives the static`, output.includes('export const _unused = method;'), true);
    check(`static sentinel/pass ${ pass }/source alias remains`, output.includes('export const held = method;'), true);
  }
}

// Import deduplication is flavor-specific; a prior sentinel is recognizable across flavors.
// Exercise real sibling lowering as well as the source pass, with a receiver local to the VM.
{
  const e2e = requireBabel('../../scripts/bundle-tests/webpack.usage-pure-babel.config.js').module.rules[0].use.options;
  const runtimeRequire = createRequire(import.meta.url);
  const hosts = [
    ['returned', 'function', 'return readIterator(globalThis);'],
    ['thrown', 'function', 'throw readIterator(globalThis);'],
    ['effect', 'function', 'readIterator(globalThis);'],
    ['voided', 'function', 'void readIterator(globalThis);'],
    ['yielded', 'function*', 'yield readIterator(globalThis);'],
    ['awaited', 'async function', 'return await readIterator(globalThis);'],
  ];
  const flavors = [['actual', 'actual'], ['actual', 'full'], ['full', 'actual'], ['full', 'full']];
  const configurations = flavors.flatMap(([sourceMode, mode]) => [false, true].flatMap(lowered => ['default', 'named'].map(binder => ({
    sourceMode, mode, lowered, binder,
  }))));
  for (const { sourceMode, mode, lowered, binder } of configurations) {
    const bodies = hosts.map(([name, kind, expression], i) => `export ${ kind } ${ name }(extra){
      const{w:{[iteratorKey]:_unused${ i ? i + 1 : '' }}}={...extra,w:globalThis};${ expression }}`).join('\n');
    const source = `import ${ binder === 'named' ? '{default as iteratorKey}' : 'iteratorKey' } from '@core-js/pure/${ sourceMode }/symbol/iterator';
      import ${ binder === 'named' ? '{default as readIterator}' : 'readIterator' } from '@core-js/pure/${ sourceMode }/get-iterator-method';${ bodies }`;
    const loweringPlugins = lowered ? e2e.plugins.slice(1).map(([name, ...options]) => [
      requireBabel.resolve(name.replace(/^@babel\/(?!plugin-)/u, '@babel/plugin-')), ...options,
    ]) : [requireBabel.resolve('@babel/plugin-transform-modules-commonjs')];
    const { code } = await transformAsync(source, {
      ...lowered ? e2e : {},
      configFile: false,
      babelrc: false,
      filename: fileURLToPath(new URL('../e2e-usage-pure/destructuring-single-getter.js', import.meta.url)),
      plugins: [[babelPlugin, { method: 'usage-pure', mode, version: '4.0', targets: { ie: 11 } }], ...loweringPlugins],
    });
    for (const [name] of hosts) {
      const events = [];
      const receiver = {};
      function method() { return 23; }
      Object.defineProperty(receiver, Symbol.iterator, {
        get() {
          events.push('iterator');
          return method;
        },
      });
      const context = { exports: {}, require: specifier => specifier.endsWith('/global-this') ? receiver : runtimeRequire(specifier) };
      runInNewContext(code, context);
      const extra = {
        get marker() { events.push('spread'); return 1; },
      };
      let value;
      if (name === 'thrown') {
        try {
          context.exports[name](extra);
        } catch (error) {
          value = error;
        }
      } else {
        value = context.exports[name](extra);
        if (name === 'yielded') value = value.next().value;
        else if (name === 'awaited') value = await value;
      }
      const label = `sentinel/${ sourceMode }->${ mode }/${ binder }/${ lowered ? 'lowered' : 'source' }/${ name }`;
      check(`${ label }/source read order`, events.join(','), 'spread,iterator,iterator');
      check(`${ label }/result`, value, name === 'effect' || name === 'voided' ? undefined : method);
    }
  }
}

finish();
