import { POSSIBLE_GLOBAL_OBJECTS } from './helpers.js';
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

function resolveHint(desc, meta) {
  const { placement, object, excludedHints, includedHints } = meta;
  const hint = object === null || object === undefined ? null : String(object).toLowerCase();

  if (placement === 'prototype' && TYPE_HINTS.has(hint)) {
    if (hasOwn(desc, hint)) return desc[hint];
    if (hasOwn(desc, 'rest')) return desc.rest;
    return descHasTypeHints(desc) ? null : hasOwn(desc, 'common') ? desc.common : null;
  }

  if (!excludedHints && !includedHints && hasOwn(desc, 'common')) return desc.common;

  const hintDescs = [];
  for (const $hint of TYPE_HINTS) {
    if (excludedHints?.has($hint)) continue;
    if (includedHints && !includedHints.has($hint)) continue;
    if (hasOwn(desc, $hint)) hintDescs.push(desc[$hint]);
  }
  if (hasOwn(desc, 'rest') && (!includedHints || [...includedHints].some($hint => !hasOwn(desc, $hint)))) {
    hintDescs.push(desc.rest);
  }

  if (hintDescs.length === 1) return hintDescs[0];

  if (hintDescs.length > 1) {
    const dependencies = [...new Set(hintDescs.flatMap(d => getDependencies(d) ?? []))];
    return dependencies.length ? { dependencies } : null;
  }

  return null;
}

function pureImportName(kind, name, importEntry) {
  if (kind !== 'instance') return name;
  const match = importEntry.match(/^(?<type>[^/]+)\/instance\//);
  return match
    ? `${ name }Maybe${ match.groups.type.replaceAll(/(?:^|-)(?<char>\w)/g, (_, char) => char.toUpperCase()) }`
    : name;
}

// high-level polyfill resolver factory.
// validates options, resolves targets, creates resolver + debug output.
export function createPolyfillResolver(options, {
  typeResolvers, isMemberLike, isCallee, isSpreadElement, getBabelTargets,
} = {}) {
  const { resolvePropertyObjectType, resolveGuardHints, toHint, isString, isObject } = typeResolvers;
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

  function applyFilters(filters, path) {
    return !!filters?.some(([name, ...args]) => filter(name, args, path));
  }

  function resolvePureEntry(kind, desc, meta, path) {
    let target = desc;
    if (kind === 'instance') {
      target = resolveHint(desc, meta);
      if (target === null) return null;
    }
    if (applyFilters(target.filters, path)) return null;
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
    if (applyFilters(desc.filters, path)) return null;
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
