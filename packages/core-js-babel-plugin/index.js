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

  function getModulesForEntry(entry) {
    if (entry && !hasOwn(entries, entry)) return [];
    return compat({ modules: entries[entry], targets, version }).list;
  }

  function injectModulesForEntry(entry, utils) {
    for (const moduleName of getModulesForEntry(entry)) {
      const moduleEntry = `modules/${ moduleName }`;
      utils.injectGlobalImport(`${ pkg }/${ moduleEntry }`, moduleName);
      injectedModules.add(moduleEntry);
      debug(moduleName);
    }
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
        const [index] = args;
        if (parent.arguments.length >= index) return false;
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

  function injectPureImport(dep, hint, utils) {
    if (!getModulesForEntry(`${ mode }/${ dep }`).length) return null;
    return utils.injectDefaultImport(`${ pkg }/${ mode }/${ dep }`, hint);
  }

  function maybeMemoizeContext(node, scope) {
    const { object } = node;
    let context1, context2;
    if (t.isIdentifier(object)) {
      context2 = object;
      context1 = t.cloneNode(object);
    } else {
      context2 = scope.generateDeclaredUidIdentifier('context');
      context1 = t.assignmentExpression('=', t.cloneNode(context2), object);
    }
    return [context1, context2];
  }

  function callMethod(path, id) {
    const [context1, context2] = maybeMemoizeContext(path.node, path.scope);
    path.replaceWith(t.memberExpression(t.callExpression(id, [context1]), t.identifier('call')));
    path.parentPath.unshiftContainer('arguments', context2);
  }

  return {
    name: 'core-js@4',
    polyfills: modulesListForTargetVersion,
    entryGlobal({ source }, utils, path) {
      const entry = getCoreJSEntry(source);
      if (entry === null || injectedModules.has(entry)) return;
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
      if (filters?.some(([name, ...args]) => filter(name, args, path))) return true;
      for (const entry of dependencies) {
        injectModulesForEntry(`${ mode }/${ entry }`, utils);
      }
      return true;
    },
    /* eslint-disable max-statements -- ok */
    usagePure(meta, utils, path) {
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

          if (t.isCallExpression(parent, { callee: node })) {
            if (parent.arguments.length === 0) {
              const id = injectPureImport('get-iterator', 'getIterator', utils);
              if (!id) return;
              path.parentPath.replaceWith(t.callExpression(id, [node.object]));
              path.skip();
            } else {
              const id = injectPureImport('get-iterator-method', 'getIteratorMethod', utils);
              if (!id) return;
              callMethod(path, id);
            }
          } else {
            const id = injectPureImport('get-iterator-method', 'getIteratorMethod', utils);
            if (!id) return;
            path.replaceWith(t.callExpression(id, [node.object]));
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
        if (desc === null) return true;
      }

      const { dependencies } = desc;
      if (!dependencies?.length) return;

      const [dep] = dependencies;

      switch (kind) {
        case 'global': {
          const id = injectPureImport(dep, resolved.name, utils);
          if (id) path.replaceWith(id);

          break;
        }
        case 'static': {
          const id = injectPureImport(dep, resolved.name, utils);
          if (id) {
            path.replaceWith(id);
            // remove optional chaining since we now import a known-non-null value
            let { parentPath } = path;
            if (parentPath.isOptionalMemberExpression() || parentPath.isOptionalCallExpression()) {
              do {
                parentPath.node.type = parentPath.type === 'OptionalMemberExpression' ? 'MemberExpression' : 'CallExpression';
                delete parentPath.node.optional;
                ({ parentPath } = parentPath);
              } while (
                (parentPath.isOptionalMemberExpression() || parentPath.isOptionalCallExpression()) &&
              !parentPath.node.optional
              );
            }
          }

          break;
        }
        case 'instance': {
          const id = injectPureImport(dep, `${ resolved.name }InstanceProperty`, utils);
          if (!id) return;

          const { node, parent } = path;

          if (t.isCallExpression(parent) && parent.callee === node) {
            callMethod(path, id);
          } else {
            path.replaceWith(t.callExpression(id, [node.object]));
          }

          break;
        }
      }

      return true;
    },
    /* eslint-enable max-statements -- ok */
    visitor: method === 'usage-global' && {
      // import('foo')
      CallExpression(path) {
        if (path.get('callee').isImport()) {
          const utils = getUtils(path);
          if (isWebpack) {
            // Webpack uses `Promise.all` to handle dynamic import.
            injectModulesForEntry(`${ mode }/promise/all`, utils);
          } else {
            injectModulesForEntry(`${ mode }/promise/constructor`, utils);
          }
        }
      },
      // (async function () { }).finally(...)
      Function(path) {
        if (path.node.async) {
          injectModulesForEntry(`${ mode }/promise/constructor`, getUtils(path));
        }
      },
      // for-of, [a, b] = c
      'ForOfStatement|ArrayPattern'(path) {
        injectModulesForEntry(`${ mode }/get-iterator`, getUtils(path));
      },
      // [...spread]
      SpreadElement(path) {
        if (!path.parentPath.isObjectExpression()) {
          injectModulesForEntry(`${ mode }/get-iterator`, getUtils(path));
        }
      },
      // yield *
      YieldExpression(path) {
        if (path.node.delegate) {
          injectModulesForEntry(`${ mode }/get-iterator`, getUtils(path));
        }
      },
      // decorators metadata
      Class(path) {
        if (path.node.decorators?.length || path.node.body.body.some(el => el.decorators?.length)) {
          injectModulesForEntry(`${ mode }/symbol/metadata`, getUtils(path));
        }
      },
    },
  };
});
