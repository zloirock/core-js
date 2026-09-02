// `POSSIBLE_GLOBAL_OBJECTS` import here is intentional: the resolver branches on
// "is the receiver a proxy global?" to avoid recursing on `globalThis.X` -> `globalThis.X.X`.
// abstracting this would require an extra adapter layer for one Set lookup - kept inline
import {
  MUTATED_MEMBERS_UNKNOWN,
  kebabToPascal,
  POSSIBLE_GLOBAL_OBJECTS,
  proxyNavEffectsHarvestable,
  unwrapRuntimeExpr,
  rootProgramOf,
} from './helpers/ast-patterns.js';
import { ESCAPED_CTOR_REFS, nodePositionKey } from './detect-usage/mutations.js';
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
  typeResolvers, astPredicates, getBabelTargets, isMutatedStatic = null,
} = {}) {
  const { resolvePropertyObjectType, resolveGuardHints, resolvePropertyUnionHints, toHint, isString, isObject } = typeResolvers;
  const { isMemberLike, isCallee, isSpreadElement } = astPredicates;
  const {
    method, mode, version, package: pkg, additionalPackages,
    include, exclude,
    shouldInjectPolyfill, createDebugOutput,
  } = initPluginOptions(options, { getBabelTargets });
  const ctx = createPolyfillContext({
    method, mode, version, package: pkg, additionalPackages, include, exclude, shouldInjectPolyfill,
  });

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
    if (descHasTypeHints(desc)) {
      // a cross-family union receiver (`number[] | string`) resolves to no single Type but
      // to an exact hint SET - inject only the union's variants, not every variant of the
      // method. shares `resolvePropertyObjectType`'s input domain (member-like AND
      // destructure property), and is more precise than guard hints, so consulted first
      const unionHints = resolvePropertyUnionHints(path);
      if (unionHints) return { ...meta, receiverHint: undefined, includedHints: unionHints, excludedHints: undefined };
      if (isMemberLike(path)) {
        const hints = resolveGuardHints(path.get('object'));
        // `receiverHint: undefined` placed between meta and hints so guard-emitted hint can override
        if (hints) return { ...meta, receiverHint: undefined, ...hints };
      }
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
      // instead of silent over-injection via default-false fall-through: the caller reads
      // "filter didn't reject" as accept, so an unknown name would bypass its narrowing gate.
      // a path-anchored codeframe (when the caller exposes one) points at the offending call
      // site, so the bad filter entry is findable without grep
      default: {
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

  // assignment spellings that store their RHS VALUE into the target slot: the plain write
  // and the logical compounds (a `||=` stores the ctor exactly like `=` when it fires);
  // arithmetic compounds store a computed value, never the bare reference

  // the census stamp, looked up by SOURCE POSITION under the claim's own program: a
  // position survives our rewrites' clones and region rebuilds, where node identity does not
  function escapedCtorClaim(path) {
    const node = path?.node;
    if (node?.type !== 'Identifier') return false;
    const key = nodePositionKey(node);
    return key !== null && ESCAPED_CTOR_REFS.get(rootProgramOf(path))?.has(key) === true;
  }

  // shared pure-resolve protocol: resolve meta -> require `pure` desc -> extract (kind, desc)
  // -> caller-supplied effectiveMeta builder -> resolvePureEntry -> build return shape.
  // the caller supplies step 3 (effectiveMeta construction); every other step is fixed
  function resolvePure(meta, path) {
    const resolved = resolve(meta);
    if (!resolved || !hasOwn(resolved.desc, 'pure')) return null;
    const { kind, desc: { pure: desc } } = resolved;
    // a synthetic inherited-static meta (`super.at()` / `this.at()` in a static method) whose key
    // resolves to an INSTANCE desc means no such static exists on the super class - bail rather than
    // emit the instance polyfill (`_at(this)` would treat the class constructor as an array). single
    // sources the decision `resolveUsage` already makes for usage-global, so both pure emitters drop
    // their own copies. the synthetic super-meta has no member path for `enhanceMeta` to narrow, so
    // this explicit gate stands in for that narrowing. the `inheritedStatic && !result` fallback bail
    // in each emitter still runs (fallback fires only for `!inheritedStatic`), so no global-fallback
    // rewrite leaks in once the result is null
    if (kind === 'instance' && meta.inheritedStatic) return null;
    // non-instance kinds use bare meta; instance kinds run through enhanceMeta which
    // narrows by receiver type-hint (e.g. `arr.at()` -> Array-specific entry vs common)
    const effectiveMeta = kind === 'instance' ? enhanceMeta(meta, path, desc) : meta;
    if (!effectiveMeta) return null;
    let entry = resolvePureEntry({ kind, desc, meta: effectiveMeta, path });
    if (!entry) return null;
    // a bare global-ctor reference whose value ESCAPES the tracked-read positions (the
    // source-anchored census in detect-usage/mutations.js) resolves to the NAMESPACE entry
    // instead of the bare constructor: reads through wherever the value lands are
    // unresolvable, so it must carry the ctor's statics itself - the constructor entry
    // answered `undefined` for `w.k.groupBy` where every target engine with the ctor
    // answers the member, and keeping the reference RAW instead broke the stripped realm
    // ... and so does a ctor whose MEMBERS the mutation census could not name (`delete Map[k]`):
    // reads through it are unresolvable for the same reason, and every one of them lands on this
    // binding, so it has to bring the statics itself. the bare constructor entry installs none,
    // which a realm without the native answers with `undefined`
    if (entry.endsWith('/constructor')
      && (escapedCtorClaim(path) || isMutatedStatic?.(resolved.name, MUTATED_MEMBERS_UNKNOWN))) {
      entry = entry.replace(/\/constructor$/u, '');
    }
    return {
      entry,
      kind,
      hintName: pureImportName(kind, resolved.name, entry),
    };
  }

  // two distinct lookups, not a duplicate: first resolves the property meta against
  // `statics.<X>.<key>`; on miss, retries with the bare global meta against `globals.<X>`.
  // both calls go through the same `resolve` registry but consult different keys.
  // a `prototype` placement (`Ctor.prototype.<key>`) takes the SAME fallback when `<key>` is not a
  // separately-polyfilled instance method (the instance kind resolves via `resolvePure` ABOVE and returns
  // early): in pure, Map/Set/Promise/WeakMap prototype methods (`has`/`then`/`union`/...) live on the pure
  // ctor's prototype, so the receiver `globalThis.Map.prototype` must swap to `_Map.prototype` (ie:11-safe),
  // not the native `_globalThis.Map.prototype` (undefined off-engine). matches the bare `Map.prototype.has`
  function resolvePureOrGlobalFallback(meta, path) {
    const normal = resolvePure(meta, path);
    if (normal) return { result: normal, fallback: null };
    if (meta.kind === 'property' && (meta.placement === 'static' || meta.placement === 'prototype') && meta.object
      && !POSSIBLE_GLOBAL_OBJECTS.has(meta.object)) {
      // engage the `prototype` fallback ONLY for an SE-free `<ctor>.prototype` receiver
      // (`globalThis.Map.prototype` -> `_Map.prototype`): an IIFE / SE-sequence ctor sub-receiver
      // (`(() => globalThis)().Map.prototype`) is handled by the receiver-peel mechanism, which PRESERVES
      // the shell and rewrites its return leaf to the pure ctor - the fallback's whole-sub-receiver swap
      // would DROP that shell. defer conservatively when the receiver shape is unavailable / not a plain member
      if (meta.placement === 'prototype') {
        // peel transparent wrappers (parens / TS cast / non-null) so a TS-wrapped `.prototype` receiver
        // (`((c++, globalThis.self).Map.prototype as any).has`) is seen as the plain `X.Map.prototype` member -
        // else `plainMember` is false and the fallback bails, stranding the SE-wrapped proxy root raw
        const protoReceiver = unwrapRuntimeExpr(path?.node?.object);
        const plainMember = protoReceiver
          && (protoReceiver.type === 'MemberExpression' || protoReceiver.type === 'OptionalMemberExpression');
        // an SE-SEQUENCE-rooted ctor sub-receiver (`(c++, globalThis.self).Map.prototype` OR the deeper
        // `(c++, globalThis).self.Map.prototype`) and a computed-KEY effect (`globalThis.self[(c++, 'Map')]
        // .prototype`) both KEEP the fallback - the ctor swap harvests either into the prefix
        // (`(c++, _Map).prototype`). only an IIFE-call root is owned by the receiver-peel / natural
        // visitor, whose shell the whole-swap would drop; a non-plain receiver is unavailable to swap.
        // mirrors the detect-usage harvest gate
        if (!plainMember || !proxyNavEffectsHarvestable(protoReceiver.object)) {
          return { result: null, fallback: null };
        }
      }
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
    resolver: { ...ctx, resolveUsage, resolvePure, resolvePureOrGlobalFallback },
    createDebugOutput,
  };
}
