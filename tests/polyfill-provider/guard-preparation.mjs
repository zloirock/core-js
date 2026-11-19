// Guard preparation distinguishes a held probe from navigation through it. Queries
// preserve source identity; applying a preparation only changes explicitly owned slots.
import {
  guardProbeUndefinable, holdsProxySurface, memoReceiverGlobalName, memoReceiverOriginName, mintedProxyGlobalName,
  optionalMemberStaysGuarded, planGuardComposition, planOptionalProbe,
  planGuardRootMemo, prepareGuardReceiver, prepareKeptMemoTail, prepareMemoReceiver,
} from '../../packages/core-js-polyfill-provider/detect-usage/guard-preparation.js';
import {
  markRenderedStoredValue, receiverContainsOptional, trustedIdentifierAliasWrite, unwrapRuntimeExpr,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { cloneNode, planReceiverMemo, renderKeptSequenceTail } from '../../packages/core-js-polyfill-provider/render.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('guard-preparation');

const injectorState = { pureImports: new Map([['actual/global-this', '_realm'], ['actual/array', '_array']]) };
check('minted realm import', mintedProxyGlobalName('_realm', injectorState), 'globalThis');
check('minted constructor is not a realm', mintedProxyGlobalName('_array', injectorState), null);
check('unknown generated name', mintedProxyGlobalName('_missing', injectorState), null);

function resolvePure({ kind, name }) {
  return kind === 'global' && ['globalThis', 'self', 'Array'].includes(name) ? { entry: name, hintName: name } : null;
}

// A guard and a memo share the selected source, but capture different evaluation slots:
// a memo retains a call's sequence prefix, while a guard can run it before its test.
for (const [expression, source, prefix = [], memo = null, keepSequence = false, prelude = '', hintName = null] of [
  ['globalThis?.Array.from', null],
  ['globalThis.window?.Array.from', 'globalThis.window'],
  ['globalThis.self?.window?.window?.Array.from', 'globalThis.self?.window'],
  ['globalThis.window?.window?.Array.from', 'globalThis.window'],
  ['globalThis.window?.window?.window?.Array.from', 'globalThis.window'],
  ['globalThis.window?.self.Array', 'globalThis.window'],
  ['globalThis.window?.self[ctor].of', 'globalThis.window', [], null, false, 'const ctor = "Array";'],
  ['globalThis.window?.self[`Array`].of', 'globalThis.window'],
  ['globalThis.window?.self["Arr" + "ay"].of', 'globalThis.window'],
  ['(effect(), globalThis.window)?.Array.from', 'globalThis.window', ['effect()']],
  ['(held = globalThis.window)?.Array.from', 'held = globalThis.window'],
  ['(effect(), held = globalThis.window)?.Array.from', 'effect(), held = globalThis.window', [], null, true],
  ['(effect(), globalThis.window)?.self', 'effect(), globalThis.window', [], null, true, '', 'self'],
  ['(effect(), globalThis.window)?.Array', 'globalThis.window', ['effect()'], null, false, '', 'Array'],
  ['(effect(), realm)?.self', 'realm', ['effect()'], null, false, 'const realm = globalThis.window;', 'self'],
  ['(globalThis.window?.self)?.Array.from', 'globalThis.window'],
  ['read()?.self', 'read()', [], 'read()', false, 'const read = () => globalThis.window;'],
  ['(effect(), read())?.self', 'read()', ['effect()'], 'effect(), read()', false,
    'const read = () => globalThis.window;'],
  ['read()?.["self"]', 'read()', [], null, false, 'const read = () => globalThis.window;'],
  ['read()?.self', null, [], null, false, 'const read = () => globalThis;'],
  ['read().self?.self', null, [], 'read()', false, 'const read = () => globalThis.window;'],
  ['(effect(), read().self)?.self', null, [], 'read()', false, 'const read = () => globalThis.window;'],
  ['(effect(), read()).self?.self', null, [], 'effect(), read()', false, 'const read = () => globalThis.window;'],
  ['unknown?.self', null],
  ['(outer(), (inner(), globalThis.window)?.self)?.self', 'globalThis.window', ['inner()'], null, false, '', 'self'],
  ['(0, effect(), globalThis.window)?.Array', 'globalThis.window', ['effect()'], null, false, '', 'Array'],
  ['read()?.C?.from', 'read()'],
  ['globalThis.window?.self[key].from', null],
  ['globalThis?.Array.from', null, [], null, false, 'const globalThis = {};'],
]) {
  const code = `${ prelude } let held; const result = ${ expression };`;
  runBoth(`optional probe/${ expression }/${ prelude }`, code, (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
    const node = unwrapRuntimeExpr(path.node.init);
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const ctx = { scope: path.scope, path, adapter, resolvePure };
    const before = JSON.stringify(program.node);
    function spelling(value) {
      const inner = unwrapRuntimeExpr(value);
      return inner ? code.slice(inner.start, inner.end) : null;
    }
    const plan = planOptionalProbe(node, ctx, { hintName });
    const capture = planOptionalProbe(node, ctx, { memoize: true });
    check(`${ label }/source`, spelling(plan?.source), source);
    check(`${ label }/memo request`, spelling(capture?.source), memo);
    if (memo !== null) check(`${ label }/memo identity`, planOptionalProbe(node, ctx, { memoize: true })?.source, capture?.source);
    if (source !== null) {
      checkDeep(`${ label }/prefix`, plan?.prefix.map(spelling), prefix);
      check(`${ label }/kept sequence`, plan?.keepSequence, keepSequence);
      check(`${ label }/repeat identity`, planOptionalProbe(node, ctx, { hintName })?.source, plan?.source);
    }
    check(`${ label }/read only`, JSON.stringify(program.node), before);
  });
}

runBoth('optional probe/memo rejects before resolution', 'const read = () => globalThis.window; const result = read()?.Array;',
  (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    let queries = 0;
    const ctx = { scope: path.scope, path, adapter, resolvePure() {
      queries++;
      return null;
    } };
    check(`${ label }/decline`, planOptionalProbe(unwrapRuntimeExpr(path.node.init), ctx, { memoize: true }), null);
    check(`${ label }/no value queries`, queries, 0);
  });

for (const located of [false, true]) runBoth(`optional probe/effect slots/${ located }`,
  'const result = (head(), globalThis.window)?.Array[(tail(), "from")];', (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
    const node = unwrapRuntimeExpr(path.node.init);
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const ctx = { scope: path.scope, path, adapter, resolvePure };
    const head = parser.pickPath(program, 'CallExpression', item => item.node.callee.name === 'head').node;
    const tail = parser.pickPath(program, 'CallExpression', item => item.node.callee.name === 'tail').node;
    if (!located) {
      delete tail.start;
      delete tail.end;
      delete tail.loc;
    }
    const before = JSON.stringify(program.node);
    const plan = planOptionalProbe(node, ctx, { effects: [head, tail], receiverEffectCount: 1 });
    check(`${ label }/prefix identity`, plan?.prefix[0], head);
    check(`${ label }/one prefix`, plan?.prefix.length, 1);
    check(`${ label }/key identity`, plan?.keySe?.[0], tail);
    check(`${ label }/one guarded key`, plan?.keySe?.length, 1);
    if (!located) {
      const foreign = { ...tail };
      check(`${ label }/unknown position and no source slot decline`,
        planOptionalProbe(node, ctx, { effects: [head, foreign], receiverEffectCount: 1 }), null);
    }
    check(`${ label }/read only`, JSON.stringify(program.node), before);
  });

for (const [name, expression, undefinable, surface, globalName, prelude = '', options = {}] of [
  ['backed root', 'globalThis', false, true, 'globalThis'],
  ['backed hop', 'globalThis.self', false, true, 'self'],
  ['probe', 'globalThis.window', true, true, 'window'],
  ['plain probe before backed leaf', 'globalThis.window.self', false, true, 'self'],
  ['stored terminal probe', 'held = globalThis.window', true, true, 'window'],
  ['stored plain navigation collapses to backed leaf', 'held = globalThis.window.self', false, true, 'self'],
  ['prefix is not a store', '(effect(), globalThis.window.self)', false, true, 'self'],
  ['store in prefix tail', '(effect(), held = globalThis.window)', true, true, 'window'],
  ['stored prefix tail', 'held = (effect(), globalThis.window)', true, true, 'window'],
  ['alias holds probe', 'realm', true, true, 'window', 'const realm = globalThis.window;'],
  ['shadowed root', 'globalThis', false, false, null, 'const globalThis = {};'],
  ['shadowed member root', 'globalThis.self', false, false, null, 'const globalThis = { self: {} };'],
  ['foreign value', 'unknown', false, false, null],
  ['defined call yield', 'read()', false, true, 'globalThis', 'const read = () => globalThis;'],
  ['probe call yield', 'read()', true, true, 'window', 'const read = () => globalThis.window;'],
  ['initless callee', 'read?.()', true, false, null, 'let read;'],
  ['literal callee', '(() => 1)()', false, false, null],
  ['nested sequence value', '(effect(), (again(), globalThis))', false, true, 'globalThis'],
  ['nested sequence probe', '(effect(), (again(), globalThis))', true, true, 'globalThis', '', { nestedSeqUnproven: true }],
  ['nested conditional probe', '(effect(), (again(), null == probe ? void 0 : self))', true, false, null, '', { nestedSeqUnproven: true }],
  ['nested foreign value', '(effect(), (again(), unknown))', false, false, null, '', { nestedSeqUnproven: true }],
  ['constructor value', 'globalThis.Array', false, false, 'Array'],
  ['stored terminal probe', '(held = globalThis.self.window)', true, true, 'window'],
  ['user property', 'globalThis.user', false, false, null],
]) runBoth(name, `${ prelude } let held; const result = ${ expression };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  const source = unwrapRuntimeExpr(path.node.init);
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const ctx = { scope: path.scope, path, adapter, resolvePure };
  const before = JSON.stringify(program.node);
  guardProbeUndefinable(source, { ...ctx, ...options }); // A discarded query cannot prime a later decision.
  check(`${ label }/nullish`, guardProbeUndefinable(source, { ...ctx, ...options }), undefinable);
  check(`${ label }/surface`, holdsProxySurface(source, ctx), surface);
  check(`${ label }/memo alias`, memoReceiverGlobalName(source, ctx, { constructors: true }), globalName);
  // Pathless queries retain lexical scope, but cannot prove a later alias write.
  const pathless = { ...ctx, path: null };
  check(`${ label }/pathless surface`, holdsProxySurface(source, pathless), surface);
  check(`${ label }/pathless memo alias`, memoReceiverGlobalName(source, pathless, { constructors: true }), globalName);
  check(`${ label }/read only`, JSON.stringify(program.node), before);
});

for (const [source, expected] of [
  ['(held = globalThis)', true],
  ['(held ||= globalThis)', false],
  ['(held ??= globalThis)', false],
  ['(held &&= globalThis)', false],
  ['(held += globalThis)', false],
  ['(held = globalThis, held &&= other, held)', false],
  ['(held = globalThis, held++, held)', false],
  ['(held = globalThis, change(), held)', false],
  ['(held = other, held = globalThis, held)', true],
  ['(other = foreign, held = other, other = globalThis, held)', false],
  ['(other = globalThis, held = other, other = foreign, held)', true],
]) runBoth(`surface store/${ source }`, `let held, other; const foreign = {}; const result = ${ source };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const before = JSON.stringify(program.node);
  check(label, holdsProxySurface(path.node.init, { scope: path.scope, adapter, path, resolvePure }), expected);
  check(`${ label }/query preserves source`, JSON.stringify(program.node), before);
});

