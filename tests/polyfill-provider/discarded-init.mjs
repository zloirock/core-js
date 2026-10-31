// A consumed initializer keeps its effects and observable reads exactly once, in source order.
// The shared plan borrows those nodes; native bindings own their relocation and insertion.
import {
  consumedInitSink,
  discardedReceiverEffects,
  forInitSESinkParts,
  liveDestructureDefault,
  planDiscardedInit,
  planDiscardedInitPlacement,
  planForInitSink,
} from '../../packages/core-js-polyfill-provider/detect-usage/destructure-plan.js';
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

// A generated guard no longer proves the getter read it replaced. Keep the source decision,
// but borrow the current tree rather than the source nodes captured before child rewrites.
runBoth('deferred whole read', 'const result = (before(), globalThis).Array; const live = (after(), Array) as typeof Array;', (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  const live = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'live').node.init;
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const ctx = { scope: path.scope, path, adapter, resolvePure };
  const source = planDiscardedInit(path.node.init, ctx);
  const sourceFacts = { readWhole: source.effects.length === 1 && source.effects[0] === unwrapRuntimeExpr(path.node.init) };
  check(`${ label }/source proves the whole read`, sourceFacts.readWhole, true);
  const first = planDiscardedInit(path.node.init, ctx, null, sourceFacts);
  check(`${ label }/initial whole source`, first.effects[0], unwrapRuntimeExpr(path.node.init));
  path.node.init = live;
  const before = JSON.stringify(program.node);
  const actual = planDiscardedInit(path.node.init, ctx, null, sourceFacts);
  check(`${ label }/live whole read`, actual.effects[0], unwrapRuntimeExpr(live));
  check(`${ label }/one evaluation`, actual.effects.length, 1);
  check(`${ label }/native relocation`, actual.replay, true);
  check(`${ label }/source unchanged`, JSON.stringify(program.node), before);
  check(`${ label }/negative does not retain dead tail`,
    planDiscardedInit(live, ctx, null, { readWhole: false }).effects[0], unwrapRuntimeExpr(live).expressions[0]);
  const [read] = unwrapRuntimeExpr(live).expressions;
  const probe = { node: read, decision: { consumed: [], retained: [read] }, effects: [read] };
  check(`${ label }/accepted probe owns its read`, planDiscardedInit(live, ctx, probe, sourceFacts).effects.length, 0);
  checkDeep(`${ label }/removed source`, planDiscardedInit(null, ctx, null, sourceFacts), { effects: [], replay: false });
});

runBoth('deferred dropped receiver', `
  const result = (() => globalThis)().self.Array;
  const live = (effect(), _self).Array;
`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  const live = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'live').node.init;
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const ctx = { scope: path.scope, path, adapter, resolvePure };
  const facts = planDiscardedInit(path.node.init, ctx);
  check(`${ label }/source proves the drop`, facts.dropReceiver, true);
  path.node.init = live;
  const before = JSON.stringify(program.node);
  const actual = planDiscardedInit(live, ctx, null, facts);
  const [effect] = unwrapRuntimeExpr(unwrapRuntimeExpr(live).object).expressions;
  checkDeep(`${ label }/only live effects`, actual.effects, [effect]);
  check(`${ label }/no invented read`, actual.replay, false);
  check(`${ label }/same identity`, actual.effects[0], effect);
  check(`${ label }/ignored answer is harmless`, planDiscardedInit(live, ctx, null, facts).effects[0], effect);
  check(`${ label }/source unchanged`, JSON.stringify(program.node), before);
  check(`${ label }/unknown receiver still reads whole`, planDiscardedInit(live, ctx).effects[0], unwrapRuntimeExpr(live));
});

for (const [expression, effects, memo] of [
  ['Array ?? fallback()', [], null],
  ['(effect(), Array) || fallback()', ['effect()'], null],
  ['(() => globalThis)().self.Array', null, 'Array'],
  ['unknown', null, null],
]) {
  const code = `const result = ${ expression };`;
  runBoth(`loop sink/${ expression }`, code, (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const before = JSON.stringify(program.node);
    const actual = planForInitSink(path.node.init, { scope: path.scope, path, adapter, resolvePure });
    checkDeep(`${ label }/effects`, actual.effects?.map(node => code.slice(node.start, node.end)) ?? null, effects);
    check(`${ label }/memo`, actual.memo?.pure?.entry ?? null, memo);
    check(`${ label }/source unchanged`, JSON.stringify(program.node), before);
  });
}

for (const kind of ['instance', 'static', 'global']) {
  runBoth(`leaf default/${ kind }`, 'const { at: result = first(), plain } = receiver; const live = second();', (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator');
    const [prop, plain] = path.node.id.properties;
    const actual = liveDestructureDefault(prop.value, kind);
    check(`${ label }/capture only a reachable default`, actual, kind === 'instance' ? prop.value : null);
    check(`${ label }/plain has no guard`, liveDestructureDefault(plain.value, kind), null);
    if (actual) {
      const live = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'live').node.init;
      prop.value.right = live;
      check(`${ label }/read the current default slot`, actual.right, live);
    }
  });
}

