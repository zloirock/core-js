import ImportInjectorState, {
  buildCanonicalRenameMap,
  canDropUnusedMemo,
  collectInjectorCensus,
  createPureImportLiveness,
  generatedNameFamilyOf,
  localizeVarlessMemos,
  refDeclarationOrder,
  retirePureImportReads,
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
  walkAstChildren,
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

  // Both forms allocate a name here. The caller records the AST declaration site;
  // flushIntoProgram owns placement and reads the final tree, including prior output.
  generateDeclaredRef() { return this.generateRefName(); }

  generateLocalRef() { return this.generateRefName(); }
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

// The node currently occupying one edge recorded by the final-tree census.
function occurrenceChildAt(parent, { keys, listKeys }, index) {
  const listKey = listKeys[index];
  return (listKey ? parent[listKey] : parent)?.[keys[index]];
}

// Look for the registered hosts in the final syntax tree. A clone can carry the same
// source range as a detached host, so only the exact block, function or loop counts.
function findDetachedRefHosts(program, refs, bindings) {
  const detached = new Set();
  for (const { host } of refs) if (host) detached.add(host);
  for (const { host, name } of refs) {
    if (!detached.has(host)) continue;
    const binding = bindings.get(name);
    const occurrence = binding?.reads[0] ?? binding?.writes[0] ?? binding?.declarations[0];
    if (!occurrence || occurrence.ancestors[0] !== program) continue;
    // Cleanup may move a use or one of its ancestors. Only a still-attached prefix
    // of the final census can certify a host; look up the remaining hosts together.
    for (let i = 1; i < occurrence.ancestors.length; i++) {
      const node = occurrence.ancestors[i];
      if (occurrenceChildAt(occurrence.ancestors[i - 1], occurrence, i) !== node) break;
      detached.delete(node);
      if (!detached.size) return detached;
      if (node === host) break;
    }
  }
  if (detached.size) {
    const seen = new Set();
    const stack = [program];
    function enqueue(child) { stack.push(child); }
    while (detached.size && stack.length) {
      const node = stack.pop();
      if (seen.has(node)) continue;
      seen.add(node);
      detached.delete(node);
      if (detached.size) walkAstChildren(node, enqueue);
    }
  }
  return detached;
}

// Remove unread minted memos whose initializers are inert. A sole statement write may also
// retire when its RHS is inert; observable writes and initializers stay in place.
// Prune empty declarations from statement lists. Multi-declarator for-heads also lose dead
// memos; a sole-declarator head stays intact. Owned initializer-local vars are also pruned
// when a guard unwrap leaves them without a read.
function dropOrphanedMemoDeclarations(program, census,
  initlessRefs = null, memoActivations = null) {
  const { refCounts, refDeclIdCounts, memoStatementWrites } = census;
  const dead = new Set();
  const deadWrites = new Set();
  // A consumed outer assignment can leave its inner receiver memo as a bare
  // write. The census proves there is no read; retain any observable RHS.
  for (const { statement, target, name, value } of memoStatementWrites) {
    if (!canDropUnusedMemo(target, value, {
      owned: refCounts.has(name),
      hasUses: refCounts.get(name) !== (refDeclIdCounts.get(name) ?? 0) + 1,
      removable: true,
    })) continue;
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
    const kept = declaration.declarations.filter(item => !canDropUnusedMemo(item.id, item.init, {
      owned: refCounts.has(item.id?.name) && (item.init || initlessRefs?.has(item.id?.name)),
      hasUses: !dead.has(item.id?.name),
      removable: true,
    }));
    if (kept.length === declaration.declarations.length) return false;
    for (const gone of declaration.declarations) if (!kept.includes(gone)) {
      refCounts.set(gone.id.name, 0);
      retirePureImportReads(gone.init, census);
    }
    declaration.declarations = kept;
    return true;
  }
  for (const head of heads) if (head.declarations.length > 1) pruneDeclaration(head);
  for (const list of lists) {
    for (let at = list.length - 1; at >= 0; at--) {
      const statement = list[at];
      if (deadWrites.has(statement)) {
        retirePureImportReads(statement.expression.right, census);
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
          if (occurrenceChildAt(path.node, occurrence, i) !== node) return null;
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
    .map((entry, registrationIndex) => ({
      ...entry, registrationIndex, owned: injector.isOwnPassGeneratedName(entry.name),
      host: entry.hostBodyless?.parent ?? entry.hostBlock ?? entry.hostFunction,
    }))
    .filter(entry => !localRefs.has(entry.name) && (refCounts.get(entry.name) ?? 0) > 0)
    .sort((a, b) => printRank.indexOf(a.name) - printRank.indexOf(b.name));
  const detachedHosts = findDetachedRefHosts(program, liveRefs, census.memoBindings);
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
  for (const { name: original, registrationIndex, owned, host: registeredHost, hostFunction, hostBlock, hostBodyless } of liveRefs) {
    const name = renameMap.get(original) ?? original;
    let host = program;
    if (detachedHosts.has(registeredHost)) {
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
      ? entries.toSorted((a, b) => refDeclarationOrder(a.name, b.name))
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
