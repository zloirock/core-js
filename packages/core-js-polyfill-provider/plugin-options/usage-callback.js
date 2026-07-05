// usage-global mode dispatcher. given a resolved meta + AST path, decides which
// modules to inject. handles four cases:
//   - skip dispatch (TS type-only / disabled / for-x write target)
//   - `key in obj` (Symbol.X -> static module via symbolKeyToEntry)
//   - regular usage resolution
//   - `super.X` / `this.X` in static context (inherited-static lookup)
//   - `cond ? Array : Iterator` destructure (per-branch fallback)
// also handles `class extends Array { foo() { this.at(0) } }` shadow check
import {
  isForXWriteTarget, isMemberWriteHost, isThisReceiver, isTSTypeOnlyIdentifierPath,
  memberKeyName, peelParenAndTSParentPath,
} from '../helpers/ast-patterns.js';
import { POSSIBLE_GLOBAL_OBJECTS, symbolKeyToEntry } from '../helpers/class-walk.js';
import { hasOwnStaticDefinition } from '../index.js';

// bail when the usage is syntactically present but carries no runtime read - polyfilling
// would be pure over-injection. covers: plugin's disable marker, TS type-only contexts,
// and for-x LHS where the MemberExpression targets a local write, not a prototype lookup
function shouldSkipUsageDispatch(meta, path, isDisabled) {
  if (isDisabled(path.node)) return true;
  if (path?.parentPath?.node?.type === 'TSTypeQuery') return true;
  if (isTSTypeOnlyIdentifierPath(path)) return true;
  return meta.kind === 'property' && path?.node && isForXWriteTarget(path);
}

// `super.X(...)` / `this.X(...)` in a static method of `extends KnownGlobal { ... }`:
// regular MemberExpression resolution produces `{object: null, placement: 'prototype'}` which
// never matches `Array.from` etc. retry with a synthetic static meta against the parent class.
// covers both Super and ThisExpression-in-static-context via `isInheritedStaticLookup`.
// the key comes from the META, not re-read off the member: a reachable-union EXTRA
// (`this[k]` with a reassigned `k`) carries its own alternative key, which a node re-read
// would collapse back to the primary and drop the alternative's static injection
function tryResolveSuperStaticMeta({ meta, path, resolveStaticInheritedMember, isInheritedStaticLookup }) {
  if (!resolveStaticInheritedMember || !isInheritedStaticLookup) return null;
  if (meta.kind !== 'property' || meta.placement !== 'prototype' || meta.object !== null) return null;
  if (path?.node?.type !== 'MemberExpression' && path?.node?.type !== 'OptionalMemberExpression') return null;
  if (!isInheritedStaticLookup(path)) return null;
  return resolveStaticInheritedMember(path, meta.key ?? null);
}

