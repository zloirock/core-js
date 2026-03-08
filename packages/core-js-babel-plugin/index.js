'use strict';
const { default: defineProvider } = require('@babel/helper-define-polyfill-provider');
const entries = require('@core-js/compat/entries.json');
const compat = require('@core-js/compat/compat');
const { normalizeCoreJSVersion } = require('@core-js/compat/helpers');
const getEntriesListForTargetVersion = require('@core-js/compat/get-entries-list-for-target-version');
const getModulesListForTargetVersion = require('@core-js/compat/get-modules-list-for-target-version');
const { Globals, StaticProperties, InstanceProperties } = require('@core-js/compat/built-in-definitions');
const { resolveNodeType, toHint, isString, isObject } = require('./resolve-node-type');
const createASTHelpers = require('./ast-helpers');

const defaultCoreJSPackages = ['core-js'];

const { hasOwn } = Object;

function normalizeImportPath(path) {
  return typeof path != 'string' ? null : path
    .replaceAll('\\', '/')
    .replace(/(?:\/(?:index)?)?(?:\.js)?$/i, '')
    .toLowerCase();
}

const TYPE_HINTS = new Set([
  'array',
  'bigint',
  'boolean',
  'date',
  'function',
  'iterator',
  'number',
  'object',
  'promise',
  'regexp',
  'string',
  'symbol',
]);

function descHasTypeHints(desc) {
  for (const hint of TYPE_HINTS) if (hasOwn(desc, hint)) return true;
  return false;
}

function resolveHint(desc, meta) {
  const { placement, object } = meta;
  const hint = String(object).toLowerCase();

  if (placement === 'prototype' && TYPE_HINTS.has(hint)) {
    if (hasOwn(desc, hint)) return desc[hint];
    return descHasTypeHints(desc) ? null : hasOwn(desc, 'common') ? desc.common : null;
  }

  if (hasOwn(desc, 'common')) return desc.common;

  // no common — merge all type hint dependencies
  const hintDescs = [];
  for (const $hint of TYPE_HINTS) {
    if (hasOwn(desc, $hint)) hintDescs.push(desc[$hint]);
  }

  if (hintDescs.length === 1) return hintDescs[0];

  if (hintDescs.length > 1) {
    const dependencies = [...new Set(hintDescs.flatMap(d => d?.dependencies ?? []))];
    return dependencies.length ? { dependencies } : null;
  }

  return null;
}

function enhanceMeta(meta, path, desc) {
  if (!meta || meta.placement === 'prototype') return meta;
  if (!path.isMemberExpression() && !path.isOptionalMemberExpression()) return meta;
  const hint = toHint(resolveNodeType(path.get('object')));
  if (!hint) return meta;
  if (TYPE_HINTS.has(hint)) return { ...meta, object: hint, placement: 'prototype' };
  return descHasTypeHints(desc) ? null : meta;
}

function resolvePatterns(patterns, moduleNames) {
  if (!patterns?.length) return null;
  const set = new Set();
  for (const pattern of patterns) {
    const regex = pattern instanceof RegExp ? pattern : new RegExp(`^${ pattern }$`);
    for (const name of moduleNames) {
      regex.lastIndex = 0;
      if (regex.test(name)) set.add(name);
    }
  }
  return set.size ? set : null;
}

function canTransformDestructuring(path) {
  const objectPattern = path.parentPath;
  const destructParent = objectPattern.parentPath;
  if (destructParent.isVariableDeclarator()) {
    // for-in/for-of: value comes from iteration, not from init — can't polyfill
    if (!destructParent.node.init) return false;
    // insertBefore in for-loop init wraps in IIFE, breaking variable scope
    if (objectPattern.node.properties.length > 1 && destructParent.parentPath.parentPath.isForStatement()) return false;
  } else if (destructParent.isAssignmentExpression()) {
    if (!destructParent.parentPath.isExpressionStatement()) return false;
  } else {
    return false;
  }
  return true;
}

