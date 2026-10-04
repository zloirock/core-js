import { entryToGlobalHint } from './index.js';
import { findUniqueName } from './helpers/pattern-matching.js';
import {
  bindingDeclarationPath,
  blocksUidSlot,
  cleanDestructureAliasWrites,
  conditionalEvaluationEdge,
  definedBranchOfGuardConditional,
  findNearestVarScopeOwner,
  foldedPropertyKeyName,
  isBindingDeclarationPath,
  isGeneratedMemoDeclarator,
  isAssignOrForXWriteTargetPath,
  isCleanDestructureAliasBinding,
  isGuardedAliasingWrite,
  isMemberAccessNode,
  isNonReferencePosition,
  isPropertyNode,
  isNullLiteralNode,
  isQuietLiteralOperand,
  isRequireCall,
  isReusableReceiver,
  subtreeContainsNode,
  isTypeAnnotationWrapper,
  isVarScopeBoundary,
  memberKeyName,
  memberKeyNamesReducer,
  nodeSpan,
  observableSequenceElements,
  plainSynthKeyName,
  peelNestedSequenceExpressions,
  peelSequenceTail,
  pureImportSourceEntry,
  staticMemberFromEntrySegment,
  statementListOf,
  unwrapRuntimeExpr,
  varlessMemoSlot,
  walkAstNodes,
} from './helpers/ast-patterns.js';
import {
  cloneNode,
  expressionStatement,
  memberExpression,
  renderMemoActivation,
  sequenceExpression,
  variableDeclaration,
} from './render.js';

// Localize allocator-owned refs used only in parameter/field expressions. The final tree
// owns the slots: earlier renders may have replaced their receiver nodes. References in an
// ordinary body keep their declared host. Return localized names for the binding's var sink.
export function localizeVarlessMemos(program, names, render = renderMemoActivation) {
  if (!names.size) return new Set();
  const byName = new Map();
  const byOwner = new Map();
  const declarations = [];
  const ancestors = [];
  walkAstNodes({
    root: program,
    visit(node, parent) {
      ancestors.push(node);
      if (node.type === 'VariableDeclaration' && node.kind === 'var') declarations.push({ node, parent });
      if (node.type !== 'Identifier' || !names.has(node.name)
      || parent?.type === 'VariableDeclarator' && parent.id === node) return;
      let path = null;
      for (const ancestor of ancestors) {
        const parentNode = path?.node;
        path = {
          node: ancestor,
          parentPath: path,
          key: parentNode?.key === ancestor ? 'key' : null,
          listKey: parentNode?.decorators?.includes(ancestor) ? 'decorators' : null,
        };
      }
      const slot = varlessMemoSlot(path);
      if (!slot) {
        byName.set(node.name, null);
        return;
      }
      if (byName.has(node.name) && byName.get(node.name) === null) return;
      let slots = byName.get(node.name);
      if (!slots) byName.set(node.name, slots = []);
      if (slots.every(item => item.owner !== slot.owner || item.key !== slot.key)) slots.push(slot);
    },
    leave() { ancestors.pop(); },
  });
  const localized = new Set();
  for (const [name, slots] of byName) {
    if (!slots) continue;
    localized.add(name);
    for (const { owner, key } of slots) {
      let keys = byOwner.get(owner);
      if (!keys) byOwner.set(owner, keys = new Map());
      if (!keys.has(key)) keys.set(key, []);
      keys.get(key).push(name);
    }
  }
  for (const { node, parent } of declarations) {
    node.declarations = node.declarations.filter(item => item.init || !localized.has(item.id?.name));
    if (!node.declarations.length && Array.isArray(parent?.body)) parent.body.splice(parent.body.indexOf(node), 1);
  }
  for (const [owner, keys] of byOwner) for (const [key, refs] of keys) owner[key] = render(owner[key], refs);
  return localized;
}

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
// the ONE spelling of the slot-suffix grammar - every generated-name pattern (whole-string
// and in-text token forms alike) builds from it so the family cannot drift per consumer
const REF_SLOT_SUFFIX_SOURCE = '[2-9]|[1-9]\\d{1,14}';
export const ORPHAN_REF_PATTERN = new RegExp(`^_ref(?<suffix>${ REF_SLOT_SUFFIX_SOURCE })?$`);

// generator-shaped `_unused` sentinel names (`generateUnusedName` output), same suffix
// grammar and safe-integer cap as ORPHAN_REF_PATTERN - shared by the post-pass adoption
// that re-recognizes pre's rest-destructure sentinels when the state snapshot was lost
export const UNUSED_NAME_PATTERN = new RegExp(`^_unused(?<suffix>${ REF_SLOT_SUFFIX_SOURCE })?$`);

// --- canonical generated-name numbering (shared by both emitters' final renumber passes) ---
// the generator families the canonicalization renumbers, each with its whole-string pattern:
// `_refN` memo slots and `_unusedN` rest-destructure sentinels. slot naming matches
// `uniqueName` allocation: slot 1 is the bare prefix, slot 2+ is `<prefix>2, <prefix>3, ...`
// (skip-1 per babel convention)
const GENERATED_NAME_FAMILIES = new Map([
  ['_ref', ORPHAN_REF_PATTERN],
  ['_unused', UNUSED_NAME_PATTERN],
]);
const CANONICAL_REF_PREFIXES = GENERATED_NAME_FAMILIES.keys().toArray();

// generator-shaped in ANY family - the census' foreign-name gate asks this instead of
// re-spelling the pattern pair
function isGeneratedSlotShapedName(name) {
  for (const pattern of GENERATED_NAME_FAMILIES.values()) if (pattern.test(name)) return true;
  return false;
}

// returns the next suffix to seed `#nextSuffixByPrefix` after `findUniqueName` produced
// `name`. bare prefix -> reserve slot 2 (babel skip-1); numeric tail -> advance by 1.
// non-numeric tail (subclass override) -> null, signalling "leave cache untouched"
function nextSuffixFromName(name, prefix) {
  const slice = name.slice(prefix.length);
  if (slice === '') return 2;
  if (/^\d+$/.test(slice)) return +slice + 1;
  return null;
}

