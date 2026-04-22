import {
  createClassHelpers,
  detectCommonJS,
  hasTopLevelESM,
  isCoreJSFile,
  isDeleteTarget,
  isForXWriteTarget,
  isFunctionParamDestructureParent,
  isTSTypeOnlyIdentifier,
  isTaggedTemplateTag,
  isUpdateTarget as isUpdateParent,
  mergeVisitors,
  parseDisableDirectives,
  resolveSuperImportName,
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
  patternBindingName,
  scanExistingCoreJSImports,
} from '@core-js/polyfill-provider/detect-usage';
import { resolve as resolveBuiltIn } from '@core-js/polyfill-provider';
import createASTHelpers from './internals/babel-compat.js';
import ImportInjector from './internals/import-injector.js';
import {
  createBabelAdapter,
  createSyntaxVisitors,
  createUsageVisitors,
  USAGE_VISITORS_IS_HANDLED,
  USAGE_VISITORS_RESET,
} from './internals/detect-usage.js';
import createEntryVisitors from './internals/detect-entry.js';

export default function plugin(api, options) {
  const { types: t, caller } = api;

  const typeResolvers = createResolveNodeType(node => node?.type, t);
  const { resolvePropertyObjectType, resolveNodeType, toHint } = typeResolvers;

  const { resolver, createDebugOutput } = createPolyfillResolver(options, {
    typeResolvers,
    astPredicates: {
      isMemberLike: path => path.isMemberExpression() || path.isOptionalMemberExpression(),
      isCallee: (node, parent) => t.isCallExpression(parent, { callee: node })
        || t.isOptionalCallExpression(parent, { callee: node })
        || t.isNewExpression(parent, { callee: node }),
      isSpreadElement: node => t.isSpreadElement(node),
    },
    getBabelTargets: typeof api.targets === 'function' ? () => api.targets() : null,
  });

  const { method, absoluteImports = false, importStyle: importStyleOption } = options;
  const {
    getCoreJSEntry,
    getModulesForEntry,
    isEntryNeeded,
    mode,
    packages,
    pkg,
    resolvePureOrGlobalFallback,
    resolveUsage,
  } = resolver;

  let injector, importStyle, debugOutput;

  const {
    isInTypeAnnotation,
    deferredSideEffects,
    deoptionalizeNode,
    normalizeOptionalChain,
    replaceInstanceLike,
    replaceInstanceChainCombined,
    replaceCallWithSimple,
    resolveDestructuringObject,
    handleDestructuredProperty,
    unwrapTSExpressionParent,
    reset: resetASTHelpers,
  } = createASTHelpers(t, { getInjector: () => injector });

  const isWebpack = caller?.(c => c?.name === 'babel-loader');

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
      // receiver -> `{p: _polyfill, q: R.q, ...}` synth-swap targets, deferred to programExit
      // so every sibling prop visits against the ORIGINAL receiver first (mid-visit swap
      // would route later siblings to the partial synth and miss their polyfill). populated
      // from two shapes - param-default `function({p} = R)` and arrow IIFE `(({p}) => ...)(R)`
      let synthSwapByReceiver = new WeakMap();
      let pendingSynthSwaps = [];

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

      // wrap a polyfill id in a SequenceExpression preserving side effects collected from
      // the receiver / computed-key. noop when `sideEffects` is empty or absent - emission
      // sites can call unconditionally
      function withSideEffects(id, sideEffects) {
        return sideEffects?.length
          ? t.sequenceExpression([...sideEffects.map(e => t.cloneNode(e)), id])
          : id;
      }

      function handleSymbolIterator(path) {
        // polyfill helper loses `super`-binding (reads ancestor prototype's iterator, not
        // current class's); let the native runtime form stand for `super[Symbol.iterator]`
        if (t.isSuper(path.node.object)) return;
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
        const parent = path.parentPath?.parentPath;
        if (!sharedCanTransformDestructuring({
          parentType: parent?.node?.type,
          parentInit: parent?.node?.init,
          grandParentType: parent?.parentPath?.parentPath?.node?.type,
        })) return false;
        if (parent?.isAssignmentExpression() && !parent.parentPath?.isExpressionStatement()) return false;
        return true;
      }

      // inline-default `{ p = _polyfill }` - only fires on undefined property. used when
      // synth-swap can't run (complex receiver, rest element, no default wrapper): it misses
      // the buggy-present native case, but preserves receiver evaluation semantics
      function emitParamInlineDefault(prop, id) {
        prop.get('value').replaceWith(t.assignmentPattern(t.cloneNode(prop.node.value), t.cloneNode(id)));
        prop.node.shorthand = false;
      }

      // find the NodePath of the call-arg a bare-ObjectPattern IIFE param resolves to.
      // arrow-only on purpose - FunctionExpression IIFE would leak the synth into
      // `arguments[i]`; arrow has no own `arguments` binding. expands inline-array spreads
      // (`...[R]`) the same way `resolveCallArgument` does; non-literal spread returns null
      function detectIifeArgPath(wrapper, objectPattern) {
        if (!wrapper?.isArrowFunctionExpression()) return null;
        const paramIndex = wrapper.node.params.indexOf(objectPattern.node);
        if (paramIndex === -1) return null;
        let callPath = wrapper.parentPath;
        while (callPath?.isUnaryExpression() || callPath?.isSequenceExpression()) {
          callPath = callPath.parentPath;
        }
        if (!callPath?.isCallExpression() && !callPath?.isNewExpression()) return null;
        let i = 0;
        for (const aP of callPath.get('arguments')) {
          if (aP.isSpreadElement()) {
            if (!aP.get('argument').isArrayExpression()) return null;
            for (const elP of aP.get('argument').get('elements')) {
              if (i === paramIndex) return elP;
              i++;
            }
            continue;
          }
          if (i === paramIndex) return aP;
          i++;
        }
        return null;
      }

      // NodePath whose `.node` becomes the synth object; null means inline-default fallback.
      // handles `function({p} = R)` (wrapper.right) and arrow IIFE `(({p}) => body)(R)`
      // (call-arg path, expanding inline-array spreads)
      function findSynthSwapTargetPath(wrapper, objectPattern) {
        if (objectPattern.node.properties.some(p => t.isRestElement(p))) return null;
        if (wrapper?.isAssignmentPattern() && t.isIdentifier(wrapper.node.right)) {
          return wrapper.get('right');
        }
        const argPath = detectIifeArgPath(wrapper, objectPattern);
        return argPath && t.isIdentifier(argPath.node) ? argPath : null;
      }

      // parameter destructure polyfill. only static/global fit here; instance methods need a
      // receiver. synth-swap when `findSynthSwapTargetPath` identifies a safe Identifier
      // receiver; otherwise inline-default `{p = _polyfill}` (fires only on undefined property)
      function handleParameterDestructure(prop, kind, entry, hintName) {
        if (kind === 'instance' || !t.isIdentifier(prop.node.value)) return;
        if (prop.node.computed || !t.isIdentifier(prop.node.key)) return;
        const id = injectPureImport(entry, hintName);
        const objectPattern = prop.parentPath;
        const targetPath = findSynthSwapTargetPath(objectPattern?.parentPath, objectPattern);
        if (!targetPath) {
          emitParamInlineDefault(prop, id);
          return;
        }
        const receiver = targetPath.node;
        let pending = synthSwapByReceiver.get(receiver);
        if (!pending) {
          pending = { targetPath, objectPatternNode: objectPattern.node, polyfills: new Map() };
          synthSwapByReceiver.set(receiver, pending);
          pendingSynthSwaps.push(pending);
        }
        pending.polyfills.set(prop.node.key.name, id);
      }

      // `const { Array: { from } } = globalThis` -> `const from = _Array$from`.
      // non-Identifier inner value / AssignmentPattern default fall back to the param-default
      // path - those can't be trivially flattened
      function tryFlattenNestedProxyDestructure(prop, entry, hintName) {
        if (!t.isIdentifier(prop.node.value)) return false;
        const innerPattern = prop.parentPath;
        const outerProp = innerPattern.parentPath;
        const outerPattern = outerProp?.parentPath;
        const declarator = outerPattern?.parentPath;
        if (!declarator?.isVariableDeclarator()) return false;
        const declaration = declarator.parentPath;
        const declCount = declaration.node?.declarations?.length ?? 1;
        const id = injectPureImport(entry, hintName);
        const extractedDeclarator = t.variableDeclarator(t.cloneNode(prop.node.value), t.cloneNode(id));
        const wasLastInner = innerPattern.node.properties.length === 1;
        const wasLastOuter = outerPattern.node.properties.length === 1;
        const willRemoveDeclarator = wasLastInner && wasLastOuter;
        // seed skippedNodes for the subtree about to be orphaned so scheduled visitor
        // re-entries short-circuit; handleIdentifier's `!path.parent` guard backs this up
        const skipSubtree = willRemoveDeclarator ? declarator.node : prop.node;
        t.traverseFast(skipSubtree, node => { skippedNodes.add(node); });
        // single-declarator simple-chain: replaceWith preserves leading comments
        if (willRemoveDeclarator && declCount === 1) {
          declaration.replaceWith(t.variableDeclaration(declaration.node.kind, [extractedDeclarator]));
          return true;
        }
        // declarator-level insert in for-init keeps loop-header shape; declaration-level
        // insert would wrap for-init in an arrow-IIFE and duplicate the bound name inside
        const isForInit = declaration.parentPath?.isForStatement()
          && declaration.parentPath.node.init === declaration.node;
        if (isForInit) declarator.insertBefore(extractedDeclarator);
        else declaration.insertBefore(t.variableDeclaration(declaration.node.kind, [extractedDeclarator]));
        // splice out the emptied declarator in-place; `.remove()` mid-traversal nulls
        // path.parent and crashes babel's virtual-type filter on queued inner Identifiers
        if (willRemoveDeclarator && declCount > 1) {
          const idx = declaration.node.declarations.indexOf(declarator.node);
          if (idx !== -1) declaration.node.declarations.splice(idx, 1);
          return true;
        }
        // partial: prune the consumed property; outer prop drops too if its inner pattern emptied
        prop.remove();
        if (wasLastInner) outerProp.remove();
        return true;
      }

      // apply a resolved polyfill to an ObjectProperty path: dispatches to either the
      // function-parameter destructure path (`function({ from }) {}` form) or the regular
      // VariableDeclarator / AssignmentExpression destructure path
      function handleObjectPropertyResult(prop, kind, entry, hintName) {
        const objectPattern = prop.parentPath;
        const patternParent = objectPattern?.parentPath;
        if (isFunctionParamDestructureParent(patternParent?.node, patternParent?.parentPath?.node, objectPattern?.node)) {
          handleParameterDestructure(prop, kind, entry, hintName);
          return;
        }
        // nested proxy-global destructure: `{ Array: { from } } = globalThis`. default
        // (`from = _Array$from`) wouldn't fire - `globalThis.Array` is always present and
        // `Array.from` is non-undefined on every engine we target (may just be buggy).
        // flatten the outer structure when it's a single-nested shape: replace the whole
        // VariableDeclarator with `const from = _Array$from` so the polyfill ALWAYS wins
        if (patternParent?.isObjectProperty() && kind !== 'instance') {
          if (tryFlattenNestedProxyDestructure(prop, entry, hintName)) return;
          // fallback: non-single shape (outer has siblings) - inline default as last resort
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
        // proxy-global alias (`{ Symbol: S = default } = globalThis`): AST mutation below
        // rewrites init to `_Symbol === void 0 ? default : _Symbol` - `resolveBindingToGlobal`
        // can't walk that ConditionalExpression, so register S -> 'Symbol' up front
        if (kind === 'global') {
          const localName = patternBindingName(prop.node.value);
          if (localName) injector.registerGlobalAlias(localName, hintName);
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

      const {
        resolveSuperMember,
        resolveStaticInheritedMember,
        isInheritedStaticLookup,
        isShadowedByClassOwnMember,
        reset: resetClassHelpers,
      } = createClassHelpers(t, adapter);

      const usageGlobalCallback = createUsageGlobalCallback({
        resolveUsage,
        injectModulesForModeEntry,
        isDisabled,
        resolveSuperMember,
      });

      // any detached ancestor puts our node outside the live AST - polyfill emission
      // would land nowhere. verify each link still occupies its prior position in the parent
      // via direct index lookup (`parent[listKey][key]`); avoids the O(N) `list.includes`
      // per ancestor that ballooned into O(depth×width) on deep member-chains in large files
      function isOrphaned(path) {
        for (let cur = path; cur?.parentPath; cur = cur.parentPath) {
          if (cur.removed) return true;
          const parentNode = cur.parentPath.node;
          if (!parentNode) return true;
          const slot = cur.listKey ? parentNode[cur.listKey]?.[cur.key] : parentNode[cur.key];
          if (slot !== cur.node) return true;
        }
        return false;
      }

      function shouldSkipPath(path) {
        return isDisabled(path.node) || skippedNodes.has(path.node)
          || (path.parentPath && !path.parentPath.container) // stale parent
          || isOrphaned(path) || isInTypeAnnotation(path);
      }

      // detect `(recv)?.inner?.(args).outer(args)` with polyfillable instance inner+outer;
      // resolve inner via callee path so `[].at` -> `_atMaybeArray` (not generic `_at`)
      function findInnerPolyChain(path) {
        if (!path.isOptionalMemberExpression()) return null;
        const outerCaller = unwrapTSExpressionParent(path);
        const outerCall = outerCaller.parent;
        if (!t.isCallExpression(outerCall) && !t.isOptionalCallExpression(outerCall)) return null;
        if (outerCall.callee !== outerCaller.node) return null;
        // rare but possible wrappers: ParenthesizedExpression (babel's
        // `createParenthesizedExpressions: true`) and ChainExpression (ESTree shape);
        // unwrap both or `(arr)?.at?.(0)` / `(arr?.at?.(0))` miss the inner-chain match
        const unwrap = p => {
          while (p.node && (TS_EXPR_WRAPPERS.has(p.node.type)
            || p.node.type === 'ChainExpression' || p.node.type === 'ParenthesizedExpression')) {
            p = p.get('expression');
          }
          return p;
        };
        let current = unwrap(path.get('object'));
        while (current.isOptionalMemberExpression() || current.isOptionalCallExpression()) {
          if (current.node.optional) break;
          current = unwrap(current.isOptionalMemberExpression() ? current.get('object') : current.get('callee'));
        }
        if (!current.isOptionalCallExpression() || !current.node.optional) return null;
        const callee = current.get('callee');
        const calleeNode = callee.node;
        if (calleeNode?.type !== 'MemberExpression' && calleeNode?.type !== 'OptionalMemberExpression') return null;
        if (calleeNode.computed || calleeNode.property?.type !== 'Identifier') return null;
        const meta = { kind: 'property', object: null, key: calleeNode.property.name, placement: 'prototype' };
        const { result } = resolvePureOrGlobalFallback(meta, callee);
        if (result?.kind !== 'instance') return null;
        return {
          innerCallee: calleeNode,
          innerArgs: current.node.arguments,
          innerEntry: result.entry,
          innerHintName: result.hintName,
        };
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

      // eslint-disable-next-line max-statements -- ok
      function usagePureCallback(meta, path) {
        if (shouldSkipPath(path)) return;
        // JSX tag reaches here via ReferencedIdentifier; a JSX slot cannot host a renamed
        // Identifier, and `<_Map/>` would call the polyfill as a React component at runtime
        if (path.node.type === 'JSXIdentifier') return;

        if (meta.kind === 'in') {
          // symbol-sourced LHS (`Symbol.X in obj` / alias binding) takes the symbol-in
          // polyfill path; string-sourced LHS (`'Symbol.X' in Obj`) falls through to the
          // string-key lookup and emits `true` only if the static table matches the literal
          const symbolIn = meta.symbolSourced ? resolveSymbolInEntry(meta.key) : null;
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
        if (isDeleteTarget(unwrapTSExpressionParent(path).parentPath?.node)) return;

        if (meta.kind === 'property') {
          if (path.isObjectProperty()) {
            if (!t.isIdentifier(path.node.value) && !t.isAssignmentPattern(path.node.value)) return;
          } else {
            if (!path.isMemberExpression() && !path.isOptionalMemberExpression()) return;
            // `path.isReferenced()` drops grandparent - pass it explicitly
            if (!t.isReferenced(path.node, path.parent, path.parentPath?.parent)) return;
            if (isForXWriteTarget(path)) return;
            if (isUpdateParent(unwrapTSExpressionParent(path).parentPath?.node)) return;
            // shadow check for `this.X` - polyfill would bypass the user's own member
            // (e.g. `class C extends Array { at() {} foo() { this.at(0) } }`)
            if (t.isThisExpression(path.node.object) && isShadowedByClassOwnMember(path, meta.key)) return;
            // `super.X` and unshadowed `this.X` in static ctx resolve against the super
            // class's static surface via the same path - `this` in static ctx is the
            // constructor, so inherited static lookup behaves exactly like `super.X`
            if (isInheritedStaticLookup(path)) {
              const inheritedMeta = resolveStaticInheritedMember(path);
              if (!inheritedMeta) return;
              // `extends MyPromise` (user-aliased pure import) - map binding to global hint
              meta = resolveSuperImportName(injector, inheritedMeta);
            }
            if (isTaggedTemplateTag(path.parent, path.node, meta.placement) && path.key === 'tag') return;
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
          // inherited-static lookup (`super.X` / `this.X` in static ctx) where X has no static
          // on the super class - resolve() falls back to instance. for super: syntactically
          // invalid. for `this` in static ctx: `this` is the constructor, not an instance;
          // `_at(this)` would treat the class as an array. either way, bail
          if (kind === 'instance' && isInheritedStaticLookup(path)) return;
          const id = injectPureImport(entry, hintName);
          if (kind === 'instance') {
            const innerChain = findInnerPolyChain(path);
            if (innerChain) {
              const innerId = injectPureImport(innerChain.innerEntry, innerChain.innerHintName);
              // skip inner callee + descendants: traversal already queued identifier visits
              // for `.object` / TS wrappers; those siblings would allocate a dead `_ref` via
              // extractCheck even after the callee itself is marked. traverseFast covers
              // arbitrary depth (parens, `foo as any`, nested member chains)
              t.traverseFast(innerChain.innerCallee, node => { skippedNodes.add(node); });
              replaceInstanceChainCombined(path, id, { ...innerChain, innerId });
              return;
            }
            replaceInstanceLike(path, id, skipPolyfillableOptional);
          } else if (t.isSuper(path.node.object)) {
            replaceSuperStatic(path, id);
          } else {
            const wasOptional = (annotateCallReturnType(path), path.node.optional);
            const replacePath = unwrapTSExpressionParent(path);
            // `Symbol[(fn(), 'iterator')]` / `(fn(), Array).from(x)` - preserve fn() via
            // SequenceExpression wrap since the MemberExpression replacement discards its
            // receiver/computed-key subtree
            replacePath.replaceWith(withSideEffects(id, meta.sideEffects));
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
        const entry = getCoreJSEntry(source);
        if (entry === null) return;
        // `createEntryVisitors` hands us every specifier-less import; mark only actual
        // core-js entries so `import 'lodash'` doesn't mask "entry not found"
        debugOutput?.markEntryFound();
        injectModulesForEntry(entry);
        path.remove();
      }

      const isPure = method === 'usage-pure';
      const usageCallback = isPure ? usagePureCallback : usageGlobalCallback;
      const commonVisitorOptions = { adapter, onUsage: usageCallback, onWarning: message => debugOutput?.warn(message) };
      const usageVisitors = method !== 'entry-global' ? createUsageVisitors({
        ...commonVisitorOptions,
        suppressProxyGlobals: isPure,
        walkAnnotations: !isPure,
      }) : null;
      // usage-pure already has walkAnnotations=false, matching the helper-pass config;
      // usage-global diverges (annotations needed for usage, not helpers) and needs its own
      const helperVisitors = isPure ? usageVisitors
        : method !== 'entry-global' ? createUsageVisitors({
          ...commonVisitorOptions,
          suppressProxyGlobals: false,
          walkAnnotations: false,
        }) : null;

      // --- init: per-file state reset ---

      function initFile(path) {
        const isInternalCoreJS = !!path.hub.file.opts.filename && isCoreJSFile(path.hub.file.opts.filename);
        // source wins over sourceType: CJS-assign at top level of a `sourceType: "module"` file
        // would otherwise produce mixed `import` + `module.exports` output
        importStyle = importStyleOption ?? (!hasTopLevelESM(path.node)
          && (path.node.sourceType === 'script' || detectCommonJS(path.node)) ? 'require' : 'import');
        injector = new ImportInjector({ t, programPath: path, pkg, mode, importStyle, absoluteImports });
        skippedNodes = new WeakSet();
        synthSwapByReceiver = new WeakMap();
        pendingSynthSwaps = [];
        // drop per-file AST-keyed caches so memory is deterministic under long-running
        // dev-server / HMR (WeakMap would eventually GC, but this makes the bound explicit)
        typeResolvers.reset();
        resetASTHelpers();
        resetClassHelpers();
        // usage-pure shares one visitor instance (commonVisitorOptions match), reset skips dupe
        usageVisitors?.[USAGE_VISITORS_RESET]?.();
        if (helperVisitors && helperVisitors !== usageVisitors) helperVisitors[USAGE_VISITORS_RESET]?.();
        debugOutput = createDebugOutput?.() ?? null;
        const { comments } = path.hub.file.ast;
        // babel lifts directives into Program.directives, so body[0] is already post-prologue.
        // `directives === true` signals `disable-file` - collapse both skip sources into one write
        const directives = isInternalCoreJS ? null : parseDisableDirectives(comments, undefined, path.node.body[0]?.start, path.node);
        const fileDisabled = directives === true;
        skipFile = isInternalCoreJS || fileDisabled;
        disabledLines = fileDisabled ? null : directives;
        // entry-global handles re-emit via detectEntries
        if (!skipFile && method !== 'entry-global') {
          const removed = new Set();
          scanExistingCoreJSImports(path.node, {
            packages, pkg, mode, adapter,
            // `addGlobalImport`, not `registerUserGlobalImport` - source is about to be
            // removed, so the dedup filter must not suppress re-emit
            onGlobalImport: (mod, node) => {
              injector.addGlobalImport(mod);
              removed.add(node);
            },
            onPureImport: (entry, name) => injector.registerUserPureImport(entry, name),
          });
          if (removed.size) {
            for (const stmt of path.get('body')) {
              if (removed.has(stmt.node)) stmt.remove();
            }
          }
        }
        // snapshot after user-core-js removal so programExit's re-traverse only hits
        // bodies that existed at visit time - injector.flush()ed imports stay excluded
        originalBodyNodes = new WeakSet(path.node.body);
      }

      // --- deferred side effects: splice into body, re-traverse for polyfills ---

      // descending `index` so later splices don't shift earlier ones in the same body;
      // descending `seq` breaks ties deterministically (later-generated first)
      const batchOrder = (a, b) => b.index - a.index || b.seq - a.seq;

      // re-traversing an inserted SE can itself trigger `deferSideEffect` (nested destructuring
      // inside the lifted SE, e.g. `const { of } = (innerCall(), Array)` in an arrow body).
      // loop until the queue stays empty so nothing is silently dropped; termination is
      // guaranteed by bounded AST depth - each iteration processes a deeper level
      function processDeferredSideEffects(path) {
        while (deferredSideEffects.length) {
          const batch = deferredSideEffects.splice(0).sort(batchOrder);
          const inserted = new Set();
          for (const { body, index, node } of batch) {
            body.splice(index, 0, node);
            inserted.add(node);
          }
          if (!helperVisitors) continue;
          path.traverse({
            ExpressionStatement(p) {
              if (!inserted.delete(p.node)) return;
              p.traverse(helperVisitors);
              if (!inserted.size) p.stop();
            },
          });
        }
      }

      // --- pre(): main traverse before other plugins (TS types alive, destructuring intact) ---

      function preTraverse(path, visitors) {
        // defensive - sibling plugin may have destroyed Program before our pre fires
        if (!path?.node) return;
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
        return isUpdateParent(check?.node);
      }

      function programExit(path) {
        if (!helperVisitors) return;
        // re-traverse new body nodes (helpers from class/spread/destructuring transforms)
        for (const childPath of path.get('body')) {
          if (!originalBodyNodes.has(childPath.node)) childPath.traverse(helperVisitors);
        }
        // usage-pure: sibling plugins (regenerator) may mutate original nodes in-place,
        // injecting raw globals (Promise). scan for unbound global Identifiers only -
        // MemberExpression would double-process already-polyfilled chains.
        // usage-global doesn't need this - globals stay as-is, imports from pre() suffice
        if (method === 'usage-pure') {
          const isHandled = usageVisitors?.[USAGE_VISITORS_IS_HANDLED];
          path.traverse({
            Identifier(idPath) {
              if (!idPath.isReferencedIdentifier()) return;
              if (idPath.scope.getBindingIdentifier(idPath.node.name)) return;
              if (isUpdateTarget(idPath)) return;
              // same predicate as the primary visitor - skip disabled / type-annotation /
              // delete-target positions so this sweep doesn't overrule their exclusions
              if (shouldSkipPath(idPath)) return;
              // mirror `handleIdentifier` - TS type-only positions never need a polyfill
              if (isTSTypeOnlyIdentifier(idPath.parent, idPath.key)) return;
              // see `handleBinaryIn` - already covered by the outer BinaryExpression rewrite
              if (isHandled?.(idPath.node)) return;
              usageCallback({ kind: 'global', name: idPath.node.name }, idPath);
            },
          });
        }
        // swap deferred destructure receivers with synthesized polyfill-backed objects. all
        // sibling props have now been visited against the original receiver, so the key set
        // is final. synth covers every destructured key: polyfilled -> polyfill id; native ->
        // `R.key` ref. skip if the shape was mutated by another plugin (orphaned / non-
        // Identifier receiver / non-ObjectPattern) - losing the polyfill is preferable to
        // emitting against an unexpected shape
        for (const { targetPath, objectPatternNode, polyfills } of pendingSynthSwaps) {
          const receiver = targetPath.node;
          if (!t.isIdentifier(receiver) || objectPatternNode?.type !== 'ObjectPattern') continue;
          const synthProps = [];
          for (const p of objectPatternNode.properties) {
            if (!t.isObjectProperty(p) || p.computed || !t.isIdentifier(p.key)) continue;
            const polyfill = polyfills.get(p.key.name);
            const value = polyfill
              ? t.cloneNode(polyfill)
              : t.memberExpression(t.cloneNode(receiver), t.identifier(p.key.name));
            synthProps.push(t.objectProperty(t.identifier(p.key.name), value));
          }
          targetPath.replaceWith(t.objectExpression(synthProps));
        }
        injector?.flush();
        injector?.normalizeArrowRefParams();
        injector?.pruneUnusedRefs();
        injector?.reorderRefsAfterImports();
        outputDebug();
      }

      // --- post(): detect sibling CJS transform ---

      // ANY remaining top-level ESM marker means the file is still ESM; switching to
      // `require` would produce mixed output. also catches `export foo`-only files
      // (no imports) where checking ImportDeclaration alone would misfire
      const ESM_MARKER_TYPES = new Set([
        'ImportDeclaration',
        'ExportNamedDeclaration',
        'ExportDefaultDeclaration',
        'ExportAllDeclaration',
      ]);

      function postHook() {
        if (!injector) return;
        // late style-switch is a safety-net for sibling plugins that strip all ESM markers
        // (e.g. `commonjs` rewriters) after our traversal. skip it once we've already
        // flushed imports - switching now would mix ESM (already emitted) with CJS (new)
        if (!injector.hasFlushed && importStyleOption === undefined && importStyle === 'import'
          && !this.file.path.node.body.some(n => ESM_MARKER_TYPES.has(n.type))) {
          injector.importStyle = 'require';
        }
        injector.flush();
      }

      // --- mode-specific plugin objects ---

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
              // ArrayPattern destructuring in catch can't be polyfilled by property rewrite
              // (bindings are positional, not named), so extracting it is pure overhead -
              // unplugin keeps it inline and babel should mirror that. ObjectPattern still
              // needs extraction because `{ key = default }` and polyfillable key lookups
              // require a named receiver (`_ref`) to rewrite against
              if (!param || param.type !== 'ObjectPattern') return;
              if (!param.properties?.length) return;
              // use our own `_ref, _ref2, ...` generator instead of babel's `scope.generateUidIdentifier`
              // - keeps one naming scheme across the plugin and matches unplugin's output shape
              const ref = injector.generateRef(path.scope, false);
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
