import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { resolveObjectName } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { createUsageHandlerCore } from '../../packages/core-js-polyfill-provider/detect-usage/visitors.js';
import {
  memberChainKeys, memberKeyNamesReducer, runtimeChainRoot,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { adapters, createChecker } from './harness.mjs';

const { check, checkDeep, checkTruthy, finish } = createChecker('proxy-chain-complexity');

function detectionAdapter(parser, method = 'usage-global') {
  return parser.name === 'babel' ? createBabelAdapter({ method }) : createEstreeAdapter({ method });
}

// Count source-edge reads, not elapsed time. Querying every prefix must not re-walk
// every suffix. Instrument after parsing so scope construction is outside the budget.
for (const parser of adapters) for (const depth of [8, 64, 128, 256]) {
  const program = parser.parseAndScope(`globalThis${ '.self'.repeat(depth) }.Array;`);
  const paths = parser.collectPaths(program, 'MemberExpression');
  let reads = 0;
  for (const { node } of paths) {
    const { object } = node;
    Object.defineProperty(node, 'object', {
      configurable: true, enumerable: true,
      get() {
        reads++;
        return object;
      },
    });
  }
  const label = `${ parser.name }/${ depth }`;
  const adapter = detectionAdapter(parser);
  const proxySegments = new WeakMap();
  for (const path of paths) check(`${ label }/receiver ${ path.node.property.name }`, resolveObjectName({
    objectNode: path.node, scope: path.scope, adapter, path, proxySegments,
  }), path.node.property.name);
  checkTruthy(`${ label }/linear proxy resolution`, reads > 0 && reads <= 12 * paths.length, `${ reads } edge reads`);

  reads = 0;
  const roots = new WeakMap();
  for (const path of paths) check(`${ label }/root`, runtimeChainRoot(path.node, roots).name, 'globalThis');
  checkTruthy(`${ label }/linear root index`, reads > 0 && reads <= 2 * paths.length, `${ reads } edge reads`);

  reads = 0;
  const reducer = memberKeyNamesReducer();
  for (const path of paths) reducer.visit(path.node);
  checkDeep(`${ label }/reserved keys`, [...reducer.result().memberKeyNames].sort(), ['Array', 'self']);
  checkTruthy(`${ label }/linear key census`, reads > 0 && reads <= 3 * paths.length, `${ reads } edge reads`);

  reads = 0;
  let claims = 0;
  const core = createUsageHandlerCore({ adapter, method: 'usage-global', onUsage() { claims++; } });
  for (const path of paths) core.emitMemberUsage(path);
  check(`${ label }/all live members claim`, claims, paths.length);
  checkTruthy(`${ label }/handler shares the index`, reads > 0 && reads <= 32 * paths.length, `${ reads } edge reads`);
}

for (const parser of adapters) {
  const adapter = detectionAdapter(parser);
  const program = parser.parseAndScope('globalThis.self.window.Array; function shadow(globalThis) {}');
  const path = parser.pickPath(program, 'MemberExpression');
  const proxySegments = new WeakMap();
  function resolve(extra = {}) {
    return resolveObjectName({ objectNode: path.node, scope: path.scope, adapter, path, proxySegments, ...extra });
  }
  check(`${ parser.name }/warm segment`, resolve(), 'Array');
  const shadow = parser.pickPath(program, 'FunctionDeclaration');
  check(`${ parser.name }/scope is not cached`, resolve({ scope: shadow.scope, path: shadow }), null);
  check(`${ parser.name }/original scope`, resolve(), 'Array');
  const originalMutation = adapter.isMutatedStatic;
  for (const name of ['self', 'window', 'globalThis', 'Array']) {
    adapter.isMutatedStatic = (object, key) => object === 'globalThis' && key === name;
    check(`${ parser.name }/live mutation ${ name }`, resolve(), null);
  }
  adapter.isMutatedStatic = originalMutation;
  check(`${ parser.name }/mutation cleared`, resolve(), 'Array');

  // Computed keys and terminal values keep their live resolver context across hits.
  for (const [source, expected] of [
    ['globalThis.self.window.Array', 'Array'],
    ['globalThis?.self?.window.Array', 'Array'],
    ['(globalThis as any).self.window.Array', 'Array'],
    ['(effect(), globalThis).self.window.Array', 'Array'],
    ['(() => globalThis)().self.window.Array', 'Array'],
    ['globalThis["self"].window.self.Array', 'Array'],
    ['globalThis.unknown.self.window.Array', null],
    ['({ self: globalThis }).self.window.Array', null],
    ['foreign.self.window.Array', null],
  ]) {
    const parsed = parser.parseAndScope(`const value = ${ source };`);
    const use = parser.pickPath(parsed, 'VariableDeclarator').get('init');
    // Oxc wraps optional chains, while Babel exposes the optional member directly.
    const node = use.node.type === 'ChainExpression' ? use.node.expression : use.node;
    const context = { objectNode: node, scope: use.scope, adapter, path: use };
    check(`${ parser.name }/${ source }/uncached`, resolveObjectName(context), expected);
    const cache = new WeakMap();
    for (let pass = 0; pass < 2; pass++) {
      check(`${ parser.name }/${ source }/${ pass }`, resolveObjectName({ ...context, proxySegments: cache }), expected);
    }
  }

  // A reused handler drops the index between files/passes. Pure never indexes the tree
  // it rewrites, so a changed inner hop is visible even without a reset.
  for (const method of ['usage-global', 'usage-pure']) {
    const parsed = parser.parseAndScope('globalThis.self.self.Array.from([]);');
    const members = parser.collectPaths(parsed, 'MemberExpression');
    const [use] = members;
    const metas = [];
    const core = createUsageHandlerCore({ adapter: detectionAdapter(parser, method), method, onUsage: meta => metas.push(meta) });
    core.emitMemberUsage(use);
    check(`${ parser.name }/${ method }/before edit`, metas[0].object, 'Array');
    members.at(-1).node.property.name = 'Math';
    if (method === 'usage-global') core.reset();
    core.emitMemberUsage(use);
    check(`${ parser.name }/${ method }/after edit`, metas.at(-1).object, null);

    const effectful = parser.parseAndScope('(tick(), globalThis).self.Array.from([]);');
    core.reset();
    core.emitMemberUsage(parser.pickPath(effectful, 'MemberExpression'));
    checkDeep(`${ parser.name }/${ method }/receiver effects for substitution`,
      (metas.at(-1).sideEffects ?? []).map(effect => effect.callee?.name), method === 'usage-pure' ? ['tick'] : []);
  }

  // Root-only queries must not inspect keys; keyed queries retain root-first order and
  // unreadable slots, including the parser-specific wrappers around optional/TS syntax.
  const parsed = parser.parseAndScope('(source as any).first?.[unknown].last;');
  const expr = parser.pickPath(parsed, 'ExpressionStatement').node.expression;
  const chain = memberChainKeys(expr);
  checkDeep(`${ parser.name }/key order`, chain.keys, ['first', null, 'last']);
  check(`${ parser.name }/same root`, runtimeChainRoot(expr), chain.root);
  const sequence = parser.parseAndScope('(effect(), source).first.last;');
  check(`${ parser.name }/sequence is a root`, runtimeChainRoot(parser.pickPath(sequence, 'ExpressionStatement').node.expression).type,
    'SequenceExpression');
}

finish();
