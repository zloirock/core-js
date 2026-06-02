import {
  ESM_MARKER_TYPES,
  detectCommonJS,
  extractIndirectRequireSEPrefix,
  hasSideEffectfulSequencePrefix,
  hasTopLevelESM,
  isDeleteTarget,
  isForXHeadAssignTarget,
  isForXWriteTarget,
  isInUpdateOperand,
  isThisReceiver,
  collectMutatedStaticMembers,
  getMinifierSequenceDestructureExpressions,
  isMutatedStaticMeta,
  isTSTypeOnlyIdentifierPath,
  isTaggedTemplateTag,
  mayHaveSideEffects,
  peelSkippableWrappers,
  TS_EXPR_WRAPPERS,
  visitSymbolInLhsSe,
  wouldPromoteDirectiveAfterRemoval,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { createClassHelpers, remapInheritedStaticMeta } from '@core-js/polyfill-provider/helpers/class-walk';
import { tagError } from '@core-js/polyfill-provider/helpers/error-tag';
import { isCoreJSFile } from '@core-js/polyfill-provider/helpers/path-normalize';
import { mergeVisitors, parseDisableDirectives } from '@core-js/polyfill-provider/helpers/source-scan';
import { createResolveNodeType } from '@core-js/polyfill-provider/resolve-node-type';
import { createPolyfillResolver } from '@core-js/polyfill-provider/resolver';
import { createModuleInjectors } from '@core-js/polyfill-provider/plugin-options/inject';
import { createUsageGlobalCallback } from '@core-js/polyfill-provider/plugin-options/usage-callback';
import { enumerateFallbackDestructureBranches } from '@core-js/polyfill-provider/detect-usage/destructure';
import { prependChainAssignmentEffect, resolveKey as sharedResolveKey } from '@core-js/polyfill-provider/detect-usage/resolve';
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
import runEntryDetection from './internals/detect-entry.js';
import createDestructureEmitter from './internals/destructure-emitter.js';
import createSynthSwapEmitter from './internals/synth-swap-emitter.js';

// minifier-shape pre-pass: `(prefixExpr, ..., ({pat} = R));` collapses a destructure
// assignment into the last slot of a SequenceExpression - the destructure-emitter gate
// would silently bail without this split. shape detection is shared with unplugin's
// text-rewrite path via `getMinifierSequenceDestructureExpressions` (unplugin's symmetric
// pre-pass routes through `forEachStatementListBody` over the raw AST). walks every
// Statement-list host - Program + descendant BlockStatement / StaticBlock / TSModuleBlock -
// so function / loop / try / class-static / namespace bodies are covered too; Program-only
// walk silently bailed destructure-emitter inside non-Program statement lists
function splitMinifierSequenceDestructure(programPath, t) {
  function splitStatementList(statementPaths) {
    for (const bodyPath of statementPaths) {
      const expressions = getMinifierSequenceDestructureExpressions(bodyPath.node);
      if (!expressions) continue;
      bodyPath.replaceWithMultiple(expressions.map((e, i) => {
        // a leading StringLiteral operand promoted to its own statement at a prologue position
        // (Program / function body[0]) re-parses as a Directive Prologue entry - flipping a sloppy
        // script into strict mode (`"use strict"`), enabling asm.js (`"use asm"`), etc. - a semantic
        // shift the original SequenceExpression operand never carried. wrap it in `(0, str)` so it
        // stays a plain ExpressionStatement and the prologue ends before it; only the first operand
        // can land in prologue position (a later string operand is already post-prologue)
        let head = e;
        while (head?.type === 'ParenthesizedExpression') head = head.expression;
        const node = i === 0 && head?.type === 'StringLiteral'
          ? t.sequenceExpression([t.numericLiteral(0), e]) : e;
        const stmt = t.expressionStatement(node);
        // carry the wrapped expression's source position onto the synthesized statement so split
        // products read as genuine user code, not loc-less sibling-plugin synthesis. without it
        // entry-global's loc gate skips a collapsed `require('core-js/...')` entry and the
        // disable-directive boundary scan skips past a collapsed first statement
        stmt.loc = e.loc;
        stmt.start = e.start;
        stmt.end = e.end;
        return stmt;
      }));
    }
  }
  function splitInBody(blockPath) {
    splitStatementList(blockPath.get('body'));
  }
  splitInBody(programPath);
  // SwitchCase's `consequent` slot hosts the case body statement list; SwitchCase is not in
  // STATEMENT_LIST_BODY_HOSTS (different slot name) so a separate visitor reaches it
  programPath.traverse({
    'BlockStatement|StaticBlock|TSModuleBlock': splitInBody,
    SwitchCase(path) {
      splitStatementList(path.get('consequent'));
    },
  });
}

export default function plugin(api, options) {
  const { types: t, caller } = api;

  // `getPolyfillBindingEntry` / `getPolyfillBindingHint` read `injector` lazily (assigned in
  // Program enter, declared below) - same late-binding closure pattern as `createASTHelpers`
  // / `createBabelAdapter`. entry path resolves polyfilled-static aliases (`const from =
  // Array.from` after rewrite). hint covers BOTH pure-import bindings (`_Array$from` -> entry
  // `array/from` -> hint `Array`) AND alias-only bindings (`_globalThis` registered via
  // `registerGlobalAlias`, no standalone entry path) so the proxy-global recognizer reaches
  // `extends g.Array<...>` after the in-place `globalThis` -> `_globalThis` rewrite
  const typeResolvers = createResolveNodeType(node => node?.type, t, {
    getPolyfillBindingEntry(scope, name) { return injector?.getBindingInfo?.(name)?.entry ?? null; },
    getPolyfillBindingHint(scope, name) { return injector?.getBindingInfo?.(name)?.hint ?? null; },
    isReassignedBinding(name, binding) { return injector?.isReassignedBinding?.(name, binding) ?? false; },
  });
  const { resolvePropertyObjectType, resolveNodeType, resolvedType, toHint } = typeResolvers;

  const { resolver, createDebugOutput } = createPolyfillResolver(options, {
    typeResolvers,
    astPredicates: {
      isMemberLike: path => path.isMemberExpression() || path.isOptionalMemberExpression(),
      // peel parens + TS expression wrappers from `parent.callee` before identity-checking
      // against `node`. without the peel, `(JSON.parse as any)(s)` shape - where the
      // resolver's `filter()` already walked through TS-wraps to find the outer Call -
      // rejects the callee match by strict identity (parent.callee is the wrapper, not
      // the inner MemberExpression) and arg-count / arg-shape filters silently over-inject.
      // babel's `t.is*({callee:node})` matchers are strict-identity; replace with explicit
      // peel through shared `SKIPPABLE_WRAPPER_TYPES`
      isCallee: (node, parent) => {
        if (!t.isCallExpression(parent) && !t.isOptionalCallExpression(parent) && !t.isNewExpression(parent)) return false;
        return peelSkippableWrappers(parent.callee) === node;
      },
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

  // third arg `path` (when supplied by `extractCheck`) anchors `adapter.hasBinding` at
  // the reference site so TS-runtime shadows (`enum`, `namespace`, `import X = require()`)
  // mask polyfill replacement correctly. without it, the lookup defaults to the path's
  // outer scope and misses nested TS-runtime bindings
  function skipPolyfillableOptional(node, scope, path) {
    return isPolyfillableOptional({ node, scope, path, adapter, resolve: resolveBuiltIn });
  }

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
      // pre-pass result: set of `"ObjectName.keyName"` strings the user mutated somewhere in
      // this file (`Array.from = X`, `[Array.from] = X`, `delete Array.from`, ...). substitution
      // for matching reads must bail because the polyfill import is a `const` binding -
      // user's mutation reaches the original global but not the import, so swapping
      // `Array.from(...)` for `_Array$from(...)` silently diverges from un-transformed source
      let mutatedStatics = null;
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

      function handleSymbolIterator(path, sideEffects) {
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
        // thread `meta.sideEffects` through to the replacement helpers. detect-usage
        // captures SE during dispatch (e.g. inline-call receiver `(() => arr)()[Symbol.iterator]()`
        // where the SE-bearing receiver is the MemberExpression object); without forwarding,
        // those effects silently dropped when the parent call gets rewritten
        if (entry === 'get-iterator') replaceCallWithSimple(path, id, skipPolyfillableOptional, sideEffects);
        else replaceInstanceLike({ path, id, skipOptional: skipPolyfillableOptional, sideEffects });
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
      } = createClassHelpers({ t, adapter, resolveKey: sharedResolveKey, getInjector: () => injector });

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
        // program node - stale roots produce orphan emission into a detached AST. the
        // previous `currentProgram ? ... : false` ternary defaulted to "not orphan" whenever
        // the hub / file / ast / program chain was undefined - missing the case where the
        // sibling plugin REMOVED `file.ast.program` outright (rare but plausible in test
        // harnesses or aggressive AST swaps). dropping the ternary so the inequality runs
        // anyway: an absent program slot won't match our cur.node, flagging orphan correctly.
        // when the path itself is `cur === null` (parentPath walk exhausted), `cur?.node` is
        // undefined and matches a likewise-undefined program, returning false - still treats
        // truly synthetic root-less paths as live to avoid suppressing legitimate emissions
        return cur?.node !== path.hub?.file?.ast?.program;
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
        // outer call's immediate (wrapper-peeled) receiver. when the descent below crosses
        // non-optional Member/Call hops (`.map(...)` / `.slice(...)`) to reach the optional
        // inner, this differs from the inner - the combine then threads the surviving hops
        // onto the memoized inner result instead of dropping them (value corruption)
        const outerObjectNode = current.node;
        while (current.isOptionalMemberExpression() || current.isOptionalCallExpression()) {
          if (current.node.optional) break;
          current = unwrap(current.isOptionalMemberExpression() ? current.get('object') : current.get('callee'));
        }
        if (!current.isOptionalCallExpression() || !current.node.optional) return null;
        const callee = current.get('callee');
        const calleeNode = callee.node;
        if (calleeNode?.type !== 'MemberExpression' && calleeNode?.type !== 'OptionalMemberExpression') return null;
        if (calleeNode.computed || calleeNode.property?.type !== 'Identifier') return null;
        // `super.X?.().Y(args)` would lift `super` into a `(_ref = super)` memo on the
        // OR-chain template, but `super` is not a primary expression and the codegen
        // throws at parse time. let `super` chains fall through to addInstanceTransform's
        // dedicated super-call handling instead
        if (calleeNode.object?.type === 'Super') return null;
        const meta = { kind: 'property', object: null, key: calleeNode.property.name, placement: 'prototype' };
        const { result } = resolvePureOrGlobalFallback(meta, callee);
        if (result?.kind !== 'instance') return null;
        return {
          innerCallee: calleeNode,
          innerArgs: current.node.arguments,
          innerEntry: result.entry,
          innerHintName: result.hintName,
          chainStartNode: current.node,
          hasHops: current.node !== outerObjectNode,
        };
      }

      // mark the chain-combine's consumed inner pieces skipped (the optional call, its method
      // member, and the method key) so re-traversal won't re-process them as a standalone call
      // (a dead `_ref` via extractCheck). the receiver subtree (innerCallee.object) stays
      // VISITABLE so its proxy-globals (`globalThis` -> `_globalThis`), statics (`Array.from` ->
      // `_Array$from`), and nested polyfillable chains (`a.flat?.()`) still substitute - matching
      // the single-call path. EXCEPTION: a TS-cast-wrapped receiver (`(globalThis as any)`) is kept
      // verbatim in the memo by both plugins (unplugin can't compose a substitution spanning the
      // Paren+cast), so blanket-skip it here too rather than substitute through the cast
      function markCombinedChainConsumed({ chainStartNode, innerCallee }) {
        skippedNodes.add(chainStartNode);
        skippedNodes.add(innerCallee);
        if (innerCallee.property) skippedNodes.add(innerCallee.property);
        let receiverLeaf = innerCallee.object;
        while (receiverLeaf?.type === 'ParenthesizedExpression') receiverLeaf = receiverLeaf.expression;
        if (receiverLeaf && TS_EXPR_WRAPPERS.has(receiverLeaf.type)) {
          t.traverseFast(innerCallee.object, node => { skippedNodes.add(node); });
        }
      }

      // inherited-static dispatch -- super.method(args) or this.method(args) in static ctx
      // (plain / ! / ?.()) -> id.call(this, args). the subclass constructor must stay the
      // receiver, else the pure static result downgrades to the base class.
      // sideEffects channel covers computed-key SE: `super[(fn(),'X')](args)` collected fn()
      // into meta.sideEffects via members.js; emit wraps the call in SequenceExpression
      function replaceInheritedStatic(path, id, sideEffects) {
        const callerPath = unwrapTSExpressionParent(path);
        const callParent = callerPath.parentPath;
        if ((callParent?.isCallExpression() || callParent?.isOptionalCallExpression())
          && callParent.node.callee === callerPath.node) {
          const callExpr = t.callExpression(t.memberExpression(id, t.identifier('call')),
            [t.thisExpression(), ...callParent.node.arguments.map(a => t.cloneNode(a))]);
          callParent.replaceWith(withSideEffects(callExpr, sideEffects));
        } else {
          unwrapTSExpressionParent(path).replaceWith(withSideEffects(id, sideEffects));
        }
      }

      // peel SequenceExpression's preceding elements when at least one carries a
      // side-effect; trailing tail is the value used by the in-expression. returns null
      // when not a sequence or when no preceding element has side-effects
      function sequencePrefixWithSideEffects(expr) {
        if (expr?.type !== 'SequenceExpression' || expr.expressions.length < 2) return null;
        const prefix = expr.expressions.slice(0, -1);
        return prefix.some(e => mayHaveSideEffects(e)) ? prefix : null;
      }

      // `X in Y` rewrite. symbol-sourced LHS (`Symbol.X in obj` / alias binding) takes the
      // symbol-in polyfill path; string-sourced LHS (`'Symbol.X' in Obj`) falls through to
      // the string-key lookup and emits `true` only if the static table matches the literal
      function handleInExpression(meta, path) {
        const symbolIn = meta.symbolSourced ? resolveSymbolInEntry(meta.key) : null;
        if (symbolIn && isEntryNeeded(symbolIn.entry)) {
          const id = injectPureImport(symbolIn.entry, symbolIn.hint);
          // LHS may carry SE (computed-key SequenceExpression / wrapped receiver SE) that
          // the symbol-in rewrite would otherwise drop. harvest and prepend as a sequence
          const lhsSe = [];
          visitSymbolInLhsSe(path.node.left, e => lhsSe.push(t.cloneNode(e)));
          if (meta.key === 'Symbol.iterator') {
            // cloneNode avoids sharing the original node between the replaced BinaryExpression
            // subtree and the new CallExpression arg - defensive against sibling plugins that
            // might hold a reference to the old tree
            const call = t.callExpression(id, [t.cloneNode(path.node.right)]);
            path.replaceWith(lhsSe.length ? t.sequenceExpression([...lhsSe, call]) : call);
          } else {
            path.get('left').replaceWith(id);
            if (lhsSe.length) path.replaceWith(t.sequenceExpression([...lhsSe, path.node]));
          }
          return;
        }
        if (meta.object) {
          // 'from' in Array / 'Promise' in globalThis - replace with true if polyfillable.
          // BOTH sides preserve SE: `(bar(), 'from') in Array` and `'k' in (fn(), Array)`
          // evaluate their SE even when the in-check folds to a constant. shapes:
          //   SequenceExpression: keep SE-bearing prefix, drop tail (consumed by in-check)
          //   AssignmentExpression on RHS: wrap whole RHS as sequence prefix (rescues
          //   assignment side-effect + binding update)
          // CallExpression rhs is intentionally NOT rescued here - inline-call analysis
          // upstream filters out SE-bearing IIFEs separately, and conservative wrapping for
          // pure IIFE receivers would emit `((() => X)(), true)` for the explicit-classify path
          const resolved = resolvePureOrGlobalFallback(meta, path);
          if (!resolved.result) return;
          const seExprs = [];
          const lhsPrefix = sequencePrefixWithSideEffects(path.node.left);
          if (lhsPrefix) seExprs.push(...lhsPrefix.map(e => t.cloneNode(e)));
          const rhs = path.node.right;
          const rhsPrefix = sequencePrefixWithSideEffects(rhs);
          if (rhsPrefix) seExprs.push(...rhsPrefix.map(e => t.cloneNode(e)));
          else if (rhs?.type === 'AssignmentExpression') seExprs.push(t.cloneNode(rhs));
          if (seExprs.length) {
            path.replaceWith(t.sequenceExpression([...seExprs, t.booleanLiteral(true)]));
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
        const type = resolveNodeType(callParent);
        if (type) resolvedType.set(callParent.node, type);
      }

      function usagePureCallback(meta, path) {
        if (shouldSkipPath(path)) return;
        // JSX tag reaches here via ReferencedIdentifier; a JSX slot cannot host a renamed
        // Identifier, and `<_Map/>` would call the polyfill as a React component at runtime
        if (path.node.type === 'JSXIdentifier') return;

        // user monkey-patches `Object.key` in this file - substituting reads with the
        // `const`-bound polyfill import would silently bypass the user's mutation (unlike
        // usage-global which shares the global slot). pre-pass collected the mutated keys;
        // bail substitution + emission for matching property reads
        if (isMutatedStaticMeta(meta, mutatedStatics)) return;

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
            if (meta.fromFallback) return destructureEmit.handleObjectPropertyResult({
              prop: path, meta, kind: null, entry: null, hintName: null,
            });
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
            // shared `isThisReceiver` peels parens / TS wrappers / chain so `(this).at(0)`,
            // `(this as any).at(0)`, `this!.at(0)` reach the same shadow detection
            if (isThisReceiver(path.node.object) && isShadowedByClassOwnMember(path, meta.key)) return;
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
            if (inheritedStatic) meta = remapInheritedStaticMeta(injector, meta, inheritedMeta);
            if (inheritedStatic && !meta) return;
            // re-check mutation gate AFTER remap: the pre-remap `meta.object` was null
            // (this-receiver, kind='property' but unresolved); remap fills it with the super
            // class name. without the re-check, `this.from(arr)` inside `class C extends Array`
            // silently bypasses user's `Array.from = ...` monkey-patch
            if (inheritedStatic && isMutatedStaticMeta(meta, mutatedStatics)) return;
            if (isTaggedTemplateTag(path.parent, path.node, meta.placement) && path.key === 'tag') return;
            if (meta.key === 'Symbol.iterator') return handleSymbolIterator(path, meta.sideEffects);
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
          // mirror the main static-rewrite branch (`replacePath.replaceWith(withSideEffects(
          // id, allEffects))` below): preserve `meta.sideEffects` (computed-key SE in the
          // original member access) AND `prependChainAssignmentEffect` over the receiver
          // (chain-assignment `(a = X).noStatic` writes to `a` are observable; the receiver
          // replacement drops them). without this, `(called++, Promise).noSuchStatic`
          // fallback silently rewrites to `_Promise.noSuchStatic` losing the `called++`
          const allEffects = prependChainAssignmentEffect(path.node.object, meta.sideEffects);
          path.get('object').replaceWith(withSideEffects(id, allEffects));
          // receiver-only rewrite: the member ITSELF is not polyfilled (static-FALLBACK, only the
          // receiver swaps to the pure ctor), so a trailing optional CALL (`Promise.noSuchStatic?.(1)`)
          // is a GENUINE guard for the possibly-undefined member and must survive. stripFirstOptional
          // would deoptionalize that trailing `?.(` (the first optional ancestor), turning native
          // `undefined` into a TypeError. pass `false` so only the now-defined receiver's own `?.`
          // (dead after the swap) is left as-is and the trailing guard is preserved (matches unplugin)
          normalizeOptionalChain(path, false);
          return;
        }
        if (!result) {
          // [Symbol.iterator] in destructuring: resolve returns null, use getIteratorMethod
          if (path.isObjectProperty() && path.node.computed && meta.key === 'Symbol.iterator') {
            destructureEmit.handleObjectPropertyResult({
              prop: path, meta, kind: 'instance', entry: 'get-iterator-method', hintName: 'getIteratorMethod',
            });
          }
          return;
        }

        const { entry, kind, hintName } = result;

        if (path.isObjectProperty()) {
          destructureEmit.handleObjectPropertyResult({ prop: path, meta, kind, entry, hintName });
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
              markCombinedChainConsumed(innerChain);
              // pass `meta.sideEffects` through: outer-key computed SE (e.g.
              // `(arr?.at?.(0))[(fn(), 'map')](x => x)`) was captured by detect-usage but
              // dropped when the inner-chain rewrite replaced the parent expression with a
              // conditional. SequenceExpression wrap preserves the SE in source order
              replaceInstanceChainCombined(path, id, { ...innerChain, innerId, sideEffects: meta.sideEffects });
              return;
            }
            // capture pre-mutation Type object for the parent CallExpression and re-attach
            // post-replacement. parallel to static branch's `annotateCallReturnType` but
            // post-replace - instance rewrite REPLACES the parent CallExpression entirely
            // (`arr.concat(x)` -> `_concatMaybeArray(arr).call(arr, x)`), losing any pre-set
            // annotation; static rewrite only swaps the callee identifier so the parent
            // node persists. without this type-cache downstream `arr2.at(-1)` (where `arr2 =
            // arr.concat(x)`) falls back to generic `_at` because the rewritten init shape
            // (`_concatMaybeArray(arr).call(arr, x)`) isn't recognized by `resolveNodeType`
            const callerPath = unwrapTSExpressionParent(path);
            const callParent = callerPath.parentPath;
            const isCallParent = (callParent?.isCallExpression() || callParent?.isOptionalCallExpression())
              && callParent.node.callee === callerPath.node;
            const callType = isCallParent ? resolveNodeType(callParent) : null;
            replaceInstanceLike({ path, id, skipOptional: skipPolyfillableOptional, sideEffects: meta.sideEffects });
            if (callType && callParent.node) resolvedType.set(callParent.node, callType);
          } else if (inheritedStatic) {
            // super.X and unshadowed this.X in static ctx (this = subclass ctor): emit
            // id.call(this, ...) so the receiver is preserved, else the result downgrades to base
            replaceInheritedStatic(path, id, meta.sideEffects);
          } else {
            const wasOptional = (annotateCallReturnType(path), path.node.optional);
            const replacePath = unwrapTSExpressionParent(path);
            // `Symbol[(fn(), 'iterator')]` / `(fn(), Array).from(x)` - preserve fn() via
            // SequenceExpression wrap since the MemberExpression replacement discards its
            // receiver/computed-key subtree.
            // chain-assignment receiver `(a = Array).from(x)` / `(a = b = Array).from(x)` -
            // the outermost assignment is an observable side effect lost when receiver is
            // dropped. emit becomes `(a = Array, _Array$from)(x)`. instance dispatch wouldn't
            // reach here (routes through replaceInstanceLike above), so no risk of duplicating
            // with memoize-captured assignment
            const allEffects = prependChainAssignmentEffect(path.node.object, meta.sideEffects);
            replacePath.replaceWith(withSideEffects(id, allEffects));
            normalizeOptionalChain(replacePath, !wasOptional);
            if (wasOptional) {
              // walk through ParenthesizedExpression / ChainExpression / TS wrappers when
              // searching the dangling optional parent. without the peel, ESTree-mode chain
              // shapes (`ChainExpression(OptionalMemberExpression(...))`) and TS wrappers
              // hide the actual user-written `?.` from the immediate parent check, leaving
              // grandparent .optional dangling against a now-non-optional left side
              let p = replacePath.parentPath;
              while (p?.node && (TS_EXPR_WRAPPERS.has(p.node.type)
                  || p.node.type === 'ParenthesizedExpression'
                  || p.node.type === 'ChainExpression')) {
                p = p.parentPath;
              }
              if (p?.node?.optional) deoptionalizeNode(p);
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
        // sibling plugin may have detached the path between detect-entries scanning the
        // body and our callback firing (rare race: another entry-detector running ahead
        // and removing siblings invalidates path indices). `path.remove()` on a stale
        // path throws "We can't replace this node, we've already been removed". the
        // orphan guard mirrors `shouldSkipPath`'s `isOrphaned` check used by the
        // usage-* visitors, applied here so entry-global has equivalent staleness handling
        if (isOrphaned(path)) return;
        // `createEntryVisitors` hands us every specifier-less import; mark only actual
        // core-js entries so `import 'lodash'` doesn't mask "entry not found"
        debugOutput?.markEntryFound();
        injectModulesForEntry(entry);
        // indirect-require SE prefix preservation: `(spy(), require)('core-js/...')` passes
        // `getEntrySource` via the SequenceExpression tail peel, but removing the whole
        // statement would silently drop `spy()`. extract observable side effects from the
        // prefix slots so they still run at runtime. side-effect-free prefix (e.g. `0` in
        // `(0, require)(...)`) drops as expected. only the require shape carries this risk:
        // `import 'core-js/...'` / `await import('core-js/...')` / TSImportEqualsDeclaration
        // have no caller-side prefix slot to lose
        const sePrefix = extractIndirectRequireSEPrefix(path.node);
        // directive-promotion guard: when an EXISTING directive prologue terminates at this
        // entry and the next sibling is a string-literal expression, removal would silently
        // promote that literal to a directive (e.g. `"use asm"` enabling asm.js). swap in
        // `0;` to keep the prologue terminated. compat-data may produce an empty module set
        // for modern targets - removal alone is the corruption to guard. babel lifts module-
        // level directives into `program.directives[]` (outside `body[]`), so a non-empty
        // directives array is the prologue signal here
        const programNode = path.parentPath?.node;
        const body = programNode?.body;
        const idx = typeof path.key === 'number' ? path.key : body?.indexOf(path.node);
        const hasPriorDirective = (programNode?.directives?.length ?? 0) > 0;
        if (sePrefix.length) {
          path.replaceWithMultiple(sePrefix.map(e => t.expressionStatement(e)));
          return;
        }
        if (body && idx >= 0
          && wouldPromoteDirectiveAfterRemoval({ body, entryIndex: idx, hasPriorDirective })) {
          path.replaceWith(t.expressionStatement(t.numericLiteral(0)));
          return;
        }
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
        toHint,
        resolvedType,
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
        // pre-walk for monkey-patches. cheap single AST traversal; result consulted by
        // `usagePureCallback` before substituting `Object.key` reads. internal core-js
        // files don't need the gate (they manage their own globals)
        mutatedStatics = isInternalCoreJS ? null : collectMutatedStaticMembers(path.node);
        // source wins over sourceType: CJS-assign at top level of a `sourceType: "module"` file
        // would otherwise produce mixed `import` + `module.exports` output
        importStyle = importStyleOption ?? (!hasTopLevelESM(path.node)
          && (path.node.sourceType === 'script' || detectCommonJS(path.node)) ? 'require' : 'import');
        injector = new ImportInjector({ t, programPath: path, pkg, packages, mode, importStyle, absoluteImports });
        skippedNodes = new WeakSet();
        // re-instantiate per-file so the emitter's closure-captured `skippedNodes` ref
        // points to the freshly-allocated WeakSet (skippedNodes is reassigned, not mutated)
        synthSwap = createSynthSwapEmitter({
          adapter, injectPureImport, resolvePure, skippedNodes, t,
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
          resolvedType,
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
        // `directives === true` signals `disable-file` - collapse both skip sources into one write.
        // body[0] may be a sibling-plugin-synthesized node WITHOUT `.start` (helper class
        // declaration, generator helper, etc.); using its undefined start would trip
        // `parseDisableDirectives`'s "no firstStmtStart -> file-wide disable" branch on any
        // top-of-file directive comment, producing a false-positive whole-file skip. scan
        // for the first body node that carries a real `.start` so the boundary check stays
        // anchored at user code
        const firstStmtStart = path.node.body.find(n => n?.start !== undefined)?.start;
        const directives = isInternalCoreJS ? null : parseDisableDirectives({
          comments, offsetToLine: undefined, firstStmtStart, ast: path.node,
        });
        const fileDisabled = directives === true;
        skipFile = isInternalCoreJS || fileDisabled;
        disabledLines = fileDisabled ? null : directives;
        // minifier-shape `(prefixExpr, ..., ({pat} = R));` collapses a destructure assignment into
        // the last slot of an ExpressionStatement-wrapped SequenceExpression. `canTransformDestructuring`
        // peels only Paren+TS so the rewrite silently bails on this shape; split it into consecutive
        // ExpressionStatements before any usage / entry visitor sees the program (side-effecting prefix
        // expressions stay in source order). gated below skipFile so a `core-js-disable-file` directive
        // or internal core-js source is returned verbatim, not rewritten (entry-global needs it too,
        // so the gate is `!skipFile`, not the narrower entry exclusion below)
        if (!skipFile) splitMinifierSequenceDestructure(path, t);
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

      // augment a visitor set with the CatchClause extractor so a catch binding still gets its
      // destructure-derived instance polyfill in the contexts the main traversal doesn't reach:
      // a deferred SE-prefix (`(g(()=>{try{}catch({at}){at()}}),Array)`) and sibling-injected
      // helper bodies. `destructureEmit` is read lazily so the per-file emitter is always current
      function withCatchExtractor(visitors) {
        return { ...visitors, CatchClause: path => destructureEmit.extractCatchClause(path) };
      }

      // re-traversing an inserted SE can itself trigger `deferSideEffect` (nested destructuring
      // inside the lifted SE, e.g. `const { of } = (innerCall(), Array)` in an arrow body).
      // loop until the queue stays empty so nothing is silently dropped; termination is
      // guaranteed by bounded AST depth - each iteration processes a deeper level
      function processDeferredSideEffects(path) {
        // postHook nulls `destructureEmit`; subsequent unexpected callers (sibling plugin
        // re-entering programExit, multi-file batch where preTraverse early-returned
        // before initFile re-allocated the emitter) would otherwise destructure-crash on null
        if (!destructureEmit) return;
        const { deferredSideEffects } = destructureEmit;
        while (deferredSideEffects.length) {
          const batch = deferredSideEffects.splice(0).sort(batchOrder);
          const inserted = new Set();
          for (const { body, index, node } of batch) {
            body.splice(index, 0, node);
            inserted.add(node);
          }
          // deferred SE is `cloneDeep` of user-written init prefix - the cloned nodes
          // weren't visited by main traversal, so walking with full `usageVisitors` (incl.
          // walkAnnotations) is correct. `helperVisitors` (walkAnnotations=false) targets
          // sibling-plugin-injected helper bodies (already TS-stripped), wrong contract
          // here. usage-pure case: usageVisitors === helperVisitors so behaviour identical
          if (!usageVisitors) continue;
          const deferredVisitors = withCatchExtractor(usageVisitors);
          path.traverse({
            ExpressionStatement(p) {
              if (!inserted.delete(p.node)) return;
              p.traverse(deferredVisitors);
              if (!inserted.size) p.stop();
            },
          });
        }
      }

      // --- pre(): main traverse before other plugins (TS types alive, destructuring intact) ---

      function preTraverse(path, visitors) {
        // defensive - sibling plugin may have destroyed Program before our pre fires.
        // primitive-state reset BEFORE any early-return so a missing initFile leaves the
        // plugin in a known-clean shape rather than carrying state across files (see
        // `resetPerFilePrimitives` docstring for the full rationale)
        resetPerFilePrimitives();
        if (!path?.node) return;
        initFile(path);
        if (skipFile) return;
        path.traverse(visitors);
        processDeferredSideEffects(path);
        // emit visitor-collected imports BEFORE synth-swap apply: each flush unshift's
        // at program top, so imports added between flushes land ABOVE the previous batch.
        // matches the historical two-phase emission shape (synth-swap imports on top
        // because they were emitted from programExit, after pre's flush) which existing
        // fixtures encode
        injector?.flush();
        // drain registered synth-swap receivers BEFORE other plugins run their visitors:
        // sibling transforms (transform-parameters extracting param defaults to body var
        // declarations, transform-destructuring rewriting ObjectPatterns) typically clone
        // AST nodes, breaking node-identity lookup. applying here lets the synth literal
        // ride along with whatever rewrite happens downstream. programExit's apply pass
        // handles any synth-swap registrations from `reTraverseHelperBodies` (sibling-
        // injected nodes), idempotent via per-pending `applied` flag
        synthSwap?.apply(path);
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
      // so even if helperVisitors === usageVisitors already re-visited a catch, no harm.
      // catch-clause coverage is attached HERE and in usage-pure pre() but NOT in usage-global
      // pre(): only usage-pure has the body-extract rewrite that synthesises destructure-derived
      // catch-clause bindings (`catch ({ at }) -> catch (_err) { const at = _err.at; ... }`),
      // so usage-global has nothing for the extractor to consume there.
      // skip when `originalBodyNodes` is null - that's a `core-js-disable-file` path
      // where preTraverse early-returned before the snapshot was taken (multi-file batch:
      // the previous file's postHook nullified `originalBodyNodes`); without the guard
      // `null.has(...)` throws TypeError on every body child here
      function reTraverseHelperBodies(path) {
        if (!originalBodyNodes) return;
        const helperWithCatch = withCatchExtractor(helperVisitors);
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
            // `import X = require()`) plus type-only TSImportEquals filtering. pass `idPath`
            // explicitly so the TS-runtime walk anchors at the reference site (catches
            // `function f() { enum Map; ... }` shadowing); without it the walk anchors at the
            // Program scope and misses nested TS-runtime bindings
            if (adapter.hasBinding(idPath.scope, idPath.node.name, idPath)) return;
            // post-sweep is usage-pure only: skip a global at a write position a frozen import
            // binding cannot occupy (same rationale as the primary pass) - UpdateExpression
            // operand (`Map++`) or for-of / for-in head bare-Identifier LHS (`for (Map of arr)`)
            if (isInUpdateOperand(idPath.parentPath) || isForXHeadAssignTarget(idPath)) return;
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
        // postHook nulls `injector` after a clean pre/programExit/post cycle; a SECOND
        // Program.exit firing on the same file (sibling plugin re-walking, or a multi-file
        // batch where this file's pre() bailed early but Program.exit still fires)
        // would crash inside `injector?.flush()` / `reorderImportRegion()` etc. on the
        // method calls of a null receiver. symmetric with postHook's own `if (!injector) return`
        if (!injector) return;
        // skipFile (`core-js-disable-file` directive or internal core-js source) means
        // pre() early-returned without a snapshot; running the postHook walk would
        // re-traverse helper bodies that the primary pass intentionally skipped, queue
        // synth-swap entries against an unflushed receiver map, and flush imports the
        // user explicitly suppressed. exit clean so no polyfill leaks into a disabled file
        if (skipFile) return;
        reTraverseHelperBodies(path);
        // helper-visitor re-traversal may itself queue SEs (nested destructuring inside a
        // helper body). drain before synth-swap so the lifted SE statements participate in
        // the same body-index ordering as the primary pass
        processDeferredSideEffects(path);
        postSweepUnboundGlobals(path);
        // drain deferred synth-swap receivers via program walk - finds receivers via
        // node-identity WeakMap regardless of where sibling plugins (transform-parameters
        // extracting param defaults to body var declarations) moved them. `?.` symmetric
        // with the preTraverse call at the head of program() - both gated on the same
        // factory-time conditional that may leave `synthSwap` undefined
        synthSwap?.apply(path);
        injector?.flush();
        finalizeInjector();
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

      // per-file primitive-state reset: skipFile / disabledLines / importStyle /
      // originalBodyNodes / skippedNodes. postHook nulls heap-allocated members
      // (injector, synthSwap, destructureEmit, debugOutput) explicitly but leaves
      // primitives intact across files - reset here before any early-return so a
      // multi-file batch where `initFile` skips (path.node missing) doesn't carry
      // the PREVIOUS file's `skipFile=true` into the next file's programExit
      function resetPerFilePrimitives() {
        skipFile = false;
        disabledLines = null;
        importStyle = null;
        originalBodyNodes = null;
        skippedNodes = new WeakSet();
      }

      // post-flush import-region housekeeping: canonical-sort the union of all flushed
      // polyfill imports (across pre + post-synth batches) into compat-data order;
      // normalize arrow-expression-body to block + lift trailing-`_ref` params into
      // `var _ref;`; drop refs that no remaining body site reads; re-anchor ref
      // declarations below the import region. ORDER MATTERS: normalize THEN prune so
      // prune walks the post-normalize scope bindings (arrow params are still params
      // pre-normalize; prune only sees block-scoped vars). shared between the main
      // `programExit` and entry-global's `post()` so both modes produce the same
      // canonical layout regardless of sibling-plugin import-injection timing
      function finalizeInjector() {
        if (!injector) return;
        injector.reorderImportRegion();
        injector.normalizeArrowRefParams();
        injector.pruneUnusedRefs();
        injector.reorderRefsAfterImports();
      }

      // wrap a plugin-lifecycle handler (pre / post / programExit / Program.exit visitor)
      // so any thrown error picks up the current file's id before re-propagation. babel
      // itself decorates errors with file context at top-level transform boundary, but
      // messages emitted from pre/post + programExit-deep helper calls round-trip without
      // it; this wrapper closes that gap. visitor handlers receive `this === pluginPass`
      // from babel just like pre/post, so the same wrapper covers all four call shapes
      function withFileTag(fn) {
        return function wrappedHandler(...args) {
          try {
            return fn.apply(this, args);
          } catch (error) {
            tagError(error, this?.file?.opts?.filename);
            throw error;
          }
        };
      }

      // --- mode-specific plugin objects ---

      /* eslint-disable prefer-arrow-callback -- pre/post handlers need babel's `this`
         (`this === pluginPass` with `.file.opts.filename` for `withFileTag` to read);
         arrow would inherit the enclosing IIFE-scope `this` and drop the file context */

      if (method === 'entry-global') {
        return {
          pre: withFileTag(function entryGlobalPre() {
            // mirror `preTraverse`'s defensive primitive reset before initFile (see
            // `resetPerFilePrimitives` docstring). guarantees known-clean shape
            // regardless of whether `initFile` sets these when path.node is non-null
            resetPerFilePrimitives();
            initFile(this.file.path);
            if (!skipFile) {
              // `runEntryDetection` unifies the dual dispatch (ExpressionStatement body
              // scan + ImportDeclaration traversal) so the caller doesn't thread a visitor
              // object through manual pre-call + filtered traverse
              runEntryDetection(this.file.path, entryGlobalCallback);
            }
            injector?.flush();
          }),
          visitor: {},
          post: withFileTag(function entryGlobalPost() {
            injector?.flush();
            // shared with the main `programExit` tail (`finalizeInjector`): canonical-sort
            // the import region across all flushes and lift trailing arrow-`_ref` params
            // so sibling-plugin imports inserted between our flushes don't leak above the
            // sorted polyfill region
            finalizeInjector();
            outputDebug();
            // mirror `postHook`'s closure-captured state cleanup so multi-file batch GC
            // bound is deterministic - without nulling, FILE A's injector + AST refs survive
            // until next `initFile` reassigns. entry-global doesn't use synthSwap /
            // destructureEmit / skippedNodes, so only `injector` + `debugOutput` apply
            injector = debugOutput = null;
          }),
        };
      }

      if (!isPure) {
        const syntaxVisitors = createSyntaxVisitors({
          injectModulesForModeEntry, injectModulesForEntry, isDisabled, isWebpack,
        });
        return {
          pre: withFileTag(function usageGlobalPre() {
            preTraverse(this.file.path, mergeVisitors(usageVisitors, syntaxVisitors));
          }),
          visitor: { Program: { exit: withFileTag(programExit) } },
          post: withFileTag(postHook),
        };
      }

      return {
        pre: withFileTag(function usagePurePre() {
          preTraverse(this.file.path, withCatchExtractor(usageVisitors));
        }),
        visitor: { Program: { exit: withFileTag(programExit) } },
        post: withFileTag(postHook),
      };
      /* eslint-enable prefer-arrow-callback -- restore at end of plugin-return block */
    })(),
    /* eslint-enable max-statements -- close defer-block opened above */
  };
}
