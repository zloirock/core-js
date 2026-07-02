import { entryToGlobalHint } from './index.js';
import { findUniqueName } from './helpers/pattern-matching.js';
import { isCleanDestructureAliasBinding } from './helpers/ast-patterns.js';

// post-pass orphan-adoption gate. matches `_ref`, `_ref2..9`, `_ref10+` - the names
// `generateRefName` actually emits (skip-1 per babel convention). user-written
// `_ref0`/`_ref1`/leading-zero forms (`_ref01`) stay out of adoption - our generator
// never emits them, so they must belong to user code.
// the numeric tail is length-capped at 15 digits (< Number.MAX_SAFE_INTEGER): a user-written
// `_ref` with a 16+-digit suffix would `parseInt` into a float-collapsed integer that the
// nextSuffix cache seed + `findUniqueName` probe loop can never increment past, hanging the
// allocator. an over-long suffix simply fails to match here, so it is reserved as a user name.
// `(?<suffix>...)` captures the numeric tail (empty string for bare `_ref`) so callers
// that need the slot index for nextSuffix-cache seeding can `.exec()` instead of duplicating
// the pattern. `.test()` users ignore the group; both share one regex
export const ORPHAN_REF_PATTERN = /^_ref(?<suffix>[2-9]|[1-9]\d{1,14})?$/;

// returns the next suffix to seed `#nextSuffixByPrefix` after `findUniqueName` produced
// `name`. bare prefix -> reserve slot 2 (babel skip-1); numeric tail -> advance by 1.
// non-numeric tail (subclass override) -> null, signalling "leave cache untouched"
function nextSuffixFromName(name, prefix) {
  const slice = name.slice(prefix.length);
  if (slice === '') return 2;
  if (/^\d+$/.test(slice)) return +slice + 1;
  return null;
}

// pick the suffix `findUniqueName` should start probing from. bare-slot reclaim: when the
// cache was seeded past 2 by snapshot inherit / orphan adoption but bare itself is still
// free (e.g. HMR re-parse of user-edited source dropped `_ref` declaration leaving `_ref2+`),
// prefer bare so output stays canonical (`_ref, _ref2, ...`). otherwise resume from cache
function chooseStartSuffix(cached, prefix, isTaken) {
  if (cached >= 2 && !isTaken(prefix)) return null;
  return cached ?? null;
}

// declaration source position of a binding's defining identifier. stable across the
// pre/post snapshot round-trip (same source text, same offsets) and across babel pure
// AST mutation (parser-emitted nodes carry `start`). returns null for synthetic bindings
// without source positions - the lookup table treats null as "any scope" so post-mutation
// babel bindings still find their reassignment flag through the bare-name match
function reassignedStart(binding) {
  return binding?.identifier?.start ?? binding?.path?.node?.start ?? null;
}

// import-emitter state; each plugin subclasses and implements `flush()`.
// augment via `super.foo()` overrides - plugin-specific bookkeeping stays in the subclass.
//
// subclass contract:
//   abstract: flush() - emit collected imports/refs into the AST or text-rewrite queue;
//             called at programExit. base class never invokes it - pure data sink.
//   abstract: generateLocalRef() / generateDeclaredRef() - return an Identifier-shaped ref
//             allocated via this.uniqueName('_ref'). babel returns t.identifier(name);
//             unplugin returns the bare string. callers MUST treat the return value as
//             plugin-specific (not interchangeable across subclasses).
//   override-friendly: registerUserPureImport, registerUserGlobalImport, addPureImport,
//             addGlobalImport - call super.X() then layer subclass bookkeeping (refs,
//             post-rename, sibling-plugin tracking).
//   private (DO NOT touch): #importInfoByName, #nextSuffixByPrefix - state owned by base;
//             manipulated only via captureSuffixState / rehydrateSuffixState /
//             captureImportInfoByName / rehydrateImportInfoByName for pre+post handoff.
//
// shared invariants:
//   - usedNames is single source-of-truth for collision detection. uniqueName consults it
//     plus subclass-supplied extraCheck (e.g. babel's program.references / scope.hasBinding,
//     unplugin's collectAllBindingNames Set)
//   - #refs (subclass field) tracks plugin-allocated refs for orphan adoption + rename
//   - existingPureImports / existingGlobalImports populated via scanExistingCoreJSImports
//     in pre-pass; readers don't write
export default class ImportInjectorState {
  absoluteImports;
  mode;
  pkg;
  // full set of recognized package prefixes (main `pkg` + `additionalPackages`, lowercased).
  // adapter `bindingSymbolKey` consults this to classify user-emitted symbol imports from
  // aliased packages (`my-alias/symbol/iterator`) as Symbol.X references. null when caller
  // omits - bindingSymbolKey falls back to built-in CORE_JS_SOURCE_PREFIX regex only
  packages;
  importStyle;

