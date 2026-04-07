import { isCoreJSFile, parseDisableDirectives, mergeVisitors, buildSuperStaticMeta } from '@core-js/polyfill-provider/helpers';
import { createResolveNodeType } from '@core-js/polyfill-provider/resolve-node-type';
import { createPolyfillResolver } from '@core-js/polyfill-provider/resolver';
import { createModuleInjectors, createUsageGlobalCallback } from '@core-js/polyfill-provider/plugin-options';
import {
  canTransformDestructuring as sharedCanTransformDestructuring,
  resolveSymbolIteratorEntry,
  resolveSymbolInEntry,
  isPolyfillableOptional,
} from '@core-js/polyfill-provider/detect-usage';
import { resolve as resolveBuiltIn } from '@core-js/polyfill-provider';
import createASTHelpers from './internals/babel-compat.js';
import ImportInjector from './internals/import-injector.js';
import { babelAdapter, createUsageVisitors, createSyntaxVisitors, setActivePureImports } from './internals/detect-usage.js';
import createEntryVisitors from './internals/detect-entry.js';

export default function plugin(api, options) {
  const { types: t, caller } = api;

  const typeResolvers = createResolveNodeType(node => node?.type, t);
  const { resolvePropertyObjectType, toHint } = typeResolvers;

  const { resolver, createDebugOutput } = createPolyfillResolver(options, {
    typeResolvers,
    isMemberLike: path => path.isMemberExpression() || path.isOptionalMemberExpression(),
    isCallee: (node, parent) => t.isCallExpression(parent, { callee: node })
      || t.isOptionalCallExpression(parent, { callee: node })
      || t.isNewExpression(parent, { callee: node }),
    isSpreadElement: node => t.isSpreadElement(node),
    getBabelTargets: typeof api.targets === 'function' ? () => api.targets() : null,
  });

  const { method, absoluteImports = false, importStyle: importStyleOption } = options;
  const { mode, pkg, getModulesForEntry, isEntryNeeded, getCoreJSEntry, resolveUsage, resolvePureOrGlobalFallback } = resolver;

  const {
    isInTypeAnnotation,
    deoptionalizeNode,
    normalizeOptionalChain,
    replaceInstanceLike,
    replaceCallWithSimple,
    resolveDestructuringObject,
    handleDestructuredProperty,
  } = createASTHelpers(t);

  const skipPolyfillableOptional = (node, scope) => isPolyfillableOptional(node, scope, babelAdapter, resolveBuiltIn);

  const isWebpack = caller?.(c => c?.name === 'babel-loader');

  let injector, importStyle, debugOutput;

  return {
    name: 'core-js@4',
    visitor: (() => {
      let skippedNodes = new WeakSet();
      let disabledLines = null;
      let skipFile;

      function isDisabled(node) {
        return skipFile || (disabledLines !== null && disabledLines.has(node.loc?.start.line));
      }

      const { injectModulesForEntry, injectModulesForModeEntry, outputDebug } = createModuleInjectors({
        mode,
        getModulesForEntry,
        getDebugOutput() { return debugOutput; },
        injectGlobal: moduleName => injector.addGlobalImport(moduleName),
      });

      function injectPureImport(entry, hint) {
        debugOutput?.add(entry);
        return injector.addPureImport(entry, hint);
      }

      function handleSymbolIterator(path) {
        if (path.node.computed) skippedNodes.add(path.node.property);
        const entry = resolveSymbolIteratorEntry(path.node, path.parent);
        if (!isEntryNeeded(entry)) return;
        const hint = entry === 'get-iterator' ? 'getIterator' : 'getIteratorMethod';
        const id = injectPureImport(entry, hint);
        if (entry === 'get-iterator') replaceCallWithSimple(path, id, skipPolyfillableOptional);
        else replaceInstanceLike(path, id, skipPolyfillableOptional);
      }

      function canTransformDestructuring(path) {
        const objectPattern = path.parentPath;
        const parent = objectPattern?.parentPath;
        if (!sharedCanTransformDestructuring({
          parentType: parent?.node?.type,
          parentInit: parent?.node?.init,
          grandParentType: parent?.parentPath?.parentPath?.node?.type,
          patternProperties: objectPattern?.node?.properties,
        })) return false;
        if (parent?.isAssignmentExpression() && !parent.parentPath?.isExpressionStatement()) return false;
        return true;
      }

      // parameter / IIFE destructure: rewrite `function({ from }) { ... }` to
      // `function({ from = _Array$from }) { ... }` so that on engines without `Array.from`
      // the destructure default kicks in and provides the polyfill.
      // only static/global polyfills can fit in a default value - instance methods need
      // a receiver (`_at(arr).call(arr, 0)` form) and cannot be substituted this way.
      // requiring `value` to be a plain Identifier rejects both user-supplied defaults
      // (AssignmentPattern) and nested patterns (Object/ArrayPattern) in one check.
      function handleParameterDestructure(prop, kind, entry, hintName) {
        if (kind === 'instance' || !t.isIdentifier(prop.node.value)) return;
        const id = injectPureImport(entry, hintName);
        prop.get('value').replaceWith(t.assignmentPattern(t.cloneNode(prop.node.value), t.cloneNode(id)));
        prop.node.shorthand = false;
      }

      // apply a resolved polyfill to an ObjectProperty path: dispatches to either the
      // function-parameter destructure path (`function({ from }) {}` form) or the regular
      // VariableDeclarator / AssignmentExpression destructure path.
      function handleObjectPropertyResult(prop, kind, entry, hintName) {
        const objectPattern = prop.parentPath;
        if (objectPattern?.parentPath?.isFunction()) {
          handleParameterDestructure(prop, kind, entry, hintName);
          return;
        }
        if (!canTransformDestructuring(prop)) return;
        let value;
        if (kind === 'instance') {
          const objectNode = resolveDestructuringObject(prop, toHint(resolvePropertyObjectType(prop)));
          if (!objectNode) return;
          value = t.callExpression(injectPureImport(entry, hintName), [t.cloneNode(objectNode)]);
        } else {
          value = injectPureImport(entry, hintName);
        }
        handleDestructuredProperty(prop, value);
        skipEmptyPatternInit(prop);
      }

      // after extracting a destructured property, if the pattern is now empty
      // (all properties polyfilled, no rest), skip the init node to prevent unused
      // constructor import (e.g., _Promise from { resolve } = Promise)
      function skipEmptyPatternInit(path) {
        const objectPattern = path.parentPath;
        if (objectPattern?.node?.properties?.length > 0) return;
        const parent = objectPattern.parentPath;
        const initNode = parent?.isVariableDeclarator() ? parent.node.init
          : parent?.isAssignmentExpression() ? parent.node.right : null;
        if (initNode) skippedNodes.add(initNode);
      }

      const usageGlobalCallback = createUsageGlobalCallback({
        resolveUsage,
        injectModulesForModeEntry,
        isDisabled,
      });

      // resolve `super.X` references inside a class method to a static-method meta on the
      // parent class. Returns null for unsupported cases (computed key, prototype super,
      // non-identifier extends clause, locally-shadowed parent name, etc.). Currently
      // static-only - instance super requires rewriting the receiver to `this`.
      function resolveSuperMember(path) {
        if (path.node.computed) return null;
        const key = path.node.property?.name;
        if (!key) return null;
        // walk up to the enclosing class method/property; bail if we hit a non-method function
        let methodPath = null;
        for (let cur = path.parentPath; cur; cur = cur.parentPath) {
          if (cur.isClassMethod() || cur.isClassPrivateMethod()
            || cur.isClassProperty() || cur.isClassPrivateProperty()) {
            methodPath = cur;
            break;
          }
          if (cur.isFunction()) return null;
        }
        if (!methodPath?.node.static) return null;
        // hasBinding() returns true for tracked globals, so check getBinding() for an actual
        // local declaration instead
        return buildSuperStaticMeta(methodPath.parentPath?.parentPath?.node, key,
          name => !!path.scope.getBinding(name));
      }

      function usagePureCallback(meta, path) {
        if (isDisabled(path.node)) return;
        if (skippedNodes.has(path.node)) return;
        // skip nodes with stale parent path (consumed by outer optional chain replacement)
        if (path.parentPath && !path.parentPath.container) return;
        if (isInTypeAnnotation(path)) return;

        if (meta.kind === 'in') {
          const symbolIn = resolveSymbolInEntry(meta.key);
          if (symbolIn && isEntryNeeded(symbolIn.entry)) {
            const id = injectPureImport(symbolIn.entry, symbolIn.hint);
            if (meta.key === 'Symbol.iterator') {
              path.replaceWith(t.callExpression(id, [path.node.right]));
            } else {
              path.get('left').replaceWith(id);
            }
          } else if (meta.object) {
            // 'from' in Array / 'Promise' in globalThis - replace with true if polyfillable
            const resolved = resolvePureOrGlobalFallback(meta, path);
            if (resolved.result) path.replaceWith(t.booleanLiteral(true));
          }
          return;
        }

        if (path.parentPath.isUnaryExpression({ operator: 'delete' })) return;

        if (meta.kind === 'property') {
          if (path.isObjectProperty()) {
            if (!t.isIdentifier(path.node.value) && !t.isAssignmentPattern(path.node.value)) return;
          } else {
            if (!path.isMemberExpression() && !path.isOptionalMemberExpression()) return;
            if (!path.isReferenced()) return;
            if (path.parentPath.isUpdateExpression()) return;
            if (t.isSuper(path.node.object)) {
              // resolve `super.X` to its parent class equivalent - currently static-only
              const superMeta = resolveSuperMember(path);
              if (!superMeta) return;
              meta = superMeta;
            }
            // skip instance method used as tagged template tag - replacing callee breaks `this` binding
            if (meta.placement === 'prototype'
              && path.parentPath.isTaggedTemplateExpression() && path.key === 'tag') return;
            if (meta.key === 'Symbol.iterator') return handleSymbolIterator(path);
          }
        }

        const { result, fallback } = resolvePureOrGlobalFallback(meta, path);
        if (fallback && (path.isMemberExpression() || path.isOptionalMemberExpression())) {
          const id = injectPureImport(fallback.entry, fallback.hintName);
          path.get('object').replaceWith(id);
          normalizeOptionalChain(path, true);
          return;
        }
        if (!result) return;

        const { entry, kind, hintName } = result;

        if (path.isObjectProperty()) {
          handleObjectPropertyResult(path, kind, entry, hintName);
        } else {
          const id = injectPureImport(entry, hintName);
          if (kind === 'instance') {
            replaceInstanceLike(path, id, skipPolyfillableOptional);
          } else {
            const wasOptional = path.node.optional;
            path.replaceWith(id);
            normalizeOptionalChain(path, !wasOptional);
            // the polyfill import is always defined - strip ?. on the direct parent if it
            // wasn't already handled by normalizeOptionalChain (globalThis?.Map?.() -> _Map())
            if (wasOptional && path.parentPath?.node?.optional) {
              deoptionalizeNode(path.parentPath);
            }
          }
        }
      }

      function entryGlobalCallback(source, path) {
        if (isDisabled(path.node)) return;
        if (!path.node.loc) return;
        debugOutput?.markEntryFound();
        const entry = getCoreJSEntry(source);
        if (entry === null) return;
        injectModulesForEntry(entry);
        path.remove();
      }

      const usageCallback = method === 'usage-pure' ? usagePureCallback : usageGlobalCallback;
      const helperVisitors = method !== 'entry-global' ? createUsageVisitors({
        onUsage: usageCallback, suppressProxyGlobals: method === 'usage-pure', walkAnnotations: false,
      }) : null;

      const programVisitor = {
        enter(path) {
          skipFile = !!path.hub.file.opts.filename && isCoreJSFile(path.hub.file.opts.filename);
          importStyle = importStyleOption ?? (path.node.sourceType === 'script' ? 'require' : 'import');
          injector = new ImportInjector({ t, programPath: path, pkg, mode, importStyle, absoluteImports });
          setActivePureImports(injector);
          skippedNodes = new WeakSet();
          debugOutput = createDebugOutput?.() ?? null;
          const { comments } = path.hub.file.ast;
          const directives = skipFile ? null : parseDisableDirectives(comments);
          if (directives === true) skipFile = true;
          disabledLines = directives !== true ? directives : null;
        },
        exit(path) {
          if (helperVisitors) {
            for (const childPath of path.get('body')) {
              if (!childPath.node.loc) childPath.traverse(helperVisitors);
            }
          }
          outputDebug();
          injector?.flush();
        },
      };

      // entry-global mode
      if (method === 'entry-global') {
        const entryVisitors = createEntryVisitors(entryGlobalCallback);
        return {
          Program: {
            enter(path) {
              programVisitor.enter(path);
              if (entryVisitors.Program) entryVisitors.Program(path);
            },
            exit() { outputDebug(); injector?.flush(); },
          },
          ImportDeclaration: entryVisitors.ImportDeclaration,
        };
      }

      const usageVisitors = createUsageVisitors({
        onUsage: usageCallback,
        suppressProxyGlobals: method === 'usage-pure',
        walkAnnotations: method !== 'usage-pure',
      });

      // usage-global mode
      if (method === 'usage-global') {
        const syntaxVisitors = createSyntaxVisitors({
          injectModulesForModeEntry,
          injectModulesForEntry,
          isDisabled,
          isWebpack,
        });
        return { Program: programVisitor, ...mergeVisitors(usageVisitors, syntaxVisitors) };
      }

      // usage-pure mode
      return { Program: programVisitor, ...usageVisitors };
    })(),
    post() {
      if (!injector) return;
      // when CJS transform runs after core-js plugin, newly inserted import declarations
      // may not get converted. Detect this and switch to require style for safety flush.
      if (importStyle === 'import' && !this.file.path.node.body.some(n => t.isImportDeclaration(n))) {
        injector.importStyle = 'require';
      }
      injector.flush();
    },
  };
}
