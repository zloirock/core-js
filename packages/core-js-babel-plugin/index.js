import {
  ESM_MARKER_TYPES,
  createClassHelpers,
  detectCommonJS,
  hasTopLevelESM,
  isCoreJSFile,
  isDeleteTarget,
  isForXWriteTarget,
  isFunctionParamDestructureParent,
  isIdentifierPropValue,
  isInUpdateOperand,
  isSynthSimpleObjectPattern,
  isTSTypeOnlyIdentifierPath,
  isTaggedTemplateTag,
  mayHaveSideEffects,
  mergeVisitors,
  objectPatternPropNeedsReceiverRewrite,
  parseDisableDirectives,
  propBindingIdentifier,
  resolveSuperImportName,
  TS_EXPR_WRAPPERS,
} from '@core-js/polyfill-provider/helpers';
import { createResolveNodeType } from '@core-js/polyfill-provider/resolve-node-type';
import { createPolyfillResolver } from '@core-js/polyfill-provider/resolver';
import { createModuleInjectors, createUsageGlobalCallback } from '@core-js/polyfill-provider/plugin-options';
import {
  canTransformDestructuring as sharedCanTransformDestructuring,
  resolveKey as sharedResolveKey,
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
    resolvePure,
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
  } = createASTHelpers(t, { getInjector: () => injector, typeResolvers });

  const isWebpack = caller?.(c => c?.name === 'babel-loader');

  // per-plugin-instance adapter - closure reads current `injector` without module-level state
  const adapter = createBabelAdapter(() => injector);
  const skipPolyfillableOptional = (node, scope) => isPolyfillableOptional(node, scope, adapter, resolveBuiltIn);

  return {
    name: 'core-js@4',
    /* eslint-disable max-statements -- IIFE encapsulates plugin closure state + helpers;
       full decomposition tracked as ARCH-9-4 in TASKS.md §2.4 */
    ...(() => {
      let skippedNodes = new WeakSet();
      let originalBodyNodes = new WeakSet();
      let disabledLines = null;
      let skipFile;
      // receiver -> `{p: _polyfill, q: R.q, ...}` synth-swap targets, deferred to programExit
      // so every sibling prop visits against the ORIGINAL receiver first (mid-visit swap
      // would route later siblings to the partial synth and miss their polyfill). populated
      // from two shapes - param-default `function({p} = R)` and arrow IIFE `(({p}) => ...)(R)`.
      // keyed on the receiver AST node identity - sibling plugins that clone nodes via
      // `t.cloneNode` would produce fresh identities and fragment the swap. under standard
      // babel plugin ordering this is safe; coexistence with plugins that clone a common
      // ancestor is not supported
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
        // peel transparent wrappers: `UnaryExpression` (`!`/`+`) and `SequenceExpression`
        // (`(0, fn)`) + TS expression wrappers (`as` / `satisfies` / `!` TSNonNullExpression)
        // + ChainExpression (ESTree optional-chain wrap) so `((arrow) as any)()` still
        // recognises as IIFE. without these peels, callee === wrapper.node check below fails
        while (callPath?.isUnaryExpression() || callPath?.isSequenceExpression()
          || TS_EXPR_WRAPPERS.has(callPath?.node?.type)
          || callPath?.node?.type === 'ChainExpression') {
          callPath = callPath.parentPath;
        }
        if (!callPath?.isCallExpression() && !callPath?.isNewExpression()) return null;
        // distinguish IIFE (`(arrow)(R)`) from "arrow is an arg of some other call" (`dec(arrow)`):
        // only treat arrow as IIFE when the callee (after own unwrap chain) is the arrow itself.
        // `callee?.expression !== wrapper.node` fallback covers single-layer transparent wrappers
        // not yet peeled by the outer loop - e.g. ParenthesizedExpression, ChainExpression
        let { callee } = callPath.node;
        while (callee && callee !== wrapper.node
          && (callee.type === 'ParenthesizedExpression' || callee.type === 'ChainExpression'
            || TS_EXPR_WRAPPERS.has(callee.type))) {
          callee = callee.expression;
        }
        if (callee !== wrapper.node) return null;
        let i = 0;
        for (const aP of callPath.get('arguments')) {
          if (aP.isSpreadElement()) {
            if (!aP.get('argument').isArrayExpression()) return null;
            for (const elP of aP.get('argument').get('elements')) {
              if (i === paramIndex) return unwrapSequenceTail(elP);
              i++;
            }
            continue;
          }
          if (i === paramIndex) return unwrapSequenceTail(aP);
          i++;
        }
        return null;
      }

      // `(fn, R)` as an IIFE arg evaluates to its last expression. side-effect-free preceding
      // expressions can be dropped from the synth target resolution (R becomes the receiver);
      // preceding effects leave the path as-is so synth-swap bails back to inline-default
      function unwrapSequenceTail(argPath) {
        if (!argPath?.isSequenceExpression()) return argPath;
        const exprs = argPath.get('expressions');
        if (exprs.slice(0, -1).some(e => mayHaveSideEffects(e.node))) return argPath;
        return exprs.at(-1) ?? argPath;
      }

      // NodePath whose `.node` becomes the synth object; null means inline-default fallback.
      // handles `function({p} = R)` (wrapper.right) and arrow IIFE `(({p}) => body)(R)`
      // (call-arg path, expanding inline-array spreads)
      function findSynthSwapTargetPath(wrapper, objectPattern) {
        if (objectPattern.node.properties.some(p => t.isRestElement(p))) return null;
        // `(({p} = def) => body)(R)` - arrow IIFE where the param has a default. caller's
        // `R` wins at runtime: default `def` never fires (assuming R is defined). rewriting
        // `def` to a synth object would bind `p` to a polyfill resolved against `def`'s
        // shape, while runtime picks props from `R`'s shape - different polyfill target.
        // bail to inline-default here so `{p = _polyfill}` stays aligned regardless of which
        // side of the default runtime picks
        if (wrapper?.isAssignmentPattern() && t.isIdentifier(wrapper.node.right)) {
          return detectIifeArgPath(wrapper.parentPath, wrapper) ? null : wrapper.get('right');
        }
        const argPath = detectIifeArgPath(wrapper, objectPattern);
        return argPath && t.isIdentifier(argPath.node) ? argPath : null;
      }

      // parameter destructure polyfill. only static/global fit here; instance methods need a
      // receiver. synth-swap when `findSynthSwapTargetPath` identifies a safe Identifier
      // receiver; otherwise inline-default `{p = _polyfill}` (fires only on undefined property).
      // bare param without IIFE / receiver `function({ from }) {}` bails by design - `from`
      // could be ANY value the caller passes, not necessarily Array.from.
      // AssignmentPattern (`{from = []} = Array`): accept both `{key: binding}` and
      // `{key = default}` shapes. the user's default becomes dead code under synth-swap
      // (polyfill id is always defined) but stays syntactically intact in the output
      function handleParameterDestructure(prop, kind, entry, hintName) {
        if (kind === 'instance') return;
        if (prop.node.computed || !t.isIdentifier(prop.node.key)) return;
        if (!isIdentifierPropValue(prop.node.value)) return;
        const objectPattern = prop.parentPath;
        const targetPath = isSynthSimpleObjectPattern(objectPattern.node)
          ? findSynthSwapTargetPath(objectPattern?.parentPath, objectPattern) : null;
        if (!targetPath) {
          emitParamInlineDefault(prop, injectPureImport(entry, hintName));
          // parity with sibling destructure handlers - replaceWith schedules re-traversal
          // and the next visitor entry must short-circuit on the already-rewritten prop.
          // also mark the new `{p = _polyfill}` AssignmentPattern slot so Identifier visitors
          // walking `prop.node.value` don't re-fire on the synthetic `_polyfill` default
          skippedNodes.add(prop.node);
          if (prop.node.value) skippedNodes.add(prop.node.value);
          return;
        }
        // defer injectPureImport until programExit emits the synth. if a sibling plugin
        // mutates targetPath before then, the swap is skipped and no dead import is left.
        // skip the receiver identifier so the standalone identifier visit doesn't inject a
        // `_Promise` that would remain unused once synth-swap replaces the receiver
        const receiver = targetPath.node;
        skippedNodes.add(receiver);
        let pending = synthSwapByReceiver.get(receiver);
        if (!pending) {
          // keep the ObjectPattern's PATH (not just node) so programExit can verify it's still
          // live in the AST: a sibling plugin may `replaceWith` the pattern between enqueue and
          // emission, leaving our captured node stale. path identity + orphan check is the
          // only safe way to detect "pattern still installed at the same slot"
          pending = {
            targetPath,
            objectPatternPath: objectPattern,
            objectPatternNode: objectPattern.node,
            polyfills: new Map(),
          };
          synthSwapByReceiver.set(receiver, pending);
          pendingSynthSwaps.push(pending);
        }
        pending.polyfills.set(prop.node.key.name, { entry, hintName });
      }

      // `const { Array: { from } } = globalThis` -> `const from = _Array$from`.
      // supports N-deep nesting (`const { NS: { Sub: { x } } } = globalThis`): walks up
      // pattern/property pairs until we hit the declarator, then unwinds the cascade from
      // innermost-empty-property-removed outward. AssignmentExpression form is NOT flattened
      // (changing statement shape would lose the expression's return value); only VariableDeclaration.
      // accepts `{ x }`, `{ x: alias }`, `{ x = default }`, `{ x: alias = default }` - user's
      // default is dropped: the polyfill binding is always defined, so `= default` would be
      // dead code; flatten guarantees polyfill wins even on buggy-but-present native
      // when a declarator's init is `(se(), receiver)`, lift the SE prefix as a standalone
      // statement BEFORE the declaration so its side-effects fire at the original evaluation
      // point even after the declarator gets replaced/spliced. cloned nodes are seeded into
      // `skippedNodes` to block re-traversal double-injecting polyfills inside the lifted SE.
      // no-op when init isn't SE or has only the tail expression (no preceding effects)
      function liftDeclaratorSEPrefix(declarator, declaration) {
        const { init } = declarator.node;
        if (init?.type !== 'SequenceExpression' || init.expressions.length <= 1) return;
        const exprs = init.expressions.slice(0, -1).map(e => t.cloneNode(e));
        const seStmt = exprs.length === 1
          ? t.expressionStatement(exprs[0])
          : t.expressionStatement(t.sequenceExpression(exprs));
        t.traverseFast(seStmt, node => { skippedNodes.add(node); });
        declaration.insertBefore(seStmt);
      }

      function tryFlattenNestedProxyDestructure(prop, entry, hintName) {
        const valueNode = propBindingIdentifier(prop.node.value);
        if (!valueNode) return false;
        // collect the chain of (property, pattern) pairs leading up to the declarator
        const chain = [];
        let currentProp = prop;
        for (;;) {
          const pattern = currentProp.parentPath;
          if (!t.isObjectPattern(pattern?.node)) return false;
          chain.push({ prop: currentProp, pattern });
          const parent = pattern.parentPath;
          if (parent?.isVariableDeclarator()) break;
          if (!t.isObjectProperty(parent?.node)) return false;
          currentProp = parent;
        }
        const declarator = chain[chain.length - 1].pattern.parentPath;
        const declaration = declarator.parentPath;
        // for-init with SequenceExpression init - flatten would drop the SE prefix (can't
        // add a statement inside a loop header). leave the raw nested destructure in place;
        // non-SE for-init shapes still flatten through the `isForInit` branch below.
        // parser-preserved ParenthesizedExpression wrappers (`createParenthesizedExpressions:
        // true`) can wrap the SE - peel so the shape check still fires under those parser opts
        let forInitRaw = declarator.node.init;
        while (forInitRaw?.type === 'ParenthesizedExpression') forInitRaw = forInitRaw.expression;
        if (declaration.parentPath?.isForStatement()
          && declaration.parentPath.node.init === declaration.node
          && forInitRaw?.type === 'SequenceExpression') return false;
        const declCount = declaration.node?.declarations?.length ?? 1;
        const id = injectPureImport(entry, hintName);
        const extractedDeclarator = t.variableDeclarator(t.cloneNode(valueNode), t.cloneNode(id));
        // `(se(), globalThis)` init: receiver resolution unwraps the SequenceExpression tail,
        // but flatten drops the whole declarator - SE prefix expressions would lose their
        // effects. lift the prefix as a statement before the extracted declaration so the
        // non-nested path's `(se(), Array)` parity holds. for-init is more constrained:
        // prefix-lifting there would need wrapping in a SequenceExpression init slot, so we
        // skip and leave the for-init shape raw
        // cascade: each level removes its property when the inner pattern has no siblings.
        // `willRemoveDeclarator` iff EVERY level's pattern had this as its sole property
        const willRemoveDeclarator = chain.every(({ pattern }) => pattern.node.properties.length === 1);
        // seed skippedNodes for the subtree about to be orphaned so scheduled visitor
        // re-entries short-circuit; handleIdentifier's `!path.parent` guard backs this up.
        // NOT calling scope.registerDeclaration on the new binding: attempting it triggered
        // "Duplicate declaration" errors in e2e when the enclosing `scope.crawl()` later
        // re-scanned. skippedNodes + programExit's implicit crawl are sufficient
        const skipSubtree = willRemoveDeclarator ? declarator.node : prop.node;
        t.traverseFast(skipSubtree, node => { skippedNodes.add(node); });
        // declarator-level insert in for-init keeps loop-header shape; declaration-level
        // insert would wrap for-init in an arrow-IIFE and duplicate the bound name inside.
        // for-init can't host external statements either, so SE-prefix lift below is gated
        // on this same predicate (caller bails earlier when for-init declarator has SE)
        const isForInit = declaration.parentPath?.isForStatement()
          && declaration.parentPath.node.init === declaration.node;
        if (!isForInit) liftDeclaratorSEPrefix(declarator, declaration);
        if (willRemoveDeclarator && declCount === 1) {
          // single-declarator simple-chain: replaceWith preserves leading comments
          declaration.replaceWith(t.variableDeclaration(declaration.node.kind, [extractedDeclarator]));
          return true;
        }
        if (isForInit) declarator.insertBefore(extractedDeclarator);
        else declaration.insertBefore(t.variableDeclaration(declaration.node.kind, [extractedDeclarator]));
        if (willRemoveDeclarator && declCount > 1) {
          // splice out the emptied declarator in-place; `.remove()` mid-traversal nulls
          // path.parent and crashes babel's virtual-type filter on queued inner Identifiers
          const idx = declaration.node.declarations.indexOf(declarator.node);
          if (idx !== -1) declaration.node.declarations.splice(idx, 1);
          return true;
        }
        // partial cascade: remove inner props while their pattern empties out
        for (const { prop: p, pattern } of chain) {
          p.remove();
          if (pattern.node.properties.length > 0) break;
        }
        return true;
      }

      // apply a resolved polyfill to an ObjectProperty path: dispatches to either the
      // function-parameter destructure path (`function({ from }) {}` form) or the regular
      // VariableDeclarator / AssignmentExpression destructure path.
      // `meta` carries `fromFallback` for conditional init (`const { from } = cond ? Array : Set`):
      // rewriting would substitute the polyfill id for the whole receiver, breaking the other
      // branch (`_Set.from` is undefined). pure mode has no side-effect import channel either,
      // so we leave the code intact and warn - runtime correctness depends on which branch
      // fires and on native availability
      function handleObjectPropertyResult(prop, meta, kind, entry, hintName) {
        if (meta?.fromFallback) {
          debugOutput?.warn(`conditional destructure with polyfill candidate left untouched ("${ meta.key }" on fallback branch) - runtime availability depends on the selected branch`);
          return;
        }
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
        resolveStaticInheritedMember,
        isInheritedStaticLookup,
        isShadowedByClassOwnMember,
        reset: resetClassHelpers,
      } = createClassHelpers(t, adapter, sharedResolveKey);

      const usageGlobalCallback = createUsageGlobalCallback({
        resolveUsage,
        injectModulesForModeEntry,
        isDisabled,
        resolveStaticInheritedMember,
      });

      // any detached ancestor puts our node outside the live AST - polyfill emission
      // would land nowhere. verify each link still occupies its prior position in the parent
      // via direct index lookup (`parent[listKey][key]`); avoids the O(N) `list.includes`
      // per ancestor that ballooned into O(depth*width) on deep member-chains in large files.
      // `slot !== cur.node` catches babel's stale path keys after sibling `.remove()`: when
      // babel hasn't re-indexed yet, `cur.key` may still point at the array slot but the
      // slot now contains a different node (or `undefined` after the splice)
      function isOrphaned(path) {
        let cur = path;
        for (; cur?.parentPath; cur = cur.parentPath) {
          if (cur.removed) return true;
          const parentNode = cur.parentPath.node;
          if (!parentNode) return true;
          const slot = cur.listKey ? parentNode[cur.listKey]?.[cur.key] : parentNode[cur.key];
          if (slot !== cur.node) return true;
        }
        // root: a sibling plugin may have installed a new Program (`file.ast.program = clone`)
        // while keeping the old tree reachable through our cached paths. the slot-check above
        // never hit Program because it has no parentPath. compare against the file's current
        // program node - stale roots produce orphan emission into a detached AST
        const currentProgram = path.hub?.file?.ast?.program;
        return currentProgram ? cur?.node !== currentProgram : false;
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

      // `X in Y` rewrite. symbol-sourced LHS (`Symbol.X in obj` / alias binding) takes the
      // symbol-in polyfill path; string-sourced LHS (`'Symbol.X' in Obj`) falls through to
      // the string-key lookup and emits `true` only if the static table matches the literal
      function handleInExpression(meta, path) {
        const symbolIn = meta.symbolSourced ? resolveSymbolInEntry(meta.key) : null;
        if (symbolIn && isEntryNeeded(symbolIn.entry)) {
          const id = injectPureImport(symbolIn.entry, symbolIn.hint);
          if (meta.key === 'Symbol.iterator') {
            // cloneNode avoids sharing the original node between the replaced BinaryExpression
            // subtree and the new CallExpression arg - defensive against sibling plugins that
            // might hold a reference to the old tree
            path.replaceWith(t.callExpression(id, [t.cloneNode(path.node.right)]));
          } else {
            path.get('left').replaceWith(id);
          }
          return;
        }
        if (meta.object) {
          // 'from' in Array / 'Promise' in globalThis - replace with true if polyfillable
          const resolved = resolvePureOrGlobalFallback(meta, path);
          if (resolved.result) path.replaceWith(t.booleanLiteral(true));
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

      // extracted from usagePureCallback to keep its statement count under lint threshold.
      // preserves sideEffects (SE from computed-key / SequenceExpression receiver) through
      // the super-class-alias -> static-lookup remap - dropping them would fire the SE at
      // wrong evaluation points
      function remapInheritedStaticMeta(originalMeta, inheritedMeta) {
        const originalSideEffects = originalMeta.sideEffects;
        const remapped = inheritedMeta ? resolveSuperImportName(injector, inheritedMeta) : null;
        return remapped && originalSideEffects?.length
          ? { ...remapped, sideEffects: originalSideEffects } : remapped;
      }

      function usagePureCallback(meta, path) {
        if (shouldSkipPath(path)) return;
        // JSX tag reaches here via ReferencedIdentifier; a JSX slot cannot host a renamed
        // Identifier, and `<_Map/>` would call the polyfill as a React component at runtime
        if (path.node.type === 'JSXIdentifier') return;

        if (meta.kind === 'in') return handleInExpression(meta, path);

        // walk past TS wrappers to detect `delete obj.at!` / `delete (obj.at as any)`
        if (isDeleteTarget(unwrapTSExpressionParent(path).parentPath?.node)) return;

        let inheritedStatic = false;
        if (meta.kind === 'property') {
          if (path.isObjectProperty()) {
            if (!t.isIdentifier(path.node.value) && !t.isAssignmentPattern(path.node.value)) return;
          } else {
            if (!path.isMemberExpression() && !path.isOptionalMemberExpression()) return;
            // `path.isReferenced()` drops grandparent - pass it explicitly
            if (!t.isReferenced(path.node, path.parent, path.parentPath?.parent)) return;
            if (isForXWriteTarget(path)) return;
            // member update (`(obj.at)++`) - the rewrite would be a function call receiver
            // (not writable). this callback is only wired in usage-pure mode (see
            // `usageCallback = isPure ? usagePureCallback : ...`), so the pure-mode guard
            // is intrinsic to the callsite - no `isPure &&` gate needed
            if (isInUpdateOperand(path.parentPath)) return;
            // shadow check for `this.X` - polyfill would bypass the user's own member
            // (e.g. `class C extends Array { at() {} foo() { this.at(0) } }`)
            if (t.isThisExpression(path.node.object) && isShadowedByClassOwnMember(path, meta.key)) return;
            // `super.X` and unshadowed `this.X` in static ctx resolve against the super
            // class's static surface via the same path - `this` in static ctx is the
            // constructor, so inherited static lookup behaves exactly like `super.X`.
            // cache the predicate so the instance-fallback bail below doesn't re-walk
            inheritedStatic = isInheritedStaticLookup(path);
            const inheritedMeta = inheritedStatic ? resolveStaticInheritedMember(path) : null;
            // `extends MyPromise` (user-aliased pure import) - map binding to global hint.
            // carry through `meta.sideEffects` from the original resolution: SE from
            // computed-key `super[(fn(), 'X')]()` or SequenceExpression receiver must be
            // preserved through the super-to-static remap, not dropped
            if (inheritedStatic) meta = remapInheritedStaticMeta(meta, inheritedMeta);
            if (inheritedStatic && !meta) return;
            if (isTaggedTemplateTag(path.parent, path.node, meta.placement) && path.key === 'tag') return;
            if (meta.key === 'Symbol.iterator') return handleSymbolIterator(path);
          }
        }

        const { result, fallback } = resolvePureOrGlobalFallback(meta, path);
        // inherited-static lookup where the member doesn't exist as static on the super class:
        // `class C extends Array { static foo() { this.at(0) } }` - `at` is instance-only on
        // Array. `fallback` path would rewrite `this.at(0)` to `_Array.at(0)`, but `_Array.at`
        // is undefined (no static). skip fallback + bail; runtime `this.at(...)` throws on the
        // user's side rather than being silently miswired into a dead polyfill call
        if (inheritedStatic && !result) return;
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
            handleObjectPropertyResult(path, meta, 'instance', 'get-iterator-method', 'getIteratorMethod');
          }
          return;
        }

        const { entry, kind, hintName } = result;

        if (path.isObjectProperty()) {
          handleObjectPropertyResult(path, meta, kind, entry, hintName);
        } else {
          // inherited-static lookup where resolve() DID return an instance entry - `this` in
          // static ctx is the constructor, not an instance; `_at(this)` would treat the class
          // as an array. bail for the same reason as the no-result branch above
          if (kind === 'instance' && inheritedStatic) return;
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
        const entry = getCoreJSEntry(source);
        if (entry === null) return;
        // synthesized-by-sibling imports lack `loc`; skip to avoid double-processing an
        // entry another plugin pre-injected (same user-facing entry -> duplicate module
        // side-effects). surface the skip through debug so users understand why an entry
        // in the output didn't expand into individual modules
        if (!path.node.loc) {
          debugOutput?.warn(`skipped location-less entry import "${ source }" (likely sibling-plugin synthesized)`);
          return;
        }
        // `createEntryVisitors` hands us every specifier-less import; mark only actual
        // core-js entries so `import 'lodash'` doesn't mask "entry not found"
        debugOutput?.markEntryFound();
        injectModulesForEntry(entry);
        path.remove();
      }

      const isPure = method === 'usage-pure';
      const usageCallback = isPure ? usagePureCallback : usageGlobalCallback;
      const commonVisitorOptions = {
        adapter,
        onUsage: usageCallback,
        onWarning: message => debugOutput?.warn(message),
        method,
        isEntryAvailable: isEntryNeeded,
      };
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

      function programExit(path) {
        if (!helperVisitors) return;
        // re-traverse new body nodes (helpers from class/spread/destructuring transforms).
        // runs BEFORE synth-swap emission below: helper-visitors queue polyfill imports for
        // identifiers that synth-swap could then consume. reversing the order would emit
        // synth-swap against a pre-scan state that misses helper-injected globals.
        // include CatchClause extractor so sibling-injected `catch ({at}) {...}` inside
        // helper bodies still gets extracted for polyfill dispatch. extractor is idempotent
        // so even if helperVisitors === usageVisitors already re-visited a catch, no harm
        const helperWithCatch = { ...helperVisitors, CatchClause: extractCatchClause };
        for (const childPath of path.get('body')) {
          if (!originalBodyNodes.has(childPath.node)) childPath.traverse(helperWithCatch);
        }
        // helper-visitor re-traversal may itself queue SEs (nested destructuring inside a
        // helper body). drain before synth-swap so the lifted SE statements participate in
        // the same body-index ordering as the primary pass
        processDeferredSideEffects(path);
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
              // post-sweep is usage-pure only, so skip unconditionally (same rationale as
              // primary-pass `skipUpdateTargets`): rewrite to frozen import binding invalid
              if (isInUpdateOperand(idPath.parentPath)) return;
              // same predicate as the primary visitor - skip disabled / type-annotation /
              // delete-target positions so this sweep doesn't overrule their exclusions
              if (shouldSkipPath(idPath)) return;
              // mirror `handleIdentifier` - TS type-only positions never need a polyfill
              if (isTSTypeOnlyIdentifierPath(idPath)) return;
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
        for (const { targetPath, objectPatternPath, objectPatternNode, polyfills } of pendingSynthSwaps) {
          const receiver = targetPath.node;
          if (!t.isIdentifier(receiver) || objectPatternNode?.type !== 'ObjectPattern') continue;
          // a sibling plugin may have detached the receiver between queue-time and now
          // (`.remove()` on an ancestor leaves `targetPath.node` stale). replaceWith on an
          // orphaned path throws; skip here so the swap is simply lost rather than crashing
          if (isOrphaned(targetPath)) continue;
          // pattern-shape check: only bail when the pattern was REPLACED with a non-Identifier
          // shape (e.g. `pattern.replaceWith(arrayPattern)` - destructure semantic incompatible).
          // `transform-destructuring` legitimately replaces ObjectPattern with `_ref` Identifier
          // and lifts `var from = _ref.from` into the body - synth-swap on the RECEIVER (`Array`
          // -> `{from: _Array$from}`) still semantically correct: `_ref.from` reads from the
          // synthesized object. only ArrayPattern / RestElement / null break the contract
          if (isOrphaned(objectPatternPath)) continue;
          const currentPattern = objectPatternPath.node;
          if (currentPattern !== objectPatternNode
            && currentPattern?.type !== 'Identifier' && currentPattern?.type !== 'ObjectPattern') continue;
          // lazy: only inject the receiver's pure import if a sibling prop needs the raw
          // receiver read (`_Promise.custom`). all-polyfilled destructures never call through,
          // keeping the import set clean; fallback is the original identifier when no pure
          // polyfill exists for the receiver
          const receiverPure = resolvePure({ kind: 'global', name: receiver.name });
          const isPolyfillableGlobal = receiverPure && receiverPure.kind !== 'instance';
          let receiverRef = null;
          const getReceiverRef = () => receiverRef ??= isPolyfillableGlobal
            ? injectPureImport(receiverPure.entry, receiverPure.hintName) : receiver;
          const synthProps = [];
          for (const p of objectPatternNode.properties) {
            if (!t.isObjectProperty(p) || p.computed || !t.isIdentifier(p.key)) continue;
            const pending = polyfills.get(p.key.name);
            // addPureImport already returns a fresh clone; another cloneNode here would be a no-op copy
            const value = pending
              ? injectPureImport(pending.entry, pending.hintName)
              : t.memberExpression(t.cloneNode(getReceiverRef()), t.identifier(p.key.name));
            synthProps.push(t.objectProperty(t.identifier(p.key.name), value));
          }
          targetPath.replaceWith(t.objectExpression(synthProps));
        }
        injector?.flush();
        // ordering: normalize THEN prune. normalize converts arrow-expression-body to block
        // and lifts trailing-`_ref` params into `var _ref;`. prune then walks scope bindings -
        // which now reflect the normalized layout - to drop unused ones. swapping order would
        // leave dead refs as arrow params (prune ignores params; only block-scoped vars qualify)
        injector?.normalizeArrowRefParams();
        injector?.pruneUnusedRefs();
        injector?.reorderRefsAfterImports();
        outputDebug();
      }

      // --- post(): detect sibling CJS transform ---

      function postHook() {
        if (!injector) return;
        // late style-switch is a safety-net for sibling plugins that strip all ESM markers
        // (e.g. `commonjs` rewriters) after our traversal. skip it once we've already
        // flushed imports - switching now would mix ESM (already emitted) with CJS (new)
        const markersGone = !this.file.path.node.body.some(n => ESM_MARKER_TYPES.has(n.type));
        if (importStyleOption === undefined && importStyle === 'import' && markersGone) {
          if (!injector.hasFlushed) {
            injector.importStyle = 'require';
          } else {
            // pending imports will emit in post as ESM while the rest of the file is now CJS -
            // surface to the user so they can reorder plugins (move ours after the CJS rewriter)
            // or opt into `importStyle: 'require'` explicitly
            debugOutput?.warn(
              '[core-js] sibling plugin stripped ESM markers after our traversal; emitted imports '
              + 'will stay ESM while file body is CJS. set `importStyle: "require"` to avoid mixing',
            );
          }
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
              // Program is a one-shot setup hook called with the FILE path (not Program path);
              // path.traverse() with `Program: enter` would invoke it with the Program-node path
              // and break the entry-import scan. ImportDeclaration is a normal visitor; the split
              // dispatch is intentional, not stylistic
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

      // CatchClause extractor: `catch ({at}) {...}` needs a named receiver for polyfill
      // dispatch against a destructured key. `extractCatchClause` is idempotent per node
      // (post-extraction param is a plain Identifier, guard below bails). included in
      // BOTH pre-traverse and helper-traverse - sibling plugins can inject catch-destructure
      // inside synthesized helper bodies (class / spread lowering), and missing extraction
      // there would skip polyfill dispatch for those destructured keys.
      // function declaration (not `const`): hoisted so `programExit` closure above can
      // reference it regardless of reachability path (non-pure early return doesn't
      // execute this block, but programExit is still wired for the non-pure factory)
      function extractCatchClause(path) {
        const { param } = path.node;
        // ArrayPattern destructuring in catch can't be polyfilled by property rewrite
        // (bindings are positional, not named), so extracting it is pure overhead -
        // unplugin keeps it inline and babel should mirror that. ObjectPattern still
        // needs extraction because `{ key = default }` and polyfillable key lookups
        // require a named receiver (`_ref`) to rewrite against
        if (!param || param.type !== 'ObjectPattern') return;
        if (!param.properties?.length) return;
        // skip extraction when nothing in the catch body reads the destructured names
        // and no property forces a receiver rewrite. without this the plugin spuriously
        // rewrites `catch ({code}) {}` into `catch (_ref) { let {code} = _ref; }` - pure
        // overhead that alters user code without benefit
        if (!param.properties.some(objectPatternPropNeedsReceiverRewrite)) {
          const destructuredNames = new Set();
          for (const p of param.properties) {
            if (p.type !== 'ObjectProperty') continue;
            const name = p.value?.type === 'Identifier' ? p.value.name : null;
            if (name) destructuredNames.add(name);
          }
          let referenced = false;
          t.traverseFast(path.node.body, node => {
            if (!referenced && node.type === 'Identifier' && destructuredNames.has(node.name)) referenced = true;
          });
          if (!referenced) return;
        }
        // use our own `_ref, _ref2, ...` generator instead of babel's `scope.generateUidIdentifier`
        // - keeps one naming scheme across the plugin and matches unplugin's output shape
        const ref = injector.generateLocalRef(path.scope);
        path.get('body').unshiftContainer('body', [
          t.variableDeclaration('let', [t.variableDeclarator(param, ref)]),
        ]);
        path.node.param = ref;
      }

      return {
        pre() {
          preTraverse(this.file.path, {
            ...usageVisitors,
            CatchClause: extractCatchClause,
          });
        },
        visitor: { Program: { exit: programExit } },
        post: postHook,
      };
    })(),
    /* eslint-enable max-statements -- close defer-block opened above */
  };
}
