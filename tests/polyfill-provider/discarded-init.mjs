// A consumed initializer keeps its effects and observable reads exactly once, in source order.
// The shared plan borrows those nodes; native bindings own their relocation and insertion.
import { discardedReceiverEffects, planDiscardedInit } from '../../packages/core-js-polyfill-provider/detect-usage/destructure-plan.js';
import { unwrapRuntimeExpr } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('discarded-init');

function resolvePure({ kind, name }) {
  return kind === 'global' && ['globalThis', 'self', 'Array'].includes(name) ? { entry: name, hintName: name } : null;
}

for (const [expression, expected, replay, dropped = null, prelude = ''] of [
  ['Array', [], false],
  ['0', [], false],
  ['foreign', [], false],
  ['effect()', ['effect()'], true],
  ['(effect(), Array)', ['effect()'], true],
  ['(effect(), (again(), Array))', ['effect()', 'again()'], true],
  ['(effect(), Array) as typeof Array', ['effect()'], true],
  ['(effect(), Array)!', ['effect()'], true],
  ['(effect(), Array) satisfies typeof Array', ['effect()'], true],
  ['Array ?? effect()', [], false],
  ['(effect(), Array) || again()', ['effect()'], false],
  ['foreign ?? effect()', ['foreign ?? effect()'], true],
  ['({ get C() { effect(); return Array; } }).C', ['({ get C() { effect(); return Array; } }).C'], true],
  ['realm().Array', ['realm()'], false, null, 'function realm() { effect(); return globalThis; }'],
  ['realm().Array', [], false, null, 'const realm = () => globalThis;'],
  ['(effect(), realm().Array)', ['effect()'], false, null, 'const realm = () => globalThis;'],
  ['realm().self.Array', ['realm()'], false, ['realm()'], 'function realm() { effect(); return globalThis; }'],
  ['(held = globalThis).Array', ['held = globalThis'], false, ['held = globalThis']],
  ['(held = globalThis.window).Array', ['(held = globalThis.window).Array'], true],
  ['(held = (effect(), globalThis)).Array', ['held = (effect(), globalThis)'], false, ['held = (effect(), globalThis)']],
  ['(effect(), held = globalThis)', ['effect(), held = globalThis'], true],
  ['globalThis[(effect(), "self")].Array', ['effect()'], false, ['effect()']],
  ['globalThis[(first(), "self")][(second(), "Array")]', ['first()', 'second()'], false, ['first()', 'second()']],
  ['(effect(), foreign).C', ['(effect(), foreign).C'], true],
  ['(effect(), globalThis).Array', ['(effect(), globalThis).Array'], true],
  ['(effect(), { C: [] })', ['effect()'], true],
  ['(0, effect())', ['effect()'], true],
]) {
  const code = `${ prelude } let held; const result = ${ expression };`;
  runBoth(expression, code, (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const ctx = { scope: path.scope, path, adapter, resolvePure };
    const before = JSON.stringify(program.node);
    const first = planDiscardedInit(path.node.init, ctx);
    planDiscardedInit(path.node.init, ctx); // An ignored query cannot change the next decision.
    const actual = planDiscardedInit(path.node.init, ctx);
    checkDeep(`${ label }/effects`, actual.effects.map(node => code.slice(node.start, node.end)), expected);
    check(`${ label }/relocation`, actual.replay, replay);
    checkDeep(`${ label }/drop`, discardedReceiverEffects(path.node.init, ctx)?.map(node => code.slice(node.start, node.end)) ?? null, dropped);
    check(`${ label }/same source identities`, actual.effects.every((node, index) => node === first.effects[index]), true);
    check(`${ label }/source unchanged`, JSON.stringify(program.node), before);
  });
}

for (const expression of ['(first(), second())', '(first(), held = foreign)']) {
  runBoth(`whole sequence/${ expression }`, `let held; const result = ${ expression };`, (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const source = unwrapRuntimeExpr(path.node.init);
    const plan = planDiscardedInit(path.node.init, { scope: path.scope, path, adapter, resolvePure });
    check(`${ label }/one unchanged value`, plan.effects.length, 1);
    check(`${ label }/whole source identity`, plan.effects[0], source);
    check(`${ label }/relocation`, plan.replay, true);
  });
}

runBoth('probe ownership', 'const result = (before(), read(key()), after());', (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator');
  const [before, read, after] = unwrapRuntimeExpr(path.node.init).expressions;
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const ctx = { scope: path.scope, path, adapter, resolvePure };
  const probe = { node: read, decision: { consumed: [before], retained: [read], navStart: read.start }, effects: [before, read.arguments[0], after] };
  const source = JSON.stringify(program.node);
  const actual = planDiscardedInit(path.node.init, ctx, probe);
  check(`${ label }/only unowned effect`, actual.effects.length, 1);
  check(`${ label }/source identity`, actual.effects[0], after);
  check(`${ label }/captured ownership`, actual.replay, false);
  check(`${ label }/source unchanged`, JSON.stringify(program.node), source);
  checkDeep(`${ label }/empty input`, planDiscardedInit(null, ctx), { effects: [], replay: false });
});

finish();