// A memo names the value it captured, without treating a constructor as a realm surface.
for (const [name, expression, expected, setup = '', mutated = false] of [
  ['bare constructor', 'Array', 'Array'],
  ['stored constructor', 'held = Array', 'Array'],
  ['nested stored constructor', 'held = other = (effect(), Array)', 'Array'],
  ['prefixed stored constructor', '(effect(), held = Array)', 'Array'],
  ['decided or constructor', 'globalThis.Array || Array', 'Array'],
  ['decided nullish constructor', 'globalThis.Array ?? Array', 'Array'],
  ['object namespace', 'globalThis.Object || Object', 'Object'],
  ['constructor alias', 'Alias', 'Array', 'const Alias = Array;'],
  ['unknown selection', 'flag ? Array : other', null],
  ['different constructors', 'flag ? Array : Map', null],
  ['shadowed constructor', 'held = Array', null, 'const Array = {};'],
  ['shadowed realm constructor', 'globalThis.Array', null, 'const globalThis = { Array: {} };'],
  ['mutated global slot', 'held = Array', null, '', true],
  ['ordinary property', 'globalThis.custom', null],
  ['script this is not a named realm memo', 'this.Array', null],
  ['literal constructor slot', 'box.C', null, 'const box = { C: Array };'],
]) runBoth(`constructor memo/${ name }`, `${ setup } let held, other; const result = ${ expression };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method: 'usage-pure', getMutatedStatics: () => new Set(mutated ? ['globalThis.Array'] : []),
  });
  const ctx = { scope: path.scope, path, adapter, resolvePure };
  const source = path.node.init;
  const before = JSON.stringify(program.node);
  check(`${ label }/no constructor alias requested`, memoReceiverGlobalName(source, ctx), null);
  check(`${ label }/constructor alias`, memoReceiverGlobalName(source, ctx, { constructors: true }), expected);
  check(`${ label }/read only`, JSON.stringify(program.node), before);
});

for (const method of ['usage-pure', 'usage-global']) runBoth(`later write/${ method }`,
  'let realm; realm = globalThis.window; const result = realm;', (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
    const write = parser.pickPath(program, 'AssignmentExpression').node;
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method });
    const ctx = { scope: path.scope, adapter, path: null, resolvePure };
    const pure = method === 'usage-pure';
    const before = JSON.stringify(program.node);
    check(`${ label }/pathless surface`, holdsProxySurface(path.node.init, ctx), !pure);
    check(`${ label }/pathless memo alias`, memoReceiverGlobalName(path.node.init, ctx), pure ? null : 'window');
    for (const readNode of [undefined, null, { type: 'Identifier', name: 'realm' }]) {
      check(`${ label }/no source span/${ readNode?.type ?? readNode }`,
        trustedIdentifierAliasWrite({ ...ctx, name: 'realm', readNode }), pure ? null : write);
    }
    check(`${ label }/source span`,
      trustedIdentifierAliasWrite({ ...ctx, name: 'realm', readNode: path.node.init }), write);
    check(`${ label }/path without a guard or read span`,
      trustedIdentifierAliasWrite({ ...ctx, name: 'realm', path }), pure ? null : write);
    check(`${ label }/read only`, JSON.stringify(program.node), before);
  });

runBoth('guarded later write without a read span',
  'let realm; const result = (realm = globalThis.window) ? realm : undefined;', (parser, program, label) => {
    const path = parser.pickPath(program, 'Identifier', item => item.node.name === 'realm'
      && item.parentPath.node.type === 'ConditionalExpression');
    const write = parser.pickPath(program, 'AssignmentExpression').node;
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    check(label, trustedIdentifierAliasWrite({ scope: path.scope, name: 'realm', adapter, path }), write);
  });

for (const expression of ['read()', 'read?.()']) runBoth(`call provenance/${ expression }`,
  `const read = () => globalThis.window; const result = ${ expression };`, (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const ctx = { scope: path.scope, path: null, adapter, resolvePure };
    const before = JSON.stringify(path.node.init);
    check(`${ label }/source root`, memoReceiverOriginName(path.node.init, ctx), 'globalThis');
    check(`${ label }/held surface`, memoReceiverGlobalName(path.node.init, ctx), expression === 'read()' ? 'window' : null);
    check(`${ label }/nullish yield`, guardProbeUndefinable(path.node.init, { ...ctx, path }), true);
    check(`${ label }/read only`, JSON.stringify(path.node.init), before);
  });

for (const [expression, root] of [
  ['(held = globalThis).self', 'held = globalThis'],
  ['(effect(), held = globalThis).self', 'effect(), held = globalThis'],
  ['(held = globalThis).window', null],
  ['globalThis.self', null],
  ['held = globalThis.self', null],
  ['held = globalThis.window', null],
  ['(held = globalThis.host).self', null],
  ['held = (other = globalThis.host).self', null],
  ['held = unknown', null],
]) runBoth(`memo source/${ expression }`, `let held, other; const result = ${ expression };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  const source = unwrapRuntimeExpr(path.node.init);
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const ctx = { scope: path.scope, path, adapter, resolvePure };
  const before = JSON.stringify(program.node);
  const plan = planGuardRootMemo(source, ctx);
  const selected = plan && unwrapRuntimeExpr(plan.source);
  const code = `let held, other; const result = ${ expression };`;
  check(`${ label }/root`, selected ? code.slice(selected.start, selected.end) : null, root);
  if (plan) {
    check(`${ label }/live slot`, plan.source, plan.holder.object);
    check(`${ label }/source spine`, plan.spine[0], source);
    check(`${ label }/repeat`, planGuardRootMemo(source, ctx).source, plan.source);
  }
  check(`${ label }/source unchanged`, JSON.stringify(program.node), before);
});

