// Guard preparation distinguishes a held probe from navigation through it. Queries
// preserve source identity; applying a preparation only changes explicitly owned slots.
import {
  guardProbeUndefinable, holdsProxySurface, memoReceiverGlobalName, memoReceiverOriginName, mintedProxyGlobalName,
  planGuardComposition,
  planGuardRootMemo, prepareGuardReceiver, prepareKeptMemoTail, storedMemoProvesGuard,
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
  ['nested foreign value', '(effect(), (again(), unknown))', false, false, null, '', { nestedSeqUnproven: true }],
  ['constructor value', 'globalThis.Array', false, false, 'Array'],
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
  // Generated memo tagging keeps its lexical scope without a source NodePath.
  const pathless = { ...ctx, path: null };
  check(`${ label }/pathless surface`, holdsProxySurface(source, pathless), surface);
  check(`${ label }/pathless memo alias`, memoReceiverGlobalName(source, pathless, { constructors: true }), globalName);
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

for (const [expression, root, storeProven] of [
  ['(held = globalThis).self', 'held = globalThis', false],
  ['(effect(), held = globalThis).self', 'effect(), held = globalThis', false],
  ['(held = globalThis).window', null, false],
  ['globalThis.self', null, false],
  ['held = globalThis.self', null, true],
  ['held = globalThis.window', null, false],
  ['held = unknown', null, false],
]) runBoth(`memo source/${ expression }`, `let held; const result = ${ expression };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  const source = unwrapRuntimeExpr(path.node.init);
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const ctx = { scope: path.scope, path, adapter, resolvePure };
  const before = JSON.stringify(program.node);
  const plan = planGuardRootMemo(source, ctx);
  const selected = plan && unwrapRuntimeExpr(plan.source);
  const code = `let held; const result = ${ expression };`;
  check(`${ label }/root`, selected ? code.slice(selected.start, selected.end) : null, root);
  if (plan) {
    check(`${ label }/live slot`, plan.source, plan.holder.object);
    check(`${ label }/source spine`, plan.spine[0], source);
    check(`${ label }/repeat`, planGuardRootMemo(source, ctx).source, plan.source);
  }
  check(`${ label }/store proof`, storedMemoProvesGuard(source, ctx), storeProven);
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

finish();
