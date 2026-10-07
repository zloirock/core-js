// Scoped computed-key effects retain getter reads where structural purity alone would drop them.
import {
  collectFileCensus,
  computedKeyHasSideEffects,
  patternFullyConsumed,
  patternHasSeveralSeKeys,
  patternKeepsEffectfulHop,
  patternKeepsEffectfulKey,
  patternLevelKeepsEffectfulHop,
  patternLevelKeepsSentinels,
  seKeyKeepsReceiverRead,
  sequencePrefixWithSideEffects,
  unwrapRuntimeExpr,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import {
  consumedAssignmentSlotPrunes,
  destructureKeyReadPlan,
  isBuiltInSurfaceNav,
  isReReadableSurfaceNav,
  planNestedKeyedPatternCapture,
} from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { keyedReadReceiverProven } from '../../packages/core-js-polyfill-provider/destructure-host-shape.js';
import { mutationShapesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';
import { resolveKey } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { findNamespaceMemberValue } from '../../packages/core-js-polyfill-provider/helpers/class-walk.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';
import { renderKeyedDestructureRead, identifier, callExpression, hostSlot } from '../../packages/core-js-polyfill-provider/render.js';

const { check, checkDeep, runBoth, finish } = createChecker('key-effects');

for (const [name, source, reusable] of [
  ['quiet free', 'const { [(effect(), "at")]: method } = rows;', true],
  ['constant', 'const rows = []; const { [(effect(), "at")]: method } = rows;', true],
  ['ambient', 'declare const rows: number[]; const { [(effect(), "at")]: method } = rows;', true],
  ['exported', 'export const { [(effect(), "at")]: method } = rows;', true],
  ['live import', 'import rows from "other"; const { [(effect(), "at")]: method } = rows;', false],
  ['key write', 'let rows = []; const { [(rows = other, "at")]: method } = rows;', false],
  ['member', 'const { [(effect(), "at")]: method } = holder.rows;', false],
]) runBoth(`sole keyed receiver/${ name }`, source, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ObjectPattern');
  const [prop] = path.get('id').get('properties');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const plan = destructureKeyReadPlan(prop, { scope: path.scope, path, adapter });
  check(`${ label }/reuse decision`, plan.reuseReceiver, reusable);
  const receiverName = reusable ? unwrapRuntimeExpr(path.node.init).name : 'capture';
  const rendered = renderKeyedDestructureRead({
    receiverName,
    receiver: hostSlot(path.node.init),
    binding: identifier('method'),
    keys: plan.keys.map(hostSlot),
    read: callExpression(identifier('dispatch'), [identifier(receiverName)]),
    reuseReceiver: reusable,
  });
  check(`${ label }/capture count`, rendered.length, reusable ? 1 : 2);
  check(`${ label }/null rejection precedes key`, rendered.at(-1).init.type, 'ConditionalExpression');
  check(`${ label }/null branch reads receiver`, rendered.at(-1).init.consequent.object.name, receiverName);
  // a receiver proven never nullish is reused wherever the plan sees it: no write reaches the name
  if (name === 'constant') {
    check(`${ label }/proven`, keyedReadReceiverProven({ init: path.node.init, hostPath: path, adapter }), true);
  }
});

// a proven receiver drops the null rejection, and its binding only where nothing reads the capture: a
// dispatch spelled off the capture keeps it even over a proven name the plan does not reuse
for (const [name, readsReceiver, captures] of [['dispatch', true, 2], ['static', false, 1]]) {
  runBoth(`proven keyed receiver/${ name }`, 'const { [(effect(), "at")]: method } = rows;', (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ObjectPattern');
    const rendered = renderKeyedDestructureRead({
      receiverName: 'capture',
      receiver: hostSlot(path.node.init),
      binding: identifier('method'),
      keys: [],
      read: readsReceiver ? callExpression(identifier('dispatch'), [identifier('capture')]) : identifier('pony'),
      proven: true,
      readsReceiver,
    });
    check(`${ label }/declarators`, rendered.length, captures);
    check(`${ label }/no null rejection`, rendered.at(-1).init.type, readsReceiver ? 'CallExpression' : 'Identifier');
  });
}

for (const [name, observable] of [['g', true], ['quiet', false]]) {
  runBoth(`leaf/${ name }`, `
    const box = { get g() { effect(); return 0; }, quiet: 0 };
    const { [(box.${ name }, 'flat')]: first, [(box.${ name }, 'at')]: second } = Array.prototype;
  `, (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ObjectPattern');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const ctx = { scope: path.scope, adapter, path };
    const pattern = path.node.id;
    const [prop] = pattern.properties;
    check(`${ label }/structural cache has no scoped answer`, computedKeyHasSideEffects(prop), false);
    check(`${ label }/computed key`, computedKeyHasSideEffects(prop, ctx), observable);
    check(`${ label }/several keys`, patternHasSeveralSeKeys(pattern, 2, ctx), observable);
    check(`${ label }/sentinel level`, patternLevelKeepsSentinels(pattern, ctx), observable);
    check(`${ label }/retained key`, patternKeepsEffectfulKey(pattern, ctx), observable);
    check(`${ label }/receiver read`, seKeyKeepsReceiverRead({ prop, receiver: path.node.init, ctx }), observable);
    check(`${ label }/prefix`, !!sequencePrefixWithSideEffects(unwrapRuntimeExpr(prop.key), ctx), observable);
    check(`${ label }/key folding has an effects channel`, resolveKey({
      node: prop.key, computed: true, ...ctx, bailOnSideEffectKey: true,
    }), observable ? null : 'flat');
    check(`${ label }/scope answer cannot contaminate structural cache`, computedKeyHasSideEffects(prop), false);
  });
  runBoth(`assignment/${ name }`, `
    const box = { get g() { effect(); return 0; }, quiet: 0 };
    let selected;
    ({ [(box.${ name }, 'flat')]: selected } = Array.prototype);
  `, (parser, program, label) => {
    const host = parser.pickPath(program, 'AssignmentExpression', item => item.node.left.type === 'ObjectPattern');
    const [propPath] = host.get('left').get('properties');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const ctx = { scope: propPath.scope, adapter, path: propPath };
    check(`${ label }/prune preserves key`, consumedAssignmentSlotPrunes(propPath, ctx), !observable);
    check(`${ label }/read plan`, !!destructureKeyReadPlan(propPath, ctx), observable);
  });
  runBoth(`nested/${ name }`, `
    const box = { get g() { effect(); return 0; }, quiet: 0 };
    const { [(box.${ name }, 'methods')]: { flat } } = receiver;
  `, (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ObjectPattern');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const ctx = { scope: path.scope, adapter, path };
    const pattern = path.node.id;
    const [outer] = pattern.properties;
    const [leaf] = outer.value.properties;
    check(`${ label }/hop level`, patternLevelKeepsEffectfulHop(pattern, ctx), observable);
    check(`${ label }/whole host`, patternKeepsEffectfulHop(pattern, ctx), observable);
    check(`${ label }/nested consume`, patternFullyConsumed(pattern, prop => prop === leaf, ctx), !observable);
    check(`${ label }/ordered capture`, !!planNestedKeyedPatternCapture({ pattern, init: path.node.init, ctx }), observable);
  });
}

// A computed key and a default read are evaluation positions on an assignment pattern.
// Neither is a member write: misclassifying them invalidates earlier getter queries too.
runBoth('assignment pattern read positions', `
  const key = { get value() { effect(); return 0; } };
  const fallback = { value: 0 }, receiver = { method: Array };
  const { [(key.value, 'from')]: first } = Array;
  let second;
  ({ [(key.value, 'of')]: second = fallback.value } = Array);
  ({ from: receiver.method } = Array);
`, (parser, program, label) => {
  const census = collectFileCensus(program.node, [mutationShapesReducer()]);
  const writes = census.writtenContainerSlots.keys().map(key => key.replace(/#\d+/u, '')).toArray().sort();
  checkDeep(`${ label }/only actual member target is written`, writes, ['receiver.method']);
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method: 'usage-pure',
    getWrittenContainerSlots: () => census.writtenContainerSlots,
    getContainerSlotIndex: () => census.containerSlotIndex,
  });
  for (const patternPath of parser.collectPaths(program, 'ObjectPattern')) {
    for (const prop of patternPath.node.properties) {
      if (!prop.computed) continue;
      check(`${ label }/getter survives the full-file mutation census`, computedKeyHasSideEffects(prop, {
        scope: patternPath.scope, adapter, path: patternPath,
      }), true);
    }
  }
});

runBoth('a replaced realm slot cannot be demoted into several reads', `
  const methods = globalThis.Array.prototype;
`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method: 'usage-pure', getMutatedStatics: () => new Set(['globalThis.Array']),
  });
  check(`${ label }/unscoped spelling alone misses the getter`, isReReadableSurfaceNav(path.node.init), true);
  check(`${ label }/scoped second read refuses`, isReReadableSurfaceNav(path.node.init, null, {
    ctx: { scope: path.scope, adapter, path },
  }), false);
});