runBoth('owned guard versus user conditional', 'const result = null == probe ? void 0 : value;', (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  const source = path.node.init;
  const ctx = { scope: path.scope, path, resolvePure };
  const before = JSON.stringify(source);
  check(`${ label }/user boundary`, planGuardComposition(source, ctx), null);
  markRenderedStoredValue(source);
  const plan = planGuardComposition(source, ctx);
  check(`${ label }/probe identity`, plan.probe, source.test.right);
  check(`${ label }/defined identity`, plan.receiver, source.alternate);
  check(`${ label }/source unchanged`, JSON.stringify(source), before);
});

for (const [expression, optional] of [
  ['(value?.item).next', true], ['read(value?.item)', true], ['value.item', false],
]) runBoth(`sealed value/${ expression }`, `const result = ${ expression };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  check(label, receiverContainsOptional(path.node.init), optional);
});

let deepValue = { type: 'MemberExpression', optional: true };
for (let depth = 0; depth < 1050; depth++) deepValue = { type: 'ParenthesizedExpression', expression: deepValue };
check('deep generated value retains its optional', receiverContainsOptional(deepValue), true);

runBoth('mutated leaf keeps the source realm read', 'const result = globalThis.self;', (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const before = JSON.stringify(path.node.init);
  function unexpected() {
    throw new Error('A mutated leaf must retain its source realm instead of injecting one');
  }
  const memo = prepareGuardReceiver(path.node.init, { scope: path.scope, path, adapter, resolvePure }, {
    cloneMemo: cloneNode, pure: unexpected, renderNav: unexpected, folded: unexpected,
    guarded: unexpected, renderKeptTail: unexpected, deoptionalize: unexpected,
  }, { mutatedLeaf: true });
  check(`${ label }/no capture for the stable realm`, memo.capture, false);
  check(`${ label }/source realm read`, memo.firstReceiver.name, 'globalThis');
  check(`${ label }/source unchanged`, JSON.stringify(path.node.init), before);
});

runBoth('kept sequence preparation preserves its prefix', 'const result = (effect(), globalThis.window.self);', (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  const original = JSON.stringify(path.node.init);
  const source = unwrapRuntimeExpr(cloneNode(path.node.init));
  const [prefix] = source.expressions;
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  prepareKeptMemoTail(source, { scope: path.scope, path, adapter, resolvePure }, {
    renderKeptTail: plan => renderKeptSequenceTail(plan, { injectImport: () => '_self' }),
  });
  check(`${ label }/prefix identity`, source.expressions[0], prefix);
  check(`${ label }/captured probe`, source.expressions.at(-1).type, 'ConditionalExpression');
  check(`${ label }/input unchanged`, JSON.stringify(path.node.init), original);
});

for (const [expression, capture] of [['(effect(), stable)', false], ['(effect(), make())', true]]) {
  runBoth(`memo reads/${ expression }`, `const stable = []; const result = ${ expression };`, (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
    const source = path.node.init;
    const before = JSON.stringify(source);
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const ctx = { scope: path.scope, path, adapter };
    planReceiverMemo(source, { ctx });
    const plan = planReceiverMemo(source, { ctx });
    check(`${ label }/capture`, plan.capture, capture);
    check(`${ label }/first read`, plan.firstReceiver, source);
    check(`${ label }/tail identity`, plan.receiver, unwrapRuntimeExpr(source).expressions.at(-1));
    checkDeep(`${ label }/query purity`, JSON.stringify(source), before);
  });
}

for (const [source, expected] of [
  ['(tick(), globalThis).self', ['sequence', 'sequence']],
  ['globalThis.window?.self', []],
]) runBoth(`value and guard memo/${ source }`, `const result = ${ source };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator');
  const node = unwrapRuntimeExpr(path.node.init);
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const ctx = { path, scope: path.scope, adapter, resolvePure };
  const prepared = { type: 'Identifier', name: 'prepared' };
  const calls = [];
  const bindings = {
    renderNav(plan) { calls.push(plan.kind); return prepared; },
    cloneMemo: cloneNode,
    pure(result) { return { type: 'Identifier', name: result.hintName }; },
    guarded(probe) { return probe; },
  };
  check(`${ label }/value`, prepareMemoReceiver(node, ctx, bindings), expected.length ? prepared : node);
  const guard = prepareGuardReceiver(node, ctx, bindings);
  if (expected.length) check(`${ label }/guard`, guard.firstReceiver.name, 'prepared');
  else check(`${ label }/keeps the environment read`, guard.firstReceiver.property?.name, 'window');
  checkDeep(`${ label }/navigation render calls`, calls, expected);
});

