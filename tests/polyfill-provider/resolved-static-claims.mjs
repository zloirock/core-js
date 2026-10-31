// Final claims own the store, throw and effect order before either emitter imports.
import { resolvedStaticClaimRoutes } from '../../packages/core-js-polyfill-provider/detect-usage/proxy-navigation.js';
import { renderResolvedStaticClaim, hostSlot } from '../../packages/core-js-polyfill-provider/render.js';
import { unwrapRuntimeExpr, isMemberAccessNode } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, runBoth, finish } = createChecker('resolved-static-claims');
function resolvePure({ name }) {
  return ['globalThis', 'self', 'Array'].includes(name) ? { entry: name, hintName: name } : null;
}
function facts(parser, path, extra = {}) {
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  return { kind: 'static', hintName: 'ArrayFrom', entry: 'array/from', meta: {},
    aliasCtx: { path, scope: path.scope, adapter }, resolvePure, deletion: () => false, ...extra };
}
function resultPath(parser, program) {
  let path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result').get('init');
  while (path.node.expression) path = path.get('expression');
  return path;
}
for (const [source, effectNames] of [
  ['Array.from', []],
  ['(held = Array).from', ['held']],
  ['(before(), Array).from', ['before']],
]) runBoth(source, `let held; const result = ${ source };`, (parser, program, label) => {
  const path = resultPath(parser, program);
  const options = facts(parser, path);
  const receiver = unwrapRuntimeExpr(path.node.object);
  if (receiver.type === 'SequenceExpression') options.meta = { sideEffects: receiver.expressions.slice(0, -1), receiverEffectCount: 1 };
  const before = JSON.stringify(program.node);
  const products = [...resolvedStaticClaimRoutes(options)];
  checkDeep(`${ label }/stages`, products.map(product => product.kind), ['settle', 'replace']);
  const plan = products.at(-1);
  checkDeep(`${ label }/effects`, plan.effects.map(effect => effect.left?.name ?? effect.callee?.name), effectNames);
  const again = [...resolvedStaticClaimRoutes(options)].at(-1);
  check(`${ label }/query leaves source`, JSON.stringify(program.node), before);
  check(`${ label }/same base`, again.base.pure.entry, plan.base.pure.entry);
  check(`${ label }/effect identity`, again.effects.every((effect, index) => effect === plan.effects[index]), true);
  const imports = [];
  const rendered = renderResolvedStaticClaim(plan, {
    injectImport(entry) { imports.push(entry); return '_from'; }, embed: hostSlot, cloneHost: node => node,
  });
  checkDeep(`${ label }/one import`, imports, ['array/from']);
  check(`${ label }/value`, (rendered.expressions?.at(-1) ?? rendered).name, '_from');
  if (effectNames.length) check(`${ label }/source effect slot`, rendered.expressions[0].node, plan.effects[0]);
});

runBoth('write stays before key', 'let held; const result = (before(), held = Array)[(key(), "from")];', (parser, program, label) => {
  const path = resultPath(parser, program);
  const receiver = unwrapRuntimeExpr(path.node.object);
  const property = unwrapRuntimeExpr(path.node.property);
  const [before, store] = receiver.expressions;
  const [key] = property.expressions;
  const plan = [...resolvedStaticClaimRoutes(facts(parser, path, {
    meta: { sideEffects: [before, key], receiverEffectCount: 1 },
  }))].at(-1);
  checkDeep(`${ label }/ordered identities`, plan.effects, [before, store, key]);
});

for (const [source, setup, hintName, first, probe] of [
  ['globalThis.window?.Array', '', 'Array', 'guard', false],
  ['alias.Array', 'const alias = globalThis.window;', 'Array', 'settle', true],
  ['(globalThis.window?.self).Array', '', 'Array', 'settle', true],
]) runBoth(source, `${ setup } const result = ${ source };`, (parser, program, label) => {
  const path = resultPath(parser, program);
  const options = facts(parser, path, { kind: 'global', hintName, entry: hintName });
  const before = JSON.stringify(program.node);
  const plans = [...resolvedStaticClaimRoutes(options)];
  check(`${ label }/first`, plans[0]?.kind, first);
  check(`${ label }/probe`, !!plans.at(-1)?.probe, probe);
  if (probe) check(`${ label }/exactly one probe slot`, plans.at(-1).effects.filter(effect => effect === plans.at(-1).probe).length, 1);
  check(`${ label }/source untouched`, JSON.stringify(program.node), before);
});

