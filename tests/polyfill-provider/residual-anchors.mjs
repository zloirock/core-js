import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { planResidualAnchorHop, residualAnchorSurface } from '../../packages/core-js-polyfill-provider/detect-usage/destructure-plan.js';
import { buildNestedParamSynthPlan } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { markRenderedStoredValue, peelTransparentExpr } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { cloneNode, identifier, renderResidualAnchor, renderResidualAnchorInit } from '../../packages/core-js-polyfill-provider/render.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('residual-anchors');
function resolveGlobalPolyfill(name) {
  return name === 'Map' ? { entry: 'actual/map/constructor', hintName: 'Map' }
    : name === 'globalThis' ? { entry: 'actual/global-this', hintName: 'globalThis' } : null;
}
function makeAdapter(parser, mutations = []) {
  return (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method: 'usage-pure', getMutatedStatics: () => new Set(mutations), isEntryAvailable: () => true,
  });
}

for (const [name, pattern, extra, expected] of [
  ['constructor', '{ Map: { name } }', {}, 'ctor:Map:pure'],
  ['pristine proxy', '{ self: { name } }', {}, 'proxy:self:member'],
  ['guarded constructor', '{ Map: { name } }', { guarded: true, sourceAnchor: 'Map' }, 'ctor:Map:member'],
  ['guarded proxy', '{ self: { name } }', { guarded: true }, null],
  ['member whole host', '{ Array: { name } }', { sourceAnchor: 'Array' }, 'ctor:Array:member'],
  ['other source anchor', '{ Array: { name } }', { sourceAnchor: 'self' }, null],
  ['untouched member', '{ Array: { name } }', {}, null],
  ['user sentinel spelling', '{ Array: { name: _unused } }', {}, null],
  ['explicit consumed leaf', '{ Array: { name: consumed } }', { isConsumedProp: () => true }, 'ctor:Array:member'],
  ['live leaf default', '{ Array: { name = [].at(0) } }', {}, 'ctor:Array:member'],
  ['inert leaf default', '{ Array: { name = "x" } }', {}, null],
  ['unknown hop default', '{ Unknown: { name } = Array }', { sourceAnchor: 'Unknown' }, null],
  ['disabled hop', '{ Map: { name } }', { isDisabledProp: prop => prop.key.name === 'Map' }, null],
  ['disabled leaf', '{ Map: { name } }', { isDisabledProp: prop => prop.key.name === 'name' }, null],
  ['rest residual', '{ Map: { name, ...rest } }', {}, null],
  ['empty inner', '{ Map: {} }', {}, null],
  ['sibling hop', '{ Map: { name }, Array: { from } }', {}, null],
  ['unknown computed key', '{ [key]: { name } }', {}, null],
]) runBoth(name, `const ${ pattern } = globalThis;`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator');
  const adapter = makeAdapter(parser);
  const before = JSON.stringify(path.node);
  const product = planResidualAnchorHop({ pattern: path.node.id, receiver: 'globalThis', adapter, path,
    resolveGlobalPolyfill, ...extra });
  check(label, product ? `${ product.kind }:${ product.key }:${ product.pure ? 'pure' : 'member' }` : null, expected);
  check(`${ label }/query preserves source`, JSON.stringify(path.node), before);
  if (product) check(`${ label }/live pattern identity`, product.pattern, path.node.id.properties[0].value);
});

runBoth('mutation phase', 'const { Map: { name } } = globalThis;', (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator');
  const adapter = makeAdapter(parser, ['globalThis.Map']);
  const options = { pattern: path.node.id, receiver: 'globalThis', adapter, path, resolveGlobalPolyfill };
  check(`${ label }/residual cannot invent mutation permission`, planResidualAnchorHop(options), null);
  for (const extra of [{ phase: 'source' }, { sourceAnchor: 'Map' }]) {
    const product = planResidualAnchorHop({ ...options, ...extra });
    check(`${ label }/raw member`, product?.pure, null);
    check(`${ label }/mutation observed`, product?.mutated, true);
  }
});

