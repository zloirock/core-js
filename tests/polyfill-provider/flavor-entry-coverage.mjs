// The two flavors resolve the SAME claim through two entry alphabets, so nothing that compares them
// to each other can see the answer this suite checks: when a constructor reference is OPAQUE - its
// value leaves the positions the file can read back - the claim owes the whole family, because a
// read through wherever the value lands is unresolvable. usage-pure spells that as the NAMESPACE
// entry; usage-global has to inject that same namespace entry's modules, which install the statics
// on the global slot the escaped reference points at. Neither the fixtures nor the differential can
// state it: a fixture locks whatever the emitter prints, and the differential compares the two
// EMITTERS - both flavors dropping the same static agree with each other and pass.
//
// The obligation is read off `@core-js/compat/entries`, never spelled here: a pure entry is WIDE
// when its `<entry>/constructor` sibling carries strictly fewer modules, and the modules it adds are
// exactly what the escape owes. The negative half is the same data read the other way - a reference
// that stays HOME must not pull them, or a blanket widening would pass this suite too.
import entries from '@core-js/compat/entries' with { type: 'json' };
import { transformAsync } from '@babel/core';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { createChecker, scenarioSource } from './harness.mjs';

const { check, fail, finish, pass } = createChecker('flavor-entry-coverage');

