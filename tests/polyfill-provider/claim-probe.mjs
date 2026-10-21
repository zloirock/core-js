// The erased claim and the discarded initializer ask one owner for source facts. Queries must
// leave the source untouched, and a retained holder must not acquire a second inline store.
import {
  claimProbeSourceSlot, directClaimProbePlan, directClaimProbeEffects, destructureProbePlan,
  discardedInitProbeNavStart, discardedInitProbePlan, sealedClaimProbePlan,
} from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
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

// A retained alias probes its first served constructor read, without reading THROUGH a native
// constructor that the target can lack. A denied constructor entry keeps the original read.
runBoth('alias probe above a served constructor',
  'const held = globalThis.window; const value = held.Promise.resolve;', (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const ctx = { scope: path.scope, adapter, path };
    const plan = directClaimProbePlan(path.node.init, resolvePure, ctx);
    check(`${ label }/probe ends below the served value`, plan?.aliasProbe.key, 'Promise');
    check(`${ label }/no native constructor dereference`, plan?.aliasProbe.innerKeys.length, 0);
    const denied = directClaimProbePlan(path.node.init, meta => meta.name === 'Promise' ? null : resolvePure(meta), ctx);
    check(`${ label }/unserved constructor`, denied?.aliasProbe.key, 'resolve');
    check(`${ label }/unserved intermediate read`, denied?.aliasProbe.innerKeys.join('.'), 'Promise');
  });

// An outer seal ending at a claim does not hide the inner throwing boundary.
runBoth('nested seal source facts',
  'const value = (before(), (globalThis.window?.self).Array).of(after());', (parser, program, label) => {
    const path = parser.pickPath(program, 'CallExpression', item => item.node.callee.property?.name === 'of');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const ctx = { scope: path.scope, adapter, path };
    const source = path.node.callee;
    const before = JSON.stringify(source);
    const plan = directClaimProbePlan(source, resolvePure, ctx);
    check(`${ label }/inner read`, plan?.key, 'Array');
    check(`${ label }/source anchor`, plan?.source, source);
    check(`${ label }/retained test`, plan?.test.source.source, plan?.navPlan.hops[0].node);
    check(`${ label }/served source reads`, plan?.test.source.served.length, 1);
    check(`${ label }/explicit root`, plan?.test.source.root.pure.hintName, 'globalThis');
    const prefix = parser.pickPath(program, 'CallExpression', item => item.node.callee.name === 'before').node;
    const [after] = path.node.arguments;
    const rendered = { type: 'Identifier', name: 'probe' };
    const effects = directClaimProbeEffects({ decision: plan, node: rendered }, [prefix, plan.test.source.source, after]);
    check(`${ label }/remaining effect count`, effects.length, 3);
    [prefix, rendered, after].forEach((effect, index) => check(`${ label }/effect ${ index }`, effects[index], effect));
    check(`${ label }/query is pure`, JSON.stringify(source), before);
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
// Immediate consumers share a complete guarded-value decision, including the key effect
// inside the reached arm and the fact that the pattern still owes its first property read.
runBoth('discarded initializer live key facts',
  'const value = globalThis.window?.[(effect(), "Array")];', (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const ctx = { scope: path.scope, adapter, path };
    const before = JSON.stringify(path.node.init);
    destructureProbePlan(path.node.init, resolvePure, ctx);
    const plan = destructureProbePlan(path.node.init, resolvePure, ctx);
    check(`${ label }/guarded value`, plan?.kind, 'value');
    check(`${ label }/pattern still owes its read`, plan.readsSource, false);
    check(`${ label }/one branch effect`, plan.alternateEffects.length, 1);
    check(`${ label }/consumed source effect`, plan.consumed.includes(plan.alternateEffects[0]), true);
    check(`${ label }/source root fact`, plan.test.source.root.pure.entry, 'globalThis');
    check(`${ label }/ignored question leaves source intact`, JSON.stringify(path.node.init), before);
  });
runBoth('discarded alias keeps the whole source frame',
  'const held = globalThis.window; const value = (effect(), held.Array);', (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const plan = discardedInitProbePlan(path.node.init, resolvePure, { scope: path.scope, adapter, path });
    const effect = parser.pickPath(program, 'CallExpression').node;
    const node = { type: 'Identifier', name: 'probe' };
    check(`${ label }/source includes its prefix`, plan.source, path.node.init);
    check(`${ label }/prefix remains ahead of the probe`, directClaimProbeEffects({ decision: plan, node }, [effect])[0], effect);
  });
for (const [source, children, root] of [
  ['const value = globalThis.window;', [], 'globalThis'],
  ['const value = (before(), globalThis.window);', ['CallExpression'], 'globalThis'],
  ['let held; const value = (held = globalThis.window);', ['Identifier', 'MemberExpression'], 'globalThis'],
  ['const value = globalThis[key()];', ['CallExpression'], 'globalThis'],
  ['const value = (() => globalThis.window)();', ['CallExpression'], null],
  ['function f(globalThis) { const value = globalThis.window; }', [], null],
]) runBoth(`probe child slots: ${ source }`, source, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const before = JSON.stringify(path.node.init);
  const slot = claimProbeSourceSlot(path.node.init, resolvePure, { scope: path.scope, adapter, path });
  check(`${ label }/independent children`, slot.children.map(node => unwrapRuntimeExpr(node).type).join(','), children.join(','));
  check(`${ label }/root stays a source fact`, slot.root?.pure.hintName ?? null, root);
  check(`${ label }/query preserves the source`, JSON.stringify(path.node.init), before);
});
finish();
