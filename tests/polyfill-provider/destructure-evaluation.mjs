// Evaluation decisions retain source reads until the binding applies the plan.
// Both parsers ask the same questions, including an ignored speculative query.
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import {
  buildNestedDestructurePlan,
  chainThroughNamedDefaults,
  forInitNeedsReceiverMemo,
  planLiteralResidual,
  planLiteralRoute,
  planLoopHeadExtraction,
  planSentinelMemo,
  planSynthLiteralReceiver,
  residualPrecedesExtractions,
  synthPlanFullyCovered,
} from '../../packages/core-js-polyfill-provider/detect-usage/destructure-plan.js';
import { buildNestedParamSynthPlan, destructureKeyReadPlan } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { keyedReadEvaluation } from '../../packages/core-js-polyfill-provider/destructure-host-shape.js';
import { unwrapRuntimeExpr, walkAstNodes } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, checkTruthy, finish, runBoth } = createChecker('destructure-evaluation');

for (const [fallback, expected] of [['', false], [' = Array', true], [' = other', true], [' = make()', false]]) {
  runBoth(`named default/${ fallback }`, `const { w: { at }${ fallback } } = { w: rows };`, (parser, program, label) => {
    const [hopProp] = hostOf(parser, program).node.id.properties;
    check(label, chainThroughNamedDefaults([{ hopProp }]), expected);
  });
}

function context(parser, path) {
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  return { scope: path.scope, path, adapter };
}

function hostOf(parser, program) {
  return parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ObjectPattern');
}

for (const [receiver, readsReceiver, expected] of [
  ['rows', true, [false, true, false]],
  ['getRows()', true, [false, false, true]],
  ['[1, 2]', true, [true, true, false]],
  ['Array', false, [false, true, false]],
  ['(effect(), Array)', false, [false, false, false]],
]) runBoth(`keyed evaluation/${ receiver }/${ readsReceiver }`,
  `export const { [(effect(), "at")]: method } = ${ receiver };`, (parser, program, label) => {
    const host = hostOf(parser, program);
    const [prop] = host.get('id').get('properties');
    const ctx = context(parser, prop);
    const before = JSON.stringify(host.node);
    const plan = destructureKeyReadPlan(prop, ctx);
    const options = { init: host.node.init, hostPath: host, readsReceiver, ctx };
    keyedReadEvaluation(plan, options);
    const evaluation = keyedReadEvaluation(plan, options);
    checkDeep(label, [!!evaluation.inlineReceiver, !!evaluation.reuseReceiver, !!evaluation.storeReceiver], expected);
    check(`${ label }/no source mutation`, JSON.stringify(host.node), before);
    if (receiver === '(effect(), Array)') {
      check(`${ label }/discard retains source effect`, evaluation.discarded[0], unwrapRuntimeExpr(host.node.init).expressions[0]);
    }
    // A deferred consumer keeps its proof but reads the current source slot.
    const live = { type: 'Identifier', name: 'captured' };
    const deferred = keyedReadEvaluation(plan, {
      receiver: live, proven: evaluation.proven, discarded: evaluation.discarded,
    });
    check(`${ label }/saved proof`, deferred.proven, evaluation.proven);
    check(`${ label }/saved effects`, deferred.discarded, evaluation.discarded);
  });

for (const [receiver, kind, allProxyInit, expected] of [
  ['rows', 'instance', false, false],
  ['holder.rows', 'instance', false, true],
  ['getRows()', 'instance', false, true],
  ['(effect(), rows)', 'instance', false, true],
  ['flag ? rows : other', 'instance', false, true],
  ['flag ? globalThis : self', 'instance', true, false],
  ['flag ? Array : Object', 'static', false, false],
  ['[1, 2]', 'instance', false, true],
]) runBoth(`sentinel receiver/${ receiver }/${ kind }`, `const { at: method, other } = ${ receiver };`, (parser, program, label) => {
  const host = hostOf(parser, program);
  const options = { declarator: host.node, sentinel: true, kind, allProxyInit };
  planSentinelMemo(options);
  check(`${ label }/shared capture`, !!planSentinelMemo(options).sentinelMemoEligible, expected);
  check(`${ label }/no second reader`, !!planSentinelMemo({ ...options, sentinel: false }).sentinelMemoEligible, false);
});

