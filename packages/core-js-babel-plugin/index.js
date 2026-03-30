import defineProvider from '@babel/helper-define-polyfill-provider';
import compatData from '@core-js/compat/data' with { type: 'json' };
import {
  isCoreJSFile,
  parseDisableDirectives,
  createPolyfillResolver,
  validateImportStyle,
  resolveImportStyle,
} from '@core-js/polyfill-provider';
import createASTHelpers from './ast-helpers.js';
import { createResolveNodeType } from '@core-js/polyfill-provider/resolve-node-type';

export default defineProvider(({
  babel,
  // eslint-disable-next-line no-unused-vars -- provided by defineProvider but resolution is now in createPolyfillResolver
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

  const { types: t } = babel;
  const {
    resolvePropertyObjectType,
    resolveGuardHints,
    toHint,
    isString,
    isObject,
  } = createResolveNodeType(node => node?.type, t);

  const {
    isCallee,
    isInTypeAnnotation,
    normalizeOptionalChain,
    replaceInstanceLike,
    replaceCallWithSimple,
    resolveDestructuringObject,
    handleDestructuredProperty,
  } = createASTHelpers(t);

  const resolver = createPolyfillResolver({
    method, mode, version, package: pkg, additionalPackages,
    include, exclude, shippedProposals, shouldInjectPolyfill,
    validate: false,
    resolvePropertyObjectType, resolveGuardHints, toHint, isString, isObject,
    isMemberLike: path => path.isMemberExpression() || path.isOptionalMemberExpression(),
    isCallee,
    isSpreadElement: node => t.isSpreadElement(node),
  });

  ({ mode, pkg } = resolver);

  // update options for the provider if entry paths were extracted
  if (resolver.filteredInclude !== include) options.include = resolver.filteredInclude;
  if (resolver.filteredExclude !== exclude) options.exclude = resolver.filteredExclude;

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

  function injectModulesForModeEntry(entry, utils) {
    return injectModulesForEntry(`${ mode }/${ entry }`, utils);
  }

  function injectModulesForEntry(entry, utils) {
    for (const moduleName of resolver.getModulesForEntry(entry)) {
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

  function handleSymbolIterator(path, utils) {
    const { parent, node } = path;
    if (node.computed) skippedNodes.add(node.property);
    const isCall = t.isCallExpression(parent, { callee: node })
      || t.isOptionalCallExpression(parent, { callee: node });
    if (isCall && parent.arguments.length === 0 && !parent.optional) {
      if (!resolver.isEntryNeeded('get-iterator')) return;
      replaceCallWithSimple(path, injectPureImport('get-iterator', 'getIterator', utils));
      debug('get-iterator');
    } else {
      if (!resolver.isEntryNeeded('get-iterator-method')) return;
      replaceInstanceLike(path, injectPureImport('get-iterator-method', 'getIteratorMethod', utils));
      debug('get-iterator-method');
    }
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
      const result = resolver.resolveEntry(source);
      if (!result) return;
      if (!path.node.loc && injectedModules.has(result.entry)) return;
      debug();
      for (const mod of result.modules) injectModule(mod, utils);
      path.remove();
    },
    // eslint-disable-next-line sonarjs/no-invariant-returns -- return true tells provider to skip object
    usageGlobal(meta, utils, path) {
      if (isDisabled(path)) return true;
      const deps = resolver.resolveUsage(meta, path);
      if (!deps) return true;
      for (const entry of deps) injectModulesForModeEntry(entry, utils);
      return true;
    },

    usagePure(meta, utils, path) {
      if (isDisabled(path)) return;
      if (skippedNodes.has(path.node)) return;
      if (isInTypeAnnotation(path)) return;

      if (meta.kind === 'in') {
        if (meta.key === 'Symbol.iterator' && resolver.isEntryNeeded('is-iterable')) {
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

      const result = resolver.resolvePure(meta, path);
      if (!result) return;
      debug(result.entry);

      const { entry, kind, hintName } = result;

      if (path.isObjectProperty()) {
        if (!canTransformDestructuring(path)) return;

        let value;
        if (kind === 'instance') {
          const objectNode = resolveDestructuringObject(path);
          if (!objectNode) return;
          value = t.callExpression(injectPureImport(entry, hintName, utils), [t.cloneNode(objectNode)]);
        } else {
          value = injectPureImport(entry, hintName, utils);
        }
        handleDestructuredProperty(path, value);
      } else {
        const id = injectPureImport(entry, hintName, utils);
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
