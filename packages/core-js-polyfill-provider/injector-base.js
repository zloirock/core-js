import { entryToGlobalHint } from './index.js';
import { findUniqueName } from './helpers/pattern-matching.js';

// post-pass orphan-adoption gate. matches `_ref`, `_ref2..9`, `_ref10+` - the names
// `generateRefName` actually emits (skip-1 per babel convention). user-written
// `_ref0`/`_ref1`/leading-zero forms (`_ref01`) stay out of adoption - our generator
// never emits them, so they must belong to user code.
// `(?<suffix>...)` captures the numeric tail (empty string for bare `_ref`) so callers
// that need the slot index for nextSuffix-cache seeding can `.exec()` instead of duplicating
// the pattern. `.test()` users ignore the group; both share one regex
export const ORPHAN_REF_PATTERN = /^_ref(?<suffix>[2-9]|[1-9]\d+)?$/;

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
//   private (DO NOT touch): #importInfoByName, #flushedRefs, #nextSuffixByPrefix - state
//             owned by base; manipulated only via captureSuffixState / rehydrateSuffixState
//             / captureImportInfoByName / rehydrateImportInfoByName for pre+post handoff.
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
  registerBodyExtractAlias(name, entry, sourceBinding = null) {
    if (sourceBinding && sourceBinding.kind !== 'const' && sourceBinding.constantViolations?.length) {
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

  // local-name -> global-name for user destructure aliases (`{Symbol: S} = globalThis` -> S).
  // babel AST mutation rewrites the destructure binding so `resolveBindingToGlobal` can't
  // walk the resulting shape (ConditionalExpression for defaulted form); unplugin doesn't
  // mutate, keeps the table empty
  #globalAliases = new Map();

  // last-write-wins: only called from `handleDestructureProxyGlobal` which fires per
  // proxy-global destructure site. user code that destructures the same alias name twice
  // from a proxy global in different scopes is rare; flat-map is sufficient because babel's
  // own scope.getBinding handles real shadowing - the alias map only carries hint info.
  // also reserves the name in usedNames so uniqueName can't reuse it - defensive: scope
  // binding already blocks inner reuse, but this catches anyone querying isNameTaken
  // through the State surface directly (rootScope may not see inner destructure bindings)
  registerGlobalAlias(name, globalName) {
    this.#globalAliases.set(name, globalName);
    this.usedNames.add(name);
  }

  // unified lookup for the adapter's `getBinding`. pure imports carry `{ hint, source, entry }`;
  // aliases carry `{ hint, source: null, entry: null }` (synthetic bindings with no standalone
  // import). callers read whichever fields they need and don't branch on kind. `entry` enables
  // canonical-path lookups (return-type narrowing through alias chains) without coupling to
  // the UID hint shape
  getBindingInfo(name) {
    const pure = this.#importInfoByName.get(name);
    if (pure) return { hint: pure.hint, source: pure.source, entry: pure.entry };
    const alias = this.#globalAliases.get(name);
    return alias ? { hint: alias, source: null, entry: null } : null;
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
    const isTaken = n => this.isNameTaken(n) || (extraCheck ? extraCheck(n) : false);
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
