'use strict';
const { default: defineProvider } = require('@babel/helper-define-polyfill-provider');
const entries = require('@core-js/compat/entries.json');
const compat = require('@core-js/compat/compat');
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

const hints = new Set([
  'array',
  'string',
  'regexp',
  'object',
  'function',
]);

function resolveHint(desc, meta) {
  const { placement, object } = meta;
  const hint = String(object).toLowerCase();
  if (placement !== 'prototype' || !hints.has(hint)) return desc.common;
  let required = true;
  for (const $hint of hints) if (hasOwn(desc, $hint)) {
    if (hint === $hint) return desc[hint];
    required = false;
  }
  return required ? desc.common : null;
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
  if (pkg === undefined) pkg = method === 'usage-pure' ? '@core-js/pure' : 'core-js';
  if (typeof pkg != 'string') throw new TypeError('Incorrect package name');

  const t = babel.types;
  const isWebpack = babel.caller(caller => caller?.name === 'babel-loader');

  const packages = pkgs ? [...defaultCoreJSPackages, ...pkgs] : [...defaultCoreJSPackages];

  const modulesListForTargetVersion = getModulesListForTargetVersion(version);
  const injectedModules = new Set();

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

  function getModulesForCoreJSEntry(entry) {
    return compat({ modules: entries[entry], targets, version }).list;
  }

  function injectCoreJSModulesForEntry(entry, utils) {
    for (const moduleName of getModulesForCoreJSEntry(entry)) {
      const moduleEntry = `modules/${ moduleName }`;
      utils.injectGlobalImport(`${ pkg }/${ moduleEntry }`, moduleName);
      injectedModules.add(moduleEntry);
      debug(moduleName);
    }
  }

  function isCallOrNew(node, callee) {
    return t.isCallExpression(node, { callee }) || t.isNewExpression(node, { callee });
  }

  function isStringLiteral(arg) {
    return t.isStringLiteral(arg) || t.isTemplateLiteral(arg);
  }

  function isNonPrimitiveLiteral(arg) {
    return t.isObjectExpression(arg) ||
      t.isArrayExpression(arg) ||
      t.isFunctionExpression(arg) ||
      t.isArrowFunctionExpression(arg) ||
      t.isClassExpression(arg) ||
      t.isRegExpLiteral(arg);
  }

  function filter(name, args, path) {
    const { node, parent } = path;
    switch (name) {
      case 'min-args': {
        if (!isCallOrNew(parent, node)) return false;
        const [index] = args;
        if (parent.arguments.length >= index) return false;
        return parent.arguments.every(arg => !t.isSpreadElement(arg));
      }
      case 'arg-is-string': {
        if (!isCallOrNew(parent, node)) return false;
        const [index] = args;
        if (parent.arguments.length < index + 1) return false;
        if (parent.arguments.slice(0, index + 1).some(arg => t.isSpreadElement(arg))) return false;
        return isStringLiteral(parent.arguments[index]);
      }
      case 'arg-is-object': {
        if (!isCallOrNew(parent, node)) return false;
        const [index] = args;
        if (parent.arguments.length < index + 1) return false;
        if (parent.arguments.slice(0, index + 1).some(arg => t.isSpreadElement(arg))) return false;
        return isNonPrimitiveLiteral(parent.arguments[index]);
      }
    }
  }

  return {
    name: 'core-js@4',
    polyfills: modulesListForTargetVersion,
    entryGlobal({ source }, utils, path) {
      const entry = getCoreJSEntry(source);
      if (entry === null || injectedModules.has(entry)) return;
      injectCoreJSModulesForEntry(entry, utils);
      path.remove();
    },
    usageGlobal(meta, utils, path) {
      const resolved = resolve(meta);
      if (!resolved) return;
      let { kind, desc: { global: desc } } = resolved;
      if (kind === 'instance') {
        desc = resolveHint(desc, meta);
        if (desc === null) return true;
      }
      const { dependencies, filters } = desc;
      if (filters?.some(([name, ...args]) => filter(name, args, path))) return true;
      for (const entry of dependencies) {
        injectCoreJSModulesForEntry(`${ mode }/${ entry }`, utils);
      }
      return true;
    },
    usagePure() { /* empty */ },
    visitor: method === 'usage-global' && {
      // import('foo')
      CallExpression(path) {
        if (path.get('callee').isImport()) {
          const utils = getUtils(path);
          if (isWebpack) {
            // Webpack uses `Promise.all` to handle dynamic import.
            injectCoreJSModulesForEntry(`${ mode }/promise/all`, utils);
          } else {
            injectCoreJSModulesForEntry(`${ mode }/promise/constructor`, utils);
          }
        }
      },
      // (async function () { }).finally(...)
      Function(path) {
        if (path.node.async) {
          injectCoreJSModulesForEntry(`${ mode }/promise/constructor`, getUtils(path));
        }
      },
      // for-of, [a, b] = c
      'ForOfStatement|ArrayPattern'(path) {
        injectCoreJSModulesForEntry(`${ mode }/get-iterator`, getUtils(path));
      },
      // [...spread]
      SpreadElement(path) {
        if (!path.parentPath.isObjectExpression()) {
          injectCoreJSModulesForEntry(`${ mode }/get-iterator`, getUtils(path));
        }
      },
      // yield *
      YieldExpression(path) {
        if (path.node.delegate) {
          injectCoreJSModulesForEntry(`${ mode }/get-iterator`, getUtils(path));
        }
      },
      // decorators metadata
      Class(path) {
        if (path.node.decorators?.length || path.node.body.body.some(el => el.decorators?.length)) {
          injectCoreJSModulesForEntry(`${ mode }/symbol/metadata`, getUtils(path));
        }
      },
    },
  };
});
