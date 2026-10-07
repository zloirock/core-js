import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import {
  buildNestedParamSynthPlan, decidingFallbackLeft, flattenFallbackBranches,
} from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { realmSelectingHostCollapses, resolveObjectName } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { createUsageHandlerCore } from '../../packages/core-js-polyfill-provider/detect-usage/visitors.js';
import {
  findNearestVarScopeOwner, memberChainKeys, memberKeyNamesReducer, runtimeChainRoot, withTraversalCaches,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { adapters, createChecker } from './harness.mjs';

const { check, checkDeep, checkTruthy, finish } = createChecker('proxy-chain-complexity');

function detectionAdapter(parser, method = 'usage-global', options = {}) {
  return parser.name === 'babel' ? createBabelAdapter({ method, ...options }) : createEstreeAdapter({ method, ...options });
}

// Count source-edge reads, not elapsed time. Querying every prefix must not re-walk
// every suffix. Instrument after parsing so scope construction is outside the budget.
for (const parser of adapters) for (const depth of [8, 64, 128, 256]) {
  const program = parser.parseAndScope(`globalThis${ '.self'.repeat(depth) }.Array;`);
  const paths = parser.collectPaths(program, 'MemberExpression');
  const counter = countReads(paths.map(path => path.node), 'object');
  const label = `${ parser.name }/${ depth }`;
  const adapter = detectionAdapter(parser);
  const proxySegments = new WeakMap();
  for (const path of paths) check(`${ label }/receiver ${ path.node.property.name }`, resolveObjectName({
    objectNode: path.node, scope: path.scope, adapter, path, proxySegments,
  }), path.node.property.name);
  checkTruthy(`${ label }/linear proxy resolution`, counter.reads > 0 && counter.reads <= 12 * paths.length, `${ counter.reads } edge reads`);

  counter.reads = 0;
  const roots = new WeakMap();
  for (const path of paths) check(`${ label }/root`, runtimeChainRoot(path.node, roots).name, 'globalThis');
  checkTruthy(`${ label }/linear root index`, counter.reads > 0 && counter.reads <= 2 * paths.length, `${ counter.reads } edge reads`);

  counter.reads = 0;
  const reducer = memberKeyNamesReducer();
  for (const path of paths) reducer.visit(path.node);
  checkDeep(`${ label }/reserved keys`, [...reducer.result().memberKeyNames].sort(), ['Array', 'self']);
  checkTruthy(`${ label }/linear key census`, counter.reads > 0 && counter.reads <= 3 * paths.length, `${ counter.reads } edge reads`);

  counter.reads = 0;
  let claims = 0;
  const core = createUsageHandlerCore({ adapter, method: 'usage-global', onUsage() { claims++; } });
  for (const path of paths) core.emitMemberUsage(path);
  check(`${ label }/all live members claim`, claims, paths.length);
  checkTruthy(`${ label }/handler shares the index`, counter.reads > 0 && counter.reads <= 32 * paths.length, `${ counter.reads } edge reads`);
}

for (const parser of adapters) {
  const adapter = detectionAdapter(parser);
  const program = parser.parseAndScope('globalThis.self.window.Array; function shadow(globalThis) {}');
  const path = parser.pickPath(program, 'MemberExpression');
  const proxySegments = new WeakMap();
  function resolve(extra = {}) {
    return resolveObjectName({ objectNode: path.node, scope: path.scope, adapter, path, proxySegments, ...extra });
  }
  check(`${ parser.name }/warm segment`, resolve(), 'Array');
  const shadow = parser.pickPath(program, 'FunctionDeclaration');
  check(`${ parser.name }/scope is not cached`, resolve({ scope: shadow.scope, path: shadow }), null);
  check(`${ parser.name }/original scope`, resolve(), 'Array');
  const originalMutation = adapter.isMutatedStatic;
  for (const name of ['self', 'window', 'globalThis', 'Array']) {
    adapter.isMutatedStatic = (object, key) => object === 'globalThis' && key === name;
    check(`${ parser.name }/live mutation ${ name }`, resolve(), null);
  }
  adapter.isMutatedStatic = originalMutation;
  check(`${ parser.name }/mutation cleared`, resolve(), 'Array');

  // Computed keys and terminal values keep their live resolver context across hits.
  for (const [source, expected] of [
    ['globalThis.self.window.Array', 'Array'],
    ['globalThis?.self?.window.Array', 'Array'],
    ['(globalThis as any).self.window.Array', 'Array'],
    ['(effect(), globalThis).self.window.Array', 'Array'],
    ['(() => globalThis)().self.window.Array', 'Array'],
    ['globalThis["self"].window.self.Array', 'Array'],
    ['globalThis.unknown.self.window.Array', null],
    ['({ self: globalThis }).self.window.Array', null],
    ['foreign.self.window.Array', null],
  ]) {
    const parsed = parser.parseAndScope(`const value = ${ source };`);
    const use = parser.pickPath(parsed, 'VariableDeclarator').get('init');
    // Oxc wraps optional chains, while Babel exposes the optional member directly.
    const node = use.node.type === 'ChainExpression' ? use.node.expression : use.node;
    const context = { objectNode: node, scope: use.scope, adapter, path: use };
    check(`${ parser.name }/${ source }/uncached`, resolveObjectName(context), expected);
    const cache = new WeakMap();
    for (let pass = 0; pass < 2; pass++) {
      check(`${ parser.name }/${ source }/${ pass }`, resolveObjectName({ ...context, proxySegments: cache }), expected);
    }
  }

  // A reused handler drops the index between files/passes. Pure never indexes the tree
  // it rewrites, so a changed inner hop is visible even without a reset.
  for (const method of ['usage-global', 'usage-pure']) {
    const parsed = parser.parseAndScope('globalThis.self.self.Array.from([]);');
    const members = parser.collectPaths(parsed, 'MemberExpression');
    const [use] = members;
    const metas = [];
    const core = createUsageHandlerCore({ adapter: detectionAdapter(parser, method), method, onUsage: meta => metas.push(meta) });
    core.emitMemberUsage(use);
    check(`${ parser.name }/${ method }/before edit`, metas[0].object, 'Array');
    members.at(-1).node.property.name = 'Math';
    if (method === 'usage-global') core.reset();
    core.emitMemberUsage(use);
    check(`${ parser.name }/${ method }/after edit`, metas.at(-1).object, null);

    const effectful = parser.parseAndScope('(tick(), globalThis).self.Array.from([]);');
    core.reset();
    core.emitMemberUsage(parser.pickPath(effectful, 'MemberExpression'));
    checkDeep(`${ parser.name }/${ method }/receiver effects for substitution`,
      (metas.at(-1).sideEffects ?? []).map(effect => effect.callee?.name), method === 'usage-pure' ? ['tick'] : []);
  }

  // Root-only queries must not inspect keys; keyed queries retain root-first order and
  // unreadable slots, including the parser-specific wrappers around optional/TS syntax.
  const parsed = parser.parseAndScope('(source as any).first?.[unknown].last;');
  const expr = parser.pickPath(parsed, 'ExpressionStatement').node.expression;
  const chain = memberChainKeys(expr);
  checkDeep(`${ parser.name }/key order`, chain.keys, ['first', null, 'last']);
  check(`${ parser.name }/same root`, runtimeChainRoot(expr), chain.root);
  const sequence = parser.parseAndScope('(effect(), source).first.last;');
  check(`${ parser.name }/sequence is a root`, runtimeChainRoot(parser.pickPath(sequence, 'ExpressionStatement').node.expression).type,
    'SequenceExpression');
}

// A presence test reads its operand without deciding or walking the selections below it: aliases each
// testing the one before - two chains testing each other, `||` and `&&` spellings alike - would otherwise
// resolve every level twice. Count binding lookups; the depths stay small enough that a doubling walk
// fails rather than hangs.
for (const parser of adapters) for (const depth of [8, 16]) for (const [shape, level] of [
  ['or', i => `const a${ i } = a${ i - 1 } || 0;`],
  ['and', i => `const a${ i } = typeof a${ i - 1 } !== 'undefined' && a${ i - 1 };`],
  ['chain', i => `const a${ i } = typeof a${ i - 1 } !== 'undefined' ? a${ i - 1 } : 0;`],
  ['crossed', i => `const a${ i } = typeof b${ i - 1 } !== 'undefined' ? a${ i - 1 } : 0;
    const b${ i } = typeof a${ i - 1 } !== 'undefined' ? b${ i - 1 } : 0;`],
  // ... and a `||` / `??` over the alias before it: the value canon decides such a fallback only off a global
  // (`decidedSelection` on the adapter), or every level would walk the rest of the chain again - a walk that
  // grows by a power of the depth, so these run at the smaller depth alone
  ['fallback or', i => `const a${ i } = a${ i - 1 } || Set;`],
  ['fallback nullish', i => `const a${ i } = a${ i - 1 } ?? Set;`],
]) {
  if (shape.startsWith('fallback') && depth > 8) continue;
  const levels = Array.from({ length: depth - 1 }, (unused, i) => level(i + 2)).join('\n');
  const program = parser.parseAndScope(`const a1 = typeof Promise !== 'undefined' ? Promise : 0; const b1 = a1;
    ${ levels }\na${ depth }.resolve;\na1.resolve;`);
  const [last, first] = parser.collectPaths(program, 'MemberExpression', p => p.node.property.name === 'resolve');
  // a build guaranteeing every entry, so the tests decide
  const adapter = detectionAdapter(parser, 'usage-pure', { isEntryGuaranteed: () => true });
  const counter = countLookups(adapter);
  const label = `${ parser.name }/decided ${ shape }/${ depth }`;
  check(`${ label }/the first level decides`,
    resolveObjectName({ objectNode: first.node.object, scope: first.scope, adapter, path: first }), 'Promise');
  counter.lookups = 0;
  resolveObjectName({ objectNode: last.node.object, scope: last.scope, adapter, path: last });
  checkTruthy(`${ label }/linear lookups`, counter.lookups > 0 && counter.lookups <= 4 * depth, `${ counter.lookups } lookups`);
}

// the binding lookups an adapter makes from here on
function countLookups(adapter) {
  const { getBinding } = adapter;
  const counter = { lookups: 0 };
  adapter.getBinding = (...args) => {
    counter.lookups++;
    return getBinding.apply(adapter, args);
  };
  return counter;
}

// the reads of one property of these nodes from here on - the walks' source edges
function countReads(nodes, key) {
  const counter = { reads: 0 };
  for (const node of nodes) {
    const value = node[key];
    Object.defineProperty(node, key, {
      configurable: true,
      enumerable: true,
      get() {
        counter.reads++;
        return value;
      },
    });
  }
  return counter;
}

// a selection over aliases crossing over each other at every level (`aI = bJ || aJ`, `bI = aJ || bJ`):
// the realm-selection walk of the value canon asks the left whether it is the realm, and a left that
// is not decides the walk on its own. walked into the right as well, every level resolved both
// aliases of the level below, which doubles per level; the depths stay small enough that it fails fast
for (const parser of adapters) for (const method of ['usage-global', 'usage-pure']) for (const depth of [8, 16]) {
  const levels = Array.from({ length: depth - 1 }, (unused, k) => {
    const i = k + 2;
    return `const a${ i } = b${ i - 1 } || a${ i - 1 };\nconst b${ i } = a${ i - 1 } || b${ i - 1 };`;
  }).join('\n');
  const program = parser.parseAndScope(`const a1 = globalThis.Map || globalThis.Set; const b1 = a1;\n${ levels }\na${ depth }.groupBy;`);
  const use = parser.pickPath(program, 'MemberExpression', path => path.node.property.name === 'groupBy');
  const adapter = detectionAdapter(parser, method);
  const counter = countLookups(adapter);
  const label = `${ parser.name }/${ method }/crossed aliases/${ depth }`;
  // neither alias of a crossed level is the realm or one constructor: the build serves neither realm read,
  // so the levels select between two
  check(`${ label }/names nothing`, resolveObjectName({ objectNode: use.node.object, scope: use.scope, adapter, path: use }), null);
  checkTruthy(`${ label }/linear lookups`, counter.lookups > 0 && counter.lookups <= 6 * depth, `${ counter.lookups } lookups`);
}

// ... and the visit of a member read off such an alias, crossed or plain (`aI = aJ || Set`): the meta, the
// union of the values the alias may hold and the constructor candidates each resolve the alias of every
// level, which walks the levels below it, so the value an alias holds is kept per node in a read-only
// traversal (`canonAnswerTable`) and each level is walked once
for (const parser of adapters) for (const [shape, level] of [
  ['crossed', i => `const a${ i } = b${ i - 1 } || a${ i - 1 };\nconst b${ i } = a${ i - 1 } || b${ i - 1 };`],
  ['plain', i => `const a${ i } = a${ i - 1 } || Set;`],
]) for (const depth of [16, 32]) {
  const levels = Array.from({ length: depth - 1 }, (unused, k) => level(k + 2)).join('\n');
  const program = parser.parseAndScope(`const a1 = globalThis.Map || globalThis.Set; const b1 = a1;\n${ levels }\na${ depth }.groupBy;`);
  const use = parser.pickPath(program, 'MemberExpression', path => path.node.property.name === 'groupBy');
  const adapter = detectionAdapter(parser);
  const counter = countLookups(adapter);
  const claims = [];
  const core = createUsageHandlerCore({ adapter, method: 'usage-global', onUsage: meta => claims.push(meta) });
  withTraversalCaches(true, () => core.emitMemberUsage(use));
  const label = `${ parser.name }/alias visit/${ shape }/${ depth }`;
  checkDeep(`${ label }/both constructors`, [...new Set(claims.map(meta => meta.object).filter(Boolean))].sort(), ['Map', 'Set']);
  checkTruthy(`${ label }/linear lookups`, counter.lookups > 0 && counter.lookups <= 200 * depth, `${ counter.lookups } lookups`);
}

// ... and an alias chain whose every left is a realm read the build does not serve (`aI =
// globalThis.WeakRef || aJ`): the transform asks every level, and a level whose left failed the realm
// walk walked the alias on its right - the whole rest of the chain - again. usage-global, where every
// member visit resolves the receiver it reads; both spellings of the fallback
for (const parser of adapters) for (const [shape, level] of [
  ['or', i => `const a${ i } = globalThis.WeakRef || a${ i - 1 };`],
  ['nullish', i => `const a${ i } = globalThis.FinalizationRegistry ?? a${ i - 1 };`],
]) for (const depth of [16, 32]) {
  const levels = Array.from({ length: depth }, (unused, i) => level(i + 1)).join('\n');
  const program = parser.parseAndScope(`const a0 = globalThis.WeakRef || Array;\n${ levels }\nuse(a${ depth }.from(list));`);
  const adapter = detectionAdapter(parser);
  const counter = countLookups(adapter);
  const claims = [];
  const core = createUsageHandlerCore({ adapter, method: 'usage-global', onUsage: meta => claims.push(meta) });
  withTraversalCaches(true, () => {
    for (const path of parser.collectPaths(program, 'MemberExpression')) core.emitMemberUsage(path);
  });
  const label = `${ parser.name }/realm-left aliases/${ shape }/${ depth }`;
  checkTruthy(`${ label }/every member claims`, claims.length > depth, `${ claims.length } claims`);
  checkTruthy(`${ label }/linear lookups`, counter.lookups <= 100 * depth, `${ counter.lookups } lookups`);
}

// a `||` chain of realm reads: a level decides by its left, which holds every level below it, and the
// walk answering that is kept per node (`canonAnswerTable`), so a question asking each level in turn
// - the host collapse of usage-pure descending the chain, the visits of usage-global, one per level of
// the read-only traversal and anchored on one left spine (`canonContextPath`) - walks every level once.
// count the left edges the walks read
for (const parser of adapters) for (const depth of [16, 32]) {
  const chain = Array.from({ length: depth }, () => 'globalThis.WeakRef').join(' || ');
  {
    const program = parser.parseAndScope(`const { of, deep: { a } } = ${ chain } || (log(), F);`);
    const host = parser.pickPath(program, 'VariableDeclarator');
    const counter = countReads(parser.collectPaths(program, 'LogicalExpression').map(path => path.node), 'left');
    const adapter = detectionAdapter(parser, 'usage-pure');
    const label = `${ parser.name }/realm-read selection/host/${ depth }`;
    // a read the build does not serve may be undefined, so no level collapses onto the realm
    checkDeep(`${ label }/no collapse`, realmSelectingHostCollapses(host.node, { scope: host.scope, adapter, path: host }), []);
    checkTruthy(`${ label }/linear left reads`, counter.reads <= 10 * depth, `${ counter.reads } reads`);
  }
  // ... and the visits over such a chain, where every right may run, and over one of a global core-js
  // extends in place, which every engine carries: there the left decides every level
  for (const [read, decided] of [[chain, false], [chain.replaceAll('WeakRef', 'Array'), true]]) {
    const program = parser.parseAndScope(`use(${ read } || (log(), F));`);
    const selections = parser.collectPaths(program, 'LogicalExpression');
    const counter = countReads(selections.map(path => path.node), 'left');
    const adapter = detectionAdapter(parser);
    const core = createUsageHandlerCore({ adapter, method: 'usage-global', onUsage() { /* claims are not counted */ } });
    const dead = withTraversalCaches(true, () => selections.map(path => core.deadBranchOf(path)));
    const label = `${ parser.name }/realm-read selection/visits/${ decided ? 'decided' : 'undecided' }/${ depth }`;
    check(`${ label }/dead rights`, dead.filter(branch => branch?.skip === 'right').length, decided ? depth : 0);
    checkTruthy(`${ label }/linear left reads`, counter.reads <= 6 * depth, `${ counter.reads } reads`);
  }
}

// ... and the visit of one level of such a chain in usage-pure, where no traversal keeps an answer: what
// its left decides is read from the chain's root, which keys the answer (`canonContextPath`). anchored at
// the level itself, every lookup of a leaf below it climbed the levels above it again - realm reads the
// build does not serve, an alias, both spellings of the fallback. count the type tests on the levels
for (const parser of adapters) for (const [shape, leaf, operator] of [
  ['realm reads', 'globalThis.WeakRef', '||'],
  ['alias', 'maybe', '||'],
  ['nullish', 'globalThis.Int8Array', '??'],
]) for (const depth of [32, 64]) {
  const chain = Array.from({ length: depth }, () => leaf).join(` ${ operator } `);
  const program = parser.parseAndScope(`const maybe = make(); use(${ chain } ${ operator } F);`);
  const selections = parser.collectPaths(program, 'LogicalExpression');
  const counter = countReads(selections.map(path => path.node), 'type');
  const adapter = detectionAdapter(parser, 'usage-pure');
  const core = createUsageHandlerCore({ adapter, method: 'usage-pure', onUsage() { /* claims are not counted */ } });
  const label = `${ parser.name }/selection level visit/${ shape }/${ depth }`;
  check(`${ label }/the right may run`, core.deadBranchOf(selections[selections.length >> 1]), null);
  checkTruthy(`${ label }/linear type tests`, counter.reads <= 50 * depth, `${ counter.reads } reads`);
}

// ... and the visits of every level in turn, as the traversal makes them: the left operand of a level is
// entered right after the level, with nothing rewritten in between, so the question scope one level asked
// in serves the next (`withCanonQuestion`) and each level is walked once - realm reads the build does not
// serve, and the nullish spelling. count the left edges the questions read
for (const parser of adapters) for (const [shape, leaf, operator, last] of [
  ['realm reads', 'globalThis.WeakRef', '||', 'F'],
  ['nullish', 'globalThis.Int8Array', '??', 'Int8Array'],
]) for (const depth of [32, 64]) {
  const program = parser.parseAndScope(`use(${ Array.from({ length: depth }, () => leaf).join(` ${ operator } `) } ${ operator } ${ last });`);
  const selections = parser.collectPaths(program, 'LogicalExpression');
  const counter = countReads(selections.map(path => path.node), 'left');
  const adapter = detectionAdapter(parser, 'usage-pure');
  const core = createUsageHandlerCore({ adapter, method: 'usage-pure', onUsage() { /* claims are not counted */ } });
  const label = `${ parser.name }/selection level visits/${ shape }/${ depth }`;
  checkDeep(`${ label }/every right may run`, selections.map(path => core.deadBranchOf(path)).filter(Boolean), []);
  checkTruthy(`${ label }/linear left reads`, counter.reads <= 10 * depth, `${ counter.reads } reads`);
}

// ... and a level visited after another entry, which may have rewritten what the level decides by, asks
// in a fresh scope: a member visit of usage-pure rewrites the tree, here the level's left in place - a
// global name every engine carries turned into an unknown one
for (const parser of adapters) {
  const program = parser.parseAndScope('use((Array || x) || F); globalThis.Map;');
  const [outer, inner] = parser.collectPaths(program, 'LogicalExpression');
  const member = parser.pickPath(program, 'MemberExpression', path => path.node.property.name === 'Map');
  const adapter = detectionAdapter(parser, 'usage-pure');
  const core = createUsageHandlerCore({ adapter, method: 'usage-pure', onUsage() { /* claims are not counted */ } });
  const label = `${ parser.name }/selection level after another entry`;
  check(`${ label }/the outer left decides`, core.deadBranchOf(outer)?.skip, 'right');
  core.emitMemberUsage(member);
  inner.node.left.name = 'unknown';
  check(`${ label }/the inner right may run as rewritten`, core.deadBranchOf(inner), null);
}

// ... and over a SERVED left (`globalThis.Map || ...`) every level is decided: the right of each is dead
// text and the operand a level yields is the one its left decides down the chain (`decidingFallbackLeft`),
// asked by a descent of every level and kept per node too. the branch walk of usage-pure descends the
// chain level by level, and the mirror plan pairs each dead right with the leaves its left holds
for (const parser of adapters) for (const depth of [16, 32]) {
  const chain = Array.from({ length: depth }, () => 'globalThis.Map').join(' || ');
  {
    const program = parser.parseAndScope(`use(${ chain } || F);`);
    const selections = parser.collectPaths(program, 'LogicalExpression');
    const [root] = selections;
    const counter = countReads(selections.map(path => path.node), 'left');
    const adapter = detectionAdapter(parser, 'usage-pure', { isEntryGuaranteed: () => true });
    const branches = flattenFallbackBranches({ node: root.node, key: 'groupBy', scope: root.scope, adapter, path: root });
    const label = `${ parser.name }/served selection/branches/${ depth }`;
    checkDeep(`${ label }/the leftmost read alone`, branches.map(branch => branch.object), ['Map']);
    checkTruthy(`${ label }/linear left reads`, counter.reads <= 10 * depth, `${ counter.reads } reads`);
    // ... and one ask of the outermost level, outside any descent, follows the decided chain down once
    counter.reads = 0;
    const decided = decidingFallbackLeft(root.node, { scope: root.scope, adapter, path: root });
    check(`${ label }/the leftmost read decides`, decided?.type === 'MemberExpression' && decided.property.name, 'Map');
    checkTruthy(`${ label }/linear deciding left reads`, counter.reads <= 6 * depth, `${ counter.reads } reads`);
  }
  {
    const program = parser.parseAndScope(`const { groupBy, deep: { a } } = ${ chain } || (log(), F);`);
    const leafPatternPath = parser.pickPath(program, 'ObjectPattern', path => path.parentPath.node.type === 'VariableDeclarator');
    const counter = countReads(parser.collectPaths(program, 'LogicalExpression').map(path => path.node), 'left');
    const adapter = detectionAdapter(parser, 'usage-pure', { isEntryGuaranteed: () => true });
    const plan = buildNestedParamSynthPlan({
      leafPatternPath,
      adapter,
      meta: { kind: 'property', object: 'Map', key: 'groupBy', placement: 'static' },
      resolvePure(meta) {
        if (meta.kind === 'global') return meta.name === 'Map' ? { kind: 'global', entry: 'map', hintName: 'Map' } : null;
        return meta.key === 'groupBy' ? { kind: 'static', entry: 'map/group-by', hintName: 'Map$groupBy' } : null;
      },
    });
    const label = `${ parser.name }/served selection/mirror/${ depth }`;
    check(`${ label }/one target`, plan?.targets?.length, 1);
    check(`${ label }/every right gives way`, plan?.targets?.[0]?.deadFallbacks?.length, depth);
    checkTruthy(`${ label }/linear left reads`, counter.reads <= 6 * depth, `${ counter.reads } reads`);
  }
}

// a binding lookup from every level of a nested selection climbs to its scope owner, and the operands
// and parens of a selection open no scope: a read-only traversal shares the climb through them like a
// member run (`memberContextPath`). count the type tests the climbs make on the selection's nodes
for (const parser of adapters) for (const depth of [32, 64]) {
  let selection = 'Array';
  for (let i = 0; i < depth; i++) selection = `(globalThis.WeakRef || ${ selection })`;
  const program = parser.parseAndScope(`use(${ selection }.from(list));`);
  const members = parser.collectPaths(program, 'MemberExpression');
  const links = [...parser.collectPaths(program, 'LogicalExpression'), ...parser.collectPaths(program, 'ParenthesizedExpression')];
  const counter = countReads(links.map(path => path.node), 'type');
  const owners = withTraversalCaches(true, () => new Set(members.map(path => findNearestVarScopeOwner(path)?.node.type)));
  const label = `${ parser.name }/nested selection climbs/${ depth }`;
  checkDeep(`${ label }/program owner`, [...owners], ['Program']);
  checkTruthy(`${ label }/linear type tests`, counter.reads <= 40 * depth, `${ counter.reads } reads`);
}

// ... and outside such a traversal, the type of a call over a long selection - left- or right-nested -
// is one question (`withCanonQuestion`), which shares the climbs as well: the union over the branches
// looks every branch up from its own place in the selection, and each lookup climbed the selection again
for (const parser of adapters) for (const [shape, build] of [
  ['left', depth => `(${ Array.from({ length: depth }, () => 'globalThis.Map').join(' || ') } || F)`],
  ['right', depth => Array.from({ length: depth }).reduce(selection => `(globalThis.Map || ${ selection })`, 'Set')],
]) for (const depth of [32, 64]) {
  function callType(levels, counted = false) {
    const program = parser.parseAndScope(`use(${ build(levels) }.groupBy(list, key));`);
    const call = parser.pickPath(program, 'CallExpression', path => path.node.callee.property?.name === 'groupBy');
    const counter = counted ? countReads(parser.collectPaths(program, 'LogicalExpression').map(path => path.node), 'type') : null;
    return { type: parser.makeResolver().resolveNodeType(call), counter };
  }
  const { type, counter } = callType(depth, true);
  const label = `${ parser.name }/selection call type/${ shape }/${ depth }`;
  // a level repeating the operand beside it selects the same value, so the depth changes no type
  checkDeep(`${ label }/the type of one level`, type, callType(1).type);
  checkTruthy(`${ label }/linear type tests`, counter.reads <= 500 * depth, `${ counter.reads } reads`);
}

// the branches the usage-global union dispatches for the receiver `use` reads
function aliasUnion(parser, use) {
  return flattenFallbackBranches({
    node: use.node.object,
    key: 'groupBy',
    scope: use.scope,
    adapter: detectionAdapter(parser),
    path: use,
    followAliasLeaves: true,
    includeUnresolved: true,
  });
}

// the usage-global union of a receiver follows alias leaves into the values they select, and aliases
// crossing over each other - over two realm reads the build does not serve, so every right may run -
// reach every value once per path: one arm flattened is the whole of its branches for the union, which
// reads them as a set. count the branches handed to dispatch, and the same set through a cycle the walk cuts
for (const parser of adapters) {
  for (const depth of [6, 10]) {
    const levels = Array.from({ length: depth - 1 }, (unused, k) => {
      const i = k + 2;
      return `const a${ i } = b${ i - 1 } || a${ i - 1 };\nconst b${ i } = a${ i - 1 } || b${ i - 1 };`;
    }).join('\n');
    const program = parser.parseAndScope(`const a1 = globalThis.Map || globalThis.Set; const b1 = a1;\n${ levels }\na${ depth }.groupBy;`);
    const use = parser.pickPath(program, 'MemberExpression', path => path.node.property.name === 'groupBy');
    const branches = aliasUnion(parser, use);
    const label = `${ parser.name }/crossed alias union/${ depth }`;
    checkDeep(`${ label }/both constructors`, [...new Set(branches.map(branch => branch.object))].sort(), ['Map', 'Set']);
    checkTruthy(`${ label }/each branch once`, branches.length <= 4, `${ branches.length } branches`);
  }
  for (const [name, source, expected] of [
    // the read of `q` ahead of its own initializer is the cycle's unresolved arm, kept for its instance cover
    ['cyclic', 'var p = q || Map; var q = p || Set; const r = p || q; r.groupBy;', ['Map', 'Set', 'unresolved']],
    ['shared arm', 'const a = c ? Map : Set; const b = c ? a : WeakMap; const d = a || b; d.groupBy;', ['Map', 'Set', 'WeakMap']],
  ]) {
    const program = parser.parseAndScope(source);
    const use = parser.pickPath(program, 'MemberExpression', path => path.node.property.name === 'groupBy');
    const branches = aliasUnion(parser, use);
    const objects = branches.map(branch => branch.object ?? 'unresolved');
    checkDeep(`${ parser.name }/${ name } alias union`, [...new Set(objects)].sort(), expected);
    check(`${ parser.name }/${ name } alias union/each branch once`, objects.length, expected.length);
  }
}

finish();
