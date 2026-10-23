// The injector's shared flush machinery: the census over the final tree, the write-only
// guard-memo unwrap, pure-import liveness (ctor-static exception included), the canonical
// rename map, and the state registries both emitters subclass. These are DECISIONS - one
// answer for both legs - so they lock here, on raw ESTree shapes, element-wise.
import ImportInjectorState, {
  buildCanonicalRenameMap,
  canDropUnusedMemo,
  collectInjectorCensus,
  createPureImportLiveness,
  generatedNameFamilyOf,
  refDeclarationOrder,
  unwrapWriteOnlyGuardMemos,
} from '../../packages/core-js-polyfill-provider/injector-base.js';
import { unwrapRuntimeExpr } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';

const { check, checkTruthy, finish, runBoth } = createChecker('injector-base');

// the census and the flush decisions run through BOTH parsers via the harness - a decision
// that differs between dialects is a regression, whichever side is wrong

// --- collectInjectorCensus: counts, rank, positions ---

runBoth('census/standalone owned memo writes',
  'var _ref; _ref = Array; if (yes) _ref = Object; user = Array; use(_ref = Array);',
  (adapter, programPath, label) => {
    const census = collectInjectorCensus(programPath.node, { mintedRefNames: new Set(['_ref']) });
    check(`${ label } :: only a standalone owned write is eligible`, census.memoStatementWrites.length, 1);
    check(`${ label } :: candidate retains its RHS`, census.memoStatementWrites[0].value.name, 'Array');
  });

runBoth('census/counts and rank', 'var _ref; _ref = root; use(_ref);', (adapter, programPath, label) => {
  const census = collectInjectorCensus(programPath.node, { mintedRefNames: new Set(['_ref']) });
  check(`${ label } :: ref occurrences counted`, census.refCounts.get('_ref'), 3);
  check(`${ label } :: declarator-id occurrences counted apart`, census.refDeclIdCounts.get('_ref'), 1);
  check(`${ label } :: rank is the first NON-declarator occurrence`, census.printRank.join(','), '_ref');
  check(`${ label } :: every spelling reaches usedNames`, census.usedNames.has('root'), true);
}, [], 'script');

runBoth('census/rank order across names', 'var _ref, _ref2; _ref2 = b; _ref = a; use(_ref2, _ref);',
  (adapter, programPath, label) => {
    const census = collectInjectorCensus(programPath.node, { mintedRefNames: new Set(['_ref', '_ref2']) });
    check(`${ label } :: print rank follows first USE, not allocation`, census.printRank.join(','), '_ref2,_ref');
  }, [], 'script');

runBoth('census/member reads', '_Map.groupBy; _Set["union"]; opt?.chain;', (adapter, programPath, label) => {
  const census = collectInjectorCensus(programPath.node, {});
  checkTruthy(`${ label } :: plain member read recorded`, census.memberReads.has('_Map.groupBy'));
  checkTruthy(`${ label } :: computed string-literal member read recorded`, census.memberReads.has('_Set.union'));
  checkTruthy(`${ label } :: optional member read recorded`, census.memberReads.has('opt.chain'));
});

runBoth('census/foreign slot-shaped name', '_ref2;', (adapter, programPath, label) => {
  const foreign = collectInjectorCensus(programPath.node, { mintedRefNames: new Set(['_ref']) });
  check(`${ label } :: foreign slot-shaped name flags`, foreign.foreignSlotName, true);
  const own = collectInjectorCensus(programPath.node, { mintedRefNames: new Set(['_ref2']) });
  check(`${ label } :: own minted name does not flag`, own.foreignSlotName, false);
});

runBoth('census/type-annotation wall', 'declare const v: { _ref2(): void };', (adapter, programPath, label) => {
  const census = collectInjectorCensus(programPath.node, { mintedRefNames: new Set(['_ref2']) });
  check(`${ label } :: a name past the \`:\` slot claims nothing`, census.usedNames.has('_ref2'), false);
});

// Terminal cleanup consumes final native facts; it must not turn an unread binding into
// permission to discard effects, a residual pattern, or a required declaration slot.
for (const [name, source, facts, expected] of [
  ['inert declaration', 'var _ref = 1;', {}, true],
  ['empty declaration', 'var _ref;', {}, true],
  ['parenthesized value', 'var _ref = ((1));', {}, true],
  ['deferred body', 'var _ref = () => effect();', {}, true],
  ['call', 'var _ref = effect();', {}, false],
  ['getter', 'var _ref = holder.value;', {}, false],
  ['sequence effect', 'var _ref = (effect(), 1);', {}, false],
  ['spread iteration', 'var _ref = [...holder];', {}, false],
  ['class initialization', 'var _ref = class { static value = effect(); };', {}, false],
  ['residual pattern', 'var { value: _ref } = holder;', {}, false],
  ['live reader', 'var _ref = 1;', { hasUses: true }, false],
  ['surviving write', 'var _ref;', { hasUses: 1 }, false],
  ['source ownership', 'var _ref = 1;', { owned: false }, false],
  ['required host slot', 'var _ref = 1;', { removable: false }, false],
]) runBoth(`memo removal/${ name }`, source, (adapter, programPath, label) => {
  const [{ id, init }] = programPath.node.body[0].declarations;
  const before = JSON.stringify(programPath.node);
  const options = { owned: true, hasUses: false, removable: true, ...facts };
  canDropUnusedMemo(id, init, options);
  check(`${ label } :: terminal verdict`, canDropUnusedMemo(id, init, options), expected);
  check(`${ label } :: asking and ignoring preserves the tree`, JSON.stringify(programPath.node), before);
});