// Transparent type wrappers preserve the namespace proof and the second-read mutation census.
for (const [label, source, builtIn, reReadable, mutated = null] of [
  ['typed root', 'const methods = (globalThis as any).Array.prototype;', true, true],
  ['typed intermediate', 'const methods = (globalThis.Array as any).prototype;', true, true],
  ['typed whole value', 'const methods = (globalThis.Array.prototype as any);', true, true],
  ['typed realm alias', 'const realm = globalThis; const methods = (realm as any).Array.prototype;', true, true],
  ['typed shadow', 'function take(globalThis: object) { const methods = (globalThis as any).Array.prototype; }', false, false],
  ['typed getter', 'const box = { get Array() { return Array; } }; const methods = (box as any).Array.prototype;', false, false],
  ['typed mutable alias', 'let realm = globalThis; realm = other; const methods = (realm as any).Array.prototype;', false, false],
  ['typed unknown global', 'const methods = (globalThis as any).Data.prototype;', true, false],
  ['typed computed nav', 'const methods = (globalThis as any)["Array"].prototype;', false, false],
  ['typed mutated realm slot', 'const methods = (globalThis as any).Array.prototype;', true, false, 'globalThis.Array'],
  ['typed mutated prototype', 'const methods = (globalThis.Array as any).prototype;', true, false, 'Array.prototype'],
  ['typed effectful root', 'const methods = ((before(), globalThis) as any).Array.prototype;', false, false],
  ['typed optional hop', 'const methods = (globalThis as any).window?.Array.prototype;', false, false],
  ['typed sealed optional hop', 'const methods = (globalThis.window?.Array as any).prototype;', false, false],
  ['typed deep sealed hop', 'const methods = ((globalThis.window?.self as any).Array as any).prototype;', false, false],
  ['typed local this', 'function take() { const methods = (this as any).Array.prototype; }', false, false],
  ['typed private receiver', 'class Box { #root = globalThis; read() { const methods = (this.#root as any).Array.prototype; } }', false, false],
]) runBoth(`typed surface nav/${ label }`, source, (parser, program, row) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'methods');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method: 'usage-pure', getMutatedStatics: () => new Set(mutated ? [mutated] : []),
  });
  const ctx = { scope: path.scope, adapter, path };
  const before = JSON.stringify(path.node.init);
  check(`${ row }/namespace value`, isBuiltInSurfaceNav(path.node.init, { ctx }), builtIn);
  check(`${ row }/second read`, isReReadableSurfaceNav(path.node.init, null, { ctx }), reReadable);
  check(`${ row }/source AST retained`, JSON.stringify(path.node.init), before);
});

runBoth('a rescue query preserves unsettled getter return candidates', `
  const box = { get value() { switch (choice) { case 0: return Promise; default: return Math; } } };
`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator');
  const candidates = [];
  const value = findNamespaceMemberValue(path.node.init, 'value', path.scope, { method: 'usage-global' }, resolveKey, {
    spreadVetoes: false, rescuesRead: true, candidateSink: candidates,
  });
  check(`${ label }/no single returned value`, value, null);
  checkDeep(`${ label }/all returns still reach injection`, candidates.map(node => node.name).sort(), ['Math', 'Promise']);
});

finish();