const GLOBAL = { method: 'usage-global', version: '4.0', targets: { ie: 11 } };
const PURE = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
const IMPORT_RE = /["'](?<source>(?:@core-js\/[^"'/]+|core-js(?:-pure)?)\/[^"']+)["']/gu;

function polyfillImports(code) {
  const found = new Set();
  for (const match of (code ?? '').matchAll(IMPORT_RE)) found.add(match.groups.source);
  return found;
}

// `configFile` / `babelrc` off: the repository root carries a babel config, so an invocation whose
// cwd is the root would lower the source before the plugin sees it and the answer would depend on
// how the suite was started rather than on what the provider decided
async function babelImports(source, options, filename = 'input.mjs') {
  const out = await transformAsync(scenarioSource(source), {
    plugins: [['@core-js', options]],
    filename,
    configFile: false,
    babelrc: false,
    parserOpts: filename.endsWith('.ts') ? { plugins: ['typescript'] } : undefined,
  });
  return polyfillImports(out?.code);
}

function unpluginImports(source, options, filename = 'input.mjs') {
  return polyfillImports(createUnplugin(options).transform(scenarioSource(source), filename)?.code ?? source);
}

// the modules a WIDE pure entry carries beyond its constructor sibling - the statics an escaped
// reference has to bring with it. null for an entry that is not wide (`actual/set` adds nothing over
// `actual/set/constructor`, so an escaping `Set` owes no more than a home one)
function wideEntryExtras(entry) {
  const key = entry.replace(/^@core-js\/pure\//u, '');
  const wide = entries[key];
  const narrow = entries[`${ key }/constructor`];
  if (!wide || !narrow) return null;
  const extras = wide.filter(module => !narrow.includes(module));
  return extras.length ? extras : null;
}

// what usage-global owes for one source, derived from what usage-pure resolved on the same source.
// the pure side is read through ONE emitter on purpose: it is the oracle's INPUT, not the thing
// under test, and two emitters disagreeing on it is what `cross-parser-equivalence` exists for
async function owedModules(source) {
  const owed = new Map();
  for (const entry of await babelImports(source, PURE)) {
    for (const module of wideEntryExtras(entry) ?? []) owed.set(module, entry);
  }
  return owed;
}

// the reference positions the escape census answers for - its own case list, one row each, so a
// position it stops stamping surfaces here rather than in whichever fixture happened to use it
const ESCAPES = {
  'call argument': reference => `hand(${ reference });`,
  'new argument': reference => `use(new Holder(${ reference }));`,
  'default export': reference => `export default ${ reference };`,
  'member slot write': reference => `sink.slot = ${ reference };`,
  'object literal value': reference => `hand({ k: ${ reference } });`,
  'array literal element': reference => `hand([${ reference }]);`,
  'branching return': reference => `function f(q) { if (q) return ${ reference }; return null; }\nhand(f);`,
  'return of a function with params': reference => `function f(q) { return ${ reference }; }\nhand(f);`,
  'parameter default': reference => `function f(M = ${ reference }) { hand(M); }\nhand(f);`,
  'throw argument': reference => `function f() { throw ${ reference }; }\nhand(f);`,
  'yielded value': reference => `function* g() { yield ${ reference }; }\nhand(g);`,
  'tagged-template expression': reference => `tag\`x\${ ${ reference } }\`;`,
  'method return': reference => `hand({ m() { return ${ reference }; } });`,
  'through a destructured slot': reference => `const [w] = [${ reference }];\nhand(w);`,
  'through a written binding': reference => `let w;\nw = ${ reference };\nhand(w);`,
};

// the same reference standing where nothing outside can read it back - the negative that keeps the
// positive half from passing under a widening that fired unconditionally. the last two are the
// channels a value reaches WITHOUT leaving: a slot of a container this file only ever reads through
// a key, and a destructuring parameter of a callee spelled inline, whose slots are all the body binds
const HOME = {
  'new callee': reference => `use(new ${ reference }());`,
  'instance method call': reference => `use(new ${ reference }(s).then(f));`,
  'extends clause': reference => `class C extends ${ reference } {}\nuse(new C(s));`,
  'local container slot': reference => `const box = {};\nbox.slot = ${ reference };\nuse(new box.slot(s));`,
  'inline callee pattern parameter': reference => `use((({ name }) => name)(${ reference }));`,
};

// how the reference is SPELLED decides which node the stamp names - a bare name, the member off the
// proxy-global surface, or an alias hop the census follows. the axis is deliberately NOT crossed
// with every position: once a value node enters the stamping walk its spelling takes the same path
// whatever pushed it there, so the cross would re-run three paths fifteen times. it is crossed with
// the three positions that ENTER that walk differently instead - a value pushed whole, a leaf under
// a container literal, and a value reaching a name through the alias graph
const SPELLINGS = {
  'bare identifier': name => ({ prelude: '', reference: name }),
  'proxy-global member': name => ({ prelude: '', reference: `globalThis.${ name }` }),
  'const alias': name => ({ prelude: `const Held = ${ name };\n`, reference: 'Held' }),
};
const SPELLING_POSITIONS = ['call argument', 'object literal value', 'through a written binding'];

// the constructor axis branches on the SHAPE of what the namespace adds: `Map` a single static of
// its own namespace, `Promise` a family that reaches outside it (`es.reflect.own-keys`) and carries
// proposals. a constructor whose namespace adds nothing is not a third row - it would assert on an
// empty set - it is the data row at the bottom
const CONSTRUCTORS = ['Map', 'Promise'];

async function checkEscape(label, source) {
  const owed = await owedModules(source);
  // a form where pure resolved no wide entry proves nothing either way: saying so keeps a corpus
  // that stopped reaching the widening from reading as coverage
  if (!owed.size) return fail(label, 'pure resolved no wide entry - the form no longer escapes');
  for (const [emitter, imports] of [['babel', await babelImports(source, GLOBAL)], ['unplugin', unpluginImports(source, GLOBAL)]]) {
    for (const [module, entry] of owed) {
      if (imports.has(`core-js/modules/${ module }`)) pass();
      else fail(`${ label } [${ emitter }]`, `pure took the wide '${ entry }' but usage-global left out core-js/modules/${ module }`);
    }
  }
}

for (const name of CONSTRUCTORS) {
  for (const [spelling, spell] of Object.entries(SPELLINGS)) {
    const { prelude, reference } = spell(name);
    const positions = spelling === 'bare identifier' ? Object.keys(ESCAPES) : SPELLING_POSITIONS;
    for (const position of positions) {
      await checkEscape(`${ name } escapes by ${ position } as a ${ spelling }`, prelude + ESCAPES[position](reference));
    }
    // the home half asserts against the obligation of the ESCAPING form of the same reference: a
    // home form resolves the narrow entry, which owes nothing and would assert on an empty set
    const owed = await owedModules(prelude + ESCAPES['call argument'](reference));
    for (const [position, template] of Object.entries(HOME)) {
      const source = prelude + template(reference);
      const label = `${ name } stays home at ${ position } as a ${ spelling }`;
      for (const [emitter, imports] of [['babel', await babelImports(source, GLOBAL)], ['unplugin', unpluginImports(source, GLOBAL)]]) {
        for (const module of owed.keys()) {
          check(`${ label } [${ emitter }]: no core-js/modules/${ module }`, imports.has(`core-js/modules/${ module }`), false);
        }
      }
    }
  }
}

// the SECOND direction, and the one nothing else in the tree can state. The half above asks whether
// usage-global carried what an escape obliges; a regression that carries MORE is invisible to it, to
// the fixtures (which lock whatever the emitters print) and to the differential (whose two legs read
// this same census and agree). Read off the same compat data the other way: where usage-pure resolved
// the NARROW spelling of a constructor - its `<entry>/constructor` sibling, or a static under it -
// the reference stayed where this file reads it back, and usage-global owes nothing past what it
// resolved. The modules its namespace entry adds over the constructor sibling are exactly the shape
// an over-wide answer takes, so they are what the row asserts the ABSENCE of.
function narrowedEntryExtras(imports) {
  const wide = new Set();
  const resolved = new Set();
  const owed = new Map();
  for (const entry of imports) {
    const key = entry.replace(/^@core-js\/pure\//u, '');
    for (const module of entries[key] ?? []) resolved.add(module);
    // the namespace entry IS the wide answer for its own base - the escape half above owns that form
    if (wideEntryExtras(entry)) wide.add(key);
    else for (const module of wideEntryExtras(`@core-js/pure/${ key.replace(/\/[^/]+$/u, '') }`) ?? []) {
      owed.set(module, key);
    }
  }
  // what the READ itself resolved to is owed by usage-global whatever the escape census says - the
  // over-wide answer is only the rest of the namespace, and asserting on the read's own module would
  // fail every row that reads one of the statics the namespace adds
  for (const [module, key] of owed) {
    if (resolved.has(module) || wide.has(key.replace(/\/[^/]+$/u, ''))) owed.delete(module);
  }
  return owed;
}

async function checkStaysNarrow(label, source) {
  const owed = narrowedEntryExtras(await babelImports(source, PURE));
  // a form where pure resolved no narrow entry under a wide-able namespace asserts on an empty set
  if (!owed.size) return fail(label, 'pure resolved no narrow entry - the form proves nothing either way');
  for (const [emitter, imports] of [['babel', await babelImports(source, GLOBAL)], ['unplugin', unpluginImports(source, GLOBAL)]]) {
    for (const [module, entry] of owed) {
      if (imports.has(`core-js/modules/${ module }`)) {
        fail(`${ label } [${ emitter }]`, `pure stayed narrow at '${ entry }' but usage-global carried core-js/modules/${ module }`);
      } else pass();
    }
  }
}

// the positions that keep a constructor readable by THIS file, each ending in a read the pure flavor
// resolves narrowly: the channel FC-378 came in by, beside the plain reads it has to match. the
// pattern key is a plain non-polyfilled property on purpose - the row is about the RECEIVER's entry,
// and a key whose own module is one of the namespace extras would subtract the very assertion
// the shadowed spelling this half came in by: the parameter list shadows the constructor's own name
// and the body never reads it, so the argument is all that reaches the pattern
function shadowedPatternParameter(name) {
  return `export const v = !function ({ name: got }, ${ name }) { return got; } (globalThis.${ name });`;
}

const NARROW = {
  'direct constructor read': name => `use(new ${ name }(s));`,
  'constructor alias': name => `const A = ${ name };\nuse(new A(s));`,
  'branching local return': name => `use(new ((() => { if (flag) return ${ name }; return ${ name }; })())(s));`,
  'returned second argument': name => `function pick(label, value) { effect(label); return value; } use(new (pick(1, ${ name }))(s));`,
  'container literal slot': name => `const c = { k: ${ name } };\nuse(new c.k(s));`,
  'inline callee pattern parameter': name => `export const v = (({ name: got }) => got)(${ name });`,
  'inline callee pattern parameter, shadowed': shadowedPatternParameter,
  'inline arrow pattern parameter': name => `export const v = (({ name: got }) => got)(globalThis.${ name });`,
};

// A native constructor core-js defines no module for owes nothing when handed out: its statics and
// prototype methods load where a read names them. A static read of a locally returned constructor
// exposes only that static's result, while a static read the claim side does not name - by a key
// nothing names, or through a subclass inheriting it - may land on any own static. Prototype
// methods require their own usage even when a static returns an instance or the prototype itself.
for (const [label, source, used, wide] of [
  ['local IIFE', 'export const value = (() => { if (flag) return Array; return custom; })().of(3);', true, false],
  ['named local call', 'function pick() { if (flag) return Array; return custom; } export const value = pick().of(3);', true, false],
  ['unused function', 'function pick() { if (flag) return Array; return custom; }', false, false],
  ['escaped value', 'hand(Array);', false, false],
  ['escaped static result', 'export const value = Array.of(3);', true, false],
  ['escaped prototype', 'export const value = Array.prototype;', false, false],
  ['escaped call', 'hand((() => { if (flag) return Array; return custom; })());', false, false],
  ['escaped container call', 'hand({ value: (() => { if (flag) return Array; return custom; })() });', false, false],
  ['exported function', 'export function pick() { if (flag) return Array; return custom; }', false, false],
  ['exported subclass', 'export class Derived extends (() => { if (flag) return Array; return custom; })() {}', false, false],
  ['unnamed key', 'export const value = Array[key](3);', true, true],
  ['inherited static', 'class Sub extends Array {} export const value = Sub.of(3);', true, true],
]) {
  for (const [emitter, imports] of [
    ['babel', await babelImports(source, GLOBAL)],
    ['unplugin', unpluginImports(source, GLOBAL)],
  ]) {
    check(`${ emitter }: ${ label }: of obligation`, imports.has('core-js/modules/es.array.of'), used);
    check(`${ emitter }: ${ label }: other statics`, imports.has('core-js/modules/es.array.from'), wide);
    check(`${ emitter }: ${ label }: instance methods`, imports.has('core-js/modules/es.array.find'), false);
  }
}

// Explicit prototype usage remains an independent obligation, even after a static returns it.
for (const [owner, own, unrelated, used, created] of [
  ['Number', 'es.number.is-integer', 'es.number.to-fixed', '(1).toFixed(0)', 'Number("1")'],
  ['RegExp', 'es.regexp.escape', 'es.regexp.test', '/x/.test("x")', 'RegExp("x")'],
]) {
  for (const [emitter, collect] of [['babel', babelImports], ['unplugin', unpluginImports]]) {
    const imports = await collect(`export function read(key) { return ${ owner }[key]; }`, GLOBAL);
    check(`${ emitter }: ${ owner } unknown static carries own methods`, imports.has(`core-js/modules/${ own }`), true);
    check(`${ emitter }: ${ owner } unknown static does not use prototype methods`, imports.has(`core-js/modules/${ unrelated }`), false);
    const consumed = await collect(`export const value = ${ used };`, GLOBAL);
    check(`${ emitter }: ${ owner } named prototype method is served`, consumed.has(`core-js/modules/${ unrelated }`), true);
    const local = await collect(`export const value = ${ created };`, GLOBAL);
    check(`${ emitter }: ${ owner } call does not expose its statics`, local.has(`core-js/modules/${ own }`), false);
  }
}

// A replacement namespace keeps its full entry, including its own symbol tag.
for (const [emitter, imports] of [
  ['babel', await babelImports('export function read(key) { return Reflect[key]; }', { ...GLOBAL, mode: 'full' })],
  ['unplugin', unpluginImports('export function read(key) { return Reflect[key]; }', { ...GLOBAL, mode: 'full' })],
]) check(`${ emitter }: full Reflect keeps its symbol tag`, imports.has('core-js/modules/es.reflect.to-string-tag'), true);

// A default can replace a parameter before the function returns it. Its write has unknown
// scope provenance when the parameter and body share a name, rather than a file-level owner.
const defaultRebind = 'function read(value, later = (value = Array)) { return value; } use(read(Promise).of(4));';
for (const [emitter, imports] of [
  ['babel', await babelImports(defaultRebind, GLOBAL)],
  ['unplugin', unpluginImports(defaultRebind, GLOBAL)],
]) {
  check(`${ emitter }: a default write retains its selected static`, imports.has('core-js/modules/es.array.of'), true);
  check(`${ emitter }: a default write needs no unrelated static`, imports.has('core-js/modules/es.array.from'), false);
}

// A returned array's named method still needs its own polyfill.
for (const [emitter, imports] of [
  ['babel', await babelImports('export const value = Array.of(3).find(x => x);', GLOBAL)],
  ['unplugin', unpluginImports('export const value = Array.of(3).find(x => x);', GLOBAL)],
]) {
  check(`${ emitter }: a returned array's named method is served`, imports.has('core-js/modules/es.array.find'), true);
  check(`${ emitter }: a returned array does not owe unrelated methods`, imports.has('core-js/modules/es.array.flat'), false);
}

for (const name of CONSTRUCTORS) {
  for (const [position, spell] of Object.entries(NARROW)) {
    await checkStaysNarrow(`${ name } stays narrow at ${ position }`, spell(name));
  }
}

const returnedLoopReceiver = 'function receiver(label, value) { log(label); return value; }'
  + ' for (var { w: { from } } of [{ w: receiver(1, Array) }, { w: receiver(2, { from: custom }) }]) {'
  + ' use(from([7]), () => from([8])); }';
for (const [emitter, imports] of [
  ['babel', await babelImports(returnedLoopReceiver, GLOBAL)],
  ['unplugin', unpluginImports(returnedLoopReceiver, GLOBAL)],
]) {
  check(`${ emitter }: returned loop receiver needs from`, imports.has('core-js/modules/es.array.from'), true);
  check(`${ emitter }: returned loop receiver does not expose other statics`, imports.has('core-js/modules/es.array.of'), false);
  check(`${ emitter }: returned loop receiver does not expose instance methods`, imports.has('core-js/modules/es.array.at'), false);
}
for (const [emitter, imports] of [
  ['babel', await babelImports(returnedLoopReceiver, PURE)],
  ['unplugin', unpluginImports(returnedLoopReceiver, PURE)],
]) {
  check(`${ emitter }: returned loop receiver keeps the pure extraction`, [...imports].join(','), '@core-js/pure/actual/array/from');
}

// the obligation is DERIVED, and this is where that shows: a constructor whose namespace entry adds
// nothing over its constructor entry owes nothing extra when it escapes. Without it, a suite that
// widened every constructor unconditionally would read exactly the same on every row above
check('a namespace adding no statics owes nothing (actual/set)', wideEntryExtras('@core-js/pure/actual/set'), null);
check('... and the one that does is named by compat, not here (actual/map)',
  wideEntryExtras('@core-js/pure/actual/map')?.join(','), 'es.map.group-by');

// Import sets distinguish the argument's obligation from the source spelling. A named parameter
// reads only ownKeys from a proven Reflect source; its other statics must stay absent. Unused
// arguments owe no static, while opaque consumers still need the whole namespace.
/* eslint-disable no-template-curly-in-string -- these are source snippets containing tagged interpolations */
const PARAMETER_READS = [
  ['named call', 'function read(strings, ns) { return ns.ownKeys({}); } read([""], Reflect);', true],
  ['named tag', 'function read(strings, ns) { return ns.ownKeys({}); } read`${Reflect}`;', true],
  ['inline tag', '(function(strings, ns) { return ns.ownKeys({}); })`${Reflect}`;', true],
  ['pattern tag', 'function read(strings, { ownKeys }) { return ownKeys({}); } read`${Reflect}`;', true],
  ['unused call', 'function read(strings, ns) {} read([""], Reflect);', false],
  ['unused tag', 'function read(strings, ns) {} read`${Reflect}`;', false],
];
/* eslint-enable no-template-curly-in-string -- the source snippet table ends here */
for (const [label, source, needed] of PARAMETER_READS) {
  for (const mode of ['actual', 'full']) {
    for (const [emitter, imports] of [
      ['babel', await babelImports(source, { ...GLOBAL, mode })],
      ['unplugin', unpluginImports(source, { ...GLOBAL, mode })],
    ]) {
      check(`${ label } [${ emitter }, ${ mode }]: ownKeys obligation`, imports.has('core-js/modules/es.reflect.own-keys'), needed);
      check(`${ label } [${ emitter }, ${ mode }]: namespace exists`, imports.has('core-js/modules/es.reflect.namespace'), true);
      check(`${ label } [${ emitter }, ${ mode }]: unrelated static stays absent`, imports.has('core-js/modules/es.reflect.get'), false);
    }
    for (const [emitter, imports] of [
      ['babel', await babelImports(source, { ...PURE, mode })],
      ['unplugin', unpluginImports(source, { ...PURE, mode })],
    ]) {
      // A consumed pattern may mirror just ownKeys, while a held identifier needs its namespace.
      // Both must carry the required module; neither an unused argument nor its bare ctor does.
      const carriesOwnKeys = [...imports].some(entry => entries[entry.replace(/^@core-js\/pure\//u, '')]?.includes('es.reflect.own-keys'));
      check(`${ label } [${ emitter }, ${ mode }]: pure carries ownKeys`, carriesOwnKeys, needed);
      const carriesGet = [...imports].some(entry => entries[entry.replace(/^@core-js\/pure\//u, '')]?.includes('es.reflect.get'));
      check(`${ label } [${ emitter }, ${ mode }]: pure unrelated static stays absent`, carriesGet, false);
    }
  }
}

// Pure narrowing requires a named receiver at every caller. Global injection can retain only
// the closed body's read-only keys even when another caller supplies an opaque value.
// Each row is transformed independently so another namespace import cannot cover a miss.
const OPAQUE_PARAMETER_READS = [
  ['unknown key', 'function read(ns) { return ns[key]({}); } read(Reflect);'],
  ['rest pattern', 'function read({ ownKeys, ...rest }) { return rest; } use(read(Reflect));'],
  ['returned namespace', 'function read(ns) { return ns; } use(read(Reflect));'],
  ['passed namespace', 'function read(ns) { use(ns); return ns.ownKeys({}); } read(Reflect);'],
  ['escaped callable', 'function read(ns) { return ns.ownKeys({}); } use(read); read(Reflect);'],
  ['exported callable', 'export function read(ns) { return ns.ownKeys({}); } read(Reflect);'],
  ['other caller', 'function read(ns) { return ns.ownKeys({}); } read(Reflect); read(custom);', true, false],
  ['missing argument', 'function read(ns) { return ns.ownKeys({}); } read(Reflect); read();', true, false],
  ['spread argument', 'function read(ns) { return ns.ownKeys({}); } read(Reflect); read(...args);'],
  ['arguments object', 'function read(ns) { arguments[0] = custom; return ns.ownKeys({}); } read(Reflect);'],
  // A leading overwrite drops the supplied value altogether; it must not create a static claim.
  ['overwritten parameter', 'function read(ns) { ns = custom; return ns.ownKeys({}); } read(Reflect);', false],
  ['conditionally reassigned parameter', 'function read(ns) { if (flag) ns = custom; return ns.ownKeys({}); } read(Reflect);', true, false],
  ['nested closure', 'function read(ns) { return () => ns.ownKeys({}); } use(read(Reflect));', true, false],
  ['mixed read and write', 'function read(ns) { ns.ownKeys = patch; return ns.get({}, "x"); } read(Reflect);'],
  ['compound write', 'function read(ns) { ns.ownKeys += patch; } read(Reflect);', true, false],
  ['updated member', 'function read(ns) { ns.ownKeys++; } read(Reflect);', true, false],
  ['deleted member', 'function read(ns) { delete ns.ownKeys; } read(Reflect);', true, false],
];
for (const [label, source, expected] of [
  ['known instance', 'function read(value: Set<number>) { return value.values(); } read(new Set<number>());', false],
  ['unknown caller', 'function read(value) { return value.values(); } read(Object); read(custom);', true],
  ['known static', 'function read(value) { return value.values({}); } read(Object);', true],
]) {
  for (const [emitter, imports] of [
    ['babel', await babelImports(source, GLOBAL, 'input.ts')], ['unplugin', unpluginImports(source, GLOBAL, 'input.ts')],
  ]) check(`parameter candidate/${ label } [${ emitter }]`, imports.has('core-js/modules/es.object.values'), expected);
}
for (const [label, source, wide = true, globalWide = wide] of OPAQUE_PARAMETER_READS) {
  for (const [emitter, imports] of [
    ['babel', await babelImports(source, GLOBAL)],
    ['unplugin', unpluginImports(source, GLOBAL)],
  ]) {
    check(`opaque parameter/${ label } [${ emitter }]: family stays`, imports.has('core-js/modules/es.reflect.get'), globalWide);
    if (wide && !globalWide && label !== 'deleted member') {
      check(`opaque parameter/${ label } [${ emitter }]: the read key stays`, imports.has('core-js/modules/es.reflect.own-keys'), true);
    }
  }
  for (const [emitter, imports] of [
    ['babel', await babelImports(source, PURE)],
    ['unplugin', unpluginImports(source, PURE)],
  ]) {
    check(`opaque parameter/${ label } [${ emitter }]: pure family stays`, imports.has('@core-js/pure/actual/reflect'), wide);
  }
}

// A default or known caller supplies the pattern's exact static claim. Only that SAME supplied
// leaf is covered; known callers contribute their own statics independently of defaults. Spread ambiguity and bare
// captures still owe their independent family, which `Array`, a constructor core-js does not polyfill, has none of:
// each row runs again over `Promise`, which does. An argument a spread leaves unpaired is a read of this file the
// claims do not attribute (`read`), so it owes Array's own statics, never its prototype methods. One import
// cannot mask another.
const DEFAULT_COVERAGE = [
  ['array wrapper', 'function f([{ of } = Array]) { return of(1); } f([Array]);', false],
  ['parameter default', 'function f({ of } = Array) { return of(1); } f(Array);', false],
  ['object wrapper', 'function f({ x: { of } = Array }) { return of(1); } f({ x: Array });', false],
  ['nested wrappers', 'function f([[{ of } = Array]]) { return of(1); } f([[Array]]);', false],
  ['inline spread', 'function f([{ of } = Array]) { return of(1); } f([...[], Array]);', false],
  ['unknown spread', 'function f([{ of } = Array]) { return of(1); } f([...values, Array]);', true, true],
  ['no default', 'function f([{ of }]) { return of(1); } f([Array]);', false],
  ['custom callers', 'function f({ of }) { return of; } f(Array); f({ of: x => x }); f({});', false],
  ['custom first', 'const custom = { of: x => x }; function f([{ of }]) { return of; } f([custom]); f([Array]);', false],
  ['IIFE return', 'function f([{ of } = Array]) { return of; } f([(function source() { return Array; })()]);', false],
  ['bare capture', 'function f([value = Array]) { return value; } f([Array]);', true],
  ['proxy caller', 'function f([{ of }]) { return of(1); } f([globalThis.Array]);', false],
  ['unrelated first caller', 'function f({ of }) { return of(1); } f(Object); f(Array);', false],
  ['different default', 'function f([{ of } = Object]) { return of(1); } f([Array]);', false],
  ['proxy default', 'function f([{ of } = globalThis.Array]) { return of(1); } f([globalThis.Array]);', false],
  ['shadowed default', 'function outer(Array) { function f([{ of } = Array]) { return of(1); } f([globalThis.Array]); }', false],
  ['effectful caller', 'function outer(Custom) { function f({ of } = Custom) { return of(1); } f((effect(), Array)); }', false],
  ['effectful wrapped caller', 'function outer(Custom) { function f([{ of } = Custom]) { return of(1); } f((effect(), [Array])); }', false],
  ['effectful nested caller', 'function outer(Custom) { function f({ x: { of } = Custom }) { return of(1); } f((effect(), { x: Array })); }', false],
  ['stored caller', 'let held; function f({ of } = custom) { return of(1); } f.call(null, held = Array);', false],
  ['stored sequence caller', 'let held; function f({ of } = custom) { return of(1); } f.apply(null, [held = (effect(), Array)]);', false],
  ['stored nested caller', 'let held; function f({ x: { of } = custom }) { return of(1); } Reflect.apply(f, null, [held = { x: Array }]);', false],
  ['stored direct caller', 'let held; function f({ of } = custom) { return of(1); } f(held = Array);', false],
  ['stored direct nested caller', 'let held; function f([{ of } = custom]) { return of(1); } f(held = [Array]);', false],
  ['stored array leaf', 'let held; function f([{ of } = custom]) { return of(1); } f([held = Array]);', false],
  ['stored object leaf', 'let held; function f({ x: { of } = custom }) { return of(1); } f({ x: held = (effect(), Array) });', false],
  ['stored argument handed out', 'let held; function f({ of } = custom) { return of(1); } f(held = Array); hand(held);', true],
  ['aliased unknown spread', 'const values = [...unknown, Array]; function f([{ of } = custom]) { return of(1); } f(values);', true, true],
  ['stored unknown spread', 'let held; function f([{ of } = custom]) { return of(1); } f(held = [...values, Array]);', true, true],
];
for (const [label, source, wide, read = false] of DEFAULT_COVERAGE) {
  const named = /\bof\b/u.test(source);
  const polyfilled = source.replaceAll('Array', 'Promise').replaceAll(/\bof\b/gu, 'allSettled');
  for (const [emitter, imports, polyfilledImports] of [
    ['babel', await babelImports(source, GLOBAL), await babelImports(polyfilled, GLOBAL)],
    ['unplugin', unpluginImports(source, GLOBAL), unpluginImports(polyfilled, GLOBAL)],
  ]) {
    check(`default coverage/${ label } [${ emitter }]: own static`, imports.has('core-js/modules/es.array.of'), named);
    check(`default coverage/${ label } [${ emitter }]: unnamed own statics`, imports.has('core-js/modules/es.array.from-async'), read);
    check(`default coverage/${ label } [${ emitter }]: no prototype usage`, imports.has('core-js/modules/es.array.find'), false);
    check(`default coverage/${ label } over Promise [${ emitter }]: own static`,
      polyfilledImports.has('core-js/modules/es.promise.all-settled'), named || wide);
    check(`default coverage/${ label } over Promise [${ emitter }]: unrelated family`,
      polyfilledImports.has('core-js/modules/es.promise.any'), wide);
  }
}
for (const [shape, pattern, wrap] of [
  ['flat', '{ of } = Array', value => value],
  ['array', '[{ of } = Array]', value => `[${ value }]`],
  ['nested', '{ slot: [{ of } = Array] }', value => `{ slot: [${ value }] }`],
]) {
  const source = `export function outer(Array) { function f(${ pattern }) { return of(1); }`
    + ` return [f(${ wrap('globalThis.Array') }), f(${ wrap('undefined') })]; }`;
  for (const [emitter, imports] of [
    ['babel', await babelImports(source, GLOBAL)],
    ['unplugin', unpluginImports(source, GLOBAL)],
  ]) {
    check(`opaque default/${ shape } [${ emitter }]: own static`, imports.has('core-js/modules/es.array.of'), true);
    check(`opaque default/${ shape } [${ emitter }]: unrelated family`, imports.has('core-js/modules/es.array.find'), false);
  }
}

const differentDefault = 'function f([{ groupBy } = Object]) { return groupBy([], key); } f([Map]);';
for (const [emitter, imports] of [
  ['babel', await babelImports(differentDefault, GLOBAL)],
  ['unplugin', unpluginImports(differentDefault, GLOBAL)],
]) {
  check(`default coverage/different receiver [${ emitter }]: default static`, imports.has('core-js/modules/es.object.group-by'), true);
  check(`default coverage/different receiver [${ emitter }]: supplied static`, imports.has('core-js/modules/es.map.group-by'), true);
}

// A caller's static remains actionable beside an opaque default. The pure argument mirror
// patches that call without replacing the custom method supplied by the default.
const opaqueDefault = 'function outer(Array) { function read([{ of } = Array]) { return of(1); }'
  + ' return [read([globalThis.Array]), read([undefined])]; } outer({ of: x => x });';
for (const [emitter, imports] of [
  ['babel', await babelImports(opaqueDefault, PURE)],
  ['unplugin', unpluginImports(opaqueDefault, PURE)],
]) {
  check(`opaque default [${ emitter }]: caller static`, imports.has('@core-js/pure/actual/array/of'), true);
}

// A computed key off a constructor whose VALUES the file spells names those keys and no others:
// usage-global owes exactly the statics among them, and a key none of whose values is a static
// leaves the constructor narrow in both flavors. only a key no spelling settles owes the family.
// usage-pure serves a key naming one static by that static's own entry and reads a key naming several
// off the binding it mints, which then has to carry them.
// one row per fold the key is read through, every row its own transform, and a destructure
// selecting the slot its member spelling reads answers alike
/* eslint-disable no-template-curly-in-string -- the template-key row spells a template literal */
const FOLDED_KEYS = [
  ['a literal read in place', 'use(Symbol[[1, 2][0]] in obj);', 'symbol', []],
  ['a concat over bindings', 'const half = "iter"; use(Symbol[half + half] in obj);', 'symbol', []],
  ['a template over bindings', 'const half = "iter"; use(Symbol[`${ half }${ half }`] in obj);', 'symbol', []],
  ['a bare undefined', 'use(Promise[undefined]);', 'promise', []],
  ['a void', 'use(Map[void 0]);', 'map', []],
  ['a selection of literals', 'use(Promise[flag ? "any" : "allSettled"]([]));', 'promise', ['any', 'all-settled']],
  ['a name bound to a selection', 'const k = flag ? "any" : "allSettled"; use(Promise[k]([]));', 'promise', ['any', 'all-settled']],
  ['a slot default over a filled literal', 'let k; [k = "allSettled"] = ["any"]; use(Promise[k]([]));', 'promise', ['any', 'all-settled']],
  ['a void, destructured', 'const { [void 0]: f } = Map; use(f);', 'map', []],
  ['a selection of literals, destructured', 'const { [flag ? "any" : "allSettled"]: f } = Promise; use(f([]));', 'promise', ['any', 'all-settled']],
  ['a name bound to a selection, destructured', 'const k = flag ? "any" : "allSettled"; const { [k]: f } = Promise; use(f([]));', 'promise', ['any', 'all-settled']],
  ['a selection assigned through a pattern', 'let f; ({ [flag ? "any" : "allSettled"]: f } = Promise); use(f([]));', 'promise', ['any', 'all-settled']],
  ['an enum member', 'enum E { a = "any" } use(Promise[E.a]([]));', 'promise', ['any'], 'input.ts'],
  ['an enum member, destructured', 'enum E { a = "any" } const { [E.a]: f } = Promise; use(f([]));', 'promise', ['any'], 'input.ts'],
  ['an enum member off a call', 'enum E { a = "name" } function mk() { return Promise; } use(mk()[E.a]);', 'promise', [], 'input.ts'],
  [
    'an enum member naming no static',
    '// @ts-expect-error a static the constructor lacks is the read under test\nenum E { a = "other" } const { [E.a]: f } = Promise; use(f);',
    'promise',
    [],
    'input.ts',
  ],
  ['a selection off a proxy member', 'use(globalThis.Promise[flag ? "any" : "allSettled"]([]));', 'promise', ['any', 'all-settled']],
  ['a selection through a proxy level, destructured', 'const { Promise: { [flag ? "any" : "allSettled"]: f } } = globalThis; use(f([]));', 'promise', ['any', 'all-settled']],
  ['a presence test by a selection', 'use((flag ? "any" : "allSettled") in Promise);', 'promise', ['any', 'all-settled']],
  ['a presence test on a container', 'const o = { P: Promise }; use(key in o);', 'promise', []],
  ['a well-known symbol', 'use(Map[Symbol.iterator]);', 'map', []],
  ['a well-known symbol off a proxy hop', 'use(Map[globalThis.self.Symbol.iterator]);', 'map', []],
];
/* eslint-enable no-template-curly-in-string -- the source snippet table ends here */
for (const [label, source, entry, statics, filename] of [
  ...FOLDED_KEYS,
  ['an opaque key', 'use(Promise[key]([]));', 'promise', null],
  ['an opaque key, destructured', 'const { [key]: f } = Promise; use(f([]));', 'promise', null],
  ['an opaque key in a parameter default', 'function g({ [key]: f } = Promise) { return f([]); } use(g());', 'promise', null],
  ['an opaque key through a proxy level, destructured', 'const { Promise: { [key]: f } } = globalThis; use(f([]));', 'promise', null],
  ['a presence test by an opaque key', 'use(key in Promise);', 'promise', null],
  ['a presence test through an alias', 'const P = Promise; use(key in P);', 'promise', null],
  ['a presence test off a proxy member', 'use(key in globalThis.Promise);', 'promise', null],
  // a well-known symbol is read off the realm's own `Symbol` only, never off a slot of some other object
  ['a symbol member off a foreign hop', 'use(Map[globalThis.box.Symbol.iterator]);', 'map', null],
  // a literal read in place is a spelling only the census folds, so a slot naming a static stays unnamed
  ['a literal read in place naming a static', 'use(Map[[1, "groupBy"][1]]([], x => x));', 'map', null],
  ['a name bound to a literal read in place', 'const k = ["groupBy"][0]; use(Map[k]([], x => x));', 'map', null],
  // an enum member names its key only through a literal initializer of the enum the name binds
  ['a computed enum initializer', 'enum E { a = "an" + "y" } use(Promise[E.a]([]));', 'promise', null, 'input.ts'],
  ['a written enum member', 'enum E { a = "any" } (E as any).a = key; use(Promise[E.a]([]));', 'promise', null, 'input.ts'],
  ['an enum handed on', 'enum E { a = "any" } patch(E); use(Promise[E.a]([]));', 'promise', null, 'input.ts'],
  ['a name shadowing the enum', 'enum E { a = "any" } export function g(E) { return Promise[E.a]([]); }', 'promise', null, 'input.ts'],
]) {
  // what the named statics owe, read off their own entries: the part of the namespace they share
  const owed = new Set((statics ?? []).flatMap(name => entries[`actual/${ entry }/${ name }`]));
  for (const [emitter, imports] of [
    ['babel', await babelImports(source, GLOBAL, filename)],
    ['unplugin', unpluginImports(source, GLOBAL, filename)],
  ]) {
    for (const module of wideEntryExtras(`@core-js/pure/actual/${ entry }`)) {
      check(`folded key/${ label } [${ emitter }]: ${ module }`, imports.has(`core-js/modules/${ module }`), !statics || owed.has(module));
    }
  }
  for (const [emitter, imports] of [
    ['babel', await babelImports(source, PURE, filename)],
    ['unplugin', unpluginImports(source, PURE, filename)],
  ]) {
    check(`folded key/${ label } [${ emitter }]: pure namespace`, imports.has(`@core-js/pure/actual/${ entry }`), !statics || statics.length > 1);
  }
}

// A raw nested pattern read needs its static on every constructor the written source may hold.
for (const [label, pattern, initial, written, globalClaim = true] of [
  ['array', '[{ groupBy }]', '[Array]', '[Map]'],
  ['nested array', '[[{ groupBy }]]', '[[Array]]', '[[Map]]'],
  ['object then array', '{ entries: [{ groupBy }] }', '{ entries: [Array] }', '{ entries: [Map] }'],
  // This compound static route is outside detection's supported spellings. Pure must still
  // preserve the property when it substitutes a constructor the ordinary census already sees.
  ['array then object', '[{ entry: { groupBy } }]', '[{ entry: Array }]', '[{ entry: Map }]', false],
  ['default', '[{ groupBy } = Map]', '[Array]', '[Map]'],
  ['different default', '[{ groupBy } = Object]', '[Array]', '[Map]'],
  ['hole', '[, { groupBy }]', '[, Array]', '[, Map]'],
  ['rest', '[{ groupBy }, ...rest]', '[Array]', '[Map]'],
]) {
  const source = `let sources = ${ initial }; for (let i = 0; i < 1; i++) { sources = ${ written }; const ${ pattern } = sources; use(groupBy); }`;
  for (const options of [GLOBAL, PURE]) for (const [emitter, imports] of [
    ['babel', await babelImports(source, options)],
    ['unplugin', unpluginImports(source, options)],
  ]) {
    const modules = new Set([...imports].flatMap(spec => spec.startsWith('core-js/modules/')
      ? [spec.slice('core-js/modules/'.length)] : entries[spec.replace('@core-js/pure/', '')] ?? []));
    check(`written array pattern/${ label }/${ options.method } [${ emitter }]: static available`, modules.has('es.map.group-by'), options === PURE || globalClaim);
  }
}

// A directive leaves the read intact; a substituted receiver must supply that retained static.
for (const [label, source] of [
  ['member', 'const M = Map;\n// core-js-disable-next-line\nuse(M.groupBy);'],
  ['nested pattern', 'const box = { C: Map };\nconst {\n// core-js-disable-next-line\nC: { groupBy }\n} = box; use(groupBy);'],
  ['multiline pattern', 'const box = { C: Map };\n// core-js-disable-next-line\nconst {\nC: { groupBy }\n} = box; use(groupBy);'],
  ['multiline nested property', 'const box = { C: Map };\nconst {\n// core-js-disable-next-line\nC: {\ngroupBy\n}\n} = box; use(groupBy);'],
  ['multiline member', 'const M = Map;\n// core-js-disable-next-line\nuse(\nM.groupBy\n);'],
  ['pattern property over global', 'const {\n// core-js-disable-next-line\ngroupBy\n} = Map; use(groupBy);'],
  ['native initializer with pure write', '// core-js-disable-next-line\nlet C = Map;\nif (flag) C = Map;\n// core-js-disable-next-line\nuse(C.groupBy);'],
]) for (const options of [GLOBAL, PURE]) for (const [emitter, imports] of [
  ['babel', await babelImports(source, options)],
  ['unplugin', unpluginImports(source, options)],
]) {
  check(`opted-out static/${ label }/${ options.method } [${ emitter }]: whole substituted receiver`, imports.has('@core-js/pure/actual/map'), options === PURE);
  if (options === GLOBAL) check(`opted-out static/${ label } [${ emitter }]: disabled import`, imports.has('core-js/modules/es.map.group-by'), false);
}

// A fully opted-out native receiver never reads through a pure constructor imported elsewhere.
for (const [label, source] of [
  ['global', 'new Map();\n// core-js-disable-next-line\nuse(Map.groupBy);'],
  ['realm member', 'new Map();\n// core-js-disable-next-line\nuse(globalThis.Map.groupBy);'],
  ['whole pattern', 'new Map();\n// core-js-disable-next-line\nconst { groupBy } = Map; use(groupBy);'],
  ['native alias', 'new Map();\n// core-js-disable-next-line\nconst C = Map;\n// core-js-disable-next-line\nuse(C.groupBy);'],
]) for (const [emitter, imports] of [
  ['babel', await babelImports(source, PURE)],
  ['unplugin', unpluginImports(source, PURE)],
]) check(`opted-out native static/${ label } [${ emitter }]: narrow constructor`, imports.has('@core-js/pure/actual/map'), false);

// A constructor used only as a constructor owes no own static after the pairing change.
for (const source of ['const [C] = [Map]; use(new C());', 'const [{ groupBy }] = [Map]; use(groupBy);']) {
  for (const [emitter, imports] of [
    ['babel', await babelImports(source, PURE)],
    ['unplugin', unpluginImports(source, PURE)],
  ]) check(`array pattern narrow control [${ emitter }]: ${ source }`, imports.has('@core-js/pure/actual/map'), false);
}

// A positional read that resolves to its own static import owes no constructor namespace.
// Keep the raw-pattern controls above: those still read through the substituted constructor.
for (const [label, source, entry, staticEntry] of [
  ['reassigned nested container', 'let rows = [{ C: Object }]; rows = [{ C: Promise }]; const [{ C: { race } }] = rows; use(race);', 'promise', 'race'],
  ['chained container write', 'let rows = [Object], other; rows = other = [Promise]; const [{ allSettled }] = rows; use(allSettled);', 'promise', 'all-settled'],
  ['decided container', 'const rows = typeof Symbol != "undefined" ? [Map] : [Object]; const [{ groupBy }] = rows; use(groupBy);', 'map', 'group-by'],
  ['decided parameter default', 'const rows = typeof Symbol != "undefined" ? [Map] : [Object]; export function read([{ groupBy }] = rows) { return groupBy; }', 'map', 'group-by'],
  ['same nested block', '{ let rows = [Object]; rows = [Promise]; const [{ race }] = rows; use(race); }', 'promise', 'race'],
]) for (const [emitter, imports] of [
  ['babel', await babelImports(source, PURE)],
  ['unplugin', unpluginImports(source, PURE)],
]) {
  check(`served positional static/${ label } [${ emitter }]: static`, imports.has(`@core-js/pure/actual/${ entry }/${ staticEntry }`), true);
  check(`served positional static/${ label } [${ emitter }]: constructor`, imports.has(`@core-js/pure/actual/${ entry }/constructor`), true);
  check(`served positional static/${ label } [${ emitter }]: namespace`, imports.has(`@core-js/pure/actual/${ entry }`), false);
}

// Serving one read cannot discharge another retained read of the same constructor.
for (const [label, source] of [
  ['loop read', `let rows = [Object]; rows = [Promise]; const [{ race }] = rows; use(race);
for (let i = 0; i < 1; i++) { rows = [Promise]; const [{ allSettled }] = rows; use(allSettled); }`],
  ['disabled read', `let rows = [Object]; rows = [Promise]; const [{ race }] = rows; use(race);
// core-js-disable-next-line
const [{ allSettled }] = rows; use(allSettled);`],
]) for (const [emitter, imports] of [
  ['babel', await babelImports(source, PURE)],
  ['unplugin', unpluginImports(source, PURE)],
]) {
  check(`independent positional static/${ label } [${ emitter }]: served static`, imports.has('@core-js/pure/actual/promise/race'), true);
  check(`independent positional static/${ label } [${ emitter }]: retained namespace`, imports.has('@core-js/pure/actual/promise'), true);
}

finish();