for (const [receiver, readers, residual, expected] of [
  ['getRows()', 2, false, true],
  ['getRows()', 1, false, true],
  ['getRows()', 1, true, true],
  ['getRows()', 0, true, false],
  ['rows', 2, false, false],
  ['this', 2, false, false],
  ['[1, 2]', 2, false, true],
]) runBoth(`loop receiver/${ receiver }/${ readers }/${ residual }`,
  `for (const { at: method, includes: contains${ residual ? ', other' : '' } } = ${ receiver };;) break;`,
  (parser, program, label) => {
    const host = hostOf(parser, program);
    const claims = host.node.id.properties.slice(0, 2).map((prop, index) => ({ prop, readsReceiver: index < readers }));
    const ctx = context(parser, host);
    const result = forInitNeedsReceiverMemo(host.node, claims, ctx);
    check(label, result, expected);
    check(`${ label }/nested slot has its own capture`, forInitNeedsReceiverMemo(host.node,
      [{ ...claims[0], chain: [{}] }, ...claims.slice(1)], ctx), false);
  });

runBoth('residual source order', 'const { first, second, third } = source;', (parser, program, label) => {
  const host = hostOf(parser, program);
  const original = [...host.node.id.properties];
  for (let survivor = 0; survivor < original.length; survivor++) {
    const residual = { ...host.node.id, properties: [original[survivor]] };
    for (let claimed = 0; claimed < original.length; claimed++) {
      check(`${ label }/${ survivor } before ${ claimed }`,
        residualPrecedesExtractions(residual, [original[claimed]], original), survivor < claimed);
      check(`${ label }/${ survivor } shares ${ claimed }`,
        residualPrecedesExtractions(residual, [original[claimed]], original, { sharedHop: true }), survivor <= claimed);
    }
  }
  check(`${ label }/unknown residual position`, residualPrecedesExtractions(
    { ...host.node.id, properties: [{ ...original[0] }] }, [original[1]], original), false);
});

for (const [source, expectedReceiver, extra = {}] of [
  ['const { w: { at: method } } = { w: rows };', 'rows'],
  ['const { w: { at: method } } = { w: holder.rows };', 'MemberExpression'],
  ['const { w: { at: method } } = { w: (effect(), rows) };', 'SequenceExpression'],
  ['const { w: { at: method }, other } = { w: rows, other: 1 };', 'rows'],
  ['const { w: { at: method } } = { w: rows };', null, { kind: 'static' }],
]) runBoth(`literal source/${ source }/${ extra.kind ?? 'instance' }`, source, (parser, program, label) => {
  const host = hostOf(parser, program);
  const [outer] = host.get('id').get('properties');
  const [prop] = outer.get('value').get('properties');
  const ctx = context(parser, prop);
  const args = {
    metaPath: prop, prop: prop.node, kind: 'instance', sentinel: false,
    chain: [{ hopProp: outer.node }], declarator: host.node, declaration: host.parentPath.node,
    pureNav: false, adapter: ctx.adapter, ...extra,
  };
  const before = JSON.stringify(host.node);
  planLiteralRoute(args);
  const plan = planLiteralRoute(args);
  const receiver = plan.literalReceiver && unwrapRuntimeExpr(plan.literalReceiver);
  check(label, receiver?.name ?? receiver?.type ?? null, expectedReceiver);
  check(`${ label }/query keeps source`, JSON.stringify(host.node), before);
  if (plan.carriedLive) {
    const value = host.get('init').get('properties')[0].node;
    const changed = { type: 'Identifier', name: 'rewritten' };
    value.value = changed;
    check(`${ label }/deferred read uses live slot`, plan.carriedLive(), changed);
  }
});

