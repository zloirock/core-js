// Member walks already hold their binding; asking for its type must not look it up again.
import {
  flattenFallbackBranches,
  navigatedChainKeys,
  walkStaticReceiverChain,
} from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { resolveObjectName } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { bindingNodeType } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';

const { check, checkTruthy, runBoth, finish } = createChecker('binding-node-type');

for (const [title, source, ask, expected] of [
  ['global alias', 'const first = Array; first.from([]);',
    ctx => resolveObjectName({ objectNode: ctx.node, ...ctx }), 'Array'],
  ['navigation alias', 'const first = globalThis.Array; const second = first; second.from([]);',
    ctx => navigatedChainKeys(ctx.node, ctx)?.keys.join(','), 'Array'],
  ['container alias', 'const first = { slot: Array }; const second = first; second.from([]);',
    ctx => walkStaticReceiverChain({ receiverNode: ctx.node, walkPath: ['slot'], ...ctx }), 'Array'],
  ['branching alias', 'const first = flag ? Array : Iterator; const second = first; second.from([]);',
    ctx => flattenFallbackBranches({ key: 'from', followAliasLeaves: true, ...ctx }).map(meta => meta.object).join(','),
    'Array,Iterator'],
]) runBoth(title, source, (parser, program, label) => {
  const path = parser.pickPath(program, 'CallExpression');
  const reader = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-global' });
  let bindingReads = 0;
  let typeLookups = 0;
  const adapter = {
    ...reader,
    getBinding(input) { bindingReads++; return reader.getBinding(input); },
    getBindingNodeType(input) {
      typeLookups++;
      const binding = reader.getBinding(input);
      return binding?.node?.type ?? binding?.path?.node?.type ?? null;
    },
  };
  const ctx = { node: path.node.callee.object, scope: path.scope, adapter, path };
  check(`${ label }/resolved value`, ask(ctx), expected);
  checkTruthy(`${ label }/binding proof exercised`, bindingReads > 0);
  check(`${ label }/no repeated type lookup`, typeLookups, 0);
});

for (const [source, expected] of [
  ['const value = Array; value.from([]);', 'VariableDeclarator'],
  ['class value { static from() {} } value.from([]);', 'ClassDeclaration'],
  ['function value() {} value.call(null);', 'FunctionDeclaration'],
  ['function host(value = Array) { value.from([]); }', 'AssignmentPattern'],
  ['function host(value) { value.from([]); }', 'Identifier'],
  ['import value from "opaque"; value.from([]);', 'ImportDefaultSpecifier'],
  ['value.from([]);', null],
]) runBoth(`declaration type/${ source }`, source, (parser, program, label) => {
  const path = parser.pickPath(program, 'CallExpression');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)();
  check(`${ label }/enriched record`, bindingNodeType(adapter.getBinding({ scope: path.scope, name: 'value', path })), expected);
  check(`${ label }/raw record`, bindingNodeType(path.scope.getBinding('value')), expected);
});

// Registry-only declarations win over a stale native path; virtual imports can have no path yet.
const synthetic = { node: { type: 'VariableDeclarator' }, path: { node: { type: 'Identifier' } } };
check('registered declaration type', bindingNodeType(synthetic), 'VariableDeclarator');
check('virtual binding without path', bindingNodeType({}), null);
check('removed binding path', bindingNodeType({ path: { node: null } }), null);
synthetic.node = null;
check('live raw path after record update', bindingNodeType(synthetic), 'Identifier');

finish();
