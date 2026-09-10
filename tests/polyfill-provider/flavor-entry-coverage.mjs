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
import { createChecker } from './harness.mjs';

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
async function babelImports(source, options) {
  const out = await transformAsync(source,
    { plugins: [['@core-js', options]], filename: 'input.mjs', configFile: false, babelrc: false });
  return polyfillImports(out?.code);
}

function unpluginImports(source, options) {
  return polyfillImports(createUnplugin(options).transform(source, 'input.mjs')?.code ?? source);
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
  'container literal slot': name => `const c = { k: ${ name } };\nuse(new c.k(s));`,
  'inline callee pattern parameter': name => `export const v = (({ name: got }) => got)(${ name });`,
  'inline callee pattern parameter, shadowed': shadowedPatternParameter,
  'inline arrow pattern parameter': name => `export const v = (({ name: got }) => got)(globalThis.${ name });`,
};

for (const name of CONSTRUCTORS) {
  for (const [position, spell] of Object.entries(NARROW)) {
    await checkStaysNarrow(`${ name } stays narrow at ${ position }`, spell(name));
  }
}

// the obligation is DERIVED, and this is where that shows: a constructor whose namespace entry adds
// nothing over its constructor entry owes nothing extra when it escapes. Without it, a suite that
// widened every constructor unconditionally would read exactly the same on every row above
check('a namespace adding no statics owes nothing (actual/set)', wideEntryExtras('@core-js/pure/actual/set'), null);
check('... and the one that does is named by compat, not here (actual/map)',
  wideEntryExtras('@core-js/pure/actual/map')?.join(','), 'es.map.group-by');

finish();