runBoth('current receiver after settling', 'let held; const replacement = (held = Array); const result = Array.from;',
  (parser, program, label) => {
    const path = resultPath(parser, program);
    const replacement = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'replacement').node.init;
    const routes = resolvedStaticClaimRoutes(facts(parser, path));
    check(`${ label }/settle before querying effects`, routes.next().value.kind, 'settle');
    path.node.object = replacement;
    const product = routes.next().value;
    check(`${ label }/live store`, product.effects[0], unwrapRuntimeExpr(replacement));
    check(`${ label }/one effect`, product.effects.length, 1);
  });

for (const [source, tail, folds] of [
  ['held = globalThis.window', '.self.slot', true],
  ['before(), held = globalThis.window', '.self.slot', true],
  ['held = globalThis.window', '[(after(), "self")].slot', false],
]) runBoth(`kept/${ source }/${ tail }`, `let held; (${ source })${ tail } = 1;`, (parser, program, label) => {
  const path = parser.pickPath(program, 'AssignmentExpression', item => item.node.left.type === 'MemberExpression').get('left').get('object');
  const receiver = unwrapRuntimeExpr(path.node.object);
  const property = unwrapRuntimeExpr(path.node.property);
  const effects = [
    ...receiver.type === 'SequenceExpression' ? receiver.expressions.slice(0, -1) : [],
    ...property.type === 'SequenceExpression' ? property.expressions.slice(0, -1) : [],
  ];
  const meta = { sideEffects: effects, receiverEffectCount: receiver.type === 'SequenceExpression' ? 1 : 0 };
  const products = [...resolvedStaticClaimRoutes(facts(parser, path, { kind: 'global', hintName: 'self', entry: 'self', meta }))];
  check(`${ label }/terminal store`, products[0]?.kind, 'written-store');
  check(`${ label }/no later alternatives`, products.length, 1);
  check(`${ label }/erase only without a later key`, !!products[0]?.effects, folds);
  if (folds) {
    const [{ store }] = products;
    const rendered = renderResolvedStaticClaim(products[0], { embed: hostSlot, cloneHost: node => node,
      injectImport() { throw new Error('a kept store must not import'); } });
    const base = rendered.expressions.at(-1).type === 'SequenceExpression' ? rendered.expressions.at(-1) : rendered;
    check(`${ label }/store is evaluated once`, base.expressions.filter(effect => effect.node === store).length, 1);
    check(`${ label }/read before write target`, base.expressions.at(-1).consequent.type, 'MemberExpression');
    check(`${ label }/throw survives another transform`, base.expressions.at(-1).consequent.object.value, null);
    check(`${ label }/nullish branch only`, base.expressions.at(-1).test.operator, '==');
    check(`${ label }/stored value re-read`, base.expressions.at(-1).alternate.node, store.left);
  }
  check(`${ label }/actual member`, isMemberAccessNode(path.node), true);
});
runBoth('unspellable alias probe stays raw', 'const alias = globalThis.window; const result = alias[(effect(), "self")].Array;',
  (parser, program, label) => {
    const path = resultPath(parser, program);
    const source = JSON.stringify(program.node);
    const plans = [...resolvedStaticClaimRoutes(facts(parser, path, { kind: 'global', hintName: 'Array' }))];
    check(`${ label }/no replacement`, plans.some(plan => plan.kind === 'replace'), false);
    check(`${ label }/no mutation`, JSON.stringify(program.node), source);
  });

runBoth('sealed realm hop leaves its throwing reader', 'const result = (globalThis.window?.self).self.Array;',
  (parser, program, label) => {
    const path = resultPath(parser, program).get('object');
    const plans = [...resolvedStaticClaimRoutes(facts(parser, path, { kind: 'global', hintName: 'self' }))];
    checkDeep(`${ label }/terminal collapse`, plans.map(plan => plan.kind), ['collapse']);
    check(`${ label }/retained source`, plans[0]?.node, path.node.object);
  });

runBoth('member store target is not re-read', 'const box = { held: undefined }; (box.held = globalThis.window).self.slot = rhs();',
  (parser, program, label) => {
    const path = parser.pickPath(program, 'MemberExpression', item => item.node.property.name === 'self');
    const plans = [...resolvedStaticClaimRoutes(facts(parser, path, { kind: 'global', hintName: 'self' }))];
    check(`${ label }/store retained`, plans[0]?.kind, 'written-store');
    check(`${ label }/no second getter`, plans[0]?.effects, null);
  });
finish();