  globalImports = new Set();
  pureImports = new Map(); // `${mode}/${entry}` -> binding name
  existingGlobalImports = new Set();
  existingPureImports = new Map();
  usedNames = new Set();
  // post-pass dead-import filter - null when inactive
  referencedInSource = null;
  // binding-name -> { source, hint } for BOTH plugin-emitted and user-registered pure
  // imports. `source` is `${mode}/${entry}` (used by `getBinding` adapter to detect
  // Symbol.X polyfills via source-path); `hint` is the global class name so
  // `resolveSuperImportName` can map `class C extends MyPromise` back to `Promise`
  #importInfoByName = new Map();

  constructor({ absoluteImports, mode, pkg, importStyle, packages = null }) {
    this.absoluteImports = absoluteImports;
    this.mode = mode;
    this.pkg = pkg;
    this.packages = packages;
    this.importStyle = importStyle;
  }

  addGlobalImport(moduleName) {
    this.globalImports.add(moduleName);
  }

  addPureImport(entry, hint) {
    const source = `${ this.mode }/${ entry }`;
    // mark name so `flush()`'s post-pass dead-import filter keeps it even when the
    // generated identifier never appeared in source (sibling-injected usage between
    // pre and post). no-op when tracking isn't enabled. called on every entry - including
    // dedup hits - so the hint survives even when the first registration was before
    // reference-tracking was enabled (post-pass inherit case)
    const existing = this.existingPureImports.get(source) ?? this.pureImports.get(source);
    if (existing) {
      this.trackReferencedName(existing);
      return existing;
    }
    const name = this.uniqueName(`_${ hint.replaceAll('.', '$') }`);
    this.pureImports.set(source, name);
    // store `entry` alongside hint - downstream type resolution (`resolveCallReturnType`'s
    // polyfilled-alias branch) decomposes the canonical entry path (`array/from`) instead
    // of reverse-engineering the UID hint shape, so changing the UID convention can't
    // silently break receiver-type narrowing through alias chains
    this.#importInfoByName.set(name, { source, hint, entry });
    this.trackReferencedName(name);
    return name;
  }

  registerUserGlobalImport(moduleName) {
    this.existingGlobalImports.add(moduleName);
  }

