// `POSSIBLE_GLOBAL_OBJECTS` import here is intentional: the resolver branches on
// "is the receiver a proxy global?" to avoid recursing on `globalThis.X` -> `globalThis.X.X`.
// abstracting this would require an extra adapter layer for one Set lookup - kept inline
import { POSSIBLE_GLOBAL_OBJECTS } from './helpers/class-walk.js';
import { kebabToPascal } from './helpers/ast-patterns.js';
import { TYPE_HINTS } from './resolve-node-type/base.js';
import { initPluginOptions } from './plugin-options/init.js';
import { createPolyfillContext, resolve } from './index.js';

const { hasOwn } = Object;

function getDependencies(desc) {
  if (typeof desc === 'string') return [desc];
  if (Array.isArray(desc)) return desc;
  return desc?.dependencies;
}

function descHasTypeHints(desc) {
  for (const hint of TYPE_HINTS) if (hasOwn(desc, hint)) return true;
  return false;
}

// look up a type-hint variant in `desc`, falling back to `rest`
// when fallbackToCommon is true, fall back to `common` if `desc` has no type-hinted variants at all
function lookupByTypeHint(desc, hint, fallbackToCommon) {
  if (hasOwn(desc, hint)) return desc[hint];
  if (hasOwn(desc, 'rest')) return desc.rest;
  if (fallbackToCommon && !descHasTypeHints(desc) && hasOwn(desc, 'common')) return desc.common;
  return null;
}

function hasHintNotIn(hints, desc) {
  for (const h of hints) if (!hasOwn(desc, h)) return true;
  return false;
}

// excludedHints (typeof-negative) counterpart: after removing the excluded hints, does the admitted
// set still contain a type `desc` does NOT specialise? then a single matched variant is narrower
// than the runtime receiver (`typeof x !== 'string'` admits Date/Map/etc. alongside Array)
function admitsHintNotIn(excludedHints, desc) {
  for (const h of TYPE_HINTS) if (!excludedHints.has(h) && !hasOwn(desc, h)) return true;
  return false;
}

// `String(null/undefined)` produces `'null'/'undefined'` - non-null hint slot that TYPE_HINTS
// would reject anyway, but returning null up front is cheaper and communicates the intent
function objectToTypeHint(object) {
  return object === null || object === undefined ? null : String(object).toLowerCase();
}

// `crossTypeBackstop` is set only on the usage-pure path: a type-specific Maybe HELPER throws when
// forwarded a foreign runtime type, so refuse it when the hint-set is broader than the match.
// usage-global emits no such helper (just side-effect imports - a foreign receiver throws natively
// regardless), so it keeps the precise single-variant injection and never sets the flag
function resolveHint(desc, meta, crossTypeBackstop = false) {
  const { placement, object, excludedHints, includedHints, receiverHint } = meta;
  const hint = objectToTypeHint(object);

  if (placement === 'prototype' && TYPE_HINTS.has(hint)) return lookupByTypeHint(desc, hint, true);

  // destructure-from-constructor sets `receiverHint` to `function` / `object`. Match the
  // polyfill variant to that runtime receiver type - methods like `toString`/`name` resolve via
  // the `function`/`rest` variants, while `Array.prototype`-only methods like `includes` have
  // no matching variant and we correctly skip them (Array.includes is `undefined` at runtime)
  if (receiverHint && TYPE_HINTS.has(receiverHint)) return lookupByTypeHint(desc, receiverHint, false);

  if (!excludedHints && !includedHints && hasOwn(desc, 'common')) return desc.common;

  // hot path: keep 0/1 matches allocation-free. `first` holds match #1; `rest` starts
  // null and inflates to `[first, ...]` only on match #2+
  let first = null;
  let rest = null;

  function add(d) {
    if (first === null) first = d;
    else {
      rest ??= [first];
      rest.push(d);
    }
  }

  for (const $hint of TYPE_HINTS) {
    if (excludedHints?.has($hint)) continue;
    if (includedHints && !includedHints.has($hint)) continue;
    if (hasOwn(desc, $hint)) add(desc[$hint]);
  }
  // `rest` fallback: when no includedHints given, or when includedHints lists a variant
  // `desc` doesn't specialise for
  if (hasOwn(desc, 'rest') && (!includedHints || hasHintNotIn(includedHints, desc))) add(desc.rest);

  // narrowing must still surface `common` when desc has no type variants.
  // both `includedHints` (typeof-positive) and `excludedHints` (typeof-negative) trigger -
  // `common` is type-agnostic. desc with type variants stays strict (types ruled out)
  if (first === null) {
    return (includedHints || excludedHints) && hasOwn(desc, 'common') && !descHasTypeHints(desc)
      ? desc.common : null;
  }
  if (rest === null) {
    // cross-type backstop: a single type-specific variant matched, but the narrowed hint-set still
    // admits types this method does NOT specialise - `typeof x === 'object'` keeps Array AND
    // Date/Map/Set; `typeof x !== 'string'` keeps every non-string. the runtime receiver could be one
    // of them, and the array-specific Maybe (`_atMaybeArray`) forwards to a native method the foreign
    // type lacks -> ie:11 TypeError. when the hint-set is broader than the matched variant, prefer the
    // type-aware `common` dispatcher. concrete (non-typeof) receivers return early above and are unaffected
    const broader = crossTypeBackstop && (includedHints ? hasHintNotIn(includedHints, desc)
      : excludedHints ? admitsHintNotIn(excludedHints, desc) : false);
    if (broader && hasOwn(desc, 'common')) return desc.common;
    return first;
  }

  // 2+ type-specific variants matched (`typeof === 'object'` against a method with
  // `array` + `domcollection` etc.): merging per-variant deps and picking the first by
  // caller would drop the others (e.g., NodeList receiver hits the array-only dispatcher
  // `_entriesMaybeArray`, fails on IE11 without DOM-collection coverage). desc's `common`
  // dispatcher is type-aware (Array.isArray / instanceof gates at runtime) and covers
  // every variant uniformly - prefer it over the merge when present
  if (hasOwn(desc, 'common')) return desc.common;

  // multi-variant without `common`: merge dependencies into a single set, build filter
  // groups. AND across groups (any unfiltered variant -> drop all filters)
  const depSet = new Set();
  for (const d of rest) {
    const deps = getDependencies(d);
    if (deps) for (const dep of deps) depSet.add(dep);
  }
  if (!depSet.size) return null;
  const dependencies = [...depSet];
  // `rest` is inflated to `[first, second, ...]` only on the 2nd+ match in the loop above,
  // so it always holds >=2 items - filterGroups covers multi-variant AND semantics. no
  // single-group fast path needed (would be dead code here; single-match uses `first` branch)
  const filterGroups = [];
  for (const d of rest) {
    if (!(d && typeof d === 'object' && d.filters?.length)) return { dependencies };
    filterGroups.push(d.filters);
  }
  return { dependencies, filterGroups };
}

