// Ordinary invocation decisions retain source slots and never allocate or mutate on a query.
import {
  cloneNode, hostSlot, identifier, planMethodCall, planOptionalMethodCall, renderOptionalMethodCall, renderReceiverMemo,
  renderGuardedMethodCall,
} from '../../packages/core-js-polyfill-provider/render.js';
import { calleeParenWrapped, peelNestedSequenceExpressions, unwrapRuntimeExpr } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('method-call');

for (const [source, continues] of [
  ['rows.at?.(arg());', false],
  ['rows.at?.(arg()).next;', true],
  ['rows.at?.(arg())();', true],
  ['(rows.at?.(arg())).next;', true],
  ['new (rows.at?.(arg()))();', true],
  ['read(rows.at?.(arg()));', false],
  ['holder[rows.at?.(arg())];', false],
  ['(rows.at?.(arg()), other).next;', false],
]) runBoth(`call result consumer/${ source }`, source, (parser, program, label) => {
  const path = parser.pickPath(program, 'MemberExpression', member => member.node.property?.name === 'at');
  const callPath = path.parentPath;
  check(`${ label } effect placement`, planMethodCall({
    receiver: path.node.object, optional: true, callPath,
  }).continues, continues);
});

for (const [name, source, capture, keyed = false] of [
  ['constant receiver', 'const rows = []; rows.at(argument());', null],
  ['adjacent parameter reads', 'function read(rows) { return rows.at(argument()); }', null],
  ['member receiver', 'box.rows.at(argument());', 'lookup'],
  ['allocation identity', '[1].at(argument());', 'lookup'],
  ['sequence tail', 'const rows = []; (before(), rows).at(argument());', null],
  ['nested sequence tail', 'const rows = []; (before(), (again(), rows)).at(argument());', null],
  ['live module binding', "import { rows } from './rows.js'; rows.at(argument());", 'lookup'],
  ['reentrant binding write', 'let rows = []; const writer = () => { rows = []; }; rows.at(argument());', 'lookup'],
  ['key follows constant read', 'const rows = []; rows[(key(), "at")](argument());', null, true],
  ['key follows member capture', 'box.rows[(key(), "at")](argument());', 'before-key', true],
  ['key follows allocation capture', '[1][(key(), "at")](argument());', 'before-key', true],
  ['key can replace receiver', 'let rows = []; rows[(rows = other, "at")](argument());', 'before-key', true],
  ['key after full prefix', 'const rows = []; (before(), rows)[(key(), "at")](argument());', null, true],
  ['parameter frame', 'function read(value = getRows().at(argument())) { return value; }', 'lookup'],
  ['field frame', 'class Box { value = getRows().at(argument()); }', 'lookup'],
  ['deferred generator reader', 'function* read(rows) { yield () => rows.at(argument()); rows = other; }', 'lookup'],
]) runBoth(name, source, (parser, program, label) => {
  const path = parser.pickPath(program, 'MemberExpression', member => {
    const property = peelNestedSequenceExpressions(member.node.property).tail;
    return property?.name === 'at' || property?.value === 'at';
  });
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const receiver = path.node.object;
  const { prefix } = peelNestedSequenceExpressions(receiver);
  const keyEffects = keyed ? peelNestedSequenceExpressions(path.node.property).prefix : [];
  const { arguments: args } = path.parentPath.node;
  const ctx = { scope: path.scope, path, adapter };
  const input = { receiver, sideEffects: [...prefix, ...keyEffects], receiverEffectCount: prefix.length, args, ctx };
  const before = JSON.stringify(program.node);
  const first = planMethodCall(input);
  planMethodCall(input); // A speculative caller is allowed to ignore the answer completely.
  const repeated = planMethodCall(input);
  const copiedHarvest = planMethodCall({ ...input, sideEffects: structuredClone(input.sideEffects) });
  check(`${ label } capture`, first.capture, capture);
  check(`${ label } repeated capture`, repeated.capture, capture);
  check(`${ label } source tree unchanged`, JSON.stringify(program.node), before);
  check(`${ label } first receiver identity`, first.firstReceiver === receiver, true);
  check(`${ label } live arguments`, first.args === args, true);
  check(`${ label } read frame`, first.ctx.path === path, true);
  checkDeep(`${ label } receiver effects already owned`, first.prefixEffects, []);
  checkDeep(`${ label } cloned harvest keeps source ownership`, copiedHarvest.prefixEffects, []);
  checkDeep(`${ label } key identities`, first.keyEffects, keyEffects);
  check(`${ label } repeated receiver identity`, repeated.receiver === first.receiver, true);
  check(`${ label } first read before key`, first.firstReadEffects.length > 0, keyed && !capture);
});

