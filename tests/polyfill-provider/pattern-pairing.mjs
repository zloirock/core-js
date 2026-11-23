// Defaults and shared literal slots contribute once, while every distinct source survives.
import {
  followConstLiteralAlias,
  isPropertyNode,
  cycleGuardHas,
  patternMemberTargetPairs,
  patternReceiverSlotNodes,
  patternSlotSpreadShifted,
  patternSlotValues,
  refuseReentry,
  withCanonQuestion,
  withReentrantQuestion,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { resolveObjectName } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { createPatternBindings } from '../../packages/core-js-polyfill-provider/resolve-node-type/pattern-bindings.js';
import { adapters, createChecker, resolvePure } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('pattern-pairing');

function nestedDefaults(size, array, member = false, open = false) {
  let pattern = `{ from: ${ member ? 'sink.from' : 'from' } }`;
  for (let index = size - 1; index >= 0; index--) {
    pattern = array ? `[${ pattern } = ${ open ? '[globalThis]' : '[]' }]`
      : `{ self: ${ pattern } = ${ open ? '{ self: globalThis }' : '{}' } }`;
  }
  return member ? `(${ pattern } = source);` : `const ${ pattern } = source;`;
}

function countPatternReads(parser, tree) {
  let reads = 0;
  for (const [type, key] of [['ObjectPattern', 'properties'], ['ArrayPattern', 'elements']]) {
    for (const { node } of parser.collectPaths(tree, type)) {
      const value = node[key];
      Object.defineProperty(node, key, { configurable: true, enumerable: true, get() {
        reads++;
        return value;
      } });
    }
  }
  return () => reads;
}

for (const parser of adapters) for (const array of [false, true]) for (const size of [4, 8, 12, 16]) {
  for (const kind of ['spread', 'members', 'receivers', 'values']) {
    const tree = parser.parseAndScope(nestedDefaults(size, array, kind === 'members', kind === 'receivers' || kind === 'values'));
    const { node } = parser.pickPath(tree, kind === 'members' ? 'AssignmentExpression' : 'VariableDeclarator');
    const { id, left } = node;
    const pattern = id ?? left;
    const source = node.init ?? node.right;
    const count = countPatternReads(parser, tree);
    const ctx = {
      preservesBody: true, readsThrough: true, includeNestedReceivers: true, includeBindings: true,
      slotReceivers: new Map(), rawReads: new Set(), positionalReads: new Set(),
    };
    const answer = kind === 'spread' ? patternSlotSpreadShifted(pattern, source, 'from')
      : kind === 'members' ? patternMemberTargetPairs(pattern, source)
        : kind === 'receivers' ? patternReceiverSlotNodes(pattern, source, 'from', ctx)
          : patternSlotValues(pattern, source, 'from', ctx);
    const label = `${ parser.name }/${ array }/${ size }/${ kind }`;
    check(`${ label }/counter armed`, count() >= size, true);
    check(`${ label }/bounded work (${ count() })`, count() <= 16 * (size + 1) ** 2, true);
    if (kind === 'spread') check(`${ label }/no spread`, answer, false);
    else {
      check(`${ label }/values present`, answer.length > 0, true);
      check(`${ label }/bounded union (${ answer.length })`, answer.length <= 4 * (size + 1) ** 2, true);
      check(`${ label }/unique nodes`, new Set(answer).size, answer.length);
    }
  }
}

runBoth('default and supplied values', 'const { a: { from = fallback } = { from: second } } = { a: { from: first } };', (parser, tree, label) => {
  const { id, init } = parser.pickPath(tree, 'VariableDeclarator').node;
  checkDeep(`${ label }/all sources`, patternSlotValues(id, init, 'from').map(node => node.name), ['fallback', 'first', 'second']);
  checkDeep(`${ label }/without defaults`, patternSlotValues(id, init, 'from', { includeDefaults: false }).map(node => node.name), ['first']);
  // Each root call has fresh state, including calls after a rewrite of the same nodes.
  init.properties[0].value.properties[0].value.name = 'changed';
  checkDeep(`${ label }/rewrite`, patternSlotValues(id, init, 'from').map(node => node.name), ['fallback', 'changed', 'second']);
});

for (const parser of adapters) for (const method of ['usage-global', 'usage-pure']) {
  const tree = parser.parseAndScope('const values = [Array]; const [a] = [values]; const [b] = [a]; const result = b;');
  const path = parser.pickPath(tree, 'VariableDeclarator', item => item.node.id.name === 'result');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method, resolvePure });
  const { getBinding } = adapter;
  let lookups = 0;
  adapter.getBinding = input => {
    lookups++;
    return getBinding(input);
  };
  const ctx = { adapter, scope: path.scope, path };
  const result = path.node.init;
  const literal = parser.pickPath(tree, 'VariableDeclarator', item => item.node.id.name === 'values').node.init;
  withCanonQuestion(() => {
    for (const guard of [[], ['a'], ['unrelated'], ['values'], []]) {
      const context = { ...ctx, seen: new Set(guard) };
      check(`${ parser.name }/${ method }/guard ${ guard }`, followConstLiteralAlias(result, context),
        guard.includes('a') || guard.includes('values') ? result : literal);
    }
    withReentrantQuestion(() => check(`${ parser.name }/${ method }/reentry`, followConstLiteralAlias(result, ctx), literal), 'lookup');
    const before = lookups;
    check(`${ parser.name }/${ method }/equivalent context`, followConstLiteralAlias(result, { ...ctx }), literal);
    check(`${ parser.name }/${ method }/equivalent context reuses proof`, lookups, before);
  });
}

