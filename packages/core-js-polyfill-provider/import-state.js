import { findUniqueName, kebabToPascal } from './helpers.js';

// post-pass orphan-adoption gate. matches `_ref`, `_ref2..9`, `_ref10+` - the names
// `generateRefName` actually emits (skip-1 per babel convention). user-written
// `_ref0`/`_ref1` stay out of adoption - would otherwise get a spurious `var _ref0;`
export const ORPHAN_REF_PATTERN = /^_ref(?:[2-9]|\d{2,})?$/;

// bare-class and `/constructor` entries PascalCase the first segment to the global name.
// method / instance / helper entries (`promise/try`, `array/from`, `array/instance/at`, ...)
// return null: the user's binding is the function, not the class, so mapping to a global
// would make `super.X` on `class extends MyMethod` get polyfilled as if MyMethod were the
// class - silently "fixing" broken user code the plugin has no business touching.
// numeric-leading segments (`42`) can't be real global identifiers; bail early so downstream
// consumers don't carry a junk hint that only gets filtered at lookup time
export const entryToGlobalHint = entry => {
  if (!entry) return null;
  const [head, ...rest] = entry.split('/');
  if (rest.length && rest.at(-1) !== 'constructor') return null;
  const hint = kebabToPascal(head);
  if (!hint || hint[0] < 'A' || hint[0] > 'Z') return null;
  return hint;
};

// returns the next suffix to seed `#nextSuffixByPrefix` after `findUniqueName` produced
// `name`. bare prefix -> reserve slot 2 (babel skip-1); numeric tail -> advance by 1.
// non-numeric tail (subclass override) -> null, signalling "leave cache untouched"
function nextSuffixFromName(name, prefix) {
  const slice = name.slice(prefix.length);
  if (slice === '') return 2;
  if (/^\d+$/.test(slice)) return +slice + 1;
  return null;
}

// import-emitter state; each plugin subclasses and implements `flush()`.
// augment via `super.foo()` overrides - plugin-specific bookkeeping stays in the subclass
export default class ImportInjectorState {
  absoluteImports;
  mode;
  pkg;
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

  constructor({ absoluteImports, mode, pkg, importStyle }) {
    this.absoluteImports = absoluteImports;
    this.mode = mode;
    this.pkg = pkg;
    this.importStyle = importStyle;
  }

  addGlobalImport(moduleName) {
    this.globalImports.add(moduleName);
  }

  addPureImport(entry, hint) {
    const source = `${ this.mode }/${ entry }`;
    if (this.existingPureImports.has(source)) return this.existingPureImports.get(source);
    if (this.pureImports.has(source)) return this.pureImports.get(source);
    const name = this.uniqueName(`_${ hint.replaceAll('.', '$') }`);
    this.pureImports.set(source, name);
    this.#importInfoByName.set(name, { source, hint });
    // mark name so `flush()`'s post-pass dead-import filter keeps it even when the
    // generated identifier never appeared in source (sibling-injected usage between
    // pre and post). no-op when tracking isn't enabled
    this.trackReferencedName(name);
    return name;
  }

  registerUserGlobalImport(moduleName) {
    this.existingGlobalImports.add(moduleName);
  }

  registerUserPureImport(entry, name) {
    // first-write-wins - sibling AST transforms could re-register `name` with a different
    // source; keeping the first keeps downstream super-mapping deterministic
    if (this.#importInfoByName.has(name)) return;
    const source = `${ this.mode }/${ entry }`;
    this.existingPureImports.set(source, name);
    this.usedNames.add(name);
    // binding -> global hint lets `resolveSuperImportName` find `statics.Promise.try` for
    // `import MyPromise from '@core-js/pure/actual/promise'`; source feeds the adapter's
    // `importSource` lookup (Symbol.X detection via path)
    this.#importInfoByName.set(name, { source, hint: entryToGlobalHint(entry) ?? name });
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

  // unified lookup for the adapter's `getBinding` - pure-import or global-alias, whichever
  // hits first. shape is `{ hint, source }` in both cases; callers only read these fields
  // and don't branch on kind, so the overlap is intentional. `source` is null for aliases
  // (they're synthetic bindings with no standalone import); use `getPureImport(name)` when
  // you need pure-specific fields (e.g. full entry path)
  getBindingInfo(name) {
    const pure = this.#importInfoByName.get(name);
    if (pure) return { hint: pure.hint, source: pure.source };
    const alias = this.#globalAliases.get(name);
    return alias ? { hint: alias, source: null } : null;
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
    const startSuffix = cached ?? null;
    const name = findUniqueName(prefix, startSuffix,
      n => this.isNameTaken(n) || (extraCheck ? extraCheck(n) : false));
    this.usedNames.add(name);
    // bare reserves slot 1 so next call skips `_hint1` (babel skip-1); numbered advances.
    // non-numeric tails (e.g. a subclass overrode `findUniqueName` to return `_ref_foo`)
    // would NaN-poison the cache through `+slice` - leave the slot untouched so the next
    // call re-probes from the prior position
    const next = nextSuffixFromName(name, prefix);
    if (next !== null) this.#nextSuffixByPrefix.set(prefix, next);
    return name;
  }

  // handoff for phase: 'pre+post' so post's `uniqueName` doesn't re-probe pre's N names
  captureSuffixState() { return new Map(this.#nextSuffixByPrefix); }
  rehydrateSuffixState(captured) {
    if (captured) for (const [prefix, next] of captured) this.#nextSuffixByPrefix.set(prefix, next);
  }

  // handoff for phase: 'pre+post' so post's `getPureImport(name)` resolves to the same
  // {source, hint} pre saw. without it super-mapping (`class C extends MyPromise { super.try() }`)
  // regresses in post because `addPureImport` early-returns on existing entry before writing
  // into `#importInfoByName`
  captureImportInfoByName() { return new Map(this.#importInfoByName); }
  rehydrateImportInfoByName(captured) {
    if (captured) for (const [name, info] of captured) this.#importInfoByName.set(name, info);
  }

  isNameTaken(name) { return this.usedNames.has(name); }

  // `_ref, _ref2, _ref3, ...`. `extraCheck` covers bindings the injector doesn't track
  // (e.g. caller's inner scope)
  generateRefName(extraCheck) { return this.uniqueName('_ref', extraCheck); }

  // `_unused, _unused2, _unused3, ...` sentinels for rest-destructure rebuild
  // (`{ polyKey: _unused, ...rest } = obj`). subclass may override to track per-pass state
  generateUnusedName() { return this.uniqueName('_unused'); }
}
