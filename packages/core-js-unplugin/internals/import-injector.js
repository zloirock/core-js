import ImportInjectorState, {
  ORPHAN_REF_PATTERN,
  buildCanonicalRenameMap,
  collectInjectorCensus,
  createPureImportLiveness,
  generatedNameFamilyOf,
  localizeVarlessMemos,
  unwrapWriteOnlyGuardMemos,
} from '@core-js/polyfill-provider/injector-base';
import {
  isInitlessVarDecl,
  emptyMemoActivationValue,
  isTopLevelImportLike,
  programPrologueEndIndex,
  prologueEndIndex,
  isDirectiveStatement,
  markGeneratedMemoDeclarator,
  reEvaluationObservable,
  walkAstNodes,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { resolveImportPath } from '@core-js/polyfill-provider/helpers/path-normalize';
import {
  renderInjectedImportNodes,
  renderMemoActivation,
  identifier,
  variableDeclaration,
  variableDeclarator,
} from '@core-js/polyfill-provider/render';
import { replaceNodeInTree } from './emit-shared.js';

export default class ImportInjector extends ImportInjectorState {
  // refs already emitted by a prior flush (or inherited from pre via snapshot).
  // lets post emit only the delta so pre + post doesn't produce duplicate `var X;` lines
  #flushedRefs = new Set();
  #rootScope = null;

  constructor({
    absoluteImports,
    emitsGlobalModules = true,
    importStyle,
    inherit = null,
    mode,
    packages = null,
    pkg,
  }) {
    super({ absoluteImports, mode, pkg, importStyle, packages, emitsGlobalModules });
    if (inherit) this.#rehydrate(inherit);
  }

  // late-bound: outer plugin constructs debugOutput AFTER the injector. lazy lookup avoids
  // TDZ; null-safe so `phase: 'post'` direct invocations without debug still work

  #rehydrate(snap) {
    // defensive `?? EMPTY` for every field: SnapshotCache persists across long-running dev
    // servers, and a plugin-version upgrade mid-session could bring in a snapshot missing
    // newer fields. treating undefined as empty matches what a fresh injector would do.
    // EMPTY_* are allocated once per rehydrate to keep iteration alloc-free when fields
    // are present (most common case)
    const EMPTY_ARR = [];
    const EMPTY_MAP = new Map();
    for (const g of snap.globals ?? EMPTY_ARR) this.globalImports.add(g);
    for (const [k, v] of snap.globalPkgs ?? EMPTY_MAP) this.globalImportPackages.set(k, v);
    for (const [k, v] of snap.pure ?? EMPTY_MAP) this.pureImports.set(k, v);
    for (const n of snap.usedNames ?? EMPTY_ARR) this.usedNames.add(n);
    this.rehydrateUnusedSentinelNames(snap.unusedNames);
    for (const [k, v] of snap.existingPure ?? EMPTY_MAP) this.existingPureImports.set(k, v);
    for (const r of snap.refs ?? EMPTY_ARR) this.declaredRefNames.add(r);
    // pre's `var X;` is already in post's input - don't re-emit. snapshot() always emits
    // `flushedRefs` (may be empty array but never undefined); EMPTY_ARR fallback covers the
    // snapshot-absent path only
    for (const r of snap.flushedRefs ?? EMPTY_ARR) this.#flushedRefs.add(r);
    this.rehydrateSuffixState(snap.suffixState);
    this.rehydrateImportInfoByName(snap.importInfoByName);
    this.rehydrateReassignedBindings(snap.reassignedBindings);
    this.rehydrateGlobalAliases(snap.globalAliases);
  }

  // shallow-copy collections so post sees a stable view even if pre keeps mutating
  // (dev-server HMR, --force, double pre). `suffixState` carries the per-prefix counter
  // so post's `uniqueName` resumes at the next free slot instead of re-probing pre's N names.
  // deliberately SKIPS per-callback state (the destructure ledger, pending synth swaps) -
  // those track in-flight rewrites that applied in pre and whose result is already in the
  // source post re-parses. re-instating them in post would double-apply
  // flush canonicalizes the generated-name registries with the tree. In particular,
  // post resolves minted global aliases by their printed names, so stale allocation
  // spellings would transfer a constructor hint to a different receiver.
  snapshot() {
    return {
      globals: new Set(this.globalImports),
      globalPkgs: new Map(this.globalImportPackages),
      pure: new Map(this.pureImports),
      usedNames: new Set(this.usedNames),
      unusedNames: this.captureUnusedSentinelNames(),
      refs: [...this.declaredRefNames],
      flushedRefs: [...this.#flushedRefs],
      existingPure: new Map(this.existingPureImports),
      suffixState: this.captureSuffixState(),
      importInfoByName: this.captureImportInfoByName(),
      reassignedBindings: this.captureReassignedBindings(),
      globalAliases: this.captureGlobalAliases(),
    };
  }

  set rootScope(scope) { this.#rootScope = scope; }

  isNameTaken(name) {
    return this.usedNames.has(name) || (this.#rootScope?.hasBinding(name) ?? false);
  }

  // numbering is shared via `ImportInjectorState.generateRefName`; declared names go into
  // the base `declaredRefNames` so flush() can emit the `var _ref, _ref2, ...;` declaration.
  // callers choose:
  //   `generateDeclaredRef()` - queues `var _refN;` at flush (caller writes `_refN = ...`).
  //                             same abstract role as babel's `scope.push({id})`-backed
  //                             `generateDeclaredRef(scope)`; see injector-base.js docstring
  //   `generateLocalRef()`    - UID only (caller emits its own `const _refN = ...` inline)
  generateDeclaredRef() {
    const name = this.generateRefName();
    this.declaredRefNames.add(name);
    return name;
  }

  generateLocalRef() { return this.generateRefName(); }

  // the flushed-refs delta set renames alongside the base registries
  extraGeneratedNameSets() { return [this.#flushedRefs]; }

  // orphan post: snapshot lost, input is pre's output with `_ref = ...` assignments.
  // caller filters user-owned bindings; `#flushedRefs` skip avoids dup `var _ref;`
  // orphan refs adopted from pre's output (post sees the rewritten source but the state
  // snapshot was lost/disabled). `#flushedRefs.has(ref)` skip guards the shape covered by
  // `tests/unplugin/unit.mjs:checkAdoptOrphanRespectsFlushed`: a caller re-invokes this
  // after a re-hydrated state snapshot where `flushedRefs` records pre's already-emitted
  // var decls, so adopting the same name again would emit a duplicate `var _ref;`.
  // the guard is only reachable through `snapshot`/`#rehydrate` with manually populated
  // flushedRefs - production `!inherit` path hits it with an empty flushedRefs, but the
  // contract is part of the documented orphan-adoption API
  adoptOrphanRefs(orphanRefs) {
    // seed `#nextSuffixByPrefix['_ref']` to `max(suffixes) + 1` so subsequent
    // `generateRefName` skips the probe loop over already-adopted names. without this,
    // allocating a new `_ref` with 20 orphans in `usedNames` means 20 collision-probes
    // before landing on `_ref21`.
    // bare-slot reclaim is handled centrally by `uniqueName`: when bare is free but cache is
    // seeded past 2, allocator falls back to bare. so we always seed by max numeric tail
    let maxSuffix = 1;
    for (const ref of orphanRefs) {
      if (this.#flushedRefs.has(ref)) continue;
      // validate ORPHAN_REF_PATTERN BEFORE mutating refs/usedNames - the orphan-adoption
      // contract only accepts generator-shaped names (`_ref`, `_ref2..N`) that
      // `generateRefName` produces. a non-conforming `weirdName` slipping through would join
      // `#refs` and `flush` would emit `var weirdName;` from a stale snapshot, polluting output
      const match = ORPHAN_REF_PATTERN.exec(ref);
      if (!match) continue;
      this.declaredRefNames.add(ref);
      this.usedNames.add(ref);
      // extract numeric suffix (pattern caps it below Number.MAX_SAFE_INTEGER; bare `_ref` -> slot 1)
      const n = match.groups.suffix ? parseInt(match.groups.suffix, 10) : 1;
      if (n > maxSuffix) maxSuffix = n;
    }
    if (maxSuffix > 1) this.rehydrateSuffixState(new Map([['_ref', maxSuffix + 1]]));
  }
}

// the flush over the injector state above (the provider base is a pure data sink; this
// half renders it as nodes). globals and pure imports each canonically sorted through the
// one polyfill-order comparator, the same order babel prints

// the trailing edge of the leading import block AFTER the injected imports land - the
// `var _ref;` block anchors there
// the `var _ref;` anchor: the index PAST the leading import region, asked through the shared
// region canon (`isTopLevelImportLike` + the directive / initless-var step-overs) so both legs
// draw the same boundary - a re-export or an interspersed `var x;` must not truncate it
function refAnchorIndex(body, from) {
  let index = from;
  let end = from;
  while (index < body.length) {
    const statement = body[index];
    if (isTopLevelImportLike(statement)) end = ++index;
    else if (isDirectiveStatement(statement) || isInitlessVarDecl(statement)) index++;
    else break;
  }
  return end;
}

// every node reachable from the program - the flush asks it whether a recorded ref host
// still lives in the tree
function collectNodes(root) {
  const seen = new Set();
  (function walk(node) {
    if (!node || typeof node !== 'object' || seen.has(node)) return;
    seen.add(node);
    // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
    for (const key in node) {
      const value = node[key];
      if (Array.isArray(value)) for (const item of value) walk(item);
      else walk(value);
    }
  })(root);
  return seen;
}

// Remove unread minted memos whose initializers are inert. A sole statement write may also
// retire when its RHS is inert; observable writes and initializers stay in place.
// Prune empty declarations from statement lists. Multi-declarator for-heads also lose dead
// memos; a sole-declarator head stays intact. Owned initializer-local vars are also pruned
// when a guard unwrap leaves them without a read.
function dropOrphanedMemoDeclarations(program, { refCounts, refDeclIdCounts, memoStatementWrites },
  initlessRefs = null, memoActivations = null) {
  const dead = new Set();
  const deadWrites = new Set();
  // A consumed outer assignment can leave its inner receiver memo as a bare
  // write. The census proves there is no read; retain any observable RHS.
  for (const { statement, name, value } of memoStatementWrites) {
    if (refCounts.get(name) !== (refDeclIdCounts.get(name) ?? 0) + 1 || reEvaluationObservable(value)) continue;
    deadWrites.add(statement);
    refCounts.set(name, refCounts.get(name) - 1);
  }
  for (const [name, count] of refCounts) {
    if (count <= (refDeclIdCounts.get(name) ?? 0)) dead.add(name);
  }
  if (!dead.size) return;
  const lists = [];
  const heads = [];
  const activations = [];
  walkAstNodes({
    root: program,
    visit(node, parent) {
      if (Array.isArray(node?.body)) lists.push(node.body);
      else if (node?.type === 'SwitchCase') lists.push(node.consequent);
      if (node?.type === 'ForStatement' && node.init?.type === 'VariableDeclaration') heads.push(node.init);
      if (node.type === 'CallExpression' && memoActivations?.has(node.callee)) activations.push({ node, parent });
    },
  });
  // Remove eligible declarators; the caller owns the enclosing statement or for-head slot.
  function pruneDeclaration(declaration) {
    const kept = declaration.declarations.filter(item => !(item.id?.type === 'Identifier' && dead.has(item.id.name)
      && (item.init ? !reEvaluationObservable(item.init) : initlessRefs?.has(item.id.name))));
    if (kept.length === declaration.declarations.length) return false;
    for (const gone of declaration.declarations) if (!kept.includes(gone)) refCounts.set(gone.id.name, 0);
    declaration.declarations = kept;
    return true;
  }
  for (const head of heads) if (head.declarations.length > 1) pruneDeclaration(head);
  for (const list of lists) {
    for (let at = list.length - 1; at >= 0; at--) {
      const statement = list[at];
      if (deadWrites.has(statement)) {
        list.splice(at, 1);
        continue;
      }
      if (statement?.type !== 'VariableDeclaration' || !pruneDeclaration(statement)) continue;
      if (!statement.declarations.length) list.splice(at, 1);
    }
  }
  // The same walk retained each actual owned call's parent. Drop only an empty lexical
  // activation; a user arrow or a sibling-modified owner retains its own execution frame.
  for (const { node, parent } of activations.toReversed()) {
    const returned = emptyMemoActivationValue(node, memoActivations);
    if (returned) replaceNodeInTree(parent, node, returned);
  }
}

// land the injector's imports and minted `var` refs in the program: the census over the final
// tree decides which minted names are live, the survivors renumber into canonical slots, the live
// pure imports render behind the prologue and each ref declaration lands at its host's head
export function flushIntoProgram({ injector, program, refNames = [], renameOnly = [], refOrder = [], memoReuseContext = null }) {
  function resolve(subpath, pkg) {
    return resolveImportPath(pkg ?? injector.pkg, subpath, injector.absoluteImports);
  }
  // `renameOnly` names carry no declaration of their own (a pattern sentinel), but they belong
  // to the same minted family and must renumber with it - a dropped one would strand its slot
  const mintedRefNames = new Set([...refNames.map(entry => entry.name), ...renameOnly, ...refOrder]);
  const memoActivations = new WeakSet();
  const varlessRefs = new Set(refNames.filter(entry => entry.varless).map(entry => entry.name));
  const localRefs = localizeVarlessMemos(program, varlessRefs, (expression, refs) => {
    const rendered = renderMemoActivation(expression, refs);
    memoActivations.add(rendered.callee);
    return rendered;
  });
  const census = collectInjectorCensus(program, {
    mintedRefNames,
    pureNames: new Set(injector.pureImports.values()),
    memoReuse: !!memoReuseContext,
    memoActivations,
  });
  // the write-only nested guard memos unwrap BEFORE the slot rank is read - a dropped name
  // must never receive a slot
  const memoRegistrations = new Map(refNames.map(entry => [entry.name, entry]));
  unwrapWriteOnlyGuardMemos(census, {
    injectorState: injector,
    contextForMemo(name, write, occurrence) {
      let path = memoReuseContext?.path;
      if (path) {
        for (let i = 1; i < occurrence.ancestors.length; i++) {
          const key = occurrence.keys[i];
          const listKey = occurrence.listKeys[i];
          const node = occurrence.ancestors[i];
          const container = listKey ? path.node[listKey] : path.node;
          if (container?.[key] !== node) return null;
          path = path.constructor.for({ node, key, listKey, parentPath: path, ctx: path.ctx }).init();
        }
      } else path = memoRegistrations.get(name)?.path;
      return path && memoReuseContext ? { ...memoReuseContext, scope: path.scope, path } : null;
    },
  });
  // ... and an orphaned memo leaves before the slot rank is read, so its name takes no slot
  dropOrphanedMemoDeclarations(program, census, localRefs, memoActivations);
  const { referenceNames, refNodes, refCounts, printRank } = census;
  // generated-ref canon, the shared slot rule both emitters print through: a minted ref the
  // emission ended up not using is dropped, the survivors renumber into compact print-order
  // slots. minted names never collide with source spellings (the injector's uniqueName
  // guarantee), so renaming by NAME touches exactly the plugin-emitted identifiers.
  // per-FAMILY renumber: `_unused` sentinels share the census but never take `_ref` slots
  const aliveByPrefix = new Map([['_ref', new Set()], ['_unused', new Set()]]);
  for (const [name, count] of refCounts) {
    if (count > 0) aliveByPrefix.get(generatedNameFamilyOf(name)).add(name);
  }
  // a RESERVED name blocks its slot with no spelling of its own to find: a mutated global
  // slot written through a string key (`Object.defineProperty(self, '_ref3', ...)`) reaches
  // the census only through the injector's own reservation
  const renameMap = buildCanonicalRenameMap({
    printRank,
    aliveByPrefix,
    isTaken: name => referenceNames.has(name) || injector.reservedNames.has(name),
  });
  injector.dropMintedAliases([...mintedRefNames].filter(name => !refCounts.get(name)));
  injector.canonicalizeGeneratedNames(renameMap);
  for (const node of refNodes) {
    const to = renameMap.get(node.name);
    if (to) node.name = to;
  }
  const liveRefs = refNames
    .map((entry, registrationIndex) => ({ ...entry, registrationIndex, owned: injector.isOwnPassGeneratedName(entry.name) }))
    .filter(entry => !localRefs.has(entry.name) && (refCounts.get(entry.name) ?? 0) > 0)
    .sort((a, b) => printRank.indexOf(a.name) - printRank.indexOf(b.name))
    .map(entry => ({ ...entry, name: renameMap.get(entry.name) ?? entry.name }));
  const liveInProgram = createPureImportLiveness({
    pureImports: injector.pureImports,
    existingPureImports: injector.existingPureImports,
    census,
  });
  // a minted import nothing reads any more leaves the registry as well as the output, so the
  // registry IS the emission afterwards: the snapshot pre hands post and the debug report both
  // describe what was printed (the babel leg prunes its registry the same way at program exit)
  for (const [source, name] of injector.pureImports) {
    if (!liveInProgram(source, name)) injector.pureImports.delete(source);
  }
  const activePure = [...injector.pureImports].filter(([source]) => !injector.existingPureImports.has(source));
  const nodes = renderInjectedImportNodes({
    globalModules: injector.globalImports,
    pureEntries: activePure,
    importStyle: injector.importStyle,
    resolve,
    globalPackages: injector.globalImportPackages,
  }).map(entry => entry.node);
  const anchor = programPrologueEndIndex(program.body);
  program.body.splice(anchor, 0, ...nodes);
  // refs group per host body: program-level ones behind the import block, function-level
  // ones at their body's head (the babel `scope.push` anchor)
  const byHost = new Map();
  // a recorded host can be REPLACED before the flush (a drain that rebuilds a statement
  // clones the subtree it moves): the declaration would then land in a detached node and
  // the surviving reads have none. the program level always holds one, so a lost host
  // degrades there instead of dropping - a re-homed clone is the fix, this is the net
  const liveHosts = liveRefs.some(entry => entry.hostFunction || entry.hostBlock)
    ? collectNodes(program) : null;
  for (const { name, registrationIndex, owned, hostFunction, hostBlock, hostBodyless } of liveRefs) {
    let host = program;
    if ((hostFunction && !liveHosts?.has(hostFunction)) || (hostBlock && !liveHosts?.has(hostBlock))) {
      if (!byHost.has(program)) byHost.set(program, []);
      byHost.get(program).push({ name, registrationIndex, owned });
      continue;
    }
    if (hostBodyless) {
      // wrap the bodyless statement slot in a block on the final tree - babel's scope.push
      // creates the same block when a ref lands in a block-less loop / if body
      const { parent, slot } = hostBodyless;
      if (parent[slot]?.type !== 'BlockStatement') {
        parent[slot] = { type: 'BlockStatement', body: [parent[slot]] };
      }
      host = parent[slot];
    } else if (hostBlock) host = hostBlock;
    else if (hostFunction) {
      // babel's scope.push converts an expression-bodied arrow to a block - here on the
      // final tree, so the wrap can no longer be clobbered by a chain-root replacement
      if (hostFunction.body.type !== 'BlockStatement') {
        hostFunction.body = { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: hostFunction.body }] };
      }
      host = hostFunction.body;
    }
    if (!byHost.has(host)) byHost.set(host, []);
    byHost.get(host).push({ name, registrationIndex, owned });
  }
  for (const [host, entries] of byHost) {
    // a program-level block declares in print order; a function-level one in REGISTRATION
    // order - babel's scope.push appends there, and a deferred check ref (minted before the
    // receiver memo, declared after it) lands behind it (`var _ref2, _ref;`)
    // ... and the PROGRAM-level declaration groups by FAMILY whatever the print order says: the
    // two register through channels of their own - the injector opens the `var` for the refs
    // and the drain's sentinels append to it (`var _ref, _unused;`)
    const names = host === program
      ? [
        ...entries.filter(entry => generatedNameFamilyOf(entry.name) === '_ref'),
        ...entries.filter(entry => generatedNameFamilyOf(entry.name) !== '_ref'),
      ]
      : entries.toSorted((a, b) => a.registrationIndex - b.registrationIndex);
    const declaration = variableDeclaration('var', names.map(({ name, owned }) => {
      const declarator = variableDeclarator(identifier(name));
      return owned ? markGeneratedMemoDeclarator(declarator) : declarator;
    }));
    if (host === program) program.body.splice(refAnchorIndex(program.body, anchor + nodes.length), 0, declaration);
    // a function-host block anchors PAST its directive prologue (babel's scope.push slot)
    else host.body.splice(prologueEndIndex(host.body), 0, declaration);
  }
}