// where `uniqueName` should begin. bare-slot reclaim: when the cache was seeded past 2 by
// snapshot inherit / orphan adoption but bare itself is still free (e.g. HMR re-parse of
// user-edited source dropped `_ref` declaration leaving `_ref2+`), prefer bare so output stays
// canonical (`_ref, _ref2, ...`). otherwise resume from cache.
// returns the bare NAME rather than a null start suffix in the reclaim case: handing `null` to
// `findUniqueName` made it probe the very name this just proved free, and in the babel emitter
// that probe is a full scope-chain lookup
function chooseStart(cached, prefix, isTaken) {
  if (cached >= 2 && !isTaken(prefix)) return { name: prefix };
  return { startSuffix: cached ?? null };
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
//   override-friendly: registerUserPureImport, addPureImport, addGlobalImport - call
//             super.X() then layer subclass bookkeeping (refs, post-rename, sibling-plugin
//             tracking).
//   private (DO NOT touch): #importInfoByName, #nextSuffixByPrefix - state owned by base;
//             manipulated only via captureSuffixState / rehydrateSuffixState /
//             captureImportInfoByName / rehydrateImportInfoByName for pre+post handoff.
//
// shared invariants:
//   - usedNames is single source-of-truth for collision detection. uniqueName consults it
//     plus subclass-supplied extraCheck (e.g. babel's program.references / scope.hasBinding,
//     unplugin's declaredNames Set)
//   - #refs (subclass field) tracks plugin-allocated refs for orphan adoption + rename
//   - existingPureImports populated via scanExistingCoreJSImports in pre-pass; readers
//     don't write. there is no global-import counterpart: both emitters remove a user global
//     import and re-emit it through `addGlobalImport`, so no dedup channel suppresses one
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
  globalImportPackages = new Map();
  pureImports = new Map(); // `${mode}/${entry}` -> binding name
  existingPureImports = new Map();
  usedNames = new Set();
  // names whose `var <name>;` declaration this injector owes or has adopted - the declared
  // `_ref` subset of the slot space; each emitter's flush/prune reads and maintains it
  declaredRefNames = new Set();
  // every generated slot-family name (prefix -> Set): `_refN` slots (declared AND local)
  // plus `_unusedN` rest sentinels - the whole slot space the print-order canonicalization
  // renumbers from. adopted names stay out (their spellings live in a previous pass's text,
  // out of rename reach)
  #generatedByPrefix = new Map(CANONICAL_REF_PREFIXES.map(prefix => [prefix, new Set()]));
  // binding-name -> { source, hint } for BOTH plugin-emitted and user-registered pure
  // imports. `source` is `${mode}/${entry}` (used by `getBinding` adapter to detect
  // Symbol.X polyfills via source-path); `hint` is the global class name so
  // `resolveSuperImportName` can map `class C extends MyPromise` back to `Promise`
  #importInfoByName = new Map();
  // Per-primary-record index for user-named aliases. Same-name destructuring aliases are common
  // in generated bundles; scanning every preceding scope on both registration and lookup makes
  // that shape quadratic. The WeakMap is rebuilt lazily after a pre/post snapshot handoff.
  #importSpanIndexes = new WeakMap();

  constructor({ absoluteImports, mode, pkg, importStyle, packages = null, emitsGlobalModules = true }) {
    this.absoluteImports = absoluteImports;
    this.emitsGlobalModules = emitsGlobalModules;
    this.mode = mode;
    this.pkg = pkg;
    this.packages = packages;
    this.importStyle = importStyle;
  }

  // `pkg`: the package the module was RECOGNISED under. a global-flavour injector CANONICALISES
  // onto its own package - that is what dedups a user's alias (`my-core-js/modules/x`) against
  // its own emission. an injector that emits no global modules at all (pure) has no canonical
  // spelling to offer: re-homing the user's import there would leave the file importing a module
  // that polyfills no global, so the recognised package travels with it
  addGlobalImport(moduleName, pkg = null) {
    this.globalImports.add(moduleName);
    if (pkg && pkg !== this.pkg && !this.emitsGlobalModules) this.globalImportPackages.set(moduleName, pkg);
  }

  addPureImport(entry, hint) {
    const source = `${ this.mode }/${ entry }`;
    const existing = this.existingPureImports.get(source) ?? this.pureImports.get(source);
    if (existing) return existing;
    const name = this.uniqueName(`_${ hint.replaceAll('.', '$') }`);
    this.pureImports.set(source, name);
    // store `entry` alongside hint - downstream type resolution (`resolveCallReturnType`'s
    // polyfilled-alias branch) decomposes the canonical entry path (`array/from`) instead
    // of reverse-engineering the UID hint shape, so changing the UID convention can't
    // silently break receiver-type narrowing through alias chains
    this.#importInfoByName.set(name, { source, hint, entry });
    return name;
  }

  // what this injector emits, in the vocabulary of the debug report: the side-effect modules and,
  // for the pure package, the entries behind its minted bindings - read once the host is done with
  // the file, after every dedup and prune, so the report describes the emission rather than the
  // requests that led to it. the entries drop the mode their sources carry, the spelling the
  // user configures them in
  emittedPolyfills() {
    const entries = this.pureImports.keys().map(source => source.slice(this.mode.length + 1)).toArray();
    return [...this.globalImports, ...entries];
  }

  // Rehydration and incremental registration apply the same span ordering to the index.
  #importSpanIndex(primary, added = null) {
    let index = this.#importSpanIndexes.get(primary);
    if (index && !added) return index;
    const records = index ? [added] : [primary, ...primary.siblings ?? []];
    index ??= { keys: new Set(), latest: null };
    for (const record of records) {
      const { scopeSpan } = record;
      index.keys.add(scopeSpan ? `${ scopeSpan.start }:${ scopeSpan.end }` : 'file');
      if (scopeSpan && (!index.latest || scopeSpan.start > index.latest.scopeSpan.start
        || (scopeSpan.start === index.latest.scopeSpan.start && scopeSpan.end < index.latest.scopeSpan.end))) {
        index.latest = record;
      }
    }
    this.#importSpanIndexes.set(primary, index);
    return index;
  }

  // shared `#importInfoByName` writer for entry-derived metadata. computes canonical
  // shape `{source, hint, entry}` from (mode, entry, name); first-write-wins so subsequent
  // re-registrations for the same name don't overwrite (e.g. user re-imports same source
  // under a second alias). callers handle their own dedup-target updates (existingPureImports)
  // separately - this method is the metadata-only side of registration.
  // `userNamed` + `scopeSpan` mark a USER-bound name (a body-extract alias) as opposed to a
  // plugin-minted UID or a module-scoped user import: the name-keyed view is file-wide, so a
  // blind (binding-less) consumer must only serve such a record INSIDE the span of the scope
  // hosting the binding - a same-named unbound read elsewhere is a runtime ReferenceError the
  // fold would mask. same-named USER aliases in DIFFERENT scopes are separate bindings: each
  // registers its own sibling record so the positional lookup serves every scope its own fold
  // (plain first-write-wins dropped the later ones and lost their folds on the target engine)
  #recordImportInfo(name, entry, { userNamed = false, scopeSpan = null } = {}) {
    const record = {
      source: `${ this.mode }/${ entry }`,
      hint: entryToGlobalHint(entry) ?? name,
      entry,
      userNamed,
      scopeSpan,
    };
    const existing = this.#importInfoByName.get(name);
    if (!existing) {
      this.#importInfoByName.set(name, record);
      return;
    }
    // first-write-wins against a plugin-minted / import record, for a non-user re-registration,
    // and for a user record re-registering an already-covered span
    if (!userNamed || !existing.userNamed) return;
    const index = this.#importSpanIndex(existing);
    const key = scopeSpan ? `${ scopeSpan.start }:${ scopeSpan.end }` : 'file';
    if (index.keys.has(key)) return;
    const siblings = existing.siblings ??= [];
    siblings.push(record);
    this.#importSpanIndex(existing, record);
  }

  // the record (primary or sibling) a use at `useStart` may read: a plugin-minted / import
  // record is file-wide; USER records serve only the scope span hosting their binding, the
  // INNERMOST containing span winning (a nested same-name alias shadows the outer one).
  // a pathless lookup (`useStart === null`) never serves a USER record: without a position the
  // span discipline cannot run, and a single record answered FILE-wide for every same-named
  // binding in the file - the wrong-Maybe over-resolve a positional consumer exists to prevent
  #servableImportRecord(primary, useStart) {
    if (!primary.userNamed) return primary;
    if (useStart === null) return null;
    // AST scope spans are nested or disjoint. If the rightmost registered span contains this
    // forward traversal's use, no earlier span can be a narrower containing scope.
    const { latest } = this.#importSpanIndex(primary);
    if (latest?.scopeSpan && latest.scopeSpan.start <= useStart && useStart <= latest.scopeSpan.end) return latest;
    const candidates = [primary, ...primary.siblings ?? []];
    let best = null;
    for (const record of candidates) {
      const span = record.scopeSpan;
      if (span && !(span.start <= useStart && useStart <= span.end)) continue;
      const size = span ? span.end - span.start : Infinity;
      if (!best || size < (best.scopeSpan ? best.scopeSpan.end - best.scopeSpan.start : Infinity)) best = record;
    }
    return best;
  }

  registerUserPureImport(entry, name, { reassigned = false } = {}) {
    this.usedNames.add(name);
    // a REASSIGNED user binding (`var _from = require(...); _from = other;`) is poisoned:
    // deduping onto it would substitute a value that is no longer the polyfill, and an info
    // record would mislead the same narrowing - the name only reserves its spelling, and the
    // plugin mints its own import for the entry
    if (reassigned) return;
    const source = `${ this.mode }/${ entry }`;
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
    // a conditionally-executed aliasing write assigns on one path only: the registered fold
    // source would substitute the polyfill where the runtime value is undefined. same poison
    // semantics as a reassignment - the value is not guaranteed at every use
    if (sourceBinding && isGuardedAliasingWrite(sourceBinding)) {
      this.#trackReassignedBinding(name, reassignedStart(sourceBinding));
      return;
    }
    // a prior registration of this binding was poisoned (unclean / guarded write set): a
    // lagged re-registration (babel's scope after the first in-place rewrite no longer shows
    // the sibling writes) must not resurrect the fold source the pristine-tree judgment
    // refused. positional lookup keeps a SIBLING-scope same-name binding registerable
    if (this.isReassignedBinding(name, sourceBinding)) return;
    // the span of the scope hosting the binding (babel scopes carry the AST node on `.block`,
    // estree-toolkit ones on `.path.node`); binding-less registrations stay file-wide
    let scopeBlock = sourceBinding?.scope?.block ?? sourceBinding?.scope?.path?.node ?? null;
    // a `var` hoists past the block scope some trackers report (estree-toolkit block-scopes a
    // labeled-block / for-init `var`): widen to the var-scope owner, or a hoisted use after the
    // block would sit outside the span and lose its fold while babel's native hoist keeps it
    if (sourceBinding?.kind === 'var' && scopeBlock && !isVarScopeBoundary(scopeBlock.type)) {
      for (let p = sourceBinding.scope?.path ?? null; p; p = p.parentPath) {
        if (!p.node || !isVarScopeBoundary(p.node.type)) continue;
        scopeBlock = p.node;
        break;
      }
    }
    this.#recordImportInfo(name, entry, {
      userNamed: true,
      scopeSpan: scopeBlock ? { start: scopeBlock.start, end: scopeBlock.end } : null,
    });
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
  // was `name` minted by THIS pass's own pure-import channel? a prior pass's binding
  // lives in the source and registers through `existingPureImports` instead - the census
  // family uses the distinction to tell a prior pass's spelling from a sibling emission
  // of the current one (the in-place emitters expose mid-pass spellings to later claims)
  isOwnPassPureBinding(name) {
    // A pre/post snapshot also carries the emission map. The source census proves
    // which of those same source/name pairs already belonged to the preceding pass.
    for (const [source, minted] of this.pureImports) {
      if (minted === name) return this.existingPureImports.get(source) !== name;
    }
    return false;
  }

  getPureImport(name) {
    return this.#importInfoByName.get(name) ?? null;
  }

  // BLIND alias registrations, name-keyed: a plugin-minted `_ref` receiver memo (unique name,
  // user code cannot rebind it) and a BINDING-LESS global write (`({ Map } = globalThis)` writes
  // the global itself - no user binding whose flow could contradict the hint). everything with a
  // user binding lives in `#bindingAliases`
  #globalAliases = new Map();

  // PER-BINDING alias registrations, keyed by the binding's declarator NODE, then by the bound
  // NAME (one declarator hosts SEVERAL bindings - `const [{ Set: A }, { Map: M }] = ...` - and
  // each keeps its own entry; a single flat entry per node let the second registration clobber
  // the first, stranding its uses native). same-name aliases in sibling scopes never collide
  // (no flat-table merge / degrade). `write` / `declSpan` ({ start, end }) record the trusted
  // source span for the use-position dominance gate and the violation-span shape check;
  // `guarded: true` marks a registration whose flow-trust was REFUSED (conditional / cross-fn /
  // dirty write, conditional `var` decl) - its binding's member reads stay native
  #bindingAliases = new WeakMap();

  // name -> binding-entry list: the fallback view for use sites that cannot resolve their
  // binding (babel scope-tracker lag after `replaceWith`) or hit a REPLACED declarator (the
  // flatten rewrites `const { Map: M } = g` in place). only an UNAMBIGUOUS name (exactly one
  // registered binding) may serve those lookups - a collision declines and the use stays native
  #aliasEntriesByName = new Map();

  registerGlobalAlias(name, globalName, {
    bindingNode = null, trusted = false, write = null, guarded = false, declSpan = null, scopeSpan = null,
    verified = false, srcPos = null, extraBindingNodes = null, minted = false,
  } = {}) {
    this.usedNames.add(name);
    if (!bindingNode) {
      // a BLIND registration claims "no user binding exists for this name" - refuse it when the
      // name already has per-binding registrations (the caller's binding lookup merely LAGGED
      // behind an AST mutation; trusting the hint would narrow over a flow a per-binding
      // registration may have refused)
      if (this.#aliasEntriesByName.get(name)?.length) return;
      this.#globalAliases.set(name, { hint: globalName, trusted: true, minted });
      return;
    }
    // symmetric with the blind refusal above: a per-binding registration PROVES a user binding
    // exists, invalidating a pre-existing blind entry's "no binding" claim - drop it so the name
    // view serves the per-binding judgment (a stale blind entry would shadow a GUARDED entry
    // with unconditional trust). minted entries are allocator-owned UIDs a user binding can
    // never collide with - keep them
    const staleBlind = this.#globalAliases.get(name);
    if (staleBlind && !staleBlind.minted) this.#globalAliases.delete(name);
    // every ctor this slot was registered with, in registration order. the surviving entry keeps ONE
    // hint (the last write - the guard keys on it), but a read whose key lives on an EARLIER write's
    // ctor needs that one too: the guard tests identity at runtime, so an extra candidate can only
    // add a branch that never fires, never a wrong answer
    const entry = { name, hint: globalName, hints: [globalName], trusted, write, guarded, declSpan, scopeSpan, verified, srcPos };
    // ONE runtime slot may register through SEVERAL nodes (a `var` redeclaration's declarators,
    // an assignment-form write's binding vs a decl-form's pattern declarator): resolve the
    // existing entry across every candidate key so the judgments MERGE into one entry instead
    // of stacking same-name siblings that poison the positional name view with ambiguity
    const candidateNodes = [bindingNode, ...extraBindingNodes ?? []].filter(Boolean);
    let existing = null;
    for (const node of candidateNodes) {
      existing = this.#bindingAliases.get(node)?.get(name);
      if (existing) break;
    }
    const table = this.#bindingAliases;
    function keyEntry(node, aliasEntry) {
      let perNode = table.get(node);
      if (!perNode) table.set(node, perNode = new Map());
      perNode.set(name, aliasEntry);
    }
    if (existing) {
      // key every candidate to the surviving entry so later lookups converge by identity
      for (const node of candidateNodes) keyEntry(node, existing);
      // the candidate list grows BEFORE the judgment returns below: a write whose judgment loses
      // still contributes the ctor it stored, which is exactly what a later read may need
      if (globalName && !existing.hints?.includes(globalName)) existing.hints = [...existing.hints ?? [], globalName];
      // same binding judged by more than one path (plan gate + standalone site): keep the
      // strongest judgment - a trusted/write registration wins over a refused one
      if ((existing.trusted || existing.write) && guarded) return;
      // A revisit of an earlier conditional write cannot replace a later guarded write or
      // verified declaration. A genuinely later conditional write still replaces either.
      const existingPos = existing.srcPos ?? existing.declSpan?.start ?? null;
      if ((existing.guarded || existing.verified) && guarded && existingPos !== null && srcPos !== null
        && srcPos < existingPos) return;
      const { hints } = existing;
      Object.assign(existing, entry, { hints });
      return;
    }
    for (const node of candidateNodes) keyEntry(node, entry);
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
    // a USER-named record (body-extract alias) serves only INSIDE its hosting scope span -
    // the same positional discipline the per-binding alias entries get below. out of span the
    // record is invisible: the name there is either unbound (a runtime ReferenceError a fold
    // would mask) or a DIFFERENT binding - including the real global the alias name shadows
    if (pure) {
      const rec = this.#servableImportRecord(pure, useStart);
      if (rec) {
        return { hint: rec.hint, source: rec.source, entry: rec.entry, userNamed: !!rec.userNamed, scopeSpan: rec.scopeSpan ?? null };
      }
    }
    const blind = this.#globalAliases.get(name);
    if (blind) return { hint: blind.hint, source: null, entry: null, aliasTrusted: true, minted: blind.minted };
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
      hint: alias.hint,
      hints: this.#candidateHints(name ?? alias.name, alias),
      source: null,
      entry: null,
      // A verified declaration is the value-writing anchor even when the host binding
      // points to an earlier var declarator. Consumers still check its span at the read.
      aliasTrusted: false,
      aliasWrite: alias.write ?? (alias.verified ? alias.declSpan : null),
      aliasGuarded: alias.guarded,
      aliasDeclSpan: alias.declSpan,
      aliasVerified: alias.verified,
    };
  }

  // existence view for `hasBinding`-style probes: presence is not trust, so ambiguity is fine -
  // but presence IS scope-bound: a per-binding registration exists only where its hosting scope
  // contains the use (a same-named local alias in another function must not make a DIRECT
  // global use look locally bound). blind and import entries are file-wide
  hasAliasName(name, useStart = null) {
    // blind global aliases split in two populations: a plugin-MINTED memo ref (`_ref` aliasing a
    // proxy receiver) must read as bound - its declaration is real but babel's scope registry lags
    // behind the mid-traversal insertion; a USER-source binding-less alias (`({ structuredClone } =
    // globalThis)`) must stay INVISIBLE here - the name IS the global slot, and reporting a binding
    // would hide its reads from the global machinery (no substitution, no deopt gating)
    const pure = this.#importInfoByName.get(name);
    if (pure && this.#servableImportRecord(pure, useStart)) return true;
    if (this.#globalAliases.get(name)?.minted) return true;
    const list = this.#aliasEntriesByName.get(name);
    if (!list?.length) return false;
    if (useStart === null) return true;
    return list.some(e => e.scopeSpan && e.scopeSpan.start <= useStart && useStart <= e.scopeSpan.end);
  }

  // the BINDING view: exact per-binding lookup for use sites that resolved their binding
  // `name` disambiguates a declarator NODE shared by SEVERAL bindings (an array-wrap /
  // object destructure - `const [{ Set: A }, { Map: M }] = ...` keys both A and M off the same
  // declarator): the entry belongs to exactly one bound name, so a mismatched query (A reading
  // M's registration) must miss rather than inherit the wrong global hint. omitted -> no check
  // every ctor any registration of this NAME was written with. one slot can register through several
  // nodes (a decl-form pattern vs an assignment-form write), and those do not merge into one entry -
  // but they are the same runtime binding, so a read off it may hold any of their ctors. the guard
  // tests identity, so an extra candidate is a branch that never fires, never a wrong answer
  #candidateHints(name, alias) {
    const hints = [...alias.hints ?? [alias.hint]];
    for (const entry of this.#aliasEntriesByName.get(name) ?? []) {
      for (const hint of entry.hints ?? [entry.hint]) if (hint && !hints.includes(hint)) hints.push(hint);
    }
    return hints;
  }

  getBindingAliasInfo(bindingNode, name = null) {
    const perNode = bindingNode ? this.#bindingAliases.get(bindingNode) : null;
    const alias = !perNode ? null
      : name !== null ? perNode.get(name) ?? null
      : perNode.size === 1 ? perNode.values().next().value : null;
    if (!alias) return null;
    return {
      hint: alias.hint,
      hints: this.#candidateHints(name, alias),
      source: null,
      entry: null,
      aliasTrusted: false,
      aliasWrite: alias.write ?? (alias.verified ? alias.declSpan : null),
      aliasGuarded: alias.guarded,
      aliasDeclSpan: alias.declSpan,
      aliasVerified: alias.verified,
    };
  }

  // user-owned names the allocator AND any post-pass renumber must never take: unlike
  // `usedNames` (which also holds plugin-allocated slots the renumber may reclaim), these
  // stay taken forever - e.g. a `globalThis.<name>` slot the user writes, aliasing a
  // top-level `var <name>` in script-scope output
  reservedNames = new Set();

  seedReservedNames(names) {
    for (const n of names) {
      this.usedNames.add(n);
      this.reservedNames.add(n);
    }
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
    const start = chooseStart(cached, prefix, isTaken);
    const name = start.name ?? findUniqueName(prefix, start.startSuffix, isTaken);
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
  captureImportInfoByName() {
    // the RECORDS are mutable, not only the sibling lists (`#recordImportInfo` pushes into an
    // existing record) - clone each record and its siblings so post-phase writes never reach
    // back into pre's capture
    return new Map([...this.#importInfoByName].map(([name, info]) => {
      const record = { ...info };
      if (record.siblings) record.siblings = record.siblings.map(sibling => ({ ...sibling }));
      return [name, record];
    }));
  }
  rehydrateImportInfoByName(captured) {
    if (captured) for (const [name, info] of captured) this.#importInfoByName.set(name, info);
  }

  // the MINTED blind entries are keyed by a generated ref's name: when the emitter's final
  // canonicalization renames or drops that ref, the entry follows it - a registry that kept the
  // old spelling would answer for a name the text no longer has (or, worse, for a DIFFERENT ref
  // the rename handed the old spelling to)
  renameMintedAliases(renameMap) {
    const renamed = [];
    for (const [name, alias] of this.#globalAliases) {
      if (alias.minted && renameMap.has(name)) renamed.push([name, alias]);
    }
    for (const [name] of renamed) this.#globalAliases.delete(name);
    for (const [name, alias] of renamed) this.#globalAliases.set(renameMap.get(name), alias);
  }
  dropMintedAliases(names) {
    for (const name of names) if (this.#globalAliases.get(name)?.minted) this.#globalAliases.delete(name);
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
  generateRefName(extraCheck) {
    const name = this.#recordOwnPassName(this.uniqueName('_ref', extraCheck));
    this.#generatedByPrefix.get('_ref').add(name);
    return name;
  }

  // `_unused, _unused2, _unused3, ...` sentinels for rest-destructure rebuild
  // (`{ polyKey: _unused, ...rest } = obj`)
  generateUnusedName() {
    const name = this.#recordOwnPassName(this.uniqueName('_unused'));
    this.#unusedSentinelNames.add(name);
    this.#generatedByPrefix.get('_unused').add(name);
    return name;
  }

  // membership in ANY generated family - the renumber's own-name gate
  isGeneratedFamilyName(name) {
    for (const [, names] of this.#generatedByPrefix) if (names.has(name)) return true;
    return false;
  }

  // the family registry itself (prefix -> Set) - each emitter's prune reads and maintains
  // the slot space through it
  generatedRefFamilies() { return this.#generatedByPrefix; }

  // subclass hook: extra name registries the canonical rename must rebuild alongside the
  // base ones (e.g. the unplugin injector's flushed-refs set)
  extraGeneratedNameSets() { return []; }

  #allGeneratedNameSets() {
    return [
      this.declaredRefNames,
      this.usedNames,
      this.#unusedSentinelNames,
      this.#adoptedUnusedSentinelNames,
      ...this.#generatedByPrefix.values(),
      ...this.extraGeneratedNameSets(),
    ];
  }

  // final print-order canonicalization: every registry keyed by a GENERATED name renames
  // through `renameNamesSet` (a sequential delete/add over a swap-shaped map funnels a set
  // into its last target), and the minted blind aliases follow their refs - a registry that
  // kept the old spelling would answer for a name the tree no longer has
  canonicalizeGeneratedNames(renameMap) {
    if (!renameMap.size) return;
    for (const set of this.#allGeneratedNameSets()) {
      const renamed = renameNamesSet(set, renameMap);
      set.clear();
      for (const name of renamed) set.add(name);
    }
    this.renameMintedAliases(renameMap);
  }

  // `_unused` sentinel bookkeeping: `hasGeneratedUnusedName` arms the dispatchers'
  // idempotency skip, and ADOPTION re-arms it on a re-parse of our own output, where the
  // rest/SE-key sentinels are already in place - without it a pass re-extracts the sentinel
  // as a live binding and mints a fresh one, growing the file per pass. the caller hands
  // over only census-verified sentinel-POSITION names (bound there, read nowhere else);
  // the generator-shape check here is the second half of the same gate. subclasses with
  // richer per-pass state may override the trio wholesale
  #unusedSentinelNames = new Set();
  #adoptedUnusedSentinelNames = new Set();

  adoptUnusedNames(names) {
    let maxSuffix = 1;
    for (const name of names) {
      const match = UNUSED_NAME_PATTERN.exec(name);
      if (!match) continue;
      this.#unusedSentinelNames.add(name);
      this.#adoptedUnusedSentinelNames.add(name);
      this.usedNames.add(name);
      const n = match.groups.suffix ? parseInt(match.groups.suffix, 10) : 1;
      if (n > maxSuffix) maxSuffix = n;
    }
    if (maxSuffix > 1) this.rehydrateSuffixState(new Map([['_unused', maxSuffix + 1]]));
  }

  hasGeneratedUnusedName(name) {
    return this.#unusedSentinelNames.has(name);
  }

  isAdoptedUnusedName(name) {
    return this.#adoptedUnusedSentinelNames.has(name);
  }

  // pre->post handoff of the sentinel registry (adoption state deliberately stays per-pass:
  // post re-adopts from its own census, so only the plain sentinel set travels)
  captureUnusedSentinelNames() { return new Set(this.#unusedSentinelNames); }
  rehydrateUnusedSentinelNames(names) {
    for (const name of names ?? []) this.#unusedSentinelNames.add(name);
  }

  // generated names THIS pass minted: a prior pass's `_refN` / `_unusedN` lives in the
  // source and never re-generates (allocation skips taken names), so membership here
  // separates a sibling emission of the current pass from a prior pass's spelling - the
  // census family's question for adopted-ref receivers
  #ownPassGeneratedNames = new Set();

  #recordOwnPassName(name) {
    this.#ownPassGeneratedNames.add(name);
    return name;
  }

  isOwnPassGeneratedName(name) {
    return this.#ownPassGeneratedNames.has(name);
  }

  // a sentinel THIS pass minted: an adopted one may be a name the user spelled and exports
  isOwnPassUnusedName(name) {
    return this.#ownPassGeneratedNames.has(name) && this.#unusedSentinelNames.has(name);
  }
}

function refSlotName(prefix, i) {
  return i === 1 ? prefix : `${ prefix }${ i }`;
}

// true when `familyRank` names occupy exactly slots `<prefix>..<prefix>N` in ascending
// order - the one state where the canonical (print-order) renumber is provably the
// identity without consulting the taken set: every slot in the compact prefix is
// plugin-owned, so the shared assignment can only hand the k-th ranked name the k-th slot
export function isCanonicalSlotOrder(prefix, familyRank) {
  for (let i = 0; i < familyRank.length; i++) {
    if (familyRank[i] !== refSlotName(prefix, i + 1)) return false;
  }
  return true;
}

// numeric slot of a generator-shaped name (`_ref` -> 1, `_ref7` -> 7) via the family's own
// pattern; Infinity for a non-slot spelling so canonical sorts push it last instead of throwing
function refSlotNumber(prefix, name) {
  const match = GENERATED_NAME_FAMILIES.get(prefix)?.exec(name);
  if (!match) return Infinity;
  return match.groups.suffix ? Number(match.groups.suffix) : 1;
}

// snapshot-rebuild of a name set through a rename map - sequential in-place delete/add
// would chain a shift-shaped map (`_ref -> _ref2 -> _ref3`) and funnel the whole set into
// its last target; every registry renames through this one helper
function renameNamesSet(set, renameMap) {
  return new Set([...set].map(name => renameMap.get(name) ?? name));
}

// the minted family a generated name belongs to - the ONE spelling of the prefix split
// (the registries cannot answer for a snapshot-rehydrated name, so the name decides)
export function generatedNameFamilyOf(name) {
  return name.startsWith('_unused') ? '_unused' : '_ref';
}

// composite sort key for a mixed declarator list: `_ref` family first, then `_unused`,
// ascending slot within each - the one declaration order both emitters print
export function refDeclarationOrder(a, b) {
  const prefixA = generatedNameFamilyOf(a);
  const prefixB = generatedNameFamilyOf(b);
  if (prefixA !== prefixB) return prefixA === '_unused' ? 1 : -1;
  return refSlotNumber(prefixA, a) - refSlotNumber(prefixB, b);
}

// canonical slot assignment for ONE prefix family: names ordered by FIRST PRINT OCCURRENCE
// take the lowest free slots, so the two emitters agree on numbering wherever they agree on
// output shape - the raw allocation orders differ by construction (the babel emitter's guard
// climb allocates helper-first, the unplugin's guard builder root-first). `isTaken`
// filters slots the file cannot reuse (user bindings, orphan slot-shaped names). returns
// Map<oldName, newName> with identity entries omitted
function assignCanonicalRefSlots(prefix, orderedNames, isTaken) {
  const renameMap = new Map();
  let i = 1;
  for (const name of orderedNames) {
    let target = refSlotName(prefix, i++);
    while (isTaken(target)) target = refSlotName(prefix, i++);
    if (name !== target) renameMap.set(name, target);
  }
  return renameMap;
}

// --- the flush-time census both emitters read (ONE positional AST pass over the final tree) ---

const EMPTY_NAME_SET = new Set();

// the one position a pure import's own statement binds its name in: the default specifier's
// local, or the declarator id of a `var X = require(...)` - an occurrence there is the
// import itself, not a use of it
function isPureImportBinderPosition(parent, node) {
  if (parent?.type === 'ImportDefaultSpecifier' && parent.local === node) return true;
  return parent?.type === 'VariableDeclarator' && parent.id === node && isRequireCall(parent.init);
}

// the write-only guard-memo shape, matched at every null-compare: our own memo in a guard TEST
// serves the reads spelled off it, so a ref nothing reads is a write no one consumes and the test
// can hold the value itself. deadness only exists AFTER composition - a receiver-independent claim
// reads no base, a nested test already owns the one evaluation - so it is decided at flush from the
// census counts (`unwrapWriteOnlyGuardMemos`). one candidate per test: a NESTED guard is a
// null-compare of its own and the walk reaches it there, so this asks only about THIS test's memo
function collectWriteOnlyGuardMemoCandidate(node, mintedRefNames, out) {
  if (node.type !== 'BinaryExpression' || node.operator !== '==') return;
  // every slot peels transparent wrappers: the minted composition carries none, but the two
  // paren spellings (babel's `extra` flag, an estree parser's node) owe the same answer
  const side = isNullLiteralNode(unwrapRuntimeExpr(node.left)) ? 'right'
    : isNullLiteralNode(unwrapRuntimeExpr(node.right)) ? 'left' : null;
  const write = side ? unwrapRuntimeExpr(node[side]) : null;
  if (write?.type !== 'AssignmentExpression' || write.operator !== '='
    || write.left?.type !== 'Identifier' || !mintedRefNames.has(write.left.name)) return;
  // `write` rides along: `node[side]` may be a paren NODE over the write, and the unwrap
  // replaces that whole slot with the write's RHS
  out.push({ test: node, side, write, name: write.left.name });
}

// answers every liveness / slot question the emitters flush and prune by: which spellings
// exist at all (`usedNames`, position-blind), which minted refs are READ and where they rank
// in print order (`refCounts` / `refDeclIdCounts` / `printRank` / `refNodes`), which
// pure-import names occur beyond their own import statement (`pureCounts` minus
// `pureImportBoundCounts`), which `obj.key` member reads exist (the pure-static ctor
// exception), which foreign slot-shaped spellings force the taken-aware renumber
// (`foreignSlotName` / `referenceNames`), and the nested guard-memo candidates. one walk,
// either dialect - the node-shape questions go through the canon predicates
export function collectInjectorCensus(program, {
  mintedRefNames = EMPTY_NAME_SET,
  pureNames = EMPTY_NAME_SET,
  memoReuse = false,
  memoActivations = null,
} = {}) {
  const usedNames = new Set();
  const memberReads = new Set();
  const referenceNames = new Set();
  const refNodes = new Set();
  const refCounts = new Map();
  const refDeclIdCounts = new Map();
  const printRank = [];
  const rankedNames = new Set();
  const pureCounts = new Map();
  const pureImportBoundCounts = new Map();
  let foreignSlotName = false;
  const nestedGuardMemoCandidates = [];
  const memoStatementWrites = [];
  const memoBindings = new Map();
  const ancestors = [];
  const ancestorKeys = [];
  const ancestorListKeys = [];
  const memoDeclarations = [];
  const memoSequences = [];
  const memberKeys = memberKeyNamesReducer();
  // eslint-disable-next-line max-statements -- one final-tree census keeps liveness and positional memo facts together
  walkAstNodes({ root: program, visit(node, parent, key, listKey) {
    // a `:` slot is where babel's uid scan stops: a name written past one claims nothing
    // (`declare const v: { _ref2(): void }` leaves `_ref2` free), while a type-alias RHS or
    // an interface body carries no such wrapper and is walked at any depth
    if (isTypeAnnotationWrapper(node)) return false;
    if (memoReuse) {
      ancestors.push(node);
      ancestorKeys.push(key);
      ancestorListKeys.push(listKey);
      if (node.type === 'VariableDeclaration' && (statementListOf(parent) || parent?.type === 'ForStatement' && parent.init === node)) {
        memoDeclarations.push({
          declaration: node,
          list: statementListOf(parent),
          index: key,
          loop: parent?.type === 'ForStatement' ? parent : null,
        });
      }
      if (node.type === 'SequenceExpression' && node.expressions.slice(0, -1).some(expression => {
        const value = unwrapRuntimeExpr(peelNestedSequenceExpressions(expression).tail);
        return value?.type === 'Identifier' && (mintedRefNames.has(value.name) || pureNames.has(value.name))
          || value?.type === 'AssignmentExpression' && value.left?.type === 'Identifier' && mintedRefNames.has(value.left.name);
      })) {
        memoSequences.push({ node, parent, ancestors: ancestors.slice(), keys: ancestorKeys.slice(), listKeys: ancestorListKeys.slice() });
      }
    }
    if (node.type === 'Identifier' || node.type === 'JSXIdentifier') {
      const { name } = node;
      usedNames.add(name);
      if (pureNames.has(name)) {
        pureCounts.set(name, (pureCounts.get(name) ?? 0) + 1);
        if (isPureImportBinderPosition(parent, node)) {
          pureImportBoundCounts.set(name, (pureImportBoundCounts.get(name) ?? 0) + 1);
        }
      }
      // what may be RENAMED and what BLOCKS a slot are two questions: a source-text name is
      // never rewritten, yet an overload signature's key still reserves its name
      if (!isNonReferencePosition(parent, node)) {
        if (mintedRefNames.has(name)) {
          refNodes.add(node);
          refCounts.set(name, (refCounts.get(name) ?? 0) + 1);
          if (parent?.type === 'VariableDeclarator' && parent.id === node) {
            refDeclIdCounts.set(name, (refDeclIdCounts.get(name) ?? 0) + 1);
          // print-order rank: the first occurrence OUTSIDE a declarator-id position - a
          // hoisted declaration (or a memo `const`) is not where the name was needed, so both
          // emitters number at the first real use; a name only its declarators spell is
          // appended after the ranked survivors by the renumber
          } else if (!rankedNames.has(name)) {
            rankedNames.add(name);
            printRank.push(name);
          }
        } else {
          referenceNames.add(name);
          // a foreign slot-shaped spelling (a user binding, a sibling-plugin introduction)
          // means the compact-prefix fast exit cannot prove canonicality by itself
          if (!foreignSlotName && name.charCodeAt(0) === 95 && isGeneratedSlotShapedName(name)) {
            foreignSlotName = true;
          }
        }
      } else if (blocksUidSlot(parent, node)) referenceNames.add(name);
    }
    // Keep final positional facts in the same census: inner claim renders may have
    // turned a captured receiver into a stable import since the memo was allocated.
    if (memoReuse && (node.type === 'Identifier' || node.type === 'JSXIdentifier')
      && mintedRefNames.has(node.name) && !isNonReferencePosition(parent, node)) {
      let binding = memoBindings.get(node.name);
      if (!binding) memoBindings.set(node.name, binding = { writes: [], reads: [], declarations: [], invalid: false });
      const spine = ancestors.slice();
      const frame = spine.findLast(ancestor => isVarScopeBoundary(ancestor.type));
      const occurrence = { node, parent, ancestors: spine, frame, keys: ancestorKeys.slice(), listKeys: ancestorListKeys.slice() };
      let path = null;
      for (const ancestor of spine) path = { node: ancestor, parentPath: path, parent: path?.node };
      if (parent?.type === 'VariableDeclarator' && parent.id === node) {
        binding.declarations.push(occurrence);
        if (parent.init) {
          if (!statementListOf(spine.at(-4))) binding.invalid = true;
          binding.writes.push({
            ...occurrence,
            write: parent,
            ancestors: spine.slice(0, -1),
            keys: occurrence.keys.slice(0, -1),
            listKeys: occurrence.listKeys.slice(0, -1),
            parent: spine.at(-3),
          });
        }
      } else if (isPropertyNode(parent) && parent.value === node && (!parent.computed || isQuietLiteralOperand(parent.key))
        && spine.at(-3)?.type === 'ObjectPattern' && spine.at(-3).properties.length === 1
        && spine.at(-4)?.type === 'VariableDeclarator' && spine.at(-4).id === spine.at(-3) && spine.at(-4).init
        && statementListOf(spine.at(-6))) {
        const declarator = spine.at(-4);
        binding.declarations.push(occurrence);
        binding.writes.push({
          ...occurrence,
          write: declarator,
          value: memberExpression(declarator.init, cloneNode(parent.key), {
            computed: parent.computed || parent.key.type !== 'Identifier',
          }),
          ancestors: spine.slice(0, -3),
          keys: occurrence.keys.slice(0, -3),
          listKeys: occurrence.listKeys.slice(0, -3),
          parent: spine.at(-5),
        });
      } else if (parent?.type === 'AssignmentExpression' && parent.left === node && parent.operator === '=') {
        binding.writes.push({
          ...occurrence,
          write: parent,
          ancestors: spine.slice(0, -1),
          keys: occurrence.keys.slice(0, -1),
          listKeys: occurrence.listKeys.slice(0, -1),
          parent: spine.at(-3),
        });
      } else if (isBindingDeclarationPath(path) || isAssignOrForXWriteTargetPath(path)
        || parent?.type === 'UpdateExpression' || parent?.type === 'UnaryExpression' && parent.operator === 'delete') {
        binding.invalid = true;
      } else binding.reads.push(occurrence);
    }
    if ((node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression')
      && node.object?.type === 'Identifier') {
      const propertyKey = memberKeyName(node);
      if (propertyKey !== null) memberReads.add(`${ node.object.name }.${ propertyKey }`);
    }
    memberKeys.visit(node);
    collectWriteOnlyGuardMemoCandidate(node, mintedRefNames, nestedGuardMemoCandidates);
    const write = node.type === 'ExpressionStatement' && statementListOf(parent)
      ? unwrapRuntimeExpr(node.expression) : null;
    if (write?.type === 'AssignmentExpression' && write.operator === '='
      && write.left?.type === 'Identifier' && mintedRefNames.has(write.left.name)) {
      memoStatementWrites.push({ statement: node, name: write.left.name, value: write.right });
    }
  }, leave() {
    if (memoReuse) {
      ancestors.pop();
      ancestorKeys.pop();
      ancestorListKeys.pop();
    }
  } });
  // an id-rooted member KEY reserves its name too - a slot-shaped spelling there is source
  // text, and the renumber must keep avoiding it
  for (const name of memberKeys.result().memberKeyNames) {
    if (!mintedRefNames.has(name)) referenceNames.add(name);
  }
  return {
    usedNames,
    memberReads,
    referenceNames,
    refNodes,
    refCounts,
    refDeclIdCounts,
    printRank,
    pureCounts,
    pureImportBoundCounts,
    foreignSlotName,
    nestedGuardMemoCandidates,
    memoStatementWrites,
    memoBindings,
    memoActivations,
    pureNames,
    memoDeclarations,
    memoSequences,
  };
}

// unwrap the write-only candidates in place: a ref with exactly ONE occurrence beyond its
// declarators (the write itself) serves no read - the write collapses to its RHS and the
// ref falls to declarator-only, which each emitter's own prune then drops
// eslint-disable-next-line max-statements -- consume the one census without another AST pass
export function unwrapWriteOnlyGuardMemos(census, { injectorState = null, contextForMemo = null } = {}) {
  for (const candidate of census.nestedGuardMemoCandidates) {
    const { name } = candidate;
    if ((census.refCounts.get(name) ?? 0) - (census.refDeclIdCounts.get(name) ?? 0) !== 1) continue;
    candidate.test[candidate.side] = candidate.write.right;
    census.refCounts.set(name, (census.refCounts.get(name) ?? 1) - 1);
  }
  if (!injectorState || !contextForMemo) return;
  // Resolve positions before any declaration or sequence list changes. A source receiver
  // can have become an immutable own import only after its nested claims were emitted.
  const sequenceTrims = census.memoSequences.flatMap(occurrence => {
    const ctx = contextForMemo(null, occurrence.node, occurrence);
    if (!ctx) return [];
    return [{ ...occurrence, ctx: { ...ctx, injectorState } }];
  });
  const retiredDeclarations = new Set();
  const inlinedDeclarations = new Set();
  for (const [name, binding] of census.memoBindings) {
    if (binding.invalid || binding.writes.length !== 1 || !binding.reads.length
      || !injectorState.isOwnPassGeneratedName(name)) continue;
    const [writer] = binding.writes;
    const initialized = writer.write.type === 'VariableDeclarator';
    if (census.refCounts.get(name) !== binding.reads.length + binding.declarations.length + (initialized ? 0 : 1)) continue;
    const value = writer.value ?? (initialized ? writer.write.init : writer.write.right);
    const [firstRead] = binding.reads;
    const call = firstRead?.parent;
    const consumerAt = firstRead?.ancestors.findLastIndex(node => node.type === 'VariableDeclarator');
    const consumer = firstRead?.ancestors[consumerAt];
    const consumerDeclaration = firstRead?.ancestors[consumerAt - 1];
    const original = writer.ancestors.at(-2);
    // Moving a single read into the very next helper argument crosses only the immutable
    // own import's callee read. No source key, default, declaration or call lies in between.
    if (initialized && binding.reads.length === 1 && binding.declarations.length === 1
      && call?.type === 'CallExpression' && call.arguments[0] === firstRead.node && call.arguments.length === 1
      && call.callee.type === 'Identifier' && injectorState.isOwnPassPureBinding(call.callee.name)
      && consumer?.type === 'VariableDeclarator' && consumer.id.type === 'Identifier'
      && firstRead.ancestors.slice(consumerAt + 1, -1).every((node, index, spine) => node.type === 'CallExpression'
        && node.arguments.length === 1 && node.arguments[0] === (spine[index + 1] ?? firstRead.node)
        && node.callee.type === 'Identifier' && injectorState.isOwnPassPureBinding(node.callee.name))
      && consumerDeclaration?.type === 'VariableDeclaration' && original?.type === 'VariableDeclaration'
      && (consumerDeclaration === original && firstRead.keys[consumerAt] === writer.keys.at(-1) + 1
        || consumerDeclaration.declarations[0] === consumer && original.declarations.length === 1
          && firstRead.ancestors[consumerAt - 2] === writer.ancestors.at(-3)
          && statementListOf(firstRead.ancestors[consumerAt - 2])
          && firstRead.keys[consumerAt - 1] === writer.keys.at(-2) + 1)) {
      call.arguments[0] = value;
      retiredDeclarations.add(writer.write);
      inlinedDeclarations.add(writer.write);
      census.refCounts.set(name, binding.declarations.length);
      continue;
    }
    let tail = peelSequenceTail(unwrapRuntimeExpr(value), { step: unwrapRuntimeExpr });
    let guard = null;
    if (tail?.type === 'ConditionalExpression') {
      const defined = definedBranchOfGuardConditional(tail);
      const empty = defined === tail.alternate ? tail.consequent : tail.alternate;
      // A source identifier named `undefined` may be shadowed. Only the rendered quiet
      // void arm proves that a successful outer null guard reached the other value.
      if (!defined || empty?.type !== 'UnaryExpression' || empty.operator !== 'void') continue;
      guard = census.nestedGuardMemoCandidates.find(candidate => candidate.write === writer.write);
      if (!guard) continue;
      tail = peelSequenceTail(unwrapRuntimeExpr(defined), { step: unwrapRuntimeExpr });
    }
    const stored = tail?.type === 'AssignmentExpression' && tail.operator === '='
      && tail.left.type === 'Identifier' ? tail : null;
    if (stored) tail = stored.left;
    const member = isMemberAccessNode(tail);
    if (!member && (tail?.type !== 'Identifier' || tail.name === name)) continue;
    const ctx = contextForMemo(name, writer.write, writer);
    if (!ctx) continue;
    if (writer.value && ctx.path?.get) {
      ctx.path = ctx.path.get('init');
      ctx.scope = ctx.path.scope;
    }
    let quietGuardStore = false;
    const literal = member && unwrapRuntimeExpr(tail.object);
    const field = literal?.type === 'ObjectExpression' && literal.properties.length === 1 ? literal.properties[0] : null;
    const sourceValue = field && isPropertyNode(field) && unwrapRuntimeExpr(field.value);
    const test = binding.reads[0]?.parent;
    const conditional = binding.reads[0]?.ancestors.at(-3);
    const fallback = binding.reads[1]?.parent;
    const other = test?.left === binding.reads[0]?.node ? test?.right : test?.left;
    if (writer.value && binding.reads.length === 2 && sourceValue?.type === 'Identifier'
      && !field.computed && !field.method && field.kind !== 'get' && field.kind !== 'set'
      && memberKeyName(tail) === (foldedPropertyKeyName(field) ?? plainSynthKeyName(field.key))
      && test?.type === 'BinaryExpression' && test.operator === '===' && other?.type === 'Identifier'
      && injectorState.isOwnPassPureBinding(other.name) && conditional?.type === 'ConditionalExpression'
      && conditional.test === test && conditional.alternate === fallback
      && isMemberAccessNode(fallback) && fallback.object === binding.reads[1].node
      && (binding.reads[0].ancestors.at(-5) === original
        && binding.reads[0].keys.at(-4) === writer.keys.at(-1) + 1
        || binding.reads[0].ancestors.at(-6) === writer.ancestors.at(-3)
          && binding.reads[0].keys.at(-5) === writer.keys.at(-2) + 1)) {
      const source = ctx.adapter?.getBinding?.(ctx.scope, sourceValue.name, ctx.path);
      quietGuardStore = ['let', 'const'].includes(source?.kind) && isReusableReceiver(sourceValue, { directCallee: true, ctx });
      if (quietGuardStore) tail = sourceValue;
    }
    if (stored) {
      const source = ctx.adapter?.getBinding?.(ctx.scope, tail.name, ctx.path);
      const declaration = bindingDeclarationPath(source);
      const frame = findNearestVarScopeOwner(declaration)?.node;
      const writes = cleanDestructureAliasWrites(source);
      const write = writes[0]?.node ?? writes[0];
      const site = nodeSpan(write);
      const span = nodeSpan(write?.type === 'Identifier' ? stored.left : stored);
      // The source store already holds the snapshot. Its single writer must belong to
      // this activation; an outer binding could change when a getter re-enters its writer.
      if (!['let', 'var'].includes(source?.kind) || frame !== writer.frame
        || frame?.type === 'Program' && frame.sourceType === 'script' && source.kind === 'var'
        || !ctx.adapter.collectBindingReferences?.(ctx.path, tail.name, { closed: true })
        || writes.length !== 1 || !span || !site || site.start !== span.start || site.end !== span.end) continue;
    }
    const primary = census.memoBindings.get(tail.name);
    const immutablePrimary = primary?.declarations[0]?.ancestors.at(-3)?.kind === 'const';
    const alias = primary && !primary.invalid && primary.writes.length === 1
      && binding.declarations.length === 1 && primary.declarations.length === 1
      && (immutablePrimary || census.memoActivations?.has(writer.frame))
      && binding.declarations[0].frame === writer.frame && primary.declarations[0].frame === writer.frame
      && (immutablePrimary || isGeneratedMemoDeclarator(binding.declarations[0].parent)
        && isGeneratedMemoDeclarator(primary.declarations[0].parent)) ? primary.writes[0] : null;
    const scoped = !member && ctx.adapter?.getBinding?.(ctx.scope, tail.name, ctx.path);
    const sourceDeclaration = !stored && !member && !alias && !injectorState.isOwnPassGeneratedName(tail.name)
      && bindingDeclarationPath(scoped)?.node;
    // A lowered pattern default may write the source between the capture and later
    // siblings. Its old text offset can precede the RHS while its live slot follows it.
    const statementAt = writer.listKeys.findLastIndex((slot, i) => slot && statementListOf(writer.ancestors[i - 1]));
    if (sourceDeclaration && statementAt !== -1 && cleanDestructureAliasWrites(scoped)
      .some(write => subtreeContainsNode(writer.ancestors[statementAt], write.node ?? write))) continue;
    if (!stored && !member && (alias ? !injectorState.isOwnPassGeneratedName(tail.name)
      : !injectorState.isOwnPassPureBinding(tail.name) && !sourceDeclaration)) continue;
    if (!stored && !quietGuardStore
      && !isReusableReceiver(tail, { interveningEffects: true, ctx: { ...ctx, injectorState } })) continue;
    if (!stored && !member && !alias && !sourceDeclaration && scoped && !((scoped.kind === 'module' || !scoped.node) && scoped.importSource
      && pureImportSourceEntry(scoped.importSource) === injectorState.getPureImport(tail.name)?.entry)) continue;
    // All later reads must follow the actual write in the same activation. Compare final
    // tree slots, not source offsets: compiler nodes have none, and a skipped branch does
    // not dominate a read merely because its text appeared earlier.
    const pairs = binding.reads.map(read => [writer, read]);
    if (alias) pairs.push([alias, writer], ...binding.reads.map(read => [alias, read]));
    let reusable = true;
    for (const [first, later] of pairs) {
      // A stable source binding may be shadowed at a later read. Reuse only the same
      // declaration, as resolved at each final tree position rather than by spelling.
      if (sourceDeclaration) {
        const readCtx = contextForMemo(name, later.node, later);
        const source = readCtx && readCtx.adapter?.getBinding?.(readCtx.scope, tail.name, readCtx.path);
        if (bindingDeclarationPath(source)?.node !== sourceDeclaration) {
          reusable = false;
          break;
        }
      }
      if (first.frame !== later.frame) {
        reusable = false;
        break;
      }
      const a = first.ancestors;
      const b = later.ancestors;
      let at = 0;
      while (a[at] && a[at] === b[at]) at++;
      if (!at || at === a.length || at === b.length) {
        reusable = false;
        break;
      }
      for (let i = at; i < a.length; i++) {
        if (conditionalEvaluationEdge(a[i - 1], a[i])) {
          reusable = false;
          break;
        }
      }
      if (!reusable) break;
      const owner = a[at - 1];
      const earlier = a[at];
      const after = b[at];
      let precedes;
      switch (owner.type) {
        case 'ConditionalExpression':
          precedes = owner.test === earlier;
          break;
        case 'CallExpression':
        case 'OptionalCallExpression':
        case 'NewExpression':
          precedes = owner.callee === earlier && later.listKeys[at] === 'arguments'
            || first.listKeys[at] === 'arguments' && later.listKeys[at] === 'arguments'
              && first.keys[at] < later.keys[at];
          break;
        case 'MemberExpression':
        case 'OptionalMemberExpression':
          precedes = owner.object === earlier && owner.property === after && owner.computed;
          break;
        case 'BinaryExpression':
        case 'LogicalExpression':
          precedes = owner.left === earlier && owner.right === after;
          break;
        default: {
          const slot = owner.type === 'SequenceExpression' || owner.type === 'TemplateLiteral' ? 'expressions'
            : owner.type === 'BlockStatement' || owner.type === 'Program' ? 'body'
              : owner.type === 'ArrayExpression' ? 'elements'
                : owner.type === 'VariableDeclaration' ? 'declarations' : null;
          precedes = !!slot && first.listKeys[at] === slot && later.listKeys[at] === slot
            && first.keys[at] < later.keys[at];
        }
      }
      if (!precedes) {
        reusable = false;
        break;
      }
      if (guard && first === writer) {
        const branchAt = a.findLastIndex(ancestor => ancestor.type === 'ConditionalExpression'
          && unwrapRuntimeExpr(ancestor.test) === guard.test);
        if (branchAt === -1 || b[branchAt] !== a[branchAt] || b[branchAt + 1] !== a[branchAt].alternate) {
          reusable = false; break;
        }
      }
    }
    if (!reusable) continue;
    // Retain the entire first RHS, including prefix reads, probes and throws. Only its
    // stored copy leaves; later reads use the proven stable terminal value.
    const { parent } = writer;
    const slotKey = writer.keys.at(-1);
    const listKey = writer.listKeys.at(-1);
    const writeContainer = listKey ? parent[listKey] : parent;
    if (writeContainer[slotKey] !== writer.write) continue;
    if (initialized) retiredDeclarations.add(writer.write);
    else writeContainer[slotKey] = value;
    for (const read of binding.reads) {
      if (member) {
        const container = read.listKeys.at(-1) ? read.parent[read.listKeys.at(-1)] : read.parent;
        let root = cloneNode(tail);
        container[read.keys.at(-1)] = root;
        census.refNodes.delete(read.node);
        while (isMemberAccessNode(root)) {
          const key = root.object.type === 'Identifier' ? memberKeyName(root) : null;
          if (key !== null) census.memberReads.add(`${ root.object.name }.${ key }`);
          root = unwrapRuntimeExpr(root.object);
        }
        if (root?.type === 'Identifier' && census.refCounts.has(root.name)) {
          census.refCounts.set(root.name, census.refCounts.get(root.name) + 1);
          census.refNodes.add(root);
        }
        if (root?.type === 'Identifier' && census.pureNames.has(root.name)) {
          census.pureCounts.set(root.name, (census.pureCounts.get(root.name) ?? 0) + 1);
        }
      } else read.node.name = tail.name;
      if (alias) census.refCounts.set(tail.name, (census.refCounts.get(tail.name) ?? 0) + 1);
      else if (!stored && !member && census.pureNames.has(tail.name)) {
        census.pureCounts.set(tail.name, (census.pureCounts.get(tail.name) ?? 0) + 1);
      }
      if (!member && (read.parent?.type === 'MemberExpression' || read.parent?.type === 'OptionalMemberExpression')
        && read.parent.object === read.node) {
        const key = memberKeyName(read.parent);
        if (key !== null) census.memberReads.add(`${ tail.name }.${ key }`);
      }
    }
    census.refCounts.set(name, binding.declarations.length);
  }
  // Declaration writes retire after every positional question was answered, so splitting
  // a list never invalidates a later candidate's slot. Keep each entire first initializer
  // in its original order; adjacent source declarators retain their declaration kind.
  for (const { declaration, list, index, loop } of census.memoDeclarations.toReversed()) {
    if (loop) {
      const retired = new Set();
      for (let at = 0; at < declaration.declarations.length; at++) {
        const item = declaration.declarations[at];
        const name = item.id?.name;
        if (item.id?.type !== 'Identifier' || !item.init || !injectorState.isOwnPassGeneratedName(name)
          || census.refCounts.get(name) !== census.refDeclIdCounts.get(name)) continue;
        const next = declaration.declarations[at + 1];
        // An unused loop-header store can move into the adjacent initialized binding.
        // Preserve every source read and effect; only a verified immutable import or
        // pristine built-in terminal contributes no work to the discarded value.
        if (!next?.init && (next || retired.size !== at)) continue;
        const writer = census.memoBindings.get(name)?.writes.find(occurrence => occurrence.write === item);
        const ctx = writer && contextForMemo(name, item, writer);
        if (!ctx) continue;
        const { prefix, tail } = peelNestedSequenceExpressions(item.init);
        const pure = tail?.type === 'Identifier' && injectorState.isOwnPassPureBinding(tail.name)
          && isReusableReceiver(tail, { interveningEffects: true, ctx: { ...ctx, injectorState } });
        const builtin = tail?.type === 'Identifier' && !ctx.adapter?.hasBinding(ctx.scope, tail.name, ctx.path)
          && ctx.adapter?.isKnownGlobalName?.(tail.name) && !ctx.adapter?.isMutatedStaticSlot?.('globalThis', tail.name);
        const effects = prefix.filter(expression => !isQuietLiteralOperand(expression));
        if (!pure && !builtin) effects.push(tail);
        if (next) {
          next.init = effects.length ? sequenceExpression([...effects, next.init]) : next.init;
        } else {
          loop.init = effects.length > 1 ? sequenceExpression(effects) : effects[0] ?? null;
        }
        if (pure) census.pureCounts.set(tail.name, (census.pureCounts.get(tail.name) ?? 1) - 1);
        retired.add(item);
        census.refCounts.set(name, 0);
        census.refNodes.delete(item.id);
      }
      declaration.declarations = declaration.declarations.filter(item => !retired.has(item));
      continue;
    }
    if (declaration.declarations.every(item => !retiredDeclarations.has(item))) continue;
    const statements = [];
    let group = [];
    for (const item of declaration.declarations) {
      if (!retiredDeclarations.has(item)) {
        group.push(item);
        continue;
      }
      if (group.length) statements.push(variableDeclaration(declaration.kind, group));
      group = [];
      if (!inlinedDeclarations.has(item)) {
        const writer = census.memoBindings.get(item.id.name)?.writes.find(occurrence => occurrence.write === item);
        const ctx = writer && contextForMemo(item.id.name, item, writer);
        const effects = observableSequenceElements([item.init], { ...ctx, injectorState }, { preserveSourceReads: true });
        const { prefix, tail } = peelNestedSequenceExpressions(item.init);
        for (const value of [...prefix, tail]) {
          if (effects.includes(value)) continue;
          const inner = unwrapRuntimeExpr(value);
          if (inner?.type !== 'Identifier') continue;
          if (census.pureNames.has(inner.name)) census.pureCounts.set(inner.name, (census.pureCounts.get(inner.name) ?? 1) - 1);
          else if (census.refCounts.has(inner.name)) {
            census.refCounts.set(inner.name, census.refCounts.get(inner.name) - 1);
            census.refNodes.delete(inner);
          }
        }
        statements.push(...effects.map(expressionStatement));
      }
      census.refCounts.set(item.id.name, 0);
      census.refNodes.delete(item.id);
    }
    if (group.length) statements.push(variableDeclaration(declaration.kind, group));
    if (declaration.leadingComments) {
      const target = statements[0] ?? list[index + 1];
      target.leadingComments = [...declaration.leadingComments, ...target.leadingComments ?? []];
    }
    if (declaration.trailingComments) {
      const target = statements.at(-1) ?? list[index + 1];
      target.trailingComments = [...target.trailingComments ?? [], ...declaration.trailingComments];
    }
    list.splice(index, 1, ...statements);
  }
  for (const { node, parent, keys, listKeys, ctx } of sequenceTrims) {
    const prefix = node.expressions.slice(0, -1);
    const kept = observableSequenceElements(prefix, ctx, { preserveSourceReads: true });
    for (const expression of prefix) {
      const { prefix: nestedPrefix, tail } = peelNestedSequenceExpressions(expression);
      for (const element of [...nestedPrefix, tail]) {
        if (kept.includes(element)) continue;
        const value = unwrapRuntimeExpr(element);
        if (value?.type === 'Identifier') {
          if (census.pureNames.has(value.name)) census.pureCounts.set(value.name, (census.pureCounts.get(value.name) ?? 1) - 1);
          else if (census.refCounts.has(value.name)) {
            census.refCounts.set(value.name, census.refCounts.get(value.name) - 1);
            // A replacement can share this node with a surviving sequence tail. Keep
            // its rename membership; the occurrence count alone decides liveness.
          }
        }
      }
    }
    node.expressions = [...kept, node.expressions.at(-1)];
    const container = listKeys.at(-1) ? parent[listKeys.at(-1)] : parent;
    const [first] = node.expressions;
    if (node.expressions.length === 1 && container[keys.at(-1)] === node) container[keys.at(-1)] = first;
  }
}

// pure-import liveness at flush: an import is live when its name occurs beyond its own
// import statement, or - the pure-STATIC exception - when the module attaches the method to
// the pure constructor on load and an emission reads that static through the injected
// constructor (`_Map.groupBy`). the ctor table spans EVERY recognized pure import: the
// user's own registered constructor import serves a minted static's liveness too
export function createPureImportLiveness({ pureImports, existingPureImports, census }) {
  const ctorNameByNamespace = new Map();
  function addConstructorNames(entries) {
    for (const [source, name] of entries) {
      const segments = source.split('/');
      if (segments.at(-1) === 'constructor') ctorNameByNamespace.set(segments.at(-2), name);
    }
  }
  addConstructorNames(pureImports);
  addConstructorNames(existingPureImports);
  return function isLive(source, name) {
    if ((census.pureCounts.get(name) ?? 0) > (census.pureImportBoundCounts.get(name) ?? 0)) return true;
    const segments = source.split('/');
    const ctor = segments.length >= 2 ? ctorNameByNamespace.get(segments.at(-2)) : null;
    if (!ctor) return false;
    const key = staticMemberFromEntrySegment(entryToGlobalHint(segments.at(-2)), segments.at(-1));
    return census.memberReads.has(`${ ctor }.${ key }`);
  };
}

// canonical renumber over every family at once: rank = the census print order filtered to
// the family's live names, unranked survivors (declarator-only spellings) appended in
// registration order so they still receive slots. `isTaken` filters slots the file cannot
// reuse (user bindings, orphan slot-shaped names, reserved slots)
export function buildCanonicalRenameMap({ printRank, aliveByPrefix, isTaken }) {
  const renameMap = new Map();
  for (const [prefix, alive] of aliveByPrefix) {
    const ordered = printRank.filter(name => alive.has(name));
    const seen = new Set(ordered);
    for (const name of alive) if (!seen.has(name)) ordered.push(name);
    for (const [from, to] of assignCanonicalRefSlots(prefix, ordered, isTaken)) renameMap.set(from, to);
  }
  return renameMap;
}
