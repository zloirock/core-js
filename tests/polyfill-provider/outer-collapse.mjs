// Outer navigation distinguishes the stored value, its retained tail and its consumer.
// Source slots stay immutable while separate plans accumulate their own effect lists.
import {
  createOuterCollapsePlanner, keptProxyTailPlan, planOuterCollapseValue, proxyCollapseBase, proxyCollapseConsumer,
} from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { renderOuterCollapseValue } from '../../packages/core-js-polyfill-provider/render.js';
import { unwrapRuntimeExpr } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, runBoth, finish } = createChecker('outer-collapse');

function resolvePure({ name }) {
  return ['globalThis', 'self', 'Array'].includes(name) ? { entry: name, hintName: name } : null;
}

for (const computed of [false, true]) runBoth(`stored effect slots/${ computed }`,
  `let held; const result = (first(), (second(), held = (inside(), globalThis.self)))${ computed ? '["window"]' : '.window' };`,
  (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
    const write = parser.pickPath(program, 'AssignmentExpression').node;
    const target = { node: unwrapRuntimeExpr(path.node.init) };
    const before = JSON.stringify(program.node);
    const calls = Object.fromEntries(parser.collectPaths(program, 'CallExpression').map(item => [item.node.callee.name, item.node]));
    const planner = createOuterCollapsePlanner({ resolvePure });
    const independent = createOuterCollapsePlanner({ resolvePure });
    check(`${ label }/value prefix`, planner.step({ kind: 'sequence', stored: true, prefixes: [calls.inside] }), true);
    check(`${ label }/write`, planner.step({ kind: 'write', node: write, readerHop: true }), true);
    check(`${ label }/second write ends the span`, planner.step({ kind: 'write', node: write, readerHop: true }), false);
    for (const prefix of [calls.second, calls.first]) {
      check(`${ label }/outer prefix/${ prefix.callee.name }`,
        planner.step({ kind: 'sequence', readerHop: true, prefixes: [prefix] }), true);
    }
    check(`${ label }/tail`, planner.step({ kind: 'member', node: target.node, keyName: 'window' }), true);
    check(`${ label }/independent plan`, independent.plan.keptTail.length, 0);
    check(`${ label }/stored effect identity`, planner.plan.valueEffects[0], calls.inside);
    check(`${ label }/first outer effect identity`, planner.plan.seqPrefixEffects[0], calls.first);
    check(`${ label }/second outer effect identity`, planner.plan.seqPrefixEffects[1], calls.second);
    check(`${ label }/tail source identity`, planner.plan.keptTail[0].node, target.node);
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const ctx = { scope: path.scope, adapter, path, resolvePure };
    const collapsed = { entry: 'self', hintName: 'self', effects: [] };
    let unusedFacts = 0;
    const plan = planOuterCollapseValue({ target, ...planner.plan }, collapsed, resolvePure({ name: 'self' }), ctx, {
      allowOptional: true, consumer: { node: target.node, host: path.node },
      get mutatedGuards() { unusedFacts++; return false; },
      get inMemo() { unusedFacts++; return false; },
      get parentInMemo() { unusedFacts++; return false; },
      get deleteFold() { unusedFacts++; return false; },
    });
    check(`${ label }/irrelevant facts stay lazy`, unusedFacts, 0);
    check(`${ label }/retained write route`, plan.kind, 'write');
    check(`${ label }/tail reads the write`, plan.readsOffWrite, true);
    check(`${ label }/stored effects`, plan.storedEffects.length, 1);
    check(`${ label }/kept value`, plan.innerPure.entry, 'self');
    const rendered = renderOuterCollapseValue(plan, { injectImport: entry => `_${ entry }` });
    check(`${ label }/source key spelling`, rendered.computed, computed);
    const prefix = rendered.object.expressions;
    checkDeep(`${ label }/outer order`, prefix.slice(0, -1).map(node => node.callee.name), ['first', 'second']);
    const stored = prefix.at(-1);
    check(`${ label }/write target`, stored.left.name, 'held');
    check(`${ label }/inside RHS`, stored.right.expressions[0].callee.name, 'inside');
    check(`${ label }/stored surface`, stored.right.expressions.at(-1).name, '_self');
    check(`${ label }/write target is cloned`, stored.left === write.left, false);
    check(`${ label }/query and render leave source intact`, JSON.stringify(program.node), before);
  });

for (const [source, backed, decline] of [
  ['globalThis', false, false], ['globalThis.self', false, false],
  ['globalThis.window', false, true], ['globalThis.window', true, false],
  ['(effect(), globalThis.window)', false, true], ['other = globalThis.window', false, true],
]) runBoth(`stored probe/${ source }/${ backed }`, `let held, other; const result = held = ${ source };`,
  (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
    const write = unwrapRuntimeExpr(path.node.init);
    const tail = [{ name: 'window', node: write.right }];
    check(`${ label }/unbacked continuation`, keptProxyTailPlan(write, tail, resolvePure, { backed }).decline, decline);
    check(`${ label }/no retained tail`, keptProxyTailPlan(write, [], resolvePure).decline, false);
    check(`${ label }/value reads its own store`, keptProxyTailPlan(write, tail, resolvePure, { navigated: false }).readsOffWrite, true);
    check(`${ label }/navigation reads its base`, keptProxyTailPlan(write, tail, resolvePure).readsOffWrite, false);
  });

