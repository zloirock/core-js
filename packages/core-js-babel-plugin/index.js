import {
  collectFoldedReceiverSideEffects,
  memberProxyHopName,
  asProxyGlobalName,
  deleteHostAboveChain,
  claimIsInert,
  ESM_MARKER_TYPES,
  detectCommonJS,
  extractIndirectRequireSEPrefix,
  hasTopLevelESM,
  isAssignOrForXWriteTargetPath,
  claimDeleteOperand as isDeleteOperand,
  isDeleteTarget,
  isForXWriteTarget,
  isInUpdateOperand,
  isMemberWriteHost,
  isThisReceiver,
  isDeoptedGlobalSlotRead,
  mutatedSlotLeftNativeWarning,
  isMutatedStaticMeta,
  isTSTypeOnlyIdentifierPath,
  collectFileCensus,
  methodReadsUsageCensus,
  memberKeyName,
  memberKeyNamesReducer,
  mutatedGlobalSlotNames,
  isTaggedTemplateTag,
  nestedSequenceValueSpelling,
  peelNestedSequenceExpressions,
  unwrapRuntimeExpr,
  TS_EXPR_WRAPPERS,
  staticFallbackSwapRedundant,
  resolveBatchDirectivePromotionPolicy,
  keptNavChainEndPath,
  memberChainEndPath,
  peelParenAndTSSlotPath,
  peelSkippableWrapperPath,
  subtreeContainsNode,
  isDestructurePattern,
  TRANSPARENT_EXPR_WRAPPER_TYPES,
  usableAliasInfo,
  isMemberAccessNode,
  POSSIBLE_GLOBAL_OBJECTS,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import {
  navHoldsMintedSeCall, ownEmittedNavClaim, ownOutputTests, restSentinelNamesReducer,
} from '@core-js/polyfill-provider/detect-usage/own-output';
import {
  enrichMutatedStatics, escapedCtorReferencesReducer, mutationShapesReducer,
} from '@core-js/polyfill-provider/detect-usage/mutations';
import { isSymbolIteratorPatternProp } from '@core-js/polyfill-provider/detect-usage/destructure-plan';
import { planMinifierSequenceSplit } from '@core-js/polyfill-provider/destructure-host-shape';
import { planInExpression } from '@core-js/polyfill-provider/helpers/in-expression';
import {
  createClassHelpers,
  ctorAliasShapesReducer,
  proxyWriteOriginsReducer,
  registerAliasPrePassSite,
  remapInheritedStaticMeta,
} from '@core-js/polyfill-provider/helpers/class-walk';
import { tagError } from '@core-js/polyfill-provider/helpers/error-tag';
import {
  hostSlot,
  nullFirstGuardTest,
  renderBoundRawBranch,
  renderCtorIdentityNarrow,
  renderInExpressionPlan,
  renderShortCircuitGuard,
} from '@core-js/polyfill-provider/render';
import estreeToBabel from './internals/estree-to-babel.js';
import { isCoreJSFile, isDeclarationFile } from '@core-js/polyfill-provider/helpers/path-normalize';
import {
  DISABLE_NEXT_LINE_DIRECTIVE,
  disableDirectiveAnchors,
  isNextLineDisableDirective,
  mergeVisitors,
  parseDisableDirectives,
} from '@core-js/polyfill-provider/helpers/source-scan';
import { createResolveNodeType } from '@core-js/polyfill-provider/resolve-node-type';
import { createPolyfillResolver } from '@core-js/polyfill-provider/resolver';
import { createModuleInjectors } from '@core-js/polyfill-provider/plugin-options/inject';
import { createUsageGlobalCallback } from '@core-js/polyfill-provider/plugin-options/usage-callback';
import {
  attachMemberUnionExtras,
  enumerateFallbackDestructureBranches,
  renameSplitPropsToSentinels,
} from '@core-js/polyfill-provider/detect-usage/destructure';
import { isKnownGlobalName } from '@core-js/polyfill-provider/detect-usage/globals';
import {
  aliasHeldClaimProbe,
  aliasRootedReadMayThrow,
  callValueCanBeUndefined,
  inlineCallHasObservableEffects,
  inlineCallProxyGlobalRoot,
  resolveObjectName,
  isAliasProxyHopChain,
  sealedChainBoundary,
  ownChainOptionalObjects,
  prependChainAssignmentEffect,
  descendToChainRoot,
  deleteHostAboveCarriedChain,
  peelReceiverSequenceTail,
  probeRenderedReceiver,
  probeRunIsTheSourceValue,
  proxyReceiverValueCanBeUndefined,
  staticMayEraseReceiver,
  storedUserAssignmentOf,
  partitionEffectsAtProbe,
  unbackedRealmHopFoldAbove,
  undefinableOptionalGuard,
  receiverSideEffectsOnly,
  resolveKey as sharedResolveKey,
  globalProxyMemberName,
} from '@core-js/polyfill-provider/detect-usage/resolve';
import {
  planGuardedDestructureNarrow,
  isSourcedSymbolIteratorMeta, planGuardedStaticNarrow, resolveSymbolIteratorEntry, SYMBOL_ITERATOR_PURE_RESULT, symbolIteratorHint,
} from '@core-js/polyfill-provider/detect-usage/members';
import { isPolyfillableOptional, mutatedStaticLandingVerdict } from '@core-js/polyfill-provider/detect-usage/annotations';
import { scanExistingCoreJSImports } from '@core-js/polyfill-provider/detect-usage/entries';
import { resolve as resolveBuiltIn } from '@core-js/polyfill-provider';
import createASTHelpers, {
  deoptionalizeAstNode,
  destructuredValueAbove,
  isOptionalNode,
} from './internals/babel-compat.js';
import ImportInjector from './internals/import-injector.js';
import {
  collectMutationPrePass,
  createBabelAdapter,
  createSyntaxVisitors,
  createUsageVisitors,
  instantiationSlotNeedsParens,
  foldInstantiationsPass,
  restoreParenCompensations,
  rebuildLaggedScopeBinding,
  USAGE_VISITORS_IS_HANDLED,
  USAGE_VISITORS_RELEASE_HANDLED,
  USAGE_VISITORS_RESET,
} from './internals/detect-usage.js';
import runEntryDetection from './internals/detect-entry.js';
import createDestructureEmitter from './internals/destructure-emitter.js';
import createSynthSwapEmitter from './internals/synth-swap-emitter.js';

// the minifier-sequence split, applied as body surgery ahead of the traversal: the plan is the
// core's (`planMinifierSequenceSplit` - the shape, the products, their spans), this binding
// converts the products, inherits the replaced statement's attached comments the way
// `replaceWithMultiple` does, and splices them in by identity. a node splice, not a path
// replacement: the products are visited like any other statement once the program's body is
// walked, and there is nothing queued yet to re-queue. an un-braced control-flow slot is braced
// around its products with the host's own block. accepted: a comment between two operands of a
// ONE-LINE sequence prints inline before its product on this pass (`/* c */use(at);`) and on its
// own line after a re-parse - the generator lays a leading block comment by the previous
// statement's line, and the products share it by design (their spans are the entry gate's and the
// opt-out's provenance). bytes differ between the first two passes, nothing else does: the import
// set, the claims and the honoured opt-outs are the same on every pass
function splitMinifierSequence(programPath, t) {
  for (const { statements, host, key, statement, products } of planMinifierSequenceSplit(programPath.node, { embed: hostSlot })) {
    const converted = products.map(product => estreeToBabel(product));
    t.inheritLeadingComments(converted[0], statement);
    t.inheritTrailingComments(converted[converted.length - 1], statement);
    if (statements) statements.splice(statements.indexOf(statement), 1, ...converted);
    else host[key] = t.blockStatement(converted);
  }
}

export default function plugin(api, options) {
  const { types: t, caller } = api;
  // set at program entry, read by the late-bound compat callbacks below
  let currentSynthSwap = null;
  // late-bound like `currentSynthSwap`: the usage visitors exist only inside the program visit,
  // and the emitters reach their handled-marks release through here
  let currentUsageVisitors = null;

  // `getPolyfillBindingEntry` / `getPolyfillBindingHint` read `injector` lazily (assigned in
  // Program enter, declared below) - same late-binding closure pattern as `createASTHelpers`
  // / `createBabelAdapter`. entry path resolves polyfilled-static aliases (`const from =
  // Array.from` after rewrite). hint covers BOTH pure-import bindings (`_Array$from` -> entry
  // `array/from` -> hint `Array`) AND alias-only bindings (`_globalThis` registered via
  // `registerGlobalAlias`, no standalone entry path) so the proxy-global recognizer reaches
  // `extends g.Array<...>` after the in-place `globalThis` -> `_globalThis` rewrite
  const typeResolvers = createResolveNodeType(node => node?.type, t, {
    // a GUARDED alias registration (refused flow-trust) must not feed the type channel: its
    // hint would narrow member types over a flow the registration explicitly refused to trust
    // `useStart` (the use-site node's start) anchors the injector's name-keyed view
    // positionally: a USER-named body-extract record serves only inside its hosting scope span
    getPolyfillBindingEntry(scope, name, useStart = null) {
      return usableAliasInfo(injector?.getBindingInfo?.(name, useStart))?.entry ?? null;
    },
    getPolyfillBindingHint(scope, name, useStart = null) {
      return usableAliasInfo(injector?.getBindingInfo?.(name, useStart))?.hint ?? null;
    },
    isReassignedBinding(name, binding) { return injector?.isReassignedBinding?.(name, binding) ?? false; },
    // babel loses a binding from its scope registry after the destructure-assignment alias
    // rewrite while the declaration survives in the AST; without the recovery the resolver's
    // reassignment follow degrades to generic where the estree side keeps the narrow
    getScopeBinding(scope, name, path = null) {
      return scope?.getBinding(name) ?? (path ? rebuildLaggedScopeBinding(path, name) : null);
    },
    // `adapter` (and its per-file `mutatedStatics`) is created below; the closure only runs during
    // traversal, after init, so the deferred reference is safe
    isMutatedStatic: (object, key) => adapter.isMutatedStaticSlot(object, key),
  });
  const {
    resolveClaimableComputedKeyName, resolvePropertyObjectType, resolveNodeType, resolvedType, toHint,
  } = typeResolvers;

  const { resolver, createDebugOutput } = createPolyfillResolver(options, {
    typeResolvers,
    // the per-file mutation census the ENTRY choice consults (a ctor whose members cannot be
    // named carries its own statics); `adapter` is built below, so the closure defers like the
    // type layer's twin above
    isMutatedStatic: (object, key) => adapter.isMutatedStatic(object, key),
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
        return unwrapRuntimeExpr(parent.callee) === node;
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
  // typing asks a YES/NO about ONE namespace, and the cheap census the shared walk already produced
  // answers it: its target roots are a SUPERSET of what a scoped walk could attribute, so a namespace
  // none of them names is provably untouched, and an over-report only degrades a narrow (over-inject,
  // the safe direction in usage-global). the scoped pre-pass stays where its completeness is required.
  // the READING of those roots is the provider's - `adapter.isMutatedStaticSlot`
  let mutationRoots = null;
  // the census's container-slot record, held in its own per-file slot rather than read off the
  // census: the mutation pre-pass shares the read canons, and those consult this record - so the
  // window it runs in must not see it, or the walk that REGISTERS a patch through a written slot
  // bails on the very record its own writes feed. the unplugin twin nulls the same pair
  let writtenContainerSlots = null;
  let fileCensus = null;
  // a static the user monkey-patches must never bind to the frozen receiver-less import:
  // every pipeline (member emission, destructure props, param synth) resolves through this
  // filter, so the read keeps flowing through the substituted constructor instead
  function resolvePure(meta, path) {
    return isMutatedStaticMeta(meta, mutatedStatics) ? null : resolvePureUnfiltered(meta, path);
  }

  let injector, importStyle, debugOutput;
  // one debug note per DEOPTED global name per file (fired lazily at the first suppressed read)
  let deoptNotedNames = new Set();
  function noteDeoptedGlobal(name) {
    if (deoptNotedNames.has(name)) return;
    deoptNotedNames.add(name);
    debugOutput?.warn(mutatedSlotLeftNativeWarning(name, mutatedStatics));
  }

  const {
    isInTypeAnnotation,
    deoptionalizeDanglingOptionalParent,
    emitGuardedClaim,
    isRenderedPlanTail,
    navGuardTestNode,
    collapseKeptNavValueNode,
    collapseClaimlessCallRootedNav,
    collapseShortCircuitNavInPlace,
    probedNavGuardValueNode,
    renderWriteHostProbeGuard,
    sealedClaimThrowProbeNode,
    flushKeptNavCollapseAt,
    keptNavHopClaimSuppressed,
    flushKeptNavCollapses,
    markThrowingExtraction,
    generateRef,
    generateLocalRef,
    generateUnusedId,
    isWrappedInParens,
    normalizeOptionalChain,
    replaceInstanceLike,
    replaceInstanceChainCombined,
    replaceCallWithSimple,
    withSideEffects,
    reset: resetASTHelpers,
  } = createASTHelpers(t, {
    getInjector: () => injector,
    getAdapter: () => adapter,
    typeResolvers,
    resolvePureGlobalEntry(name, path = null) {
      return resolvePure({ kind: 'global', name }, path);
    },
    resolvePureStaticEntry(object, key, path = null) {
      return resolvePure({ kind: 'property', object, key, placement: 'static' }, path);
    },
    resolvePurePrototypeEntry(object, key, path = null) {
      return resolvePure({ kind: 'property', object, key, placement: 'prototype' }, path);
    },
    // late-bound like getInjector: the per-file injector exists only inside the program visit
    injectPureGlobal(entry, hintName) {
      debugOutput?.add(entry);
      return injector.addPureImport(entry, hintName);
    },
    // late-bound like the injector - the synth-swap emitter exists only inside the program visit.
    // only its receiver-collapse half is wanted here, for a chain the guard channel found no real
    // probe on
    // the detector marks a claimed receiver's hops handled because the claim's render owns them.
    // an emitter that re-emits the receiver BY IDENTITY breaks that premise, so it says so here and
    // the hops claim for themselves on the re-visit
    releaseHandledNode(node) {
      currentUsageVisitors?.[USAGE_VISITORS_RELEASE_HANDLED]?.(node);
    },
    collapseReceiverHops(receiver, path, { hopsOnly = false } = {}) {
      const swap = currentSynthSwap?.();
      return swap && path?.scope
        ? swap.collapseProxyGlobalReceiver(receiver, { hopsOnly, aliasCtx: { scope: path.scope, adapter, path } })
        : null;
    },
  });

  const isWebpack = caller?.(c => c?.name === 'babel-loader');

  // per-plugin-instance adapter - closure reads current `injector` without module-level state.
  // `method` lets the shared resolver gate the receiver-drop soundness check to usage-pure
  const adapter = createBabelAdapter({
    getInjector: () => injector,
    method,
    getMutatedStatics: () => mutatedStatics,
    getWrittenContainerSlots: () => writtenContainerSlots,
    getMutationRoots: () => mutationRoots,
    getPackages: () => packages,
  });

  // forward references into `createClassHelpers` below: assigned once, right after that call and
  // before any traversal, so the optional-chain deopt check can resolve `super.from?.()` to its
  // inherited static and reject an own-member shadow of `this.X`
  let resolveSuperStaticFn = null;
  let isShadowedByClassOwnMemberFn = null;
  // dead Optional*-typed links (optional: false) around a swapped receiver print with a
  // parenthesized chain boundary under babel codegen where the unplugin emitter spells plain -
  // retype them in BOTH directions from the slot, stopping at a genuine `?.`
  function retypeDeadOptionalLinks(path) {
    for (let p = path; p && isOptionalNode(p.node) && !p.node.optional; p = p.parentPath) {
      deoptionalizeAstNode(p.node);
    }
    for (let d = path.node.object; d && isOptionalNode(d) && !d.optional; d = d.object ?? d.callee) {
      deoptionalizeAstNode(d);
    }
  }

  // is this member the OPERAND of a `delete`? transparent wrappers (parens as a NODE, TS casts) sit
  // between them in one paren spelling and not the other, so the climb peels them - the same rule the
  // shared write-host predicate applies to its own hosts
  function skipPolyfillableOptional(node, scope, path) {
    return isPolyfillableOptional({
      node, scope, path, adapter, resolve: resolveBuiltIn, resolveSuperStatic: resolveSuperStaticFn,
      mutatedSet: mutatedStatics, isShadowedByClassOwnMember: isShadowedByClassOwnMemberFn,
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
      // does the LATE paren pass have work on our OWN tree? the early pass answers it and OVERWRITES
      // this - the `true` is the reset value (`resetPerFilePrimitives`), so a file that never reaches
      // that pass at all (pre bailed on a destroyed Program, and with it `programExit`) still takes
      // the full walk. never OR the answer into it: the reset already made it true
      let parensPending = true;
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
      currentSynthSwap = () => synthSwap;

      function isDisabled(node) {
        return skipFile || (disabledLines !== null && disabledLines.has(node.loc?.start.line));
      }
      // the opt-outs this pass honoured reach the next pass through the printed tree: the canon
      // (`disableDirectiveAnchors`) names every outermost covered node the reprint would leave
      // without its directive, and this binding leads it the way babel's generator lays comments -
      // as the NEAREST comment of the node's own leading run, which is also where it reads whether
      // the author's directive already stands there. appended by hand: `t.addComment` prepends a
      // leading comment, and a directive with a comment under it covers that comment's line.
      // runs at the last reachable point (`post()`), on the tree the generator prints
      function anchorDisableDirectives(programNode) {
        if (!disabledLines || !programNode) return;
        function isLed(node) {
          const run = node.leadingComments;
          return !!run?.length && isNextLineDisableDirective(run[run.length - 1].value);
        }
        for (const node of disableDirectiveAnchors({ ast: programNode, disabledLines, isLed })) {
          (node.leadingComments ??= []).push({ type: 'CommentLine', value: ` ${ DISABLE_NEXT_LINE_DIRECTIVE }` });
        }
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
        const callerPath = peelParenAndTSSlotPath(path);
        // the MEMBER and the caller above it, the one convention all three callers now use -
        // the resolver peels the callee itself, so a seal or a TS wrapper needs no compensation
        const entry = resolveSymbolIteratorEntry(path.node, callerPath.parent);
        if (!isEntryNeeded(entry)) return;
        // collapse a proxy-global receiver to its ROOT pure import (provider-resolved): `globalThis.self[
        // Symbol.iterator]` -> `_getIteratorMethod((droppedSe, _globalThis))`, NOT a leaf `_self` / dead
        // `_globalThis.self.window` that diverges from unplugin. `_<root>` is always defined; droppedSe is
        // the SE the dropped hop chain carried (hop keys + chain-root call), re-emitted as a sequence prefix
        if (symbolReceiverProxyRoot) {
          // a KEPT root is an expression the provider may not root through (a chain-assign storing a value
          // that is not provably the global): it becomes the receiver as-is, with the redundant proxy hop
          // above it dropped (cloning suffices - the re-visit rewrites the raw root inside it). either way
          // the harvested droppedSe (sequence prefix around the root, dropped-hop key effects) rides ahead
          const keptClone = symbolReceiverProxyRoot.keepRoot
            ? t.cloneNode(symbolReceiverProxyRoot.keepRoot, true) : null;
          const rootResolved = keptClone ? null
            : resolvePure({ kind: 'global', name: symbolReceiverProxyRoot.rootName }, path);
          if (keptClone || rootResolved) {
            const rootBinding = keptClone ?? injectPureImport(rootResolved.entry, rootResolved.hintName);
            const { droppedSe } = symbolReceiverProxyRoot;
            // a following computed-key SE makes the NON-optional emit `peel` the receiver (classifyReceiverSE
            // returns 'peel' for a SequenceExpression receiver), and the peel replays only the prefix recorded
            // in `sideEffects` - so an inline `(droppedSe, _root)` receiver loses its droppedSe. route droppedSe
            // through the SE channel (receiver-SE ahead of the key-SE) so the hoist preserves + orders it. the
            // OPTIONAL access uses 'suppress' (memoizes the whole receiver in the null-guard), which preserves
            // the inline sequence's droppedSe already - leave it the tighter inline form. with no key-SE there
            // is no peel either, so keep the inline `_getIterator((droppedSe, _root))`. the optional verdict is
            // PROVIDER-decided at detection (flag-based, any hop depth) so both emitters agree - a babel-local
            // node-TYPE probe promotes whole chains where estree flags only the introducing hop
            const isOptional = symbolReceiverProxyRoot.isOptionalAccess;
            if (droppedSe.length && sideEffects?.length && !isOptional) {
              sideEffects = [...droppedSe.map(effect => t.cloneNode(effect)), ...sideEffects];
              receiverEffectCount += droppedSe.length;
              path.node.object = rootBinding;
            } else {
              path.node.object = droppedSe.length
                ? t.sequenceExpression([...droppedSe.map(effect => t.cloneNode(effect)), rootBinding])
                : rootBinding;
            }
            // replacing the object dropped the chain's `?.` hop along with the erased hops - a
            // KEPT root can be absent (unlike a substituted always-defined one), so re-hang the
            // guard on the symbol member itself: the null test reads the same value the native
            // chain short-circuits on
            if (keptClone && symbolReceiverProxyRoot.isOptionalAccess) {
              path.node.type = 'OptionalMemberExpression';
              path.node.optional = true;
            }
          }
        }
        // a proxy-global receiver DEEPER than the immediate symbol hop (`(c++, globalThis.self).Array.prototype
        // [Symbol.iterator]`) is not covered by symbolReceiverProxyRoot (it resolves only the hop directly before
        // the symbol); collapse it through the shared receiver collapse so it matches unplugin - a raw
        // `globalThis.self` off the deeper chain reads undefined off-engine. no-op once already collapsed
        if (synthSwap && path.scope
          && (path.node.object?.type === 'MemberExpression' || path.node.object?.type === 'OptionalMemberExpression')) {
          const collapsedRecv = synthSwap.collapseProxyGlobalReceiver(path.node.object, { aliasCtx: { scope: path.scope, adapter, path } });
          if (collapsedRecv) path.node.object = collapsedRecv;
        }
        if (path.node.computed) {
          // meta.sideEffects carries the key prefix; a side-effecting receiver is hoisted ahead of
          // it by the emit (hoistReceiverSE) so order holds. skip the SequenceExpression TAIL (the
          // Symbol.iterator member) + wrappers so it is not also polyfilled in place
          let cur = peelNestedSequenceExpressions(path.node.property).tail;
          while (cur) {
            skippedNodes.add(cur);
            if (TRANSPARENT_EXPR_WRAPPER_TYPES.has(cur.type)) cur = cur.expression;
            else break;
          }
        }
        const id = injectPureImport(entry, symbolIteratorHint(entry));
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
      } = createClassHelpers({
        t, adapter, resolveKey: sharedResolveKey, getInjector: () => injector, attachUnionExtras: attachMemberUnionExtras,
      });
      // wire the forward references so the top-level optional-chain deopt check can resolve
      // supers and reject own-static shadows of `this.X`
      resolveSuperStaticFn = resolveStaticInheritedMember;
      isShadowedByClassOwnMemberFn = isShadowedByClassOwnMember;

      const usageGlobalCallback = createUsageGlobalCallback({
        adapter,
        resolveUsage,
        injectModulesForModeEntry,
        isDisabled,
        resolveStaticInheritedMember,
        isInheritedStaticLookup,
        isInStaticContext,
        isShadowedByClassOwnMember,
        enumerateFallbackBranches(meta, path) {
          return enumerateFallbackDestructureBranches(meta, path, adapter, { resolvePure, followIndirection: true });
        },
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
        // DETACHMENT is this leg's own question - babel reports it as a stale container or an
        // orphaned path; the four SHAPE questions are the shared ones
        return (path.parentPath && !path.parentPath.container) || isOrphaned(path)
          || claimIsInert({ node: path.node, path, isDisabled, skippedNodes, isInTypeAnnotation });
      }

      // detect `(recv)?.inner?.(args).outer(args)` with polyfillable instance inner+outer;
      // resolve inner via callee path so `[].at` -> `_atMaybeArray` (not generic `_at`)
      function findInnerPolyChain(path) {
        if (!path.isOptionalMemberExpression()) return null;
        const outerCaller = peelParenAndTSSlotPath(path);
        // a GET tail over the same chain (`recv.m?.().at`) combines too: the standalone emit
        // memoizes the callee and rebuilds the optional call off it, which resolves the inner
        // method-get on a bare `_ref` and so loses the receiver type the chain still carries
        const parentCall = t.isCallExpression(outerCaller.parent) || t.isOptionalCallExpression(outerCaller.parent)
          ? outerCaller.parent : null;
        const outerCall = parentCall?.callee === outerCaller.node ? parentCall : null;
        // user parens on the callee END the chain: the outer call runs on whatever the chain
        // produced, so a short-circuited chain must make it THROW. combining folds that call's
        // arguments into the guard's alternate and returns void 0 instead - stand down and let the
        // paren-lookup emit, which keeps the call outside the ternary, take the shape. the
        // unplugin declines the same shape
        if (outerCall && isWrappedInParens(outerCaller)) return null;
        // rare but possible wrappers: ParenthesizedExpression (babel's
        // `createParenthesizedExpressions: true`) and ChainExpression (ESTree shape);
        // peel both or `(arr)?.at?.(0)` / `(arr?.at?.(0))` miss the inner-chain match
        let current = peelSkippableWrapperPath(path.get('object'));
        // outer call's immediate (wrapper-peeled) receiver. when the descent below crosses
        // non-optional Member/Call hops (`.map(...)` / `.slice(...)`) to reach the optional
        // inner, this differs from the inner - the combine then threads the surviving hops
        // onto the memoized inner result instead of dropping them (value corruption)
        const outerObjectNode = current.node;
        while (isOptionalNode(current.node)) {
          if (current.node.optional) break;
          current = peelSkippableWrapperPath(current.isOptionalMemberExpression() ? current.get('object') : current.get('callee'));
        }
        if (!current.isOptionalCallExpression() || !current.node.optional) return null;
        const callee = current.get('callee');
        const calleeNode = callee.node;
        if (calleeNode?.type !== 'MemberExpression' && calleeNode?.type !== 'OptionalMemberExpression') return null;
        if (calleeNode.computed || calleeNode.property?.type !== 'Identifier') return null;
        // `super.X?.().Y(args)` would lift `super` into a `(_ref = super)` memo on the
        // OR-chain template, but `super` is not a primary expression and the codegen
        // throws at parse time. let `super` chains fall through to the instance
        // transform's dedicated super-call handling instead
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
          outerIsCall: !!outerCall,
          // the combine SPLICES this call's memo into the hops above it, so their own dispatch
          // later resolves a receiver that no longer spells the chain - carry the pre-splice type
          // across, the way `annotateCallReturnType` does for a replaced callee. without it a hop
          // degrades to the generic helper (`_at`) where the same chain WITHOUT the `?.` resolves
          // the narrowed one (`_atMaybeArray`), and unplugin - which resolves hops off the
          // original path - keeps the narrowed one either way
          chainStartType: resolveNodeType(current),
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
        const callerPath = peelParenAndTSSlotPath(path);
        const callParent = callerPath.parentPath;
        if ((callParent?.isCallExpression() || callParent?.isOptionalCallExpression())
          && callParent.node.callee === callerPath.node) {
          const callExpr = t.callExpression(t.memberExpression(id, t.identifier('call')),
            [t.thisExpression(), ...callParent.node.arguments.map(a => t.cloneNode(a))]);
          callParent.replaceWith(withSideEffects(callExpr, sideEffects));
        } else {
          peelParenAndTSSlotPath(path).replaceWith(withSideEffects(id, sideEffects));
        }
      }

      // the probe node between the effect halves the shared rule splits
      function probeOrderedEffects(throwProbe, effects) {
        // the probe READ is an already-decided render - the alias arm spells it from a RAW
        // source read the member visitor would otherwise re-claim on insertion. the seed depth
        const { ahead, after } = partitionEffectsAtProbe(effects, throwProbe.navStart);
        skippedNodes.add(throwProbe.node);
        return [...ahead, throwProbe.node, ...after];
      }

      // `X in Y` rewrite. The branch decision and side-effect harvest live in the shared
      // planInExpression; here we only render the chosen shape into babel AST
      const foldedInTests = new WeakSet();
      function handleInExpression(meta, path) {
        // the wrap below re-queues the test it keeps; without this it would wrap its own wrap
        if (foldedInTests.has(path.node)) return;
        const plan = planInExpression({
          meta,
          left: path.node.left,
          right: path.node.right,
          isEntryNeeded,
          resolveFallback: m => resolvePureOrGlobalFallback(m, path),
          // typed-instance fold candidate: the receiver's resolved type hint (null for
          // unknown / static-receiver / symbol shapes - the plan gates on it)
          receiverHint: !meta.object && meta.key && !meta.symbolSourced
            ? toHint(resolveNodeType(path.get('right'))) : null,
          parent: path.parentPath?.node ?? null,
        });
        if (plan.kind === 'noop') return;
        const rendered = renderInExpressionPlan(plan, {
          injectImport: (entry, hint) => injectPureImport(entry, hint).name,
          embed: hostSlot,
          cloneSource: () => t.cloneNode(path.node),
        });
        if (rendered.swapLeft) {
          // swap only the LHS in place so the RHS keeps its visited state (not re-traversed)
          path.get('left').replaceWith(estreeToBabel(rendered.swapLeft));
          if (rendered.leadingSe.length) {
            path.replaceWith(t.sequenceExpression([
              ...rendered.leadingSe.map(effect => estreeToBabel(effect)), path.node]));
          }
          return;
        }
        const replacement = estreeToBabel(rendered.replace);
        // the kept membership test is re-queued by `replaceWith`; without the mark it would wrap
        // its own wrap. the helper form CONSUMES the operand the way `in` did, so a guard rendered
        // for the operand's own chain must stay INSIDE the argument - climbing out of the call
        // answers `undefined` where the source throws, and strands the memo it built
        if (plan.kind === 'fold-after-test') foldedInTests.add(replacement.expressions[0]);
        if (rendered.throwsAtTail) {
          markThrowingExtraction(replacement.type === 'SequenceExpression'
            ? replacement.expressions.at(-1) : replacement);
        }
        path.replaceWith(replacement);
      }

      // the instance rewrite REPLACES the parent call (`arr.at(0)` -> `_atMaybeArray(arr).call(arr, 0)`),
      // so the type it resolved to is gone from the tree the next member above reads: capture it
      // BEFORE the rewrite and hand it back after. the COMBINED render replaces a different path
      // than the one held here, so it takes the type as an argument and stamps its own replacement
      function captureInstanceCallType(path) {
        const callerPath = peelParenAndTSSlotPath(path);
        const callParent = callerPath.parentPath;
        const isCallParent = (callParent?.isCallExpression() || callParent?.isOptionalCallExpression())
          && callParent.node.callee === callerPath.node;
        const type = isCallParent ? resolveNodeType(callParent) : null;
        return type ? { callParent, type } : null;
      }

      function reattachInstanceCallType(captured) {
        if (captured?.callParent?.node) resolvedType.set(captured.callParent.node, captured.type);
      }

      // stash return type on CallExpression before callee replacement so downstream
      // resolveNodeType can still determine e.g. Promise.all -> Array
      function annotateCallReturnType(path) {
        const callerPath = peelParenAndTSSlotPath(path);
        const callParent = callerPath.parentPath;
        if (!(callParent?.isCallExpression() || callParent?.isOptionalCallExpression())
          || callerPath.parent.callee !== callerPath.node) return;
        const type = resolveNodeType(callParent);
        if (type) resolvedType.set(callParent.node, type);
      }

      // runtime ctor guard render: the DECISION (static entry, callee-ness, optional-call
      // bail, ctor comparator) is the shared provider plan; this only builds the AST -
      // `(M === _Map ? _Map$groupBy : M.groupBy)`, a callee raw branch binding `this` via
      // `.bind(M)`. the raw branch is skip-marked whole: the re-queued traversal must neither
      // re-enter this handler nor run the normal static substitution on it (the raw member is
      // the guard's live fallback - a narrow would corrupt the untaken flow)
      const guardedNarrowRendered = new WeakSet();
      function emitGuardedStaticNarrow(meta, path) {
        const memberNode = path.node;
        if (guardedNarrowRendered.has(memberNode)) return true;
        const plan = planGuardedStaticNarrow({
          memberNode, parent: peelParenAndTSSlotPath(path).parentPath?.node, meta, path, resolvePure,
        });
        if (!plan) return false;
        if (plan.bail) return true;
        // an effectful sequence prefix on the receiver runs ONCE, ahead of the test, exactly where
        // the source runs it - so the raw branch reads off the bare identifier instead of re-running
        // the sequence (`(n++, M === _Map ? _Map$groupBy : M.groupBy)`)
        const readNode = plan.seqPrefix.length
          ? t.memberExpression(t.cloneNode(plan.recvIdent),
            memberNode.computed ? t.cloneNode(memberNode.property) : t.identifier(memberNode.property.name),
            memberNode.computed)
          : memberNode;
        const rawBranch = plan.isCallee
          ? estreeToBabel(renderBoundRawBranch(hostSlot(t.cloneNode(readNode)), hostSlot(t.cloneNode(plan.recvIdent))))
          : readNode;
        guardedNarrowRendered.add(memberNode);
        // the whole chain is the canon's fold - one branch per candidate ctor, innermost-last.
        // the test reads the USER's binding, so its identifier is skipped like the raw branch's:
        // left live, the identifier visitor swapped it for the ponyfill wherever the binding NAME
        // is a global one (`var Map = Map`), and the test became `_Map === _Map` - constant true
        const narrow = estreeToBabel(renderCtorIdentityNarrow(plan, hostSlot(rawBranch), {
          injectImport: (entry, hintName) => injectPureImport(entry, hintName).name,
          spellRecv: () => {
            const testRecv = t.cloneNode(plan.recvIdent);
            skippedNodes.add(testRecv);
            return hostSlot(testRecv);
          },
        }));
        const guard = plan.seqPrefix.length
          ? t.sequenceExpression([...plan.seqPrefix.map(expr => t.cloneNode(expr)), narrow]) : narrow;
        t.traverseFast(rawBranch, n => skippedNodes.add(n));
        // the generator prints the `expr<T>` instantiation slot without the parens its precedence
        // needs (`c ? a : b<T>(x)` re-parses the call into the alternate, leaving the consequent
        // uninvoked; `tern as any<T>(x)` re-parses the type-argument list into a type) - walk the
        // wrapper chain above the replaced member and parenthesize the slot-filling node. the
        // slot is judged on what will OCCUPY it after the swap: at `cur === path` that is the
        // guard ternary, not the member being replaced.
        // this is the ONE paren node spelled before the lowerings rather than in `post()`, and it is
        // safe for a structural reason: what it wraps is `binding === ctor ? static : raw`, which
        // cannot hold an `await` or a `yield`, so regenerator never has to explode it. it is also
        // only reachable when the fold could not run - a foldable host takes the type arguments
        // during the usage traversal, and by the time this walk climbs there is no node left to find
        let instantiationSlot = null;
        for (let cur = path; cur.parentPath; cur = cur.parentPath) {
          const parentType = cur.parentPath.node?.type;
          if (parentType === 'TSInstantiationExpression') {
            if (instantiationSlotNeedsParens(cur === path ? guard : cur.node)) instantiationSlot = cur;
            break;
          }
          if (!TS_EXPR_WRAPPERS.has(parentType) && parentType !== 'ChainExpression'
            && parentType !== 'ParenthesizedExpression') break;
        }
        if (instantiationSlot === path) path.replaceWith(t.parenthesizedExpression(guard));
        else {
          path.replaceWith(guard);
          if (instantiationSlot) instantiationSlot.replaceWith(t.parenthesizedExpression(instantiationSlot.node));
        }
        return true;
      }

      // the DESTRUCTURED spelling of the same read (`const { groupBy: g } = M`): the guard renders as
      // the declarator's value, which is equivalent down to the throw - on a nullish receiver the raw
      // branch dereferences it exactly as the pattern would. sole-prop declarator shapes only; a
      // multi-prop pattern would need splitting, and a default / computed key has its own canon
      // the RAW branch of a guarded read is a member this very rule would narrow again on re-entry -
      // built and marked handled in one place, for the sole-prop render and every read of a split
      function markedRawBranch(readPlan, key) {
        const raw = t.memberExpression(t.cloneNode(readPlan.recvIdent), t.identifier(key));
        t.traverseFast(raw, node => skippedNodes.add(node));
        return raw;
      }

      // the residual the shared rename yields, in this leg's declarator - marked handled whole, since
      // the source's own props are gone from it
      function restResidualDeclarator(patternNode, plan) {
        const id = renameSplitPropsToSentinels(patternNode, () => generateUnusedId().name);
        const residual = t.variableDeclarator(id, t.cloneNode(plan.recvIdent));
        t.traverseFast(residual, node => skippedNodes.add(node));
        return residual;
      }

      function emitGuardedDestructureNarrow(meta, prop) {
        const pattern = prop.parentPath;
        const host = pattern?.parentPath;
        const admitted = planGuardedDestructureNarrow({
          propNode: prop.node,
          patternNode: pattern?.node,
          hostNode: host?.node,
          // the statement question is this leg's own: its parser records parens as `extra`, so the
          // TS-wrapper climb is what reaches the host's real statement
          hostInStatement: !!host?.isAssignmentExpression()
            && !!peelParenAndTSSlotPath(host).parentPath?.isExpressionStatement(),
          meta,
          path: prop,
          resolvePure,
        });
        if (!admitted) return false;
        const { plan, split, restResidual, bindingName, hostKind } = admitted;
        const rawBranch = markedRawBranch(plan, meta.key);
        const narrow = estreeToBabel(renderCtorIdentityNarrow(plan, hostSlot(rawBranch), {
          injectImport: (entry, hintName) => injectPureImport(entry, hintName).name,
          spellRecv: () => hostSlot(t.cloneNode(plan.recvIdent)),
        }));
        const value = plan.seqPrefix.length
          ? t.sequenceExpression([...plan.seqPrefix.map(expr => t.cloneNode(expr)), narrow]) : narrow;
        // a MULTI-prop pattern becomes one read per prop, in source order, each taking its own guard:
        // the plan answered for all of them, so nothing here waits on a later visit
        if (split) {
          const reads = split.map(item => estreeToBabel(renderCtorIdentityNarrow(item.plan,
            hostSlot(markedRawBranch(item.plan, item.key)), {
              injectImport: (entry, hintName) => injectPureImport(entry, hintName).name,
              spellRecv: () => hostSlot(t.cloneNode(item.plan.recvIdent)),
            })));
          if (hostKind === 'declarator') {
            const declaration = host.parentPath;
            const at = declaration.node.declarations.indexOf(host.node);
            declaration.node.declarations.splice(at, 1,
              ...split.map((item, index) => t.variableDeclarator(t.identifier(item.name), reads[index])),
              // the REST reads the same receiver BEHIND the reads, with every consumed key renamed
              // to a sentinel so it still gathers exactly what the source left it
              ...restResidual ? [restResidualDeclarator(pattern.node, plan)] : []);
          } else {
            const statement = peelParenAndTSSlotPath(host).parentPath;
            statement.replaceWith(t.expressionStatement(t.sequenceExpression(
              split.map((item, index) => t.assignmentExpression('=', t.identifier(item.name), reads[index])))));
          }
          return true;
        }
        if (hostKind === 'declarator') {
          host.node.id = t.identifier(bindingName);
          host.node.init = value;
        } else if (hostKind === 'assignment-statement') {
          host.node.left = t.identifier(bindingName);
          host.node.right = value;
        } else {
          host.replaceWith(t.sequenceExpression([
            t.assignmentExpression('=', t.identifier(bindingName), value), t.cloneNode(plan.recvIdent),
          ]));
        }
        return true;
      }

      function usagePureCallback(meta, path) {
        if (shouldSkipPath(path)) return;
        // JSX tag reaches here via ReferencedIdentifier; a JSX slot cannot host a renamed
        // Identifier, and `<_Map/>` would call the polyfill as a React component at runtime

        if (meta.kind === 'in') return handleInExpression(meta, path);

        // walk past TS wrappers to detect `delete obj.at!` / `delete (obj.at as any)`
        if (isDeleteTarget(peelParenAndTSSlotPath(path).parentPath?.node)) return;

        // a pass over our own output must not claim the member again - the shared census
        // family (provider own-output), ahead of EVERY route: the guarded-narrow render's
        // alternate deliberately keeps this very read, and re-claiming nests the guard.
        // PLAIN members only, as in both unplugin engines - an optional chain's own guarded
        // handling stays live
        if (path.isMemberExpression()
          && ownEmittedNavClaim(path.node, path, ownOutputTests(injector))) return;
        // an OPTIONAL claim gets only the minted-se-call census: its receiver carrying our
        // own minted dispatch means the first pass deliberately declined this `?.` claim
        // (re-claiming upgrades that verdict); the other censuses stay off optional chains -
        // their guarded handling is live there
        if (path.isOptionalMemberExpression()
          && navHoldsMintedSeCall(path.node.object, path, ownOutputTests(injector))) return;

        if (meta.guardedAliasHint && (path.isObjectProperty()
          ? emitGuardedDestructureNarrow(meta, path) : emitGuardedStaticNarrow(meta, path))) return;

        let inheritedStatic = false;
        if (meta.kind === 'property') {
          if (path.isObjectProperty()) {
            // a pattern-valued `[Symbol.iterator]` prop still dispatches: its extraction
            // destructures the get-iterator-method result (helper canon, matching the
            // identifier-valued form); every other pattern-valued prop stays native
            if (!t.isIdentifier(path.node.value) && !t.isAssignmentPattern(path.node.value)
              && !(isSymbolIteratorPatternProp(path.node) && isSourcedSymbolIteratorMeta(meta))) return;
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
            // `isMemberWriteHost` covers update operands too (`(obj.at)++` - the rewrite would
            // be a function call receiver, not writable), climbing the same wrapper set
            if (isForXWriteTarget(path, adapter) || isMemberWriteHost(path)) return;
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
            // the tag slot may hold a TS wrapper over the member (`(arr.at as any)\`x\`` - the
            // wrapper survives in babel's AST): climb to the tagged-template host; the shared
            // predicate unwraps its tag slot, so the identity subsumes the old `path.key` check
            if (isTaggedTemplateTag(peelParenAndTSSlotPath(path).parentPath?.node, path.node, meta.placement)) return;
            // provenance gate: a string-spelled key (`arr['Symbol.iterator']`) is a plain
            // property read and stays raw
            if (isSourcedSymbolIteratorMeta(meta)) {
              return handleSymbolIterator(path, meta.sideEffects, meta.receiverEffectCount, meta.symbolReceiverProxyRoot);
            }
          }
        }

        // a SLOT-mutated global name is DEOPTED (see the slot-deopt model in the provider's
        // mutation pre-pass): the file writes the name itself, so its reads stay verbatim on
        // the live binding and the runtime serves what the user's writes left there
        if (isDeoptedGlobalSlotRead(meta, adapter)) {
          noteDeoptedGlobal(meta.name);
          return;
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
          // own rewritten return leaf - leave the member untouched, the inner visits do the job;
          // a minted memo ref reads the substituted value off its own write the same way
          if (staticFallbackSwapRedundant(path.node.object, meta.sideEffects,
            { mintedAliasRef: name => injector?.getBindingInfo?.(name)?.minted === true })) return;
          // a receiver that IS our probe render (a prior pass's, or this one's re-read) keeps
          // its throw - the swap would eat it
          if (path.scope && probeRenderedReceiver(path.node.object, { scope: path.scope, adapter, path })) return;
          // inject the pure ctor LAZILY - a multi-undefinable-hop chain stands down below (keeps the raw
          // chain), and an eager import there would be dead. every real use funnels through `fallbackId()`
          let fallbackImport = null;
          function fallbackId() {
            return fallbackImport ??= injectPureImport(fallback.entry, fallback.hintName);
          }
          // a `prototype`-placement fallback (`globalThis.Map.prototype.has`) swaps only the CTOR sub-
          // receiver (`globalThis.Map`, possibly through proxy hops) to `_Map`, KEEPING `.prototype` ->
          // `_Map.prototype.has`; swapping the whole receiver (`globalThis.Map.prototype`) would drop
          // `.prototype` -> the undefined `_Map.has`. a static placement swaps the whole receiver. peel
          // transparent wrappers (parens / TS cast / non-null) on the `.prototype` receiver so a TS-wrapped
          // one (`((c++, globalThis.self).Map.prototype as any).has`) reaches the ctor sub-receiver `X.Map`
          const receiverPath = meta.placement === 'prototype'
            ? peelSkippableWrapperPath(path.get('object')).get('object')
            : path.get('object');
          // mirror the main static-rewrite branch (`replacePath.replaceWith(withSideEffects(
          // id, allEffects))` below): preserve `meta.sideEffects` (computed-key SE in the
          // original member access) AND `prependChainAssignmentEffect` over the receiver
          // (chain-assignment `(a = X).noStatic` writes to `a` are observable; the receiver
          // replacement drops them). without this, `(called++, Promise).noSuchStatic`
          // fallback silently rewrites to `_Promise.noSuchStatic` losing the `called++`.
          // receiver-only: the computed `[key]` property SURVIVES this swap and re-runs its own SE,
          // so prepend only the receiver-SE (dropping the trailing key-SE) to avoid double-eval.
          // `protoCtorReceiverSE`: the effects buried in a prototype ctor sub-receiver the receiver-SE
          // collect couldn't reach - a sequence prefix (`(c++, globalThis.self).Map.prototype.has`) or a
          // hop's own computed KEY (`globalThis.self[(c++, 'Map')].prototype.has`) - re-emitted so the
          // `_Map` swap keeps the `c++` (`(c++, _Map).prototype.has`)
          const seOnlyEffects = receiverSideEffectsOnly(meta.receiverEffectCount, meta.sideEffects) ?? [];
          // the sub-receiver's own effects sit DEEPER than this member's, so they lead; the chain-assign
          // splices at the slot the harvest recorded inside them, not at the end - appending it ran the
          // assignment after a folded key the source evaluates later
          const ordered = meta.protoCtorReceiverSE ? [...meta.protoCtorReceiverSE, ...seOnlyEffects] : seOnlyEffects;
          const allEffects = prependChainAssignmentEffect(receiverPath.node, ordered,
            meta.protoCtorChainAssignAt ?? meta.chainAssignInsertAt ?? ordered.length) ?? [];
          const hadChainAssign = allEffects.length > ordered.length;
          // an undefinable optional root may NOT fold into the kept sequence - the fold eats the
          // `?.` guard (native short-circuits to undefined where the folded read yields a value:
          // `(c = gw)?.self.Set.prototype.has.call(x)` returned true on an absent `window`). the
          // kept assign becomes the guard TEST, the swap plus its raw tail ride the alternate:
          // `null == (c = gw) ? void 0 : _Set.prototype.has.call(x)`. SE channels keep the fold
          const guardAssigns = allEffects.filter(effect => !ordered.includes(effect));
          // re-hang the swapped receiver + its raw tail INSIDE a `null == <test> ? void 0 : ...`
          // guard: the swap alone eats the `?.` short-circuit, so the guarded value rides the test
          // `detached`: the test this render lifts out is a node no visitor reaches again - a kept
          // WRITE stays live (the funnel below collapses it in place), a sequence prefix does not
          function emitReceiverGuard(guardTest, { detached = false } = {}) {
            receiverPath.replaceWith(t.cloneNode(fallbackId()));
            normalizeOptionalChain(path, false);
            retypeDeadOptionalLinks(path);
            let tip = path;
            for (;;) {
              const par = tip.parentPath;
              if ((par?.isMemberExpression() || par?.isOptionalMemberExpression()) && par.node.object === tip.node) {
                tip = par;
                continue;
              }
              if ((par?.isCallExpression() || par?.isOptionalCallExpression()) && par.node.callee === tip.node) {
                tip = par;
                continue;
              }
              break;
            }
            // the kept chain-assign VALUE spells through the shared plan before the test freezes
            // it (`k = _globalThis.self.window` -> `k = _self.window`), exactly like the claim
            // funnel: this channel builds its own guard, and skipping the collapse left the
            // intermediate pony hops raw off a root that does not carry them
            collapseKeptNavValueNode(guardTest, path);
            const guarded = estreeToBabel(renderShortCircuitGuard(
              nullFirstGuardTest(navGuardTestNode(guardTest, path, null, null, { detached }),
                { embed: hostSlot }),
              hostSlot(tip.node)));
            // effects the swap would have carried ride AHEAD of the guard: the source runs them
            // before the probe read, and the guard render has no slot for them inside its test.
            // an effect standing INSIDE the guard object is not one of those - the test evaluates
            // that object, so re-emitting it here ran it twice
            const guardSe = allEffects.filter(effect => !guardAssigns.includes(effect)
              && !subtreeContainsNode(guardTest, effect));
            tip.replaceWith(guardSe.length ? withSideEffects(guarded, guardSe) : guarded);
          }
          if (guardAssigns.length === 1 && allEffects.length === 1
            && !staticMayEraseReceiver(path.node, resolveBuiltIn,
              path.scope ? { scope: path.scope, adapter, path } : null)) {
            emitReceiverGuard(guardAssigns[0]);
            return;
          }
          // a mid-chain `?.` over a plain proxy nav (no SE to fold into the kept sequence): the swap
          // would eat the guard. re-hang inside the undefinable hop's OBJECT; a multi-undefinable
          // chain stands down (keeps the raw source, no single test expresses the union)
          // ... and where the ONLY effect is the kept WRITE: the guard render re-emits that write
          // inside its own null test, so it is not an erasure the swap has to carry - dropping the
          // guard there lost the source's short-circuit on the very shape the test spells
          // ... and where the ONLY effect is the kept WRITE: the guard render re-emits that write
          // inside its own null test, so it is not an erasure the swap has to carry - dropping the
          // guard there lost the source's short-circuit on the very shape the test spells
          // ... and where the ONLY effect is one this render owns itself - the kept WRITE its test
          // spells, or a prefix it re-emits ahead of the guard
          {
            const eraseGuard = undefinableOptionalGuard(path.node, resolveBuiltIn,
              path.scope ? { scope: path.scope, adapter, path } : null);
            if (eraseGuard.kind === 'standdown' && allEffects.length <= 1) return;
            // a NESTED-sequence receiver stays unproven under the kept-sequence boundary, so its
            // `?.` is as load-bearing as one over a genuine probe - invisible to the erase verdict,
            // which proves the value through the fixpoint peel. the swap may not eat it: re-hang
            // the guard with the sequence itself as the test, exactly like a named source. a guard
            // SOURCE standing inside such a receiver widens to it for the same reason - the kept
            // test reads what the source wrote, the probe riding the tail with the prefix beside it
            const seqReceiver = ownChainOptionalObjects(path.node)
              .find(object => nestedSequenceValueSpelling(object)) ?? null;
            // the effect COUNT was the gate, and it asks the wrong question: what the guard render
            // owes is that every effect still runs exactly once, and an effect standing INSIDE the
            // guard object rides the test itself (`(g = _globalThis, v = <nav>)` IS the test). the
            // count bound erased the source's short-circuit on every receiver carrying two of them
            const guardObject = eraseGuard.kind === 'guard'
              ? (seqReceiver && subtreeContainsNode(seqReceiver, eraseGuard.object) ? seqReceiver : eraseGuard.object)
              : eraseGuard.kind === 'erase' ? seqReceiver : null;
            if (guardObject
              && (allEffects.length <= 1
                || allEffects.every(effect => subtreeContainsNode(guardObject, effect)))) {
              emitReceiverGuard(guardObject, { detached: !hadChainAssign });
              return;
            }
          }
          // the KEPT chain-assign value this arm re-emits beside the swap collapses through the
          // claim funnel first (`(q = globalThis.self.window).Promise.noSuchStatic` re-emits
          // `q = _self.window`): the guarded arms above collapse inside their own test render,
          // and this plain arm owns the assignment's emission the same way the claim channel does
          if (hadChainAssign) collapseKeptNavValueNode(receiverPath.node, path, { immediate: true });
          // a SEALED probe receiver: the swap drops the read the source performs on the sealed
          // VALUE - re-emit it as a THROW probe (carrying the nav's key SE) ahead of the swap.
          // this swap replaces the RECEIVER, so the receiver read is what it erases and what the
          // probe respells (`(a.Promise, _Promise).noSuchStatic`, the unplugin spelling - the
          // surviving member still reads once); a shape only the whole-member walk can probe (a
          // seal directly under the member) keeps that spelling
          const throwProbe = sealedClaimThrowProbeNode(path, path.node.object)
            ?? (sealedChainBoundary(path.node)?.member === path.node ? sealedClaimThrowProbeNode(path) : null);
          // an ALIAS holding an absent-able value (its init is our minted guard): the receiver
          // swap erases the member read that throws on the void branch, and the member itself
          // owes no polyfill - stand down whole, the unplugin leg's twin verdict on this swap
          if (!throwProbe && !path.node.optional && path.scope
            && aliasRootedReadMayThrow(path.node.object, resolveBuiltIn, { scope: path.scope, adapter, path })) return;
          const probeSe = throwProbe && new Set(throwProbe.keySeExprs);
          const fbEffects = probeSe ? allEffects.filter(se => !probeSe.has(se)) : allEffects;
          receiverPath.replaceWith(withSideEffects(fallbackId(),
            throwProbe ? probeOrderedEffects(throwProbe, fbEffects) : fbEffects));
          // receiver-only rewrite: the member ITSELF is not polyfilled (static-FALLBACK, only the
          // receiver swaps to the pure ctor), so a trailing optional CALL (`Promise.noSuchStatic?.(1)`)
          // is a GENUINE guard for the possibly-undefined member and must survive. stripFirstOptional
          // would deoptionalize that trailing `?.(` (the first optional ancestor), turning native
          // `undefined` into a TypeError. pass `false` so only the now-defined receiver's own `?.`
          // (dead after the swap) is left as-is and the trailing guard is preserved (matches unplugin)
          normalizeOptionalChain(path, false);
          // a CHAIN-ASSIGN receiver's surviving links stay Optional*-TYPED with
          // `optional: false` - babel codegen then parenthesizes the chain boundary
          // (`((..., _Map).prototype.has).call(...)`) where the unplugin emitter keeps the plain
          // spelling. retype the dead links plain in BOTH directions from the swapped slot,
          // stopping at a genuine `?.`. non-assign receivers (an optional-IIFE root) keep the
          // sealed paren spelling - the unplugin emitter prints it for the consumed `?.()` there
          if (hadChainAssign) retypeDeadOptionalLinks(path);
          return;
        }
        if (!result) {
          // [Symbol.iterator] in destructuring: resolve returns null, use getIteratorMethod.
          // gated on symbol provenance - a string-spelled key stays a plain property read
          if (path.isObjectProperty() && isSourcedSymbolIteratorMeta(meta)) {
            destructureEmit.handleObjectPropertyResult({ prop: path, meta, ...SYMBOL_ITERATOR_PURE_RESULT });
          }
          // an ALIAS-rooted proxy-hop chain whose leaf is NON-polyfilled (`const g = globalThis; new
          // g.self.Array(3)` / `g['self'].Array.isArray(...)`) has no leaf usage and no `kind:'global'`
          // trigger on the alias root - and a NAME-rooted chain THROUGH a kept store the same way
          // (`(v = globalThis.window?.self)?.window.X` - the name's own trigger renders the store,
          // never the hops above it): the redundant hop survives, reading an undefined hop off the
          // alias off-engine (ie:11 / Node). `isAliasProxyHopChain` is the provider detection;
          // peel to the root path and collapse (which self-gates on the hop and the store again)
          const aliasCtx = path.scope ? { scope: path.scope, adapter, path } : null;
          // the CALL-rooted twin of the alias arm below: a proxy nav rooted in an inline-resolvable
          // call whose leaf polyfills nothing (`(() => globalThis)().window.self.userSlot`) has no
          // claim to drive any channel here, so the hops rode raw - a native `self` read where the
          // ponyfill is the point, and the unplugin leg collapsed the same source through its own
          // suppressed-hop callback (its visitor reaches the hops this leg's subtree-skip hides)
          if (collapseClaimlessCallRootedNav(path)) return;
          // a WRITE host consumes the nav without claiming it, so no claim channel leads a render
          // here - and the receiver's own probe still owes the guard that every READING consumer of
          // the same nav gets, on both emitters (`(eff(), null == _globalThis.window ? void 0 :
          // _self).Array.prototype.at = 1`). the write target itself is untouched
          if (renderWriteHostProbeGuard(path)) return;
          if (synthSwap && isAliasProxyHopChain(path.node, aliasCtx, true)) {
            let rootPath = path;
            while (rootPath.isMemberExpression() || rootPath.isOptionalMemberExpression()) rootPath = rootPath.get('object');
            // a hop a nav-collapse render already emitted keeps the shape the plan chose - re-run
            // here it would collapse against a receiver the plan never picked
            if (isRenderedPlanTail(rootPath.parentPath?.node)) return;
            // the hop collapse refuses a short-circuitable nav (the probe canon) - render the
            // kept-nav plan in place there, or a raw polyfillable hop key strands off a
            // defined receiver (`window['self']` - the web.self class miss)
            // ... but never where the value flows into a DESTRUCTURING pattern: that read is the
            // claim channel's, and it memoizes the probe (`null == (_ref = ga.window) ? void 0 :
            // _at(_ref.Array.prototype)`) exactly as it does for a BARE root and for a plain read
            // off this same alias. collapsing here preempted it and spelled the alias branch's fold
            // instead - one receiver, two spellings, chosen by which channel got there first
            if (!synthSwap.collapseProxyHopRoot(rootPath, aliasCtx, { keptSeqHopFold: true })
              && !destructuredValueAbove(path)) collapseShortCircuitNavInPlace(memberChainEndPath({ path, unwrap: unwrapRuntimeExpr }));
          }
          return;
        }

        const { entry, kind, hintName } = result;

        // a proxy-global root (`globalThis`) navigating a NON-pure leaf through redundant proxy hops
        // (`globalThis.self.Array`) must collapse the hops, else the bare identifier swap leaves
        // `_globalThis.self.Array` reading an undefined `.self` off the global off-engine (ie:11 / Node).
        // a pure-ctor leaf is whole-swapped by the synth-swap path; a bare root collapses to nothing.
        // a memo-rebuilt nav into a MUTATED landing (`_ref.self.self.Set`, ctor slot patched) roots
        // at a plugin ref that never gets its own global meta, so the root-anchored collapse has no
        // identifier site to fire from - drive it from the ref; the natural member swap would
        // otherwise respell the guarded read off the always-defined ponyfill instead of dropping
        // the hops onto the guarded ref. non-mutated ref-rooted navs keep their natural handling
        // (receiver-independent ctor substitution and the leaf ponyfill swap)
        if (kind === 'global' && !path.isObjectProperty()) {
          let chainRootPath = path;
          while (chainRootPath.isMemberExpression() || chainRootPath.isOptionalMemberExpression()) {
            chainRootPath = chainRootPath.get('object');
          }
          // a hop a nav-collapse render already emitted keeps the shape the plan chose. asked at
          // the CHAIN ROOT, the node whose object is the render - the same anchor the sibling arm
          // above uses. asking it at `path` instead would miss a single-hop render, whose object
          // already IS the emitted leaf
          if (isRenderedPlanTail(chainRootPath.parentPath?.node)) return;
          const drivePath = chainRootPath.isIdentifier() && injector?.getMemoWrite?.(chainRootPath.node.name)
            && mutatedStaticLandingVerdict({ path, scope: path.scope, adapter, mutatedSet: mutatedStatics }) === 'yes'
            ? chainRootPath : path;
          if (synthSwap?.collapseProxyHopRoot(drivePath, path.scope ? { scope: path.scope, adapter, path } : null,
            { keptSeqHopFold: true })) return;
          // a proxy-HOP claim whose navigation a `delete` folds WHOLE reaches its slot off the ROOT
          // binding, not off the hop's own ponyfill - that is the base every other spelling of this
          // source lands on, and the drive that spells it cannot fire from the hop itself
          // asked through the wrappers one parser keeps as NODES (`((w = globalThis)).self...`
          // under createParenthesizedExpressions) - the raw-path test read only the flag dialect
          const chainRootCore = unwrapRuntimeExpr(chainRootPath.node);
          // ... and a SEQUENCE at the root is a carrier like the store beside it: what it hands on is
          // the root the plain twin lands, and its prefix re-emits ahead of that binding with the rest
          // of the dropped span. a carrier decides what RUNS, never what the delete lands on - so the
          // tail is peeled FIRST and the store question asked of what it hands on
          const carriedRootCore = unwrapRuntimeExpr(peelReceiverSequenceTail(chainRootCore));
          const chainAssignRootValueName = carriedRootCore?.type === 'AssignmentExpression'
            && carriedRootCore.operator === '='
            ? asProxyGlobalName(resolveObjectName({
              objectNode: carriedRootCore, scope: path.scope, adapter, path,
            })) : null;
          const seqRootName = carriedRootCore?.type === 'Identifier'
            ? asProxyGlobalName(carriedRootCore.name) : null;
          // ... and where the store's VALUE is itself a nav this build cannot spell (`(d = globalThis
          // .window)?.self.k`), the base is that nav's own ROOT: the delete lands the root binding and
          // the store keeps what the source put in it - the read channel's kept-store canon answers a
          // different question (what a READ through the store sees)
          const storedNavRootName = carriedRootCore?.type === 'AssignmentExpression'
            && carriedRootCore.operator === '='
            ? asProxyGlobalName(descendToChainRoot(carriedRootCore.right, true).root?.name) : null;
          const carriedCallRoot = carriedRootCore?.type === 'CallExpression' ? carriedRootCore : null;
          // the hop is named STRUCTURALLY first and, for a computed key the structural fold cannot
          // read (a TS enum member spells one), through the proxy-name canon carrying the claim-safe
          // resolver - named only one way, this gate let an enum-spelled hop past the `delete` fold
          // and the run landed on its deepest backed hop instead of the operator's root binding
          const deleteHopName = memberProxyHopName(path.node) ?? (path.node.computed
            ? asProxyGlobalName(globalProxyMemberName({
              node: path.node,
              scope: path.scope,
              adapter,
              path,
              resolveStaticKey: (node, scope, keyPath) => resolveClaimableComputedKeyName(node, scope, keyPath),
            }))
            : null);
          if (deleteHopName
            && (chainRootPath.isIdentifier() || chainRootPath.isCallExpression()
              || chainAssignRootValueName || seqRootName || storedNavRootName || carriedCallRoot)
            && deleteHostAboveChain(path, path.node, unwrapRuntimeExpr)) {
            // the `?.` the source wrote over the folded nav guards a read that never happens: the
            // fold landed the root binding, and the canon has spoken for the whole navigation -
            // the shared dangling-optional rule spells it, carriers and all
            function landFoldedRoot(base) {
              path.replaceWith(base);
              deoptionalizeDanglingOptionalParent(path);
            }
            // a PROVEN effect-free call yielding a DEFINED global is the identifier spelling's
            // twin and folds onto the same root ponyfill; a probe yield keeps the per-hop
            // channels (the leaf canon), an effectful call has no slot to replay what it did
            function provenCallRootName() {
              const callNode = carriedCallRoot ?? chainRootPath.node;
              if (callNode.optional || !path.scope) return null;
              const callCtx = { scope: path.scope, adapter, path };
              // a LIVE `?.` anywhere in the deleted navigation short-circuits what stands
              // above it - the guard channels own that render (the locked `ut()` family);
              // only a run whose every `?.` tests a proven-defined value folds whole
              const chainEndNode = memberChainEndPath({ path, unwrap: unwrapRuntimeExpr }).node;
              for (let scan = unwrapRuntimeExpr(chainEndNode);
                scan?.type === 'MemberExpression' || scan?.type === 'OptionalMemberExpression';
                scan = unwrapRuntimeExpr(scan.object)) {
                if (scan.optional && proxyReceiverValueCanBeUndefined(unwrapRuntimeExpr(scan.object),
                  resolveBuiltIn, callCtx)) return null;
              }
              const rootId = inlineCallProxyGlobalRoot({ callNode, ...callCtx, rejectConditional: true });
              if (!rootId || callValueCanBeUndefined(callNode, callCtx, m => resolvePure(m, path))
                || inlineCallHasObservableEffects({ callNode, ...callCtx })) return null;
              return POSSIBLE_GLOBAL_OBJECTS.has(rootId.name) ? rootId.name
                : resolveObjectName({ objectNode: rootId, ...callCtx, usageNode: rootId });
            }
            const rootName = chainRootPath.isIdentifier() ? asProxyGlobalName(chainRootPath.node.name)
              : chainAssignRootValueName ?? seqRootName ?? storedNavRootName ?? asProxyGlobalName(provenCallRootName());
            let rootPure = rootName ? resolvePure({ kind: 'global', name: rootName }, path) : null;
            // ... and where the stored VALUE's own name is one pure cannot back (`window`), the base
            // falls back to the nav's ROOT: the delete lands the root binding either way, and the
            // store keeps what the source put in it
            if (!rootPure && storedNavRootName && storedNavRootName !== rootName) {
              rootPure = resolvePure({ kind: 'global', name: storedNavRootName }, path);
            }
            if (rootPure) {
              const base = injectPureImport(rootPure.entry, rootPure.hintName);
              // the fold DROPS the whole receiver span, so what the source ran on the way in
              // re-emits ahead of the base, where it ran: the user's own chain-assign (`delete
              // (w = globalThis).self.k` -> `delete (w = _globalThis, _globalThis).k`) and the
              // effect buried in a hop's computed KEY, which the deleted member's own key does
              // not carry (`delete globalThis[(eff(), 'self')].k`)
              const dropped = collectFoldedReceiverSideEffects(path.node);
              landFoldedRoot(dropped.length ? t.sequenceExpression([...dropped, base]) : base);
              return;
            }
            if (!rootName && chainRootPath.isIdentifier()
              && isAliasProxyHopChain(path.node, path.scope ? { scope: path.scope, adapter, path } : null)) {
              landFoldedRoot(t.cloneNode(chainRootPath.node));
              return;
            }
          }
          // the call-rooted twin of the hop-collapse drive: a claim on a proxy HOP whose chain
          // roots in an inline-resolvable call has no root-identifier visit to fold from, so the
          // claimless channel owns the run - fired at the chain END, and only where navigation
          // CONTINUES above this claim (`f().self.customUserSlot` with the slot mutated folds
          // onto the root ponyfill, the identifier twin's bytes; a terminal PROBE keeps its slot
          // over the deepest ponyfill the run hands it, the claim canon)
          if (chainRootCore?.type === 'CallExpression' && memberProxyHopName(path.node)) {
            // anchored at the member ABOVE the last consecutive proxy hop, not the chain top:
            // an ordinary mid-chain key (`...self.callRootBox.list` - the mutated slot) ends
            // the all-proxy run the channel folds, and everything above it reads off the base
            let callChainEnd = path;
            for (let up = callChainEnd.parentPath;
              (up?.isMemberExpression?.() || up?.isOptionalMemberExpression?.())
              && unwrapRuntimeExpr(up.node.object) === callChainEnd.node
              && memberProxyHopName(callChainEnd.node);
              up = callChainEnd.parentPath) callChainEnd = up;
            if (callChainEnd !== path && collapseClaimlessCallRootedNav(callChainEnd)) return;
          }
          // the hop collapse refused a short-circuitable nav (the probe canon): render the
          // kept-nav plan in place at the chain END, or a raw polyfillable hop key strands
          // off a defined receiver (`window['self']` - the web.self class miss)
          // the same chain walk the kept-nav verdict uses; `unwrap` steps the TS wrappers between
          // hops (a BARE wrapper `nav!.X` erases and the short-circuit survives, a PARENTHESIZED
          // layer seals - the member above parses PLAIN, so the render keeps the source's throw
          // semantics by node type)
          const chainEnd = memberChainEndPath({ path, unwrap: unwrapRuntimeExpr });
          if (chainEnd !== path && collapseShortCircuitNavInPlace(chainEnd)) return;
        }

        if (path.isObjectProperty()) {
          destructureEmit.handleObjectPropertyResult({ prop: path, meta, kind, entry, hintName });
        } else {
          // the inherited-static-resolves-to-instance bail lives in the provider's `resolveUsage`,
          // the entry BOTH flavors go through, so `result` is already null here for that shape and
          // the `inheritedStatic && !result` bail above caught it
          // a static claim whose receiver navigates 2+ undefinable optional hops STANDS DOWN (keeps the raw
          // chain - no single test expresses the union). resolve it BEFORE the import so a kept-raw claim
          // leaves no dead pure import: injectPureImport eagerly registers even when the id goes unused
          const staticEraseGuard = kind !== 'instance' && !inheritedStatic
            ? undefinableOptionalGuard(path.node, resolveBuiltIn, path.scope ? { scope: path.scope, adapter, path } : null)
            : null;
          if (staticEraseGuard?.kind === 'standdown') return;
          // a swap that OWES a throw probe but cannot spell one (an SE computed key in the
          // alias-rooted run - respelling would double its effect) stands down the same way,
          // and before the import for the same reason - the unplugin leg's twin stand-down
          if (kind !== 'instance' && !inheritedStatic && path.node.object && !path.node.optional && path.scope
            && aliasRootedReadMayThrow(path.node.object, resolveBuiltIn, { scope: path.scope, adapter, path })
            && !aliasHeldClaimProbe(path.node, resolveBuiltIn, { scope: path.scope, adapter, path })) return;
          const id = injectPureImport(entry, hintName);
          // a WRITE host is never a read: the member is being assigned, updated or DELETED, so swapping
          // it changes what the statement acts on - `delete X.flat.name` became `delete _nameMaybeFunction(...)`,
          // whose operand is a CALL, so the delete stopped deleting anything at all. the property-meta
          // branch has carried this bail from the start; the instance one never did
          // the member that IS the delete OPERAND is never read - swapping it changed what the statement
          // acts on (`delete X.flat.name` became `delete _nameMaybeFunction(...)`, whose operand is a
          // CALL, so the delete stopped deleting anything). only the target: the members BELOW it are
          // read on the way there and keep their claims (`flat` above still swaps)
          if (kind === 'instance' && (isForXWriteTarget(path, adapter) || isMemberWriteHost(path)
            || isDeleteOperand(path))) return;
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
              let recvRoot = peelSkippableWrapperPath(path.get('object'));
              while (recvRoot.isMemberExpression() || recvRoot.isOptionalMemberExpression()) {
                recvRoot = peelSkippableWrapperPath(recvRoot.get('object'));
              }
              // ... and where the hop collapse refuses the nav (a live `?.` over the probe), the
              // guard render owns it: the dispatch memoizes this receiver, and a raw hop frozen in
              // that memo is the very read the ponyfill exists for
              // ... and where a SEQUENCE stands around that nav the hop drive cannot reach it at
              // all (its climb walks members): the guard render lands in the sequence's own tail,
              // and a raw hop frozen in this dispatch's memo is the read the ponyfill exists for
              if (!synthSwap.collapseProxyHopRoot(recvRoot, {
                scope: path.scope,
                adapter,
                path,
                // the hop key is named by the same claim-safe resolver detection uses: without it a
                // hop spelled by a TS enum member stays a RAW realm read here while every other
                // spelling of that key collapses, and a stripped realm has no such slot to read
                resolveStaticKey: (node, scope, keyPath) => resolveClaimableComputedKeyName(node, scope, keyPath),
              })
                && recvRoot.isSequenceExpression()) collapseShortCircuitNavInPlace(memberChainEndPath({ path, unwrap: unwrapRuntimeExpr }));
            }
            const innerChain = findInnerPolyChain(path);
            if (innerChain) {
              const innerId = injectPureImport(innerChain.innerEntry, innerChain.innerHintName);
              markCombinedChainConsumed(innerChain);
              // pass `meta.sideEffects` through: outer-key computed SE (e.g.
              // `(arr?.at?.(0))[(fn(), 'map')](x => x)`) was captured by detect-usage but
              // dropped when the inner-chain rewrite replaced the parent expression with a
              // conditional. SequenceExpression wrap preserves the SE in source order
              replaceInstanceChainCombined(path, id, { ...innerChain, innerId, sideEffects: meta.sideEffects,
                outerReturnType: captureInstanceCallType(path)?.type });
              return;
            }
            // capture pre-mutation Type object for the parent CallExpression and re-attach
            // post-replacement. parallel to static branch's `annotateCallReturnType` but
            // post-replace - instance rewrite REPLACES the parent CallExpression entirely
            // (`arr.concat(x)` -> `_concatMaybeArray(arr).call(arr, x)`), losing any pre-set
            // annotation; static rewrite only swaps the callee identifier so the parent
            // node persists. without this type-cache downstream `arr2.at(-1)` (where `arr2 =
            // arr.concat(x)`) falls back to generic `_at` because the rewritten init shape
            // (`_concatMaybeArray(arr).call(arr, x)`) isn't recognized by `resolveNodeType`.
            const captured = captureInstanceCallType(path);
            replaceInstanceLike({
              path, id, skipOptional: skipPolyfillableOptional,
              sideEffects: meta.sideEffects, receiverEffectCount: meta.receiverEffectCount,
            });
            reattachInstanceCallType(captured);
          } else if (inheritedStatic) {
            // super.X and unshadowed this.X in static ctx (this = subclass ctor): emit
            // id.call(this, ...) so the receiver is preserved, else the result downgrades to base
            replaceInheritedStatic(path, id, meta.sideEffects);
          } else {
            const wasOptional = (annotateCallReturnType(path), path.node.optional);
            const replacePath = peelParenAndTSSlotPath(path);
            // `Symbol[(fn(), 'iterator')]` / `(fn(), Array).from(x)` - preserve fn() via
            // SequenceExpression wrap since the MemberExpression replacement discards its
            // receiver/computed-key subtree.
            // chain-assignment receiver `(a = Array).from(x)` / `(a = b = Array).from(x)` -
            // the outermost assignment is an observable side effect lost when receiver is
            // dropped. emit becomes `(a = Array, _Array$from)(x)`. instance dispatch wouldn't
            // reach here (routes through replaceInstanceLike above), so no risk of duplicating
            // with memoize-captured assignment
            // the substitution erases the receiver navigation - where that navigation is NOT erasable
            // (a live `?.` over a value navigating an unresolvable proxy hop), the guard must survive,
            // but a raw static there is exactly the missed polyfill the claim exists for (IE11 has no
            // native `from`). emit the claim INSIDE the preserved guard: `null == (b = _globalThis
            // .window) ? void 0 : _Array$from(x)` - the root evaluates once in the test (no memo: the
            // alternate is receiver-independent), short-circuit intact. the refusal fires only on
            // proxy-TIER unponyfilled hops (window-class forwarders), so the claim is sound there.
            // SE channels keep the raw stand-down - no re-emit slot in this shape.
            // reuse the pre-import decision. `standdown` already returned above and the verdict is
            // non-null on this branch, so the only non-erase kind left is 'guard': exactly one
            // undefinable `?.` - re-hang the claim inside its guard test
            // the guard is the PREFERRED shape, not the only one: where no single test expresses
            // the source (a seal above the guard object, a `delete` tail with a leading effect)
            // the emit stands down and the plain arm below takes it - claim plus THROW PROBE,
            // which reproduces the read the guard would have swallowed. returning here on a
            // stand-down left the claim raw, unpolyfilled, where the unplugin emitter renders one
            if (staticEraseGuard.kind === 'guard' && emitGuardedClaim({
              path, replacePath, id, guardObject: staticEraseGuard.object,
              sideEffects: meta.sideEffects, receiverEffectCount: meta.receiverEffectCount,
              proxyRootClaim: kind === 'global' && POSSIBLE_GLOBAL_OBJECTS.has(hintName),
              substituteGlobal(name) {
                const resolved = resolvePure({ kind: 'global', name }, path);
                return resolved ? injectPureImport(resolved.entry, resolved.hintName) : null;
              },
            })) return;
            // the KEPT chain-assign value beside the claim collapses through the same canon the
            // guarded twin reads (`(q = globalThis.self.window).Map` stores `_self.window`, a
            // nested unresolvable prefix keeps its guard) - a kept raw `.self` hop reads an
            // engine `self` the web.self ponyfill exists to serve. IMMEDIATE: this channel owns
            // the assignment's emission (an earlier instance claim may have rebuilt the receiver,
            // so the deferred flush could never match the emitted node by identity). the plan
            // owns only the chain-assign shapes; everything else is a no-op here (a global-kind
            // claim's path is a bare Identifier with no object slot)
            if (path.node.object) collapseKeptNavValueNode(path.node.object, path, { immediate: true });
            const allEffects = prependChainAssignmentEffect(path.node.object, meta.sideEffects,
              meta.chainAssignInsertAt ?? meta.receiverEffectCount);
            // a SEALED probe receiver: re-emit the read the erase drops as a THROW probe ahead
            // of the claim - an absent `window` throws exactly where the source does. the probe
            // carries the nav's key SE, so those nodes leave the claim's own SE channel
            const throwProbe = sealedClaimThrowProbeNode(path);
            const probeSe = throwProbe && new Set(throwProbe.keySeExprs);
            const claimEffects = probeSe ? (allEffects ?? []).filter(se => !probeSe.has(se)) : allEffects;
            // is the probe run standing over this claim the value the SOURCE reads? asked HERE,
            // while the spine is still standing - after the swap the path holds the ponyfill, and
            // both halves of the verdict read the member this claim came in on
            const proxyHopClaim = kind === 'global' && POSSIBLE_GLOBAL_OBJECTS.has(hintName)
              && isMemberAccessNode(path.node);
            const probeRunIsTheValue = proxyHopClaim && probeRunIsTheSourceValue(path,
              { resolvePure: m => resolvePure(m, path), effects: claimEffects });
            replacePath.replaceWith(withSideEffects(id,
              throwProbe ? probeOrderedEffects(throwProbe, claimEffects ?? []) : claimEffects));
            // ... and where it is not, the realm hops left standing over the ponyfill this swap put
            // in read the realm it already is and fold onto it - the unplugin leg's fold-above twin,
            // the same core verdict. BEFORE the `?.` normalization below: that one reads the chain
            // this fold reshapes
            // ... and the ROOT claim drives the same fold under a `delete`: no hop claim can fire in a
            // build without the hop's entry, and the run over the deleted slot reads no value either
            // way. asked from the CARRIER the base stands in, not from the base itself - a store
            // inside the deleted navigation is a consumer the plain walk stops at, while the fold
            // below still lands the base the hop-claim twin lands
            const deletedRun = !proxyHopClaim && kind === 'global' && POSSIBLE_GLOBAL_OBJECTS.has(hintName)
              && deleteHostAboveCarriedChain(path);
            if ((proxyHopClaim && !probeRunIsTheValue) || deletedRun) {
              const fold = unbackedRealmHopFoldAbove(replacePath, replacePath.node,
                { adapter, resolvePure: m => resolvePure(m, path) }, { deleted: deletedRun });
              // the dropped span re-emits what it DID ahead of the base, where the source ran it -
              // the user's own chain-assign, an effect buried in a hop's computed key: the delete
              // fold's own harvest canon, asked of the span this fold drops
              const dropped = fold && deletedRun && !fold.carriesOwnEffects
                ? collectFoldedReceiverSideEffects(fold.path.node) : [];
              if (fold) {
                fold.path.replaceWith(dropped.length
                  ? t.sequenceExpression([...dropped, fold.node]) : fold.node);
              }
            }
            normalizeOptionalChain(replacePath, !wasOptional);
            if (wasOptional) deoptionalizeDanglingOptionalParent(replacePath);
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
        method,
        isEntryAvailable: isEntryNeeded,
        toHint,
        resolvedType,
        resolvePure,
        // detection names a computed member key through the TYPE layer's resolver rather than a
        // copy of its enum fold - one name, one resolver
        resolveStaticKey: (node, scope, path) => resolveClaimableComputedKeyName(node, scope, path),
      };
      // hops the detector suppressed while the meta KEEPS its receiver path: they survive into the
      // output, so this emitter still renders them (the marking only guards the unplugin emitter)
      const keptProxyHops = new WeakSet();
      // the kept-nav hooks render AHEAD of the claim channel - they fire from the detector's own
      // suppression points, so the inert test every claim runs never reaches them and the file's
      // opt-out has to be asked here. without it `core-js-disable-next-line` over a STORED nav was
      // honoured by the other emitter and ignored by this one
      function keptNavHookOptedOut(path) {
        return isDisabled(path.node);
      }
      const usageVisitors = method !== 'entry-global' ? createUsageVisitors({
        ...commonVisitorOptions,
        keptProxyHops: isPure ? keptProxyHops : undefined,
        // 'plan': the deferred flush owns the render; an ASSIGNMENT (the stored canon): the
        // value collapses IN PLACE right now - the guard channel is live but no claim fired,
        // and nothing else would spell the kept value (`(k = ((globalThis.window.self)))?.X`
        // renders `k = null == _globalThis.window ? void 0 : _self` like its claimed twin)
        suppressKeptNavHop: isPure ? path => {
          if (keptNavHookOptedOut(path)) return false;
          const owned = keptNavHopClaimSuppressed(path);
          if (owned && owned !== 'plan') collapseKeptNavValueNode(owned, path, { immediate: true });
          return !!owned;
        } : undefined,
        // the same stored canon from the nav's proxy-global ROOT (the identifier visit is the
        // one place the member subtree-skip cannot hide): the funnel plans the kept value and
        // reports whether it rendered - every other shape falls through to the normal claim
        // EVERY store on the value spine, not only the innermost: a nav can be kept twice
        // (`ntm = (ntw = globalThis).window?.self`), and the inner write - whose value is the bare
        // root - carries no navigation for the plan to render, so stopping there left the outer
        // store's hops raw
        suppressKeptNavRoot: isPure ? path => {
          if (keptNavHookOptedOut(path)) return false;
          const seen = new Set();
          let rendered = false;
          for (let at = path; at?.parentPath;) {
            const stored = storedUserAssignmentOf(at);
            if (!stored || seen.has(stored)) break;
            seen.add(stored);
            rendered = !!collapseKeptNavValueNode(stored, path, { immediate: true }) || rendered;
            while (at?.node && at.node !== stored) at = at.parentPath;
            at = at?.parentPath;
          }
          return rendered;
        } : undefined,
        onSuppressedProxyHop: isPure ? path => {
          if (keptNavHookOptedOut(path)) return;
          // the node ITSELF as well as its parent: a render whose alternate ends in a tail hop
          // (`_self.window` under the guard) is re-entered ON that hop, and the drive then folded
          // a hop the plan deliberately kept - our own output, re-collapsed one step further than
          // the other leg ever spells it
          if (isRenderedPlanTail(path.node) || isRenderedPlanTail(path.parentPath?.node)) return;
          // the chain walk and the two verdicts it carries - the nav must be CONSUMED by a step
          // above it, and a POLYFILLED dispatch there owns the receiver itself (it memoized and
          // rebuilt the call, so a render over its callee would strip the invocation's receiver) -
          // are the SAME questions the unplugin emitter asks, so the walk is shared. only the key
          // reader and the polyfill lookup stay dialect-local
          const chainEnd = keptNavChainEndPath({
            path,
            keyOf: memberKeyName,
            resolvesProperty: (key, endPath) => !!resolvePure({ kind: 'property', key }, endPath),
          });
          if (!chainEnd) return;
          // a QUEUED kept-nav plan owns the assignment's whole emission - a fold or render
          // firing inside its span detaches the nodes the deferred flush renders from; the
          // stored canon (an owning ASSIGNMENT comes back) renders the kept value in place
          const owned = keptNavHopClaimSuppressed(path);
          if (owned === 'plan') return;
          if (owned) {
            collapseKeptNavValueNode(owned, path, { immediate: true });
            return;
          }
          // same precedence the meta-driven arm keeps: the hop COLLAPSE owns every chain it can
          // take, and only the navs it refuses - the short-circuiting probe - earn the render
          const hopCtx = path.scope ? { scope: path.scope, adapter, path } : null;
          if (synthSwap?.collapseProxyHopRoot(path, hopCtx)) return;
          collapseShortCircuitNavInPlace(chainEnd);
        } : undefined,
        suppressProxyGlobals: isPure,
        walkAnnotations: !isPure,
        // gates proxy-global receiver suppression on the member resolving to a real pure
        // replacement (usage-pure only - usage-global never suppresses proxy receivers)
        resolveMeta: isPure ? resolvePure : undefined,
      }) : null;
      currentUsageVisitors = usageVisitors;
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
        // ONE raw walk answers every per-file census question (name reservation + the shape
        // gates) - the scans it replaces each re-walked the whole file. computed on the
        // PRISTINE tree: every consumer either reads it at this same point, or (ctor-alias
        // gate, after the minifier split) is invariant to the split - the split only
        // re-parents existing expression nodes into their own statements. read by the usage
        // lanes alone, so entry-global skips the walk (an empty reducer list would still pay it)
        fileCensus = methodReadsUsageCensus(method) ? collectFileCensus(path.node, [
          memberKeyNamesReducer(),
          ctorAliasShapesReducer(),
          mutationShapesReducer(packages),
          escapedCtorReferencesReducer(),
          restSentinelNamesReducer(),
          proxyWriteOriginsReducer(),
        ]) : {};
        // pre-walk for monkey-patches, consulted by `usagePureCallback` before substituting
        // `Object.key` reads - so the INJECTION-policy slot stays usage-pure only, exactly as
        // before: a global-flavor bail there would drop an import instead of adding one.
        // internal core-js files don't need it either (they manage their own globals).
        // reset FIRST: the read canons the pre-pass shares consult the live slot through the
        // adapter, and the previous file's set must not gate this file's collection
        mutatedStatics = null;
        writtenContainerSlots = null;
        mutatedStatics = method === 'usage-pure' && !isInternalCoreJS
          ? collectMutationPrePass(path, adapter, fileCensus,
            (node, scope, keyPath) => resolveClaimableComputedKeyName(node, scope, keyPath)).mutated : null;
        mutationRoots = isInternalCoreJS ? null : fileCensus.mutationRoots ?? null;
        writtenContainerSlots = fileCensus.writtenContainerSlots ?? null;
        // source wins over sourceType: CJS-assign at top level of a `sourceType: "module"` file
        // would otherwise produce mixed `import` + `module.exports` output
        importStyle = importStyleOption ?? (!hasTopLevelESM(path.node)
          && (path.node.sourceType === 'script' || detectCommonJS(path.node)) ? 'require' : 'import');
        injector = new ImportInjector({
          t,
          programPath: path,
          pkg,
          packages,
          mode,
          importStyle,
          absoluteImports,
          emitsGlobalModules: method !== 'usage-pure',
        });
        // user-owned global-object property names: in a script-scope output a top-level
        // `var <name>` temp ALIASES `globalThis.<name>`, so a temp write would clobber the
        // user's slot. `program.globals` only sees unbound identifier REFERENCES - property
        // keys never land there (and a re-routed reference drops out of it). reserve the
        // Identifier keys of bare proxy-global members (reads AND writes; shadow-blind
        // over-approximation only shifts temp numbering) plus the mutated slot names (covers
        // `Object.defineProperty(self, 'X', ...)`-style writes with no member-key spelling).
        // mirrors unplugin, whose raw-AST name scan reserves every identifier-shaped name
        if (methodReadsUsageCensus(method)) {
          injector.seedReservedNames(fileCensus.memberKeyNames);
          injector.seedReservedNames(mutatedGlobalSlotNames(mutatedStatics));
        }
        skippedNodes = new WeakSet();
        // re-instantiate per-file so the emitter's closure-captured `skippedNodes` ref
        // points to the freshly-allocated WeakSet (skippedNodes is reassigned, not mutated)
        synthSwap = createSynthSwapEmitter({
          adapter, injectPureImport, injector, resolvePure, skippedNodes, t, sealedClaimThrowProbeNode,
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
          isEntryNeeded,
          resolvePropertyObjectType,
          resolveNodeType,
          toHint,
          skippedNodes,
          synthSwap,
          t,
          resolvedType,
          markThrowingExtraction,
          probedNavGuardValueNode,
          collapseKeptNavValueNode,
          sealedClaimThrowProbeNode,
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
        deoptNotedNames = new Set();
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
        skipFile = isInternalCoreJS || fileDisabled || isDeclarationFile(path.hub.file.opts.filename);
        disabledLines = fileDisabled ? null : directives;
        // the minifier-sequence split lands before any usage / entry visitor sees the program, and
        // after the directives were read: a `-next-line` over a collapsed statement spans the whole
        // statement the author wrote, so every product stays covered. gated below skipFile so a
        // `core-js-disable-file` directive, internal core-js source or a declaration file is
        // returned verbatim, not rewritten (entry-global needs it too - a `require('core-js/...')`
        // collapsed into a comma sequence - so the gate is `!skipFile`, not the narrower entry
        // exclusion below)
        if (!skipFile) splitMinifierSequence(path, t);
        // entry-global handles re-emit via detectEntries
        if (!skipFile && method !== 'entry-global') {
          const removed = new Set();
          scanExistingCoreJSImports(path.node, {
            packages,
            pkg,
            mode,
            adapter,
            isDisabled,
            // the user's global import is REMOVED here and re-emitted through
            // `addGlobalImport`, so nothing may suppress it as already-present
            onGlobalImport: (mod, node, modPkg) => {
              injector.addGlobalImport(mod, modPkg);
              removed.add(node);
            },
            // a user binding the file WRITES through is poisoned as a dedup target - the
            // pre-mutation scope's constantViolations carry the reassignment fact
            onPureImport: (entry, name) => injector.registerUserPureImport(entry, name, {
              reassigned: (path.scope.getBinding(name)?.constantViolations.length ?? 0) > 0,
            }),
          });
          // a re-parse of our own pure output carries rest/SE-key sentinels already in place -
          // adopt the census' sentinel-position names so the dispatcher skip re-arms, exactly
          // as unplugin's post pass does (the sentinel names co-occur with pure imports; a
          // file with none has nothing to adopt from)
          if (method === 'usage-pure' && injector.existingPureImports.size && fileCensus?.restSentinelNames?.size) {
            injector.adoptUnusedNames(fileCensus.restSentinelNames);
          }
          if (removed.size) {
            for (const stmt of path.get('body')) {
              if (!removed.has(stmt.node)) continue;
              // an indirect-require removal keeps its side-effect prefix (callee's AND an outer comma
              // sequence's - `0, (spy(), require)('core-js/X')` keeps `spy()`), same helper the entry path
              // uses; the emitted prefix statements stay VISITED so a polyfillable use inside them
              // (`(arr.includes(1), require)(...)`) still injects. a side-effect-free prefix drops whole
              const sePrefix = extractIndirectRequireSEPrefix(stmt.node);
              if (sePrefix.length) stmt.replaceWithMultiple(sePrefix.map(e => t.expressionStatement(e)));
              else stmt.remove();
            }
          }
          // mutated-key enrichment runs AFTER the scan registers the user's existing pure imports, so
          // `injectPureImport` dedups a mutated key against a same-entry user import instead of emitting
          // a duplicate (scan-before-enrich, mirroring unplugin). pure-only: it pins pure entries
          if (method === 'usage-pure') {
            enrichMutatedStatics({ mutatedStatics, resolvePure: resolvePureUnfiltered, injectPureImport });
          }
          // early ctor-alias registration (visit-order independence): a member use textually
          // BEFORE its alias write (a hoisted-var read, an earlier-defined closure body) is
          // visited before the destructure emitter would register the alias - pre-register every
          // destructure-of-global site through the same trust gates, so the guarded/static narrow
          // decision reads a complete table on every visit. runs on the post-split AST so
          // minifier-collapsed shapes register like their split forms. BOTH usage modes: pure
          // folds through the hints, usage-global resolves its injections through them - without
          // the table a split-anchor / hoisted-var alias drops the injection (the unsafe direction)
          if (fileCensus.hasCtorAliasShapes) {
            path.traverse({
              AssignmentExpression(p) {
                const { node } = p;
                if (node.operator !== '=' || isDisabled(node)
                    || !isDestructurePattern(node.left)) return;
                registerAliasPrePassSite({
                  pattern: node.left, init: node.right, assignNode: node,
                  scope: p.scope, adapter, injector, path: p,
                });
              },
              VariableDeclarator(p) {
                const { node } = p;
                if (!node.init || isDisabled(node)
                    || !isDestructurePattern(node.id)) return;
                registerAliasPrePassSite({
                  pattern: node.id, init: node.init, declKind: p.parent.kind,
                  scope: p.scope, adapter, injector, path: p,
                });
              },
              // @babel/types omits `decorators` from TSParameterProperty's visitor keys, so this
              // traverse never descends into a constructor param-property's legacy decorator and a
              // ctor-alias write hosted there goes unregistered - the member read then stays native
              // while the estree side (pristine AST) folds it. requeue each decorator so the
              // AssignmentExpression / VariableDeclarator visitors above fire on it, mirroring the
              // mutation pre-pass and usage-visitor requeues
              TSParameterProperty(p) {
                if (!p.node.decorators?.length) return;
                for (const decoratorPath of p.get('decorators')) p.requeue(decoratorPath);
              },
            });
          }
        }
      }

      // --- deferred side effects: splice into body, re-traverse for polyfills ---

      // descending `index` so later splices don't shift earlier ones in the same body;
      // descending `seq` breaks ties deterministically (later-generated first)
      function batchOrder(a, b) {
        return b.index - a.index || b.seq - a.seq;
      }

      // augment a visitor set with the unconditional proxy-hop trigger: an anchored plan must
      // fire even when NO leaf resolves (`{ Map: { customY } } = globalThis` - the point is
      // the re-anchored residual), so leaf-driven dispatch alone cannot cover it. lives in
      // the MAIN traversal - the dedicated normalize pre-pass traverse is retired - AND in the
      // Program:exit drains (deferred-SE / helper bodies), whose cloned subtrees the main pass
      // never saw; without it a deferred host keeps its raw hop while the plain form re-anchors.
      // the flatten is a usage-pure receiver rewrite, so gate HERE like `withCatchExtractor` -
      // every caller routes through this single point and usage-global stays untouched
      function withProxyHopTrigger(visitors) {
        if (!isPure) return visitors;
        return mergeVisitors(visitors, {
          'VariableDeclarator|AssignmentExpression': {
            enter(path) { destructureEmit.tryFlattenProxyHopHost(path); },
            // probed-anchor guard retypes land at the HOST's exit: every per-prop channel of
            // the pattern has dispatched by then (the traversal-time resolvable spelling never
            // leaks), and a sibling plugin's later lowering (preset-env destructuring in a
            // composed pipeline) clones the emitted node - a Program-exit flush would retype
            // the orphaned original and lose the guard
            exit(path) {
              destructureEmit.flushProbedAnchorSwaps(path.node);
              // kept nav-collapse renders land here too - requeued, so the remaining merged
              // passes (ES5 lowerings included) still visit everything they carry
              if (path.isAssignmentExpression()) flushKeptNavCollapseAt(path);
            },
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
        return {
          ...visitors,
          CatchClause: path => destructureEmit.extractCatchClause(path),
          ForOfStatement: path => destructureEmit.extractLoopLeft(path),
          ForInStatement: path => destructureEmit.extractLoopLeft(path),
        };
      }

      // every pass that walks source-shaped nodes - the main pre-traverse, the deferred-SE drain
      // and the retained-header re-walk - needs the SAME augmented set. compose it once instead of
      // rebuilding the merged visitor object per drain batch
      const usageWalkVisitors = usageVisitors ? withProxyHopTrigger(withCatchExtractor(usageVisitors)) : null;

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
          const batch = deferredSideEffects.slice().sort(batchOrder);
          deferredSideEffects.length = 0;
          const inserted = new Set();
          for (const { body, index, anchor, anchorPrev, node } of batch) {
            // re-resolve the slot through the anchored statements: a mid-traversal body
            // unshift (`var _ref;` / sentinel hoists) leaves the recorded index stale.
            // the PRECEDING statement leads (the slot's own host may have been replaced
            // by its rebuild), the slot statement covers slot-0 records, the recorded
            // index stays as the last resort
            const prevAt = anchorPrev ? body.indexOf(anchorPrev) : -1;
            const anchorAt = prevAt < 0 && anchor ? body.indexOf(anchor) : -1;
            const at = prevAt >= 0 ? prevAt + 1
              : anchorAt >= 0 ? anchorAt
                : Math.min(index, body.length);
            body.splice(at, 0, node);
            inserted.add(node);
          }
          // deferred SE is `cloneDeep` of user-written init prefix - the cloned nodes
          // weren't visited by main traversal, so walking with full `usageVisitors` (incl.
          // walkAnnotations) is correct. `helperVisitors` (walkAnnotations=false) targets
          // sibling-plugin-injected helper bodies (already TS-stripped), wrong contract
          // here. usage-pure case: usageVisitors === helperVisitors so behaviour identical
          if (!usageWalkVisitors) continue;
          path.traverse({
            ExpressionStatement(p) {
              if (!inserted.delete(p.node)) return;
              p.traverse(usageWalkVisitors);
              if (!inserted.size) p.stop();
            },
          });
        }
      }

      // a `for` header is the one destructure host with no statement slot: its init is RETAINED
      // in the loop header instead of being lifted, so the drain above never sees it. every
      // emitter that collapses a receiver plants RAW clones of the harvested side effects -
      // copies taken before the main traversal reached their source - and relies on the
      // substrate re-visiting them, which only happens where the host lifts. walk the recorded
      // headers with the same visitors the drain uses, so a `for`-hosted claim polyfills its own
      // re-emitted effects like every other position instead of shipping them raw. the emitter
      // records the hosts as it dispatches, so this costs nothing on a file that has none
      function rewalkRetainedForInits() {
        const hosts = destructureEmit?.retainedForInitHosts;
        if (!hosts?.size) return;
        if (usageWalkVisitors) {
          for (const forStatement of hosts) {
            if (forStatement.node?.init) forStatement.get('init').traverse(usageWalkVisitors);
          }
        }
        hosts.clear();
      }

      // --- pre(): main traverse before other plugins (TS types alive, destructuring intact) ---

      // every pre-phase entry point shares this preamble. defensive - a sibling plugin may have
      // destroyed Program before our pre fires. primitive-state reset BEFORE the early-return so a
      // missing initFile leaves the plugin in a known-clean shape rather than carrying state across
      // files (see `resetPerFilePrimitives` docstring for the full rationale). returns whether the
      // file was INITIALIZED - callers read `skipFile` themselves, because a skipped file still has
      // its own fresh injector while an uninitialized one would leave the PREVIOUS file's in place
      function beginFile(path) {
        resetPerFilePrimitives();
        if (!path?.node) return false;
        initFile(path);
        // the body-resident prologue AS THE SOURCE WROTE IT, before any entry replacement or head
        // insertion of ours: a `'use client'` a sibling transform re-emitted as a raw statement is a
        // directive here and must stay first, while a same-valued string BELOW an import never was
        // one and must not be promoted into the prologue
        injector?.recordSourcePrologue(path.node.body);
        return true;
      }

      function preTraverse(path, visitors) {
        if (!beginFile(path) || skipFile) return;
        path.traverse(visitors);
        processDeferredSideEffects(path);
        // the array-wrapped residuals the per-prop route emptied: the verdict needs the whole
        // traversal, since a second polyfilled prop is what kept the per-prop consume test from
        // firing. BEFORE the split, which replaces the host declaration this verdict is recorded against
        destructureEmit.pruneArrayResiduals();
        destructureEmit.pruneEmptiedHostDeclarators();
        // multi-decl split canon AFTER the SE drain - deferred indices were captured
        // against the pre-split body
        destructureEmit.prepareSplitLiftedPrefixes();
        destructureEmit.splitFlatMultiDecls();
        destructureEmit.flushForInitCarries();
        // the sentinel `var`s a discarded-element render owes, asked of the finished tree
        destructureEmit.flushDiscardedElementSentinels();
        // AFTER the split canon: a host that renders its declarator late (the retained `for`
        // header) has planted its SE clones by now, and BEFORE the flush so the walk's own
        // imports still make this batch
        rewalkRetainedForInits();
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
        const helperWithCatch = withProxyHopTrigger(withCatchExtractor(helperVisitors));
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
        // postHook nulls `injector` after a clean pre/programExit/post cycle; a SECOND
        // Program.exit firing on the same file (sibling plugin re-walking, or a multi-file
        // batch where this file's pre() bailed early but Program.exit still fires)
        // would crash inside `injector?.flush()` / `reorderImportRegion()` etc. on the
        // method calls of a null receiver. symmetric with postHook's own `if (!injector) return`
        if (!injector) return;
        // kept nav-collapse mutations land after every claim resolver has seen the source chain
        flushKeptNavCollapses();
        // the FOLD half only - the parens wait for `post()`, which spells out its own reason. this
        // one is here to catch what a sibling inserted before our exit ran, and it sits AHEAD of the
        // skipFile bail below because a disabled file is reprinted just the same: the compensations
        // are damage control for that reprint, not injection. re-running over an already-folded tree
        // is inert - a folded host no longer carries an instantiation node. what the placement does
        // NOT buy a disabled file is getting ahead of the lowerings: that file runs no usage
        // traversal, so this is its ONLY fold, and by `Program:exit` every sibling visitor has read
        // the node already - `((h.m)<T>)?.(a)` loses its receiver there exactly as it does with no
        // core-js in the list at all
        parensPending = foldInstantiationsPass(path);
        // probed-anchor destructure inits retype into their guard spelling at the same point
        destructureEmit?.flushProbedAnchorSwaps();
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
        destructureEmit.pruneArrayResiduals();
        destructureEmit.pruneEmptiedHostDeclarators();
        destructureEmit.prepareSplitLiftedPrefixes();
        destructureEmit.splitFlatMultiDecls();
        destructureEmit.flushForInitCarries();
        // the sentinel `var`s a discarded-element render owes, asked of the finished tree
        destructureEmit.flushDiscardedElementSentinels();
        destructureEmit.joinBodylessVarBlocks(path);
        rewalkRetainedForInits();
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
        // LAST reachable point: `post()` runs after every sibling's `Program:exit`, so a shape a
        // later-ordered sibling inserted is compensated here or nowhere. ahead of the injector bail -
        // a skipped file is reprinted just the same
        restoreParenCompensations(this.file?.path, parensPending ? null : originalBodyNodes);
        anchorDisableDirectives(this.file?.path?.node);
        if (!injector) return;
        // late style-switch is a safety-net for sibling plugins that strip all ESM markers
        // (e.g. `commonjs` rewriters) after our traversal. by post-phase our flush has
        // already emitted imports; the remaining useful action is surfacing the mismatch
        // through debug so users reorder plugins or opt into `importStyle: 'require'`
        const markersGone = this.file.path.node.body.every(n => !ESM_MARKER_TYPES.has(n.type));
        if (importStyleOption === undefined && importStyle === 'import' && markersGone && injector.hasFlushed) {
          debugOutput?.warn(
            'sibling plugin stripped ESM markers after our traversal; emitted imports '
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
        // the census is AST-bearing too: `writtenContainerSlots` maps each written slot to the
        // VALUE nodes assigned to it, so keeping it would pin the file's tree just as the
        // emitters do. its derived slots go with it - they are read only during traversal
        fileCensus = mutatedStatics = mutationRoots = writtenContainerSlots = null;
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
        parensPending = true;
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
        injector.pruneUnusedPureImports();
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

      // every pre/post handler below is a named function expression, not an arrow, because it needs
      // babel's `this` (`this === pluginPass`, carrying `.file.path` and `.file.opts.filename` for
      // `withFileTag`); an arrow would inherit the enclosing IIFE-scope `this` and drop the file

      if (method === 'entry-global') {
        return {
          pre: withFileTag(function entryGlobalPre() {
            // an uninitialized file must not reach the flush below: the injector would still be the
            // PREVIOUS file's, and flushing it emits into a program it does not belong to
            if (!beginFile(this.file.path)) return;
            if (!skipFile) {
              // `runEntryDetection` unifies the dual dispatch (ExpressionStatement body
              // scan + ImportDeclaration traversal) so the caller doesn't thread a visitor
              // object through manual pre-call + filtered traverse
              runEntryDetection(this.file.path, entryGlobalCallback);
              applyEntryDirectivePromotions(this.file.path);
            }
            // entry-global reprints the file like every babel mode but runs no usage traversal, so
            // the fold has no earlier mount here and this is its only one - OUTSIDE the skip,
            // because a disabled file is reprinted just the same and would otherwise be handed back
            // unparsable. the paren half runs in this mode's `post`, like everywhere else
            parensPending = foldInstantiationsPass(this.file.path);
            injector.flush();
            // snapshot AFTER compensating AND after the flush, for the same reason the usage path
            // snapshots there: the flush inserts the import block, and nodes missing from the set
            // read as sibling-inserted. without a snapshot at all this mode has none, so its post
            // pass would re-walk the whole file it just finished walking
            originalBodyNodes = new WeakSet(this.file.path.node.body);
          }),
          visitor: {},
          post: withFileTag(function entryGlobalPost() {
            // the twin of `postHook`'s first line, for the same reasons spelled out there: last
            // reachable point, and ahead of every bail because a skipped file is reprinted too
            restoreParenCompensations(this.file?.path, parensPending ? null : originalBodyNodes);
            anchorDisableDirectives(this.file?.path?.node);
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
          preTraverse(this.file.path, usageWalkVisitors);
        }),
        visitor: { Program: { exit: withFileTag(programExit) } },
        post: withFileTag(postHook),
      };
    })(),
    /* eslint-enable max-statements -- close defer-block opened above */
  };
}
