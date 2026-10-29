// Guard continuations share one decision across AST hosts. These facts describe the
// source read and its owned realm fold; planning must not edit either record.
import {
  createGuardTailPlanner, navPlanNeedsGuard, planProvenNavGuardCollapse, pristineRealmHopKey,
} from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { realmHopRunBase } from '../../packages/core-js-polyfill-provider/detect-usage/members.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { unwrapRuntimeExpr } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('guard-tail');
const steps = {
  read: { optional: false, isCall: false },
  optional: { optional: true, isCall: false },
  call: { optional: false, isCall: true },
  invoke: { optional: true, isCall: true },
  realm: { optional: false, isCall: false, realmHop: true },
  probe: { optional: true, isCall: false, realmHop: true, computed: true },
  foreign: { optional: false, isCall: false, foreign: true },
  literal: { optional: false, isCall: false, realmHop: true, computed: true,
    property: { type: 'StringLiteral', value: 'window' } },
  effect: { optional: false, isCall: false, realmHop: true, computed: true,
    property: { type: 'CallExpression', callee: { type: 'Identifier', name: 'key' }, arguments: [] } },
  continued: { optional: false, isCall: false, realmHop: true, readsThrough: true, readsMember: true,
    reader: { type: 'MemberExpression', computed: false, property: { type: 'Identifier', name: 'box' } } },
};
const nav = { alwaysDefined: true, navCollapse: true };
const held = { alwaysDefined: false, navCollapse: true };
const value = { navAlternate: true };

for (const [name, options, input, expected] of [
  ['empty', nav, [], []],
  ['quiet computed realm folds', nav, ['literal'], [[true, false, true]]],
  ['effectful realm key stays', nav, ['effect'], [[false, false, true]]],
  ['observed realm read stays', { ...nav, preserveOptionalHops: true }, ['continued'], [[false, false, true]]],
  ['defined member', nav, ['optional'], [[false, false, true]]],
  ['live member', held, ['optional'], [null]],
  ['direct optional call', nav, ['invoke'], [null]],
  ['direct plain call', nav, ['call'], [null]],
  ['call after member', nav, ['read', 'call'], [[false, false, true], [false, false, false]]],
  ['second live guard', nav, ['optional', 'optional'], [[false, false, true], null]],
  ['plain prefix owns next guard', nav, ['read', 'optional'], [[false, false, true], [false, true, false]]],
  ['optional call continues chain', nav, ['optional', 'invoke', 'optional'],
    [[false, false, true], [false, true, false], [false, true, false]]],
  ['fold preserves defined leaf', nav, ['realm', 'optional'], [[true, false, true], [false, false, false]]],
  ['retained realm ends proof', nav, ['probe', 'optional'], [[false, false, true], null]],
  ['retained realm is not an absorbed callee', nav, ['probe', 'call'], [[false, false, true], null]],
  ['realm after user read is not folded', nav, ['read', 'realm'], [[false, false, true], [false, false, false]]],
  ['foreign owner ends tail', nav, ['foreign'], [null]],
  ['dispatch keeps result guard', {}, ['optional'], [null]],
  ['dispatch retains called member', {}, ['read', 'invoke'], [[false, false, false], [false, true, false]]],
  ['navigation keeps absent value guard', value, ['optional', 'optional'], [[false, true, false], [false, true, false]]],
  ['navigation stops after unbacked read', value, ['probe', 'optional'], [[false, true, false], null]],
  ['defined navigation spends optional erase', { alwaysDefined: true }, ['optional', 'optional'],
    [[false, false, true], null]],
  ['fold returns optional erase', { alwaysDefined: true }, ['realm', 'optional'],
    [[true, false, true], [false, false, false]]],
]) {
  const records = input.map(key => ({ ...steps[key] }));
  const before = structuredClone(records);
  const plan = createGuardTailPlanner(options);
  checkDeep(name, records.map(step => {
    const result = plan(step);
    return result && [result.folded, result.optional, result.absorbWrappers];
  }), expected);
  checkDeep(`${ name }/source unchanged`, records, before);
  checkDeep(`${ name }/independent climb`, records.map(createGuardTailPlanner(options))
    .map(result => result && [result.folded, result.optional, result.absorbWrappers]), expected);
}