for (const expression of ['_ref = Array', '((_ref = Array))']) {
  runBoth(`memo removal/write target/${ expression }`, `var _ref; ${ expression };`, (adapter, programPath, label) => {
    const census = collectInjectorCensus(programPath.node, { mintedRefNames: new Set(['_ref']) });
    const [write] = census.memoStatementWrites;
    check(`${ label } :: one owned statement`, census.memoStatementWrites.length, 1);
    check(`${ label } :: target survives parser wrappers`, write.target.name, '_ref');
    check(`${ label } :: inert unread write can retire`, canDropUnusedMemo(write.target, write.value, {
      owned: true,
      hasUses: census.refCounts.get('_ref') > census.refDeclIdCounts.get('_ref') + 1,
      removable: true,
    }), true);
  });
}

// --- pure counts and the import-binder position ---

runBoth('census/pure binder positions',
  'import _at from "@core-js/pure/actual/array/at";\nvar _flat = require("@core-js/pure/actual/array/flat");\n_at();',
  (adapter, programPath, label) => {
    const census = collectInjectorCensus(programPath.node, { pureNames: new Set(['_at', '_flat']) });
    check(`${ label } :: pure name counts every occurrence`, census.pureCounts.get('_at'), 2);
    check(`${ label } :: import specifier is the binder position`, census.pureImportBoundCounts.get('_at'), 1);
    check(`${ label } :: require declarator is the binder position too`, census.pureImportBoundCounts.get('_flat'), 1);
  });

// --- createPureImportLiveness: use, orphan, ctor-static exception ---

runBoth('liveness/ctor-static exception',
  'import _Map from "@core-js/pure/actual/map/constructor";\nimport _Map$groupBy from "@core-js/pure/actual/map/group-by";\n_Map.groupBy;',
  (adapter, programPath, label) => {
    const census = collectInjectorCensus(programPath.node, { pureNames: new Set(['_Map', '_Map$groupBy', '_orphan']) });
    const mintedLive = createPureImportLiveness({
      pureImports: new Map([['usage-pure/map/constructor', '_Map'], ['usage-pure/map/group-by', '_Map$groupBy']]),
      existingPureImports: new Map(),
      census,
    });
    checkTruthy(`${ label } :: used name is live`, mintedLive('usage-pure/map/constructor', '_Map'));
    checkTruthy(`${ label } :: static read through the MINTED ctor keeps the binding-unused import`,
      mintedLive('usage-pure/map/group-by', '_Map$groupBy'));
    check(`${ label } :: an orphan with no occurrence and no ctor read is dead`,
      mintedLive('usage-pure/map/of', '_orphan'), false);
    // the ctor table spans the USER-REGISTERED ctor import too: the same static read keeps a
    // minted static alive when the constructor came from the user's own import
    const userLive = createPureImportLiveness({
      pureImports: new Map([['usage-pure/map/group-by', '_Map$groupBy']]),
      existingPureImports: new Map([['usage-pure/map/constructor', '_Map']]),
      census,
    });
    checkTruthy(`${ label } :: static read through the USER-REGISTERED ctor keeps the import`,
      userLive('usage-pure/map/group-by', '_Map$groupBy'));
  });

// a use ONLY inside a `:` type slot is behind the annotation wall: erased at runtime, it
// keeps no import (babel's own uid scan draws the same wall; the erased reference cannot
// execute the module's attachment either)
runBoth('liveness/type-only use is dead',
  'import _at from "@core-js/pure/actual/array/at";\ndeclare const v: { m(): typeof _at };',
  (adapter, programPath, label) => {
    const census = collectInjectorCensus(programPath.node, { pureNames: new Set(['_at']) });
    const isLive = createPureImportLiveness({
      pureImports: new Map([['usage-pure/array/at', '_at']]),
      existingPureImports: new Map(),
      census,
    });
    check(`${ label } :: a type-annotation-only use keeps no import`, isLive('usage-pure/array/at', '_at'), false);
  });