  // shared `#importInfoByName` writer for entry-derived metadata. computes canonical
  // shape `{source, hint, entry}` from (mode, entry, name); first-write-wins so subsequent
  // re-registrations for the same name don't overwrite (e.g. user re-imports same source
  // under a second alias). callers handle their own dedup-target updates (existingPureImports)
  // separately - this method is the metadata-only side of registration
  #recordImportInfo(name, entry) {
    if (this.#importInfoByName.has(name)) return;
    this.#importInfoByName.set(name, {
      source: `${ this.mode }/${ entry }`,
      hint: entryToGlobalHint(entry) ?? name,
      entry,
    });
  }

  registerUserPureImport(entry, name) {
    const source = `${ this.mode }/${ entry }`;
    this.usedNames.add(name);
    // first-write-wins on existingPureImports - keeps dedup target stable when one
    // declaration mixes `import Def, { default as Alt }`. without it last-write-wins
    // would pick the alias as dedup target, asymmetric with `#importInfoByName` (also
    // first-write-wins via `#recordImportInfo`). hint feeds `resolveSuperImportName`
    // for `import MyPromise from '@core-js/pure/actual/promise'` -> `statics.Promise.try`
    if (!this.existingPureImports.has(source)) this.existingPureImports.set(source, name);
    this.#recordImportInfo(name, entry);
  }

  // body-extract emits `let <localName> = _<Constructor>$<method>;` shadowing a destructure
  // binding (`const { from, ...rest } = Array;` -> babel AST-mutates pattern + emits
  // `const from = _Array$from;`). receiver-narrowing through `from` needs to find the
  // entry path so `arr = from('hi'); arr.at(-1)` narrows to `_atMaybeArray`. registering
  // the alias in `#importInfoByName` lets `getPolyfillBindingEntry` return `array/from`
  // for `from`. does NOT touch `existingPureImports` / `pureImports` - dedup target
  // stays the original polyfill UID (`_Array$from`).
  // `sourceBinding`: the destructure target's scope binding BEFORE the rewrite. when it
  // shows `constantViolations` we redirect to the reassignment set instead of registering
  // the alias - the alias map would carry a stale `from -> array/from` association for a
  // value that's no longer guaranteed to be `Array.from`, and downstream return-type
  // narrowing through the polyfill UID's alias would dispatch Array-specific instance
  // polyfills incorrectly. babel post-AST-mutation scope loses `constantViolations` so
  // the resolver can't re-derive the flag at use site; capture pre-mutation here
  // the aliasing destructure's own write (assignment form `let x; ({ x } = Source)`) is the aliasing
  // event, not a disqualifying reassignment - it shows up as the binding's single constantViolation with
  // no declarator init. `isCleanDestructureAliasBinding` decides this by count + init, the SAME check the
  // resolver's `staticPairFromDestructure` applies, so babel and unplugin poison identically for identical
  // source (a per-emitter node-shape marker could not: babel's violation node is the whole assignment,
  // estree's is the bound identifier). a real later reassignment makes it unclean and still poisons
  registerBodyExtractAlias(name, entry, sourceBinding = null) {
    if (sourceBinding && sourceBinding.kind !== 'const' && !isCleanDestructureAliasBinding(sourceBinding)) {
      this.#trackReassignedBinding(name, reassignedStart(sourceBinding));
      return;
    }
    this.#recordImportInfo(name, entry);
  }

  // name -> Set<start> indexes reassignment by declaration position so two `from` bindings
  // in distinct scopes don't poison each other. lookup with a known start (unplugin, babel
  // pre-mutation) matches exact-scope; lookup with null start (legacy callers, babel
  // post-mutation synthetic identifier) treats the name's mere presence in the Map as a
  // match - cannot prove the unknown-scope query isn't one of the registered ones
  #reassignedBindings = new Map();
  #trackReassignedBinding(name, start) {
    let starts = this.#reassignedBindings.get(name);
    if (!starts) {
      starts = new Set();
      this.#reassignedBindings.set(name, starts);
    }
    starts.add(start);
  }
  isReassignedBinding(name, binding = null) {
    const starts = this.#reassignedBindings.get(name);
    if (!starts) return false;
    const start = binding ? reassignedStart(binding) : null;
    return start === null || starts.has(start);
  }

  // binding-name -> { source, hint } for super-import back-mapping (see `resolveSuperImportName`
  // in helpers/class-walk.js) and `getBinding(name).importSource` path-match detection;
  // null when unknown
  getPureImport(name) {
    return this.#importInfoByName.get(name) ?? null;
  }

  // BLIND alias registrations, name-keyed: a plugin-minted `_ref` receiver memo (unique name,
  // user code cannot rebind it) and a BINDING-LESS global write (`({ Map } = globalThis)` writes
  // the global itself - no user binding whose flow could contradict the hint). everything with a
  // user binding lives in `#bindingAliases`
  #globalAliases = new Map();

  // PER-BINDING alias registrations, keyed by the binding's declarator NODE: the registration
  // belongs to one binding, so same-name aliases in sibling scopes never collide (no flat-table
  // merge / degrade). `write` / `declSpan` ({ start, end }) record the trusted source span for
  // the use-position dominance gate and the violation-span shape check; `guarded: true` marks a
  // registration whose flow-trust was REFUSED (conditional / cross-fn / dirty write, conditional
  // `var` decl) - its binding's member reads stay native
  #bindingAliases = new WeakMap();

  // name -> binding-entry list: the fallback view for use sites that cannot resolve their
  // binding (babel scope-tracker lag after `replaceWith`) or hit a REPLACED declarator (the
  // flatten rewrites `const { Map: M } = g` in place). only an UNAMBIGUOUS name (exactly one
  // registered binding) may serve those lookups - a collision declines and the use stays native
  #aliasEntriesByName = new Map();

  registerGlobalAlias(name, globalName, {
    bindingNode = null, trusted = false, write = null, guarded = false, declSpan = null, scopeSpan = null,
    verified = false,
  } = {}) {
    this.usedNames.add(name);
    if (!bindingNode) {
      // a BLIND registration claims "no user binding exists for this name" - refuse it when the
      // name already has per-binding registrations (the caller's binding lookup merely LAGGED
      // behind an AST mutation; trusting the hint would narrow over a flow a per-binding
      // registration may have refused)
      if (this.#aliasEntriesByName.get(name)?.length) return;
      this.#globalAliases.set(name, { hint: globalName, trusted: true });
      return;
    }
    const entry = { hint: globalName, trusted, write, guarded, declSpan, scopeSpan, verified };
    const existing = this.#bindingAliases.get(bindingNode);
    if (existing) {
      // same binding judged by more than one path (plan gate + standalone site): keep the
      // strongest judgment - a trusted/write registration wins over a refused one
      if ((existing.trusted || existing.write) && guarded) return;
      Object.assign(existing, entry);
      return;
    }
    this.#bindingAliases.set(bindingNode, entry);
    let list = this.#aliasEntriesByName.get(name);
    if (!list) this.#aliasEntriesByName.set(name, list = []);
    list.push(entry);
  }

  // unified lookup for the adapter's `getBinding`. pure imports carry `{ hint, source, entry }`;
  // aliases carry `{ hint, source: null, entry: null }` (synthetic bindings with no standalone
  // import). callers read whichever fields they need and don't branch on kind. `entry` enables
  // canonical-path lookups (return-type narrowing through alias chains) without coupling to
  // the UID hint shape.
  // the NAME view resolves: a blind entry, else the UNIQUE per-binding entry (the scope-lag /
  // replaced-declarator fallback). an ambiguous name disambiguates POSITIONALLY when the caller
  // passes a use anchor: a use belongs to the entry whose hosting scope span contains it -
  // exactly one containing entry resolves, anything else declines and the use stays native
  getBindingInfo(name, useStart = null) {
    const pure = this.#importInfoByName.get(name);
    if (pure) return { hint: pure.hint, source: pure.source, entry: pure.entry };
    const blind = this.#globalAliases.get(name);
    if (blind) return { hint: blind.hint, source: null, entry: null, aliasTrusted: true };
    const list = this.#aliasEntriesByName.get(name);
    if (!list?.length) return null;
    let alias = null;
    if (useStart !== null) {
      // positional: a use belongs to an entry only when the entry's hosting scope contains it -
      // a sole entry from ANOTHER function must not serve an outside use
      const containing = list.filter(e => e.scopeSpan
        && e.scopeSpan.start <= useStart && useStart <= e.scopeSpan.end);
      if (containing.length === 1) [alias] = containing;
    } else if (list.length === 1) [alias] = list;
    if (!alias) return null;
    return {
      hint: alias.hint, source: null, entry: null,
      aliasTrusted: false, aliasWrite: alias.write, aliasGuarded: alias.guarded,
      aliasDeclSpan: alias.declSpan,
    };
  }

  // existence view for `hasBinding`-style probes: presence is not trust, so ambiguity is fine -
  // but presence IS scope-bound: a per-binding registration exists only where its hosting scope
  // contains the use (a same-named local alias in another function must not make a DIRECT
  // global use look locally bound). blind and import entries are file-wide
  hasAliasName(name, useStart = null) {
    if (this.#importInfoByName.has(name) || this.#globalAliases.has(name)) return true;
    const list = this.#aliasEntriesByName.get(name);
    if (!list?.length) return false;
    if (useStart === null) return true;
    return list.some(e => e.scopeSpan && e.scopeSpan.start <= useStart && useStart <= e.scopeSpan.end);
  }

  // the BINDING view: exact per-binding lookup for use sites that resolved their binding
  getBindingAliasInfo(bindingNode) {
    const alias = bindingNode ? this.#bindingAliases.get(bindingNode) : null;
    if (!alias) return null;
    return {
      hint: alias.hint, source: null, entry: null,
      aliasTrusted: false, aliasWrite: alias.write, aliasGuarded: alias.guarded,
      aliasDeclSpan: alias.declSpan, aliasVerified: alias.verified,
    };
  }

  seedReservedNames(names) {
    for (const n of names) this.usedNames.add(n);
  }

  enableReferenceTracking() {
    this.referencedInSource = new Set();
  }

  // counterpart for tests / future callers that need to revert post-pass dead-import filtering
  // back to "emit everything" without rebuilding the injector. cheap symmetry with the enable
  disableReferenceTracking() {
    this.referencedInSource = null;
  }

  trackReferencedName(name) {
    this.referencedInSource?.add(name);
  }

  // per-prefix next-slot cache: O(1) amortized over repeated allocations. without it,
  // N user-taken `_hintN` names would force every new allocation to re-probe all N
  #nextSuffixByPrefix = new Map();

  uniqueName(prefix, extraCheck) {
    const cached = this.#nextSuffixByPrefix.get(prefix);
    const isNameTaken = this.isNameTaken.bind(this);
    function isTaken(n) {
      return isNameTaken(n) || (extraCheck ? extraCheck(n) : false);
    }
    const startSuffix = chooseStartSuffix(cached, prefix, isTaken);
    const name = findUniqueName(prefix, startSuffix, isTaken);
    this.usedNames.add(name);
    // bare reserves slot 1 so next call skips `_hint1` (babel skip-1); numbered advances.
    // non-numeric tails (e.g. a subclass overrode `findUniqueName` to return `_ref_foo`)
    // would NaN-poison the cache through `+slice` - leave the slot untouched so the next
    // call re-probes from the prior position.
    // bare-after-numbered-cached: don't shrink cached max; preserves monotonic numbering
    // when allocator returns bare via the bare-slot reclaim above
    const next = nextSuffixFromName(name, prefix);
    if (next !== null && next > (cached ?? 0)) this.#nextSuffixByPrefix.set(prefix, next);
    return name;
  }

  // handoff for phase: 'pre+post' so post's `uniqueName` doesn't re-probe pre's N names.
  // max-guard on rehydrate: rebuild from a captured snapshot must NEVER decrease the next-
  // suffix counter. local allocations between capture and rehydrate (or a second rehydrate
  // path) could otherwise regress numbering and produce collisions
  captureSuffixState() { return new Map(this.#nextSuffixByPrefix); }
  rehydrateSuffixState(captured) {
    if (!captured) return;
    for (const [prefix, next] of captured) {
      const current = this.#nextSuffixByPrefix.get(prefix);
      this.#nextSuffixByPrefix.set(prefix, current === undefined ? next : Math.max(current, next));
    }
  }

  // handoff for phase: 'pre+post' so post's `getPureImport(name)` resolves to the same
  // {source, hint} pre saw. without it super-mapping (`class C extends MyPromise { super.try() }`)
  // regresses in post because `addPureImport` early-returns on existing entry before writing
  // into `#importInfoByName`
  captureImportInfoByName() { return new Map(this.#importInfoByName); }
  rehydrateImportInfoByName(captured) {
    if (captured) for (const [name, info] of captured) this.#importInfoByName.set(name, info);
  }

  // symmetric handoff for `#globalAliases`: pre registers ctor aliases (decl flatten, checked
  // assignment writes); post needs the same table so alias member reads keep narrowing on the
  // re-parsed source - without it the alias hint (and its trusted write span) is fresh-empty
  captureGlobalAliases() { return new Map(this.#globalAliases); }
  rehydrateGlobalAliases(captured) {
    if (captured) for (const [name, alias] of captured) this.#globalAliases.set(name, alias);
  }

  // symmetric handoff for `#reassignedBindings`: pre populates the Map via
  // `registerBodyExtractAlias` (it sees pre-mutation `constantViolations`), post needs the
  // same flags so `isReassignedBinding` short-circuits the resolver's alias walk.
  // without the snapshot post's Map is fresh-empty - body-extract alias detection regresses
  captureReassignedBindings() {
    const out = new Map();
    for (const [name, starts] of this.#reassignedBindings) out.set(name, new Set(starts));
    return out;
  }
  rehydrateReassignedBindings(captured) {
    if (!captured) return;
    for (const [name, starts] of captured) {
      for (const start of starts) this.#trackReassignedBinding(name, start);
    }
  }

  isNameTaken(name) { return this.usedNames.has(name); }

  // `_ref, _ref2, _ref3, ...`. `extraCheck` covers bindings the injector doesn't track
  // (e.g. caller's inner scope)
  generateRefName(extraCheck) { return this.uniqueName('_ref', extraCheck); }

  // `_unused, _unused2, _unused3, ...` sentinels for rest-destructure rebuild
  // (`{ polyKey: _unused, ...rest } = obj`). subclass may override to track per-pass state
  generateUnusedName() { return this.uniqueName('_unused'); }
}