// Pending imports and memos have no inserted declaration yet. Only the injector's current
// ownership proves them stable; a source import with the same spelling remains a live binding.
for (const [name, source, own, capture] of [
  ['pending pure import', '_receiver.at(0);', true, null],
  ['prior pure import', "import _receiver from '@core-js/pure/features/array/index.js'; _receiver.at(0);", false, 'lookup'],
  ['shadowed spelling', `import outer from '@core-js/pure/features/array/index.js';
    function read(_receiver) { const write = () => { _receiver = other; }; return _receiver.at(0); }`, false, 'lookup'],
]) runBoth(name, source, (parser, program, label) => {
  const path = parser.pickPath(program, 'MemberExpression', member => member.node.property.name === 'at');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  let allocations = 0;
  const injectorState = {
    isOwnPassGeneratedName: () => false,
    isOwnPassPureBinding: bindingName => own && bindingName === '_receiver',
    getPureImport: () => ({ entry: 'array/index' }),
    generateDeclaredRef() { allocations++; throw new Error('A query must not allocate'); },
    addPureImport() { allocations++; throw new Error('A query must not import'); },
  };
  const input = { receiver: path.node.object, ctx: { scope: path.scope, path, adapter, injectorState } };
  planMethodCall(input);
  check(`${ label } capture`, planMethodCall(input).capture, capture);
  check(`${ label } no allocation`, allocations, 0);
  injectorState.isOwnPassGeneratedName = bindingName => bindingName === '_receiver';
  check(`${ label } pending memo visible immediately`, planMethodCall(input).capture, null);
});

runBoth('prepared lookup owns its capture', 'box.rows.at(argument());', (parser, program, label) => {
  const path = parser.pickPath(program, 'MemberExpression', member => member.node.property.name === 'at');
  const receiver = path.node.object;
  const decision = planMethodCall({ receiver, prepared: true, args: path.parentPath.node.arguments });
  check(`${ label } no second capture`, decision.capture, null);
  check(`${ label } preserves upstream this`, decision.receiver === receiver, true);
  check(`${ label } source read still a member`, unwrapRuntimeExpr(decision.receiver).type, 'MemberExpression');
  check(`${ label } absent effect harvest`, planMethodCall({ receiver, sideEffects: null }).capture, 'lookup');
});

