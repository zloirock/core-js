// usage-global mode dispatcher. given a resolved meta + AST path, decides which
// modules to inject. handles four cases:
//   - skip dispatch (TS type-only / disabled / for-x write target)
//   - `key in obj` (Symbol.X -> static module via symbolKeyToEntry)
//   - regular usage resolution
//   - `super.X` / `this.X` in static context (inherited-static lookup)
//   - `cond ? Array : Iterator` destructure (per-branch fallback)
// also handles `class extends Array { foo() { this.at(0) } }` shadow check
import { isForXWriteTarget, isTSTypeOnlyIdentifierPath } from '../helpers/ast-patterns.js';
import { symbolKeyToEntry } from '../helpers/class-walk.js';

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
// covers both Super and ThisExpression-in-static-context via `isInheritedStaticLookup`
function tryResolveSuperStaticMeta(meta, path, resolveStaticInheritedMember, isInheritedStaticLookup) {
  if (!resolveStaticInheritedMember || !isInheritedStaticLookup) return null;
  if (meta.kind !== 'property' || meta.placement !== 'prototype' || meta.object !== null) return null;
  if (path?.node?.type !== 'MemberExpression' && path?.node?.type !== 'OptionalMemberExpression') return null;
  if (!isInheritedStaticLookup(path)) return null;
  return resolveStaticInheritedMember(path);
}

export function createUsageGlobalCallback({
  resolveUsage,
  injectModulesForModeEntry,
  isDisabled,
  resolveStaticInheritedMember,
  isInheritedStaticLookup,
  isShadowedByClassOwnMember,
  enumerateFallbackBranches,
}) {
  function dispatch(meta, path) {
    if (shouldSkipUsageDispatch(meta, path, isDisabled)) return;
    if (meta.kind === 'in') {
      const entry = symbolKeyToEntry(meta.key);
      if (entry) injectModulesForModeEntry(entry);
      return;
    }
    const deps = resolveUsage(meta, path);
    if (deps) {
      for (const entry of deps) injectModulesForModeEntry(entry);
      return;
    }
    // unknown property on a known global constructor (`Map.foo`, `Map.foo++`) - the constructor
    // itself still needs polyfilling so the read/write target exists at runtime
    if (meta.kind === 'property' && meta.placement === 'static' && meta.object) {
      const constructorDeps = resolveUsage({ kind: 'global', name: meta.object }, path);
      if (constructorDeps) for (const entry of constructorDeps) injectModulesForModeEntry(entry);
    }
  }
  return (meta, path) => {
    // shadow check for `this.X` - polyfill would bypass the user's own member
    // (`class C extends Array { at() {} foo() { this.at(0) } }`)
    if (isShadowedByClassOwnMember && meta.kind === 'property' && meta.key
      && path?.node?.object?.type === 'ThisExpression'
      && isShadowedByClassOwnMember(path, meta.key)) return;
    const superMeta = tryResolveSuperStaticMeta(meta, path, resolveStaticInheritedMember, isInheritedStaticLookup);
    // inherited-static lookup where the member doesn't exist as static on the super class:
    // `class C extends Array { static foo() { this.at(0) } }` - `at` is instance-only.
    // bail rather than fall back to instance-method dispatch which over-injects
    if (isInheritedStaticLookup && !superMeta && isInheritedStaticLookup(path)) return;
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
