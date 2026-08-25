// Usage-PURE re-transform stability for the probe/seal canon renders: the guarded forms the
// first pass emits (`null == _globalThis.window ? void 0 : _self`, throw probes, delete
// re-hangs) must survive a second pass byte-for-byte in CONTENT - a re-render would double
// guards or re-probe an already-probed claim; a dropped import would strand the render
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
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
  ['bare probe claimless', "let c = 0;\nexport const r = globalThis.window?.[(c++, 'self')]?.Array;"],
  ['bare probe plain tail', "let c = 0;\nexport const r = globalThis.window?.[(c++, 'self')].Number;"],
  ['sealed plain read', 'export const r = (globalThis.window?.self).Array;'],
  ['sealed claim with throw probe', 'export const r = (globalThis.window?.self).Array.of(6).at(0);'],
  ['sealed destructure probe', 'export const { of: r } = (globalThis.window?.self).Array;'],
  ['sealed synth default probe', 'export function f({ keys: r } = (globalThis.window?.self).Object) { return r; }'],
  ['sealed proto swap probe', 'export const r = (globalThis.window?.self).Map.prototype.has.call(new Map(), 1);'],
  ['delete through probe', 'export const r = delete globalThis.window?.self.customProp;'],
  ['kept assign with seal', 'let d;\nexport const r = (d = globalThis.window?.self).Array;'],
  // the ALIAS-held claim probe: the render leaves the source read as the non-final element of a
  // sequence whose tail is the ponyfill (`(held.of, _Array$of)`). the span check that recognises a
  // render inside one pass cannot see it after a RE-PARSE, so the claim owes a shape-level check -
  // without it the sequence grows by one copy per pass
  ['alias-held probe call', 'const held = globalThis.window?.Array;\nexport const r = held.of(1);'],
  ['alias-held probe read', 'const held = globalThis.window?.Array;\nexport const r = held.from;'],
  ['alias-held probe through a second alias',
    'const held = globalThis.window?.Array;\nconst chained = held;\nexport const r = chained.of(4);'],
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
  // the own-output census family (provider own-output.js): each shape below re-claimed and
  // grew the file per pass before its census/adoption arm - the same classes the unplugin
  // engines lock, spelled through THIS emitter's renders
  ['overwrite rebind', 'let m;\n({ y: { flat: m } } = { y: [1, [2]] });\nconst { from } = Array;\nuse(m, from);'],
  ['shadow-alias guard alternate', 'const B = Array;\nexport const r = (function () {\n'
    + '  { const B = {}; var h = B; }\n  { const { of } = h; return typeof of; }\n})();\nuse(r);'],
  ['dead default in the extraction guard', 'const log = [];\nexport const r = (() => { try { throw [1]; }'
    + ' catch ({ [(log.push("k"), "includes")]: v = (log.push("dead"), 7) }) { return typeof v; } })();\nuse(r, log);'],
  ['sentinel pair under a bodyless if', 'const log = [];\nexport const r = (() => {'
    + ' if (1) var { [(log.push("k"), "at")]: a, other } = [3, [7]]; return [typeof a, typeof other]; })();\nuse(r, log);'],
  ['optional claim over a minted dispatch', 'export const r = [1, 2, 3].values()?.map(x => x * 2)?.toArray();\nuse(r);'],
  // a sentinel standing in a PARAM pattern: our extraction for it went to the top of the
  // function BODY, so a census that only reads the list the FUNCTION sits in finds nothing and
  // the next pass re-extracts it as a live binding, minting a fresh sentinel every time. the
  // call site is what routes the pattern through the body-extract in the first place
  ['param sentinel extracted into the body',
    'function f({ from, ...rest } = globalThis.self.Array) { return from([1]); }\nuse(f());'],
  ['proxy hops in the rendered guard alternate', 'globalThis.probeHost = { tag: "h", read() { return this.tag; } };\n'
    + 'export const r = String(globalThis.window?.self.window.probeHost.read());\nuse(r);'],
];

for (const importStyle of ['import', 'require']) {
  const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 }, importStyle };
  const config = { configFile: false, babelrc: false, plugins: [[babelPlugin, OPTIONS]], filename: 'input.mjs' };

  for (const [label, source] of CASES) {
    const first = (await transformAsync(source, config)).code;
    const second = (await transformAsync(first, config)).code;
    check(`pure re-transform is stable: ${ label } (${ importStyle })`, second, first);
  }
}

finish();
