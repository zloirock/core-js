// Split landings and nested claim ownership are source decisions in both dialects.
import {
  optionalConstructorLanding,
  planOptionalMemberSplit,
  optionalSplitReusesSurface,
  planSplitMemberLanding,
  splitConstructorClaim,
  nestedOptionalClaim,
} from '../../packages/core-js-polyfill-provider/detect-usage/optional-split.js';
import { planProvenNavGuardCollapse, proxyReceiverValueCanBeUndefined, undefinableOptionalGuard } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { unwrapRuntimeExpr } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, runBoth, finish } = createChecker('optional-split');
function context(parser, path) {
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  function resolveGlobal(name) {
    return ['globalThis', 'self', 'Array', 'Map', 'Set'].includes(name) ? { kind: 'global', entry: name, hintName: name } : null;
  }
  return { path, scope: path.scope, adapter, resolveGlobal,
    resolvePure(meta) {
      if (meta.kind === 'global') return resolveGlobal(meta.name);
      if (meta.object === 'Object' && meta.key === 'values') return { kind: 'static', entry: 'Object.values' };
      if (meta.key === 'at') return { kind: 'instance', entry: 'at' };
      return null;
    },
    resolvePrototype: (host, key) => host === 'Array' && key === 'at' ? { kind: 'instance', entry: 'Array.at' } : null };
}
function member(parser, program, key) {
  const type = parser.name === 'babel' ? 'OptionalMemberExpression' : 'MemberExpression';
  return parser.pickPath(program, type, item => item.node.property.name === key);
}

for (const [source, entry] of [
  ['globalThis.Map', 'Map'],
  ['globalThis?.Map', 'Map'],
  ['globalThis.window?.Map', null],
  ['(held = window)?.Map', null],
  ['(held = globalThis.self).window?.Set', null],
]) runBoth(`constructor name/${ source }`, `let held; const result = (${ source })?.name;`, (parser, program, label) => {
  const path = member(parser, program, 'name');
  const before = JSON.stringify(program.node);
  check(label, optionalConstructorLanding(path.node.object, context(parser, path))?.pure.entry ?? null, entry);
  check(`${ label }/query preserves source`, JSON.stringify(program.node), before);
});

for (const [source, key, kind, entry] of [
  ['globalThis.Array?.prototype', 'prototype', 'unguarded', 'Array'],
  ['globalThis?.Map', 'Map', 'pure', 'Map'],
  ['(held = globalThis)?.self', 'self', 'surface'],
  ['(effect(), held = globalThis)?.Math', 'Math', 'proven'],
  ['(held = globalThis)?.Math', 'Math', 'member'],
  ['opaque?.Map', 'Map', 'member'],
  ['globalThis.window?.self', 'self', 'surface'],
]) runBoth(`landing/${ source }`, `let held; const result = ${ source };`, (parser, program, label) => {
  const path = member(parser, program, key);
  const ctx = context(parser, path);
  const before = JSON.stringify(program.node);
  const plan = planOptionalMemberSplit(path.node, ctx);
  check(`${ label }/kind`, plan.kind, kind);
  check(`${ label }/entry`, plan.pure?.entry, entry);
  checkDeep(`${ label }/repeat query`, planOptionalMemberSplit(path.node, ctx), plan);
  check(`${ label }/speculation leaves source`, JSON.stringify(program.node), before);
  if (kind === 'surface') check(`${ label }/bare memo`, plan.guard.bareMemo, true);
  else if (kind === 'proven') check(`${ label }/named continuation`, plan.key, 'Math');
});

runBoth('alias landing keeps its binding', 'const realm = globalThis; realm.self?.Array;', (parser, program, label) => {
  const path = member(parser, program, 'Array');
  const plan = planOptionalMemberSplit(path.node, context(parser, path));
  check(`${ label }/unguarded`, plan.kind, 'unguarded');
  check(`${ label }/source alias`, plan.source?.name, 'realm');
});

