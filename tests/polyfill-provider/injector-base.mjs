// The injector's shared flush machinery: the census over the final tree, the write-only
// guard-memo unwrap, pure-import liveness (ctor-static exception included), the canonical
// rename map, and the state registries both emitters subclass. These are DECISIONS - one
// answer for both legs - so they lock here, on raw ESTree shapes, element-wise.
import ImportInjectorState, {
  buildCanonicalRenameMap,
  collectInjectorCensus,
  createPureImportLiveness,
  generatedNameFamilyOf,
  refDeclarationOrder,
  unwrapWriteOnlyGuardMemos,
} from '../../packages/core-js-polyfill-provider/injector-base.js';
import { unwrapRuntimeExpr } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
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

  const restored = makeInjector();
  restored.rehydrateImportInfoByName(injector.captureImportInfoByName());
  check('registry/rehydrated same-name aliases rebuild their span index', restored.getBindingInfo('method', 250)?.entry, 'set/from');
  check('registry/rehydrated same-name aliases keep the fast disjoint lookup', restored.getBindingInfo('method', 650)?.entry, 'map/group-by');
  restored.registerBodyExtractAlias('method', 'weak-map/upsert', binding(600, 675));
  check('registry/registration after rehydration selects a narrower equal-start span',
    restored.getBindingInfo('method', 650)?.entry, 'weak-map/upsert');
  check('registry/registration after rehydration preserves the enclosing span',
    restored.getBindingInfo('method', 690)?.entry, 'map/group-by');
  restored.registerBodyExtractAlias('method', 'array/of', binding(210, 250));
  check('registry/earlier registration does not replace the latest cached span',
    restored.getBindingInfo('method', 650)?.entry, 'weak-map/upsert');
  check('registry/earlier registration remains available through its own span',
    restored.getBindingInfo('method', 225)?.entry, 'array/of');
}

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