// a JSX expression slot is a real runtime read - it keeps the import
runBoth('liveness/JSX use is live',
  'import _at from "@core-js/pure/actual/array/at";\nexport const el = <X handler={_at} />;',
  (adapter, programPath, label) => {
    const census = collectInjectorCensus(programPath.node, { pureNames: new Set(['_at']) });
    const isLive = createPureImportLiveness({
      pureImports: new Map([['usage-pure/array/at', '_at']]),
      existingPureImports: new Map(),
      census,
    });
    check(`${ label } :: a JSX expression use keeps the import`, isLive('usage-pure/array/at', '_at'), true);
  }, ['jsx']);

runBoth('liveness/import alone', 'import _at from "@core-js/pure/actual/array/at";', (adapter, programPath, label) => {
  const census = collectInjectorCensus(programPath.node, { pureNames: new Set(['_at']) });
  const isLive = createPureImportLiveness({
    pureImports: new Map([['usage-pure/array/at', '_at']]),
    existingPureImports: new Map(),
    census,
  });
  check(`${ label } :: the import statement alone does not keep itself`, isLive('usage-pure/array/at', '_at'), false);
});

// --- unwrapWriteOnlyGuardMemos: a memo per guard TEST, both tree states ---

// every null-compare contributes its own memo, so a nested guard yields one candidate per test -
// the outer and the inner - and each is decided on its own read count
const NESTED_GUARD = 'y = null == (_ref9 = null == (_ref2 = root) ? void 0 : _ref2.p) ? void 0 : _ref9;';

function byName(census, name) {
  return census.nestedGuardMemoCandidates.find(candidate => candidate.name === name);
}

runBoth('unwrap/write-only memo', `${ NESTED_GUARD }`, (adapter, programPath, label) => {
  const census = collectInjectorCensus(programPath.node, { mintedRefNames: new Set(['_ref2', '_ref9']) });
  check(`${ label } :: one candidate per guard test`, census.nestedGuardMemoCandidates.length, 2);
  // both refs read below their write - `_ref2` in the alternate (`_ref2.p`), `_ref9` in its own -
  // so two occurrences each and both memos are KEPT
  unwrapWriteOnlyGuardMemos(census);
  for (const name of ['_ref2', '_ref9']) {
    const kept = byName(census, name);
    check(`${ label } :: a read ref keeps its memo write (${ name })`,
      unwrapRuntimeExpr(kept.test[kept.side]).type, 'AssignmentExpression');
  }
}, [], 'script');

runBoth('unwrap/write-only memo collapses', 'y = null == (_ref9 = null == (_ref2 = root) ? void 0 : x) ? void 0 : _ref9;',
  (adapter, programPath, label) => {
    const census = collectInjectorCensus(programPath.node, { mintedRefNames: new Set(['_ref2', '_ref9']) });
    unwrapWriteOnlyGuardMemos(census);
    const candidate = byName(census, '_ref2');
    check(`${ label } :: write-only memo collapses to its RHS`, candidate.test[candidate.side].type, 'Identifier');
    check(`${ label } :: the count follows the collapse`, census.refCounts.get('_ref2'), 0);
    // ... and the one its own alternate READS stays whole
    const read = byName(census, '_ref9');
    check(`${ label } :: the read ref keeps its write`, unwrapRuntimeExpr(read.test[read.side]).type, 'AssignmentExpression');
  }, [], 'script');

runBoth('unwrap/declared state', 'var _ref2; y = null == (_ref9 = null == (_ref2 = root) ? void 0 : x) ? void 0 : _ref9;',
  (adapter, programPath, label) => {
    const census = collectInjectorCensus(programPath.node, { mintedRefNames: new Set(['_ref2', '_ref9']) });
    unwrapWriteOnlyGuardMemos(census);
    const candidate = byName(census, '_ref2');
    check(`${ label } :: declared-state memo collapses on the same criterion`, candidate.test[candidate.side].type, 'Identifier');
  }, [], 'script');

// a TEST-OWN memo nothing reads collapses too - the shape FC-140 named: the claim in the alternate
// is receiver-independent, so the ref is a write no reader consumes
runBoth('unwrap/test-own memo', 'y = null == (_ref3 = root.p) ? void 0 : polyfilled;',
  (adapter, programPath, label) => {
    const census = collectInjectorCensus(programPath.node, { mintedRefNames: new Set(['_ref3']) });
    check(`${ label } :: the test's own memo is a candidate`, census.nestedGuardMemoCandidates.length, 1);
    unwrapWriteOnlyGuardMemos(census);
    const candidate = byName(census, '_ref3');
    check(`${ label } :: it collapses to the value the test reads`,
      unwrapRuntimeExpr(candidate.test[candidate.side]).type, 'MemberExpression');
    check(`${ label } :: the count follows the collapse`, census.refCounts.get('_ref3'), 0);
  }, [], 'script');

// --- buildCanonicalRenameMap ---

{
  const renameMap = buildCanonicalRenameMap({
    printRank: ['_ref3', '_ref2'],
    aliveByPrefix: new Map([['_ref', new Set(['_ref2', '_ref3', '_ref5'])]]),
    isTaken: name => name === '_ref2',
  });
  check('rename/first-ranked takes the lowest free slot', renameMap.get('_ref3'), '_ref');
  check('rename/taken slots are stepped over', renameMap.get('_ref2'), '_ref3');
  check('rename/unranked survivors append after the ranked', renameMap.get('_ref5'), '_ref4');
}

