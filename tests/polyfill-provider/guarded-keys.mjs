// Symbol proofs and identity guards share wrapper, prefix and delete ownership.
import { anchoredResidualSymbolKeyName, asSymbolRef } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { planGuardedStaticNarrow } from '../../packages/core-js-polyfill-provider/detect-usage/members.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';

const { check, runBoth, finish } = createChecker('guarded-keys');
for (const [setup, expression, expected] of [
  ['', 'Symbol', true], ['', 'globalThis.Symbol', true],
  ['', 'globalThis.window?.Symbol', false], ['', 'globalThis.window?.self.Symbol', false],
  ['', '(globalThis.window?.self).Symbol', false],
  ['', '(choice ? globalThis : self).Symbol', true],
  ['', '((choice ? globalThis : self) as any).Symbol', true],
  ['const get = () => globalThis;', 'get().Symbol', true],
  ['const get = () => ({ Symbol: {} });', 'get().Symbol', false],
  ['const Symbol = {};', 'Symbol', false],
  ['const root = { Symbol: {} };', 'root.Symbol', false],
  ['const root = globalThis;', 'root.Symbol', true],
]) runBoth(`symbol proof/${ setup }/${ expression }`, `${ setup } const value = ${ expression };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value');
  for (const method of ['usage-global', 'usage-pure']) {
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method });
    const node = path.node.init;
    const before = JSON.stringify(node);
    const ctx = { node, path, scope: path.scope, adapter };
    check(`${ label }/${ method }/proof`, !!asSymbolRef(ctx), expected);
    check(`${ label }/${ method }/repeated`, !!asSymbolRef(ctx), expected);
    check(`${ label }/${ method }/no mutation`, JSON.stringify(node), before);
    check(`${ label }/${ method }/anchored residual`, anchoredResidualSymbolKeyName({
      key: { type: 'MemberExpression', object: node, property: { type: 'Identifier', name: 'iterator' }, computed: false },
      computed: true, path, scope: path.scope, adapter,
    }), expected ? 'iterator' : null);
    adapter.isMutatedStatic = (object, key) => object === 'globalThis' && key === 'Symbol';
    check(`${ label }/${ method }/overwritten slot`, asSymbolRef(ctx), null);
  }
});
for (const source of [
  '(a(), (b(), C)).groupBy;',
  '((a(), (missingPrefix, C)) as any).groupBy;',
]) runBoth(`identity prefixes/${ source }`, source, (parser, program, label) => {
  const path = parser.pickPath(program, 'MemberExpression', item => item.node.property.name === 'groupBy');
  const plan = planGuardedStaticNarrow({
    memberNode: path.node, path, parent: path.parentPath.node,
    meta: { key: 'groupBy', guardedAliasHint: 'Map' },
    resolvePure: () => ({ kind: 'static', entry: 'actual/map/group-by', hintName: 'Map$groupBy' }),
  });
  check(`${ label }/receiver`, plan.recvIdent.name, 'C');
  check(`${ label }/prefix length`, plan.seqPrefix.length, 2);
  check(`${ label }/first`, plan.seqPrefix[0].callee.name, 'a');
  check(`${ label }/second`, plan.seqPrefix[1].name ?? plan.seqPrefix[1].callee.name,
    source.includes('missingPrefix') ? 'missingPrefix' : 'b');
});
finish();
