// Source effects keep their live identity, but the prepared receiver is independent of later edits.
import { adapters, createChecker } from '../polyfill-provider/harness.mjs';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import createUsagePureCallback from '../../packages/core-js-unplugin/internals/usage-pure.js';
import { nodeSite, stampNodeSite } from '../../packages/core-js-unplugin/internals/nav-spine.js';

const { check, finish } = createChecker('unplugin-receiver-effects');
const parser = adapters.find(item => item.name === 'oxc');

for (const mutate of [false, true]) {
  const tree = parser.parseAndScope('const rows = []; rows[(key(), Symbol.iterator)];');
  const path = parser.pickPath(tree, 'MemberExpression', item => item.node.computed);
  const receiver = path.node.object;
  const key = parser.pickPath(tree, 'CallExpression').node;
  const type = { constructor: 'Array' };
  const resolvedType = new WeakMap([[receiver, type]]);
  stampNodeSite(receiver, { scope: path.scope, path });
  let imports = 0;
  let rewrites = 0;
  const applyUsage = createUsagePureCallback({
    adapter: createEstreeAdapter({ method: 'usage-pure' }),
    destructureEmit: { probeRenderCtx: {} },
    injector: {},
    injectorState: {},
    skippedNodes: new WeakSet(),
    resolvedType,
    isDisabled: () => false,
    isInTypeAnnotation: () => false,
    isThisReceiver: () => false,
    isMutatedStatics: () => false,
    memberWritePositionBails: () => false,
    resolvePure: () => null,
    resolveNodeType: () => null,
    resolveGlobalPolyfill: () => null,
    semanticParentNode: item => item.parentPath.node,
    markRewrite() { rewrites++; },
    isEntryAvailable: () => true,
    injectPureImport() {
      imports++;
      // This host callback runs after effect preparation and before final receiver cloning.
      if (mutate) receiver.name = 'changed';
      return '_iterator';
    },
  });
  applyUsage({ kind: 'property', key: 'Symbol.iterator', symbolSourced: true,
    sideEffects: [key], receiverEffectCount: 0 }, path);
  const [first, effect, lookup] = tree.node.body[1].expression.expressions;
  check(`${ mutate }/symbol route reached`, imports, 1);
  check(`${ mutate }/symbol replacement applied`, rewrites, 1);
  check(`${ mutate }/key remains after the first read`, effect.callee.name, 'key');
  check(`${ mutate }/source edit remains visible to its effect`, first.name, mutate ? 'changed' : 'rows');
  check(`${ mutate }/prepared receiver survives a source edit`, lookup.arguments[0].name, 'rows');
  check(`${ mutate }/final read is independently owned`, lookup.arguments[0] !== first, true);
  check(`${ mutate }/receiver retains its resolved type`, resolvedType.get(lookup.arguments[0]) === type, true);
  check(`${ mutate }/receiver retains its source frame`, nodeSite(lookup.arguments[0]).path === path, true);
}
finish();
