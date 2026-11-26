// Shared selection arms retain their answer, source identity and candidate side effects.
import { resolveKey, isSymbolSourcedKey } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { walkStaticReceiverChain } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import {
  canonAnswerTable, canonQuestionScope, collectFileCensus, withCanonQuestion, withReentrantQuestion,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { mutationShapesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { adapters, createChecker, resolvePure } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('selection-dag');

function makeAdapter(parser, method) {
  return (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method, resolvePure });
}

function selectionSource(shape, size, leaf = 'Array') {
  const key = shape === 'key';
  const lines = [key ? "const x0 = 'from'; const x1 = 'from';"
    : shape === 'alias' ? `const x0 = ${ leaf }; const x1 = ${ leaf };`
      : `const x0 = { a: ${ leaf } }; const x1 = { a: ${ leaf } };`];
  for (let index = 0; index < size; index++) {
    const value = `c${ index } ? x${ index + 1 } : x${ index }`;
    lines.push(`const x${ index + 2 } = ${ shape === 'slot' ? `{ a: ${ value } }` : value };`);
  }
  lines.push(`const result = ${ key ? `Array[x${ size + 1 }]`
    : `x${ size + 1 }${ shape === 'slot' ? '.a'.repeat(size + 1) : '' }.from` };`);
  return lines.join('\n');
}

// Count the retained trie, not its answers alone: empty context prefixes also occupy memory.
function tableCount(table) {
  if (!table) return 0;
  let count = 1;
  for (const value of table.values()) {
    if (value instanceof Map) count += tableCount(value);
    else if (value?.suffix) count += tableCount(value.children) + tableCount(value.answers);
  }
  return count;
}

const longContextScope = canonQuestionScope();
withCanonQuestion(() => {
  const kind = {};
  const context = Array(128).fill(NaN);
  const answer = canonAnswerTable(kind, context);
  check('long context occupies a bounded number of tables', tableCount(longContextScope.answers.tables) <= 3, true);
  check('equal long context reuses its table', canonAnswerTable(kind, [...context]), answer);
  check('equal context does not split its suffix', tableCount(longContextScope.answers.tables) <= 3, true);
}, longContextScope);

for (const parser of adapters) for (const writes of [1, 2]) for (const size of [8, 16, 32, 65]) {
  const lines = ['const c0 = { C: Object };'];
  for (let index = 1; index <= size; index++) lines.push(`const c${ index } = { next: c${ index - 1 } };`);
  const receiver = `c${ size }${ '.next'.repeat(size) }.C`;
  for (const name of ['Map', 'Set'].slice(0, writes)) lines.push(`${ receiver } = ${ name };`);
  lines.push(`const result = ${ receiver };`);
  const tree = parser.parseAndScope(lines.join('\n'));
  const census = collectFileCensus(tree.node, [mutationShapesReducer()]);
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method: 'usage-global', resolvePure,
    getWrittenContainerSlots: () => census.writtenContainerSlots,
    getContainerSlotIndex: () => census.containerSlotIndex,
  });
  const path = parser.pickPath(tree, 'VariableDeclarator', item => item.node.id.name === 'result');
  const question = canonQuestionScope();
  const unionSink = [];
  const answer = withCanonQuestion(() => walkStaticReceiverChain({
    receiverNode: path.node.init, walkPath: [], scope: path.scope, path, adapter, unionSink,
  }), question);
  const label = `${ parser.name }/written chain/${ writes }/${ size }`;
  const direct = writes === 1 && size < 32;
  check(`${ label }/answer`, answer, direct ? 'Map' : null);
  checkDeep(`${ label }/candidates`, unionSink, direct || size === 65 ? []
    : writes === 1 ? ['Map', 'Object'] : ['Map', 'Set', 'Object']);
  const tables = tableCount(question.answers.tables);
  check(`${ label }/counter is armed`, tables > 1, true);
  check(`${ label }/retained context tables stay bounded (${ tables })`, tables <= 100 * size + 64, true);
}

