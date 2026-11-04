// A constructor fallback preserves source ownership, guards and exceptions before any import.
import { planStaticFallbackReceiver } from '../../packages/core-js-polyfill-provider/detect-usage/guard-preparation.js';
import { renderStaticFallbackReceiver, hostSlot } from '../../packages/core-js-polyfill-provider/render.js';
import { unwrapRuntimeExpr } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, runBoth, finish } = createChecker('static-fallback-receiver');
const fallback = { entry: 'actual/promise/constructor', hintName: 'Promise' };
function resolvePure({ kind, name }) {
  return kind === 'global' && ['globalThis', 'self', 'Promise', 'Map'].includes(name)
    ? { entry: name, hintName: name } : null;
}

for (const [source, kind, setup = '', placement = 'static'] of [
  ['Promise.noSuchStatic', 'replace'],
  ['globalThis.Promise.noSuchStatic', 'replace'],
  ['globalThis.Map.prototype.noSuchStatic', 'replace', '', 'prototype'],
  ['globalThis.Map?.prototype.noSuchStatic', 'replace', '', 'prototype'],
  ['(held = globalThis)?.Map?.prototype.noSuchStatic', 'replace', 'let held;', 'prototype'],
  ['globalThis.Map?.noSuchStatic', 'replace'],
  ['globalThis.window?.self.Promise.noSuchStatic', 'guard'],
  ['globalThis.window?.Map?.prototype.noSuchStatic', 'guard', '', 'prototype'],
  ['(held = globalThis.window)?.Map?.prototype.noSuchStatic', 'guard', 'let held;', 'prototype'],
  ['(held = globalThis.window)?.self.Promise.noSuchStatic', 'guard', 'let held;'],
  ['(held = globalThis.window)?.window?.self.Promise.noSuchStatic', 'guard', 'let held;'],
  ['(held = globalThis.self).Promise.noSuchStatic', 'replace', 'let held;'],
  ['(globalThis.window?.Promise).noSuchStatic', 'replace'],
  ['(globalThis.window?.Promise)[(effect(), "noSuchStatic")]', 'retain'],
  ['held.Promise.noSuchStatic', 'replace', 'const held = globalThis.window;'],
  ['held.noSuchStatic', 'retain', 'const held = globalThis.window?.Promise;'],
]) runBoth(source, `${ setup } const result = ${ source };`, (parser, program, label) => {
  const result = parser.pickPath(program, 'VariableDeclarator', path => path.node.id.name === 'result');
  const path = result.get('init');
  const node = unwrapRuntimeExpr(path.node);
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const ctx = { path, scope: path.scope, adapter };
  const options = { resolvePure, resolveGlobal: ({ name }) => resolvePure({ kind: 'global', name }) };
  const meta = { placement, receiverEffectCount: 0 };
  const before = JSON.stringify(program.node);
  const plan = planStaticFallbackReceiver(node, meta, fallback, ctx, options);
  check(`${ label } choice`, plan?.kind, kind);
  check(`${ label } query preserves tree`, JSON.stringify(program.node), before);
  const repeated = planStaticFallbackReceiver(node, meta, fallback, ctx, options);
  check(`${ label } same native target`, repeated.target, plan.target);
  checkDeep(`${ label } ignored query is repeatable`, { ...repeated, target: null }, { ...plan, target: null });
  if (kind === 'retain') return;
  check(`${ label } original source slot`, plan.receiver === (placement === 'prototype' ? node.object.object : node.object), true);
  if (source.includes('?.Promise).')) check(`${ label } sealed source has throw probe`, !!plan.probe, true);
  if (source.includes('held =')) check(`${ label } kept write is owned`, plan.hadChainAssign, true);
  const reader = placement === 'prototype' ? unwrapRuntimeExpr(node.object) : node;
  check(`${ label } only the replaced receiver is defined`, plan.definedReceiverRead, reader.optional ? reader : null);
  if (kind === 'guard') {
    check(`${ label } original probe`, !!plan.guard?.type, true);
    if (source.includes('?.window?.')) {
      check(`${ label } second read stays in guard`, plan.guard, node.object.object.object);
    }
    check(`${ label } guard owns its write`, plan.effects.length, 0);
    return;
  }
  const imports = [];
  const render = renderStaticFallbackReceiver(plan, {
    injectImport(entry, hint) { imports.push([entry, hint]); return '_pure'; }, embed: hostSlot,
  });
  check(`${ label } receiver import`, imports[0][0], fallback.entry);
  check(`${ label } source untouched after render`, JSON.stringify(program.node), before);
  check(`${ label } canonical result`, !!render.type, true);
  const pending = planStaticFallbackReceiver(node, meta, fallback, ctx, { ...options, pendingReceiver: node.object });
  if (placement === 'prototype' || source.includes('held =')) {
    check(`${ label } pending child owns source`, pending.kind, 'stage');
    check(`${ label } staged source identity`, pending.receiver === node.object, true);
  }
});

runBoth('tail and computed key effects', 'const result = (effect(), Promise)[(key(), "noSuchStatic")];', (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result').get('init');
  const { node } = path;
  const receiver = unwrapRuntimeExpr(node.object);
  const [prefix] = receiver.expressions;
  const [key] = unwrapRuntimeExpr(node.property).expressions;
  const ctx = { path, scope: path.scope, adapter: (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' }) };
  const meta = { placement: 'static', sideEffects: [prefix, key], receiverEffectCount: 1 };
  const plan = planStaticFallbackReceiver(node, meta, fallback, ctx, { resolvePure });
  check(`${ label } tail slot`, plan.receiver === receiver.expressions.at(-1), true);
  check(`${ label } live prefix sequence`, plan.sequence === receiver, true);
  checkDeep(`${ label } both effects stay at source`, plan.effects, []);
  const regular = planStaticFallbackReceiver(node, meta, fallback, ctx, { resolvePure, mintedAliasRef: () => false });
  checkDeep(`${ label } query alone does not mint`, regular, plan);
  check(`${ label } absent constructor declines`, planStaticFallbackReceiver(node, meta, null, ctx, { resolvePure }), null);
});

runBoth('guarded computed constructor and optional call',
  'const result = (before(), globalThis.window)?.[(key(), "Map")].hasOwnProperty?.(arg());', (parser, program, label) => {
    let call = parser.pickPath(program, 'VariableDeclarator').get('init');
    if (call.node.type === 'ChainExpression') call = call.get('expression');
    const path = call.get('callee');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const [before, key] = ['before', 'key'].map(name => parser.pickPath(program, 'CallExpression', p => p.node.callee.name === name).node);
    const meta = { placement: 'static', sideEffects: [before, key], receiverEffectCount: 2 };
    const plan = planStaticFallbackReceiver(path.node, meta, fallback, { path, scope: path.scope, adapter }, { resolvePure });
    check(`${ label } guard`, plan.kind, 'guard');
    check(`${ label } call owns its receiver`, plan.target?.node, call.node);
    check(`${ label } root prefix`, plan.prefix?.[0], before);
    check(`${ label } key in the live arm`, plan.effects[0], key);
  });

finish();
