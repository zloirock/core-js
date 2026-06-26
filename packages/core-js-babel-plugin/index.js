import {
  ESM_MARKER_TYPES,
  detectCommonJS,
  extractIndirectRequireSEPrefix,
  hasTopLevelESM,
  isAssignOrForXWriteTargetPath,
  isDeleteTarget,
  isForXWriteTarget,
  isInUpdateOperand,
  isMemberWriteHost,
  isThisReceiver,
  getMinifierSequenceDestructureExpressions,
  isMutatedStaticMeta,
  isTSTypeOnlyIdentifierPath,
  isTaggedTemplateTag,
  peelNestedSequenceExpressions,
  peelSkippableWrappers,
  BRACE_STATEMENT_HOST_TYPES,
  TS_EXPR_WRAPPERS,
  staticFallbackSwapRedundant,
  resolveBatchDirectivePromotionPolicy,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { enrichMutatedStatics } from '@core-js/polyfill-provider/detect-usage/mutation-prepass';
import { planInExpression } from '@core-js/polyfill-provider/helpers/in-expression';
import { createClassHelpers, remapInheritedStaticMeta } from '@core-js/polyfill-provider/helpers/class-walk';
import { tagError } from '@core-js/polyfill-provider/helpers/error-tag';
import { isCoreJSFile } from '@core-js/polyfill-provider/helpers/path-normalize';
import { mergeVisitors, parseDisableDirectives } from '@core-js/polyfill-provider/helpers/source-scan';
import { createResolveNodeType } from '@core-js/polyfill-provider/resolve-node-type';
import { createPolyfillResolver } from '@core-js/polyfill-provider/resolver';
import { createModuleInjectors } from '@core-js/polyfill-provider/plugin-options/inject';
import { createUsageGlobalCallback } from '@core-js/polyfill-provider/plugin-options/usage-callback';
import { enumerateFallbackDestructureBranches } from '@core-js/polyfill-provider/detect-usage/destructure';
import { isKnownGlobalName } from '@core-js/polyfill-provider/detect-usage/globals';
import {
  isAliasProxyHopChain,
  prependChainAssignmentEffect,
  receiverSideEffectsOnly,
  resolveKey as sharedResolveKey,
} from '@core-js/polyfill-provider/detect-usage/resolve';
import { resolveSymbolIteratorEntry } from '@core-js/polyfill-provider/detect-usage/members';
import { isPolyfillableOptional } from '@core-js/polyfill-provider/detect-usage/annotations';
import { coreJSImportRemovalKeptCallee, scanExistingCoreJSImports } from '@core-js/polyfill-provider/detect-usage/entries';
import { resolve as resolveBuiltIn } from '@core-js/polyfill-provider';
import createASTHelpers from './internals/babel-compat.js';
import ImportInjector from './internals/import-injector.js';
import {
  collectMutationPrePass,
  createBabelAdapter,
  createSyntaxVisitors,
  createUsageVisitors,
  USAGE_VISITORS_IS_HANDLED,
  USAGE_VISITORS_RESET,
} from './internals/detect-usage.js';
import runEntryDetection from './internals/detect-entry.js';
import createDestructureEmitter from './internals/destructure-emitter.js';
import createSynthSwapEmitter from './internals/synth-swap-emitter.js';

// minifier-shape pre-pass: `(prefixExpr, ..., ({pat} = R), ...);` collapses a destructure
// assignment into ANY slot of a statement-position SequenceExpression (minified tail,
// comma-joined statements, nested sequences) - the destructure-emitter gate would silently
// bail without this split. shape detection is shared with unplugin's
// text-rewrite path via `getMinifierSequenceDestructureExpressions` (unplugin's symmetric
// pre-pass routes through `forEachStatementListBody` over the raw AST). walks every
// Statement-list host - Program + descendant BlockStatement / StaticBlock / TSModuleBlock -
// so function / loop / try / class-static / namespace bodies are covered too; a Program-only
// walk would silently bail destructure-emitter inside non-Program statement lists
// climb a babel path through transparent runtime wrappers (parens / ChainExpression / TS cast / non-null)
// to the underlying expression path, so receiver navigation reaches the real node a TS cast or paren hides
function peelWrapperPath(p) {
  while (p?.node && (TS_EXPR_WRAPPERS.has(p.node.type)
    || p.node.type === 'ChainExpression' || p.node.type === 'ParenthesizedExpression')) {
    p = p.get('expression');
  }
  return p;
}

function splitMinifierSequenceDestructure(programPath, t) {
  // a split product can ITSELF be a minifier-sequence nested in the SAME statement list (e.g.
  // `(a, (b, ({x} = R)), ({y} = S))` - the middle operand is a sequence-destructure too). the
  // post-split traverse only re-reaches NEW brace hosts, never the host's own statement list, so the
  // fixpoint loop below re-runs over the LIVE body until none remain. each pass strictly reduces the
  // remaining nesting, so this cap mirrors unplugin's text-rewrite fixpoint as a safety backstop only
  const MINIFIER_SPLIT_PASS_CAP = 64;
  // returns true when at least one statement was split this pass, so the caller can loop to a fixpoint
  function splitStatementList(statementPaths) {
    let didSplit = false;
    for (const bodyPath of statementPaths) {
      const expressions = getMinifierSequenceDestructureExpressions(bodyPath.node);
      if (!expressions) continue;
      didSplit = true;
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
    return didSplit;
  }
  // re-run over the LIVE statement list (re-read each pass, since replaceWithMultiple mutates it)
  // until a pass splits nothing - so split products that are themselves minifier-sequences are caught
  function splitListToFixpoint(getPaths) {
    for (let pass = 0; pass < MINIFIER_SPLIT_PASS_CAP; pass++) {
      if (!splitStatementList(getPaths())) break;
    }
  }
  function splitInBody(blockPath) {
    splitListToFixpoint(() => blockPath.get('body'));
  }
  splitInBody(programPath);
  // the brace-delimited statement-list hosts as a babel-traverse union visitor key (Program is the
  // traverse root, handled by the direct splitInBody(programPath) above). SwitchCase's `consequent`
  // slot hosts the case body under a different slot name, so a separate visitor reaches it
  const braceHostVisitorKey = [...BRACE_STATEMENT_HOST_TYPES].join('|');
  programPath.traverse({
    [braceHostVisitorKey]: splitInBody,
    SwitchCase(path) {
      splitListToFixpoint(() => path.get('consequent'));
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
    // `adapter` (and its per-file `mutatedStatics`) is created below; the closure only runs during
    // traversal, after init, so the deferred reference is safe
    isMutatedStatic: (object, key) => adapter.isMutatedStatic(object, key),
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
    resolvePure: resolvePureUnfiltered,
    resolvePureOrGlobalFallback,
    resolveUsage,
  } = resolver;
  // pre-pass result: set of `"ObjectName.keyName"` strings the user mutated somewhere in
  // the current file (`Array.from = X`, `[Array.from] = X`, `delete Array.from`, ...).
  // factory-scoped so the resolvePure filter and the adapter getter see the per-file value
  let mutatedStatics = null;
  // a static the user monkey-patches must never bind to the frozen receiver-less import:
  // every pipeline (member emission, destructure props, param synth) resolves through this
  // filter, so the read keeps flowing through the substituted constructor instead
  const resolvePure = (meta, path) => isMutatedStaticMeta(meta, mutatedStatics) ? null : resolvePureUnfiltered(meta, path);

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

  // per-plugin-instance adapter - closure reads current `injector` without module-level state.
  // `method` lets the shared resolver gate the receiver-drop soundness check to usage-pure
  const adapter = createBabelAdapter(() => injector, method, () => mutatedStatics);

  // third arg `path` (when supplied by `extractCheck`) anchors `adapter.hasBinding` at
  // the reference site so TS-runtime shadows (`enum`, `namespace`, `import X = require()`)
  // mask polyfill replacement correctly. without it, the lookup defaults to the path's
  // outer scope and misses nested TS-runtime bindings
  // forward reference: `resolveStaticInheritedMember` is built per-file in `createClassHelpers`
  // below, after this top-level helper. captured by closure so `super.from?.()` resolves its
  // inherited static for the optional-chain deopt check (set in initFile before traversal)
  let resolveSuperStaticFn = null;
  function skipPolyfillableOptional(node, scope, path) {
    return isPolyfillableOptional({
      node, scope, path, adapter, resolve: resolveBuiltIn, resolveSuperStatic: resolveSuperStaticFn,
      mutatedSet: mutatedStatics,
    });
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
      // per-file count of modules injected by entry expansion - a non-zero count means the
      // emitted import block breaks the directive prologue, making `0;` placeholders moot
      let entryModulesInjected = 0;
      // entry import paths collected in entry-global pass 1, decided as a BATCH in pass 2 (after the
      // TOTAL module count is known) via the shared `resolveBatchDirectivePromotionPolicy` - so a
      // zero-module entry near the prologue can't see an incremental `0` and emit a spurious `0;`
      let entryDirectiveCandidates = [];
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

      function handleSymbolIterator(path, sideEffects, receiverEffectCount, symbolReceiverProxyRoot) {
        // polyfill helper loses `super`-binding (reads ancestor prototype's iterator, not
        // current class's); let the native runtime form stand for `super[Symbol.iterator]`
        if (t.isSuper(path.node.object)) return;
        // peel `arr[Symbol.iterator]!()` etc. so the call parent is recognised. resolve the entry +
        // viability BEFORE skipping the computed key below: if the get-iterator(-method) entry is
        // excluded we bail, leaving the `Symbol.iterator` KEY for the regular static-symbol rewrite
        // (`globalThis.Symbol.iterator` -> `_Symbol$iterator`), which subsumes the proxy-global root.
        // skipping it first then bailing stranded a raw `globalThis` (ie:11 ReferenceError) / left the
        // broken `_globalThis.Symbol.iterator` (`_globalThis.Symbol` is undefined in the pure variant)
        const callerPath = unwrapTSExpressionParent(path);
        const entry = resolveSymbolIteratorEntry(callerPath.node, callerPath.parent);
        if (!isEntryNeeded(entry)) return;
        // collapse a proxy-global receiver to its ROOT pure import (provider-resolved): `globalThis.self[
        // Symbol.iterator]` -> `_getIteratorMethod((droppedSe, _globalThis))`, NOT a leaf `_self` / dead
        // `_globalThis.self.window` that diverges from unplugin. `_<root>` is always defined; droppedSe is
        // the SE the dropped hop chain carried (hop keys + chain-root call), re-emitted as a sequence prefix
        if (symbolReceiverProxyRoot) {
          const rootResolved = resolvePure({ kind: 'global', name: symbolReceiverProxyRoot.rootName }, path);
          if (rootResolved) {
            const rootBinding = injectPureImport(rootResolved.entry, rootResolved.hintName);
            const { droppedSe } = symbolReceiverProxyRoot;
            path.node.object = droppedSe.length
              ? t.sequenceExpression([...droppedSe.map(effect => t.cloneNode(effect)), rootBinding])
              : rootBinding;
          }
        }
        // a proxy-global receiver DEEPER than the immediate symbol hop (`(c++, globalThis.self).Array.prototype
        // [Symbol.iterator]`) is not covered by symbolReceiverProxyRoot (it resolves only the hop directly before
        // the symbol); collapse it through the shared receiver collapse so it matches unplugin - a raw
        // `globalThis.self` off the deeper chain reads undefined off-engine. no-op once already collapsed
        if (synthSwap && path.scope
          && (path.node.object?.type === 'MemberExpression' || path.node.object?.type === 'OptionalMemberExpression')) {
          const collapsedRecv = synthSwap.collapseProxyGlobalReceiver(path.node.object, { scope: path.scope, adapter, path });
          if (collapsedRecv) path.node.object = collapsedRecv;
        }
        if (path.node.computed) {
          // meta.sideEffects carries the key prefix; a side-effecting receiver is hoisted ahead of
          // it by the emit (hoistReceiverSE) so order holds. skip the SequenceExpression TAIL (the
          // Symbol.iterator member) + wrappers so it is not also polyfilled in place
          let cur = peelNestedSequenceExpressions(path.node.property).tail;
          while (cur) {
            skippedNodes.add(cur);
            if (TS_EXPR_WRAPPERS.has(cur.type) || cur.type === 'ParenthesizedExpression') cur = cur.expression;
            else break;
          }
        }
        const hint = entry === 'get-iterator' ? 'getIterator' : 'getIteratorMethod';
        const id = injectPureImport(entry, hint);
        // thread `meta.sideEffects` through to the replacement helpers. detect-usage
        // captures SE during dispatch (e.g. inline-call receiver `(() => arr)()[Symbol.iterator]()`
        // where the SE-bearing receiver is the MemberExpression object); without forwarding,
        // those effects silently dropped when the parent call gets rewritten
        if (entry === 'get-iterator') replaceCallWithSimple(path, id, skipPolyfillableOptional, sideEffects, receiverEffectCount);
        else replaceInstanceLike({ path, id, skipOptional: skipPolyfillableOptional, sideEffects, receiverEffectCount });
      }

      // destructure rewrite pipeline (parameter-default synth-swap entry, top-level extraction,
      // nested proxy-global flatten, catch-clause receiver). instantiated per-file in `initFile`
      // so closure-captured per-file state stays in sync; public `handleObjectPropertyResult` /
      // `extractCatchClause` become local consts so existing call sites stay unchanged
      let destructureEmit;

      const {
        resolveStaticInheritedMember,
        isInheritedStaticLookup,
        isInStaticContext,
        isShadowedByClassOwnMember,
        reset: resetClassHelpers,
      } = createClassHelpers({ t, adapter, resolveKey: sharedResolveKey, getInjector: () => injector });
      // wire the forward reference so the top-level optional-chain deopt check can resolve supers
      resolveSuperStaticFn = resolveStaticInheritedMember;

      const usageGlobalCallback = createUsageGlobalCallback({
        resolveUsage,
        injectModulesForModeEntry,
        isDisabled,
        resolveStaticInheritedMember,
        isInheritedStaticLookup,
        isInStaticContext,
        isShadowedByClassOwnMember,
        enumerateFallbackBranches: (meta, path) => enumerateFallbackDestructureBranches(meta, path, adapter, resolvePure),
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
          if (slot !== cur.node) {
            // a stale LIST index is NOT an orphan: a sibling insert (e.g. a memoize `var _ref;`
            // pushed ahead of this statement) shifts the container, and babel@8 re-keys cached
            // ancestor paths lazily, so `cur.key` can point past the node while it still lives at
            // a new index. fall back to membership - a genuine remove/replace (node absent from
            // the list, or any non-list slot mismatch) stays orphaned
            if (cur.listKey && parentNode[cur.listKey]?.includes(cur.node)) continue;
            return true;
          }
        }
        // root: a sibling plugin may have installed a new Program (`file.ast.program = clone`)
        // while keeping the old tree reachable through our cached paths. the slot-check above
        // never hit Program because it has no parentPath. compare against the file's current
        // program node - stale roots produce orphan emission into a detached AST. a
        // `currentProgram ? ... : false` ternary would default to "not orphan" whenever
        // the hub / file / ast / program chain is undefined - missing the case where the
        // sibling plugin REMOVED `file.ast.program` outright (rare but plausible in test
        // harnesses or aggressive AST swaps). comparing directly lets the inequality run
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
      // the single-call path, including through a TS-cast wrapper (`(globalThis as any).flat?.()`):
      // the memo reuses the original receiver node, so leaving its inner proxy-global visitable
      // lets the Identifier visitor substitute it (`_ref = _globalThis as any`) instead of stranding
      // a raw global. unplugin's combined-chain delegates to the same receiver resolver for parity
      function markCombinedChainConsumed({ chainStartNode, innerCallee }) {
        skippedNodes.add(chainStartNode);
        skippedNodes.add(innerCallee);
        if (innerCallee.property) skippedNodes.add(innerCallee.property);
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

      // `X in Y` rewrite. The branch decision and side-effect harvest live in the shared
      // planInExpression; here we only render the chosen shape into babel AST
      function handleInExpression(meta, path) {
        const plan = planInExpression({
          meta,
          left: path.node.left,
          right: path.node.right,
          isEntryNeeded,
          resolveFallback: m => resolvePureOrGlobalFallback(m, path),
        });
        if (plan.kind === 'noop') return;
        // cloneNode keeps the harvested SE / arg subtrees independent of the replaced tree -
        // defensive against sibling plugins that might hold a reference to the old nodes
        const lhsSe = plan.leadingSe.map(e => t.cloneNode(e));
        function withLhsSe(core) {
          return lhsSe.length ? t.sequenceExpression([...lhsSe, core]) : core;
        }
        if (plan.kind === 'symbol') {
          const id = injectPureImport(plan.entry, plan.hint);
          if (plan.call) {
            path.replaceWith(withLhsSe(t.callExpression(id, [t.cloneNode(plan.right)])));
          } else {
            // swap only the LHS in place so the RHS keeps its visited state (not re-traversed)
            path.get('left').replaceWith(id);
            if (lhsSe.length) path.replaceWith(t.sequenceExpression([...lhsSe, path.node]));
          }
          return;
        }
        // fold: the polyfill is always defined, so the membership test is constantly true
        path.replaceWith(withLhsSe(t.booleanLiteral(true)));
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
            // `isForXWriteTarget` marks every same-shape member in a for-of/in BODY (not just the head) as
            // part of the write set. `isMemberWriteHost` adds the immediate write hosts (`=` / update / `delete` /
            // destructuring) AND climbs TS-cast / paren wrappers: a cast-wrapped LHS (`(globalThis.window.Set as
            // any) = fn`) reads as `isReferenced` above (the cast IS a read position), so without it the member
            // whole-swaps to the imported `_Set` const - reassigning a frozen import
            if (isForXWriteTarget(path) || isMemberWriteHost(path)) return;
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
            // this-receiver dispatch cannot route through the substituted constructor object
            // (the patch lives on the namespace, not the prototype chain) - keep the bail
            if (inheritedStatic && isMutatedStaticMeta(meta, mutatedStatics)) return;
            if (isTaggedTemplateTag(path.parent, path.node, meta.placement) && path.key === 'tag') return;
            if (meta.key === 'Symbol.iterator') {
              return handleSymbolIterator(path, meta.sideEffects, meta.receiverEffectCount, meta.symbolReceiverProxyRoot);
            }
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
          // a kept SE-bearing inline-call receiver already yields the polyfill binding through its
          // own rewritten return leaf - leave the member untouched, the inner visits do the job
          if (staticFallbackSwapRedundant(path.node.object, meta.sideEffects)) return;
          const id = injectPureImport(fallback.entry, fallback.hintName);
          // a `prototype`-placement fallback (`globalThis.Map.prototype.has`) swaps only the CTOR sub-
          // receiver (`globalThis.Map`, possibly through proxy hops) to `_Map`, KEEPING `.prototype` ->
          // `_Map.prototype.has`; swapping the whole receiver (`globalThis.Map.prototype`) would drop
          // `.prototype` -> the undefined `_Map.has`. a static placement swaps the whole receiver. peel
          // transparent wrappers (parens / TS cast / non-null) on the `.prototype` receiver so a TS-wrapped
          // one (`((c++, globalThis.self).Map.prototype as any).has`) reaches the ctor sub-receiver `X.Map`
          const receiverPath = meta.placement === 'prototype'
            ? peelWrapperPath(path.get('object')).get('object')
            : path.get('object');
          // mirror the main static-rewrite branch (`replacePath.replaceWith(withSideEffects(
          // id, allEffects))` below): preserve `meta.sideEffects` (computed-key SE in the
          // original member access) AND `prependChainAssignmentEffect` over the receiver
          // (chain-assignment `(a = X).noStatic` writes to `a` are observable; the receiver
          // replacement drops them). without this, `(called++, Promise).noSuchStatic`
          // fallback silently rewrites to `_Promise.noSuchStatic` losing the `called++`.
          // receiver-only: the computed `[key]` property SURVIVES this swap and re-runs its own SE,
          // so prepend only the receiver-SE (dropping the trailing key-SE) to avoid double-eval.
          // `protoCtorReceiverSE`: a SE-sequence buried in a prototype ctor sub-receiver
          // (`(c++, globalThis.self).Map.prototype.has`) the receiver-SE collect couldn't reach - re-emit so
          // the `_Map` swap keeps the `c++` (`(c++, _Map).prototype.has`)
          const baseEffects = prependChainAssignmentEffect(receiverPath.node,
            receiverSideEffectsOnly(meta.receiverEffectCount, meta.sideEffects)) ?? [];
          const allEffects = meta.protoCtorReceiverSE ? [...meta.protoCtorReceiverSE, ...baseEffects] : baseEffects;
          receiverPath.replaceWith(withSideEffects(id, allEffects));
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
          // an ALIAS-rooted proxy-hop chain whose leaf is NON-polyfilled (`const g = globalThis; new
          // g.self.Array(3)` / `g['self'].Array.isArray(...)`) has no leaf usage and no `kind:'global'`
          // trigger on the alias root, so the redundant `.self` / `.window` hop survives, reading an
          // undefined hop off the alias off-engine (ie:11 / Node). `isAliasProxyHopChain` is the shared
          // provider detection; peel to the root path and collapse (which self-gates on the hop again)
          const aliasCtx = path.scope ? { scope: path.scope, adapter, path } : null;
          if (synthSwap && isAliasProxyHopChain(path.node, aliasCtx, true)) {
            let rootPath = path;
            while (rootPath.isMemberExpression() || rootPath.isOptionalMemberExpression()) rootPath = rootPath.get('object');
            synthSwap.collapseProxyHopRoot(rootPath, aliasCtx);
          }
          return;
        }

        const { entry, kind, hintName } = result;

        // a proxy-global root (`globalThis`) navigating a NON-pure leaf through redundant proxy hops
        // (`globalThis.self.Array`) must collapse the hops, else the bare identifier swap leaves
        // `_globalThis.self.Array` reading an undefined `.self` off the global off-engine (ie:11 / Node).
        // a pure-ctor leaf is whole-swapped by the synth-swap path; a bare root collapses to nothing
        if (kind === 'global' && !path.isObjectProperty()
          && synthSwap?.collapseProxyHopRoot(path, path.scope ? { scope: path.scope, adapter, path } : null)) return;

        if (path.isObjectProperty()) {
          destructureEmit.handleObjectPropertyResult({ prop: path, meta, kind, entry, hintName });
        } else {
          // the inherited-static-resolves-to-instance bail lives in the provider's `resolvePureWith`
          // now (single-sourced with usage-global's `resolveUsage`), so `result` is already null here
          // for that shape and the `inheritedStatic && !result` bail above caught it
          const id = injectPureImport(entry, hintName);
          if (kind === 'instance') {
            // a SE-wrapped proxy-global RECEIVER (`(c++, globalThis.self).Array.prototype.flat`) is skipped by
            // the natural visitors: the provider marks the wrapped root handled (expecting a collapse), but the
            // bare-receiver collapse runs in the secondary Identifier visit, which the handled-mark suppresses.
            // collapse the receiver's proxy hops explicitly - climb to its proxy root (a SequenceExpression keeps
            // its consuming member directly above, so the shared collapse needs no sequence-walk) and route
            // through the same `collapseProxyHopRoot` the alias-hop-chain branch uses. without this the emit reads
            // off a raw `(c++, globalThis.self).Array.prototype` whose `.self` is undefined off-engine (ie:11)
            if (synthSwap && path.scope) {
              // peel transparent wrappers (parens / TS cast / non-null) while climbing so a TS-wrapped receiver
              // (`((c++, globalThis.self).Array.prototype as any).flat`) reaches its proxy root and collapses
              // its hops like the unwrapped form, instead of leaving `_globalThis.self` (undefined off-engine,
              // diverging from unplugin which drops it)
              let recvRoot = peelWrapperPath(path.get('object'));
              while (recvRoot.isMemberExpression() || recvRoot.isOptionalMemberExpression()) {
                recvRoot = peelWrapperPath(recvRoot.get('object'));
              }
              synthSwap.collapseProxyHopRoot(recvRoot, { scope: path.scope, adapter, path });
            }
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
            replaceInstanceLike({
              path, id, skipOptional: skipPolyfillableOptional,
              sideEffects: meta.sideEffects, receiverEffectCount: meta.receiverEffectCount,
            });
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
            const allEffects = prependChainAssignmentEffect(path.node.object, meta.sideEffects, meta.receiverEffectCount);
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
        // the entry-global pass hands us every specifier-less import; mark only actual
        // core-js entries so `import 'lodash'` doesn't mask "entry not found"
        debugOutput?.markEntryFound();
        entryModulesInjected += injectModulesForEntry(entry);
        // DEFER the remove / `0;`-promotion decision to the pass-2 batch (below): the directive-
        // promotion view must be the file's TOTAL injected count, not the incremental subset visible
        // when THIS entry is processed left-to-right. module injection only REGISTERS (the body is
        // unchanged until `flush()`), so this path stays valid for pass 2
        entryDirectiveCandidates.push(path);
      }

      // entry-global pass 2: partition every collected entry into remove / `0;`-promotion through the
      // shared batch resolver, fed the TOTAL injected-module count. mirrors unplugin's `detectEntries`
      // so the directive-promotion decision is single-sourced in the provider (no incremental fork).
      // babel lifts module-level directives into `program.directives[]`, so a non-empty array is the
      // prologue signal. `body.indexOf` reads the live (pre-flush) order; module imports flush after
      function applyEntryDirectivePromotions(programPath) {
        if (!entryDirectiveCandidates.length) return;
        const { body, directives } = programPath.node;
        const hasPriorDirective = (directives?.length ?? 0) > 0;
        const nodeToPath = new Map();
        const candidateIndices = [];
        for (const path of entryDirectiveCandidates) {
          const idx = body.indexOf(path.node);
          if (idx === -1) continue;
          nodeToPath.set(path.node, path);
          candidateIndices.push(idx);
        }
        candidateIndices.sort((a, b) => a - b);
        const { toRemove, toReplaceWithNoop } = resolveBatchDirectivePromotionPolicy({
          body, candidateIndices, hasPriorDirective, injectedImportsBreakPrologue: entryModulesInjected > 0,
        });
        const replaceSet = new Set(toReplaceWithNoop);
        for (const node of [...toRemove, ...toReplaceWithNoop]) {
          const path = nodeToPath.get(node);
          if (!path) continue;
          // indirect-require SE prefix preservation takes precedence: `(spy(), require)('core-js/...')`
          // passes detection via the SequenceExpression tail peel, but raw removal drops `spy()`. the
          // emitted prefix statements already break the prologue, so no `0;` placeholder is needed; a
          // side-effect-free prefix (`(0, require)(...)`) yields none and drops as expected
          const sePrefix = extractIndirectRequireSEPrefix(node);
          if (sePrefix.length) {
            path.replaceWithMultiple(sePrefix.map(e => t.expressionStatement(e)));
          } else if (replaceSet.has(node)) {
            path.replaceWith(t.expressionStatement(t.numericLiteral(0)));
          } else {
            path.remove();
          }
        }
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
        resolvePure,
      };
      const usageVisitors = method !== 'entry-global' ? createUsageVisitors({
        ...commonVisitorOptions,
        suppressProxyGlobals: isPure,
        walkAnnotations: !isPure,
        // gates proxy-global receiver suppression on the member resolving to a real pure
        // replacement (usage-pure only - usage-global never suppresses proxy receivers)
        resolveMeta: isPure ? resolvePure : undefined,
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
        // pre-walk for monkey-patches, consulted by `usagePureCallback` before substituting
        // `Object.key` reads - so it is needed ONLY in usage-pure (entry-global / usage-global
        // never read `mutatedStatics`, the whole-AST walk was dead work there, matching unplugin).
        // internal core-js files don't need it either (they manage their own globals)
        mutatedStatics = method === 'usage-pure' && !isInternalCoreJS ? collectMutationPrePass(path, adapter).mutated : null;
        // source wins over sourceType: CJS-assign at top level of a `sourceType: "module"` file
        // would otherwise produce mixed `import` + `module.exports` output
        importStyle = importStyleOption ?? (!hasTopLevelESM(path.node)
          && (path.node.sourceType === 'script' || detectCommonJS(path.node)) ? 'require' : 'import');
        injector = new ImportInjector({ t, programPath: path, pkg, packages, mode, importStyle, absoluteImports });
        skippedNodes = new WeakSet();
        // re-instantiate per-file so the emitter's closure-captured `skippedNodes` ref
        // points to the freshly-allocated WeakSet (skippedNodes is reassigned, not mutated)
        synthSwap = createSynthSwapEmitter({
          adapter, injectPureImport, injector, resolvePure, skippedNodes, t,
        });
        destructureEmit = createDestructureEmitter({
          adapter,
          generateRef,
          paramDefaultNeverOverridden: typeResolvers.paramDefaultNeverOverridden,
          resolvePure,
          generateLocalRef,
          generateUnusedId,
          getDebugOutput: () => debugOutput,
          injector,
          injectPureImport,
          isDisabled,
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
        // minifier-shape `(prefixExpr, ..., ({pat} = R), ...);` collapses a destructure assignment into
        // any slot of an ExpressionStatement-wrapped SequenceExpression. `canTransformDestructuring`
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
              if (!removed.has(stmt.node)) continue;
              // an indirect-require removal keeps the callee (its SE prefix); a plain import drops whole
              const keptCallee = coreJSImportRemovalKeptCallee(stmt.node);
              if (keptCallee) stmt.get('expression').replaceWith(t.cloneNode(keptCallee));
              else stmt.remove();
            }
          }
          // mutated-key enrichment runs AFTER the scan registers the user's existing pure imports, so
          // `injectPureImport` dedups a mutated key against a same-entry user import instead of emitting
          // a duplicate (scan-before-enrich, mirroring unplugin). pure-only: it pins pure entries
          if (method === 'usage-pure') {
            enrichMutatedStatics({ mutatedStatics, resolvePure: resolvePureUnfiltered, injectPureImport });
          }
        }
      }

      // --- deferred side effects: splice into body, re-traverse for polyfills ---

      // descending `index` so later splices don't shift earlier ones in the same body;
      // descending `seq` breaks ties deterministically (later-generated first)
      const batchOrder = (a, b) => b.index - a.index || b.seq - a.seq;

      // augment a visitor set with the unconditional proxy-hop trigger: an anchored plan must
      // fire even when NO leaf resolves (`{ Map: { customY } } = globalThis` - the point is
      // the re-anchored residual), so leaf-driven dispatch alone cannot cover it. lives in
      // the MAIN traversal - the dedicated normalize pre-pass traverse is retired
      function withProxyHopTrigger(visitors) {
        return mergeVisitors(visitors, {
          'VariableDeclarator|AssignmentExpression': {
            enter(path) { destructureEmit.tryFlattenProxyHopHost(path); },
          },
        });
      }

      // augment a visitor set with the CatchClause extractor so a catch binding still gets its
      // destructure-derived instance polyfill in the contexts the main traversal doesn't reach:
      // a deferred SE-prefix (`(g(()=>{try{}catch({at}){at()}}),Array)`) and sibling-injected
      // helper bodies. `destructureEmit` is read lazily so the per-file emitter is always current.
      // catch extraction is a usage-pure-only body-extract rewrite; usage-global only adds
      // side-effect imports and must NOT restructure a catch param, so gate HERE - this is the
      // single point every caller (deferred-SE drain, helper-body re-traversal) routes through,
      // so none can attach it in usage-global. without the gate, a sibling-injected helper catch
      // (`catch ({ at, ...rest })`) reachable from reTraverseHelperBodies gets needlessly rewritten
      function withCatchExtractor(visitors) {
        if (!isPure) return visitors;
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
        // multi-decl split canon AFTER the SE drain - deferred indices were captured
        // against the pre-split body
        destructureEmit.splitFlatMultiDecls();
        // emit visitor-collected imports BEFORE synth-swap apply: each flush unshift's
        // at program top, so imports added between flushes land ABOVE the previous batch.
        // keeps synth-swap imports on top - the two-phase emission ordering existing
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

      // one whole-program post-sweep for built-ins a sibling transform injects AFTER our pre-pass.
      // BOTH methods need it: usage-pure SUBSTITUTES the introduced reference (`Promise`->`_Promise`),
      // usage-global INJECTS the side-effect import - either way the reference surfaced after pre() ran,
      // so the primary pass never saw it. two shapes:
      //   - raw globals (regenerator mutating a node in-place to `Promise`, `using` referencing
      //     `SuppressedError`). a sibling-introduced bare global lands here whenever it is not otherwise
      //     covered; current transforms happen to put such globals in helper bodies (swept by
      //     reTraverseHelperBodies) or beside instance methods that pull the constructor in transitively,
      //     but neither is guaranteed, so this is the backstop - an isolated bare-global reference (no
      //     helper, no co-located method) reaches a polyfill ONLY through here
      //   - statics inlined into an EXISTING statement (babel@8 emits `Object.assign(...)` for object
      //     spread under setSpreadProperties; the rest-spread plugin skips it, so pre() never saw it).
      //     an introduced static is `<global>.<static>`, synthetic (no source position); source members
      //     carry a position and were already handled in pre(). shape alone is NOT enough to isolate it
      //     (see the member visitor: the plugin's own proxy chains share the shape) - the object must
      //     also be a real polyfillable global
      // `core-js-disable-file` is honored upstream (programExit returns before this runs); a line-level
      // disable cannot reach an introduced node - it has no source position to match against disabledLines
      function postSweepIntroduced(path) {
        const memberHandler = helperVisitors?.['MemberExpression|OptionalMemberExpression'];
        // entry-global has no usage visitor (it replaces an entry import, never detects usage), so
        // there is nothing to sweep - skip the whole-program walk
        if (!memberHandler) return;
        const isHandled = usageVisitors?.[USAGE_VISITORS_IS_HANDLED];
        path.traverse({
          'MemberExpression|OptionalMemberExpression'(member) {
            const obj = member.node.object;
            // gate the object on `isKnownGlobalName`, NOT shape alone: the plugin's own synthetic
            // members (`_globalThis.Array` proxy chains, `_Array$from.call` substitution wrappers)
            // ALSO present as `<Identifier>.<static>` with the object unresolved by `getBinding`
            // (the injected import binding is invisible to scope) - shape cannot tell them from a
            // sibling-introduced `Object.assign`. requiring the object to be a real polyfillable
            // global excludes those synth names (`_globalThis` / `_Array$from` are not globals);
            // the handler then makes the polyfillability call (bails on already-handled / no-polyfill)
            if (typeof member.node.start !== 'number' && obj?.type === 'Identifier'
              && isKnownGlobalName(obj.name) && !member.scope.getBinding(obj.name)) memberHandler(member);
          },
          Identifier(idPath) {
            if (!idPath.isReferencedIdentifier()) return;
            // adapter.hasBinding (vs raw `getBindingIdentifier`) folds in TS-runtime shadows
            // estree-toolkit & babel scope miss (`enum`, `namespace`, `const enum`,
            // `import X = require()`) plus type-only TSImportEquals filtering. pass `idPath`
            // explicitly so the TS-runtime walk anchors at the reference site (catches
            // `function f() { enum Map; ... }` shadowing); without it the walk anchors at the
            // Program scope and misses nested TS-runtime bindings
            if (adapter.hasBinding(idPath.scope, idPath.node.name, idPath)) return;
            // skip a global at a write position - UpdateExpression operand (`Map++`), for-of /
            // for-in head bare-Identifier LHS (`for (Map of arr)`), or assignment LHS (`Map = x`,
            // `Map ||= x`). for usage-pure a frozen import binding cannot occupy that slot, so this is
            // required; for usage-global it is harmless - the primary pass over-injects at writes, but
            // a sibling never INTRODUCES a write-position global (the introduced shapes are all reads),
            // and a global being overwritten needs no polyfill anyway. a TS-non-null / paren wrapper
            // (`Map! ||= x`, `for (Map! of arr)`) keeps `isReferencedIdentifier` true, so the for-x /
            // assignment checks peel transparent ancestors first
            if (isInUpdateOperand(idPath.parentPath) || isAssignOrForXWriteTargetPath(idPath)) return;
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
        // helper-body re-traversal may have touched fresh multi-decl declarations
        destructureEmit.splitFlatMultiDecls();
        postSweepIntroduced(path);
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
        entryModulesInjected = 0;
        entryDirectiveCandidates = [];
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
              applyEntryDirectivePromotions(this.file.path);
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
            // mirror `postHook`'s closure-captured state cleanup so multi-file batch GC bound is
            // deterministic - without nulling, FILE A's injector + AST refs survive until the next
            // initFile reassigns. entryGlobalPre runs the SAME `initFile`, which allocates synthSwap
            // / destructureEmit / skippedNodes too: entry-global never USES them, but they still pin
            // the AST (destructureEmit captures injector -> programPath), so null them all here
            injector = synthSwap = destructureEmit = skippedNodes = originalBodyNodes = debugOutput = null;
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
          preTraverse(this.file.path, withProxyHopTrigger(withCatchExtractor(usageVisitors)));
        }),
        visitor: { Program: { exit: withFileTag(programExit) } },
        post: withFileTag(postHook),
      };
      /* eslint-enable prefer-arrow-callback -- restore at end of plugin-return block */
    })(),
    /* eslint-enable max-statements -- close defer-block opened above */
  };
}