for (const [expression, hasKeptTail, deadOptional, writeTarget, navigated] of [
  ['globalThis.self.window.item', true, false, false, true],
  ['globalThis.self.window?.item', true, false, false, false],
  ['globalThis.self.window?.item', true, true, false, true],
  ['globalThis.self.window.item = 1', true, false, true, true],
  ['globalThis.self.item = 1', false, true, true, false],
  ['globalThis.self.self.item = 1', false, true, true, true],
]) runBoth(`consumer/${ expression }/${ deadOptional }`, `const result = ${ expression };`,
  (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator');
    const value = unwrapRuntimeExpr(path.node.init);
    const host = value.type === 'AssignmentExpression' ? value.left : value;
    const node = host.object;
    const before = JSON.stringify(node);
    const decision = proxyCollapseConsumer({ node, host, hasKeptTail, deadOptional, writeTarget }, { resolvePure });
    check(`${ label }/navigation`, decision.navigated, navigated);
    check(`${ label }/write through retained value`, decision.writeThrough, writeTarget && hasKeptTail);
    check(`${ label }/read only`, JSON.stringify(node), before);
  });

runBoth('patched surface and delete', 'const result = globalThis.self.Array;', (parser, program, label) => {
  const host = parser.pickPath(program, 'VariableDeclarator').node.init;
  const ctx = { resolvePure, adapter: { isMutatedStatic: (object, key) => object === 'globalThis' && key === 'Array' } };
  const source = { node: host.object, host };
  check(`${ label }/patch read keeps nearest surface`, proxyCollapseConsumer(source, ctx).mutatedAbove, true);
  check(`${ label }/patch read is a value`, proxyCollapseConsumer(source, ctx).navigated, false);
  check(`${ label }/delete reads no patched global`, proxyCollapseConsumer({ ...source, deleteAbove: true }, ctx).mutatedAbove, false);
  check(`${ label }/write reads no patched global`, proxyCollapseConsumer({ ...source, writeTarget: true }, ctx).mutatedAbove, false);
});

runBoth('outward boundaries', 'let held; const result = (held = globalThis.window).self.window;',
  (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
    const node = unwrapRuntimeExpr(path.node.init);
    const write = parser.pickPath(program, 'AssignmentExpression').node;
    const planner = createOuterCollapsePlanner({ resolvePure });
    check(`${ label }/optional write reader`, planner.canCrossWrite({ readerHop: true, optional: true }), false);
    check(`${ label }/dead optional write reader`, planner.canCrossWrite({ readerHop: true, optional: true, deadOptional: true }), true);
    check(`${ label }/non-hop reader`, planner.canCrossWrite({ readerHop: false }), false);
    check(`${ label }/chain boundary`, planner.step({ kind: 'chain' }), false);
    check(`${ label }/unconsumed sequence`, planner.step({ kind: 'sequence' }), false);
    check(`${ label }/write slot`, planner.step({ kind: 'member', node, keyName: 'window', writeTarget: true }), false);
    check(`${ label }/unknown key`, planner.step({ kind: 'member', node, keyName: null }), false);
    planner.step({ kind: 'member', node: write.right, keyName: 'window' });
    check(`${ label }/wrapper retaining a value`, planner.step({ kind: 'wrapper', node }), false);
    check(`${ label }/wrapper continuing a read`, planner.step({ kind: 'wrapper', node, readerHop: true }), true);
    check(`${ label }/stored TS wrapper`, planner.step({ kind: 'wrapper', node: { type: 'TSAsExpression' }, readerHop: true, stored: true }), false);
    check(`${ label }/stored parentheses`, planner.step({ kind: 'wrapper', node: { type: 'ParenthesizedExpression' }, readerHop: true, stored: true }), true);
    planner.step({ kind: 'write', node: write, readerHop: true });
    check(`${ label }/inner tail retained`, planner.plan.innerKeptTail[0].node, write.right);
    planner.step({ kind: 'member', node, keyName: 'window' });
    check(`${ label }/live optional over tail`, planner.step({ kind: 'member', node: { ...node, optional: true }, keyName: 'self' }), false);
    check(`${ label }/dead optional over tail`, planner.step({ kind: 'member', node: { ...node, optional: true }, keyName: 'self', deadOptional: true }), true);
    check(`${ label }/backed hop resets tail`, planner.plan.keptTail.length, 0);
    check(`${ label }/backed hop recorded`, planner.plan.outerBacked, true);
    check(`${ label }/backed value name`, planner.plan.outerHopName, 'self');
    const rootPure = resolvePure({ name: 'globalThis' });
    const claimPure = resolvePure({ name: 'self' });
    check(`${ label }/store precedes alias`, proxyCollapseBase({ keptStore: write, aliasRoot: write.left, rootPure }).keep, write);
    check(`${ label }/navigation keeps alias`, proxyCollapseBase({ aliasRoot: write.left, rootPure }).alias, write.left);
    check(`${ label }/source value takes claim`, proxyCollapseBase({ aliasRoot: write.left, sourceValue: true, keepClaim: true, claimPure, rootPure }).pure, claimPure);
    check(`${ label }/forced fold takes root`, proxyCollapseBase({ rootPure, claimPure }).pure, rootPure);
  });

finish();