// --- the state registries ---

class TestInjector extends ImportInjectorState {
  flush() { /* nothing to render - the suite locks state, not emission */ }
  generateLocalRef() { return this.generateRefName(); }
  generateDeclaredRef() {
    const name = this.generateRefName();
    this.declaredRefNames.add(name);
    return name;
  }
}
function makeInjector() {
  return new TestInjector({ absoluteImports: false, mode: 'usage-pure', pkg: '@core-js/pure', importStyle: 'import' });
}
{
  const injector = makeInjector();
  injector.registerUserPureImport('array/from', 'myFrom');
  check('registry/clean user import is the dedup target',
    injector.existingPureImports.get('usage-pure/array/from'), 'myFrom');
  const poisoned = makeInjector();
  poisoned.registerUserPureImport('array/from', 'myFrom', { reassigned: true });
  check('registry/reassigned user import is NOT a dedup target',
    poisoned.existingPureImports.has('usage-pure/array/from'), false);
  checkTruthy('registry/reassigned name still reserves its spelling', poisoned.usedNames.has('myFrom'));
  check('registry/reassigned name carries no info record', poisoned.getBindingInfo('myFrom'), null);
  check('registry/a fresh mint dedups PAST the poisoned name', poisoned.addPureImport('array/from', 'Array.from'), '_Array$from');
}
{
  const pre = makeInjector();
  const name = pre.addPureImport('self', 'self');
  check('ownership/current pass import belongs to this pass', pre.isOwnPassPureBinding(name), true);
  const post = makeInjector();
  post.pureImports = new Map(pre.pureImports);
  check('ownership/inherited map alone has no prior source proof', post.isOwnPassPureBinding(name), true);
  post.registerUserPureImport('self', name);
  check('ownership/inherited import present in the source belongs to the prior pass', post.isOwnPassPureBinding(name), false);
  const fresh = post.addPureImport('object/keys', 'Object.keys');
  check('ownership/new post import belongs to the current pass', post.isOwnPassPureBinding(fresh), true);
  const prior = makeInjector();
  prior.registerUserPureImport('self', 'userRealm');
  check('ownership/user source import is prior output', prior.isOwnPassPureBinding('userRealm'), false);
  const otherAlias = makeInjector();
  otherAlias.pureImports = new Map(pre.pureImports);
  otherAlias.registerUserPureImport('self', 'otherRealm');
  check('ownership/same source under a different name proves no prior ownership', otherAlias.isOwnPassPureBinding(name), true);
  const otherSource = makeInjector();
  otherSource.pureImports = new Map(pre.pureImports);
  otherSource.registerUserPureImport('global-this', name);
  check('ownership/same name under a different source proves no prior ownership', otherSource.isOwnPassPureBinding(name), true);
  const memo = post.generateDeclaredRef();
  check('ownership/generated receiver memo is not a pure import', post.isOwnPassPureBinding(memo), false);
  check('ownership/generated receiver memo retains current-pass provenance', post.isOwnPassGeneratedName(memo), true);
}
{
  // C2-44: the captured records must not alias the live ones
  const injector = makeInjector();
  injector.registerUserPureImport('array/from', 'aliasA');
  const captured = injector.captureImportInfoByName();
  const live = injector.getBindingInfo('aliasA');
  checkTruthy('capture/records exist on both sides', !!live && captured.has('aliasA'));
  captured.get('aliasA').hint = 'MUTATED';
  check('capture/mutating the capture does not reach the live record',
    injector.getBindingInfo('aliasA').hint, live.hint);
}
{
  const injector = makeInjector();
  const first = injector.generateDeclaredRef();
  const second = injector.generateDeclaredRef();
  check('registry/refs mint in slot order', `${ first },${ second }`, '_ref,_ref2');
  checkTruthy('registry/family membership tracks the mint', injector.isGeneratedFamilyName('_ref2'));
  const sentinel = injector.generateUnusedName();
  check('registry/sentinel family is its own', generatedNameFamilyOf(sentinel), '_unused');
  // a swap-shaped rename funnels no set into its last target, and the registries follow
  injector.canonicalizeGeneratedNames(new Map([['_ref', '_ref2'], ['_ref2', '_ref']]));
  checkTruthy('registry/swap rename keeps both declared refs', injector.declaredRefNames.has('_ref') && injector.declaredRefNames.has('_ref2'));
  check('registry/declaration order sorts family then slot',
    ['_unused', '_ref2', '_ref'].toSorted(refDeclarationOrder).join(','), '_ref,_ref2,_unused');
}
{
  // the sentinel handoff travels as a plain set
  const injector = makeInjector();
  const sentinel = injector.generateUnusedName();
  const captured = injector.captureUnusedSentinelNames();
  const fresh = makeInjector();
  fresh.rehydrateUnusedSentinelNames(captured);
  checkTruthy('registry/rehydrated sentinel re-arms the idempotency skip', fresh.hasGeneratedUnusedName(sentinel));
}