// Optional lookup decisions are shared across the source dialects. A sealed receiver
// can still yield undefined, but must not short-circuit the method read outside its seal.
for (const [name, source, guard, capture, superReceiver = false, compactMethod = false, keyEffects = false] of [
  ['method only', 'const rows = []; rows.at?.(argument());', null, false],
  ['receiver and method', 'const rows = []; rows?.at?.(argument());', 'value', false],
  ['inner live link', 'box?.rows.at?.(argument());', 'link', true],
  ['sealed inner link', '(box?.rows).at?.(argument());', null, true],
  ['sealed member keeps receiver guard', '(rows?.at)?.(argument());', 'value', false],
  ['allocation', '[1].at?.(argument());', null, true],
  ['receiver call', 'getRows()?.at?.(argument());', 'value', true],
  ['sequence stable tail', 'const rows = []; (before(), rows).at?.(argument());', null, false],
  ['raw super receiver', 'class C extends B { f() { return super.at?.(argument()); } }', null, false, true],
  ['adjacent optional result', 'getRows().at?.(argument())?.length;', null, true, false, true],
  ['adjacent guarded receiver and result', 'rows?.at?.(argument())?.length;', 'value', false, false, true],
  ['plain result', 'rows.at?.(argument()).length;', null, false],
  ['intervening hop', 'rows.at?.(argument()).value?.length;', null, false],
  ['nonoptional method call', 'rows?.at(argument())?.length;', 'value', false],
  ['key mutates receiver', 'let rows = []; rows[(rows = other, "at")]?.(argument());', null, true, false, false, true],
  ['key after constant', 'const rows = []; rows[(effect(), "at")]?.(argument());', null, false, false, false, true],
  ['getter can replace receiver', 'let rows = { get at() { rows = other; return invoke; } }; rows.at?.(argument());', null, true],
  ['source import live value', "import { rows } from './rows.js'; rows.at?.(argument());", null, true],
  ['TS receiver wrapper', 'const rows = []; (rows as any).at?.(argument());', null, false],
  ['TS callee wrapper', 'const rows = []; (rows.at as any)?.(argument());', null, false],
  ['TS live receiver', 'box?.rows!.at?.(argument());', 'link', true],
  ['TS sealed receiver', '(box?.rows as any).at?.(argument());', null, true],
]) runBoth(`optional ${ name }`, source, (parser, program, label) => {
  function matches(member) {
    const key = peelNestedSequenceExpressions(member.node.property).tail;
    return key?.name === 'at' || key?.value === 'at';
  }
  const path = parser.pickPath(program, 'MemberExpression', matches)
    ?? parser.pickPath(program, 'OptionalMemberExpression', matches);
  let callPath = path.parentPath;
  while (callPath && unwrapRuntimeExpr(callPath.node.callee) !== path.node) callPath = callPath.parentPath;
  let continuation = callPath.parentPath;
  while (continuation?.node.type === 'ChainExpression') continuation = continuation.parentPath;
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  let mutations = 0;
  function rejectMutation() {
    mutations++;
    throw new Error('An optional query cannot apply');
  }
  const input = {
    callee: path.node, call: callPath.node, continuation: continuation?.node,
    ctx: { scope: path.scope, path, adapter, injectorState: {
      isOwnPassGeneratedName: () => false, isOwnPassPureBinding: () => false,
      generateDeclaredRef: rejectMutation, addPureImport: rejectMutation,
    } },
  };
  const before = JSON.stringify(program.node);
  planOptionalMethodCall(input); // Ignoring a speculative answer cannot prime its consumer.
  const decision = planOptionalMethodCall(input);
  check(`${ label } receiver guard`, decision.receiverGuard, guard);
  check(`${ label } capture`, decision.capture, capture);
  check(`${ label } super this`, decision.superReceiver, superReceiver);
  check(`${ label } adjacent result guard`, decision.compactMethod, compactMethod);
  check(`${ label } key effects`, decision.interveningEffects, keyEffects);
  check(`${ label } live first receiver`, decision.firstReceiver === path.node.object, true);
  check(`${ label } prefix retained without a capture`, decision.firstReceiver !== decision.receiver, name === 'sequence stable tail');
  check(`${ label } source unchanged`, JSON.stringify(program.node), before);
  check(`${ label } no apply`, mutations, 0);
});

// A method reference survives callee parens; a seal inside its receiver is a different
// boundary. Cover both parser spellings and typed shells without consulting a host path.
for (const [source, sealed] of [
  ['rows?.at(0);', false],
  ['(rows?.at)(0);', true],
  ['(rows?.at)?.(0);', true],
  ['(rows?.at as any)(0);', true],
  ['(rows?.at!)(0);', true],
  ['((rows?.at as any)!)(0);', true],
  ['(box?.rows).at(0);', false],
  ['rows.at((other?.at)(0));', false],
]) runBoth(`callee seal ${ source }`, source, (parser, program, label) => {
  const path = parser.pickPath(program, 'CallExpression') ?? parser.pickPath(program, 'OptionalCallExpression');
  check(label, calleeParenWrapped(path.node), sealed);
});