for (const [name, source, expected] of [
  ['bare', 'const { Map: { name } } = globalThis;', 'ident'],
  ['prefix', 'const { Map: { name } } = (effect(), globalThis);', 'seq'],
  ['store', 'let held; const { Map: { name } } = (held = globalThis);', 'assign'],
  ['stored prefix', 'let held; const { Map: { name } } = (held = (effect(), globalThis));', 'assign'],
  ['prefix before store stays raw', 'let held; const { Map: { name } } = (effect(), held = globalThis);', null],
  ['source conditional', 'const { Map: { name } } = test() ? void 0 : globalThis;', null],
  ['shadowed root', 'function read(globalThis) { const { Map: { name } } = globalThis; }', null],
]) runBoth(name, source, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', p => p.node.id.type === 'ObjectPattern');
  const adapter = makeAdapter(parser);
  const before = JSON.stringify(path.node.init);
  const surface = residualAnchorSurface(path.node.init, { adapter, path, resolveGlobalPolyfill });
  check(label, surface?.shape ?? null, expected);
  check(`${ label }/query does not rewrite`, JSON.stringify(path.node.init), before);
  if (surface) {
    const output = renderResidualAnchorInit(path.node.init, surface, identifier('anchor'), { injectImport: () => 'root' });
    if (expected === 'assign') checkDeep(`${ label }/store precedes anchor`, output.expressions.map(n => n.type), ['AssignmentExpression', 'Identifier']);
    else if (expected === 'seq') check(`${ label }/source effect remains first`, output.expressions[0].callee.name, 'effect');
  }
});

runBoth('guard provenance', 'const { Map: { name } } = test() ? void 0 : globalThis;', (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator');
  const adapter = makeAdapter(parser);
  const options = { adapter, path, resolveGlobalPolyfill };
  check(`${ label }/source shape is not proof`, residualAnchorSurface(path.node.init, options), null);
  markRenderedStoredValue(path.node.init);
  const surface = residualAnchorSurface(path.node.init, options);
  check(`${ label }/rendered guard is explicit`, surface?.shape, 'guard');
  check(`${ label }/guard source identity`, surface?.tail, path.node.init);
  check(`${ label }/clone does not inherit a phase role`, residualAnchorSurface(cloneNode(path.node.init), options), null);
  let imports = 0;
  const rendered = renderResidualAnchor({ anchor: 'Map', anchorPure: resolveGlobalPolyfill('Map'), guarded: surface.tail }, {
    injectImport: () => { imports++; return 'Map'; },
  });
  check(`${ label }/guarded anchor registers no constructor`, imports, 0);
  check(`${ label }/guard stays before the member read`, rendered.object.type, 'ConditionalExpression');
  check(`${ label }/source is cloned on apply`, rendered.object === surface.tail, false);
  check(`${ label }/member key`, rendered.property.name, 'Map');
});

