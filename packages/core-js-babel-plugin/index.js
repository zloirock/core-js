'use strict';
const { default: defineProvider } = require('@babel/helper-define-polyfill-provider');
const entries = require('@core-js/compat/entries.json');
const compat = require('@core-js/compat/compat');
const { normalizeCoreJSVersion } = require('@core-js/compat/helpers');
const getEntriesListForTargetVersion = require('@core-js/compat/get-entries-list-for-target-version');
const getModulesListForTargetVersion = require('@core-js/compat/get-modules-list-for-target-version');
const { Globals, StaticProperties, InstanceProperties } = require('@core-js/compat/built-in-definitions');

const defaultCoreJSPackages = ['core-js'];

const { hasOwn } = Object;

function normalizeImportPath(path) {
  if (typeof path == 'string') return path
    .replaceAll('\\', '/')
    .replace(/(?:\/(?:index)?)?(?:\.js)?$/i, '')
    .toLowerCase();
}

const TYPE_HINTS = new Set([
  'array',
  'boolean',
  'function',
  'iterator',
  'number',
  'object',
  'regexp',
  'string',
]);

function resolveHint(desc, meta) {
  const { placement, object } = meta;
  const hint = String(object).toLowerCase();

  if (placement === 'prototype' && TYPE_HINTS.has(hint)) {
    let hasOtherHints = false;
    for (const $hint of TYPE_HINTS) if (hasOwn(desc, $hint)) {
      if (hint === $hint) return desc[hint];
      hasOtherHints = true;
    }
    return hasOtherHints ? null : hasOwn(desc, 'common') ? desc.common : null;
  }

  if (hasOwn(desc, 'common')) return desc.common;

  // no common — merge all type hint dependencies
  const hintDescs = [];
  for (const $hint of TYPE_HINTS) {
    if (hasOwn(desc, $hint)) hintDescs.push(desc[$hint]);
  }

  if (hintDescs.length === 1) return hintDescs[0];

  if (hintDescs.length > 1) {
    const dependencies = [...hintDescs.reduce((set, hintDesc) => {
      hintDesc?.dependencies.forEach(it => set.add(it));
      return set;
    }, new Set())];

    return dependencies.length ? { dependencies } : null;
  }

  return null;
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
}) => {
  if (!['entry-global', 'usage-global', 'usage-pure'].includes(method)) throw new TypeError('Incorrect plugin method');
  if (!['es', 'stable', 'actual', 'full'].includes(mode)) throw new TypeError('Incorrect plugin mode');

  if (pkg === undefined) pkg = method === 'usage-pure' ? '@core-js/pure' : 'core-js';
  if (typeof pkg != 'string') throw new TypeError('Incorrect package name');

  version = normalizeCoreJSVersion(version);

  const t = babel.types;
  const isWebpack = babel.caller(caller => caller?.name === 'babel-loader');

  const packages = pkgs ? [...defaultCoreJSPackages, ...pkgs] : [...defaultCoreJSPackages];

  const entriesSetForTargetVersion = method === 'usage-pure' && new Set(getEntriesListForTargetVersion(version));
  const modulesListForTargetVersion = getModulesListForTargetVersion(version);
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
    const result = hasOwn(entries, entry) ? compat({ modules: entries[entry], targets, version }).list : [];
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
    const moduleEntry = `modules/${ moduleName }`;
    utils.injectGlobalImport(`${ pkg }/${ moduleEntry }`, moduleName);
    injectedModules.add(moduleEntry);
    debug(moduleName);
  }

  function isCallee(callee, parent) {
    return t.isCallExpression(parent, { callee }) || t.isNewExpression(parent, { callee });
  }

  function isString(node) {
    return t.isStringLiteral(node) || t.isTemplateLiteral(node);
  }

  function isNonPrimitive(node) {
    return t.isObjectExpression(node) ||
      t.isArrayExpression(node) ||
      t.isFunctionExpression(node) ||
      t.isArrowFunctionExpression(node) ||
      t.isClassExpression(node) ||
      t.isRegExpLiteral(node) ||
      t.isNewExpression(node);
  }

  function filter(name, args, path) {
    const { node, parent } = path;
    switch (name) {
      case 'min-args': {
        if (!isCallee(node, parent)) return false;
        const [length] = args;
        if (parent.arguments.length >= length) return false;
        return parent.arguments.every(arg => !t.isSpreadElement(arg));
      }
      case 'arg-is-string': {
        if (!isCallee(node, parent)) return false;
        const [index] = args;
        if (parent.arguments.length < index + 1) return false;
        if (parent.arguments.slice(0, index).some(arg => t.isSpreadElement(arg))) return false;
        return isString(parent.arguments[index]);
      }
      case 'arg-is-object': {
        if (!isCallee(node, parent)) return false;
        const [index] = args;
        if (parent.arguments.length < index + 1) return false;
        if (parent.arguments.slice(0, index).some(arg => t.isSpreadElement(arg))) return false;
        return isNonPrimitive(parent.arguments[index]);
      }
    }
  }

  function applyFilters(filters, path) {
    return !!filters?.some(([name, ...args]) => filter(name, args, path));
  }

  function injectPureImport(entry, hint, utils) {
    const modeEntry = `${ mode }/${ entry }`;
    if (!entriesSetForTargetVersion.has(modeEntry) || !getModulesForEntry(modeEntry).length) return null;
    return utils.injectDefaultImport(`${ pkg }/${ modeEntry }`, hint);
  }

  function memoize(node, scope) {
    if (t.isIdentifier(node)) return [t.cloneNode(node), node];
    const ref = scope.generateDeclaredUidIdentifier('ref');
    return [t.assignmentExpression('=', t.cloneNode(ref), node), ref];
  }

  function wrapConditional(check, result) {
    return t.conditionalExpression(
      t.binaryExpression('==', check, t.nullLiteral()),
      t.unaryExpression('void', t.numericLiteral(0)),
      result,
    );
  }

  function buildMethodCall(id, object, scope, args, optionalCall) {
    const [assign, ref] = memoize(object, scope);
    const callMember = optionalCall
      ? t.optionalMemberExpression(t.callExpression(id, [assign]), t.identifier('call'), false, true)
      : t.memberExpression(t.callExpression(id, [assign]), t.identifier('call'));
    return optionalCall
      ? t.optionalCallExpression(callMember, [t.cloneNode(ref), ...args], false)
      : t.callExpression(callMember, [t.cloneNode(ref), ...args]);
  }

  function normalizeOptionalChain(path) {
    let { parentPath } = path;
    if (parentPath.isOptionalMemberExpression()) {
      if (path.key !== 'object') return;
    } else if (parentPath.isOptionalCallExpression()) {
      if (path.key !== 'callee') return;
    } else return;
    do {
      parentPath.node.type = parentPath.type === 'OptionalMemberExpression' ? 'MemberExpression' : 'CallExpression';
      delete parentPath.node.optional;
      ({ parentPath } = parentPath);
    } while ((parentPath.isOptionalMemberExpression() || parentPath.isOptionalCallExpression()) && !parentPath.node.optional);
  }

  function replaceInstanceLike(path, id) {
    const { node, parent } = path;
    const isCall = (t.isCallExpression(parent) || t.isOptionalCallExpression(parent)) && parent.callee === node;

    if (node.optional) {
      const [check, ref] = memoize(node.object, path.scope);
      const result = isCall
        ? buildMethodCall(id, ref, path.scope, parent.arguments, parent.optional)
        : t.callExpression(id, [t.cloneNode(ref)]);
      const replacePath = isCall ? path.parentPath : path;
      replacePath.replaceWith(wrapConditional(check, result));
      normalizeOptionalChain(replacePath);
    } else if (isCall) {
      path.parentPath.replaceWith(buildMethodCall(id, node.object, path.scope, parent.arguments, false));
      normalizeOptionalChain(path.parentPath);
    } else {
      path.replaceWith(t.callExpression(id, [node.object]));
      normalizeOptionalChain(path);
    }
  }

  function replaceCallWithSimple(path, id) {
    const { node } = path;
    if (node.optional) {
      const [check, ref] = memoize(node.object, path.scope);
      const replacePath = path.parentPath;
      replacePath.replaceWith(wrapConditional(check, t.callExpression(id, [t.cloneNode(ref)])));
      normalizeOptionalChain(replacePath);
    } else {
      path.parentPath.replaceWith(t.callExpression(id, [node.object]));
      normalizeOptionalChain(path.parentPath);
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
        desc = resolveHint(desc, meta);
        if (desc === null) return true;
      }
      const { dependencies, filters } = desc;
      if (applyFilters(filters, path)) return true;
      for (const entry of dependencies) {
        injectModulesForModeEntry(entry, utils);
      }
      return true;
    },

    usagePure(meta, utils, path) {
      if (skippedNodes.has(path.node)) return;

      if (meta.kind === 'in') {
        if (meta.key === 'Symbol.iterator') {
          const id = injectPureImport('is-iterable', 'isIterable', utils);
          if (id) path.replaceWith(t.callExpression(id, [path.node.right]));
        }
        return;
      }

      // can't polyfill delete expressions
      if (path.parentPath.isUnaryExpression({ operator: 'delete' })) return;

      if (meta.kind === 'property') {
        if (!path.isMemberExpression() && !path.isOptionalMemberExpression()) return;
        if (!path.isReferenced()) return;
        if (path.parentPath.isUpdateExpression()) return;
        if (t.isSuper(path.node.object)) return;

        if (meta.key === 'Symbol.iterator') {
          const { parent, node } = path;
          if (node.computed) skippedNodes.add(node.property);
          const isCall = t.isCallExpression(parent, { callee: node }) || t.isOptionalCallExpression(parent, { callee: node });

          if (isCall && parent.arguments.length === 0) {
            const id = injectPureImport('get-iterator', 'getIterator', utils);
            if (id) replaceCallWithSimple(path, id);
          } else {
            const id = injectPureImport('get-iterator-method', 'getIteratorMethod', utils);
            if (id) replaceInstanceLike(path, id);
          }

          return;
        }
      }

      const resolved = resolve(meta);
      if (!resolved) return;

      let { kind, desc: { pure: desc } } = resolved;
      if (!desc) return;

      if (kind === 'instance') {
        desc = resolveHint(desc, meta);
        if (desc === null) return;
      }

      const { dependencies, filters } = desc;
      if (applyFilters(filters, path)) return;
      if (!dependencies?.length) return;

      const [dep] = dependencies;

      switch (kind) {
        case 'global': {
          const id = injectPureImport(dep, resolved.name, utils);
          if (id) path.replaceWith(id);
        } break;

        case 'static': {
          const id = injectPureImport(dep, resolved.name, utils);
          if (id) {
            path.replaceWith(id);
            normalizeOptionalChain(path);
          }
        } break;

        case 'instance': {
          const id = injectPureImport(dep, `${ resolved.name }InstanceProperty`, utils);
          if (id) replaceInstanceLike(path, id);
        } break;
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
          if (path.node.generator) {
            injectModule('es.symbol.async-iterator', getUtils(path));
          }
        } else if (path.node.generator) {
          injectModule('es.symbol.iterator', getUtils(path));
        }
      },
      // for-of, [a, b] = c
      'ForOfStatement|ArrayPattern'(path) {
        injectModulesForModeEntry('symbol/iterator', getUtils(path));
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