runBoth('supplied probe keeps the realm sequence slot', 'const result = (effect(), globalThis.window)?.self;',
  (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator');
    const node = unwrapRuntimeExpr(path.node.init);
    const source = unwrapRuntimeExpr(node.object);
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const ctx = { path, scope: path.scope, adapter, resolvePure };
    const before = JSON.stringify(program.node);
    const plan = planOptionalProbe(node, ctx, { hintName: 'self', guard: { object: source.expressions.at(-1) } });
    check(`${ label }/source`, plan.source, source);
    check(`${ label }/prefix stays in test`, plan.prefix.length, 0);
    check(`${ label }/read only`, JSON.stringify(program.node), before);
  });

// The receiver's value decides the guard, across both optional-call dialects and realm aliases.
for (const [setup, expression, expected] of [
  ['let f;', 'f?.()?.self', true],
  ['let f;', 'f?.()?.window?.self', true],
  ['let f;', 'f?.().self?.window', true],
  ['', 'globalThis?.read()?.self', true],
  ['', 'globalThis?.Array?.from', false],
  ['', 'globalThis.window?.self', true],
  ['', 'globalThis?.window?.self', true],
  ['const g = globalThis;', 'g?.window?.self', true],
  ['const first = globalThis; const g = first;', 'g?.window?.self', true],
  ['const g = globalThis;', 'g?.Array?.from', false],
  ['import g from "@core-js/pure/actual/global-this";', 'g?.window?.self', true],
  ['let held;', '(held = globalThis.window)?.self', true],
  ['let held;', '(held = globalThis)?.self', false],
  ['', '(() => globalThis)()?.self', true],
]) runBoth(`optional member guard/${ expression }/${ setup }`, `${ setup } const result = ${ expression };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const node = unwrapRuntimeExpr(path.node.init);
  const context = { path, adapter, resolvePure };
  const before = JSON.stringify(program.node);
  check(`${ label }/guard`, optionalMemberStaysGuarded(node, context), expected);
  check(`${ label }/repeated query`, optionalMemberStaysGuarded(node, context), expected);
  check(`${ label }/source unchanged`, JSON.stringify(program.node), before);
});

// Provenance is minted explicitly; an ordinary source alias must not acquire it.
for (const own of [false, true]) runBoth(`memo origin ownership/${ own }`,
  'const realm = globalThis; const result = realm;', (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const ctx = { path, scope: path.scope, adapter, injectorState: { isOwnPassPureBinding: () => own } };
    check(label, memoReceiverOriginName(path.node.init, ctx), own ? 'globalThis' : null);
  });

for (const expression of ['probe ? void 0 : value', 'probe == null ? void 0 : value']) {
  runBoth(`unrecognized rendered conditional/${ expression }`, `const result = ${ expression };`, (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator');
    markRenderedStoredValue(path.node.init);
    check(label, planGuardComposition(path.node.init, { path, scope: path.scope, resolvePure }), null);
  });
}

// These are application tests: the shared decision must invoke the right binding,
// retain its chosen source and mutate only the cloned slot owned by that binding.
for (const [expression, setup, firstType, firstName, calls] of [
  ['globalThis.Array', '', 'Identifier', '_Array', ['pure']],
  ['read()', 'const read = () => globalThis;', 'Identifier', '_globalThis', ['pure']],
  ['(held = globalThis.window).self?.self', '', 'AssignmentExpression', null, []],
  ['(() => globalThis.window)()?.self', '', 'Identifier', '_guarded', ['guarded']],
  ['(effect(), globalThis.window.self)', '', 'SequenceExpression', null, ['kept']],
  ['null == globalThis.window ? void 0 : self', '', 'MemberExpression', null, []],
  ['(held = globalThis)?.[key]', '', 'OptionalMemberExpression', null, ['deoptionalize']],
]) runBoth(`guard application/${ expression }`, `${ setup } let held; const result = ${ expression };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  const node = unwrapRuntimeExpr(path.node.init);
  if (node.type === 'ConditionalExpression') markRenderedStoredValue(node);
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const ctx = { path, scope: path.scope, adapter, resolvePure };
  const before = JSON.stringify(node);
  const seen = [];
  let cloned;
  const plan = prepareGuardReceiver(node, ctx, {
    pure(pure) { seen.push('pure'); return { type: 'Identifier', name: `_${ pure.hintName }` }; },
    renderNav() { throw new Error('Unexpected navigation collapse'); },
    cloneMemo(source) { cloned = cloneNode(source); return cloned; },
    guarded(probe) {
      check(`${ label }/guard source`, probe, node.object);
      seen.push('guarded');
      return { type: 'Identifier', name: '_guarded' };
    },
    renderKeptTail(tail) {
      check(`${ label }/kept probe belongs to clone`, tail.probe, unwrapRuntimeExpr(cloned).expressions.at(-1).object);
      check(`${ label }/kept probe is detached`, tail.probe === unwrapRuntimeExpr(node).expressions.at(-1).object, false);
      seen.push('kept');
      return { type: 'Identifier', name: '_kept' };
    },
    deoptionalize(hop) { seen.push('deoptionalize'); hop.optional = false; },
  });
  const type = firstType === 'OptionalMemberExpression' && parser.name !== 'babel' ? 'MemberExpression' : firstType;
  check(`${ label }/first read shape`, unwrapRuntimeExpr(plan.firstReceiver).type, type);
  if (firstType === 'AssignmentExpression') {
    check(`${ label }/root spelling retained`, plan.firstReceiver.type, parser.name === 'babel' ? firstType : 'ParenthesizedExpression');
    check(`${ label }/captured source identity`, plan.firstReceiver, cloned);
  }
  check(`${ label }/first read binding`, plan.firstReceiver.name ?? null, firstName);
  checkDeep(`${ label }/binding calls`, seen, calls);
  if (calls.includes('deoptionalize')) check(`${ label }/owned optional removed`, plan.firstReceiver.optional, false);
  if (calls.includes('kept')) check(`${ label }/reader uses prepared tail`, plan.receiver.name, '_kept');
  if (node.type === 'ConditionalExpression') {
    check(`${ label }/composed probe identity`, plan.firstReceiver, node.test.right);
    check(`${ label }/composed value identity`, plan.receiver, node.alternate);
  }
  check(`${ label }/source unchanged`, JSON.stringify(node), before);
});