// Rendering reads the current source slots and registers captures before arguments.
// Neither a repeated render nor a prepared receiver guard may capture the value twice.
runBoth('optional render live slots', 'getRows().at?.(before());', (parser, program, label) => {
  const path = parser.pickPath(program, 'MemberExpression', member => member.node.property.name === 'at');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const decision = planOptionalMethodCall({ callee: path.node, ctx: { scope: path.scope, path, adapter } });
  const call = path.parentPath.node;
  call.arguments[0].callee.name = 'after';
  const before = JSON.stringify(program.node);
  const registered = [];
  const argumentsSeen = [];
  const product = renderOptionalMethodCall(decision, {
    callee: path.node, args: call.arguments, helper: identifier('lookup'),
    mintRef: role => `_${ role }`,
    recordCapture(node, role) {
      registered.push(role);
      return node;
    },
    embed(node, role) {
      if (role === 'argument') {
        argumentsSeen.push(node.callee.name);
        checkDeep(`${ label } captures registered before argument`, registered, ['receiver', 'method']);
      }
      return hostSlot(cloneNode(node));
    },
  });
  checkDeep(`${ label } live argument slot`, argumentsSeen, ['after']);
  check(`${ label } one method check carries receiver capture`, product.disjuncts.length, 1);
  check(`${ label } source unchanged by apply`, JSON.stringify(program.node), before);
  const prepared = renderOptionalMethodCall(decision, {
    callee: path.node, args: [], helper: identifier('lookup'),
    guard: { checks: [identifier('earlierCheck')], receiver: identifier('earlierReceiver') },
    mintRef(role) {
      check(`${ label } existing receiver not recaptured`, role, 'method');
      return '_method';
    },
    embed: node => hostSlot(cloneNode(node)),
  });
  check(`${ label } earlier guard retained first`, prepared.disjuncts[0].name, 'earlierCheck');
  const memo = renderReceiverMemo(decision, { mintRef: () => '_value', embed: node => hostSlot(cloneNode(node)) });
  const first = memo.makeBase();
  const second = memo.makeBase();
  check(`${ label } receiver read nodes do not alias`, first === second, false);
});

// A seal guards receiver/key work but cannot swallow the outer invocation.
// A prepared navigation guard never allocates a second receiver.
for (const sealed of [false, true]) for (const invoke of [false, true]) for (const prepared of [false, true]) {
  runBoth(`guarded consume/${ sealed }/${ invoke }/${ prepared }`, 'getRows()[(key(), "at")](before());', (parser, program, label) => {
    const path = parser.pickPath(program, 'MemberExpression');
    const call = path.parentPath.node;
    const decision = planMethodCall({
      receiver: path.node.object, args: call.arguments,
      sideEffects: [
        { type: 'CallExpression', callee: identifier('receiverEffect'), arguments: [] },
        ...peelNestedSequenceExpressions(path.node.property).prefix,
      ],
      receiverEffectCount: 1,
    });
    call.arguments[0].callee.name = 'after';
    const source = JSON.stringify(program.node);
    let captures = 0;
    const roles = [];
    const product = renderGuardedMethodCall(decision, {
      helper: identifier('lookup'), sealed, invoke,
      guard: prepared ? { checks: [identifier('probe')], receiver: identifier('held') } : null,
      mintRef() {
        captures++;
        return 'held';
      },
      embed(node, role) {
        roles.push(role);
        return cloneNode(node);
      },
    });
    check(`${ label } receiver captured once`, captures, prepared ? 0 : 1);
    check(`${ label } seal consumes the receiver guard`, product.checks.length, sealed ? 0 : 1);
    check(`${ label } source unchanged`, JSON.stringify(program.node), source);
    check(`${ label } arguments belong only to invocation`, roles.includes('argument'), invoke);
    if (!sealed && !prepared) {
      check(`${ label } lifted prefix before receiver guard`, product.checks[0].expressions[0].callee.name, 'receiverEffect');
    }
    const body = sealed && invoke ? product.built : product.built.expressions.at(-1);
    check(`${ label } helper or invocation`, body.type, 'CallExpression');
    if (invoke) {
      check(`${ label } argument rewritten before rendering`, body.arguments[1].callee.name, 'after');
      check(`${ label } this is the captured value`, body.arguments[0].name, 'held');
      if (sealed) {
        const { left: lookup } = body.callee.object;
        check(`${ label } key inside sealed lookup`, lookup.alternate.expressions[0].callee.name, 'key');
        check(`${ label } undefined lookup cannot reject before argument`, body.callee.object.operator, '||');
      }
    } else if (sealed) {
      const [guarded] = product.built.expressions;
      check(`${ label } key alone short-circuits`, guarded.alternate.expressions[0].callee.name, 'key');
      check(`${ label } helper rejects outside seal`, body.callee.name, 'lookup');
    }
  });
}

finish();
