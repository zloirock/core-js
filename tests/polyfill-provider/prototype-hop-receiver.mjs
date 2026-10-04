// Reading a constructor's prototype does not leave the constructor as the leaf's receiver.
import { destructurePropLeafMeta } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
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

finish();