module.exports = defineProvider(({
  babel,
  createMetaResolver,
  debug,
  getUtils,
  method,
  targets,
}, {
  pkg,
  pkgs,
  mode = 'actual',
  version = '4.0',
  include: includePatterns,
  exclude: excludePatterns,
  shippedProposals = false,
}) => {
  if (!['entry-global', 'usage-global', 'usage-pure'].includes(method)) throw new TypeError('Incorrect plugin method');
  if (!['es', 'stable', 'actual', 'full'].includes(mode)) throw new TypeError('Incorrect plugin mode');
  if (shippedProposals && ['es', 'stable'].includes(mode)) mode = 'actual';

  if (pkg === undefined) pkg = method === 'usage-pure' ? '@core-js/pure' : 'core-js';
  if (typeof pkg != 'string') throw new TypeError('Incorrect package name');

  version = normalizeCoreJSVersion(version);

  const t = babel.types;
  const {
    isCallee,
    isInTypeAnnotation,
    normalizeOptionalChain,
    replaceInstanceLike,
    replaceCallWithSimple,
    resolveDestructuringObject,
    handleDestructuredProperty,
  } = createASTHelpers(t);
  const isWebpack = babel.caller(caller => caller?.name === 'babel-loader');

  const packages = pkgs ? [...defaultCoreJSPackages, ...pkgs] : defaultCoreJSPackages;

  const entriesSetForTargetVersion = method === 'usage-pure' && new Set(getEntriesListForTargetVersion(version));
  const modulesListForTargetVersion = getModulesListForTargetVersion(version);
  const includeSet = resolvePatterns(includePatterns, modulesListForTargetVersion);
  const excludeSet = resolvePatterns(excludePatterns, modulesListForTargetVersion);
  const injectedModules = new Set();
  const skippedNodes = new WeakSet();

  if (!Object.keys(targets).length) targets = null;

  const resolve = createMetaResolver({
    global: Globals,
    static: StaticProperties,
    instance: InstanceProperties,
  });

  function getCoreJSEntry(source) {
    source = normalizeImportPath(source);
    if (source === null) return null;
    for (const $pkg of packages) {
      if (source === $pkg) return '';
      if (source.startsWith(`${ $pkg }/`)) {
        const entry = source.slice($pkg.length + 1);
        if (hasOwn(entries, entry)) return entry;
      }
    }
    return null;
  }

  const modulesForEntryCache = new Map();

  function getModulesForEntry(entry) {
    if (entry === '') entry = 'index';
    if (modulesForEntryCache.has(entry)) return modulesForEntryCache.get(entry);
    const allModules = hasOwn(entries, entry) ? entries[entry] : [];
    let result = compat({ modules: allModules, targets, version }).list;
    if (excludeSet) {
      result = result.filter(mod => !excludeSet.has(mod));
    }
    if (includeSet) {
      const resultSet = new Set(result);
      for (const mod of allModules) {
        if (includeSet.has(mod) && !resultSet.has(mod)) {
          result.push(mod);
        }
      }
    }
    modulesForEntryCache.set(entry, result);
    return result;
  }

  function injectModulesForModeEntry(entry, utils) {
    return injectModulesForEntry(`${ mode }/${ entry }`, utils);
  }

  function injectModulesForEntry(entry, utils) {
    for (const moduleName of getModulesForEntry(entry)) {
      injectModule(moduleName, utils);
    }
  }

  function injectModule(moduleName, utils) {
    if (excludeSet?.has(moduleName)) return;
    const moduleEntry = `modules/${ moduleName }`;
    utils.injectGlobalImport(`${ pkg }/${ moduleEntry }`, moduleName);
    injectedModules.add(moduleEntry);
    debug(moduleName);
  }

  function filter(name, args, path) {
    const { node, parent } = path;
    if (!isCallee(node, parent)) return false;
    switch (name) {
      case 'min-args': {
        const [length] = args;
        if (parent.arguments.length >= length) return false;
        return parent.arguments.every(arg => !t.isSpreadElement(arg));
      }
      case 'arg-is-string':
      case 'arg-is-object': {
        const [index] = args;
        if (parent.arguments.length < index + 1) return false;
        if (parent.arguments.slice(0, index).some(arg => t.isSpreadElement(arg))) return false;
        const arg = path.parentPath.get('arguments')[index];
        return name === 'arg-is-string' ? isString(arg) : isObject(arg);
      }
    }
    return false;
  }

  function applyFilters(filters, path) {
    return !!filters?.some(([name, ...args]) => filter(name, args, path));
  }

  function isEntryNeeded(entry) {
    const modeEntry = `${ mode }/${ entry }`;
    return entriesSetForTargetVersion.has(modeEntry) && !!getModulesForEntry(modeEntry).length;
  }

  function injectPureImport(entry, hint, utils) {
    return utils.injectDefaultImport(`${ pkg }/${ mode }/${ entry }`, hint);
  }

  function resolvePureEntry(kind, desc, meta, path) {
    let target = desc;
    if (kind === 'instance') {
      target = resolveHint(desc, meta);
      if (target === null) return null;
    }
    if (applyFilters(target.filters, path)) return null;
    if (!target.dependencies?.length) return null;
    const [entry] = target.dependencies;
    if (!isEntryNeeded(entry)) return null;
    // import from common wrapper to get correct (non-decurried) export
    return kind === 'instance' && hasOwn(desc, 'common') ? desc.common.dependencies[0] : entry;
  }

  function handleSymbolIterator(path, utils) {
    const { parent, node } = path;
    if (node.computed) skippedNodes.add(node.property);
    const isCall = t.isCallExpression(parent, { callee: node })
      || t.isOptionalCallExpression(parent, { callee: node });
    if (isCall && parent.arguments.length === 0) {
      if (!isEntryNeeded('get-iterator')) return;
      replaceCallWithSimple(path, injectPureImport('get-iterator', 'getIterator', utils));
    } else {
      if (!isEntryNeeded('get-iterator-method')) return;
      replaceInstanceLike(path, injectPureImport('get-iterator-method', 'getIteratorMethod', utils));
    }
  }

  return {
    name: 'core-js@4',
    polyfills: modulesListForTargetVersion,
    entryGlobal({ source }, utils, path) {
      const entry = getCoreJSEntry(source);
      if (entry === null) return;
      if (!path.node.loc && injectedModules.has(entry)) return;
      injectModulesForEntry(entry, utils);
      path.remove();
    },
    usageGlobal(meta, utils, path) {
      const resolved = resolve(meta);
      if (!resolved || !hasOwn(resolved.desc, 'global')) return;
      let { kind, desc: { global: desc } } = resolved;
      if (kind === 'instance') {
        const enhanced = enhanceMeta(meta, path, desc);
        if (enhanced === null) return true;
        desc = resolveHint(desc, enhanced);
        if (desc === null) return true;
      }
      const { dependencies, filters } = desc;
      if (!dependencies?.length) return true;
      if (applyFilters(filters, path)) return true;
      for (const entry of dependencies) {
        injectModulesForModeEntry(entry, utils);
      }
      return true;
    },

    usagePure(meta, utils, path) {
      if (skippedNodes.has(path.node)) return;
      if (isInTypeAnnotation(path)) return;

      if (meta.kind === 'in') {
        if (meta.key === 'Symbol.iterator' && isEntryNeeded('is-iterable')) {
          path.replaceWith(t.callExpression(injectPureImport('is-iterable', 'isIterable', utils), [path.node.right]));
        }
        return;
      }

      // can't polyfill delete expressions
      if (path.parentPath.isUnaryExpression({ operator: 'delete' })) return;

      if (meta.kind === 'property') {
        if (path.isObjectProperty()) {
          // destructuring: const { from } = Array
          if (!t.isIdentifier(path.node.value)) return;
          // can't extract property when rest element is present — would change rest semantics
          if (path.parentPath.node.properties.some(p => t.isRestElement(p))) return;
        } else {
          if (!path.isMemberExpression() && !path.isOptionalMemberExpression()) return;
          if (!path.isReferenced()) return;
          if (path.parentPath.isUpdateExpression()) return;
          if (t.isSuper(path.node.object)) return;

          if (meta.key === 'Symbol.iterator') return handleSymbolIterator(path, utils);
        }
      }

      const resolved = resolve(meta);
      if (!resolved || !hasOwn(resolved.desc, 'pure')) return;

      const { kind, desc: { pure: desc } } = resolved;
      let effectiveMeta = meta;
      if (kind === 'instance') {
        effectiveMeta = enhanceMeta(meta, path, desc);
        if (effectiveMeta === null) return;
      }
      const importEntry = resolvePureEntry(kind, desc, effectiveMeta, path);
      if (!importEntry) return;

      const hintName = kind === 'instance' ? `${ resolved.name }InstanceProperty` : resolved.name;

      if (path.isObjectProperty()) {
        if (!canTransformDestructuring(path)) return;

        let value;
        if (kind === 'instance') {
          const objectNode = resolveDestructuringObject(path);
          if (!objectNode) return;
          value = t.callExpression(injectPureImport(importEntry, hintName, utils), [t.cloneNode(objectNode)]);
        } else {
          value = injectPureImport(importEntry, hintName, utils);
        }
        handleDestructuredProperty(path, value);
      } else {
        const id = injectPureImport(importEntry, hintName, utils);
        if (kind === 'instance') {
          replaceInstanceLike(path, id);
        } else {
          path.replaceWith(id);
          normalizeOptionalChain(path, true);
        }
      }
    },

    visitor: method === 'usage-global' && {
      // import('foo')
      CallExpression(path) {
        if (path.get('callee').isImport()) {
          const utils = getUtils(path);
          if (isWebpack) {
            // Webpack uses `Promise.all` to handle dynamic import.
            injectModulesForModeEntry('promise/all', utils);
          } else {
            injectModulesForModeEntry('promise/constructor', utils);
          }
        }
      },
      // (async function () { }).finally(...)
      Function(path) {
        if (path.node.async) {
          injectModulesForModeEntry('promise/constructor', getUtils(path));
          // async function * () { }
          if (path.node.generator) {
            injectModulesForEntry('modules/es.symbol.async-iterator', getUtils(path));
          }
        // function * () { }
        } else if (path.node.generator) {
          injectModulesForEntry('modules/es.symbol.iterator', getUtils(path));
        }
      },
      // for-of, [a, b] = c
      'ForOfStatement|ArrayPattern'(path) {
        injectModulesForModeEntry('symbol/iterator', getUtils(path));
        // for-await-of
        if (path.isForOfStatement() && path.node.await) {
          injectModulesForModeEntry('symbol/async-iterator', getUtils(path));
        }
      },
      // [...spread]
      SpreadElement(path) {
        if (!path.parentPath.isObjectExpression()) {
          injectModulesForModeEntry('symbol/iterator', getUtils(path));
        }
      },
      // yield *
      YieldExpression(path) {
        if (path.node.delegate) {
          injectModulesForModeEntry('symbol/iterator', getUtils(path));
        }
      },
      // decorators metadata
      Class(path) {
        if (path.node.decorators?.length || path.node.body.body.some(el => el.decorators?.length)) {
          injectModulesForModeEntry('symbol/metadata', getUtils(path));
        }
      },
    },
  };
});