for (const [source, reuse] of [
  ['(held = globalThis.window)?.self?.self', true],
  ['(held = globalThis)?.window?.self', false],
  ['(held = globalThis.window)?.window?.self', false],
  ['globalThis?.window?.self', false],
  ['globalThis.window?.self?.self', false],
]) runBoth(`second optional/${ source }`, `let held; const result = ${ source };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result').get('init');
  check(`${ label }/reuse`, optionalSplitReusesSurface(unwrapRuntimeExpr(path.node), context(parser, path)), reuse);
});

for (const [source, facts, kind, entry, effectCount] of [
  ['realm.self', { proxySurface: true }, 'surface'],
  ['realm.Map', { proxySurface: true }, 'pure', 'Map', 0],
  ["realm[(effect(), 'Map')]", { proxySurface: true }, 'pure', 'Map', 1],
  ['realm[key]', { proxySurface: true }, 'pure', 'Map', 0],
  ["realm[(effect(), 'values')]", { provenKey: 'Object' }, 'pure', 'Object.values', 1],
  ['realm.at', { provenKey: 'Object' }, 'member'],
  ['realm.unknown', { provenKey: 'self' }, 'member'],
]) runBoth(`continuation/${ source }`, `const key = 'Map'; ${ source };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'MemberExpression');
  const ctx = context(parser, path);
  const before = JSON.stringify(program.node);
  const plan = planSplitMemberLanding(path.node, facts, ctx);
  check(`${ label }/kind`, plan.kind, kind);
  check(`${ label }/entry`, plan.pure?.entry, entry);
  check(`${ label }/effects`, plan.effects?.length, effectCount);
  if (effectCount) check(`${ label }/effect source identity`, plan.effects[0], unwrapRuntimeExpr(path.node.property).expressions[0]);
  checkDeep(`${ label }/repeat`, planSplitMemberLanding(path.node, facts, ctx), plan);
  check(`${ label }/source intact`, JSON.stringify(program.node), before);
});

runBoth('mutated and excluded constructor', 'globalThis?.Map;', (parser, program, label) => {
  const path = member(parser, program, 'Map');
  const ctx = context(parser, path);
  ctx.adapter = { ...ctx.adapter, isMutatedStatic: (host, key) => host === 'globalThis' && key === 'Map' };
  check(`${ label }/mutated read remains`, planOptionalMemberSplit(path.node, ctx).kind, 'member');
  check(`${ label }/mutated guard`, planOptionalMemberSplit(path.node, ctx).guard.mutatedLeaf, true);
  check(`${ label }/mutated chain stays`, splitConstructorClaim('Map', ctx), null);
  const excluded = { ...context(parser, path), resolveGlobal: () => null, resolvePure: () => null };
  check(`${ label }/excluded read remains`, planOptionalMemberSplit(path.node, excluded).kind, 'member');
});

for (const key of ['at', 'Map', 'self']) runBoth(`private optional/${ key }`,
  `class Box { #${ key }; read() { return globalThis.window?.#${ key }; } }`, (parser, program, label) => {
    const type = parser.name === 'babel' ? 'OptionalMemberExpression' : 'MemberExpression';
    const path = parser.pickPath(program, type, item => item.node.optional);
    const ctx = context(parser, path);
    const plan = planOptionalMemberSplit(path.node, ctx);
    check(`${ label }/private member`, plan.kind, 'member');
    check(`${ label }/no public guard key`, plan.guard.readerKey, null);
    check(`${ label }/continuation`, planSplitMemberLanding(path.node, { proxySurface: true }, ctx).kind, 'member');
  });

