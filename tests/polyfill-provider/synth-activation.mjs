// Source slots, complete coverage and read ownership decide one synth activation on both parsers.
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { planSynthReceiverActivation, renderSynthReplacement } from '../../packages/core-js-polyfill-provider/detect-usage/destructure-plan.js';
import { findNodeSlot } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { identifier, memberFromKeyName, renderProxyReceiverPlan } from '../../packages/core-js-polyfill-provider/render.js';
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
  ['this', 'this', '', true],
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
      receiver, callBranch: true, aliasCtx: { path, scope: path.scope, adapter },
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
      receiver, callBranch: true, guard, aliasCtx: { path, scope: path.scope, adapter },
      renderLiteral: () => identifier('synth'),
      renderMemoArgument: () => { argumentsRead++; return null; },
      renderProbe: () => { probes++; return { node: probe, effects }; },
      createMemo: () => { names++; return identifier('memo'); },
      cloneHost: node => node,
    });
    check(`${ label }/probe ownership`, probes, +!guarded);
    check(`${ label }/read ownership`, argumentsRead, +(partial && !guarded));
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
    } else checkDeep(`${ label }/ordered effects`, rendered.expressions.map(node => node.name),
      partial ? ['probe', 'synth'] : ['before', 'probe', 'after', 'synth']);
  });
}

for (const [name, expression, entries, rescue, effects] of [
  ['complete call', 'make()', [served], true, ['make()']],
  ['partial quiet receiver', 'Array', [served, unresolved], false, []],
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

finish();