for (const [receiver, sentinel, whole, expected] of [
  ['holder.rows', false, true, [false, false]],
  ['holder.rows', false, false, [true, true]],
  ['flag ? rows : other', true, false, [true, true]],
  ['rows', true, false, [true, false]],
  ['[1, 2]', false, false, [true, true]],
]) runBoth(`literal residual/${ receiver }/${ sentinel }/${ whole }`,
  `const { at: method${ whole ? '' : ', other' } } = ${ receiver };`, (parser, program, label) => {
    const host = hostOf(parser, program);
    const [prop] = host.node.id.properties;
    const ctx = context(parser, host);
    const args = {
      kind: 'instance', entry: 'instance/at', prop, pattern: host.node.id, sentinel,
      declarator: host.node, declaration: host.parentPath.node, soleBinding: whole,
      declaratorConsumedWhole: whole, literalReceiver: unwrapRuntimeExpr(host.node.init), relaxedReceiver: true, ctx,
    };
    const before = JSON.stringify(host.node);
    planLiteralResidual(args);
    const plan = planLiteralResidual(args);
    checkTruthy(`${ label }/accepted`, plan);
    checkDeep(label, [!!plan.keepKey, !!plan.memoizeReceiver], expected);
    check(`${ label }/no speculative allocation or source edit`, JSON.stringify(host.node), before);
  });

function resolvePure(meta) {
  return meta.kind === 'global' && meta.name === 'Map'
    ? { kind: 'global', entry: 'map', hintName: 'Map' }
    : meta.kind === 'property' && meta.object === 'Array' && meta.key === 'from'
      ? { kind: 'static', entry: 'array/from', hintName: 'from' } : null;
}

for (const [receiver, key, expected] of [
  ['Array', 'from', true],
  ['(Array || Object)', 'from', true],
  ['globalThis.Array', 'from', true],
  ['Array', 'custom', false],
  ['rows', 'at', false],
]) runBoth(`synth coverage/${ receiver }/${ key }`, `const { value } = ${ receiver };`, (parser, program, label) => {
  const host = hostOf(parser, program);
  const ctx = context(parser, host);
  const before = JSON.stringify(host.node);
  const sites = [];
  const options = { contextFor: node => {
    sites.push(node);
    return ctx;
  }, resolvePure };
  check(label, synthPlanFullyCovered([{ lookupKey: key }], host.node.init, options), expected);
  check(`${ label }/source unchanged`, JSON.stringify(host.node), before);
  check(`${ label }/frame of selected source`, sites[0],
    receiver === '(Array || Object)' ? unwrapRuntimeExpr(host.node.init).left : host.node.init);
});

for (const [receiver, ctor, selecting] of [
  ['Map', 'Map', false],
  ['globalThis.Map', 'Map', false],
  ['Map || Object', 'Map', true],
  ['flag ? Map : Object', null, true],
  ['rows', null, false],
]) runBoth(`synth receiver/${ receiver }`, `const { custom } = ${ receiver };`, (parser, program, label) => {
  const host = hostOf(parser, program);
  const ctx = context(parser, host);
  const receiverNode = unwrapRuntimeExpr(host.node.init);
  const before = JSON.stringify(host.node);
  planSynthLiteralReceiver(receiverNode, { aliasCtx: ctx, resolvePure });
  const plan = planSynthLiteralReceiver(receiverNode, { aliasCtx: ctx, resolvePure });
  check(`${ label }/constructor`, plan.receiverCtorName, ctor);
  check(`${ label }/instance selection`, plan.selectsInstance, selecting);
  check(`${ label }/query keeps source`, JSON.stringify(host.node), before);
});

for (const [pattern, expected] of [
  ['{ from }', [true, true, true]],
  ['{ from, length }', [false, false, false]],
  ['{ from, ...rest }', [false, false, false]],
]) runBoth(`nested consumption/${ pattern }`, `const ${ pattern } = Array;`, (parser, program, label) => {
  const host = hostOf(parser, program);
  const ctx = context(parser, host);
  const plan = buildNestedDestructurePlan({
    declarator: host.node, ...ctx, resolvePure, resolveGlobalPolyfill: () => null,
  });
  checkTruthy(`${ label }/plan`, plan);
  function facts() {
    return [!!plan.evaluation.consumesPattern, !!plan.evaluation.consumesAll, !!plan.evaluation.discardsInit];
  }
  checkDeep(label, facts(), expected);
  host.node.id.properties.length = 0;
  checkDeep(`${ label }/source verdict precedes pruning`, facts(), expected);
});