for (const [name, setup, init, expected] of [
  ['alias', 'const realm = globalThis.window;', 'realm.self', true],
  ['stored alias', 'let held;', '(held = globalThis.window).self', true],
  ['prefix', 'const realm = globalThis.window;', '(effect(), realm.self)', true],
  ['computed', 'const realm = globalThis.window;', 'realm["self"]', true],
  ['shadowed', 'const globalThis = foreign; const realm = globalThis.window;', 'realm.self', false],
  ['written holder stays guarded', 'let realm = globalThis.window; realm = foreign;', 'realm.self', true],
  ['foreign source', 'const realm = foreign;', 'realm.self', false],
  ['guarded alias', 'const realm = globalThis.window;', 'realm?.self', false],
  ['plain value', '', 'globalThis', false],
]) runBoth(`alias receiver/${ name }`, `export {}; ${ setup } const { Map: { prototype: proto } } = ${ init };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', p => p.node.id.type === 'ObjectPattern');
  const adapter = makeAdapter(parser);
  const before = JSON.stringify(path.node);
  const surface = residualAnchorSurface(path.node.init, { adapter, path, resolveGlobalPolyfill });
  check(`${ label }/initializer role`, surface?.probe?.kind === 'alias', expected);
  check(`${ label }/query preserves the source host`, JSON.stringify(path.node), before);
  if (!expected) return;
  check(`${ label }/whole receiver stays guarded`, surface.tail, peelTransparentExpr(path.node.init));
  const product = planResidualAnchorHop({
    pattern: path.node.id, receiver: 'globalThis', adapter, path, resolveGlobalPolyfill,
    guarded: true, guardedValue: surface.tail, probe: surface.probe, phase: 'source',
    resolvePure: meta => {
      const key = meta.kind === 'global' ? meta.name : meta.placement === 'static' ? meta.key : null;
      const pure = key === 'self' ? { entry: 'actual/self', hintName: 'self' } : resolveGlobalPolyfill(key);
      return pure ? { ...pure, kind: 'global' } : null;
    },
  });
  check(`${ label }/anchor reads the constructor`, product.key, 'Map');
  check(`${ label }/constructor identity entry`, product.narrow?.branches[0].staticPure.entry, 'actual/map/constructor');
  check(`${ label }/probe identity entry`, product.probe.narrow?.branches[0].staticPure.entry, 'actual/self');
  check(`${ label }/probe capture is a source value`, !!product.probe.capture?.source, true);
  check(`${ label }/planning remains speculative`, JSON.stringify(path.node), before);
});

for (const body of ['return globalThis;', 'effect(); return globalThis;']) {
  runBoth('stored proven call', `function realm() { ${ body } } let held; const { Map: { missing } } = (held = realm());`, (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', p => p.node.id.type === 'ObjectPattern');
    const surface = residualAnchorSurface(path.node.init, { adapter: makeAdapter(parser), path, resolveGlobalPolyfill });
    check(`${ label }/store is not a droppable call prefix`, surface?.shape, 'assign');
    const rendered = renderResidualAnchorInit(path.node.init, surface, identifier('anchor'), { injectImport: () => 'root' });
    check(`${ label }/whole store runs before anchor`, rendered.expressions?.[0], peelTransparentExpr(path.node.init));
    check(`${ label }/call runs once`, JSON.stringify(rendered).match(/"name":"realm"/g)?.length, 1);
  });
}

for (const [name, init, prefix] of [
  ['plain', 'test() ? void 0 : globalThis', 0],
  ['prefix', '(effect(), test() ? void 0 : globalThis)', 1],
  ['stored', '(held = test() ? void 0 : globalThis)', 0],
  ['stored prefix', '(held = (effect(), test() ? void 0 : globalThis))', 0],
]) runBoth(`guarded constructor/${ name }`, `let held; const { Map: { missing } } = ${ init };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', p => p.node.id.type === 'ObjectPattern');
  const guard = parser.pickPath(program, 'ConditionalExpression');
  const adapter = makeAdapter(parser);
  markRenderedStoredValue(guard.node);
  const surface = residualAnchorSurface(path.node.init, { adapter, path, resolveGlobalPolyfill });
  check(`${ label }/guard role reaches through the source host`, surface?.shape, 'guard');
  check(`${ label }/whole receiver remains live`, surface?.tail, peelTransparentExpr(path.node.init));
  const before = JSON.stringify(path.node);
  const options = {
    pattern: path.node.id, receiver: 'globalThis', adapter, path,
    resolveGlobalPolyfill, guarded: true, guardedValue: surface.tail, sourceAnchor: 'Map',
    resolvePure: meta => {
      const pure = meta.kind === 'global' ? resolveGlobalPolyfill(meta.name)
        : meta.object === 'globalThis' && meta.key === 'Map' ? resolveGlobalPolyfill('Map') : null;
      return pure ? { ...pure, kind: 'global' } : null;
    },
  };
  const product = planResidualAnchorHop(options);
  check(`${ label }/one realm identity branch`, product.narrow?.branches.length, 1);
  check(`${ label }/constructor served after the guard`, product.narrow?.branches[0].staticPure.entry, 'actual/map/constructor');
  check(`${ label }/prefix before capture`, product.prefix.length, prefix);
  check(`${ label }/query preserves source`, JSON.stringify(path.node), before);
  let captures = 0;
  const rendered = renderResidualAnchor({ anchor: product.key, narrow: product.narrow, prefix: product.prefix }, {
    injectImport: (_entry, hint) => `_${ hint }`, mintRef: () => { captures++; return 'captured'; },
    cloneHost: (node, role) => role === 'prefix' ? node : cloneNode(node),
  });
  check(`${ label }/one receiver capture`, captures, 1);
  check(`${ label }/capture follows source prefix`, rendered.expressions[prefix].left.name, 'captured');
  check(`${ label }/nullish value falls through to its throwing read`, rendered.expressions.at(-1).alternate.object.name, 'captured');
  if (prefix) check(`${ label }/prefix keeps its native queued children`, rendered.expressions[0], product.prefix[0]);
  const written = planResidualAnchorHop({ ...options, adapter: {
    ...adapter, isMutatedStatic: (_receiver, key, read) => key === 'Map' && !read,
  } });
  check(`${ label }/rendered guard has no positional constructor proof`, written.narrow, null);
  check(`${ label }/written slot keeps the raw read`, written.pure, null);
});

