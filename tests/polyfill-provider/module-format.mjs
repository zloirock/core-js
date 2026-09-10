// Cross-parser tests for the module-format owner: what a file IS (its language fact and the host
// that loads it) and, separately, how the injection is spelled. The two used to be one answer and
// the emission option fed the language half, so asking for `require` output turned an ES module
// into a sloppy script - and every polyfill under an Annex-B shadow went with it.
// Both parsers run every scenario: the CommonJS evidence is spelled in TS-only forms (`export =`,
// `import x = require`) whose node shapes the two dialects have to agree on, and a type-only
// import erases in both, so it decides nothing.
import {
  detectCommonJS,
  moduleFormatMarkers,
  resolveModuleFormat,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { parseSync } from 'oxc-parser';
import { moduleIdLanguage } from '../../packages/core-js-polyfill-provider/helpers/path-normalize.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('module-format');

// --- the census: what the body spells ---

// `[source, hasLiveESM, hasCJS]`. one row per shape, and the negatives are the point: a spelling
// the author bound themselves is their own object, and a declaration tsc erases carries nothing
const CENSUS = [
  // proof of a module
  ['import a from "./a"; a();', true, false],
  ['import "./a";', true, false],
  ['export {};', true, false],
  ['export const a = 1;', true, false],
  ['export default 1;', true, false],
  ['export * from "./a";', true, false],
  ['export * as ns from "./a";', true, false],
  ['import.meta.url;', true, false],
  ['function f() { return import.meta.url; }', true, false],
  ['const x = await f();', true, false],
  ['for await (const x of it) g(x);', true, false],
  // erased whole by tsc: no runtime marker, so it proves nothing either way
  ['import type { A } from "./a"; module.exports = 1;', false, true],
  ['import { type A } from "./a"; module.exports = 1;', false, true],
  ['type A = 1; export type { A }; module.exports = 1;', false, true],
  ['export interface I {} module.exports = 1;', false, true],
  ['export declare const q: number; module.exports = 1;', false, true],
  // evidence of CommonJS, at every depth and in every host
  ['module.exports = f;', false, true],
  ['exports.x = 1;', false, true],
  ['exports = {};', false, true],
  ['module["exports"] = f;', false, true],
  ['module.exports = f, init();', false, true],
  ['if (x) { module.exports = f; }', false, true],
  ['(function () { module.exports = f; })();', false, true],
  ['const dep = require("./dep"); dep();', false, true],
  ['const { a } = require("./dep");', false, true],
  ['g(require("./dep"));', false, true],
  ['Object.defineProperty(exports, "x", {});', false, true],
  ['Object.defineProperties(exports, {});', false, true],
  ['Object.defineProperty(module.exports, "x", {});', false, true],
  ['Reflect.defineProperty(exports, "x", {});', false, true],
  ['const p = __dirname + "/x";', false, true],
  ['const p = __filename;', false, true],
  ['const x = 1; export = x;', false, true],
  ['import X = require("./x"); X();', false, true],
  ['export import X = require("./x");', false, true],
  // ... and an AMBIENT declaration binds nothing at runtime, so it shadows nothing: tsc erases it
  // and the read reaches the host's own wrapper name. the positives above pair with these - a
  // census reading the declaration as a binding suppresses the evidence and spells the injection
  // as an `import` into a file that is CommonJS
  ['declare const require: (m: string) => unknown; require("./dep");', false, true],
  ['declare const module: any; module.exports = 1;', false, true],
  ['declare var exports: any; exports.x = 1;', false, true],
  ['declare const __dirname: string; g(__dirname);', false, true],
  ['import type { require } from "./a"; require("./dep");', false, true],
  // the author bound the name themselves, so the spelling is about their object
  ['let exports = {}; exports.x = 1;', false, false],
  ['const module = { exports: {} }; module.exports = 1;', false, false],
  ['function f(module) { module.exports = 1; }', false, false],
  ['function f(exports) { exports.x = 1; }', false, false],
  ['let require = f; require("./a");', false, false],
  ['const __dirname = "/"; g(__dirname);', false, false],
  // a shadow in ANOTHER scope leaves the top-level spelling alone
  ['function f(module) { module.x = 1; }\nmodule.exports = 1;', false, true],
  // a shadow's reach is its KIND's, not the block it was spelled in: a `var` climbs to the
  // function around it and covers the read below, a `let` stays in its block and covers nothing
  ['function f() { { var module; } module.exports = 1; }', false, false],
  ['function f() { if (x) { var module; } module.exports = 1; }', false, false],
  ['function f() { { let module; } module.exports = 1; }', false, true],
  ['{ var require; }\nrequire("./dep");', false, false],
  ['{ let require; }\nrequire("./dep");', false, true],
  // the kind is spelled on the DECLARATION, one level above the declarator the census visits, and
  // the head shapes are where the two parsers could disagree about what that level is
  ['function f() { for (var module of xs) {} module.exports = 1; }', false, false],
  ['function f() { for (var module = 0;;) {} module.exports = 1; }', false, false],
  ['function f() { switch (x) { case 1: var module; } module.exports = 1; }', false, false],
  ['function f() { try {} catch (e) { var module; } module.exports = 1; }', false, false],
  ['function f() { for (let module of xs) {} module.exports = 1; }', false, true],
  // neither: a dynamic import is legal in a script, and a plain member key is not a read
  ['import("./a").then(g);', false, false],
  ['const o = { module: { exports: 1 } };', false, false],
  ['g();', false, false],
];

for (const [source, hasLiveESM, hasCJS] of CENSUS) {
  runBoth(`census: ${ source.replaceAll('\n', ' ') }`, source, (adapter, prog, label) => {
    checkDeep(label, moduleFormatMarkers(prog.node ?? prog), { hasLiveESM, hasCJS });
  });
}

// `detectCommonJS` is the shorthand over the census, and a module marker vetoes the verdict
runBoth('detectCommonJS: CommonJS body', 'module.exports = 1;', (adapter, prog, label) => {
  check(label, detectCommonJS(prog.node ?? prog), true);
});
runBoth('detectCommonJS: a live import vetoes it', 'import "./a";\nmodule.exports = 1;', (adapter, prog, label) => {
  check(label, detectCommonJS(prog.node ?? prog), false);
});
runBoth('detectCommonJS: a type-only import does not', 'import type { A } from "./a";\nmodule.exports = 1;', (adapter, prog, label) => {
  check(label, detectCommonJS(prog.node ?? prog), true);
});

// --- the id's own answer ---

for (const [id, expected] of [
  ['/a.js', { ts: false, jsx: true, script: false, esm: false }],
  ['/a.JS', { ts: false, jsx: true, script: false, esm: false }],
  ['/a.jsx', { ts: false, jsx: true, script: false, esm: false }],
  ['/a.mjs', { ts: false, jsx: true, script: false, esm: true }],
  ['/a.cjs', { ts: false, jsx: true, script: true, esm: false }],
  ['/a.CJS', { ts: false, jsx: true, script: true, esm: false }],
  // the ts family spends `<` on the legacy angle-bracket cast, so only `.tsx` admits JSX
  ['/a.ts', { ts: true, jsx: false, script: false, esm: false }],
  ['/a.TS', { ts: true, jsx: false, script: false, esm: false }],
  ['/a.tsx', { ts: true, jsx: true, script: false, esm: false }],
  ['/a.mts', { ts: true, jsx: false, script: false, esm: true }],
  ['/a.cts', { ts: true, jsx: false, script: true, esm: false }],
  // a declaration file emits nothing, and an id naming no source at all names no language
  ['/a.d.ts', null],
  ['/a.D.TS', null],
  ['/a.vue', null],
  ['/a', null],
]) {
  checkDeep(`moduleIdLanguage/${ id }`, moduleIdLanguage(id), expected);
}

// --- the verdict ---

// `[label, id, source, declaredSourceType, importStyleOption, sourceType, importStyle]`
const FORMAT = [
  // live module evidence is PROOF and outranks everything, the emission option included
  ['esm body', '/p.js', 'import "./a";', 'module', null, 'module', 'import'],
  ['esm body under a require option', '/p.js', 'import "./a";', 'module', 'require', 'module', 'require'],
  ['esm body in a .cjs', '/p.cjs', 'import "./a";', 'script', null, 'module', 'import'],
  // the option decides the SPELLING and nothing else
  ['cjs body under an import option', '/p.js', 'module.exports = 1;', 'module', 'import', 'script', 'import'],
  ['bare body under a require option', '/p.js', 'g();', 'module', 'require', 'module', 'require'],
  // the extension outranks a body with no module proof, and a declared `module` is a default
  ['cjs extension, cjs body', '/p.cjs', 'module.exports = 1;', 'module', null, 'script', 'require'],
  ['cjs extension, bare body', '/p.cjs', 'g();', 'module', null, 'script', 'require'],
  ['mjs extension, cjs body', '/p.mjs', 'module.exports = 1;', 'module', null, 'module', 'require'],
  // a declared SCRIPT is a statement about the file; a declared module is not
  ['host declared a script', '/p.js', 'g();', 'script', null, 'script', 'require'],
  ['host declared a script with a cjs body', '/p.js', 'module.exports = 1;', 'script', null, 'script', 'require'],
  // a MIXED body spells both, and the emission follows the ESM: a `require` at the top of a file
  // that still imports or exports is a ReferenceError under the only loader that takes the rest of
  // it. Whether a statement will be CONSUMED before the print is not the owner's question - only
  // `entry-global` consumes one, and only a core-js specifier
  ['mixed: an export beside CommonJS', '/p.js', 'export const a = 1;\nrequire("./d");', 'module', null, 'module', 'import'],
  ['mixed: a binding import beside CommonJS', '/p.js', 'import d from "./d";\nrequire("./e");', 'module', null, 'module', 'import'],
  ['mixed: a bare import beside CommonJS', '/p.js', 'import "./d";\nrequire("./e");', 'module', null, 'module', 'import'],
  ['mixed: top-level await beside CommonJS', '/p.js', 'await f();\nrequire("./e");', 'module', null, 'module', 'import'],
  // nothing to go on at all: a module, which is what a bundler feeds a plugin
  ['no evidence', '/p.js', 'g();', 'module', null, 'module', 'import'],
  ['no id at all', null, 'module.exports = 1;', null, null, 'script', 'require'],
];

// a caller with no program at all degrades the way the census does - a module with the option's
// own spelling - rather than throwing out of the verdict store
for (const [label, program] of [['null', null], ['undefined', undefined], ['a string', 'x']]) {
  const format = resolveModuleFormat({ program, importStyleOption: 'require' });
  checkDeep(`format/no program (${ label })`,
    { sourceType: format.sourceType, importStyle: format.importStyle },
    { sourceType: 'module', importStyle: 'require' });
}

for (const [label, id, source, declaredSourceType, importStyleOption, sourceType, importStyle] of FORMAT) {
  runBoth(`format: ${ label }`, source, (adapter, prog, rowLabel) => {
    const program = prog.node ?? prog;
    program.sourceType = declaredSourceType ?? 'module';
    const format = resolveModuleFormat({ id, program, declaredSourceType, importStyleOption });
    checkDeep(rowLabel, {
      sourceType: format.sourceType,
      importStyle: format.importStyle,
    }, { sourceType, importStyle });
  });
}

// --- the verdict is stored on the node, so ask it twice ---

// the two side tables live at module scope and outlive any one plugin instance: a second core-js
// plugin in the same pipeline reaches the SAME Program with an emission option of its own. the
// language half may not move under it, or the first plugin's Annex-B answers change behind it -
// which is the whole reason `importStyle` is absent from that half
runBoth('verdict: a flipped emission option leaves the language half alone',
  'module.exports = 1;', (adapter, prog, label) => {
    const program = prog.node ?? prog;
    program.sourceType = 'script';
    function ask(importStyleOption) {
      return resolveModuleFormat({ id: '/p.js', program, declaredSourceType: 'script', importStyleOption });
    }
    const first = ask('import');
    const second = ask('require');
    const third = ask('import');
    checkDeep(label, [
      second.sourceType,
      third.sourceType,
      // ... while the SPELLING is the caller's own each time, and this row means nothing unless
      // the two callers really did ask for different ones
      [second.importStyle, third.importStyle],
    ], [
      first.sourceType,
      first.sourceType,
      ['require', 'import'],
    ]);
  });

// --- the verdict's own domain, checked for INTERNAL coherence ---

// the three inputs crossed whole - what the host declared, what the id names, what the body spells -
// and each cell asked whether the three answers agree with each other rather than with a table typed
// twice. The table above says what each row SHOULD be; this says no row can be self-contradictory
{
  const IDS = [['none', null], ['.js', '/p.js'], ['.cjs', '/p.cjs'], ['.mjs', '/p.mjs']];
  const DECLARED = [['module', 'module'], ['script', 'script'], ['none', null]];
  const BODIES = [
    ['empty', 'g();', false, false],
    ['esm', 'export const a = 1;', true, false],
    ['cjs', 'module.exports = 1;', false, true],
    ['mixed', 'export const a = 1;\nmodule.exports = 1;', true, true],
  ];
  let cells = 0;
  for (const [idLabel, id] of IDS) {
    for (const [declaredLabel, declaredSourceType] of DECLARED) {
      for (const [bodyLabel, source, esm, cjs] of BODIES) {
        cells++;
        // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
        const { program } = parseSync(id ?? '/p.js', source, { lang: 'jsx', sourceType: 'module' });
        program.sourceType = declaredSourceType ?? 'module';
        const format = resolveModuleFormat({ id, program, declaredSourceType });
        const broken = [];
        // live module evidence is PROOF: nothing may read such a body as a script
        if (esm && format.sourceType !== 'module') broken.push('esm body read as a script');
        if (!['module', 'script'].includes(format.sourceType)) broken.push('unknown source type');
        if (format.sourceIsMixed !== (esm && cjs)) broken.push('sourceIsMixed disagrees with the body');
        if (!['import', 'require'].includes(format.importStyle)) broken.push('unknown spelling');
        // nothing consumes ESM here, so a body that keeps its own may not be spelled `require`
        if (format.importStyle === 'require' && esm) broken.push('require in a kept module');
        check(`format-domain/${ idLabel }/${ declaredLabel }/${ bodyLabel }`, broken.join('; '), '');
      }
    }
  }
  check('format-domain/the cross is whole', cells, IDS.length * DECLARED.length * BODIES.length);
}

// --- `require` is not a spelling every program has ---

// our injected call lands at the TOP of the body, so the question is what the name holds THERE.
// `[label, id, source, importStyle, requireDeclined]`
const SPELLABLE = [
  // a hoisted function carries its body from the first line, so the call reaches the user's own
  ['top-level function require', '/p.js', 'function require(x) { return x; }\nmodule.exports = 1;', 'import', true],
  // a lexical binding is in TDZ there
  ['lexical require', '/p.js', 'let require = f;\nmodule.exports = 1;', 'import', true],
  ['class require', '/p.js', 'class require {}\nmodule.exports = 1;', 'import', true],
  // a `var` only REDECLARES: inside the wrapper it starts out holding the loader the host passed
  ['var require in a wrapper', '/p.cjs', 'var require = f;\nmodule.exports = 1;', 'require', false],
  // a block function does not hoist over a wrapper PARAMETER (B.3.3.1), so it shadows nothing there
  ['block function require in a wrapper', '/p.cjs', '{ function require() {} }\nmodule.exports = 1;', 'require', false],
  ['no binding at all', '/p.cjs', 'module.exports = 1;', 'require', false],
];

for (const [label, id, source, importStyle, requireDeclined] of SPELLABLE) {
  runBoth(`spellable: ${ label }`, source, (adapter, prog, rowLabel) => {
    const program = prog.node ?? prog;
    program.sourceType = 'script';
    const format = resolveModuleFormat({ id, program, declaredSourceType: 'script' });
    checkDeep(rowLabel, { importStyle: format.importStyle, requireDeclined: format.requireDeclined },
      { importStyle, requireDeclined });
  });
}

// a MODULE asked for the `require` spelling by its caller is the one host left where a program-level
// `var require` swallows the call: no loader parameter stands behind the name there
runBoth('spellable: var require in a module asked to spell it', 'var require = f;\nexport const a = 1;',
  (adapter, prog, label) => {
    const format = resolveModuleFormat({ id: '/p.js', program: prog.node ?? prog, importStyleOption: 'require' });
    checkDeep(label, { importStyle: format.importStyle, requireDeclined: format.requireDeclined },
      { importStyle: 'import', requireDeclined: true });
  });

finish();