{
  // a USER-named record (body-extract alias) is span-disciplined: a positional ask inside the
  // hosting span serves it, one outside declines, and a POSITION-BLIND ask never serves it -
  // without a position the discipline cannot run, and a single record answered file-wide for
  // every same-named binding (the wrong-Maybe over-resolve the span exists to prevent). the
  // plugin-minted record stays file-wide: the allocator owns its name, no user shadow exists
  const injector = makeInjector();
  injector.registerBodyExtractAlias('from', 'array/from',
    { kind: 'const', scope: { block: { type: 'FunctionDeclaration', start: 100, end: 200 } } });
  check('registry/user record serves inside its span', injector.getBindingInfo('from', 150)?.entry, 'array/from');
  check('registry/user record declines outside its span', injector.getBindingInfo('from', 300), null);
  check('registry/user record declines a position-blind ask', injector.getBindingInfo('from', null), null);
  const minted = makeInjector();
  const uid = minted.addPureImport('array/from', 'Array.from');
  check('registry/minted record stays file-wide', minted.getBindingInfo(uid, null)?.entry, 'array/from');
}

{
  const injector = makeInjector();
  function binding(start, end) {
    return {
      kind: 'const',
      scope: { block: { type: 'FunctionDeclaration', start, end } },
    };
  }
  injector.registerBodyExtractAlias('method', 'array/from', binding(100, 500));
  injector.registerBodyExtractAlias('method', 'set/from', binding(200, 300));
  injector.registerBodyExtractAlias('method', 'map/group-by', binding(600, 700));
  injector.registerBodyExtractAlias('method', 'weak-map/upsert', binding(600, 700));
  check('registry/same-name aliases select the innermost span', injector.getBindingInfo('method', 250)?.entry, 'set/from');
  check('registry/same-name aliases return to the outer span', injector.getBindingInfo('method', 400)?.entry, 'array/from');
  check('registry/same-name aliases select a later disjoint span', injector.getBindingInfo('method', 650)?.entry, 'map/group-by');
  check('registry/duplicate span registration keeps its first entry', injector.getBindingInfo('method', 650)?.entry, 'map/group-by');
  check('registry/same-name aliases decline outside every span', injector.getBindingInfo('method', 800), null);
  injector.registerBodyExtractAlias('method', 'weak-map/upsert', binding(600, 675));
  check('registry/registration after a lookup selects a narrower equal-start span',
    injector.getBindingInfo('method', 650)?.entry, 'weak-map/upsert');
  check('registry/registration after a lookup preserves the enclosing span',
    injector.getBindingInfo('method', 690)?.entry, 'map/group-by');
  injector.registerBodyExtractAlias('method', 'array/of', binding(210, 250));
  check('registry/earlier registration does not replace the latest cached span',
    injector.getBindingInfo('method', 650)?.entry, 'weak-map/upsert');
  check('registry/earlier registration remains available through its own span',
    injector.getBindingInfo('method', 225)?.entry, 'array/of');

  // a user record is bound to a scope of the tree it was registered on: the next phase reparses
  // another one, so the capture hands over the file-wide records alone
  const uid = injector.addPureImport('array/from', 'Array.from');
  const restored = makeInjector();
  restored.rehydrateImportInfoByName(injector.captureImportInfoByName());
  check('registry/a captured user record does not reach the next phase', restored.getBindingInfo('method', 250), null);
  check('registry/a captured minted record reaches the next phase', restored.getBindingInfo(uid, null)?.entry, 'array/from');
}

// the binding a body-extract registration names, on both parsers: the alias of `a` reassigned,
// the alias of `b` readonly, `c` a parameter of the alias's own name nested in its scope
function aliasBindings(adapter, programPath) {
  function inFunction(path, fn) {
    for (let p = path.parentPath; p; p = p.parentPath) if (p.node.type === 'FunctionDeclaration') return p.node.id.name === fn;
    return false;
  }
  function bindingIn(fn) {
    return adapter.pickPath(programPath, 'CallExpression', path => path.node.callee?.name === 'use' && inFunction(path, fn))
      .scope.getBinding('from');
  }
  return { a: bindingIn('a'), b: bindingIn('b'), c: bindingIn('c'), program: programPath.scope.getBinding('from') };
}

