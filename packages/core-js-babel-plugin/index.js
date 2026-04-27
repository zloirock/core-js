import {
  ESM_MARKER_TYPES,
  detectCommonJS,
  hasSideEffectfulSequencePrefix,
  hasTopLevelESM,
  isDeleteTarget,
  isForXWriteTarget,
  isInUpdateOperand,
  isTSTypeOnlyIdentifierPath,
  isTaggedTemplateTag,
  mayHaveSideEffects,
  TS_EXPR_WRAPPERS,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { createClassHelpers, resolveSuperImportName } from '@core-js/polyfill-provider/helpers/class-walk';
import { isCoreJSFile } from '@core-js/polyfill-provider/helpers/path-normalize';
import { mergeVisitors, parseDisableDirectives } from '@core-js/polyfill-provider/helpers/source-scan';
import { createResolveNodeType } from '@core-js/polyfill-provider/resolve-node-type';
import { createPolyfillResolver } from '@core-js/polyfill-provider/resolver';
import { createModuleInjectors } from '@core-js/polyfill-provider/plugin-options/inject';
import { createUsageGlobalCallback } from '@core-js/polyfill-provider/plugin-options/usage-callback';
import { enumerateFallbackDestructureBranches } from '@core-js/polyfill-provider/detect-usage/destructure';
import { resolveKey as sharedResolveKey } from '@core-js/polyfill-provider/detect-usage/resolve';
import { resolveSymbolIteratorEntry, resolveSymbolInEntry } from '@core-js/polyfill-provider/detect-usage/members';
import { isPolyfillableOptional } from '@core-js/polyfill-provider/detect-usage/annotations';
import { scanExistingCoreJSImports } from '@core-js/polyfill-provider/detect-usage/entries';
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
import createDestructureEmitter from './internals/destructure-emitter.js';
import createSynthSwapEmitter from './internals/synth-swap-emitter.js';

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
    deoptionalizeNode,
    generateRef,
    generateLocalRef,
    generateUnusedId,
    normalizeOptionalChain,
    replaceInstanceLike,
    replaceInstanceChainCombined,
    replaceCallWithSimple,
    unwrapTSExpressionParent,
    withSideEffects,
    reset: resetASTHelpers,
  } = createASTHelpers(t, { getInjector: () => injector, typeResolvers });

  const isWebpack = caller?.(c => c?.name === 'babel-loader');

  // per-plugin-instance adapter - closure reads current `injector` without module-level state
  const adapter = createBabelAdapter(() => injector);
  const skipPolyfillableOptional = (node, scope) => isPolyfillableOptional(node, scope, adapter, resolveBuiltIn);

  return {
    name: 'core-js@4',
    /* eslint-disable max-statements -- IIFE encapsulates plugin closure state + helpers
       coordinating per-file lifecycle (initFile / programExit / postHook). synth-swap
       pipeline lives in `internals/synth-swap-emitter.js`; destructure pipeline lives
       in `internals/destructure-emitter.js`. remaining inner functions are tightly coupled
       to closure state (skippedNodes / debugOutput / disabledLines) and inline by design */
    ...(() => {
      let skippedNodes = new WeakSet();
      let originalBodyNodes = new WeakSet();
      let disabledLines = null;
      let skipFile;
      // synth-swap pipeline: receivers accumulated as the visitor walks, drained at
      // programExit. factory in `internals/synth-swap-emitter.js`. instantiated per-file
      // in `initFile` so closure-captured `skippedNodes` ref stays in sync with the
      // freshly-allocated WeakSet
      let synthSwap;

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
        // polyfill helper loses `super`-binding (reads ancestor prototype's iterator, not
        // current class's); let the native runtime form stand for `super[Symbol.iterator]`
        if (t.isSuper(path.node.object)) return;
        if (path.node.computed) {
          // SE-bearing SequenceExpression in computed key would be silently dropped by the
          // `_getIteratorMethod(obj)` rewrite (only `obj` survives). bail so the inner
          // Symbol.iterator visitor emits the static polyfill in place, SE preserved
          if (hasSideEffectfulSequencePrefix(path.node.property)) return;
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

      // destructure rewrite pipeline (parameter-default synth-swap entry, top-level extraction,
      // nested proxy-global flatten, catch-clause receiver). instantiated per-file in `initFile`
      // so closure-captured per-file state stays in sync; public `handleObjectPropertyResult` /
      // `extractCatchClause` become local consts so existing call sites stay unchanged
      let destructureEmit;

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
        isInheritedStaticLookup,
        isShadowedByClassOwnMember,
        enumerateFallbackBranches: (meta, path) => enumerateFallbackDestructureBranches(meta, path, adapter),
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
          // grandparent removed leaves parent dangling - parent's `.node` survives but it's
          // no longer reachable from the program tree. without this check we'd polyfill into
          // dead branches that sibling plugins already amputated
          if (cur.parentPath.removed) return true;
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
          if (!resolved.result) return;
          // RHS-side preserves SE: `'k' in (fn(), Array)` evaluates `fn()` even when LHS is
          // a known constant. drop without rescue would silently elide observable side-effects.
          // wrap via SequenceExpression so `(fn(), true)` keeps semantics intact
          const rhs = path.node.right;
          if (rhs?.type === 'SequenceExpression' && rhs.expressions.length > 1
            && rhs.expressions.slice(0, -1).some(e => mayHaveSideEffects(e))) {
            const prefix = rhs.expressions.slice(0, -1);
            path.replaceWith(t.sequenceExpression([...prefix, t.booleanLiteral(true)]));
          } else {
            path.replaceWith(t.booleanLiteral(true));
          }
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
            // ConditionalExpression / LogicalExpression init - resolver may pick a branch
            // whose key isn't viable as static (Promise.from, WeakMap.groupBy, ...) and bail
            // before reaching handleObjectPropertyResult. dispatch fromFallback up front so
            // per-branch synth-swap fires regardless of which branch the resolver picked
            if (meta.fromFallback) return destructureEmit.handleObjectPropertyResult(path, meta, null, null, null);
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
            destructureEmit.handleObjectPropertyResult(path, meta, 'instance', 'get-iterator-method', 'getIteratorMethod');
          }
          return;
        }

        const { entry, kind, hintName } = result;

        if (path.isObjectProperty()) {
          destructureEmit.handleObjectPropertyResult(path, meta, kind, entry, hintName);
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
            replaceInstanceLike(path, id, skipPolyfillableOptional, meta.sideEffects);
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
        // re-instantiate per-file so the emitter's closure-captured `skippedNodes` ref
        // points to the freshly-allocated WeakSet (skippedNodes is reassigned, not mutated)
        synthSwap = createSynthSwapEmitter({
          adapter, injectPureImport, isOrphaned, resolvePure, skippedNodes, t,
        });
        destructureEmit = createDestructureEmitter({
          generateRef,
          generateLocalRef,
          generateUnusedId,
          getDebugOutput: () => debugOutput,
          injector,
          injectPureImport,
          resolvePropertyObjectType,
          skippedNodes,
          synthSwap,
          t,
          toHint,
        });
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
        const { deferredSideEffects } = destructureEmit;
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
        // snapshot AFTER flush + deferred SE so programExit's reTraverseHelperBodies skips
        // already-traversed nodes (our flushed imports, lifted SE statements) and only
        // visits sibling-plugin-injected helper bodies (class transforms, destructuring,
        // etc.) that were spliced after our pre-pass. snapshotting before flush would
        // re-traverse our own injected imports redundantly
        originalBodyNodes = new WeakSet(path.node.body);
      }

      // --- Program.exit ---

      // re-traverse helper-injected body nodes (class/spread/destructuring transforms).
      // runs BEFORE synth-swap drain: helper-visitors queue polyfill imports for identifiers
      // that synth-swap could then consume. reversing the order would emit synth-swap
      // against a pre-scan state that misses helper-injected globals.
      // include CatchClause extractor so sibling-injected `catch ({at}) {...}` inside
      // helper bodies still gets extracted for polyfill dispatch. extractor is idempotent
      // so even if helperVisitors === usageVisitors already re-visited a catch, no harm
      function reTraverseHelperBodies(path) {
        const helperWithCatch = { ...helperVisitors, CatchClause: catchPath => destructureEmit.extractCatchClause(catchPath) };
        for (const childPath of path.get('body')) {
          if (!originalBodyNodes.has(childPath.node)) childPath.traverse(helperWithCatch);
        }
      }

      // usage-pure post-sweep for raw globals: sibling plugins (regenerator) may mutate
      // original nodes in-place, injecting raw globals (Promise). scan for unbound global
      // Identifiers only - MemberExpression would double-process already-polyfilled chains.
      // usage-global doesn't need this - globals stay as-is, imports from pre() suffice
      function postSweepUnboundGlobals(path) {
        if (method !== 'usage-pure') return;
        const isHandled = usageVisitors?.[USAGE_VISITORS_IS_HANDLED];
        path.traverse({
          Identifier(idPath) {
            if (!idPath.isReferencedIdentifier()) return;
            // adapter.hasBinding (vs raw `getBindingIdentifier`) folds in TS-runtime shadows
            // estree-toolkit & babel scope miss (`enum`, `namespace`, `const enum`,
            // `import X = require()`) plus type-only TSImportEquals filtering
            if (adapter.hasBinding(idPath.scope, idPath.node.name)) return;
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

      function programExit(path) {
        if (!helperVisitors) return;
        reTraverseHelperBodies(path);
        // helper-visitor re-traversal may itself queue SEs (nested destructuring inside a
        // helper body). drain before synth-swap so the lifted SE statements participate in
        // the same body-index ordering as the primary pass
        processDeferredSideEffects(path);
        postSweepUnboundGlobals(path);
        // drain deferred synth-swap receivers - all sibling props have now been visited
        // against the original receiver, so the key set is final
        synthSwap.apply();
        injector?.flush();
        // ordering: normalize THEN prune. normalize converts arrow-expression-body to block
        // and lifts trailing-`_ref` params into `var _ref;`. prune then walks scope bindings -
        // which now reflect the normalized layout - to drop unused ones. swapping order would
        // leave dead refs as arrow params (prune ignores params; only block-scoped vars qualify)
        injector?.normalizeArrowRefParams();
        injector?.pruneUnusedRefs();
        injector?.reorderRefsAfterImports();
        // outputDebug() + closure-captured state cleanup deferred to postHook so the
        // late-CJS detection (`postHook`'s markersGone check + diagnostic warn) can add to
        // debug output before format(). siblings' programExit + post may run AFTER ours;
        // nulling here would make postHook bail early and silently drop the ESM/CJS warning
      }

      // --- post(): detect sibling CJS transform ---

      function postHook() {
        if (!injector) return;
        // late style-switch is a safety-net for sibling plugins that strip all ESM markers
        // (e.g. `commonjs` rewriters) after our traversal. by post-phase our flush has
        // already emitted imports; the remaining useful action is surfacing the mismatch
        // through debug so users reorder plugins or opt into `importStyle: 'require'`
        const markersGone = !this.file.path.node.body.some(n => ESM_MARKER_TYPES.has(n.type));
        if (importStyleOption === undefined && importStyle === 'import' && markersGone && injector.hasFlushed) {
          debugOutput?.warn(
            '[core-js] sibling plugin stripped ESM markers after our traversal; emitted imports '
            + 'will stay ESM while file body is CJS. set `importStyle: "require"` to avoid mixing',
          );
        }
        // outputDebug AFTER potential warning add so format() includes the late-CJS diagnostic.
        // then drop closure-captured per-file state so the previous file's AST + injector don't
        // pin references between `initFile` calls (Babel runs the visitor object for every
        // transformed file in the same plugin instance). next `initFile` re-allocates
        // everything; explicit nulling makes the GC bound deterministic
        outputDebug();
        injector = synthSwap = destructureEmit = skippedNodes = originalBodyNodes = debugOutput = null;
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

      return {
        pre() {
          preTraverse(this.file.path, {
            ...usageVisitors,
            CatchClause: path => destructureEmit.extractCatchClause(path),
          });
        },
        visitor: { Program: { exit: programExit } },
        post: postHook,
      };
    })(),
    /* eslint-enable max-statements -- close defer-block opened above */
  };
}
