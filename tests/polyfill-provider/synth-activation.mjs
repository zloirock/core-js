// Source slots, complete coverage and read ownership decide one synth activation on both parsers.
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { planSynthReceiverActivation, renderSynthReplacement } from '../../packages/core-js-polyfill-provider/detect-usage/destructure-plan.js';
import { findNodeSlot } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { identifier, memberFromKeyName, renderMemoReadTarget, renderProxyReceiverPlan } from '../../packages/core-js-polyfill-provider/render.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('synth-activation');
const served = { polyfill: { entry: 'array/from' } };
const unresolved = { polyfill: null };
const instance = { polyfill: { entry: 'instance/at', instance: true } };

for (const [source, branch] of [
  ['globalThis.window?.Array || Array;', false],
  ['function read({ from, missing } = globalThis.window?.Array || Array) {}', true],
]) runBoth('guarded landing', source, (parser, program, label) => {
  const path = parser.pickPath(program, 'LogicalExpression');
  const receiver = branch ? path.node.left : path.node;
  function resolvePure({ kind, name }) {
    return kind === 'global' && name === 'globalThis'
      ? { kind: 'global', entry: 'global-this', hintName: 'globalThis' } : null;
  }
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure', resolvePure });
  const original = JSON.stringify(program.node);
  const { synthGuard, guardedReceiverPlan } = planSynthReceiverActivation({
    receiver, scope: path.scope, path, adapter, resolvePure,
  });
  check(`${ label }/fallback identity`, synthGuard.fallback, branch ? null : receiver);
  const rendered = renderProxyReceiverPlan(guardedReceiverPlan, { injectImport: () => 'realm' });
  check(`${ label }/landing root`, rendered.object.name, 'realm');
  check(`${ label }/landing key`, rendered.property.name, 'Array');
  checkDeep(`${ label }/source untouched`, JSON.stringify(program.node), original);
  const slot = findNodeSlot(receiver, synthGuard.probe);
  slot.owner[slot.key] = identifier('visitedProbe');
  check(`${ label }/probe stays live`, synthGuard.probe.name, 'visitedProbe');
  check(`${ label }/landing stays on the source proof`,
    renderProxyReceiverPlan(guardedReceiverPlan, { injectImport: () => 'realm' }).object.name, 'realm');
});

for (const [name, expression, prelude, reusable] of [
  ['call', 'make()', '', false],
  ['member', 'box.value', '', false],
  ['stable binding', '(effect(), stable)', 'const stable = Array;', true],
  ['written binding', '(effect(), stable)', 'let stable = Array; function effect() { stable = Object; }', false],
  ['this', 'this', '', false],
  ['arguments', 'arguments', '', false],
  ['primitive', '1', '', true],
  ['regexp', '/x/', '', false],
  ['typed stable binding', '(effect(), stable as typeof Array)', 'const stable = Array;', true],
]) {
  runBoth(name, `${ prelude } consume(${ expression });`, (parser, program, label) => {
    const path = parser.pickPath(program, 'CallExpression', p => p.node.callee.name === 'consume');
    const [receiver] = path.node.arguments;
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const original = JSON.stringify(program.node);
    let captured;
    let names = 0;
    let probes = 0;
    const result = renderSynthReplacement([served, unresolved], {
      receiver, aliasCtx: { path, scope: path.scope, adapter },
      renderMemoArgument: () => receiver,
      renderLiteral: activation => { captured = activation; return identifier('synth'); },
      createMemo: () => { names++; return identifier('memo'); },
      renderProbe: () => { probes++; return null; },
      cloneHost: node => node,
    });
    check(`${ label }/memo count`, names, +!reusable);
    check(`${ label }/shape`, result.type, reusable ? 'SequenceExpression' : 'CallExpression');
    check(`${ label }/one argument`, reusable ? result.expressions[0] : result.arguments[0], receiver);
    check(`${ label }/memo binding`, captured.memo?.name ?? null, reusable ? null : 'memo');
    check(`${ label }/read plan owns argument`, probes, 0);
    checkDeep(`${ label }/source untouched`, JSON.stringify(program.node), original);
  });
}