runBoth('registry/poison is kept per binding', `
  const from = Array.from;
  function a() { let from, rest; ({ from, ...rest } = Array); from = other; use(from); }
  function b() { const { from, ...rest } = Array; use(from); }
  function c(from) { use(from); }
`, (adapter, programPath, label) => {
  const { a, b, c } = aliasBindings(adapter, programPath);
  const injector = makeInjector();
  injector.registerBodyExtractAlias('from', 'array/from', a);
  injector.registerBodyExtractAlias('from', 'array/from', b);
  check(`${ label } :: the reassigned alias is poisoned`, injector.isReassignedBinding('from', a), true);
  check(`${ label } :: the readonly sibling is not`, injector.isReassignedBinding('from', b), false);
  // the emitter replaces the readonly declaration with a rendered one, which carries no position
  const rendered = { ...b, identifier: undefined, path: { ...b.path, node: { ...b.path.node, start: undefined, end: undefined } } };
  check(`${ label } :: the readonly sibling's rendered declaration is not`, injector.isReassignedBinding('from', rendered), false);
  check(`${ label } :: a same-named parameter is not`, injector.isReassignedBinding('from', c), false);
  check(`${ label } :: a binding-less ask cannot prove it is not the poisoned one`, injector.isReassignedBinding('from'), true);
  check(`${ label } :: the readonly alias registers its fold`, injector.getBindingInfo('from', b.path.node.start)?.entry, 'array/from');
});

runBoth('registry/a user record serves its own binding', `
  function a() { const { from, ...rest } = Array; use(from); function c(from) { use(from); } }
`, (adapter, programPath, label) => {
  const injector = makeInjector();
  const alias = adapter.pickPath(programPath, 'CallExpression', path => path.node.callee?.name === 'use'
    && path.node.arguments[0]?.name === 'from').scope.getBinding('from');
  const param = adapter.collectPaths(programPath, 'CallExpression', path => path.node.callee?.name === 'use'
    && path.node.arguments[0]?.name === 'from').at(-1).scope.getBinding('from');
  injector.registerBodyExtractAlias('from', 'array/from', alias);
  const inside = param.path.node.start;
  check(`${ label } :: the alias reads its record`, injector.getBindingInfo('from', inside, () => alias)?.entry, 'array/from');
  check(`${ label } :: a nested parameter of its name reads its own value`, injector.getBindingInfo('from', inside, () => param), null);
  check(`${ label } :: an unresolved use keeps the span discipline`, injector.getBindingInfo('from', inside, () => null)?.entry, 'array/from');
});

// pre poisons on its own tree; post asks of the tree it reparses after other plugins rewrote it,
// where every position moved - what crosses is the name and the entry, the binding is found again
runBoth('registry/poison handoff survives a reprint', `
  import _Array$from from '@core-js/pure/actual/array/from';
  const shift = [0, 1, 2, 3];
  let from, rest;
  from = _Array$from, ({ from: _unused, ...rest } = Array);
  from = other;
  function b() { const from = _Array$from, { from: _unused2, ...rest } = Array; use(from); }
  function c(from) { from = other; use(from); }
  function a() { use(from); }
`, (adapter, programPath, label) => {
  const pre = makeInjector();
  const uid = pre.addPureImport('array/from', 'Array.from');
  const preTree = adapter.parseAndScope('let from, rest; ({ from, ...rest } = Array); from = other;');
  pre.registerBodyExtractAlias('from', 'array/from', preTree.scope.getBinding('from'));
  const post = makeInjector();
  post.rehydrateImportInfoByName(pre.captureImportInfoByName());
  post.rehydrateReassignedBindings(pre.captureReassignedBindings());
  check(`${ label } :: the extraction minted the import post reads`, uid, '_Array$from');
  const { b, c, program } = aliasBindings(adapter, programPath);
  check(`${ label } :: the reprinted alias is still poisoned`, post.isReassignedBinding('from', program), true);
  check(`${ label } :: its readonly sibling is not`, post.isReassignedBinding('from', b), false);
  check(`${ label } :: a reassigned same-named binding holding no extraction is not`, post.isReassignedBinding('from', c), false);
});

{
  const injector = makeInjector();
  const bindingNode = {};
  const early = { bindingNode, guarded: true, srcPos: 10, declSpan: { start: 10, end: 20 } };
  const later = { bindingNode, verified: true, declSpan: { start: 30, end: 40 } };
  injector.registerGlobalAlias('M', 'Promise', early);
  injector.registerGlobalAlias('M', 'Map', later);
  injector.registerGlobalAlias('M', 'Promise', early);
  const info = injector.getBindingAliasInfo(bindingNode, 'M');
  check('alias/revisited earlier conditional keeps later declaration', info.hint, 'Map');
  check('alias/revisited earlier conditional keeps verified status', info.aliasVerified, true);
  check('alias/verified declaration supplies the read-time write anchor', info.aliasWrite, later.declSpan);
  check('alias/name view supplies the same write anchor', injector.getBindingInfo('M').aliasWrite, later.declSpan);
  check('alias/earlier candidate remains available to guards', info.hints.join(','), 'Promise,Map');
  injector.registerGlobalAlias('M', 'Set', { bindingNode, guarded: true, srcPos: 50, declSpan: { start: 50, end: 60 } });
  check('alias/later conditional still supersedes the declaration', injector.getBindingAliasInfo(bindingNode, 'M').hint, 'Set');
  check('alias/later conditional still requires a guard', injector.getBindingAliasInfo(bindingNode, 'M').aliasGuarded, true);
  check('alias/conditional declaration supplies no trusted write anchor', injector.getBindingAliasInfo(bindingNode, 'M').aliasWrite, null);
}