// Host placement is decided before native rendering: one declared receiver slot can
// carry a store, several readers need one leading effect group, and loops cannot lift.
runBoth('effect ownership and placement', 'let held; const result = (effect(), held = Array);', (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  const effects = unwrapRuntimeExpr(path.node.init).expressions;
  const before = JSON.stringify(program.node);
  for (const [facts, expected] of [
    [{}, 'statements'],
    [{ carrier: 'receiver' }, 'value'],
    [{ carrier: null }, 'statements'],
    [{ forInit: true }, 'value'],
    [{ forInit: true, readCount: 2 }, 'sink'],
    [{ carrier: 'receiver', readCount: 2 }, 'statements'],
    [{ carrier: null, forInit: true }, 'sink'],
  ]) {
    const plan = planDiscardedInitPlacement(effects, facts);
    check(`${ label }/${ JSON.stringify(facts) }`, plan.placement, expected);
    check(`${ label }/borrowed effects`, plan.effects, effects);
    check(`${ label }/explicit initializer role`, plan.role, 'initializer');
  }
  check(`${ label }/sole plain prefix`, planDiscardedInitPlacement([effects[0]]).placement, 'value');
  check(`${ label }/nothing to place`, planDiscardedInitPlacement([], { forInit: true, readCount: 2 }).placement, 'none');
  const ctx = { scope: path.scope, path,
    adapter: (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' }) };
  for (const read of [{ readsReceiver: true }, { seCarried: true }]) {
    checkDeep(`${ label }/owned ${ Object.keys(read)[0] }`, planDiscardedInit(path.node.init, ctx, null, null, [read]),
      { effects: [], replay: false });
  }
  check(`${ label }/unowned effects survive`, planDiscardedInit(path.node.init, ctx, null, null, [{}]).effects.length > 0, true);
  check(`${ label }/query preserves source`, JSON.stringify(program.node), before);
});

for (const [expression, expected, writes] of [
  ['held = (effect(), Array)', ['held = (effect(), Array)'], true],
  ['(effect(), held = Array)', ['effect()', 'held = Array'], true],
  ['(held = Array, held.prototype)', ['held = Array'], true],
  ['(held.value = Array, held.other)', ['held.value = Array', 'held'], false],
  ['held.value = (effect(), Array)', ['held.value = (effect(), Array)'], true],
  ['(effect(), Array.prototype)', ['effect()', 'Array'], false],
  ['(effect(), holder[key()])', ['effect()', 'holder[key()]'], false],
]) {
  const source = `let held; const result = ${ expression };`;
  runBoth(`consumed navigation/${ expression }`, source, (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
    const before = JSON.stringify(program.node);
    const plan = consumedInitSink(path.node.init);
    checkDeep(`${ label }/remaining operands`, plan.effects.map(node => source.slice(node.start, node.end)), expected);
    check(`${ label }/whole write`, plan.writes, writes);
    checkDeep(`${ label }/repeatable query`, consumedInitSink(path.node.init), plan);
    check(`${ label }/source is unchanged`, JSON.stringify(program.node), before);
  });
}

for (const [pattern, expression, expected] of [
  ['{ from }', '(effect(), Array)', ['effect()', 'Array']],
  ['[{ from }]', '[(effect(), Array)]', ['effect()', 'Array']],
  ['[[{ from }]]', '(outer(), [[(inner(), Array)]])', ['outer()', 'inner()', 'Array']],
  ['{ from }', 'Array', null],
]) {
  const source = `const ${ pattern } = ${ expression };`;
  runBoth(`header source parts/${ expression }`, source, (parser, program, label) => {
    const declarator = parser.pickPath(program, 'VariableDeclarator').node;
    const before = JSON.stringify(declarator);
    const parts = forInitSESinkParts(declarator, true);
    checkDeep(`${ label }/source parts`, parts ? [...parts.prefix, parts.tail].map(node => source.slice(node.start, node.end)) : null, expected);
    check(`${ label }/ordinary host`, forInitSESinkParts(declarator, false), null);
    check(`${ label }/not a consuming query`, JSON.stringify(declarator), before);
  });
}

runBoth('consumed header roles', 'let held; const result = held = (effect(), Array);', (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const ctx = { scope: path.scope, path, adapter, resolvePure };
  const source = JSON.stringify(path.node);
  for (const reads of [[{ initRidesValue: true }], [{ readsReceiver: true }], [{ readsReceiver: true, sinkKeep: true }]]) {
    check(`${ label }/owned initializer`, planForInitSink(path.node.init, ctx, { reads }).placement, 'none');
  }
  const read = { chain: [{}], sinkKeep: true };
  const sole = planForInitSink(path.node.init, ctx, { reads: [read] });
  check(`${ label }/sole write carrier`, sole.placement, 'value');
  check(`${ label }/write identity`, sole.effects[0], path.node.init);
  const many = planForInitSink(path.node.init, ctx, { reads: [read, read] });
  check(`${ label }/multiple readers`, many.placement, 'sink');
  check(`${ label }/one store`, many.effects.length, 1);
  check(`${ label }/query leaves source intact`, JSON.stringify(path.node), source);
});

finish();
