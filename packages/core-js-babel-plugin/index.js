import defineProvider from '@babel/helper-define-polyfill-provider';
import compatData from '@core-js/compat/data' with { type: 'json' };
import builtInDefinitions from '@core-js/compat/built-in-definitions' with { type: 'json' };
import {
  TYPE_HINTS,
  isCoreJSFile,
  getDependencies,
  descHasTypeHints,
  resolveHint,
  pureImportName,
  parseDisableDirectives,
  createPolyfillContext,
  validateImportStyle,
  resolveImportStyle,
} from '@core-js/polyfill-provider';
import createASTHelpers from './ast-helpers.js';
import { createResolveNodeType } from '@core-js/polyfill-provider/resolve-node-type';

const { hasOwn } = Object;

export default defineProvider(({
  babel,
  createMetaResolver,
  debug,
  getUtils,
  method,
  shouldInjectPolyfill,
}, options) => {
  let {
    package: pkg,
    additionalPackages,
    mode = 'actual',
    version = '4.0',
    shippedProposals = false,
    importStyle: importStyleOption,
    include,
    exclude,
  } = options;

  validateImportStyle(importStyleOption);

  const {
    mode: resolvedMode,
    pkg: resolvedPkg,
    getModulesForEntry,
    getCoreJSEntry,
    isEntryNeeded,
    filteredInclude,
    filteredExclude,
  } = createPolyfillContext({
    method,
    mode,
    version,
    package: pkg,
    additionalPackages,
    include,
    exclude,
    shippedProposals,
    shouldInjectPolyfill,
    validate: false, // Babel provider handles its own include/exclude validation
  });

  mode = resolvedMode;
  pkg = resolvedPkg;

  // update options for the provider if entry paths were extracted
  if (filteredInclude !== include) options.include = filteredInclude;
  if (filteredExclude !== exclude) options.exclude = filteredExclude;

  const { types: t } = babel;
  const {
    resolvePropertyObjectType,
    resolveGuardHints,
    toHint,
    isString,
    isObject,
  } = createResolveNodeType(node => node?.type, t);

  function enhanceMeta(meta, path, desc) {
    if (!meta) return meta;
    if (meta.object !== null && meta.object !== undefined
      && meta.placement === 'prototype' && TYPE_HINTS.has(String(meta.object).toLowerCase())) return meta;
    const hint = toHint(resolvePropertyObjectType(path));
    if (hint) {
      if (TYPE_HINTS.has(hint)) return { ...meta, object: hint, placement: 'prototype' };
      return descHasTypeHints(desc) ? null : meta;
    }
    // no type resolved - check for type guards to include/exclude specific hints (MemberExpression only)
    if ((path.isMemberExpression() || path.isOptionalMemberExpression()) && descHasTypeHints(desc)) {
      const hints = resolveGuardHints(path.get('object'));
      if (hints) return { ...meta, ...hints };
    }
    return meta;
  }

  function canTransformDestructuring(path) {
    const objectPattern = path.parentPath;
    const destructParent = objectPattern?.parentPath;
    if (destructParent?.isVariableDeclarator()) {
      if (!destructParent.node.init) return false;
      if (objectPattern.node.properties.length > 1 && destructParent.parentPath?.parentPath?.isForStatement()) return false;
    } else if (destructParent?.isAssignmentExpression()) {
      if (!destructParent.parentPath?.isExpressionStatement()) return false;
    } else {
      return false;
    }
    return true;
  }

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

  const injectedModules = new Set();
  const skippedNodes = new WeakSet();
  let skipFile = false;
  let disabledLines = null;
  let importStyle = 'import';
  let programPath = null;
  const pureImportCache = new Map();

  function isDisabled(path) {
    return skipFile || (disabledLines !== null && disabledLines.has(path.node.loc?.start.line));
  }

  const resolve = createMetaResolver({
    global: builtInDefinitions.Globals,
    static: builtInDefinitions.StaticProperties,
    instance: builtInDefinitions.InstanceProperties,
  });

  function injectModulesForModeEntry(entry, utils) {
    return injectModulesForEntry(`${ mode }/${ entry }`, utils);
  }

  function injectModulesForEntry(entry, utils) {
    for (const moduleName of getModulesForEntry(entry)) {
      injectModule(moduleName, utils);
    }
  }

  function makeGlobalImportNode(source) {
    return importStyle === 'require'
      ? t.expressionStatement(t.callExpression(t.identifier('require'), [t.stringLiteral(source)]))
      : t.importDeclaration([], t.stringLiteral(source));
  }

  function makeDefaultImportNode(id, source) {
    return importStyle === 'require'
      ? t.variableDeclaration('var', [t.variableDeclarator(id, t.callExpression(t.identifier('require'), [t.stringLiteral(source)]))])
      : t.importDeclaration([t.importDefaultSpecifier(id)], t.stringLiteral(source));
  }

  function injectModule(moduleName, utils) {
    const moduleEntry = `modules/${ moduleName }`;
    if (injectedModules.has(moduleEntry)) return;
    const source = `${ pkg }/${ moduleEntry }`;
    if (importStyleOption) {
      programPath.unshiftContainer('body', makeGlobalImportNode(source));
    } else {
      utils.injectGlobalImport(source, moduleName);
    }
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

  function injectPureImport(entry, hint, utils) {
    const source = `${ pkg }/${ mode }/${ entry }`;
    if (importStyleOption) {
      if (pureImportCache.has(source)) return t.cloneNode(pureImportCache.get(source));
      const id = programPath.scope.generateUidIdentifier(hint);
      programPath.unshiftContainer('body', makeDefaultImportNode(id, source));
      pureImportCache.set(source, id);
      return t.cloneNode(id);
    }
    return utils.injectDefaultImport(source, hint);
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
    if (!isEntryNeeded(entry) && !(target.guard && isEntryNeeded(target.guard))) return null;
    return entry;
  }

  function handleSymbolIterator(path, utils) {
    const { parent, node } = path;
    if (node.computed) skippedNodes.add(node.property);
    const isCall = t.isCallExpression(parent, { callee: node })
      || t.isOptionalCallExpression(parent, { callee: node });
    if (isCall && parent.arguments.length === 0 && !parent.optional) {
      if (!isEntryNeeded('get-iterator')) return;
      replaceCallWithSimple(path, injectPureImport('get-iterator', 'getIterator', utils));
      debug('get-iterator');
    } else {
      if (!isEntryNeeded('get-iterator-method')) return;
      replaceInstanceLike(path, injectPureImport('get-iterator-method', 'getIteratorMethod', utils));
      debug('get-iterator-method');
    }
  }

  return {
    name: 'core-js@4',
    polyfills: compatData,
    pre() {
      skipFile = !!this.filename && isCoreJSFile(this.filename);
      injectedModules.clear();
      pureImportCache.clear();
      programPath = this.file.path;
      importStyle = resolveImportStyle(importStyleOption, this.file.opts.sourceType);
      const directives = skipFile ? null : parseDisableDirectives(this.file.ast.comments);
      if (directives === true) skipFile = true;
      disabledLines = directives !== true ? directives : null;
    },
    entryGlobal({ source }, utils, path) {
      if (isDisabled(path)) return;
      const entry = getCoreJSEntry(source);
      if (entry === null) return;
      if (!path.node.loc && injectedModules.has(entry)) return;
      debug();
      injectModulesForEntry(entry, utils);
      path.remove();
    },
    usageGlobal(meta, utils, path) {
      if (isDisabled(path)) return true;
      const resolved = resolve(meta);
      if (!resolved || !hasOwn(resolved.desc, 'global')) return;
      let { kind, desc: { global: desc } } = resolved;
      if (kind === 'instance') {
        const enhanced = enhanceMeta(meta, path, desc);
        if (enhanced === null) return true;
        desc = resolveHint(desc, enhanced);
        if (desc === null) return true;
      }
      const dependencies = getDependencies(desc);
      if (!dependencies?.length) return true;
      if (applyFilters(desc.filters, path)) return true;
      for (const entry of dependencies) {
        injectModulesForModeEntry(entry, utils);
      }
      return true;
    },

    usagePure(meta, utils, path) {
      if (isDisabled(path)) return;
      if (skippedNodes.has(path.node)) return;
      if (isInTypeAnnotation(path)) return;

      if (meta.kind === 'in') {
        if (meta.key === 'Symbol.iterator' && isEntryNeeded('is-iterable')) {
          path.replaceWith(t.callExpression(injectPureImport('is-iterable', 'isIterable', utils), [path.node.right]));
          debug('is-iterable');
        }
        return;
      }

      // can't polyfill delete expressions
      if (path.parentPath.isUnaryExpression({ operator: 'delete' })) return;

      if (meta.kind === 'property') {
        if (path.isObjectProperty()) {
          // destructuring: const { from } = Array
          if (!t.isIdentifier(path.node.value)) return;
          // can't extract property when rest element is present - would change rest semantics
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
      debug(importEntry);

      const hintName = pureImportName(kind, resolved.name, importEntry);

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
          const chainStart = path.node.optional;
          path.replaceWith(id);
          normalizeOptionalChain(path, !chainStart);
        }
      }
    },

    visitor: method === 'usage-global' && {
      // import('foo')
      CallExpression(path) {
        if (isDisabled(path)) return;
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
        if (isDisabled(path)) return;
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
        if (isDisabled(path)) return;
        injectModulesForModeEntry('symbol/iterator', getUtils(path));
        // for-await-of
        if (path.isForOfStatement() && path.node.await) {
          injectModulesForModeEntry('symbol/async-iterator', getUtils(path));
        }
      },
      // [...spread]
      SpreadElement(path) {
        if (isDisabled(path)) return;
        if (!path.parentPath.isObjectExpression()) {
          injectModulesForModeEntry('symbol/iterator', getUtils(path));
        }
      },
      // yield *
      YieldExpression(path) {
        if (isDisabled(path)) return;
        if (path.node.delegate) {
          injectModulesForModeEntry('symbol/iterator', getUtils(path));
        }
      },
      // using x = ..., await using x = ...
      VariableDeclaration(path) {
        if (isDisabled(path)) return;
        const { kind } = path.node;
        if (kind === 'using' || kind === 'await using') {
          // babel uses all those polyfills in all cases of `using`
          injectModulesForModeEntry('symbol/async-dispose', getUtils(path));
          injectModulesForModeEntry('symbol/dispose', getUtils(path));
          injectModulesForModeEntry('suppressed-error', getUtils(path));
        }
      },
      // decorators metadata
      Class(path) {
        if (isDisabled(path)) return;
        if (path.node.decorators?.length || path.node.body.body.some(el => el.decorators?.length)) {
          injectModulesForModeEntry('symbol/metadata', getUtils(path));
        }
      },
    },
  };
});