for (const [label, receiver, expected, pureReads] of [
  ['nested discarded receiver', '(effect(), _realm), key(), use(_realm)', 'CallExpression,CallExpression,CallExpression', 2],
  ['nested used receiver', 'use((effect(), _realm))', null, 2],
  ['source read before key', 'source, _realm, key(), use(_realm)', 'Identifier,CallExpression,CallExpression', 2],
  ['own read alone', '_realm, use(_realm)', null, 2],
]) {
  runBoth(`census/quiet prefix/${ label }`,
    `import _realm from '@core-js/pure/actual/global-this'; const value = (${ receiver });`,
    (adapter, programPath, parser) => {
      const injector = new TestInjector({ mode: 'actual', pkg: '@core-js/pure', importStyle: 'import' });
      injector.addPureImport('global-this', 'realm');
      const census = collectInjectorCensus(programPath.node, { pureNames: new Set(['_realm']), memoReuse: true });
      unwrapWriteOnlyGuardMemos(census, {
        injectorState: injector,
        contextForMemo(name, write, occurrence) {
          let path = programPath;
          for (let at = 1; at < occurrence.ancestors.length; at++) {
            path = occurrence.listKeys[at] ? path.get(occurrence.listKeys[at])[occurrence.keys[at]] : path.get(occurrence.keys[at]);
          }
          return { scope: path.scope, path, adapter };
        },
      });
      const value = unwrapRuntimeExpr(programPath.node.body.at(-1).declarations[0].init);
      check(`${ parser } :: ${ label }/shape`, value.type, expected ? 'SequenceExpression' : 'CallExpression');
      if (expected) check(`${ parser } :: ${ label }/effects retained`, value.expressions.map(node => node.type).join(','), expected);
      check(`${ parser } :: ${ label }/liveness`, census.pureCounts.get('_realm'), pureReads);
    });
}

// Retiring a standalone capture must leave the same work as retiring one inside a sequence.
for (const [label, body, keptRead, pureReads] of [
  ['own receiver', 'var _ref; _ref = _realm; use(_ref);', false, 2],
  ['source receiver', 'const source = {}; var _ref; _ref = source; use(_ref);', true, 1],
  ['commented capture', 'var _ref; /* keep capture comment */ _ref = _realm; use(_ref);', false, 2],
  ['directive barrier', 'function read() { var _ref; _ref = _realm; "use strict"; return _ref; }', true, 3],
]) runBoth(`census/retired standalone capture/${ label }`,
  `import _realm from '@core-js/pure/actual/global-this'; ${ body }`, (parser, programPath, name) => {
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const injector = new TestInjector({ mode: 'actual', pkg: '@core-js/pure', importStyle: 'import' });
    injector.addPureImport('global-this', 'realm');
    injector.generateLocalRef();
    const census = collectInjectorCensus(programPath.node, {
      mintedRefNames: new Set(['_ref']), pureNames: new Set(['_realm']), memoReuse: true,
    });
    unwrapWriteOnlyGuardMemos(census, {
      injectorState: injector,
      contextForMemo(id, write, occurrence) {
        let path = programPath;
        for (let at = 1; at < occurrence.ancestors.length; at++) {
          path = occurrence.listKeys[at] ? path.get(occurrence.listKeys[at])[occurrence.keys[at]] : path.get(occurrence.keys[at]);
        }
        return { scope: path.scope, path, adapter };
      },
    });
    const statements = label === 'directive barrier' ? programPath.node.body.at(-1).body.body : programPath.node.body;
    check(`${ name }/${ label }/source read or directive barrier`, statements.some(node => node.type === 'ExpressionStatement'
      && unwrapRuntimeExpr(node.expression).type === 'Identifier'), keptRead);
    check(`${ name }/${ label }/import liveness`, census.pureCounts.get('_realm'), pureReads);
    if (label === 'commented capture' && parser.name === 'babel') {
      check(`${ name }/${ label }/comment retained`, statements.at(-1).leadingComments?.some(comment => comment.value.includes('keep capture comment')) ?? false, true);
    }
  });

