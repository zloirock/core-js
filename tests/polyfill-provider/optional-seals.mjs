// A swallowed value includes sealed optionals; an outer key's evaluation does not.
import { createChecker } from './harness.mjs';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import {
  spineHasOptionalHop, conditionalEvaluationEdge, definedBranchOfGuardConditional, unwrapRuntimeExpr,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { chainReadsThroughSeal, composableNavGuardPlan, probedDestructureInitValue } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { planOptionalProbe, planGuardRootMemo } from '../../packages/core-js-polyfill-provider/detect-usage/guard-preparation.js';
import { readStandsOverAbsentableStore, shouldDropRescueReceiver } from '../../packages/core-js-polyfill-provider/detect-usage/members.js';
import { walkStaticReceiverChain } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';

const { check, runBoth, finish } = createChecker('optional-seals');
for (const [source, defined] of [
  ['const result = flag ? undefined : globalThis;', true],
  ['const undefined = 3; const result = flag ? undefined : globalThis;', false],
  ['const undefined = 3; const result = flag ? void 0 : globalThis;', true],
  ['const result = flag ? void effect() : globalThis;', false],
  ['const result = flag ? undefined : void 0;', false],
]) runBoth(`conditional/${ source }`, source, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  check(`${ label }/defined arm`, !!definedBranchOfGuardConditional(path.node.init, { scope: path.scope, adapter, path }), defined);
});
function resolvePure({ name }) {
  return ['globalThis', 'self', 'Promise'].includes(name) ? { entry: name, hintName: name } : null;
}
for (const [expression, contains, conditional] of [
  ['obj?.x[key()]', true, true],
  ['(obj?.x)[key()]', true, false],
  ['(effect(), obj?.x)[key()]', true, false],
  ['(obj?.x, obj)[key()]', false, false],
  ['(obj?.x as any)[key()]', true, false],
  ['obj?.x![key()]', true, true],
  ['(obj?.x)![key()]', true, false],
  ['(obj as any)[key()]', false, false],
  ['obj?.m(arg())', true, true],
  ['(obj?.m)(arg())', true, false],
  ['(effect(), obj?.m)(arg())', true, false],
  ['obj[arg()?.x]', false, false],
]) runBoth(`spine/${ expression }`, `const result = ${ expression };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator');
  const node = unwrapRuntimeExpr(path.node.init);
  check(`${ label }/swallowed optional`, spineHasOptionalHop(node), contains);
  check(`${ label }/key or argument`, conditionalEvaluationEdge(node, node.property ?? node.arguments[0]), conditional);
});

for (const source of [
  '(globalThis.window?.self).self',
  '((held = globalThis.window)?.self).self',
  '(effect(), globalThis.window?.self).self',
  '(effect(), (globalThis.window?.self).self)',
  '(globalThis.window?.self as any).self',
]) runBoth(`sealed probe/${ source }`, `let held; const result = ${ source }?.Promise.resolve;`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  const node = unwrapRuntimeExpr(path.node.init);
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const ctx = { scope: path.scope, path, adapter, resolvePure };
  const before = JSON.stringify(program.node);
  const plan = planOptionalProbe(node, ctx);
  check(`${ label }/probe keeps throw`, chainReadsThroughSeal(plan?.source, resolvePure, ctx), true);
  check(`${ label }/repeat source`, planOptionalProbe(node, ctx)?.source, plan?.source);
  check(`${ label }/no composition across seal`, composableNavGuardPlan(node.object.object, ctx), null);
  check(`${ label }/no store-only memo`, planGuardRootMemo(unwrapRuntimeExpr(node.object.object), ctx), null);
  check(`${ label }/no resolver`, planGuardRootMemo(unwrapRuntimeExpr(node.object.object), { ...ctx, resolvePure: null }), null);
  check(`${ label }/read only`, JSON.stringify(program.node), before);
});
for (const operator of ['||', '??']) runBoth(`fallback/${ operator }`,
  `let held; const result = (held = globalThis.window)?.Promise ${ operator } {};`, (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    check(`${ label }/live fallback`, probedDestructureInitValue(path.node.init, resolvePure, { scope: path.scope, path, adapter }), null);
  });
for (const [source, retained] of [
  ['(held = globalThis.window)?.self.Promise', false],
  ['(held = globalThis.window).self.Promise', true],
  ['((held = globalThis.window)?.self).Promise', true],
]) runBoth(`kept read/${ source }`, `let held; const result = ${ source };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const ctx = { scope: path.scope, path, adapter, resolvePure };
  const receiver = unwrapRuntimeExpr(path.node.init);
  check(`${ label }/throwing read`, !!readStandsOverAbsentableStore(receiver, ctx), retained);
  check(`${ label }/rescue decision`, shouldDropRescueReceiver(receiver, ctx), !retained);
});
for (const [source, walkPath, expected] of [
  ['globalThis.Map', [], 'Map'],
  ['globalThis.Map', ['groupBy'], null],
  ['globalThis.self', ['Map'], 'Map'],
  ['{ root: globalThis.Map }', ['root'], 'Map'],
  ['{ root: globalThis.Map }', ['root', 'groupBy'], null],
  ['{ root: globalThis.Map }', ['root', 'prototype'], null],
]) runBoth(`remaining container keys/${ source }/${ walkPath }`, `const result = ${ source };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  check(label, walkStaticReceiverChain({ receiverNode: path.node.init, walkPath, scope: path.scope, adapter, path }), expected);
});
finish();