for (const partial of [false, true]) for (const guarded of [false, true]) {
  runBoth(`probe/${ partial }/${ guarded }`, 'consume(make() || fallback());', (parser, program, label) => {
    const path = parser.pickPath(program, 'CallExpression', p => p.node.callee.name === 'consume');
    const [receiver] = path.node.arguments;
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const probe = identifier('probe');
    const effects = [identifier('before'), probe, identifier('after')];
    const guard = guarded ? { probe, ahead: [effects[0]], after: [effects[2]], fallback: receiver } : null;
    let probes = 0;
    let argumentsRead = 0;
    let names = 0;
    const rendered = renderSynthReplacement(partial ? [served, unresolved] : [served], {
      receiver, guard, aliasCtx: { path, scope: path.scope, adapter },
      renderLiteral: () => identifier('synth'),
      renderMemoArgument: () => { argumentsRead++; return null; },
      renderProbe: () => { probes++; return { node: probe, effects }; },
      createMemo: () => { names++; return identifier('memo'); },
      cloneHost: node => node,
    });
    check(`${ label }/probe ownership`, probes, +!guarded);
    check(`${ label }/read ownership`, argumentsRead, +partial);
    check(`${ label }/guarded memo`, names, +(partial && guarded));
    if (guarded) {
      check(`${ label }/fallback stays outside`, rendered.type, 'LogicalExpression');
      check(`${ label }/fallback operator`, rendered.operator, '||');
      check(`${ label }/fallback source`, rendered.right.callee.name, 'fallback');
      if (partial) {
        check(`${ label }/guarded call`, rendered.left.type, 'CallExpression');
        check(`${ label }/single source argument`, rendered.left.arguments[0], receiver.left);
        check(`${ label }/parameter guard`, rendered.left.callee.body.body[0].argument.type, 'ConditionalExpression');
      }
    } else if (partial) {
      const [first, value] = rendered.expressions;
      check(`${ label }/source first`, first.name, 'probe');
      check(`${ label }/nullish receiver reaches the pattern`, value.consequent.name, 'probe');
      check(`${ label }/defined receiver reaches the synth`, value.alternate.name, 'synth');
    } else checkDeep(`${ label }/ordered effects`, rendered.expressions.map(node => node.name), ['before', 'probe', 'after', 'synth']);
  });
}

for (const [name, expression, entries, rescue, effects] of [
  ['complete call', 'make()', [served], true, ['make()']],
  ['partial quiet receiver', 'Array', [served, unresolved], false, ['Array']],
  ['instance owns its receiver', 'make()', [instance], false, []],
  ['fallback owns only its left', '(effect(), Array) || dead()', [served], false, ['effect()']],
  ['nested navigation keeps effects', 'globalThis[(effect(), "self")].Array', [served], true, ['effect()']],
]) {
  runBoth(name, `consume(${ expression });`, (parser, program, label) => {
    const path = parser.pickPath(program, 'CallExpression', p => p.node.callee.name === 'consume');
    const [receiver] = path.node.arguments;
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const source = `consume(${ expression });`;
    const options = {
      receiver, rescueSe: rescue ? receiver : null, aliasCtx: { path, scope: path.scope, adapter },
      renderLiteral: () => identifier('synth'), cloneHost: node => node,
      createMemo: () => { throw new Error('complete receiver allocated a memo'); },
    };
    const rendered = renderSynthReplacement(entries, options);
    const actual = rendered.type === 'SequenceExpression' ? rendered.expressions.slice(0, -1) : [];
    checkDeep(`${ label }/rescue`, actual.map(node => source.slice(node.start, node.end)), effects);
    check(`${ label }/declined literal`, renderSynthReplacement(entries, { ...options, renderLiteral: () => null }), null);
  });
}

for (const nested of [false, true]) runBoth(`source rescue ownership/${ nested }`,
  `consume((effect(), ${ nested ? 'globalThis.self' : 'globalThis' }).Array);`,
  (parser, program, label) => {
    const path = parser.pickPath(program, 'CallExpression', item => item.node.callee.name === 'consume');
    const [receiver] = path.node.arguments;
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const aliasCtx = { path, scope: path.scope, adapter };
    const activation = planSynthReceiverActivation({ receiver, ...aliasCtx, resolvePure: () => null });
    const root = nested
      ? parser.pickPath(program, 'MemberExpression', item => item.node.property.name === 'self').node
      : parser.pickPath(program, 'Identifier', item => item.node.name === 'globalThis').node;
    const slot = findNodeSlot(receiver, root);
    slot.owner[slot.key] = nested ? identifier('visitedRoot') : memberFromKeyName(identifier('visitedRoot'), 'self');
    const effect = parser.pickPath(program, 'CallExpression', item => item.node.callee.name === 'effect').node;
    effect.callee = identifier('visitedEffect');
    const rendered = renderSynthReplacement([served], {
      receiver, rescueSe: receiver, dropRescueReceiver: activation.dropRescueReceiver, aliasCtx,
      renderLiteral: () => identifier('synth'), cloneHost: node => node,
    });
    check(`${ label }/source ownership survives child rewrite`, rendered.expressions[0], nested ? effect : receiver);
    check(`${ label }/one effect before the literal`, rendered.expressions.length, 2);
    check(`${ label }/live effect rewrite`, effect.callee.name, 'visitedEffect');
  });

