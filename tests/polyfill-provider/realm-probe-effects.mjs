// Probe ownership and key purity must not depend on emitter traversal order.
import {
  carriesRealmAlias,
  createOuterCollapsePlanner,
  directClaimProbePlan,
  destructureProbePlan,
  discardRescueNodes,
  effectfulClaimReadProbe,
  effectfulRealmHop,
  foldableRealmHop,
  resolveKey,
  terminalNavCollapsePlan,
} from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { escapedCtorReferencesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';
import {
  classMayReplaceInstance, collectFileCensus, markRenderedProbeRead, memberKeepsReceiverThrow, unwrapRuntimeExpr, walkAstNodes,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, runBoth, finish } = createChecker('realm-probe-effects');
function context(parser, path, method = 'usage-pure') {
  return { path, scope: path.scope,
    adapter: (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method }) };
}
function resolvePure({ name }) {
  return ['globalThis', 'self', 'Promise'].includes(name) ? { entry: name, hintName: name } : null;
}
for (const [expression, keepsThrow, effectfulHop] of [
  ['globalThis.self', true, false],
  ['globalThis["self"]', true, false],
  ['globalThis?.self', false, false],
  ['globalThis[key]', false, false],
  ['globalThis[(touch(), key)]', false, true],
  ['globalThis?.[(touch(), "window")]', false, true],
  ['globalThis[(touch(), "user")]', false, false],
  ['globalThis()', false, false],
]) runBoth(`realm member/${ expression }`, `const key = "self"; const value = ${ expression };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value').get('init');
  const node = unwrapRuntimeExpr(path.node);
  check(`${ label }/retains receiver throw`, memberKeepsReceiverThrow(node), keepsThrow);
  check(`${ label }/effectful realm key`, effectfulRealmHop(node, context(parser, path)), effectfulHop);
});
for (const [value, expected] of [
  ['held = globalThis.self', true], ['held = globalThis["self"]', true],
  ['held = globalThis', false], ['held = globalThis.user', false],
  ['held = globalThis.user.self', false], ['held = local', false],
  ['(effect(), globalThis.self)', false],
  ['(effect(), held = globalThis.self)', true],
]) runBoth(`carried realm/${ value }`, `let held; const value = ${ value };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value');
  const before = JSON.stringify(path.node);
  check(label, carriesRealmAlias(path.node.init, context(parser, path)), expected);
  check(`${ label }/speculation`, JSON.stringify(path.node), before);
});
for (const source of [
  'function f(globalThis) { let held; const value = (held = globalThis.self); }',
  'globalThis.self = user; let held; const value = (held = globalThis.self);',
]) runBoth('unproven carried realm', source, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value');
  const ctx = context(parser, path);
  // Mutation facts come from the file census, outside this decision's contract.
  if (source.startsWith('globalThis.self =')) ctx.adapter.isMutatedStatic = (owner, key) => owner === 'globalThis' && key === 'self';
  check(label, carriesRealmAlias(path.node.init, ctx), false);
});
for (const body of [
  '(effect(), globalThis).window.Promise',
  '(held = globalThis.self).window.Promise',
]) runBoth(`discarded read/${ body }`, `let held; const value = ${ body };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value');
  const ctx = context(parser, path);
  const before = JSON.stringify(path.node);
  const effects = discardRescueNodes({ node: path.node.init, ...ctx });
  const pattern = destructureProbePlan(path.node.init, resolvePure, ctx);
  const read = effectfulClaimReadProbe(path.node.init, effects, resolvePure, ctx);
  check(`${ label }/pattern keeps read`, pattern?.kind, 'read');
  check(`${ label }/same source owner`, pattern?.retained[0], read?.retained[0]);
  check(`${ label }/speculation`, JSON.stringify(path.node), before);
});
runBoth('nested prefix ownership', 'const value = (first(), (second(), globalThis.window))?.Promise;',
  (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator');
    const ctx = context(parser, path);
    check(`${ label }/no plain reader above the optional`, directClaimProbePlan(path.node.init, resolvePure, ctx), null);
    const plan = destructureProbePlan(path.node.init, resolvePure, ctx);
    checkDeep(`${ label }/prefix`, plan.prefix.map(node => node.callee.name), ['first', 'second']);
    check(`${ label }/no prefix in live-only arm`, plan.alternateEffects.length, 0);
  });
runBoth('alias prefix boundary', 'const held = globalThis.window; const value = ((before(), held).Promise).resolve;',
  (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value');
    const probe = directClaimProbePlan(path.node.init, resolvePure, context(parser, path));
    const held = parser.collectPaths(program, 'Identifier').find(item => item.node.name === 'held' && item.node.start > path.node.start).node;
    check(`${ label }/holder starts after prefix`, probe.navStart, held.start);
  });
for (const method of ['usage-global', 'usage-pure']) for (const [setup, call, quiet] of [
  ['function key() { return "self"; }', 'key()', true],
  ['const key = value => value;', 'key("self")', true],
  ['function key() { effect(); return "self"; }', 'key()', false],
  ['const key = value => value;', 'key((effect(), "self"))', false],
  ['let key = () => "self"; key = user;', 'key()', false],
]) runBoth(`key/${ method }/${ setup }/${ call }`, `${ setup } const value = globalThis[${ call }];`,
  (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value');
    const ctx = context(parser, path, method);
    for (const keepsKeyNode of [false, true]) check(`${ label }/kept=${ keepsKeyNode }`,
      resolveKey({ node: path.node.init.property, computed: true, ...ctx, bailOnSideEffectKey: true, keepsKeyNode }), quiet ? 'self' : null);
  });
for (const key of ['window', '["window"]', '[(effect(), "window")]']) {
  runBoth(`terminal fold/${ key }`, `const value = globalThis${ key.startsWith('[') ? '' : '.' }${ key };`,
    (parser, program, label) => {
      const path = parser.pickPath(program, 'VariableDeclarator');
      const node = unwrapRuntimeExpr(path.node.init);
      const plan = { collapseIdx: -1, hops: [{ node }], resolvePure };
      check(label, terminalNavCollapsePlan(plan, { node, consumer: null }).collapseIdx, key.includes('effect') ? -1 : 0);
    });
}
runBoth('accepted probe owns its spine', 'const value = globalThis.window;', (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator');
  const node = unwrapRuntimeExpr(path.node.init);
  check(`${ label }/control`, createOuterCollapsePlanner({ resolvePure }).step({ kind: 'member', node, keyName: 'window' }), true);
  check(`${ label }/fold control`, foldableRealmHop(node, { ...context(parser, path), resolvePure }), true);
  markRenderedProbeRead(node);
  check(`${ label }/owned fold`, foldableRealmHop(node, { ...context(parser, path), resolvePure }), false);
  check(`${ label }/owned read`, createOuterCollapsePlanner({ resolvePure }).step({ kind: 'member', node, keyName: 'window' }), false);
  check(`${ label }/store below owned read`, createOuterCollapsePlanner({ resolvePure }).canCrossWrite({ reader: node, readerHop: true }), false);
});
for (const [entry, argIndex] of [
  ['function/instance/name', 0], ['function/instance/name', 1], ['promise/resolve', 0],
]) runBoth(`argument read/${ entry }/${ argIndex }`,
  `import dispatch from "@core-js/pure/actual/${ entry }";
   const value = dispatch(${ argIndex ? 'null, ' : '' }(effect(), globalThis).window.Promise);`, (parser, program, label) => {
    const path = parser.pickPath(program, 'MemberExpression', item => item.node.property.name === 'Promise');
    check(label, effectfulClaimReadProbe(path.node, null, resolvePure, context(parser, path))?.kind, 'read');
  });
for (const [source, expected] of [
  ['(effect(), globalThis.self)', undefined], ['(held = (effect(), globalThis.self))', 'read'],
]) runBoth(`backed navigation versus store/${ source }`,
  `import dispatch from "@core-js/pure/actual/function/instance/name"; let held; const value = dispatch(${ source }.window.Promise);`,
  (parser, program, label) => {
    const path = parser.pickPath(program, 'MemberExpression', item => item.node.property.name === 'Promise');
    check(label, effectfulClaimReadProbe(path.node, null, resolvePure, context(parser, path))?.kind, expected);
  });
for (const [key, retains] of [
  ['(effect(), "self")', true], ['(effect(), key)', true], ['"self"', false],
  ['(effect(), "other")', false], ['effect()', false],
]) runBoth(`native receiver/${ key }`, `const key = "self";
  const tracked = globalThis.self, other = globalThis.self; tracked?.[${ key }];`, (parser, program, label) => {
  function init(name) {
    return parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === name).node.init;
  }
  for (const preserveRealmReads of [true, false]) {
    const { nativeRealmReads } = collectFileCensus(program.node, [escapedCtorReferencesReducer({ preserveRealmReads })]);
    check(`${ label }/${ preserveRealmReads }/source`, !!nativeRealmReads?.(init('tracked')), preserveRealmReads && retains);
    check(`${ label }/${ preserveRealmReads }/independent`, !!nativeRealmReads?.(init('other')), false);
  }
});
for (const [test, retains] of [
  ['(void s, flag)', false], ['inspect(s)', false], ['typeof s', false],
  ['s && false', false], ['(inspect(), true) || s', false], ['flag && s', true],
  ['(inspect(), !s)', true], ['null === s', true], ['typeof s === "undefined"', true],
]) runBoth(`tested receiver/${ test }`, `function f(flag) {
  const s = globalThis.self; if (${ test }) return; return s[(effect(), "self")]; }`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator');
  const { nativeRealmReads } = collectFileCensus(program.node, [escapedCtorReferencesReducer({ preserveRealmReads: true })]);
  check(label, !!nativeRealmReads?.(path.node.init), retains);
});
for (const [base, retains] of [['globalThis', true], ['globalThis.window', false]]) {
  runBoth(`optional self above ${ base }`, `const s = ${ base }?.self; s?.[(effect(), "self")];`, (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator');
    const { nativeRealmReads } = collectFileCensus(program.node, [escapedCtorReferencesReducer({ preserveRealmReads: true })]);
    check(label, !!nativeRealmReads?.(unwrapRuntimeExpr(path.node.init)), retains);
  });
}
for (const [body, replaces] of [
  ['', false], ['constructor() { super(); return this; }', false], ['constructor() { return {}; }', true],
]) runBoth(`construction/${ body }`, `class Bag extends Map { ${ body } }`, (parser, program, label) => {
  check(label, classMayReplaceInstance(program.node.body[0]), replaces);
});
runBoth('borrowed prototype receiver', `const C = Map;
  let value = new Map(); const before = value;
  value = new Map();
  const lookup = Map.prototype.has;
  C.prototype.has.call(value, 1);
  lookup.call(value, 2);
  before instanceof Map;
  value instanceof Map;
  Map.groupBy([3], x => x);`, (parser, program, label) => {
  const seed = program.node.body[0].declarations[0].init;
  const constructions = parser.collectPaths(program, 'NewExpression').map(p => p.node.callee);
  const tests = parser.collectPaths(program, 'BinaryExpression').map(p => p.node.right);
  const lookup = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'lookup').node.init;
  const independent = parser.pickPath(program, 'MemberExpression', item => item.node.property.name === 'groupBy').node.object;
  for (const preserveRealmReads of [true, false]) for (const disabled of [true, false]) {
    const isOptedOut = disabled ? node => node === seed : null;
    const { nativeRealmReads } = collectFileCensus(program.node, [escapedCtorReferencesReducer({ preserveRealmReads, isOptedOut })]);
    const kept = preserveRealmReads && disabled;
    checkDeep(`${ label }/pure=${ preserveRealmReads }/disabled=${ disabled }`,
      [seed, ...constructions, lookup, ...tests, independent].map(node => !!nativeRealmReads?.(node)),
      [kept, false, kept, kept, false, kept, false]);
  }
});
for (const [name, observer, kept, family = 'Map'] of [
  ['instanceof', 'm instanceof Map', true],
  ['callback', '[m].every(x => x instanceof Map)', false],
  ['pair', '[m, Map]', false],
  ['argument', 'external(m, Map)', false],
  ['returned-mutator', '[m.set(1, 2), Map]', false],
  ['unknown-mutator', '(m.add(1), m instanceof Map)', false],
  ['unknown-set-mutator', '(m.set(1, 2), m instanceof Set)', false, 'Set'],
  ['unknown-static', '(D.groupBy([]), m instanceof Set)', false, 'Set'],
  ['known-static', '(D.groupBy([], x => x), m instanceof Map)', true],
  ['unknown-prototype-method', 'external.isPrototypeOf.call(Map.prototype, m)', false],
  ['unknown-has-instance', 'external[Symbol.hasInstance].call(Map, m)', false],
  ['known-prototype-method', 'Object.prototype.isPrototypeOf.call(Map.prototype, m)', true],
  ['stored', 'globalThis.holder = m', false],
]) runBoth(`borrowed receiver consumer/${ name }`, `function read(probe) {
  const C = ${ family }; const D = ${ family }; const m = new D(); if (probe) C.prototype.has.call(m, 1); return ${ observer };
}`, (parser, program, label) => {
  const [alias, active] = program.node.body[0].body.body;
  const { nativeRealmReads } = collectFileCensus(program.node, [escapedCtorReferencesReducer({
    preserveRealmReads: true, isOptedOut: node => node === alias.declarations[0].init,
  })]);
  check(label, !!nativeRealmReads?.(active.declarations[0].init), kept);
});
// A native borrow may change a construction only if all uses of every linked value are visible.
for (const [name, body, expected] of [
  ['shared observer', 'const a = new Map(), b = new Map(), D = Map; C.prototype.has.call(a, 1); return [a instanceof D, b instanceof D];', [true, true]],
  ['open peer', 'const a = new Map(), b = new Map(), D = Map; C.prototype.has.call(a, 1); save(b); return [a instanceof D, b instanceof D];', [false, false]],
  ['closed factory', 'function make() { return new Map(); } return C.prototype.has.call(make(), 1);', [true]],
  ['open factory result', 'function make() { return new Map(); } save(make()); return C.prototype.has.call(make(), 1);', [false]],
  ['handed out factory', 'function make() { return new Map(); } save(make); return C.prototype.has.call(make(), 1);', [false]],
  ['closed formal', 'function read(m) { return C.prototype.has.call(m, 1); } return read(new Map());', [true]],
  ['open formal', 'function read(m) { C.prototype.has.call(m, 1); return [m, Map]; } return read(new Map());', [false]],
  ['handed out reader', 'function read(m) { return C.prototype.has.call(m, 1); } save(read); return read(new Map());', [false]],
  ['arguments', 'function read(m) { save(arguments); return C.prototype.has.call(m, 1); } return read(new Map());', [false]],
  ['closed holder', 'const box = { m: new Map(), has: C.prototype.has }; return box.has.call(box.m, 1);', [true]],
  ['handed out holder', 'const box = { m: new Map(), has: C.prototype.has }; save(box); return box.has.call(box.m, 1);', [false]],
  ['getter on holder', 'const box = { m: new Map(), get x() { save(this); } }; void box.x; return C.prototype.has.call(box.m, 1);', [false]],
  ['iterator', 'const m = new Map(); return C.prototype[Symbol.iterator].call(m).next();', [true]],
  ['shadowed symbol', 'const Symbol = { iterator: "user" }; const m = new Map(); return C.prototype[Symbol.iterator].call(m);', [false]],
  ['changed iterator', 'C.prototype[Symbol.iterator] = external; return C.prototype[Symbol.iterator].call(new Map());', [false]],
  ['escaped peer method', `const a = new Map(), b = new Map(), get = Map.prototype.get;
    C.prototype.has.call(a, 1); get.call(a, 1); get.call(b, 1); return [b, Map];`, [false, false]],
  ['open result of copy', 'const box = { m: new Map() }; const alias = box; save(alias.m); return C.prototype.has.call(box.m, 1);', [false]],
  ['opaque factory arm', 'function make(flag) { return flag ? new Map() : external; } return C.prototype.has.call(make(save()), 1);', [false]],
  ['iterator through unknown', 'const m = new Map(); save(m); return C.prototype[Symbol.iterator].call(m);', [false]],
  ['changed method', 'Object.defineProperty(C.prototype, "has", { get() { return external; } }); return C.prototype.has.call(new Map(), 1);', [false]],
  ['known observer', `Object.defineProperty(C.prototype, 'has', { get() { return function () { return this instanceof C; }; } });
    return C.prototype.has.call(new Map());`, [true]],
  ['map get with unknown result type', 'return C.prototype.get.call(new Map(), 1);', [true]],
  ['second use of this escapes', `Object.defineProperty(C.prototype, 'has', { get() {
    return function () { return (this instanceof C) + this; };
  } }); return C.prototype.has.call(new Map());`, [false]],
  ['unknown descriptor', "Object.defineProperty(C.prototype, 'has', external); return C.prototype.has.call(new Map());", [false]],
  ['instance hook', `Object.defineProperty(C, Symbol.hasInstance, { value: external });
    const m = new Map(); C.prototype.has.call(m); return m instanceof C;`, [false]],
  ['separate dynamic slot', 'const box = {}; box[external] = 1; const m = new Map(); C.prototype.has.call(m); return m instanceof C;', [true]],
  ['reassigned separate slot', `let box = {}; Object.defineProperty(box, external, { get() { box = {}; return 1; } });
    const m = new Map(); C.prototype.has.call(m); return m instanceof C;`, [true]],
  ['numeric loop index', `function fill(box) { for (let i = 0; i < 3; i++) box[i] = external; } save(fill);
    const m = new Map(); C.prototype.has.call(m); return m instanceof C;`, [true]],
  ['possibly symbolic index', `let key = 0; if (save()) key = Symbol.hasInstance; C[key] = external;
    const m = new Map(); C.prototype.has.call(m); return m instanceof C;`, [false]],
  ['open default index', `function install(key = 0) { C[key] = external; } save(install);
    const m = new Map(); C.prototype.has.call(m); return m instanceof C;`, [false]],
  ['possibly shared slot', `let box = {}; if (save()) box = C; Object.defineProperty(box, external, { value: save });
    const m = new Map(); C.prototype.has.call(m); return m instanceof C;`, [false]],
  ['open default target', `function install(box = {}) { Object.defineProperty(box, external, { value: save }); }
    save(install); const m = new Map(); C.prototype.has.call(m); return m instanceof C;`, [false]],
  ['published receiver', `Object.defineProperty(C.prototype, 'has', { value: function () { return save(this); } });
    return C.prototype.has.call(new Map());`, [false]],
  ['intervening call', `Object.defineProperty(C.prototype, 'has', { value: function () { return this instanceof C; } });
    save(); return C.prototype.has.call(new Map());`, [false]],
]) runBoth(`borrowed collection flow/${ name }`, `function test(save, external) { const C = Map; ${ body } }`, (parser, program, label) => {
  const root = program.node;
  const disabled = root.body[0].body.body[0].declarations[0].init;
  const { nativeRealmReads } = collectFileCensus(root, [escapedCtorReferencesReducer({
    preserveRealmReads: true, isOptedOut: node => node === disabled,
  })]);
  const actual = [];
  walkAstNodes({ root, visit(node) {
    if (node.type === 'NewExpression') actual.push(!!nativeRealmReads?.(node.callee));
  } });
  checkDeep(label, actual, expected);
});
// Flat source with many local copies must not consume the JavaScript call stack.
const copies = Array.from({ length: 2500 }, (_, i) => `const m${ i + 1 } = m${ i };`).join('\n');
for (const [name, last, kept] of [['closed', 'm2500 instanceof Map', true], ['open', '[m2500, Map]', false]]) {
  runBoth(`borrowed receiver copies/${ name }`, `function read() { const C = Map; const m0 = new Map();
    ${ copies } C.prototype.has.call(m0, 1); return ${ last }; }`, (parser, program, label) => {
    const [alias, instance] = program.node.body[0].body.body;
    const { nativeRealmReads } = collectFileCensus(program.node, [escapedCtorReferencesReducer({
      preserveRealmReads: true, isOptedOut: node => node === alias.declarations[0].init,
    })]);
    check(label, !!nativeRealmReads?.(instance.declarations[0].init.callee), kept);
  });
}
runBoth('guard on a reused program', 'function read() { const s = globalThis.self; if (s) { s[(effect(), "self")]; } }',
  (parser, program, label) => {
    const { body } = program.node.body[0].body;
    const arm = body[1].consequent.body;
    for (const stage of ['original', 'cloned', 'moved']) {
      if (stage === 'cloned') arm[0] = structuredClone(arm[0]);
      else if (stage === 'moved') body.push(arm.pop());
      const { nativeRealmReads } = collectFileCensus(program.node, [escapedCtorReferencesReducer({ preserveRealmReads: true })]);
      check(`${ label }/${ stage }`, !!nativeRealmReads?.(body[0].declarations[0].init), stage !== 'moved');
    }
  });
finish();