for (const [source, shifted] of [
  ['const { a: [held] = [...unknown, Array] } = {};', true],
  ['const [[held] = [...unknown, Array]] = [];', true],
  ['const { a: [held] = [Array] } = { a: [...unknown, Array] };', true],
  ['const [[held] = [Array]] = [[...unknown, Array]];', true],
  ['const { a: [held] = [Array] } = {};', false],
  ['const [[held] = [Array]] = [];', false],
]) runBoth(`spread completeness/${ source }`, source, (parser, tree, label) => {
  const { id, init } = parser.pickPath(tree, 'VariableDeclarator').node;
  check(label, patternSlotSpreadShifted(id, init, 'held'), shifted);
});

runBoth('source scope and value sinks', 'const { [key]: held } = choose(); const source = { a: first, b: second };', (parser, tree, label) => {
  const { id, init } = parser.pickPath(tree, 'VariableDeclarator').node;
  const source = parser.pickPath(tree, 'VariableDeclarator', item => item.node.id.name === 'source').node.init;
  const scopes = [{ key: 'a' }, { key: 'b' }];
  const valueScopes = new Map();
  const ctx = {
    valueScopes,
    resolveKey: ({ scope }) => scope.key,
    pairedSources: value => value === init ? scopes.map(scope => ({ source, scope })) : null,
  };
  const values = patternSlotValues(id, init, 'held', ctx);
  checkDeep(`${ label }/scope changes key`, values.map(value => value.name), ['first', 'second']);
  checkDeep(`${ label }/value scopes`, values.map(value => valueScopes.get(value)), scopes);
});

runBoth('opaque receiver keeps its own scope', 'const { [key]: held } = choose; const source = { a: first, b: second };', (parser, tree, label) => {
  const { id, init } = parser.pickPath(tree, 'VariableDeclarator').node;
  let expansions = 0;
  const [value] = patternSlotValues(id, init, 'held', {
    scope: { key: 'a' }, resolveKey: ({ scope }) => scope.key,
    pairedSources: () => { expansions++; return []; },
  });
  check(`${ label }/receiver`, value.object, init);
  check(`${ label }/key`, value.property.name, 'a');
  check(`${ label }/receiver needs no source expansion`, expansions, 0);
});

runBoth('leaf completeness does not resolve its value', 'const held = source;', (parser, tree, label) => {
  const path = parser.pickPath(tree, 'VariableDeclarator');
  let lookups = 0;
  const adapter = { hasBinding() {
    lookups++;
    return false;
  } };
  check(`${ label }/cannot contain a spread`, patternSlotSpreadShifted(path.node.id, path.node.init, 'held', { adapter, path }), false);
  check(`${ label }/no source lookup`, lookups, 0);
});

for (const cut of ['guard', 'lookup']) runBoth(`incomplete pairing/${ cut }`, 'const { [key]: held } = choose(); const source = {};', (parser, tree, label) => {
  const { id, init } = parser.pickPath(tree, 'VariableDeclarator').node;
  const source = parser.pickPath(tree, 'VariableDeclarator', item => item.node.id.name === 'source').node.init;
  let keys = 0;
  patternSlotValues(id, init, 'held', {
    pairedSources: value => value === init ? [{ source }, { source }] : null,
    resolveKey: () => {
      keys++;
      if (cut === 'guard') cycleGuardHas(new Set(['blocked']), 'blocked');
      else refuseReentry();
      return 'absent';
    },
  });
  check(`${ label }/no incomplete proof kept`, keys, 2);
});