runBoth('consumed bindings retain an effectful hop',
  'const { [(effect(), "Array")]: { from } } = globalThis;', (parser, program, label) => {
    const host = hostOf(parser, program);
    const plan = buildNestedDestructurePlan({
      declarator: host.node, ...context(parser, host), resolvePure, resolveGlobalPolyfill: () => null,
    });
    checkTruthy(`${ label }/plan`, plan);
    check(`${ label }/bindings served`, plan.evaluation.consumesPattern, true);
    check(`${ label }/key retains initializer`, plan.evaluation.discardsInit, false);
  });

for (const [initial, written] of [['[4, 5]', '"xy"'], ['"xy"', '[4, 5]']]) {
  runBoth(`mirror capture frame/${ initial }`, `let current = ${ initial };
    function read({ value: { [(current = ${ written }, "at")]: method = () => -1 } } = { value: current }) { return method; }`,
  (parser, program, label) => {
    const fn = parser.pickPath(program, 'FunctionDeclaration');
    const [param] = fn.get('params');
    const [hop] = param.get('left').get('properties');
    const [prop] = hop.get('value').get('properties');
    const { adapter } = context(parser, prop);
    function resolveInstance(meta) {
      return meta.kind === 'property' && meta.key === 'at'
        ? { kind: 'instance', entry: `${ meta.object ?? 'generic' }/at`, hintName: 'at' } : null;
    }
    const plan = buildNestedParamSynthPlan({
      leafPatternPath: prop.parentPath, adapter, resolvePure: resolveInstance,
      meta: { kind: 'property', object: null, key: 'at', placement: 'prototype' },
    });
    checkTruthy(`${ label }/plan`, plan);
    const [target] = plan.targets;
    check(`${ label }/not the later write's family`, target.tree.entries[0].child.entry, 'generic/at');
    check(`${ label }/source read keeps its own frame`, target.receiverRead.path.node, target.receiverRead.node);
  });
}

// Head admission sees the original pattern and primes its receiver before asking its type.
// A refused relocation must still leave that source proof available to later consumers.
for (const [source, accepted, assignment, typed] of [
  ['for (const { at } of rows) use(at);', true, false, 'element'],
  ['for (let { at } of rows) { use(at); }', true, false, 'element'],
  ['for (var [{ at }] of rows) use(at);', true, false, 'element'],
  ['let at; for ({ at } of rows) {} use(at);', true, true, 'element'],
  ['for (const { at } in rows) use(at);', true, false, 'property'],
  ['for (const { at } of rows) { let at = own; use(at); }', false, false, 'element'],
  ['for (const { unrelated } of rows) use(unrelated);', false, false, 'element'],
  ['for (const item of rows) use(item);', false, false, null],
]) runBoth(`activation head/${ source }`, source, (parser, program, label) => {
  const loop = parser.pickPath(program, source.includes(' in ') ? 'ForInStatement' : 'ForOfStatement');
  const before = JSON.stringify(loop.node);
  const events = [];
  const elementType = {};
  const { adapter } = context(parser, loop);
  const options = {
    adapter,
    resolvePure: meta => meta.kind === 'property' && meta.key === 'at'
      ? { kind: 'instance', entry: 'instance/at', hintName: 'at' } : null,
    walkNode: (root, visit) => walkAstNodes({ root, visit }),
    primeDestructureReceiverTypes: () => events.push('prime'),
    resolveForOfResolvedElement: () => { events.push('element'); return elementType; },
    resolvePropertyObjectType: () => { events.push('property'); return elementType; },
    toHint: value => { check(`${ label }/same type proof`, value, elementType); return null; },
  };
  planLoopHeadExtraction(loop, options);
  events.length = 0;
  const plan = planLoopHeadExtraction(loop, options);
  check(`${ label }/admission`, !!plan, accepted);
  checkDeep(`${ label }/query order`, events, typed ? ['prime', typed] : []);
  check(`${ label }/query preserves source`, JSON.stringify(loop.node), before);
  if (plan) {
    check(`${ label }/assignment kind`, plan.assignment, assignment);
    check(`${ label }/source head identity`, plan.left.node, loop.node.left);
    check(`${ label }/receiver proof identity`, plan.elementType, elementType);
    check(`${ label }/source pattern identity`, plan.declarator.id, assignment ? loop.node.left : loop.node.left.declarations[0].id);
  }
});

finish();