export function createUsageGlobalCallback({
  resolveUsage,
  injectModulesForModeEntry,
  isDisabled,
  resolveStaticInheritedMember,
  isInheritedStaticLookup,
  isInStaticContext,
  isShadowedByClassOwnMember,
  enumerateFallbackBranches,
}) {
  // recognized-but-out-of-layer static (`Symbol.metadata` / `Map.from` at mode=actual) OR an
  // unrecognized property on a known global (`Map.foo`): the bare constructor still needs
  // polyfilling so the read/write target exists at runtime (a polyfilled `Symbol` yields
  // `undefined` for `.metadata` instead of throwing). no-op for non-static / receiver-less metas
  // a hop-member VALUE meta (`globalThis.Reflect` inside `globalThis.Reflect.ownKeys(...)`) is
  // subsumed when the enclosing member READ is the hop global's OWN static: that static's module
  // defines / patches the receiver global itself (directly or through its compat dependency
  // chain), so its injection covers the receiver and the VALUE entry beside it is pure
  // over-injection (`globalThis.Reflect.ownKeys` pulled every es.reflect.* module). the meta
  // keeps firing when:
  //   - the outer key is NOT the global's own static: a generic-hint resolution
  //     (`self.Promise.name` -> es.function.name) or a `.prototype` chain (folded into ONE
  //     prototype-placement meta) carries NO receiver guarantee - this hop meta is its only
  //     carrier, exactly like the bare root's `{global}` meta
  //   - the outer member is a WRITE host (write positions bail before the callback - this is
  //     the mutated-static constructor injection)
  //   - the outer key is dynamic (any member may be read off the value)
  //   - the key is itself a proxy-global hop (`globalThis.self`): its entry (`web.self`) backs
  //     the hop READ, which no outer member resolution carries
  function subsumedByOuterMemberRead(meta, path) {
    if (meta.kind !== 'property' || meta.placement !== 'static') return false;
    if (!POSSIBLE_GLOBAL_OBJECTS.has(meta.object) || POSSIBLE_GLOBAL_OBJECTS.has(meta.key)) return false;
    const outer = peelParenAndTSParentPath(path);
    const outerNode = outer?.node;
    if (outerNode?.type !== 'MemberExpression' && outerNode?.type !== 'OptionalMemberExpression') return false;
    if (outerNode.object !== path.node) return false;
    const outerKey = memberKeyName(outerNode);
    if (!outerKey || isMemberWriteHost(outer)) return false;
    return hasOwnStaticDefinition(meta.key, outerKey);
  }

  function injectBaseConstructor(meta, path) {
    if (meta.kind !== 'property' || meta.placement !== 'static' || !meta.object) return;
    // skip call-shape filters: this pass injects the constructor because a static member is read,
    // so the constructor's own arg-count filters must not gate it on the static-method call's args
    const constructorDeps = resolveUsage({ kind: 'global', name: meta.object }, path, { skipFilters: true });
    if (constructorDeps) for (const entry of constructorDeps) injectModulesForModeEntry(entry);
  }

  function dispatch(meta, path) {
    if (shouldSkipUsageDispatch(meta, path, isDisabled)) return;
    if (subsumedByOuterMemberRead(meta, path)) return;
    if (meta.kind === 'in') {
      // Symbol-sourced LHS (`Symbol.iterator in obj`) routes through the symbol-in entry table
      // for the dedicated polyfill (`is-iterable` etc.); bare-string LHS (`'from' in Array`)
      // falls through to the standard meta resolver which reaches the static polyfill at the
      // resolved receiver (es.array.from). symmetric with usage-pure's handleInExpression which
      // folds the same shape to `true` - in usage-global a side-effect import is enough since
      // post-polyfill the runtime check naturally yields true.
      // gated on the producer's provenance flag: a string spelling (`'Symbol.iterator' in Array`)
      // checks a plain string prop no symbol module defines - injecting it is pure over-injection
      const symbolEntry = meta.symbolSourced ? symbolKeyToEntry(meta.key) : null;
      if (symbolEntry) {
        injectModulesForModeEntry(symbolEntry);
        return;
      }
    }
    const deps = resolveUsage(meta, path);
    if (deps) {
      let injected = 0;
      for (const entry of deps) injected += injectModulesForModeEntry(entry);
      if (injected) {
        // a static resolved through a GENERIC hint (`Promise.name` -> es.function.name) injects
        // nothing that guarantees the RECEIVER global - unlike the global's own static, whose
        // module defines it. inject the base constructor alongside, else the receiver read
        // itself throws on engines lacking the global (a globals-table miss no-ops, so universal
        // receivers like `Math` stay clean)
        if (meta.kind === 'property' && meta.placement === 'static' && meta.object
          && !hasOwnStaticDefinition(meta.object, meta.key)) injectBaseConstructor(meta, path);
        return;
      }
      // deps resolved but mode-filtered to nothing: a RECOGNIZED static OUT of the current layer
      // (`Symbol.metadata` / `Map.from` at mode=actual). fall through to the base-constructor branch
    }
    injectBaseConstructor(meta, path);
  }
  return (meta, path) => {
    // shadow check for `this.X` - polyfill would bypass the user's own member
    // (`class C extends Array { at() {} foo() { this.at(0) } }`). `isThisReceiver` peels
    // parens / TS wrappers / chain so paren-preserving / TS-cast / non-null-assert variants
    // reach the same detection as bare `this.X`
    if (isShadowedByClassOwnMember && meta.kind === 'property' && meta.key
      && isThisReceiver(path?.node?.object)
      && isShadowedByClassOwnMember(path, meta.key)) return;
    const superMeta = tryResolveSuperStaticMeta({ meta, path, resolveStaticInheritedMember, isInheritedStaticLookup });
    // a STATIC-context inherited lookup whose member is not a static on the super class:
    // `class C extends Array { static foo() { this.at(0) } }` - `at` is instance-only and `this`/
    // `super` resolve to the class, so the instance polyfill is dead; bail. but `super.X()` in an
    // INSTANCE method reads the parent PROTOTYPE, where instance methods are live (`super.includes`
    // -> Array.prototype.includes), so DON'T bail there - fall through to instance dispatch and
    // inject (a static-named member like `super.from` resolves no prototype dep and no-ops anyway).
    // gate on the static context so usage-global injects the live instance-method polyfill
    if (isInheritedStaticLookup && !superMeta && isInheritedStaticLookup(path)
      && (isInStaticContext?.(path) ?? true)) return;
    // ConditionalExpression / LogicalExpression destructure - runtime picks per-call.
    // dispatch each branch's deps independently so all viable polyfills get emitted at file
    // level; user's `cond ? Array : Iterator` for `from` brings in both `es.array.from` and
    // `es.iterator.from`. mirrors the per-branch synth-swap done in usage-pure mode
    if (enumerateFallbackBranches && meta?.fromFallback) {
      const branches = enumerateFallbackBranches(meta, path);
      if (branches?.length) {
        for (const branchMeta of branches) dispatch(branchMeta, path);
        return;
      }
    }
    return dispatch(superMeta ?? meta, path);
  };
}
