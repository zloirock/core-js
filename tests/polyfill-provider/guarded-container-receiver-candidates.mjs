// Ambiguous and written slots retain possible receivers without claiming a pure primary.
// Receiver capture precedes any binding write performed by the destructuring pattern.
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { resolveNestedDestructureReceiver } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { collectFileCensus } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { escapedCtorReferencesReducer, mutationShapesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';
import { adapters, createChecker } from './harness.mjs';

const { check, checkDeep, finish } = createChecker('guarded-container-receiver-candidates');

const rows = [
  ['unknown later receiver', 'const source = { realm: Object, [key]: Array };',
    'const { realm: { of: value } } = source;', 'Object', ['Array'], null, ['Array', 'Object']],
  ['known later receiver', 'const source = { [key]: Array, realm: Object };',
    'const { realm: { of: value } } = source;', 'Object', [], 'Object', []],
  ['written literal receiver', 'const source = { realm: Array };',
    'const { realm: { of: value } } = source;', 'Array', [], null, ['Array'], true],
  ['default writes captured binding', 'let source = { leading: undefined, get realm() { mark(); return globalThis; } };',
    'const { leading = (source = {}, 1), realm: { WeakSet: value } } = source;',
    'globalThis', [], null, ['globalThis']],
];
let checked = 0;
for (const parser of adapters) for (const method of ['usage-global', 'usage-pure']) {
  for (const [name, before, statement, globalPrimary, globalCandidates, purePrimary, pureCandidates, written = false] of rows) {
    const program = parser.parseAndScope(`${ before } ${ statement }`);
    const propertyType = parser.name === 'babel' ? 'ObjectProperty' : 'Property';
    const outer = parser.pickPath(program, propertyType,
      path => path.parentPath.node.type === 'ObjectPattern' && path.node.key.name === 'realm');
    const adapter = parser.name === 'babel' ? createBabelAdapter({ method }) : createEstreeAdapter({ method });
    if (written) adapter.isWrittenContainerSlot = () => true;
    const candidates = [];
    const primary = resolveNestedDestructureReceiver(outer, adapter, candidates);
    check(`${ parser.name }: ${ method }: ${ name }: primary`,
      primary, method === 'usage-global' ? globalPrimary : purePrimary);
    checkDeep(`${ parser.name }: ${ method }: ${ name }: candidates`,
      candidates, method === 'usage-global' ? globalCandidates : pureCandidates);
    checked += 2;
  }
}
check('all rows were checked', checked, 32);

// A slot overwritten with a known constructor has no remaining literal candidate. The
// full census supplies write sites so conditional, escaped and captured values stay distinct.
const writtenRows = [
  ['direct', 'const source = { realm: Object }; source.realm = Map;', 'source', 'Map'],
  ['TS wrappers', 'const source = { realm: Object } as { realm: unknown }; (source as { realm: unknown }).realm = Map;', 'source', 'Map'],
  ['alias receiver', 'const source = { realm: Object }; const alias = source; alias.realm = Map;', 'source', 'Map'],
  ['wrapper receiver', 'const source = { realm: Object }; const alias = { box: source }; alias.box.realm = Map;', 'source', 'Map'],
  ['array receiver', 'const source = [Object]; source[0] = Map;', 'source', 'Map', '0'],
  ['aliased container', 'const original = { realm: Object }; const source = original; original.realm = Map;', 'source', 'Map'],
  ['held container', 'const inner = { realm: Object }; const source = { part: inner }; inner.realm = Map;', 'source.part', 'Map'],
  ['nested literal', 'const source = { part: { realm: Object } }; source.part.realm = Map;', 'source.part', 'Map'],
  ['aliased value', 'const C = Map; const source = { realm: Object }; source.realm = C;', 'source', 'Map'],
  ['aliased value later reassigned', 'let C = Map; const source = { realm: Object }; source.realm = C; C = Object;', 'source', 'Map'],
  ['same writes', 'const source = { realm: Object }; source.realm = Map; source.realm = Map;', 'source', 'Map'],
  ['conditional', 'const source = { realm: Object }; if (flag) source.realm = Map;', 'source', null],
  ['logical', 'const source = { realm: Object }; source.realm ||= Map;', 'source', null],
  ['deferred', 'const source = { realm: Object }; function replace() { source.realm = Map; }', 'source', null],
  ['escaped', 'const source = { realm: Object }; source.realm = Map; mutate(source);', 'source', null],
  ['unknown later write', 'const source = { realm: Object }; source.realm = Map; source[key] = replacement;', 'source', null],
  ['opaque replacement', 'const source = { realm: Object }; source.realm = replacement;', 'source', null],
  ['unknown capitalized value', 'const source = { realm: Object }; source.realm = Unknown;', 'source', null],
  ['shadowed constructor', 'const Map = replacement; const source = { realm: Object }; source.realm = Map;', 'source', null],
  ['setter ignores write', 'const source = { get realm() { return Object; }, set realm(value) {} }; source.realm = Map;', 'source', null],
  ['spread may replace slot', 'const source = { realm: Object, ...other }; source.realm = Map;', 'source', null],
  ['captured old slot', 'const source = { realm: Object }; const captured = { realm: source.realm }; source.realm = Map;', 'captured', null],
  ['local call', 'function set(value) { value.realm = Map; } const source = { realm: Object }; set(source);', 'source', 'Map'],
  ['truthy call parameter', 'function set(value) { if (value) value.realm = Map; return 0; } const source = { realm: Object }; set(source);', 'source', 'Map'],
  // eslint-disable-next-line no-template-curly-in-string -- the row contains tagged-template source
  ['truthy tag parameter', 'function set(strings, value) { if (value) value.realm = Map; return 0; } const source = { realm: Object }; set`${source}`;', 'source', 'Map'],
  ['arrow call', 'const set = value => value.realm = Map; const source = { realm: Object }; set(source);', 'source', 'Map'],
  ['callee alias', 'function set(value) { value.realm = Map; } const install = set; const source = { realm: Object }; install(source);', 'source', 'Map'],
  ['repeated calls', 'function set(value) { value.realm = Map; } const source = { realm: Object }; set(source); set(source);', 'source', 'Map'],
  ['conditional call', 'function set(value) { value.realm = Map; } const source = { realm: Object }; if (flag) set(source);', 'source', null],
  ['conditional body write', 'function set(value) { if (flag) value.realm = Map; } const source = { realm: Object }; set(source);', 'source', null],
  ['early return', 'function set(value) { if (flag) return; value.realm = Map; } const source = { realm: Object }; set(source);', 'source', null],
  ['parameter rebound', 'function set(value) { value = {}; value.realm = Map; } const source = { realm: Object }; set(source);', 'source', null],
  ['unknown second call', 'function set(value) { value.realm = Map; } const source = { realm: Object }; set(source); mutate(source);', 'source', null],
  ['compound after call', 'function set(value) { value.realm = Map; } const source = { realm: Object }; set(source); source.realm &&= Object;', 'source', null],
  ['call through setter', 'function set(value) { value.realm = Map; } const source = { get realm() { return Object; }, set realm(v) {} }; set(source);', 'source', null],
  ['async call', 'async function set(value) { value.realm = Map; } const source = { realm: Object }; set(source);', 'source', null],
  ['generator call', 'function* set(value) { value.realm = Map; } const source = { realm: Object }; set(source);', 'source', null],
  ['deferred body write', 'function set(value) { return () => { value.realm = Map; }; } const source = { realm: Object }; set(source);', 'source', null],
  ['callee reassigned', 'function set(value) { value.realm = Map; } set = replacement; const source = { realm: Object }; set(source);', 'source', null],
  ['optional call', 'function set(value) { value.realm = Map; } const source = { realm: Object }; set?.(source);', 'source', null],
  ['other parameter effect', 'function set(value, other) { other(); value.realm = Map; } const source = { realm: Object }; set(source, effect);', 'source', null],
  ['unrelated assignment effect', 'function set(value) { outside.k = other; value.realm = Map; } const source = { realm: Object }; set(source);', 'source', null],
];
for (const parser of adapters) for (const method of ['usage-global', 'usage-pure']) {
  for (const [name, before, receiver, expected, key = 'realm'] of writtenRows) {
    const program = parser.parseAndScope(`${ before } const { ${ key }: { groupBy } } = ${ receiver };`);
    const outer = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property',
      path => path.parentPath.node.type === 'ObjectPattern' && path.node.value.type === 'ObjectPattern');
    const census = collectFileCensus(program.node, [escapedCtorReferencesReducer(), mutationShapesReducer()]);
    const options = {
      method,
      getWrittenContainerSlots: () => census.writtenContainerSlots,
      getContainerSlotIndex: () => census.containerSlotIndex,
    };
    const adapter = parser.name === 'babel' ? createBabelAdapter(options) : createEstreeAdapter(options);
    const candidates = [];
    const primary = resolveNestedDestructureReceiver(outer, adapter, candidates);
    if (expected) {
      check(`${ parser.name }: ${ method }: replaced slot: ${ name }: primary`, primary, method === 'usage-pure' ? null : expected);
      checkDeep(`${ parser.name }: ${ method }: replaced slot: ${ name }: candidates`, candidates, []);
    } else {
      check(`${ parser.name }: ${ method }: uncertain slot: ${ name }`, primary === 'Map', false);
    }
  }
}
finish();
