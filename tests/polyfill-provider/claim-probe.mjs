// The erased claim and the discarded initializer ask one owner for source facts. Queries must
// leave the source untouched, and a retained holder must not acquire a second inline store.
import { discardedInitProbeNavStart, discardedInitProbePlan, sealedClaimProbePlan } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { unwrapRuntimeExpr } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';

const { check, checkTruthy, finish, runBoth } = createChecker('claim-probe');
function resolvePure({ name }) {
  return ['globalThis', 'self', 'Array', 'Promise'].includes(name) ? { entry: name, hintName: name } : null;
}

for (const [source, kind, readKind] of [
  ['const value = (globalThis.window?.self).Array;', 'nav', 'leaf'],
  ['const value = (globalThis.window?.self.window).Array;', 'nav', 'leaf'],
  ['const value = (globalThis.window?.Array).of;', 'leaf', 'leaf'],
  ['const value = (globalThis.window?.[(effect(), "Array")]).of;', 'leaf', 'leaf'],
  ['const value = (globalThis.window?.window).Array;', 'leaf', 'leaf'],
  ['const held = globalThis.window; const value = held.Array;', 'alias', null],
  ['const held = globalThis.window; const value = (held.Array).of;', 'alias', null],
  ['const held = globalThis.window; const value = held?.Array;', null, null],
  ['const held = {}; const value = held.Array;', null, null],
  ['function read(globalThis) { const value = (globalThis.window?.self).Array; }', null, null],
  ['const value = (globalThis.window?.self)[key()];', null, null],
]) runBoth(source, source, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value');
  const sourceNode = path.node.init;
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const ctx = { scope: path.scope, adapter, path };
  const before = JSON.stringify(sourceNode);
  // Deliberately ignore both questions before asking the one the consumer will use.
  sealedClaimProbePlan(sourceNode, resolvePure, ctx);
  sealedClaimProbePlan(sourceNode, resolvePure, ctx, { preserveRead: true });
  const plan = sealedClaimProbePlan(sourceNode, resolvePure, ctx);
  const read = sealedClaimProbePlan(sourceNode, resolvePure, ctx, { preserveRead: true });
  check(`${ label }/claim`, plan?.kind ?? null, kind);
  check(`${ label }/read`, read?.kind ?? null, readKind);
  check(`${ label }/query does not edit source`, JSON.stringify(sourceNode), before);
  if (read?.kind === 'leaf') check(`${ label }/kept terminal read`, read.foldLeafOntoBase, false);
  if (!plan) return;
  check(`${ label }/original root`, plan.source, sourceNode);
  if (plan.kind === 'alias') {
    checkTruthy(`${ label }/position`, Number.isInteger(plan.navStart));
  } else {
    check(`${ label }/live effects host`, plan.effectsHost, plan.boundary.inner);
    check(`${ label }/position`, plan.navStart, plan.boundary.inner.start);
    if (plan.kind === 'leaf') {
      check(`${ label }/key effects`, plan.keyEffects.length, source.includes('effect()') ? 1 : 0);
      checkTruthy(`${ label }/source identities`, plan.alternateEffects.every(effect => plan.keyEffects.includes(effect)));
      check(`${ label }/preserved terminal read`, read.foldLeafOntoBase, false);
    }
  }
});

for (const [source, storeAllowed, arrayWrapped] of [
  ['let held; const value = (held = globalThis.window).Array;', true, false],
  ['let held; const value = [(held = globalThis.window).Array];', false, true],
]) runBoth(source, source, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const ctx = { scope: path.scope, adapter, path };
  const input = unwrapRuntimeExpr(path.node.init);
  const member = arrayWrapped ? input.elements[0] : input;
  check(`${ label }/retained holder`, sealedClaimProbePlan(member, resolvePure, ctx), null);
  check(`${ label }/discarded holder`, sealedClaimProbePlan(member, resolvePure, ctx,
    { allowStoreHolder: true })?.kind, 'alias');
  check(`${ label }/mirror owns store`, !!discardedInitProbePlan(path.node.init, resolvePure, ctx)?.aliasProbe, storeAllowed);
});

for (const [source, leafIsProbe, alias] of [
  ['const value = globalThis.window;', true, false],
  ['const value = (effect(), globalThis.window);', true, false],
  ['const value = globalThis.window?.Array;', false, false],
  ['const held = globalThis.window; const value = held.Array;', false, true],
]) runBoth(source, source, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const ctx = { scope: path.scope, adapter, path };
  const plan = discardedInitProbePlan(path.node.init, resolvePure, ctx);
  checkTruthy(`${ label }/discarded value`, plan);
  check(`${ label }/prefix split`, discardedInitProbeNavStart(path.node.init),
    source.includes('effect()') ? unwrapRuntimeExpr(path.node.init).expressions.at(-1).start : 0);
  check(`${ label }/probe leaf`, !!plan?.leafIsProbe, leafIsProbe);
  check(`${ label }/alias boundary`, !!plan?.aliasProbe, alias);
});

// Provenance admits a copy; a true minted read must not recursively acquire a probe.
runBoth('probe source provenance', 'const held = globalThis.window; const value = held.Array;', (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const ctx = { scope: path.scope, adapter, path };
  const source = path.node.init;
  const { start, end, loc, ...minted } = source;
  check(`${ label }/minted`, sealedClaimProbePlan(minted, resolvePure, ctx), null);
  check(`${ label }/source copy`, sealedClaimProbePlan({ ...minted, replacedSpan: { start, end } }, resolvePure, ctx)?.kind, 'alias');
  check(`${ label }/location copy`, sealedClaimProbePlan({ ...minted, loc: { start: { index: start } } }, resolvePure, ctx)?.kind, 'alias');
});
finish();