// a memo no read reached - a later claim consumed its readers - folds into the next initialized declarator
// of its statement list as a loop header's does: its effects lead that initializer and an own pure terminal
// leaves with it; a memo a read reaches, or one with no initialized declarator after it, stays, and so does
// a rest sentinel, which captures nothing. A memo whose reads now spell its value retires through the split
// alone: folding it as well would run its effects twice
for (const [label, declarators, kept, folded] of [
  ['unread memo before a binding', '_ref = (effect(), _realm), value = (key(), pony)', 'value', 'effect,key,pony'],
  ['unread call memo', '_ref = make(), value = pony', 'value', 'make,pony'],
  ['read memo', '_ref = (effect(), make()), value = use(_ref)', '_ref,value', null],
  ['read memo beside an unread one', '_ref = (effect(), make()), value = use(_ref), _ref2 = make(), tail = pony', '_ref,value,tail', 'make,pony'],
  ['last declarator', 'value = pony, _ref = (effect(), _realm)', 'value,_ref', null],
  ['unread sentinel', '_unused = (effect(), _realm), value = (key(), pony)', '_unused,value', null],
  ['retired memo', '_ref = (effect(), _realm), value = use(_ref)', 'value', null],
]) {
  runBoth(`census/unread statement memo/${ label }`,
    `import _realm from '@core-js/pure/actual/global-this'; const ${ declarators };`,
    (harnessParser, programPath, parser) => {
      const adapter = (harnessParser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
      const injector = new TestInjector({ mode: 'actual', pkg: '@core-js/pure', importStyle: 'import' });
      injector.addPureImport('global-this', 'realm');
      injector.generateLocalRef();
      injector.generateLocalRef();
      injector.generateUnusedName();
      const census = collectInjectorCensus(programPath.node, {
        mintedRefNames: new Set(['_ref', '_ref2', '_unused']),
        pureNames: new Set(['_realm']),
        memoReuse: true,
      });
      const pureReads = census.pureCounts.get('_realm');
      unwrapWriteOnlyGuardMemos(census, {
        injectorState: injector,
        contextForMemo(name, write, occurrence) {
          let path = programPath;
          for (let at = 1; at < occurrence.ancestors.length; at++) {
            path = occurrence.listKeys[at] ? path.get(occurrence.listKeys[at])[occurrence.keys[at]] : path.get(occurrence.keys[at]);
          }
          return { scope: path.scope, path, adapter };
        },
      });
      const declarations = programPath.node.body.filter(node => node.type === 'VariableDeclaration').flatMap(node => node.declarations);
      check(`${ parser } :: ${ label }/declarators`, declarations.map(item => item.id.name).join(','), kept);
      // the comma run as evaluated - a nested or parenthesized sequence groups nothing
      function spelled(node) {
        const value = unwrapRuntimeExpr(node);
        return value.type === 'SequenceExpression' ? value.expressions.flatMap(spelled) : [value.callee?.name ?? value.name];
      }
      if (label === 'retired memo') {
        // its effect runs once, ahead of the split, and the read spells the value
        check(`${ parser } :: ${ label }/effect statements`, programPath.node.body.filter(node => node.type === 'ExpressionStatement').length, 1);
        check(`${ parser } :: ${ label }/the read spells the value`, unwrapRuntimeExpr(declarations[0].init).arguments[0].name, '_realm');
        return;
      }
      if (!folded) return;
      const next = declarations.at(-1);
      check(`${ parser } :: ${ label }/effects lead the next initializer`, spelled(next.init).join(','), folded);
      check(`${ parser } :: ${ label }/the memo leaves the census`, census.refCounts.get(label.includes('beside') ? '_ref2' : '_ref'), 0);
      check(`${ parser } :: ${ label }/an own terminal leaves the liveness count`, census.pureCounts.get('_realm'),
        declarators.includes('_ref = (effect(), _realm)') ? pureReads - 1 : pureReads);
    });
}

for (const [label, declarators, inline] of [
  ['adjacent helper', 'keep = 1, { w: memo } = source, value = helper(memo), tail = 2', true],
  ['intervening effect', '{ w: memo } = source, between = effect(), value = helper(memo)', false],
  ['another callee', '{ w: memo } = source, value = user(memo)', false],
  ['another argument', '{ w: memo } = source, value = helper(memo, effect())', false],
]) runBoth(`census/adjacent declarator/${ label }`, `const ${ declarators };`, (parser, programPath, name) => {
  const census = collectInjectorCensus(programPath.node, {
    mintedRefNames: new Set(['memo']), pureNames: new Set(['helper']), memoReuse: true,
  });
  unwrapWriteOnlyGuardMemos(census, {
    injectorState: {
      isOwnPassGeneratedName: id => id === 'memo',
      isOwnPassPureBinding: id => id === 'helper',
    },
    contextForMemo: () => ({}),
  });
  const value = parser.pickPath(programPath, 'VariableDeclarator', path => path.node.id.name === 'value').node.init;
  check(`${ name }/receiver`, value.arguments[0].type, inline ? 'MemberExpression' : 'Identifier');
  if (inline) {
    check(`${ name }/original source read moved with the method`, value.arguments[0].object.name, 'source');
    check(`${ name }/property read retained`, value.arguments[0].property.name, 'w');
    check(`${ name }/capture removed`, programPath.node.body.flatMap(node => node.declarations).every(node => node.id.type === 'Identifier'), true);
  }
});

finish();
