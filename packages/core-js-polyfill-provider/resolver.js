import { POSSIBLE_GLOBAL_OBJECTS, kebabToPascal } from './helpers.js';
import { TYPE_HINTS } from './resolve-node-type.js';
import { initPluginOptions } from './plugin-options.js';
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

function resolveHint(desc, meta) {
  const { placement, object, excludedHints, includedHints, receiverHint } = meta;
  const hint = object === null || object === undefined ? null : String(object).toLowerCase();

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
  const add = d => {
    if (first === null) first = d;
    else {
      rest ??= [first];
      rest.push(d);
    }
  };
  for (const $hint of TYPE_HINTS) {
    if (excludedHints?.has($hint)) continue;
    if (includedHints && !includedHints.has($hint)) continue;
    if (hasOwn(desc, $hint)) add(desc[$hint]);
  }
  // `rest` fallback: when no includedHints given, or when includedHints lists a variant
  // `desc` doesn't specialise for
  if (hasOwn(desc, 'rest') && (!includedHints || hasHintNotIn(includedHints, desc))) add(desc.rest);

  // narrowing must still surface `common` when desc has no type variants.
  // both `includedHints` (typeof-positive) and `excludedHints` (typeof-negative) trigger —
  // `common` is type-agnostic. desc with type variants stays strict (types ruled out)
  if (first === null) {
    return (includedHints || excludedHints) && hasOwn(desc, 'common') && !descHasTypeHints(desc)
      ? desc.common : null;
  }
  if (rest === null) return first;

  // multi-variant: merge dependencies into a single set, then build filter groups.
  // AND across groups (any unfiltered variant -> drop all filters)
  const depSet = new Set();
  for (const d of rest) {
    const deps = getDependencies(d);
    if (deps) for (const dep of deps) depSet.add(dep);
  }
  if (!depSet.size) return null;
  const dependencies = [...depSet];
  const filterGroups = [];
  for (const d of rest) {
    if (!(d && typeof d === 'object' && d.filters?.length)) return { dependencies };
    filterGroups.push(d.filters);
  }
  if (filterGroups.length === 1) return { dependencies, filters: filterGroups[0] };
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

  function enhanceMeta(meta, path, desc) {
    if (!meta) return meta;
    if (meta.object !== null && meta.object !== undefined
      && meta.placement === 'prototype' && TYPE_HINTS.has(String(meta.object).toLowerCase())) return meta;
    const hint = toHint(resolvePropertyObjectType(path));
    if (hint) {
      if (TYPE_HINTS.has(hint)) return { ...meta, object: hint, placement: 'prototype' };
      return descHasTypeHints(desc) ? null : meta;
    }
    if (isMemberLike(path) && descHasTypeHints(desc)) {
      const hints = resolveGuardHints(path.get('object'));
      if (hints) return { ...meta, ...hints };
    }
    return meta;
  }

  function filter(name, args, path) {
    const { node } = path;
    // walk through ParenthesizedExpression wrappers (ESTree/oxc-parser preserves them; Babel strips them)
    let callPath = path.parentPath;
    while (callPath?.node?.type === 'ParenthesizedExpression') callPath = callPath.parentPath;
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
    }
    return false;
  }

  const groupRejects = (group, path) => group.some(([name, ...args]) => filter(name, args, path));

  // OR within `filters`, AND across `filterGroups` (set by multi-variant `resolveHint`)
  function rejectsByFilters(desc, path) {
    if (desc.filterGroups?.length) return desc.filterGroups.every(group => groupRejects(group, path));
    if (desc.filters?.length) return groupRejects(desc.filters, path);
    return false;
  }

  function resolvePureEntry(kind, desc, meta, path) {
    let target = desc;
    if (kind === 'instance') {
      target = resolveHint(desc, meta);
      if (target === null) return null;
    }
    if (rejectsByFilters(target, path)) return null;
    const dependencies = getDependencies(target);
    if (!dependencies?.length) return null;
    const [entry] = dependencies;
    if (!ctx.isEntryNeeded(entry) && !(target.guard && ctx.isEntryNeeded(target.guard))) return null;
    return entry;
  }

  function resolveUsage(meta, path) {
    const resolved = resolve(meta);
    if (!resolved || !hasOwn(resolved.desc, 'global')) return null;
    let { kind, desc: { global: desc } } = resolved;
    if (kind === 'instance') {
      const enhanced = enhanceMeta(meta, path, desc);
      if (!enhanced) return null;
      desc = resolveHint(desc, enhanced);
      if (!desc) return null;
    }
    const dependencies = getDependencies(desc);
    if (!dependencies?.length) return null;
    if (rejectsByFilters(desc, path)) return null;
    return dependencies;
  }

  function resolvePure(meta, path) {
    const resolved = resolve(meta);
    if (!resolved || !hasOwn(resolved.desc, 'pure')) return null;
    const { kind, desc: { pure: desc } } = resolved;
    let effectiveMeta = meta;
    if (kind === 'instance') {
      effectiveMeta = enhanceMeta(meta, path, desc);
      if (!effectiveMeta) return null;
    }
    const entry = resolvePureEntry(kind, desc, effectiveMeta, path);
    if (!entry) return null;
    return {
      entry,
      kind,
      hintName: pureImportName(kind, resolved.name, entry),
    };
  }

  function resolvePureOrGlobalFallback(meta, path) {
    const normal = resolvePure(meta, path);
    if (normal) return { result: normal, fallback: null };
    if (meta.kind === 'property' && meta.placement === 'static' && meta.object
      && !POSSIBLE_GLOBAL_OBJECTS.has(meta.object)) {
      const globalMeta = { kind: 'global', name: meta.object };
      const globalResolved = resolve(globalMeta);
      if (globalResolved && hasOwn(globalResolved.desc, 'pure')) {
        const entry = resolvePureEntry(globalResolved.kind, globalResolved.desc.pure, globalMeta, path);
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