for (const [source, entry] of [
  ['globalThis.window?.Map.prototype', 'Map'],
  ["globalThis.window?.[(effect(), 'Map')][unknown].tail", 'Map'],
  ['globalThis.window?.Object.values.name', 'Object.values'],
  ['globalThis.window?.Array.prototype.at.name', 'Array.at'],
  ['globalThis.window?.Object.at.name', undefined],
  ['globalThis.window?.Map', undefined],
]) runBoth(`owner/${ source }`, `const result = ${ source };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator').get('init');
  const ctx = context(parser, path);
  const node = unwrapRuntimeExpr(path.node);
  const before = JSON.stringify(program.node);
  check(`${ label }/claim`, nestedOptionalClaim(node, ctx)?.pure.entry, entry);
  check(`${ label }/source intact`, JSON.stringify(program.node), before);
});

runBoth('prototype claim without constructor claim', 'globalThis.window?.Array.prototype.at.name;', (parser, program, label) => {
  const path = parser.pickPath(program, 'ExpressionStatement').get('expression');
  const ctx = context(parser, path);
  ctx.resolveGlobal = name => name === 'Array' ? null : context(parser, path).resolveGlobal(name);
  check(`${ label }/prototype owns unsealed chain`, nestedOptionalClaim(unwrapRuntimeExpr(path.node), ctx)?.pure.entry, 'Array.at');
});

runBoth('delete claim ownership and mutation', 'globalThis.window?.Map.prototype;', (parser, program, label) => {
  const path = parser.pickPath(program, 'ExpressionStatement').get('expression');
  const ctx = context(parser, path);
  ctx.adapter = { ...ctx.adapter, isMutatedStatic: (host, key) => host === 'globalThis' && key === 'Map' };
  const node = unwrapRuntimeExpr(path.node);
  check(`${ label }/read has no owner`, nestedOptionalClaim(node, ctx), null);
  check(`${ label }/delete keeps owner`, nestedOptionalClaim(node, ctx, { deleteHosted: true })?.pure.entry, 'Map');
  check(`${ label }/constructor mutation`, splitConstructorClaim('Map', ctx), null);
  check(`${ label }/realm is no constructor`, splitConstructorClaim('self', ctx), null);
});
for (const source of ['(globalThis.window?.Array).prototype.at.name', '(globalThis.window?.Array as any).prototype.at.name']) {
  runBoth(`sealed prototype/${ source }`, `${ source };`, (parser, program, label) => {
    const path = parser.pickPath(program, 'ExpressionStatement').get('expression');
    const ctx = context(parser, path);
    const global = ctx.resolveGlobal;
    ctx.resolveGlobal = name => name === 'Array' ? null : global(name);
    check(`${ label } sealed prototype owns no guard`, nestedOptionalClaim(unwrapRuntimeExpr(path.node), ctx), null);
  });
}
for (const value of ['globalThis.window', '(effect(), globalThis.window)', 'globalThis.self']) {
  runBoth(`stored probe/${ value }`, `let held; const result = (held = ${ value })?.window?.self;`, (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result').get('init');
    const node = unwrapRuntimeExpr(path.node);
    const ctx = context(parser, path);
    const before = JSON.stringify(program.node);
    const probe = unwrapRuntimeExpr(node.object);
    check(`${ label } value can vanish`, proxyReceiverValueCanBeUndefined(probe, ctx.resolvePure, ctx), true);
    check(`${ label } guard tests second read`, undefinableOptionalGuard(node, ctx.resolvePure, ctx).object, probe);
    const plan = planProvenNavGuardCollapse({ rootNode: node, ...ctx, throughKeptAssign: true });
    // An effectful stored value may decline the nav plan; its generic probe remains intact.
    if (value.startsWith('(')) check(`${ label } effectful source stays generic`, plan, null);
    else check(`${ label } nav plan tests second read`, plan?.hops[plan.lastUnresolvableIdx]?.node, probe);
    check(`${ label } queries leave source intact`, JSON.stringify(program.node), before);
  });
}
runBoth('plain read-through keeps the stored guarded realm collapse',
  'let held; const result = (held = globalThis.window?.self).window;', (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result').get('init');
    const node = unwrapRuntimeExpr(path.node);
    const ctx = context(parser, path);
    check(`${ label } plain collapse`, proxyReceiverValueCanBeUndefined(node, ctx.resolvePure, ctx), false);
    check(`${ label } observed value`, proxyReceiverValueCanBeUndefined(node, ctx.resolvePure, ctx, { throughChainAssign: true }), true);
  });

runBoth('excluded and target-native self are different value proofs', 'globalThis.self?.Array;', (parser, program, label) => {
  const path = member(parser, program, 'Array');
  const probe = unwrapRuntimeExpr(path.node.object);
  const ctx = context(parser, path);
  let carried = true;
  ctx.adapter.available = () => carried;
  function native() { return null; }
  check(`${ label } target-native`, proxyReceiverValueCanBeUndefined(probe, native, ctx), false);
  carried = false;
  check(`${ label } excluded`, proxyReceiverValueCanBeUndefined(probe, native, ctx), true);
  check(`${ label } detection-only resolver`, proxyReceiverValueCanBeUndefined(probe, ctx.resolvePure, ctx), true);
  carried = true;
  check(`${ label } restored availability`, proxyReceiverValueCanBeUndefined(probe, native, ctx), false);
});
finish();
