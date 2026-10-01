import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { collectFileCensus } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { escapedCtorReferencesReducer, mutationShapesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';
import { staticContainerReceiverName, buildParameterArgumentSynthPlan, collectMemberUnionCandidates } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { adapters, createChecker } from './harness.mjs';

const { check, finish } = createChecker('parameter-static-sources');

for (const parser of adapters) for (const method of ['usage-global', 'usage-pure']) {
  for (const [name, setup, argument, expected, after = ''] of [
    ['member', 'const box = { value: Array };', 'box.value', 'Array'],
    ['literal', '', '({ value: Array }).value', 'Array'],
    ['nested literal', '', '({ box: { value: Array } }).box.value', 'Array'],
    ['returned value', 'function get() { return Array; }', 'get()', 'Array'],
    // Global keeps the possible native family; pure cannot replace a written receiver.
    ['written slot', 'const box = { value: Array }; box.value = custom;', 'box.value', method === 'usage-global' ? 'Array' : null],
    // a container bound to a NAMED call is indexed through the callee's literal: the write reaches
    // the read the same way
    ['written call-bound slot', 'const f = () => ({ value: Array }); const box = f(); box.value = custom;', 'box.value', method === 'usage-global' ? 'Array' : null],
    ['assign getter', 'const box = { value: Array }; Object.assign(box, { get value() { return custom; } });', 'box.value', method === 'usage-global' ? 'Array' : null],
    ['assign spread', 'const box = { value: Array }; Object.assign(box, { ...custom });', 'box.value', method === 'usage-global' ? 'Array' : null],
    ['assign method', 'const box = { value: Array }; Object.assign(box, { value() {} });', 'box.value', method === 'usage-global' ? 'Array' : null],
    ['assigned fresh getter', 'const box = { value: Array }; Object.assign(box, { get value() { return { from: () => 1 }; } });', 'box.value', null],
    ['assigned effectful getter', 'const box = { value: Array }; Object.assign(box, { get value() { effect(); return { from: () => 1 }; } });', 'box.value', null],
    ['assigned fresh data', 'const box = { value: Array }; Object.assign(box, { value: { from: () => 1 } });', 'box.value', null],
    ['written fresh data', 'const box = { value: Array }; box.value = { from: () => 1 };', 'box.value', null],
    ['conditional assign', 'const box = { value: Array }; if (flag) Object.assign(box, { get value() { return {}; } });', 'box.value', method === 'usage-global' ? 'Array' : null],
    ['optional assign', 'const box = { value: Array }; Object.assign?.(box, { get value() { return {}; } });', 'box.value', method === 'usage-global' ? 'Array' : null],
    ['shadowed assign', 'const Object = custom; const box = { value: Array }; Object.assign(box, { get value() { return {}; } });',
      'box.value', method === 'usage-global' ? 'Array' : null],
    ['patched assign', 'Object.assign = custom; const box = { value: Array }; Object.assign(box, { get value() { return {}; } });',
      'box.value', method === 'usage-global' ? 'Array' : null],
    ['assign setter target', 'const box = { get value() { return Array; }, set value(value) {} }; Object.assign(box, { get value() { return {}; } });',
      'box.value', method === 'usage-global' ? 'Array' : null],
    ['assign getter target', 'const box = { set value(value) {}, get value() { return Array; } }; Object.assign(box, { get value() { return {}; } });',
      'box.value', method === 'usage-global' ? 'Array' : null],
    ['assign duplicate unknown', 'const box = { value: Array }; Object.assign(box, { get value() { return {}; } }, { value: custom });',
      'box.value', method === 'usage-global' ? 'Array' : null],
    ['assign getter this', 'const box = { value: Array }; Object.assign(box, { get value() { return this.other; }, other: custom });',
      'box.value', method === 'usage-global' ? 'Array' : null],
    ['assign later restored', 'const box = { value: Array }; Object.assign(box, { get value() { return {}; } }); box.value = Array;',
      'box.value', method === 'usage-global' ? 'Array' : null],
    ['assign later opaque', 'const box = { value: Array }; Object.assign(box, { get value() { return {}; } }); Object.assign(box, unknown);',
      'box.value', method === 'usage-global' ? 'Array' : null],
    ['assign after read', 'const box = { value: Array };', 'box.value', method === 'usage-global' ? 'Array' : null, 'Object.assign(box, { get value() { return {}; } });'],
    ['assign escaped holder', 'const box = { value: Array }; Object.assign(box, { get value() { return {}; } }); mutate(box);',
      'box.value', method === 'usage-global' ? 'Array' : null],
    ['assign mixed callers', 'const box = { value: Array }; Object.assign(box, { get value() { return {}; } });', 'box.value); read(Array', null],
    ['scoped callable namesake', 'other(() => { function read(held) { return held.from([2]); } read(custom); }); const box = { value: Array };', 'box.value', 'Array'],
    // a namesake of the callee bound elsewhere (a foreign parameter) is no read of the callee, so
    // its caller set stays closed - and stays closed when an escaping literal makes the escape
    // census ask the accountability question first, the order that once answered on names alone
    ['namesake parameter', 'function swap(read) {} const box = { value: Array };', 'box.value', 'Array'],
    [
      'namesake parameter beside an exported literal',
      'function swap(read) {} export const custom = { of: () => other }; const box = { value: Array };',
      'box.value',
      'Array',
    ],
    [
      'namesake parameter beside a handed-out literal',
      'function swap(read) {} const custom = { of: () => other }; hand(custom); const box = { value: Array };',
      'box.value',
      'Array',
    ],
    [
      'namesake pattern parameter beside an exported literal',
      'function swap({ read }) {} export const custom = { of: () => other }; const box = { value: Array };',
      'box.value',
      'Array',
    ],
    [
      'namesake local beside an exported literal',
      'function swap() { const read = 1; return read; } export const custom = { of: () => other }; const box = { value: Array };',
      'box.value',
      'Array',
    ],
    ['callee handed out through an exported literal', 'export const custom = { of: () => read }; const box = { value: Array };', 'box.value', null],
    // the method of a local literal resolves the way a function does: a namesake of the LITERAL's
    // name read bare, written or destructured in another scope opens nothing, while a bare read
    // of the literal itself does
    ['literal method', 'const lit = { of() { return Array; } };', 'lit.of()', 'Array'],
    ['literal method beside a namesake parameter', 'function swap(lit) { return lit; } const lit = { of() { return Array; } };', 'lit.of()', 'Array'],
    ['literal method beside a namesake pattern parameter', 'function swap({ lit }) { return lit; } const lit = { of() { return Array; } };', 'lit.of()', 'Array'],
    ['literal method beside a namesake local', 'function elsewhere() { const lit = 1; return lit; } const lit = { of() { return Array; } };', 'lit.of()', 'Array'],
    ['literal method beside a namesake member write', 'function elsewhere(lit) { lit.of = 1; } const lit = { of() { return Array; } };', 'lit.of()', 'Array'],
    ['literal method shadowed by a parameter', 'const lit = { of() { return Array; } }; function inner(lit) { read(lit.of()); }', 'custom', null],
    ['literal read bare', 'const lit = { of() { return Array; } }; hand(lit);', 'lit.of()', null],
    ['local shadow', 'function get() { const Array = custom; return Array; }', 'get()', null],
    ['mixed callers', 'const box = { value: Array };', 'box.value); read(custom', null],
  ]) {
    const program = parser.parseAndScope(`${ setup } function read(held) { return held.from([1]); } read(${ argument }); ${ after }`);
    const census = collectFileCensus(program.node, [escapedCtorReferencesReducer(), mutationShapesReducer()]);
    const read = parser.pickPath(program, 'MemberExpression', path => path.node.object.name === 'held'
      && path.parentPath.node.arguments?.[0]?.elements?.[0]?.value === 1);
    const resolver = parser.makeResolver();
    let scans = 0;
    const options = { method, getWrittenContainerSlots: () => census.writtenContainerSlots,
      getContainerSlotIndex: () => census.containerSlotIndex, getMutationRoots: () => census.mutationRoots };
    const adapter = parser.name === 'babel' ? createBabelAdapter(options) : createEstreeAdapter(options);
    adapter.parameterStaticSources = new WeakMap();
    adapter.parameterCallSites = (...args) => {
      scans++;
      return resolver.parameterCallSites(...args);
    };
    function query() {
      return staticContainerReceiverName({ node: read.node.object, scope: read.scope, adapter, path: read });
    }
    check(`${ parser.name }/${ method }/${ name } source`, query(), expected);
    const firstScans = scans;
    check(`${ parser.name }/${ method }/${ name } repeat`, query(), expected);
    check(`${ parser.name }/${ method }/${ name } cached census`, scans, firstScans);
    if (['assigned fresh getter', 'assigned effectful getter', 'assigned fresh data', 'written fresh data'].includes(name)) {
      const candidates = collectMemberUnionCandidates({ objectNode: read.node.object, computedKeyNode: null,
        primaryObject: null, primaryKey: 'from', scope: read.scope, adapter, path: read });
      check(`${ parser.name }/${ method }/${ name } has no static fallback`,
        candidates.filter(candidate => candidate.placement === 'static').length, 0);
    }
  }
}

// A static-looking key is not evidence for a constructor. The unrelated native caller
// keeps the source census active, so these negatives also cover files mixing both kinds.
for (const parser of adapters) for (const key of ['from', 'of', 'resolve', 'allSettled', 'groupBy']) {
  for (const [name, argument, expected] of [
    ['custom literal', `({ ${ key }: value => value })`, []],
    ['opaque receiver', 'custom', []],
    ['nested custom', `({ value: { ${ key }: value => value } }).value`, []],
    ['known and opaque', 'Array); readCustom(custom', ['Array']],
    ['two known constructors', 'Array); readCustom(Uint8Array', ['Array', 'Uint8Array']],
  ]) {
    const program = parser.parseAndScope(`
      function native(held) { return held.from([1]); }
      native(Array);
      function readCustom(customHeld) { return customHeld.${ key }([2]); }
      readCustom(${ argument });
    `);
    const census = collectFileCensus(program.node, [escapedCtorReferencesReducer(), mutationShapesReducer()]);
    const read = parser.pickPath(program, 'MemberExpression', path => path.node.object.name === 'customHeld');
    const options = { method: 'usage-global', getWrittenContainerSlots: () => census.writtenContainerSlots,
      getContainerSlotIndex: () => census.containerSlotIndex, getMutationRoots: () => census.mutationRoots };
    const adapter = parser.name === 'babel' ? createBabelAdapter(options) : createEstreeAdapter(options);
    adapter.parameterStaticSources = new WeakMap();
    adapter.parameterCallSites = parser.makeResolver().parameterCallSites;
    const primary = staticContainerReceiverName({ node: read.node.object, scope: read.scope, adapter, path: read });
    const candidates = collectMemberUnionCandidates({ objectNode: read.node.object, computedKeyNode: null,
      primaryObject: primary, primaryKey: key, scope: read.scope, adapter, path: read });
    const names = [...new Set([primary, ...candidates.filter(candidate => candidate.placement === 'static')
      .map(candidate => candidate.object)].filter(Boolean))].sort();
    check(`${ parser.name }/${ name }/${ key } keeps only supplied constructors`, JSON.stringify(names), JSON.stringify(expected));
  }
}

// Definite stores kill the old slot; uncertain writes retain both sources. A custom
// replacement contributes no constructor merely because the read spells a static key.
for (const parser of adapters) for (const [name, setup, body, argument, key, expected] of [
  ['assignment', '', 'box.M = Map;', '{ M: Object }', 'groupBy', ['Map']],
  ['define property', '', "Object.defineProperty(box, 'M', { value: Map });", '{ M: Object }', 'groupBy', ['Map']],
  ['assign invoker', '', 'Reflect.apply(Object.assign, null, [box, { M: Map }]);', '{ M: Object }', 'groupBy', ['Map']],
  ['alias write', '', 'const alias = box; alias.M = Map;', '{ M: Object }', 'groupBy', ['Map', 'Object']],
  ['empty source alias', '', 'const alias = box; alias.M = Map;', '{}', 'groupBy', ['Map']],
  ['dynamic write', '', 'box[opaque] = Map;', '{ M: Object }', 'groupBy', ['Map', 'Object']],
  ['neighbor slot', '', 'box.other = Map;', '{ M: Object }', 'groupBy', ['Object']],
  ['shadowed constructor', 'const Map = custom;', 'box.M = Map;', '{ M: Object }', 'groupBy', []],
  ['namesake write', 'function other(box) { box.M = Map; return box; } other({});', 'box.M = custom;', '{ M: Object }', 'groupBy', []],
  ['custom returned slot', '', 'box.other = 1;', '{ M: { of: value => value } }', 'of', []],
]) {
  const program = parser.parseAndScope(`${ setup } function swap(box) { ${ body } return box; } swap(${ argument }).M.${ key }([1]);`);
  const census = collectFileCensus(program.node, [escapedCtorReferencesReducer(), mutationShapesReducer()]);
  const read = parser.pickPath(program, 'MemberExpression', path => path.node.property.name === key);
  const options = { method: 'usage-global', getWrittenContainerSlots: () => census.writtenContainerSlots,
    getContainerSlotIndex: () => census.containerSlotIndex, getMutationRoots: () => census.mutationRoots };
  const adapter = parser.name === 'babel' ? createBabelAdapter(options) : createEstreeAdapter(options);
  const primary = staticContainerReceiverName({ node: read.node.object, scope: read.scope, adapter, path: read });
  const candidates = collectMemberUnionCandidates({ objectNode: read.node.object, computedKeyNode: null,
    primaryObject: primary, primaryKey: key, scope: read.scope, adapter, path: read });
  const names = [...new Set([primary, ...candidates.filter(candidate => candidate.placement === 'static')
    .map(candidate => candidate.object)].filter(Boolean))].sort();
  check(`${ parser.name }/${ name } return keeps reachable constructors`, JSON.stringify(names), JSON.stringify(expected));
}

// Recursive return paths must converge even when each call adds another member hop.
for (const parser of adapters) {
  const program = parser.parseAndScope('function recur() { return recur().nested; } recur().value.of(1);');
  collectFileCensus(program.node, [escapedCtorReferencesReducer(), mutationShapesReducer()]);
  const read = parser.pickPath(program, 'MemberExpression', path => path.node.property.name === 'of');
  const adapter = parser.name === 'babel' ? createBabelAdapter({ method: 'usage-global' }) : createEstreeAdapter({ method: 'usage-global' });
  const candidates = collectMemberUnionCandidates({ objectNode: read.node.object, computedKeyNode: null,
    primaryObject: null, primaryKey: 'of', scope: read.scope, adapter, path: read });
  check(`${ parser.name }/recursive return invents no source`, candidates.length, 0);
}

for (const parser of adapters) for (const [name, setup, pattern, argument, count] of [
  ['member', 'const box = { value: Array };', '{ of }', 'box.value', 1],
  ['conditional objects', '', '{ value: { of } }', 'test() ? { value: Array } : { value: Array }', 2],
  ['effectful getter', 'const box = { get value() { effect(); return Array; } };', '{ of }', 'box.value', 0],
  ['foreign function scope', '', '{ of }', '(() => { const Array = custom; return Array; })()', 0],
  ['caller undefined property', '', '{ of = 7 }', '{ of: undefined }', 0],
]) {
  const program = parser.parseAndScope(`${ setup } function read(${ pattern }) { return of(1); } read(${ argument });`);
  collectFileCensus(program.node, [escapedCtorReferencesReducer(), mutationShapesReducer()]);
  const leafPatternPath = parser.pickPath(program, 'ObjectPattern', path => path.node.properties.some(prop => prop.key.name === 'of'));
  const adapter = parser.name === 'babel' ? createBabelAdapter({ method: 'usage-pure' }) : createEstreeAdapter({ method: 'usage-pure' });
  const plan = buildParameterArgumentSynthPlan({
    leafPatternPath, adapter, meta: { object: 'Array', key: 'of', placement: 'static' },
    parameterCallSites: parser.makeResolver().parameterCallSites,
    resolvePure: meta => meta.object === 'Array' && meta.key === 'of'
      ? { kind: 'static', entry: 'array/of', hintName: 'Array$of' } : null,
  });
  check(`${ parser.name }/${ name } caller mirrors`, plan?.targets.length ?? 0, count);
}

finish();
