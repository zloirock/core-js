import {
  createClassHelpers,
  isCoreJSFile,
  mergeVisitors,
  parseDisableDirectives,
  TS_EXPR_WRAPPERS,
} from '@core-js/polyfill-provider/helpers';
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
import {
  createBabelAdapter,
  createSyntaxVisitors,
  createUsageVisitors,
  USAGE_VISITORS_RESET,
} from './internals/detect-usage.js';
import createEntryVisitors from './internals/detect-entry.js';

export default function plugin(api, options) {
  const { types: t, caller } = api;

  const typeResolvers = createResolveNodeType(node => node?.type, t);
  const { resolvePropertyObjectType, resolveNodeType, toHint } = typeResolvers;

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
    deferredSideEffects,
    deoptionalizeNode,
    normalizeOptionalChain,
    replaceInstanceLike,
    replaceCallWithSimple,
    resolveDestructuringObject,
    handleDestructuredProperty,
    unwrapTSExpressionParent,
  } = createASTHelpers(t);

  const isWebpack = caller?.(c => c?.name === 'babel-loader');

  let injector, importStyle, debugOutput;

  // per-plugin-instance adapter - closure reads current `injector` without module-level state
  const adapter = createBabelAdapter(() => injector);
  const skipPolyfillableOptional = (node, scope) => isPolyfillableOptional(node, scope, adapter, resolveBuiltIn);

  return {
    name: 'core-js@4',
    ...(() => {
      let skippedNodes = new WeakSet();
      let originalBodyNodes = new WeakSet();
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
        if (path.node.computed) {
          // skip all layers: TS wrappers, parens, and the inner MemberExpression
          let cur = path.node.property;
          while (cur) {
            skippedNodes.add(cur);
            if (TS_EXPR_WRAPPERS.has(cur.type) || cur.type === 'ParenthesizedExpression') cur = cur.expression;
            else break;
          }
        }
        // peel `arr[Symbol.iterator]!()` etc. so the call parent is recognised
        const callerPath = unwrapTSExpressionParent(path);
        const entry = resolveSymbolIteratorEntry(callerPath.node, callerPath.parent);
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

      // parameter / IIFE destructure: `function({ from }) {}` -> `function({ from = _Array$from }) {}`
      // only static/global polyfills fit in a default value; instance methods need a receiver
      // LIMITATION: the default only fires when `arg[key] === undefined`, so a present-but-buggy
      // native (e.g. `Array.from` failing SAFE_ITERATION_CLOSING) bypasses the polyfill
      function handleParameterDestructure(prop, kind, entry, hintName) {
        if (kind === 'instance' || !t.isIdentifier(prop.node.value)) return;
        const id = injectPureImport(entry, hintName);
        prop.get('value').replaceWith(t.assignmentPattern(t.cloneNode(prop.node.value), t.cloneNode(id)));
        prop.node.shorthand = false;
      }

      // apply a resolved polyfill to an ObjectProperty path: dispatches to either the
      // function-parameter destructure path (`function({ from }) {}` form) or the regular
      // VariableDeclarator / AssignmentExpression destructure path
      function handleObjectPropertyResult(prop, kind, entry, hintName) {
        const objectPattern = prop.parentPath;
        if (objectPattern?.parentPath?.isFunction()) {
          handleParameterDestructure(prop, kind, entry, hintName);
          return;
        }
        if (!canTransformDestructuring(prop)) return;
        // export + rest: skip - `_unused` rename would pollute the module's export namespace
        if (objectPattern.node.properties.some(p => p.type === 'RestElement' || p.type === 'SpreadElement')
          && objectPattern.parentPath?.isVariableDeclarator()
          && objectPattern.parentPath.parentPath?.parentPath?.isExportNamedDeclaration()) return;
        let value;
        if (kind === 'instance') {
          const objectNode = resolveDestructuringObject(prop, toHint(resolvePropertyObjectType(prop)));
          if (!objectNode) return;
          value = t.callExpression(injectPureImport(entry, hintName), [t.cloneNode(objectNode)]);
        } else {
          value = injectPureImport(entry, hintName);
        }
        // mark property as handled - rest-rename triggers re-traversal which must be skipped
        skippedNodes.add(prop.node);
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

      const { resolveSuperMember, isShadowedByClassOwnMember } = createClassHelpers(t);

      const usageGlobalCallback = createUsageGlobalCallback({
        resolveUsage,
        injectModulesForModeEntry,
        isDisabled,
        resolveSuperMember,
      });

      function isOrphaned(path) {
        const declarator = path.findParent(p => p.isVariableDeclarator());
        if (declarator) {
          const declaration = declarator.parentPath;
          if (declaration?.removed) return true;
          if (!declaration?.node?.declarations) return true;
          return !declaration.node.declarations.includes(declarator.node);
        }
        // assignment destructuring: ({ from } = Array || Promise)
        const assign = path.findParent(p => p.isAssignmentExpression());
        if (assign) {
          const stmt = assign.parentPath;
          return stmt?.isExpressionStatement() && stmt.node.expression !== assign.node;
        }
        return false;
      }

      function shouldSkipPath(path) {
        return isDisabled(path.node) || skippedNodes.has(path.node)
          || (path.parentPath && !path.parentPath.container) // stale parent
          || isOrphaned(path) || isInTypeAnnotation(path);
      }

      // super.method(args) / super.method!(args) / super.method?.(args) -> id.call(this, args)
      function replaceSuperStatic(path, id) {
        const callerPath = unwrapTSExpressionParent(path);
        const callParent = callerPath.parentPath;
        if ((callParent?.isCallExpression() || callParent?.isOptionalCallExpression())
          && callParent.node.callee === callerPath.node) {
          callParent.replaceWith(
            t.callExpression(t.memberExpression(id, t.identifier('call')),
              [t.thisExpression(), ...callParent.node.arguments.map(a => t.cloneNode(a))]),
          );
        } else {
          unwrapTSExpressionParent(path).replaceWith(id);
        }
      }

      // stash return type on CallExpression before callee replacement so downstream
      // resolveNodeType can still determine e.g. Promise.all -> Array
      function annotateCallReturnType(path) {
        const callerPath = unwrapTSExpressionParent(path);
        const callParent = callerPath.parentPath;
        if (!(callParent?.isCallExpression() || callParent?.isOptionalCallExpression())
          || callerPath.parent.callee !== callerPath.node) return;
        const hint = toHint(resolveNodeType(callParent));
        if (hint) callParent.node.coreJSResolvedType = hint;
      }

      // extends clause replaced by polyfill import (_Promise): resolve back to original global
      function resolveSuperImportName(superMeta) {
        if (!superMeta.object) return;
        const imp = injector.getPureImport(superMeta.object);
        if (imp) superMeta.object = imp.hint;
      }

      // eslint-disable-next-line max-statements -- ok
      function usagePureCallback(meta, path) {
        if (shouldSkipPath(path)) return;

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

        // walk past TS wrappers to detect `delete obj.at!` / `delete (obj.at as any)`
        if (unwrapTSExpressionParent(path).parentPath?.isUnaryExpression({ operator: 'delete' })) return;

        if (meta.kind === 'property') {
          if (path.isObjectProperty()) {
            if (!t.isIdentifier(path.node.value) && !t.isAssignmentPattern(path.node.value)) return;
          } else {
            if (!path.isMemberExpression() && !path.isOptionalMemberExpression()) return;
            // `path.isReferenced()` drops grandparent - pass it explicitly
            if (!t.isReferenced(path.node, path.parent, path.parentPath?.parent)) return;
            // `t.isReferenced` also lacks for-of/in LHS - check explicitly
            const { parent } = path;
            if ((parent.type === 'ForOfStatement' || parent.type === 'ForInStatement')
              && parent.left === path.node) return;
            if (unwrapTSExpressionParent(path).parentPath?.isUpdateExpression()) return;
            if (t.isSuper(path.node.object)) {
              const superMeta = resolveSuperMember(path);
              if (!superMeta) return;
              // extends clause may already be replaced by a polyfill import (_Promise) -
              // resolve back to the original global via the injector
              resolveSuperImportName(superMeta);
              meta = superMeta;
            }
            // `this.X` inside a class that defines its own `X` member - polyfill would
            // bypass the user's override (e.g. `class C extends Array { at() {} foo() { this.at(0) } }`)
            if (t.isThisExpression(path.node.object) && isShadowedByClassOwnMember(path, meta.key)) return;
            // skip instance method used as tagged template tag - replacing callee breaks `this` binding
            if (meta.placement === 'prototype'
              && path.parentPath.isTaggedTemplateExpression() && path.key === 'tag') return;
            if (meta.key === 'Symbol.iterator') return handleSymbolIterator(path);
          }
        }

        const { result, fallback } = resolvePureOrGlobalFallback(meta, path);
        if (fallback && (path.isMemberExpression() || path.isOptionalMemberExpression())
          && !t.isSuper(path.node.object)) {
          const id = injectPureImport(fallback.entry, fallback.hintName);
          path.get('object').replaceWith(id);
          normalizeOptionalChain(path, true);
          return;
        }
        if (!result) {
          // [Symbol.iterator] in destructuring: resolve returns null, use getIteratorMethod
          if (path.isObjectProperty() && path.node.computed && meta.key === 'Symbol.iterator') {
            handleObjectPropertyResult(path, 'instance', 'get-iterator-method', 'getIteratorMethod');
          }
          return;
        }

        const { entry, kind, hintName } = result;

        if (path.isObjectProperty()) {
          if (!meta.fromFallback) handleObjectPropertyResult(path, kind, entry, hintName);
        } else {
          const id = injectPureImport(entry, hintName);
          if (kind === 'instance') {
            replaceInstanceLike(path, id, skipPolyfillableOptional);
          } else if (t.isSuper(path.node.object)) {
            replaceSuperStatic(path, id);
          } else {
            const wasOptional = (annotateCallReturnType(path), path.node.optional);
            const replacePath = unwrapTSExpressionParent(path);
            replacePath.replaceWith(id);
            normalizeOptionalChain(replacePath, !wasOptional);
            if (wasOptional && replacePath.parentPath?.node?.optional) {
              deoptionalizeNode(replacePath.parentPath);
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
        onUsage: usageCallback, adapter, suppressProxyGlobals: method === 'usage-pure', walkAnnotations: false,
      }) : null;

      // --- init: per-file state reset ---

      function initFile(path) {
        skipFile = !!path.hub.file.opts.filename && isCoreJSFile(path.hub.file.opts.filename);
        importStyle = importStyleOption ?? (path.node.sourceType === 'script' ? 'require' : 'import');
        injector = new ImportInjector({ t, programPath: path, pkg, mode, importStyle, absoluteImports });
        skippedNodes = new WeakSet();
        originalBodyNodes = new WeakSet(path.node.body);
        deferredSideEffects.length = 0;
        helperVisitors?.[USAGE_VISITORS_RESET]?.();
        debugOutput = createDebugOutput?.() ?? null;
        const { comments } = path.hub.file.ast;
        const directives = skipFile ? null : parseDisableDirectives(comments, undefined, path.node.body[0]?.start);
        if (directives === true) skipFile = true;
        disabledLines = directives !== true ? directives : null;
      }

      // --- deferred side effects: splice into body, re-traverse for polyfills ---

      function processDeferredSideEffects(path) {
        if (!deferredSideEffects.length) return;
        const inserted = new Set();
        deferredSideEffects.sort((a, b) => b.index - a.index || b.seq - a.seq);
        for (const { body, index, node } of deferredSideEffects) {
          (Array.isArray(body) ? body : path.node.body).splice(index, 0, node);
          inserted.add(node);
        }
        deferredSideEffects.length = 0;
        if (helperVisitors) {
          path.traverse({
            ExpressionStatement(p) {
              if (inserted.delete(p.node)) {
                p.traverse(helperVisitors);
                if (!inserted.size) p.stop();
              }
            },
          });
        }
      }

      // --- pre(): main traverse before other plugins (TS types alive, destructuring intact) ---

      function preTraverse(path, visitors) {
        initFile(path);
        if (skipFile) return;
        path.traverse(visitors);
        processDeferredSideEffects(path);
        injector?.flush();
      }

      // --- Program.exit ---

      function isUpdateTarget(idPath) {
        let check = idPath.parentPath;
        while (check && TS_EXPR_WRAPPERS.has(check.node?.type)) check = check.parentPath;
        return check?.isUpdateExpression();
      }

      function programExit(path) {
        if (!helperVisitors) return;
        // re-traverse new body nodes (helpers from class/spread/destructuring transforms)
        for (const childPath of path.get('body')) {
          if (!originalBodyNodes.has(childPath.node)) childPath.traverse(helperVisitors);
        }
        // usage-pure: sibling plugins (regenerator) may mutate original nodes in-place,
        // injecting raw globals (Promise). scan for unbound global Identifiers only —
        // MemberExpression would double-process already-polyfilled chains.
        // usage-global doesn't need this — globals stay as-is, imports from pre() suffice
        if (method === 'usage-pure') {
          path.traverse({
            Identifier(idPath) {
              if (!idPath.isReferencedIdentifier()) return;
              if (idPath.scope.getBindingIdentifier(idPath.node.name)) return;
              if (isUpdateTarget(idPath)) return;
              usageCallback({ kind: 'global', name: idPath.node.name }, idPath);
            },
          });
        }
        injector?.flush();
        outputDebug();
      }

      // --- post(): detect sibling CJS transform ---

      function postHook() {
        if (!injector) return;
        if (importStyleOption === undefined && importStyle === 'import'
          && !this.file.path.node.body.some(n => t.isImportDeclaration(n))) {
          injector.importStyle = 'require';
        }
        injector.flush();
      }

      // --- mode-specific plugin objects ---

      const isPure = method === 'usage-pure';

      if (method === 'entry-global') {
        const entryVisitors = createEntryVisitors(entryGlobalCallback);
        return {
          pre() {
            initFile(this.file.path);
            if (!skipFile) {
              if (entryVisitors.Program) entryVisitors.Program(this.file.path);
              this.file.path.traverse({ ImportDeclaration: entryVisitors.ImportDeclaration });
            }
            injector?.flush();
          },
          visitor: {},
          post() { injector?.flush(); outputDebug(); },
        };
      }

      const usageVisitors = createUsageVisitors({
        onUsage: usageCallback, adapter, suppressProxyGlobals: isPure,
        walkAnnotations: !isPure,
      });

      if (!isPure) {
        const syntaxVisitors = createSyntaxVisitors({
          injectModulesForModeEntry, injectModulesForEntry, isDisabled, isWebpack,
        });
        return {
          pre() { preTraverse(this.file.path, mergeVisitors(usageVisitors, syntaxVisitors)); },
          visitor: { Program: { exit: programExit } },
          post: postHook,
        };
      }

      return {
        pre() {
          preTraverse(this.file.path, {
            ...usageVisitors,
            CatchClause(path) {
              const { param } = path.node;
              if (!param || (param.type !== 'ObjectPattern' && param.type !== 'ArrayPattern')) return;
              const props = param.properties || param.elements;
              if (!props || props.length === 0) return;
              const ref = path.scope.generateUidIdentifier('ref');
              path.get('body').unshiftContainer('body', [
                t.variableDeclaration('let', [t.variableDeclarator(param, ref)]),
              ]);
              path.node.param = ref;
            },
          });
        },
        visitor: { Program: { exit: programExit } },
        post: postHook,
      };
    })(),
  };
}