function pureImportName(kind, name, importEntry) {
  if (kind !== 'instance') return name;
  const match = importEntry.match(/^(?<type>[^/]+)\/instance\//);
  return match ? `${ name }Maybe${ kebabToPascal(match.groups.type) }` : name;
}

// high-level polyfill resolver factory.
// validates options, resolves targets, creates resolver + debug output.
export function createPolyfillResolver(options, {
  typeResolvers, astPredicates, getBabelTargets,
} = {}) {
  const { resolvePropertyObjectType, resolveGuardHints, toHint, isString, isObject } = typeResolvers;
  const { isMemberLike, isCallee, isSpreadElement } = astPredicates;
  const {
    method, mode, version, package: pkg, additionalPackages,
    include, exclude, shippedProposals,
    shouldInjectPolyfill, createDebugOutput,
  } = initPluginOptions(options, { getBabelTargets });
  const ctx = createPolyfillContext({
    method, mode, version, package: pkg, additionalPackages, include, exclude, shippedProposals, shouldInjectPolyfill,
  });

  // statically-known incompatible receiver: enhanceMeta either rejects the hint (returns
  // null) or folds it into a TYPE_HINT slot for which desc lacks a variant (resolveHint
  // already returned null upstream). gates the generic-fallback path against typed receivers
  function receiverIncompatibleWithDesc(meta, path, desc) {
    const enhanced = enhanceMeta(meta, path, desc);
    return enhanced === null || TYPE_HINTS.has(enhanced.object);
  }

  // any inherited `receiverHint` from destructure-meta is stale once `enhanceMeta` derives
  // its own placement / hint info; defensive `receiverHint: undefined` in the new-shape
  // returns blocks future writers / `resolveHint` re-orderings from leaking that stale state
  function enhanceMeta(meta, path, desc) {
    if (!meta) return meta;
    // enhanceMeta is only reachable for kind==='instance', whose callers always pass a path;
    // cheap guard for future pathless-instance lookups
    if (!path) return meta;
    if (meta.placement === 'prototype' && TYPE_HINTS.has(objectToTypeHint(meta.object))) return meta;
    const objType = resolvePropertyObjectType(path);
    const hint = toHint(objType);
    if (hint) {
      if (TYPE_HINTS.has(hint)) return { ...meta, object: hint, placement: 'prototype', receiverHint: undefined };
      return descHasTypeHints(desc) ? null : meta;
    }
    if (isMemberLike(path) && descHasTypeHints(desc)) {
      const hints = resolveGuardHints(path.get('object'));
      // `receiverHint: undefined` placed between meta and hints so guard-emitted hint can override
      if (hints) return { ...meta, receiverHint: undefined, ...hints };
    }
    return meta;
  }

  function filter(name, args, path) {
    // some callers (e.g. unplugin's `planInnerProp` for nested proxy-global destructure)
    // resolve meta without a live AST path. without it we can't evaluate filters, so
    // don't reject - conservative over-inject beats a crash or silent dead-code strip
    if (!path) return false;
    const { node } = path;
    // walk through ParenthesizedExpression / TS expression wrappers (as / satisfies /
    // non-null `!` / TSTypeAssertion / TypeCastExpression). oxc preserves parens; both
    // parsers preserve TS wrappers. without the full peel `JSON.parse!(s, reviver)` and
    // `(JSON.parse as any)(s, reviver)` bypass the arg-count / arg-shape filters and
    // emit a polyfill for shapes the runtime would reject
    let callPath = path.parentPath;
    while (callPath?.node && (callPath.node.type === 'ParenthesizedExpression'
      || callPath.node.type === 'TSAsExpression'
      || callPath.node.type === 'TSSatisfiesExpression'
      || callPath.node.type === 'TSTypeAssertion'
      || callPath.node.type === 'TSNonNullExpression'
      || callPath.node.type === 'TSInstantiationExpression'
      || callPath.node.type === 'TypeCastExpression')) {
      callPath = callPath.parentPath;
    }
    const parent = callPath?.node ?? path.parent;
    if (!isCallee(node, parent)) return false;
    switch (name) {
      case 'min-args': {
        const [length] = args;
        if (parent.arguments.length >= length) return false;
        return parent.arguments.every(arg => !isSpreadElement(arg));
      }
      case 'arg-is-string':
      case 'arg-is-object': {
        const [index] = args;
        if (parent.arguments.length < index + 1) return false;
        if (parent.arguments.slice(0, index).some(arg => isSpreadElement(arg))) return false;
        const arg = callPath.get('arguments')[index];
        return name === 'arg-is-string' ? isString(arg) : isObject(arg);
      }
      // unknown filter name = data-shape drift from `built-in-definitions.mjs`. fail loudly
      // instead of silent over-injection via default-false fall-through: caller treats
      // "filter didn't reject" as accept, so unknown filter name would bypass its intended
      // narrowing gate
      default: {
        // data-shape drift from `built-in-definitions.mjs`. fail loudly with a path-anchored
        // codeframe when the caller exposes one - babel's `buildCodeFrameError` highlights the
        // offending call site, helping authors locate the bad filter entry without grep
        const msg = `[core-js] unknown filter name: ${ name }`;
        throw typeof path?.buildCodeFrameError === 'function' ? path.buildCodeFrameError(msg) : new Error(msg);
      }
    }
  }

  function groupRejects(group, path) {
    return group.some(([name, ...args]) => filter(name, args, path));
  }

  // OR within `filters`, AND across `filterGroups` (set by multi-variant `resolveHint`)
  function rejectsByFilters(desc, path) {
    if (desc.filterGroups?.length) return desc.filterGroups.every(group => groupRejects(group, path));
    if (desc.filters?.length) return groupRejects(desc.filters, path);
    return false;
  }

  function resolvePureEntry({ kind, desc, meta, path }) {
    let target = desc;
    if (kind === 'instance') {
      target = resolveHint(desc, meta, true);
      if (target === null) return null;
    }
    if (rejectsByFilters(target, path)) return null;
    const dependencies = getDependencies(target);
    if (!dependencies?.length) return null;
    const [entry] = dependencies;
    if (!ctx.isEntryNeeded(entry) && !(target.guard && ctx.isEntryNeeded(target.guard))) return null;
    return entry;
  }

  function resolveUsage(meta, path, { skipFilters = false } = {}) {
    const resolved = resolve(meta);
    if (!resolved || !hasOwn(resolved.desc, 'global')) return null;
    let { kind, desc: { global: desc } } = resolved;
    // a synthetic inherited-static meta (`super.at()` / `this.at()` in a static method) whose key
    // resolves to an INSTANCE desc means no such static exists on the super class - bail rather than
    // inject the instance polyfill (the over-injection usage-pure already avoids). a real inherited
    // static (`super.from()`) resolves to a static desc and is unaffected. unlike `Array.concat`,
    // the synthetic super-meta has no member path for `enhanceMeta` to narrow the receiver type, so
    // this explicit gate stands in for that narrowing
    if (kind === 'instance' && meta.inheritedStatic) return null;
    if (kind === 'instance') {
      const enhanced = enhanceMeta(meta, path, desc);
      if (!enhanced) return null;
      desc = resolveHint(desc, enhanced);
      if (!desc) return null;
    }
    const dependencies = getDependencies(desc);
    if (!dependencies?.length) return null;
    // the base-constructor pass injects the constructor BECAUSE a static member is accessed
    // (`Error.captureStackTrace`), not because the constructor itself is called - so the desc's
    // call-shape filters (e.g. Error's min-args / cause-option arg check) read the WRONG call (the
    // static method's args) and flip the injection on that arg count. skip them for that pass
    if (!skipFilters && rejectsByFilters(desc, path)) return null;
    return dependencies;
  }

  // shared pure-resolve protocol: resolve meta -> require `pure` desc -> extract (kind, desc)
  // -> caller-supplied effectiveMeta builder -> resolvePureEntry -> build return shape.
  // both consumers (`resolvePure` standard path, `resolvePureGeneric` fallback path) differ
  // ONLY in step 3 (effectiveMeta construction); steps 1-2 and 4-5 are identical
  function resolvePureWith(meta, path, buildEffectiveMeta) {
    const resolved = resolve(meta);
    if (!resolved || !hasOwn(resolved.desc, 'pure')) return null;
    const { kind, desc: { pure: desc } } = resolved;
    const effectiveMeta = buildEffectiveMeta(kind, desc, meta, path);
    if (!effectiveMeta) return null;
    const entry = resolvePureEntry({ kind, desc, meta: effectiveMeta, path });
    if (!entry) return null;
    return {
      entry,
      kind,
      hintName: pureImportName(kind, resolved.name, entry),
    };
  }

  function resolvePure(meta, path) {
    return resolvePureWith(meta, path, (kind, desc) => {
      // non-instance kinds use bare meta; instance kinds run through enhanceMeta which
      // narrows by receiver type-hint (e.g. `arr.at()` -> Array-specific entry vs common)
      if (kind !== 'instance') return meta;
      return enhanceMeta(meta, path, desc) ?? null;
    });
  }

  // generic-fallback resolve: look up the `common` entry directly, bypassing the type-hint
  // narrowing `enhanceMeta` performs. Exists to mirror babel's AST-mutation re-visit behavior -
  // after an inner polyfill replaces an ancestor, that ancestor's call returns unknown type,
  // so the outer member's `resolvePropertyObjectType` yields null and `resolveHint` lands on
  // `common`. Unplugin's text-based rewrite never mutates the AST, so downstream members keep
  // seeing their "correct" primitive/element type from `known-built-in-return-types` - the
  // inferred type often has no matching desc variant, so `resolveHint` returns null and the
  // outer bails. Callers (unplugin's optional-chain retry path) invoke this explicitly when
  // they've detected the "ancestor polyfill breaks type inference" scenario and want the
  // generic entry that would have fired on babel's re-visit
  function resolvePureGeneric(meta, path) {
    return resolvePureWith(meta, path, (kind, desc, baseMeta) => {
      if (kind !== 'instance') return null;
      if (!hasOwn(desc, 'common')) return null;
      // bail when the receiver type is statically known and incompatible with desc's variants.
      // enhanceMeta returns null when the hint isn't in TYPE_HINTS but desc requires hints;
      // returns a meta with `object` in TYPE_HINTS when the type folded into a primitive /
      // collection slot. either way the upstream resolvePure already concluded "no polyfill
      // applies" - emitting common here over-injects relative to babel's natural-bail (babel
      // only deopts to common AFTER an inner polyfill mutation, never for a typed receiver)
      if (path && receiverIncompatibleWithDesc(baseMeta, path, desc)) return null;
      // pass meta with object stripped so resolveHint's placement-based branch skips and the
      // `!excludedHints && !includedHints && hasOwn(desc, 'common')` branch picks up common
      return { ...baseMeta, object: null };
    });
  }

  // two distinct lookups, not a duplicate: first resolves the property meta against
  // `statics.<X>.<key>`; on miss, retries with the bare global meta against `globals.<X>`.
  // both calls go through the same `resolve` registry but consult different keys
  function resolvePureOrGlobalFallback(meta, path) {
    const normal = resolvePure(meta, path);
    if (normal) return { result: normal, fallback: null };
    if (meta.kind === 'property' && meta.placement === 'static' && meta.object
      && !POSSIBLE_GLOBAL_OBJECTS.has(meta.object)) {
      const globalMeta = { kind: 'global', name: meta.object };
      const globalResolved = resolve(globalMeta);
      if (globalResolved && hasOwn(globalResolved.desc, 'pure')) {
        const entry = resolvePureEntry({ kind: globalResolved.kind, desc: globalResolved.desc.pure, meta: globalMeta, path });
        if (entry) return { result: null, fallback: { entry, hintName: meta.object } };
      }
    }
    return { result: null, fallback: null };
  }

  return {
    resolver: { ...ctx, resolveUsage, resolvePure, resolvePureGeneric, resolvePureOrGlobalFallback },
    createDebugOutput,
  };
}