runBoth('receiver sinks', 'const { a: { value, ...rest } = fallback, b: [other] } = source;', (parser, tree, label) => {
  const { id, init } = parser.pickPath(tree, 'VariableDeclarator').node;
  const ctx = {
    includeBindings: true, includeNestedReceivers: true, readsThrough: true, preservesBody: true,
    rawReads: new Set(), positionalReads: new Set(), slotReceivers: new Map(),
    restSources: [], restValues: [], opaqueKeys: [], selectionLevels: [],
  };
  const first = patternReceiverSlotNodes(id, init, null, ctx);
  checkDeep(`${ label }/slots`, first.map(prop => prop.key.name), ['a', 'value', 'b']);
  check(`${ label }/default receiver retained`, ctx.slotReceivers.get(first[1]).length, 2);
  check(`${ label }/both rest sources`, ctx.restSources.length, 2);
  check(`${ label }/both rest records`, ctx.restValues.length, 2);
  check(`${ label }/store state restored`, ctx.belowStore, false);
  check(`${ label }/source state restored`, ctx.belowSource, false);
  const second = patternReceiverSlotNodes(id, init, null, { ...ctx, slotReceivers: new Map(), belowStore: true });
  checkDeep(`${ label }/fresh stored call`, second, first);
  check(`${ label }/stored reads recorded`, first.every(prop => ctx.rawReads.has(prop)), true);
});

runBoth('shared receiver through a stored alternative', 'const { value: held } = choose(); const sources = [source, saved = source];', (parser, tree, label) => {
  const { id, init } = parser.pickPath(tree, 'VariableDeclarator').node;
  const [source, stored] = parser.pickPath(tree, 'ArrayExpression').node.elements;
  // Source expansion can return the same node both directly and inside a retained store.
  stored.right = source;
  const ctx = {
    readsThrough: true, preservesBody: true, rawReads: new Set(), slotReceivers: new Map(),
    pairedSources: value => value === init ? [{ source }, { source: stored }] : null,
  };
  const slots = patternReceiverSlotNodes(id, init, 'held', ctx);
  checkDeep(`${ label }/one source slot`, slots, id.properties);
  checkDeep(`${ label }/one receiver`, ctx.slotReceivers.get(slots[0]), [source]);
  check(`${ label }/stored alternative marks the slot`, ctx.rawReads.has(slots[0]), true);
  check(`${ label }/store provenance restored`, ctx.belowStore, false);
});

for (const size of [4, 8, 12, 16]) runBoth(`shared source graph/${ size }`, `
  const { value: held } = select();
  const sources = [{ value: first }, { value: second }, ${ Array.from({ length: size }, (_, index) => `s${ index }()`).join(', ') }];
`, (parser, tree, label) => {
  const { id, init } = parser.pickPath(tree, 'VariableDeclarator').node;
  const { elements } = parser.pickPath(tree, 'ArrayExpression').node;
  let questions = 0;
  const values = patternSlotValues(id, init, 'held', {
    pairedSources(value) {
      questions++;
      const index = value === init ? elements.length : elements.indexOf(value);
      return [{ source: elements[index - 1] }, { source: elements[index - 2] }];
    },
  });
  checkDeep(`${ label }/distinct values in first-visit order`, values.map(value => value.name), ['second', 'first']);
  check(`${ label }/counter armed`, questions >= size, true);
  check(`${ label }/one question per source`, questions, size + 1);
});

for (const parser of adapters) for (const assigned of [false, true]) for (const size of [4, 8, 12]) {
  const names = Array.from({ length: size + 1 }, (_, index) => `f${ index }`);
  const lines = assigned ? [`let ${ names.join(', ') };`, '[f0] = [Array];'] : ['const [f0] = [Array];'];
  for (let index = 0; index < size; index++) lines.push(`${ assigned ? '' : 'const ' }[f${ index + 1 }] = [f${ index }];`);
  const tree = parser.parseAndScope(`${ lines.join('\n') }\nconst result = f${ size }.from;`);
  const path = parser.pickPath(tree, 'MemberExpression');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure', resolvePure });
  let reads = 0;
  for (const { node } of parser.collectPaths(tree, 'ArrayExpression')) {
    const { elements } = node;
    Object.defineProperty(node, 'elements', { configurable: true, enumerable: true, get() {
      reads++;
      return elements;
    } });
  }
  const answer = resolveObjectName({ objectNode: path.node.object, scope: path.scope, adapter, path });
  const label = `${ parser.name }/aliases/${ assigned }/${ size }`;
  check(`${ label }/receiver`, answer, 'Array');
  check(`${ label }/counter armed`, reads > size, true);
  check(`${ label }/bounded pairing (${ reads })`, reads <= 8 * (size + 1) ** 3, true);
}

const { findArrayPatternKeyPath } = createPatternBindings({
  babelNodeType: node => isPropertyNode(node) ? 'ObjectProperty' : node.type,
  getKeyName: key => key.name,
});
for (const [source, name, expected] of [
  ['const [...{ length }] = rows;', 'length', [-1, 'length']],
  ['const [first, ...{ length: rest }] = rows;', 'rest', [-2, 'length']],
  ['const [first, ...{ length: rest }] = rows;', 'length', null],
]) runBoth(`array rest binding ${ name }`, source, (parser, tree, label) => {
  const pattern = parser.pickPath(tree, 'ArrayPattern');
  checkDeep(label, findArrayPatternKeyPath(pattern.node, name, pattern.scope), expected);
});

finish();