for (const receiver of ['Map', 'globalThis.self.Map']) for (const coverage of ['full', 'partial', 'opted-out']) {
  runBoth(`canonical retained receiver/${ receiver }/${ coverage }`, `consume(${ receiver });`, (parser, program, label) => {
    const path = parser.pickPath(program, 'CallExpression');
    const [node] = path.node.arguments;
    function resolvePure(meta) {
      return meta.kind === 'global' && meta.name === 'Map'
        ? { kind: 'global', entry: 'map/constructor', hintName: 'Map' }
        : meta.kind === 'property' && meta.object === 'Map' && meta.key === 'groupBy'
          ? { kind: 'static', entry: 'map/group-by', hintName: 'Map$groupBy' } : null;
    }
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure', resolvePure });
    const entries = [{ lookupKey: 'groupBy', optedOut: coverage === 'opted-out' }];
    if (coverage === 'partial') entries.push({ lookupKey: 'missing' });
    const before = JSON.stringify(program.node);
    const options = { receiver: node, entries, scope: path.scope, path, adapter, resolvePure };
    planSynthReceiverActivation(options);
    const plan = planSynthReceiverActivation(options);
    check(`${ label }/coverage`, plan.fullyCovered, coverage === 'full');
    check(`${ label }/canonical landing`, plan.memoRead?.pure?.entry ?? null, coverage === 'full' ? null : 'map/constructor');
    check(`${ label }/source unchanged`, JSON.stringify(program.node), before);
  });
}

runBoth('a partial optional receiver keeps its canonical landing', 'consume(globalThis.window?.self.Array);',
  (parser, program, label) => {
    const path = parser.pickPath(program, 'CallExpression');
    const [receiver] = path.node.arguments;
    function resolvePure(meta) {
      return ['globalThis', 'self'].includes(meta.name) ? { kind: 'global', entry: meta.name, hintName: meta.name } : null;
    }
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure', resolvePure });
    const before = JSON.stringify(program.node);
    const plan = planSynthReceiverActivation({
      receiver, entries: [{ lookupKey: 'other' }], path, scope: path.scope, adapter, resolvePure,
    });
    const rendered = renderMemoReadTarget(plan.memoRead, { injectImport: entry => `_${ entry }` });
    check(`${ label }/guard`, rendered.type, 'ConditionalExpression');
    check(`${ label }/landing root`, rendered.alternate.object.name, '_self');
    check(`${ label }/landing tail`, rendered.alternate.property.name, 'Array');
    check(`${ label }/source unchanged`, JSON.stringify(program.node), before);
    const landing = identifier('canonicalLanding');
    const activation = renderSynthReplacement([served, unresolved], {
      receiver, guard: plan.synthGuard, checkNullish: plan.checkNullish,
      aliasCtx: { path, scope: path.scope, adapter },
      renderMemoArgument: () => landing,
      renderLiteral: () => identifier('synth'),
      createMemo: () => identifier('memo'),
      cloneHost: node => node,
    });
    check(`${ label }/guard uses the saved canonical landing`, activation.arguments[0], landing);
  });

for (const [receiver, prelude, checkNullish] of [
  ['Array', '', false],
  ['(effect(), Array)', '', false],
  ['Array', 'const Array = unknown;', true],
  ['unknown', '', true],
]) runBoth(`partial receiver null arm/${ receiver }/${ prelude }`, `${ prelude } consume(${ receiver });`,
  (parser, program, label) => {
    const path = parser.pickPath(program, 'CallExpression', item => item.node.callee.name === 'consume');
    const [node] = path.node.arguments;
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const plan = planSynthReceiverActivation({
      receiver: node, entries: [{ lookupKey: 'missing' }], path, scope: path.scope, adapter, resolvePure: () => null,
    });
    check(`${ label }/source proof`, plan.checkNullish, checkNullish);
  });

finish();
