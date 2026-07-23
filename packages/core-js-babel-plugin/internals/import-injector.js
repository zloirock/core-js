import { resolveImportPath } from '@core-js/polyfill-provider/helpers/path-normalize';
import {
  isDirectiveStatement, isInitlessVarDecl, isNonReferencePosition, isTopLevelImportLike,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import ImportInjectorState, {
  assignCanonicalRefSlots,
  CANONICAL_REF_PREFIXES,
  isGeneratedSlotShapedName,
  refDeclarationOrder,
  refSlotName,
  renameNamesSet,
} from '@core-js/polyfill-provider/injector-base';
import { polyfillOrderComparator, sortByPolyfillOrder } from '@core-js/polyfill-provider/plugin-options/inject';

// babel@7 exposes `scope.references` / `scope.uids` as object maps; babel@8 replaced them
// with `scope.referencesSet` / `scope.uidsSet` (real Sets) and throws on the legacy
// accessors. one probe of any scope at injector construction commits the bag to a single
// path - no runtime checks on subsequent calls. the API surface is invariant across all
// scopes of a given babel install, so probing once is sufficient
function makeScopeBag(probeScope, setKey, mapKey) {
  if (probeScope[setKey]) return {
    has: (scope, name) => scope[setKey].has(name),
    add: (scope, name) => scope[setKey].add(name),
  };
  return {
    has: (scope, name) => !!scope[mapKey]?.[name],
    add(scope, name) { (scope[mapKey] ??= {})[name] = true; },
  };
}

export default class ImportInjector extends ImportInjectorState {
  #t;
  #programPath;
  // binding name -> babel Identifier node (flushed imports clone it to preserve range/loc).
  // hint / source live on the base class via `#importInfoByName` + `existingPureImports`
  #idByName = new Map();
  // every Identifier node this injector PLACED into the AST (the clones `addPureImport`
  // hands back, which the substitution visitor drops in via `replaceWith`). node-IDENTITY
  // membership, not name: a polyfill-rewritten member key (`[Symbol.iterator]` -> the placed
  // `[_Symbol$iterator]`) is in here; a user binding the user typed - including the user's own
  // deduped `@core-js/pure` import reused under the same UID - is NOT. consumed by the
  // computed-key synth gate to bail exactly the rewritten-member keys unplugin also bails on
  #injectedRefs = new WeakSet();
  // flush runs multiple times (pre, programExit, deferred SE) - skip already-emitted.
  // `#emittedGlobals`: modules WE wrote out (subtract from `globalImports` in `#buildNodes`
  // to compute newGlobals; drives `hasFlushed` for postHook's late-CJS diagnostic).
  // `#suppressedGlobals`: user's pre-existing imports (subtract from `globalImports` to
  // avoid duplicate-emit; does NOT drive `hasFlushed` - user imports don't count as plugin
  // activity). two sets keep the emitted-vs-suppressed semantics separate
  #emittedGlobals = new Set();
  #suppressedGlobals = new Set();
  #flushedPure = new Set();
  // emit history for canonical reorder at programExit. each `flush()` only sorts WITHIN
  // its own batch; with two flushes per file (pre / post-synth-swap) the cross-batch
  // relative order can invert vs canonical. node -> canonical key map per emit so
  // `reorderImportRegion()` can lift surviving emissions and re-sort the union in one go
  #emittedKeyByNode = new Map();
  // `_ref` names - iterated by pruneUnusedRefs at programExit
  #refs = new Set();
  // every generated slot-family name (prefix -> Set): `_refN` declared + local const UIDs
  // AND `_unusedN` rest sentinels - the whole slot space the print-order canonicalization
  // renumbers; `#refs` is the declared `_ref` subset the prune manages
  #generatedByPrefix = new Map(CANONICAL_REF_PREFIXES.map(prefix => [prefix, new Set()]));
  // coupling state: `reorderRefsAfterImports` assumes the import-region is already
  // canonical-sorted (so its `isImportRegion` accumulator finds the contiguous prefix
  // ending at the same byte position regardless of pre/post flush ordering). without
  // pre-sort the ref-region boundary may land mid-imports, leaving `var _ref;` above
  // sibling imports. flag set by `reorderImportRegion`, asserted by
  // `reorderRefsAfterImports` so caller-order violations surface as a clear error
  #importRegionSorted = false;
  // scope-bag accessors specialised once per injector to the babel version's API
  #scopeReferences;
  #scopeUids;

  constructor({ t, programPath, pkg, packages = null, mode, importStyle, absoluteImports = false }) {
    super({ absoluteImports, mode, pkg, importStyle, packages });
    this.#t = t;
    this.#programPath = programPath;
    const program = programPath.scope.getProgramParent();
    this.#scopeReferences = makeScopeBag(program, 'referencesSet', 'references');
    this.#scopeUids = makeScopeBag(program, 'uidsSet', 'uids');
  }

  // post-hook safety-net needs to know whether any import has already been written so
  // it doesn't switch `importStyle` mid-file and produce ESM+CJS mixed output
  get hasFlushed() {
    return this.#emittedGlobals.size > 0 || this.#flushedPure.size > 0;
  }

  isNameTaken(name) {
    if (super.isNameTaken(name)) return true;
    const { scope } = this.#programPath;
    const program = scope.getProgramParent();
    // `program.globals` captures undeclared identifier uses - sloppy-mode assignment
    // targets (`_Map = foo()`) and unbound reads (`Map` as NewExpression callee) both
    // land here. without it, UID generator would pick `_Map` and collide with a user's
    // accidental `_Map = ...` sloppy global (reassigning our const import throws at runtime)
    return scope.hasBinding(name) || !!program.globals[name]
      || this.#scopeReferences.has(program, name) || this.#scopeUids.has(program, name);
  }

  // publish every allocated UID into program.references/.uids so sibling transforms
  // don't collide via scope.generateUidIdentifierBasedOnNode.
  // writing to babel internals is fragile but intentional: `scope.generateUid` strips
  // trailing digits (turning `_ref9` into `_ref` on next call), which breaks our skip-1
  // `_ref, _ref2, _ref3, ...` scheme. publishing to .references/.uids is the smallest
  // bridge to babel's UID tracking that preserves the scheme. `scope.crawl()` at programExit
  // resets both `.references` and `.uids` (babel@7 and @8 `resetScope` clears both Sets), so the
  // scheme survives via `usedNames` durability + reads happening after the crawl, not via `.uids`
  uniqueName(prefix, extraCheck) {
    const name = super.uniqueName(prefix, extraCheck);
    const program = this.#programPath.scope.getProgramParent();
    this.#scopeReferences.add(program, name);
    this.#scopeUids.add(program, name);
    return name;
  }

  // own UID generator - Babel's scope.generateUidIdentifier strips trailing digits,
  // so after `_ref9` it would hand out `_ref` / `_ref2` instead of `_ref10` / `_ref11`,
  // colliding with earlier slots.
  // callers choose:
  //   `generateDeclaredRef(scope)` - `scope.push({id})` emits `var _refN;` at the target block
  //   `generateLocalRef(scope)`    - UID only (caller emits its own `const _refN = ...` inline)
  // arrow-expression-body declarations are normalized post-pass by `normalizeArrowRefParams`
  // (see there for why it can't run in-visit)
  #generateRefId(scope) {
    const name = this.generateRefName(n => scope.hasBinding(n));
    this.#refs.add(name);
    return this.#t.identifier(name);
  }

  generateRefName(extraCheck) {
    const name = super.generateRefName(extraCheck);
    this.#generatedByPrefix.get('_ref').add(name);
    return name;
  }

  generateUnusedName() {
    const name = super.generateUnusedName();
    this.#generatedByPrefix.get('_unused').add(name);
    return name;
  }

  #isGeneratedName(name) {
    for (const [, names] of this.#generatedByPrefix) if (names.has(name)) return true;
    return false;
  }

  // provenance registry for the plugin's OWN memo writes (`_ref = <expr>` built by the
  // compat memoize): the synthesized assignment never registers a scope constantViolation,
  // so the resolver's trusted-write follow cannot see it - this per-file map is the proof
  // of the single synthetic write (ref names are unique per file by construction)
  #memoWrites = new Map();

  recordMemoWrite(name, assignNode) {
    this.#memoWrites.set(name, assignNode);
  }

  getMemoWrite(name) {
    return this.#memoWrites.get(name) ?? null;
  }

  // declarator registry for the same refs: the memo-dense append path below skips babel's
  // per-ref binding registration (quadratic), so a MID-PASS scope lookup misses those refs -
  // the registry serves a synthetic binding view until the programExit re-crawl
  #memoDeclarators = new Map();

  getMemoDeclarator(name) {
    return this.#memoDeclarators.get(name) ?? null;
  }

  generateDeclaredRef(scope, useNode) {
    const id = this.#generateRefId(scope);
    // `scope.push` unshifts `var _ref;` into the scope's own block. when the use site sits in a
    // HEADER/SIGNATURE position - a loop header or a function parameter list - that block-hosted var
    // is unreachable from the use, so hoist to the enclosing scope instead (matching unplugin's
    // enclosing-scope anchor); see #refUseEscapesScopeBlock for the two cases
    const target = this.#refUseEscapesScopeBlock(scope, useNode) ? scope.parent : scope;
    this.#pushRefDeclarator(target, id);
    return id;
  }

  // append a `var <id>;` declarator to `target`'s scope. first ref per scope goes through
  // babel's own `scope.push` (block-ensure / params-push semantics stay babel's); every
  // later ref appends a declarator to the SAME hosting declaration directly and registers
  // it through an INDEXED path get - babel's `push` re-materializes a path for every
  // existing declarator on each call, quadratic on memo-dense files. a params-push landing
  // (arrow expression body / IIFE FunctionExpression - no declaration to append to) is
  // detected by the trailing param and recorded for the post-pass normalizer, falling back
  // to per-ref `scope.push` for that scope
  #declaredRefHosts = new Map();
  #hasParamLandedRef = false;
  #pushRefDeclarator(target, id) {
    const host = this.#declaredRefHosts.get(target);
    if (host?.node?.declarations && host.parentPath) {
      // `id` goes in directly (no clone) - babel's own `push` binds the very identifier it
      // was handed. NO per-ref `registerBinding`: the path it needs re-materializes every
      // sibling declarator (`get('declarations.N')` walks the whole list - quadratic on
      // memo-dense files), name collisions are guarded by the injector's own `usedNames`
      // (not scope lookups), and `pruneUnusedRefs` re-crawls the scope at programExit
      // before anything reads these bindings
      const declarator = this.#t.variableDeclarator(id);
      host.node.declarations.push(declarator);
      this.#memoDeclarators.set(id.name, declarator);
      return;
    }
    target.push({ id });
    // where the ref ACTUALLY landed only the fresh binding knows: babel's `push` redirects
    // internally (a switch/case scope hosts on the enclosing function, callable scopes may
    // land the id as a trailing PARAM), so `target.path` is not the landing node
    const bindingPath = target.getBinding(id.name)?.path;
    const parent = bindingPath?.parentPath;
    if (parent?.isVariableDeclaration()) this.#declaredRefHosts.set(target, parent);
    else {
      this.#hasParamLandedRef = true;
      // a param-landed ref has no declarator until the post-pass normalizer materializes the
      // `var` - synthesize one over the SAME id node so the memo-provenance follow sees the
      // init-less declarator shape during the pass (identity on the id keeps user params out)
      this.#memoDeclarators.set(id.name, this.#t.variableDeclarator(id));
    }
  }

  // true when the ref's use site is outside the block that `scope.push` would host its `var` in, so a
  // block-local `var _ref;` would be invisible from the use:
  //   - loop header: a block-body loop gives body uses their own block scope, so a memo on the loop
  //     scope is a header use; a bodyless loop shares its scope with the body, confirmed by source
  //     range. either way the memo must PRECEDE the loop, not sit in its nested scope (pushing there
  //     block-converts a bodyless body and lands the `var` after its header use)
  //   - function parameter: a param default evaluates in the param scope, which can't see body vars.
  //     babel usually anchors a param-default use on an AssignmentPattern (which hoists out), but a
  //     TS parameter-property (`constructor(public x = ...)`) anchors it on the function, so push
  //     would land in the body. range-check (not "not in body") so an arrow's expression body is
  //     never mistaken for a parameter
  #refUseEscapesScopeBlock(scope, useNode) {
    if (scope.path.isLoop()) {
      const { body } = scope.path.node;
      return body?.type === 'BlockStatement'
        || (useNode?.start !== undefined && body
          && !(useNode.start >= body.start && useNode.end <= body.end));
    }
    if (scope.path.isFunction() && useNode?.start !== undefined) {
      return scope.path.node.params?.some(p => useNode.start >= p.start && useNode.end <= p.end) ?? false;
    }
    return false;
  }

  generateLocalRef(scope) { return this.#generateRefId(scope); }

  // `scope.push` appends the ref as a trailing function parameter instead of block-converting
  // in two cases (both Babel internal behavior):
  //   - ArrowFunctionExpression with expression body: no block to host `var _ref;`
  //   - FunctionExpression in IIFE position: Babel pushes to params for callable scopes
  // both shapes need post-pass normalization to `var _ref;` in body so output stays
  // symmetric across the babel <-> unplugin pipelines (unplugin's text-rewrite path always
  // emits `var _ref;` via scope-tracker `#scopedVars`).
  // must run post-pass: in-visit block-convert races with sibling `replaceWith` calls whose
  // container pointers still point at the pre-convert arrow.body slot - they clobber the
  // new block when they fire.
  // safety: `refNames.has(p.name)` requires the trailing param to be in `#refs`, which
  // only contains names this injector allocated. user-written `_ref` params never enter
  // `#refs` because `generateRefName` consults `scope.hasBinding` to skip them
  normalizeArrowRefParams() {
    // the walk is needed only when at least one `scope.push` landed a ref OUTSIDE a var
    // declaration (trailing param / any unlocatable landing). it stays a WHOLE-program
    // traverse then: a later emission may CLONE a function that already carries pushed ref
    // params (rescue re-emits run after the pushes), and a host list recorded at push time
    // would miss the clone - the common case this gate serves is the zero-param-push file
    if (!this.#hasParamLandedRef) return;
    const t = this.#t;
    const refNames = this.#refs;
    function normalize(path) {
      const params = path.node?.params;
      if (!params) return;
      let n = params.length;
      while (n > 0) {
        const p = params[n - 1];
        if (p?.type !== 'Identifier' || !refNames.has(p.name)) break;
        n--;
      }
      if (n === params.length) return;
      const refParams = params.slice(n);
      path.node.params = params.slice(0, n);
      let bodyPath = path.get('body');
      if (!bodyPath.isBlockStatement()) {
        bodyPath.replaceWith(t.blockStatement([t.returnStatement(path.node.body)]));
        bodyPath = path.get('body');
      }
      bodyPath.unshiftContainer('body', t.variableDeclaration('var',
        refParams.map(p => t.variableDeclarator(t.cloneNode(p)))));
    }
    this.#programPath.traverse({
      ArrowFunctionExpression: normalize,
      FunctionExpression: normalize,
    });
  }

  // walk every scope (program + descendants) feeding each binding pair to `visit`.
  // shared between plugin-shape collection and free-name collection - both need an O(N)
  // pass over the full scope graph after `scope.crawl()`. caller decides what to do with
  // each [name, binding] pair (filter to a multimap / accumulate names into a Set / etc.)
  #forEachScopeBinding(visit) {
    function apply(scope) {
      for (const entry of Object.entries(scope.bindings)) visit(entry);
    }
    apply(this.#programPath.scope);
    this.#programPath.traverse({ Scopable({ scope }) { apply(scope); } });
  }

  // plugin-emitted shape: `scope.push({ id })` produces a `var _refN;` declarator. user
  // collisions (`let`/`const`) differ in `kind`. arrow-fn-param shape is normalized to var
  // by `normalizeArrowRefParams` BEFORE prune runs. CatchClause / Function params host
  // bindings without VariableDeclaration parent - filtered out here too
  static #isPluginShapeBinding(binding) {
    const parent = binding?.path?.parentPath?.node;
    return parent?.type === 'VariableDeclaration' && parent.kind === 'var';
  }

  // walk plugin-shape bindings under one name; remove declarators with no references AND
  // no SE-bearing init AND no constantViolations. returns true iff any binding stays alive.
  // multi-declarator `var _ref, _refOther` removes only the dead declarator, leaving siblings
  static #removeDeadBindings(bindings) {
    let survivor = false;
    for (const binding of bindings) {
      // referenced / mutated / SE-init declarators MUST stay even when var itself is unused
      if (binding.references || binding.constantViolations.length || binding.path.node?.init) {
        survivor = true;
        continue;
      }
      const declPath = binding.path.parentPath;
      if (declPath.node.declarations.length === 1) declPath.remove();
      else binding.path.remove();
    }
    return survivor;
  }

  // single per-program walk feeding BOTH the plugin-shape binding multimap AND the taken-name
  // set the renamer consults. naive split: two `#forEachScopeBinding` passes (each O(scope-graph))
  // - folding halves the cost on large modules.
  // `byName`: dedupe by binding identity (re-crawl after replaceWith can produce duplicate
  // entries reachable through multiple traversal paths); user's `let _refN` shadow excluded
  // upstream by the plugin-shape filter.
  // `taken`: surviving `var _refN;` bindings (scope-binding walk above) + program.globals
  // (rebuilt by the programExit crawl). the crawl resets .references/.uids to empty Sets, so
  // those carry none of the plugin's published UIDs at renumber time - the binding walk is
  // what keeps the renumber from collapsing `_ref2` back onto `_ref`
  #indexBindingsAndTakenNames() {
    const byName = new Map();
    const taken = new Set();
    this.#forEachScopeBinding(([name, binding]) => {
      taken.add(name);
      // index plugin-shape (initless `var _refN;`) bindings for the prune, PLUS every
      // binding of a GENERATED name regardless of shape: local `const _refN = init` memos
      // and IIFE memo params share the canonical slot space, so the renumber must reach
      // their bindings too (`#removeDeadBindings` treats init-bearing / referenced ones as
      // survivors, so the prune semantics for declared refs are unchanged)
      if (!ImportInjector.#isPluginShapeBinding(binding) && !this.#isGeneratedName(name)) return;
      let list = byName.get(name);
      if (!list) byName.set(name, list = []);
      if (!list.includes(binding)) list.push(binding);
    });
    const program = this.#programPath.scope.getProgramParent();
    for (const n of Object.keys(program.globals ?? {})) taken.add(n);
    // seeded user-owned names (`globalThis.<name>` slots) never re-enter `program.globals`
    // after their references were rewritten to member reads - without this the renumber
    // compacts a correctly-avoided `_ref2` back onto the user's slot name
    for (const n of this.reservedNames) taken.add(n);
    return { byName, taken };
  }

  // drop `var _refN;` declarators left by stale visits (outer `replaceWith` discarded the
  // emission but kept the scope.push), then renumber survivors so the output matches unplugin.
  // `scope.crawl()` is O(program size) but runs once per file at programExit - amortized
  // over all in-file polyfill rewrites it's negligible vs the O(N) traversal that already
  // happened. necessary: stale paths from sibling `replaceWith` leave the scope-binding map
  // out of sync with the live AST
  pruneUnusedRefs() {
    const families = [...this.#generatedByPrefix].filter(([, names]) => names.size);
    if (!families.length) return;
    const allGenerated = new Set();
    for (const [, names] of families) for (const name of names) allGenerated.add(name);
    // FAST PATH - raw liveness census, no crawl, no scope-graph walk. the census covers EVERY
    // generated slot-family name (declared `var _refN;`, local `const _refN = ...` UIDs, and
    // `_unusedN` rest sentinels): the canonical numbering is one shared slot space per family,
    // so locals rank and renumber like declared refs - excluding them left non-releasable
    // holes and produced SWAP maps against the text emitter's full-registry canon. a DECLARED
    // ref's own declarator id is exactly one occurrence - a second occurrence proves a live
    // use; a wholesale-discarded emission leaves zero. any slot-shaped identifier OUTSIDE the
    // generated registry (a nested user binding, a sibling-plugin introduction) routes to the
    // full path so the taken-aware renumber can keep avoiding it.
    // print-order rank: first occurrence per name outside VariableDeclarator id positions
    // (the hoisted `var _ref, _ref2;` line would just reproduce allocation order, and the
    // text emitter's scanner skips declarator members the same way, so both emitters rank
    // by the first REAL use)
    const { refCounts, printRank, foreignSlotName, nestedGuardMemoCandidates } = this.#censusGeneratedNames(allGenerated);
    // a guard memo nested DIRECTLY inside an outer guard's test slot whose ref nothing reads
    // (`null == (_refY = null == (_refX = root) ? void 0 : ...)`) is write-only: the read it
    // once served was replaced by a receiver-independent claim, which only exists after every
    // claim landed - so the unwrap lives here, riding the census walk (no extra traversal, no
    // scope crawl). the now declarator-only ref falls to the standard prune below; a TOP-LEVEL
    // guard keeps its memo (the locked kept-swap canon). mirrors the text emitter's ref-canon
    // dead-memo strip
    ImportInjector.#unwrapWriteOnlyGuardMemos(nestedGuardMemoCandidates, refCounts);
    if (!foreignSlotName) {
      let hasDead = false;
      for (const [name, count] of refCounts) {
        // a DECLARED ref needs a use beyond its declarator; a LOCAL / sentinel name's
        // declarator carries its init or pattern slot, so one occurrence is a live emission
        if (count <= (this.#refs.has(name) ? 1 : 0)) {
          hasDead = true;
          break;
        }
      }
      // fast-path exit needs the numbering to ALREADY be canonical, not just hole-free:
      // every name used (no dead), each family a perfect compact `<prefix>..<prefix>N` set
      // (all slots ours - canonical assignment cannot land elsewhere), and each family's
      // print rank ascending in slot order (first-ranked holds the lowest slot). any other
      // state routes to the crawl below, where the taken-aware canonical renumber decides
      if (!hasDead && printRank.length === allGenerated.size
        && families.every(([prefix]) => ImportInjector.#isCanonicalPrefixOrder(
          prefix, printRank.filter(name => this.#generatedByPrefix.get(prefix).has(name))))) return;
    }
    this.#programPath.scope.crawl();
    const { byName, taken } = this.#indexBindingsAndTakenNames();

    // step 1: drop unused / dead var declarators per name. three outcomes:
    //   1. no plugin-shape bindings  -> drop from `#refs` only (catch / fn-param shape
    //      still owns the slot; can't free for reclaim or survivors would shadow-collide)
    //   2. at least one survivor     -> keep in `#refs`, name stays live
    //   3. all bindings dead         -> drop from `#refs` AND record in `prunedNames` so
    //      step 2's `taken` releases the slot (`program.uids` is never un-published by
    //      `uniqueName`, so removed slots otherwise block survivors from reclaiming)
    // snapshot iteration: walk a frozen copy of `#refs`, mutate the original safely
    const prunedNames = new Set();
    // eslint-disable-next-line unicorn/no-useless-spread -- snapshot intentional: see comment above
    for (const name of [...this.#refs]) {
      const bindings = byName.get(name);
      if (!bindings?.length) {
        this.#refs.delete(name);
        this.#generatedByPrefix.get('_ref').delete(name);
        continue;
      }
      if (!ImportInjector.#removeDeadBindings(bindings)) {
        this.#refs.delete(name);
        this.#generatedByPrefix.get('_ref').delete(name);
        byName.delete(name);
        prunedNames.add(name);
      }
    }

    // step 2: build the rename map over the whole generated slot space, one family at a
    // time. `taken` = every occupied name minus the ones the plugin owns (all generated
    // survivors + just-pruned slots). `ownedBindings` = identity set guarding the rename
    // against user's nested `let _ref3` shadow. `_unusedN` sentinels live in destructure
    // PATTERNS (binding-backed like any declarator target), so the same machinery covers them
    const aliveByPrefix = new Map();
    for (const [prefix, names] of families) {
      const alive = new Set([...names].filter(name => this.#refs.has(name) || byName.get(name)?.length));
      if (alive.size) aliveByPrefix.set(prefix, alive);
    }
    if (!aliveByPrefix.size) return;
    for (const [, names] of families) for (const name of names) taken.delete(name);
    for (const name of prunedNames) taken.delete(name);
    const ownedBindings = new Set();
    const renameMap = new Map();
    for (const [prefix, alive] of aliveByPrefix) {
      for (const name of alive) for (const b of byName.get(name) ?? []) ownedBindings.add(b);
      // canonical order = the census print rank filtered to the survivors; a survivor the
      // rank never saw (its only occurrences sat in removed declarators) appends in
      // allocation order so it still receives a slot
      const ordered = printRank.filter(name => alive.has(name));
      const seen = new Set(ordered);
      for (const name of alive) if (!seen.has(name)) ordered.push(name);
      for (const [from, to] of assignCanonicalRefSlots(prefix, ordered, name => taken.has(name))) {
        renameMap.set(from, to);
      }
    }
    if (!renameMap.size) return;

    // sync the registries with post-rename names so subsequent consumers
    // (reorderRefsAfterImports) match `var _refN;` declarations against the renamed set
    this.#refs = renameNamesSet(this.#refs, renameMap);
    for (const [prefix, names] of families) this.#generatedByPrefix.set(prefix, renameNamesSet(names, renameMap));

    // COLLECTION-FIRST application: plugin-emitted ref Identifiers can be NODE-SHARED across
    // positions (a declarator id reused as the memo write's LHS), and babel visits the shared
    // object once per position - an in-visit mutation then feeds the SECOND visit the renamed
    // name, which a swap-shaped map maps BACK (observed as `var _ref, _ref;` + a split
    // write/read pair). collect every node against its ORIGINAL name first (Map identity
    // de-dups shared nodes), then mutate once per node object
    const renameNodes = new Map();
    this.#programPath.traverse({
      Identifier(p) {
        const to = renameMap.get(p.node.name);
        if (!to || !ownedBindings.has(p.scope.getBinding(p.node.name))) return;
        renameNodes.set(p.node, to);
      },
    });
    for (const [node, to] of renameNodes) node.name = to;
  }

  // liveness + print-rank census over the generated slot space. a POSITIONAL walk, not
  // `traverseFast`: plugin-emitted ref Identifiers can be NODE-SHARED across positions (a
  // declarator id reused as the memo write's LHS), so an identity-keyed declarator exclusion
  // would blind every position of the shared node. the path's `parentPath`/`key` are
  // per-POSITION, so only the actual declarator slot is excluded from ranking while the
  // same node's use positions rank normally
  // apply the census-collected nested guard-memo unwraps: declarator + the write = exactly 2
  // occurrences proves write-only; the unwrapped ref drops to declarator-only and the caller's
  // standard prune removes the declaration
  static #unwrapWriteOnlyGuardMemos(candidates, refCounts) {
    for (const candidate of candidates) {
      if (refCounts.get(candidate.name) !== 2) continue;
      candidate.test[candidate.side] = candidate.test[candidate.side].right;
      refCounts.set(candidate.name, 1);
    }
  }

  #censusGeneratedNames(allGenerated) {
    const refCounts = new Map();
    for (const name of allGenerated) refCounts.set(name, 0);
    const printRank = [];
    const rankedNames = new Set();
    let foreignSlotName = false;
    // nested guard-memo candidates (see pruneUnusedRefs): the WHOLE pattern is visible
    // downward from the inner ternary plus two parent links, so the census traversal
    // collects it for free - write-only-ness is decided afterwards from refCounts
    const nestedGuardMemoCandidates = [];
    function guardCensus(p) {
      const { test, consequent } = p.node;
      if (consequent?.type !== 'UnaryExpression' || consequent.operator !== 'void') return;
      if (test?.type !== 'BinaryExpression' || test.operator !== '==') return;
      const side = test.left?.type === 'AssignmentExpression' ? 'left'
        : test.right?.type === 'AssignmentExpression' ? 'right' : null;
      if (!side) return;
      const write = test[side];
      if (write.left?.type !== 'Identifier' || !refCounts.has(write.left.name)) return;
      const parent = p.parentPath?.node;
      if (parent?.type !== 'AssignmentExpression' || parent.right !== p.node
        || parent.left?.type !== 'Identifier' || !isGeneratedSlotShapedName(parent.left.name)) return;
      const grand = p.parentPath.parentPath?.node;
      if (grand?.type !== 'BinaryExpression' || grand.operator !== '==') return;
      const other = grand.left === parent ? grand.right : grand.left;
      if (other?.type !== 'NullLiteral') return;
      nestedGuardMemoCandidates.push({ test, side, name: write.left.name });
    }
    function census(p) {
      const { node } = p;
      // a NON-REFERENCE occurrence (member key on any root, object-literal key, statement label,
      // import/export name slot, JSX name) is not a live USE: the slow path's `#removeDeadBindings`
      // ignores those (only references / constantViolations / init keep a `var _refN;`), so the
      // count proxy must too - else a dead ref whose name coincides with such a source-text name
      // reads as live (count >= 2) and escapes the prune. also keeps a non-referential slot-shaped
      // name from spuriously tripping `foreignSlotName` (a source-name never blocks a UID slot)
      if (isNonReferencePosition(p.parentPath?.node, node)) return;
      const count = refCounts.get(node.name);
      if (count !== undefined) {
        refCounts.set(node.name, count + 1);
        if (!rankedNames.has(node.name)
          && !(p.parentPath?.node.type === 'VariableDeclarator' && p.key === 'id')) {
          rankedNames.add(node.name);
          printRank.push(node.name);
        }
      } else if (!foreignSlotName && node.name.charCodeAt(0) === 95 && isGeneratedSlotShapedName(node.name)) {
        foreignSlotName = true;
      }
    }
    // JSXIdentifier included: a JSX reference to a user slot-shaped name compiles (by a
    // co-mounted transform) into the plain Identifier the renumber must keep avoiding
    this.#programPath.traverse({ Identifier: census, JSXIdentifier: census, ConditionalExpression: guardCensus });
    return { refCounts, printRank, foreignSlotName, nestedGuardMemoCandidates };
  }

  // true when `familyRank` names occupy exactly slots `<prefix>..<prefix>N` in ascending
  // order - the one state where the canonical (print-order) renumber is provably the
  // identity without consulting `taken`: every slot in the compact prefix is plugin-owned,
  // so the shared assignment can only hand the k-th ranked name the k-th slot it holds
  static #isCanonicalPrefixOrder(prefix, familyRank) {
    for (let i = 0; i < familyRank.length; i++) {
      if (familyRank[i] !== refSlotName(prefix, i + 1)) return false;
    }
    return true;
  }

  // base returns a string; babel consumers need an Identifier - cache one per name so
  // repeated `addPureImport` calls return clones of the same source-shape Identifier.
  // `t.identifier(name)` has `loc=null` so clones inherit null - the cache provides
  // node-IDENTITY stability across clones (downstream node-equality and skippedNodes
  // identity checks), NOT loc/range preservation
  addPureImport(entry, hint) {
    const name = super.addPureImport(entry, hint);
    let id = this.#idByName.get(name);
    if (!id) {
      id = this.#t.identifier(name);
      this.#idByName.set(name, id);
    }
    // track the exact clone we hand back so the synth gate can recognise a reference WE placed
    // (a rewritten member key) by identity - dedup hits return a clone too, so a `[Symbol.iterator]`
    // rewrite that reuses the user's pre-imported UID is still flagged, while the user's own
    // `[_Array$from]` (typed, never routed through here) is not
    const clone = this.#t.cloneNode(id);
    this.#injectedRefs.add(clone);
    return clone;
  }

  registerUserPureImport(entry, name) {
    super.registerUserPureImport(entry, name);
    // guard against dead writes: a repeat registration for the same name would otherwise
    // overwrite `#idByName` with a fresh Identifier, breaking the node-IDENTITY contract
    // that `addPureImport` relies on (clones share identity with the cached source node)
    if (!this.#idByName.has(name)) this.#idByName.set(name, this.#t.identifier(name));
  }

  // node-identity test consumed by the computed-key synth-swap gate; see `#injectedRefs` for why
  // identity (not name) is the right signal
  isInjectedReference(node) {
    return this.#injectedRefs.has(node);
  }

  registerUserGlobalImport(moduleName) {
    super.registerUserGlobalImport(moduleName);
    this.#suppressedGlobals.add(moduleName);
  }

  #resolvePath(subpath) {
    return resolveImportPath(this.pkg, subpath, this.absoluteImports);
  }

  #buildNodes() {
    const t = this.#t;
    // subtract BOTH plugin-emitted (don't re-emit) AND user-suppressed (don't duplicate
    // user's existing imports). union via spread - both sets are small (per-file scope)
    const alreadyHandled = new Set([...this.#emittedGlobals, ...this.#suppressedGlobals]);
    let newGlobals = [...this.globalImports.difference(alreadyHandled)];
    const newPure = [...this.pureImports].filter(([s]) => !this.#flushedPure.has(s));
    if (!newGlobals.length && !newPure.length) return null;
    newGlobals = sortByPolyfillOrder(newGlobals);
    const nodes = [];
    for (const mod of newGlobals) {
      this.#emittedGlobals.add(mod);
      const resolved = this.#resolvePath(`modules/${ mod }`);
      const node = this.importStyle === 'require'
        ? t.expressionStatement(t.callExpression(t.identifier('require'), [t.stringLiteral(resolved)]))
        : t.importDeclaration([], t.stringLiteral(resolved));
      nodes.push(node);
      // canonicalKey = bare module name (`es.array.at`) for compat-data lookup; pure-import
      // sources fall through to the comparator's lex tail and stay deterministic
      this.#emittedKeyByNode.set(node, mod);
    }
    for (const [source, name] of newPure) {
      this.#flushedPure.add(source);
      const resolved = this.#resolvePath(source);
      const id = t.cloneNode(this.#idByName.get(name));
      const node = this.importStyle === 'require'
        ? t.variableDeclaration('var', [
          t.variableDeclarator(id, t.callExpression(t.identifier('require'), [t.stringLiteral(resolved)])),
        ])
        : t.importDeclaration([t.importDefaultSpecifier(id)], t.stringLiteral(resolved));
      nodes.push(node);
      this.#emittedKeyByNode.set(node, source);
    }
    return nodes;
  }

  // canonical-sort the union of all flushed plugin imports across all `flush()` calls.
  // each individual flush only sorts within its own batch; with two flushes per file
  // (visitor pre-pass / post-synth-swap), the cross-batch relative order can invert vs
  // canonical compat-data order. called from programExit AFTER all flushes - sorts only
  // emitted nodes among themselves while keeping non-emitted statements (sibling-plugin
  // helper var declarations etc.) in their ORIGINAL positions. without slot-preserving
  // permutation, `import X; const _hot = ...; import Y;` would relocate `_hot` past every
  // sorted import - silent evaluation-order change for sibling-injected helper code.
  // node-identity match (== check on `body[i] === entry.node`) avoids touching user-side
  // imports or sibling-plugin emissions interleaved in the same region
  reorderImportRegion() {
    // set the precondition flag at the end so a caller-side guard (`#assertSorted` in
    // `reorderRefsAfterImports`) reflects "this method ran" rather than "we entered and may
    // have early-returned". flag is observed by downstream methods that REQUIRE the sort to
    // have completed before they walk the import region; sort-no-op cases (fewer than 2
    // entries, empty body) still satisfy the precondition trivially - the import region
    // can't be out of order if there's nothing to sort
    const { body } = this.#programPath.node;
    const hasWork = this.#emittedKeyByNode.size >= 2 && body?.length;
    if (!hasWork) {
      this.#importRegionSorted = true;
      return;
    }
    // collect indices + sort keys of emitted slots IN-ORDER. non-emitted statements
    // (sibling helper vars, comments-as-statements, ...) keep their original positions,
    // so the sort only permutes emitted entries among the slots they already occupy
    const slots = [];
    for (let i = 0; i < body.length; i++) {
      const key = this.#emittedKeyByNode.get(body[i]);
      if (key !== undefined) slots.push({ index: i, key, node: body[i] });
    }
    if (slots.length >= 2) {
      // sort by the canonical comparator: compat-data order with lex-fallback for unknown
      // keys (pure-import sources land in the lex tail). emitted nodes have unique node
      // identity so unique-by-node holds even if two pure imports share a source string
      const sorted = [...slots].sort((a, b) => polyfillOrderComparator(a.key, b.key));
      for (let i = 0; i < slots.length; i++) {
        body[slots[i].index] = sorted[i].node;
      }
    }
    this.#importRegionSorted = true;
  }

  flush() {
    while (true) {
      const nodes = this.#buildNodes();
      if (!nodes) break;
      this.#programPath.unshiftContainer('body', nodes);
    }
  }

  // `scope.push({ id: _ref })` in handlers schedules a top-level `var _ref;` that lands
  // ahead of our later-unshifted imports in Babel's final body. sweep the program body
  // once (called from programExit after all pushes settle) and move the ref-only decls
  // past the import header. keeps source order lint-clean without touching pruneUnusedRefs
  reorderRefsAfterImports() {
    if (!this.#importRegionSorted) {
      throw new Error('[core-js] import-injector: reorderRefsAfterImports() must follow reorderImportRegion()');
    }
    const { body } = this.#programPath.node;
    if (!body?.length) return;
    const refsSet = this.#refs;

    // import-region members - the reorder loop accumulates `importEnd` over them and bails
    // on the first non-member. coverage:
    //   - `import ... from 'm'`
    //   - `export { x } from 'm'` / `export * from 'm'` / `export * as ns from 'm'` re-exports;
    //     TC39 module records fetch the re-exported module before evaluating user body so the
    //     re-export belongs in the import header. `ExportNamedDeclaration` without `.source`
    //     is a local re-export of an already-bound id - excluded via the `.source` check
    //   - `require('m')` ExpressionStatement (CJS bare require)
    //   - mixed-declarator `var fs = require('fs'), x = 1` - any declarator with `require(...)`
    //     counts the row in (`some` not `every`); otherwise such rows would push `var _ref;`
    //     before them, violating the `imports -> requires -> var _ref -> user code` layout
    //   - a directive-prologue statement that survived in `body[]`: a sibling plugin re-emitted
    //     `'use strict'` as a raw statement instead of via `program.directives` (shared
    //     `isDirectiveStatement` accepts the `.directive` marker on the statement OR inner literal,
    //     and rejects a bare non-directive `'foo';` so it can't extend the region)
    // the directive term is babel-side only - unplugin handles directives separately in its
    // `lastUserImportEnd` scan
    function isImportRegion(stmt) {
      return isTopLevelImportLike(stmt) || isDirectiveStatement(stmt);
    }

    // collect EVERY movable ref `var` in the body, not just a leading run. scope.push tags each
    // declaration `_blockHoist: 2`, so Babel's end-of-pipeline block-hoist would otherwise lift
    // it ABOVE the (unhoisted) import header - violating import/first - whenever a ref lands
    // after a lifted side-effect statement that a leading-run-only scan would stop short of.
    // they are initless vars (runtime-hoisted regardless of textual position), so merging them
    // into one fresh declaration placed just past the import header is semantically inert and
    // matches unplugin's layout. the fresh `merged` node carries no `_blockHoist`, so block-hoist
    // leaves it in place; removing the original `bh2` nodes drops their lift entirely
    // migrate our memoize ref `var`s below the import header - else Babel's end-of-pipeline block-hoist
    // (`_blockHoist: 2` from `scope.push`) lifts them above the unhoisted imports, an import/first
    // violation. pull every initless declarator that is one of OUR refs. a node whose declarators are
    // ALL initless rides over WHOLE (initless vars hoist regardless of position, so moving the foreign
    // siblings is inert and dropping the node removes its block-hoist lift); a node that ALSO carries an
    // init-bearing declarator - a sibling `scope.push({id, init})` MERGED into the same reused
    // `declaration:${kind}:${blockHoist}` slot - is SPLIT: only the initless refs migrate, the rest
    // stays in place with its `_blockHoist` (the sibling's concern). emptied nodes drop, mutated split
    const pulledDeclarators = [];
    const droppedNodes = new Set();
    const splitNodes = new Set();
    for (const stmt of body) {
      if (stmt.type !== 'VariableDeclaration' || stmt.kind !== 'var') continue;
      const allInitless = stmt.declarations.every(d => !d.init && d.id.type === 'Identifier');
      // pull our refs; when the whole node is initless also pull the foreign siblings (inert hoist)
      const pulled = stmt.declarations.filter(d => !d.init && d.id.type === 'Identifier'
        && (allInitless || refsSet.has(d.id.name)));
      if (pulled.every(d => !refsSet.has(d.id.name))) continue; // sibling-only initless var migrates separately
      pulledDeclarators.push(...pulled);
      const remaining = stmt.declarations.filter(d => !pulled.includes(d));
      if (remaining.length) {
        stmt.declarations = remaining;
        splitNodes.add(stmt);
      } else {
        droppedNodes.add(stmt);
      }
    }
    if (!pulledDeclarators.length) return;
    const kept = body.filter(s => !droppedNodes.has(s));
    let importEnd = 0;
    for (let i = 0; i < kept.length; i++) {
      if (isImportRegion(kept[i])) {
        importEnd = i + 1;
        continue;
      }
      // scan past nodes that hoisting relocates regardless of their textual position here:
      // sibling-injected initless vars, and split nodes (their `_blockHoist` lifts them above the
      // imports). neither pins where our fresh merged `var _ref;` lands; a genuine init-bearing
      // statement (source order matters) still halts the scan
      if (isInitlessVarDecl(kept[i]) || splitNodes.has(kept[i])) continue;
      break;
    }
    // canonical declaration order: `_ref` family first, ascending slot within each family.
    // pull order is allocation order, which the print-order renumber no longer matches; the
    // text emitter's flush line sorts the same way, so both emitters print one sequence
    pulledDeclarators.sort((a, b) => refDeclarationOrder(a.id.name, b.id.name));
    const merged = this.#t.variableDeclaration('var', pulledDeclarators);
    kept.splice(importEnd, 0, merged);
    this.#programPath.node.body = kept;
  }
}
