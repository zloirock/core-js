// Rebinding a local holder to another local holder keeps both attributable. Writes through the
// shared name reach every known candidate even beside an opaque replacement. Rebinding the name
// does not mutate its earlier holders; actual hand-outs still invalidate them.
import { adapters, createChecker } from './harness.mjs';
import {
  collectFileCensus,
  ESCAPED_CONTAINER_NAMES,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import {
  escapedCtorReferencesReducer,
  mutationShapesReducer,
} from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';

const { check, checkDeep, checkTruthy, finish } = createChecker('container-alias-alternatives');

const holders = 'let first = { x: Number }; let second = { x: String };';
const rows = [
  {
    name: 'a literal and a later alias stay local',
    code: `${ holders } first = second; const { x: { raw } } = first;`,
  },
  {
    name: 'a conditional alias keeps the initial literal too',
    code: `${ holders } if (flag) first = second; const { x: { raw } } = first;`,
  },
  {
    name: 'cross assignments do not turn the local cycle into an escape',
    code: `${ holders } first = second; second = first; const { x: { raw } } = first;`,
  },
  {
    name: 'a write reaches both the literal and the aliased holder',
    code: `${ holders } first = second; first.x = Array;`,
    writes: ['first.x', 'second.x'],
  },
  {
    name: 'a nested write keeps its complete path on both holders',
    code: 'let first = { x: { ctor: Number } }; let second = { x: { ctor: String } };'
      + 'first = second; first.x.ctor = Array;',
    writes: ['first.x.ctor', 'second.x.ctor'],
  },
  {
    name: 'an array literal remains a candidate beside an array alias',
    code: 'let first = [Number]; let second = [String]; first = second; first[0] = Array;',
    writes: ['first.0', 'second.0'],
  },
  {
    name: 'a selecting assignment keeps every candidate of the shared name',
    code: `${ holders } let third = { x: Object }; first = flag ? second : third; first.x = Array;`,
    writes: ['first.x', 'second.x', 'third.x'],
  },
  {
    name: 'chained assignments propagate a write through all local candidates',
    code: `${ holders } let third = { x: Object }; first = second; second = third; first.x = Array;`,
    writes: ['first.x', 'second.x', 'third.x'],
  },
  {
    name: 'cross assignment cycles terminate and retain both write destinations',
    code: `${ holders } first = second; second = first; first.x = Array;`,
    writes: ['first.x', 'second.x'],
  },
  {
    name: 'settled and converging paths retain their order across rounds and cached suffixes',
    code: `${ holders } const left = first; const middle = flag ? left : second; const deep = middle;`
      + 'const selected = flag ? left : deep; selected.x = Array; selected.y = Array;',
    writes: ['first.x', 'second.x', 'first.y', 'second.y'],
    ordered: true,
  },
  {
    name: 'a self assignment preserves its holder and write destination',
    code: 'let first = { x: Number }; first = first; first.x = Array;',
    writes: ['first.x'],
  },
  {
    name: 'converging cyclic aliases keep settled literals and cached suffix order',
    code: `${ holders } first = flag ? second : first; second = first;`
      + 'const selected = flag ? first : second; selected.x = Array; selected.y = Array;',
    writes: ['first.x', 'second.x', 'first.y', 'second.y'],
    ordered: true,
  },
  {
    name: 'a third opaque source does not mutate or hand out the aliased holder',
    code: `${ holders } first = second; first = external; const { x: { raw } } = first;`,
  },
  {
    name: 'an actual hand-out still releases both candidates',
    code: `${ holders } first = second; hand(first);`,
    escaped: ['Number', 'String'],
    opaque: ['first.*', 'second.*'],
  },
  {
    name: 'a write before opaque replacement keeps its function-local captured source',
    code: 'function run(external) { const original = { x: String }; let alias = original;'
      + 'alias.x = Array; alias = external(); }',
    writes: ['original.x'],
  },
  {
    name: 'a write before opaque replacement keeps its closed block-local source',
    code: '{ const original = { x: String }; let alias = original; alias.x = Array; alias = external(); }',
    writes: ['original.x'],
  },
  {
    name: 'a local opaque alias does not escape a same-spelled outer holder',
    code: 'const original = { x: Number }; function run(external) {'
      + 'const original = { x: String }; let alias = original; alias.x = Array; alias = external(); }',
    writes: ['original.x'],
  },
  {
    name: 'a member alias captures the complete slot path in its closed scope',
    code: 'function run(external) { const original = { slot: { x: String } }; let alias = original.slot;'
      + 'alias.x = Array; alias = external(); }',
    writes: ['original.slot.x'],
  },
];

// Losing an alias target is not an escape. A call, export or unknown read still owes the
// namespace, even when that same alias also receives an opaque value elsewhere in the file.
for (const [name, tail, escapes] of [
  ['conditional opaque replacement', 'if (flag) alias = external(); const { x: { raw } } = alias;', false],
  ['call before replacement', 'hand(alias); alias = external();', true],
  ['call after replacement', 'alias = external(); hand(original);', true],
  ['call through a conditional alias', 'if (flag) alias = external(); hand(alias);', true],
  ['export after replacement', 'alias = external(); export { original };', true],
  ['export through a conditional alias', 'if (flag) alias = external(); export { alias };', true],
  ['unknown read after replacement', 'alias = external(); original[key];', true],
  ['passing the alias into its replacement', 'alias = external(alias);', true],
]) rows.push({
  name,
  code: `const original = { x: String }; let alias = original; ${ tail }`,
  escaped: escapes ? ['String'] : [],
  opaque: escapes ? ['original.*'] : [],
});

const orders = [
  () => [mutationShapesReducer(), escapedCtorReferencesReducer()],
  () => [escapedCtorReferencesReducer(), mutationShapesReducer()],
];
let checked = 0;
for (const adapter of adapters) {
  for (const [order, reducers] of orders.entries()) {
    for (const row of rows) {
      const label = `${ adapter.name }, order ${ order }: ${ row.name }`;
      const program = adapter.parseAndScope(row.code).node;
      const { writtenContainerSlots, escapedCtorNames } = collectFileCensus(program, reducers());
      if (row.ordered) {
        checkDeep(`${ label }: destination order`, writtenContainerSlots.keys().map(key => key.replace(/#\d+/u, '')).toArray(),
          row.writes);
      }
      // Declaration keys have parser-owned identities; the test names each holder only once.
      // Candidate multiplicity is immaterial: a destination owes each possible installed value.
      const slots = [...writtenContainerSlots].map(([key, values]) => [
        key.replace(/#\d+/u, ''), [...new Set(values.map(value => value.name))],
      ]).sort(([left], [right]) => left.localeCompare(right));
      const expected = [
        ...(row.writes ?? []).map(key => [key, ['Array']]),
        ...(row.opaque ?? []).map(key => [key, []]),
      ].sort(([left], [right]) => left.localeCompare(right));
      checkDeep(`${ label }: exact written and opaque slots`, slots, expected);
      checked++;
      for (const name of ['Number', 'String']) {
        const escaped = row.escaped?.includes(name) ?? false;
        check(`${ label }: ${ name } container escape`, ESCAPED_CONTAINER_NAMES.get(program).has(name), escaped);
        check(`${ label }: ${ name } global escape`, escapedCtorNames.has(name), escaped);
        check(`${ label }: ${ name } pure escape`, escapedCtorNames.has(name, true), escaped);
        checked += 3;
      }
    }
  }
}
check('all alternative rows were checked', checked, adapters.length * orders.length * rows.length * 7);
checkTruthy('the alternatives keep their coverage floor', checked >= 336);

// A traversal limit can trade slot precision for a whole-holder invalidation, but cannot forget
// the original destination. Lengths straddle the bound; a wide selection crosses it in one hop.
const bounded = [];
for (const length of [63, 64, 65, 96]) {
  const names = Array.from({ length: length + 1 }, (_, index) => `holder${ index }`);
  bounded.push({
    name: `a ${ length }-hop alias chain keeps every original holder writable`,
    code: `const replacement = {}; let holder0 = { x: Array };${
      names.slice(1).map((name, index) => `let ${ name } = { x: Number }; ${ name } = holder${ index };`).join('')
    }holder${ length }.x = replacement;`,
    names,
  });
}
for (const width of [65, 96]) {
  const names = Array.from({ length: width }, (_, index) => `source${ index }`);
  bounded.push({
    name: `a ${ width }-way alias selection keeps every source writable`,
    code: `const replacement = {}; let selected = { x: Number };${
      names.map(name => `const ${ name } = { x: Array };`).join('')
    }${ names.map((name, index) => `if (flag${ index }) selected = ${ name };`).join('')
    }selected.x = replacement;`,
    names: ['selected', ...names],
  });
}
bounded.push({
  name: 'a key-growing alias cycle terminates with both holders invalidated',
  code: 'const replacement = {}; let first = { x: Array }; let second = { x: Number };'
    + 'first = second.child; second = first.child; first.x = replacement;',
  names: ['first', 'second'],
  wildcard: true,
});

let boundedChecks = 0;
for (const adapter of adapters) {
  for (const row of bounded) {
    const program = adapter.parseAndScope(row.code).node;
    const { writtenContainerSlots, containerSlotIndex } = collectFileCensus(program, [mutationShapesReducer()]);
    for (const name of row.names) {
      const label = `${ adapter.name }: ${ row.name }: ${ name }`;
      const roots = containerSlotIndex.byName.get(name);
      check(`${ label }: one declared holder`, roots?.length, 1);
      const exact = writtenContainerSlots.get(`${ roots[0] }.x`);
      checkTruthy(`${ label }: the destination remains written or opaque`, writtenContainerSlots.has(`${ roots[0] }.*`)
        || !row.wildcard && exact?.some(value => value.name === 'replacement'));
      boundedChecks += 2;
    }
  }
}
check('all bounded rows were checked', boundedChecks,
  adapters.length * bounded.reduce((sum, row) => sum + row.names.length * 2, 0));
checkTruthy('the bounded rows keep their coverage floor', boundedChecks >= 1800);

// An opaque member cycle must retain its invalidation without expanding wrapper paths.
for (const adapter of adapters) for (const [name, code] of [
  ['source aliases its own captured member', 'let source = { part: { x: Array } }; let alias = source.part;'
    + 'source = alias; alias = external(); alias.x = {};'],
  ['source holds its captured member alias', 'let alias; const source = { part: { x: Array, back: alias } };'
    + 'alias = source.part; alias = external(); alias.x = {};'],
]) {
  const program = adapter.parseAndScope(code).node;
  const { writtenContainerSlots } = collectFileCensus(program, [mutationShapesReducer()]);
  const paths = writtenContainerSlots.keys().map(key => key.replace(/#\d+/u, '')).toArray();
  checkTruthy(`${ adapter.name }: ${ name }: source member stays invalidated`, paths.includes('source.part'));
  checkTruthy(`${ adapter.name }: ${ name }: paths stay bounded`, paths.length < 16 && paths.every(key => key.length < 128));
}

// A restored parameter closes a member-growing cycle through its wrapper. Once the holder
// is opaque, concrete paths under that same root add no information and must not propagate.
for (const adapter of adapters) for (const [name, capture, restore] of [
  ['object slot', '{ value: link }', 'stack.value'],
  ['array slot', '[link]', 'stack[0]'],
  ['nested object slot', '{ inner: { value: link } }', 'stack.inner.value'],
]) {
  const code = `export function checkDirty(link) {
    const stack = ${ capture };
    link = link.deps;
    link = ${ restore };
    return link.sub;
  }
  const separate = { x: Number }; separate.x = Array;`;
  const program = adapter.parseAndScope(code).node;
  const { writtenContainerSlots } = collectFileCensus(program, [mutationShapesReducer()]);
  const paths = writtenContainerSlots.keys().map(key => key.replace(/#\d+/u, '')).toArray().sort();
  checkDeep(`${ adapter.name }: ${ name }: opaque paths subsume only their own root`, paths,
    ['separate.x', 'stack.*']);
}
finish();