for (const [expression, setup, expected] of [
  ['(effect(), globalThis.window.self)', '', ['kept']],
  ['read().self', 'const read = () => globalThis.window;', []],
]) runBoth(`memo application/${ expression }`, `${ setup } const result = ${ expression };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const ctx = { path, scope: path.scope, adapter, resolvePure };
  const node = cloneNode(path.node.init);
  const calls = [];
  const result = prepareMemoReceiver(node, ctx, {
    renderKeptTail() { calls.push('kept'); return { type: 'Identifier', name: '_kept' }; },
    renderNav() { calls.push('nav'); return { type: 'Identifier', name: '_nav' }; },
  });
  check(`${ label }/source value retained`, result, node);
  checkDeep(`${ label }/application order`, calls, expected);
  if (expected.length) check(`${ label }/tail replacement`, unwrapRuntimeExpr(node).expressions.at(-1).name, '_kept');
});

runBoth('supplied constructor guard descends to a local call',
  'const read = () => ({ C: Array }); const result = read()?.C?.from;', (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
    const node = unwrapRuntimeExpr(path.node.init);
    const object = unwrapRuntimeExpr(node.object);
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const ctx = { path, scope: path.scope, adapter, resolvePure };
    const plan = planOptionalProbe(node, ctx, { hintName: 'Array$from', guard: { object } });
    check(`${ label }/call owns the probe`, plan.source, object.object);
    check(`${ label }/no detached effects`, plan.prefix.length, 0);
  });

runBoth('an instance reader observes a nested sequence value',
  'const result = (effect(), (again(), globalThis))?.Array.name;', (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator');
    const reader = unwrapRuntimeExpr(path.node.init);
    const node = unwrapRuntimeExpr(reader.object);
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const ctx = { path, scope: path.scope, adapter, resolvePure };
    check(`${ label }/claim alone has no value guard`, planOptionalProbe(node, ctx), null);
    const plan = planOptionalProbe(node, ctx, { reader });
    check(`${ label }/nested sequence owns the test`, plan.source, unwrapRuntimeExpr(node.object));
    check(`${ label }/prefix kept once`, plan.keepSequence, true);
    check(`${ label }/no duplicated prefix`, plan.prefix.length, 0);
  });

for (const root of ['globalThis', 'globalThis.window']) runBoth(`mutated reader over a backed call/${ root }`,
  `const read = () => ${ root }; const result = (effect(), read())?.self;`, (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
    const node = unwrapRuntimeExpr(path.node.init);
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const seen = [];
    const before = JSON.stringify(node);
    const plan = prepareGuardReceiver(node, { path, scope: path.scope, adapter, resolvePure }, {
      cloneMemo: cloneNode,
      folded(pure, effects) {
        seen.push('folded');
        check(`${ label }/backed surface`, pure.hintName, 'self');
        checkDeep(`${ label }/prefix ownership`, effects, [unwrapRuntimeExpr(node.object).expressions[0]]);
        return { type: 'Identifier', name: '_folded' };
      },
      guarded(probe, pure) {
        seen.push('guarded');
        check(`${ label }/nullish source identity`, probe, node.object);
        check(`${ label }/guarded surface`, pure.hintName, 'self');
        return { type: 'Identifier', name: '_guarded' };
      },
    }, { mutatedLeaf: true });
    const kind = root === 'globalThis' ? 'folded' : 'guarded';
    checkDeep(`${ label }/one application`, seen, [kind]);
    check(`${ label }/prepared reader`, plan.firstReceiver.name, `_${ kind }`);
    check(`${ label }/source unchanged`, JSON.stringify(node), before);
  });

for (const positioned of [false, true]) runBoth(`effects already owned by probe/${ positioned }`,
  'const result = (effect(), globalThis.window)?.Array;', (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator');
    const node = unwrapRuntimeExpr(cloneNode(path.node.init));
    if (!positioned) delete node.end;
    const object = unwrapRuntimeExpr(node.object);
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const ctx = { path, scope: path.scope, adapter, resolvePure };
    // OXC's outer parens straddle the probe; only the exact owned slot is portable.
    const raw = planOptionalProbe(node, ctx, { hintName: 'Array', effects: [node.object], receiverEffectCount: 1 });
    check(`${ label }/raw wrapper admission`, !!raw, parser.name === 'babel');
    const plan = planOptionalProbe(node, ctx, { hintName: 'Array', effects: [object], receiverEffectCount: 1 });
    check(`${ label }/test owns its read`, plan.source, object.expressions.at(-1));
    checkDeep(`${ label }/prefix exactly once`, plan.prefix, [object.expressions[0]]);
  });

finish();