for (const parser of adapters) for (const shape of ['key', 'alias', 'slot']) for (const size of [4, 8, 12, 16]) {
  const tree = parser.parseAndScope(selectionSource(shape, size));
  const path = parser.pickPath(tree, 'VariableDeclarator', item => item.node.id.name === 'result');
  let reads = 0;
  for (const { node } of parser.collectPaths(tree, 'ConditionalExpression')) {
    const { consequent } = node;
    Object.defineProperty(node, 'consequent', { configurable: true, enumerable: true, get() {
      reads++;
      return consequent;
    } });
  }
  const adapter = makeAdapter(parser, shape === 'slot' ? 'usage-global' : 'usage-pure');
  const unionSink = [];
  const answer = withCanonQuestion(() => shape === 'key' ? resolveKey({
    node: path.node.init.property, computed: true, scope: path.scope, path, adapter,
  }) : walkStaticReceiverChain({
    receiverNode: path.node.init.object, walkPath: [], scope: path.scope, path, adapter,
    unionSink: shape === 'slot' ? unionSink : null,
  }));
  const label = `${ parser.name }/${ shape }/${ size }`;
  check(`${ label }/answer`, answer, shape === 'key' ? 'from' : shape === 'alias' ? 'Array' : null);
  checkDeep(`${ label }/candidates`, unionSink, shape === 'slot' ? ['Array'] : []);
  check(`${ label }/counter is armed`, reads > size, true);
  // Cubic ceiling covers context/depth distinctions, not an enumeration of every path.
  check(`${ label }/shared arms stay bounded (${ reads })`, reads <= size ** 3 / 4 + 32, true);
}

for (const parser of adapters) for (const size of [4, 8, 12, 16]) {
  const source = Array.from({ length: size + 2 }, (_, index) => {
    return `function f${ index }() { return c${ index } ? f${ (index + 1) % (size + 2) }() : f${ (index + 2) % (size + 2) }(); }`;
  }).join('\n');
  const tree = parser.parseAndScope(`${ source }\nconst result = f0().at(0);`);
  const path = parser.pickPath(tree, 'VariableDeclarator', item => item.node.id.name === 'result');
  let reads = 0;
  for (const { node } of parser.collectPaths(tree, 'ConditionalExpression')) {
    const { consequent } = node;
    Object.defineProperty(node, 'consequent', { configurable: true, enumerable: true, get() {
      reads++;
      return consequent;
    } });
  }
  const selectionSink = [];
  const answer = withCanonQuestion(() => walkStaticReceiverChain({
    receiverNode: path.node.init.callee.object, walkPath: [], scope: path.scope, path,
    adapter: makeAdapter(parser, 'usage-pure'), selectionSink,
  }));
  const label = `${ parser.name }/cyclic returns/${ size }`;
  check(`${ label }/no proven receiver`, answer, null);
  checkDeep(`${ label }/no invented candidates`, selectionSink, []);
  check(`${ label }/counter is armed`, reads > size, true);
  check(`${ label }/blocked arms stay bounded (${ reads })`, reads <= size ** 3 + 32, true);
}

for (const [name, source, key, symbol] of [
  ['string', "const k = c ? 'at' : 'at'; const result = k;", 'at', false],
  ['symbol', 'const s = Symbol.iterator; const k = c ? s : Symbol.iterator; const result = k;', 'Symbol.iterator', true],
  ['string spelling', "const k = c ? 'Symbol.iterator' : 'Symbol.iterator'; const result = k;", 'Symbol.iterator', false],
  ['different provenance', "const k = c ? Symbol.iterator : 'Symbol.iterator'; const result = k;", null, false],
  ['shared symbol arms', 'const a = Symbol.iterator; const b = Symbol.iterator; const c = first() ? b : a; const result = second() ? c : b;', 'Symbol.iterator', true],
  ['shared mixed arms', "const a = Symbol.iterator; const b = 'Symbol.iterator'; const c = first() ? b : a; const result = second() ? c : b;", null, false],
  ['different names', "const k = c ? 'from' : 'of'; const result = k;", null, false],
  ['own cycle', "const k = c ? k : 'from'; const result = k;", null, false],
  ['mutual cycle', "const a = c ? b : 'from'; const b = c ? a : 'from'; const result = a;", null, false],
]) runBoth(name, source, (parser, tree, label) => {
  const path = parser.pickPath(tree, 'VariableDeclarator', item => item.node.id.name === 'result');
  for (const method of ['usage-global', 'usage-pure']) {
    const adapter = makeAdapter(parser, method);
    const ctx = { node: path.node.init, scope: path.scope, path, adapter, computed: true };
    withCanonQuestion(() => {
      for (const order of [false, true]) {
        if (order) check(`${ label }/${ method }/symbol first`, isSymbolSourcedKey(ctx), symbol);
        check(`${ label }/${ method }/key`, resolveKey(ctx), key);
        check(`${ label }/${ method }/symbol`, isSymbolSourcedKey(ctx), symbol);
      }
      withReentrantQuestion(() => check(`${ label }/${ method }/reentrant`, resolveKey(ctx), key), 'lookup');
    });
  }
});