for (const [name, source, options, expected] of [
  ['dotted', 'globalThis.self', {}, 'self'],
  ['literal', 'globalThis["self"]', {}, 'self'],
  ['optional closed', 'globalThis?.self', { allowOptional: false }, null],
  ['optional proven', 'globalThis?.self', { allowOptional: true }, 'self'],
  ['effectful key', 'globalThis[(effect(), "self")]', {}, null],
  ['retained key read', 'globalThis[(effect(), "self")]', { allowSideEffectKeys: true }, 'self'],
  ['foreign key', 'globalThis.other', {}, null],
  ['root is not a hop', 'globalThis', {}, null],
]) runBoth(name, `const value = ${ source };`, (adapter, program, label) => {
  const path = adapter.pickPath(program, 'VariableDeclarator');
  const node = path.node.init;
  const hop = node.type === 'ChainExpression' ? node.expression : node;
  const before = JSON.stringify(program.node);
  check(label, pristineRealmHopKey(hop, { adapter, scope: path.scope, path }, options), expected);
  check(`${ label }/mutation`, pristineRealmHopKey(hop,
    { adapter: { isMutatedStatic: () => true }, scope: path.scope, path }, options), null);
  check(`${ label }/no mutation`, JSON.stringify(program.node), before);
});

for (const [name, expression, guarded, prelude = ''] of [
  ['defined leaf', 'globalThis.self', false],
  ['probe below leaf', 'globalThis.window?.self', true],
  ['defined root optional', 'globalThis?.self', false],
  ['sequence guard', '(effect(), globalThis.window)?.self', true],
  ['alias guard', 'realm?.self', true, 'const realm = globalThis.window;'],
]) runBoth(name, `${ prelude } const value = ${ expression };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const before = JSON.stringify(program.node);
  const plan = planProvenNavGuardCollapse({
    rootNode: unwrapRuntimeExpr(path.node.init), scope: path.scope, adapter, path,
    allowUndefinableRoot: true, allowSequenceRoot: true, descendSequenceTail: true,
    resolvePure: ({ name: globalName }) => ['globalThis', 'self'].includes(globalName)
      ? { entry: globalName, hintName: globalName } : null,
  });
  check(`${ label }/plan exists`, !!plan, true);
  check(`${ label }/guard`, navPlanNeedsGuard(plan), guarded);
  check(`${ label }/source unchanged`, JSON.stringify(program.node), before);
});
check('no plan owes no guard', navPlanNeedsGuard(null), false);

for (const [name, expression, expected, mutated = false, backed = true] of [
  ['backed hop', 'root.self', 'root'],
  ['backed prefix', 'root.self.globalThis', 'root'],
  ['literal hop', 'root["self"]', 'root'],
  ['alias key stays structural', 'root[key]', null],
  ['effectful key stays', 'root[(effect(), "self")]', null],
  ['live optional stays', 'root?.self', null],
  ['mutated hop stays', 'root.self', null, true],
  ['unbacked hop stays', 'root.self', null, false, false],
]) runBoth(name, `const key = 'self'; const value = ${ expression };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value');
  const node = unwrapRuntimeExpr(path.node.init);
  const before = JSON.stringify(program.node);
  const base = realmHopRunBase(node, {
    adapter: { isMutatedStatic: () => mutated }, path,
    resolvePure: () => backed ? { entry: 'self' } : null,
  });
  check(`${ label }/narrow base`, base?.name ?? null, expected);
  check(`${ label }/source unchanged`, JSON.stringify(program.node), before);
});

const firstClimb = createGuardTailPlanner(nav);
const secondClimb = createGuardTailPlanner(held);
check('first climb erases defined optional', firstClimb(steps.optional).optional, false);
check('interleaved absent leaf keeps its boundary', secondClimb(steps.optional), null);
check('first climb retained its own boundary', firstClimb(steps.optional), null);
const longClimb = createGuardTailPlanner(nav);
for (let index = 0; index < 64; index++) {
  check(`realm prefix step ${ index }`, longClimb(steps.realm).folded, true);
}
check('folded prefix leaves the next receiver defined', longClimb(steps.optional).optional, false);
check('long prefix still stops at the second guard', longClimb(steps.optional), null);

finish();