runBoth('live rescued prefix', 'const { Map: { missing } } = (effect(), globalThis);', (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator');
  const surface = residualAnchorSurface(path.node.init, { adapter: makeAdapter(parser), path, resolveGlobalPolyfill });
  const [prefix] = surface.init.expressions;
  const rendered = renderResidualAnchor({ anchor: 'Map', anchorPure: resolveGlobalPolyfill('Map'), prefix: [prefix] }, {
    injectImport: () => 'Map', cloneHost: (node, role) => role === 'prefix' ? node : cloneNode(node),
  });
  check(`${ label }/late native edit reaches the emitted prefix`, rendered.expressions[0], prefix);
});

runBoth('captured source read', 'const value = (effect(), (guard() ? void 0 : self).Map);', (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator');
  const [prefix, read] = peelTransparentExpr(path.node.init).expressions;
  let imports = 0;
  const rendered = renderResidualAnchor({ read, anchorPure: resolveGlobalPolyfill('Map'), prefix: [prefix] }, {
    injectImport: () => { imports++; return 'Map'; },
    cloneHost: (node, role) => role === 'prefix' ? node : cloneNode(node),
  });
  check(`${ label }/no unconditional constructor import`, imports, 0);
  check(`${ label }/prefix keeps its queued children`, rendered.expressions[0], prefix);
  check(`${ label }/read is cloned on apply`, rendered.expressions[1] === read, false);
  checkDeep(`${ label }/whole guard and member retained`, rendered.expressions[1], cloneNode(read));
});

runBoth('stored source guard', 'let held; const { Map: { missing } } = held = (effect(), globalThis.window?.self);', (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', p => p.node.id.type === 'ObjectPattern');
  const before = JSON.stringify(path.node);
  const surface = residualAnchorSurface(path.node.init, { adapter: makeAdapter(parser), path, resolveGlobalPolyfill });
  check(`${ label }/source value remains guarded`, surface?.shape, 'guard');
  check(`${ label }/store and prefix remain inside the value`, surface?.tail, peelTransparentExpr(path.node.init));
  check(`${ label }/query preserves the source`, JSON.stringify(path.node), before);
});

for (const [init, coerced] of [
  ['held = (effect(), globalThis.window?.self)', true],
  ['held = other = (effect(), globalThis.window?.self)', true],
  ['box.value = (effect(), globalThis.window?.self)', true],
  ['held = (effect(), globalThis)', false],
]) runBoth(`stored mirror coercion/${ init }`, `let held, other; const { Map: { groupBy } } = ${ init };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'ObjectPattern', p => p.node.properties.some(prop => prop.value?.name === 'groupBy'));
  const before = JSON.stringify(program.node);
  const plan = buildNestedParamSynthPlan({
    leafPatternPath: path, adapter: makeAdapter(parser),
    meta: { kind: 'property', object: 'Map', key: 'groupBy', placement: 'static' },
    resolvePure: meta => meta.key === 'groupBy' ? { kind: 'static', entry: 'actual/map/group-by', hintName: 'groupBy' }
      : meta.kind === 'global' ? resolveGlobalPolyfill(meta.name) : null,
  });
  check(`${ label }/one source mirror`, plan?.targets?.length, 1);
  check(`${ label }/nullable value keeps coercion`, !!plan?.targets?.[0].coerceReceiver, coerced);
  check(`${ label }/whole store keeps its position`, plan?.targets?.[0].keepPrefix, true);
  checkDeep(`${ label }/query preserves source`, JSON.stringify(program.node), before);
});

// Every residual hop resolves its own key; the outer key cannot name the next property.
for (const [name, key, expected] of [
  ['constructor alias', 'ctor', 'Map'],
  ['proxy alias', 'proxy', 'self'],
  ['unknown alias', 'user', null],
  ['effectful constructor key', '(effect(), ctor)', null],
]) runBoth(`scoped residual/${ name }`, `const ctor = 'Map', proxy = 'self', user = 'userSlotKey';
const { [${ key }]: { name } } = globalThis;`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', p => p.node.id.type === 'ObjectPattern');
  const before = JSON.stringify(path.node);
  const product = planResidualAnchorHop({
    pattern: path.node.id, receiver: 'globalThis', path, adapter: makeAdapter(parser), resolveGlobalPolyfill,
  });
  check(`${ label }/current key`, product?.key ?? null, expected);
  check(`${ label }/query retains the source`, JSON.stringify(path.node), before);
});

finish();