runBoth('guard contexts', "const a = 'from'; const b = 'of'; const key = c ? a : a; const result = key;", (parser, tree, label) => {
  const path = parser.pickPath(tree, 'VariableDeclarator', item => item.node.id.name === 'result');
  const adapter = makeAdapter(parser, 'usage-pure');
  const ctx = { node: path.node.init, scope: path.scope, path, adapter, computed: true };
  withCanonQuestion(() => {
    for (const names of [['unused'], ['a'], ['elsewhere'], ['key'], []]) {
      check(`${ label }/${ names }`, resolveKey({ ...ctx, seen: new Set(names) }), names.includes('a') || names.includes('key') ? null : 'from');
    }
    check(`${ label }/budget cannot use shallow answer`, resolveKey({ ...ctx, depth: 64 }), null);
    check(`${ label }/shallow after budget cut`, resolveKey(ctx), 'from');
  });
  const arm = parser.pickPath(tree, 'ConditionalExpression').node;
  arm.alternate.name = 'b';
  check(`${ label }/rewrite expires answer`, resolveKey(ctx), null);
});

for (const [name, source, candidates] of [
  ['simple', 'const C = choice ? Array : Object; const result = C;', ['Array', 'Object']],
  ['nested', 'const A = choice ? Array : Object; const C = other ? A : Set; const result = C;', ['Array', 'Object', 'Set']],
]) runBoth(`receiver sinks/${ name }`, source, (parser, tree, label) => {
  const path = parser.pickPath(tree, 'VariableDeclarator', item => item.node.id.name === 'result');
  const adapter = makeAdapter(parser, 'usage-pure');
  const ctx = { receiverNode: path.node.init, walkPath: [], scope: path.scope, path, adapter };
  withCanonQuestion(() => {
    for (const prefix of [[], ['String'], []]) {
      const selectionSink = [...prefix];
      check(`${ label }/no agreed receiver`, walkStaticReceiverChain({ ...ctx, selectionSink }), null);
      checkDeep(`${ label }/complete candidates`, selectionSink, [...prefix, ...candidates]);
    }
    check(`${ label }/no candidates requested`, walkStaticReceiverChain(ctx), null);
  });
});

for (const [name, source, walkPath, expected] of [
  ['getter', 'const result = c ? { get a() { effect(); return Array; } } : { get a() { effect(); return Array; } };', ['a'], 'Array'],
  ['conditional call', 'let make; if (d) make = () => ({ g: globalThis }); const result = c ? make?.() : { g: globalThis };', ['g'], 'globalThis'],
]) runBoth(`effect sinks/${ name }`, source, (parser, tree, label) => {
  const path = parser.pickPath(tree, 'VariableDeclarator', item => item.node.id.name === 'result');
  const adapter = makeAdapter(parser, 'usage-pure');
  const { consequent, alternate } = path.node.init;
  const rescues = name === 'getter' ? [consequent.properties[0], alternate.properties[0]] : [];
  const calls = name === 'getter' ? [] : [consequent.expression ?? consequent];
  withCanonQuestion(() => {
    for (const prefix of [[], [path.node.id], []]) {
      const rescueSink = [...prefix];
      const conditionalSink = [...prefix];
      check(`${ label }/answer`, walkStaticReceiverChain({
        receiverNode: path.node.init, walkPath, scope: path.scope, path, adapter,
        rescuesReceiverRead: true, navKeys: walkPath.length, preservesSelection: true, rescueSink, conditionalSink,
      }), expected);
      check(`${ label }/rescue count`, rescueSink.length, prefix.length + rescues.length);
      check(`${ label }/rescue identity and order`, rescueSink.every((value, index) => value === [...prefix, ...rescues][index]), true);
      check(`${ label }/conditional count`, conditionalSink.length, prefix.length + calls.length);
      check(`${ label }/conditional identity and order`, conditionalSink.every((value, index) => value === [...prefix, ...calls][index]), true);
    }
  });
});

runBoth('provenance callbacks', 'const C = choice ? Array : Object; const result = C;', (parser, tree, label) => {
  const path = parser.pickPath(tree, 'VariableDeclarator', item => item.node.id.name === 'result');
  for (const method of ['usage-global', 'usage-pure']) {
    const adapter = makeAdapter(parser, method);
    const guards = [];
    function resolveLeaf(hop) {
      if (hop.node.name !== 'Array' && hop.node.name !== 'Object') return null;
      guards.push(hop.seen);
      return { hop };
    }
    const ctx = { receiverNode: path.node.init, walkPath: [], scope: path.scope, path, adapter, resolveLeaf };
    withCanonQuestion(() => {
      check(`${ label }/${ method }/fresh answers do not agree`, walkStaticReceiverChain(ctx), null);
      check(`${ label }/${ method }/both arms visited`, guards.length, 2);
      check(`${ label }/${ method }/repeat still disagrees`, walkStaticReceiverChain(ctx), null);
      check(`${ label }/${ method }/repeat obtains its own provenance`, guards.length, 4);
      check(`${ label }/${ method }/guards are not shared between walks`, new Set(guards).size, 4);
    });
  }
});

finish();
