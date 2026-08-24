import ImportInjectorState, {
  CANONICAL_REF_PREFIXES,
  ORPHAN_REF_PATTERN,
  renameNamesSet,
  UNUSED_NAME_PATTERN,
  assignCanonicalRefSlots,
} from '@core-js/polyfill-provider/injector-base';
import { entryToGlobalHint } from '@core-js/polyfill-provider';
import {
  blocksUidSlot,
  isInitlessVarDecl,
  isNonReferencePosition,
  isTopLevelImportLike,
  memberKeyNamesReducer,
  staticMemberFromEntrySegment,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { resolveImportPath } from '@core-js/polyfill-provider/helpers/path-normalize';
import { polyfillOrderComparator, sortByPolyfillOrder } from '@core-js/polyfill-provider/plugin-options/inject';
import { walkAstNodes, isDirectiveStatement } from './plugin-helpers.js';
import { bareImport, bareRequire, defaultImport, identifier, varRequire, variableDeclaration, variableDeclarator } from './builders.js';

export default class ImportInjector extends ImportInjectorState {
  // iteration order is insertion-preserving, so emitted `var _ref, _ref2, ...;` stays stable
  #refs = new Set();
  // every generated slot-family name (prefix -> Set): `_refN` declared + local AND
  // `_unusedN` rest sentinels - the registry the final print-order canonicalization renames
  // from; adopted orphans stay out (their spellings live in the previous pass's text, out
  // of rename reach)
  #generatedByPrefix = new Map(CANONICAL_REF_PREFIXES.map(prefix => [prefix, new Set()]));
  // refs already emitted by a prior flush (or inherited from pre via snapshot).
  // lets post emit only the delta so pre + post doesn't produce duplicate `var X;` lines
  #flushedRefs = new Set();
  #rootScope = null;
  // `_unusedN` sentinels left by pre's rest-destructure rebuild - post recognises them via
  // hasGeneratedUnusedName() and skips re-processing the same `{ key: _unusedN, ...rest }`
  #unusedNames = new Set();
  // the subset of `#unusedNames` that came from ADOPTION (a census position in a re-parsed
  // source, not a mint of ours nor a snapshot): the emitter's skip asks one more question of
  // those - is our extraction standing with the sentinel? - before treating them as its own
  #adoptedUnusedNames = new Set();

  constructor({
    absoluteImports,
    importStyle,
    inherit = null,
    mode,
    packages = null,
    pkg,
  }) {
    super({ absoluteImports, mode, pkg, importStyle, packages });
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
    for (const [k, v] of snap.pure ?? EMPTY_MAP) this.pureImports.set(k, v);
    for (const n of snap.usedNames ?? EMPTY_ARR) this.usedNames.add(n);
    for (const n of snap.unusedNames ?? EMPTY_ARR) this.#unusedNames.add(n);
    for (const [k, v] of snap.existingPure ?? EMPTY_MAP) this.existingPureImports.set(k, v);
    for (const r of snap.refs ?? EMPTY_ARR) this.#refs.add(r);
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
  snapshot() {
    return {
      globals: new Set(this.globalImports),
      pure: new Map(this.pureImports),
      usedNames: new Set(this.usedNames),
      unusedNames: new Set(this.#unusedNames),
      refs: [...this.#refs],
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

  // numbering is shared via `ImportInjectorState.generateRefName`; we track declared names
  // locally so flush() can emit the `var _ref, _ref2, ...;` declaration. callers choose:
  //   `generateDeclaredRef()` - queues `var _refN;` at flush (caller writes `_refN = ...`).
  //                             same abstract role as babel's `scope.push({id})`-backed
  //                             `generateDeclaredRef(scope)`; see injector-base.js docstring
  //   `generateLocalRef()`    - UID only (caller emits its own `const _refN = ...` inline)
  generateDeclaredRef() {
    const name = this.generateRefName();
    this.#refs.add(name);
    return name;
  }

  generateLocalRef() { return this.generateRefName(); }

  generateRefName(extraCheck) {
    const name = super.generateRefName(extraCheck);
    this.#generatedByPrefix.get('_ref').add(name);
    return name;
  }

  generatedRefFamilies() { return this.#generatedByPrefix; }

  // a slot the canonical renumber may NOT hand out: taken by anything that is not one of
  // our own generated names (a user binding, an adopted orphan, an import UID)
  isRefSlotForeign(name) {
    for (const [, names] of this.#generatedByPrefix) if (names.has(name)) return false;
    return this.isNameTaken(name);
  }

  // the registries keyed by a GENERATED name - the one list both the drop and the rename walk, so
  // no registry keeps a spelling the tree no longer has: the declared refs, the flushed refs,
  // the rest sentinels, the taken-name set, and the per-family generated sets
  #generatedNameSets() {
    return [
      ['refs', this.#refs],
      ['flushedRefs', this.#flushedRefs],
      ['unusedNames', this.#unusedNames],
      ['adoptedUnusedNames', this.#adoptedUnusedNames],
      ['usedNames', this.usedNames],
      ...[...this.#generatedByPrefix].map(([prefix, names]) => [prefix, names]),
    ];
  }

  #setGeneratedNameSet(key, set) {
    switch (key) {
      case 'refs': this.#refs = set; break;
      case 'flushedRefs': this.#flushedRefs = set; break;
      case 'unusedNames': this.#unusedNames = set; break;
      case 'adoptedUnusedNames': this.#adoptedUnusedNames = set; break;
      case 'usedNames': this.usedNames = set; break;
      default: this.#generatedByPrefix.set(key, set);
    }
  }

  // a ref whose only surviving occurrence was stripped (the dead-memo retire) leaves every
  // registry - the flush must not print a dead `var _refX;`, and the slot is free again for
  // the canonical renumber
  dropRefs(names) {
    for (const [, set] of this.#generatedNameSets()) for (const name of names) set.delete(name);
    this.dropMintedAliases(names);
  }

  // final print-order canonicalization (`assignCanonicalRefSlots`). the flush then declares
  // the renamed refs under their canonical names in slot order. every registry is rebuilt through
  // `renameNamesSet` - a sequential delete / add over a swap-shaped map (`_ref -> _ref2`,
  // `_ref2 -> _ref`) funnels a set into its last target
  canonicalizeRefs(renameMap) {
    if (!renameMap.size) return;
    for (const [key, set] of this.#generatedNameSets()) this.#setGeneratedNameSet(key, renameNamesSet(set, renameMap));
    this.renameMintedAliases(renameMap);
  }

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
      this.#refs.add(ref);
      this.usedNames.add(ref);
      // extract numeric suffix (pattern caps it below Number.MAX_SAFE_INTEGER; bare `_ref` -> slot 1)
      const n = match.groups.suffix ? parseInt(match.groups.suffix, 10) : 1;
      if (n > maxSuffix) maxSuffix = n;
    }
    if (maxSuffix > 1) this.rehydrateSuffixState(new Map([['_ref', maxSuffix + 1]]));
  }

  // `_unused` counterpart of `adoptOrphanRefs`: post without a pre snapshot re-parses pre's
  // output where rest-destructure sentinels (`{ polyKey: _unusedN, ...rest }`) are already
  // in place. re-registering them re-arms `hasGeneratedUnusedName`, whose skip is the
  // idempotency guard - without it post re-processes the rebuilt destructure (a dead
  // body-extract binding + a re-keyed `_unusedN+1` per re-pass). no flush concern: sentinels
  // are bound by the pattern itself, never declared separately. the caller hands over only the
  // names in the ONE position the emitter prints a sentinel in (the census' `restSentinelNames`:
  // a rest-bearing pattern's property value that nothing reads) - the name shape alone is not
  // origin, and a user's `{ at: _unused2, ...rest }` whose `_unused2` IS read must keep its
  // polyfill. the generator-shape check here is the second half of the same gate
  adoptUnusedNames(names) {
    let maxSuffix = 1;
    for (const name of names) {
      // same generator-shape validation as orphan refs: only allocator-shaped names join,
      // so a stale snapshot can never seed an arbitrary user identifier into the skip set
      const match = UNUSED_NAME_PATTERN.exec(name);
      if (!match) continue;
      this.#unusedNames.add(name);
      this.#adoptedUnusedNames.add(name);
      this.usedNames.add(name);
      const n = match.groups.suffix ? parseInt(match.groups.suffix, 10) : 1;
      if (n > maxSuffix) maxSuffix = n;
    }
    if (maxSuffix > 1) this.rehydrateSuffixState(new Map([['_unused', maxSuffix + 1]]));
  }

  generateUnusedName() {
    const name = super.generateUnusedName();
    this.#unusedNames.add(name);
    this.#generatedByPrefix.get('_unused').add(name);
    return name;
  }

  hasGeneratedUnusedName(name) {
    return this.#unusedNames.has(name);
  }

  isAdoptedUnusedName(name) {
    return this.#adoptedUnusedNames.has(name);
  }
}

// the flush over the injector state above (the provider base is a pure data sink; this
// half renders it as nodes). globals and pure imports each canonically sorted through the
// one polyfill-order comparator, the same order babel prints

function importAnchorIndex(body) {
  let index = 0;
  while (index < body.length && isDirectiveStatement(body[index])) index++;
  return index;
}

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

// the single-pass orphan filter: a pure import whose minted
// name no longer appears in the tree was superseded by a later routing - EXCEPT a pure
// STATIC whose module attaches the method to the pure constructor on load: when any
// emission reads that static through the injected constructor (`_Map.groupBy`), the
// binding-unused import stays load-bearing
// the census also serves the generated-ref canon below: `refNodes` / `printRank` see only
// REFERENCE positions (a member key or object key spelling a slot-shaped name is source
// text, same rule the babel census applies), while `usedNames` deliberately stays
// position-blind - any spelling keeps the import alive
function collectLiveness(program, mintedRefNames, { retire = null } = {}) {
  // the census answers about the tree the flush RENUMBERS, so a retire pass that reshapes it
  // runs first - a name it drops must never reach the slot rank
  retire?.(program, mintedRefNames);
  const usedNames = new Set();
  const memberReads = new Set();
  const referenceNames = new Set();
  const refNodes = new Set();
  const refCounts = new Map();
  const printRank = [];
  const declFirstNames = new Set();
  // an id-rooted member KEY reserves its name too - the census both legs share
  const memberKeys = memberKeyNamesReducer();
  walkAstNodes({ root: program, visit(node, parent) {
    // a `:` slot is where babel's uid scan stops: a name written past one claims nothing
    // (`declare const v: { _ref2(): void }` leaves `_ref2` free), while a type-alias RHS or
    // an interface body carries no such wrapper and is walked at any depth (`false` prunes)
    if (node.type === 'TSTypeAnnotation') return false;
    if (node.type === 'Identifier') {
      usedNames.add(node.name);
      // what may be REWRITTEN and what BLOCKS a slot are two questions: a source-text name is
      // never rewritten, yet an overload signature's key still reserves its name
      if (!isNonReferencePosition(parent, node)) {
        if (mintedRefNames.has(node.name)) {
          refNodes.add(node);
          const count = refCounts.get(node.name) ?? 0;
          // a generated memo DECLARATION hoists above the statement it serves, so its binding id is
          // not where the name was needed: babel numbers it at the point of the second READ. the
          // name still ranks - just at that read, and at its declaration when nothing reads it
          if (!count && parent?.type === 'VariableDeclarator' && parent.id === node && parent.init) {
            declFirstNames.add(node.name);
          } else if (!printRank.includes(node.name)) printRank.push(node.name);
          refCounts.set(node.name, count + 1);
        } else referenceNames.add(node.name);
      } else if (blocksUidSlot(parent, node)) referenceNames.add(node.name);
    }
    if (node.type === 'MemberExpression' && node.object?.type === 'Identifier') {
      const key = node.computed
        ? (node.property?.type === 'Literal' ? node.property.value : null)
        : node.property?.name;
      if (key) memberReads.add(`${ node.object.name }.${ key }`);
    }
    memberKeys.visit(node);
  } });
  for (const name of declFirstNames) if (!printRank.includes(name)) printRank.push(name);
  for (const name of memberKeys.result().memberKeyNames) {
    if (!mintedRefNames.has(name)) referenceNames.add(name);
  }
  return { usedNames, memberReads, referenceNames, refNodes, refCounts, printRank };
}

// dead nested guard-memo strip, the twin of babel's `guardCensus` + prune: a guard memo nested DIRECTLY inside
// an outer guard's test slot whose ref nothing reads (`null == (_refY = null == (_refX = root)
// ? void 0 : ...)`) is write-only - the outer test already owns the one evaluation. the deadness
// only exists AFTER composition, so the strip runs here, ahead of the slot census. a TOP-LEVEL
// guard keeps its memo (the locked kept-swap canon)
function retireNestedGuardMemos(program, mintedRefNames) {
  // nothing minted - nothing to retire, and the full-tree walk below is pure cost
  if (!mintedRefNames.size) return;
  const counts = new Map();
  const sites = [];
  function nullSide(binary, other) {
    if (binary?.type !== 'BinaryExpression' || binary.operator !== '==') return false;
    const opposite = binary.left === other ? binary.right : binary.right === other ? binary.left : null;
    return opposite?.type === 'Literal' && opposite.value === null;
  }
  (function visit(node, ancestors) {
    if (Array.isArray(node)) {
      for (const item of node) visit(item, ancestors);
      return;
    }
    if (!node || typeof node !== 'object' || !node.type) return;
    if (node.type === 'Identifier' && mintedRefNames.has(node.name) && !isNonReferencePosition(ancestors.at(-1), node)) {
      counts.set(node.name, (counts.get(node.name) ?? 0) + 1);
    }
    if (node.type === 'AssignmentExpression' && node.operator === '=' && node.left?.type === 'Identifier'
      && mintedRefNames.has(node.left.name)) {
      const test = ancestors.at(-1);
      const cond = ancestors.at(-2);
      const outer = ancestors.at(-3);
      const grand = ancestors.at(-4);
      if (nullSide(test, node) && cond?.type === 'ConditionalExpression' && cond.test === test
        && cond.consequent?.type === 'UnaryExpression' && cond.consequent.operator === 'void'
        && outer?.type === 'AssignmentExpression' && outer.right === cond
        && outer.left?.type === 'Identifier' && mintedRefNames.has(outer.left.name)
        && nullSide(grand, outer)) sites.push({ node, test });
    }
    ancestors.push(node);
    // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
    for (const key in node) visit(node[key], ancestors);
    ancestors.pop();
  })(program, []);
  for (const { node, test } of sites) {
    if (counts.get(node.left.name) !== 1) continue;
    if (test.left === node) test.left = node.right;
    else test.right = node.right;
  }
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

// the minted family a generated name belongs to: the two renumber in slot spaces of their own
// and declare in that same order where they share a `var`
function refFamilyOf(name) {
  return name.startsWith('_unused') ? '_unused' : '_ref';
}

export function flushIntoProgram({ injector, program, refNames = [], renameOnly = [], refOrder = [] }) {
  const isRequire = injector.importStyle === 'require';
  function resolve(subpath) {
    return resolveImportPath(injector.pkg, subpath, injector.absoluteImports);
  }
  const nodes = [];
  for (const moduleName of sortByPolyfillOrder(injector.globalImports)) {
    const path = resolve(`modules/${ moduleName }`);
    nodes.push(isRequire ? bareRequire(path) : bareImport(path));
  }
  // `renameOnly` names carry no declaration of their own (a pattern sentinel), but they belong
  // to the same minted family and must renumber with it - a dropped one would strand its slot
  const mintedRefNames = new Set([...refNames.map(entry => entry.name), ...renameOnly, ...refOrder]);
  const { usedNames, memberReads, referenceNames, refNodes, refCounts, printRank } =
    collectLiveness(program, mintedRefNames, { retire: retireNestedGuardMemos });
  // generated-ref canon, the shared slot rule both emitters print through: a minted ref the
  // emission ended up not using is dropped, the survivors renumber into compact print-order
  // slots. minted names never collide with source spellings (the injector's uniqueName
  // guarantee), so renaming by NAME touches exactly the plugin-emitted identifiers
  // per-FAMILY renumber: `_unused` sentinels share the census but never take `_ref` slots
  const renameMap = new Map();
  for (const prefix of ['_ref', '_unused']) {
    const familyRank = printRank.filter(name => refFamilyOf(name) === prefix);
    // a RESERVED name blocks its slot with no spelling of its own to find: a mutated global
    // slot written through a string key (`Object.defineProperty(self, '_ref3', ...)`) reaches
    // the census only through the injector's own reservation
    for (const [from, to] of assignCanonicalRefSlots(prefix, familyRank,
      name => referenceNames.has(name) || injector.reservedNames.has(name))) {
      renameMap.set(from, to);
    }
  }
  for (const node of refNodes) {
    const to = renameMap.get(node.name);
    if (to) node.name = to;
  }
  const liveRefs = refNames
    .map((entry, registrationIndex) => ({ ...entry, registrationIndex }))
    .filter(entry => refCounts.has(entry.name))
    .sort((a, b) => printRank.indexOf(a.name) - printRank.indexOf(b.name))
    .map(entry => ({ ...entry, name: renameMap.get(entry.name) ?? entry.name }));
  const ctorNameByNamespace = new Map();
  for (const [source, name] of injector.pureImports) {
    const segments = source.split('/');
    if (segments.at(-1) === 'constructor') ctorNameByNamespace.set(segments.at(-2), name);
  }
  function liveInProgram(source, name) {
    if (usedNames.has(name)) return true;
    const segments = source.split('/');
    const ctor = segments.length >= 2 ? ctorNameByNamespace.get(segments.at(-2)) : null;
    if (!ctor) return false;
    const key = staticMemberFromEntrySegment(entryToGlobalHint(segments.at(-2)), segments.at(-1));
    return memberReads.has(`${ ctor }.${ key }`);
  }
  const activePure = [...injector.pureImports]
    .filter(([source, name]) => !injector.existingPureImports.has(source) && liveInProgram(source, name))
    .sort(([a], [b]) => polyfillOrderComparator(a, b));
  for (const [source, name] of activePure) {
    const path = resolve(source);
    nodes.push(isRequire ? varRequire(name, path) : defaultImport(name, path));
  }
  const anchor = importAnchorIndex(program.body);
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
  for (const { name, registrationIndex, hostFunction, hostBlock, hostBodyless } of liveRefs) {
    let host = program;
    if ((hostFunction && !liveHosts?.has(hostFunction)) || (hostBlock && !liveHosts?.has(hostBlock))) {
      if (!byHost.has(program)) byHost.set(program, []);
      byHost.get(program).push({ name, registrationIndex });
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
    byHost.get(host).push({ name, registrationIndex });
  }
  for (const [host, entries] of byHost) {
    // a program-level block declares in print order; a function-level one in REGISTRATION
    // order - babel's scope.push appends there, and a deferred check ref (minted before the
    // receiver memo, declared after it) lands behind it (`var _ref2, _ref;`)
    // ... and the PROGRAM-level declaration groups by FAMILY whatever the print order says: the
    // two register through channels of their own - the injector opens the `var` for the refs
    // and the drain's sentinels append to it (`var _ref, _unused;`)
    const names = (host === program
      ? [...entries.filter(entry => refFamilyOf(entry.name) === '_ref'),
        ...entries.filter(entry => refFamilyOf(entry.name) !== '_ref')]
      : entries.toSorted((a, b) => a.registrationIndex - b.registrationIndex)).map(entry => entry.name);
    const declaration = variableDeclaration('var', names.map(name => variableDeclarator(identifier(name))));
    if (host === program) program.body.splice(refAnchorIndex(program.body, anchor + nodes.length), 0, declaration);
    // a function-host block anchors PAST its directive prologue (babel's scope.push slot)
    else host.body.splice(importAnchorIndex(host.body), 0, declaration);
  }
}
