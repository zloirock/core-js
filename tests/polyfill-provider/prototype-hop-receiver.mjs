// Reading a constructor's prototype does not leave the constructor as the leaf's receiver.
import { destructurePropLeafMeta } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { isSourcedSymbolIteratorMeta, SYMBOL_ITERATOR_PURE_RESULT } from '../../packages/core-js-polyfill-provider/detect-usage/globals.js';
import { tagSymbolSourcedMeta } from '../../packages/core-js-polyfill-provider/detect-usage/members.js';
import { resolve } from '../../packages/core-js-polyfill-provider/index.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, runBoth, finish } = createChecker('prototype-hop-receiver');

const rows = [
  {
    label: 'quiet realm prototype',
    source: 'const { prototype: { at, values } } = globalThis.Array;',
  },
  {
    label: 'getter realm prototype',
    source: `
      const A = Array;
      Object.defineProperty(globalThis, 'Array', { get() { effect(); return A; } });
      const { prototype: { at, values } } = (effect(), globalThis.Array);
    `,
    mutated: ['globalThis.Array'],
  },
  {
    label: 'flat realm prototype',
    source: 'const { at, values } = globalThis.Array.prototype;',
  },
  {
    label: 'bare constructor prototype',
    source: 'const { prototype: { at, values } } = Array;',
  },
  {
    label: 'constructor instance-key negative',
    source: 'const { at, values } = globalThis.Array;',
    staticObject: 'Array',
  },
  {
    label: 'nested realm statics',
    source: 'const { Array: { from, of } } = globalThis;',
    staticObject: 'Array',
  },
  {
    label: 'literal holder statics',
    source: 'const box = { A: globalThis.Array }; const { A: { from, of } } = box;',
    staticObject: 'Array',
  },
];

for (const row of rows) {
  for (const method of ['usage-global', 'usage-pure']) {
    runBoth(`${ row.label }/${ method }`, row.source, (parser, program, label) => {
      const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
        method, getMutatedStatics: () => new Set(row.mutated),
      });
      const props = parser.collectPaths(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property',
        path => path.parentPath.node.type === 'ObjectPattern' && path.node.value.type === 'Identifier');
      check(`${ label }/both leaves reach the question`, props.length, 2);
      for (const path of props) {
        const { meta } = destructurePropLeafMeta({
          prop: path.node, objectPattern: path.parentPath, scope: path.scope, path, adapter,
        });
        checkDeep(`${ label }/${ path.node.key.name } receiver`,
          meta && { object: meta.object, placement: meta.placement, receiverHint: meta.receiverHint ?? null },
          row.staticObject ? { object: row.staticObject, placement: 'static', receiverHint: 'function' }
            : { object: null, placement: null, receiverHint: null });
      }
    });
  }
}

// Syntax dependencies can hide the loss of a single computed leaf in a global snapshot.
for (const [name, source, keys] of [
  ['array alias', 'const key = Symbol.iterator; const [{ [key]: a }] = [list];', ['Symbol.iterator']],
  ['array parameter', '(([{ [Symbol.iterator]: a }]) => a)([[1]]);', ['Symbol.iterator']],
  ['array default', 'function f([{ [Symbol.iterator]: a }] = [[1]]) {}', ['Symbol.iterator']],
  ['string control', 'const key = "iterator"; const [{ [key]: a }] = [list];', ['iterator']],
  ['getter beside statics', 'class K { static get I() { mark(); return Iterator; } } '
    + 'export const { prototype: { drop: a }, concat } = K.I; const n = 1, { prototype: { take: b }, from } = K.I;', ['drop', 'take']],
]) {
  runBoth(name, source, (parser, program, label) => {
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-global' });
    const props = parser.collectPaths(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property',
      path => path.parentPath.node.type === 'ObjectPattern' && ['a', 'b'].includes(path.node.value.name));
    const actual = props.map(path => {
      const { node, scope } = path;
      const { meta } = destructurePropLeafMeta({ prop: node, objectPattern: path.parentPath, scope, path, adapter });
      const leaf = tagSymbolSourcedMeta({ meta, keyNode: node.key, computed: node.computed, scope, adapter, path });
      const consumer = leaf && (isSourcedSymbolIteratorMeta(leaf) ? SYMBOL_ITERATOR_PURE_RESULT.entry : resolve(leaf)?.kind);
      return [leaf?.key, Boolean(leaf?.symbolSourced), consumer];
    });
    checkDeep(label, actual, keys.map(key => [key, key === 'Symbol.iterator', key === 'Symbol.iterator' ? 'get-iterator-method' : key === 'iterator' ? undefined : 'instance']));
  });
}

finish();
