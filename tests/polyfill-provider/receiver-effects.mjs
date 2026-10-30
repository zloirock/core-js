// Receiver evaluation is shared even when a host has already prepared its guard.
import { runInNewContext } from 'node:vm';
import generatePackage from '@babel/generator';
import {
  planReceiverEffects,
  planSymbolReceiverEffects,
  planSymbolReceiverRoot,
} from '../../packages/core-js-polyfill-provider/detect-usage/guard-preparation.js';
import { classifyReceiverSE, peelNestedSequenceExpressions, unwrapRuntimeExpr } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import {
  callExpression,
  cloneNode,
  hostSlot,
  hostSlotNode,
  identifier,
  renderReceiverEffects,
  renderSymbolReceiverRoot,
  sequenceExpression,
} from '../../packages/core-js-polyfill-provider/render.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import estreeToBabel from '../../packages/core-js-babel-plugin/internals/estree-to-babel.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('receiver-effects');
const generate = generatePackage.default ?? generatePackage;

for (const [name, prelude, expression, capture, firstEffects] of [
  ['quiet receiver', 'const rows = [];', 'rows["at"]', false, []],
  ['stable receiver before key', 'const rows = [];', 'rows[(key(), "at")]', false, ['rows', 'key()']],
  ['getter receiver', '', 'box.rows[(key(), "at")]', true, ['capture', 'key()']],
  ['key replaces receiver', 'let rows = [];', 'rows[(rows = other, "at")]', true, ['capture', 'rows = other']],
  ['receiver prefix only', 'const rows = [];', '(first(), rows)["at"]', false, []],
  ['receiver and key prefixes', 'const rows = [];', '(first(), rows)[(key(), "at")]', false, ['first()', 'rows', 'key()']],
  ['hidden literal', '', '[1][(key(), "at")]', false, ['key()']],
  ['literal reads before key', 'let value = 1;', '[value][(value = 2, "at")]', true, ['capture', 'value = 2']],
]) runBoth(name, `${ prelude } const result = ${ expression };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  const member = unwrapRuntimeExpr(path.node.init);
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const receiver = member.object;
  const receiverEffects = peelNestedSequenceExpressions(receiver).prefix;
  const keyEffects = peelNestedSequenceExpressions(member.property).prefix;
  const sideEffects = [...receiverEffects, ...keyEffects];
  const ctx = { scope: path.scope, path, adapter };
  const input = {
    receiver,
    sideEffects,
    receiverEffectCount: receiverEffects.length,
    seMode: classifyReceiverSE(receiver, false, sideEffects),
    receiverReads: 1,
    ctx,
  };
  const before = JSON.stringify(program.node);
  const plan = planReceiverEffects(input);
  planReceiverEffects(input); // An ignored query must not prime the next decision.
  const repeated = planReceiverEffects(input);
  check(`${ label } capture`, !!plan.capture, capture);
  check(`${ label } repeat capture`, !!repeated.capture, capture);
  check(`${ label } source unchanged`, JSON.stringify(program.node), before);
  check(`${ label } receiver identity`, repeated.receiver, plan.receiver);
  let allocations = 0;
  const product = renderReceiverEffects(plan, {
    mintRef() { allocations++; return '_held'; },
    embed: cloneNode,
  });
  check(`${ label } allocations only on apply`, allocations, capture ? 1 : 0);
  check(`${ label } explicit leading capture`, product.leadingCapture, capture ? product.effects[0] : null);
  const source = `${ prelude } const result = ${ expression };`;
  checkDeep(`${ label } ordered reads`, product.effects?.map(node => node.type === 'AssignmentExpression'
    && node.left.name === '_held' ? 'capture' : source.slice(node.start, node.end)) ?? [], firstEffects);
});

runBoth('capture role belongs to the rendered first read', 'const result = box.rows[(key(), "at")];',
  (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator');
    const member = unwrapRuntimeExpr(path.node.init);
    const [key] = peelNestedSequenceExpressions(member.property).prefix;
    const plan = planReceiverEffects({ receiver: member.object, sideEffects: [key], receiverReads: 1 });
    let capture;
    const hooks = {
      mintRef: () => '_held',
      embed: hostSlot,
      recordCapture(node) { capture = node; return node; },
    };
    const product = renderReceiverEffects(plan, hooks);
    check(`${ label } declared role is the minted write`, product.leadingCapture, capture);
    check(`${ label } role and first effect share identity`, product.effects[0], capture);
    check(`${ label } receiver key remains after capture`, hostSlotNode(product.effects[1]), key);
    const prefixed = renderReceiverEffects({ ...plan, prefixEffects: [key] }, hooks);
    check(`${ label } earlier effects prevent moving the capture alone`, prefixed.leadingCapture, null);
    check(`${ label } the nonleading write stays in its effect slot`, prefixed.effects[1], capture);
    const guarded = renderReceiverEffects({ ...plan, disjuncts: [member.object] }, hooks);
    check(`${ label } a prepared guard owns the first check`, guarded.leadingCapture, null);
    check(`${ label } its capture stays in the guarded branch`, guarded.effects[0], capture);
    const settled = renderReceiverEffects({ ...plan, disjuncts: [] }, hooks);
    check(`${ label } settled checks do not invent a tail guard`, settled.leadingCapture, null);
    check(`${ label } a settled guard keeps its capture effect`, settled.effects[0], capture);
    const prepared = renderReceiverEffects({
      ...plan,
      capture: false,
      firstReceiver: sequenceExpression([capture, identifier('_held')]),
      receiver: identifier('_held'),
    }, { mintRef() { throw new Error('A prepared receiver must not allocate another capture'); } });
    check(`${ label } an assignment spelling does not declare a capture role`, prepared.leadingCapture, null);
    check(`${ label } an unowned first write remains an ordinary effect`, prepared.effects[0], capture);
  });

runBoth('symbol source slots', 'const rows = []; const result = (first(), rows)[(key(), Symbol.iterator)];',
  (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
    const member = unwrapRuntimeExpr(path.node.init);
    const receiver = member.object;
    const [first] = peelNestedSequenceExpressions(receiver).prefix;
    const [key] = peelNestedSequenceExpressions(member.property).prefix;
    const input = {
      member,
      caller: path.node,
      iteratorEntry: 'get-iterator-method',
      receiver,
      sideEffects: [first, key],
      receiverEffects: new Set([first]),
    };
    const before = JSON.stringify(program.node);
    const guarded = planSymbolReceiverEffects({ ...input, memberOptional: true });
    check(`${ label } guard owns the first value`, guarded.receiver, receiver);
    checkDeep(`${ label } guard only replays key`, guarded.effects, [key]);
    check(`${ label } optional invocation owns its effects`, planSymbolReceiverEffects({ ...input, callOptional: true }).effects, null);
    check(`${ label } detached receiver effect declines`, planSymbolReceiverEffects({
      ...input,
      memberOptional: true,
      receiver: peelNestedSequenceExpressions(receiver).tail,
    }), null);
    checkDeep(`${ label } prepared guard removes receiver harvest`, planReceiverEffects({
      receiver,
      sideEffects: [first, key],
      receiverEffectCount: 1,
      guarded: true,
    }).effects, [key]);
    checkDeep(`${ label } already suppressed harvest stays single`, planReceiverEffects({
      receiver,
      sideEffects: [key],
      receiverEffectCount: 1,
      guarded: true,
      seMode: 'suppress',
    }).effects, [key]);
    check(`${ label } source unchanged`, JSON.stringify(program.node), before);

    for (const keep of [false, true]) for (const optional of [false, true]) for (const keyed of [false, true]) {
      const root = { rootName: 'globalThis', keepRoot: keep ? receiver : null, droppedSe: [first], isOptionalAccess: optional };
      let imports = 0;
      const options = {
        sideEffects: keyed ? [key] : null,
        resolvePure: () => ({ entry: 'global-this', hintName: 'globalThis' }),
      };
      const plan = planSymbolReceiverRoot(root, options);
      planSymbolReceiverRoot(root, options);
      const name = `${ label }/keep ${ keep }/optional ${ optional }/key ${ keyed }`;
      check(`${ name } query does not import`, imports, 0);
      const product = renderSymbolReceiverRoot(plan, {
        injectImport() { imports++; return '_realm'; },
        embed: hostSlot,
      });
      check(`${ name } import only for replaced root`, imports, keep ? 0 : 1);
      check(`${ name } kept absence is guarded`, product.optional, keep && optional);
      check(`${ name } receiver effect count`, product.receiverEffectCount, keyed && !optional ? 1 : 0);
      checkDeep(`${ name } prefix channel`, product.sideEffects?.map(hostSlotNode) ?? [],
        keyed ? optional ? [key] : [first, key] : []);
      check(`${ name } first effect stays in source`, root.droppedSe[0], first);
    }
    let resolutions = 0;
    check(`${ label } no root has no query`, planSymbolReceiverRoot(null, {
      resolvePure() { resolutions++; return null; },
    }), null);
    check(`${ label } cheap refusal`, resolutions, 0);
    check(`${ label } unavailable root refuses`, planSymbolReceiverRoot({ rootName: 'globalThis' }, {
      resolvePure: () => null,
    }), null);
    check(`${ label } source still unchanged`, JSON.stringify(program.node), before);
  });

runBoth('symbol live guard split', 'const result = box?.rows[Symbol.iterator];', (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  const member = unwrapRuntimeExpr(path.node.init);
  const input = {
    member,
    receiver: member.object,
    liveOptionalReceiver: true,
    sideEffects: [],
    receiverEffects: new Set(),
  };
  check(`${ label } native split requested`, planSymbolReceiverEffects(input).split, true);
  check(`${ label } unavailable split refuses`, planSymbolReceiverEffects({ ...input, split: null }), null);
  check(`${ label } call split refuses`, planSymbolReceiverEffects({ ...input, split: { hopKind: 'call' } }), null);
  const disjuncts = [member.object];
  const split = { hopKind: 'member', receiver: member.object, disjuncts };
  const plan = planSymbolReceiverEffects({ ...input, split });
  check(`${ label } retains prepared checks`, plan.disjuncts, disjuncts);
  check(`${ label } preserves first split value`, plan.firstReceiver, split.receiver);

  const prefix = { type: 'CallExpression', callee: { type: 'Identifier', name: 'prefix' }, arguments: [] };
  const key = { type: 'CallExpression', callee: { type: 'Identifier', name: 'key' }, arguments: [] };
  const tail = { type: 'Identifier', name: '_prepared' };
  const prepared = { type: 'SequenceExpression', expressions: [prefix, tail] };
  const sequencePlan = planSymbolReceiverEffects({
    ...input,
    sideEffects: [key],
    split: { ...split, receiver: prepared },
    ctx: { injectorState: { isOwnPassGeneratedName: name => name === '_prepared' } },
  });
  const rendered = renderReceiverEffects(sequencePlan, {
    mintRef() { throw new Error('A stable prepared tail does not need another capture'); },
  });
  checkDeep(`${ label } prepared prefix runs before key`, rendered.effects, [prefix, tail, key]);
  check(`${ label } prepared stable tail is reused`, rendered.receiver, tail);
  const { code } = generate(estreeToBabel(sequenceExpression([
    ...rendered.effects,
    callExpression(identifier('consume'), [rendered.receiver]),
  ])));
  const log = [];
  const value = {};
  check(`${ label } prepared runtime value`, runInNewContext(code, {
    _prepared: value,
    prefix: () => log.push('prefix'),
    key: () => log.push('key'),
    consume(receiver) { log.push('consume'); return receiver; },
  }), value);
  checkDeep(`${ label } prepared runtime order`, log, ['prefix', 'key', 'consume']);
});

finish();
