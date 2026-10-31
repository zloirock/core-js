// destructure-receiver detection: build polyfill meta for a destructured property given
// its init node. handles direct identifiers, member chains, sequences, logical / conditional
// fallbacks (with `fromFallback` flag), chain-assignment, string-literal init. exposes
// per-branch viability (`isViableBranchForKey`), branch enumeration for usage-global
// (`enumerateFallbackDestructureBranches`), and the parser-shape gate
// (`canTransformDestructuring`)
import knownBuiltInReturnTypes from '@core-js/compat/known-built-in-return-types' with { type: 'json' };
import { matchEntrySubpath } from './entries.js';
import {
  CENSUS_CONTAINER_TYPES,
  argumentOverridesSlot,
  isMemberAccessNode,
  runtimeChainRoot,
  PARAMETER_STATIC_SOURCES,
  parameterStaticSource,
  isCapturedKeyedPattern,
  aliasDeclScope,
  aliasSlotWritten,
  arrayLiteralSlotValue,
  arrayWrapSlotValueCandidates,
  asProxyGlobalName,
  assignmentAliasHintSoundAtRead,
  assignmentValueDiscarded,
  bindingDeclarationPath,
  bindingLoopAnchor,
  bindingNodeType,
  bindingPolyfillHint,
  cachedContainerPaths,
  canHoldBuiltIn,
  collectFoldedReceiverSideEffects,
  computedKeyHasSideEffects,
  createInstanceNodeCache,
  ancestorChainDetached,
  isNonReferencePosition,
  writtenNames,
  trustedIdentifierAliasWrite,
  destructureReceiverNode,
  destructureReceiverSlot,
  findNodeSlot,
  findEnclosingFunctionLikePath,
  findIifeCallSite,
  findIifeArgPath,
  findObjectKeyBeforeSpread,
  flattenInlineArraySpreads,
  flattenBranchKeys,
  FN_NODE_TYPES,
  followConstIdentifierInit,
  forOfHeadElements,
  forOfHeadIterableElements,
  forOfHeadDeclarationOf,
  FUNCTION_LIKE_NODE_TYPES,
  functionScopeBindsVarOrFunction,
  hasObjectRestAncestor,
  getFallbackBranchSlots,
  identifierDeclaratorInit,
  isBareUndefinedIdentifier,
  isChainAssignment,
  inCallerCorrectFallbackSlot,
  identifierReferencedInSubtree,
  isDestructurePattern,
  isEscapedCtorNode,
  forOfIterableElements,
  isForXStatement,
  isForInitDeclaration,
  isFunctionParamDestructureParent,
  isDeoptedStaticRead,
  isMutatedGlobalSlot,
  isNullLiteralNode,
  isPristineProxyGlobal,
  initializerReachesRead,
  isReusableReceiver,
  isReassignedBeyondDeclarator,
  isReceiverShapedNode,
  isReplayableSynthKey,
  isSloppyAtPath,
  isMirrorablePatternValue,
  isPropertyNode,
  patternFullyConsumed,
  observableSequenceElements,
  discardedSequenceElement,
  foldedPropertyKeyName,
  isBodylessStatementSlot,
  peelToExpressionStatement,
  runsWithoutOwnVarSlot,
  isRestProperty,
  installedWriteValue,
  CENSUS_KEY_NAMES,
  CENSUS_STATIC_RECEIVERS,
  isValidIdentifierName,
  memberChainKeys,
  mayHaveSideEffects,
  noReassignmentReachesUsage,
  objectLevelPairedProperty,
  objectLiteralHoldsObservable,
  objectLiteralPrototypeValue,
  objectPatternHasNestedValue,
  objectPropertyReadValue,
  pairedArrayWrapInitElement,
  paramListReadsName,
  stmtRebindNames,
  paramListRunsWork,
  patternBindingCount,
  patternHasRestReadBeforeNestedBinding,
  patternKeepsEffectfulKey,
  patternHasAnyDefault,
  orderBoundPatternProps,
  patternLiteralKeyPath,
  patternPropReadsBindings,
  patternSlotTarget,
  patternSlotValues,
  writtenContainerSlotValuesAt,
  peelChainAssignment,
  peelFallbackBranchInner,
  peelFallbackReceiver,
  peelNestedSequenceExpressions,
  peelTransparentExpr,
  peelParenAndTSParentPath,
  peelProxyGlobalObject,
  peelSequenceTail,
  peelZeroArgIifeReturn,
  positionalElementPath,
  plainSynthKeyName,
  POSSIBLE_GLOBAL_OBJECTS,
  PRIMITIVE_LITERAL_TYPES,
  propBindingIdentifier,
  pureImportEntryOf,
  pureImportSourceEntry,
  reachingContainerValueNode,
  reachingReassignmentValueNode,
  reassignmentBlocksGlobalResolve,
  reassignmentValueEnumeration,
  ownRelocatedHeadElement,
  receiverCarriesLiveOptional,
  reEvaluationObservable,
  referencesArgumentsObject,
  relocatedHeadElement,
  requireCallSource,
  invocationNode,
  resolveCallArgument,
  resolveCallArgumentCoords,
  resolveFallbackReceiver,
  rootProgramOf,
  spelledSlotName,
  statementListOf,
  soleChainToProp,
  staticMemberKeyName,
  subtreeContainsNode,
  synthSlotName,
  synthSwapPropKey,
  unwrapCollectingSePrefixes,
  unwrapExpressionChain,
  nodePositionKey,
  unwrapRuntimeExpr,
  privateNameSpelling,
  noteRenderRetiredWrites,
  pathOfNode,
  pathContainedBy,
  propertyKeyName,
  CLASS_NODE_TYPES,
  unwrapSafeSequenceTail,
  unwrapSafeSequenceTailPath,
  VALUE_FLOW_ASSIGN_OPS,
  varInitDominatesUsage,
  memberKeyName,
  walkAstNodes,
  writeScopeAt,
  writeIsInOppositeBranch,
  writeNeverRuns,
  wksComputedKeyName,
  isUndefinedNode,
  receiverSlotRead,
  unwrapTransparentSeq,
  ALWAYS_TRUTHY_OBJECT_NODES,
  canonAnswerTable,
  cycleGuardCuts,
  cycleGuardHas,
  canonContextPath,
  walkAstChildren,
  withCanonQuestion,
  SELECTION_TEST_FIELDS,
} from '../helpers/ast-patterns.js';
import { canonicalArrayIndex, literalNodeValue, PATTERN_WRAPPERS, PRIMITIVE_WRAPPERS } from '../resolve-node-type/base.js';
import { ORPHAN_REF_PATTERN } from '../injector-base.js';
import {
  isClassifiableReceiverArg,
  isExpandedClassifiableReceiver,
  findNamespaceMemberValue,
  isUsableFallbackReceiverArg,
} from '../helpers/class-walk.js';
import {
  CAPITALISED_IDENT,
  chainSealsAShortCircuit,
  computedKeyWellKnownSymbolName,
  consumableHopSlotName,
  discardRescueNodes,
  globalProxyMemberName,
  certainPairedSlotValue,
  callYieldedLiteral,
  yieldedSlotValue,
  pairedYieldedContainer,
  peelChainRootValue,
  realmYieldingCallView,
  inlineCallReturnExpression,
  callValueCanBeUndefined,
  inlineCallHasObservableEffects,
  inlineCallProxyGlobalRoot,
  isCallShape,
  isKnownStaticGlobal,
  isStaticPlacement,
  memberTargetTakesExtraction,
  moduleDefaultSource,
  navHopChain,
  navShortCircuitSource,
  navValueCanShortCircuit,
  peelRealmLogicalDefault,
  peelReceiverSequenceTail,
  proxyGlobalMemberCtorPure,
  proxyGlobalRootName,
  proxyReceiverValueCanBeUndefined,
  decidedLiveOperand,
  decidedLiveOperandKey,
  decidedRunningPart,
  decidedRunningPath,
  reachableAliasValues,
  reassignedAliasValues,
  realmSelectionCollapseOperand,
  realmSelectionLeafKind,
  resolveKey as sharedResolveKey,
  resolveObjectName,
  resolveSynthKeys,
  seBearingChainRootCall,
  symbolSourcedFoldedKey,
  readKeepingAdapter,
  presenceDecision,
  patternBoundSlotOpen,
  readsReachedAlias,
  realmLevelNamesCtor,
  guaranteedRealmObjectName,
  servedRead,
  servedStaticBacking,
  decidedSelectionValue,
  withinAliasWalkBudget,
} from './resolve.js';
import {
  assignmentExpression,
  callExpression,
  cloneNode,
  conditionalExpression,
  identifier,
  logicalExpression,
  memberExpression,
  memberFromKeyName,
  nullGuardTest,
  arrayExpression,
  objectExpression,
  objectGetter,
  objectPattern as renderObjectPattern,
  objectProperty,
  renderMemoActivation,
  sequenceExpression,
  synthEntryKey,
} from '../render.js';
import {
  entryToGlobalHint,
  hasConstructorEntry,
  hasOwnStaticDefinition,
  hasStaticDefinitionKey,
  namespaceEntryCarriesStatic,
  resolve as resolveBuiltIn,
} from '../index.js';
import {
  KNOWN_NAMESPACE_GLOBALS,
  implementsPrototypeMethod,
  isKnownGlobalName,
  NATIVE_STATIC_OWNERS,
  staticReceiverHint,
  SYMBOL_ITERATOR_PURE_RESULT,
} from './globals.js';

// the init shapes a clean declarator may carry a ctor through (`aliasWriteCtorNames` below)
const CTOR_ALIAS_SOURCE_TYPES = new Set([
  'Identifier',
  'CallExpression',
  'OptionalCallExpression',
  'MemberExpression',
  'OptionalMemberExpression',
  'ConditionalExpression',
  'LogicalExpression',
]);

// Constructor candidates from a binding's reaching values, including selectable initializer arms
// and writes absent from the alias registry (`M = globalThis.Map`). Candidates justify identity
// guards, never an unconditional receiver proof; imported pure namespaces already own their entry.
export function aliasWriteCtorNames({ name, scope, adapter, path, binding = undefined, read = null }) {
  if (binding === undefined) binding = adapter.getBinding?.({ scope, name, path, read });
  const element = forOfHeadElement(binding, name);
  if (!binding) return [];
  const declarator = binding.node?.type === 'VariableDeclarator' ? binding.node : binding.path?.node;
  const init = declarator?.type === 'VariableDeclarator' && declarator.id?.type === 'Identifier'
    ? installedWriteValue(declarator.init) : null;
  // With no loop element or write, the resolver below can only name a constructor through these
  // receiver shapes. Parameters and ordinary instance/literal initializers therefore answer empty
  // without entering the transitive reaching-value walk. a pattern declarator whose slot is OPEN
  // is the exception: paired past a spread it may hold the static candidate or a spread item,
  // holding a branching value it may hold any arm - the same maybe-constructor a refused write
  // leaves, and the walk enumerates the arms. a head over SEVERAL elements that disagree names no
  // one element for the primary, and each is still a candidate the walk below enumerates - the
  // parsers record such a head as a write unevenly, so the elements are asked for, not the writes
  // ... and a PATTERN read where its initializer may not have run yet (a hoisted `var` a function
  // called first reads): the slot holds the value's slot or nothing, and the guard keeps the raw read
  // for the latter - unless the value is the realm, a pattern the plan rewrites into a plain import
  // binding, which names no candidate whichever host reads it first
  const earlyPattern = isDestructurePattern(declarator?.id)
    && !varInitDominatesUsage({ declaratorNode: declarator, usagePath: path, kind: binding.kind })
    && !proxyGlobalRootName({ node: runtimeChainRoot(declarator.init), scope, adapter, path });
  if (!element && !forOfHeadIterableElements(bindingDeclarationPath(binding))?.length
    && !binding.guardedAliasHint && !binding.guardedAliasHints?.length && binding.constantViolations?.length === 0
    && !CTOR_ALIAS_SOURCE_TYPES.has(init?.type) && !earlyPattern
    && !patternBoundSlotOpen({ binding, name, scope, adapter, path })) return [];
  // Registered candidates survive uncertain flow, but not a proven overwrite after their
  // source write. The registry can describe an assignment later than the declarator itself.
  const hints = binding.guardedAliasWrite && (reassignmentBlocksGlobalResolve({
    binding, adapter: { method: 'usage-global' }, path, afterNode: binding.guardedAliasWrite,
  }) || (writeIsInOppositeBranch(binding.guardedAliasWrite, path) && noReassignmentReachesUsage({
    reassignmentNodes: [binding.guardedAliasWrite], usagePath: path,
    bindingScopeNode: binding.scope?.block ?? binding.scope?.path?.node,
    bindingAnchor: bindingLoopAnchor(binding),
  }))) ? [] : [binding.guardedAliasHint, ...binding.guardedAliasHints ?? []].filter(Boolean);
  function resolveHop(hop) {
    // a selection the build decides offers its live operand alone (`decidedSelectionValue`)
    const core = unwrapTransparentSeq(hop.node);
    const node = decidedSelectionValue(core, hop.ctx);
    // ... and where that operand is a for-of head binding (`for (const M of [Map, Set]) { const A = M ||
    // Object }`), each element the head takes in turn (`forOfHeadValues`), as an alias of the head spelled
    // alone reaches them
    if (node !== core && node?.type === 'Identifier') {
      for (const value of forOfHeadValues(node, hop.ctx) ?? []) {
        const candidate = resolveHop({ node: value.node, readNode: value.node, ctx: value.ctx });
        if (candidate) hints.push(candidate);
      }
    }
    // A candidate guard can retain each selectable constructor without asserting
    // that the alias always denotes one. The ordinary name resolver stays scalar.
    if (node?.type === 'ConditionalExpression' || node?.type === 'LogicalExpression') {
      allDestructureValueBranches(node, leaf => {
        // An imported arm already carries its chosen namespace. Re-guarding it
        // would add a second static import when revisiting our own realm guard.
        if (!pureImportSourceEntry(moduleDefaultSource({ node: leaf, ...hop.ctx }))) {
          const candidate = resolveObjectName({ objectNode: leaf, ...hop.ctx, usageNode: hop.readNode });
          if (candidate) hints.push(candidate);
        }
        return true;
      });
    }
    return resolveObjectName({ objectNode: node, ...hop.ctx, usageNode: hop.readNode })
      // ... and a container slot the value reads names its candidate where that read completes: the
      // guard keeps the read, so the init order a receiver-dropping rewrite owes is not asked here
      ?? (isMemberAccessNode(node)
        ? staticContainerReceiverName({ node, ...hop.ctx, adapter: readKeepingAdapter(hop.ctx.adapter) }) : null);
  }
  const values = reachableAliasValues({
    // A loop head has no declarator initializer; its proven element is a guard candidate.
    primary: element && resolveObjectName({
      objectNode: element,
      scope: aliasDeclScope(binding, scope),
      adapter,
      path: bindingDeclarationPath(binding) ?? path,
      usageNode: element,
    }),
    aliasNode: read ?? identifier(name),
    scope,
    adapter,
    path,
    includeDeclaredCandidates: true,
    resolve: resolveHop,
  });
  return hints.length ? [...new Set([...hints, ...values])] : values;
}

const sourceProofAdapters = new WeakMap();

// the adapter a value proof walks under: pure's method, whose walk follows only what a read always holds -
// a view delegating to the adapter, as `readKeepingAdapter`'s
function valueProofAdapter(adapter) {
  if (adapter.method === 'usage-pure') return adapter;
  let proof = sourceProofAdapters.get(adapter);
  if (!proof) sourceProofAdapters.set(adapter, proof = Object.create(adapter, { method: { value: 'usage-pure' } }));
  return proof;
}

// Explicit pure receivers keep their own static reads in global mode. Retain their known
// function/object type so declining a static cannot create unrelated instance claims.
// Pure substitution still serves narrow constructor entries; full indexes keep method identity.
// a reference THIS pass rendered - a swap with no source span, standing where the source spelled
// the global - is no explicit receiver: the decision is the source's, asked as the other emitter
// asks it before its own swap
export function importedStaticReadMeta({ node, meta, scope, adapter, path, objectPattern = null, walkPath = [] }) {
  function explicitSource(sourceNode, ctx) {
    const leaf = unwrapRuntimeExpr(sourceNode);
    if (leaf?.type === 'Identifier' && nodePositionKey(leaf) === null
      && ctx.adapter?.getBinding?.({ scope: ctx.scope, name: leaf.name, path: ctx.path })?.polyfillHint) return null;
    return moduleDefaultSource({ node: sourceNode, ...ctx });
  }
  let directSource = null;
  if (meta && !meta.object && !objectPattern && !walkPath.length) {
    directSource = explicitSource(node, { scope, adapter, path });
    const matched = directSource && matchEntrySubpath(directSource, ['@core-js/pure', 'core-js-pure'], '');
    const entry = pureImportSourceEntry(matched?.entry);
    const object = entry && entryToGlobalHint(entry);
    if (object && !POSSIBLE_GLOBAL_OBJECTS.has(object)) meta = {
      ...meta, receiverHint: staticReceiverHint('static', object),
    };
  }
  if (meta?.placement !== 'static' || !meta.object || POSSIBLE_GLOBAL_OBJECTS.has(meta.object)) return meta;
  if (objectPattern) {
    const walked = destructureHostThroughWrappers(objectPattern, adapter);
    node = walked && destructureReceiverNode(walked.host, null, adapter?.isMutatedStaticSlot ?? adapter?.isMutatedStatic);
    if (!node || !walked.hops) return meta;
    walkPath = walked.hops.map(hop => hop.key ?? String(hop.index));
    path = walked.host;
    scope = path.scope;
  }
  directSource ||= !walkPath.length && explicitSource(node, { scope, adapter, path });
  const proofAdapter = directSource ? adapter : valueProofAdapter(adapter);
  const chain = memberChainKeys(node, staticMemberKeyName);
  const source = directSource || (!chain.keys.includes(null) && walkStaticReceiverChain({
    receiverNode: peelSequenceTail(unwrapTransparentSeq(chain.root), { step: unwrapTransparentSeq }),
    walkPath: [...chain.keys, ...walkPath], scope, path, adapter: proofAdapter,
    preservesSelection: true,
    resolveLeaf: hop => explicitSource(hop.node, hop.ctx),
  }));
  if (!source) return meta;
  const matched = matchEntrySubpath(source, ['@core-js/pure', 'core-js-pure'], '');
  const entry = pureImportSourceEntry(matched?.entry ?? (adapter.method === 'usage-pure' && directSource ? source : null));
  if (!entry || entryToGlobalHint(entry) !== meta.object) return meta;
  // ... and an import of the whole namespace that carries the static at its own level reads it as written
  // (`es/promise` lacks `Promise.allKeyed`, which `actual/promise` ships)
  if (adapter.method === 'usage-pure' && hasOwnStaticDefinition(meta.object, meta.key)) {
    return hasConstructorEntry(meta.object) && !entry.includes('/')
      && namespaceEntryCarriesStatic((matched?.entry ?? source).replace(/\/index(?:\.js)?$|\.js$/u, ''), meta.object, meta.key)
      ? null : meta;
  }
  return { ...meta, object: null, placement: 'prototype', receiverHint: staticReceiverHint('static', meta.object) };
}

// build meta for a destructuring property given its resolved init node + key.
// `receiverHint` lets resolveHint reject `const { includes } = Array` (instance method
// that doesn't exist on the constructor) while accepting `Array.from` and inherited
// Function/Object prototype methods like `name`/`toString`.
export function buildDestructuringInitMeta({
  initNode, key, scope, adapter, path = null, unionSink = null, resolveStaticKey = null, paramDefault = null,
}) {
  const meta = importedStaticReadMeta({ node: initNode, scope, adapter, path,
    meta: buildDestructuringInitMetaCore({ initNode, key, scope, adapter, path, unionSink, resolveStaticKey, paramDefault }) });
  // a static the user monkey-patches is NOT a polyfillable destructure source: the prop
  // stays raw and the receiver substitutes through the identifier machinery, so the patch
  // and the extraction read the same object
  // ... except the well-known-symbol key: its render (`_getIteratorMethod`) reads THROUGH
  // the receiver, so the patched slot is exactly what it answers - and a read the write does not
  // speak for (`isDeoptedStaticRead`)
  if (meta?.object && meta.placement === 'static' && meta.key !== 'Symbol.iterator'
    && isDeoptedStaticRead({ meta, adapter, path })) return null;
  // the PROTOTYPE twin of that gate. a `<Ctor>.prototype` receiver resolves to no NAME at all - its
  // TYPE is what narrows the entry - so the question is asked of the init node's own spelling: the
  // member itself, or a binding holding one (`const P = Array.prototype`). one hop, which is what
  // the census's own receiver walk reaches for the same shape
  if (meta && !meta.object) {
    let recv = unwrapTransparentSeq(initNode);
    if (recv?.type === 'Identifier' && adapter.hasBinding({ scope, name: recv.name, path, read: recv })) {
      const held = identifierDeclaratorInit(adapter.getBinding?.({ scope, name: recv.name, path, read: recv }));
      recv = held ? unwrapTransparentSeq(held) : null;
    }
    if ((recv?.type === 'MemberExpression' || recv?.type === 'OptionalMemberExpression')
      && staticMemberKeyName(recv) === 'prototype') {
      const ctor = resolveObjectName({ objectNode: recv.object, scope, adapter, path, resolveStaticKey });
      if (ctor && adapter.isMutatedStatic?.(`${ ctor }.prototype`, key)) return null;
    }
  }
  return meta;
}

function buildDestructuringInitMetaCore({
  initNode, key, scope, adapter, path = null, unionSink = null, resolveStaticKey = null, paramDefault = null,
}) {
  if (!initNode) return { kind: 'property', object: null, key, placement: null };
  // oxc-parser preserves ParenthesizedExpression (Babel strips them)
  const unwrapped = unwrapTransparentSeq(initNode);
  // A caller's undefined arm reads the default in the parameter frame. Keep the
  // selection as a branch claim even when the caller census knows its condition:
  // emission must serve both the supplied receiver and the default at their own slots.
  if (paramDefault && undefinedArmEffectiveReceiver({ branch: unwrapped, paramDefaultNode: paramDefault.node, scope, adapter, path })) {
    return buildDestructuringInitMeta({ initNode: paramDefault.node, key, ...paramDefault, adapter, unionSink, resolveStaticKey });
  }
  // a ternary or an `&&` the build decides is the operand it always yields (`decidedSelectionValue`): its
  // dead part names no constructor and no guard candidate, and the meta is the live operand's own. a `||` /
  // `??` decides through its own resolver (`deadFallbackRight`), which keeps its left's effect prefix
  const decidable = unwrapped.type === 'ConditionalExpression' || (unwrapped.type === 'LogicalExpression' && unwrapped.operator === '&&');
  const live = path && decidable && !paramDefault ? decidedSelectionValue(unwrapped, { scope, adapter, path }) : unwrapped;
  if (live !== unwrapped) {
    return buildDestructuringInitMeta({ initNode: live, key, scope, adapter, path, unionSink, resolveStaticKey });
  }
  // branch handlers for binary / sequence / conditional shapes recurse with the per-branch
  // expression; pure positional resolution falls through to the type-specific cases below.
  // `path` threads through every recursion so downstream `adapter.hasBinding({ scope, name, path })`
  // reaches the TS-runtime fallback (`declare const X` / namespace bodies that estree-toolkit's scope
  // tracker doesn't register)
  switch (unwrapped.type) {
    case 'LogicalExpression':
      return resolveLogicalDestructureMeta({ node: unwrapped, key, scope, adapter, path, resolveStaticKey, paramDefault });
    case 'SequenceExpression':
      // `(0, Array)`: sequence evaluates to its last expression
      return buildDestructuringInitMeta({ initNode: unwrapped.expressions.at(-1), key, scope, adapter, path, unionSink, resolveStaticKey });
    case 'ConditionalExpression':
      return resolveConditionalDestructureMeta({ node: unwrapped, key, scope, adapter, path, resolveStaticKey, paramDefault });
    case 'AssignmentExpression':
      // Every plain assignment yields its RHS, including an inner destructure. The
      // retained capture keeps that inner write intact while serving the outer read.
      if (unwrapped.operator === '=') {
        return buildDestructuringInitMeta({ initNode: unwrapped.right, key, scope, adapter, path, unionSink, resolveStaticKey });
      }
      break;
    // a TAGGED template is a call of its tag, so an init spelled as one names what the tag hands
    // back exactly as a call's init does; the inline canon behind `resolveObjectName` pairs the
    // strings array and the interpolations for it
    case 'TaggedTemplateExpression':
    case 'NewExpression':
    case 'AwaitExpression':
    case 'CallExpression':
    case 'OptionalCallExpression': {
      // zero-arg IIFE wrapping a fallback shape: `const { from } = (() => cond ? Array
      // : Iterator)()`. recurse on the IIFE's return expression so per-branch enumeration
      // sees the conditional/logical inside. args-bearing calls preserve their semantics
      // (peel returns null, switch falls through to the `object: null` default)
      const iifeInner = peelZeroArgIifeReturn(unwrapped, { staticIsMutated: adapter.isMutatedStaticSlot ?? adapter.isMutatedStatic });
      if (iifeInner) return buildDestructuringInitMeta({ initNode: iifeInner, key, scope, adapter, path, unionSink, resolveStaticKey });
      // an inline-resolvable call init (`(() => { c++; return Promise; })()`): classify through
      // resolveObjectName's call inlining, same as the direct flatten path. without this, the
      // conditional / fallback branch enumeration treats the branch as opaque and the per-branch
      // synth leaves NATIVE statics on the taken branch (undefined on targets without them)
      const callObjectName = resolveObjectName({ objectNode: unwrapped, scope, adapter, path })
        ?? provenRealmCallName(unwrapped, { scope, adapter, path }, { allowEffects: true });
      if (callObjectName) {
        const callPlacement = isStaticPlacement(callObjectName);
        return {
          kind: 'property', object: callObjectName, key, placement: callPlacement,
          receiverHint: staticReceiverHint(callPlacement, callObjectName),
        };
      }
      break;
    }
  }
  // `const { from } = this` inside a STATIC method of `extends Array`: `this` is the
  // constructor, so the destructure reads the inherited STATIC surface exactly like
  // `this.from` - resolve through the emitter's class-walk hook (same extends resolution
  // and own-static-member shadow gate as the member remap); non-static / shadowed /
  // unresolved supers fall through to the untyped default
  if (unwrapped.type === 'ThisExpression' && path) {
    const inherited = adapter.resolveThisStaticHost?.(path, key);
    if (inherited) return { ...inherited, receiverHint: staticReceiverHint(inherited.placement, inherited.object) };
  }
  // `const { from } = Array` or `const { from } = globalThis.Array`; a member init that names
  // no proxy-global chain still resolves through a const-bound static CONTAINER
  // (`const { from } = w.k` over `const w = { k: Array }`) - the SAME walk fallback the member
  // and nested-destructure reads pair with, so the flat spelling stops under-resolving
  if (isReceiverShapedNode(unwrapped)) {
    const selectionArms = [];
    const objectName = resolveObjectName({ objectNode: unwrapped, scope, adapter, path, resolveStaticKey })
      ?? staticContainerReceiverName({
        node: unwrapped,
        scope,
        adapter,
        path,
        unionSink,
        selectionSink: selectionArms,
        rescuesReceiverRead: path?.node.type === 'VariableDeclarator' || path?.node.type === 'AssignmentExpression',
      });
    // ... and a member reading a slot through a selection of containers names one constructor per arm:
    // the member channel's identity guard over those arms whose static core-js does not swap in (`c ? {
    // C: Map } : { C: Object }`), on the receiver it captures
    const guarded = objectName || !isMemberAccessNode(unwrapped) ? [] : guardableSelectionArms(selectionArms, adapter);
    if (guarded.length) {
      return {
        kind: 'property',
        object: null,
        key,
        placement: 'static',
        receiverHint: null,
        guardedAliasHint: guarded[0],
        guardedWriteObjects: guarded,
        guardOnly: true,
        captureGuardReceiver: true,
      };
    }
    const placement = objectName ? isStaticPlacement(objectName) : null;
    // an alias whose ctor-hint could not drive a STATIC narrow (a REFUSED registration - a
    // conditional write, an SE-carrying init) resolves to NOTHING here, and the key then drops
    // entirely: the destructured read goes out raw off a binding the emit already swapped to the
    // pure ctor, so the static is `undefined` where native answers the method. carry the hint like
    // the member channel does - the emitters render the same runtime ctor guard for it
    if (!objectName && unwrapped.type === 'Identifier') {
      const guardedBinding = adapter.getBinding?.({ scope, name: unwrapped.name, path, read: unwrapped });
      // ... and when NOTHING registered an alias (`let M; if (c) M = globalThis.Map` - the
      // write's RHS resolves on its own, so no alias is ever registered), the write
      // enumeration IS the hint, exactly as the member channel reads it
      const writeCtors = aliasWriteCtorNames({ name: unwrapped.name, scope, adapter, path, binding: guardedBinding, read: unwrapped });
      const hint = writeCtors[0] ?? null;
      if (hint) {
        return {
          kind: 'property', object: null, key, placement: 'static', receiverHint: null,
          guardedAliasHint: hint,
          // every ctor the slot was written with - the key may live on an EARLIER write's one, and a
          // write whose RHS resolves on its own (`M = globalThis.Map`) registers no alias at all, so
          // the binding's write enumeration is asked too
          guardedWriteObjects: writeCtors,
          guardOnly: true,
        };
      }
    }
    return { kind: 'property', object: objectName, key, placement, receiverHint: staticReceiverHint(placement, objectName) };
  }
  if (adapter.isStringLiteral(unwrapped)) {
    return { kind: 'property', object: 'string', key, placement: 'prototype' };
  }
  return { kind: 'property', object: null, key, placement: null };
}

// `Array ?? X`, `X ?? Array`, `X && Array`: try both branches, prefer the one
// that resolves to a known global (for `??`/`||` the primary is left side; for `&&` it's
// the right side - the branch taken when the left/right gate is truthy).
// `fromFallback` marks that the runtime value may come from EITHER branch, which routes the
// emit to per-branch enumeration (see `resolveAndDestructureMeta` below) rather than a single
// whole-init replacement - it does not disable the rewrite. `&&` is always conditional (primary
// only when left truthy, else falsy left), so always flag; `??`/`||` flag only when the fallback
// is the resolved side
function resolveLogicalDestructureMeta({ node, key, scope, adapter, path, resolveStaticKey = null, paramDefault = null }) {
  return node.operator === '&&'
    ? resolveAndDestructureMeta({ node, key, scope, adapter, path, resolveStaticKey, paramDefault })
    : resolveOrNullishDestructureMeta({ node, key, scope, adapter, path, resolveStaticKey, paramDefault });
}

// `&&`: primary is the RIGHT branch. when both branches resolve to the SAME known object
// the polyfill applies cleanly; otherwise fromFallback flag triggers per-branch enumeration
// (`Array && Map` for `entries` -> `Array && _Map`, `Array && Promise` for `from` ->
// `{from:_Array$from} && _Promise`). `fromFallback` always set when objects differ or left
// doesn't resolve - runtime value depends on the left's truthiness
function resolveAndDestructureMeta({ node, key, scope, adapter, path, resolveStaticKey = null, paramDefault = null }) {
  // a branch that resolves to a monkey-patched static yields a null meta - guard before reading
  // `.object` (null deref -> build crash), leaving the destructure raw exactly as the conditional
  // path does (the per-identifier receiver substitution handles the mutated static elsewhere)
  const primaryMeta = buildDestructuringInitMeta({ initNode: node.right, key, scope, adapter, path, resolveStaticKey, paramDefault });
  if (!primaryMeta?.object) return primaryMeta;
  const leftMeta = buildDestructuringInitMeta({ initNode: node.left, key, scope, adapter, path, resolveStaticKey, paramDefault });
  if (leftMeta?.object === primaryMeta.object) return primaryMeta;
  return fallbackDestructureMeta(primaryMeta, leftMeta, adapter);
}

// a HOP meta (`{ Array: { from } } = globalThis`) names no static of its own - `globalThis.Array`
// is a proxy SURFACE read, not a polyfilled static - so the primary test below discarded it and a
// `||` wrapping a BRANCHING left dropped the whole selection to its unresolvable fallback, leaving
// the pattern raw. only a left that already branches qualifies: it is the shape the per-branch
// machinery owns, and its own enumeration resolves each arm through the surface
function branchingProxySurfacePrimary(meta, adapter) {
  return !!meta?.fromFallback && meta.kind === 'property' && POSSIBLE_GLOBAL_OBJECTS.has(meta.object)
    && isPristineProxyGlobal(adapter, meta.object);
}

// `||` / `??`: primary is the LEFT branch (taken when truthy / non-nullish). use primary
// when its meta resolves to a real polyfill (static lookup on known receiver, OR instance
// fallback for unknown receiver with instance-method key like `Stub ?? Object` for `includes`
// -> `_includes(...)`). otherwise the fallback (right) carries the actual polyfill - e.g.
// `MyArray || Iterator` for `from` registers `Iterator.from` because `_Iterator`'s
// constructor binding doesn't carry the static method - unless the build decides the selection for
// its left (`deadFallbackRight`): the right never runs there, so it carries nothing
function resolveOrNullishDestructureMeta({ node, key, scope, adapter, path, resolveStaticKey = null, paramDefault = null }) {
  // does this build decide the selection for its left (`deadFallbackRight`) - asked lazily, once, by the
  // readers below
  let decided;
  function decidesForLeft() {
    decided ??= deadFallbackRight(node, { scope, adapter, path }) ?? false;
    return !!decided;
  }
  // null meta = monkey-patched static branch; null-guard before `.object` (build crash otherwise)
  const primaryMeta = buildDestructuringInitMeta({ initNode: node.left, key, scope, adapter, path, resolveStaticKey });
  // a built-in the configured subset does not carry counts for nothing (`defined`): it names no
  // value of this build, and the fallback carries what the right reads (`globalThis.AsyncIterator ||
  // Array` below `full` - the right's `from`)
  const primaryPure = primaryMeta?.object && adapter.defined?.(primaryMeta) !== false ? resolveBuiltIn(primaryMeta) : null;
  // ... an INSTANCE answer is only the key's common dispatch, off a constructor too: a static lookup
  // the definitions hold no own static for falls through to the instance map (`globalThis.WeakRef`
  // for `concat`). a fallback whose constructor owns the key as a STATIC is a value the selection
  // yields as well, unless this build decides the selection for its left (`deadFallbackRight`)
  const sharedStaticFallback = primaryPure?.kind === 'instance'
    && resolveBuiltIn(buildDestructuringInitMeta({
      initNode: node.right, key, scope, adapter, path, resolveStaticKey, paramDefault,
    }) ?? {})?.kind === 'static'
    && !decidesForLeft();
  if (primaryMeta?.object && !sharedStaticFallback && (primaryPure || branchingProxySurfacePrimary(primaryMeta, adapter))) {
    if (node.operator === '||' && !selectionLeftAlwaysTruthy({ node: node.left, scope, adapter, path }) && !decidesForLeft()) {
      const fallbackMeta = buildDestructuringInitMeta({ initNode: node.right, key, scope, adapter, path, resolveStaticKey, paramDefault });
      return fallbackDestructureMeta(primaryMeta, fallbackMeta, adapter);
    }
    // The left must satisfy the operator's selector: truthy for OR, non-nullish for nullish coalescing.
    // An undefinable probe nav (`globalThis.window?.Array ?? {}`) selects the FALLBACK exactly off-env, so
    // the runtime value depends on the environment like a differing-branch `&&` - flag it
    // for the per-branch machinery instead of binding the polyfill to the left, and so does a selection
    // the user opted out of, which decides nothing (`isOptedOut`). usage-global, which
    // renders no arm, flags as well a left owning the key as a STATIC that the build does not decide for
    // (`deadFallbackRight`: a slot the census sees written, a read it does not serve), so the right's own
    // static is injected too; an instance answer is the key's common dispatch, shared above
    return fallbackValueCanBeNullish(node.left, { scope, adapter, path }) || adapter.isOptedOut?.(node)
      || (adapter.method === 'usage-global' && primaryPure?.kind === 'static' && !decidesForLeft())
      ? { ...primaryMeta, fromFallback: true } : primaryMeta;
  }
  // ... and a selection decided for its left never runs the right, so the right claims nothing there: the
  // left's own read stands (`globalThis || Array` reads `from` off the realm), an unnamed one's instance
  // read included (`[1] || {}` reads `map` off the array), and a guard over the left's candidates tests
  // that left as the member read off the selection does (`decidedReceiver`)
  if (decidesForLeft()) return primaryMeta?.guardedAliasHint ? { ...primaryMeta, decidedReceiver: decided.left } : primaryMeta;
  const fallbackMeta = buildDestructuringInitMeta({ initNode: node.right, key, scope, adapter, path, resolveStaticKey, paramDefault });
  if (!fallbackMeta?.object) return fallbackMeta;
  return fallbackDestructureMeta(fallbackMeta, primaryMeta, adapter);
}

// the slots a per-branch walk visits under a value-selecting node, or null where it selects nothing.
// a `||` / `??` its LEFT always decides has no live right: the walk skips it, and `deadRight` tells the
// binding that a selection it mirrored gives way to that left, dropping the right with it
function fallbackBranchWalk(node, ctx) {
  const slots = getFallbackBranchSlots(node);
  const deadRight = !!slots && node.type === 'LogicalExpression' && node.operator !== '&&'
    && selectionLeftAlwaysTruthy({ node: node.left, ...ctx, throughChainAssign: true });
  return slots && { slots: deadRight ? ['left'] : slots, deadRight };
}

// may this RECEIVER VALUE be synth-swapped to a polyfill literal? the question is about the value,
// not about which branch runs: an UNDEFINABLE value is nullish precisely where the always-defined
// literal is not, so swapping it erases the throw the source performs there, flips which arm a
// `||` / `??` takes, and on a host that HAS the probe hands our binding where the source reads the
// realm's own. three answers admit the swap and nothing else does: the value cannot be nullish; the
// caller-correct FALLBACK SLOT, whose doctrine is the provider's own (a slot that fires only on the
// omitted argument keeps the literal); or a synth carrying the original nullish guard, which
// restores both halves at once. this is the PER-BRANCH walks' question, and the mirror targets of
// the shared plan ask a STRICTER one: they skip a selecting leaf that can be nullish even where a
// guard exists, because their render places the guarded read as a sequence prefix INSIDE the arm,
// which runs unconditionally and throws on the very path the selection rescues. collapsing the two
// looks right and is not - it was tried, and the corpus caught it on a `??` left
export function fallbackBranchSwapKeepsSelection({ branchNode, scope, adapter, path, resolvePure }) {
  if (!fallbackValueCanBeNullish(branchNode, { scope, adapter, path })) return true;
  if (inCallerCorrectFallbackSlot(path, branchNode)) return true;
  return !!planSynthReceiverGuard({ receiver: branchNode, scope, adapter, path, resolvePure });
}

// a synth replacing a short-circuiting navigation keeps the receiver's nullish branch.
// the probe is an explicit marker in the discard walk, so effects split at their structural
// evaluation position even on ASTs without source spans; effects carried by the probe run once.
// caller-correct default slots keep their accepted always-defined literal instead.
export function planSynthReceiverGuard({ receiver, scope, adapter, path, resolvePure }) {
  const core = unwrapTransparentSeq(receiver);
  const node = core.type === 'LogicalExpression' ? core.left : core;
  const aliasCtx = { scope, adapter, path };
  const probe = navShortCircuitSource(node, resolvePure, aliasCtx, { throughChainAssign: true });
  if (!probe || chainSealsAShortCircuit(node, resolvePure, aliasCtx, { throughChainAssign: true })) return null;
  if (inCallerCorrectFallbackSlot(path, receiver)) return null;
  const rootCall = seBearingChainRootCall({ node, ...aliasCtx });
  const rescue = new Set(rootCall ? [probe, rootCall] : [probe]);
  const effects = collectFoldedReceiverSideEffects(node, { rescue, ctx: aliasCtx });
  const at = effects.indexOf(probe);
  if (at === -1) return null;
  const ahead = effects.slice(0, at);
  const after = effects.slice(at + 1).filter(effect => !subtreeContainsNode(probe, effect));
  // Deferred synths keep this source proof while child claims replace the probe
  // and effect slots. Neither a rendered guard nor a minted alias is new evidence.
  const slots = new Map([probe, ...ahead, ...after].map(source => {
    const sourcePath = path && pathOfNode(path, source);
    return [source, sourcePath ? { owner: sourcePath.container, key: sourcePath.key } : findNodeSlot(receiver, source)];
  }));
  function live(source) {
    const slot = slots.get(source);
    return slot?.owner[slot.key] ?? source;
  }
  return { fallback: core.type === 'LogicalExpression' ? core : null,
    get probe() { return live(probe); },
    get ahead() { return ahead.map(live); },
    get after() { return after.map(live); } };
}

// can this fallback OPERAND evaluate to nullish - the value question exactly as `||` / `??`
// see it? a short-circuit hidden under a SEAL never hands nullish on: the read above the
// seal THROWS instead (and the probe channel owns that throw), so only a top-reaching
// short-circuit or a bare environment probe counts
// `throughChainAssign` reads a write under a `?.` as the nav it stores (`(q = globalThis.window)?.Array`),
// the value reading; the routing callers keep the write opaque, as the short-circuit canon explains
function fallbackValueCanBeNullish(node, aliasCtx, { throughChainAssign = false } = {}) {
  const core = unwrapTransparentSeq(node);
  const options = { throughChainAssign };
  return proxyReceiverValueCanBeUndefined(core, ({ name }) => resolveBuiltIn({ kind: 'global', name }), aliasCtx, options)
    && !chainSealsAShortCircuit(core, ({ name }) => resolveBuiltIn({ kind: 'global', name }), aliasCtx, options);
}

// THE ownership question for an SE-key STATIC under a constructor hop: does the MIRROR own this
// claim's receiver, or a route that consumes the hop? Both bindings ask it at the same point in their
// dispatch, ahead of every such route, because the answer is one semantic fact and a leg that gated
// its own ask reached a different set of shapes. Five halves, and each of them was measured:
//   - the claim is a STATIC with a side-effecting computed key - the class FC-472 names, whose
//     receiver must be spelled the way its non-SE twin is spelled on the same host;
//   - it stands under a HOP: a flat key reads the host's own receiver, which the flat channel spells,
//     and mirroring there bought a second memo over the first;
//   - the host SWAPS that receiver (a declarator or an assignment). A parameter default or a call
//     argument fills a slot the caller owns and is judged by its own rule;
//   - reading the receiver owes no throw: a literal cannot throw where the source's read does, and the
//     PROBE channel - the read kept as a discarded prefix, the value from the ponyfill - owes it;
//   - the hop names a CONSTRUCTOR with a ponyfill of its own. That is the shape whose capture binds
//     either the bare `*/constructor`, carrying none of the ctor's statics, or the realm's own slot,
//     which an engine without the constructor has nothing in. A hop naming a global with no ctor
//     ponyfill (`globalThis.Array`) is a realm read present on every floor, and the routes that fold
//     it keep it. Resolved BY NAME, the identity comparator's own idiom - a path widens the answer to
//     the namespace entry
export function seKeyStaticOwesTheMirror({ propPath, meta, kind, adapter, resolvePure }) {
  if (kind !== 'static' || meta?.placement !== 'static' || !resolvePure) return false;
  if (!propPath?.node || !computedKeyHasSideEffects(propPath.node, { scope: propPath.scope, adapter, path: propPath })) return false;
  const walked = destructureHostThroughWrappers(propPath.parentPath, adapter, true);
  const hopKey = walked?.hops?.at(-1)?.key;
  const hostType = walked?.host?.node?.type;
  if (typeof hopKey !== 'string' || (hostType !== 'VariableDeclarator' && hostType !== 'AssignmentExpression')) return false;
  if (!resolvePure({ kind: 'global', name: hopKey }, null)) return false;
  const receiver = destructureReceiverNode(walked.host, null, adapter?.isMutatedStaticSlot ?? adapter?.isMutatedStatic);
  return !!receiver && !destructureReceiverOwesAThrow(receiver,
    { scope: propPath.scope, adapter, path: propPath });
}

// A static/global claim asks for the receiver mirror before a competing extraction.
// Parameters first need their caller census: mirroring only a default does not serve
// supplied arguments. Instance claims retain their ordinary extraction.
export function patternClaimOwesMirror(kind, propPath) {
  return kind !== 'instance' && !isFunctionParamDestructureParent(propPath.parentPath);
}

// does READING this receiver owe a throw? a top-reaching short-circuit hands the destructure
// `undefined`, and a chain SEALING one throws above the seal - either way the read is observable, so
// a route that REPLACES the receiver with a literal would erase it. Asked on the sequence TAIL: a
// prefix effect settles nothing about the value
function destructureReceiverOwesAThrow(node, aliasCtx) {
  const core = unwrapTransparentSeq(node);
  return proxyReceiverValueCanBeUndefined(core, ({ name }) => resolveBuiltIn({ kind: 'global', name }), aliasCtx)
    || chainSealsAShortCircuit(core, ({ name }) => resolveBuiltIn({ kind: 'global', name }), aliasCtx);
}

// Join both selected receivers without substituting one arm for the whole expression.
// Named statics retain per-arm mirroring, even for equal constructor names; a key shared
// with instance receivers uses the guarded fallback metadata below.
function resolveConditionalDestructureMeta({ node, key, scope, adapter, path, resolveStaticKey = null, paramDefault = null }) {
  const consequent = buildDestructuringInitMeta({ initNode: node.consequent, key, scope, adapter, path, resolveStaticKey, paramDefault });
  const alternate = buildDestructuringInitMeta({ initNode: node.alternate, key, scope, adapter, path, resolveStaticKey, paramDefault });
  // a branch may be null (a monkey-patched static) - the whole conditional stays raw then,
  // matching the single-receiver mutated path (receiver substitution happens per-identifier)
  if (!consequent || !alternate) return null;
  const resolved = consequent.object ? consequent : alternate.object ? alternate : null;
  if (!resolved) return consequent;
  const other = resolved === consequent ? alternate : consequent;
  return fallbackDestructureMeta(resolved, other, adapter);
}

// A selected type cannot stand for a different arm. A key shared by a constructor's
// static surface and instance receivers needs the existing identity guard, whose fallback
// dispatches on the selected value. Other named statics retain per-branch mirroring.
function fallbackDestructureMeta(resolved, other, adapter) {
  const { key } = resolved;
  const instance = { kind: 'property', object: null, key, placement: null };
  // A generic instance claim reads the selected receiver, including an unknown primary arm.
  if (!resolved.placement && resolveBuiltIn(resolved)?.kind === 'instance') return instance;
  if (resolved.placement === 'prototype' && other?.object !== resolved.object) return instance;
  if (resolved.placement === 'static' && other?.placement !== 'static') {
    const pure = resolveBuiltIn(resolved);
    if (pure?.kind === 'instance') return instance;
    if (adapter.method === 'usage-pure' && pure?.kind === 'static' && resolveBuiltIn(instance)?.kind === 'instance') return {
      ...instance, placement: 'static', guardedAliasHint: resolved.object,
      guardedWriteObjects: [resolved.object], guardOnly: true,
    };
  }
  return { ...resolved, fromFallback: true };
}

// SE-bearing receiver policy for the synth literal (`{key: _Branch$key}` swap of `cond ? (() => { c++;
// return Array; })() : Array`, `{from} = IIFE().Array`, `{from} = (eff(), Array) || Set`). the literal
// collapses the receiver, so its observable setup must run EXACTLY once. `callBranch` selects HOW the
// emitter renders that when a key is left UNRESOLVED (an unpolyfilled sibling): with `callBranch` it
// memoizes the receiver through a function-IIFE param (`(function (_ref) { return { ..., other:
// _ref.other }; })(<receiver>)`) so the receiver runs once and unresolved keys read the memo - a
// re-read would otherwise re-run it (the double-eval). when EVERY key resolves there is no re-read, so
// the SE is `rescueSe`-d ahead of the literal instead (`(<receiver>, literal)`); a pure receiver folds
// away. returns { callBranch, rescueSe }
export function classifyCallBranchForSynth({ inner, scope, adapter, path }) {
  if (isCallShape(inner)) {
    return { callBranch: true, rescueSe: seBearingChainRootCall({ node: inner, scope, adapter, path }) };
  }
  // a member receiver whose discarded chain hides observable setup: a buried SE anywhere along the
  // spine OR in a computed key at ANY hop, including the receiver's OWN key (`(eff(), globalThis).Array`,
  // `globalThis[(eff(), 'self')].Array`, `globalThis[(eff(), 'Array')]`), OR a SE-bearing call /
  // chain-assignment at the chain ROOT (`mk().Array`, `IIFE().Array`, `(a = mk()).Array`). the whole
  // receiver VALUE is replaced by the synth literal here, so every computed key's effect is discarded -
  // `collectFoldedReceiverSideEffects` descends the entire receiver (the spine-only prefix walk on
  // `.object` missed computed keys, dropping the effect from the param-default synth)
  if ((inner?.type === 'MemberExpression' || inner?.type === 'OptionalMemberExpression')
    && discardRescueNodes({ node: inner, scope, adapter, path }).length) {
    return { callBranch: true, rescueSe: inner };
  }
  // a fallback-logical receiver (`(eff(), Array) || Set`, `IIFE().Array || Set`) whose resolved LEFT
  // carries discarded SE: the emitter rescues it via the separate leftSe plan when every key resolves,
  // but a mixed key set re-reads the collapsed left, so route through memoization there too. rescueSe
  // stays null - the leftSe plan (suppressed when memoizing) owns the all-resolved rescue
  if (inner?.type === 'LogicalExpression' && inner.operator !== '&&'
    && discardRescueNodes({ node: inner.left, scope, adapter, path }).length) {
    return { callBranch: true, rescueSe: null };
  }
  return { callBranch: false, rescueSe: null };
}

// per-branch synth-swap viability check: branch is a candidate for `{key: _Branch$key}`
// rewrite when it resolves to a static method on a known global with a viable pure entry.
// accepts:
//   - bare Identifier (`Array`) - direct global reference
//   - MemberExpression (`globalThis.Array`, `window.Array`) - proxy-global member chain;
//     `buildDestructuringInitMeta` -> `resolveObjectName` walks the chain to the actual
//     constructor name. without this, an Identifier-only check would leave member-form branches
//     to a side-channel rewrite (`globalThis` -> `_globalThis`), making Identifier and
//     MemberExpression branches asymmetric in the same conditional
// returns the resolved pure descriptor (with `entry`/`hintName`/`kind`) or null.
// shared between babel-plugin and unplugin so the branch-detection rules stay in lockstep
export function isViableBranchForKey({ branch, key, scope, adapter, resolvePure, path = null }) {
  // peel ParenthesizedExpression / TS expression wrappers AND safe SE tail around the branch:
  // `cond ? (Array) : (Iterator)` (oxc preserves parens), `cond ? Array! : Iterator!` (TS),
  // `cond ? (0, Array) : Iterator` (SE-prefixed). without the SE-tail peel, comma-prefixed
  // branches would resolve to SequenceExpression -> the strict-shape check would bail and per-branch
  // synth would drop that side, leaving native `Array.from` -> a "polyfill always wins" violation
  const inner = peelFallbackBranchInner(branch);
  if (inner?.type !== 'Identifier'
    && inner?.type !== 'MemberExpression'
    && inner?.type !== 'OptionalMemberExpression'
    // an inline-resolvable call branch (`cond ? (() => { c++; return Array; })() : Array`)
    // classifies via the CallExpression arm of `buildDestructuringInitMeta`; the emitters gate
    // it to a single fully-polyfilled key and rescue its setup ahead of the synth literal
    && !isCallShape(inner)) return null;
  // a bound branch name is the value canon's question, not a bail: a shadow (`function f(Array)
  // { ({from} = cond ? Array : Set) }`) resolves to no global and declines below, while a const
  // ALIAS of one (`const P = Promise; cond ? P : Fallback`) resolves to it and mirrors like the
  // bare name - declining it left the branch reading `.all` off the swapped constructor, which the
  // pure entry never carries
  const meta = buildDestructuringInitMeta({ initNode: inner, key, scope, adapter, path });
  // `fromFallback` means the branch's runtime value is NOT pinned to one constructor (an IIFE
  // wrapping a conditional - `(() => cond ? Array : Iterator)()`): swapping it to a single
  // synth literal would discard the other branch. leave it raw - the identifier visitor still
  // substitutes the polyfillable constructors inside
  if (!meta?.object || meta.kind !== 'property' || meta.placement !== 'static' || meta.fromFallback) return null;
  const pure = resolvePure(meta, path);
  if (!pure || pure.kind === 'instance') return null;
  return pure;
}

// Inside a parameter-default host whose winning receiver is the call argument, an
// unshadowed undefined/void arm reads the default. The branch walk registers that
// default at its original parameter slot, leaving the argument and its timing intact.
// Only effect-free defaults participate in this branch route; other defaults retain
// their ordinary receiver handling. Null stays out because it never applies a default.
function undefinedArmEffectiveReceiver({ branch, paramDefaultNode, scope, adapter, path }) {
  if (!paramDefaultNode) return null;
  const inner = peelFallbackBranchInner(branch);
  const undefinedShaped = inner && ((isBareUndefinedIdentifier(inner)
    && !adapter?.hasBinding?.({ scope, name: inner.name, path, read: inner }))
    || (inner.type === 'UnaryExpression' && inner.operator === 'void' && !mayHaveSideEffects(inner.argument)));
  if (!undefinedShaped || mayHaveSideEffects(paramDefaultNode)) return null;
  return paramDefaultNode;
}

// Only a delivered undefined value applies a parameter default. An AND may deliver
// its left, while an OR/nullish left selects the right whenever it is undefined.
function fallbackBranchDefault(node, slot, paramDefault) {
  return node.type === 'LogicalExpression' && node.operator !== '&&' && slot === 'left' ? null : paramDefault;
}

// One fallback synth walk owns arm order, selection safety and leaf admission. Native
// bindings expose live branch slots and register the accepted leaf; their queues remain
// private. A dead right is removed only AFTER a descendant registered, and never while
// a pending whole-receiver swap owns the selection. Sequence prefixes stay outside the
// peeled target. An undefined arm registers its effect-free parameter default; null cannot.
export function visitFallbackSynthBranches({
  branch,
  key,
  undefinedArmFallback = null,
  adapter,
  resolvePure,
  readBranch,
  childBranch,
  contextFor = (node, source) => source,
  register,
  ownsReceiver,
  dropDeadRight,
}) {
  function visit(target, defaultNode) {
    const source = readBranch(target);
    const inner = source?.node;
    if (!inner) return false;
    const { scope, path } = contextFor(inner, source);
    const ctx = { scope, path, adapter };
    const walk = fallbackBranchWalk(inner, ctx);
    if (walk) {
      let any = false;
      for (const slot of walk.slots) {
        const childDefault = fallbackBranchDefault(inner, slot, defaultNode);
        // A selection container is never mirrored whole here. Visit its leaves
        // individually: rejecting the container would also hide a delivered default.
        if (!getFallbackBranchSlots(peelFallbackBranchInner(inner[slot]))
          && !undefinedArmEffectiveReceiver({ branch: inner[slot], paramDefaultNode: childDefault, ...ctx })
          && !fallbackBranchSwapKeepsSelection({
            branchNode: inner[slot], ...ctx, resolvePure: meta => resolvePure(meta, ctx.path),
          })) continue;
        if (visit(childBranch(source, slot), childDefault)) any = true;
      }
      if (any && walk.deadRight && !ownsReceiver(source)) dropDeadRight(source);
      return any;
    }
    const effective = undefinedArmEffectiveReceiver({ branch: inner, paramDefaultNode: defaultNode, ...ctx }) ?? inner;
    const effectiveCtx = effective === inner ? ctx : contextFor(effective, source);
    const pure = isViableBranchForKey({ branch: effective, key, ...effectiveCtx, adapter, resolvePure });
    if (!pure) return false;
    // An undefined argument must stay undefined. Register its effective default
    // at the parameter slot, where native reads its properties AFTER all arguments.
    // Moving a partial mirror into the argument would run retained getters early.
    const targetSource = effective === inner ? source : { ...effectiveCtx, node: effective };
    return register({ source: targetSource, pure, ...classifyCallBranchForSynth({ inner: effective, ...effectiveCtx, adapter }) });
  }
  return visit(branch, undefinedArmFallback);
}

// Injection-only view of a logical assignment: either retained value or installed RHS
// can supply the receiver. This synthetic view never drives a pure rewrite.
function peelUnionReceiver(node, staticIsMutated) {
  const peeled = peelFallbackReceiver(node, staticIsMutated);
  return peeled?.type === 'AssignmentExpression' && peeled.operator !== '=' && VALUE_FLOW_ASSIGN_OPS.has(peeled.operator)
    ? { ...peeled, type: 'LogicalExpression', operator: peeled.operator.slice(0, -1) } : peeled;
}

// recursive walk of a fallback-receiver expression collecting per-branch resolved metas.
// `cond1 ? (cond2 ? Array : Iterator) : Set` flattens to [Array, Iterator, Set] - inner
// conditional's both branches reach their own dispatch. each step peels chain-assign /
// paren / TS / safe-SE wrappers; non-fallback shapes resolve via `buildDestructuringInitMeta`.
// exported: the member / `in` producers enumerate a BRANCHING static receiver
// (`(c ? Array : Iterator).from`) through this same walker - the destructure form and the
// member form must agree on what a branch resolves to.
// Unresolved arms are normally omitted. Global destructure dispatch opts into them so a
// user receiver beside a constructor keeps its instance-method coverage.
export function flattenFallbackBranches(options) {
  const metas = withCanonQuestion(() => flattenFallbackLevel({
    ...options, followed: new Set(), defaultMetas: options.paramDefault ? new Set() : null,
  }));
  // the usage-global union reads its branches as a set: an arm and a write reaching an alias in another arm
  // name one static once (`a ??= Array` reads `a`, which that very write reaches; `let M = c ? Map : Set`
  // holds the arms its declared selection names)
  return options.adapter.method === 'usage-global' ? metas.filter((meta, at) => meta.placement !== 'static'
    || metas.findIndex(other => other.placement === 'static' && other.object === meta.object) === at) : metas;
}

// one level of that walk, every level under one question (`withCanonQuestion`): each asks what its own
// left decides, which a long chain's lower levels answer once. `followed` holds the branching values
// the walk has already flattened through an alias leaf
function flattenFallbackLevel({
  node,
  key,
  scope,
  adapter,
  path,
  followAliasLeaves = false,
  includeUnresolved = false,
  seen = new Set(),
  followed,
  paramDefault = null,
  defaultMetas = null,
}) {
  const peeled = adapter.method === 'usage-global'
    ? peelUnionReceiver(node, adapter.isMutatedStaticSlot ?? adapter.isMutatedStatic)
    : peelFallbackReceiver(node, adapter.isMutatedStaticSlot ?? adapter.isMutatedStatic);
  const branchSlots = getFallbackBranchSlots(peeled);
  if (branchSlots) {
    // fork-before-recurse: each sibling branch walks its own copy of the cycle guard, so a name
    // one branch consumed proving its leaf cannot block the SAME name in the next branch
    // (`c ? f() : f()` - the second `f` must still resolve). an operand the build never runs is no
    // branch at all (`decidedSelection`)
    const dead = decidedSelection(peeled, { scope, adapter, path });
    const liveSlots = dead?.skip ? branchSlots.filter(slot => slot !== dead.skip) : branchSlots;
    return liveSlots.flatMap(s => {
      const metas = flattenFallbackLevel({
        node: peeled[s],
        key,
        scope,
        adapter,
        path,
        followAliasLeaves,
        includeUnresolved,
        seen: new Set(seen),
        followed,
        paramDefault: fallbackBranchDefault(peeled, s, paramDefault),
        defaultMetas,
      });
      // An AND yields its left only where it is falsy. A static owner never is,
      // but a default constructor can be read AFTER that left delivered undefined.
      return s === 'left' && peeled.operator === '&&'
        ? metas.filter(meta => meta.placement !== 'static' || defaultMetas?.has(meta)) : metas;
    });
  }
  // leaf branch: paren/TS-wrapped + safe-SE Identifier / MemberExpression, resolve as a single
  // meta. buildDestructuringInitMeta handles the alias chain + proxy-global / static / global
  // classification; unresolved leaves are retained only when requested below.
  const inner = peelFallbackBranchInner(peeled);
  if (!inner) return [];
  if (paramDefault && undefinedArmEffectiveReceiver({ branch: inner, paramDefaultNode: paramDefault.node, scope, adapter, path })) {
    const metas = flattenFallbackLevel({
      ...paramDefault, key, adapter, followAliasLeaves, includeUnresolved, seen, followed,
    });
    for (const meta of metas) defaultMetas.add(meta);
    return metas;
  }
  const branchMeta = buildDestructuringInitMeta({ initNode: inner, key, scope, adapter, path });
  // a name leaf's binding, looked up once for both asks below: the writes reaching it and the alias it follows
  const binding = inner.type === 'Identifier' && (adapter.method === 'usage-global' || followAliasLeaves)
    ? adapter.getBinding({ scope, name: inner.name, path, read: inner }) ?? null : null;
  const written = aliasLeafWrittenMetas({ inner, binding, branchMeta, key, scope, adapter, path });
  if (branchMeta?.object) return [branchMeta, ...written];
  // alias-to-branching leaf (`const inner = c2 ? Array : Iterator` as a branch of an outer
  // fallback): no single object resolves, but the usage-global union must still reach the
  // aliased branches - follow the same safe indirection the receiver chokes use and flatten
  // the branching value. OPT-IN: the pure-serving viability consumer keeps the plain-leaf
  // contract (pure polyfills branch values in place - following the alias would double-handle).
  // `seen` threads through the whole flatten so mutually-aliased branches terminate
  if (followAliasLeaves) {
    const indirect = resolveIndirectBranchingReceiver({ node: inner, seen, ctx: { scope, adapter, path }, binding });
    // a value another arm already flattened adds no resolved branch its first walk did not - a cycle may
    // only cut it at another alias, whose unresolved arm the union reads for the key's instance cover
    // alone: the arms are a set, and aliases crossing over each other at every level reached it once per path
    if (indirect && followed.has(indirect.node)) return written;
    if (indirect) {
      followed.add(indirect.node);
      // ... an alias chain past the alias-chain ceiling flattening no further (`withinAliasWalkBudget`)
      return [...written, ...withinAliasWalkBudget(flattenFallbackLevel, {
        node: indirect.node, key, scope: indirect.ctx.scope, adapter, path, followAliasLeaves, includeUnresolved, seen, followed,
        paramDefault, defaultMetas,
      }) ?? []];
    }
  }
  if (!includeUnresolved || !branchMeta || isNullLiteralNode(inner)
    || receiverProvablyInstanceFree({ objectNode: inner, scope, adapter, path })) return written;
  // ... and an object literal installing no prototype of its own (`objectLiteralPrototypeValue`) is a
  // plain object: its arm owes what a plain object dispatches (`toString`), not the key's whole instance
  // family - the type the member and declaration spellings already read it by (`cond ? {} : Object`)
  const literal = unwrapRuntimeExpr(inner);
  return [...written, literal?.type === 'ObjectExpression'
    && !objectLiteralPrototypeValue(literal, !!adapter.getBinding?.({ scope, name: 'undefined', path, read: literal }))
    ? { ...branchMeta, object: 'object', placement: 'prototype' } : branchMeta];
}

// the usage-global union's view of a selection arm that is a reassigned alias: it holds every constructor
// that reaches it (`aliasWriteCtorNames`), not only the one value the name resolves to or the guard
// candidates pure keeps - the axis the bare alias receiver reads, as static metas beside the arm's own.
// an arm whose own meta is that guard already enumerated them: its name holds no one value for another
// reason - a for-of head taking one element per pass, an alias of one (`for (const M of [Map, Set])`)
function aliasLeafWrittenMetas({ inner, binding, branchMeta, key, scope, adapter, path }) {
  if (adapter.method !== 'usage-global' || inner.type !== 'Identifier' || !binding) return [];
  const written = branchMeta?.guardOnly ? branchMeta.guardedWriteObjects ?? []
    : isReassignedBeyondDeclarator(binding) ? aliasWriteCtorNames({ name: inner.name, scope, adapter, path, binding, read: inner }) : [];
  return written.filter(object => object !== branchMeta?.object && isStaticPlacement(object)).map(object => ({
    kind: 'property', object, key, placement: 'static', receiverHint: staticReceiverHint('static', object),
  }));
}

// follow SAFE indirection from a receiver expression to a BRANCHING value the canonical
// walker can flatten: a const-init alias chain (`const M = c ? Array : Iterator; M.from`)
// and an inline-eligible zero-arg callee return (`const f = () => c ? A : B; f().from`,
// `function pick() { return c ? A : B; }` - the shared callee inliner's shapes). the
// usage-global method-aware reassignment gate applies (a dominating reassignment bails,
// a reassigned alias stays with the reachable-union machinery); `seen` guards binding
// cycles. returns null for direct / non-branching / unsafe shapes - the caller keeps its
// path; on success the hop standing on the branching value, its `ctx` re-anchored at the scope
// the walk advanced to (its branches resolve where the alias was declared, not at the receiver
// use) and its `readNode` at the site that value was read.
// consumed by the usage-global chokes only: the pure flavor polyfills the branch
// values in place at the init / return site, so following the alias there would double-handle
function resolveIndirectBranchingReceiver({ node, seen = new Set(), ctx, binding: nodeBinding }) {
  const { adapter, path } = ctx;
  let { scope } = ctx;
  let cur = unwrapTransparentSeq(node);
  // where the CURRENT hop is read: the receiver use for the first alias, then each prior hop's
  // declarator init (`const captured = src` reads `src` there) - a write AFTER that read site
  // cannot change the captured value, so the dominance check anchors per hop (mirrors
  // `reachableAliasValues`' anchoring; checking every hop against the FINAL use dropped the
  // captured branching value of a source reassigned after capture)
  let readSite = node;
  while (cur) {
    if (cur.type === 'Identifier') {
      const { name } = cur;
      if (seen.has(name) || !adapter.hasBinding({ scope, name, path, read: cur })) return null;
      seen.add(name);
      // ... the caller may already hold the first name's binding (`nodeBinding`)
      const binding = cur === node && nodeBinding !== undefined ? nodeBinding : adapter.getBinding({ scope, name, path, read: cur });
      if (!binding || reassignmentBlocksGlobalResolve({ binding, adapter, path, usageNode: readSite })) return null;
      if (bindingNodeType(binding) !== 'VariableDeclarator' || !binding.node?.init) return null;
      readSite = binding.node.init;
      cur = unwrapTransparentSeq(installedWriteValue(binding.node.init));
      // advance to the followed binding's own scope, like the sibling const-alias walkers - a
      // later hop reading a name declared in an OUTER scope must resolve it there, not against
      // the receiver-use scope (an inner shadow of that name would swallow the branching value)
      scope = aliasDeclScope(binding, scope);
    } else if (realmYieldingCallView(cur, { scope, adapter, path })) {
      const call = realmYieldingCallView(cur, { scope, adapter, path });
      const ret = inlineCallReturnExpression({ node: call, seen, ctx: { scope, adapter, path } });
      if (!ret) return null;
      cur = unwrapTransparentSeq(ret.node);
      // the inlined body lives at the callee's declaration site - later hops resolve there
      scope = ret.ctx.scope;
      seen = ret.seen;
    } else return null;
    if (getFallbackBranchSlots(peelUnionReceiver(
      cur,
      adapter.isMutatedStaticSlot ?? adapter.isMutatedStatic,
    ))) return { node: cur, readNode: readSite, seen, ctx: { ...ctx, scope } };
  }
  return null;
}

// a for-x HEAD holds no receiver slot at all: what the pattern reads is an ELEMENT of the iterated
// literal, and a literal with several elements is a BRANCH SET - one value per pass. the union
// consumer wants every one of them, which is exactly what a receiver NAME cannot say and why the
// head's own receiver canon declines a literal whose elements disagree.
// the claim may sit under HOP KEYS (`{ Array: { from } }`), so the climb collects them on the way up
// and each element resolves THROUGH them - the flat shape is this walk with an empty key path
function forOfHeadBranchMetas({ path, key, scope, adapter }) {
  if (typeof key !== 'string') return null;
  const hopKeys = [];
  let cur = path.parentPath;
  for (let depth = 0; depth < STATIC_WALK_DEPTH && cur?.node; depth++) {
    const owner = cur.parentPath;
    const ownerType = owner?.node?.type;
    if (ownerType === 'Property' || ownerType === 'ObjectProperty') {
      // a DEFAULTED hop reads its own value where the slot is absent - not a hop this enumeration
      // may follow; a key that spells no static slot names none the walk could follow either
      if (owner.parentPath?.node?.type === 'AssignmentPattern') return null;
      const hopKey = consumableHopSlotName(owner.node, adapter ? { scope: owner.scope ?? path.scope, adapter, path: owner } : null);
      if (typeof hopKey !== 'string') return null;
      hopKeys.unshift(hopKey);
      cur = owner.parentPath;
      continue;
    }
    // the head owner in either spelling: the declarator, or the loop itself where the head declares
    // nothing - the branch set the pattern reads per pass is the literal's, not the declaration's
    if (ownerType !== 'VariableDeclarator'
      && !(isForXStatement(owner?.node) && owner.node.left === cur.node)) return null;
    const elements = forOfHeadIterableElements(owner);
    if (!elements) return null;
    const metas = [];
    for (const element of elements) {
      if (!hopKeys.length) {
        metas.push(...flattenFallbackBranches({
          node: element, key, scope, adapter, path, followAliasLeaves: true,
          includeUnresolved: adapter.method === 'usage-global',
        }));
        continue;
      }
      const object = walkStaticReceiverChain({ receiverNode: element, walkPath: hopKeys, scope, adapter, path });
      if (object) {
        metas.push({
          kind: 'property', object, key, placement: 'static', receiverHint: staticReceiverHint('static', object),
        });
      }
    }
    return metas.length ? metas : null;
  }
  return null;
}

// the metas a destructure leaf's BRANCHING init hands the per-branch mirror, one per reachable branch:
// a leaf whose meta came from a fallback init (a logical / ternary receiver) or - opted in through
// `followIndirection` - an unresolved property meta whose receiver may alias such a value. walks the
// leaf's pattern chain to the host slot, descends the wrappers the pattern is written under, and
// resolves every branch's value through the hop keys to a static meta; null where the init is not
// that shape, the leaf is no destructure leaf, or a branch names nothing the mirror could bind.
// usage-global loads every branch's modules off the same list (`cond ? Array : Iterator` with `{ from }`
// loads both `es.array.from` and `es.iterator.from`)
export function enumerateFallbackDestructureBranches(meta, path, adapter, { resolvePure = null, followIndirection = false } = {}) {
  if (!path) return null;
  // beyond fromFallback (a DIRECT branching init), the opt-in `followIndirection` admits an
  // unresolved property meta whose receiver may alias a branching value - resolved below
  if (!meta?.fromFallback && !(followIndirection && meta?.kind === 'property' && meta.object === null)) return null;
  const objectPattern = path.parentPath?.node;
  // this walk answers for a DESTRUCTURE leaf, whose receiver stands in the HOST slot two parents
  // up. the indirection backstop hands it every typeless property meta, a MEMBER read included,
  // and there that slot holds the whole init the member merely sits in - resolving it as the
  // receiver injected the statics of a value the member never read (`out = pick(input.from)`)
  if (objectPattern?.type !== 'ObjectPattern') return null;
  // ObjectPattern's parent can be:
  //   - direct host (VariableDeclarator / AssignmentExpression) - read slot
  //   - AssignmentPattern default-wrapper - read 'right' (default) UNLESS the AP is itself
  //     an IIFE param, in which case the call-arg supersedes the default
  //   - function-like (IIFE-param without default) - lift the call-arg via `findIifeCallSite`
  // shared `resolveFallbackReceiver` handles AssignmentPattern + IIFE-param uniformly so
  // both wrapper-default and IIFE call-arg can drive per-branch synth-swap
  const wrapperPath = path.parentPath?.parentPath;
  const wrapperNode = wrapperPath?.node;
  let receiverNode = null;
  // a call-site-sourced receiver (IIFE arg) evaluates AT THE CALL SITE - when the arg wins,
  // the branch flatten below resolves it against the call-site scope/path, not the invoked
  // function's inner scope (a param shadowing the arg's name would swallow the branches)
  let receiverScope = null;
  let receiverPath = null;
  let paramDefault = null;
  if (wrapperNode?.type === 'AssignmentPattern' && wrapperPath.parentPath?.node
      && FN_NODE_TYPES.has(wrapperPath.parentPath.node.type)) {
    // AssignmentPattern is an IIFE param wrapper - prefer the call-arg over the default when it is a
    // usable fallback receiver (a classifiable single receiver OR a conditional / logical enumerated
    // per-branch); a non-receiver arg (notably `undefined`, which makes the runtime apply the default)
    // keeps the default. shared `isUsableFallbackReceiverArg` matches each plugin's usage-pure detect
    const desc = resolveFallbackReceiver(wrapperPath.parentPath, wrapperNode, adapter?.isMutatedStaticSlot ?? adapter?.isMutatedStatic);
    receiverNode = chooseFallbackReceiverNode({
      argNode: desc?.rhsNode, defaultNode: wrapperNode.right, objectPattern, scope: path.scope, adapter, path, resolvePure,
      argScope: desc?.callPath?.scope ?? path.scope, argPath: desc?.callPath ?? path,
    });
    if (desc?.callPath && receiverNode === desc.rhsNode) {
      receiverScope = desc.callPath.scope;
      receiverPath = desc.callPath;
      paramDefault = { node: wrapperNode.right, scope: wrapperPath.scope, path: wrapperPath };
    }
  } else if (wrapperNode && objectPattern) {
    // The same receiver canon handles wrapper defaults, loop elements and IIFE arguments.
    const desc = resolveFallbackReceiver(wrapperPath, objectPattern, adapter?.isMutatedStaticSlot ?? adapter?.isMutatedStatic);
    receiverNode = desc?.rhsNode ?? null;
    if (desc?.callPath && receiverNode) {
      receiverScope = desc.callPath.scope;
      receiverPath = desc.callPath;
    }
  }
  if (!receiverNode) return forOfHeadBranchMetas({ path, key: meta.key, scope: path.scope, adapter });
  let branching = receiverNode;
  let branchingScope = receiverScope ?? path.scope;
  if (!meta.fromFallback) {
    // resolve the indirection against the SAME scope/path the flatten below uses - a winning
    // IIFE call-arg evaluates at the call site, so a param shadowing the arg name must not
    // resolve it in the invoked function's inner scope. the resolved branching value then
    // re-anchors the flatten at the scope the alias walk advanced to
    const indirect = resolveIndirectBranchingReceiver({
      node: receiverNode, ctx: { scope: branchingScope, adapter, path: receiverPath ?? path },
    });
    if (!indirect) return null;
    branching = indirect.node;
    branchingScope = indirect.ctx.scope;
  }
  const out = flattenFallbackBranches({
    node: branching,
    key: meta.key,
    scope: branchingScope,
    adapter,
    path: receiverPath ?? path,
    followAliasLeaves: true,
    includeUnresolved: adapter.method === 'usage-global',
    paramDefault,
  });
  return out.length ? out : null;
}

// TRUE only when the receiver alias's reaching values are exhaustively enumerable and none can
// dispatch an instance method: every reachable write RHS (plus the declarator init) either
// resolves to a STATIC-placement name or is an instance-inert value - null / undefined only
// (member access and `in` both THROW natively, no polyfill changes that). primitive literals are
// NOT inert - member access auto-boxes (`42..toFixed` dispatches es.number.to-fixed) - and neither
// is a plain object literal: dropping its rows would UNDER-inject in usage-global, the unsafe
// direction. any other value shape (unbound name, call, object / array / string / regexp literal,
// undecomposable write) keeps the typeless
// instance dispatch: inject-if-might stays, but grounded in reachability - `let O = null;
// O ||= Object; 'entries' in O` must not fabricate es.array.entries / web.dom-collections.*
function receiverProvablyInstanceFree({ objectNode, scope, adapter, path }) {
  const alias = objectNode && unwrapTransparentSeq(objectNode);
  if (alias?.type !== 'Identifier') return false;
  const binding = adapter.getBinding({ scope, name: alias.name, path, read: alias });
  // only a declarator that binds the identifier DIRECTLY enumerates: params / for-x / catch
  // values are open sets, and a PATTERN-bound leaf's value is a property extraction from the
  // init (`const { name } = { name: 'alice' }` binds the string, not the object literal)
  const declarator = binding?.node ?? binding?.path?.node;
  if (!binding || declarator?.type !== 'VariableDeclarator' || declarator.id?.type !== 'Identifier'
    || declarator.id.name !== alias.name) return false;
  const { nodes, complete } = reassignmentValueEnumeration({
    binding, usagePath: path, name: alias.name,
    // the same ctx the sibling enumerations pass: without `resolveKey` an ALIASED computed-key
    // write (`const KK = "x"; ({ [KK]: O } = { x: Object })`) does not decompose, the enumeration
    // reports incomplete, and the receiver stops being provably instance-free - over-inject
    ctx: { scope, adapter, path, resolveKey: sharedResolveKey },
    usageNode: alias,
  });
  if (!complete) return false;
  const values = declarator.init ? [declarator.init, ...nodes] : nodes;
  // an EMPTY enumeration proves nothing: an init-less binding's value comes from elsewhere
  // (TS ambient `declare const`, hoisting, cross-file merging) - stay conservative
  if (!values.length) return false;
  return values.every(valueNode => {
    const value = unwrapTransparentSeq(valueNode);
    if (!value) return false;
    if (isNullLiteralNode(value)) return true;
    // `undefined` is shadowable, so the bare shape ALONE is not proof of nullishness - a shadowed
    // local is an ordinary value that may well dispatch. unlike the sibling nullish canons, whose
    // value node sits at the scope they gate on, the enumerated WRITES here come from anywhere in
    // the binding's subtree: a write in a sibling block that shadows `undefined` reads as the global
    // one from the usage's scope chain, and proving the receiver instance-free off that drops a live
    // instance row. only the INIT arm shares the usage's chain, so only it can be gated
    if (isBareUndefinedIdentifier(value)) {
      return valueNode === declarator.init && !adapter.getBinding({ scope, name: 'undefined', path });
    }
    const objectName = resolveObjectName({ objectNode: value, scope, adapter, path });
    return !!(objectName && isStaticPlacement(objectName));
  });
}

// TRUE when a receiver alias whose declarator RESOLVED can still hold an instance at the use: it is
// a local binding whose declared value set is OPEN - reassigned beyond its declarator, or bound
// through a pattern slot that is not one certain value (paired past a spread the pairing cannot
// enumerate, or holding a branching value; either resolved the primary as a maybe at best) - and
// its reachable value set is not provably instance-free. gated so a plain global static receiver
// (`Array.from()`, no binding) and a never-reassigned, exactly paired alias never grow a typeless row
function resolvedAliasMayDispatchInstance({ objectNode, scope, adapter, path }) {
  const alias = objectNode && unwrapTransparentSeq(objectNode);
  if (alias?.type !== 'Identifier') return false;
  const binding = adapter.getBinding({ scope, name: alias.name, path, read: alias });
  if (!binding) return false;
  if (!patternBoundSlotOpen({ binding, name: alias.name, scope, adapter, path })
    && !isReassignedBeyondDeclarator(binding)) return false;
  return !receiverProvablyInstanceFree({ objectNode, scope, adapter, path });
}

// REPOSITIONED-container candidates for the union axis: once an in-place mutator ran on a container
// binding (the census wildcard - queried as the canonical `*` slot), the read slot may hold ANY of
// the literal's values - repositioning permutes positions, never values - so every element that
// resolves to a constructor is a reachable receiver. usage-global injects for each (over-inject
// canon); pure is untouched - its walk bails on the same wildcard, keeping the read native. this is
// why no position analysis is needed here, unlike the slot-WRITE half (see the TASKS record)
function containerRepositionCandidates({ objectNode, scope, adapter, path, resolve }) {
  const member = unwrapRuntimeExpr(objectNode);
  // the receiver may be the wildcard-marked container ITSELF (a destructure host reads `b` directly)
  // or a member off it (`b[0].of`) - both dispatch on values the literal's elements supply
  const owner = member?.type === 'MemberExpression' || member?.type === 'OptionalMemberExpression'
    ? unwrapRuntimeExpr(member.object) : member;
  if (owner?.type !== 'Identifier') return [];
  // asked of the binding's own DECLARATION: a name-only question unions every declaration of the
  // name in the file, which is both the wider answer and a walk over all of them per read
  const binding = adapter.getBinding({ scope, name: owner.name, path, read: owner });
  const declaratorNode = binding?.path?.node ?? binding?.node ?? null;
  if (!adapter.isWrittenContainerSlot?.(owner.name, ['*'], declaratorNode)) return [];
  const init = unwrapTransparentSeq(installedWriteValue(declaratorNode?.init ?? null));
  if (init?.type !== 'ArrayExpression') return [];
  const names = [];
  for (const element of init.elements) {
    const name = element ? resolve(element) : null;
    if (name && !names.includes(name)) names.push(name);
  }
  return names;
}

// usage-global UNION of reachable receivers (alias writes, branches and container slots) crossed
// with reachable keys: `let K = "from"; if (c) K = "of"; Array[K]()` needs both statics. Extra
// property metas exclude the primary pair; impossible pairs resolve to no polyfill. Each hop
// resolves where its value was spelled (`ctx.scope`) and anchors dominance at its `readNode`.
// Pure bails on reassignment upstream, so this union never drives a receiver-dropping rewrite.
export function collectMemberUnionCandidates(options) {
  const {
    computedKeyNode,
    primaryObject,
    primaryKey,
    placement: placementOverride = null,
    receiverInstanceFree = false,
    scope,
    adapter,
    path,
  } = options;
  if (adapter.method !== 'usage-global') return [];
  // what the visitors skip as never running reaches no candidate either: the census of a whole
  // selection names its dead operand's constructors (`make() || Set`)
  const objectNode = decidedSelectionValue(options.objectNode, { scope, adapter, path });
  const parameterBinding = objectNode?.type === 'Identifier' ? adapter.getBinding({
    scope,
    name: objectNode.name,
    path,
    read: objectNode,
  }) : null;
  const parameterNode = parameterBinding?.path?.node ?? parameterBinding?.node;
  const parameterSource = PARAMETER_STATIC_SOURCES.get(parameterNode);
  // A closed proof that every caller supplies a fresh container excludes constructor
  // candidates; a failed or incomplete source proof does not.
  const parameterNonStatic = adapter.parameterStaticSources?.get(parameterNode)?.nonStatic;
  const objects = reachableAliasValues({
    aliasNode: objectNode,
    // the operand a decided selection always yields seeds the union where the caller has no primary of its
    // own: the census of the whole selection named it, and a host with no primary meta (a catch parameter's
    // inner default, a for-in head) reads it through no other channel
    primary: primaryObject ?? (objectNode === options.objectNode ? null : resolveObjectName({ objectNode, scope, adapter, path })),
    scope,
    adapter,
    path,
    // the hop's `readNode` anchors the reassignment-dominance check: an alias hop resolves a source
    // binding's DECLARED value from the alias-read site, so a dead init (unconditionally overwritten
    // before the read) is correctly excluded while a live conditional init survives. its `ctx.scope`
    // re-anchors a write RHS / hop init at the scope it was spelled in (a use-site shadow must not
    // capture it)
    resolve: ({ node, readNode, ctx }) => resolveObjectName({
      objectNode: node, scope: ctx.scope, adapter: ctx.adapter, path: ctx.path ?? path, usageNode: readNode,
    }) ?? (node?.type === 'MemberExpression' || node?.type === 'OptionalMemberExpression'
      ? staticContainerReceiverName({ node, scope: ctx.scope, adapter: ctx.adapter, path: ctx.path ?? path }) : null),
  });
  // Local calls, parameters and opaque iterations can retain constructor candidates without
  // proving a receiver identity. They owe this read's key, not the constructor's whole family.
  if (!parameterNonStatic && (computedKeyNode || primaryKey === null || hasStaticDefinitionKey(primaryKey))) {
    for (const name of CENSUS_STATIC_RECEIVERS.get(rootProgramOf(path))?.(objectNode, true) ?? []) {
      if (!objects.includes(name)) objects.push(name);
    }
  }
  // an UNRESOLVED receiver (a local instance, an unclassifiable expression) still dispatches every
  // reachable KEY at runtime, so it enumerates as the typeless receiver itself - each union key then
  // earns the same typeless prototype-placement meta the primary key gets (`let k = 'at'; if (c)
  // k = 'flat'; arr[k]` reaches both es.array.at and es.array.flat). without the null entry the
  // cross product is empty and the reachable alternative silently drops (under-injection). the
  // resolved values, when the receiver alias ALSO varies, keep their own static extras beside it.
  // EXCEPT a provably instance-free receiver (the caller computed the flag): its static rows
  // carry the whole injection and the null rows would fabricate instance variants
  // a RESOLVED primary describes the declarator value only - a reassignment can install something
  // else at the use (`let M = Array; if (c) M = makeArr(); M.at()`). when such an alias is not
  // provably instance-free, an unresolvable reachable value may be an instance, and the static-only
  // axis carries nothing for it (`M.at` is no Array static, so the primary meta resolves to no
  // module at all), so the typeless row rides beside the static primary there too - over-inject-safe,
  // and inert for a non-reassigned alias or one whose reachable values are all instance-free
  const typelessRowReachable = primaryObject === null
    ? !receiverInstanceFree
    : resolvedAliasMayDispatchInstance({ objectNode, scope, adapter, path });
  if (typelessRowReachable) objects.unshift(null);
  // a receiver alias whose ctor narrow was REFUSED (guarded registration: conditional
  // placement, SE-carrying init, var redecl, cross-function write) still holds the hinted
  // ctor whenever the refused write actually ran. the alias walk resolves such a binding to
  // nothing, and a STATIC-only key then drops entirely (`M.groupBy` losing es.map.group-by -
  // the typeless instance axis cannot carry it). contribute the hint as an injection-only
  // static candidate: over-inject-safe when the write never ran, and the pure emitters keep
  // their own runtime ctor guard untouched
  if (primaryObject === null && objectNode) {
    let aliasIdent = unwrapTransparentSeq(objectNode);
    if (aliasIdent?.type === 'SequenceExpression') aliasIdent = unwrapTransparentSeq(aliasIdent.expressions.at(-1));
    if (aliasIdent?.type === 'Identifier') {
      // EVERY ctor the slot was written with, not just the one the registration kept: the key may
      // live on an earlier write's ctor (`if (c) M = Map; if (!c) M = Promise` - `groupBy` is Map's),
      // and in usage-global the axis IS the injection - a candidate that never matches at runtime
      // only costs a module the file already loads for its own constructor
      const guardedBinding = adapter.getBinding({ scope, name: aliasIdent.name, path, read: aliasIdent });
      if (guardedBinding?.guardedAliasHint || guardedBinding?.guardedAliasHints?.length) {
        for (const hint of aliasWriteCtorNames({
          name: aliasIdent.name, scope, adapter, path, binding: guardedBinding, read: aliasIdent,
        })) {
          if (!objects.includes(hint)) objects.push(hint);
        }
      }
    }
  }
  for (const candidate of containerRepositionCandidates({
    objectNode, scope, adapter, path,
    resolve: rhs => resolveObjectName({ objectNode: rhs, scope, adapter, path }),
  })) if (!objects.includes(candidate)) objects.push(candidate);
  // pre-resolved receiver names the container-slot walk collected beside its primary descent
  // (written slot values, repositioned elements) - the chain shapes the flat reposition helper
  // above cannot see. already names, so they join the axis directly
  for (const candidate of options.containerWalkObjects ?? []) {
    if (!objects.includes(candidate)) objects.push(candidate);
  }
  // a BRANCHING receiver value - direct or reached through safe indirection - contributes each
  // branch's resolved object to the union axis, so reachable KEYS cross with reachable branch
  // OBJECTS (`const M = c ? Array : Iterator; let k = 'from'; if (c2) k = 'of'; M[k]` reaches
  // all four pairs; the primary-key-only branch extras cannot see the alternative keys).
  // branch-sourced objects pair at STATIC placements only - the branch-extras canon: instance
  // keys stay with the typeless primary, which respects the type-engine's dead-branch folds
  // (a truthy-folded `??` fallback or an isArray-narrowed alternative must not inject)
  const branchObjects = new Set();
  // only when NO primary resolved: a resolved primary means an upstream gate already decided
  // the receiver - a type-engine fold (`definedGlobal ?? Array` folds to its left) or a
  // caller-arg supersede (a real IIFE arg wins over the branching default) - and structurally
  // re-enumerating the raw node would resurrect the dead branch it excluded
  if (objectNode && primaryObject === null) {
    const branching = getFallbackBranchSlots(peelUnionReceiver(objectNode, adapter.isMutatedStaticSlot ?? adapter.isMutatedStatic))
      ? { node: objectNode, ctx: { scope, adapter, path } }
      : resolveIndirectBranchingReceiver({ node: objectNode, ctx: { scope, adapter, path } });
    if (branching) {
      for (const branch of flattenFallbackBranches({
        node: branching.node, key: primaryKey, scope: branching.ctx.scope, adapter, path, followAliasLeaves: true,
      })) {
        if (branch.placement === 'static' && !objects.includes(branch.object)) {
          objects.push(branch.object);
          branchObjects.add(branch.object);
        }
      }
    }
    // ... and a member chain ROOTED at a selection, direct or through a const alias, distributes over
    // its arms (`(c ? realm() : opaque()).Array.of` reaches `es.array.of` through the realm arm): the
    // names the arms reach join the axis at static placement, the opaque arm being the typeless row's
    for (const name of navigatedSelectionObjects(objectNode, { scope, adapter, path })) {
      if (isStaticPlacement(name) && !objects.includes(name)) {
        objects.push(name);
        branchObjects.add(name);
      }
    }
  }
  const keys = reachableAliasValues({
    aliasNode: computedKeyNode, primary: primaryKey, scope, adapter, path,
    // `usageNode` anchors the reassignment-dominance check on THIS axis too: without it a key
    // alias resolves its source binding from the binding's own site, so a write that lands AFTER
    // the key was captured (`if (c) k = base; base = "includes"`) both hides the reachable key
    // and offers one that never reaches - the object axis has threaded it all along
    resolve: ({ node, readNode, ctx }) => sharedResolveKey({
      node, computed: true, scope: ctx.scope, adapter: ctx.adapter, path: ctx.path ?? path, usageNode: readNode,
    }),
  });
  // a BRANCHING computed key feeds the key axis the way a branching receiver feeds the object
  // axis: `arr[cond ? "flat" : "at"]()` reaches both arm keys at runtime, and so does a name
  // declared with such a selection (`branchingKeySource`). with no dominating
  // key the primary is null and the alias walk yields nothing - each literal-resolvable arm
  // joins the axis instead. gated on the null primary for the same reason as the receiver
  // branch block above: a resolved primary means an upstream fold already excluded the arms
  if (computedKeyNode && primaryKey === null) {
    for (const armKey of branchKeyArms({ computedKeyNode, scope, adapter, path })) {
      if (!keys.includes(armKey)) keys.push(armKey);
    }
    // ... and a key neither walk names - a name bound to a selection of literals (`const k = c ? "a" :
    // "b"`), a literal read in place - is every name the census folds it to
    if (!keys.length) keys.push(...CENSUS_KEY_NAMES.get(rootProgramOf(path))?.(computedKeyNode) ?? []);
  }
  const extras = [];
  for (const object of objects) for (const key of keys) {
    if ((object === primaryObject && key === primaryKey) || key === 'prototype') continue;
    // `placementOverride`: a prototype-navigated producer (`C.prototype[k]`) dispatches EVERY
    // reachable pair as a prototype method of the alternative ctor - the receiver value itself
    // is the ctor, not a static host. other producers derive placement from the value
    const placement = placementOverride ?? (object !== null && isStaticPlacement(object) ? 'static' : 'prototype');
    if (branchObjects.has(object) && placement !== 'static') continue;
    // mirror the primary meta's receiver-type gate so a union key that is an instance method on
    // the constructor (`Array[K]` with K reaching 'concat') bails instead of over-injecting
    const extra = { kind: 'property', object, key, placement, receiverHint: staticReceiverHint(placement, object) };
    if (parameterSource?.keys && placement === 'static') extra.parameterStaticCandidate = true;
    extras.push(extra);
  }
  return extras;
}

// the ARMS a value SELECTS between, innermost-flat, as nodes: a conditional's two, a `||` / `??`'s
// two, an `&&`'s right alone (its left is handed on only where falsy, which a receiver never is).
// null where the value selects nothing
function selectingArmNodes(node, union = false) {
  const peel = union ? peelUnionReceiver : peelFallbackReceiver;
  if (!getFallbackBranchSlots(peel(node))) return null;
  const arms = [];
  const work = [node];
  while (work.length) {
    const selection = peel(work.pop());
    const slots = getFallbackBranchSlots(selection);
    if (!slots) {
      arms.unshift(selection);
      continue;
    }
    const taken = selection.type === 'LogicalExpression' && selection.operator === '&&' ? ['right'] : slots;
    // pushed in reverse so the arms come out in source order
    for (let index = taken.length - 1; index >= 0; index--) work.push(selection[taken[index]]);
  }
  return arms;
}

// a member chain ROOTED at a selection (`(c ? realm() : opaque()).Array`), read directly or through
// a const alias of it (`const h = (c ? realm() : opaque()).Array; h.of`): the chain distributes over
// the arms - each arm's own spelling of it resolves like the direct one (`realm().Array` names Array
// through the census, `opaque().Array` nothing) - so the names the arms reach are the names the read
// reaches. the arms are handed back with the keys the chain read through, or null for any other shape
export function navigatedSelectionArms(node, ctx) {
  const chain = navigatedChainKeys(node, ctx);
  const arms = chain && selectingArmNodes(chain.root, ctx.adapter?.method === 'usage-global');
  return arms ? { arms, keys: chain.keys } : null;
}

// a member chain read DIRECTLY or through a const alias of it (`const h = realm.Array; h.of`): the
// chain's root (a sequence's tail) and the keys it read through. a const alias hands the walk its
// init, read where the alias was declared; a name written again before the read, or bound to
// anything but a declarator, holds no one such chain. null where the read navigates nothing
export function navigatedChainKeys(node, { scope, adapter, path }) {
  const seen = new Set();
  let cur = node;
  let readSite = node;
  for (;;) {
    cur = unwrapTransparentSeq(cur);
    if (cur?.type === 'SequenceExpression') cur = unwrapTransparentSeq(cur.expressions.at(-1));
    if (cur?.type !== 'Identifier') break;
    if (seen.has(cur.name) || !adapter.hasBinding({ scope, name: cur.name, path, read: cur })) return null;
    seen.add(cur.name);
    const binding = adapter.getBinding({ scope, name: cur.name, path, read: cur });
    if (!binding || reassignmentBlocksGlobalResolve({ binding, adapter, path, usageNode: readSite })) return null;
    if (bindingNodeType(binding) !== 'VariableDeclarator' || !binding.node?.init) return null;
    scope = binding.scope ?? scope;
    readSite = binding.node.init;
    cur = readSite;
  }
  const { root, keys } = memberChainKeys(cur, staticMemberKeyName);
  if (!keys.length || keys.includes(null)) return null;
  return { root: peelReceiverSequenceTail(root), keys };
}

// ... and the OBJECTS such a chain reaches: each arm re-spelled with the keys and resolved as the
// direct chain would be, the arms that name nothing dropped
function navigatedSelectionObjects(node, ctx) {
  const navigated = navigatedSelectionArms(node, ctx);
  if (!navigated) return [];
  const names = [];
  for (const arm of navigated.arms) {
    const name = resolveObjectName({ objectNode: navigated.keys.reduce(memberFromKeyName, arm), ...ctx, usageNode: node });
    if (name && !names.includes(name)) names.push(name);
  }
  return names;
}

// the EFFECTS a lifted init keeps once its value is discarded: a nav INTO the built-in namespace off
// a call the census resolves to a pristine realm (`realm().Map`) reads nothing observable past the
// call - a realm's constructor slots are data properties - so what the lift owes is the discard
// harvest alone (the shared canon: the chain-root call where it bears effects, every computed-key
// effect, a chain assignment), in source order; a provably pure call with plain keys lifts nothing,
// the other leg's answer. spelled whole, the member fold printed the dead value as a bare ponyfill
// read (`realm(), _Map;`) and imported it for nothing. a sequence PREFIX - the init's own
// (`(eff(), realm().Map)`) or the nav root's (`(eff(), realm()).Map`) - is harvested like any other
// effect; the realm question is asked of what it leads to. ... and so does a `||` / `??` its left always
// decides: the right is dead, and the lift owes what the discard harvest owes (`f() || Set` lifts
// `f()`). null for every other shape, which the caller spells as it did; otherwise `{ effects }`,
// empty where nothing is owed
export function liftedRealmNavEffect(node, { scope, adapter, path }) {
  const { prefix, tail } = peelNestedSequenceExpressions(unwrapTransparentSeq(node));
  if (decidingFallbackLeft(tail, { scope, adapter, path })) {
    return { effects: discardRescueNodesWithReads({ node, scope, adapter, path }) };
  }
  const peeled = unwrapTransparentSeq(tail);
  // a BARE call the inline canon proves to yield a proxy global, running no effect on the way, owes
  // nothing either: the discard drops it with the value nothing reads any more
  if (provenRealmCall(peeled, { scope, adapter, path })) {
    return { effects: prefix.flatMap(expression => discardRescueNodes({ node: expression, scope, adapter, path })) };
  }
  const { root, keys } = memberChainKeys(peeled, staticMemberKeyName);
  const call = peelSequenceTail(unwrapTransparentSeq(root), { step: unwrapTransparentSeq });
  if (!keys.length || keys.includes(null) || !isCallShape(call)) return null;
  if (keys.some(key => key !== 'prototype' && !POSSIBLE_GLOBAL_OBJECTS.has(key) && !CAPITALISED_IDENT.test(key))) return null;
  const realm = resolveObjectName({ objectNode: call, scope, adapter, path, usageNode: call });
  if (!isPristineProxyGlobal(adapter, realm)) return null;
  return { effects: discardRescueNodes({ node, scope, adapter, path }) };
}

// the single ATTACH point of the usage-global reachable union: every member / `in` / destructure
// producer that can carry alternatives routes through here, so a producer branch that skips the
// choke is the bug, not a design split. an axis the producer cannot supply is passed null and the
// union enumerates the remaining axis; empty extras leave the meta untouched
export function attachMemberUnionExtras(meta, options) {
  // the instance-free verdict is computed HERE (the one place holding the meta) and threaded
  // down: the union drops its typeless null rows, and the flag on the meta turns the
  // resolver's placement-agnostic instance fallback off for the primary dispatch. gated to
  // usage-global - the enumeration is a union-only concept and pure metas must stay untouched
  // never under a `.prototype`-navigated producer (placement override): its static-resolving
  // alias values ARE instance-method hosts - the axis exists to dispatch them as prototypes
  const receiverInstanceFree = options.adapter?.method === 'usage-global' && options.primaryObject === null
    && options.placement === undefined && receiverProvablyInstanceFree(options);
  if (receiverInstanceFree) meta.receiverInstanceFree = true;
  const extras = collectMemberUnionCandidates({ ...options, receiverInstanceFree });
  if (extras.length) meta.extraCandidates = extras;
  return meta;
}

// may a computed key that resolves to NO single name still ride a null-key carrier into the union?
// usage-global only, for the key shapes whose written names are enumerable without a primary: a
// BRANCHING key (`[cond ? "flat" : "at"]`, or a name bound to one - `const k = c && "at"` - each arm is
// reachable), a REASSIGNED alias with no dominating value (a pattern slot default, `[k = "from"] = []`,
// is default-or-runtime) and any key the census folds to several names (`const k = c ? "a" : "b"`).
// the member producer and the destructure producer ask this ONE question - the carrier is dropped
// again when the enumeration yields nothing
export function unionKeyedCarrierRides({ computedKeyNode, scope, adapter, path }) {
  if (adapter.method !== 'usage-global') return false;
  if (branchingKeySource({ computedKeyNode, scope, adapter, path })) return true;
  const keyCore = unwrapRuntimeExpr(computedKeyNode);
  if (keyCore?.type === 'Identifier'
    && isReassignedBeyondDeclarator(adapter.getBinding({ scope, name: keyCore.name, path }) ?? {})) return true;
  return (CENSUS_KEY_NAMES.get(rootProgramOf(path))?.(computedKeyNode)?.length ?? 0) > 1;
}

// the selection whose arms a computed key may take, with the scope its arms resolve in: the key itself
// where it branches, or the selection a never-reassigned name is declared with - the union enumerates
// each arm it can read, where the census declines a selection with one arm it cannot. null otherwise
function branchingKeySource({ computedKeyNode, scope, adapter, path }) {
  const keyCore = unwrapRuntimeExpr(computedKeyNode);
  if (getFallbackBranchSlots(keyCore)) return { node: keyCore, scope };
  const binding = keyCore?.type === 'Identifier' ? adapter.getBinding({ scope, name: keyCore.name, path }) : null;
  const init = binding && !isReassignedBeyondDeclarator(binding) ? unwrapRuntimeExpr(identifierDeclaratorInit(binding)) : null;
  return getFallbackBranchSlots(init) ? { node: init, scope: aliasDeclScope(binding, scope) } : null;
}

// ... each arm key of it a fold names - the key's own fold where it does not branch - past the arms a
// selection the build decides never takes
function branchKeyArms({ computedKeyNode, scope, adapter, path }) {
  const source = branchingKeySource({ computedKeyNode, scope, adapter, path }) ?? { node: computedKeyNode, scope };
  const ctx = { scope: source.scope, adapter, path };
  return flattenBranchKeys(source.node, node => sharedResolveKey({ node, computed: true, ...ctx }), {
    liveOperand: node => decidedLiveOperand(node, ctx),
  });
}

// destructure twin of the member union: `const { [k]: v } = recv` reads the same reachable
// receiver x key targets a member access does, so each earns its side-effect import too. `path`
// is the ObjectProperty the funnels anchor at - the receiver alias comes from the declarator /
// assignment / param-default host when one exists (the remaining hosts - for-x, catch, nested
// patterns, array elements - bind from a per-element value, not a reassignable receiver alias,
// and enumerate keys only); a per-branch fallback meta keeps its own mirror machinery and is
// excluded here
// the union in TWO phases, because the meta's instance-free verdict has to reach the PRIMARY
// dispatch while the enumeration itself must run after it: `prepare` builds the union options and
// stamps the verdict, `collect` enumerates. the member twin gets the same order for free - its
// producer dispatches after `attachMemberUnionExtras` has already stamped
export function prepareDestructureUnion({
  meta, keyNode, computed, scope, adapter, path, resolvePure = null, containerWalkObjects = null,
}) {
  // a computed key with no single dominating name - a BRANCHING literal (`const { [cond ? "flat" :
  // "at"]: m } = arr`), or a REASSIGNED alias whose only value sits in a pattern slot default - builds
  // NO meta in the producers, yet each written name is reachable exactly like the member-call form.
  // synthesize the same null-key typeless carrier the member path rides so those keys enumerate as
  // usage-global extras (`unionKeyedCarrierRides` is the one gate both producers ask); every other
  // null-meta call stays the no-op it always was
  // the member twin peels the key's sequence tail before it asks anything - both the carrier gate
  // below and the key axis read the peeled node, or an SE-wrapped branching key
  // (`{ [(se(), c ? "flat" : "at")]: f }`) resolves to nothing and not one arm reaches the axis
  const computedKeyNode = computed ? peelReceiverSequenceTail(keyNode) : null;
  if (!meta && computed && unionKeyedCarrierRides({ computedKeyNode, scope, adapter, path })) {
    meta = { kind: 'property', object: null, key: null, placement: 'prototype' };
  }
  // a FALLBACK meta takes the union too, as its member twin does: the branch walk names the arms it
  // resolves, and only the census names what a call arm returns (`pick() || Set`)
  if (!meta || meta.kind !== 'property') return null;
  if (adapter.method !== 'usage-global') return null;
  const hostPath = path?.parentPath?.parentPath;
  const host = hostPath?.node;
  // a NESTED leaf (a hop property, an array wrapper) reads the value its pattern PAIRS with, so that
  // value is the receiver the union enumerates - the flat meta of `{ w: { at } } = { w: g }` already
  // reads `g`, and an instance-free proof asked of the host's literal instead proved nothing, so the
  // typeless rows the flat twin never made were fabricated here
  // Usage-global keeps the entire initializer, so an effect-bearing paired value is safe to
  // enumerate too. The pure extraction's reread restrictions do not apply to this union.
  // ... and a flat host reads what the classifier reads: a for-of head carries no init, its element does
  const nestedHost = host?.type === 'Property' || host?.type === 'ObjectProperty' || host?.type === 'ArrayPattern';
  let hostInitNode = host?.type === 'VariableDeclarator' || host?.type === 'AssignmentExpression'
    ? ownRelocatedHeadElement(hostPath) ?? destructureReceiverNode(hostPath, null, adapter?.isMutatedStaticSlot ?? adapter?.isMutatedStatic)
    : nestedHost ? resolveNestedReceiverNode(path, { adapter, allowInitCarriedEffects: true }) : null;
  // an AssignmentPattern host routes through the SAME receiver selection as the per-branch
  // synth (`resolveFallbackReceiver` + caller-arg-wins): for an IIFE param-default the LIVE
  // call-arg supersedes the dead default, so the union enumerates the arg's reachables -
  // reading `host.right` structurally enumerated the dead default's instead
  let unionScope = scope;
  let unionPath = path;
  if (host?.type === 'AssignmentPattern') {
    const desc = resolveFallbackReceiver(hostPath.parentPath, host, adapter?.isMutatedStaticSlot ?? adapter?.isMutatedStatic);
    hostInitNode = chooseFallbackReceiverNode({
      argNode: desc?.rhsNode, defaultNode: host.right, objectPattern: path.parentPath?.node,
      scope, adapter, path, resolvePure,
      argScope: desc?.callPath?.scope ?? scope, argPath: desc?.callPath ?? path,
    });
    // a winning call-arg's reachables resolve at the call site (same shadow hazard as the
    // primary meta's resolution)
    if (desc?.callPath && hostInitNode === desc.rhsNode) {
      unionScope = desc.callPath.scope;
      unionPath = desc.callPath;
    }
  } else if (host && FN_NODE_TYPES.has(host.type)) {
    // plain IIFE `(function ({ [cond ? "from" : "of"]: v }) {})(Array)` - the destructure param
    // binds from the caller-arg, resolved at the call site. the AssignmentPattern arm above covers
    // the with-default form; the flat init reads cover declarator / assignment hosts
    const desc = resolveFallbackReceiver(hostPath, path.parentPath?.node, adapter?.isMutatedStaticSlot ?? adapter?.isMutatedStatic);
    if (desc?.rhsNode) {
      hostInitNode = desc.rhsNode;
      if (desc.callPath) {
        unionScope = desc.callPath.scope;
        unionPath = desc.callPath;
      }
    }
  }
  // a branch-synthesized carrier (`{ [cond ? "from" : "of"]: v } = Array`) starts with a null
  // object because the producer resolved no single key and bailed before typing the receiver.
  // recover it from the destructure host so the arm keys cross with the resolved receiver
  // (`Array.from` / `Array.of`) instead of enumerating typeless - mirrors the member path, whose
  // producer resolves the object before building the branch-key carrier. an array-wrappered host
  // (`[{ [cond?...]: v } = {}] = [Array]`) resolves through the same slot-paired peel the static
  // producer uses; the flat declarator / assignment hosts fall back to the plain init read
  let primaryObject = meta.object ?? null;
  if (primaryObject === null && meta.key === null) {
    primaryObject = resolveArrayWrapperedDestructureReceiver(path?.parentPath, adapter)
      ?? (hostInitNode ? resolveObjectName({
        objectNode: peelSequenceTail(unwrapRuntimeExpr(hostInitNode), { step: unwrapRuntimeExpr }),
        scope: unionScope,
        adapter,
        path: unionPath,
      }) : null)
      ?? null;
  }
  // the value of a SEQUENCE is its last expression, and the prefix contributes nothing to the object
  // axis: passed raw, the write-enumerating walk below sees a SequenceExpression instead of the
  // binding and finds only the registration's own ctor (`{ groupBy } = (n++, M)` lost Map's module
  // where the member spelling of the same read, which peels before it asks, kept it)
  // oxc keeps the source parens, so the wrapper peel comes FIRST - asked of a
  // ParenthesizedExpression the sequence peel is a no-op, and the wrong order kept losing
  // the module the other leg had already found - and so it comes at EVERY layer: a nested
  // sequence keeps its own parens (`(a(), (b(), A))`)
  const unionInitNode = hostInitNode ? peelSequenceTail(unwrapRuntimeExpr(hostInitNode), { step: unwrapRuntimeExpr }) : hostInitNode;
  const unionOptions = {
    objectNode: unionInitNode,
    computedKeyNode,
    primaryObject,
    primaryKey: meta.key,
    scope: unionScope, adapter, path: unionPath,
    containerWalkObjects,
  };
  // mirror the member funnel's instance-free verdict (this funnel bypasses the attach choke)
  const receiverInstanceFree = unionOptions.primaryObject === null
    && receiverProvablyInstanceFree(unionOptions);
  if (receiverInstanceFree) meta.receiverInstanceFree = true;
  return { ...unionOptions, receiverInstanceFree };
}

export function collectDestructureUnionCandidates(prepared) {
  return prepared ? collectMemberUnionCandidates(prepared) : [];
}

// gate for the "conditional destructure left untouched" warn: it is only meaningful when some branch
// resolves to a GENUINE per-branch-synth candidate for the key, so a real candidate was blocked (by a
// structural pattern issue) from per-branch synth-swap. when NO branch is a real candidate the meta
// is a false positive of the build's permissive object-tagging - `{ from } = cond ? Set : WeakMap`
// (`Set`/`WeakMap` carry no pure static `from`) or `{ banana } = ...` (not a method at all): there was
// no polyfill to leave untouched, so warning "polyfill candidate left untouched" would lie. uses the
// SAME `resolvePure`-static viability the per-branch synth applies (`isViableBranchForKey`: a pure,
// non-instance resolution) so the gate and the registration cannot disagree on what "candidate" means.
// single-sourced so both emitters share the gate (each calls it from its own synth-failure site)
export function fallbackDestructureHasPolyfillableBranch({ meta, path, adapter, resolvePure }) {
  return !!enumerateFallbackDestructureBranches(meta, path, adapter, { resolvePure })?.some(branchMeta => {
    const pure = resolvePure(branchMeta);
    return pure && pure.kind !== 'instance';
  });
}

// extract static destructure key names, or null when any key spells no slot (rest / spread / a
// computed key that folds to nothing) - then the dead-end determination below can't be certain
// and the default is kept
function destructureStaticKeys(objectPattern) {
  const props = objectPattern?.properties;
  if (!props?.length) return null;
  const keys = [];
  for (const prop of props) {
    if (prop.type !== 'ObjectProperty' && prop.type !== 'Property') return null;
    // through the shared resolver: spelling the accepted node types out here made the answer depend on
    // the PARSER (babel numeric keys are `NumericLiteral`, estree `Literal`), so one emitter kept a
    // polyfill-dead default the other superseded - and dropped the polyfill with it
    const name = spelledSlotName(prop);
    if (name === null) return null;
    keys.push(name);
  }
  return keys;
}

// does `node` (a fallback receiver) resolve to a viable - pure, non-instance - polyfill for `key`? mirrors
// `fallbackDestructureHasPolyfillableBranch`'s per-branch viability so the dead-end decision shares the
// SAME "carries a polyfill" notion the per-branch synth uses
function nodeYieldsViablePolyfill({ node, key, scope, adapter, path, resolvePure }) {
  return flattenFallbackBranches({ node, key, scope, adapter, path })
    .some(branchMeta => { const pure = resolvePure(branchMeta); return pure && pure.kind !== 'instance'; });
}

// a resolvable non-Identifier IIFE call-arg (a proxy-global member `globalThis.Array`, an inline-resolvable
// call `(() => Array)()`) supersedes the wrapper param-default ONLY when the default is a polyfill DEAD-END
// for every destructured key (`Object.from` resolves to nothing) AND the arg itself carries a polyfill:
// then the live arg is the only receiver that polyfills. when the default resolves a polyfill for some key
// it stays the synth target - it is the live fallback for the undefined-arg runtime path
// (`globalThis.AsyncIterator` absent on the target -> default `Array` -> `Array.from`). bare Identifiers go
// through `isClassifiableReceiverArg`; conditional / logical args through the per-branch synth (reached
// before this). a CALL arg is NOT excluded: when it inline-resolves to a constructor the synth injects the
// polyfill and the emitter rescues the call's side effect AHEAD of the literal (`(<call>(), { from: _$ })`)
// - excluding it MISSED the polyfill on a live, statically-known receiver. an opaque (non-resolvable) call
// yields nothing and keeps the default. detection and synth planning use this same receiver choice
function resolvableArgSupersedesDeadDefault({
  argNode,
  defaultNode,
  objectPattern,
  scope,
  adapter,
  path,
  resolvePure,
  argScope = scope,
  argPath = path,
}) {
  if (!argNode || argNode.type === 'Identifier') return false;
  const keys = destructureStaticKeys(objectPattern);
  if (!keys) return false;
  // each side is judged WHERE IT EVALUATES: the default in the invoked function's frame, the arg at
  // the call site. judging the arg in the frame lets a same-named parameter shadow it into
  // unresolvable, and the runtime-DEAD default then wins the choice
  function yieldsAny(node, nodeScope, nodePath) {
    return keys.some(key => nodeYieldsViablePolyfill({ node, key, scope: nodeScope, adapter, path: nodePath, resolvePure }));
  }
  return !yieldsAny(defaultNode, scope, path) && yieldsAny(argNode, argScope, argPath);
}

// The receiver to enumerate for an IIFE parameter: an argument with classifiable branches wins,
// then a resolvable argument over a polyfill-dead default, otherwise the default. Branch enumeration
// accepts unresolved selections; selecting one replacement slot uses findSynthSwapReceiverPath.
function chooseFallbackReceiverNode({
  argNode,
  defaultNode,
  objectPattern,
  scope,
  adapter,
  path,
  resolvePure,
  argScope = scope,
  argPath = path,
}) {
  if (isUsableFallbackReceiverArg(argNode, argScope, adapter)) return argNode;
  if (resolvableArgSupersedesDeadDefault({
    argNode,
    defaultNode,
    objectPattern,
    scope,
    adapter,
    path,
    resolvePure,
    argScope,
    argPath,
  })) return argNode;
  return defaultNode;
}

// The source slot to replace with a synthesized receiver, shared by both emitters. A classifiable
// IIFE argument wins; a resolvable argument wins over a polyfill-dead default; otherwise retain the
// default for an undefined argument. Each value is proved in its own evaluation frame. Rest declines.
// Defaults keep a whole ||/?? for left-collapse, but peel decided ternaries/&& and sequence tails;
// prefixes stay at their source slots. Without a default, an expanded classifiable argument suffices.
// The returned native path carries identity and scope; this decision never rewrites or clones it.
export function findSynthSwapReceiverPath(wrapperPath, objectPattern, adapter, resolvePure) {
  if (objectPattern?.properties?.some(isRestProperty)) return null;
  const wrapper = wrapperPath?.node;
  const hasDefault = wrapper?.type === 'AssignmentPattern' && wrapper.left === objectPattern;
  let defaultPath = hasDefault ? unwrapSafeSequenceTailPath(wrapperPath.get('right')) : null;
  if (defaultPath) {
    while (defaultPath.node.type !== 'LogicalExpression' || defaultPath.node.operator === '&&') {
      const key = decidedLiveOperandKey(defaultPath.node, { scope: defaultPath.scope, adapter, path: defaultPath });
      if (!key) break;
      defaultPath = unwrapSafeSequenceTailPath(defaultPath.get(key));
    }
  }
  const rawArgument = findIifeArgPath(hasDefault ? wrapperPath.parentPath : wrapperPath,
    hasDefault ? wrapper : objectPattern, adapter?.isMutatedStaticSlot ?? adapter?.isMutatedStatic);
  const argument = rawArgument
    && unwrapSafeSequenceTailPath(decidedRunningOperandPath(unwrapSafeSequenceTailPath(rawArgument), adapter));
  if (!defaultPath) {
    return argument && isExpandedClassifiableReceiver({
      node: argument.node, scope: argument.scope, path: argument, adapter,
    }) ? argument : null;
  }
  if (argument && (isClassifiableReceiverArg(argument.node, argument.scope, adapter)
    || resolvableArgSupersedesDeadDefault({
      argNode: argument.node, defaultNode: defaultPath.node, objectPattern,
      scope: defaultPath.scope, path: defaultPath, adapter, resolvePure,
      argScope: argument.scope, argPath: argument,
    }))) return argument;
  const fallback = defaultPath.node.type === 'LogicalExpression' && defaultPath.node.operator !== '&&';
  const left = fallback ? unwrapSafeSequenceTailPath(decidedRunningPath(defaultPath.get('left'), adapter))?.node : null;
  return (fallback && (isReceiverShapedNode(left) || invocationNode(left)))
    || isReceiverShapedNode(defaultPath.node) || defaultPath.node.type === 'ThisExpression' ? defaultPath : null;
}

// does the value an extraction SPELLS perform every effect its init would? then the residual may be
// DROPPED whatever the init's purity - what the dropped read would have evaluated, the dispatch
// evaluates instead, exactly once. that is the question `initIsPure` stands in for, and it answers
// it too narrowly: a LITERAL init whose every OTHER part is effect-free observes nothing when it is
// constructed, so the slot the receiver descends into was the only effect there was
// (`const { y: { at } } = { y: arr.flat() }` - dropping the residual makes `flat` run ONCE, keeping
// it makes it run twice). a computed KEY is an effect the receiver does not spell, and a second
// effect-bearing part means the drop would lose one
// ... a SPREAD part is such a second effect on its own: what it reads is the source's own enumerable
// keys, so a receiver descending into a sibling slot performs none of it
// ... and it reads THROUGH the wrappers a source may spell around any of these: parens and TS
// assertions are erased at runtime, so what they hold performs exactly the effects they do, and one
// leg seeing a wrapper the other's parser drops would answer differently about the same program.
// a SEQUENCE is not such a wrapper - its prefix is an effect the receiver does not spell - which is
// why the peel is `unwrapRuntimeExpr` and never `unwrapExpressionChain`, whose elision would drop
// that prefix out of the accounting
// ... and a value the build decides performs what the part of it that runs does (`decidedRunningOperand`):
// its test is a plain read and its dead part never runs, at the init and down to the receiver's slot
// A movement proof can pass `isQuiet` for untouched siblings, including their implicit conversions;
// ordinary callers retain the effect-only answer.
export function receiverPerformsEveryInitEffect(initNode, receiverNode, ctx = null, isQuiet = null) {
  if (!initNode || !receiverNode) return false;
  if (initNode === receiverNode) return true;
  function running(node) {
    return unwrapRuntimeExpr(ctx?.adapter ? decidedRunningOperand(node, ctx) : node);
  }
  let init = running(initNode);
  let receiver = unwrapRuntimeExpr(receiverNode);
  // a SEQUENCE init runs its prefix first: a receiver spelling that same prefix ahead of its own value
  // runs it in the same place, and what is left to account for is the tail. a prefix of quiet literals
  // is a comma the source wrote, which the receiver need not spell - a read stays, it may throw
  // (`observableSequenceElements`)
  while (init !== receiver && init.type === 'SequenceExpression') {
    const prefix = init.expressions.slice(0, -1);
    const spelled = receiver.type === 'SequenceExpression' ? receiver.expressions : [];
    const spellsPrefix = spelled.length > prefix.length && prefix.every((expr, index) => spelled[index] === expr);
    if (!spellsPrefix && observableSequenceElements(prefix, ctx, { preserveSourceReads: true }).length) return false;
    init = running(init.expressions.at(-1));
    if (spellsPrefix) receiver = unwrapRuntimeExpr(sequenceExpression(spelled.slice(prefix.length)));
  }
  if (init === receiver) return true;
  const isObject = init.type === 'ObjectExpression';
  if (!isObject && init.type !== 'ArrayExpression') return false;
  if (isObject && init.properties.some(prop => prop.type !== 'SpreadElement'
    && prop.computed && (mayHaveSideEffects(prop.key, ctx) || isQuiet && foldedPropertyKeyName(prop) === null))) return false;
  // a SPREAD stays WHOLE here: what it reads is the source's own enumerable keys, so the effect is
  // the spread itself and not the binding it names - mapping it to its argument read `...spread` as
  // inert and let a receiver that carries none of that pass for one that carries all of it
  const parts = isObject
    ? init.properties.map(prop => prop.type === 'SpreadElement' ? prop : prop.value)
    : init.elements;
  let holder = null;
  for (const part of parts) {
    if (!part) continue;
    if (unwrapRuntimeExpr(part) === receiver || receiverPerformsEveryInitEffect(part, receiver, ctx, isQuiet)) {
      if (holder) return false;
      holder = part;
      continue;
    }
    // a sibling slot reading a getter performs work the receiver does not (the scoped predicate)
    if (isQuiet ? !isQuiet(part) : mayHaveSideEffects(part, ctx)) return false;
  }
  return !!holder;
}

// the receiver an extraction may spell where the residual DIES: past the re-readability gates, which
// exist to protect a second reader that no longer exists. `resolveOptions` is the host's own resolve
// vocabulary and `fallbackNode` what the host hands over when the nested walk names nothing (an array
// wrapper's paired element); the CALLER owns the question of whether its residual dies at all.
// `adapter` folds a BOUND hop key on the way (`{ [k]: { at } }`), as every other resolve of the leaf does.
// a receiver that SPELLS a sequence rides the dispatch as written (`_at((mark(), arr))`), the flat
// spelling's shape - the claims inside it rewrite where they stand
export function carriedInitReceiverNode({ path, initNode, resolveOptions = {}, fallbackNode = null, adapter = null }) {
  const node = resolveNestedReceiverNode(path, { ...resolveOptions, allowInitCarriedEffects: true, adapter })
    ?? fallbackNode;
  if (!node) return null;
  return receiverPerformsEveryInitEffect(initNode, node, adapter ? { scope: path.scope, adapter, path } : null) ? node : null;
}

// the shared DECISION for a claim extracted beside a destructure RESIDUAL - a kept effectful key, a
// nested instance leaf, a wrapper slot: does the residual die with the extraction
// (`eliminateResidual`), does the receiver memoize into a `_ref` both readers share
// (`memoizeReceiver`), and does the host render the extraction as a sibling declarator
// (`siblingDeclarator`)? the caller hands over the facts it alone can see (binding counts, init
// purity, what its receiver node carries or re-spells); null is the one bail - an instance receiver
// no channel may read twice. Literal-slot extraction also uses the provider decision
// `planLiteralResidual`; its native residual and memo allocation are applied by the binding.
// an effectful key stays IN PLACE, its value renamed to a throwaway, so the effect runs once and in
// source order, and the polyfill binds apart - every host shape alike: a lift hoisting the effect broke
// on exports, defaults with a call, nested-sequence keys and array wrappers. `siblingDeclarator` stands
// where a preceding statement cannot: a loop header hosts none, and a multi-declarator INSTANCE claim
// reads a receiver an earlier declarator of the declaration may bind (`const r = x, { [k]: m } = r` - a
// preceding `const m = _m(r)` faults in the TDZ). `eliminateResidual` drops a lone declarator outside a
// for-head binding nothing but the leaf over an effect-free init; `memoizeReceiver` hoists a CONSTANT
// literal receiver of a surviving residual into one `_ref` rather than spelling it twice - a name or a
// primitive is cheap to repeat
export function planSideEffectKeyStrategy({
  polyfillKind,
  isForInit,
  isMultiDeclarator,
  receiverNode = null,
  entry = null,
  prop = null,
  pattern = null,
  hostPattern = null,
  sourceBindingCount = null,
  capturedReceiverNode = null,
  soleBindingInDeclaration = false,
  initIsPure = false,
  propKeyIsPure = true,
  memoHoistKeepsOrder = false,
  slotDropsAlone = false,
  receiverCarriesInit = false,
  residualKeepsNoReader = false,
  receiverIsWholeInit = false,
  receiverReReadable = false,
}) {
  const instance = polyfillKind === 'instance';
  const siblingDeclarator = !!(isForInit || (isMultiDeclarator && instance));
  // dead residual: nothing left to bind, no init effect to preserve, AND the key carries no side effect
  // (`{ [(eff(), 'k')]: f }` keeps the key in place so the effect still runs - dropping it would lose `eff()`).
  // a sibling-declarator host (for-init / multi-declarator) shares its declaration, so the slot can only
  // drop where the host renders one statement per declarator (`slotDropsAlone`) - a loop header cannot
  // ... and an init whose effects RIDE the receiver node - the caller spelled the whole init into the
  // dispatch (`_flat((eff(), Array.prototype))`, the flat canon's own shape) - leaves nothing for the
  // residual to preserve: what the drop discards is a read the extraction now performs itself, in
  // source order, exactly once
  const eliminateResidual = soleBindingInDeclaration && (initIsPure || receiverCarriesInit) && propKeyIsPure
    && (!siblingDeclarator || slotDropsAlone);
  // memoize the receiver into a shared `_ref` read once by both the residual and the extract:
  //   - a CONSTANT array / object literal, so the surviving residual doesn't keep a duplicate of the
  //     (possibly large) literal beside the extract - on a sibling-declarator host as a PRECEDING
  //     declarator at the source slot, the shape the member receiver below takes there. a loop HEAD
  //     re-reads the literal instead, unless a kept effectful key makes the two reads share one ref.
  //   - a side-effect-free MEMBER (`holder.p`) or BRANCHING (`c ? [7] : []`, `a || b`) receiver: a
  //     getter must fire exactly ONCE (like the native single read) and a branch must not re-select,
  //     so the duplicate path is UNSOUND and the memo is the only extraction shape. sibling-declarator
  //     hosts memoize too - the memo joins the declaration as a PRECEDING declarator at the source
  //     slot (`var _ref = holder.p, { ... } = _ref, m = _m(_ref)`), so there is no TDZ and the
  //     for-head needs no statement slot. gated on a side-effect-free WHOLE init: the memo hoists the
  //     receiver read ABOVE the init expression, so a NESTED receiver placed after an effectful slot
  //     (`{ q: se(), p: holder.p }`) would observably reorder
  // a side-effecting computed key is NOT captured by the memo: it stays in the kept key and runs once.
  // receiver classification lives HERE (from the raw node) so both emitters decide identically
  const receiverIsSafe = isReReferenceableReceiver(receiverNode);
  // `memoHoistKeepsOrder`: the caller PROVED the hoist observes nothing out of order even though
  // the whole init is not pure - an ARRAY-WRAPPED slot whose preceding elements are all pure is
  // exactly that shape, and the element itself has already been memoized by the receiver plan,
  // so what reaches here is the re-readable ref
  const orderSafeHoist = initIsPure || memoHoistKeepsOrder;
  // ... and a caller that PROVED the surviving residual reads nothing off this receiver needs no
  // memo at all: the dispatch is the only reader, so it spells the receiver itself and fires its
  // getter exactly once - and it fires it where the extraction stands, which is the placement the
  // caller controls (an effect-bearing wrapper neighbour puts the extraction after the residual)
  // ... and an ARRAY-WRAPPED element whose hoist keeps order memoizes whatever its own shape: the memo
  // evaluates it exactly where native does - reading that element - so the residual the wrapper keeps
  // and the dispatch beside it share the ONE read the source performs. without it an effect-bearing
  // element was refused outright and the claim shipped native (`const [{ at }] = [eff()]`)
  // ... and a RE-READABLE receiver - a binding, a built-in surface nav - needs no memo whatever keeps
  // the residual: the dispatch reads it inline and the residual re-reads it for free, so no `_ref`
  // hoists it ahead of anything (`[{}] = [_globalThis, ...t]; const m = _flat(_globalThis.Array.prototype)`,
  // `const { ...other } = _ref; const a = _at(_ref.Array.prototype)`). a kept EFFECTFUL key is the one
  // reason to memoize such a receiver, since its sentinel residual and the dispatch must share one read
  const memoizeReceiver = instance && !eliminateResidual && !residualKeepsNoReader
    && !(receiverReReadable && propKeyIsPure)
    && ((isConstantLiteralReceiver(receiverNode) && (!isForInit || !propKeyIsPure))
      || ((isSeFreeMemberReceiver(receiverNode) || isSeFreeBranchingReceiver(receiverNode)) && orderSafeHoist)
      // ... a SIBLING-declarator host is no obstacle: the memo joins the declaration as a PRECEDING
      // declarator at the source slot, so it evaluates exactly where the element does. a for-HEAD is,
      // since it has no declarator slot ahead of the pattern
      || (memoHoistKeepsOrder && !isForInit && !receiverIsSafe)
      // ... and a receiver that IS the whole init memoizes whatever its shape: the memo evaluates it
      // exactly where native does - reading the initializer - so nothing can reorder around it, and
      // the residual a kept KEY leaves behind then shares that one read instead of forcing a bail
      // (`const { [(eff(), 'at')]: a } = getArr()` shipped native here while the other leg served it).
      // a for-HEAD takes it as a preceding DECLARATOR, which is where that head keeps its own memos.
      // an ARRAY / OBJECT literal stays out - the literal arms above own it, and memoizing one here
      // served a shape the other leg keeps native
      || (receiverIsWholeInit && !receiverIsSafe
        && receiverNode.type !== 'ArrayExpression' && receiverNode.type !== 'ObjectExpression'));
  // an instance polyfill re-references the receiver beside the SURVIVING residual; bail unless it is safe to
  // read twice (Identifier / side-effect-free literal - see `isReReferenceableReceiver`) or the memo above
  // makes the second read a `_ref` read. when the residual is ELIMINATED the extraction (`const m =
  // _m(recv)`) is the receiver's ONLY read, so a member receiver's getter fires exactly once - same as
  // native - and is sound to extract (`const { y: { at } } = { y: Array.prototype }`)
  // ... and a nav into the BUILT-IN namespace re-spells for free, whatever the memo could not do:
  // the caller proved it through `isReReadableSurfaceNav`, so the extraction may stand beside a
  // surviving residual and read that surface a second time (`[, { Array: { prototype: { flat } } }]
  // = [eff(), globalThis]` - a memo there would hoist the read past the neighbour's own effect)
  if (instance && !receiverIsSafe && !receiverReReadable
    && !eliminateResidual && !memoizeReceiver && !residualKeepsNoReader) return null;
  // The dispatcher owns this ordinary leaf's property read. A surviving wrapper can retain
  // its native coercion, keys and iteration with an empty leaf pattern instead of a second Get.
  // Restrict the handoff to an actual captured literal; source aliases and sibling reads stay native.
  const consumeResidualRead = instance && !!entry && entry !== 'get-iterator-method' && !eliminateResidual
    && propKeyIsPure && prop?.value?.type === 'Identifier' && pattern?.type === 'ObjectPattern'
    && pattern.properties.length === 1 && pattern.properties[0] === prop
    && sourceBindingCount === 1 && soleChainToProp(hostPattern, prop)
    && isConstantLiteralReceiver(capturedReceiverNode ?? (memoizeReceiver ? receiverNode : null));
  return { instance, siblingDeclarator, eliminateResidual, memoizeReceiver, consumeResidualRead };
}

// debug-warn message for a conditional-destructure (`{ k } = cond ? A : B` / `= A || B`) whose polyfill
// candidate could NOT be registered as a per-branch synth-swap, so the key is left untouched - whether the
// polyfill applies then depends on which branch the condition selects at runtime. single-sourced so both
// emitters emit the identical diagnostic (babel emitted it inline; unplugin previously stayed silent)
export function conditionalDestructureLeftUntouchedWarning(key) {
  return `conditional destructure with polyfill candidate left untouched ("${ key }" on fallback branch) - runtime availability depends on the selected branch`;
}

// A body extraction needs a parameter binding and no parameter-scope reads or body
// redeclaration of that binding. A whole receiver capture can also wrap a concise arrow body.
// Receiver-less static extraction separately proves that every call uses the parameter default;
// whole-receiver extraction checks all moved names together before asking this binding-local gate.
export function qualifiesForParamBodyExtract({ propPath, localId, receiverCapture = false }) {
  const patternParentType = propPath.parentPath?.parentPath?.node?.type;
  if (!receiverCapture && (patternParentType === 'Property' || patternParentType === 'ObjectProperty'
    || patternParentType === 'ArrayPattern')) return null;
  const existingBinding = propPath.scope.getBinding(localId.name);
  if (existingBinding && (existingBinding.identifier ?? existingBinding.identifierPath?.node) !== localId) return null;
  const fnPath = findEnclosingFunctionLikePath(propPath);
  if (!fnPath || fnPath.node.body?.type !== 'BlockStatement'
    && !(receiverCapture && fnPath.node.type === 'ArrowFunctionExpression' && fnPath.node.body)) return null;
  let top = propPath.parentPath;
  while (top?.parentPath && PATTERN_WRAPPERS.has(top.parentPath.node?.type)) top = top.parentPath;
  if (top?.parentPath?.node !== fnPath.node) return null;
  // An inner receiver default cannot justify replacing a value supplied by the caller.
  if (!receiverCapture && patternParentType === 'AssignmentPattern'
    && top.node !== propPath.parentPath.parentPath.node) return null;
  const site = !receiverCapture && top.node.type === 'AssignmentPattern' ? findIifeCallSite(fnPath, top.node) : null;
  if (site && argumentOverridesSlot(site.callPath.node.arguments ?? [], site.paramIndex,
    () => !!site.callPath.scope?.getBinding?.('undefined'))) return null;
  if (!receiverCapture && paramListReadsName(fnPath.node.params, localId.name)) return null;
  if (functionScopeBindsVarOrFunction(fnPath, localId.name)) return null;
  return { fnPath };
}

const parameterExtractionBarriers = createInstanceNodeCache();

// A parameter needs its actual receiver, rather than a caller-side mirror or a default-only
// substitution. Pattern levels can move together to the body entry; their inner defaults
// must be literals, since a moved expression would resolve body declarations in a different scope.
// Leaf defaults and other parameter work keep their original timing. A whole receiver default stays.
// eslint-disable-next-line max-statements -- nested pattern admission shares the parameter timing and binding proof
export function planParameterInstanceExtraction({
  propPath, adapter, resolvePure, isDisabledProp, parameterCallSites = null, isClaimedProp = null,
}) {
  const patternPath = destructureHostThroughWrappers(propPath.parentPath, adapter, true)?.hostPatternPath;
  if (!isDestructurePattern(patternPath?.node)) return null;
  const rootPath = patternPath.parentPath?.node.type === 'AssignmentPattern'
    && patternPath.parentPath.node.left === patternPath.node ? patternPath.parentPath : patternPath;
  const fnPath = rootPath.parentPath;
  const fn = fnPath?.node;
  const paramIndex = fn?.params?.indexOf(rootPath.node) ?? -1;
  if (adapter.method !== 'usage-pure' || !fn || fn.generator || fn.async
    || !['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'].includes(fn.type)
    || paramIndex < 0
    || fn.params.some((param, index) => param !== rootPath.node && param.type !== 'Identifier'
      && !(index < paramIndex && param.type === 'AssignmentPattern' && param.left.type === 'Identifier'))) return null;
  // A refusal keeps its live parameter-expression witness, never a permission to extract.
  // A rewrite or scope rebuild can retire that dependency while retaining this pattern and adapter.
  const blocked = parameterExtractionBarriers.get(adapter, patternPath.node);
  if (blocked && blocked.fn === fn && blocked.fnScope === fnPath.scope
    && blocked.root === rootPath.node && blocked.paramIndex === paramIndex
    && fn.params[blocked.sourceIndex] === blocked.sourceRoot && pathContainedBy(blocked.path, blocked.sourceRoot)
    && (blocked.moved ? blocked.declarationPath.node === blocked.declaration
      && !ancestorChainDetached(blocked.declarationPath)
      && pathContainedBy(blocked.declarationPath, patternPath.node) : fn.params[blocked.index] === blocked.declaration)
    && blocked.path.node === blocked.node
    && blocked.node.type === 'Identifier' && blocked.node.name === blocked.name
    && !ancestorChainDetached(blocked.path)
    && !isNonReferencePosition(blocked.path.parentPath?.node, blocked.node)) {
    const raw = blocked.path.scope?.getBinding(blocked.name);
    if (bindingLoopAnchor(raw).decl === blocked.declaration) return null;
  }
  parameterExtractionBarriers.delete(adapter, patternPath.node);
  const properties = [];
  const patterns = [patternPath];
  for (const pattern of patterns) {
    if (pattern.node.type === 'ArrayPattern') {
      const elements = pattern.get('elements').filter(element => element.node);
      if (!elements.length || elements.some(element => !isDestructurePattern(element.node))) return null;
      patterns.push(...elements);
      continue;
    }
    if (!pattern.node.properties.length) return null;
    for (const prop of pattern.get('properties')) {
      if (!isPropertyNode(prop.node) || prop.node.computed || isDisabledProp?.(prop.node)) return null;
      let target = prop.get('value');
      if (target.node.type === 'Identifier') properties.push(prop);
      else {
        if (target.node.type === 'AssignmentPattern') {
          if (!isConstantLiteralNode(unwrapRuntimeExpr(target.node.right))) return null;
          target = target.get('left');
        }
        if (!isDestructurePattern(target.node)) return null;
        patterns.push(target);
      }
    }
    if (!patternComputedKeysSynthSafe({
      objectPatternNode: pattern.node, scope: pattern.scope, adapter, path: pattern, distinctReads: true,
    })) return null;
  }
  // A delayed property read crosses later bare parameter bindings too. A parameter closure
  // can observe their TDZ when the original getter runs, before those bindings initialize.
  const observed = [
    ...properties.map((prop, index) => ({ path: prop.get('value'), index, moved: true })),
    ...fnPath.get('params').slice(paramIndex + 1).map((path, index) => ({ path, index: paramIndex + index + 1, moved: false })),
  ];
  const observedNames = new Set(observed.map(({ path }) => path.node.name));
  if (paramListReadsName(fn.params, observedNames)) {
    for (const { path: read, index, moved } of observed) {
      const raw = read.scope.getBinding(read.node.name);
      const references = adapter.collectBindingReferences?.(read, read.node.name);
      const binding = adapter.getBinding({ scope: read.scope, name: read.node.name, path: read, read: read.node });
      if (!raw || bindingLoopAnchor(raw).decl !== read.node || !references || !binding) return null;
      for (const [paths, write] of [[references, false], [binding.constantViolations ?? [], true]]) {
        for (const reference of paths) {
          const at = reference.node ? reference : pathOfNode(read, reference);
          if (!at) return null;
          if (pathContainedBy(at, fn.body) || ancestorChainDetached(at)) continue;
          const { name } = read.node;
          const target = write && at.node.type !== 'Identifier'
            ? writtenNames(at.node, { identifierNodes: true }).find(id => id.name === name) : at.node;
          if (!target || target.name !== name) continue;
          const witness = target === at.node ? at : pathOfNode(at, target);
          if (!witness || target.type !== 'Identifier') return null;
          if (isNonReferencePosition(witness.parentPath?.node, target)) continue;
          const sourceBinding = witness.scope?.getBinding(name);
          if (!sourceBinding) return null;
          if (bindingLoopAnchor(sourceBinding).decl !== read.node) continue;
          const sourceIndex = fn.params.findIndex(param => pathContainedBy(witness, param));
          if (sourceIndex === -1) return null;
          parameterExtractionBarriers.set(adapter, patternPath.node, {
            fn, fnScope: fnPath.scope, root: rootPath.node, paramIndex, path: witness, node: target,
            declaration: read.node, declarationPath: read, name, index, moved,
            sourceIndex, sourceRoot: fn.params[sourceIndex],
          });
          return null;
        }
      }
    }
  }
  if (identifierReferencedInSubtree(fn, 'eval')) return null;
  const bodyBindings = new Set();
  for (const statement of fn.body.type === 'BlockStatement' ? fn.body.body : []) {
    for (const name of stmtRebindNames(statement, [])) bodyBindings.add(name);
  }
  if (properties.some(prop => bodyBindings.has(prop.node.value.name))) return null;
  return withCanonQuestion(() => {
    let claim = false;
    const claimedProperties = [];
    for (const prop of properties) {
      if (isClaimedProp?.(prop)) {
        claimedProperties.push(prop.node);
        continue;
      }
      const sourceMeta = buildDestructureLeafMeta({
        descriptor: classifyDestructureLeafHost({ objectPattern: prop.parentPath }),
        key: propertyKeyName(prop.node), adapter, resolvePure, parameterCallSites,
      });
      const sourceKind = sourceMeta && resolveBuiltIn(sourceMeta)?.kind;
      // A static/global arm needs its existing mirror or identity guard, not a generic instance read.
      if (!sourceMeta || sourceMeta.guardedAliasHint || sourceKind === 'static' || sourceKind === 'global') return null;
      if (!qualifiesForParamBodyExtract({ propPath: prop, localId: prop.node.value, receiverCapture: true })) return null;
      const instance = resolvePure({ kind: 'property', object: null, key: propertyKeyName(prop.node), placement: null }, prop)
        ?.kind === 'instance';
      claim ||= instance;
    }
    return claim ? {
      fnPath, rootPath, pattern: patternPath.node, root: rootPath.node, claimedProperties, bindingProperties: properties,
      paddingRequired: fn.params.every(param => param.type !== 'AssignmentPattern'),
    } : null;
  });
}

// the pure entry an instance synth reads its RECEIVER through, or null for a receiver it spells as
// written. a synth literal re-emits its receiver where no visitor reaches it again, so a global
// this build polyfills has to arrive as the injected binding - `Iterator` there would be a raw read
// of a name the pass replaces everywhere else. ONE answer for both emitters: the synth gate admits
// exactly the receivers this resolves, and each render spells what it returns. The same
// handoff serves an instance dispatch whose receiver is a proven static value.
export function instanceSynthReceiverPure(receiverNode, { adapter, scope, path, resolvePure, injectorState = null }) {
  if (receiverNode?.type !== 'Identifier') {
    const aliasCtx = { adapter, scope, path };
    // a whole swap cannot replay a read's effects or its live short-circuit / sealed throw here.
    // the same member-ctor canon used by the static synth proves the root and its unmutated slot.
    if (mayHaveSideEffects(receiverNode, aliasCtx)
      || navValueCanShortCircuit(receiverNode, resolvePure, aliasCtx)
      || chainSealsAShortCircuit(receiverNode, resolvePure, aliasCtx)) return null;
    const ctor = proxyGlobalMemberCtorPure({ receiver: receiverNode, aliasCtx, resolvePure });
    if (ctor) return ctor;
    const key = isMemberAccessNode(receiverNode) && staticMemberKeyName(receiverNode);
    const meta = key && isBuiltInSurfaceNav(receiverNode, {
      ctx: aliasCtx,
      isOwnAlias: name => injectorState?.isOwnPassGeneratedName(name) && injectorState.getBindingInfo(name)?.minted === true,
    })
      && buildDestructuringInitMeta({ initNode: receiverNode.object, key, adapter, scope, path });
    if (!meta?.object || meta.placement !== 'static' || meta.guardOnly || meta.fromFallback) return null;
    const pure = resolvePure(meta);
    return pure?.kind === 'static' ? pure : null;
  }
  if (adapter.hasBinding({ scope, name: receiverNode.name, path, read: receiverNode })) return null;
  const pure = resolvePure({ kind: 'global', name: receiverNode.name });
  return pure && pure.kind !== 'instance' ? pure : null;
}

// A mirror needs proven property keys. An unknown key can overwrite another slot and its
// ToPropertyKey would run in both the literal and the surviving pattern. Keep that pattern
// native instead; a scope binding alone does not prove that its value is safe to replay.
// Instance reads also need distinct keys: getters can return a different value on each read.
export function patternComputedKeysSynthSafe({ objectPatternNode, scope, adapter, path, distinctReads = false }) {
  const seen = distinctReads ? new Set() : null;
  for (const prop of objectPatternNode.properties) {
    if (!prop.computed && !seen) continue;
    const { lookupKey } = resolveSynthKeys({ node: prop, scope, adapter, path });
    const symbol = prop.computed ? computedKeyWellKnownSymbolName({ keyNode: prop.key, scope, adapter, path }) : null;
    if (lookupKey === null && symbol === null) return false;
    if (seen) {
      const key = symbol === null ? `string:${ lookupKey }` : `symbol:${ symbol }`;
      if (seen.has(key)) return false;
      seen.add(key);
    }
  }
  return true;
}

// Can another reader on a hop's level read the slot the hop's key names? One naming the same key, or
// one whose key nothing proves (the unknown key `patternComputedKeysSynthSafe` refuses). A rest reads
// no named slot.
function hopSlotReadElsewhere({ levelNode, key, scope, adapter, path }) {
  let readers = 0;
  for (const prop of levelNode?.properties ?? []) {
    if (!isPropertyNode(prop)) continue;
    if (consumableHopSlotName(prop, { scope, adapter, path }) === key) readers++;
    else if (!patternComputedKeysSynthSafe({ objectPatternNode: { properties: [prop] }, scope, adapter, path })) return true;
  }
  return readers > 1;
}

// Is this claim under a hop whose slot the host's literal spells while another reader on the hop's
// level may read it (`hopSlotReadElsewhere`)? A mirror of that slot hands the reader the literal, and
// an extraction off it writes out of source order on an assignment, so the claim keeps its native
// read. `receivers` are the host's values (a head's elements); a bound container is foreign to the
// host, and an `undefined` slot leaves the mirror to the level's own default: neither is replaced.
// The answer is a fact of the pattern and its receivers, which key the cache; `scope` / `path` only
// fold computed keys and decide the selections a level holds, and every asker stands at the same host.
const sharedHopSlotClaims = createInstanceNodeCache();
export function claimUnderSharedHopSlot({ top, receivers, prop, scope, adapter, path }) {
  const values = receivers.filter(Boolean);
  const keyCtx = { scope, adapter, path };
  // a receiver without a literal pairs no slot at any level: the realistic hosts stop here
  if (values.every(value => !CENSUS_CONTAINER_TYPES.has(levelLiteralThroughIife(value, keyCtx).literal?.type))) return false;
  let claims = sharedHopSlotClaims.get(adapter, top);
  if (!claims?.seen.has(prop) || claims.values.length !== values.length || claims.values.some((value, at) => value !== values[at])) {
    claims = { values, seen: new Set(), shared: new Set() };
    (function walk(node, paired, shared) {
      const pattern = patternSlotTarget(node);
      if (pattern?.type === 'ArrayPattern') {
        pattern.elements.forEach((element, index) => {
          if (!element || element.type === 'RestElement') return;
          walk(element, paired.map(value => {
            const { literal } = levelLiteralThroughIife(value, keyCtx);
            return literal?.type === 'ArrayExpression' ? resolveCallArgument(
              literal.elements,
              index,
              adapter?.isMutatedStaticSlot ?? adapter?.isMutatedStatic,
            ) : null;
          }).filter(Boolean), shared);
        });
        return;
      }
      if (pattern?.type !== 'ObjectPattern') return;
      for (const item of pattern.properties) {
        claims.seen.add(item);
        if (shared) claims.shared.add(item);
        const key = paired.length && isPropertyNode(item) ? consumableHopSlotName(item, keyCtx) : null;
        const below = key === null ? [] : paired.map(value => {
          const read = objectLevelPairedProperty(levelLiteralThroughIife(value, keyCtx).literal, key)?.read ?? null;
          return read && !isUndefinedNode(unwrapRuntimeExpr(read)) ? read : null;
        }).filter(Boolean);
        walk(item.value, below, shared || (below.length > 0 && hopSlotReadElsewhere({ levelNode: pattern, key, ...keyCtx })));
      }
    })(top, values, false);
    sharedHopSlotClaims.set(adapter, top, claims);
  }
  return claims.shared.has(prop);
}

// A receiver an instance synth slot spells whole: an invocation, a plain store or a literal.
// One slot evaluates it once; store targets keep their value and every evaluated part keeps
// its own claims, including a computed assignment target.
export function instanceSynthSpellsReceiver(node) {
  return !!invocationNode(node) || isChainAssignment(peelNestedSequenceExpressions(node).tail)
    || REFERENCEABLE_LITERAL_TYPES.has(node?.type) || node?.type === 'TemplateLiteral';
}

// Qualify an instance synth for a parameter default: supplied arguments still destructure natively.
// Keys must be replayable and bind identifiers; folded computed keys and dead property defaults
// qualify, rest does not. Each receiver branch must be safe to reproduce: names, this and constants
// can serve several properties; a plain member is limited to one read unless a pure entry replaces
// it whole, its root is an inert literal or it is a re-readable built-in surface nav, and an
// invocation or a literal (`instanceSynthSpellsReceiver`) serves one property alone. Raw rewritable
// globals, live optional members, slots owned by typed navigation and inner defaults the host proves
// dead decline. A selection the build decides is judged by the operand of it that runs
// (`decidedRunningOperand`), wherever the receiver holds it: the literal spells it as written and the
// fold drops the rest there too. An object literal the whole receiver is (`whole`, not one part of a
// selection) spelling a pattern key as its own property hands that property to the read
// (`{ at } = { at: [1] }`), never a method its prototype carries: there is nothing to dispatch
export function paramDefaultInstanceSynthAllowed({
  objectPatternNode, receiverNode, scope, adapter, path, resolvePure, whole = true,
}) {
  if (!receiverNode || !objectPatternNode?.properties?.length) return false;
  function running(node) {
    return unwrapRuntimeExpr(decidedRunningOperand(node, { scope, adapter, path }));
  }
  receiverNode = running(receiverNode);
  if (whole && receiverNode.type === 'ObjectExpression' && objectPatternNode.properties.some(prop => {
    const name = spelledSlotName(prop);
    return name !== null && !!findObjectKeyBeforeSpread(receiverNode.properties, own => spelledSlotName(own) === name);
  })) return false;
  if (!patternComputedKeysSynthSafe({ objectPatternNode, scope, adapter, path, distinctReads: true })) return false;
  if (objectPatternNode.properties.some(prop => computedKeyHasSideEffects(prop, { scope, adapter, path }))
    && objectPatternNode.properties.some(prop => {
      const { lookupKey } = resolveSynthKeys({ node: prop, scope, adapter, path });
      return lookupKey !== null && !resolvePure({ kind: 'property', key: lookupKey, placement: 'prototype' });
    })) return false;
  // ... but a default the TYPED-NAV dispatch owns is NOT this route's: that one reads the slot's
  // nav once and folds both arms through the instance guard, where a synth over the default alone
  // polyfills the arm that may never run and leaves the LIVE read raw (`{ y: { flat } = list } =
  // src` kept `src.y.flat` native and answered `undefined` off-engine). the two routes disagreed
  // by which ran first, so the ownership question is asked here rather than left to that order
  if (path && typedNavClaimShape(path, { adapter })) return false;
  // ... nor one over an inner default the host proves DEAD: the synth would serve the arm that never
  // runs, and the live one belongs to the routes reading the paired value
  if (path && nearestInnerDefaultDead(path.parentPath, adapter)) return false;
  for (const prop of objectPatternNode.properties) {
    if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') return false;
    // whatever the synth literal can replay is admissible here: the renderers spell a string /
    // numeric key through its resolved name and clone a folded computed one, so none of those
    // loses its binding. a key that resolves to no slot stays native
    if (!isReplayableSynthKey(prop)) return false;
    // a direct wks key renders through the injected pure symbol binding: admissible only
    // where that import resolves and `Symbol` is the real global, not a local shadow
    const wks = prop.computed ? wksComputedKeyName(prop.key) : null;
    if (wks !== null && (adapter.hasBinding({ scope, name: 'Symbol', path })
      || !resolvePure({ kind: 'property', object: 'Symbol', key: wks, placement: 'static' }))) return false;
    if (!propBindingIdentifier(prop.value)) return false;
  }
  function unboundPureGlobal(name, read = null) {
    if (adapter.hasBinding({ scope, name, path, read })) return false;
    return POSSIBLE_GLOBAL_OBJECTS.has(name) || !!resolvePure({ kind: 'global', name });
  }
  if (receiverNode.type === 'ThisExpression') return true;
  if (receiverNode.type === 'Identifier') {
    // ... a name a getter of the pattern may rebind is read once per slot the mirror spells, so it is
    // admissible for ONE slot only - the invocation's rule below
    if (!isReReferenceableAcrossReads(receiverNode, { scope, adapter, path })) return objectPatternNode.properties.length === 1;
    // ... and a BARE global the render RESOLVES leaks nothing after all: both emitters spell it
    // through the injected pure binding instead of re-emitting the name, so the raw read this gate
    // guards against has no spelling left. a proxy global with no entry of its own keeps the decline
    return !unboundPureGlobal(receiverNode.name, receiverNode)
      || !!instanceSynthReceiverPure(receiverNode, { adapter, scope, path, resolvePure });
  }
  // A caller mirror can already carry pure imports. Those stable bindings are as safe
  // to repeat inside its literal as constants, without admitting arbitrary raw globals.
  if (isConstantLiteralNode(receiverNode, name => !!pureImportSourceEntry(
    adapter.getBinding({ scope, name, path })?.importSource,
  ), running)) return true;
  // a SELECTING receiver (`nul || arr`, `cond ? a : b`) hands the destructure one of its parts, so it
  // is admissible exactly when EVERY part is - the same question asked of each. a raw global inside
  // still bails (`cond ? Array.prototype : arr`), a re-referenceable pair still passes, and the
  // INSTANCE render spells the selection whole because the arm is chosen at runtime
  if (receiverNode.type === 'LogicalExpression' || receiverNode.type === 'ConditionalExpression') {
    const parts = receiverNode.type === 'LogicalExpression'
      ? [receiverNode.left, receiverNode.right]
      : [receiverNode.test, receiverNode.consequent, receiverNode.alternate];
    // the parts are peeled the way every other receiver question peels: one parser keeps the source
    // parens as nodes and the other strips them, and an unpeeled arm answered no on that alone
    return parts.every(part => paramDefaultInstanceSynthAllowed({
      objectPatternNode, receiverNode: unwrapRuntimeExpr(part), scope, adapter, path, resolvePure, whole: false,
    }));
  }
  // ... and an INVOCATION is read exactly once by the ONE slot that spells it - the flat twin's
  // `_atMaybeArray(f())` one level down, where the default fires; a second slot would run it twice.
  // so is a literal whose evaluation runs code (`[eff()]`)
  if (instanceSynthSpellsReceiver(receiverNode)) return objectPatternNode.properties.length === 1;
  if (receiverNode.type !== 'MemberExpression' && receiverNode.type !== 'OptionalMemberExpression') return false;
  if (instanceSynthReceiverPure(receiverNode, { adapter, scope, path, resolvePure })) return true;
  if (mayHaveSideEffects(receiverNode)) return false;
  let root = receiverNode;
  while (root?.type === 'MemberExpression' || root?.type === 'OptionalMemberExpression') root = running(root.object);
  // a chain over a re-eval-inert literal root (plain keys below) is read once per key the mirror
  // spells, and every read answers the same value - several instance keys may share it
  const inertRoot = (root?.type === 'ArrayExpression' || root?.type === 'ObjectExpression')
    && isConstantLiteralNode(root, (name, read) => unboundPureGlobal(name, read) && !POSSIBLE_GLOBAL_OBJECTS.has(name), running);
  // ... and so is a built-in surface nav (`Array.prototype`): a re-read observes nothing
  if (objectPatternNode.properties.length !== 1 && !inertRoot
    && !isReReadableSurfaceNav(receiverNode, null, { ctx: { scope, adapter, path } })) return false;
  // walk the chain: literal / plain keys only, Identifier / this root, root not a rewritable global.
  // an OPTIONAL link bails: `host?.x` may be `undefined` at runtime - native then THROWS destructuring
  // it, while the synth literal is always defined (and hands `undefined` to the helper) - a throw-
  // semantics divergence the always-wins contract cannot cover (ambiguous receiver bails to native)
  let cur = receiverNode;
  while (cur.type === 'MemberExpression' || cur.type === 'OptionalMemberExpression') {
    if (cur.type === 'OptionalMemberExpression' || cur.optional) return false;
    // a literal key - a string, or the numeric index a literal root is read at
    if (cur.computed && !adapter.isStringLiteral(running(cur.property)) && (!inertRoot || memberKeyName(cur) === null)) return false;
    cur = running(cur.object);
  }
  if (cur.type === 'ThisExpression' || inertRoot) return true;
  return cur.type === 'Identifier' && !unboundPureGlobal(cur.name, cur);
}

// refine an instance entry by TYPING its receiver: the incoming result resolved off the typeless meta
// (a generic receiver-dispatching helper, `_at`); the receiver's type narrows it to the receiver-
// specific variant (`_atMaybeArray`). pure-only by construction (detection stays untyped so
// usage-global keeps its sound over-inject); a failed typing keeps the generic (still correct).
// asked wherever a claim is served with no receiver NAME on its meta - a param default, and the
// per-prop route at large, where the second leg has always refined and this one did not
export function refineInstanceEntryByReceiver({ pureResult, key, receiverPath, resolveNodeType, toHint, resolvePure, path }) {
  // no receiver PATH (a node-only caller) -> no typing; the generic dispatcher stays correct
  const hint = receiverPath ? toHint?.(resolveNodeType?.(receiverPath)) : null;
  const refined = hint ? resolvePure({ kind: 'property', object: hint, key, placement: 'prototype' }, path) : null;
  return refined?.kind === 'instance' ? refined : pureResult;
}

const REFERENCEABLE_LITERAL_TYPES = new Set([
  ...PRIMITIVE_LITERAL_TYPES,
  'ArrayExpression',
  'ObjectExpression',
]);

// a receiver SAFE TO REFERENCE TWICE: the residual destructure reads it, and the extracted instance
// polyfill `_m(recv)` reads it again. a bare Identifier / `this` is safe; so is a re-eval-inert literal
// value (array / object / primitive with no nested call, spread, member read, or getter / setter) -
// re-evaluating yields a fresh value of the SAME TYPE, so `_m`'s native-vs-polyfill pick is identical.
// a member / call receiver, or a literal nesting one anywhere in an evaluated position, must NOT be
// re-referenced (a getter / Proxy trap would re-fire on the copy), so they bail. a CONSTANT
// (no-interpolation) template is a string constant, so it parallels a StringLiteral - but an interpolated
// `` `${x}` `` bails (re-evaluating would re-run x's string coercion, a possible effect)
export function isReReferenceableReceiver(node) {
  if (!node) return false;
  if (node.type === 'Identifier' || node.type === 'ThisExpression') return true;
  if (node.type === 'TemplateLiteral') return node.expressions.length === 0;
  // `reEvaluationObservable` (not `mayHaveSideEffects`): the receiver is EMITTED TWICE, so a
  // member read or accessor definition anywhere in the literal - pure on a single eval - would
  // re-fire a getter / Proxy trap on the copy (`[holder.p]`, `[Set.length + 1]`, `{ get p() {} }`)
  return REFERENCEABLE_LITERAL_TYPES.has(node.type) && !reEvaluationObservable(node);
}

// ... and the same question where a USER GETTER may run between the reads - the several readers of one
// pattern, each dispatch reading a property off the receiver: a NAME is spelled again there only where
// no function can rebind it, since a getter writing it hands every later reader another object than the
// one the source read once (`get at() { arr = other }`) - retained captures keep the user's getter
// order. A binding written only in its own frame is out of every getter's reach. Free names
// follow ordinary identifier reuse; a source-visible global write still needs a capture.
export function isReReferenceableAcrossReads(node, ctx) {
  if (!isReReferenceableReceiver(node)) return false;
  if (node.type !== 'Identifier') return true;
  return isReusableReceiver(node, { interveningEffects: true, ctx });
}

// a side-effect-free MEMBER receiver (`Array.prototype`, `holder.p`): reading it carries no
// call/assignment effect, but a getter would re-fire on a SECOND read - so it can never be
// re-referenced, only MEMOIZED (`_ref = holder.p` read once, both the residual and the
// extraction read `_ref`). drives the memoize arm of the side-effect-key plan. a `?.` member is one
// in either dialect: ESTree wraps it in a chain marker where babel spells it a type of its own
export function isSeFreeMemberReceiver(node) {
  return isMemberAccessNode(node?.type === 'ChainExpression' ? node.expression : node) && !mayHaveSideEffects(node);
}

// a nav a SECOND read may spell: every hop names a BUILT-IN surface - a global proxy, a
// constructor-shaped name or `prototype` - which is what the polyfill already models as stable and
// re-spells freely (`globalThis.Array.prototype` stands in the residual and in the dispatch beside
// it). a USER key may be a getter, so a caller that keeps the source's own read next to its own can
// never re-spell one (`recvF.codes` fired twice where the source reads it once, and so would
// `globalThis.navigator`); such a caller has only the MEMO route `isSeFreeMemberReceiver` names
// `allowOptionalHops` answers the same question about a nav the source wrote with `?.`: the hop
// short-circuits the WHOLE chain, so both a residual and a re-spelling read the same value - what
// the flag must never do is let a caller dispatch on a nav it did not otherwise accept.
// a caller holding a real ROOT brings its `ctx` (and its leg's `isOwnAlias`), and then the root is
// asked too: the hop names say what a surface LOOKS like, and a capitalised key off the user's own
// object is that object's key (`{ Data: { at } } = box`), a user nav its own type resolves - so is
// one off the realm under an unknown global name (`globalThis.Data`), or the `this` a function
// binds (`const { Data: { at } } = this` in a method). without a ctx
// the answer is the hops' alone, for a caller asking about a pattern's hop names
export function isBuiltInSurfaceNav(node, options = undefined) {
  let cur = unwrapRuntimeExpr(node);
  let hops = 0;
  let realmKey = null;
  while ((cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression')
    && !cur.computed && cur.property?.type === 'Identifier'
    && (cur.property.name === 'prototype' || POSSIBLE_GLOBAL_OBJECTS.has(cur.property.name)
      || CAPITALISED_IDENT.test(cur.property.name))) {
    // an OPTIONAL hop ends the walk unless the caller says it reads the same value twice: the root
    // check below then fails on the member it stopped at, which is the answer this always gave
    if (cur.optional && !options?.allowOptionalHops) break;
    hops++;
    if (!POSSIBLE_GLOBAL_OBJECTS.has(cur.property.name)) realmKey = cur.property.name;
    cur = unwrapRuntimeExpr(cur.object);
  }
  if (!hops) return false;
  if (!options?.ctx) return cur?.type === 'Identifier' || cur?.type === 'ThisExpression';
  const rootName = builtInNamespaceRoot(cur, { isOwnAlias: options.isOwnAlias, ctx: options.ctx });
  return rootName !== null && (!POSSIBLE_GLOBAL_OBJECTS.has(rootName) || realmKey === null
    || isKnownStaticGlobal(realmKey, options.ctx.adapter));
}

// the global a nav's ROOT names where it is the built-in namespace itself, else null: the alias this
// plugin minted in place (`globalThis` -> `_globalThis`) - the INJECTOR is what knows it, and that is
// per-leg state, so the caller brings the lookup - a known global the source spells, or a binding
// proven to hold one. Top-level this names the same namespace through the proxy canon.
// `true` stands for a minted alias whose global the canon cannot name
function builtInNamespaceRoot(root, { isOwnAlias = null, ctx = null, ownAliasRoot = false } = {}) {
  if (root?.type === 'ThisExpression') return ownAliasRoot ? null : proxyGlobalRootName({ node: root, ...ctx });
  if (root?.type !== 'Identifier') return null;
  const adapter = ctx?.adapter;
  if (isOwnAlias?.(root.name)) return (adapter ? resolveObjectName({ objectNode: root, ...ctx }) : null) || true;
  if (ownAliasRoot) return null;
  if (!adapter?.hasBinding?.({ scope: ctx.scope, name: root.name, path: ctx.path })) return isKnownGlobalName(root.name) ? root.name : null;
  // a BOUND root holds the namespace by its value whatever it is called (a user alias of the realm,
  // a relocated loop head's minted name) - but only a binding nothing writes again: a write between
  // the source's read and the re-read (a computed key's effect, a closure) leaves another object there
  if (isReassignedBeyondDeclarator(adapter.getBinding?.({ scope: ctx.scope, name: root.name, path: ctx.path }) ?? {})) return null;
  const name = resolveObjectName({ objectNode: root, ...ctx });
  return isKnownGlobalName(name ?? '') ? name : null;
}

// ... and the SECOND-READ form of the same question: a nav re-spelled BESIDE a surviving residual
// must be rooted in the built-in namespace itself and read slots the file never writes. a capitalised
// hop off a USER object is a user key, and re-reading it fires that object's getter twice
// (`({ Array: { prototype: { flat: m } } } = src)` fired `src`'s `Array` getter twice where the
// source reads it once); a user global and a replaced or redefined realm slot are the same getter.
// `opts.ownAliasRoot` admits the minted alias alone: a caller copying the nav verbatim cannot carry
// the substitution a raw root owes
export function isReReadableSurfaceNav(node, isOwnAlias = null, opts = undefined) {
  if (!isBuiltInSurfaceNav(node, { allowOptionalHops: opts?.allowOptionalHops })) return false;
  const keys = [];
  let cur = unwrapRuntimeExpr(node);
  while (cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression') {
    keys.unshift(cur.property.name);
    cur = unwrapRuntimeExpr(cur.object);
  }
  const ctx = opts?.ctx;
  const adapter = ctx?.adapter;
  const rootName = builtInNamespaceRoot(cur, { isOwnAlias, ctx, ownAliasRoot: opts?.ownAliasRoot });
  if (rootName === null) return false;
  // the census below needs the global a minted alias stands for, and one the canon cannot name has
  // no slot to ask about
  if (rootName === true) return true;
  // a slot the file writes on the way (`globalThis.Array = shim`, a `defineProperty` getter) holds
  // whatever the user put there, and the census is what knows it. a key read off the realm names a
  // built-in only under a known name: any other capitalised slot is a user global, the getter above
  let object = rootName;
  for (const key of keys) {
    if (adapter?.isMutatedStatic?.(object, key)) return false;
    if (POSSIBLE_GLOBAL_OBJECTS.has(object) && !isKnownStaticGlobal(key, adapter)) return false;
    object = POSSIBLE_GLOBAL_OBJECTS.has(object) ? key : `${ object }.${ key }`;
  }
  return true;
}

// ... and the nested INSTANCE surface is that nav ending at `prototype`: the last hop is what makes
// a leaf an instance claim on a REAL surface (`globalThis.Array.prototype`) instead of a name match
// on whatever object the chain happens to reach (`globalThis.Array.keys`, kept native by both legs)
export function isInstanceSurfaceNav(node, opts = undefined) {
  return (node?.type === 'MemberExpression' || node?.type === 'OptionalMemberExpression')
    && !node.computed && node.property?.type === 'Identifier' && node.property.name === 'prototype'
    && isBuiltInSurfaceNav(node, opts);
}

// the two AST flavors of an object-pattern property - the walk below climbs through either
const PATTERN_PROP_TYPES = new Set(['ObjectProperty', 'Property']);

// ONE climb, three questions. the levels from the consumed prop up to its host, each with what it
// KEEPS - a surviving sibling, a rest - and whether the climb reached the assignment at all. the
// SOLE-element array wrapper is the one transparent step between levels: a wrapper with siblings has
// no way to drop, so the climb ends there like at any other non-hop parent. a DECLARATOR ends it as
// a host too (`host`), for the nav question alone - the prune and the host drop are the assignment's
function consumedAssignmentSlotLevels(propPath) {
  const levels = [];
  let pattern = propPath.parentPath;
  for (;;) {
    if (pattern?.node?.type !== 'ObjectPattern') return { levels, reachesAssignment: false, host: null };
    let parent = pattern.parentPath;
    let below = pattern.node;
    while (parent?.node?.type === 'ArrayPattern'
      && parent.node.elements.length === 1 && parent.node.elements[0] === below) {
      below = parent.node;
      parent = parent.parentPath;
    }
    const assignmentRoot = parent?.node?.type === 'AssignmentExpression' && parent.node.left === below;
    const root = assignmentRoot || (parent?.node?.type === 'VariableDeclarator' && parent.node.id === below);
    levels.push({ props: pattern.node.properties.length, hasRest: pattern.node.properties.some(isRestProperty), root });
    if (root) return { levels, reachesAssignment: assignmentRoot, host: parent };
    if (!PATTERN_PROP_TYPES.has(parent?.node?.type)) return { levels, reachesAssignment: false, host: null };
    pattern = parent.parentPath;
  }
}

// does the slot's own KEY keep it in the residual? a computed key is the one part of the pattern a
// dispatch never re-spells, so its slot runs the key where evaluating it has an effect; beside a rest
// the slot stays named (rest gathers what the pattern did not name)
function consumedSlotKeepsKey(propPath, ctx) {
  return !!propPath.node.computed
    && (computedKeyHasSideEffects(propPath.node, ctx) || propPath.parentPath.node.properties.some(isRestProperty));
}

// the slot an assignment-host OVERWRITE consumes can leave the residual behind: the dispatch re-spells
// what the raw pattern read, so the prop drops, every hop pattern it empties drops with it, and an
// emptied TOP takes the statement. asked BEFORE the dispatch renders, since a pruned slot never runs
// the source default. a level that KEEPS something ends the climb prunable - the prop drops and the
// residual keeps its shape - and so does reaching the assignment. a COMPUTED key keeps its slot
// where evaluating it has an effect: the dispatch never re-spells the key, so only the slot can run
// it. an effect-free key (a folded `[K]`, `[Symbol.iterator]`) drops like a plain one, the key canon
// the flat hosts consume by; the binding a folded key reads is taken as initialized there too, so a
// read deferred into a function called in its TDZ loses the throw. beside a rest the slot stays named
// (rest gathers what the pattern did not name), and a named slot keeps its own key
export function consumedAssignmentSlotPrunes(propPath, ctx = null) {
  if (propPath?.parentPath?.node?.type !== 'ObjectPattern' || consumedSlotKeepsKey(propPath, ctx)) return false;
  const { levels, reachesAssignment } = consumedAssignmentSlotLevels(propPath);
  return levels.some(level => level.props > 1 || level.hasRest) || reachesAssignment;
}

// ... and the sharper question the RECEIVER gate asks: does the residual stop reading the NAV
// altogether, so the dispatch is its only reader? every hop the nav spells has to drop with the slot -
// a hop kept alive by a surviving sibling (`{ y: { flat: m, other } }`) or renamed under a rest leaves
// the residual reading it beside the dispatch. only the ROOT pattern may keep siblings, and only over
// a host value a second read cannot disturb: the residual still evaluates it, and the dispatch spells
// it again (`({ prototype: { at }, from } = _globalThis.Array)` reads a redefined `Array` twice).
// the declarator host asks the same question of its init; `isOwnAlias` / `ctx` are the re-read
// predicate's own inputs
export function consumedAssignmentSlotDropsNav(propPath, isOwnAlias = null, ctx = null) {
  return propPath?.parentPath?.node?.type === 'ObjectPattern' && !consumedSlotKeepsKey(propPath, ctx)
    && slotHopsDropNav(propPath, isOwnAlias, ctx);
}

// ... its hop half: every level above the slot drops with it, a root level keeping siblings only over
// a host value a second read cannot disturb
function slotHopsDropNav(propPath, isOwnAlias, ctx) {
  const { levels, host } = consumedAssignmentSlotLevels(propPath);
  if (!host || levels.some(level => level.hasRest || (!level.root && level.props !== 1))) return false;
  if (levels.at(-1).props === 1) return true;
  const hostValue = unwrapRuntimeExpr(host.node.type === 'AssignmentExpression' ? host.node.right : host.node.init);
  return isReReferenceableReceiver(hostValue) || isReReadableSurfaceNav(hostValue, isOwnAlias, { ctx });
}

// the one question every route that SPELLS a nested nav beside the source's own reads asks: may it read
// that nav again? either nothing else reads it - the claim's slot takes every hop of an instance
// surface nav with it, a surface its ROOT names too: off the user's own object the residual's reads
// run ahead of the dispatch, out of the order a getter there observes (`({ Data: { prototype: { at
// } }, o } = src)`) - or a second read cannot disturb it. a receiver that is no such nav (a literal
// slot the residual still evaluates) has only the second answer. `isOwnAlias` is the caller's lookup
// of the aliases it minted. a SYMBOL leaf (`symbolLeaf`) dispatches on whatever object the nav reaches,
// prototype or not, and its dispatch performs the read its key names however the key spells the
// symbol: there the hops dropping with the slot are the whole first answer
export function dispatchMayReadNav(leafPath, nav, {
  isOwnAlias = null, adapter = null, allowOptionalHops = false, symbolLeaf = false,
} = {}) {
  const ctx = { scope: leafPath.scope, adapter, path: leafPath };
  return (symbolLeaf ? leafPath?.parentPath?.node?.type === 'ObjectPattern' && slotHopsDropNav(leafPath, isOwnAlias, ctx)
    : isInstanceSurfaceNav(nav, { allowOptionalHops, ctx, isOwnAlias }) && consumedAssignmentSlotDropsNav(leafPath, isOwnAlias, ctx))
    || isReReadableSurfaceNav(nav, isOwnAlias, { ctx, allowOptionalHops });
}

// ... and the last of the three: does the HOST die with the slot? every level up to the assignment
// has to be sole and rest-free, the root included - a surviving sibling keeps the statement, and with
// it the block an unbraced control slot then needs to hold both it and the dispatch
export function consumedAssignmentSlotDropsHost(propPath) {
  if (!consumedAssignmentSlotDropsNav(propPath)) return false;
  return consumedAssignmentSlotLevels(propPath).levels.every(level => level.props === 1);
}

// the MEMBER target a NESTED instance claim's overwrite writes in place of a binding: one the extraction
// canon admits (`memberTargetTakesExtraction`), where the host leaves with the slot - the overwrite is
// then the statement's one write, so the setter runs once and in order. null for any other slot - a
// computed link included even as the sole chain: the overwrite reads the receiver after the target, so the
// link's key would run ahead of the hop reads the source performs before it
export function overwriteMemberTarget(propPath, ctx) {
  const host = destructurePatternHostPath(propPath);
  if (host?.node?.type !== 'AssignmentExpression' || host.node.left === propPath.parentPath?.node) return null;
  return consumedAssignmentSlotPrunes(propPath, ctx) && consumedAssignmentSlotDropsHost(propPath)
    ? memberTargetTakesExtraction(propPath.node.value) : null;
}

// a side-effect-free BRANCHING receiver (`cond ? [7, 8] : []`, `a || b`, `x ?? y`): like an SE-free
// member it carries no call/assignment effect, but its value is not stable across reads (branch
// re-selection, operand getters), so it can never be re-referenced - only MEMOIZED (`_ref` read
// once). instance extraction off it stays value-correct on every branch via the Maybe-dispatch
// helpers - the same dispatch that makes a plain union receiver sound
export function isSeFreeBranchingReceiver(node) {
  return !!node && (node.type === 'ConditionalExpression' || node.type === 'LogicalExpression')
    && !mayHaveSideEffects(node);
}

// a literal nesting a member READ in an evaluated position (`[holder.p]`, `[Set.length + 1]`):
// a single evaluation is pure, but emitting a COPY would re-evaluate the read and re-fire its
// getter / Proxy trap - single-read only, exactly like an SE-free member
function isSeFreeRereadLiteral(node) {
  return !!node && REFERENCEABLE_LITERAL_TYPES.has(node.type)
    && !mayHaveSideEffects(node) && reEvaluationObservable(node);
}

// A literal tree without reads or effects: primitive values, constant templates and nested
// arrays/objects, excluding holes, spreads, computed keys, getters and methods. Hoisting
// uses this binding-free default; receiver mirrors may additionally admit scoped stable names,
// and read each part as the operand of it that runs (`running`)
function isConstantLiteralNode(node, isStableName = null, running = null) {
  if (node && running) node = running(node);
  if (node?.type === 'Identifier') return !!isStableName?.(node.name, node);
  if (!node) return false;
  if (PRIMITIVE_LITERAL_TYPES.has(node.type)) return true;
  switch (node.type) {
    case 'TemplateLiteral': return node.expressions.length === 0;
    case 'UnaryExpression':
      return (node.operator === '-' || node.operator === '+') && isConstantLiteralNode(node.argument, isStableName, running);
    case 'ArrayExpression':
      return node.elements.every(el => el !== null && el.type !== 'SpreadElement' && isConstantLiteralNode(el, isStableName, running));
    case 'ObjectExpression':
      return node.properties.every(p => (p.type === 'ObjectProperty' || p.type === 'Property')
        && !p.computed && !p.method && p.kind !== 'get' && p.kind !== 'set' && isConstantLiteralNode(p.value, isStableName, running));
    default: return false;
  }
}

// gate for `memoizeReceiver`: a structurally-extensible literal (array / object) whose every nested value is
// also constant. only these can grow large enough that re-emitting beside the residual bloats the output; a
// primitive receiver is atomic, so re-referencing it is never worth a `_ref` binding
export function isConstantLiteralReceiver(node) {
  return !!node && (node.type === 'ArrayExpression' || node.type === 'ObjectExpression') && isConstantLiteralNode(node);
}

// the STATIC a hop names off a constructor, as the pure entry spells it - null where the key is no
// static of it, or an instance member. one resolver for every route spelling such a hop, on either
// leg: `resolvePure` is the leg's own entry resolver, bound to the claim's path where it takes one
export function staticHopPure({ ctorName, key, resolvePure }) {
  const pure = resolvePure({ kind: 'property', object: ctorName, key, placement: 'static' });
  return pure && pure.kind !== 'instance' ? pure : null;
}

// ... and the INSTANCE dispatch a hop off a constructor takes where the key is a member of the
// constructor's own value (a function's `name`): the member route reads `Map.name` as
// `_nameMaybeFunction(_Map)`, so a slot a synth literal re-reads off the constructor - re-emitted where
// no visitor reaches it again - spells that dispatch, not a raw read the engine may not answer
export function instanceHopDispatch({ ctorName, key, resolvePure }) {
  if (typeof key != 'string' || !isStaticPlacement(ctorName)) return null;
  const pure = resolvePure({
    kind: 'property', object: ctorName, key, placement: 'static', receiverHint: staticReceiverHint('static', ctorName),
  });
  return pure?.kind === 'instance' ? pure : null;
}

// the ROOT a computed init hands the walk, and the keys it reads through. a call, a `new`, `this`
// or a member chain off the user's own object is the value the source computes once - no other
// walk reads through it, so it is the root as written. a nav INTO the built-in namespace is one
// more run of hops: it unfolds onto its own identifier root (`{ of: { name } } = globalThis.Array`
// walks as `{ Array: { of: { name } } } = globalThis`), unless the whole nav still names a built-in
// surface (`globalThis.Array.prototype`), which is the flatten's shape and stays with it. a literal
// is the pairing walk's, which reads through it to the element - null here. which chain enters the
// namespace is asked of its ROOT too where the caller brings a `ctx`: a capitalised key off the
// user's own object (`(log.push(1), src).Data`, `wrap.Box.Data`) is that object's key
function unfoldNestedRoot(root, keys, ctx = null) {
  const surfaceOptions = ctx ? { ctx } : undefined;
  // A prefix or decided selection keeps its source spelling for one evaluation. Only user
  // navigation belongs here; built-in surfaces keep their existing prefix channels.
  if (root.type === 'SequenceExpression') {
    const tail = ctx?.adapter ? decidedRunningValue(root, ctx) : unwrapRuntimeExpr(root.expressions.at(-1));
    const userValue = tail?.type === 'Identifier' || tail?.type === 'ThisExpression'
      || tail?.type === 'CallExpression' || tail?.type === 'NewExpression';
    return userValue && !isBuiltInSurfaceNav(keys.reduce(memberFromKeyName, tail), surfaceOptions) ? { root, keys } : null;
  }
  // An opaque selection is read once too; known global hops retain their namespace routes.
  if (root.type === 'ConditionalExpression' || root.type === 'LogicalExpression') {
    return isKnownStaticGlobal(keys[0], ctx?.adapter) ? null : { root, keys };
  }
  if (root.type === 'CallExpression' || root.type === 'NewExpression' || root.type === 'ThisExpression') return { root, keys };
  // An optional user root remains whole: the following pattern read seals its short-circuit.
  if (!isMemberAccessNode(root)) return null;
  if (!isBuiltInSurfaceNav(root, surfaceOptions)) return { root, keys };
  if (root.optional) return null;
  if (isBuiltInSurfaceNav(keys.reduce(memberFromKeyName, root), surfaceOptions)) return null;
  const navKeys = [];
  let cur = root;
  while (cur?.type === 'MemberExpression' && !cur.computed && !cur.optional && cur.property?.type === 'Identifier') {
    navKeys.unshift(cur.property.name);
    cur = cur.object;
  }
  return cur?.type === 'Identifier' ? { root: cur, keys: [...navKeys, ...keys] } : null;
}

// a call ROOT the inline canon proves to yield a proxy global, running no observable effect on the
// way (`const g = () => globalThis; ... = g()`), IS that global for the walks below: they read
// through it as through the spelled name, and the fold drops the call with the navigation - the
// member-chain canon's own answer (`g()?.window?.Array.of` proves the same root). the callee's
// return must spell a PROXY GLOBAL by name: an alias it holds lives in the callee's scope, which the
// site may not see - spelled as written, or already as the binding this plugin minted for it
// (`_globalThis`, whose hint names the global). null for every other call, which stays the
// opaque root it always was
// `allowEffects`: a caller that KEEPS the call (a whole-init memo runs it once where the source did)
// asks only what it returns; the default answers for a caller that drops it, which an effect forbids
export function provenRealmCallRoot(node, leafPath, adapter, { allowEffects = false } = {}) {
  return adapter ? provenRealmCall(node, { scope: leafPath.scope, adapter, path: leafPath }, { allowEffects }) : null;
}

// ... the same question asked with a bare context, for the discard channel below; the NODE form of
// the name the canon answers, and only where that name is a proxy global this walk may spell
function provenRealmCall(node, ctx, options = {}) {
  const name = provenRealmCallName(node, ctx, options);
  return name && POSSIBLE_GLOBAL_OBJECTS.has(name) ? identifier(name) : null;
}

// the ONE answer to "what proxy global does this call provably yield": the inline canon walks the
// callee to its return, the effect canon says whether the call may be dropped, and the root's name is
// read as written, through the binding this plugin minted for it (`_globalThis`, whose hint names
// the global), or through the object resolver for an alias. `rejectConditional` refuses a conditional
// return (the member-chain fold's own strictness); `definedBy` is a pure resolver the call's VALUE
// must be defined under (`callValueCanBeUndefined`, the same fold's question). null for every
// other call - a spelled root the callers keep as the opaque root it always was
export function provenRealmCallName(node, { scope, adapter, path },
  { allowEffects = false, rejectConditional = false, definedBy = null } = {}) {
  const ctx = { scope, adapter, path };
  // an `await` costs a TICK, and a tick is observable: the awaited spelling answers only where the
  // caller accepts effects, so it rides AHEAD of the value instead of being dropped with it
  if (node?.type === 'AwaitExpression' && !allowEffects) return null;
  const call = realmYieldingCallView(node, ctx);
  if (!call) return null;
  const root = inlineCallProxyGlobalRoot({ callNode: call, ...ctx, rejectConditional });
  if (!root || (definedBy && callValueCanBeUndefined(call, ctx, definedBy))
    || (!allowEffects && inlineCallHasObservableEffects({ callNode: call, ...ctx }))) return null;
  if (POSSIBLE_GLOBAL_OBJECTS.has(root.name)) return root.name;
  const hint = adapter.getBinding?.({ scope, name: root.name, path })?.polyfillHint;
  return typeof hint === 'string' && POSSIBLE_GLOBAL_OBJECTS.has(hint) ? hint
    : resolveObjectName({ objectNode: root, ...ctx, usageNode: root });
}

// the FACTS of a nested leaf's receiver as a MEMBER CHAIN: the root
// identifier the declarator init spells plus the plain hop keys the pattern descends
// (`{ inner: { [S]: it } } = obj` -> { root: obj, keys: ['inner'] }). where
// `resolveNestedReceiverNode` descends LITERAL inits to a node, this walk answers for the
// identifier-init twin - the consumer renders `root.key...` and reads it once, exactly what
// native destructuring reads. plain hops only: a hop key that EVALUATES something or an inner
// default changes reachability; a BOUND computed key folds to the slot it names through the
// consuming canon when the caller hands over its `adapter`. the BASE that chain reads through -
// proxy-root substitution, mutation gating - is `resolveNestedReceiverBase`'s answer; each leg
// renders it in its own dialect
// `siblingLevels`: a level ABOVE the leaf may keep siblings beside the hop (no rest): the caller
// splits the hop out of that level into a twin of its own, and the level goes on reading the root
// for its siblings - sound only for a root proved reusable across those reads, or one the caller
// captures (`rootMemoized`). the answer carries
// `climbed`, leaf-first: every pattern level the walk climbed with the prop that holds the way down
// `allowAssignmentHost` is for read-only ownership preflight: an assignment carries the same
// receiver facts, but its extraction must still use its own binding/return-value machinery.
// eslint-disable-next-line max-statements -- the walk: one arm per pattern level it may stand in
export function resolveNestedReceiverChain(leafPath, {
  soleSlots = false,
  allowSlotDefault = false,
  allowLeafSiblings = false,
  rootMemoized = false,
  adapter = null,
  siblingLevels = false,
  allowAssignmentHost = false,
  allowInlineSpread = false,
} = {}) {
  const keys = [];
  const climbed = [];
  let slotDefault = null;
  const leafPattern = leafPath.parentPath;
  let pattern = leafPattern;
  while (pattern?.node?.type === 'ObjectPattern') {
    let owner = pattern.parentPath;
    // a DEFAULT on the way up decides what the claim reads at all: the slot's own value when it is
    // defined, the default when it is not. the caller that asks for it folds BOTH arms through the
    // instance guard (`_at((_ref = src.y) === void 0 ? D : _ref)`) - mirroring the default alone
    // would polyfill the arm that may never run and leave the live read raw. one default per walk:
    // a second would need its own guard around the first, which no caller renders - and only the
    // LEAF's own slot: the guard wraps the whole nav, so a default on a level above it would stand in
    // for the deepest slot and the nav would read through a level the default never filled
    if (owner?.node?.type === 'AssignmentPattern' && owner.node.left === pattern.node) {
      if (!allowSlotDefault || slotDefault || pattern !== leafPattern) return null;
      slotDefault = owner.node.right;
      owner = owner.parentPath;
    }
    const ownerType = owner?.node?.type;
    // a caller dispatching on a USER-owned nav asks for `soleSlots`: re-reading `src.y` is a
    // second getter call, so the extraction is sound only when it OWNS that read - every level
    // it descends must die with it, leaving no residual to spell the same hops again. a
    // built-in surface nav needs none of this: re-reading a known namespace costs nothing.
    // the HOST level is exempt: its siblings name OTHER keys, and the hop this claim empties prunes
    // out of the residual on both legs, so nothing there reads the hop a second time
    // ... and the LEAF's own pattern may keep siblings for the caller that NORMALIZES the shape:
    // it rewrites the declarator into its flat twin (`{ y: { at, other } } = box` -> `{ at, other }
    // = box.y`), where the ordinary memo channel reads the hop once and hands the residual that
    // same identity. every level ABOVE the leaf still has to die with the claim
    // ... and an array WRAPPER standing between that host and its declarator changes nothing about
    // it: the element is still the value the pattern reads, and the emptied hop still prunes.
    // a REST sibling is what takes the exemption back: rest gathers whatever the pattern did not
    // name, so the emptied hop cannot leave - it stays as a sentinel keeping its key excluded, and
    // that sentinel READS the hop a second time, which for a getter is a second call
    if (soleSlots && pattern.node.properties.length !== 1
      && !(allowLeafSiblings && pattern === leafPattern)
      && ((ownerType !== 'VariableDeclarator' && ownerType !== 'ArrayPattern'
        && !(allowAssignmentHost && ownerType === 'AssignmentExpression')
        // ... a level ABOVE the leaf only: the leaf's own siblings are `allowLeafSiblings`' question
        && !(siblingLevels && pattern !== leafPattern && (ownerType === 'ObjectProperty' || ownerType === 'Property')))
        || pattern.node.properties.some(isRestProperty))) return null;
    if (ownerType === 'ObjectProperty' || ownerType === 'Property') {
      const key = consumableHopSlotName(owner.node, adapter ? { scope: owner.scope ?? leafPattern.scope, adapter, path: owner } : null);
      if (typeof key !== 'string' || !isValidIdentifierName(key)) return null;
      keys.unshift(key);
      climbed.push({ pattern: pattern.node, prop: owner.node });
      pattern = owner.parentPath;
      continue;
    }
    if ((ownerType === 'VariableDeclarator' && owner.node.id === pattern.node)
      || (allowAssignmentHost && ownerType === 'AssignmentExpression'
        && owner.node.operator === '=' && owner.node.left === pattern.node)) {
      if (!keys.length) return null;
      // the extraction DISCARDS the init, so a wrapper that carries an effect (a sequence
      // prefix, a chain assignment) must keep the walk out - only pure wrappers peel - unless the
      // init is then the root WHOLE: an opaque root below, spelled by a sole reader that performs
      // the prefix where the source does (`{ y: { at } } = (n++, box)` reads `(n++, box).y`)
      const prefixes = [];
      const init = destructureReceiverNode(owner, null, adapter?.isMutatedStaticSlot ?? adapter?.isMutatedStatic);
      const rawRoot = adapter
        ? decidedRunningValue(init, { scope: leafPath.scope, adapter, path: leafPath }, prefixes)
        : unwrapCollectingSePrefixes(init, prefixes);
      if (!rawRoot) return null;
      // ... a DECLARATOR's init only, and not a loop head's: an assignment and a head keep their own
      // prefix channels (the lift, the header sink)
      // ... nor under a DEFAULT, whose guard both legs place around a prefix differently; nor off a
      // call the realm canon owns
      const headOf = owner.parentPath?.parentPath?.node;
      if (prefixes.length && (ownerType !== 'VariableDeclarator' || slotDefault
        || (headOf?.type === 'ForStatement' && headOf.init === owner.parentPath.node)
        || provenRealmCallRoot(rawRoot, leafPath, adapter, { allowEffects: true }))) return null;
      // a call the inline canon proves to yield a proxy global reads as that global (its spelling too)
      const root = prefixes.length ? unwrapRuntimeExpr(init) : provenRealmCallRoot(rawRoot, leafPath, adapter) ?? rawRoot;
      // A reusable identifier lets a host-level sibling keep its own read beside the extraction.
      // A root the source COMPUTES - a call, a `new`, a member
      // off the user's own object - it evaluates exactly once, so the extraction may spell it only
      // where it is the root's ONLY reader: the host level sole, the declarator dying whole with the
      // claim (`{ data: { at } } = mk()` reads `mk().data` once, as the source does). and only such
      // an OPAQUE root: a literal is the pairing walk's, which reads through it to the element, and
      // a nav into the built-in namespace is the flatten's, which lands it on the ponyfill
      // ... unless the caller MEMOIZES the root: the memo is then its one evaluation, and a host
      // sibling reads the memo the way it would read an identifier (`{ data: { at }, keys } = mk()`)
      // ... and a level with SIBLINGS above the leaf reads the root again for them: a reusable
      // identifier or a nav into the built-in namespace (`_globalThis.Array`, the collapsed proxy hop)
      const siblingLevelKept = climbed.some(level => level.pattern !== leafPattern.node
        && level.pattern.properties.length > 1);
      if (!rootMemoized && root.type === 'Identifier' && pattern.node.properties.length > 1
        && !isReReferenceableAcrossReads(root, { scope: leafPath.scope, adapter, path: leafPath })) return null;
      let unfolded = null;
      if (root.type !== 'Identifier') {
        const builtInNav = isReReadableSurfaceNav(root, null, { ctx: { scope: leafPath.scope, adapter, path: leafPath } });
        if ((siblingLevelKept && !builtInNav) || !soleSlots
          || (pattern.node.properties.length !== 1 && !rootMemoized && !builtInNav)) return null;
        unfolded = unfoldNestedRoot(root, keys, adapter ? { scope: leafPath.scope, adapter, path: leafPath } : null);
        if (!unfolded) return null;
      }
      // the RAW init travels too: a caller that SPELLS this receiver keeps whatever the source
      // wrote around the identifier (a TS cast is the one that matters - `box as any` answers a
      // different type than `box`, and a spelling that drops it resolves against the wrong one)
      // the DECLARATOR travels with the answer: the walk is what proved the way up is patterns all
      // the way, and a caller re-deriving it by its own climb has no such proof - one such climb
      // walked out of an assignment inside an IIFE and handed the rename to the enclosing declaration
      // ... an unfolded nav root is its own identifier, and the keys the nav spelled join the walk's:
      // the spelling it travels with is that identifier, since the init's wrappers wrapped the NAV
      climbed.push({ pattern: pattern.node, prop: null });
      if (unfolded && unfolded.root !== root) {
        return {
          root: unfolded.root,
          keys: unfolded.keys,
          slotDefault,
          leafPattern,
          declarator: owner,
          rootSpelling: unfolded.root,
          climbed,
        };
      }
      return { root, keys, slotDefault, leafPattern, declarator: owner, rootSpelling: root === rawRoot ? init : root, climbed };
    }
    // an ARRAY WRAPPER over a literal init is a PAIRING, not a hop: the element the pattern matches
    // is the value the leaf reads through, and the element must be a bare identifier for the
    // dispatch to spell it (`[{ y: { flat: m } }] = [nb]` reads `nb.y`, exactly what the source
    // reads). a SOLE wrapper is discarded whole; one with NEIGHBOURS keeps the literal alive for
    // their coercion. The wrapper plan owns any capture the element needs before it is reused;
    // the emptied hop prop prunes out of the residual and leaves the positional `{}` behind.
    if (ownerType === 'ArrayPattern') {
      // wrappers NEST (`[[{ y: { flat } }]] = [[nb]]`), and every level asks the same pairing: the
      // pattern's slot picks the literal's element at that level. collect the slot chain up to the
      // declarator, then descend the init by the same slots - one level and five read alike, so the
      // depth is not a rule of its own
      const slots = [];
      let child = pattern;
      let level = owner;
      // wrappers NEST, and a KEY may stand between two of them (`{ pair: [{ y: { at } }] } = { pair:
      // [nb] }`): the pattern's slot picks the literal's element, its key picks the literal's property,
      // and the two steps read alike - what the descent needs is the step chain, not one kind of step
      for (let depth = 0; depth < STATIC_WALK_DEPTH && level?.node; depth++) {
        const levelType = level.node.type;
        if (levelType === 'ArrayPattern') {
          const index = level.node.elements.indexOf(child.node);
          if (index === -1) return null;
          slots.unshift({ index });
          child = level;
          level = level.parentPath;
          continue;
        }
        if ((levelType === 'ObjectProperty' || levelType === 'Property') && level.node.value === child.node) {
          const stepKey = consumableHopSlotName(level.node,
            adapter ? { scope: level.scope ?? leafPattern.scope, adapter, path: level } : null);
          if (typeof stepKey !== 'string') return null;
          slots.unshift({ key: stepKey });
          child = level.parentPath;
          level = child?.parentPath;
          continue;
        }
        break;
      }
      // the wrapper's host is the declarator, or - for the caller that allows it - the assignment
      // whose left the wrapper is; either hands the walk the literal it pairs the pattern with
      const wrapperHost = level?.node?.type === 'VariableDeclarator' && level.node.id === child.node ? level.node.init
        : allowAssignmentHost && level?.node?.type === 'AssignmentExpression' && level.node.operator === '='
          && level.node.left === child.node ? level.node.right : undefined;
      if (wrapperHost === undefined || !keys.length) return null;
      const prefixes = [];
      const levels = [];
      let literal = unwrapCollectingSePrefixes(wrapperHost, prefixes);
      for (const step of slots) {
        if (prefixes.length) return null;
        if (step.key === undefined) {
          if (literal?.type !== 'ArrayExpression') return null;
          levels.push({ node: literal, index: step.index });
          literal = unwrapCollectingSePrefixes(allowInlineSpread
            ? resolveCallArgument(
              literal.elements,
              step.index,
              adapter?.isMutatedStaticSlot ?? adapter?.isMutatedStatic,
            ) : literal.elements[step.index], prefixes);
          continue;
        }
        if (literal?.type !== 'ObjectExpression') return null;
        // a SPREAD anywhere could supply the key, so the slot the pattern reads is not this literal's
        const at = literal.properties.findIndex(item => (item.type === 'ObjectProperty' || item.type === 'Property')
          && spelledSlotName(item) === step.key);
        if (at === -1 || literal.properties.some(item => item.type === 'SpreadElement')) return null;
        // ... and a NEIGHBOUR key that carries an effect pins the order: native builds the whole
        // literal before it destructures, so a read moved to the pairing would step over that effect.
        // the array levels leave this to the per-route order questions, which spell it for the host
        // shapes they own; a KEYED level has no such route yet, so the walk itself declines
        if (literal.properties.some((item, itemAt) => itemAt !== at && mayHaveSideEffects(item.value))) return null;
        levels.push({ node: literal, key: step.key, propIndex: at });
        literal = unwrapCollectingSePrefixes(literal.properties[at].value, prefixes);
      }
      // a caller capturing the element in its wrapper owns its evaluation, including prefixes:
      // its dispatch reads the captured binding, just as the direct-declarator memo route does.
      if (!literal || (!rootMemoized && (prefixes.length || literal.type !== 'Identifier'))) return null;
      // the pairing FACTS travel too: a caller that rewrites this element into the nav needs the
      // literal and the slot, and it owes the question `wrapperElementNavPlacement` asks - the
      // consumers that only READ through the element owe none of that and ignore them.
      // `wrapper` is the INNERMOST literal (the one holding the element a caller rewrites) and
      // `wrapperRoot` the declarator's own init, which is what a caller checks it against
      climbed.push({ pattern: pattern.node, prop: null });
      return {
        root: literal,
        keys,
        slotDefault,
        leafPattern,
        declarator: level,
        rootSpelling: literal,
        wrapper: levels.at(-1).node,
        wrapperRoot: levels[0].node,
        wrapperKeyed: levels.some(item => item.key !== undefined),
        wrapperLevels: levels,
        hostPattern: pattern,
        climbed,
      };
    }
    // an inner default, an assignment host: reachability or value capture changes - outside this
    // walk's narrow contract
    return null;
  }
  return null;
}

// WHERE may the array plan read a paired element's hop? `lead`: in the element's own slot, as the
// literal builds - ahead of every later element and of the whole declaration, so nothing
// observable may stand between: no effect in another element at any wrapper level, none in a
// declarator BEFORE this one. `trail`: after the literal builds whole, where the source performs
// it - the plan captures every position in order first and reads off the captured element.
// null = no wrapper, or a trailing read the host has no room for
export function wrapperElementNavPlacement(walk) {
  if (!walk?.wrapper) return null;
  // ... the trailing reads follow the capture as statements of their own, so they need a statement
  // list: a loop HEAD hosts declarators and an unbraced slot holds one statement
  const hostSlot = walk.declarator?.parentPath?.parentPath?.node;
  const declarations = walk.declarator?.parentPath?.node?.declarations ?? [];
  const before = declarations.slice(0, declarations.indexOf(walk.declarator.node));
  // ... at EVERY wrapper level, and on BOTH sides of the slot: a neighbour standing after it in
  // an OUTER literal is evaluated after it just the same, so nesting widens what the moved read
  // would reorder past; and one standing BEFORE it is what the memo of the hop would be
  // hoisted over (`[, { y: { at, findLast } }] = [log.push("n"), nb]` read `y` ahead of `n`)
  return before.every(item => !mayHaveSideEffects(item.init))
    && walk.wrapperLevels.every(level => (level.key === undefined
      ? level.node.elements.filter((element, index) => index !== level.index)
      : level.node.properties.filter((item, index) => index !== level.propIndex).map(item => item.value))
      .every(element => !element || !mayHaveSideEffects(element)))
    ? 'lead' : statementListOf(hostSlot) ? 'trail' : null;
}

// the first PROPERTY path anywhere in a pattern - what a type query about the value the pattern
// destructures has to be asked through, since the resolver answers for a prop and not for a pattern.
// path-API-agnostic like the walks above: both emitters expose `.get` / `.node`, and the object
// property's two spellings (babel `ObjectProperty` / estree `Property`) are accepted either way.
// `accept` selects a leaf without changing the pattern or visiting expression subtrees.
// A default contributes its left pattern, never the expression evaluated on a miss.
export function firstPatternProp(patternPath, accept = null) {
  while (patternPath?.node?.type === 'AssignmentPattern') patternPath = patternPath.get('left');
  const type = patternPath?.node?.type;
  if (type === 'ObjectPattern') {
    for (const prop of patternPath.get('properties')) {
      const propType = prop.node?.type;
      if (propType !== 'Property' && propType !== 'ObjectProperty') continue;
      const valueType = prop.node.value?.type;
      const nested = valueType === 'ObjectPattern' || valueType === 'ArrayPattern' || valueType === 'AssignmentPattern'
        ? firstPatternProp(prop.get('value'), accept) : null;
      if (nested) return nested;
      if (!accept || accept(prop)) return prop;
    }
    return null;
  }
  if (type === 'ArrayPattern') {
    for (const element of patternPath.get('elements')) {
      const found = firstPatternProp(element, accept);
      if (found) return found;
    }
  }
  return null;
}

// the SHAPE a typed-nav claim resolves on: the leaf reached through the receiver's own type, over
// sole slots, and only where the hops name USER keys. `allowLeafSiblings` is for the callers weighing
// the FLAT TWIN against a mirror - the twin admits siblings at the leaf, so a question that refuses
// them there answers about a route that is not the one being weighed - a nav INTO a built-in namespace is the
// proxy / anchored machinery's shape and the rules there are its own. this is the question about the
// SOURCE, and it is the one the synth gate asks: a fold that takes both arms of a default is the
// synth's business whoever ends up rendering it
// ... a level ABOVE the leaf may keep siblings where what they re-read is a nav INTO the built-in
// namespace (`{ Array: { from, of: { name } } } = globalThis` re-reads `globalThis.Array`, free and
// unobservable); a user nav's getter would fire a second time, so such a level stays sole
// `allowAssignmentHost`: the ASSIGNMENT host carries the same receiver facts, and its overwrite
// channel asks here what static the nav ends on - the extraction itself stays that channel's
// User keys off a realm can hold instances too; they take the same dispatch as any unknown value.
export function typedNavClaimShape(leafPath, {
  allowLeafSiblings = false,
  rootMemoized = false,
  adapter = null,
  allowAssignmentHost = false,
  allowSurfaceBase = false,
  allowInlineSpread = false,
} = {}) {
  const walk = resolveNestedReceiverChain(leafPath, {
    soleSlots: true,
    allowSlotDefault: true,
    allowLeafSiblings,
    rootMemoized,
    adapter,
    siblingLevels: true,
    allowAssignmentHost,
    allowInlineSpread,
  });
  if (!walk) return null;
  const { keys, root } = walk;
  const climbed = walk.climbed ?? [];
  for (let index = 1; index < climbed.length; index++) {
    if (climbed[index].prop === null || climbed[index].pattern.properties.length <= 1) continue;
    const reRead = keys.slice(0, keys.length - index).reduce((base, key) => memberFromKeyName(base, key), root);
    if (!isReReadableSurfaceNav(reRead, null, { ctx: { scope: leafPath.scope, adapter, path: leafPath } })) return null;
  }
  // a chain ending ON a built-in surface is the ANCHORED machinery's shape: the residual re-homes
  // onto that surface's own pure binding and the claim rides the anchor. `allowSurfaceBase` is how a
  // claim the anchor cannot serve asks past it - an INSTANCE leaf reads THROUGH the surface, so the
  // anchor re-homes the residual and leaves the leaf raw unless the dispatch takes it
  // (`({ Promise: { name } } = globalThis)` -> `name = _nameMaybeFunction(_Promise)`). the root is
  // asked with the hops: off the user's own object the chain is a user nav whatever its keys spell
  if (!allowSurfaceBase && isBuiltInSurfaceNav(keys.reduce((base, key) => memberFromKeyName(base, key), root),
    adapter ? { ctx: { scope: leafPath.scope, adapter, path: leafPath } } : undefined)) return null;
  return walk;
}

// does the TYPED-NAV dispatch OWN this claim? the shape above, plus what the EXTRACTION can carry -
// so every route that could claim such a shape asks THIS and none can answer it differently
export function typedNavClaimChain(leafPath, options = undefined) {
  const walk = typedNavClaimShape(leafPath, options);
  // a claim whose own KEY carries an effect is not one this dispatch owns: the effect runs where the
  // source wrote it, so the prop cannot leave with the extraction - and a prop that stays reads the
  // hop a SECOND time. the flat twin is where both are answered at once (the memo the residual
  // reads), which the normalization reaches on the hosts it takes; everywhere else the claim stays
  // native, and dropping the prop here would drop the effect with it
  return walk?.leafPattern?.node?.properties?.some(item => item.type !== 'RestElement'
    && computedKeyHasSideEffects(item, { scope: leafPath.scope, adapter: options?.adapter, path: leafPath })) ? null : walk;
}

// the chain the WHOLE-INIT memo route reads on both legs: a nested leaf whose root the source
// COMPUTES (a call, a selection), or a name it cannot safely re-read, beside a host sibling - the
// memo gives the sibling's read and the claim's one identity (`{ data: { at }, keys } = mk()` ->
// `const _ref = mk(); const at = _at(_ref.data);`). null where no memo is owed: a root proved reusable needs none, and a
// WRAPPED host pairs with an element of its literal - the wrapper family's routes (the capture)
// own that element, and a memo of the whole literal would bind every later slot ahead of the
// claim's read (`[{ y: { at } }, { z }] = [mk(), box]` read `z` before `y`)
export function computedRootMemoChain(leafPath, adapter = null) {
  const chain = typedNavClaimChain(leafPath, { rootMemoized: true, adapter });
  return chain?.root && !chain.wrapper && (chain.root.type !== 'Identifier'
    || !isReReferenceableAcrossReads(chain.root, { scope: leafPath.scope, adapter, path: leafPath })) ? chain : null;
}

// the declaration a REST-bearing host hangs off, and the value that host pulls from: the
// declarator's own init, or - under an ARRAY WRAPPER - the element the wrapper pairs it with. the
// wrapper is the same host one literal out, and the hop rename reads the paired element the way the
// flat one reads the init (`const [{ y: { at }, ...rest }] = [nb]`)
function restHostCarrier(host) {
  const owner = host.parentPath;
  if (owner?.node?.type === 'VariableDeclarator' && owner.node.id === host.node) {
    return { declarator: owner, value: owner.node.init };
  }
  if (owner?.node?.type !== 'ArrayPattern') return null;
  const declarator = owner.parentPath;
  if (declarator?.node?.type !== 'VariableDeclarator' || declarator.node.id !== owner.node) return null;
  const index = owner.node.elements.indexOf(host.node);
  const init = unwrapRuntimeExpr(declarator.node.init);
  if (index === -1 || init?.type !== 'ArrayExpression') return null;
  // the positional read: a spread no static position survives makes the pairing a POSSIBILITY,
  // never a fact
  const coords = resolveCallArgumentCoords(init.elements, index);
  return coords ? { declarator, value: resolveCallArgument(init.elements, index) } : null;
}

// Can the host take native residual reads beside the captured claim? A statement assignment
// has that slot too; a loop head must first relocate into its per-iteration body.
function residualHostTakesStatement(leafPath) {
  const host = destructurePatternHostPath(leafPath);
  if (host?.node?.type === 'AssignmentExpression') {
    return !!statementListOf(nestedAssignmentStatementOf(leafPath)?.parentPath?.node);
  }
  if (host?.node?.type !== 'VariableDeclarator') return false;
  const declaration = host.parentPath;
  const slot = declaration?.parentPath?.node;
  if (slot?.type === 'ForStatement' && slot.init === declaration.node) return false;
  return !(isForXStatement(slot) && slot.left === declaration.node);
}

// does binding this array slot READ or EVALUATE something - a getter through an object pattern, a
// default, a rest that destructures? a bare binding, a hole and a plain rest bind without a read,
// and an array pattern reads only what its own slots read (an iterator with effects between its
// steps is outside the model), so a renamed sibling inside one no longer counts. A host plan
// supplies its captured slots and current last reader at each already-planned array level.
export function slotReadsWhenBound(item, capturedSlots = null, lastReadingSlots = null) {
  if (capturedSlots?.has(item)) return false;
  while (item?.type === 'RestElement') item = item.argument;
  if (!item || item.type === 'Identifier') return false;
  if (lastReadingSlots?.has(item)) return lastReadingSlots.get(item) >= 0;
  return item.type !== 'ArrayPattern' || item.elements.some(element => slotReadsWhenBound(element, capturedSlots));
}

// the array levels between a claim's pattern and its host, innermost first, each with the index
// the climb took - or null where a LATER slot of any level reads when it binds: that read would run
// before the extraction reads the minted name, where native reads the claim's own level first
// (`[{ y: { at } }, { z }] = pair` fires `y` before `z`). The host plans from the last slot
// backwards; its reader summary accounts for captures without mutating the source pattern.
function positionalArrayLevels(pattern, host, captureState = null) {
  const levels = [];
  for (let child = pattern; child && child !== host; child = child.parentPath) {
    const level = child.parentPath?.node;
    if (level?.type !== 'ArrayPattern') continue;
    const index = level.elements.indexOf(child.node);
    if (captureState ? captureState.lastReadingSlots.get(level) > index
      : level.elements.slice(index + 1).some(element => slotReadsWhenBound(element))) return null;
    levels.push({ pattern: level, index });
  }
  return levels;
}

// the POSITIONAL twin of the chain walk: where an ARRAY pattern element holds the claim, the
// element cannot be spelled as a member - the pattern ITERATES, and `rows[0]` would read a
// property instead of pulling from the iterator. what CAN be spelled is a binding: the element
// slot takes a minted name, the pattern keeps its iteration, and the dispatch reads that name
// (`const [{ y: { at } }] = rows` -> `const [_el] = rows; const at = _at(_el.y);`). the answer is
// the SLOT to rename plus the hop keys below it; the host declaration stays put, so its init runs
// exactly where and as often as the source runs it - nothing is discarded here.
// Siblings at object levels retain their native reads around the selected leaf. Elements beside
// this one pull their own values from the same iteration.
// the POSITIONAL element route's decision, one answer for both emitters: which array slot of the
// leaf's pattern takes a minted name, which hop keys the dispatch reads off it, and how the levels
// beside the claim re-emit (`levels`), or - on an assignment host - the statement the pair lands
// after. taken where the pairing routes have nothing to pair - an init that is no array literal,
// or one a SPREAD shifts - and refused for every leaf the rename cannot carry: a defaulted one, a
// computed key beside siblings or one carrying an effect, an outer rest, a LATER array slot that
// reads when the pattern binds, a host without a declarator or statement slot. null = the leaf
// keeps whatever channel it came from. `arrayLevels` lists the array levels between the slot and
// the host, innermost first, each with the index the climb took. `adapter`
// folds a BOUND hop key on the way, as every other walk over the leaf's keys does. A complete
// source host can supply its remaining-reader summary instead of re-scanning each suffix.
export function resolvePositionalElementSlot(leafPath, adapter = null, captureState = null) {
  // a DEFAULTED prop keeps an arm this route has no shape for: it binds the DISPATCH in place of the
  // slot, and the dispatch does not stand in for the default - a receiver carrying no such method
  // answers `undefined` where the source answers its own value. the guarded routes fold that arm
  // with a test ref; here the pattern stays native rather than binding the wrong one of the two
  if (leafPath?.node?.value?.type === 'AssignmentPattern') return null;
  const keys = [];
  const levels = [];
  let pattern = leafPath.parentPath;
  let fromNode = leafPath.node;
  while (pattern?.node?.type === 'ObjectPattern') {
    // every OTHER slot of this level rides a RESIDUAL rooted at the value that level reads: the
    // CLAIM's own level survives whole against the minted name, its slot spelled as a sentinel, so
    // a named sibling binds what it bound and a REST goes on gathering, excluding the claim's key
    // exactly as the source did. an OUTER level splits AT the hop instead - what it binds before
    // the hop is read before it, what it binds after is read after the inner level, which is the
    // order the source's own nesting spells
    const props = pattern.node.properties;
    const at = props.indexOf(fromNode);
    if (at === -1) return null;
    const isClaimLevel = pattern.node === leafPath.parentPath.node;
    // A residual needs a statement slot beside the capture and a plain key. A computed key
    // belongs to its own channel (a polyfilled symbol, say), while the residual retains source keys.
    if (props.length > 1 && (fromNode.computed || !residualHostTakesStatement(leafPath))) return null;
    // ... and a computed key carrying an EFFECT never rides this route, sole or not: the rename
    // drops the pattern that spells the key, and with it the effect the source runs (the memo
    // channel keeps that key in a sentinel residual beside the dispatch)
    if (isClaimLevel && fromNode.computed
      && computedKeyHasSideEffects(fromNode, { scope: leafPath.scope, adapter, path: leafPath })) return null;
    // ... and a REST on an OUTER level keeps that level whole (nothing may split a gather), which
    // is the rest-host route's own shape one branch down - not this one's
    if (!isClaimLevel && props.some(isRestProperty)) return null;
    levels.unshift(isClaimLevel ? { claim: true } : { before: props.slice(0, at), after: props.slice(at + 1) });
    let owner = pattern.parentPath;
    if (owner?.node?.type === 'AssignmentPattern' && owner.node.left === pattern.node
      && owner.parentPath?.node?.type === 'ArrayPattern') owner = owner.parentPath;
    const ownerType = owner?.node?.type;
    if (ownerType === 'ObjectProperty' || ownerType === 'Property') {
      const key = consumableHopSlotName(owner.node, adapter ? { scope: owner.scope ?? leafPath.scope, adapter, path: owner } : null);
      if (typeof key !== 'string') return null;
      // the HOST above may carry a REST, and then nothing prunes: rest gathers what the pattern did
      // not name, so this hop's key has to stay there keeping itself excluded - and a hop that
      // stays is a second reader of it. what CAN leave is the hop's VALUE, renamed to a binding the
      // dispatch reads, which is the array element's own answer one dialect over: the source's read
      // count is unchanged, the key stays where it was, and the claim binds off the name
      const host = owner.parentPath;
      if (host?.node?.type === 'ObjectPattern' && host.node.properties.some(isRestProperty)) {
        const carrier = restHostCarrier(host);
        if (!carrier) return null;
        // ... and only over a plain BOUND receiver: a proxy-global root is the anchored family's
        // shape and it answers a rest host its own way (the surface memo beside a sentinel), so a
        // pair minted here would be the only leg rewriting it
        const root = unwrapCollectingSePrefixes(carrier.value, []);
        if (root?.type !== 'Identifier' || POSSIBLE_GLOBAL_OBJECTS.has(root.name)) return null;
        return { slot: pattern, keys, levels, declarator: carrier.declarator, hopProp: owner };
      }
      keys.unshift(key);
      fromNode = owner.node;
      pattern = owner.parentPath;
      continue;
    }
    // A slot default stays on the native element binding; only its nested object
    // pattern takes the captured receiver after iteration.
    if (ownerType === 'ArrayPattern' && owner.node.elements.some(item => patternSlotTarget(item) === pattern.node)) {
      // ... and the host is a DECLARATION reached through patterns alone: the minted name needs a
      // binding site, which only a declarator gives it. an assignment host has none - climbing past
      // it would hand the rename to whatever declaration encloses the statement
      // ... and through KEYED levels above the array, each read natively by the kept pattern: only as
      // the LAST property of its level, since a later sibling or rest reads after the iteration yet
      // before the renamed leaf does
      let outer = owner;
      while (outer?.parentPath?.node?.type === 'ArrayPattern'
        || outer?.parentPath?.node?.type === 'ObjectPattern'
        || (outer?.parentPath?.node?.type === 'AssignmentPattern' && outer.parentPath.node.left === outer.node)
        || (isPropertyNode(outer?.parentPath?.node) && outer.parentPath.node.value === outer.node
          && outer.parentPath.parentPath?.node?.properties?.at(-1) === outer.parentPath.node)) {
        outer = outer.parentPath;
      }
      // ... and a slot AFTER the claim's at any array level on the way that reads when it binds
      // declines the rename (`positionalArrayLevels`)
      const arrayLevels = positionalArrayLevels(pattern, outer.parentPath, captureState);
      if (!arrayLevels) return null;
      const declarator = outer?.parentPath;
      // an ASSIGNMENT host binds no declaration, but a minted name needs only a BINDING SITE, and a
      // hoisted `var` is one both emitters already mint. the statement keeps its own iteration and
      // the claim's binding takes the dispatcher's answer right after it - the shape this host's
      // overwrite channel already spells for a claim whose receiver it CAN name
      // the literal the PAIRING routes own under this host: an array one, or an object one over keys
      const pairedLiteral = outer.node.type === 'ObjectPattern' ? 'ObjectExpression' : 'ArrayExpression';
      if (declarator?.node?.type === 'AssignmentExpression' && declarator.node.left === outer.node
        && declarator.node.operator === '=' && !keys.length) {
        const statement = nestedAssignmentStatementOf(leafPath);
        const right = statement ? unwrapCollectingSePrefixes(declarator.node.right, []) : null;
        // a literal right is the PAIRING routes' shape, exactly as a literal init is
        return statement && right?.type !== pairedLiteral
          ? { slot: pattern, keys, levels, arrayLevels, assignment: declarator, statement } : null;
      }
      if (declarator?.node?.type !== 'VariableDeclarator' || declarator.node.id !== outer.node) return null;
      // ... and it travels with the answer here too, for the reason the chain walk carries it
      // ... and only where the array pulls from something the PAIRING routes cannot resolve: an
      // ArrayExpression init is their shape, and where they leave a claim native there they have
      // their own reason for it. asking THEM instead would work per case, but the two legs reach
      // that question through different flows, and a rename firing on one leg alone is a divergence
      // - the init is the one fact both read the same way. a SPREAD is the exception: it shifts
      // every position after it by an unknowable amount, so no pairing exists to own the slot
      const init = unwrapCollectingSePrefixes(declarator.node.init, []);
      if (init?.type === pairedLiteral
        && (init.elements ?? init.properties).every(element => element?.type !== 'SpreadElement')) return null;
      return { slot: pattern, keys, levels, arrayLevels, declarator };
    }
    return null;
  }
  return null;
}

// resolve the receiver node for a (possibly nested) destructure leaf: walk the pattern paths up from the
// leaf, collecting the nesting segments (object keys + array indices), then walk the host's RHS literal
// along them. e.g. `flat` of `{ y: { flat: m } } = { y: arr }` resolves to `arr`, and of `[{ y: { flat:
// m } }] = [{ y: arr }]` likewise (object-key `y` AND array-index `0`). returns ONLY a receiver that is
// safe to reference twice (see `isReReferenceableReceiver`); a member / call receiver, a computed or
// non-literal nesting key, a non-matching RHS hop (incl. a spread that shifts array indices), or a missing
// key / hole bails to null.
// `allowSeFreeSingleRead` opens the receiver to a side-effect-free MEMBER (`Array.prototype`),
// BRANCHING (`c ? [7] : []`, `a || b`), or member-nesting LITERAL (`[holder.p]`) node: reading any is
// pure to `mayHaveSideEffects`, but a getter would re-fire (and a branch re-select) on a SECOND read -
// so callers pass it ONLY when the receiver is read exactly ONCE (an `eliminateResidual` extraction or
// the memoized `_ref` channel), where it fires once like native. the double-read assignment-overwrite
// consumer keeps the default (all stay safe-bailed).
// AST-agnostic and path-API-agnostic: both babel and estree paths expose `.parentPath` / `.node`, the
// field names match, and the only divergent node type (object property: babel `ObjectProperty` / estree
// `Property`) is accepted both ways - so ONE implementation serves both emitters. `unwrapExpressionChain`
// peels transparent wrappers (parens / TS casts) off the RHS and each value, so a parenthesized object
// literal or value (`= ({ y: arr })` / `{ y: (arr) }`) resolves the same way - babel folds parens into
// node `extra`, estree keeps a `ParenthesizedExpression`, and without peeling the two would diverge
// `allowSePeeledFragment`: the unwraps below ELIDE sequence prefixes (`(se(), arr)` resolves to
// `arr`). that is sound only for a consumer whose receiver READ runs AFTER the residual evaluated
// the init in place (the assignment overwrite) - an extract-before-residual consumer would read
// the receiver ahead of the prefix effect, reordering it, so the default BAILS when an elided
// prefix carries a side effect (the top-level whole-init memo retry then captures order instead)
// eslint-disable-next-line max-statements -- the walk: one arm per slot shape and per caller promise
export function resolveNestedReceiverNode(leafPath,
  { allowSeFreeSingleRead = false, allowInitCarriedEffects = false,
    allowSePeeledFragment = false, allowNavSegments = false, adapter = null, injectorState = null, slot = null,
    throughNamedDefaults = false } = {}) {
  const elidedPrefixes = [];
  // how many of them stand ABOVE the deepest paired slot (the rest are that slot's own)
  let outerPrefixes = 0;
  // does an elided prefix run anything: an effect, or a read only a getter answers
  function elidedObservable() {
    return adapter ? observablePrefixElements(elidedPrefixes, { scope: leafPath.scope, adapter, path: leafPath }).length > 0
      : elidedPrefixes.some(mayHaveSideEffects);
  }
  const segs = [];
  let pattern = leafPath.parentPath;
  while (isDestructurePattern(pattern?.node)) {
    let owner = pattern.parentPath;
    // the SLOT the owner pairs is the pattern, or the transparent inner default around it
    // (`[{ at } = {}] = [g]`, `{ w: { at } = {} } = { w: g }`): the paired value is read first and
    // the default fires only where it is undefined, so the pair stays the receiver the leaf reads -
    // the step the array-wrap classification and the mirror host take over the same default
    // ... and a NAMED default (`= Array`) is stepped through on the caller's word alone
    // (`throughNamedDefaults`): a caller whose climb proved the outer chain names the receiver
    // knows that default is dead, and the pair it descends to is then what the leaf reads
    // ... and any other nested default where the pair the descent reaches is provably a VALUE: the
    // default never fires there (`{ k: { at } = mk() } = { k: [1, 2] }`), which the descent checks
    // at the level it pairs (`liveDefault`)
    let slotNode = pattern.node;
    let liveDefault = false;
    if (owner?.node?.type === 'AssignmentPattern' && owner.node.left === slotNode && isNestedDestructureDefault(owner)) {
      // ... but only an EMPTY fallback (`= {}`, `= []`) is transparent: any other default is a value
      // the leaf reads where it fires, so the pair stands for the receiver only where the pairing
      // proves that default dead
      const fallback = unwrapRuntimeExpr(owner.node.right);
      const emptyFallback = (fallback?.type === 'ObjectExpression' && !fallback.properties.length)
        || (fallback?.type === 'ArrayExpression' && !fallback.elements.length);
      liveDefault = !throughNamedDefaults && (!isInnerDestructureDefault(owner) || !emptyFallback);
      slotNode = owner.node;
      owner = owner.parentPath;
    }
    const ownerType = owner?.node?.type;
    if (ownerType === 'ObjectProperty' || ownerType === 'Property') {
      // through the canonical resolver on BOTH sides of the later match: a raw `.value` compares the
      // number `0` against the string `'0'`, so a pattern and a literal that spell one slot differently
      // failed to pair and the polyfill was lost on a receiver that was fully known. an `adapter`
      // additionally folds a BOUND key here, which is the answer the second leg's climb already gives
      const segKey = consumableHopSlotName(owner.node,
        adapter ? { scope: owner.scope ?? leafPath.scope, adapter, path: owner } : null);
      if (segKey === null) return null;
      segs.unshift({ key: segKey, liveDefault });
      pattern = owner.parentPath;
      continue;
    }
    if (ownerType === 'ArrayPattern') {
      const index = owner.node.elements.indexOf(slotNode);
      if (index === -1) return null;
      segs.unshift({ index, liveDefault });
      pattern = owner;
      continue;
    }
    // the hosts whose value the pattern READS: a declarator, an assignment, a PARAMETER (its default,
    // or the IIFE argument the canon prefers); a RECEIVER-shaped inner default (`{ k: { at } = Array }`)
    // is the routes' own guarded fallback, not a receiver, and stays with them
    const paramOwner = (ownerType === 'AssignmentPattern' && owner.node.left === slotNode
      && FUNCTION_LIKE_NODE_TYPES.has(owner.parentPath?.node?.type))
      || (FUNCTION_LIKE_NODE_TYPES.has(ownerType) && owner.node.params?.includes(slotNode));
    // ... and a for-x HEAD spelling no declaration: the loop's `left` is the pattern, and the canon
    // reads the iterated element there exactly as it reads it one level down from a head declarator
    const forXHead = isForXStatement(owner?.node) && owner.node.left === slotNode;
    const rhs = ownerType === 'VariableDeclarator' || ownerType === 'AssignmentExpression' || paramOwner || forXHead
      ? destructureReceiverNode(owner, slotNode, adapter?.isMutatedStaticSlot ?? adapter?.isMutatedStatic) : null;
    if (!rhs) return null;
    // a kept WRITE is a prefix like any other for a caller that keeps it: the residual still performs
    // it (the overwrite hosts) or the render lifts it (the extraction hosts), and the value it stores
    // is the receiver the claim reads. only that caller asks - the flag is its promise. the peel rides
    // EVERY descent step, not just the init: a wrapper slot may hold the write (`[(kw = globalThis)]`)
    // ... and a defensive realm DEFAULT reads as its left here exactly as it does under the walk canon
    // (`{ w: globalThis ?? {} }` names the realm): the discarding peel, since this answer REPLACES the
    // slot for every consumer that resolves through here
    // ... and a value the build decides reads as the value of it that runs, behind an effect prefix too
    // (`decidedRunningValue`, which collects that prefix as the plain peel does)
    function peelToValue(from) {
      function running(node) {
        return adapter ? decidedRunningValue(node, { scope: leafPath.scope, adapter, path: leafPath }, elidedPrefixes)
          : unwrapCollectingSePrefixes(node, elidedPrefixes);
      }
      let cur = running(from);
      if (allowSePeeledFragment) {
        while (cur?.type === 'AssignmentExpression' && cur.operator === '=') {
          elidedPrefixes.push(cur);
          cur = running(cur.right);
        }
      }
      return peelRealmLogicalDefault(cur, { discarding: true });
    }
    // the slot AS WRITTEN at the deepest step: the carried arm hands it over with its own prefix,
    // since a dispatch that performs the init's effects spells them where the source did
    let raw = rhs;
    let node = peelToValue(rhs);
    // a call the inline canon proves to yield a proxy global reads as that global
    node = provenRealmCallRoot(node, leafPath, adapter) ?? node;
    // the deepest literal slot the walk reads, for a caller that plans a MEMO of it (`slot`): the
    // value as written, the property holding it, and whether every property and element before it
    // is inert - the source evaluates those first, so a hoisted memo keeps their order only then
    if (slot) Object.assign(slot, { node: null, prop: null, precedersPure: true });
    const definedCtx = adapter ? { scope: leafPath.scope, adapter, path: leafPath } : null;
    function pairDefined(value) {
      return definedCtx ? slotValueProvablyDefined(value, definedCtx) : DEFINED_VALUE_TYPES.has(unwrapExpressionChain(value)?.type);
    }
    // ... and the leaf's NEAREST default keeps the verdict its pairing gave off the source, answered
    // once per pattern: a sibling leaf a leg rewrote first (the paired literal memoized) reads the
    // same answer
    const nearestLive = segs.findLast(seg => seg.liveDefault);
    const nearestDead = !!nearestLive && !!adapter && nearestInnerDefaultDead(leafPath.parentPath, adapter);
    function defaultStands(seg, value) {
      return !seg.liveDefault || (seg === nearestLive && nearestDead) || pairDefined(value);
    }
    for (const seg of segs) {
      // an OBJECT-pattern key can still name an array SLOT (`{ 0: { at } } = [[1, 2]]` reads property
      // '0' off the array, exactly as the language does), so ONE canonical index read serves both
      // segment kinds: an array pattern's positional segment and a key that spells that same index
      const element = arrayLiteralSlotValue(node, seg.index === undefined ? seg.key : seg.index);
      if (element) {
        outerPrefixes = elidedPrefixes.length;
        if (slot) {
          const at = node.elements.indexOf(element);
          slot.precedersPure &&= node.elements.slice(0, at)
            .every(item => !item || (item.type !== 'SpreadElement' && !mayHaveSideEffects(item)));
          Object.assign(slot, { node: element, prop: null });
        }
        if (!defaultStands(seg, element)) return null;
        raw = element;
        node = peelToValue(element);
        continue;
      }
      // a positional segment carries no property name to look up instead; last match wins
      // (duplicate keys), only data properties whose key SPELLS a slot resolve, and a trailing
      // spread that could override the matched key bails (canonical helper)
      const match = seg.index === undefined && node?.type === 'ObjectExpression'
        ? findObjectKeyBeforeSpread(node.properties, p => spelledSlotName(p) === seg.key)
        : null;
      // ... and a key standing AFTER the match that nothing can name could BE this slot at runtime
      // (`{ w: globalThis, [k]: other }`) - the pairing's own rule, asked here too so no consumer
      // reads a value the level may not hold
      const keyCtx = adapter ? { scope: leafPath.scope, adapter, path: leafPath } : null;
      if (match && node.properties.slice(node.properties.indexOf(match) + 1)
        .some(p => consumableHopSlotName(p, keyCtx) === null)) return null;
      const matchRead = match ? objectPropertyReadValue(match) : null;
      if (matchRead) {
        if (slot) {
          slot.precedersPure &&= node.properties.slice(0, node.properties.indexOf(match))
            .every(item => (item.type === 'Property' || item.type === 'ObjectProperty')
              && !item.computed && objectPropertyReadValue(item) && !mayHaveSideEffects(item.value));
          Object.assign(slot, { node: matchRead, prop: match });
        }
        if (!defaultStands(seg, matchRead)) return null;
        outerPrefixes = elidedPrefixes.length;
        raw = matchRead;
        node = peelToValue(matchRead);
        continue;
      }
      // ... and where no LITERAL holds the slot, a receiver that is a nav is still readable, for a
      // caller that ASKS: an identifier or an SE-free member chain spells the remaining segments as
      // its own member reads, which is what the source itself does (`{ Array: { prototype: { flat } } }
      // = globalThis` reads `globalThis.Array.prototype`). the option is the caller's promise that
      // its render reads that nav ONCE - every other caller keeps the literal-only walk, where the
      // null is what tells it to take another channel
      if (allowNavSegments && ((allowSeFreeSingleRead || !adapter ? isReReferenceableReceiver(node)
        : isReReferenceableAcrossReads(node, { scope: leafPath.scope, adapter, injectorState, path: leafPath }))
        || isSeFreeMemberReceiver(node))) {
        if (!allowSePeeledFragment && elidedObservable()) return null;
        // a nav proves no value: a live default below it may fire
        if (segs.slice(segs.indexOf(seg)).some(rest => rest.liveDefault)) return null;
        let spelled = node;
        for (const rest of segs.slice(segs.indexOf(seg))) {
          spelled = memberFromKeyName(spelled, rest.index === undefined ? rest.key : String(rest.index));
        }
        return spelled;
      }
      return null;
    }
    // ... an effect the peel elided (`{ w: (mark(), arr) }`) rides the CARRIED candidate as the slot
    // was written - the caller's `receiverPerformsEveryInitEffect` decides whether that is every
    // effect the init has, and its dispatch then spells the prefix where the flat form spells it
    // (`_at((mark(), arr))`); every other caller keeps the null that sends it to another channel
    if (elidedObservable()) {
      // ... and a prefix a level ABOVE that slot ran before the slot was built, so the candidate spells it
      // ahead of the slot (`(n++, { y: arr })` carries `(n++, arr)`); a slot-memo caller asks for the slot
      if (allowInitCarriedEffects) {
        return outerPrefixes && !slot ? sequenceExpression([...elidedPrefixes.slice(0, outerPrefixes), raw]) : raw;
      }
      if (!allowSePeeledFragment) return null;
    }
    if (adapter ? isReReferenceableAcrossReads(node, { scope: leafPath.scope, adapter, injectorState, path: leafPath })
      : isReReferenceableReceiver(node)) return node;
    // a side-effect-free member (`Array.prototype`, `obj.props`), branching (`c ? [7] : []`, `a || b`),
    // or member-nesting literal (`[holder.p]`) receiver is sound for a single-read extraction: its
    // getter (if any) fires once and its branch selects once, matching native. computed-key / call
    // receivers carry effects and are rejected by `mayHaveSideEffects`
    if (allowSeFreeSingleRead
      && (isSeFreeMemberReceiver(node) || isSeFreeBranchingReceiver(node) || isSeFreeRereadLiteral(node)
      || isReReferenceableReceiver(node))) return node;
    // ... and an effect-bearing node comes back as a CANDIDATE for a caller that will test it with
    // `receiverPerformsEveryInitEffect`: the effects only matter while a residual survives to
    // re-evaluate them, and that caller's whole question is whether it does
    if (allowInitCarriedEffects) return node;
    return null;
  }
  return null;
}

// does the host pattern bind something OUTSIDE the leaf's own hop chain - a sibling prop at any level
// above the leaf, which keeps the residual (and the init it evaluates) alive once the leaf leaves?
function hostKeepsSiblingBinding(leafPath) {
  const host = destructurePatternHostPath(leafPath);
  const hostPattern = host?.node?.id ?? host?.node?.left ?? null;
  if (!hostPattern) return false;
  let top = leafPath;
  while (top.parentPath && top.parentPath.node !== hostPattern) top = top.parentPath;
  if (!top.parentPath) return false;
  // A sibling below the outer hop still survives beside the leaf's own binding.
  return patternBindingCount(hostPattern) > patternBindingCount(leafPath.node?.value);
}

// what a nested INSTANCE claim dispatches on where no literal holds its slot: the nested walk spells
// the remaining hops as member reads, and what that nav LANDS on picks the channel - a built-in
// SURFACE dispatches as itself (one its root names: a capitalised key off the user's own object is
// that object's nav), and a nav ending on a polyfillable STATIC of the constructor its
// object names dispatches on that static's ponyfill. asking is the caller's promise that its render
// reads the nav ONCE; the trailing-static arm carries a promise of its own (`allowTrailingStatic`) -
// a leaf sibling keeps a residual that would re-read the static raw. `isOwnAlias` is the caller's
// lookup of the names it minted for the namespace, a rewritten tree's root. the nav itself comes back
// whatever the verdict: a caller that finds no dispatch here still asks what it navigated
export function resolveNestedNavDispatch(leafPath, { adapter, resolvePure, allowTrailingStatic = false, isOwnAlias = null }) {
  // the dispatch READS the nav instead of the host's own init, so what that init spells stops being
  // read at all. an ARRAY wrapper survives that: its own machinery lifts the elements the pattern
  // does not bind. an OBJECT literal has no such channel here, so a property VALUE carrying an
  // effect keeps the claim where the source wrote it (`{ z: (hit(), 1), w: globalThis }`)
  // ... unless a SIBLING binding keeps the residual: the literal still evaluates there, every effect it
  // holds runs where the source ran it, and the extraction ahead reads a pure surface - the shape the
  // shallow twin prints (`{ w: { at: m }, z } = { w: Array.prototype, z: (hit(), 1) }`)
  const hostInit = destructureHostInitNode(leafPath);
  const keepsSibling = hostKeepsSiblingBinding(leafPath);
  const ctx = { scope: leafPath.scope, adapter, path: leafPath };
  if (hostInit?.type === 'ObjectExpression' && !keepsSibling && objectLiteralHoldsObservable(hostInit, null, ctx)) {
    return { nav: null, dispatch: null };
  }
  // ... and with that residual alive, a prefix a LITERAL's slot wears (`w: (hit(), globalThis)`) runs
  // where the source wrote it - the residual evaluates the literal - so the nav peels past it. a
  // prefixed bare init (`(effect(), globalThis)`) keeps its own channel: the lift, then the surface memo
  const literalSlotPrefix = keepsSibling && hostInit?.type === 'ObjectExpression';
  const nav = resolveNestedReceiverNode(leafPath, { allowNavSegments: true, allowSePeeledFragment: literalSlotPrefix, adapter });
  // the surface answer travels as its ROOT and keys as well: a caller that renders through
  // `resolveNestedReceiverBase` needs them to fold the realm root onto its ponyfill, and spelling
  // the nav node verbatim would print the raw name the source wrote
  // a `?.` that cannot short-circuit is dead text on the surface nav (`globalThis?.globalThis.Array
  // .prototype`): the same value canon the pairing asked, so the dispatch reads through those hops
  const allowOptionalHops = receiverCarriesLiveOptional(nav)
    && !navValueCanShortCircuit(nav, ({ name }) => resolveBuiltIn({ kind: 'global', name }), ctx);
  if (isInstanceSurfaceNav(nav, { allowOptionalHops, ctx, isOwnAlias })) {
    const navKeys = [];
    let cur = nav;
    function hopIsPlain(hop) {
      return hop?.type === 'MemberExpression' && !hop.computed && (allowOptionalHops || !hop.optional)
        && hop.property?.type === 'Identifier';
    }
    while (hopIsPlain(cur)) {
      navKeys.unshift(cur.property.name);
      cur = cur.object;
    }
    // An admitted this-rooted surface keeps that receiver, including a CommonJS
    // exports object. Carry it explicitly instead of requiring a named realm root.
    const root = cur?.type === 'Identifier' || cur?.type === 'ThisExpression' ? cur : null;
    return { nav, dispatch: { kind: 'surface', node: nav, root, keys: navKeys, allowOptionalHops } };
  }
  if (!allowTrailingStatic || nav?.type !== 'MemberExpression' || nav.computed
    || nav.property?.type !== 'Identifier') return { nav, dispatch: null };
  const ctorName = resolveObjectName({ objectNode: nav.object, ...ctx });
  const pure = ctorName && isStaticPlacement(ctorName) && !POSSIBLE_GLOBAL_OBJECTS.has(ctorName)
    && !adapter.isMutatedStatic?.(ctorName, nav.property.name)
    ? staticHopPure({ ctorName, key: nav.property.name, resolvePure }) : null;
  return { nav, dispatch: pure ? { kind: 'static', entry: pure.entry, hintName: pure.hintName } : null };
}

// the memo an object-hop SLOT takes where its value cannot be spelled twice yet the level stays
// whole (a sibling or a rest keeps the residual): the value moves to a `_ref` the extraction and the
// residual both read. HOISTED ahead of the declaration where every property and element before the
// slot is inert - the source evaluates them first, and nothing they do is observable - and written
// IN the slot (`w: _ref = eff()`) where one of them acts, preserving the source order.
// Null off a declaration host, where the residual dies (the carried route spells the value
// in the dispatch), where the plain read already answers, or under an ARRAY slot
// (the wrapper family's), or where no statement slot holds the hoisted memo and the extraction that
// reads it - beside a SIBLING declarator, or in a FOR-INIT header
export function nestedSlotMemoPlan(leafPath, { adapter = null, injectorState = null } = {}) {
  const host = destructurePatternHostPath(leafPath);
  if (host?.node?.type !== 'VariableDeclarator' || !host.node.init) return null;
  const declaration = host.parentPath;
  const forHead = declaration?.parentPath?.node;
  // a loop HEADER keeps its declarator native on both legs, the flat twin's own shape there
  if (!declaration?.node?.declarations
    || (forHead?.type === 'ForStatement' && forHead.init === declaration.node)) return null;
  if (patternBindingCount(host.node.id) <= patternBindingCount(leafPath.node.value)) return null;
  if (resolveNestedReceiverNode(leafPath, { adapter, injectorState })) return null;
  const slot = {};
  // the leaf may NAVIGATE on from the slot (`{ w: { Array: { prototype: { at } } } } = { w: (hit(),
  // globalThis) }`): the walk spells those segments off the slot's value, and the memo carries them as
  // `navKeys` - the dispatch reads `_ref.Array.prototype`, never the slot itself. the sink fills as
  // the walk descends, so a walk that DIED below the slot leaves one that is not the receiver
  const carried = resolveNestedReceiverNode(leafPath,
    { adapter, injectorState, allowInitCarriedEffects: true, allowNavSegments: true, allowSePeeledFragment: true, slot });
  if (!carried || !slot.node || !slot.prop) return null;
  // ... a slot an earlier leaf's memo already WROTE (`w: _ref = (hit(), globalThis)`) names its value
  // through that write: the walk peels the assignment, and the same write serves this leaf too
  const slotTail = unwrapRuntimeExpr(slot.node);
  const writtenTail = slotTail?.type === 'AssignmentExpression' ? unwrapRuntimeExpr(slotTail.right) : null;
  const slotValues = new Set([slot.node, slotTail, peelNestedSequenceExpressions(slotTail).tail,
    ...writtenTail ? [writtenTail, peelNestedSequenceExpressions(writtenTail).tail] : []]);
  const navKeys = [];
  let cur = carried;
  while (!slotValues.has(cur) && cur?.type === 'MemberExpression' && !cur.computed && cur.property?.type === 'Identifier') {
    navKeys.unshift(cur.property.name);
    cur = cur.object;
  }
  if (!slotValues.has(cur)) return null;
  // ... only a nav INTO a built-in surface: a user object's hop (`{ w: { y: { at } } } = { w: box }`)
  // would be read by the residual a second time, and both legs keep that claim native - a capitalised
  // one too, the slot's value naming no surface (`{ w: { Y: { prototype: { at } } } }`)
  const slotCtx = { scope: leafPath.scope, adapter, injectorState, path: leafPath };
  if (navKeys.length && !isInstanceSurfaceNav(carried, { ctx: slotCtx })) return null;
  // a slot the level CAN spell twice needs no memo, whatever the leaf navigates from it (`{ w:
  // globalThis }` under `{ w: { Array: { prototype: { map } } } }` reads the surface off the slot);
  // a re-readable built-in surface (`Array.prototype`) spells twice for free, and a literal that
  // BEARS a class keeps its evaluation where the source wrote it - both legs leave those as they are.
  // a leaf whose KEY runs an effect keeps its slot in the residual, and the surface then memoizes
  // anyway: that kept read and the dispatch share it, the side-effect key plan's own rule
  if (isReReferenceableAcrossReads(slot.node, slotCtx) || literalHoldsClass(slot.node)
    || (!computedKeyHasSideEffects(leafPath.node, slotCtx)
      && isReReadableSurfaceNav(unwrapRuntimeExpr(slot.node), null, { ctx: slotCtx }))) return null;
  return { node: slot.node, prop: slot.prop, hoist: slot.precedersPure, navKeys };
}

function literalHoldsClass(node) {
  let found = false;
  walkAstNodes({ root: node, visit: item => {
    if (item.type === 'ClassExpression') found = true;
    return !found;
  } });
  return found;
}

// unified receiver-resolution DECISION for a destructure leaf - the single place that picks which
// node an extraction dispatches on and through which CHANNEL; emitters only render. previously this
// decision lived twice (babel: inline pre-memo in its emitter; unplugin: resolver + whole-init
// retry), and the two procedures drifted. channels:
//   - 'resolved':        nested / param / no-init host - `resolveNestedReceiverNode` outcome
//                        (node null = bail), including its single-read and SE-peel gates
//   - 'raw':             top-level init that peels (SE-free) to an Identifier, or a sole-prop
//                        pattern - the slot is reused / inlined verbatim
//   - 'raw-ctor':        SE-free whole-chain pure-ctor init (`globalThis.Promise`) - left in
//                        place; the natural visitor substitutes the pure import, which resolves
//                        sibling reads on its own (a memo or hop-collapse would be superfluous)
//   - 'whole-init-memo': any other non-Identifier multi-prop init - memoize the WHOLE init once
//                        at its source slot, so every buried effect and getter runs exactly once
//                        in source order, whatever the expression shape
// AST/path-agnostic (`.node` / `.parentPath` / `.scope` on both emitters); `resolvePureGlobal` is
// the emitter's pure-entry probe (name -> truthy) so the ctor shortcut resolves through the
// caller's own channel. `proxyCtor` rides along for the memo's global-alias registration
// `patternSize` - the pattern's ORIGINAL property count. an emitter that MUTATES the pattern as its
// props emit asks this after the shrink, and a group that started with several props would then be
// read as a sole-prop one: the init inlines into the surviving prop, so an extraction already
// planted ahead of it runs BEFORE the init's own effects, which native runs first. an
// emitter whose walk sees the unshrunk pattern passes nothing
// `memoizedName` marks a static ponyfill binding that several leaves share through one
// whole-init memo. `staticMemo` prevents that value from carrying a constructor alias.
export function resolveDestructureReceiverPlan(leafPath, {
  allowSeFreeSingleRead = false, allowInitCarriedEffects = false,
  adapter = null, injectorState = null, resolvePureGlobal = null, patternSize = null, memoizedName = null,
} = {}) {
  const patternPath = leafPath.parentPath;
  const host = patternPath?.parentPath;
  const hostType = host?.node?.type;
  const initKey = hostType === 'VariableDeclarator' ? 'init'
    : hostType === 'AssignmentExpression' ? 'right' : null;
  if (!initKey) {
    // with the adapter: it is what folds a BOUND hop key (`{ [k]: { at } }` with `const k = 'w'`) to
    // the slot it names - without it the walk stops at the computed key and the claim ships native
    const node = resolveNestedReceiverNode(leafPath, { allowSeFreeSingleRead, allowInitCarriedEffects, adapter, injectorState });
    if (node && isReReferenceableAcrossReads(node, { scope: leafPath.scope, adapter, injectorState, path: leafPath })) {
      return { channel: 'resolved', node };
    }
    // A sole nested claim can consume a plain user navigation once only when replacing the host
    // drops no initializer work. A surviving sibling keeps the source read and takes the memo below.
    const hostInit = destructureHostInitNode(leafPath);
    const soleNav = allowSeFreeSingleRead && !hostKeepsSiblingBinding(leafPath)
      && hostInit?.type === 'ObjectExpression' && !objectLiteralHoldsObservable(hostInit, null, {
        scope: leafPath.scope, adapter, path: leafPath,
      }) ? resolveNestedReceiverNode(leafPath, {
        allowSeFreeSingleRead: true, allowNavSegments: true, adapter, injectorState,
      }) : null;
    if (soleNav) return { channel: 'resolved', node: soleNav };
    // ... and an object slot the plain walk cannot spell twice - an effectful value, or a RELAXED
    // single read (a member, a selection) beside a residual that would read it a second time -
    // takes the slot memo where its level stays whole
    const slotMemo = nestedSlotMemoPlan(leafPath, { adapter, injectorState });
    return slotMemo ? { channel: 'object-slot-memo', ...slotMemo } : { channel: 'resolved', node };
  }
  const objectNode = host.node[initKey];
  if (!objectNode) return { channel: 'resolved', node: null };
  // a sole-prop pattern reads the receiver once - the extraction inlines the WHOLE init verbatim
  // (SE prefix included), so no memo is ever needed there
  if ((patternSize ?? patternPath.node.properties.length) <= 1) return { channel: 'raw', node: objectNode };
  // an init that peels (parens / TS wrappers, both AST flavors) to a bare Identifier with no
  // SE-bearing prefix elided on the way is freely re-referenceable - reuse the identifier.
  // an SE-crossed peel falls through: only the whole-init memo preserves the prefix's order
  const elided = [];
  const peeled = unwrapCollectingSePrefixes(objectNode, elided);
  if (peeled?.type === 'Identifier'
    && elided.every(expression => !mayHaveSideEffects(expression, adapter && { scope: leafPath.scope, adapter, path: leafPath }))
    && isReReferenceableAcrossReads(peeled, { scope: leafPath.scope, adapter, injectorState, path: leafPath })) {
    return memoizedName?.(peeled.name) ? { channel: 'whole-init-memo', node: objectNode, staticMemo: true }
      : { channel: 'raw', node: peeled };
  }
  const proxyCtor = globalProxyMemberName({
    node: peelProxyGlobalObject(
      objectNode,
      adapter.isMutatedStaticSlot ?? adapter.isMutatedStatic,
    ), scope: leafPath.scope, adapter, path: leafPath,
  });
  // a SLOT-mutated ctor member (`globalThis.Map = Shim`) keeps the RAW member as the synth
  // receiver: `globalProxyMemberName` already returns null for a mutated leaf or hop, so a
  // non-null `proxyCtor` is always a clean name - the gate lives in that one walk
  if (proxyCtor
    && peelNestedSequenceExpressions(objectNode).prefix.length === 0 && resolvePureGlobal?.(proxyCtor)) {
    return { channel: 'raw-ctor', node: objectNode, proxyCtor };
  }
  return { channel: 'whole-init-memo', node: objectNode, proxyCtor };
}

// the ExpressionStatement path that hosts a nested destructuring-ASSIGNMENT leaf (`({ y: { m } } = R);`),
// or null when the leaf is NOT in a statement-context assignment - a declaration, a param, or an
// expression-context assignment (`x = ({...} = R)` / a concise arrow body) whose value would need
// preserving. walks the leaf's own pattern chain to the AssignmentExpression, then peels transparent
// parens to the statement: `({...} = R)` at statement start always needs parens, which estree keeps as a
// `ParenthesizedExpression` while babel folds them into node `extra` - peeling unifies the two. callers
// emit the polyfill overwrite (`m = _m(recv)`) after this statement. AST/path-agnostic - serves both emitters
export function nestedAssignmentStatementOf(leafPath) {
  const path = destructurePatternHostPath(leafPath);
  if (path?.node?.type !== 'AssignmentExpression') return null;
  // the CANON peel, not a Paren-only loop: `(({ from } = Array) as any);` wears a TS wrapper
  // between the assignment and its statement, and a peel that stops at parens reads it as a
  // captured value. the same walk `assignmentInStatementPosition` asks, kept as the PATH
  let host = peelParenAndTSParentPath(path);
  // a statement wrapper the babel cascade flattened (`flattenSEWrappersToBareAE`) is RE-SEATED
  // onto the assignment itself, and a leaf path held from before that flatten still climbs through
  // it: the parent then holds the assignment's own node - a shadow, not a host - so the walk steps
  // over it to the statement (a parenthesized-node parse is where the wrapper is a node at all)
  if (host?.node === path.node) host = peelParenAndTSParentPath(host);
  return host?.node?.type === 'ExpressionStatement' ? host : null;
}

export const PATTERN_CHAIN_TYPES = new Set([
  'ArrayPattern',
  'AssignmentPattern',
  'ObjectPattern',
  'ObjectProperty',
  'Property',
  'RestElement',
  // rest's OTHER spelling (`isRestProperty` canon): a sibling-produced babel tree may spell
  // a pattern rest as SpreadElement, and the climb must not latch an inner host there
  'SpreadElement',
]);

// the node a pattern leaf's own chain climbs out into - the declarator, assignment, parameter or
// catch clause the destructure belongs to. one climb, several questions asked of its result. NOT a
// `findParent`, which crosses function and assignment boundaries and latches onto an OUTER host
// (`const r = (() => { ({ m } = x) })()` would answer the declarator)
export function destructurePatternHostPath(leafPath) {
  let path = leafPath.parentPath;
  while (path && PATTERN_CHAIN_TYPES.has(path.node?.type)) path = path.parentPath;
  return path ?? null;
}

// The computed keys on the route to one destructured read, in source order. Only the
// leaf's ancestors participate: an effectful sibling after the read must not move it.
// A sole direct binding can consume its whole pattern after evaluating the initializer;
// stable identifiers need no capture. The keyed-read render keeps null rejection before the key.
// `receiver` is what the read evaluates: the init, or the operand of it that runs where the build
// decides it (`decidedRunningOperand`) - the render spells that operand in the selection's place.
export function destructureKeyReadPlan(leafPath, ctx = null) {
  const keys = [];
  for (let cur = leafPath; cur && PATTERN_CHAIN_TYPES.has(cur.node?.type); cur = cur.parentPath) {
    if (computedKeyHasSideEffects(cur.node, ctx)) keys.unshift(cur.node);
  }
  if (!keys.length && !isCapturedKeyedPattern(leafPath.parentPath?.node)) return null;
  const pattern = leafPath.parentPath?.node;
  const host = leafPath.parentPath?.parentPath?.node;
  const running = ctx && host?.init ? decidedRunningOperand(host.init, ctx) : host?.init;
  const receiver = unwrapRuntimeExpr(running);
  // A sole read may spell a quiet receiver after its key only when every source read
  // remains available and stable. Null rejection is still the host's separate proof.
  function canDelay(node) {
    const value = unwrapRuntimeExpr(node);
    const branches = getFallbackBranchSlots(value);
    if (branches) {
      const test = SELECTION_TEST_FIELDS[value.type];
      return (!test || branches.includes(test) || canDelay(value[test]))
        && branches.every(key => canDelay(value[key]));
    }
    if (isConstantLiteralNode(value, null, part => {
      const core = unwrapRuntimeExpr(part);
      return core?.type === 'UnaryExpression' && typeof literalNodeValue(unwrapRuntimeExpr(core.argument)) !== 'number'
        ? null : core;
    })) return true;
    if (isInstanceSurfaceNav(value) && isReReadableSurfaceNav(value, null, { ctx })
      && NATIVE_STATIC_OWNERS.has(resolveObjectName({ objectNode: value.object, ...ctx }))) return true;
    if (inertPairedLiteralRead(value, ctx)) return true;
    if (value?.type !== 'Identifier' || !isReReferenceableAcrossReads(value, ctx)) return false;
    const binding = ctx.adapter.getBinding({ scope: ctx.scope, name: value.name, path: ctx.path, read: value });
    const owner = bindingDeclarationPath(binding)?.parentPath;
    // A sloppy parameter can change through mapped arguments without a named write.
    return binding?.kind === 'param' && FUNCTION_LIKE_NODE_TYPES.has(owner?.node?.type)
      && !isSloppyAtPath(owner) && pathContainedBy(ctx.path, owner.node.body);
  }
  const sole = pattern?.type === 'ObjectPattern' && pattern.properties.length === 1
    && host?.type === 'VariableDeclarator' && host.id === pattern && !!host.init;
  // Proofs above describe the source. Only its explicitly retained slots stay live: a
  // child visitor may replace an initializer operand or key before deferred apply.
  const receiverSlot = running && host?.init ? running === host.init
    ? { owner: host, key: 'init' } : findNodeSlot(host.init, running) : null;
  return {
    receiverSlot,
    get receiver() { return receiverSlot ? receiverSlot.owner[receiverSlot.key] : running; },
    get keys() {
      return keys.flatMap(prop => {
        const { prefix, tail } = peelNestedSequenceExpressions(prop.key);
        return PRIMITIVE_LITERAL_TYPES.has(tail?.type) ? prefix : [...prefix, tail];
      });
    },
    exported: leafPath.parentPath?.parentPath?.parentPath?.parentPath?.node?.type === 'ExportNamedDeclaration',
    consumeKey: pattern?.type === 'ObjectPattern' && host?.type === 'VariableDeclarator' && host.id === pattern
      && !!host.init && leafPath.node.value?.type === 'AssignmentPattern'
      && pattern.properties.every(prop => prop.type !== 'RestElement'),
    sole,
    reuseReceiver: receiver?.type === 'Identifier' && isReReferenceableAcrossReads(receiver, ctx),
    inlineReceiver: sole && !!ctx && receiver?.type !== 'Identifier' && canDelay(running),
  };
}

// the VALUE the destructure around this leaf reads: a declarator's init, an assignment's right side,
// peeled to the expression the runtime evaluates. null wherever the host carries no value of its own
// (a parameter, a catch clause, a for-x head)
export function destructureHostInitNode(leafPath) {
  const host = destructurePatternHostPath(leafPath);
  return unwrapExpressionChain(host?.node?.type === 'VariableDeclarator' ? host.node.init
    : host?.node?.type === 'AssignmentExpression' ? host.node.right : null);
}

// does the destructure ASSIGNMENT around this leaf have its value consumed (`host = ({ k } = R)`,
// a `return`, a call argument)? an assignment yields its RHS, so a receiver replaced by a synth
// mirror literal becomes the value the consumer captures - `host === Object` turns false. a
// declarator, parameter or catch host answers false: there is no assignment value to capture
export function destructureAssignmentValueIsCaptured(leafPath) {
  const host = destructurePatternHostPath(leafPath);
  return host?.node?.type === 'AssignmentExpression' && !assignmentValueDiscarded(host);
}

// is this leaf read through an ARRAY level of an assignment host, an element default on the way included?
// the positional routes own it there - the retained capture beside a rest, the array plan and the mirror
// over a literal - and where they decline, the leaf stays native: no cascade extraction or slot default
// stands in for them
export function assignmentLeafReadsPositionally(leafPath, adapter = null) {
  const walked = destructureHostThroughWrappers(leafPath.parentPath, adapter, true);
  return walked?.host?.node?.type === 'AssignmentExpression' && !!walked.indices.length;
}

// the pattern a guarded SPLIT consumed, turned into the residual its REST still needs: every key a
// read took is renamed to a sentinel the caller mints, so the rest goes on gathering exactly what
// the source left it, and the rest element itself is untouched. the pattern node is the SOURCE's
// own - what it keeps is what the source wrote - and each leg wraps the result in its own
// declarator, reading the same receiver the reads read
export function renameSplitPropsToSentinels(patternNode, mintSentinel) {
  for (const propNode of patternNode.properties) {
    if (propNode.type === 'RestElement') continue;
    propNode.value = identifier(mintSentinel());
    propNode.shorthand = false;
  }
  return patternNode;
}

export function canTransformDestructuring({ parentType, parentInit }) {
  if (parentType === 'VariableDeclarator') {
    // a for-in / for-of HEAD binding (`for (var { from } of arr)`) has no init - bail. an init-bearing
    // declarator under a for-x grandparent is the unbraced BODY slot (`for (k in obj) var { from } =
    // Array`), a normal substitutable destructure (the head-with-init form is a syntax error for a pattern)
    return !!parentInit;
  }
  return parentType === 'AssignmentExpression';
}

export const STATIC_WALK_DEPTH = 64;

// plugin-rewritten hop substitutions, shared by both spellings the injector mints:
// - a proxy-global alias (`_globalThis`): substitute to the SOURCE proxy-global name so the
//   post-loop mid-chain lift can match - the import binding's init isn't an ObjectExpression
//   and would otherwise bail at the walk's bindingType check
// - a CONSTRUCTOR stub (`_Promise` after an earlier in-place literal rewrite for a SIBLING prop
//   of the shared static-object wrapper): recover the SOURCE constructor name from the injector
//   hint so this prop's statics still resolve - without recovery the dereference bails and the
//   binding silently extracts off the polyfill stub (unbound at runtime where native requires
//   the constructor receiver). the hint's span gate ran against the HOST use; this hop READS at
//   its `readNode` - an assignment-form source written after that capture must not stub-narrow it
function pluginRewrittenHopName(binding, hop) {
  const { node: current, readNode } = hop;
  const { scope, adapter, path = null } = hop.ctx;
  const proxyName = proxyGlobalRootName({ node: current, binding, adapter, scope, path, usageNode: readNode });
  if (proxyName && proxyName !== current.name) return proxyName;
  const ctorHint = bindingPolyfillHint({ binding, scope, name: current.name, adapter });
  if (ctorHint && ctorHint !== current.name
    && assignmentAliasHintSoundAtRead({ binding, adapter, readNode })) return ctorHint;
  // a PRE-EXISTING pure default import on a pass over an emitter's own output: the census
  // prepasses run before any injector registry exists, so the hint derives from the import
  // source itself (`_Iterator` bound by '.../actual/iterator/constructor' names Iterator)
  if (binding?.importKind !== 'type' && (binding?.kind === 'module'
    // ... or the require-style pure binding: THIS binding's own declarator holds the
    // require call (a shadowed local of the same name has a different node and stays out)
    || (binding?.node?.type === 'VariableDeclarator' && requireCallSource(binding.node.init) !== null))) {
    const entry = pureImportEntryOf(path, current.name);
    const hinted = entry ? entryToGlobalHint(entry) : null;
    if (hinted && hinted !== current.name) return hinted;
  }
  return null;
}

const CLEAR_HOP = Symbol('clear-hop');
// the class-hop disposition said "the cursors moved, keep walking" - distinct from a `null` answer,
// which is the walk's own verdict
const CONTINUE_HOP = Symbol('continue-hop');
// combines the dominance gate with the reaching continuation for a variable hop of the walk.
// reassignment is read off `constantViolations`, not `binding.constant`: the latter is adapter-
// dependent (babel computes it lazily, estree-toolkit does not expose it) while both adapters
// surface the violation list, where empty / missing means the shape holds at the use site.
// CLEAR_HOP when no dominating reassignment blocks the flat resolve (the bare binding-alias canon
// on a reassigned CONTAINER binding - a dominating reassignment kills the declared init, but the
// value that reaches the read still walks the remaining path as the primary: the enumerable one
// for usage-global, the single observable one for usage-pure) and, in usage-global, no write a
// closure's read observes in the init's place, else the reaching node or null (dead end)
// every per-hop disposition below takes `{ hop, binding, name, walk }`: the hop the walk stands on
// (its `node` is the identifier `name` names, bound to `binding`) and the walk's options
function blockedContainerHop({ hop, binding, name, walk }) {
  const { adapter, path } = hop.ctx;
  if (reassignmentBlocksGlobalResolve({ binding, adapter, path, usageNode: hop.readNode })) {
    return blockedHopContinuation({ hop, binding, name, walk });
  }
  // usage-global: the gate above is shallow, so a read in a closure keeps the init a write completing
  // before the closure is defined already killed - the walk takes that write's value instead, as the key
  // and bare-alias follows do (`reachingValueOverDeadInit`), with every other write it may observe in the union
  const reaching = adapter.method === 'usage-global' && isReassignedBeyondDeclarator(binding) && reachingContainerValueNode(binding, hop);
  if (!reaching) return CLEAR_HOP;
  collectReassignedHopUnion({ hop, binding, name, walk });
  return { node: reaching, scope: aliasDeclScope(binding, hop.ctx.scope) };
}

// the blocked-hop continuation: the SINGLE reaching value keeps the walk alive - `{ node, scope }`,
// the value read in the binding's declaration scope, or the trusted alias write the bare-name
// resolver follows (`trustedIdentifierAliasWrite`: a write the read provably runs after, in a class
// static block included), or, where the reaching write is a pattern over a CALL, the one value that
// site pairs through the call canon, in the scope it is spelled in; otherwise (an ambiguous write - a
// pattern default, a spread-shifted slot, a branching RHS, a call pairing several values) the
// enumerable written values still union beside the dead primary, mirroring the bare canon's
// reachable-union (over-inject-safe; pure never passes a sink), and the hop dead-ends
function blockedHopContinuation({ hop, binding, name, walk }) {
  const { adapter, path } = hop.ctx;
  const scope = aliasDeclScope(binding, hop.ctx.scope);
  const callSites = [];
  const reaching = reachingContainerValueNode(binding, hop, callSites);
  if (reaching) return { node: reaching, scope };
  const trusted = trustedIdentifierAliasWrite({ scope: hop.ctx.scope, name, adapter, path, readNode: hop.readNode });
  if (trusted) return { node: peelChainRootValue(trusted.right), scope: writeScopeAt(path, trusted, scope) };
  const paired = callSites.length === 1 ? certainPairedSlotValue({
    pattern: callSites[0].pattern,
    init: callSites[0].value,
    name,
    seen: hop.seen,
    ctx: { scope, adapter, path, resolveKey: sharedResolveKey },
  }) : null;
  if (paired) return paired;
  collectReassignedHopUnion({ hop, binding, name, walk });
  return null;
}

// ClassDeclaration hop of the receiver walk: a reassigned class binding follows the reaching
// continuation exactly like a variable hop (the enumerable replacement keeps the global walk
// alive); a clean one returns its own name at the leaf, or descends its STATIC fields - the
// class declaration is where those fields captured their values, so it becomes the read site
// for the descent's reassignment checks (a field-value write after the class definition can't
// change the captured static). null = dead end
function classBindingHop({ hop, binding, name, walk }) {
  if (!binding) return null;
  const { adapter, path } = hop.ctx;
  if (reassignmentBlocksGlobalResolve({ binding, adapter, path, usageNode: hop.readNode })) {
    const reaching = blockedHopContinuation({ hop, binding, name, walk });
    return reaching ? { follow: reaching } : null;
  }
  if (walk.walkPath.length === 0) return { leaf: name };
  return { descend: binding.path?.node ?? binding.node };
}

// destructure-leaf binding of the receiver walk: `{Math} = globalThis` binds `Math` to
// `globalThis.Math`, not to `globalThis` - the binding-name maps to a key path inside the
// pattern id, which prepends to walkPath so subsequent dereferences hit `source[key]` (shorthand,
// renamed and positional alike: `[, h] = src` reads `src[1]`, which the descent pairs by position
// and a spread ahead of it leaves unpaired). a plain Identifier id keeps walkPath as-is; null =
// dead end (a rest collects a fresh container)
function destructureLeafWalkPath({ binding, name, scope, adapter, walkPath }) {
  const idNode = binding.path?.node?.id ?? binding.node?.id;
  if (idNode?.type !== 'ObjectPattern' && idNode?.type !== 'ArrayPattern') return walkPath;
  const destructureKeys = findShorthandKey(idNode, name, scope, adapter);
  return destructureKeys ? [...destructureKeys, ...walkPath] : null;
}

// the union half of the reassigned-hop continuation: a NON-dominating reassignment leaves the
// init live (the primary keeps walking it), but the read may see any enumerable written value
// too - each walks the SAME remaining path into the union sink (usage-global over-inject; the
// sink is never passed by pure callers), from where its write stands (`reassignedAliasValues`): a
// block around the write may rebind a name the value reads, which the hop's own scope does not see
function collectReassignedHopUnion({ hop, binding, name, walk }) {
  const { adapter, path } = hop.ctx;
  if (!walk.unionSink || !binding || adapter.method !== 'usage-global' || !isReassignedBeyondDeclarator(binding)) return;
  const values = reassignedAliasValues({
    binding,
    name,
    scope: hop.ctx.scope,
    declScope: aliasDeclScope(binding, hop.ctx.scope),
    adapter,
    path,
    usageNode: hop.readNode,
    seen: hop.seen,
  });
  for (const { node, scope } of values) walkAlternativesIntoSink({ hop: { ...hop, ctx: { ...hop.ctx, scope } }, walk, values: [node] });
}

// ONE home for "another value this read can reach": whatever the source of the alternative -
// a non-dominating reassignment of a hop, a slot the file wrote, an element a reposition
// permuted, an arm of a branching value - it walks the SAME remaining path the primary walks,
// so deeper hops and nested containers resolve through this very machinery, and its answer
// joins the sink. `walkPath` / `containerPath` default to the standing walk's, and a source
// that has already consumed a key passes what it left. an alternative that is a parameter slot of
// a call's yielded literal reads that call's argument (`slotValueHop`), one the call proves
// nothing for its parameter's own read - every caller's argument, the over-approximation. one
// standing in an arm the build never takes reaches nothing (`writeNeverRuns`). each is read for its
// VALUE, as the mirror reads a level (`levelLiteralThroughIife`): an effect prefix runs where the
// source spells it, which the selection standing in place keeps, and a store yields what it installs
function walkAlternativesIntoSink({ hop, walk, values, walkPath = walk.walkPath, containerPath = walk.containerPath }) {
  for (const value of values) {
    if (writeNeverRuns({ write: value, usagePath: hop.ctx.path, adapter: hop.ctx.adapter })) continue;
    const slotHop = slotValueHop({ hop, walk }, value) ?? { ...hop, node: value };
    const { literal } = levelLiteralThroughIife(installedWriteValue(slotHop.node));
    const resolved = walkStaticReceiverStep({ ...slotHop, node: literal, seen: new Set(slotHop.seen) }, {
      ...walk, walkPath, depth: walk.depth + 1, containerPath,
    });
    if (resolved && !walk.unionSink.includes(resolved)) walk.unionSink.push(resolved);
  }
}

// Select branch arms for this walk. Global enumerates reachable alternatives only with a
// union sink, or for a provenance question (`resolveLeaf`), whose arms must agree. Pure
// considers ternaries only outside the text the caller discards - after alias dereference - or
// when the caller preserves the selection; the next proof must make every arm agree on one
// receiver. a selection spelled in place offers its arms as guard candidates alone.
function walkBranchArms(node, { hop, walk }) {
  const { method } = hop.ctx.adapter;
  const branching = peelFallbackReceiver(node, hop.ctx.adapter.isMutatedStaticSlot ?? hop.ctx.adapter.isMutatedStatic);
  // usage-pure needs ONE name, so it takes only the arms that are each the WHOLE yielded value: a
  // ternary's. a `&&` yields its falsy LEFT where this walk named the right, and a `||` / `??`
  // yields a left the walk named by its constructor rather than proved truthy - both keep the
  // per-branch mirror. Alias dereference or an explicit `preservesSelection` promise allows the
  // ternary proof; minted memo names stay excluded to avoid reinterpreting our own output.
  if (method === 'usage-pure') {
    if (!(selectionAnswers(walk) || walk.selectionSink) || ORPHAN_REF_PATTERN.test(walk.containerName ?? '')) return null;
    if (branching?.type === 'ConditionalExpression') return [branching.consequent, branching.alternate];
    // ... and a `||` / `??` offers its operands to the identity guard alone (`selectionArmsName`): the
    // guard tests what arrived, so an operand nothing names is its raw branch - unless the left always
    // yields, which leaves the right dead (`selectionLeftAlwaysTruthy`: a static container, the realm)
    return walk.selectionSink && branching?.type === 'LogicalExpression' && branching.operator !== '&&'
      && !selectionLeftAlwaysTruthy({ node: branching.left, ...hop.ctx }) ? [branching.left, branching.right] : null;
  }
  if (!(walk.unionSink || walk.resolveLeaf) || method !== 'usage-global') return null;
  // ... an `&&` hands on its left only where that is falsy, which holds no slot and names no static
  const slots = branching?.type === 'LogicalExpression' && branching.operator === '&&' ? ['right']
    : getFallbackBranchSlots(branching);
  return slots ? slots.map(slot => branching[slot]) : null;
}

// ... may the arms the walk stands on answer for the read: they lie outside the text the caller discards,
// or the caller keeps the selection
function selectionAnswers(walk) {
  return !!(walk.dereferencedHops || !walk.inNode || walk.preservesSelection);
}

// ... the name they answer: the agreed one where they may (`selectionAnswers`), else none - the agreed
// one joining the guard candidates instead. a logical selection's operands are `candidatesOnly`
function selectionArmsName({ hop, walk }, arms, candidatesOnly = false) {
  const agreed = agreedBranchArmName({ hop, walk }, arms, candidatesOnly);
  if (selectionAnswers(walk) || walk.resolveLeaf) return agreed;
  if (agreed && walk.selectionSink && !walk.selectionSink.includes(agreed)) walk.selectionSink.push(agreed);
  return null;
}

// the ONE name a branching value stands for, or null: each arm walks the REMAINING path through
// this very step, and they must all answer the SAME name. an arm the walk cannot answer - a slot
// the other arm does not carry, a value spelled `undefined`, a receiver it cannot name - leaves
// what the read observes unproven, so the whole set refuses rather than take the arm that did
// answer. no union rides along: an alternative is not an answer here - but arms that each name a
// constructor and disagree are each a candidate of the identity guard a caller keeping the read puts
// over it (`selectionSink`). an arm is read for its value, its effect prefix peeled (`walkAlternativesIntoSink`).
// where the candidates are collected, an arm nothing names is the guard's raw branch: the arms it can name
// join them, and no one name is answered - save a nullish arm, the short-circuit of a lowered optional
// (`null == probe ? void 0 : realm`), which the probe canon owns. `candidatesOnly` - a logical
// selection's operands, which a constructor names without proving its value truthy - answers none either
function agreedBranchArmName({ hop, walk }, arms, candidatesOnly = false) {
  const names = [];
  let partial = candidatesOnly;
  for (const arm of arms) {
    const { literal } = levelLiteralThroughIife(arm, hop.ctx);
    const resolved = walkStaticReceiverStep({ ...hop, node: literal, seen: new Set(hop.seen) },
      { ...walk, depth: walk.depth + 1, unionSink: null });
    if (!resolved && walk.selectionSink && !isUndefinedNode(literal) && !isNullLiteralNode(literal)) {
      partial = true;
      continue;
    }
    if (!resolved || (!walk.selectionSink && names.length && resolved !== names[0])) return null;
    names.push(resolved);
  }
  if (!partial && names.every(name => name === names[0])) return names[0];
  if (walk.selectionSink) for (const name of names) if (!walk.selectionSink.includes(name)) walk.selectionSink.push(name);
  return null;
}

// Resolve `walkPath` through a receiver's aliases, containers, returned values and proxy hops.
// Return the resolved receiver name or null; reportNonStatic returns false for a proven
// fresh replacement. Usage-global may collect candidate names in `unionSink`.
// Each hop retains its scope and capture position for binding/slot-write checks.
// `rescuesReceiverRead` permits reads the caller will replay through `rescueSink`;
// `preservesSelection` permits agreement proofs over a ternary the caller keeps intact.
// `resolveLeaf` queries source provenance instead of naming globals, with the same value proofs.
export function walkStaticReceiverChain({
  receiverNode,
  walkPath,
  scope,
  adapter,
  path = null,
  usageNode = null,
  ignoreWrittenSlots = false,
  allowUninitializedCallee = false,
  unionSink = null,
  rescuesReceiverRead = false,
  rescueSink = null,
  conditionalSink = null,
  selectionSink = null,
  navKeys = 0,
  preservesSelection = false,
  reportNonStatic = false,
  resolveLeaf = null,
}) {
  // `usageNode` overrides the walk's initial read site (a wrapper's capture point); the step
  // otherwise anchors at the host `path` node. `reportNonStatic` distinguishes a proven
  // fresh replacement (false) from an unresolved receiver (null) for closed caller proofs.
  return walkStaticReceiverStep({ node: receiverNode, readNode: usageNode, ctx: { scope, adapter, path } }, {
    walkPath,
    ignoreWrittenSlots,
    allowUninitializedCallee,
    unionSink,
    rescuesReceiverRead,
    rescueSink,
    conditionalSink,
    selectionSink,
    navKeys,
    preservesSelection,
    reportNonStatic,
    resolveLeaf,
  });
}

// does the static receiver walk stand on an ARRAY LITERAL at the end of `walkPath`? an array
// pattern's index reads an element of one and nothing else: over an object, a function, a realm the
// source THROWS (not iterable), which no claim may erase - and the walk spells an index as a key an
// object level answers too (`{ 0: Array }`), so every index hop it is about to take is asked here
// first, with the level's own name resolution (aliases, calls, arms) behind the question
const ARRAY_LEVEL = '[array]';
function walksToArrayLevel({ receiverNode, walkPath, scope, adapter, path, usageNode = null }) {
  return walkStaticReceiverChain({
    receiverNode,
    walkPath,
    scope,
    adapter,
    path,
    usageNode,
    resolveLeaf: hop => unwrapExpressionChain(hop.node)?.type === 'ArrayExpression' ? ARRAY_LEVEL : null,
  }) === ARRAY_LEVEL;
}

// the discard-rescue harvest PLUS the receiver READ a static descent could only name by running an
// object-literal GETTER: that read is observable exactly once, and a discard erasing the member would
// drop its effects - the accessor twin of the SE-bearing chain-root call the harvest already rescues.
// the whole read replays every effect buried in it, in source order, so it REPLACES the harvest
// rather than joining it, the way a rescued-WHOLE chain assignment already does. asked only by the
// channels that DROP a receiver outright: a receiver whose text survives keeps its own effects
export function discardRescueNodesWithReads({ node, scope, adapter, path }) {
  if (readRunsAccessor({ node, scope, adapter, path })) return [node];
  const decided = decidedFallbackRescueNodes({
    node, scope, adapter, path, rescue: element => discardRescueNodesWithReads({ node: element, scope, adapter, path }),
  });
  if (decided) return decided;
  const { prefix, tail } = peelNestedSequenceExpressions(node);
  if (prefix.length) {
    const kept = prefix.flatMap(element => mayHaveSideEffects(element) ? [element]
      : discardRescueNodesWithReads({ node: element, scope, adapter, path }));
    if (kept.some(element => !mayHaveSideEffects(element))) {
      return [...kept, ...discardRescueNodesWithReads({ node: tail, scope, adapter, path })];
    }
  }
  // the slot walk answers a GAP, never a second opinion: where the harvest already names what runs,
  // descending would re-spell the same effect through a narrower span and leave the two legs
  // replaying different text for one source
  const harvested = discardRescueNodes({ node, scope, adapter, path });
  return harvested.length ? harvested : containerSlotRescueNodes({ node, scope, adapter, path }) ?? harvested;
}

// does a dropped init still run something where it stood: an effect, or a receiver READ only a getter
// could name (the harvest above, which `mayHaveSideEffects` calls pure). both legs ask it of an init a
// static claim empties, to keep what it owes ahead of the claim
export function initRunsCode(node, { scope, adapter, path }) {
  return mayHaveSideEffects(node) || discardRescueNodesWithReads({ node, scope, adapter, path }).length > 0;
}

// what discarding a value owes where a `||` / `??` its LEFT always decides it: the right never runs, so
// the discard owes the effectful prefix the source ran ahead of it and what that left owes (`(n++, f() ||
// Set)` owes `n++, f()`), each element answered by `rescue`; null for every other value
function decidedFallbackRescueNodes({ node, scope, adapter, path, rescue }) {
  const { prefix, tail } = peelNestedSequenceExpressions(node);
  const decided = decidingFallbackLeft(tail, { scope, adapter, path });
  return decided && [...prefix, decided].flatMap((element, at) => at < prefix.length && mayHaveSideEffects(element)
    ? [element] : rescue(element));
}

// the base discard rescue (`discardRescueNodes`) of a receiver a claim's swap erases, asked of the
// operand its value comes from: a `||` / `??` its left decides drops its right unrun, as the member
// meta's own harvest does
export function erasedReceiverRescueNodes({ node, scope, adapter, path }) {
  return decidedFallbackRescueNodes({
    node, scope, adapter, path, rescue: element => discardRescueNodes({ node: element, scope, adapter, path }),
  }) ?? discardRescueNodes({ node, scope, adapter, path });
}

// does READING this member run an accessor with effects: a getter the static receiver walk names whose
// body runs something beside its return? the read half of the discard canon, and the hook a scoped
// `mayHaveSideEffects` asks of each member read through the adapter. a read that re-enters an accessor
// this question is already walking answers yes - at runtime that getter recurses into itself too
const ACCESSOR_READS_IN_WALK = new Set();
export function readRunsAccessor({ node, scope, adapter, path }) {
  if (!scope) return false;
  if (ACCESSOR_READS_IN_WALK.has(node)) return true;
  ACCESSOR_READS_IN_WALK.add(node);
  try {
    const reads = [];
    staticContainerReceiverName({ node, scope, adapter, path, rescuesReceiverRead: true, rescueSink: reads });
    return reads.length > 0;
  } finally {
    ACCESSOR_READS_IN_WALK.delete(node);
  }
}

// is the value a surviving residual reads an INVOCATION (`invocationNode`) whose discard would rescue
// an effect (a call to an effectful callee, an IIFE, a method, a tag, a `new`, an `await`)? the
// destructure reads its receiver off that run, so no lift can move the run ahead of the bindings: an
// extraction written ahead of the residual binds first, and the callee can read the binding (a
// `var`, a lexical one's TDZ) - the extraction lands behind the residual, a receiver-less static
// included. Literal slot effects can lift ahead of every binding; a spread instead keeps the
// literal whole, since its getter/iterator reads cannot be replayed from its argument alone.
// One answer for every leg's placement of the two.
export function residualInitRunsEffects({ init, scope, adapter, path }) {
  const value = init && installedWriteValue(init);
  if (invocationNode(value)) return discardRescueNodes({ node: value, scope, adapter, path }).length > 0;
  // ... and a MEMBER read runs code too where a getter answers it (the rescue canon replays the read
  // whole), its object is spelled with a call (`[f()][0]`), or a sequence prefix INSIDE the read
  // carries an effect (`(eff(), globalThis).Map`): the lifts take only the init's own top-level
  // prefix, and one below a member runs where the read does
  const read = unwrapRuntimeExpr(value);
  if (read?.type === 'ObjectExpression' || read?.type === 'ArrayExpression') {
    return discardRescueNodesWithReads({ node: value, scope, adapter, path })[0] === value;
  }
  if (!isMemberAccessNode(read)) return false;
  if (discardRescueNodesWithReads({ node: value, scope, adapter, path })[0] === value) return true;
  let object = read;
  let prefixRuns = false;
  function onPrefix(expressions) {
    if (expressions.slice(0, -1).some(expression => mayHaveSideEffects(expression, { scope, adapter, path }))) prefixRuns = true;
  }
  while (isMemberAccessNode(object)) object = peelSequenceTail(unwrapRuntimeExpr(object.object), { onPrefix, step: unwrapRuntimeExpr });
  const literal = object?.type === 'ArrayExpression' || object?.type === 'ObjectExpression';
  return (prefixRuns || !!invocationNode(object) || (literal && mayHaveSideEffects(object, { scope, adapter, path })))
    && discardRescueNodes({ node: value, scope, adapter, path }).length > 0;
}

// is a declaration RESIDUAL dead once its claims are served: every leaf a sentinel whose key runs
// nothing, no level keeping one for itself (a rest), no default that runs code, and an init that runs
// nothing either. Each quiet read the husk would still perform is one an extraction already
// performed, and repeating it can fire a user getter twice, so both legs drop it. Spreads remain
// observable through the same scoped effect predicate used by the rescue and placement canons.
export function residualHuskIsDead({ pattern, init, isSentinel, scope, adapter, path }) {
  return pattern?.type === 'ObjectPattern' && patternFullyConsumed(pattern, prop => isPropertyNode(prop)
    && !computedKeyHasSideEffects(prop, { scope, adapter, path }) && prop.value?.type === 'Identifier' && isSentinel(prop.value),
  { scope, adapter, path })
    && !(init && mayHaveSideEffects(init, { scope, adapter, path }));
}

// the elements of a discarded sequence PREFIX that still run something: an effect, or a receiver
// read only a getter answers (the scoped predicate)
export function observablePrefixElements(expressions, { scope, adapter, path }) {
  return expressions.filter(expression => mayHaveSideEffects(expression, { scope, adapter, path }));
}

// what a discarded effectful init still owes as the statement the lift spells: the init whole where its
// tail performs a read the rescue keeps, else the observable elements of its sequence, else the tail -
// the dead tail of `(eff(), { C: [] })` is a comma the source wrote, not work it did. a wrapper leaves
// with the value it wraps, and a selection the build decides behind the prefix with what runs of it
// (`decidedRunningValue`): `(a(), T ? (b(), Map) : Object)` owes `a(), b()`, not a read of the folded `Map`
export function liftedInitElements(node, { scope, adapter, path }) {
  const init = unwrapRuntimeExpr(node);
  if (init?.type !== 'SequenceExpression'
    || discardRescueNodesWithReads({ node: init, scope, adapter, path })[0] === init) return [init];
  const prefix = [];
  const tail = decidedRunningValue(init, { scope, adapter, path }, prefix);
  const observed = observablePrefixElements([...prefix, tail], { scope, adapter, path });
  return observed.length ? observed : [tail];
}

// the split a lift takes off a value it moves ahead of an extraction: the sequence prefix
// (`peelNestedSequenceExpressions`) and the receiver the residual goes on reading - continued past a selection the
// build decides into the operand of it that runs (`decidedRunningValue`), whose own prefix runs before the value too
// (`(a(), T ? (b(), Map) : Object)` lifts `a(), b()` and leaves `Map`)
export function liftedPrefixSplit(node, ctx) {
  const split = peelNestedSequenceExpressions(node);
  if (!ctx?.adapter || decidedRunningOperand(split.tail, ctx) === split.tail) return split;
  const prefix = [...split.prefix];
  return { prefix, tail: decidedRunningValue(split.tail, ctx, prefix) };
}

// a dropped CONTAINER literal evaluates every slot where the source built it, and a slot holding a
// read only an accessor could answer runs there. asked of each slot on its own - the same question
// the whole node asks - so what answers is replayed in source order instead of leaving with the drop
function containerSlotRescueNodes({ node, scope, adapter, path }) {
  const literal = unwrapRuntimeExpr(unwrapExpressionChain(node));
  const slots = literal?.type === 'ArrayExpression' ? literal.elements
    : literal?.type === 'ObjectExpression'
      ? literal.properties.map(prop => isPropertyNode(prop) && prop.value) : null;
  if (!slots) return null;
  // a slot spelled as a SEQUENCE hands back only what is OBSERVABLE in it: the dead tail is a comma
  // the source wrote, not work it did, and keeping it left the two legs replaying different text
  const rescued = slots.filter(Boolean)
    .flatMap(slot => discardRescueNodesWithReads({ node: slot, scope, adapter, path }))
    .flatMap(rescue => rescue.type === 'SequenceExpression'
      ? observableSequenceElements(rescue.expressions, { scope, adapter, path }) : [rescue]);
  return rescued.length ? rescued : null;
}

// Resolve a member or alias through the shared container walk, including literal and call roots.
// Binding values must reach the use; slot writes are checked separately. Closed callers can
// refine a parameter candidate; `unionSink` collects alternatives for import-only consumers, and
// `selectionSink` the constructors disagreeing selection arms name for a caller guarding the read.
// `rescuesReceiverRead` / `rescueSink` permit an accessor-derived value only when the caller
// will replay the receiver read it discards. `resolveLeaf` asks the walk's provenance question of the
// slot the read stands on (`walkStaticReceiverChain`).
export function staticContainerReceiverName({
  node,
  scope,
  adapter,
  path,
  unionSink = null,
  rescuesReceiverRead = false,
  rescueSink = null,
  conditionalSink = null,
  selectionSink = null,
  resolveLeaf = null,
}) {
  // the SEQUENCE hands its tail on, and that tail is the container this chain stands on - a prefix's
  // effects change nothing about WHICH one. the shared peel stops on an effectful prefix, which is
  // the right answer for a caller about to rewrite through the node and the wrong one here: this
  // walk only NAMES the receiver, and standing down dropped the injection whole
  // (`(eff(), { h: { g: globalThis } }).h.g.Symbol` resolved to nothing at all) - at the node itself
  // too, so a receiver read the tail performs answers for the whole node (`(eff(), K.g)`)
  const { root: chainRoot, keys } = memberChainKeys(peelSequenceTail(unwrapTransparentSeq(node), { step: unwrapTransparentSeq }),
    member => containerKeyName(member, { scope, adapter, path }));
  if (keys.includes(null)) return null;
  const spelled = peelSequenceTail(unwrapTransparentSeq(chainRoot), { step: unwrapTransparentSeq });
  // ... and a STORE of a container spelled in place, or of a selection of them, hands that value on: the chain
  // stands on it (`(B = { C: Map }).C`). a stored navigation stays the chain-assignment channel's
  const stored = unwrapTransparentSeq(installedWriteValue(spelled));
  const root = CENSUS_CONTAINER_TYPES.has(stored?.type) || getFallbackBranchSlots(stored) ? stored : spelled;
  // a root with NO binding to look up stands the walk up directly, in the two spellings that have
  // one: an invocation FORWARDING a container (`const plain = () => ({ window: { Array } });
  // plain()?.window?.Array.of(13)`, any spelling `realmYieldingCallView` admits), which the walk's
  // own call hop peels, and the container LITERAL
  // spelled in place (`({ h: { g: globalThis } }).h.g.Map`), which its terminal descends - the same
  // root the fold accepts, only with nothing to dereference ahead of the descent. a selection of such
  // literals spelled in place stands one up too: the terminal takes the operand a decided one yields, and
  // walks an undecided one's arms into the union
  const selection = !!getFallbackBranchSlots(root) && (!!unionSink || decidedSelectionValue(root, { scope, adapter, path }) !== root);
  if (realmYieldingCallView(root, { scope, adapter, path })
    || ((canHoldBuiltIn(root) || selection) && root.type !== 'Identifier' && !invocationNode(root))) {
    if (!keys.length && !unionSink) return null;
    const name = walkStaticReceiverStep({ node: root, readNode: root, ctx: { scope, adapter, path } }, {
      walkPath: keys,
      unionSink,
      conditionalSink,
      selectionSink,
      rescuesReceiverRead,
      rescueSink,
      navKeys: rescuesReceiverRead ? keys.length : 0,
      resolveLeaf,
    });
    return keys.length ? name : null;
  }
  if (root?.type !== 'Identifier') return null;
  const binding = adapter.getBinding({ scope, name: root.name, path, read: root });
  const parameter = binding?.path ?? binding?.declarationPath;
  if (!keys.length && binding?.kind === 'param'
    && !binding.constantViolations?.length && PARAMETER_STATIC_SOURCES.get(parameter?.node)?.keys) {
    // The key-only census is a candidate, not a value proof. Its closed caller sources
    // use the container walk here; the bare-name resolver reads only the completed fact.
    const cache = adapter.parameterStaticSources;
    if (cache.has(parameter.node)) {
      const cached = cache.get(parameter.node);
      return typeof cached === 'string' ? cached : null;
    }
    cache.set(parameter.node, null);
    const sites = adapter.parameterCallSites?.(parameter, { staticIsMutated: adapter.isMutatedStatic });
    const nonStatic = { nonStatic: true };
    const source = sites?.length ? parameterStaticSource(sites, null, (value, { callPath }) => {
      const object = walkStaticReceiverChain({ receiverNode: value, walkPath: [], usageNode: value,
        scope: callPath.scope, adapter, path: callPath, reportNonStatic: true });
      return object === false ? nonStatic : object && isKnownGlobalName(object) ? object : null;
    }) : null;
    cache.set(parameter.node, source);
    return typeof source === 'string' ? source : null;
  }
  const declaratorNode = binding?.path?.node ?? binding?.node;
  if (!declaratorNode) return null;
  // a bare name walks only as an ALIAS - of a nav (`const a = r.w; a.values`), which the walk folds
  // into its path, or of another name it then follows; any other bare read has nothing to descend.
  // a for-of head NAME holds its element, as the walk's own hop reads it; a name a head pattern
  // binds reads a slot of it, which only the walk's descent answers
  const headElement = declaratorNode.id?.type === 'Identifier' ? forOfHeadElement(binding, root.name) : null;
  const aliasInit = unwrapTransparentSeq(installedWriteValue(declaratorNode.init ?? headElement ?? null));
  // ... or of a SELECTION, whose arms the walk's terminal folds to one name where they agree.
  // A reaching write may capture a member instead.
  if (!keys.length && !isDestructurePattern(declaratorNode.id) && aliasInit?.type !== 'Identifier'
    && !memberNavFold(aliasInit, { scope, adapter, path })
    && !getFallbackBranchSlots(peelFallbackReceiver(aliasInit, adapter.isMutatedStaticSlot ?? adapter.isMutatedStatic))) {
    if (!isReassignedBeyondDeclarator(binding)) return null;
    const reaching = reachingReassignmentValueNode({
      binding, usagePath: path, usageNode: node, ctx: { scope, adapter, path, resolveKey: sharedResolveKey },
      requireSingleObservation: adapter.method === 'usage-pure',
    });
    const trusted = reaching ? null : trustedIdentifierAliasWrite({ scope, name: root.name, adapter, path, readNode: node });
    const valueScope = trusted ? writeScopeAt(path, trusted, scope) : aliasDeclScope(binding, scope);
    if (!memberNavFold(unwrapTransparentSeq(reaching ?? trusted?.right), { scope: valueScope, adapter, path })) return null;
  }
  // the entry half of the walk's own per-hop dominance gate, and it stands down on exactly what the
  // walk answers better: a REASSIGNED binding's init may be dead, and the hop's reassignment channel
  // resolves the value that reaches the read instead. an unreassigned binding has only its
  // declarator, so the entry verdict is the walk's verdict and asking once here costs a walk
  if (!isReassignedBeyondDeclarator(binding)
    && !initializerReachesRead({ adapter, binding, declaratorNode, usagePath: path, usageNode: node })) return null;
  return walkStaticReceiverChain({
    receiverNode: root,
    walkPath: keys,
    scope,
    adapter,
    path,
    unionSink,
    rescuesReceiverRead,
    rescueSink,
    conditionalSink,
    selectionSink,
    navKeys: rescuesReceiverRead ? keys.length : 0,
    resolveLeaf,
  });
}

// the element a for-of head binding reads on every pass, or null: the sole element, or the first
// where the elements agree - same-named calls included, since the walk resolves an element rather
// than mirroring into it. a head PATTERN reads its slots off that element (the caller descends the
// pattern); a declarator a relocation re-spelled in place (`{ from, ...rest }` -> `_ref`) still
// carries the binding of the names its pattern had, and holds none of their values
function forOfHeadElement(binding, name) {
  const declaratorPath = bindingDeclarationPath(binding);
  const id = declaratorPath?.node?.id;
  if (!declaratorPath || (id?.type === 'Identifier' && id.name !== name)) return null;
  return installedWriteValue(forOfHeadElements(declaratorPath, { sameCallee: true })?.[0] ?? null);
}

// the slot key a container read spells: its static name, or a computed key the key canon folds -
// a const alias of a string (`const k = 'g'; o[k]`); a symbol names no slot a literal spells here
// Pure must not turn an effectful realm hop declined by the name walk into a container path.
// A same-named slot on a user container still follows the ordinary container rules.
function containerKeyName(member, { scope, adapter, path }) {
  const key = staticMemberKeyName(member)
    ?? (member.computed ? sharedResolveKey({ node: member.property, computed: true, scope, adapter, path })
      : privateReadKeyName(member, path, adapter));
  if (adapter.method === 'usage-pure' && member.computed && POSSIBLE_GLOBAL_OBJECTS.has(key)
    && !sharedResolveKey({ node: member.property, computed: true, scope, adapter, path, bailOnSideEffectKey: true })
    && isPristineProxyGlobal(adapter, resolveObjectName({
      objectNode: member.object, scope, adapter, path, readNode: member.object,
    }))) return null;
  return typeof key === 'string' && !key.startsWith('Symbol.') && (!key.startsWith('#') || !member.computed) ? key : null;
}
function privateReadKeyName(member, path, adapter) {
  const spelled = privateNameSpelling(member.property);
  const object = unwrapRuntimeExpr(member.object);
  const at = spelled && object?.type === 'Identifier' ? pathOfNode(path, member) : null;
  for (let up = at?.parentPath; up?.node; up = up.parentPath) {
    if (!CLASS_NODE_TYPES.has(up.node.type) || up.node.body.body.every(m => privateNameSpelling(m.key) !== spelled)) continue;
    const binding = adapter.getBinding({ scope: at.scope, name: object.name, path: at });
    return (binding?.path?.node ?? binding?.node) === up.node ? spelled : null;
  }
  return null;
}

// a member nav with readable keys and a root the walk can STAND on, split for the walk (`r.w.x` ->
// root `r`, keys `['w', 'x']`); null for any other spelling. the root is whatever can hold a
// built-in, not only a name: a container spelled IN PLACE (`({ h: { g: globalThis } }).h`,
// `([{ g: globalThis }])[0]`, a class expression's statics) reaches the very slot the bound spelling
// reaches, and the walk's terminal descends the literal either way - gating the fold on a name
// stranded every nav whose chain starts at the container itself. so does a CALL standing where a
// container is due: it IS the container it yields (the terminal's call arm), and an alias of a slot
// off it (`const n = f(Map).n; n.b`) reads the yielded literal the direct spelling reads. a
// transparent sequence around the root peels with it (`(0, w).h`), its tail being the value the
// nav reads; a prefix that may have effects does not peel, so that spelling stays unfoldable
function memberNavFold(node, ctx) {
  const { root, keys } = memberChainKeys(node, member => containerKeyName(member, ctx));
  // the sequence peel here answers WHICH container the nav stands on, so an effectful prefix is no
  // reason to stand down - the same split the receiver namer above spells
  const stem = peelSequenceTail(unwrapTransparentSeq(root), { step: unwrapTransparentSeq });
  return canHoldBuiltIn(stem) && keys.length && !keys.includes(null) ? { root: stem, keys } : null;
}

// re-root the walk at a nav's fold: the fold's keys lead the remaining path and its root becomes the
// hop. The old container no longer owns the folded keys, even when the new root is a NAME that
// cannot be bound in this scope. Drop its bookkeeping before the loop establishes the new owner;
// otherwise an unknown root re-enters the old container's wildcard writes at every folded hop.
// Pure checks the remaining path before dropping that original owner, since a reaching write
// there prevents rewriting the read.
// A fold asks a new question (the root at a longer key path), so the name guard restarts beside it:
// a getter re-entering its own class at another key is no cycle. Re-folding a nav this path has
// already folded is one - two bindings written with reads off each other (`a = b.next` beside
// `b = a.prev`) fold each other's navs at every level of their reassignment unions, and the depth
// cap bounds such a walk's length, not its branching
function foldNavIntoWalk({ hop, walk }, node) {
  if (walk.foldedNavs.includes(node)) return null;
  const fold = memberNavFold(node, hop.ctx);
  if (!fold) return null;
  const { adapter } = hop.ctx;
  const { walkPath, depth, containerName, containerNode, containerPath } = walk;
  const rerooted = {
    ...walk,
    walkPath: [...fold.keys, ...walkPath],
    depth: depth + 1,
    foldedNavs: [...walk.foldedNavs, node],
    // the fold's keys are the RECEIVER EXPRESSION's own: a discard drops that text whole and the
    // caller replays it whole, so a getter read at one of them is rescuable. the keys the PATTERN
    // consumes below them are not - erasing one of those leaves no text to replay it
    navKeys: walk.rescuesReceiverRead ? fold.keys.length : 0,
    // ... and only while the nav is the discarded text's own: one reached through a bound name ran at
    // that binding, so its getter names the value without a replay owed
    rescueSink: walk.inNode ? walk.rescueSink : null,
    // With no remaining hop the alias captured this member's VALUE at its declaration.
    // Otherwise it captured a container whose remaining slots are read at the later use.
    slotReadNode: walkPath.length ? walk.slotReadNode : hop.readNode,
  };
  if (containerName && adapter.method === 'usage-pure'
    && adapter.isWrittenContainerSlot?.(
      containerName, [...containerPath, ...walkPath], containerNode, hop.ctx.path, walk.slotReadNode,
    )) return null;
  return walkStaticReceiverStep({ ...hop, node: fold.root, seen: new Set() }, {
    ...rerooted,
    containerName: null,
    containerNode: null,
    containerPath: [],
  });
}

// where the walk goes on from a call's YIELDED container: the LITERAL the callee built, in the callee's
// declaration scope, where every name it spells resolves. the hop stands on the call, in the scope it
// is spelled in - the callee is the inline canon's to reach, by name or invoker as much as inline.
// `yieldedArgs` rides the descent: a slot of that literal the callee fills from a parameter holds the
// argument passed at that parameter's index, read at the call site, or nothing a reader can prove
// (`yieldedSlotValue`), so the slot is one more slot of the container - its written-slot consult and
// union apply to it as to any other. `{ node, scope, seen, yieldedArgs }`, or null where the call
// yields no container
function yieldedContainerStep(hop, allowUninitializedCallee = false) {
  const yielded = pairedYieldedContainer(hop, {
    rejectConditional: hop.ctx.adapter.method !== 'usage-global', allowUninitializedCallee,
  });
  return yielded ? {
    node: yielded.literal,
    scope: yielded.scope,
    seen: yielded.seen,
    yieldedArgs: { paramArgs: yielded.paramArgs, scope: hop.ctx.scope, seen: hop.seen },
  } : null;
}

// the hop a container descent reads a slot VALUE at: where the slot is one a call's yielded literal
// fills from a parameter (`yieldedContainerStep`), the argument the call passed there, at the call
// site, or null where that parameter proves nothing - else the value itself, where the container stands
function slotValueHop({ hop, walk }, value) {
  const { yieldedArgs } = walk;
  const read = yieldedArgs ? yieldedSlotValue(yieldedArgs.paramArgs, value) : value;
  if (read === value) return { ...hop, node: value };
  return read && { ...hop, node: read, seen: yieldedArgs.seen, ctx: { ...hop.ctx, scope: yieldedArgs.scope } };
}

// the global constructor a slot write's value names at its own write, or null: a static owner the
// replacement proof below can hand on. read once per value however many reads of the slot ask
const writtenStaticOwnerNames = new WeakMap();
function writtenStaticOwnerName(value, writePath, adapter) {
  let names = writtenStaticOwnerNames.get(adapter);
  if (!names) writtenStaticOwnerNames.set(adapter, names = new WeakMap());
  if (names.has(value)) return names.get(value);
  let name = unwrapTransparentSeq(value)?.type === 'Identifier'
    ? resolveObjectName({ objectNode: value, scope: writePath.scope, adapter, path: writePath, usageNode: value }) : null;
  if (!name || !isKnownStaticGlobal(name, adapter) || POSSIBLE_GLOBAL_OBJECTS.has(name)) name = null;
  names.set(value, name);
  return name;
}

// the walk takes the hop standing on the receiver and the walk's OPTIONS beside it: `walkPath`
// (the keys left to descend), `depth`, `ignoreWrittenSlots`, `unionSink` (see `walkStaticReceiverChain`),
// plus where the walk stands relative to the CONTAINER it last dereferenced - the binding's name
// and the keys consumed under it. those two ride the options rather than the step, or the
// recursion into a nested literal would forget which container it is inside and the written-slot
// consult could only ever fire on the first hop. `yieldedArgs` rides them the same way, for the
// literal a call yields (`yieldedContainerStep`), and `foldedNavs` for the navs this path folded
// (`foldNavIntoWalk`)
// eslint-disable-next-line max-statements -- receiver proofs and guarded alternatives share the same walk
function walkStaticReceiverStep(hop, {
  walkPath,
  depth = 0,
  ignoreWrittenSlots = false,
  allowUninitializedCallee = false,
  unionSink = null,
  containerName: enteredName = null,
  containerNode: enteredNode = null,
  containerPath = [],
  yieldedArgs = null,
  slotReadNode = hop.readNode ?? hop.ctx.path?.node ?? null,
  preservesSelection = false,
  rescuesReceiverRead = false,
  rescueSink = null,
  conditionalSink = null,
  selectionSink = null,
  navKeys = 0,
  reportNonStatic = false,
  resolveLeaf = null,
  inNode = true,
  foldedNavs = [],
}) {
  if (depth > STATIC_WALK_DEPTH) return null;
  const { adapter, path = null } = hop.ctx;
  let current = unwrapTransparentSeq(hop.node);
  let currentScope = hop.ctx.scope;
  // where the CURRENT hop is read: the host use for the first alias, then each prior hop's declarator
  // (`const a = b` reads `b` there). the reassignment-dominance check must use this read site - a write
  // to an intermediate hop AFTER its read can't change the captured value (`const a = b; b = 0; { from }
  // = a` keeps Array). the adapter surfaces the declarator at `binding.node` (no path), so thread the
  // NODE; `path` (binding lookup / terminal / scope owner) stays the host so only the textual position moves.
  // a recursive container descent (object-literal value / class static field) hands the CONTAINER's
  // capture site in as the hop's `readNode` - the value was captured when the container literal / class
  // was evaluated, so a write AFTER that (but before the final host read) can't change it either; without
  // this the recursion reset the read site to the host and over-bailed a reassign-after-capture value
  let readNode = hop.readNode ?? path?.node ?? null;
  let hops = 0;
  // per-walk cycle guard: `const a = b; const b = a` (mutually-aliased identifiers) would
  // bounce between names until STATIC_WALK_DEPTH burns out. Set short-circuits at the
  // second visit with O(1) check, complementing the depth cap as a defensive lower bound
  const visited = hop.seen ?? new Set();
  let containerName = enteredName;
  let containerNode = enteredNode;
  // dereferencing a bound name puts the walk INSIDE that container: the keys consumed above
  // belonged to whatever the name aliased, so the slot path restarts here
  // ... with the DECLARING node beside the name: the written-slot record is keyed by declaration,
  // so the question about a container is asked of its own binding, never of a namesake's
  function enterContainer(name, node) {
    containerName = name;
    containerNode = node ?? null;
    containerPath = [];
  }
  // the hop the walk stands on right now, and the walk's options as they stand - for the per-hop
  // dispositions and the terminal
  function standing() {
    return {
      hop: {
        node: current,
        readNode,
        seen: visited,
        ctx: { scope: currentScope, adapter, path, resolveKey: sharedResolveKey },
      },
      walk: {
        walkPath,
        depth,
        ignoreWrittenSlots,
        allowUninitializedCallee,
        unionSink,
        containerName,
        containerNode,
        containerPath,
        yieldedArgs,
        slotReadNode,
        preservesSelection,
        // how many bound names the walk dereferenced to stand here: the branching fold reads it to
        // tell an ALIAS of a selection from a selection spelled in place
        dereferencedHops: hops,
        rescuesReceiverRead,
        rescueSink,
        // is the hop still INSIDE the text the caller discards? a dereferenced name walks its own
        // declaration's text, which ran where the source wrote it
        inNode: inNode && !hops,
        conditionalSink,
        selectionSink,
        navKeys,
        reportNonStatic,
        resolveLeaf,
        foldedNavs,
      },
    };
  }
  // the class-binding disposition, moved out whole: it advances the same three cursors the
  // container arm does, including the owner needed to consult writes to static fields.
  let classHopEnded = false;
  function takeClassBindingHop(binding) {
    const step = classBindingHop({ ...standing(), binding, name: current.name });
    if (!step) return null;
    if (step.leaf) return step.leaf;
    if (step.follow) {
      current = unwrapTransparentSeq(step.follow.node);
      currentScope = step.follow.scope;
      readNode = step.follow.node;
      return CONTINUE_HOP;
    }
    enterContainer(current.name, step.descend);
    current = step.descend;
    readNode = current;
    classHopEnded = true;
    return CONTINUE_HOP;
  }
  // dereference const-bound Identifier through its VariableDeclarator initializer,
  // chasing re-aliases (`const Foo = Array; const wrapper = { a: Foo }`) until we
  // either land on an unbound Identifier (the global - leaf name we return) or an
  // ObjectExpression (intermediate hop for further key descent). `path` threads through
  // to `adapter.hasBinding` so unplugin's estree-toolkit scope tracker reaches the
  // TS-runtime fallback (`declare const X` / namespace-body bindings)
  // ... and hands the identifier itself as the read: past the first hop it is an initializer, read where
  // its declarator stands rather than at the use `path` anchors
  while (current?.type === 'Identifier' && adapter.hasBinding({ scope: currentScope, name: current.name, path, read: current })) {
    if (++hops > STATIC_WALK_DEPTH || visited.has(current.name)) return null;
    visited.add(current.name);
    const binding = adapter.getBinding({ scope: currentScope, name: current.name, path, read: current });
    if (resolveLeaf && !walkPath.length) {
      const source = resolveLeaf(standing().hop);
      if (source) return source;
    }
    const rewritten = !resolveLeaf && pluginRewrittenHopName(binding, standing().hop);
    if (rewritten) {
      // the name the hop resolves to stands where the alias is declared, as its initializer would
      current = { type: 'Identifier', name: rewritten };
      currentScope = aliasDeclScope(binding, currentScope);
      readNode = (binding.path?.node ?? binding.node) ?? readNode;
      break;
    }
    const bindingType = bindingNodeType(binding);
    // a class binding is REASSIGNABLE (`class Foo {}` then `Foo = X` is legal, unlike const), so a
    // reassignment that dominates the read makes the declared name unreliable - gate the class arms
    // exactly like the VariableDeclarator arm below. absent a dominating reassignment the identifier
    // name reliably identifies the declaration: a class-bound leaf at empty walkPath returns its name
    // (matching the empty-walkPath / unbound-Identifier path below for the canonical-name return
    // contract), and a non-empty walkPath descends the class's STATIC fields. enables `class Foo {};
    // const NS = {Foo}; walkStaticReceiverChain(NS, ['Foo'])` to return 'Foo' (otherwise would bail
    // here since ClassDeclaration isn't VariableDeclarator). a class EXPRESSION's own name, bound inside
    // its body, takes the same hop
    if (bindingType === 'ClassDeclaration' || bindingType === 'ClassExpression') {
      const step = takeClassBindingHop(binding);
      if (step !== CONTINUE_HOP) return step;
      if (classHopEnded) break;
      continue;
    }
    if (bindingType !== 'VariableDeclarator') return null;
    if (!binding) return null;
    // a function-scoped `var` whose assignment is CONDITIONAL (`if (c) { var G = globalThis }`) holds
    // that value only on paths through the branch, and a lexical binding read ahead of its own
    // initializer holds nothing. usage-pure rewrites the read receiver-less, DROPPING the access that
    // would throw on the other path, so it resolves on proof alone; global / entry keep the call site
    // (a side-effect import only) and stay sound either way. the entry above applies the same gate to
    // the FIRST hop - a caller reaching this walk directly (the destructure plan's own static walk)
    // gets it here, where every hop passes
    // A loop element is a possible guard arm even when a var initializer cannot dominate - read
    // down the pattern slot the name takes off it, as the hop below reads the element itself
    const elementPath = unionSink && destructureLeafWalkPath({ binding, name: current.name, scope: currentScope, adapter, walkPath });
    if (elementPath) walkAlternativesIntoSink({
      ...standing(), values: forOfHeadIterableElements(bindingDeclarationPath(binding)) ?? [], walkPath: elementPath,
    });
    // ... and so is a default the pattern spells on the name's way down: it holds the value wherever
    // the slot comes up undefined
    const declaredId = binding.path?.node?.id ?? binding.node?.id;
    if (unionSink && adapter.method === 'usage-global' && isDestructurePattern(declaredId)) walkAlternativesIntoSink({
      ...standing(), values: patternSlotValues(declaredId, null, current.name), walkPath,
    });
    const blocked = blockedContainerHop({ ...standing(), binding, name: current.name });
    if (blocked !== CLEAR_HOP) {
      if (!blocked) return null;
      enterContainer(current.name, binding.path?.node ?? binding.node);
      current = unwrapTransparentSeq(blocked.node);
      currentScope = blocked.scope;
      // the reaching value was READ at its write site - the next hop's dominance proofs anchor
      // there (`a = b; b = x; a.k` captured b BEFORE `b = x`, which therefore does not block)
      readNode = blocked.node;
      continue;
    }
    // ... and the init the hop still holds has to have RUN by the read. asked HERE, below the
    // reassignment channel, because a hop whose init a later write replaced never observes that
    // init: the branch above already handed the walk the reaching value, proved on its own terms,
    // and judging the dead declarator's branch up there bailed a read the plan lane resolves - the
    // order `followConstIdentifierInit` already keeps for the same pair of questions
    if (adapter.method === 'usage-pure' && !initializerReachesRead({
      adapter, binding, declaratorNode: binding.path?.node ?? binding.node, usagePath: path, usageNode: readNode,
    })) return null;
    collectReassignedHopUnion({ ...standing(), binding, name: current.name });
    // All recorded writes agree on one constructor and a write dominates this read: the
    // literal's old candidate is dead. Resolve at each write's scope; pure keeps the written
    // slot's native read, without manufacturing a guard for the discarded initial value.
    if (!ignoreWrittenSlots && walkPath.length
      && adapter.isWrittenContainerSlot?.(current.name, walkPath, binding.path?.node ?? binding.node, path, slotReadNode)) {
      const replacementName = adapter.containerSlotWriteDominatesUsage?.(walkPath, binding.path?.node ?? binding.node, path,
        slotReadNode, writtenStaticOwnerName);
      if (replacementName) return adapter.method === 'usage-pure' ? null : replacementName;
    }
    // A fresh replacement can kill the literal's candidate without naming a new constructor.
    // The slot is read at its use even when its container identity was captured earlier.
    const replacedAt = !ignoreWrittenSlots
      ? walkPath.findIndex((key, at) => adapter.containerSlotWriteDominatesUsage?.(walkPath.slice(0, at + 1),
        binding.path?.node ?? binding.node, path, slotReadNode)) : -1;
    if (replacedAt !== -1) {
      if (unionSink) walkAlternativesIntoSink({
        ...standing(),
        values: adapter.writtenContainerSlotValues?.(current.name, walkPath.slice(0, replacedAt + 1),
          binding.path?.node ?? binding.node) ?? [],
        walkPath: walkPath.slice(replacedAt + 1),
      });
      return reportNonStatic && replacedAt === walkPath.length - 1 ? false : null;
    }
    // adapter divergence: babel exposes the VariableDeclarator at `binding.path.node`,
    // estree-toolkit at `binding.node` directly. fall through both shapes. chain-assignment
    // in init (`const wrapper = (x = {a: Array})`) evaluates to its right operand at runtime -
    // the shared peel alternates paren/chain to fixpoint so nested `(y = (x = Src))` reaches too
    // ... a for-of HEAD binding carries no init: it holds an element of the iterated literal, and
    // where every element reads the same the first stands for the loop, as the init would - the
    // relocated head's minted name reads its element here (`for (const _ref of [{ w: e('a') }])`)
    // ... and the VALUE the init spells: its own effect prefix ran at the declaration, so the
    // alias holds the sequence's tail, the chain assignment's installed value (the write-value canon)
    const initNode = installedWriteValue(binding.path?.node?.init ?? binding.node?.init ?? forOfHeadElement(binding, current.name));
    if (!initNode) return null;
    walkPath = destructureLeafWalkPath({ binding, name: current.name, scope: currentScope, adapter, walkPath });
    if (!walkPath) return null;
    // the name this container is BOUND to - the init's literal, or the one the invocation it spells
    // yields (the call arm walks it inside this container): a write to one of its slots replaces
    // what the literal spells, and the descent has to consult that before trusting the initial member
    enterContainer(current.name, binding.path?.node ?? binding.node);
    current = unwrapTransparentSeq(initNode);
    currentScope = aliasDeclScope(binding, currentScope);
    readNode = (binding.path?.node ?? binding.node) ?? readNode;
  }
  return walkStaticReceiverTerminal(standing());
}

// the usage-GLOBAL half of the branch-arm dispatch: every arm of a branching value is reachable, so
// each arm's static object joins the union sink - walked as a CONTAINER while keys remain, and
// enumerated as a VALUE at the end of the path, which is the canonical branch enumeration the bare
// alias axis already makes. its own function because the terminal below spends its statement budget
// on the descent, and this arm answers before that descent starts
function collectBranchArmStatics({ hop, walk, branchArms }) {
  if (walk.walkPath.length) {
    walkAlternativesIntoSink({ hop, walk, values: branchArms });
    return;
  }
  const { scope, adapter, path } = hop.ctx;
  for (const branch of flattenFallbackBranches({
    node: hop.node, key: null, scope, adapter, path, followAliasLeaves: true,
  })) {
    if (branch.placement === 'static' && !walk.unionSink.includes(branch.object)) {
      walk.unionSink.push(branch.object);
    }
  }
}

// Continue through a call's yielded container or proven return expression, with the remaining keys
// and the returned value's scope, inside whatever container the call itself stands in: a binding's
// init call yields that binding's container. A parameter-filled slot of a yielded literal resumes at
// the caller (`yieldedContainerStep`).
// Conditional callees need global candidate collection or a `conditionalSink` whose consumer
// captures and guards the receiver. Unknown returns add no constructor candidates.
function walkStaticReceiverCallArm(callView, { hop, walk }) {
  const { readNode } = hop;
  const { depth, unionSink, conditionalSink } = walk;
  const callHop = { node: callView, readNode, seen: hop.seen ?? new Set(), ctx: hop.ctx };
  // A definite store kills the argument's old slot. Keep this candidate-only: naming the
  // replacement must neither drop the call nor turn its effects into a pure substitution.
  const written = unionSink && !walk.resolveLeaf
    && hop.ctx.adapter.returnedContainerWriteCandidates?.(rootProgramOf(hop.ctx.path), callView, walk.walkPath);
  if (written) {
    for (const name of written) if (!unionSink.includes(name)) unionSink.push(name);
    return null;
  }
  // the container the call YIELDS: the walk descends the callee's literal in the callee's scope
  const step = yieldedContainerStep(callHop, walk.allowUninitializedCallee);
  if (step) return walkStaticReceiverStep(
    { ...hop, node: step.node, seen: step.seen, ctx: { ...hop.ctx, scope: step.scope } },
    { ...walk, depth: depth + 1, yieldedArgs: step.yieldedArgs },
  );
  const rejectConditional = hop.ctx.adapter.method !== 'usage-global';
  let returned = inlineCallReturnExpression(callHop, { rejectConditional, allowUninitializedCallee: walk.allowUninitializedCallee });
  // Global already admitted conditional callees; only a stricter first query can gain an answer.
  if (!returned && conditionalSink && rejectConditional) {
    returned = inlineCallReturnExpression(callHop);
    if (returned) conditionalSink.push(callView);
  }
  // Mixed / missing returns and mutating argument forwarders contribute candidates only:
  // the preserved call may return another value before the runtime identity test.
  if (!returned && unionSink) {
    const candidates = [];
    const candidate = inlineCallReturnExpression(
      callHop,
      { allowMutatingForwarder: true, returnSink: candidates },
    );
    for (const value of candidate ? [candidate] : candidates) {
      walkAlternativesIntoSink({ hop: value, walk, values: [value.node] });
    }
  }
  // the returned expression is read for its VALUE: an effect prefix in a sequence return runs
  // inside the callee, which every route through this arm keeps calling in place
  return returned ? walkStaticReceiverStep(
    { ...hop, node: unwrapExpressionChain(returned.node), seen: returned.seen, ctx: returned.ctx }, { ...walk, depth: depth + 1 },
  ) : null;
}

// leaf return: walkPath consumed - extract the leaf global name.
// bare Identifier returns its name directly; proxy-global member access
// (`globalThis.Array` / `_globalThis.Array` after polyfill-injected rewrite) routes
// through `resolveObjectName` which handles both raw proxy globals and plugin-injected
// `_globalThis` bindings via `polyfillHint`. covers
// `const Array = globalThis.Array; const wrapper = { Array }; ...`
function walkStaticReceiverLeaf({ hop, walk }) {
  const { node: current, readNode } = hop;
  const { scope: currentScope, adapter, path } = hop.ctx;
  const { unionSink } = walk;
  const call = realmYieldingCallView(current, hop.ctx);
  if (walk.resolveLeaf) {
    const source = walk.resolveLeaf(hop);
    if (source) return source;
    return call ? walkStaticReceiverCallArm(call, { hop, walk }) : foldNavIntoWalk({ hop, walk }, current);
  }
  // a bare global name answers itself; a minted hop never reaches this terminal - the
  // hop recognizer (`pluginRewrittenHopName`) resolves it earlier in the walk
  // ... and a slot spelled `undefined` (`{ k: undefined }`) names no receiver: the global of that
  // name is not one, and what a leaf reads there is its inner default, which answers on its own.
  // an UNBOUND name reads a realm slot, which only a known built-in proves present: a user global
  // (`{ k: userUndef }`) may hold `undefined`, so it names no receiver either and the inner default
  // stays live. a minted alias names its built-in through the object canon
  if (current?.type === 'Identifier') {
    if (isUndefinedNode(current)) return null;
    if (!adapter?.hasBinding || adapter.hasBinding({ scope: currentScope, name: current.name, path, read: current })) return current.name;
    const named = resolveObjectName({ objectNode: current, scope: currentScope, adapter, path, usageNode: readNode });
    return isKnownStaticGlobal(named ?? '', adapter) ? current.name : null;
  }
  // a CALL names its return's constructor through the name channel (`{ w: e('a') }` holds Object),
  // in every spelling the call view admits - a tagged template, a constructible `new`, an `await` -
  // and where that channel stops, through the call arm the terminal descends a call with; a caller
  // collecting candidates takes that answer as one too (a keyless call root guards on it)
  if (call) {
    const name = resolveObjectName({ objectNode: call, scope: currentScope, adapter, path, usageNode: readNode });
    if (name) return name;
    const armed = walkStaticReceiverCallArm(call, { hop, walk });
    if (armed && unionSink && !unionSink.includes(armed)) unionSink.push(armed);
    return armed;
  }
  if (current?.type === 'MemberExpression' || current?.type === 'OptionalMemberExpression') {
    const named = resolveObjectName({ objectNode: current, scope: currentScope, adapter, path, usageNode: readNode });
    if (named) return named;
    // ... a nav the name channel cannot follow folds into the walk: its keys become the path and
    // its root the next hop, so an alias of a container slot (`const a = r.w`; `var _r$w = r.w`,
    // the spelling a destructure lowering ahead of this plugin leaves) descends the literal the
    // direct spelling descends
    return foldNavIntoWalk({ hop, walk }, current);
  }
  return null;
}

// post-dereference terminal: leaf extraction, proxy mid-chain lift, intermediate member
// resolution, and the static-container descents (object literal / class statics). the container
// the hop stands in rides `walk` - its bound NAME (null off a literal) and the keys consumed
// under it, which together spell the slot this step is about to read
function walkStaticReceiverTerminal({ hop, walk }) {
  const { node: current, readNode } = hop;
  const { scope: currentScope, adapter, path } = hop.ctx;
  const {
    walkPath,
    depth,
    ignoreWrittenSlots,
    unionSink,
    containerName,
    containerNode,
    containerPath,
    navKeys,
  } = walk;
  // a BRANCHING value stands for EVERY arm at runtime, which is the reachability the bare-alias
  // union already enumerates (`const B = c ? Object : Array`) - the hop spellings of that same
  // reachability (`{ Base: c ? Object : Array }`, `c ? { Base: Object } : { Base: Array }`, an
  // array slot, a container alias) reach it here, where the walk stands on the branching value.
  // an arm is answered WHERE the walk stands: with keys still to descend the arms are containers
  // and each walks the remaining path, while at the END of the path the arms are the values
  // themselves and the canonical branch enumeration answers them - the very call the union's
  // bare-alias axis makes, so a hop spelling cannot say more than the alias spelling does. a selection
  // the build decides is the operand it always yields (`decidedSelectionValue`), walked on alone - but
  // where the usage-global union collects, its arms feed it as any selection's do, the dead one dropped
  const live = !(unionSink && adapter.method === 'usage-global') && decidedSelectionValue(current, hop.ctx);
  if (live && live !== current) return walkStaticReceiverStep({ ...hop, node: live }, { ...walk, depth: walk.depth + 1 });
  const branchArms = walkBranchArms(current, { hop, walk });
  if (branchArms && (adapter.method === 'usage-pure' || walk.resolveLeaf)) {
    return selectionArmsName({ hop, walk }, branchArms, peelFallbackReceiver(
      current,
      hop.ctx.adapter.isMutatedStaticSlot ?? hop.ctx.adapter.isMutatedStatic,
    )?.type === 'LogicalExpression');
  }
  if (branchArms) collectBranchArmStatics({ hop, walk, branchArms });
  if (walkPath.length === 0) return walkStaticReceiverLeaf({ hop, walk });
  // a call standing where a container is due IS the container it returns, and the shared view admits
  // the value-transparent wrappers over one on the same terms. reached both from the chain ROOT
  // (`plain().window.Array`) and from a container binding's INIT (`const ns = (() => ({ g: globalThis
  // }))(); ns.g.Map`) - the dereference loop above lands the init here verbatim, so without this arm
  // the second spelling resolved nothing in any position or flavor while the first resolved
  const callView = realmYieldingCallView(current, hop.ctx);
  if (callView) return walkStaticReceiverCallArm(callView, { hop, walk });
  // proxy-global mid-chain lift: current is a recognised proxy-global identifier (bare source
  // name or plugin-rewritten alias). for babel the rewritten alias has no scope binding, so
  // the dereference loop above never ran and the alias reaches here verbatim - adapter+scope
  // let the shared root recogniser recover its source name (no binding to read the hint off of).
  // mirror `resolveNestedDestructureReceiver`'s short-circuit: the REMAINING hops must all be
  // proxy-globals with a leaf naming a known built-in (a CONSTRUCTOR key: `const ns =
  // {root: globalThis}; const {root: {self: {Array: A}}} = ns`). without this, such chains bail
  // at the rewritten alias and the constructor polyfill is missed silently. deeper static-METHOD
  // shapes (`{root: {Array: {from}}}`) fail the all-proxy-hops condition here by design - they
  // resolve through the nested-proxy flatten, not this lift
  // a mutated slot anywhere on the lift (a hop or the ctor leaf) holds the user's replacement,
  // so the chain no longer names the pristine built-in - save where the lift is read ahead of every
  // write of the slot
  const liftRead = path && readNode && { node: readNode, path };
  if (proxyGlobalRootName({ node: current, adapter, scope: currentScope, path, usageNode: readNode })
      && walkPath.slice(0, -1).every(k => isPristineProxyGlobal(adapter, k))
      && isKnownStaticGlobal(walkPath.at(-1), adapter)
      && !isMutatedGlobalSlot(adapter, walkPath.at(-1), liftRead)) {
    return walkPath.at(-1);
  }
  // intermediate MemberExpression value (`wrapper = {a: globalThis.Array}` walking key `a`
  // lands on `globalThis.Array`). resolve the chain to its constructor name and return it
  // as the receiver - caller pairs it with the remaining destructured key for polyfill
  // lookup. only single-hop remaining walkPath is mappable (multi-hop would need
  // descend-through-resolved-constructor which has no AST anchor here)
  if (current?.type === 'MemberExpression' || current?.type === 'OptionalMemberExpression') {
    // A prototype hop names the instance surface, so it must remain in the receiver walk.
    const named = walkPath.length === 1 && walkPath[0] !== 'prototype'
      ? resolveObjectName({ objectNode: current, scope: currentScope, adapter, path, usageNode: readNode }) : null;
    // ... and where that chain names the REALM itself, the remaining key is a constructor ON it, not
    // a static OF it: the same lift the bare-name arm above takes, for the nav spelling of the same
    // receiver (`{ w: { Array: { from } } } = { w: globalThis.globalThis }`). without it the leaf
    // answered the realm, no module matched, and only the leg that re-visits its own collapse claimed
    if (named && POSSIBLE_GLOBAL_OBJECTS.has(named) && isKnownStaticGlobal(walkPath[0], adapter)
      && !isMutatedGlobalSlot(adapter, walkPath[0])) return walkPath[0];
    if (named) return named;
    // ... and a nav the name channel cannot follow folds into the walk (an alias of a wrapper slot:
    // `const a = box[0]; a.w.values`) - the same fold the consumed-path arm takes
    return foldNavIntoWalk({ hop, walk }, current);
  }
  // class STATIC fields and object-literal properties are both name-indexable static containers;
  // the canonical resolver descends the matching member's value with LAST-wins semantics and bails
  // on an ambiguous computed key / a method-or-accessor winner / a spread that could override
  // an ARRAY literal is the INDEX-indexable member of that same family: a canonical index names one
  // of its slots exactly as a key names an object property. only a slot that can REACH a built-in is
  // the static channel's though - a slot holding data is an instance receiver, and claiming it here
  // would block the receiver channel that resolves it. same predicate the write side counts a
  // container by, so the two sides agree; a dead end still returns null and yields the leaf back
  // a slot REPLACED after the literal (`const w = { k: Object }; w.k = Map`) no longer holds what the
  // literal spells, so descending it resolves a DIFFERENT constructor's static - a wrong value, not a
  // missed one. the class arm already bails on a static block for exactly this reason.
  // Pure bails on writes that can reach this slot read. Global's direct replacement proof runs before the binding
  // descent above; the remaining records establish only possible writes, so this descent retains
  // the literal's candidate in that mode.
  // the MUTATION resolver walks these chains to REGISTER a patch - bailing it on the very record
  // its own writes feed would lose the patch (`const m = NS.M; m.groupBy = shim` must still route
  // reads through the injected constructor), so it opts out of the slot consult
  const slotWritten = !ignoreWrittenSlots && containerName && adapter.method === 'usage-pure'
    && adapter.isWrittenContainerSlot?.(containerName, [...containerPath, walkPath[0]], containerNode, path, walk.slotReadNode);
  // usage-global union of the slot's OTHER reaching values, collected beside the primary descent:
  // the values recorded as written to this slot (including unknown-slot writes, which may land
  // anywhere), and - once an in-place mutator repositioned the container - every literal element
  // (repositioning permutes values across slots, never invents new ones). each alternative walks
  // the REMAINING path exactly like the primary value, so deeper hops and nested containers
  // resolve through the same machinery and feed the same sink. over-inject-safe: the sink only
  // adds side-effect imports; pure candidates instead require an identity guard below
  if (unionSink && containerName && adapter.method === 'usage-global') {
    const slotPath = [...containerPath, walkPath[0]];
    const alternatives = [...adapter.writtenContainerSlotValues?.(containerName, slotPath, containerNode) ?? []];
    if (current?.type === 'ArrayExpression' && adapter.isWrittenContainerSlot?.(containerName, [...containerPath, '*'], containerNode)) {
      for (const element of current.elements) if (canHoldBuiltIn(element)) alternatives.push(element);
    }
    walkAlternativesIntoSink({ hop, walk, values: alternatives, walkPath: walkPath.slice(1), containerPath: slotPath });
  }
  const arraySlot = arrayLiteralSlotValue(current, walkPath[0]);
  const getters = [];
  const candidates = [];
  // ... and an index a spread ahead of it shifts may land on any static element past the spread
  const shiftedIndex = unionSink && adapter.method === 'usage-global' && !arraySlot && current?.type === 'ArrayExpression'
    ? canonicalArrayIndex(walkPath[0]) : null;
  if (shiftedIndex !== null) {
    candidates.push(...arrayWrapSlotValueCandidates(current.elements, shiftedIndex));
    // ... and the spreads' OWN items, read off each spread argument at every inner index that can reach
    // this one (bounded by the walk's budget)
    let ahead = 0;
    for (const element of current.elements) {
      if (element?.type !== 'SpreadElement') {
        ahead++;
        continue;
      }
      for (let inner = 0; inner <= shiftedIndex - ahead && inner < STATIC_WALK_DEPTH; inner++) {
        candidates.push(receiverSlotRead(element.argument, String(inner)));
      }
    }
  }
  const value = slotWritten ? rescueSlotAccessor({ hop, walk })
    : current?.type === 'ClassDeclaration' || current?.type === 'ClassExpression' || current?.type === 'ObjectExpression'
      ? literalSlotValue({ hop, walk, candidates, getters })
      : (canHoldBuiltIn(arraySlot && decidedSelectionValue(arraySlot, hop.ctx))
        || walkBranchArms(arraySlot, { hop, walk }) ? arraySlot : null);
  // An ambiguous slot names no single receiver in pure, but its enumerable candidates can still
  // feed an identity guard. Keep those separate from the primary answer: the unknown key or spread
  // may replace the named value, and only the runtime receiver decides which branch applies. A
  // recorded slot write likewise vetoes the primary answer, while keeping guarded candidates.
  if (!value && unionSink && adapter.method === 'usage-pure') {
    const named = findNamespaceMemberValue(current, walkPath[0], currentScope, adapter, sharedResolveKey,
      { spreadVetoes: false, candidateSink: candidates });
    if (named) candidates.push(named);
  }
  if (unionSink && candidates.length) {
    walkAlternativesIntoSink({
      hop, walk, values: candidates, walkPath: walkPath.slice(1), containerPath: [...containerPath, walkPath[0]],
    });
  }
  const slotHop = value
    && slotValueHop({ hop: getters.length ? { ...hop, readNode: walk.slotReadNode ?? hop.readNode } : hop, walk }, value);
  // a slot holding an UNDEFINABLE probe nav (`{ a: globalThis.window?.Array }`) hands on a value
  // that is absent exactly off-env: the read a pure claim would erase throws there, so the walk
  // names no defined constructor - the source stays native. method-aware like the written-slot
  // consult above: global keeps resolving and over-injects, the safe direction there
  // ... a bare proxy-global NAME (or an alias to one) is the realm spelling that collapses, exactly
  // as the flat destructure of `window` reads it - only a nav, or an alias holding one, is a probe
  const slotValue = unwrapTransparentSeq(slotHop && decidedSelectionValue(slotHop.node, slotHop.ctx));
  if (slotHop && adapter.method === 'usage-pure'
    && !(slotValue?.type === 'Identifier' && proxyGlobalRootName({ node: slotValue, ...slotHop.ctx }))
    && proxyReceiverValueCanBeUndefined(slotValue, ({ name }) => resolveBuiltIn({ kind: 'global', name }), slotHop.ctx)) return null;
  // a slot the source wrote as a SEQUENCE names its TAIL: the comma run in front is an effect the
  // LITERAL owes (the pairing walk keeps that literal alive for it), and the value this walk is
  // asked about is what the read yields (`{ w: (g(), globalThis) }` names the realm)
  // ... and a defensive realm DEFAULT names its left the same way: a guaranteed realm name is an
  // object, so the right side is dead text (`{ w: globalThis ?? {} }` names the realm too)
  return slotHop ? walkStaticReceiverStep({ ...slotHop, node: peelRealmLogicalDefault(slotHop.node) }, {
    ...walk,
    walkPath: walkPath.slice(1),
    depth: depth + 1,
    containerPath: [...containerPath, walkPath[0]],
    navKeys: navKeys > 0 ? navKeys - 1 : 0,
  }) : null;
}

// the value the object literal or class `hop` stands on holds at the walk's next key, method-aware like the
// terminal walk's written-slot consult: what a trailing spread could redefine is one more candidate
// usage-global injects FOR (`candidates`), and over-injection is the safe side there, while pure rewrites the
// read and needs the literal to be the authority - and a spread or an unknown key the value stopped at leaves
// the accessor ahead of it all the same (`rescueSlotAccessor`). `getters` collects the getters it reads through
function literalSlotValue({ hop, walk, candidates, getters }) {
  const { scope, adapter } = hop.ctx;
  const { walkPath, unionSink, rescueSink, navKeys } = walk;
  const rescued = rescueSink?.length;
  const value = findNamespaceMemberValue(hop.node, walkPath[0], scope, adapter, sharedResolveKey, {
    spreadVetoes: adapter.method !== 'usage-global',
    rescuesRead: navKeys > 0,
    rescueSink,
    candidateSink: unionSink && adapter.method === 'usage-global' ? candidates : null,
    getterSink: getters,
    readNode: walk.slotReadNode ?? hop.readNode ?? null,
  });
  if (!value && rescueSink?.length === rescued) rescueSlotAccessor({ hop, walk });
  return value;
}

// a slot VALUE the walk cannot hand on - a recorded write vetoes it, a spread or an unknown key after it may
// redefine it - leaves the accessor the literal defines there: an assignment runs its setter and a spread may
// not spell the key at all, so a read the caller replays may still run the getter (`readRunsAccessor`). asked
// for that alone, past every spread and unknown key; the value it answers is none
function rescueSlotAccessor({ hop, walk }) {
  const { node: current } = hop;
  const { walkPath, rescueSink, navKeys } = walk;
  if (rescueSink && navKeys > 0 && (current?.type === 'ObjectExpression'
    || current?.type === 'ClassDeclaration' || current?.type === 'ClassExpression')) {
    findNamespaceMemberValue(current, walkPath[0], hop.ctx.scope, hop.ctx.adapter, sharedResolveKey, {
      spreadVetoes: false,
      rescuesRead: true,
      rescueSink,
      readNode: walk.slotReadNode ?? hop.readNode ?? null,
    });
  }
  return null;
}

// find the source-key PATH in an ObjectPattern that produces the binding named `bindingName`.
// shorthand `{Math}` -> ['Math'] (key === value name). renamed `{Math: M}` -> ['Math'] for
// bindingName='M'. nested `{ns: {Math: M}}` -> ['ns', 'Math'] - the binding lives below the
// surface, so the caller descends the source object through every key on the path.
// AssignmentPattern default (`{Math: M = ...}`) peels through .left. computed-key patterns
// resolve via `sharedResolveKey`'s static-binding inspection. returns null when the binding
// isn't reachable or any key on the path is unresolvable
function findShorthandKey(objectPattern, bindingName, scope, adapter) {
  return patternLiteralKeyPath(objectPattern, bindingName, {
    resolveKey: sharedResolveKey, scope, adapter,
  });
}

// walks the outer-prop chain (Property / ObjectProperty -> ObjectPattern -> ...) up to
// the destructure host (VariableDeclarator / AssignmentExpression-in-ExpressionStatement).
// returns the constructor name for the inner prop's receiver across two complementary
// shapes:
//   - proxy-global descent: receiver is a known global (`globalThis`, `self`, ...) and
//     every intermediate key is itself a proxy-global hop. constructor = deepest key
//     (`{Array: {from}} = globalThis` -> 'Array')
//   - static-object descent: receiver is a const-bound Identifier whose initializer is an
//     ObjectExpression, and the keys path resolves to a leaf Identifier of a known
//     constructor (`{a: {from}} = wrapper` where `wrapper = {a: Array}` -> 'Array')
// path-API agnostic: works with both babel's NodePath (`.parentPath`, `.scope`, `.node`)
// and estree-toolkit's. accepts both 'Property' (estree) and 'ObjectProperty' (babel)
// outer-prop type names. AssignmentPattern host (function param default) is intentionally
// excluded - inline-default would pick native first when present, contradicting
// usage-pure's "polyfill always wins" contract
// peel transparent destructure wrappers. the two transparent shapes - single-element ArrayPattern
// and an inner AssignmentPattern default - each get their own arm above, so nothing else is
// crossable and the tail is a plain break. tracks `arrayDepth` so multi-level ArrayPattern wrappers
// (`[[{a}]] = [[receiver]]`) can step through nested ArrayExpression init
// element-by-element. each ArrayPattern wrapper has exactly one inner element
// (otherwise destructuring would re-bind to a different slot per pattern position),
// so a depth counter is sufficient - no per-level index needed
function peelDestructureWrappers(pattern, throughReceiverBearingDefaults = false) {
  let prev = pattern.node;
  let parent = pattern.parentPath;
  // element index at each ArrayPattern wrapper (outermost-first via unshift) so the init
  // descent picks the matching slot. multi-element ArrayPatterns are see-through HERE (this is
  // read-only receiver resolution, not the flatten emit that must preserve sibling bindings),
  // so `[{Array:{from}}, other] = [globalThis, ...]` resolves `from` to globalThis.Array.from
  const indices = [];
  for (;;) {
    // a pattern a rewrite DETACHED has no parent node above it: the peel ends there
    if (!parent?.node) break;
    if (parent.node.type === 'ArrayPattern') {
      const idx = parent.node.elements.indexOf(prev);
      if (idx === -1) break;
      indices.unshift(idx);
    } else if (parent.node.type === 'AssignmentPattern' && parent.node.left === prev) {
      // an INNER default (`[{x} = {}] = [R]`, `{a: {x} = {}} = R`) is transparent - the real
      // receiver lives further up the pattern chain. a parameter default
      // (`function f({ Array: { from } } = globalThis)`) is itself the HOST: nothing above
      // carries a receiver, its right side IS one - stop here so `destructureReceiverSlot`
      // picks the 'right' slot (peeling through it landed on the param slot and dropped
      // the usage-global injection)
      if (!isInnerDestructureDefault(parent)
        && !(throughReceiverBearingDefaults && isNestedDestructureDefault(parent))) break;
    } else break;
    prev = parent.node;
    parent = parent.parentPath;
  }
  return { parent, indices };
}

// an AssignmentPattern wrapping a destructure target is a TRANSPARENT inner default when nested in
// another pattern AND its right side is an empty fallback (`{x} = {}`, `[{x}={}] = R`) - the real
// receiver lives further up. but a receiver-bearing right (`[{x} = Array]`, `{a: {x} = globalThis.X}`,
// `[{x} = (Array)]`, `[{x} = Array || Set]`) makes THIS the value-bearing host, even nested: nothing
// else supplies `x`'s receiver when the outer slot is undefined. a param/declarator default
// (`function f({x} = R)`, grandparent is a function/declarator, not a pattern) is likewise the host.
// shared so the wrapper-peel and the host walk treat inner defaults identically
function isInnerDestructureDefault(assignmentPatternPath) {
  return isNestedDestructureDefault(assignmentPatternPath) && !destructureRightIsReceiver(assignmentPatternPath.node.right);
}

// a default nested inside another pattern (vs a param / declarator default, whose grandparent is a
// function or declarator): the shape gate shared by the transparent-default peel and its
// receiver-bearing resume - the resume peels PAST nested defaults only, a host default still stops
function isNestedDestructureDefault(assignmentPatternPath) {
  const grandType = assignmentPatternPath?.parentPath?.node?.type;
  return grandType === 'ArrayPattern' || grandType === 'Property' || grandType === 'ObjectProperty';
}

// the level a hop stands over: the element's own pattern, past the default it may carry, and that
// DEFAULT where it bears a receiver (`[{ from } = Array]`, `{ k: { from } = Array }`) - the value
// the level reads when the slot it pairs with holds `undefined`, so a mirror descends into it and
// replaces it where the slot's own value would be replaced. a transparent default (`= {}`)
// carries nothing and records none
// ... and so does a CONTAINER literal holding values (`= { B: Map }`, `= [Map]`): the levels below read
// its slots where the default fires, while an empty one supplies nothing to any of them
// ... and a SELECTION whose every arm is one of those (`= c ? { B: Map } : { B: Set }`): the level reads
// the arm that runs
function hopLevelBelow(elementNode) {
  const right = elementNode?.type === 'AssignmentPattern' ? elementNode.right : null;
  const literal = unwrapExpressionChain(right);
  const selection = literal?.type === 'ConditionalExpression' || literal?.type === 'LogicalExpression';
  const defaultNode = right && (destructureRightIsReceiver(right) || isFilledContainerLiteral(literal)
    || (selection && allDestructureValueBranches(literal, leaf => isFilledContainerLiteral(leaf)
      || isReceiverShapedNode(leaf) || !!invocationNode(leaf)))) ? right : null;
  return { pattern: patternSlotTarget(elementNode), defaultNode };
}

// an object or array literal that spells at least one slot
function isFilledContainerLiteral(node) {
  return (node?.type === 'ObjectExpression' && node.properties.length > 0)
    || (node?.type === 'ArrayExpression' && node.elements.length > 0);
}

// ascend a nested destructure leaf to its OUTERMOST object-pattern + the value-bearing host, peeling
// object-property nesting, ArrayPattern wrappers (collecting array indices outermost-first so an init
// descent picks the matching slot) AND transparent inner defaults. returns { pattern, indices, host }
// or null. one source for the SE-key gate's receiver check and the mirror's array-wrapper descent
// `hops` is every level the leaf pattern sits under, receiver-to-leaf: an array wrapper's `index`,
// an object hop's `key` (a key nothing spells - computed - ends the record, `hops` is then null and
// only `indices` answers), each with the `level` pattern it stands in, the `pattern` standing under it
// and the receiver-bearing `defaultNode` of that level's element where it spells one; `indices` keeps
// the array levels alone for the wrapper-only readers
export function destructureHostThroughWrappers(leafPattern, adapter = null, throughInnerDefaults = false) {
  let cursor = leafPattern;
  let objectPattern = leafPattern;
  const indices = [];
  let hops = [];
  for (let guard = 0; guard < STATIC_WALK_DEPTH && cursor; guard++) {
    const owner = cursor.parentPath;
    const ownerType = owner?.node?.type;
    if (ownerType === 'Property' || ownerType === 'ObjectProperty') {
      // a bound computed key folds through the consuming canon where an adapter is at hand
      const key = consumableHopSlotName(owner.node, adapter ? { scope: owner.scope ?? leafPattern.scope, adapter, path: owner } : null);
      if (typeof key === 'string') hops?.unshift({ key, level: owner.parentPath?.node, ...hopLevelBelow(cursor.node) });
      else hops = null;
      cursor = owner.parentPath;
      objectPattern = cursor;
      continue;
    }
    if (ownerType === 'ArrayPattern') {
      const idx = owner.node.elements.indexOf(cursor.node);
      if (idx === -1) return null;
      indices.unshift(idx);
      // `level` is the array pattern itself: what a mirror renders whole where the descent ends
      // above this level on a container foreign to the host
      hops?.unshift({ index: idx, level: owner.node, ...hopLevelBelow(cursor.node) });
      cursor = owner;
      continue;
    }
    // a transparent inner default is see-through; a param/declarator default stops here as the host
    if (ownerType === 'AssignmentPattern' && owner.node.left === cursor.node
      && (isInnerDestructureDefault(owner) || (throughInnerDefaults && isNestedDestructureDefault(owner)))) {
      cursor = owner;
      continue;
    }
    break;
  }
  return { pattern: objectPattern?.node, indices, hops, host: cursor?.parentPath, hostPatternPath: cursor };
}

// Common captures may expose a supported flat read. A remaining static/global claim
// below a literal container keeps its native pattern on both emitters. An independent
// live receiver default owns its branch; dead or empty defaults read the outer source.
export function destructureRetainsLiteralWrapper({ propPath, kind, adapter }) {
  if (kind === 'instance') return false;
  const walked = destructureHostThroughWrappers(propPath.parentPath, adapter, true);
  if (!walked?.host || walked.hostPatternPath === propPath.parentPath) return false;
  const { host, hops } = walked;
  const root = ownRelocatedHeadElement(host) ?? relocatedHeadElement(host) ?? destructureReceiverNode(host);
  const defaultNode = hops?.findLast(hop => hop.defaultNode)?.defaultNode;
  const init = defaultNode && !nearestInnerDefaultDead(propPath.parentPath, adapter) ? defaultNode : root;
  const ctx = { scope: propPath.scope, adapter, path: propPath };
  const source = followConstIdentifierInit({ node: peelChainRootValue(decidedRunningOperand(init, ctx)), ctx });
  const value = unwrapRuntimeExpr(peelChainRootValue(decidedRunningOperand(source.node, source.ctx)));
  return value?.type === 'ObjectExpression' || value?.type === 'ArrayExpression';
}

// the value an OUTER destructure reads from, for the SE-key gate's "diverging conditional?" check.
// `const [{ Array: { [se]: f } }] = [c ? globalThis : u]` resolves to the TERNARY, not the `[...]`
// wrapper - so the gate sees the divergence that the bare `declarator.init` (an ArrayExpression) misses.
// a selection the build decides diverges nowhere: it is the value of it that runs (`decidedRunningValue`),
// an effect prefix around it included, read as that operand spelled alone, as the descent reads every level above
export function outerDestructureReceiver(leafPattern, scope = null, adapter = null) {
  const walked = destructureHostThroughWrappers(leafPattern);
  if (!walked) return null;
  const { indices, host } = walked;
  const receiverNode = destructureReceiverNode(host, null, adapter?.isMutatedStaticSlot ?? adapter?.isMutatedStatic);
  if (!receiverNode) return null;
  const descended = indices.length
    ? descendArrayWrapperInit({ node: receiverNode, ctx: { scope, adapter, path: host, resolveKey: sharedResolveKey } }, indices)?.node
    : receiverNode;
  const running = descended && scope && adapter ? decidedRunningValue(descended, { scope, adapter, path: host }) : descended;
  return running ? unwrapExpressionChain(peelNestedSequenceExpressions(running).tail) : null;
}

// Descend array wrappers by outermost-first runtime indices. Missing, opaque or unpaired slots
// return null; `maybe` admits a sole static candidate for conservative global injection.
// Alias hops retain declaration scope and capture position. `remainingKeys` checks slot writes
// below the paired element; `unionSink` also walks reassigned wrapper alternatives and the values
// the file wrote into a level's slot.
// `throughStores` permits classification through assignment values; mirrors disable it to
// avoid replacing a container slot that the store exposes to another reader. The same flag marks
// the classification walk that steps into a CALL yielding a literal: a mirror rewrites in place,
// and a call spells no slot of the host's own. Pure returns null for such a call behind a crossed
// sequence prefix or store, where the plan's peel lifts none either.
function descendArrayWrapperInit(hop, indices, { maybe = false, unionSink = null, throughStores = true, remainingKeys = [] } = {}) {
  const { adapter } = hop.ctx;
  let { scope } = hop.ctx;
  let { node: receiverNode, readNode = null } = hop;
  // the parameters of a CALL the descent stepped into, each holding the call's argument: a slot of
  // the callee's literal naming one reads that argument, at the call site
  let paramArgs = null;
  let callScope = null;
  // a level whose value the source spells behind a sequence prefix or a store: pure steps into no call
  // after it, exactly as the plan's peel lifts none there (its prefixes and a stepped call replay
  // through different channels, in the wrong order), so the claim stays the native read on both legs
  let crossedEffect = false;
  for (let level = 0; level < indices.length; level++) {
    const index = indices[level];
    // Classification reads through a stored value; a mirror must not replace slots of
    // the container that the store also hands to another reader.
    let cur = throughStores ? installedWriteValue(receiverNode) : unwrapExpressionChain(receiverNode);
    crossedEffect ||= throughStores && cur !== unwrapRuntimeExpr(receiverNode);
    // ... to a fixpoint: a call may return an alias, an alias may hold a call, and a selection the
    // build decides holds the operand it always yields (`decidedSelectionValue`, the object walk's rule)
    for (let step = 0; step < STATIC_WALK_DEPTH; step++) {
      if (!scope || !adapter) break;
      const live = decidedSelectionValue(cur, { ...hop.ctx, scope });
      if (live !== cur) {
        cur = unwrapExpressionChain(live);
        continue;
      }
      // a deeper level reads its element INSIDE the value the level above captured, so its
      // dereference anchors at that capture (the followed declarator), not at the destructure host:
      // a write to the inner alias between the capture and the host cannot change what was captured
      // (anchored at the host it read as dominating, and the leaf classified as the written value)
      const followed = followConstIdentifierInit({ ...hop, node: cur, readNode, ctx: { ...hop.ctx, scope } }, {
        maybe,
        onReassignedHop: unionSink ? (binding, name, hopAt) => collectReassignedHopUnion({
          hop: hopAt, binding, name, walk: { walkPath: indices.slice(level), depth: 0, unionSink },
        }) : null,
      });
      // Capturing an element preserves its identity, not its contents. A nested reader
      // checks its remaining property path before the literal descent forgets the alias.
      if (followed.node !== cur && aliasSlotWritten(cur, [...indices.slice(level), ...remainingKeys], adapter, {
        scope, path: hop.ctx.path, ownerNode: followed.readNode?.type === 'VariableDeclarator' ? followed.readNode : null,
      })) return null;
      // ... while the usage-global union walks every value the file wrote into this level's slot of
      // the container, beside the literal's own element
      if (unionSink && followed.node !== cur) {
        const slotCtx = { ...hop.ctx, scope };
        walkAlternativesIntoSink({
          hop: { ...hop, node: cur, ctx: slotCtx },
          walk: { walkPath: [...indices.slice(level + 1).map(String), ...remainingKeys], depth: 0, unionSink },
          values: writtenContainerSlotValuesAt(cur, [[String(index)]], slotCtx),
        });
      }
      cur = followed.node;
      scope = followed.ctx.scope;
      ({ readNode } = followed);
      // ... an alias holding a selection the build decides goes on to the operand it yields, as in place
      if (decidedSelectionValue(cur, { ...hop.ctx, scope }) !== cur) continue;
      // a CALL in the slot yields the container the callee built, and the descent goes on inside it,
      // in the callee's scope - the literal read the plan's peel and the wrapper walks take. the
      // classification reads it; a mirror does not (it rewrites in place, and a call spells no slot
      // of the host's own - that level stays opaque to it, as an argument slot is)
      if (!throughStores || !invocationNode(cur)) break;
      if (crossedEffect && adapter.method === 'usage-pure') return null;
      const called = callYieldedLiteral({ node: cur, readNode, seen: hop.seen ?? new Set(), ctx: { ...hop.ctx, scope } });
      if (!called) return null;
      ({ paramArgs } = called);
      callScope = scope;
      scope = called.scope;
      // the callee runs where the CALL stands: a name its return spells is read there, and that is
      // where the dominance proofs of the next follow anchor (the receiver walk's own anchor)
      readNode = cur;
      cur = called.literal;
    }
    if (cur?.type !== 'ArrayExpression') return unionSink ? selectionLevelIntoSink({
      hop: { ...hop, node: cur, readNode, ctx: { ...hop.ctx, scope } },
      walkPath: [...indices.slice(level).map(String), ...remainingKeys],
      unionSink,
    }) : null;
    receiverNode = pairedArrayWrapInitElement(cur.elements, index);
    // ... a slot the callee fills from a parameter holds the call's argument, read at the call site
    const read = yieldedSlotValue(paramArgs, receiverNode);
    if (receiverNode && !read) return null;
    if (read !== receiverNode) {
      receiverNode = read;
      scope = callScope;
    }
    // `maybe` (inject-if-might classification only): a spread-shifted slot has no SOUND pair, but
    // when exactly ONE static candidate can land in it, that candidate is the slot's only
    // enumerable value and the walk may continue through it - a wrong guess over-injects, which
    // is the safe direction. several distinct candidates stay ambiguous and bail as before
    if (!receiverNode && maybe) {
      const candidates = arrayWrapSlotValueCandidates(cur.elements, index);
      receiverNode = candidates.length === 1 ? candidates[0] : null;
    }
    if (!receiverNode) return null;
  }
  // ... a slot the callee fills from a parameter may stand BELOW the wrapper levels, under the keys
  // the caller still has to walk (`x => [{ k: x }]`): only this descent maps the parameter to the
  // call's argument, so it takes those keys through the callee's literal itself and reports how
  // many it consumed (`consumedKeys`); a walk that reaches no such slot leaves every key to the caller
  const below = paramArgs ? argumentBelowWrapper(unwrapExpressionChain(receiverNode), remainingKeys, paramArgs) : {};
  if (!below) return null;
  return below.node ? { ...hop, node: below.node, readNode, ctx: { ...hop.ctx, scope: callScope }, consumedKeys: below.consumedKeys }
    : { ...hop, node: receiverNode, readNode, ctx: { ...hop.ctx, scope }, consumedKeys: 0 };
}

// a wrapper level that is a selection the build leaves open holds either arm's container: the usage-global
// union walks each through the indices and keys left (`walkPath`), as the object walk does a selection it
// stands on. null - no one element pairs there
function selectionLevelIntoSink({ hop, walkPath, unionSink }) {
  if (hop.ctx.adapter?.method === 'usage-global' && getFallbackBranchSlots(peelFallbackReceiver(
    hop.node,
    hop.ctx.adapter.isMutatedStaticSlot ?? hop.ctx.adapter.isMutatedStatic,
  ))) {
    walkAlternativesIntoSink({ hop, walk: { walkPath, depth: 0, unionSink }, values: [hop.node] });
  }
  return null;
}

// the argument a parameter-filled slot of a call's yielded literal holds under the `keys` a wrapper
// descent leaves (`descendArrayWrapperInit`), with how many of them it consumed: `{ node,
// consumedKeys }`, `{}` where no key reaches such a slot, null where one reads a parameter the call
// proves nothing for (`yieldedSlotValue`)
function argumentBelowWrapper(literal, keys, paramArgs) {
  let level = literal;
  for (const [at, key] of keys.entries()) {
    // ... an index among the keys reads the ARRAY level the key above reached (`x => ({ k: [x] })`)
    const read = level?.type === 'ObjectExpression' ? objectLevelPairedProperty(level, key)?.read
      : level?.type === 'ArrayExpression' && /^\d+$/.test(key) ? pairedArrayWrapInitElement(level.elements, Number(key)) : null;
    if (!read) break;
    const value = yieldedSlotValue(paramArgs, read);
    if (value !== read) return value && { node: value, consumedKeys: at + 1 };
    level = unwrapExpressionChain(read);
  }
  return {};
}

// the constructor a RECEIVER-SHAPED inner default names (`= Array`), or null: the array twin of the
// object hop's `innerDefaultReceiverName`, with its rule for a BRANCHY default (`= Array || Set`) -
// this channel answers with one name, and a name cannot say "either branch"
function arrayInnerDefaultReceiverName(innerDefaultHost, adapter) {
  if (innerDefaultHost?.node?.type !== 'AssignmentPattern') return null;
  const init = unwrapExpressionChain(innerDefaultHost.node.right);
  if (!init || init.type === 'LogicalExpression' || init.type === 'ConditionalExpression') return null;
  const host = innerDefaultHost.parentPath;
  const resolved = resolveObjectName({ objectNode: init, scope: host.scope, adapter, path: host });
  return resolved && isStaticPlacement(resolved) ? resolved : null;
}

// a RECEIVER-SHAPED inner default in an array wrapper (`[{ from } = Array] = [undefined]`): peeling
// stops at the default because it IS a host, so the outer walk yields no array index. its right is the
// receiver ONLY when the paired array slot is statically `undefined` (then the default provably fires);
// a defined / dynamic / unresolvable slot keeps the native element receiver. resume the wrapper walk
// from the inner default itself to reach the host slot and verify it
function resolveArrayInnerDefaultReceiver(innerDefaultHost, adapter) {
  if (innerDefaultHost?.node?.type !== 'AssignmentPattern') return null;
  const { parent: host, indices } = peelDestructureWrappers(innerDefaultHost);
  if (indices.length === 0) return null;
  const receiverNode = destructureReceiverNode(host, null, adapter?.isMutatedStaticSlot ?? adapter?.isMutatedStatic);
  if (!receiverNode) return null;
  const slotNode = descendArrayWrapperInit(
    { node: receiverNode, ctx: { scope: host.scope, adapter, path: host, resolveKey: sharedResolveKey } }, indices,
  )?.node;
  if (!isUndefinedNode(slotNode)) return null;
  return arrayInnerDefaultReceiverName(innerDefaultHost, adapter);
}

// the inline-array spreads in a pattern host's literal levels, flattened for the rewrite: every
// array level a pattern pairs with - the wrapper itself (`[...[Array]]`), one under an object hop
// (`{ y: [...[arr]] }`), a nested wrapper - is spliced before any route edits a level by slot. the
// rewriting flavor's own step (the classification pairs by position without touching the tree),
// once per host from whichever leaf is handled first, and only along the host's own literals: an
// alias keeps the literal where it is declared. a level whose bound slot pairs with a hole stays as
// written, on both legs, and so does every level of a file the routes then claim nothing in
// (`restoreUnclaimedFlattens`)
const flattenedHosts = new WeakSet();
const flattenRecords = new WeakMap();
export function flattenArrayWrapperInits(leafPath) {
  let root = leafPath;
  for (let up = root.parentPath; up?.node; up = root.parentPath) {
    const { type } = up.node;
    if (type === 'ObjectPattern' || type === 'ArrayPattern' || type === 'RestElement'
      || ((type === 'Property' || type === 'ObjectProperty') && up.parentPath?.node?.type === 'ObjectPattern')
      || (type === 'AssignmentPattern' && up.node.left === root.node && isInnerDestructureDefault(up))) root = up;
    else break;
  }
  const host = root.parentPath;
  if (!isDestructurePattern(root.node) || !host?.node || flattenedHosts.has(host.node)) return;
  flattenedHosts.add(host.node);
  let program = host;
  while (program.parentPath?.node) program = program.parentPath;
  if (!flattenRecords.has(program.node)) flattenRecords.set(program.node, []);
  flattenPatternLevels(root.node, destructureReceiverNode(host, root.node), flattenRecords.get(program.node), host.node);
}

// the splices a file's routes then left unclaimed, undone: a file that injects nothing prints as
// written on the leg that reprints its tree, exactly as the leg that hands the source back
export function restoreUnclaimedFlattens(programNode) {
  for (const { host, elements, original } of flattenRecords.get(programNode) ?? []) {
    elements.splice(0, elements.length, ...original);
    // a later pass over the same tree flattens the host again
    flattenedHosts.delete(host);
  }
  flattenRecords.delete(programNode);
}

// the heads the legs moved, per program, each with its moved pattern's shape at the time
const relocationRecords = new WeakMap();
const SHAPE_SKIP_KEYS = new Set(['start', 'end', 'loc', 'range', 'extra', 'leadingComments', 'trailingComments', 'innerComments']);
function patternShape(node) {
  return JSON.stringify(node, (key, value) => SHAPE_SKIP_KEYS.has(key) ? undefined : value);
}

// a loop head or catch param the legs moved into the body for a claim: `slotOwner[field]` is the
// head slot the minted name took, `body` the source's own statement a bodyless host had
export function noteRelocation(hostPath, { slotOwner, field, pattern, statement, name, body = null }) {
  let program = hostPath;
  while (program.parentPath?.node) program = program.parentPath;
  if (!relocationRecords.has(program.node)) relocationRecords.set(program.node, []);
  relocationRecords.get(program.node).push({
    host: hostPath.node, slotOwner, field, pattern, shape: patternShape(pattern), statement, name, body,
  });
}

// the moved heads no claim took up, put back at the end of the file: one whose moved pattern is as
// it was moved, read by nothing but its minted name. both legs ask it after placing their refs, so
// a head no claim needed prints as written on both, and a ref hoisted into its braces keeps them
export function restoreIdleRelocations(programNode) {
  for (const record of (relocationRecords.get(programNode) ?? []).toReversed()) {
    const { host, slotOwner, field, pattern, statement, name, body } = record;
    const block = host.body.body;
    const moved = statement.type === 'VariableDeclaration'
      ? statement.declarations.length === 1 && statement.declarations[0] : statement.expression;
    const source = moved?.init ?? moved?.right;
    if (!block?.includes(statement) || (moved?.id ?? moved?.left) !== pattern || source?.type !== 'Identifier'
      || source.name !== name || patternShape(pattern) !== record.shape
      || block.some(item => item !== statement && identifierReferencedInSubtree(item, name))) continue;
    block.splice(block.indexOf(statement), 1);
    slotOwner[field] = pattern;
    if (body && block.length === 1 && block[0] === body) host.body = body;
  }
  relocationRecords.delete(programNode);
}

// one paired level down: an array level splices its inline spreads, then each bound slot descends
// into its element; an object level descends by key into the property it pairs with
function flattenPatternLevels(pattern, init, records, host) {
  const literal = unwrapRuntimeExpr(init);
  if (pattern?.type === 'ArrayPattern' && literal?.type === 'ArrayExpression') {
    const slots = pattern.elements.flatMap((element, index) => element && element.type !== 'RestElement' ? [index] : []);
    if (slots.some(index => !resolveCallArgument(literal.elements, index))) return;
    const original = [...literal.elements];
    flattenInlineArraySpreads(literal.elements);
    if (original.some((element, index) => element !== literal.elements[index])) {
      records.push({ host, elements: literal.elements, original });
    }
    for (const index of slots) flattenPatternLevels(patternSlotTarget(pattern.elements[index]), literal.elements[index], records, host);
  } else if (pattern?.type === 'ObjectPattern' && literal?.type === 'ObjectExpression') {
    for (const prop of pattern.properties) {
      if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') continue;
      const key = spelledSlotName(prop);
      const paired = key === null ? null : objectLevelPairedProperty(literal, key);
      if (paired) flattenPatternLevels(patternSlotTarget(prop.value), paired.read, records, host);
    }
  }
}

// resolve receiver for ArrayPattern-rooted nested destructure: `const [...{from}] = wrapper`
// or chained `[[{from}]] = wrapper`. walks up ArrayPattern wrappers from the inner ObjectPattern
// counting depth; descends the host's init slot through Identifier aliases and ArrayExpression
// layers. returns the leaf constructor name when it's a recognised static placement
// `slotNode`: the receiver to descend in place of the host's own - one ELEMENT of a for-x head
// over several, each of which carries a claim of its own (the object pattern's rule)
function resolveArrayWrapperedDestructureReceiver(innerObjectPattern, adapter, unionSink = null, slotNode = null) {
  const peeled = peelDestructureWrappers(innerObjectPattern);
  // ... and where neither the slot nor the pair answers (a dynamic element, a hole, a head whose
  // elements differ), the default carries a receiver of its own - the object hop's rule: it fires
  // exactly when the slot holds `undefined`, so the claim is right on any host, and the render
  // mirrors the arm that reads it while the live arm keeps whatever the slot holds. a route that
  // DROPS the native read asks the proven half alone (`arrayWrapProvenReceiver`)
  return arrayWrapProvenReceiver(peeled, innerObjectPattern, adapter, unionSink, slotNode)
    ?? (peeled.indices.length === 0 ? arrayInnerDefaultReceiverName(peeled.parent, adapter) : null);
}

// the PROVEN receiver of an array-wrapped leaf, or null: the pair the wrappers descend to, or the
// inner default where its slot provably holds `undefined`. `peeled` is the leaf's wrapper peel
// (`peelDestructureWrappers`), stopping at a receiver-shaped inner default rather than walking through
// a transparent one: its right is the receiver iff the paired slot IS `undefined` (the slot check);
// in the COMPLEMENTARY cell the paired slot resolves to a known global - always defined, so the
// default is provably dead - and the resumed peel (past nested receiver-bearing defaults) resolves
// the PAIR as the receiver, converging with the flatten plan's own defined-pair extraction. the
// indices are collected outermost-first so the init descent picks the matching slot, not a blind
// `[0]` - `const [, { from }] = [Set, Array]`
function arrayWrapProvenReceiver(peeled, innerObjectPattern, adapter, unionSink = null, slotNode = null) {
  if (peeled.indices.length === 0) {
    return resolveArrayInnerDefaultReceiver(peeled.parent, adapter)
      ?? arrayWrapReceiverFromHost(peelDestructureWrappers(innerObjectPattern, true), adapter, unionSink, slotNode);
  }
  return arrayWrapReceiverFromHost(peeled, adapter, unionSink, slotNode);
}

// the descent + leaf-resolution tail shared by the transparent peel and the dead-default resume
function arrayWrapReceiverFromHost({ parent: host, indices }, adapter, unionSink = null, element = null) {
  if (indices.length === 0) return null;
  // IDENTIFICATION uses the broad host predicate: an assignment-destructure in for-init / call-arg
  // / arrow-body position and a parameter DEFAULT (AssignmentPattern) all carry a real receiver
  // that usage-global must inject for. the pure flatten re-checks its own narrow host shape at
  // emit - identification gated on the EMIT predicate dropped the import
  const slotNode = element ?? ownRelocatedHeadElement(host) ?? relocatedHeadElement(host) ?? destructureReceiverNode(
    host,
    null,
    adapter?.isMutatedStaticSlot ?? adapter?.isMutatedStatic,
  );
  if (!slotNode) return null;
  // classification feeds usage-global injection AND the pure flatten extraction: only the former
  // may lean on a spread-shifted MAYBE pair (pure substituting a value the runtime may not hold
  // is the unsafe direction), so the maybe walk is flavor-gated
  const descended = descendArrayWrapperInit(
    { node: slotNode, ctx: { scope: host.scope, adapter, path: host, resolveKey: sharedResolveKey } }, indices,
    { maybe: adapter?.method === 'usage-global', unionSink },
  );
  if (!descended) return null;
  // ... through a defensive realm DEFAULT too: a guaranteed realm name is an object, so the right
  // side is dead text and the element names that realm (`[globalThis ?? {}]`), the same reading the
  // flat spelling of the receiver takes
  const leaf = peelRealmLogicalDefault(unwrapExpressionChain(descended.node));
  // any leaf that resolves to a static-placement constructor, through ONE branch: a bare global
  // (`[Array]`), a const-alias (`const A = Array; [A]`), a proxy-global member (`[globalThis.Array]`,
  // same as the non-wrappered `const { from } = globalThis.Array` path), or a babel in-place-
  // substituted polyfill alias (`[_Promise]` - the standalone Identifier visitor rewrote the wrapper
  // init before the destructure prop visited). `resolveObjectName` canonicalizes ALL of these via
  // `resolveBindingToGlobal` (binding-init walk + `polyfillHint` recovery, and it bails a reassigned
  // alias). a raw-name-only Identifier check dropped the const-alias (usage-global both plugins +
  // babel usage-pure; unplugin usage-pure rescued it -> divergence)
  if (isReceiverShapedNode(leaf) || leaf?.type === 'AssignmentExpression' || invocationNode(leaf)) {
    // NO SE policy here - this is mode-free CLASSIFICATION. usage-global keeps the body untouched
    // and must inject for an SE-bearing leaf too; the usage-pure flatten harvests the observable
    // discard (assignment / SE-bearing chain-root call) via `flattenDiscardRescue` and re-emits it
    // ahead of the extraction. an AssignmentExpression leaf (`[a = Array]`) classifies through
    // `resolveObjectName`'s own chain-assignment peel and is rescued WHOLE at emit - bailing it
    // instead would silently lose the polyfill
    const resolved = resolveObjectName({
      objectNode: leaf, scope: descended.ctx.scope, adapter, path: host, usageNode: descended.readNode ?? host.node,
    });
    return resolved && isKnownStaticGlobal(resolved, adapter) ? resolved : null;
  }
  return null;
}

// nested / array-wrapped parameter-default SYNTH PLAN: mirror the WHOLE pattern tree into a
// literal that replaces the parameter DEFAULT, so it fires strictly when no argument is passed
// and every caller-supplied object destructures natively. the semantics live here ONCE - the
// emitters render the returned tree.
//   - the receiver tail drives the context walk: a global-proxy root (`globalThis`, chains of
//     proxy hops) descends per key - a proxy-named key recurses, any other key becomes the
//     CONSTRUCTOR whose children resolve as statics; a bare-constructor root starts there
//   - EVERY branch is mirrored (a one-branch literal would TypeError the sibling on the no-arg
//     call); an unresolvable static key bails the whole plan
//   - a pattern-valued leaf (`of: { name }`) gets the polyfill VALUE and destructures it
//     natively - reading the polyfill's own properties is ordinary polyfill-wins behavior
//   - a sequence default keeps its effect PREFIX (re-emitted ahead of the literal); the
//     receiver tail itself must be effect-free since the literal replaces it
//   - rest needs the whole constructor index when one exists; other rest sources stay native
// instance and mirrored pattern -> the plan verdict, INCLUDING the un-mirrorable outcomes: `buildMirrorTargets` has
// already run `collectValueLeaves` plus a `mirrorPattern` per reachable value leaf (one resolver
// lookup per pattern key) by the time it declines, and every sibling prop of the same pattern asks
// the same question - memoizing only the success made a mixed pattern pay that walk per prop.
// Emitters may prune consumed properties between queries. Cached declines can miss a later
// opportunity, but cannot authorize a rewrite that the original pattern rejected.
const nestedParamSynthPlan = createInstanceNodeCache();
// One source argument node and the identical array pattern own both ordered windows used below:
// the quiet source suffix, computed at the first eligible leaf, and the consecutive prefix the
// renderer has already materialized as data. The latter is an output ledger, never a predicted mirror.
const instanceArgumentWindows = createInstanceNodeCache();

// may the host walk stop at `cur`'s direct parent (a param default / declarator / cascade)? always when
// `cur` is ABOVE the trigger leaf's own pattern; at the leaf pattern itself ONLY when it is MIXED (a
// nested value the mirror owns) - so a flat ctor sibling stranded native by the deferral gate is mirrored,
// while a pure-flat pattern keeps its own body-extract / synth-swap fallback (mirror does not fire there)
function selfHostAllowed(cur, leafPatternPath) {
  // ... except on a for-x HEAD, which has no such fallback: both of those need a statement slot, and
  // a head is the one host with none. the relocation that mints one stands down where the mirror can
  // answer (the shared plan decides), so declining here would leave the claim native. the head may
  // sit behind ARRAY wrappers (`for (const [{ from }] of [[Array]])`) - they pair a slot, they do not
  // host anything, so the walk through them ends at the same slot-less declarator
  let below = cur;
  let head = cur.parentPath;
  while (head?.node?.type === 'ArrayPattern') {
    below = head;
    head = head.parentPath;
  }
  if (head?.node?.type === 'VariableDeclarator' && !head.node.init) return true;
  // ... and a head that declares nothing is the same slot-less host one node up: the pattern stands
  // in the loop's `left`, where a statement cannot go either
  if (isForXStatement(head?.node) && head.node.left === below.node) return true;
  return cur !== leafPatternPath
    || (cur.node?.type === 'ObjectPattern' && objectPatternHasNestedValue(cur.node));
}

// the one property-level question the mirror asks: can it spell this key statically as a property?
// a REST element and any non-Property shape have no key at all; a computed
// key resolves to its VALUE (`const k = 'from'` / `(eff(), 'from')` -> 'from') and the synth literal
// carries that resolved STATIC name, which the pattern's own computed key then reads - the effect
// stays in the UNTOUCHED LHS and runs exactly once, so a side-effecting key is accepted while a
// runtime-unresolvable one is not. Quoted names keep their literal spelling, and a key folded from
// the REAL Symbol has no static string slot the literal could carry
export function mirrorAcceptedKey({ prop, scope, adapter, path, seenKeys, instance = false }) {
  if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') return null;
  const key = prop.computed
    ? sharedResolveKey({ node: prop.key, computed: true, scope, adapter, bailOnSideEffectKey: false, keepsKeyNode: true })
    : instance ? plainSynthKeyName(prop.key) : prop.key?.name ?? prop.key?.value;
  if (typeof key !== 'string') return null;
  if (prop.computed && symbolSourcedFoldedKey({ key, keyNode: prop.key, scope, adapter, path })) return null;
  // a key the pattern names TWICE is ONE slot, so the literal carries one property for both readers.
  // A repeat may not carry a SUBTREE: two patterns under one key would need merging, and a literal
  // beside a pattern hands the plain reader the synthesized object instead of the real value.
  // Declining the whole level over a repeat cost the polyfill outright where the
  // fallback has no statement slot to extract into - a for-x head relocates the pattern as written
  const carriesSubtree = isDestructurePattern(patternSlotTarget(prop.value));
  if (seenKeys.has(key) && (carriesSubtree || seenKeys.get(key))) return null;
  seenKeys.set(key, carriesSubtree);
  return key;
}

// does a level the mirror's literal stands in for read a native passthrough the literal cannot keep in
// order? the literal reads every passthrough when it is built, ahead of the pattern's own effects, so a
// passthrough after a key or value that runs code is read too early - and so is one beside computed keys
// whose distinct reads the literal cannot keep apart. `isPassthrough(prop, key)` names the level's native reads
export function passthroughOutrunsEffect({ patternNode, isPassthrough, ctx }) {
  if (!patternComputedKeysSynthSafe({ objectPatternNode: patternNode, ...ctx, distinctReads: true })) return true;
  const readingKeys = new Map();
  let precedingEffect = false;
  for (const prop of patternNode.properties) {
    precedingEffect ||= computedKeyHasSideEffects(prop, ctx);
    const key = mirrorAcceptedKey({ prop, ...ctx, seenKeys: readingKeys });
    if (precedingEffect && isPassthrough(prop, key)) return true;
    precedingEffect ||= patternKeepsEffectfulKey(prop.value, ctx);
  }
  return false;
}

// does the value a slot holds rule the level's default OUT - a value that is never `undefined`? a
// literal of any kind (`null` included: only `undefined` fires a default), a container, function or
// class expression, a `new`, a template, and a binding holding one of those that is never written
// again. a proxy global answers through its own canon (`globalThis` is always there, `window` is an
// environment probe). anything else - a call, a member read, a parameter - is the runtime's to decide
const DEFINED_VALUE_TYPES = new Set([
  ...PRIMITIVE_LITERAL_TYPES,
  'ObjectExpression',
  'ArrayExpression',
  'FunctionExpression',
  'ArrowFunctionExpression',
  'ClassExpression',
  'NewExpression',
  'TemplateLiteral',
]);

function slotValueProvablyDefined(node, ctx, depth = 0) {
  const core = unwrapExpressionChain(node);
  if (!core || depth > STATIC_WALK_DEPTH) return false;
  if (DEFINED_VALUE_TYPES.has(core.type)) return true;
  if (core.type === 'Identifier' && ctx.adapter.hasBinding({ scope: ctx.scope, name: core.name, path: ctx.path, read: core })) {
    const binding = ctx.adapter.getBinding({ scope: ctx.scope, name: core.name, path: ctx.path, read: core });
    if (!binding || binding.constantViolations?.length) return false;
    // ... and a binding this build minted for the realm holds the realm (`_globalThis`, which the other binding
    // still reads as the `globalThis` its alias was spelled with)
    if (guaranteedRealmObjectName(binding.polyfillHint)) return true;
    const declaratorNode = binding.path?.node ?? binding.node;
    // a PATTERN-bound name holds a slot of the init, which may well be `undefined`
    if (declaratorNode?.id?.type !== 'Identifier') return false;
    // ... and the initializer has to have RUN by the read: a hoisted `var` declared below the
    // slot holds `undefined` there (the dominance canon; a lexical binding read ahead of its
    // declaration throws natively, so the surviving read is behind it)
    if (!varInitDominatesUsage({ declaratorNode, usagePath: ctx.path, usageNode: core, kind: binding.kind })) return false;
    return !!declaratorNode?.init && slotValueProvablyDefined(declaratorNode.init, ctx, depth + 1);
  }
  return isProxyGlobalLeaf(core) && !fallbackValueCanBeNullish(core, ctx);
}

// the arm a level's DEFAULT takes off the value its slot pairs: `born` where the slot provably holds
// `undefined` (absent, a hole, spelled so) and the default supplies the value, `dead` where the slot
// provably holds a value and the default never runs, `open` where the runtime decides. the one
// verdict the mirror plan and the array plan both read
export function pairedDefaultArm(node, ctx, slotAbsent = false) {
  if (slotAbsent || (node && isUndefinedNode(unwrapExpressionChain(node)))) return 'born';
  return node && slotValueProvablyDefined(node, ctx) ? 'dead' : 'open';
}

// a level's verdict where only the DEFAULT's walk answers for it (the element has no walk)
const FORK_ONLY = Symbol('fork-only');

// the literal a level holds, through a transparent IIFE: the call stays called where the source wrote
// it, `node` is the returned value the descent continues from and `literal` its peeled tail. with a
// `ctx`, through a value the build decides where what runs of it, as written (`decidedRunningOperand` - a
// store it makes stays the store's), is an object or array literal - the two a level descends; the fold
// drops the dead part around the mirror. anything else that runs - the realm, a store - leaves the level
// as written, which the mirror replaces whole, the dead text with it
function levelLiteralThroughIife(node, ctx = null) {
  const selection = ctx && unwrapExpressionChain(node);
  const live = ctx ? decidedRunningOperand(selection, ctx) : selection;
  if (live !== selection) {
    const peeled = levelLiteralThroughIife(live, ctx);
    if (peeled.literal?.type === 'ObjectExpression' || peeled.literal?.type === 'ArrayExpression') return peeled;
  }
  let tail = unwrapExpressionChain(peelNestedSequenceExpressions(node).tail);
  for (let inlined = peelZeroArgIifeReturn(
    tail,
    { staticIsMutated: ctx?.adapter?.isMutatedStaticSlot ?? ctx?.adapter?.isMutatedStatic },
  ); inlined; inlined = peelZeroArgIifeReturn(
      tail,
      { staticIsMutated: ctx?.adapter?.isMutatedStaticSlot ?? ctx?.adapter?.isMutatedStatic },
    )) {
    node = inlined;
    tail = unwrapExpressionChain(peelNestedSequenceExpressions(node).tail);
  }
  return { node, literal: tail };
}

// the arms of an undecided ternary a level holds where each arm is an object literal or another
// such ternary (`c ? { C: Object } : { C: Map }`): one of them is the level on each pass. null for any
// other level, a selection the build decides included - its live arm is the flatten's to fold
function containerSelectionArms(node, ctx) {
  if (node?.type !== 'ConditionalExpression' || decidedSelection(node, ctx)) return null;
  const arms = [node.consequent, node.alternate];
  return arms.every(arm => {
    const { literal } = levelLiteralThroughIife(arm, ctx);
    return literal?.type === 'ObjectExpression' || !!containerSelectionArms(literal, ctx);
  }) ? arms : null;
}

// the receiver each source hands the mirror: the wrapper descent to the element it pairs with, the
// refusal to leave that source's subtree, and the effect-prefix peel. one answer per source, and a
// source that fails any of the three declines the whole plan. a level's receiver-bearing DEFAULT
// answers for a slot that provably holds `undefined` (`defaultBorn` names the receivers it supplied)
// ... through OBJECT hops as well: a literal container in the slot (`= { w: globalThis }`, `of [{ w:
// globalThis }]`) pairs the hop key with its slot value, and that value is what the mirror replaces
// - the container stays as the source wrote it, and the pattern mirrored is the one standing UNDER
// the last key the descent consumed (`patternNode`; null where no key was). the pairing is the
// resolver's own: the slot before any spread, and no key after it that could BE this one at runtime
// ... and a level holding a selection of such containers (`containerSelectionArms`) forks: every arm
// pairs on its own, one receiver per arm, and a single arm failing to pair declines the plan
// ... and a slot nothing proves either way (`[pick()]`) leaves BOTH arms live: the element walks on
// as the source wrote it and the default FORKS off the same level, so the mirror reaches whichever
// arm the runtime takes. `arms` collects the verdict at the leaf's NEAREST default, one per walk:
// `born` where the slot proved `undefined`, `dead` where it proved a value (the default never fires
// and stays as written), `open` where the runtime decides or the descent ended above that level;
// null where no level carries a default
// `wholeArrayLevels`: may a walk end ABOVE an array level on a container foreign to the host and
// have the mirror spell that level whole? a for-x HEAD has no other route to a foreign element, so it
// may; a declarator's leaner flatten / extraction owns the same shape everywhere else
// `hostPattern`: the pattern the hops start from - what a walk that ends above its first hop mirrors
// `hostless`: no host spells a slot for the pattern (a catch parameter, a parameter no caller census
// closes, a head over a held iterable) - the NEAREST default's walk alone answers, its arm open
// `pairContainers`: instance/caller mirrors and read-only queries may extract literal slots.
// Static mirrors may pair only to locate an independent receiver default; live slots stay native.
// `verdictOnly`: the walk answers the arms alone, so it may read a named callee's returned literal and keep a slot
// foreign to the host - nothing it reaches is rewritten
function mirrorReceiverNodes({
  receiverSources, hops, host, adapter, wholeArrayLevels = false, hostPattern = null, hostless = false, verdictOnly = false,
  pairContainers = true,
}) {
  const receiverNodes = [];
  // did a walk end above an array level on a foreign container? the mirror then spells that level
  // whole, or - where it cannot - leaves the host to its other routes rather than bailing
  let foreign = false;
  let nativeReads = false;
  // the receivers a level's DEFAULT supplied (below): they stand in the host's PATTERN, not in the
  // slot the plan named, so the span rule below does not apply and the render locates them from
  // the host itself
  const defaultBorn = new Set();
  const armHop = hops ? hops.findLastIndex(hop => hop.defaultNode) : -1;
  const arms = armHop === -1 ? null : new Set();
  let patternNode = null;
  // the pattern each receiver's walk ended under, by the receiver node the mirror replaces
  const patterns = new Map();
  const ctx = { scope: host.scope, adapter, path: host, resolveKey: sharedResolveKey };
  function descend(source) {
    const results = [];
    // one walk per live arm: `from` is the hop it starts at, `startBorn` whether a default supplied
    // it, and a forked walk inherits the level the fork stood at - the default IS that slot's value
    // eslint-disable-next-line max-statements -- shared slot/default walk, with pure container admission at each level
    function walk(start, from, startBorn, startDepth = 0, startPattern = null) {
      let node = start;
      let run = [];
      let depth = startDepth;
      let pattern = startPattern;
      let born = startBorn;
      let reachedArm = false;
      let paired = false;
      // the array pattern the pending run of index hops starts at: what the mirror renders whole
      // where the run stays unconsumed
      let runPattern = null;
      // the literal the level holds, through a transparent IIFE and a selection the build decides: the
      // call stays called where the source wrote it and its returned literal is what the level descends,
      // so the leaf the walk reaches is the one the leaf collector's own peel finds - and the mirror
      // replaces it in place, the siblings and the body around it as written
      function levelLiteral() {
        const peeled = levelLiteralThroughIife(node, ctx);
        node = peeled.node;
        // ... and a VERDICT walk reads a named callee's returned literal too: it only asks whether the
        // slot holds a value, while a mirror may not rewrite a body that serves every caller
        if (verdictOnly && peeled.literal?.type === 'CallExpression') {
          const called = callYieldedLiteral({ node: peeled.literal, seen: new Set(), ctx });
          if (called?.literal?.type === 'ObjectExpression' || called?.literal?.type === 'ArrayExpression') {
            node = called.literal;
            return called.literal;
          }
        }
        return peeled.literal;
      }
      function flushIndices() {
        if (!run.length) return true;
        // an element a level holds INLINE descends; a container reached through an alias or a
        // call is foreign to the host, so the mirror replaces the level's own node with the
        // pattern's literal there - the object level's rule for a slot with no literal - and the
        // run stays unconsumed, the pattern the one standing above it
        const level = levelLiteral();
        // ... and so may a walk a DEFAULT supplied: the mirror replaces that default in place, while
        // descending a bound one reached into the declaration every other reader of it shares
        if ((wholeArrayLevels || born) && level?.type !== 'ArrayExpression') {
          pattern = runPattern;
          run = [];
          foreign = true;
          return node !== null;
        }
        node = descendArrayWrapperInit({ node, ctx }, run, { throughStores: false })?.node ?? null;
        paired ||= level?.type === 'ArrayExpression';
        run = [];
        return node !== null;
      }
      // the descent lost the element (an opaque container - a parameter, a call - pairs no slot) at
      // hop `at` while a level with a DEFAULT still stands at or below it: nothing proves that
      // level's slot, so it is open, and the default's walk alone answers for it - the arm the
      // source leaves to the runtime is mirrored, the live arm's read stays native
      function forkAtArm(at) {
        if (armHop < at) return false;
        const levelDepth = depth + hops.slice(at, armHop + 1).filter(hop => hop.index === undefined).length;
        return walk(hops[armHop].defaultNode, armHop + 1, true, levelDepth, hops[armHop].pattern) ? FORK_ONLY : false;
      }
      // a level with a receiver-bearing DEFAULT reads it where the slot it pairs with provably holds
      // `undefined`: absent from a literal nothing else could supply it to, a hole, or spelled as such.
      // the default then stands where the slot's value would - deeper hops descend into it, and the
      // mirror replaces it in place, so every pass that takes the default reads the mirror
      // ... a level with no such default whose key pairs no value the descent can follow (absent under
      // an empty default, a throwing read, a spread's slot) loses the element like an opaque container
      function settle(hop, at, slotAbsent, levelDepth) {
        if (!hop.defaultNode) return node !== null || forkAtArm(at);
        const verdict = pairedDefaultArm(node, ctx, slotAbsent);
        if (at === armHop) {
          arms.add(verdict);
          reachedArm = true;
        }
        if (verdict === 'born') {
          node = hop.defaultNode;
          born = true;
          return true;
        }
        if (verdict === 'open') {
          if (!walk(hop.defaultNode, at + 1, true, levelDepth, hop.pattern)) return false;
          // an element nothing spells - a held container (`= slot`), a spread-shifted slot - has
          // no walk of its own: the default's walk is this level's whole answer
          if (node === null) return FORK_ONLY;
        }
        return node !== null;
      }
      for (let at = from; at < hops.length; at++) {
        const hop = hops[at];
        if (hop.index !== undefined) {
          if (!pairContainers && armHop < at && levelLiteral()?.type === 'ArrayExpression') return false;
          if (!run.length) runPattern = hop.level;
          run.push(hop.index);
          // the pattern under an array level is the element's own, like the one under a key
          pattern = hop.pattern;
          if (!hop.defaultNode) continue;
          // ... an array level with a default pairs its own slot: the descent answers null for a hole
          // and for a spread-shifted slot alike, and only the hole provably fires the default
          const index = run.pop();
          if (!flushIndices()) return forkAtArm(at) === FORK_ONLY;
          const level = levelLiteral();
          node = descendArrayWrapperInit({ node, ctx }, [index], { throughStores: false })?.node ?? null;
          paired ||= level?.type === 'ArrayExpression';
          const absent = node === null && level?.type === 'ArrayExpression'
            && level.elements.slice(0, index + 1).every(item => item?.type !== 'SpreadElement');
          const settled = settle(hop, at, absent, depth);
          if (!settled) return false;
          if (settled === FORK_ONLY) return true;
          continue;
        }
        if (!flushIndices()) return forkAtArm(at) === FORK_ONLY;
        const literal = levelLiteral();
        // a selection of containers holds one arm per pass: each arm walks the hops left on its own,
        // so the mirror lands in the slot of whichever arm runs and the selection stays as written
        const selectedArms = containerSelectionArms(literal, ctx);
        if (selectedArms) return selectedArms.every(arm => walk(arm, at, born, depth, pattern));
        // no literal in the slot: the keys left are navs the plan's own context walk descends off
        // this receiver (`= globalThis` mirrors the whole outer pattern) - the descent ends here
        // ... unless the container is OPAQUE (nothing the context walk descends: not a proxy, not
        // a static container) and a default stands at or below this level: that level is open
        if (literal?.type !== 'ObjectExpression') {
          if (armHop >= at && !slotValueProvablyDefined(node, ctx)) return forkAtArm(at) === FORK_ONLY;
          break;
        }
        if (!pairContainers && armHop < at) return false;
        const match = findObjectKeyBeforeSpread(literal.properties, prop => spelledSlotName(prop) === hop.key);
        if (match && literal.properties.slice(literal.properties.indexOf(match) + 1)
          .some(prop => spelledSlotName(prop) === null)) return false;
        // the claim funnel keeps such a leaf native (`claimUnderSharedHopSlot`); a plan asked anyway declines
        if (match && hopSlotReadElsewhere({ levelNode: hop.level, key: hop.key, scope: ctx.scope, adapter, path: ctx.path })) return false;
        // absent from a literal whose every key is spelled - no spread or computed key could be it
        const absent = !match && literal.properties.every(prop => spelledSlotName(prop) !== null);
        node = match ? objectPropertyReadValue(match, { preservesBody: true }) : null;
        paired = true;
        const settled = settle(hop, at, absent, depth + 1);
        if (!settled) return false;
        if (settled === FORK_ONLY) return true;
        depth++;
        pattern = hop.pattern;
      }
      if (!flushIndices()) return false;
      if (!pairContainers && paired && pattern && !born) {
        nativeReads = true;
        return armHop !== -1;
      }
      // a walk that ended above the nearest default never judged it: the runtime decides that arm
      if (!reachedArm && from <= armHop) arms.add('open');
      // the pattern this walk mirrors is the one under the last hop it consumed - the host's own where
      // it consumed none: walks ending at different levels (a bound container beside an inline literal,
      // a foreign array level beside a descended one) each mirror their own, and the plan's key is the
      // OUTERMOST of them
      const mirrors = pattern ?? hostPattern;
      if (patternNode === null || (mirrors && subtreeContainsNode(mirrors, patternNode))) patternNode = mirrors;
      results.push({ node, born, pattern: mirrors });
      return true;
    }
    if (source !== null) return walk(source, 0, false) ? results : null;
    if (armHop === -1) return null;
    arms.add('open');
    const depth = hops.slice(0, armHop + 1).filter(hop => hop.index === undefined).length;
    return walk(hops[armHop].defaultNode, armHop + 1, true, depth, hops[armHop].pattern) ? results : null;
  }
  for (const receiverSource of hostless ? [null] : receiverSources) {
    const descended = hops ? descend(receiverSource) : null;
    if (!descended) return null;
    for (const { node: slotNode, born, pattern } of descended) {
      // a slot the wrapper descent dereferenced OUT of the host's own init (a const-alias element -
      // `[w, eff()]` where `const w = [globalThis]`) is a FOREIGN declaration: mirroring there would
      // rewrite a value other readers of the alias observe, and the natural visitor's own rewrite of
      // that span already fires (un-suppressible - two rewrites would land on one span).
      // Decline here; the host separately decides whether it has a safe fallback.
      if (!verdictOnly && !born && !subtreeContainsNode(receiverSource, slotNode)) return null;
      // peel a pure effect PREFIX off a sequence default via the canonical peel (it also unwraps
      // paren / TS wrappers, which oxc keeps as first-class nodes - a manual sequence-only walk
      // left the unplugin side bailing on `(eff(), R)` parsed with a ParenthesizedExpression);
      // the receiver TAIL is dropped, so it must be provably effect-free itself
      const { tail } = peelNestedSequenceExpressions(slotNode);
      if (born) defaultBorn.add(tail);
      patterns.set(tail, pattern);
      // one default serves every pass that reads it: the sources that took it name one receiver
      if (!receiverNodes.includes(tail)) receiverNodes.push(tail);
    }
  }
  return { receiverNodes, patternNode, patterns, defaultBorn, arms, foreign, nativeReads };
}

// The whole index an object rest in `patternNode` over this constructor reads, or null - the one answer
// every route asks of a rest over a constructor. A flavor without a constructor entry and an excluded
// index leave the rest on the routes a constructor-less receiver takes, and so does, asked with
// `isDisabledProp`, a pattern holding an opted-out property. A rest makes its constructor escape (the
// census widens what it resolves to the family), so the narrow entry answers no rest
export function constructorRestIndex({ name, patternNode, resolveGlobalPolyfill, isDisabledProp = null }) {
  if (!hasConstructorEntry(name) || !patternNode?.properties?.some(isRestProperty)
    || patternNode.properties.some(prop => isDisabledProp?.(prop))) return null;
  const pure = resolveGlobalPolyfill(name);
  return pure && !pure.entry.includes('/') ? pure : null;
}

// ascend to the value-bearing host (any pattern depth), all reached when the declarator / cascade
// flatten bailed on a runtime-conditional receiver (the mirror swaps only the receiver operands so
// the effect / short-circuit keeps running in place):
//   - a param-level AssignmentPattern (default slot)
//   - a VariableDeclarator (init slot), or the LOOP of a for-x head declarator, which holds none
//   - an AssignmentExpression cascade (`({ Array: { from } } = receiver)` - receiver in `.right`)
function mirrorPlanHost(leafPatternPath, constructorRest = false, flatInstanceDefault = false, staticIsMutated = null) {
  let cur = leafPatternPath;
  for (let depth = 0; depth < STATIC_WALK_DEPTH && cur?.node; depth++) {
    const parent = cur.parentPath;
    if (!parent?.node) return null;
    const parentType = parent.node.type;
    // a transparent inner default (`[{ Array: { of } } = {}] = [globalThis]`) is see-through - fall
    // through (keep walking) to the value-bearing host above it (the param default), so the WHOLE
    // receiver is replaced by the mirror (`[{ Array: { of: _Array$of } }]`): a default on the leaf would
    // over-apply the polyfill and TypeError an empty arg.
    // a FLAT key trigger whose pattern IS the host's direct child (`{ Math:{floor}, Set } = R` visited
    // through `Set`) reaches the host on the first hop - `selfHostAllowed` permits it ONLY for a MIXED
    // pattern (see the helper); a pure-flat pattern keeps its own body-extract / synth-swap fallback
    // ... and a receiver-bearing INNER default (`[{ Set, Array: { of } } = globalThis]`, `{ p: { ... } =
    // globalThis }`) is a LEVEL the wrapper walk records, not a host: the value-bearing host stands
    // above it, and the descent reads the default where the slot it pairs with leaves it live
    if (parentType === 'AssignmentPattern' && parent.node.left === cur.node
      && (selfHostAllowed(cur, leafPatternPath) || flatInstanceDefault && cur === leafPatternPath
        || constructorRest && cur.node.type === 'ObjectPattern'
        && cur.node.properties.some(isRestProperty))
      && !isInnerDestructureDefault(parent) && FUNCTION_LIKE_NODE_TYPES.has(parent.parentPath?.node?.type)) {
      return { host: parent, slot: 'right', node: parent.node.right };
    }
    // a PARAMETER pattern of an IIFE: the mirror replaces the call's argument at the parameter's index,
    // the value the pattern reads - the call is the host, the argument slot its `arguments.<i>`
    if (FN_NODE_TYPES.has(parentType) && parent.node.params?.includes(cur.node) && selfHostAllowed(cur, leafPatternPath)) {
      const site = findIifeCallSite(parent, cur.node);
      const node = site ? resolveCallArgument(site.callPath.node.arguments ?? [], site.paramIndex, staticIsMutated) : null;
      return node ? { host: site.callPath, slot: `arguments.${ site.paramIndex }`, node } : null;
    }
    // ... and the same head with NO declaration at all (`for ([{ from }] of [[Array]])`): the pattern
    // IS the loop's `left`, and what it destructures is still an ELEMENT of the iterated literal -
    // the loop hosts, the element is the slot, and the swap lands inside the literal on every pass.
    // a for-IN head spells no element to swap, so it declines here as it does one level down
    if (isForXStatement(parent.node) && parent.node.left === cur.node && selfHostAllowed(cur, leafPatternPath)) {
      const headElements = forOfIterableElements(parent.node);
      return headElements ? { host: parent, slot: 'right', node: parent.node.right, headElements } : null;
    }
    if (parentType === 'VariableDeclarator' && parent.node.id === cur.node && selfHostAllowed(cur, leafPatternPath)) {
      // a for-x HEAD declarator carries no init of its own: what it destructures is an ELEMENT of
      // the iterated literal. the mirror hosts on the LOOP and swaps that element in place INSIDE
      // the array, so every pass reads its own mirrored value - where a binding lifted out of the
      // head into the body is only ever right while the head runs once
      // A native binding may have moved this head pattern into the loop body already.
      // Recover its original sole element through the same source-slot canon as flat synths.
      const paired = ownRelocatedHeadElement(parent) && resolveFallbackReceiver(parent, cur.node, staticIsMutated);
      if (paired?.hostPath) return {
        host: paired.hostPath, slot: 'right', node: paired.hostPath.node.right, headElements: [paired.rhsNode], relocated: true,
      };
      if (parent.node.init) return { host: parent, slot: 'init', node: parent.node.init };
      const headElements = forOfHeadIterableElements(parent);
      const loop = headElements ? parent.parentPath?.parentPath : null;
      return loop?.node ? { host: loop, slot: 'right', node: loop.node.right, headElements } : null;
    }
    if (parentType === 'AssignmentExpression' && parent.node.left === cur.node && selfHostAllowed(cur, leafPatternPath)) {
      return { host: parent, slot: 'right', node: parent.node.right };
    }
    cur = parent;
  }
  return null;
}

// is the leaf's NEAREST inner default dead - does every walk of the plan's descent prove the slot it
// pairs with a value (`{ A: { at } = [9] } = { A: [1, 2] }`)? the arm verdict the mirror plan
// reads, asked without planning a mirror - and answered once per pattern, off the source: a sibling
// claim a leg has already rewritten (the paired literal memoized) must not flip it
export function nearestInnerDefaultDead(leafPatternPath, adapter) {
  const arms = nearestInnerDefaultArms(leafPatternPath, adapter);
  return !!arms?.size && [...arms].every(verdict => verdict === 'dead');
}

// ... the verdicts themselves, one per walk the plan's descent takes (`born` - the default supplies
// the slot, `dead` - the source does, `open`), or null where no plan stands
const innerDefaultArmsCache = createInstanceNodeCache();
function nearestInnerDefaultArms(leafPatternPath, adapter) {
  if (leafPatternPath?.node?.type !== 'ObjectPattern') return null;
  if (innerDefaultArmsCache.has(adapter, leafPatternPath.node)) return innerDefaultArmsCache.get(adapter, leafPatternPath.node);
  const planHost = mirrorPlanHost(leafPatternPath, false, false, adapter.isMutatedStaticSlot ?? adapter.isMutatedStatic);
  const walked = planHost?.host && planHost.node ? destructureHostThroughWrappers(leafPatternPath, adapter, true) : null;
  const arms = walked?.hops ? mirrorReceiverNodes({
    receiverSources: planHost.headElements ?? [planHost.node],
    hops: walked.hops,
    host: planHost.host,
    adapter,
    hostPattern: walked.pattern,
    verdictOnly: true,
  })?.arms ?? null : null;
  innerDefaultArmsCache.set(adapter, leafPatternPath.node, arms);
  return arms;
}

// A caller argument consumed only by a parameter pattern can use the same mirror as its default.
// Enumerate callers through the existing closed caller census, and mirror each source independently:
// the pattern's keys keep their parameter scope, while each receiver resolves at its own call site.
function parameterArgumentSources(
  leafPatternPath, adapter, parameterCallSites, includeGuardedSources = false, includeFlatInstance = false,
) {
  if (!parameterCallSites) return null;
  const walked = destructureHostThroughWrappers(leafPatternPath, adapter, true);
  const paramPath = walked?.host?.node?.type === 'AssignmentPattern' ? walked.host : walked?.hostPatternPath;
  const fnPath = paramPath?.parentPath;
  if (!FUNCTION_LIKE_NODE_TYPES.has(fnPath?.node?.type) || !fnPath.node.params?.includes(paramPath.node)
    || referencesArgumentsObject(fnPath.node)) return null;
  // Flat IIFE statics retain their caller-aware synth channel, including guard/probe rendering.
  // Instance claims opt into the shared mirror so their reads remain at parameter consumption.
  if (!includeGuardedSources && !includeFlatInstance && !walked.hops?.length && findIifeCallSite(fnPath, paramPath.node)) return null;
  const sites = parameterCallSites(paramPath, {
    staticIsMutated: adapter.isMutatedStatic,
    // Pending imports already have scoped binding metadata before the injector flushes them.
    getBindingEntry(scope, name, path, read = null) {
      const binding = adapter.getBinding({ scope, name, path, read });
      return binding?.constantViolations?.length ? null : pureImportSourceEntry(binding?.importSource);
    },
  });
  const instanceDefaultOpen = includeFlatInstance && paramPath.node.type === 'AssignmentPattern'
    && sites?.some(({ pairing, callPath, argIndex }) => {
      if (pairing.argsUnknown) return true;
      const node = resolveCallArgument(pairing.args ?? [], argIndex, adapter.isMutatedStaticSlot ?? adapter.isMutatedStatic);
      const ctx = { scope: callPath.scope, adapter, path: callPath };
      return pairedDefaultArm(node, ctx) !== 'dead' && (!node || !receiverValueNeverNullish(node, ctx));
    });
  const sources = (includeGuardedSources || instanceDefaultOpen) && paramPath.node.type === 'AssignmentPattern'
    ? [{ host: paramPath, slot: 'right', node: paramPath.node.right, hops: walked.hops }] : [];
  if (!sites && !sources.length) return null;
  // `complete`: every caller handed a source - one the census could not pair (spread arguments, an
  // omitted slot) may still pass the slot `undefined`, so no verdict about the default arm closes
  let complete = !!sites;
  for (const { pairing, callPath, argIndex } of sites ?? []) {
    // An omitted or explicitly undefined slot is already served by the default source above.
    // Leave that argument native and keep the completed caller plan from wrapping its default again.
    if (instanceDefaultOpen && !pairing.argsUnknown && !argumentOverridesSlot(
      pairing.args ?? [],
      argIndex,

      () => adapter.hasBinding({ scope: callPath.scope, name: 'undefined', path: callPath }),
      adapter.isMutatedStaticSlot ?? adapter.isMutatedStatic,
    )) continue;
    const node = pairing.argsUnknown ? null : resolveCallArgument(
      pairing.args ?? [],
      argIndex,
      adapter.isMutatedStaticSlot ?? adapter.isMutatedStatic,
    );
    if (!node) {
      complete = false;
      continue;
    }
    sources.push({ host: callPath, slot: null, node, hops: walked.hops });
  }
  return { sources, complete };
}

// Mirror the supplied receiver independently of the parameter's fallback: both can be live in one
// function, and a custom caller object keeps its own properties and identity.
// `settled` closes the leaf's INNER default arm for every caller: each one handed a source, and at
// each the plan either mirrored that default or proved it dead - so the parameter's own rewrite of
// the arm would only duplicate what stands here
export function buildParameterArgumentSynthPlan({
  leafPatternPath,
  meta,
  resolvePure,
  adapter,
  parameterCallSites,
  isDisabledProp = null,
  retainNativeReads = false,
}) {
  if (!meta) return null;
  const staticClaim = (meta.object || meta.guardedAliasHint) && meta.placement === 'static';
  const instanceClaim = !staticClaim && resolvePure?.(meta)?.kind === 'instance';
  if (!staticClaim && !instanceClaim) return null;
  const argumentSources = parameterArgumentSources(leafPatternPath, adapter, parameterCallSites, !!meta.guardedAliasHint, instanceClaim);
  if (!argumentSources) return null;
  const targets = [];
  const targetNodes = new Set();
  let readProperties = argumentSources.complete ? null : [];
  let claimedProperties = retainNativeReads && argumentSources.complete ? null : [];
  // ... and a caller has to exist for the arm to be closed by callers at all
  let settled = argumentSources.complete && argumentSources.sources.length > 0;
  // the dead defaults a caller's literal fills, which only the realm handed by a sole caller leaves
  const deadDefaults = [];
  let patternHost = null;
  for (const callSite of argumentSources.sources) {
    const plan = buildNestedParamSynthPlan({ leafPatternPath, meta, resolvePure, adapter, callSite, isDisabledProp, retainNativeReads });
    for (const node of plan?.deadDefaults ?? []) if (!deadDefaults.includes(node)) deadDefaults.push(node);
    patternHost ??= plan?.patternHost ?? null;
    const reads = plan?.readProperties ?? [];
    readProperties = readProperties === null ? reads : readProperties.filter(prop => reads.includes(prop));
    if (retainNativeReads) {
      const claimed = plan?.claimedProperties ?? [];
      claimedProperties = claimedProperties === null ? claimed : claimedProperties.filter(prop => claimed.includes(prop));
    }
    // a default the plan supplied stands in the parameter's PATTERN, and its target already
    // carries that host; the call's argument is where every other target lives
    for (const target of plan?.targets ?? []) {
      if (targetNodes.has(target.node)) continue;
      targetNodes.add(target.node);
      targets.push(target.host ? target : { ...target, host: callSite.host, slot: callSite.slot });
    }
    // A caller-only instance leaf has no inner default to settle. Once its receiver
    // was mirrored, another instance synth would wrap that synthetic object again.
    if (plan?.defaultArm !== 'mirrored' && plan?.defaultArm !== 'dead'
      && !(instanceClaim && plan?.defaultArm === null && plan.targets?.length)) settled = false;
  }
  return targets.length || settled ? {
    targets,
    settled,
    readProperties,
    deadDefaults,
    patternHost,
    ...retainNativeReads ? { claimedProperties: claimedProperties ?? [] } : {},
  } : null;
}

// Resolve one caller's static receiver or guarded candidates through its pattern-hop path.
// For a hop-less source the ordinary init meta is the fallback. Reject a mutated static slot.
// This is a value query: a mirror must separately preserve or decline the source's effects.
function parameterArgumentStaticMeta(source, { key, adapter, unionSink = null }) {
  const walked = walkStaticReceiverChain({
    receiverNode: installedWriteValue(source.node),
    walkPath: source.hops.map(hop => hop.key ?? String(hop.index)),
    scope: source.host.scope, adapter, path: source.host,
    usageNode: source.node, preservesSelection: true, unionSink,
  });
  const init = walked || source.hops.length ? null : buildDestructuringInitMeta({
    initNode: source.node, key, scope: source.host.scope, adapter, path: source.host,
  });
  const object = walked ?? (init?.placement === 'static' ? init.object : null);
  if (object) return adapter.isMutatedStatic?.(object, key) ? null : {
    kind: 'property', object, key, placement: 'static', receiverHint: staticReceiverHint('static', object),
  };
  return init?.guardedAliasHint ? init : null;
}

// A parameter's proven callers can carry static receivers independently of its default.
// Global collects every caller's claim; pure uses this metadata only to mirror the argument.
function parameterArgumentDestructureMeta(objectPattern, { key, adapter, parameterCallSites, resolvePure, unionSink = null }) {
  if (!key || adapter.method === 'usage-pure' && !resolvePure) return null;
  let primary = null;
  const sources = parameterArgumentSources(objectPattern, adapter, parameterCallSites)?.sources ?? [];
  for (const source of sources) {
    if (!source.hops) continue;
    const candidates = adapter.method === 'usage-global' ? [] : null;
    const selected = parameterArgumentStaticMeta(source, { key, adapter, unionSink: candidates });
    if (candidates?.length) {
      unionSink?.push(...candidates);
      primary ??= {
        kind: 'property', object: candidates[0], key, placement: 'static', receiverHint: staticReceiverHint('static', candidates[0]),
        parameterArgumentsOnly: true,
      };
    }
    if (selected?.guardedAliasHint) {
      primary ??= selected;
      continue;
    }
    const object = selected?.object;
    if (!object) continue;
    const meta = { ...selected, parameterArgumentsOnly: true };
    if (adapter.method === 'usage-global') {
      if (!unionSink) return meta;
      unionSink.push(object);
      primary ??= meta;
      continue;
    }
    const pure = resolvePure(meta);
    if (pure && pure.kind !== 'instance') return meta;
  }
  if (!primary && adapter.method === 'usage-pure' && sources.length) {
    const instance = { kind: 'property', object: null, key, placement: null, parameterArgumentsOnly: true };
    if (resolvePure(instance)?.kind === 'instance') return instance;
  }
  return primary;
}

// Intrinsic primitive globals are values, not constructors. Prove their scoped source
// before using the registry, including an alias of a pristine realm property.
function primitiveGlobalReceiver(node, name, ctx) {
  const family = PRIMITIVE_WRAPPERS[knownBuiltInReturnTypes.globalProperties[name]?.type];
  if (!family) return null;
  const source = followConstIdentifierInit({ node, readNode: node, ctx });
  const origin = unwrapRuntimeExpr(source.node);
  const global = origin?.type === 'Identifier' && !ctx.adapter.hasBinding({ ...source.ctx, name: origin.name, read: origin })
    ? origin.name : globalProxyMemberName({ node: origin, ...source.ctx });
  return global === name ? { kind: 'instance', name: family } : null;
}

// the ROOT a mirror stands on for one receiver leaf, as the plan classifies it: the pristine realm
// (`proxy`), a static container (`static`, with the node the walk descends), a constructor (`ctor`,
// its name; `builtin` where it is a GLOBAL constructor - an object, so truthy), or null. `callSite`
// asks for a leaf a caller supplies, read at the argument's capture point; `rescuesReceiverRead` is
// the host's permission to replay a receiver read the render discards (a declaration or an
// assignment host). the plan's mirror and the truthiness of every selection operand read this
// ... a STORE stands on the value it stores (`peelChainRootValue`): the mirror keeps the store running
// as the prefix of the literal that stands in for that value (`(B = mk()) || { C: Object }`)
function mirrorRootContext({ node: leaf, scope, adapter, path, callSite = null, rescuesReceiverRead = false }) {
  const node = isChainAssignment(leaf) ? peelChainRootValue(leaf) : leaf;
  // Caller leaves are resolved at the argument's capture point. Inline object branches
  // retain their selector; a call yielding a container is the container it returns (the call arm
  // below), kept running ahead of the literal that stands in for its value
  if (callSite) {
    if (node?.type === 'ObjectExpression') return { kind: 'static', receiverNode: node, walkPath: [] };
    const supplied = walkStaticReceiverChain({
      receiverNode: node,
      walkPath: [],
      usageNode: node,
      scope,
      adapter,
      path,
    });
    if (supplied && isKnownGlobalName(supplied)) return isPristineProxyGlobal(adapter, supplied)
      ? { kind: 'proxy' } : primitiveGlobalReceiver(node, supplied, { scope, adapter, path })
        ?? { kind: 'ctor', name: supplied, builtin: true };
  }
  let n = node;
  // a proxy hop is walked through only while it still stands for the pristine surface: a slot the
  // user overwrote (`globalThis.window = fake`) holds the replacement, so descending it mirrors a
  // ponyfill onto an object the source never reads - the two halves travel together everywhere
  while ((n?.type === 'MemberExpression' || n?.type === 'OptionalMemberExpression') && !n.computed
    && n.property?.type === 'Identifier' && isPristineProxyGlobal(adapter, n.property.name)) n = n.object;
  // the NAME is asked through the root resolver, never off the raw node: `function f(self)` and
  // `const window = {}` bind the USER's object under a proxy-global spelling, and a mirror trusting
  // the spelling replaces that object with a ponyfill the source never read
  const rootName = !callSite && n?.type === 'Identifier'
    ? proxyGlobalRootName({ node: n, scope, adapter, path }) : null;
  if (rootName && isPristineProxyGlobal(adapter, rootName)) return { kind: 'proxy' };
  // a const-aliased proxy (`const NS = globalThis; ... = NS`) the root resolver declines is still
  // reached through the SAME resolveObjectName walk mirrorReceiverDescriptor uses for the emitted
  // receiver, so the mirror CONTEXT and the receiver agree instead of stranding the alias
  const resolved = resolveObjectName({ objectNode: n, scope, adapter, path })
    ?? provenRealmCallName(n, { scope, adapter, path }, { allowEffects: true });
  if (resolved && isPristineProxyGlobal(adapter, resolved, path && { node: n, path })) return { kind: 'proxy' };
  const primitive = resolved && primitiveGlobalReceiver(node, resolved, { scope, adapter, path });
  if (primitive) return primitive;
  // a const-bound static-object wrapper (`const w = { a: Array }; ... = w`): each pattern key resolves
  // through the object literal to its constructor (`w.a` -> Array) via the SAME walkStaticReceiverChain
  // the declarator static path uses. distinct from a bare ctor by its ObjectExpression init - carry the
  // receiver + walk path so mirrorPattern descends per key instead of stranding the whole tree native
  // ... a wrapper whose initializer has RUN by the read (the dominance canon): a hoisted `var`
  // declared below the destructure holds `undefined` there, and the source throws where a
  // mirror of its literal would bind
  // ... and a name bound to a CALL yielding one (`const w = f()`): the keys descend the receiver
  // walk's alias and call arms alike, and the read of the name is what the mirror replaces
  if (boundStaticContainer({ node: n, scope, adapter, path, classes: !rescuesReceiverRead })) {
    return { kind: 'static', receiverNode: n, walkPath: [] };
  }
  // ... and the same container yielded by a CALL (`= f()` over `const f = () => ({ a: Array })`):
  // the keys descend the receiver walk's call arm to the callee's literal, and the leaf the mirror
  // replaces is the call, kept as the prefix of the literal that stands in for its value
  const yielded = invocationNode(n) ? callYieldedLiteral({
    node: n, readNode: n, seen: new Set(), ctx: { scope, adapter, path },
  })?.literal.type : null;
  if (yielded === 'ObjectExpression' || yielded === 'ArrayExpression') return { kind: 'static', receiverNode: n, walkPath: [] };
  // a proxy-global SPELLING the root resolver DECLINED is the user's own binding - a parameter, a
  // local - and it names no container at all: falling on to the constructor arm below would mirror
  // its pattern as though the name were one (`function f(window)` earning `{ Map: _Map }`)
  if (!callSite && n?.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(n.name) && !rootName) return null;
  // a bare-constructor root is only trusted because the visited leaf's identification
  // already resolved through this very default (meta gate above)
  // `builtin`: the name resolved to a global constructor - a value that is an object, so truthy
  if (callSite && resolved) return { kind: 'ctor', name: resolved, builtin: true };
  // `builtin` states that the name is a GLOBAL CONSTRUCTOR - an object, hence truthy - so the
  // resolved name has to BE one. a bare resolution is not that claim: an alias holding an unbacked
  // key off the realm (`const shim = globalThis.shim`) resolves to its own name and is undefined
  // wherever the host lacks it, and calling that truthy collapsed a `||` onto its left, taking the
  // right arm's mirror with it - the other binding kept both arms and injected
  // the NAME is the resolved one wherever the value canon backs it: a const alias (`const A = Array`)
  // spells itself, and a mirror asking `resolvePure({ object: 'A' })` gets nothing, leaves the tree
  // wholly passthrough and declines - the loop head, whose only route is that mirror, went native
  if (n === node && node.type === 'Identifier') {
    const builtin = !!resolved && isKnownGlobalName(resolved);
    return resolved ? { kind: 'ctor', name: resolved, builtin } : null;
  }
  // ... and the same constructor reached THROUGH the realm (`globalThis.Array`): what the mirror
  // needs is the NAME, and the value canon answers it whatever the spelling carries it - the
  // Identifier test above is a spelling, not the question. Refusing every other spelling left a
  // for-x head over such a receiver reading its statics raw off the element, where the declaration
  // twin extracts them; `isKnownGlobalName` is what keeps an alias resolving to its own unbacked
  // name (`const shim = globalThis.shim`) out, exactly as it does for the bare spelling
  // ... but only where that spelling is ALWAYS DEFINED: a hop pure cannot back is the environment
  // PROBE, and its read is the one the source may fail on - a literal standing in for it binds the
  // ponyfill where native throws, and the throw is the answer the consuming position owes
  if (resolved && isKnownGlobalName(resolved)
    && !destructureReceiverOwesAThrow(node, { scope, adapter, path })) return { kind: 'ctor', name: resolved, builtin: true };
  // ... and a receiver written IN PLACE (`({ w: Array }).w`, `[Array][0]`) is a CONTAINER, which the
  // name resolver above declines by contract - it walks proxy chains. the meta reads it through the
  // container canon, so the mirror was refusing a receiver its own detection had already named
  const container = staticContainerReceiverName({ node: n, scope, adapter, path, rescuesReceiverRead });
  if (container && isPristineProxyGlobal(adapter, container)) return { kind: 'proxy' };
  if (container && isKnownGlobalName(container)) return { kind: 'ctor', name: container, builtin: true };
  return null;
}

// Plan receiver/default mirrors through pattern wrappers, preserving each selected arm's effects.
// A supplied callSite owns the argument route; otherwise locate the leaf's original host.
// eslint-disable-next-line max-statements -- the receiver walks, the leaf census and the target build share one plan
export function buildNestedParamSynthPlan({
  leafPatternPath,
  meta,
  resolvePure,
  adapter,
  callSite = null,
  isDisabledProp = null,
  retainNativeReads = false,
  allowFlatInstanceDefault = false,
}) {
  if (!resolvePure || !meta) return null;
  const staticClaim = (meta.object || meta.guardedAliasHint) && meta.placement === 'static';
  const instanceClaim = !staticClaim && resolvePure(meta)?.kind === 'instance';
  if (!staticClaim && !instanceClaim) return null;
  if (leafPatternPath?.node?.type !== 'ObjectPattern') return null;
  function resolveGlobalPolyfill(name) {
    return resolvePure({ kind: 'global', name });
  }
  const planHost = callSite ?? mirrorPlanHost(leafPatternPath, !!constructorRestIndex({
    name: meta.object, patternNode: leafPatternPath.node, resolveGlobalPolyfill, isDisabledProp,
  }), allowFlatInstanceDefault && instanceClaim, adapter.isMutatedStaticSlot ?? adapter.isMutatedStatic);
  // A relocated head's ordinary claims belong to its body extraction. Only a fallback
  // claim still owes a branch mirror on the original element before that extraction runs.
  if (planHost?.relocated && !meta.fromFallback) return null;
  const receiverPath = callSite?.host ?? leafPatternPath;
  const headElements = planHost?.headElements ?? null;
  // no host spells the slot the leaf's inner default pairs with - a catch parameter binds the
  // thrown value, a function no caller census closes, a head over an iterable the source holds -
  // so that arm is open wherever the pattern stands, and the default alone is mirrored, hosted on
  // the pattern that carries it: the nested twin of the flat channel's swap of the default
  const hostless = !planHost?.host || !planHost.node;
  const host = hostless ? null : planHost.host;
  const slot = hostless ? null : planHost.slot;
  // Instance-only mirrors serve the closed caller's argument or the parameter's own
  // default. Other hosts keep their existing capture and extraction routes.
  const parameterInstance = !!callSite || host?.node.type === 'AssignmentPattern'
    && FUNCTION_LIKE_NODE_TYPES.has(host.parentPath?.node?.type);
  if (instanceClaim && !parameterInstance) return null;
  // A consumed assignment yields its original receiver, so replacing that receiver with a mirror
  // changes the expression's result. Leave it to a retaining route; a discarded assignment or
  // parameter default has no independent result identity to preserve.
  if (host?.node.type === 'AssignmentExpression' && !assignmentValueDiscarded(host)) return null;
  // descend ArrayPattern wrappers: an outer destructure may wrap the consumed object-pattern in
  // arrays (`const [, { Array: { from } }] = [0, R]`). resolve the element's object-pattern and the
  // init slot descended to the matching element, so the mirror swaps the proxy branch INSIDE the
  // array element exactly like a direct receiver - not only the bare `{ Array: { from } } = R` shape
  // ... and through every INNER default on the way: the host the walk above chose stands over them,
  // and the record carries each level's receiver-bearing default for the descent to read where the
  // slot holds `undefined`
  const walked = destructureHostThroughWrappers(leafPatternPath, adapter, true);
  if (!walked) return null;
  // The exact IIFE's former instance synth already admits stable names and one-use
  // invocations. Keep that admission while moving its reads to the parameter's turn.
  const paramPath = walked.host?.node.type === 'AssignmentPattern' ? walked.host : walked.hostPatternPath;
  const instanceIife = instanceClaim && paramPath && findIifeCallSite(paramPath.parentPath, paramPath.node);
  const claimPath = instanceIife && leafPatternPath.get('properties').find(prop => resolveSynthKeys({
    node: prop.node, scope: prop.scope, adapter, path: prop,
  }).lookupKey === meta.key);
  // a for-x head hands the mirror one receiver PER ELEMENT of the iterated literal: the same pattern
  // destructures each of them on its own pass, so each is mirrored where it is written and no pass
  // reads a value another one installed. every other host holds exactly one receiver
  const receiverSources = headElements ?? (hostless ? [] : [planHost.node]);
  // ... and so do a CALL SITE and a parameter DEFAULT: the parameter's pattern has no route to a
  // foreign element either
  const wholeArrayLevels = !!headElements || !!callSite
    || (host?.node.type === 'AssignmentPattern' && FUNCTION_LIKE_NODE_TYPES.has(host.parentPath?.node?.type));
  const mirrored = mirrorReceiverNodes({
    receiverSources, hops: walked.hops, host: host ?? leafPatternPath, adapter, wholeArrayLevels, hostPattern: walked.pattern, hostless,
    pairContainers: instanceClaim,
  });
  if (!mirrored) return null;
  const { receiverNodes, defaultBorn, arms } = mirrored;
  // ... and a host whose RECEIVER the mirror replaces whole - a declarator or an assignment, where
  // the swapped node is the source's own read rather than a slot a caller can fill - owes two more
  // answers, and they belong HERE so both bindings get them from one place instead of each gating its
  // own ask. A receiver whose READ owes a throw keeps that read: the literal cannot throw where the
  // source does, and the PROBE channel - which leaves the read as a discarded prefix and takes the
  // value from the ponyfill - is the render that owes it. And a claim standing under NO hop has no
  // receiver of its own to mirror: the flat channel spells the host's receiver, and mirroring there
  // bought a second memo over the first
  // one plan per MIRRORED pattern - the one under the last hop the descent consumed: sibling leaves
  // of that pattern share it, while a leaf under another hop of the same host (`{ a: { hasOwn },
  // b: { is } }`) mirrors its own slot. keyed on the host, the second hop read the first one's
  // "done" and stayed raw
  // A caller owns a verdict per descended pattern. Sibling patterns can mirror distinct
  // elements of one argument, while each caller separately decides the same default arm.
  const planOwner = callSite?.node ?? adapter;
  const planKey = mirrored.patternNode ?? walked.pattern;
  if (!retainNativeReads && nestedParamSynthPlan.has(planOwner, planKey)) return nestedParamSynthPlan.get(planOwner, planKey);
  const keyCtx = { scope: leafPatternPath.scope, adapter, path: leafPatternPath };
  const receiverCtx = { scope: receiverPath.scope, adapter, path: receiverPath };
  // a fallback-logical root collapses LEFT (`globalThis || self` - the left short-circuits
  // the selection wherever it is defined; the literal replaces the WHOLE logical), while `&&`
  // yields its RIGHT side when taken - only the right operand is replaced, so a falsy left
  // keeps selecting natively. the surviving branch drives the context walk
  // every value leaf is classified twice - once by `collectValueLeaves` for the reachability
  // verdict, once by `buildMirrorTargets` for the mirror context - and the answer costs a member
  // spine walk plus a `resolveObjectName` binding chase plus an `adapter.getBinding` probe.
  // declared HERE, above `collectValueLeaves`: `rootContext` hoists, a `const` beside it does not
  const rootContextByNode = new Map();
  const targetLeaves = [];
  // leaves whose OWN value picks a `||` / `??` branch (a logical LEFT, and everything whose
  // value flows into one) and may be FALSY there: swapping such a leaf to an always-defined literal
  // flips which branch runs, so the mirror skips those below whose own spelling can be nullish. a
  // selecting leaf the classification proves truthy (a call yielding a builtin constructor) decides
  // nothing the literal could flip
  const valueSelectingLeaves = new Set();
  // Only a logical OR consumes truthiness. A ternary or nullish selection can yield a falsy receiver.
  const truthySelectingLeaves = new Set();
  // the `||` / `??` selections whose right the walk never reaches: a literal replacing a leaf of the
  // left is always defined, so each gives way to that left
  const deadRights = [];
  // the leaves the census takes as possibly nullish, by their own spelling or by the realm-read rule
  // alone (`unservedConstructorLeaf`) - the gate below swaps the latter all the same
  const nullableLeaves = new Set();
  const realmNullableLeaves = new Set();
  // enumerate the REACHABLE value leaves of a fallback tree (`selectionValueCanBeFalsy`), each into
  // the targets and, where its own value picks a branch, into the selecting set; returns whether the
  // subtree can yield a falsy value
  function collectValueLeaves(node, selects = false) {
    return selectionValueCanBeFalsy(node, {
      selects,
      peelIife: !callSite,
      rootContext,
      staticIsMutated: adapter.isMutatedStaticSlot ?? adapter.isMutatedStatic,
      nullable: tail => {
        if (fallbackValueCanBeNullish(tail, receiverCtx)) nullableLeaves.add(tail);
        else if (unservedConstructorLeaf(tail, receiverCtx, rootContext)) realmNullableLeaves.add(tail);
        else return false;
        return true;
      },
      headYields: leaf => forOfHeadLeftAlwaysYields(leaf, receiverCtx),
      onLeaf: (leaf, selecting, falsy, truthySelecting) => {
        targetLeaves.push(leaf);
        if (selecting && falsy) valueSelectingLeaves.add(leaf);
        if (truthySelecting && falsy) truthySelectingLeaves.add(leaf);
      },
      wholeValue: selection => parameterInstance && (!!rootContext(selection)?.decidedReceiver
        || selection.type === 'ConditionalExpression' && !!rootContext(selection)?.pairedInstanceReceiver
        || selection.operator === '&&' && !leftAlwaysYields(selection.left, receiverCtx)
        && !!rootContext(selection)?.selectedReceiver),
      onDeadRight: selection => deadRights.push(selection),
      optedOut: selection => !!adapter.isOptedOut?.(selection),
    });
  }
  let rootCanBeFalsy = false;
  // the leaves a level's DEFAULT supplied stand in the host's pattern, outside the slot the plan
  // names: their targets carry the host itself for the render to locate them from
  const defaultLeaves = new Set();
  // the pattern each leaf's receiver walk ended under - what the mirror renders at that leaf
  const leafPatterns = new Map();
  for (const receiverNode of receiverNodes) {
    const from = targetLeaves.length;
    rootCanBeFalsy = collectValueLeaves(receiverNode) || rootCanBeFalsy;
    for (const leaf of targetLeaves.slice(from)) {
      if (defaultBorn.has(receiverNode)) defaultLeaves.add(leaf);
      leafPatterns.set(leaf, mirrored.patterns?.get(receiverNode) ?? null);
    }
  }
  // the whole-logical collapse below reads THE receiver, so it only applies where there is one
  const soleReceiver = receiverNodes.length === 1 ? receiverNodes[0] : null;
  // a bare always-defined left keeps the right DEAD: when the whole expression is pure it
  // collapses entirely to the single literal; with an effect anywhere only the left tail is
  // swapped, and the selection then gives way to it (the target's `deadFallbacks`)
  // ... and a selection every branch of which yields the REALM collapses whole for the same reason
  // written the other way round: its branches name ONE object, so no branch is worth keeping and
  // swapping the left flips nothing the source can observe. the leaf count above sees two LIVE
  // leaves there and mirrors only the fallback arm, which leaves the probe selecting natively - and
  // a host that HAS `window` takes exactly that branch, reads the realm raw and polyfills nothing
  if (soleReceiver?.type === 'LogicalExpression'
    && !mayHaveSideEffects(soleReceiver, { adapter, scope: receiverPath.scope, path: receiverPath })
    && (realmSelectionCollapseOperand(soleReceiver, { adapter, scope: receiverPath.scope, path: receiverPath })
      || (!rootCanBeFalsy && targetLeaves.length === 1))) {
    targetLeaves.length = 1;
    targetLeaves[0] = soleReceiver;
    if (defaultBorn.has(soleReceiver)) defaultLeaves.add(soleReceiver);
  }

  // Parameter instance inference reads a capture before the pattern keys/defaults,
  // even when their text precedes the initializer. Only that inference needs a
  // source-local frame; static mirrors keep the receiver frame without a descent.
  function receiverContext(node) {
    const at = parameterInstance && pathOfNode(receiverPath, node);
    return at ? { ...receiverCtx, scope: at.scope, path: at } : receiverCtx;
  }

  function rootContext(node) {
    if (rootContextByNode.has(node)) return rootContextByNode.get(node);
    let ctx = resolveRootContext(node);
    const running = parameterInstance && decidedRunningOperand(node, receiverCtx);
    if (running && running !== node) {
      const selected = rootContext(unwrapRuntimeExpr(running));
      if (selected?.kind === 'instance') ctx = { ...selected, selectedReceiver: true, decidedReceiver: true };
    }
    // Classify a write by its installed value; the argument memo still evaluates the whole write.
    const installed = parameterInstance && installedWriteValue(node);
    if (installed && installed !== node) {
      const instance = rootContext(installed);
      if (instance?.kind === 'instance') ctx = { ...instance, sourceInstance: true };
    }
    const bindingInstance = (instanceClaim || meta.guardedAliasHint) && node.type === 'Identifier'
      && (mirrored.patterns.get(node) ?? mirrored.patternNode ?? walked.pattern) === leafPatternPath.node
      && adapter.hasBinding({ ...receiverCtx, name: node.name, read: node });
    // A conditional whose arms are both instances keeps the selection as one receiver.
    // Different families retain generic instance dispatch.
    if (parameterInstance && node.type === 'ConditionalExpression' && !ctx?.decidedReceiver) {
      const consequentContext = rootContext(peelNestedSequenceExpressions(node.consequent).tail);
      const alternateContext = rootContext(peelNestedSequenceExpressions(node.alternate).tail);
      if (consequentContext?.kind === 'instance' && alternateContext?.kind === 'instance') ctx = {
        kind: 'instance',
        name: consequentContext.name === alternateContext.name ? consequentContext.name : null,
        selectedReceiver: true,
        pairedInstanceReceiver: true,
      };
    }
    // An AND can yield its falsy left instance. Mirror the selected value after the
    // selection, since making that operand an object would run the wrong branch.
    if (parameterInstance && node.type === 'LogicalExpression' && !ctx?.decidedReceiver) {
      const left = peelNestedSequenceExpressions(node.left).tail;
      const leftContext = rootContext(left);
      const rightContext = rootContext(peelNestedSequenceExpressions(node.right).tail);
      const value = literalNodeValue(unwrapRuntimeExpr(left));
      const takesLeft = value !== undefined && (node.operator === '&&' ? !value
        : node.operator === '||' ? !!value : value !== null);
      if (leftContext?.kind === 'instance' && takesLeft) ctx = { ...leftContext, selectedReceiver: true };
      else if (!ctx && leftContext?.kind === 'instance' && rightContext?.kind === 'instance') ctx = {
        kind: 'instance', name: leftContext.name === rightContext.name ? leftContext.name : null, selectedReceiver: true,
      };
    }
    if (!ctx && parameterInstance) {
      const surface = isMemberAccessNode(node) && staticMemberKeyName(node) === 'prototype'
        && isBuiltInSurfaceNav(node, { ctx: receiverCtx })
        ? resolveObjectName({ objectNode: node.object, ...receiverCtx }) : null;
      const name = surface ?? (node.type === 'ArrayExpression' ? 'Array' : adapter.isStringLiteral?.(node) ? 'String' : null);
      if (name) ctx = { kind: 'instance', name };
    }
    if (parameterInstance && (!ctx || ctx.kind === 'ctor' && !ctx.builtin || ctx.kind === 'static' && bindingInstance)) {
      const suppliedBinding = bindingInstance || ctx?.kind === 'ctor' && node.type === 'Identifier'
        && adapter.hasBinding({ ...receiverCtx, name: node.name, read: node });
      const source = followConstIdentifierInit({ node, readNode: node, ctx: receiverContext(node) });
      const value = unwrapRuntimeExpr(decidedRunningOperand(source.node, source.ctx));
      const globalPrimitive = value?.type === 'Identifier' && !adapter.hasBinding({ ...source.ctx, name: value.name, read: value })
        && PRIMITIVE_WRAPPERS[knownBuiltInReturnTypes.globalProperties[value.name]?.type];
      const constructorPath = value?.type === 'NewExpression' ? pathOfNode(receiverPath, value.callee) : null;
      const constructorName = constructorPath && resolveObjectName({
        objectNode: value.callee, ...source.ctx, path: constructorPath, usageNode: value.callee,
      });
      const constructedFamily = constructorName
        && !isMutatedGlobalSlot(adapter, constructorName, { node: value.callee, path: constructorPath })
        && knownBuiltInReturnTypes.constructors[constructorName]?.new?.type;
      const name = value?.type === 'ArrayExpression' ? 'Array'
        : PRIMITIVE_WRAPPERS[typeof literalNodeValue(value)] || globalPrimitive || constructedFamily || null;
      // Closed caller bindings use the default's receiver admission too. Unbound names
      // and call results retain their existing boundary.
      const suppliedInstance = !isNullLiteralNode(value) && (!invocationNode(value) || value.type === 'NewExpression')
        && (suppliedBinding || globalPrimitive || instanceSynthSpellsReceiver(value)
          || isConstantLiteralNode(value, bindingName => !!pureImportSourceEntry(
            adapter.getBinding({ ...source.ctx, name: bindingName })?.importSource,
          ))
          || isMemberAccessNode(value)
          || !!instanceSynthReceiverPure(value, { ...source.ctx, resolvePure }))
        && paramDefaultInstanceSynthAllowed({
          objectPatternNode: leafPatternPath.node, receiverNode: node,
          ...receiverCtx, path: claimPath || receiverPath, resolvePure,
        });
      if (suppliedInstance) ctx = { kind: 'instance', name: name ?? null, sourceInstance: true };
    }
    if (instanceIife && (!ctx || ctx.kind === 'static')
      && (!isBareUndefinedIdentifier(node) || adapter.hasBinding({ ...receiverCtx, name: node.name, read: node }))
      && (mirrored.patterns.get(node) ?? mirrored.patternNode ?? walked.pattern) === leafPatternPath.node
      && paramDefaultInstanceSynthAllowed({
        objectPatternNode: leafPatternPath.node, receiverNode: node,
        ...receiverCtx, path: claimPath,
        resolvePure,
      })) ctx = { kind: 'instance', name: null, legacyIife: true };
    if (ctx?.kind === 'ctor') {
      ctx.receiverNode = node;
      ctx.walkPath = [];
    }
    rootContextByNode.set(node, ctx);
    return ctx;
  }

  function resolveRootContext(node) {
    return mirrorRootContext({
      node,
      ...receiverContext(node),
      callSite,
      resolvePure,
      rescuesReceiverRead: host?.node.type === 'VariableDeclarator' || host?.node.type === 'AssignmentExpression',
    });
  }

  // an ARRAY level over a static container (`[{ from }]` off `const w = [Array]`, off a call
  // yielding `[Array]`): the literal that stands in spells one slot per pattern element - a nested
  // object pattern mirrors off the element the container holds at that index (the walk descends
  // an array literal by index), a bound name passes the element through by its index, a hole
  // stays a hole. a default or a rest keeps the level to the routes that carry those
  function mirrorArrayPattern(patternNode, ctx) {
    // the level the pattern iterates has to BE an array literal: the walk spells an index as a key
    // an object level answers too, and a mirror rendered off that level would iterate where the
    // source throws
    if (!walksToArrayLevel({
      receiverNode: ctx.receiverNode, walkPath: ctx.walkPath, scope: receiverPath.scope, adapter, path: receiverPath,
    })) return null;
    const elements = [];
    for (const [index, element] of patternNode.elements.entries()) {
      if (!element) {
        elements.push(null);
        continue;
      }
      if (element.type === 'AssignmentPattern' || element.type === 'RestElement') return null;
      const walkPath = [...ctx.walkPath, String(index)];
      if (element.type === 'Identifier') {
        elements.push({ kind: 'passthrough' });
        continue;
      }
      const resolved = walkStaticReceiverChain({
        receiverNode: ctx.receiverNode, walkPath, scope: receiverPath.scope, adapter, path: receiverPath,
      });
      const childCtx = resolved
        ? isPristineProxyGlobal(adapter, resolved) ? { kind: 'proxy' }
          : { kind: 'ctor', name: resolved, receiverNode: ctx.receiverNode, walkPath }
        : { kind: 'static', receiverNode: ctx.receiverNode, walkPath };
      const child = mirrorPattern(element, childCtx);
      if (!child) return null;
      elements.push(child);
    }
    return { kind: 'array', elements };
  }

  // Proven instance slots dispatch by their receiver family. A quiet sole read may
  // use a data slot; intervening argument or parameter work keeps it lazy.
  function mirrorInstanceEntry(prop, key, name, deferred = true) {
    const instanceMeta = { kind: 'property', object: name, key, placement: 'prototype' };
    const pure = !(name && adapter.isMutatedStatic?.(`${ name }.prototype`, key))
      && (name ? resolvePure(instanceMeta, null) : resolvePure(instanceMeta));
    return pure?.kind === 'instance' && propBindingIdentifier(prop.value)
      ? { key, deferred, child: { kind: 'instance', entry: pure.entry, hintName: pure.hintName, prop } }
      : { key, deferred, child: { kind: 'passthrough', prop } };
  }

  // eslint-disable-next-line max-statements -- one ordered property walk shared by all mirror receiver kinds
  function mirrorPattern(patternNode, ctx) {
    // Literal-container mirrors remain available to instance/caller capture only.
    // Static/global literal slots stay native. Class and call roots keep their common fallback.
    if (ctx?.kind === 'static' && !instanceClaim
      && boundStaticContainer({ node: ctx.receiverNode, ...receiverCtx, calls: false })) return null;
    if (patternNode?.type !== 'ObjectPattern' || !ctx || ctx.kind === 'instance'
      && !patternComputedKeysSynthSafe({ objectPatternNode: patternNode, ...keyCtx, distinctReads: true })) {
      return patternNode?.type === 'ArrayPattern' && ctx?.kind === 'static'
      ? mirrorArrayPattern(patternNode, ctx) : null;
    }
    // A constructor index carries every property that object rest can read. Keep the
    // pattern intact, including defaults and key effects, instead of mirroring its leaves.
    const restIndex = ctx.kind === 'ctor'
      ? constructorRestIndex({ name: ctx.name, patternNode, resolveGlobalPolyfill, isDisabledProp }) : null;
    if (restIndex) return { ...restIndex, kind: 'polyfill', readProperties: patternNode.properties.filter(isPropertyNode) };
    const entries = [];
    const seenKeys = new Map();
    let defaultSeen = false;
    let effectfulKeySeen = false;
    for (const prop of patternNode.properties) {
      // A computed-key effect runs before this slot's read. A default runs after its own
      // read. Both keep every following read at the pattern site.
      const earlierDefault = defaultSeen;
      const effectfulKey = isPropertyNode(prop) && prop.computed && computedKeyHasSideEffects(prop, keyCtx);
      const eagerInstance = ctx.eagerInstance && !earlierDefault && !effectfulKeySeen && !effectfulKey;
      defaultSeen ||= patternHasAnyDefault(prop.value);
      effectfulKeySeen ||= effectfulKey;
      const eagerNestedInstance = eagerInstance && prop.value?.type !== 'AssignmentPattern';
      const disabled = isDisabledProp?.(prop);
      if (disabled && (targetLeaves.length < 2 || ctx.kind !== 'ctor')) return null;
      const key = mirrorAcceptedKey({ prop, ...keyCtx, seenKeys, instance: ctx.kind === 'instance' });
      if (key === null) {
        if (disabled) return null;
        // A well-known symbol has no string slot, but its stable imported key can carry the
        // receiver's own value beside the mirrored statics. Unknown or effectful keys still bail.
        const symbolName = prop.computed && !computedKeyHasSideEffects(prop, keyCtx)
          ? computedKeyWellKnownSymbolName({ keyNode: prop.key, ...keyCtx }) : null;
        const symbolKey = symbolName && resolvePure({ kind: 'property', object: 'Symbol', key: symbolName, placement: 'static' });
        if (!symbolKey || symbolKey.kind !== 'static') return null;
        if (entries.every(entry => entry.symbolKey?.entry !== symbolKey.entry)) {
          entries.push({ symbolKey, prop, ...ctx.kind === 'instance' ? { deferred: !eagerInstance } : {},
            readPure: symbolName === 'iterator' ? SYMBOL_ITERATOR_PURE_RESULT : null,
            child: { kind: 'passthrough' } });
        }
        continue;
      }
      // one property per SLOT: a key the pattern reads twice is already spelled, and a second
      // property for it would be the duplicate an ES5-strict parser refuses
      if (entries.some(entry => entry.key === key)) continue;
      // A disabled sibling retains its native read and every claim below it. It can
      // ride a mirror earned by another slot, but never earns or claims that mirror.
      if (disabled) {
        entries.push({ key, child: { kind: 'passthrough', bailed: true } });
        continue;
      }
      const inner = patternSlotTarget(prop.value);
      if (ctx.kind === 'instance') {
        const entry = mirrorInstanceEntry(prop, key, ctx.name, !eagerInstance);
        // A matching method dispatcher supplies a defined value on the pristine prototype.
        // Its leaf default cannot run in this mirror arm; supplied receivers keep that default.
        if (ctx.pristinePrototype && prop.value?.type === 'AssignmentPattern' && entry.child.kind === 'instance'
          && implementsPrototypeMethod(ctx.name, key, 'dispatched')
          && Object.hasOwn(knownBuiltInReturnTypes.instanceMethods[ctx.name] ?? {}, key)) {
          defaultSeen = earlierDefault;
        }
        entries.push(entry);
        continue;
      }
      if (ctx.kind === 'proxy') {
        // a non-pattern value (`{ Array }` shorthand / `{ Array: x }` rename) or a child that cannot be
        // mirrored (a wholly non-polyfillable subtree) is PASSED THROUGH - the synth literal reads that
        // key's live value off the receiver, so a polyfillable SIBLING still mirrors. an all-or-nothing
        // bail stranded the polyfill: the receiver fell back to raw `_globalThis` and the native read of
        // the polyfill-needing key threw / mis-valued on ie:11
        if (inner?.type === 'ObjectPattern') {
          // the key is read where the pattern stands, ahead of a write of its slot or not
          const child = mirrorPattern(inner, isPristineProxyGlobal(adapter, key, { node: prop, path: leafPatternPath })
            ? { ...ctx, eagerInstance: eagerNestedInstance }
            : { kind: 'ctor', name: key, eagerInstance: eagerNestedInstance });
          // Keep native subtree reads in the pattern, after preceding binding writes.
          // A valid claim-free subtree does not veto its sibling's constructor mirror.
          const metrics = child && treeInjectionMetrics(child);
          const spelled = metrics && (metrics.hasPolyfill || metrics.hasDescendedClaim);
          const bailed = !child || metrics.hasBailedSubtree;
          // a default on a level the literal fills stands over a defined slot (`levelDefault`): one it spells, or one
          // it hands through as the constructor's ponyfill
          const filled = spelled || !bailed && !!resolvePure({ kind: 'global', name: key });
          entries.push({ key, child: spelled ? child : { kind: 'passthrough', bailed, readProperties: metrics?.nativeReadProperties },
            ...filled && prop.value.type === 'AssignmentPattern' ? { levelDefault: prop.value } : {} });
        } else {
          // a shorthand / renamed ctor key (`{ Set }`, `{ Set: S }`) renders as a passthrough, but a
          // MISSING-ABLE ctor passthrough INJECTS the pure constructor (`Set` -> `_Set`) - mark it so the
          // mirror owns the flat ctor rather than bailing to raw `_globalThis` and stranding it native.
          // that injected ctor is what the slot's binding hands out, so it carries the slot's own escape
          // verdict - which decides WHICH name the render resolves (the leaf's own, not the path's
          // root), never how wide the entry is: that width is one file-wide answer per ctor name
          const injects = !!resolvePure({ kind: 'global', name: key });
          entries.push({
            key,
            child: {
              kind: 'passthrough',
              prop,
              injects,
              escapedCtor: isEscapedCtorNode(rootProgramOf(leafPatternPath), prop),
            },
            ...injects && prop.value.type === 'AssignmentPattern' ? { levelDefault: prop.value } : {},
          });
        }
      } else if (ctx.kind === 'static') {
        // resolve this key through the static-object literal (`w.a` -> Array) via the shared static
        // receiver walk: a proxy-global hop descends as proxy, a leaf constructor descends its statics,
        // a deeper object hop keeps walking, anything unresolvable passes through to the native read
        const resolved = walkStaticReceiverChain({
          receiverNode: ctx.receiverNode, walkPath: [...ctx.walkPath, key], scope: receiverPath.scope, adapter, path: receiverPath,
        });
        const childCtx = resolved
          ? isPristineProxyGlobal(adapter, resolved) ? { kind: 'proxy', eagerInstance: eagerNestedInstance }
            : { kind: 'ctor', name: resolved, receiverNode: ctx.receiverNode,
              walkPath: [...ctx.walkPath, key], eagerInstance: eagerNestedInstance }
          : { kind: 'static', receiverNode: ctx.receiverNode,
            walkPath: [...ctx.walkPath, key], eagerInstance: eagerNestedInstance };
        // ... and an array pattern under the key descends the same way (`{ k: [{ from }] }` off
        // `const w = { k: [Array] }`, off a call yielding it): the static arm of `mirrorPattern`
        // spells its slots, the constructor arm has no array to spell and passes through
        const child = inner?.type === 'ObjectPattern' || inner?.type === 'ArrayPattern' ? mirrorPattern(inner, childCtx) : null;
        entries.push({ key, child: child ?? { kind: 'passthrough' } });
      } else {
        if (parameterInstance && key === 'prototype' && inner?.type === 'ObjectPattern'
          && isKnownGlobalName(ctx.name) && !isMutatedGlobalSlot(adapter, ctx.name)) {
          entries.push({ key, child: mirrorPattern(inner, {
            kind: 'instance', name: ctx.name, eagerInstance: eagerNestedInstance, pristinePrototype: true,
          }) ?? { kind: 'passthrough' } });
          continue;
        }
        let readMeta = {
          kind: 'property', object: ctx.name, key, placement: 'static', receiverHint: meta.receiverHint,
        };
        // Mirror planning revisits leaves independently of their original visit. Carry the
        // selected receiver so an imported index keeps the same method in this route too.
        if (ctx.receiverNode) readMeta = importedStaticReadMeta({
          node: ctx.receiverNode, walkPath: ctx.walkPath, meta: readMeta,
          scope: receiverPath.scope, adapter, path: receiverPath,
        });
        const pure = readMeta && resolvePure(readMeta);
        // a non-polyfillable static (`Math.floor`, an always-present ES method) or an instance-method
        // match (not a static) passes through to the receiver's real value rather than bailing the mirror
        // On an assignment host a MEMBER target consumes like a binding - the literal carries the
        // ponyfill and the pattern writes it into the author's own slot, whatever its root. a
        // binding destructures the pure value, and so does a PATTERN with no default and no rest -
        // its leaves read the ponyfill's own members, and a computed key runs once inside the
        // pattern, where the source wrote it (the plan's pattern-valued static)
        const consumable = host?.node.type !== 'AssignmentExpression' || !!propBindingIdentifier(prop.value)
          || isMirrorablePatternValue(prop.value)
          || !!memberTargetTakesExtraction(prop.value, { hostPattern: host.node.left, prop });
        // A nested claim renders its resolved instance dispatch through the slot's live value
        // (`keys: { name: _nameMaybeFunction(_Object$keys) }`). The consumed pattern cannot
        // rediscover that receiver after relocation, so rendering must keep the source answer.
        // ... and a slot this constructor polyfills NO static for - a plain hop the mirror hands
        // through whole (`Array: { prototype: { at } }`) - descends on the very same terms: the hop's
        // own live value is what each key reads through, so the claim the pattern carries is reached
        // where the flat passthrough left it native on BOTH legs, agreed and unpolyfilled
        // A static ponyfill is defined, so its pattern's default does not hide the
        // live member claims under that pattern.
        const slotPattern = pure?.kind === 'static' ? inner : prop.value;
        const slotLeaves = (!pure || pure.kind !== 'instance') && planStaticPatternInstances(
          slotPattern,
          { resolvePure, assignment: host?.node.type === 'AssignmentExpression', defaults: true,
            receiverObject: !pure && key === 'prototype' ? ctx.name : undefined },
        );
        entries.push(slotLeaves
          ? { key, child: {
            kind: 'descended-pattern',
            prop,
            hop: !pure,
            entries: slotLeaves.map(({ key: name, pure: dispatch }) => ({
              key: name, child: dispatch ? { ...dispatch, kind: 'instance' } : { kind: 'passthrough' },
            })),
          } }
          : !consumable ? { key, child: { kind: 'passthrough', bailed: true } } : !pure || pure.kind === 'instance'
            ? { key, child: {
              kind: 'passthrough',
              prop: isKnownGlobalName(ctx.name) && !isMutatedGlobalSlot(adapter, ctx.name) ? prop : null,
            } }
            // ... and a polyfillable STATIC takes its ponyfill whatever the slot's target is. What a
            // MIRROR puts in the slot is a VALUE, not a rewrite of the read, so the target writes it
            // exactly as a binding target would (`box[(eff(), 'value')] = _Object$keys`) - and reading
            // it raw off the receiver instead was a lost polyfill, silent because the sibling slot in
            // the same literal carried its own (`Array: { from: _Array$from }` beside
            // `Object: { keys: _globalThis.Object.keys }`)
            : { key, child: {
              kind: 'polyfill',
              entry: pure.entry,
              hintName: pure.hintName,
              static: pure.kind === 'static',
              prop: consumable ? prop : null,
            } },
        );
      }
    }
    if (!retainNativeReads) {
      const native = entries.filter(({ child, deferred }) => child.kind === 'passthrough' && !child.injects && !deferred);
      if (native.length) {
        const nativeKeys = new Set(native.map(entry => entry.key));
        const nativeSymbols = new Set(native.filter(entry => entry.symbolKey).map(entry => entry.prop));
        if (passthroughOutrunsEffect({
          patternNode,
          isPassthrough: (prop, key) => key !== null ? nativeKeys.has(key) : nativeSymbols.has(prop),
          ctx: keyCtx,
        })) return null;
      }
    }
    return entries.length ? { kind: 'object', entries } : null;
  }

  // Moving a method read also crosses implicit conversions, which the general effect walk
  // does not classify. Reuse the literal-tree proof without treating a stable object as primitive.
  function quietWindowValue(node, ctx = receiverCtx) {
    const value = unwrapRuntimeExpr(node);
    return !mayHaveSideEffects(value, ctx) && (isReusableReceiver(value, { ctx })
      || isReReadableSurfaceNav(value, null, { ctx })
      || isConstantLiteralNode(value, (_name, read) => isReusableReceiver(read, { ctx }), part => {
        const core = unwrapRuntimeExpr(part);
        return core?.type === 'UnaryExpression' && typeof literalNodeValue(unwrapRuntimeExpr(core.argument)) !== 'number'
          ? null : core;
      }));
  }

  // A prior array slot whose complete plain pattern has ALREADY been served by a data
  // mirror performs its reads in the argument. Do not predict a future mirror here: a later
  // receiver prefix may keep that prior read deferred too.
  function earlierSlotAlreadyServedByData(item, receiver) {
    const priorPattern = patternSlotTarget(item?.value ?? item);
    if (priorPattern?.type !== 'ObjectPattern' || !receiver
      || patternHasAnyDefault(priorPattern) || patternKeepsEffectfulKey(priorPattern, keyCtx)
      || priorPattern.properties.some(prop => !propBindingIdentifier(prop.value))
      || receiver.type !== 'ObjectExpression') return false;
    return priorPattern.properties.every(prop => {
      const key = plainSynthKeyName(prop.key);
      const paired = key === null ? null : objectLevelPairedProperty(receiver, key);
      return paired && paired.match.kind !== 'get' && paired.match.kind !== 'set' && !paired.match.method;
    });
  }

  function instanceArgumentWindow(argument, hop, sourceArgument = argument) {
    // This shared window is deliberately flat: every reading slot has only plain bindings and
    // every inert slot reads nothing. The original source argument owns the quiet suffix even
    // when an inline spread needs a fresh flattened view. The current view still supplies the
    // materialized data prefix, and pattern identity prevents another caller shape from replaying it.
    if (argument?.type !== 'ArrayExpression' || hop?.level?.type !== 'ArrayPattern') return null;
    let state = instanceArgumentWindows.get(adapter, sourceArgument);
    if (state?.pattern === hop.level) return state.eligible ? state : null;
    if (hop.level.elements.some(item => {
      if (!slotReadsWhenBound(item?.value ?? item)) return false;
      const pattern = patternSlotTarget(item?.value ?? item);
      return pattern?.type !== 'ObjectPattern' || patternHasAnyDefault(pattern)
        || patternKeepsEffectfulKey(pattern, keyCtx)
        || pattern.properties.some(prop => !propBindingIdentifier(prop.value));
    })) {
      instanceArgumentWindows.set(adapter, sourceArgument, { pattern: hop.level, eligible: false });
      return null;
    }
    const quietSuffix = Array(argument.elements.length + 1).fill(false);
    quietSuffix[argument.elements.length] = true;
    for (let index = argument.elements.length - 1; index >= 0; index--) {
      const item = argument.elements[index];
      quietSuffix[index] = quietSuffix[index + 1] && (!item || quietWindowValue(item));
    }
    state = { pattern: hop.level, eligible: true, dataPrefix: 0, quietSuffix };
    instanceArgumentWindows.set(adapter, sourceArgument, state);
    return state;
  }

  function precedingArrayReadsAlreadyServed(argument, hop, prefix, sourceArgument = argument) {
    const state = instanceArgumentWindow(argument, hop, sourceArgument);
    if (!state) return hop.level.elements.slice(0, prefix)
      .every(item => !slotReadsWhenBound(item?.value ?? item));
    // A completed data ObjectExpression is the renderer's final representation for this slot.
    // Advancing over that immutable output records what already happened; a raw slot is retried.
    while (state.dataPrefix < prefix) {
      const index = state.dataPrefix;
      const item = hop.level.elements[index];
      if (slotReadsWhenBound(item?.value ?? item)
        && !earlierSlotAlreadyServedByData(item, pairedArrayWrapInitElement(argument.elements, index))) return false;
      state.dataPrefix++;
    }
    return true;
  }

  function patternWorkPrecedesInstanceRead(argument = null, sourceArgument = argument) {
    if (walked.hops?.length === 1 && argument?.type === 'ArrayExpression') {
      const [hop] = walked.hops;
      if (hop.index !== undefined) return !precedingArrayReadsAlreadyServed(argument, hop, hop.index, sourceArgument);
    }
    return walked.hops?.some(hop => {
      const slots = hop.index === undefined ? hop.level.properties : hop.level.elements;
      const prefix = hop.index ?? slots.findIndex(prop => patternSlotTarget(prop.value) === hop.pattern);
      return prefix === -1 || slots.slice(0, prefix).some(item => slotReadsWhenBound(item?.value ?? item));
    });
  }

  function argumentPerformsReceiverInOrder(argument, leaf, sourceArgument = argument) {
    if (walked.hops?.length === 1 && argument?.type === 'ArrayExpression') {
      const [hop] = walked.hops;
      const window = hop.index === undefined ? null : instanceArgumentWindow(argument, hop, sourceArgument);
      if (!window) return receiverPerformsEveryInitEffect(argument, leaf, receiverCtx, quietWindowValue);
      const receiver = pairedArrayWrapInitElement(argument.elements, hop.index);
      return !!receiver && receiverPerformsEveryInitEffect(receiver, leaf, receiverCtx, quietWindowValue)
        && window.quietSuffix[hop.index + 1];
    }
    return receiverPerformsEveryInitEffect(argument, leaf, receiverCtx, quietWindowValue);
  }

  // An instance read may run in the argument when no other source work intervenes.
  // The receiver itself may run code: its dispatch consumes that expression once.
  // Literal wrappers use the existing pristine iterator pairing; visible mutations keep its boundary.
  function instanceReadsCanBeEager(leaf, patternNode) {
    const fn = paramPath?.parentPath?.node;
    if (!FUNCTION_LIKE_NODE_TYPES.has(fn?.type) || !patternNode?.properties?.length) return false;
    if (host?.node.type === 'AssignmentPattern' && patternNode === paramPath.node.left) {
      const index = fn.params.indexOf(paramPath.node);
      const earlier = fn.params.slice(0, index);
      if (index === -1 || mayHaveSideEffects(paramPath.node.right, keyCtx)
        || paramListRunsWork(earlier, keyCtx)
        || earlier.some(param => param.type === 'AssignmentPattern' && !quietWindowValue(param.right, keyCtx))) return false;
    }
    if (patternNode.properties.length !== 1 && host?.node.type === 'AssignmentPattern'
      && patternNode === paramPath.node.left && !walked.hops?.length) {
      if (patternHasAnyDefault(patternNode)
        || patternNode.properties.some(prop => !propBindingIdentifier(prop.value))
        || !quietWindowValue(leaf)
        || !quietWindowValue(paramPath.node.right)) return false;
      const index = fn.params.indexOf(paramPath.node);
      const earlier = fn.params.slice(0, index);
      return index !== -1 && !paramListRunsWork(earlier, keyCtx)
        && earlier.every(param => param.type !== 'AssignmentPattern' || quietWindowValue(param.right, keyCtx));
    }
    if (patternNode.properties.length !== 1 && callSite
      && (callSite.node.type === 'LogicalExpression' || callSite.node.type === 'ConditionalExpression')) return false;
    const value = peelNestedSequenceExpressions(leaf).tail;
    const quietSource = !reEvaluationObservable(value) || isReReadableSurfaceNav(value, null, { ctx: receiverCtx })
      || (patternBindingCount(patternNode) === 1 && receiverValueNeverNullish(value, receiverCtx));
    if (!quietSource && patternBindingCount(patternNode) !== 1
      && (callSite?.node.type === 'LogicalExpression' || callSite?.node.type === 'ConditionalExpression'
        || soleReceiver?.type === 'LogicalExpression' || soleReceiver?.type === 'ConditionalExpression'
        || valueSelectingLeaves.has(leaf) || truthySelectingLeaves.has(leaf)
        || rootContext(leaf)?.selectedReceiver)) return false;
    if (defaultLeaves.has(leaf) || host?.node.type === 'AssignmentPattern' || !callSite) {
      const defaultSource = paramPath.node.type === 'AssignmentPattern' ? paramPath.node.right : null;
      return quietSource || patternBindingCount(patternNode) === 1 && !!defaultSource
        && receiverPerformsEveryInitEffect(defaultSource, leaf, receiverCtx, quietWindowValue)
        && !patternWorkPrecedesInstanceRead();
    }
    const call = callSite.host.node;
    if (fn.async || !isCallShape(call)) return false;
    const index = fn.params.indexOf(paramPath.node);
    const earlier = fn.params.slice(0, index);
    if (index === -1 || paramListRunsWork(earlier, keyCtx)
      || earlier.some(param => param.type === 'AssignmentPattern' && !quietWindowValue(param.right, keyCtx))) return false;
    const args = [...call.arguments];
    if (adapter.isMutatedStatic?.('Array.prototype', 'Symbol.iterator')
      && (walked.indices.length || args.some(arg => arg.type === 'SpreadElement'))) return false;
    flattenInlineArraySpreads(args);
    const at = args.findIndex(arg => arg && subtreeContainsNode(arg, planHost.node));
    // The selected argument arm keeps its prefix ahead of the mirror, like a direct sequence.
    const argument = at === -1 ? null : peelNestedSequenceExpressions(args[at]).tail;
    const runningArgument = argument === leaf ? argument
      : argument && peelNestedSequenceExpressions(decidedRunningOperand(argument, receiverCtx)).tail;
    const inlineSpread = runningArgument?.type === 'ArrayExpression'
      && runningArgument.elements.some(element => element?.type === 'SpreadElement');
    const effectArgument = inlineSpread
      ? { ...runningArgument, elements: [...runningArgument.elements] }
      : runningArgument;
    if (inlineSpread) flattenInlineArraySpreads(effectArgument.elements);
    if (!effectArgument || !argumentPerformsReceiverInOrder(effectArgument, leaf, runningArgument)
      || args.slice(at + 1).some(arg => !quietWindowValue(arg))) return false;
    return !patternWorkPrecedesInstanceRead(effectArgument, runningArgument);
  }

  // the census's leaves under each dead right, kept: an outer selection's left holds the inner ones
  // whole, so a long decided chain is walked once rather than again for every level above a leaf
  const targetLeafSet = new Set(targetLeaves);
  const deadRightSet = new Set(deadRights);
  const deadRightSubtreeLeaves = new Map();
  const deadRightLeftLeaves = new Map();
  function collectTargetLeaves(node, into) {
    if (deadRightSet.has(node)) {
      for (const leaf of subtreeTargetLeaves(node)) into.add(leaf);
      return;
    }
    if (targetLeafSet.has(node)) into.add(node);
    walkAstChildren(node, child => collectTargetLeaves(child, into));
  }
  function subtreeTargetLeaves(selection) {
    let leaves = deadRightSubtreeLeaves.get(selection);
    if (!leaves) {
      leaves = new Set(targetLeafSet.has(selection) ? [selection] : []);
      walkAstChildren(selection, child => collectTargetLeaves(child, leaves));
      deadRightSubtreeLeaves.set(selection, leaves);
    }
    return leaves;
  }
  function leftTargetLeaves(selection) {
    let leaves = deadRightLeftLeaves.get(selection);
    if (!leaves) {
      leaves = new Set();
      collectTargetLeaves(selection.left, leaves);
      deadRightLeftLeaves.set(selection, leaves);
    }
    return leaves;
  }

  // Build a mirror target for each resolvable receiver leaf; unsupported leaves stay native.
  // Eligible declaration, assignment and loop-element hosts preserve receiver effects and
  // coercion before the mirror. Selection/default leaves keep their own stricter gates.
  // Retained source nodes stay live for later rewrites; each target carries its claim bookkeeping.
  function buildMirrorTargets() {
    const patternNode = mirrored.patternNode ?? walked.pattern;
    const out = [];
    for (const leaf of targetLeaves) {
      if (!leaf) continue;
      const selectedReceiver = !!rootContext(leaf)?.selectedReceiver;
      // A caller mirror replaces only a quiet, non-optional value leaf. Selection tests
      // and sequence prefixes remain outside that leaf, in their original argument slot.
      // ... a CALL argument whose returned literal the call canon proves is the one effectful leaf
      // it takes: the call keeps its turn ahead of the literal, in the argument slot where the
      // source evaluates it, and the destructure's own throw with it - the declarator's shape
      const callArgument = !!callSite && (rootContext(leaf)?.sourceInstance || isCallShape(leaf)
        && (rootContext(leaf)?.kind === 'static' || rootContext(leaf)?.legacyIife));
      if (callSite && !callArgument && !selectedReceiver && !defaultLeaves.has(leaf) && (mayHaveSideEffects(leaf, receiverCtx)
        || navValueCanShortCircuit(leaf, resolvePure, { scope: receiverPath.scope, adapter, path: receiverPath })
        || chainSealsAShortCircuit(leaf, resolvePure, { scope: receiverPath.scope, adapter, path: receiverPath }))) continue;
      // a for-x head has NO statement slot: the declaration twin leaves an effectful receiver standing
      // where the source wrote it and binds the leaf beside it, while the head's only route is this
      // mirror, which REPLACES the element - so the effect left with the value and the head went native.
      // the element keeps its position as the sequence PREFIX of the literal that replaces it: it runs as
      // often and as early as the source runs it, keeps its throw, and loses only the VALUE the mirror
      // was replacing anyway. a DEFAULT's leaf is not this - it stands in the pattern, not in the head
      // ... and the caller-correct FALLBACK SLOT keeps a CALL it holds ahead of the literal the same
      // way: the default runs exactly when the source runs it (the argument left undefined), and a
      // call is the one receiver no other route of that slot can spell. an effectful nav there stays
      // with the collapse that keeps its effect and drops the read (`(hit(), _Promise)`)
      const fallbackCall = isCallShape(leaf) && host?.node.type === 'AssignmentPattern'
        && inCallerCorrectFallbackSlot(receiverPath, leaf);
      const defaultCall = defaultLeaves.has(leaf) && !!invocationNode(leaf);
      const canKeepPrefix = ((!!headElements || host?.node.type === 'VariableDeclarator' || host?.node.type === 'AssignmentExpression'
        || fallbackCall || callArgument) && !defaultLeaves.has(leaf) || defaultCall || selectedReceiver) && !valueSelectingLeaves.has(leaf);
      const leafContext = rootContext(leaf);
      const selectedReceiverNode = leafContext?.decidedReceiver ? decidedRunningOperand(leaf, receiverCtx) : leaf;
      const liveReceiver = leafContext?.decidedReceiver
        ? followConstIdentifierInit({
          node: selectedReceiverNode, readNode: selectedReceiverNode, ctx: receiverContext(selectedReceiverNode),
        })
        : { node: leaf, ctx: receiverCtx };
      // An admitted IIFE receiver can still be nullish. Return that value unchanged so
      // the native parameter rejects it after all arguments and before any computed key.
      // A source-known selection has already proved which operand supplies the value. Ask nullishness
      // of that operand, so a quiet non-nullish sole read can stay eager instead of gaining a getter.
      const preserveNullishReceiver = (leafContext?.legacyIife || leafContext?.sourceInstance || selectedReceiver)
        && !receiverValueNeverNullish(unwrapRuntimeExpr(liveReceiver.node), liveReceiver.ctx);
      const preserveFalsyReceiver = leafContext?.kind === 'instance' && truthySelectingLeaves.has(leaf);
      // Evaluating a short-circuiting source as a prefix preserves its effects, but the
      // replacement literal would erase the pattern's own nullish-receiver rejection.
      // ... which the fallback slot does not reproduce (its doctrine below): the literal is always defined
      const coerceReceiver = canKeepPrefix && !fallbackCall && !preserveNullishReceiver && !preserveFalsyReceiver
        && destructureReceiverOwesAThrow(leaf,
          { scope: receiverPath.scope, adapter, path: receiverPath });
      // a getter read counts as the leaf's work (the scoped predicate): the literal replacing the leaf keeps it
      // as a prefix where it can, and the leaf stays where it cannot, like any other effect
      const keepPrefix = coerceReceiver || mayHaveSideEffects(leaf, receiverCtx) && canKeepPrefix;
      if (mayHaveSideEffects(leaf, receiverCtx) && !keepPrefix) continue;
      // a leaf that can be NULLISH must not become an always-defined literal, and the reason holds
      // wherever it stands: under `||` / `??` the swap would flip which branch runs (`globalThis
      // .window ?? {}` - native takes the fallback exactly off-env), and on a TEST-selected arm it
      // erases the TypeError that arm performs and hands our binding to a host that has the probe
      // and reads its own realm through it. the leaf stays raw, native semantics preserved
      // ... except a realm PROBE, which is the one selecting leaf whose swap flips nothing the source
      // can observe once the branch it decides is re-spelled: it yields the realm or nothing, so the
      // mirror takes the whole selection and hands the emitters a NULL TEST on the probe's own read
      // (`probe == null ? fallback : literal`). left raw, that arm reads the realm natively - and it is
      // the arm every host that HAS `window` takes, so the polyfill attached nowhere it matters
      const realmProbeLeaf = valueSelectingLeaves.has(leaf)
        && realmSelectionLeafKind(leaf, { adapter, scope: receiverPath.scope, path: receiverPath }) === 'probe';
      const probeArm = realmProbeLeaf && soleReceiver?.type === 'LogicalExpression'
        && soleReceiver.operator !== '&&' && peelNestedSequenceExpressions(soleReceiver.left).tail === leaf
        ? soleReceiver : null;
      // ... and a TEST-selected arm takes that same answer with the probe on BOTH halves of the test:
      // absent, the arm yields the probe itself and the read through it throws where native throws;
      // present, it yields the literal. the test decides the arm, so nothing here re-decides it - and
      // the host that HAS the probe is the only one that runs this arm, which is where the polyfill
      // was being lost (`flagged ? globalThis.window : globalThis` bound the realm's own `Array.of`)
      const ternaryProbeArm = !probeArm && realmProbeLeaf && soleReceiver?.type === 'ConditionalExpression'
        && (peelNestedSequenceExpressions(soleReceiver.consequent).tail === leaf
          || peelNestedSequenceExpressions(soleReceiver.alternate).tail === leaf);
      // ... except in the caller-correct FALLBACK SLOT, whose doctrine is the provider's own: that
      // slot fires only on the omitted argument, so it keeps the always-defined literal rather than
      // reproducing the absent-host throw. the arms of a TERNARY reach this gate now, which is what
      // makes the exception load-bearing instead of accidental
      if (!probeArm && !ternaryProbeArm && valueSelectingLeaves.has(leaf)
        && !preserveNullishReceiver && !preserveFalsyReceiver
        && fallbackValueCanBeNullish(leaf, { scope: receiverPath.scope, adapter, path: receiverPath })
        && !inCallerCorrectFallbackSlot(receiverPath, leaf)) continue;
      // a whole-collapse target is the full logical - its context is the operand the selection always
      // yields its value THROUGH, which the realm canon picks spellable, and otherwise the LEFTMOST
      // value leaf. the leftmost of a realm selection may be a probe pure cannot back, and a slot the
      // literal cannot spell then re-reads that name BARE (`window.Promise.race`, undefined off-browser)
      let ctxNode = realmSelectionCollapseOperand(leaf, { adapter, scope: receiverPath.scope, path: receiverPath }) ?? leaf;
      while (ctxNode?.type === 'LogicalExpression' && !rootContext(ctxNode)?.selectedReceiver) {
        ctxNode = peelNestedSequenceExpressions(ctxNode.left).tail;
      }
      const targetPattern = leafPatterns.get(leaf) ?? patternNode;
      const context = rootContext(ctxNode);
      // Dispatch itself rejects a plain parameter's nullish receiver. A selection or
      // parameter default must first receive that original value to choose its own arm.
      const tree = mirrorPattern(targetPattern, context && { ...context,
        eagerInstance: !preserveFalsyReceiver && !(preserveNullishReceiver && valueSelectingLeaves.has(leaf))
          && instanceReadsCanBeEager(leaf, targetPattern) });
      // an ALL-passthrough tree (no polyfillable leaf) has nothing to inject - leave it native
      const metrics = tree && treeInjectionMetrics(tree);
      if (!metrics?.hasPolyfill) continue;
      // ... a head element that is a bound CONTAINER (`of [w]` over `const w = [Array, 1]`) reads
      // its passthrough slots off its own name: the read is the identifier the source wrote at the
      // element, re-read at the same position, so `w[1]` is what the pattern read there
      // ... and so does a DEFAULT naming one: the default is re-read where the source reads it
      const descriptor = mirrorReceiverDescriptor(ctxNode, receiverPath, adapter, {
        containerName: (wholeArrayLevels || defaultLeaves.has(leaf)) && rootContext(leaf)?.kind === 'static',
      });
      // a passthrough leaf reads its key's live value off the receiver, so the render needs a NAMEABLE
      // receiver (`receiverName.key`). a static-object receiver (`{ g: globalThis }`) has no single name,
      // so a tree mixing a passthrough with polyfills there is un-renderable - bail to native instead of
      // emitting `t.identifier(null)`. an all-polyfill static-object tree needs no receiver and still fires
      // A sole native slot can consume a call directly. The mirror's other slots only read imports;
      // the existing key-order admission has already rejected effects preceding that native slot.
      // Several native slots share one capture, so the call still runs once before their reads.
      // Deferred getters outlive construction of this literal. Their receiver belongs
      // to this evaluation, even when a key effect reassigns a source-visible name.
      const callReceiver = metrics.hasDeferred || !descriptor.receiverName && metrics.hasPassthrough
        && (canKeepPrefix && isCallShape(leaf) || parameterInstance && metrics.hasInstance);
      const reusableSurfaceReceiver = targetPattern?.properties?.length > 1
        && targetPattern === paramPath.node.left && !walked.hops?.length && metrics.hasInstance
        && isReReadableSurfaceNav(leaf, null, { ctx: receiverCtx });
      const receiverNode = callReceiver && !metrics.hasDeferred && !retainNativeReads
        && !coerceReceiver && (reusableSurfaceReceiver || metrics.passthroughCount === 1) ? leaf : null;
      const memo = callReceiver && !receiverNode;
      if (!descriptor.receiverName && metrics.hasPassthrough && !callReceiver) continue;
      // ... an EFFECT keeps a selection from collapsing whole, never its dead right: each one this leaf
      // stands in the left of gives way to that left, innermost first, its effects in place
      const deadFallbacks = deadRights.filter(selection => selection !== leaf && leftTargetLeaves(selection).has(leaf));
      // a default's leaf stands in the pattern the walk climbed, wherever the plan's host is - a
      // caller's call site does not even contain it - so its target is located from that pattern
      out.push({
        node: probeArm ?? leaf,
        pattern: leafPatterns.get(leaf) ?? patternNode,
        tree,
        claimedProperties: metrics.claimedProperties,
        staticBindings: metrics.staticBindings,
        readProperties: metrics.readProperties,
        levelDefaults: metrics.levelDefaults,
        ...descriptor,
        // the pattern reads each passthrough key once this receiver has evaluated: a realm key read
        // ahead of every write of its slot is the realm still, as the tree that mirrored it took it
        receiverRead: { node: leaf, path: receiverContext(leaf).path },
        ...probeArm ? { nullTestOn: probeArm.left, keepArm: probeArm.right } : {},
        // the probe stands on both halves, so the arm it keeps is a COPY: one node in two tree
        // positions aliases every later rewrite of the arm across both of them
        ...ternaryProbeArm ? { nullTestOn: leaf, keepArm: cloneNode(leaf) } : {},
        ...receiverNode ? { receiverNode } : {},
        ...!receiverNode && (keepPrefix || memo) ? { keepPrefix: true } : {},
        ...memo ? { memo: true } : {},
        ...metrics.hasDeferred ? { localMemo: true } : {},
        ...preserveNullishReceiver ? { preserveNullishReceiver: true } : {},
        ...preserveFalsyReceiver ? { preserveFalsyReceiver: true } : {},
        ...coerceReceiver ? { coerceReceiver: true } : {},
        ...defaultLeaves.has(leaf) ? { host: walked.hostPatternPath, slot: null } : {},
        ...deadFallbacks.length ? { deadFallbacks } : {},
      });
    }
    return out;
  }
  const targets = buildMirrorTargets();
  // a leaf only the realm-read rule leaves possibly falsy still renders as an always-defined literal - its
  // own spelling is never nullish, so the gate above swaps it - and the literal decides every `||` / `??`
  // it leaves with no falsy left: each gives way to that left like the census's own dead rights, found by
  // the same walk with the swapped leaves truthy
  const swapped = new Set(targets.map(target => target.node).filter(node => realmNullableLeaves.has(node)));
  if (swapped.size) {
    const swapDeadRights = [];
    for (const receiverNode of receiverNodes) {
      selectionValueCanBeFalsy(receiverNode, {
        peelIife: !callSite,
        rootContext,
        staticIsMutated: adapter.isMutatedStaticSlot ?? adapter.isMutatedStatic,
        nullable: tail => nullableLeaves.has(tail) || (realmNullableLeaves.has(tail) && !swapped.has(tail)),
        headYields: leaf => forOfHeadLeftAlwaysYields(leaf, receiverCtx),
        onDeadRight: selection => {
          if (!deadRights.includes(selection)) swapDeadRights.push(selection);
        },
        optedOut: selection => !!adapter.isOptedOut?.(selection),
      });
    }
    // each such selection belongs to the target its left yields: the one the decided level below already
    // names, else the target that left spells, else (a test choosing between arms) the first one inside it -
    // asked once per selection, innermost first, so a long chain pairs in one pass
    const targetByNode = new Map(targets.map(target => [target.node, target]));
    const ownerBySelection = new Map();
    const decidedByTarget = new Map();
    for (const selection of swapDeadRights) {
      const leftValue = peelNestedSequenceExpressions(selection.left).tail;
      const owner = ownerBySelection.get(leftValue) ?? targetByNode.get(leftValue)
        ?? targets.find(target => subtreeContainsNode(selection.left, target.node));
      if (!owner) continue;
      ownerBySelection.set(selection, owner);
      decidedByTarget.set(owner, [...decidedByTarget.get(owner) ?? [], selection]);
    }
    // ... and where a right among them runs code, the outermost selection stays as written AHEAD of the
    // literal instead: its effects run as the source runs them, the right's included (the flat claim's
    // spelling), on a host whose slot holds that prefix and with no other target inside it - a
    // caller-correct fallback slot keeps the plain literal
    const holdsPrefix = !!headElements || host?.node.type === 'VariableDeclarator' || host?.node.type === 'AssignmentExpression';
    for (const [target, decided] of decidedByTarget) {
      const outer = decided.at(-1);
      if (holdsPrefix && !defaultLeaves.has(target.node) && !target.receiverNode && !target.memo && !target.nullTestOn
        && decided.some(selection => mayHaveSideEffects(selection.right, receiverCtx))
        && targets.every(other => other === target || !subtreeContainsNode(outer, other.node))) {
        target.node = outer;
        target.keepPrefix = true;
      } else target.deadFallbacks = [...target.deadFallbacks ?? [], ...decided];
    }
  }
  // the leaf's nearest inner default, as this plan leaves it: `mirrored` where a walk took it and
  // the mirror replaced it, `dead` where every walk proved its slot holds a value (the default
  // never fires - it stays as written, and so does the leaf), `open` where the runtime decides
  const defaultArm = !arms ? null
    : targets.some(target => defaultLeaves.has(target.node)) ? 'mirrored'
    : arms.size && [...arms].every(verdict => verdict === 'dead') ? 'dead' : 'open';
  if (!targets.length) {
    if (mirrored.nativeReads) return { bail: true, nativeReads: true, defaultArm };
    if (defaultArm === 'dead') return { bail: true, defaultArm };
    // A constructor rest source already receives its full index through ordinary global
    // substitution. A declined mirror must not split its methods into body extractions.
    if (constructorRestIndex({ name: meta.object, patternNode: leafPatternPath.node, resolveGlobalPolyfill })) {
      return { bail: true, defaultArm };
    }
    // An unmirrorable pattern may use the ordinary fallback only when every reachable value is
    // a proxy global or the same proven builtin as the claim. Otherwise preserve the native leaf,
    // including a legitimate undefined supplied by a foreign receiver or an open default arm.
    // ... and a foreign array level the mirror could not spell whole (a call element beside a bound
    // sibling: nothing names the call twice) is the host's other routes' to render - and so is a
    // STATIC container whose slot under the pattern's hops proves the claim (below): only the RENDER
    // declined there, so the fallback that fires on an absent native is sound
    const declined = mirrored.foreign || receiverNodes.every(node => destructureValueBranchesAllProxy(
      node,
      adapter.isMutatedStaticSlot ?? adapter.isMutatedStatic,
    )
      || allDestructureValueBranches(node, leaf => {
        const context = rootContext(leaf);
        return (context?.kind === 'ctor' && context.builtin && context.name === meta.object)
          || (context?.kind === 'static' && staticSlotProvesClaim({ leaf, hops: walked.hops, meta, adapter, path: receiverPath }));
      }, adapter.isMutatedStaticSlot ?? adapter.isMutatedStatic)) ? null : { bail: true, defaultArm };
    if (!retainNativeReads) nestedParamSynthPlan.set(planOwner, planKey, declined);
    return declined;
  }
  // Quarantine only leaves covered on every reachable branch; user passthroughs stay live.
  // A mirrored default does not cover the native read from a supplied literal slot.
  const allReadsMirrored = !mirrored.nativeReads && targets.length === targetLeaves.length;
  const claimedProperties = allReadsMirrored
    ? targets[0].claimedProperties.filter(prop => targets.every(target => target.claimedProperties.includes(prop))) : [];
  const readProperties = allReadsMirrored
    ? targets[0].readProperties.filter(prop => targets.every(target => target.readProperties.includes(prop))) : [];
  // A mirrored binding names a static only when every reachable value supplies the same
  // entry. Preserve that proof after replacing the receiver with the synthesized literal.
  const staticBindings = allReadsMirrored
    ? [...targets[0].staticBindings].filter(([prop, entry]) => targets.every(target => target.staticBindings.get(prop) === entry)) : [];
  // ... and a default the literal fills the slot of that the build drops as dead (`defaultDroppedAsDead`), asked while
  // the source still reads the realm: the render drops it, the imports it alone held leaving with it
  const deadDefaults = [...new Set(targets.flatMap(target => target.levelDefaults))].filter(node => {
    const defaultPath = pathOfNode(leafPatternPath, node);
    return !!defaultPath && defaultDroppedAsDead(defaultPath, { adapter, resolvePure });
  });
  if (!retainNativeReads) nestedParamSynthPlan.set(planOwner, planKey, { done: true, defaultArm, readProperties });
  return {
    host, slot, targets, claimedProperties, readProperties, staticBindings, defaultArm, deadDefaults, patternHost: walked.hostPatternPath,
    ...parameterInstance && !callSite ? { claimsAlwaysDefined: false } : {},
  };
}

// does a STATIC container (a bound literal, a call yielding one) prove a claim on its own: the slot
// under the pattern's hops, walked from the leaf, resolves to the claim's constructor - every array
// level among the hops being an array literal, the walk's own condition for an index
function staticSlotProvesClaim({ leaf, hops, meta, adapter, path }) {
  if (!hops) return false;
  const walkPath = hops.map(hop => hop.key ?? String(hop.index));
  const walkCtx = { receiverNode: leaf, scope: path.scope, adapter, path };
  if (hops.some((hop, at) => hop.index !== undefined && !walksToArrayLevel({ ...walkCtx, walkPath: walkPath.slice(0, at) }))) return false;
  return walkStaticReceiverChain({ ...walkCtx, walkPath }) === meta.object;
}

// can the WHOLE init be discarded by a flatten? plain inits always; a fallback-logical only
// when its left chain is unconditionally taken (`||` / `??` lefts down to a non-logical leaf -
// no `&&` guard anywhere on the path: a guard can select its falsy LEFT, and that path's
// native TypeError must survive the transform) and every dropped operand is pure.
// `rescueReachable` is false inside a ternary BRANCH: a branch-buried effect (chain assignment,
// sequence prefix, IIFE body) is conditional, and the top-level rescue / verbatim-keep machinery
// would either run it unconditionally or drop it with the whole init - both unsound - so inside
// a branch only effect-free value shapes are discardable. a selection the build decides is the operand
// of it that runs (`decidedRunningOperand`) - a `||` / `??` its left decides included: that operand
// runs wherever the selection does, and a store in it is rescued like the store spelled alone
export function fallbackInitWhollyDiscardable(initNode, rescueReachable, ctx) {
  while (true) {
    const { prefix, tail } = peelNestedSequenceExpressions(initNode);
    if (!rescueReachable && (prefix.length
      || (tail && tail.type !== 'ConditionalExpression' && mayHaveSideEffects(tail, ctx)))) return false;
    const running = decidedRunningOperand(tail, ctx);
    if (running !== tail) {
      initNode = running;
      continue;
    }
    if (isChainAssignment(tail)) {
      // the assignment itself is rescued WHOLE, but the destructure READ of its value is what
      // the flatten discards - a guarded RHS keeps its falsy-path TypeError
      initNode = tail.right;
      continue;
    }
    if (tail?.type === 'CallExpression' || tail?.type === 'OptionalCallExpression') {
      // a transparent IIFE discards by its RETURN expression: an SE BODY is rescued by the
      // existing discard-rescue harvest, but a guard inside the return keeps its falsy path,
      // and an effectful ARGUMENT (`(g => g)((c++, globalThis))`) is not harvested - the
      // mirror keeps the call and swaps the leaf inside the argument instead
      const inlined = peelZeroArgIifeReturn(tail, { staticIsMutated: ctx.adapter.isMutatedStaticSlot ?? ctx.adapter.isMutatedStatic });
      if (!inlined) return true;
      if ((tail.arguments ?? []).some(arg => mayHaveSideEffects(arg, ctx))) return false;
      initNode = inlined;
      continue;
    }
    if (tail?.type === 'ConditionalExpression') {
      // a ternary is discardable only when the dropped test is pure and EACH branch is itself
      // wholly discardable - a guard inside a branch keeps its falsy-path TypeError
      return !mayHaveSideEffects(tail.test, ctx)
        && fallbackInitWhollyDiscardable(tail.consequent, false, ctx)
        && fallbackInitWhollyDiscardable(tail.alternate, false, ctx);
    }
    if (tail?.type !== 'LogicalExpression') return true;
    if (mayHaveSideEffects(tail, ctx)) return false;
    for (let node = tail; node?.type === 'LogicalExpression'; node = peelNestedSequenceExpressions(node.left).tail) {
      if (node.operator === '&&') return false;
    }
    return true;
  }
}

// A pattern reading a static value descends only when its plain, distinct keys include an
// instance claim. The kept pattern may own leaf defaults; a literal-only slot cannot replay
// those defaults. Assignment targets must be writable without an extra receiver evaluation.
// Each leaf carries its resolved dispatch so a late render never asks about the enclosing claim.
export function planStaticPatternInstances(pattern, { resolvePure, receiverObject = undefined, assignment = false, defaults = false }) {
  if (pattern?.type !== 'ObjectPattern' || !pattern.properties.length) return null;
  const leaves = [];
  let claims = false;
  for (const item of pattern.properties) {
    if (!isPropertyNode(item) || item.computed || !defaults && item.value?.type === 'AssignmentPattern') return null;
    if (assignment && !propBindingIdentifier(item.value) && !memberTargetTakesExtraction(item.value)) return null;
    const key = plainSynthKeyName(item.key);
    if (key === null || key === '__proto__' || leaves.some(leaf => leaf.key === key)) return null;
    const pure = resolvePure({ kind: 'property', object: receiverObject, key, placement: 'prototype' }, null);
    claims ||= pure?.kind === 'instance';
    leaves.push({ key, pure: pure?.kind === 'instance' ? pure : null });
  }
  return claims ? leaves : null;
}

// Render the shared synth tree with the emitter's import and passthrough hooks.
// Passthrough reads use the receiver descriptor and accumulated keys; a sole native slot may
// consume a receiver expression without a capture. Bailed reads let the
// emitter suppress later rewrites. A root `receiverPrefix` preserves the discarded receiver's
// effects, with an empty-pattern coercion when `coerceReceiver` requires its native throw.
export function renderSynthTree(tree, ctx, keyPath = []) {
  if (!keyPath.length && ctx.memoActivation) {
    const { memoActivation, memoArguments, ...inner } = ctx;
    return renderMemoActivation(renderSynthTree(tree, inner), memoActivation, memoArguments);
  }
  if (!keyPath.length && ctx.receiverPrefix) {
    const { receiverPrefix, coerceReceiver, preserveNullishReceiver, preserveFalsyReceiver, ...inner } = ctx;
    const value = renderSynthTree(tree, inner);
    // Empty destructuring performs precisely the discarded receiver's nullish check,
    // before any key or binding in the surviving source pattern is evaluated.
    return sequenceExpression([
      coerceReceiver ? assignmentExpression('=', renderObjectPattern([]), receiverPrefix) : receiverPrefix,
      preserveFalsyReceiver ? logicalExpression('&&', identifier(ctx.receiverName), value) : preserveNullishReceiver
        ? conditionalExpression(nullGuardTest(identifier(ctx.receiverName)), identifier(ctx.receiverName), value) : value,
    ]);
  }
  if (tree.kind === 'polyfill') return identifier(ctx.injectImport(tree.entry, tree.hintName));
  if (tree.kind === 'instance') {
    const receiver = renderSynthTree({ kind: 'passthrough' }, ctx, keyPath.slice(0, -1));
    return callExpression(identifier(ctx.injectImport(tree.entry, tree.hintName)), [receiver]);
  }
  if (tree.kind === 'passthrough') {
    if (ctx.receiverNode) {
      const read = keyPath.reduce(memberFromKeyName, ctx.receiverNode);
      return ctx.renderPassthrough?.(read, tree) ?? read;
    }
    const ref = resolvePassthroughRef({
      keyPath: ctx.receiverKeys?.length ? [...ctx.receiverKeys, ...keyPath] : keyPath,
      receiverName: ctx.receiverName,
      receiverIsProxy: ctx.receiverIsProxy,
      resolveGlobalPolyfill: ctx.resolveGlobalPolyfill,
      adapter: ctx.adapter,
      escapedCtor: tree.escapedCtor === true,
      raw: tree.bailed === true,
      read: ctx.receiverRead ?? null,
    });
    let base = ref.pure ? identifier(ctx.injectImport(ref.pure.entry, ref.pure.hintName)) : identifier(ref.name);
    for (const key of ref.path) base = memberFromKeyName(base, key);
    return ctx.renderPassthrough?.(base, tree) ?? base;
  }
  if (tree.kind === 'array') {
    return arrayExpression(tree.elements.map((child, index) => child ? renderSynthTree(child, ctx, [...keyPath, String(index)]) : null));
  }
  // Quoted names change only the key spelling; every mirror level uses the same data slots.
  return objectExpression(tree.entries.map(({ key, child, symbolKey, readPure, deferred }) => {
    if (!symbolKey) {
      const spelled = synthEntryKey({ lookupKey: key }, { resolvedSpelling: true });
      return (deferred ? objectGetter : objectProperty)(spelled.key,
        renderSynthTree(child, ctx, [...keyPath, key]), { computed: spelled.computed });
    }
    const keyName = ctx.injectImport(symbolKey.entry, symbolKey.hintName);
    const receiver = renderSynthTree(child, ctx, keyPath);
    const value = readPure ? callExpression(identifier(ctx.injectImport(readPure.entry, readPure.hintName)), [receiver])
      : memberExpression(receiver, identifier(keyName), { computed: true });
    return (deferred ? objectGetter : objectProperty)(identifier(keyName), value, { computed: true });
  }));
}

// Collect injection, passthrough and descended-claim flags together with property ownership
// and static aliases. `treeInjectionMetrics` uses them to decide whether a mirror earns a
// polyfill and whether its retained reads need a nameable receiver.
function collectTreeInjectionFlags(tree, m) {
  switch (tree.kind) {
    case 'instance':
      m.instance = true;
      m.real = true;
      m.passthrough = true;
      m.passthroughCount += 1;
      if (tree.prop) m.claimedProperties.push(tree.prop);
      break;
    case 'polyfill':
      m.real = true;
      if (tree.readProperties) m.readProperties.push(...tree.readProperties);
      if (tree.prop) m.claimedProperties.push(tree.prop);
      if (tree.prop && tree.static) m.staticBindings.set(tree.prop, tree.entry);
      break;
    // ... a DESCENDED slot injects the static's own ponyfill through every one of its keys, so the
    // tree is worth emitting whatever its leaves resolve to; the leaves are then ordinary
    // passthroughs, each reading its own member off that ponyfill
    // ... a descended HOP has no ponyfill of its own - what it reaches is an instance dispatch over
    // the hop's live value - so like a plain instance slot it rides a tree a sibling already keeps
    // alive and never keeps one alive by itself
    case 'descended-pattern': {
      m.descended = true;
      const real = m.real || !tree.hop;
      for (const { child } of tree.entries) collectTreeInjectionFlags(child, m);
      m.real = real;
      break;
    }
    case 'passthrough':
      m.passthrough = true;
      m.passthroughCount += 1;
      if (tree.injects) m.injecting = true;
      if (tree.bailed) m.bailed = true;
      if (!tree.bailed && tree.readProperties) {
        m.readProperties.push(...tree.readProperties);
        m.nativeReadProperties.push(...tree.readProperties);
      }
      // This slot already reads the original receiver. Reclassifying the synthetic
      // object as an instance receiver would claim a read the mirror has settled.
      if (tree.prop && !tree.bailed) {
        (tree.injects ? m.claimedProperties : m.readProperties).push(tree.prop);
        if (!tree.injects) m.nativeReadProperties.push(tree.prop);
      }
      break;
    case 'object':
      for (const { child, symbolKey, prop, levelDefault, deferred } of tree.entries) {
        m.deferred ||= !!deferred;
        if (symbolKey) m.readProperties.push(prop);
        if (levelDefault) m.levelDefaults.push(levelDefault);
        collectTreeInjectionFlags(child, m);
      }
      break;
    case 'array':
      for (const child of tree.elements) if (child) collectTreeInjectionFlags(child, m);
      break;
    // no default
  }
  return m;
}

function treeInjectionMetrics(tree) {
  const m = collectTreeInjectionFlags(tree,
    {
      real: false,
      injecting: false,
      bailed: false,
      passthrough: false,
      passthroughCount: 0,
      descended: false,
      instance: false,
      deferred: false,
      claimedProperties: [],
      readProperties: [],
      nativeReadProperties: [],
      staticBindings: new Map(),
      levelDefaults: [],
    });
  // A bailed subtree still needs its ordinary host handling, so a constructor passthrough
  // alone cannot own that pattern. Without a bail, the constructor itself earns the mirror.
  return {
    hasPolyfill: m.bailed ? m.real : m.real || m.injecting,
    hasInstance: m.instance,
    hasDeferred: m.deferred,
    hasDescendedClaim: m.descended,
    hasBailedSubtree: m.bailed,
    nativeReadProperties: m.nativeReadProperties,
    hasPassthrough: m.passthrough,
    passthroughCount: m.passthroughCount,
    claimedProperties: m.claimedProperties,
    readProperties: m.readProperties,
    staticBindings: m.staticBindings,
    levelDefaults: m.levelDefaults,
  };
}

// is this name bound to a STATIC CONTAINER - an object or array literal, or a call the call canon
// proves to yield one - whose initializer has run by the read (the dominance canon)? the literal's
// type, or null: the static root `mirrorRootContext` classifies - a container is an object, so a
// selection over one is truthy. a name a PATTERN binds holds the slot it pairs with, never the whole
// init (`const [n] = [null]` binds `null`), and a name a write may reach holds the one value that write
// leaves there, or none (`readsReachedAlias`: `if (c) N = null` leaves `N || { C: Object }` selecting)
function boundStaticContainer({ node: name, scope: nameScope, adapter, path, classes = false, calls = true }) {
  let node = name;
  let scope = nameScope;
  let binding;
  for (const seen = new Set(); ;) {
    if (node?.type !== 'Identifier' || !adapter.hasBinding({
      scope,
      name: node.name,
      path,
      read: node,
    }) || cycleGuardHas(seen, node.name)) return null;
    seen.add(node.name);
    binding = adapter.getBinding({ scope, name: node.name, path, read: node });
    // a declaration no binding view carries (a TypeScript enum or namespace) holds no container literal
    if (!binding) return null;
    // a name never written past its declarator holds its init: no lookup of the writes is owed
    if (!isReassignedBeyondDeclarator(binding) || !readsReachedAlias(node, { scope, adapter, path })) break;
    const writeScopes = [];
    const reaching = reachingReassignmentValueNode({
      binding, usagePath: path, ctx: { scope, adapter, path }, usageNode: node, requireSingleObservation: true, writeScopes,
    });
    const value = reaching && unwrapExpressionChain(peelChainRootValue(reaching));
    if (value?.type !== 'Identifier') {
      return value?.type === 'ObjectExpression' || value?.type === 'ArrayExpression' ? value.type : null;
    }
    // the write stores another name: what that name holds where the write reads it
    scope = writeScopes[0] ?? aliasDeclScope(binding, scope);
    node = value;
    classes = false;
  }
  const declaratorNode = binding?.path?.node ?? binding?.node;
  const declCtx = { scope: aliasDeclScope(binding, scope), adapter, path };
  const written = declaratorNode?.init && declaratorNode.id && declaratorNode.id.type !== 'Identifier'
    ? certainPairedSlotValue({ pattern: declaratorNode.id, init: declaratorNode.init, name: node.name, ctx: declCtx })?.node ?? null
    : declaratorNode?.init;
  // ... a selection the build decides holds the operand it always yields (`decidedSelectionValue`)
  const selection = unwrapExpressionChain(written);
  const live = selection && decidedSelectionValue(selection, declCtx);
  const init = live === selection ? written : unwrapExpressionChain(live);
  const held = classes && (declaratorNode?.type === 'ClassDeclaration' || init?.type === 'ClassExpression') ? 'ObjectExpression'
    : init?.type === 'ObjectExpression' || init?.type === 'ArrayExpression' ? init.type
    : calls && invocationNode(init)
      ? callYieldedLiteral({ node: init, readNode: init, seen: new Set(), ctx: declCtx })?.literal.type : null;
  return (held === 'ObjectExpression' || held === 'ArrayExpression') && varInitDominatesUsage({
    declaratorNode, usagePath: path, usageNode: node, kind: binding.kind,
  }) ? held : null;
}

// can this receiver VALUE never be nullish - what a keyed read's null rejection asks of the value it
// guards: a literal other than `null` or a construction, a name holding an object or array literal that
// is initialized by the read and never written again, or the prototype a built-in constructor carries -
// a namespace (`Math`) carries none, and an engine lacking the constructor throws at the read itself,
// ahead of the key
export function receiverValueNeverNullish(node, { scope, adapter, path }) {
  const core = unwrapRuntimeExpr(peelReceiverSequenceTail(node));
  if (ALWAYS_TRUTHY_OBJECT_NODES.has(core?.type) || core?.type === 'TemplateLiteral'
    || (PRIMITIVE_LITERAL_TYPES.has(core?.type) && !isNullLiteralNode(core))) return true;
  if (core?.type === 'Identifier') {
    return !adapter.getBinding?.({ scope, name: core.name, path, read: core })?.constantViolations?.length
      && !!boundStaticContainer({ node: core, scope, adapter, path });
  }
  if ((core?.type !== 'MemberExpression' && core?.type !== 'OptionalMemberExpression') || core.optional) return false;
  const key = memberKeyName(core);
  const container = unwrapRuntimeExpr(core.object);
  let stored = null;
  if (container?.type === 'ArrayExpression') {
    const index = canonicalArrayIndex(key);
    if (index !== null && container.elements.slice(0, index + 1).every(item => item?.type !== 'SpreadElement')) {
      stored = container.elements[index] ?? null;
    }
  } else if (container?.type === 'ObjectExpression' && key !== null) {
    const paired = objectLevelPairedProperty(container, key,
      prop => consumableHopSlotName(prop, { scope, adapter, path }));
    const kind = paired?.match.type === 'ObjectMethod' ? paired.match.kind
      : paired?.match.method ? 'method' : paired?.match.kind;
    if (kind !== 'get' && kind !== 'set' && kind !== 'method') stored = paired?.read ?? null;
  }
  const storedCore = unwrapRuntimeExpr(peelReceiverSequenceTail(stored));
  if (ALWAYS_TRUTHY_OBJECT_NODES.has(storedCore?.type) || storedCore?.type === 'TemplateLiteral'
    || (PRIMITIVE_LITERAL_TYPES.has(storedCore?.type) && !isNullLiteralNode(storedCore))) return true;
  if (key !== 'prototype') return false;
  const ctor = resolveObjectName({ objectNode: core.object, scope, adapter, path });
  return !!ctor && isKnownStaticGlobal(ctor, adapter) && !KNOWN_NAMESPACE_GLOBALS.has(ctor) && !POSSIBLE_GLOBAL_OBJECTS.has(ctor)
    && !isMutatedGlobalSlot(adapter, ctor);
}

// can a SELECTION tree yield a falsy value? walked over its REACHABLE value leaves: `&&` keeps its left
// selecting natively (only its right is a value leaf, and the result may be falsy); `||` / `??` takes
// its left leaf, and its right only where the left can be falsy (a guarded left like `m && globalThis`
// - both sides must then unfold, the runtime picks per call). a conditional reaches both arms, each a
// value-SELECTING leaf exactly as a logical operand is: what the arm yields is what the pattern reads
// on the path the test takes. a TRUTHY leaf - a proxy, a builtin constructor, a static container, as
// `rootContext` classifies it (`mirrorRootContext`) - keeps a `||` / `??` right beside it dead; an
// UNDEFINABLE probe nav (`globalThis.window ?? {}` - nullish exactly off-env) reaches its fallback, which
// `nullable` answers, and any other value may be falsy (`const m = 0`). `onLeaf` hears every reachable
// leaf with whether its value selects, `onDeadRight` every `||` / `??` whose right it never reaches;
// `peelIife` sees through a transparent IIFE, which stays CALLED - its body effects and the selection
// run natively, only the leaves of its return are the tree's. `answers` keeps the verdict of every
// subtree a walk nothing hears reaches: a level of a long chain asks what its left decides, the walk
// of that left holds every lower level, and asked afresh at each level it walked the chain again.
// `optedOut` names a `||` / `??` the user opted out of, which decides nothing: its right is reached too.
// `headYields` answers a leaf the classification names nothing for: a for-of head binding holds one
// element on every pass, so it is truthy where every element is (`forOfHeadLeftAlwaysYields`) - it
// names no root a mirror could stand on
function selectionValueCanBeFalsy(node, {
  rootContext,
  nullable,
  headYields,
  staticIsMutated = null,
  onLeaf = null,
  wholeValue = null,
  onDeadRight = null,
  peelIife = true,
  selects = false,
  truthySelects = false,
  answers = null,
  optedOut = null,
}) {
  const kept = onLeaf || onDeadRight ? null : answers;
  function walk(branch, selecting, truthySelecting = truthySelects) {
    return selectionValueCanBeFalsy(branch, {
      rootContext, nullable, headYields, staticIsMutated, onLeaf, wholeValue, onDeadRight, peelIife,
      selects: selecting, truthySelects: truthySelecting, answers: kept, optedOut,
    });
  }
  function verdict() {
    let current = node;
    while (true) {
      const { tail } = peelNestedSequenceExpressions(current);
      if (peelIife && (tail?.type === 'CallExpression' || tail?.type === 'OptionalCallExpression')) {
        const inlined = peelZeroArgIifeReturn(tail, { staticIsMutated });
        if (inlined) {
          current = inlined;
          continue;
        }
      }
      if (tail?.type === 'ConditionalExpression' && !wholeValue?.(tail)) {
        const consequentFalsy = walk(tail.consequent, true);
        return walk(tail.alternate, true) || consequentFalsy;
      }
      if (tail?.type !== 'LogicalExpression' || wholeValue?.(tail)) {
        const context = rootContext(tail);
        const falsy = (!(context?.kind === 'proxy' || context?.kind === 'static' || (context?.kind === 'ctor' && context.builtin))
          && !headYields(tail)) || nullable(tail);
        onLeaf?.(tail, selects, falsy, truthySelects);
        return falsy;
      }
      if (tail.operator === '&&') {
        walk(tail.right, selects);
        return true;
      }
      if (walk(tail.left, true, truthySelects || tail.operator === '||') || optedOut?.(tail)) return walk(tail.right, selects);
      onDeadRight?.(tail);
      return false;
    }
  }
  if (kept?.has(node)) return kept.get(node);
  const falsy = verdict();
  kept?.set(node, falsy);
  return falsy;
}

// a `||` / `??` RIGHT arm is DEAD text where its LEFT is always truthy - the selection never reaches
// it, so no route mirrors it - save on a line the user opted out of, where the selection decides
// nothing and keeps its right (`isOptedOut`, as `decidedSelection` reads it). the left's leaves are
// walked and classified exactly as the plan's leaf census walks the whole selection: one walk
// (`selectionValueCanBeFalsy`) over one classification (`mirrorRootContext`), so the per-branch walks
// in the shared fallback synth walk (`fallbackBranchWalk`) answer what the plan answers for every
// spelling of the left
// without a resolver the definitions alone answer whether a proxy hop is backed, which is what a
// resolver answers for every hop it has no entry for. `throughChainAssign` takes the value reading
// of a stored nav (`fallbackValueCanBeNullish`). every input of the classification keys the walk's
// per-node answers (`canonAnswerTable`)
export function selectionLeftAlwaysTruthy({
  node, scope, adapter, path, resolvePure = noPureResolution, rescuesReceiverRead = false, throughChainAssign = false,
}) {
  if (adapter?.isOptedOut?.(node)) return false;
  const literal = literalNodeValue(unwrapRuntimeExpr(peelReceiverSequenceTail(node)));
  if (literal !== undefined) return !!literal;
  function rootContext(leaf) {
    return mirrorRootContext({ node: leaf, scope, adapter, path, resolvePure, rescuesReceiverRead });
  }
  return !selectionValueCanBeFalsy(node, {
    rootContext,
    staticIsMutated: adapter.isMutatedStaticSlot ?? adapter.isMutatedStatic,
    nullable: leaf => fallbackValueCanBeNullish(leaf, { scope, adapter, path }, { throughChainAssign })
      || unservedConstructorLeaf(leaf, { scope, adapter, path }, rootContext),
    headYields: leaf => forOfHeadLeftAlwaysYields(leaf, { scope, adapter, path }),
    answers: canonAnswerTable(selectionLeftAlwaysTruthy,
      [scope, adapter, canonContextPath(path), resolvePure, rescuesReceiverRead, throughChainAssign]),
  });
}

// the resolver of a walk asked without one: every hop has no entry
function noPureResolution() {
  return null;
}

// the value a selection leaf yields where its spelling hides it: through a const alias, a destructured
// binding, a call returning it (a call answers through the inline canon the classification reads it
// by) and the slot of a static container (`box.U` over `const box = { U: Map }`, `containerSlotOrigin`) -
// `{ node, ctx, read }`, or null where a call that canon cannot see through stands in the way. `read` is
// what the value was last read as: the leaf, or the slot's own spelling a container step reached
function selectionLeafOrigin(leaf, ctx) {
  let read = { node: leaf, ctx };
  let origin = followConstIdentifierInit({ node: unwrapRuntimeExpr(leaf), readNode: null, ctx });
  for (const stepped = new Set(); !stepped.has(origin.node);) {
    stepped.add(origin.node);
    let value;
    if (invocationNode(origin.node)) {
      const call = realmYieldingCallView(origin.node, origin.ctx);
      value = call && inlineCallReturnExpression({ node: call, readNode: null, seen: new Set(), ctx: origin.ctx });
      if (!value) return null;
    } else {
      value = containerSlotOrigin(origin.node, origin.ctx);
      if (!value) return { ...origin, read };
      read = { node: value.node, ctx: value.ctx };
    }
    origin = followConstIdentifierInit({
      node: unwrapRuntimeExpr(peelReceiverSequenceTail(value.node)), readNode: null, seen: value.seen, ctx: value.ctx,
    });
  }
  return null;
}

// the value the slot of a static container holds where a read stands on one, as the container spells it: the
// hop of the walk the classification names that read by (`staticContainerReceiverName`), under pure's proofs
// whatever the method - a value the slot ALWAYS holds, which no write reaching it leaves (`valueProofAdapter`) -
// or null
function containerSlotOrigin(node, ctx) {
  if (!isMemberAccessNode(node)) return null;
  const reached = staticContainerReceiverName({
    node, scope: ctx.scope, adapter: valueProofAdapter(ctx.adapter), path: ctx.path, resolveLeaf: hop => ({ hop }),
  });
  return reached?.hop ? { ...reached.hop, ctx: { ...reached.hop.ctx, adapter: ctx.adapter } } : null;
}

// is that value a bare global name - unbound, so it reads the realm's slot itself, where an engine lacking
// the global throws before anything right of it could run - whose slot no write the census sees replaces, in
// either method (as `servedRead` asks): a written slot may hold a falsy value (`Promise || (Promise = P)`)
function originIsBareGlobal(origin, ctx) {
  return origin?.node?.type === 'Identifier' && !ctx.adapter.hasBinding({
    scope: origin.ctx.scope,
    name: origin.node.name,
    path: ctx.path,
    read: origin.node,
  })
    && !ctx.adapter.isMutatedStaticSlot?.('globalThis', origin.node.name);
}

// does a `||` / `??` left read such a bare global name - itself, or the value of a const alias or a call
// returning one (`selectionLeafOrigin`) - on a line the user did not opt out of, which nothing then rewrites?
// the walk follows aliases and calls only, never a selection one of them holds, so a level of an alias chain
// asks it without walking the levels below. the name read (`{ node, ctx }`), or null
function bareGlobalLeft(left, ctx) {
  if (ctx.adapter?.isOptedOut?.(left)) return null;
  const origin = selectionLeafOrigin(peelReceiverSequenceTail(left), ctx);
  // ... through what an alias always holds: usage-global follows one by what it may hold
  return originIsBareGlobal(origin, ctx) && !(ctx.adapter?.method === 'usage-global' && readsReachedAlias(left, ctx)) ? origin : null;
}

// ... and is that name a built-in, never falsy where the engine has it - as the classification knows the
// name alone (`selectionLeftAlwaysTruthy`), which walks no alias: a global it does not know may hold a
// falsy value (`const r = opener; r || fallback()`). a left holding a for-of head binding takes one of its
// elements on every pass and answers by them (`forOfHeadLeftAlwaysYields`)
export function bareBuiltInLeft(left, ctx) {
  const origin = bareGlobalLeft(left, ctx);
  return origin ? selectionLeftAlwaysTruthy({ node: origin.node, scope: origin.ctx.scope, adapter: ctx.adapter, path: ctx.path })
    : forOfHeadLeftAlwaysYields(left, ctx);
}

// the values the for-of head binding an identifier read (`node`) resolves to takes in turn, each `{ node, ctx }` spelled
// in the head's scope and read where the iterable is, once, ahead of the first pass (`loopHeadValueReadAnchor`),
// or null. the head is the declaration a read in its loop's body resolves to and the binding's only write
// (`forOfHeadDeclarationOf`). only an inline literal names the elements (`forOfHeadIterableElements`), and a
// pattern head holds its slot of each where the pairing is certain (`certainPairedSlotValue`: no default may
// fire in its place) and spelled inside the element itself - a container the pairing reaches by name may be
// written or handed out before the head reads it
function forOfHeadValues(node, ctx) {
  const read = unwrapRuntimeExpr(node);
  const { name } = read;
  const head = forOfHeadDeclarationOf(name, ctx, read);
  if (!head) return null;
  const { loop, declaration: { node: declarator }, binding, elements } = head;
  const headCtx = { scope: aliasDeclScope(binding, ctx.scope), adapter: ctx.adapter, path: loop.get('right') };
  if (declarator.id.type === 'Identifier') return elements.map(element => ({ node: element, ctx: headCtx }));
  const values = [];
  for (const element of elements) {
    const slot = certainPairedSlotValue({ pattern: declarator.id, init: element, name, ctx: headCtx });
    if (!slot || !subtreeContainsNode(element, slot.node)) return null;
    values.push({ node: slot.node, ctx: { ...headCtx, scope: slot.scope } });
  }
  return values;
}

// does a `||` / `??` left holding a for-of head binding (`forOfHeadValues`) always yield: is every value the
// binding takes in turn a left that always yields and is backed as a decided left is (`leftAlwaysYields`,
// `decidedLeftBacking`)? the binding holds one of them on every pass, so the right never runs
// (`for (const M of [Map, Set]) (M || Object).groupBy` reads no `Object`); one value that may be falsy or
// unknown keeps the selection. an element is read where the iterable is, outside the loop's body, so a head
// it names is an enclosing loop's and the asks end at the outermost. kept per node (`canonAnswerTable`) under
// every input the walk reads, from a walk no cycle guard cut (`cycleGuardCuts`)
export function forOfHeadLeftAlwaysYields(left, ctx) {
  const node = peelReceiverSequenceTail(left);
  if (unwrapRuntimeExpr(node)?.type !== 'Identifier') return false;
  const answers = canonAnswerTable(forOfHeadLeftAlwaysYields, [ctx.scope, ctx.adapter, canonContextPath(ctx.path)]);
  if (answers?.has(node)) return answers.get(node);
  const cuts = cycleGuardCuts();
  const yields = !!forOfHeadValues(node, ctx)?.every(({ node: value, ctx: valueCtx }) => leftAlwaysYields(value, valueCtx)
    && !!decidedLeftBacking(value, valueCtx));
  if (answers && cycleGuardCuts() === cuts) answers.set(node, yields);
  return yields;
}

// may this selection leaf be a built-in constructor the build does not serve, read where an engine lacking
// it hands `undefined` on - off the realm (`globalThis.WeakRef`), directly or through an alias, a
// destructured binding, a call returning such a read or a static container's slot holding one - so the
// right of its `||` / `??` may run? the bare name, and an alias or a call returning it, throw there instead,
// before the right could run; a call the inline canon cannot see through keeps the classification's answer.
// a slot is served as its own read is (`{ U: _Map }`, the pass's own import). `classify` answers the leaf's
// root context
function unservedConstructorLeaf(leaf, ctx, classify) {
  const context = classify(leaf);
  if (context?.kind !== 'ctor' || !context.builtin) return false;
  const origin = selectionLeafOrigin(leaf, ctx);
  return !!origin && !originIsBareGlobal(origin, ctx) && !servedRead(origin.read.node, { ...ctx, scope: origin.read.ctx.scope });
}

// the operand a `||` / `??` always yields - its LEFT where that is always truthy, followed down every
// level that decides the same way (`(f() || Set) ?? WeakMap` yields `f()`) - or null where a right may run.
// asked from a level of a longer chain, it reads from the chain's root (`canonContextPath`), which keys
// its answers: a walk anchored at the level climbs every level above it again at each read it makes
export function decidingFallbackLeft(node, ctx) {
  // a selection the user opted out of decides nothing: its line is left as written (`decidedSelection`'s rule)
  if (ctx.adapter?.isOptedOut?.(peelTransparentExpr(node))) return null;
  return withCanonQuestion(() => decidedFallbackLeftOf(node, { ...ctx, path: canonContextPath(ctx.path) }));
}

// the levels a walk of that answer is deciding right now: the classification of a left resolves its
// value with a cycle guard of its own, so a left reaching back into the selection it decides (`var a =
// f() || Map` with `f` returning `a`) asked the same level again without end. a level asked inside its
// own walk has no deciding left - what it holds at runtime too, its slot not yet written - and the ask
// counts as a guard cut (`cycleGuardHas`), so no answer walked through it is kept
const decidingLevels = new Set();

// one level of that answer, kept per node (`canonAnswerTable`) under the inputs its walk reads: each
// level of a long decided chain asks the levels below it, which every higher level asked before
function decidedFallbackLeftOf(node, ctx) {
  const core = peelTransparentExpr(node);
  if (core?.type !== 'LogicalExpression' || core.operator === '&&') return null;
  const answers = canonAnswerTable(decidedFallbackLeftOf, [
    ctx.scope, ctx.adapter, canonContextPath(ctx.path), ctx.resolvePure, !!ctx.rescuesReceiverRead,
  ]);
  if (answers?.has(core)) return answers.get(core);
  if (cycleGuardHas(decidingLevels, core)) return null;
  decidingLevels.add(core);
  let decided;
  try {
    // a left the build decides is the part of it that runs (`decidedRunningPart`): its dead part yields nothing.
    // a left that is a level this canon decides yields what that level does, any other where it always does
    const left = decidedRunningPart(core.left, ctx);
    decided = decidedFallbackLeftOf(left, ctx) ?? (leftAlwaysYields(left, ctx) ? left : null);
  } finally {
    decidingLevels.delete(core);
  }
  answers?.set(core, decided);
  return decided;
}

// does a `||` / `??` left always yield, its right never running: a fresh object (`leftYieldsFreshObject`) or
// a truthy value - a store yields the value it stores (`peelChainRootValue`), and usage-global reads a name a
// write reaches by every value it may hold (`readsReachedAlias`), a falsy one among them - as `bareGlobalLeft`
// does
function leftAlwaysYields(left, ctx) {
  return leftYieldsFreshObject(left, ctx)
    || (selectionLeftAlwaysTruthy({ node: peelChainRootValue(left), ...ctx, throughChainAssign: true })
      && !(ctx.adapter?.method === 'usage-global' && readsReachedAlias(left, ctx)));
}

// the operand of a value that runs, as written, down every level the build decides: a ternary or an `&&`
// yields its live operand (`decidedRunningPart`), a `||` / `??` its left where that always runs and yields
// (`fallbackRunningLeft`) and a `||` its right where its decided test runs it (`fallbackRunningRight`) - what a
// render that replaces the value spells in its place
export function decidedRunningOperand(node, ctx) {
  let current = node;
  for (let depth = 0; depth < STATIC_WALK_DEPTH; depth++) {
    const running = decidedRunningPart(current, ctx);
    const next = fallbackRunningLeft(running, ctx) ?? fallbackRunningRight(running, ctx) ?? running;
    if (next === current) break;
    current = next;
  }
  return current;
}

// ... and the path of that operand, for a walker holding a path to the value (both legs' path API): what a
// render replacing the value replaces, a sequence's tail included - its prefix runs where it stands
export function decidedRunningOperandPath(path, adapter) {
  let current = path;
  for (let depth = 0; depth < STATIC_WALK_DEPTH; depth++) {
    let next = decidedRunningPath(current, adapter);
    while (next?.node && fallbackRunningLeft(next.node, { scope: next.scope, adapter, path: next })) {
      next = decidedRunningPath(next.get('left'), adapter);
    }
    if (next?.node && fallbackRunningRight(next.node, { scope: next.scope, adapter, path: next })) {
      next = decidedRunningPath(next.get('right'), adapter);
    }
    if (next?.node?.type === 'SequenceExpression') next = next.get('expressions').at(-1);
    if (next?.node === current?.node) return next;
    current = next;
  }
  return current;
}

// ... one `||` / `??` level of it: the left where the right never runs - an always-truthy left or a fresh
// object (`decidingFallbackLeft`, which may answer a deeper level's) - or null
function fallbackRunningLeft(node, ctx) {
  const core = unwrapRuntimeExpr(node);
  if (core?.type !== 'LogicalExpression' || core.operator === '&&' || ctx.adapter?.isOptedOut?.(core)) return null;
  const live = decidedLiveOperand(core, ctx);
  if (live === core.left) return live;
  return decidingFallbackLeft(core, ctx);
}

// ... and the right of a `||` whose decided test runs it (`decidedLiveOperand`), the twin of a decided `&&` that
// runs its right - or null. asked here rather than in the running part, which the walk deciding a `||` chain by
// its left (`decidingFallbackLeft`) asks at every level. no test answer is nullish, so a `??` never runs its right
function fallbackRunningRight(node, ctx) {
  const core = unwrapRuntimeExpr(node);
  if (core?.type !== 'LogicalExpression' || core.operator !== '||' || ctx.adapter?.isOptedOut?.(core)) return null;
  const live = decidedLiveOperand(core, ctx);
  return live === core.right ? live : null;
}

// the VALUE a value yields, for a classifier asking what it is rather than a render spelling it: the operand
// that runs (`decidedRunningOperand`), its sequence prefix stepped over between decisions as the path walk
// steps into a tail - a selection behind an effect still decides (`(eff(), T ? [A] : [B])` is `[A]`).
// `prefixes` collects what was stepped over, in source order; a render keeps the operand, prefix included
export function decidedRunningValue(node, ctx, prefixes = []) {
  let current = node;
  for (let depth = 0; depth < STATIC_WALK_DEPTH; depth++) {
    const next = unwrapCollectingSePrefixes(decidedRunningOperand(current, ctx), prefixes);
    if (next === current) break;
    current = next;
  }
  return current;
}

// what the memo of an optional hop's base re-reads in place of a selection the build decides: the operand
// it folds to once its claims rendered (`decidedSelectionValue`), a name the file binds that the receiver
// canon may read again (`isReusableReceiver`) - a read off the re-read is the read off that name spelled
// alone, an identity guard over its static included. a sequence's prefix runs once, in the first read;
// a free global keeps the respelling of its own channels. null otherwise
export function decidedReusableReceiver(node, ctx) {
  if (!ctx?.adapter) return null;
  const { tail } = peelNestedSequenceExpressions(node);
  const value = unwrapRuntimeExpr(decidedSelectionValue(tail, ctx));
  return value !== tail && value?.type === 'Identifier' && ctx.adapter.getBinding({ scope: ctx.scope, name: value.name, path: ctx.path })
    && isReusableReceiver(value, { ctx }) ? value : null;
}

// is the RIGHT of a user-written `||` / `??` never reached: its left always decides (`decidingFallbackLeft`,
// this level - a nested level answers on its own visit) and names a global the build guarantees - one
// core-js implements that the build serves (`servedRead`: pure substitutes it, or the data subset carries it,
// an excluded module of it included) - or is a bare global name, an alias or a call returning one, which
// needs no guarantee: an engine lacking it throws there before the right could run (`WeakRef || Object`). any other
// left needs the value the build guarantees: one it does not serve may select the right - `self.fetch || shim`, a
// proposal below the mode, a global the census sees written (`Promise || (Promise = P)`). a left yielding a fresh
// object needs no backing, a fresh object is never falsy (`leftYieldsFreshObject`) - one a deeper level
// yields included (`{ C: Map } || { C: Object } || { C: Set }`). `{ substituted, left }` - where pure
// respells the left itself, and the left that always yields - or null where the right may run
function deadFallbackRight(node, ctx) {
  if (node?.type !== 'LogicalExpression' || node.operator === '&&') return null;
  const decided = decidingFallbackLeft(node, ctx);
  const backing = decided && decidedLeftBacking(decided, ctx);
  return backing && { ...backing, left: decided };
}

// ... that backing of the decided left: `{ substituted }`, or null
function decidedLeftBacking(decided, ctx) {
  // the decided left names its value, a call's included: its backing is that name's ...
  const read = servedRead(decided, ctx);
  if (read?.global) return { substituted: read.substituted };
  // ... and a bare name needs none: an engine lacking the global throws there before the right could run -
  // nor does a for-of head binding whose every element is a backed left (`forOfHeadLeftAlwaysYields`)
  if (bareGlobalLeft(decided, ctx) || forOfHeadLeftAlwaysYields(decided, ctx)) return { substituted: false };
  return leftYieldsFreshObject(decided, ctx) ? { substituted: false } : null;
}

// does a `||` / `??` left always yield a freshly made object (`ALWAYS_TRUTHY_OBJECT_NODES`), never falsy -
// as written, behind an effect prefix or a store (`(B = { C: Map }) || { C: Object }`, `peelChainRootValue`),
// returned by a call the inline canon reads (`make() || { C: Object }`, `callYieldedLiteral`), or as the
// operand an `&&` or a conditional the build decides yields (`typeof Symbol != 'undefined' && { C: Map } ||
// { C: Object }`)? a `||` / `??` left is a level of its own chain, which `decidedFallbackLeftOf` answers
// once per level: asking it here would walk the chain again at every level
function leftYieldsFreshObject(left, ctx) {
  const core = unwrapRuntimeExpr(peelChainRootValue(left));
  const decidable = core?.type === 'ConditionalExpression' || (core?.type === 'LogicalExpression' && core.operator === '&&');
  const value = unwrapRuntimeExpr(decidable ? peelChainRootValue(decidedSelectionValue(core, ctx)) : core);
  const yielded = invocationNode(value) ? callYieldedLiteral({ node: value, readNode: value, seen: new Set(), ctx })?.literal : value;
  return ALWAYS_TRUTHY_OBJECT_NODES.has(unwrapRuntimeExpr(yielded)?.type);
}

// what a user selection decides in this build: `{ skip, fold, substituted }` - the operand key that
// never runs, what the selection yields, and whether pure respells the read deciding it - or null. a
// `||` / `??` its left decides (`deadFallbackRight`), else a test the build always answers
// (`presenceTestValue`), each read backed by the adapter's build (`servedRead`), so every canon asking
// decides alike. the usage visitors skip and fold by it, and the branch walk
// (`flattenFallbackBranches`) leaves out what never runs. a selection the user opted out of decides
// nothing: its line is left as written, a rest beside it included. a selection inside a spread or a for-of head
// is read as written (`[...(T ? [Array] : [Set])]`): the positional and head canons take no decision. a default on
// a slot the build always fills is no usage either, and a write in it none that runs (`defaultDroppedAsDead`): pure
// drops it with the pattern it rewrites. runtime-equal leftovers stay: a source `?.` over a subject folded to a
// never-nullish left keeps its dead guard; usage-pure keeps a realm key's leaf default where the leaf reads the realm
// raw, importing what it names (`{ JSON: J = DOMException } = globalThis`); usage-global loads what a receiver default
// under a selection of containers names (`slotValueProvablyDefined`); a read, alias or escape of a decided selection
// imports its live constructor's namespace entry, and usage-global may load the dead arm's family for an escape - the
// census keeps every arm, and the escape census runs before the decisions it feeds
export function decidedSelection(node, ctx) {
  if (!SELECTION_TEST_FIELDS[node?.type] || ctx.adapter?.isOptedOut?.(node)) return null;
  const fallback = node.type === 'LogicalExpression' ? deadFallbackRight(node, ctx) : null;
  return fallback ? { skip: 'right', fold: 'left', substituted: fallback.substituted } : presenceDecision(node, ctx);
}

// does this build drop this default as dead: its slot never reads `undefined`, so nothing in it runs - like the
// dead part of a decided selection it is no usage, and a write in it reaches no read (`writeNeverRuns`). pure
// drops the default of a leaf off a declaration's or an assignment's own value whose static or global the build
// serves as its ponyfill's import (`{ from = shim } = Array`, `{ Map: M = shim } = globalThis`): the render writes
// the import alone, to a binding or to a member target it admits. a realm key's default dies wherever the realm
// always fills its slot (`realmKeyDefaultDead`): usage-global keeps the source over it, and pure reads the slot off
// the literal its mirror fills or the ponyfill a level flattens to - save in a consumed assignment's value, which
// keeps reading the realm itself, a slot pure installs nothing into. usage-global keeps the source over a served
// static's slot as well (`servedStaticSlotDefaultDead`). any other default stays: pure keeps one on a static it does
// not serve (one the user patches, a constructor whose entry the user excludes), on a line the user opted out, on
// another host or another leaf - and on a SELECTION's value (`fromFallback`), whose other arm may lack the static
// (`{ from = shim } = c ? Array : Set`)
export function defaultDroppedAsDead(defaultPath, { adapter, resolvePure }) {
  if (adapter?.method === 'usage-global') {
    return realmKeyDefaultDead(defaultPath, adapter) || servedStaticSlotDefaultDead(defaultPath, adapter);
  }
  if (adapter?.method !== 'usage-pure') return false;
  if (realmKeyDefaultDead(defaultPath, adapter) && !destructureAssignmentValueIsCaptured(defaultPath)) return true;
  const prop = defaultPath.parentPath;
  if (!isPropertyNode(prop?.node) || prop.node.value !== defaultPath.node || adapter.isOptedOut?.(prop.node)) return false;
  const keyPath = prop.get('key');
  if (defaultPath.node.left?.type !== 'Identifier' && !memberTargetTakesExtraction(defaultPath.node)) return false;
  const { descriptor, meta } = destructurePropLeafMeta({
    prop: prop.node, objectPattern: prop.parentPath, scope: keyPath.scope, path: keyPath, adapter, resolvePure,
  });
  const host = descriptor.path?.node;
  if (descriptor.host !== 'init' || (host?.type !== 'AssignmentExpression' && !host?.init)
    || meta?.placement !== 'static' || !meta.object || meta.guardedAliasHint || meta.fromFallback) return false;
  const served = POSSIBLE_GLOBAL_OBJECTS.has(meta.object) ? { kind: 'global', name: meta.key } : meta;
  return adapter.served?.(served, keyPath)?.substituted === true;
}

// is the default on a realm KEY dead - a level's (`{ Map: { groupBy } = Set } = globalThis`) or a leaf's (`{ Map: M =
// Set } = globalThis`): read off a receiver that is the realm on every path, the key's slot is one the realm always
// fills (`realmLevelNamesCtor`), so the default never runs and, like the dead part of a decided selection, is no
// usage. a parameter's realm default stands in for a caller's object, which may lack the slot, and a line the user
// opted out of decides nothing. only a key the catalogue knows as a built-in walks the receiver
function realmKeyDefaultDead(defaultPath, adapter) {
  const prop = defaultPath.parentPath;
  return isPropertyNode(prop?.node) && prop.node.value === defaultPath.node && isKnownGlobalName(propertyKeyName(prop.node) ?? '')
    && !adapter?.isOptedOut?.(prop.node) && !!computeNestedDestructureReceiver(prop, adapter, { certain: true });
}

// ... and the default on a STATIC's slot in usage-global (`{ from = shim } = Array`): the receiver names the
// static's constructor on every path - the host's own value, through an alias no write reaches the read by
// (`readsReachedAlias`), or the realm key a nested level stands under (`{ Array: { from = shim } } = globalThis`) -
// and the build serves the static, unreplaced by any write the census sees (`servedStaticBacking`). only a key some
// built-in owns as a static walks the receiver
function servedStaticSlotDefaultDead(defaultPath, adapter) {
  const prop = defaultPath.parentPath;
  const key = isPropertyNode(prop?.node) && prop.node.value === defaultPath.node ? propertyKeyName(prop.node) : null;
  if (!key || !hasStaticDefinitionKey(key) || adapter.isOptedOut?.(prop.node)) return false;
  const host = classifyDestructureLeafHost({ objectPattern: prop.parentPath });
  let object = null;
  if (host.host === 'nested') {
    object = computeNestedDestructureReceiver(host.outerProp, adapter, { certain: true, leafPattern: host.objectPattern });
  } else if (host.host === 'init' && host.initNode) {
    const ctx = { scope: host.scope, adapter, path: host.path };
    object = readsReachedAlias(host.initNode, ctx) ? null
      : resolveObjectName({ objectNode: host.initNode, ...ctx, usageNode: host.initNode });
  }
  return !!object && !POSSIBLE_GLOBAL_OBJECTS.has(object)
    && !!servedStaticBacking({ object, key, read: prop.node, ctx: { scope: prop.scope, adapter, path: prop } });
}

// the receiver name + proxy flag back the passthrough rendering: a proxy reads through the injected
// `_globalThis`, a bare constructor through its own name (`Array.isArray`), and - where the caller
// allows it (`containerName`, a for-x head's element) - a bound CONTAINER through its own name (`w[1]`)
// ... a global's name read where the literal stands, as that place spells it (`globalReceiverRead`)
function mirrorReceiverDescriptor(ctxNode, leafPatternPath, adapter, { containerName = false } = {}) {
  const ctx = { scope: leafPatternPath.scope, adapter, path: leafPatternPath };
  const global = resolveObjectName({ objectNode: ctxNode, ...ctx });
  const container = !global && containerName && ctxNode?.type === 'Identifier' ? ctxNode.name : null;
  const name = global ?? container ?? staticContainerReceiverName({ node: ctxNode, ...ctx });
  const read = name && !container && isKnownGlobalName(name) ? globalReceiverRead(name, ctx) : { name, keys: [] };
  return { receiverName: read?.name ?? null, receiverIsProxy: POSSIBLE_GLOBAL_OBJECTS.has(read?.name), receiverKeys: read?.keys ?? [] };
}

// the spelling a re-read of the global `name` takes where it stands (`ctx`): the global's own name, or - where a
// binding there SHADOWS it (`function f(Map)` over `{ a: globalThis.Map }`) and holds the user's own value - the
// realm, the global its first key (`keys`); null where the realm's own name is shadowed as well
function globalReceiverRead(name, { scope, adapter, path }) {
  if (!adapter.hasBinding({ scope, name, path })) return { name, keys: [] };
  return adapter.hasBinding({ scope, name: 'globalThis', path }) ? null : { name: 'globalThis', keys: [name] };
}

// resolve a passthrough leaf's base reference. both bindings read it from here: the canon resolves
// what babel once left to a second visitor pass over its own re-emitted member access, and the two
// answers coincide by corpus. the resolution mirrors the natural injection: a MISSING-ABLE
// constructor (`Set`/`Map` - it has a pure constructor entry) IS the pure import: read the whole
// binding (`{ Set }` -> `_Set`) or a property off it
// (`{ Set: { union } }` -> `_Set.union`). the property lives on the pure constructor even when not declared
// in the built-in definitions (`_Set.union` is a static), so this INJECTS the polyfill - matching usage-
// pure's own `globalThis.Set.union` -> `_Set.union` resolution. NEVER a native read / optional chain: that
// throws off-engine, mis-values, and emits ES2020 syntax into an (often ES5) target - except the RAW leaf
// a plan judged polyfillable but non-consumable (`raw`, below), which reads as the source did. an ALWAYS-PRESENT ctor
// (`Array`/`Math` - no constructor polyfill) reads natively: a proxy receiver anchors on its pure proxy
// import WHEN it has one (`globalThis`/`self` -> `_globalThis`/`_self`), else stays bare (`window`/`global`
// are not polyfilled in pure -> `window.Array.isArray`); a bare ctor receiver reads through its own name
// (`Array.isArray`). `resolveGlobalPolyfill` is emitter-supplied (`{ entry, hintName }` or null). a
// constructor's pure answer names it in `ctor`, the name a slot dispatching off it asks (`instanceHopDispatch`).
// `read` (`{ node, path }`) is the read of the receiver's slots where the caller holds it: a slot it reads
// before every write of it is the build's (`isMutatedStatic`)
export function resolvePassthroughRef({
  keyPath,
  receiverName,
  receiverIsProxy,
  resolveGlobalPolyfill,
  adapter = null,
  resolveStaticPolyfill = null,
  escapedCtor = false,
  raw = false,
  read = null,
}) {
  // a leading run of PRISTINE PROXY-GLOBAL keys is pure navigation: each names the realm the level
  // it sits on already names, so it FOLDS into the anchor instead of being re-read by name - the
  // innermost such key wins and the path resumes past it, the nav canon's own answer (a nav rooted
  // in a proxy global names the ponyfill it stands for). the fold is not a spelling preference: the
  // name a re-read walks is the very one that proxy's ponyfill exists to SUPPLY, so a realm without
  // it throws where the source read a surface the anchor already holds - and shedding the realm is
  // what replacing the receiver was for. `raw` asks nothing of it: raw decides whether the LEAF
  // resolves, not which realm anchors the read. a proxy carrying no pure entry (`window` / `global`)
  // is no anchor to fold onto and stays a key, and so does a MUTATED one - there the user's own
  // replacement is the value, exactly as a mutated ctor slot keeps its raw proxy member below
  let anchorName = receiverName;
  let keys = keyPath;
  if (receiverIsProxy) {
    while (resolveGlobalPolyfill(anchorName) && keys.length
      && POSSIBLE_GLOBAL_OBJECTS.has(keys[0]) && resolveGlobalPolyfill(keys[0])
      && !adapter?.isMutatedStatic?.(anchorName, keys[0], read)) {
      [anchorName] = keys;
      keys = keys.slice(1);
    }
  }
  const path = receiverIsProxy ? keys : [anchorName, ...keys];
  // a RAW leaf - a polyfillable static the plan judged non-consumable (a member target, which the
  // raw canon keeps) - reads off the receiver as the source did: never the static's ponyfill (that
  // would install it into the user's object), and never through the ctor's pure binding either -
  // the `*/constructor` entry carries none of its statics (`_Promise.race` reads `undefined`)
  // a MUTATED ctor slot must render as the raw proxy member (`_globalThis.Set` - the user's
  // shim wins), matching babel's mutation-aware visitor delegation
  const ctorMutated = receiverIsProxy && !!adapter?.isMutatedStatic?.(anchorName, path[0], read);
  // ... and a nav REACHING a polyfillable static of that constructor reads the static's own
  // ponyfill, whether or not the constructor has a pure entry of its own (`globalThis.Array.of`
  // and `Array.of` alike are `_Array$of`, never a raw read off the realm), with whatever the nav
  // spells BEYOND it read off that ponyfill - the member canon's own answer for the same spelling
  // (`globalThis.Object.keys.name`). a mutated slot keeps the user's own value on the raw read
  if (resolveStaticPolyfill && !ctorMutated && !raw && path.length >= 2 && isStaticPlacement(path[0])
    && !adapter?.isMutatedStatic?.(path[0], path[1], read)) {
    const staticPure = resolveStaticPolyfill(path[0], path[1]);
    if (staticPure) return { pure: staticPure, path: path.slice(2), static: true };
  }
  // an ESCAPING leaf resolves its OWN key, not the path's root: the verdict was taken for that leaf,
  // and a proxy HOP above it (`{ self: { Map } }`) would otherwise render `_self.Map` for a later
  // member pass to collapse - a member this render synthesizes, which no position names, so the
  // entry is lost there. a mutated key keeps the user's replacement on the raw read
  const leafEscaped = escapedCtor && !ctorMutated && !raw ? resolveGlobalPolyfill(keys.at(-1)) : null;
  if (leafEscaped) return { pure: leafEscaped, path: [] };
  // `raw` keeps a polyfillable STATIC on the receiver the source read it off, which is a claim about
  // the leaf and about the key BELOW the constructor - never about the constructor itself. where the
  // path IS that constructor the missing-able rule stands: the pure import is the value, and reading
  // it off the realm instead (`_self.Symbol`) is `undefined` in exactly the realms core-js supplies it
  const ctorPure = ctorMutated || (raw && path.length > 1) ? null : resolveGlobalPolyfill(path[0]);
  if (ctorPure) return { pure: ctorPure, ctor: path[0], path: path.slice(1) };
  const proxyPure = receiverIsProxy && resolveGlobalPolyfill(anchorName);
  return proxyPure ? { pure: proxyPure, path } : { name: anchorName, path: keys };
}

// the stable per-property SLOT key both emitters register and look polyfills up under: the
// resolved static name where one exists, else the slot notation. asked with scope, so a
// WELL-KNOWN-SYMBOL key answers the same whichever spelling the tree carries at the moment
// (`[Symbol.iterator]` before an emitter's key swap, `[_Symbol$iterator]` after it) - the two
// legs register at different points of that swap and must still meet on one key
export function synthPropDedupKey(prop, { scope, path, adapter }) {
  const wks = prop.computed ? computedKeyWellKnownSymbolName({ keyNode: prop.key, scope, adapter, path }) : null;
  if (wks !== null) return `[@@${ wks }]`;
  const { lookupKey, slotKey } = resolveSynthKeys({ node: prop, scope, adapter, path });
  if (!slotKey || (!lookupKey && !/^\[[$a-z_][\w$]*\]$/i.test(slotKey))) return null;
  // ... a key named by SCOPE alone (no structural slot: a bound identity call) collapses onto the slot
  // its resolved name spells, as a folded string spelling of that name does; a bound-identifier key
  // keeps its own `[k]` slot beside the plain spelling, the literal carrying both
  const name = synthSlotName(prop) ?? (synthSwapPropKey(prop) === null && typeof lookupKey === 'string' ? lookupKey : null);
  // Quote names in the map's reserved namespaces; quote-prefixed names must escape too,
  // so a user's quoted string cannot collide with the encoding of a bracket-prefixed name.
  return name === null ? slotKey : name[0] === '[' || name[0] === '"' ? JSON.stringify(name) : name;
}

// the pattern's synth render plan, computed once per pending: one entry per distinct
// SLOT (duplicate spellings of one static name collapse - `{ of, ['of']: x }` reads one
// property), with the first occurrence's spelling and the lookup name for passthrough
export function buildPatternRenderPlan(patternNode, { scope, path, adapter }) {
  const keys = [];
  const seen = new Set();
  for (const prop of patternNode.properties) {
    // both dialects reach this plan: babel spells a destructure prop `ObjectProperty`, estree
    // `Property`; anything else (a rest) has no slot to render
    if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') return null;
    const { lookupKey: resolvedKey, slotKey } = resolveSynthKeys({ node: prop, scope, adapter, path });
    // which well-known symbol the key names, whatever spelling it wears (`[Symbol.iterator]`,
    // a user alias `[s]`, the swapped `[_Symbol$iterator]`) - the value side reads by symbol
    const wks = prop.computed
      ? computedKeyWellKnownSymbolName({ keyNode: prop.key, scope, adapter, path }) : null;
    // ... and only the RAW member spelling has to be re-spelled: the literal cannot clone it
    // (that read throws off-engine where the pattern's own swapped key reads the polyfill),
    // so the slot takes the injected pure symbol binding. every Identifier spelling clones
    // as it stands. a raw member whose `Symbol` is SHADOWED names no symbol - decline whole
    const wksSpelling = prop.computed ? wksComputedKeyName(prop.key) : null;
    if (wksSpelling !== null && wks === null) return null;
    // a BOUND-identifier computed key (`[X]`) never folds, but the literal replays it
    // verbatim and the passthrough reads computed (`[X]: Array[X]`) - the bracket slot
    // is its own lookup marker
    const lookupKey = resolvedKey ?? (slotKey && /^\[[$a-z_][\w$]*\]$/i.test(slotKey) ? slotKey : null);
    if (!lookupKey || !slotKey) return null;
    const dedupKey = synthPropDedupKey(prop, { scope, path, adapter });
    if (!dedupKey) return null;
    if (seen.has(dedupKey)) continue;
    seen.add(dedupKey);
    // an SE-free computed key keeps its SOURCE spelling in the literal (`['from']: _X`);
    // an SE-bearing one folds to the resolved string (the effect cannot re-run); a wks key
    // spells the injected symbol binding, so it carries no source key node
    const sourceKey = prop.computed
      && (computedKeyHasSideEffects(prop, { scope, adapter, path }) || wksSpelling !== null) ? null : prop.key;
    keys.push({
      dedupKey,
      lookupKey,
      // a key on an opted-out line takes no polyfill: the literal reads it as the source does
      optedOut: !!adapter?.isOptedOut?.(prop),
      // the prop itself: a renderer deciding what its SLOT spells (a pattern value that descends,
      // a binding that does not) reads the shape off the source node rather than re-walking for it
      prop,
      get keyNode() { return sourceKey ? prop.key : null; },
      slotKey,
      computedKey: prop.computed && !!sourceKey,
      wks,
      wksSpelling,
    });
  }
  return keys;
}

// The proxy root and named hops of a receiver navigation. Leading pristine realm hops
// are redundant; the final hop remains available to the passthrough's entry selection.
// Flat and nested declaration reads use the same source/guard shape proof.
export function proxyNavHead(receiver, { adapter, guardCtx = null }) {
  const { root, keys: navKeys } = navHopChain(receiver, guardCtx);
  let keys = navKeys;
  if (!keys.length || keys.some(key => !key) || root?.type !== 'Identifier' || !POSSIBLE_GLOBAL_OBJECTS.has(root.name)) return null;
  while (keys.length > 1 && isPristineProxyGlobal(adapter, keys[0])) keys = keys.slice(1);
  return { rootName: root.name, keys };
}

// the BASE a nested hop chain reads through, shared by both emitters' extraction renders:
// a proxy-global root declines when its slot is MUTATED (the bare name holds the user's
// replacement, not the global), drops leading pristine proxy hops (pure navigation into the
// same surface), collapses an all-proxy chain onto the root's own pure import, and otherwise
// resolves through the passthrough canon. a BOUND root shadows the global name and reads raw -
// unless the binding is the alias this plugin minted for a global (`_globalThis`, `_Map` under an
// anchored residual, each hinted on its binding with the global it holds): that is the global under
// another name, read after the swap or the rebuild already ran, and it resolves as the global does -
// a static off a minted CTOR resolves by the ctor's NAME, which is what keeps the narrow constructor
// entry (no statics of its own) from being read through. `binding` is the root's binding, or null, and
// `read` the chain's read where the caller holds it (`resolvePassthroughRef`)
export function resolveNestedReceiverBase({
  rootName,
  keys,
  binding = null,
  adapter,
  resolveGlobalPolyfill,
  resolveStaticPolyfill = null,
  read = null,
}) {
  const hint = binding?.polyfillHint;
  const mintedGlobal = typeof hint === 'string' && !hint.includes('.') && isKnownGlobalName(hint) ? hint : null;
  // a bound root is the user's own binding whatever it is named - raw reads only: the
  // passthrough's ctor arm would otherwise resolve a shadowing `self`/`Map` to its pure entry.
  // a root with no name at all (the chain walk's call / `new` / member root) is the user's own
  // value the same way: the caller spells it, and the path is what this answers
  if ((binding && !mintedGlobal) || typeof rootName !== 'string') return { name: rootName ?? null, path: keys };
  // ... and the minted alias takes only a STATIC answer: the alias is a live binding of the global,
  // and every other read stays the raw one off it - the mutation-aware spelling the routes had
  // before the alias resolved at all (a MUTATED static under it must stay a live read)
  const raw = { name: rootName, path: keys };
  if (mintedGlobal) rootName = mintedGlobal;
  const rootIsProxy = POSSIBLE_GLOBAL_OBJECTS.has(rootName);
  let hopKeys = keys;
  if (rootIsProxy) {
    if (isMutatedGlobalSlot(adapter, rootName, read)) return mintedGlobal ? raw : null;
    while (hopKeys.length && isPristineProxyGlobal(adapter, hopKeys[0], read)) hopKeys = hopKeys.slice(1);
    if (!hopKeys.length) {
      const rootPure = resolveGlobalPolyfill(rootName);
      return mintedGlobal ? raw : rootPure ? { pure: rootPure, path: [] } : null;
    }
  }
  const resolved = resolvePassthroughRef({
    keyPath: hopKeys,
    receiverName: rootName,
    receiverIsProxy: rootIsProxy,
    resolveGlobalPolyfill,
    adapter,
    resolveStaticPolyfill,
    read,
  });
  if (mintedGlobal) return resolved?.static ? resolved : raw;
  return resolved;
}

// Apply each mirror target and skip its discarded subtree only after replacement succeeds.
// Probe, prefix and sole-expression targets keep their source live. Publish shared claims and static aliases
// only after every target lands; `fallbackOnBail` controls whether a bailed plan ends dispatch.
// `mintMemoRef`: the emitter allocates a ref in the MEMOIZED target's evaluation frame.
// The receiver runs into it ahead of the literal and passthroughs read off it. A parameter
// or field keeps the ref in a lexical expression activation; an absent allocator declines.
export function applyNestedParamSynthPlan({
  plan,
  renderTree,
  replaceTarget,
  skipSubtree,
  claimProperties = null,
  claimStaticBindings = null,
  fallbackOnBail = false,
  embed = cloneNode,
  mintMemoRef = null,
}) {
  if (!plan) return false;
  if (plan.done) return true;
  // un-mirrorable pattern with a non-proxy value branch: handled by leaving the destructure native
  // (no inline default that would corrupt the branch's legitimate undefined). nothing to render
  // A validated receiver capture can take over without assuming which branch supplied the value.
  // Retained native reads must not fall through to an inline default that assumes a realm source.
  // A DEAD default arm needs no fallback either: the slot it defends already holds a value.
  if (plan.bail) return !fallbackOnBail || plan.nativeReads || plan.defaultArm === 'dead';
  let replaced = 0;
  const collapsedSelections = new Set();
  for (const target of plan.targets) {
    const { node, tree, receiverName, receiverIsProxy } = target;
    const memoRef = target.memo ? mintMemoRef?.(target) ?? null : null;
    if (target.memo && !memoRef) continue;
    // a PROBE arm keeps the branch it decides, so the target carries `nullTestOn` / `keepArm` and the
    // BINDING re-spells the selection as a null test on the probe's own read - its own node factory,
    // at its own insertion boundary. swapped in place the arm would make an always-defined literal the
    // left operand and kill the fallback; left raw it reads the realm natively on every host that
    // spells the probe's name, which is the arm a browser takes
    if (!replaceTarget(node, renderTree(tree, {
      receiverName: memoRef ?? receiverName,
      receiverIsProxy: memoRef ? false : receiverIsProxy,
      receiverKeys: memoRef ? null : target.receiverKeys,
      receiverRead: memoRef ? null : target.receiverRead,
      receiverNode: target.receiverNode ? embed(target.receiverNode) : null,
      receiverPrefix: target.keepPrefix
        ? memoRef
          ? target.localMemo ? identifier(memoRef) : assignmentExpression('=', identifier(memoRef), embed(node))
          : embed(node) : null,
      coerceReceiver: target.coerceReceiver,
      preserveNullishReceiver: target.preserveNullishReceiver,
      preserveFalsyReceiver: target.preserveFalsyReceiver,
      ...target.localMemo ? { memoActivation: [memoRef], memoArguments: [embed(node)] } : {},
    }), target)) continue;
    // a null-test re-spelling KEEPS two of the source's own nodes - the probe it tests and the arm it
    // falls back to - so the skip would silence the visitor over reads that are still in the tree and
    // still owe their substitution (`globalThis.window` raw, where every other read is `_globalThis`)
    // ... and a KEPT PREFIX is the source's own node standing in the render, still owing every
    // substitution its reads owe (`globalThis.f()` in the element the mirror rode in front of)
    if (!target.nullTestOn && !target.keepPrefix && !target.receiverNode) skipSubtree(node);
    // ... and a selection the literal now decides gives way to its left, innermost first and once
    for (const selection of target.deadFallbacks ?? []) {
      if (collapsedSelections.has(selection)) continue;
      collapsedSelections.add(selection);
      skipSubtree(selection.right);
      replaceTarget(selection, selection.left, { host: target.host, slot: target.slot });
    }
    replaced += 1;
  }
  // ... and so does a dead default the literal fills the slot of: the rendered level reads the literal, and the
  // writes in the default leave with it
  if (replaced === plan.targets.length) {
    for (const node of plan.deadDefaults ?? []) {
      noteRenderRetiredWrites(node.right);
      skipSubtree(node.right);
      replaceTarget(node, node.left, { host: plan.patternHost, slot: null });
    }
  }
  if (replaced === plan.targets.length && plan.claimedProperties?.length) {
    // A parameter default serves its own receiver; a supplied object can still leave
    // the method undefined and execute the source's leaf default.
    claimProperties?.(plan.claimedProperties, plan.claimsAlwaysDefined !== false);
  }
  if (replaced === plan.targets.length && plan.staticBindings?.length) claimStaticBindings?.(plan.staticBindings);
  // A copied symbol read can still yield undefined. Its extraction is served, but its user's
  // default remains live and must receive its own rewrites.
  if (replaced === plan.targets.length && plan.readProperties?.length) claimProperties?.(plan.readProperties, false);
  return replaced > 0;
}

// per-outerProp memoization: sibling inner-Property visits under the same outer Property
// (`{X: {from, of, isArray}} = R` - 3 inner keys all walk through the same outer X) collapse
// from O(siblings*depth) to O(1) after the first. WeakMap keyed on outerProp.node auto-GCs
// with the program. Unresolved names are recomputed - transient null surfaces mid-rewrite (upstream
// polyfill import not yet flushed into the injector's hint table, so resolveObjectName fails
// on `_globalThis` and the leaf walk bails), then a later visit on the same outerProp
// resolves correctly; caching the null would lock in the bail. Positive names and guarded
// candidates are stable source facts, including when a capture relocates the same pattern.
const nestedReceiverCache = createInstanceNodeCache();

// the pattern a nested leaf reads its receiver off: the leaf's own where the caller names it, else the
// one under `outerProp`'s value, past a default wrapped around it
function innerDefaultLeafPattern(outerProp, leafPattern) {
  if (leafPattern) return leafPattern;
  const value = outerProp?.get?.('value');
  return value?.node?.type === 'AssignmentPattern' ? value.get('left') : value;
}

// the outer chain declined, but an inner DEFAULT carries a receiver of its own:
// `{ inner: { from } = Array }` reads `Array.from` exactly when the outer slot is undefined, which
// is exactly when a mirror of that default fires - so the receiver is resolvable after all, on any
// host. asked ONLY as a fallback: a chain that resolves means the default is dead code and the
// outer receiver is the real one (`{ Array: { from } = {} } = globalThis`)
// ... the leaf's NEAREST such default, at whatever level it stands: one ABOVE the leaf's own
// (`{ A: { B: { from } } = { B: Array } }`) reads its slots through the keys below it, the walk the
// container canon takes for a named container
// ... a SELECTION of containers there (`{ W: { C: { from } } = c ? { C: Array } : { C: Set } }`) walks
// the keys below through the container canon, which names the operand a decided one yields, the
// constructor every arm agrees on, or nothing - and feeds every live arm to a usage-global `unionSink`
function innerDefaultReceiverName(outerProp, adapter, leafPattern = null, unionSink = null) {
  const pattern = innerDefaultLeafPattern(outerProp, leafPattern);
  if (pattern?.node?.type !== 'ObjectPattern') return null;
  const hops = destructureHostThroughWrappers(pattern, adapter, true)?.hops;
  const at = hops ? hops.findLastIndex(hop => hop.defaultNode) : -1;
  if (at === -1) return null;
  const below = hops.slice(at + 1);
  const ctx = { scope: outerProp.scope, adapter, path: outerProp };
  const init = unwrapExpressionChain(hops[at].defaultNode);
  if (!init) return null;
  // a BRANCHY default the leaf reads directly (`= Array || Iterator`, `= c ? Array : Set`) declines here
  // on purpose: this channel answers with a receiver NAME, and a name cannot say "either branch". picking
  // one and mirroring it emits the wrong branch's static whenever the other one fires - the flat path can
  // afford these shapes only because its meta carries `fromFallback` and the emit enumerates arms
  if (!below.length && (init.type === 'LogicalExpression' || init.type === 'ConditionalExpression')) return null;
  // ... named the way the flat meta names a receiver: a slot of a container the default reads
  // (`= g().M`, `= ({ M: Map }).M`) is the container canon's, which the mirror context asks too
  if (!below.length) {
    return resolveObjectName({ objectNode: init, ...ctx, usageNode: outerProp.node })
      ?? staticContainerReceiverName({ node: init, ...ctx });
  }
  const walkPath = below.map(hop => hop.key ?? String(hop.index));
  if (below.some((hop, index) => hop.index !== undefined
    && !walksToArrayLevel({ receiverNode: init, walkPath: walkPath.slice(0, index), ...ctx }))) return null;
  return walkStaticReceiverChain({ receiverNode: init, walkPath, ...ctx, usageNode: outerProp.node, unionSink });
}

// `innerDefault: false` asks the chain ALONE - does the outer receiver name the constructor without
// the default's help, which is what makes the default dead. uncached: the cache holds the composed answer
// `leafPattern`: the pattern the leaf reads off, where array wrappers stand between it and
// `outerProp`'s slot (`{ k: [{ from }] }`) - those index the slot's level after the keys; the
// answer is then the leaf's own, and so is its cache entry
// `element`: one element of a for-x head over several, resolved in place of the host's receiver
// (uncached - the answer is that element's, not the leaf's)
// `slotStatics` (with `innerDefault: false`): the constructor a realm-key level names for the statics read off it,
// a default on the level aside (`liveSlotStaticMeta`) - or null
export function resolveNestedDestructureReceiver(outerProp, adapter, unionSink = null, {
  innerDefault = true, leafPattern = null, element = null, slotStatics = false,
} = {}) {
  if (!innerDefault || element) {
    return computeNestedDestructureReceiver(outerProp, adapter, { unionSink, leafPattern, element, slotStatics });
  }
  // the cache entry carries the container-slot union beside the name, so a cache hit replays
  // the alternatives into the caller's sink instead of silently dropping them
  const cacheNode = leafPattern?.node ?? outerProp.node;
  const cached = nestedReceiverCache.get(adapter, cacheNode);
  const union = cached ? [...cached.union] : [];
  let result = cached?.name ?? computeNestedDestructureReceiver(outerProp, adapter, { unionSink: union, leafPattern });
  if (!cached?.name && !result) {
    const defaultUnion = adapter.method === 'usage-global' ? [] : null;
    const fallback = innerDefaultReceiverName(outerProp, adapter, leafPattern, defaultUnion);
    const arms = fallback || defaultUnion?.length
      ? nearestInnerDefaultArms(innerDefaultLeafPattern(outerProp, leafPattern), adapter) : null;
    // ... a default the source provably never lets fire supplies nothing, and one it may leave firing
    // answers the arm that takes it alone: where the source may supply the slot too, its value reaches
    // the read beside the default's, and no name speaks for it
    const dead = !!arms?.size && [...arms].every(verdict => verdict === 'dead');
    result = dead ? null : fallback;
    if (!dead && defaultUnion) for (const name of defaultUnion) if (!union.includes(name)) union.push(name);
    if (result && adapter.method === 'usage-global' && !(arms?.size && [...arms].every(verdict => verdict === 'born'))) {
      union.push(null);
    }
  }
  if (unionSink) for (const name of union) if (!unionSink.includes(name)) unionSink.push(name);
  if (!cached?.name && (result || union.length)) nestedReceiverCache.set(adapter, cacheNode, { name: result, union });
  return result;
}

// resolve a conditional-receiver BRANCH / operand to the global-proxy name it references, or null.
// peel chain / TS wrappers and any logical operands (the side actually yielded) and report the
// receiver name only when it is a POSSIBLE_GLOBAL_OBJECTS alias. shared predicate, combined per
// caller: the EMIT flatten plan requires it on BOTH ternary branches (agreement -> collapse to a
// single polyfill binding), while the DETECTION accepts it on EITHER (a proxy on any reachable
// branch makes the leaf a polyfill candidate; the mirror then renders per branch).
// `||` / `??` follow the LEFT operand; with `eitherLogicalOperand` (DETECTION only) a non-proxy
// left falls back to the RIGHT - the runtime may yield either operand, so `m || globalThis`
// buried in a ternary branch still marks the leaf. the EMIT plan keeps the strict left-only
// walk: it collapses to a single binding, so a diverging `||` must stay native, not flatten
export function resolveBranchProxyName({ branchNode, scope, adapter, path, eitherLogicalOperand = false }) {
  let branch = unwrapExpressionChain(branchNode);
  while (branch) {
    // A decided guard contributes its yielded operand, never its dead proxy arm.
    const live = decidedSelectionValue(branch, { scope, adapter, path });
    if (live !== branch) {
      branch = unwrapExpressionChain(live);
      continue;
    }
    // a chain assignment evaluates to its RHS - DETECTION follows the value so the leaf is
    // marked (usage-global injects; the pure mirror substitutes the raw global in place,
    // keeping the assignment). the EMIT plan must NOT see through it: its flatten discards
    // the init slot, and a branch-buried assignment is not harvested - agreement through a
    // chain assignment would drop the write, so the strict walk bails to native instead
    if (eitherLogicalOperand && isChainAssignment(branch)) {
      branch = unwrapExpressionChain(branch.right);
      continue;
    }
    if (branch.type !== 'LogicalExpression') break;
    if (eitherLogicalOperand && branch.operator !== '&&') {
      return resolveBranchProxyName({ branchNode: branch.left, scope, adapter, path, eitherLogicalOperand })
        ?? resolveBranchProxyName({ branchNode: branch.right, scope, adapter, path, eitherLogicalOperand });
    }
    branch = unwrapExpressionChain(branch.operator === '&&' ? branch.right : branch.left);
  }
  if (!branch) return null;
  // the branch is READ where it is spelled: anchor the alias-walk's write-dominance checks at the
  // branch node itself, not at whatever the host path happens to be (a write between the two must
  // not flip the captured value)
  return asProxyGlobalName(resolveObjectName({ objectNode: branch, scope, adapter, path, usageNode: branch }));
}

// where a hop LEAVES its pattern for a twin of its own: the innermost level above the leaf that keeps
// siblings, the prop the hop occupies there, and the chain of levels from it up to the host (each
// with the prop holding it in its parent, null at the host) for pruning what empties. a level BELOW
// the host re-reads the root for its siblings, which only a built-in root affords (`builtInRoot`),
// and its reads are unobservable, so the pair stands behind the host whatever the hop's position -
// the one order both legs reach, whichever siblings their routes already took. a USER root re-reads
// for free at the host only, and its reads keep the source's order: the hop stands at an END there,
// the pair ahead of the host where the hop led. null where every level above the leaf is sole
export function hopSplitPlan(walk, { builtInRoot }) {
  const { climbed } = walk;
  for (let index = 1; index < climbed.length; index++) {
    const level = climbed[index];
    if (level.pattern.properties.length <= 1) continue;
    const hopProp = climbed[index - 1].prop;
    const hopAt = level.pattern.properties.indexOf(hopProp);
    const atHost = level.prop === null;
    if (!builtInRoot && (!atHost || (hopAt !== 0 && hopAt !== level.pattern.properties.length - 1))) return null;
    return { hopProp, placeBefore: !builtInRoot && hopAt === 0, chain: climbed.slice(index) };
  }
  return null;
}

// the hop's prop leaves its level, which keeps the sibling the split was planned for (`hopSplitPlan`)
export function pruneHopFromLevels({ hopProp, chain }) {
  const [level] = chain;
  const at = level.pattern.properties.indexOf(hopProp);
  if (at !== -1) level.pattern.properties.splice(at, 1);
}

// shared branch-walk: do ALL reachable VALUE branches of a destructure receiver satisfy `isLeaf`? a
// single failing branch (a user-object ternary alternate / `||` operand) means a `= _polyfill` default
// could fire on its legitimate `undefined`, so the caller must bail there. `&&` yields its RIGHT (left
// is a guard), `||` / `??` either operand, a conditional both arms, a chain assignment its RHS value,
// a transparent IIFE its return; parens / sequences are peeled (babel uses `extra.parenthesized` so
// unwrapTransparentSeq is a no-op there - it only makes the oxc ParenthesizedExpression node match babel)
function allDestructureValueBranches(node, isLeaf, staticIsMutated = null) {
  while (true) {
    const { tail } = peelNestedSequenceExpressions(unwrapTransparentSeq(node));
    if (tail?.type === 'CallExpression' || tail?.type === 'OptionalCallExpression') {
      const inlined = peelZeroArgIifeReturn(tail, { staticIsMutated });
      if (inlined) {
        node = inlined;
        continue;
      }
    }
    if (isChainAssignment(tail)) {
      node = tail.right;
      continue;
    }
    if (tail?.type === 'ConditionalExpression') {
      return allDestructureValueBranches(tail.consequent, isLeaf, staticIsMutated) && allDestructureValueBranches(
        tail.alternate,
        isLeaf,
        staticIsMutated,
      );
    }
    if (tail?.type === 'LogicalExpression') {
      return tail.operator === '&&'
        ? allDestructureValueBranches(tail.right, isLeaf, staticIsMutated)
        : allDestructureValueBranches(
          tail.left,
          isLeaf,
          staticIsMutated,
        ) && allDestructureValueBranches(tail.right, isLeaf, staticIsMutated);
    }
    return isLeaf(tail);
  }
}

// a leaf is a PROXY when it is a bare global-object name or a proxy-hop member chain ending in one
// (name-based, mirroring the flatten plan's rootContext)
function isProxyGlobalLeaf(tail) {
  let n = tail;
  while ((n?.type === 'MemberExpression' || n?.type === 'OptionalMemberExpression') && !n.computed
    && n.property?.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(n.property.name)) n = n.object;
  return n?.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(n.name);
}

// do ALL reachable value branches resolve to a global proxy? a non-proxy branch means a `= _polyfill`
// default could fire on its legitimate `undefined`, so an un-mirrorable pattern must bail there
function destructureValueBranchesAllProxy(node, staticIsMutated = null) {
  return allDestructureValueBranches(node, isProxyGlobalLeaf, staticIsMutated);
}

// is a destructure init a selection of the realm that no single realm operand stands for
// (`realmSelectionCollapseOperand`, the flatten's answer): every value it yields is a proxy global or an
// `&&` guard - a nested pattern's hop read throws on that guard - or it stores a branch's own write. a
// nested claim under it keeps the init's one read as written, through the ordered capture
export function guardedRealmSelection(init, ctx) {
  const value = unwrapExpressionChain(peelChainAssignment(init).value);
  return !!getFallbackBranchSlots(value) && destructureValueBranchesAllProxy(
    value,
    ctx.adapter.isMutatedStaticSlot ?? ctx.adapter.isMutatedStatic,
  )
    && !realmSelectionCollapseOperand(value, ctx);
}

// is an inner default's right a value-bearing RECEIVER (every branch a bare Identifier / member chain,
// incl. logical / conditional fallbacks `= Array || Set`, `= c ? Array : Set`)? then THIS default is
// the host (`{ from } = Array || Set` reads `from` off whichever arm fires when the slot is undefined),
// not a transparent empty fallback (`{ from } = {}` - the real receiver lives further up the pattern)
export function destructureRightIsReceiver(node) {
  return allDestructureValueBranches(node, leaf => isReceiverShapedNode(leaf) || !!invocationNode(leaf));
}

// ... and does such a default NAME its receiver (`= Array`, `= globalThis.X`)? it fires under exactly
// the condition the outer slot leaves open; a literal (`= {}`, `= { w: Array }`) or a call names nothing
export function namedDefaultReceiver(node) {
  return isReceiverShapedNode(unwrapRuntimeExpr(node));
}

// the constructor a NESTED destructure leaf reads its static off, climbed from the outer property up
// through pattern keys and array-wrapper levels to the host and resolved down through the init:
// a proxy-global chain, a static container, or an array-wrapper alias followed to its literal
// (`unionSink` collects the other constructors a reassigned alias may hold along the way)
// `element`: the receiver to descend in place of the host's own - one ELEMENT of a for-x head over
// several, each of which carries a claim of its own (the object pattern's rule)
// `certain`: the realm's own slot alone, read off a receiver that is the realm on every path - a selection
// the walk would take one arm of, a slot a spread may shift and a container name nothing
// eslint-disable-next-line max-statements -- the climb, the wrapper descent and the key walk share one key list
function computeNestedDestructureReceiver(outerProp, adapter, {
  unionSink = null, leafPattern = null, element = null, slotStatics = false, certain = false,
} = {}) {
  // the levels between the host's receiver and the leaf, receiver-to-leaf and in the order the
  // runtime reads them: an object level's key, an ArrayPattern wrapper's index. the wrappers above a
  // pattern stand between it and the level above, so they go ahead of its key and behind the key
  // above - a wrapper INSIDE a key (`{ k: [{ from }] }`) descends after that key, where every index
  // collected ahead of every key read the host's slot at the wrong level. the wrappers between the
  // LEAF and the property whose slot they index come last, seeded from the leaf where it is given
  const hops = leafPattern ? peelDestructureWrappers(leafPattern).indices.map(index => ({ index })) : [];
  let cur = outerProp;
  for (;;) {
    const pattern = cur.parentPath;
    if (pattern?.node?.type !== 'ObjectPattern') return null;
    const key = sharedResolveKey({
      node: cur.node.key, computed: cur.node.computed, scope: pattern.scope, adapter,
      // a key that only folds PAST AN EFFECT still names the hop: the level keeps the hop the way a
      // rest sibling does (the hop retires to a sentinel, the key runs once where it stands), so the
      // fold keeps the key node and every flavor rewrites on the same name
      bailOnSideEffectKey: false, keepsKeyNode: true,
    });
    if (!key) return null;
    hops.unshift({ key });
    const { parent, indices } = peelDestructureWrappers(pattern);
    hops.unshift(...indices.map(index => ({ index })));
    // IDENTIFICATION uses the broad host predicate (same rationale as the array-wrapper
    // resolver): any assignment-destructure host and parameter defaults carry a receiver;
    // the pure flatten re-checks its own narrow host shape at emit
    // a PARAMETER pattern of an IIFE reads the call's argument at its index: that argument is the
    // slot the walk descends, spelled at the CALL (its scope and path anchor the resolution there)
    // ... through the array wrappers the peel stepped over: the PARAMETER the function lists is the
    // outermost pattern, and that is what the call site is asked about
    let paramPattern = pattern;
    while (paramPattern.parentPath?.node?.type === 'ArrayPattern') paramPattern = paramPattern.parentPath;
    const iifeSite = parent?.node && FN_NODE_TYPES.has(parent.node.type) ? findIifeCallSite(parent, paramPattern.node) : null;
    const hostPath = iifeSite ? iifeSite.callPath : parent;
    const hostScope = hostPath?.scope ?? parent?.scope;
    // the name channel reads a relocated head through to its element (the emit routes key on the
    // init as written and are not handed it)
    const slotNode = element ?? relocatedHeadElement(parent) ?? destructureReceiverNode(
      parent,
      paramPattern.node,
      adapter?.isMutatedStaticSlot ?? adapter?.isMutatedStatic,
    );
    // descend the init through each ArrayPattern wrapper at its recorded element index
    // (`[, { from }]` descends index 1, not a blind 0). thread scope/adapter/path so a const-bound
    // array-literal wrapper (`const wrapper = [{ a: Array }]; const [{ a: { from } }] = wrapper`)
    // dereferences to its init, mirroring resolveArrayWrapperedDestructureReceiver
    // the descended hop's `readNode` is the capture, exactly as in `resolveArrayWrapperedDestructureReceiver`:
    // a const-bound wrapper's leaf captured its value at the wrapper's declarator, so the leaf's
    // reassignment check must anchor THERE, not at the destructure host (a source write between
    // capture and destructure cannot change the captured value)
    // the wrappers OUTSIDE every key descend the host's slot element by element; a wrapper under a
    // key walks with the keys, as an index of the level that key reached
    const leadingIndices = hops.findIndex(hop => hop.index === undefined);
    const allIndices = hops.slice(0, leadingIndices).map(hop => hop.index);
    const keys = hops.slice(leadingIndices).map(hop => hop.key ?? String(hop.index));
    const descended = allIndices.length
      // thread the usage-global "inject-if-might" flag like the ArrayPattern-rooted sibling
      // (arrayWrapReceiverFromHost): a spread-shifted slot with one static candidate keeps the walk
      // going (over-inject, the safe direction) so this ObjectProperty-rooted nested path matches it
      ? descendArrayWrapperInit(
        { node: slotNode, ctx: { scope: hostScope, adapter, path: hostPath, resolveKey: sharedResolveKey } }, allIndices,
        { maybe: adapter?.method === 'usage-global' && !certain, unionSink, remainingKeys: keys },
      )
      : null;
    const receiverNode = allIndices.length ? descended?.node ?? null : slotNode;
    // the keys the descent consumed into a parameter-filled slot are walked already
    const walkKeys = keys.slice(descended?.consumedKeys ?? 0);
    if (receiverNode !== null) {
      // peel parens / chain / TS wrappers AND SE tail to a fixpoint so `(se(), R) as any`
      // (and nested combinations like `(se(), (R as any))`) all reach the receiver. without
      // this, TS-wrapped nested destructures bail the flatten path entirely even though the
      // runtime value is identical to the unwrapped form
      let init = unwrapExpressionChain(receiverNode);
      // DETECTION flags the leaf when ANY reachable operand / arm resolves to a global proxy: the
      // runtime may select it, making the keys global statics on that path, so the leaf is a
      // polyfill candidate. the EMIT plan decides the shape (an all-proxy selection flattens to
      // the polyfill binding, a diverging one mirrors per branch, a non-proxy branch stays native)
      const branchCtx = { scope: hostScope, adapter, path: hostPath, eitherLogicalOperand: true };
      // the selection whose proxy arm the walk below takes in place of the whole: its other arms still
      // hold containers of their own, which the usage-global union walks (`c ? globalThis : { Map: Object }`)
      let proxyArmSelection = null;
      // ... whether it may yield an arm that is no proxy (`c ? globalThis : shim`, `shim || globalThis`), and
      // whether the source keeps its value whole - a store above it, or an assignment host whose value is read
      let divergingSelection = false;
      let keptSelection = hostPath?.node?.type === 'AssignmentExpression' && !assignmentValueDiscarded(hostPath);
      // collapse the init for identification, mirroring the flat meta: `&&` takes its RIGHT
      // (the side yielded when taken); `||` / `??` takes whichever operand is a global proxy
      // (left primary, else the right fallback - so `m || globalThis` is recognised); a
      // transparent IIFE call inlines its return expression (`(() => m && globalThis)()`), and a selection
      // the build decides is the operand it always yields (`decidedSelectionValue`)
      for (let guard = 0; guard < 8 && init; guard++) {
        const live = decidedSelectionValue(init, { scope: hostScope, adapter, path: hostPath });
        if (live !== init) {
          init = unwrapExpressionChain(live);
          continue;
        }
        const inlined = peelZeroArgIifeReturn(init, { staticIsMutated: adapter.isMutatedStaticSlot ?? adapter.isMutatedStatic });
        if (inlined) {
          init = unwrapExpressionChain(inlined);
          continue;
        }
        if (init.type === 'AssignmentExpression' && init.operator === '=') {
          // a chain assignment evaluates to its RHS; the flatten rescues the assignment
          // WHOLE, so the RHS is never discarded - identification just follows the value
          if (!proxyArmSelection) keptSelection = true;
          init = unwrapExpressionChain(init.right);
          continue;
        }
        if (init.type === 'LogicalExpression') {
          if (certain) return null;
          if (init.operator === '&&') {
            init = unwrapExpressionChain(init.right);
            continue;
          }
          // `||` / `??`: the runtime yields the left (truthy) or the right fallback - the shared
          // predicate is asked of each side the way the ternary below asks it of each arm. the
          // left keeps its turn where it carries the proxy or where neither side does (a static
          // container still walks from there); only a proxy-less left of any spelling
          // (`m || globalThis`, `obj.p ?? globalThis`, `mk() || globalThis`) hands the walk to
          // the proxy-carrying right - unless that left is always truthy, which leaves the right dead
          const leftProxy = resolveBranchProxyName({ branchNode: init.left, ...branchCtx });
          const rightProxy = !leftProxy && resolveBranchProxyName({ branchNode: init.right, ...branchCtx });
          // ... and where neither side is one, the union walks both - a selection of containers
          // (`shim || { C: Array }`) reaches the right's slot as much as the left's - unless the left
          // always runs and yields (`fallbackRunningLeft`): the right is dead
          if (!leftProxy && !rightProxy && unionSink
            && !fallbackRunningLeft(init, { scope: hostScope, adapter, path: hostPath })) break;
          if (leftProxy || rightProxy) proxyArmSelection ??= init;
          const takesRight = rightProxy && !selectionLeftAlwaysTruthy({ node: init.left, scope: hostScope, adapter, path: hostPath });
          if (takesRight) divergingSelection = true;
          init = unwrapExpressionChain(takesRight ? init.right : init.left);
          continue;
        }
        break;
      }
      if (!init) return null;
      let receiver;
      if (init.type === 'ConditionalExpression') {
        if (certain) return null;
        const consequentProxy = resolveBranchProxyName({ branchNode: init.consequent, ...branchCtx });
        const alternateProxy = resolveBranchProxyName({ branchNode: init.alternate, ...branchCtx });
        receiver = consequentProxy || alternateProxy;
        // ... and arms that are no proxy still walk into the union, each through the keys below
        if (!receiver && !unionSink) return null;
        if (receiver) proxyArmSelection ??= init;
        if (!consequentProxy || !alternateProxy) divergingSelection = true;
      } else {
        receiver = resolveObjectName({
          objectNode: init, scope: descended?.ctx.scope ?? hostScope, adapter, path: hostPath,
          usageNode: descended?.readNode ?? hostPath.node,
        });
      }
      if (receiver && POSSIBLE_GLOBAL_OBJECTS.has(receiver)
          && walkKeys.slice(0, -1).every(k => isPristineProxyGlobal(adapter, k, { node: outerProp.node, path: outerProp }))) {
        // the leaf names a receiver only where the realm is known to carry a built-in under it:
        // any other key (`{ window: { foo } }`, a user global `{ A: { groupBy } = Map }`) is an
        // unknown slot, which leaves an inner default live - the fallback below reads it.
        // a mutated leaf slot holds the user's replacement - not the pristine ctor. a key whose level
        // carries a DEFAULT names it only where the slot is always filled (`realmLevelNamesCtor`): an
        // engine lacking any other global runs that default (`{ WeakRef: { of } = Array }`), and so
        // does a value the realm stands in for only as a DEFAULT - a parameter's or a level's above -
        // where the caller's own object may lack the slot (`f({})` of `f({ Map: { groupBy } = Object } = globalThis)`)
        const leaf = walkKeys.at(-1);
        if (proxyArmSelection && unionSink && adapter.method === 'usage-global') walkStaticReceiverChain({
          receiverNode: proxyArmSelection,
          walkPath: walkKeys,
          scope: descended?.ctx.scope ?? hostScope,
          adapter,
          path: hostPath,
          usageNode: descended?.readNode ?? null,
          unionSink,
        });
        const named = slotStatics ? isKnownStaticGlobal(leaf, adapter) : realmLevelNamesCtor(leaf, outerProp.node.value, adapter)
          && (outerProp.node.value?.type !== 'AssignmentPattern' || hostPath?.node?.type !== 'AssignmentPattern');
        if (!named || isMutatedGlobalSlot(adapter, leaf, { node: outerProp.node, path: outerProp })) return null;
        // a kept selection that may yield an arm no proxy names holds the constructor on its realm arm alone, and
        // no mirror may replace that arm: pure names it no receiver, and a native static owner becomes the
        // candidate of the identity guard over the captured hop, as it does through an alias of the selection
        if (divergingSelection && keptSelection && adapter.method === 'usage-pure') {
          unionSink?.push(...guardableSelectionArms([leaf], adapter).filter(name => !unionSink.includes(name)));
          return null;
        }
        return leaf;
      }
      if (slotStatics || certain) return null;
      // Anchor the read in the actual receiver slot: its value is captured before any pattern
      // defaults can reassign that binding. The host alone loses this evaluation-order proof.
      // The path also carries the TS-runtime lookup fallback for declare-bindings.
      const readPath = destructureReceiverSlot(hostPath?.node) ? hostPath.get(destructureReceiverSlot(hostPath.node)) : hostPath;
      const walkScope = descended?.ctx.scope ?? hostScope;
      const usageNode = descended?.readNode ?? null;
      // ... and an index among the keys walked reads an array LITERAL at its level, or nothing: the
      // walk spells it as a key, which an object level would answer where the source throws
      const walkHops = hops.slice(leadingIndices + (descended?.consumedKeys ?? 0));
      for (const [at, hop] of walkHops.entries()) {
        if (hop.index !== undefined && !walksToArrayLevel({
          receiverNode: init, walkPath: walkKeys.slice(0, at), scope: walkScope, adapter, path: readPath, usageNode,
        })) return null;
      }
      return walkStaticReceiverChain({
        receiverNode: init,
        walkPath: walkKeys,
        scope: walkScope,
        adapter,
        path: readPath,
        usageNode,
        unionSink,
        // A rest-bearing pattern keeps the getter read in place; only its static leaf
        // gains a fallback. Naming that receiver does not authorize dropping the read.
        navKeys: hasObjectRestAncestor(outerProp) ? walkKeys.length : 0,
        // a DECLARATION and an ASSIGNMENT host both replay a discarded receiver read on both legs -
        // the emptied-init rescue and the emptied-pattern one - so a value only an object-literal
        // GETTER could name is answerable under either. every other host (a parameter default, a
        // loop head) drops the read with the text, so there the getter keeps its refusal
        rescuesReceiverRead: hostPath?.node?.type === 'VariableDeclarator'
          || hostPath?.node?.type === 'AssignmentExpression',
      });
    }
    const parentType = parent?.node?.type;
    if (parentType !== 'Property' && parentType !== 'ObjectProperty') return null;
    cur = parent;
  }
}

// --- the destructure funnel choke: ONE host classification and ONE meta rule for both legs ---

// the HOPS from a nested pattern up to the pattern its host destructures directly, receiver-to-leaf
// (an object hop's `key` - a bound computed key folded where `adapter` is given - an array wrapper's
// `index`), with that host pattern - the levels an instance mirror descends to reach the slot a
// nested leaf reads. null past a key nothing names or an inner default: those levels belong to the
// plan that owns them. the HOST is the mirror's admission, asked by both legs: a default whose left
// the climb ends on (a parameter's, a property's or an element's - the mirror replaces the value it
// pairs) or a function whose parameter it ends on (an IIFE argument pairs there); any other is null
export function patternHopKeysToHost(patternPath, adapter = null) {
  const hops = [];
  let cur = patternPath;
  for (let guard = 0; guard < STATIC_WALK_DEPTH && cur?.node; guard++) {
    const owner = cur.parentPath;
    const ownerType = owner?.node?.type;
    if (ownerType === 'ArrayPattern') {
      const index = owner.node.elements.indexOf(cur.node);
      if (index === -1) return null;
      hops.unshift({ index });
      cur = owner;
      continue;
    }
    if (ownerType !== 'Property' && ownerType !== 'ObjectProperty') {
      if (!hops.length || !(ownerType === 'AssignmentPattern' ? owner.node.left === cur.node
        : FUNCTION_LIKE_NODE_TYPES.has(ownerType) && owner.node.params?.includes(cur.node))) return null;
      return { hops, hostPattern: cur, host: owner };
    }
    // a bound computed key folds through the consuming canon where an adapter is at hand
    const key = consumableHopSlotName(owner.node, adapter ? { scope: owner.scope ?? patternPath.scope, adapter, path: owner } : null);
    if (typeof key !== 'string') return null;
    hops.unshift({ key });
    cur = owner.parentPath;
    if (cur?.node?.type !== 'ObjectPattern') return null;
  }
  return null;
}

// descend a receiver PATH through those hops: every object level a literal PAIRING the key on the
// resolver's terms (the slot before any spread, no key after it that could BE this one), every array
// level a literal holding the element at its runtime position (an inline-array spread expanded, a
// spread of a binding ahead shifts it - null) - the paired VALUE's path, or null. both legs' paths
// answer `get('properties')` / `get('elements')` with a list and `get('value')`
// with the slot, so one descent serves the two emitters; transparent wrappers are stepped through, and a
// value the build decides or a sequence spells at any level to the operand of it that runs
// (`decidedRunningOperandPath`)
export function descendReceiverPathByKeys(path, hops, adapter) {
  let cur = path;
  for (const hop of hops) {
    cur = decidedRunningOperandPath(cur, adapter);
    const node = cur?.node;
    if (hop.index !== undefined) {
      cur = node?.type === 'ArrayExpression' ? positionalElementPath(
        cur,
        hop.index,
        adapter?.isMutatedStaticSlot ?? adapter?.isMutatedStatic,
      ) : null;
      if (!cur) return null;
    } else {
      if (node?.type !== 'ObjectExpression') return null;
      const match = findObjectKeyBeforeSpread(node.properties, prop => spelledSlotName(prop) === hop.key);
      if (!match || node.properties.slice(node.properties.indexOf(match) + 1)
        .some(prop => spelledSlotName(prop) === null)) return null;
      cur = cur.get('properties')[node.properties.indexOf(match)]?.get('value');
    }
    if (!cur?.node) return null;
  }
  cur = decidedRunningOperandPath(cur, adapter);
  return cur?.node ? cur : null;
}

// a for-x HEAD over SEVERAL elements has no single receiver: each element carries its own static
// claim, which the head mirror rechecks per element - the init arm's rule, for the nested and the
// array-wrapped leaf alike. `resolveElement` names the leaf's constructor off one element; the first
// element whose static resolves to a pure entry answers in the pure flavor, while usage-global keeps
// the union of the elements: each one's constructor joins the `unionSink` the leaf's union reads
function headElementsStaticMeta({ elements, resolveElement, key, adapter, resolvePure, objectPattern, unionSink = null }) {
  if (!key || !(elements?.length > 1)) return null;
  if (adapter.method === 'usage-global') {
    for (const element of elements) {
      const named = resolveElement(element);
      if (named && unionSink && !unionSink.includes(named)) unionSink.push(named);
    }
    return null;
  }
  if (adapter.method !== 'usage-pure' || !resolvePure) return null;
  for (const element of elements) {
    const named = resolveElement(element);
    if (!named || adapter.isMutatedStatic?.(named, key)) continue;
    const meta = importedStaticReadMeta({
      objectPattern,
      adapter,
      meta: { kind: 'property', object: named, key, placement: 'static', receiverHint: staticReceiverHint('static', named) },
    });
    const pure = meta?.placement === 'static' && resolvePure(meta);
    if (pure && pure.kind !== 'instance') return meta;
  }
  return null;
}

// a leaf under ARRAY WRAPPERS: the array channel where the wrappers stand on the host, the nested
// one where they stand under a KEY (`{ k: [{ from }] }`) - what they index is that key's level, and
// the nested walk reads it as one more hop after the key
function arrayWrappedLeafHost(objectPattern) {
  const { parent } = peelDestructureWrappers(objectPattern);
  return parent?.node?.type === 'Property' || parent?.node?.type === 'ObjectProperty'
    ? { host: 'nested', outerProp: parent, objectPattern } : { host: 'array', objectPattern };
}

// Classify an ObjectPattern leaf's host for both emitters: initializer, parameter default,
// nested property, array wrapper, IIFE argument or parameter requiring a caller census.
// Known loop elements use the init route; unresolved loop heads, rest and catch stay opaque.
// `host: 'none'` means the path is not a supported destructure leaf.
export function classifyDestructureLeafHost({ objectPattern }) {
  const parent = objectPattern?.parentPath;
  const parentNode = parent?.node;
  if (!parentNode) return { host: 'none' };
  switch (parentNode.type) {
    case 'VariableDeclarator':
      // the RECEIVER through the canon, not the slot: a for-x head declarator holds no init, and what
      // it destructures is an element of the iterated literal. reading `.init` here left the head's
      // every flat claim typeless (`object: null`), which no receiver-shaped route can answer
      // ... and a head the emitters already RELOCATED reads the same element through its minted
      // name: the declarator now HAS an init (the `_ref` identifier), so the receiver canon stops
      // there and every claim left in the moved pattern resolves typeless. the identity twin the
      // name channel pairs answers it, ahead of the slot
      return {
        host: 'init',
        initNode: ownRelocatedHeadElement(parent) ?? destructureReceiverNode(parent),
        scope: parent.scope ?? objectPattern.scope,
        path: parent,
      };
    case 'AssignmentExpression':
      return { host: 'init', initNode: ownRelocatedHeadElement(parent) ?? parentNode.right,
        scope: parent.scope ?? objectPattern.scope, path: parent };
    case 'AssignmentPattern': {
      // the DIRECT param default routes the fallback-receiver policy; a default nested in the
      // parameter's pattern is the level's, read as a declaration's is: the slot the walk reaches
      // first, its default the arm an empty slot takes (`{ Map: { groupBy } = Set } = globalThis`),
      // and a transparent one (`= {}`) carries no receiver at all
      if (isFunctionParamDestructureParent(objectPattern) && !isNestedDestructureDefault(parent)) {
        return { host: 'param-default', pattern: parent };
      }
      const outer = parentNode.left === objectPattern.node ? parent.parentPath : null;
      if (outer?.node?.type === 'Property' || outer?.node?.type === 'ObjectProperty') {
        return { host: 'nested', outerProp: outer, objectPattern };
      }
      if (outer?.node?.type === 'ArrayPattern') return arrayWrappedLeafHost(objectPattern);
      return { host: 'opaque' };
    }
    case 'Property':
    case 'ObjectProperty':
      return { host: 'nested', outerProp: parent, objectPattern };
    case 'ArrayPattern':
      return arrayWrappedLeafHost(objectPattern);
    case 'ForOfStatement':
    case 'ForInStatement': {
      // a head with no declaration hosts the pattern DIRECTLY in `left` - the declarator case above,
      // one node higher: the receiver canon reads the iterated element for both, and a head no
      // literal spells (a for-in key, a bound iterable, a for-await) keeps the opaque verdict
      const element = destructureReceiverNode(parent, objectPattern.node);
      return element || forOfHeadIterableElements(parent)?.length
        ? { host: 'init', initNode: element, scope: parent.scope ?? objectPattern.scope, path: parent }
        : { host: 'opaque' };
    }
    case 'RestElement':
    case 'CatchClause':
      return { host: 'opaque' };
    default: {
      // IIFE destructuring (`!function({ entries }) {}(Object)`): the shared site finder
      // peels the wrapper chain AND enforces the callee-identity gate, so functions passed
      // as ARGS to another call never classify as IIFEs
      const site = findIifeCallSite(parent, objectPattern.node);
      if (site) return { host: 'iife', callPath: site.callPath, paramIndex: site.paramIndex };
      if (FUNCTION_LIKE_NODE_TYPES.has(parentNode.type) && parentNode.params?.includes(objectPattern.node)) {
        return { host: 'parameter', objectPattern };
      }
      return { host: 'none' };
    }
  }
}

// the pair the per-branch mirror reads for a wrapped leaf, kept only while it SELECTS: the mirror
// swaps an arm in place and leaves the level whole, so a spread or a key nothing names standing
// beside the slot cannot mislead it - where every other consumer of the pair would drop that level
function selectingMirrorPair(objectPattern) {
  const pair = resolveFallbackReceiver(objectPattern.parentPath, objectPattern.node)?.rhsNode;
  const value = unwrapTransparentSeq(pair);
  return value?.type === 'ConditionalExpression' || value?.type === 'LogicalExpression' ? pair : null;
}

// no constructor NAMED for a nested / array-wrapped leaf: the leaf reads the paired VALUE, and that
// value answers through the flat canon - ONE meta for `{ at } = g` and `{ w: { at } } = { w: g }`
// (the guarded-alias route with its write enumeration, the reachable union, the string literal's
// own type) where a typeless carrier fabricated rows the flat spelling never made. an unpaired
// slot asks the parameter's proven callers first (`parameterArgumentDestructureMeta`) and only then
// keeps the typeless carrier: the type engine reads those downstream
// the slot is read AS WRITTEN, prefix and all, the way the flat leaf hands its init over: the meta
// funnel owns the selection inside (`[{ from }] = [c ? Array : o]` flags its fallback exactly as
// `{ from } = c ? Array : o` does), and a walk that only answered a settled value left every
// selecting slot typeless - and the mirror unreachable - on both legs
function pairedBindingLeafMeta(objectPattern, { key, adapter, unionSink, resolveStaticKey, parameterCallSites, resolvePure }) {
  // the resolver climbs from a LEAF's parent, and the pattern is every leaf's parent: any of its
  // property paths is that leaf - a REAL path, since the key canon on the way asks the scope
  // through it (a bare `{ parentPath }` stand-in crashed babel's binding rebuild)
  const leaf = objectPattern ? cachedContainerPaths(objectPattern, 'properties')[0] : null;
  // Preserve a selection before asking for a settled receiver: one named arm cannot
  // stand for every branch. The mirror keeps the whole level, including later spreads or keys.
  const selecting = objectPattern ? selectingMirrorPair(objectPattern) : null;
  const paired = selecting ?? (leaf ? resolveNestedReceiverNode(leaf, { adapter, allowInitCarriedEffects: true }) : null);
  if (!paired) {
    return heldSelectionSlotGuardMeta(objectPattern, { key, adapter })
      ?? parameterArgumentDestructureMeta(objectPattern, { key, adapter, parameterCallSites, resolvePure })
      ?? { kind: 'property', object: null, key, placement: null };
  }
  const meta = buildDestructuringInitMeta({
    initNode: paired, key, scope: objectPattern.scope, adapter, path: objectPattern, unionSink, resolveStaticKey,
  });
  // A selected arm names its value, not the winning container slot. Only the full slot proof
  // can replace that read; a later spread/key or a nullish arm retains its existing branch mirror.
  if (selecting && adapter.method === 'usage-pure' && meta?.object && meta.placement === 'static' && !meta.fromFallback) {
    const walked = destructureHostThroughWrappers(objectPattern, adapter, true);
    const receiver = walked && destructureReceiverNode(walked.host, null, adapter?.isMutatedStaticSlot ?? adapter?.isMutatedStatic);
    if (!receiver || !staticSlotProvesClaim({ leaf: receiver, hops: walked.hops, meta, adapter, path: walked.host })) {
      return { ...meta, fromFallback: true };
    }
  }
  return meta;
}

// the constructors a selection's arms name that the identity guard over it tests: those core-js leaves
// native (`NATIVE_STATIC_OWNERS`) - an arm it swaps whole reads its own statics - whose slot the file
// does not replace. ONE filter for the member channel and both destructure routes
export function guardableSelectionArms(arms, adapter) {
  return arms.filter(name => NATIVE_STATIC_OWNERS.has(name) && !isMutatedGlobalSlot(adapter, name));
}

// the guard meta of a nested leaf whose slot no single value pairs (`pairedBindingLeafMeta`) because the
// host holds a selection of containers through a binding (`const box = c ? { C: Map } : { C: Object };
// const { C: { groupBy } } = box`): one constructor per arm, the identity guard the flat spelling of the
// same read takes (`box.C`, the member arm of `buildDestructuringInitMetaCore`), over the receiver the
// nested capture holds. usage-pure only
function heldSelectionSlotGuardMeta(objectPattern, { key, adapter }) {
  if (adapter.method !== 'usage-pure' || !objectPattern) return null;
  const planHost = mirrorPlanHost(objectPattern, false, false, adapter.isMutatedStaticSlot ?? adapter.isMutatedStatic);
  const walked = destructureHostThroughWrappers(objectPattern, adapter, true);
  if (!planHost?.node || !walked?.hops?.length || walked.hops.some(hop => typeof hop.key !== 'string')) return null;
  const selectionArms = [];
  walkStaticReceiverChain({
    receiverNode: planHost.node,
    walkPath: walked.hops.map(hop => hop.key),
    scope: planHost.host.scope,
    adapter,
    path: planHost.host,
    selectionSink: selectionArms,
  });
  const guarded = guardableSelectionArms(selectionArms, adapter);
  return guarded.length ? {
    kind: 'property',
    object: null,
    key,
    placement: 'static',
    receiverHint: null,
    guardedAliasHint: guarded[0],
    guardedWriteObjects: guarded,
    guardOnly: true,
  } : null;
}

// a nested leaf whose host reads a selection of containers (`containerSelectionArms`) reads one arm's
// slot per pass: `{ C: { groupBy } } = c ? { C: Object } : { C: Map }` is the flat `{ groupBy } = c ?
// Object : Map` spelled through containers, so it takes that selection's `fromFallback` meta over the
// slots the mirror descent reaches, each of which has to name a constructor - and so does one whose
// level DEFAULT holds such a selection (`{ W: { C: { groupBy } } = c ? { C: Object } : { C: Map } }`),
// on a host no value spells too (a catch parameter: the default's walk alone answers, as in the plan).
// usage-pure only: the global union the nested walk collects already covers every arm, and a fallback
// meta would end it
function selectedContainerSlotMeta(objectPattern, { key, adapter, resolveStaticKey }) {
  if (adapter.method !== 'usage-pure') return null;
  const planHost = mirrorPlanHost(objectPattern, false, false, adapter.isMutatedStaticSlot ?? adapter.isMutatedStatic);
  if (planHost?.headElements) return null;
  const hostless = !planHost?.host || !planHost.node;
  const host = hostless ? objectPattern : planHost.host;
  const ctx = { scope: host.scope, adapter, path: host };
  const walked = destructureHostThroughWrappers(objectPattern, adapter, true);
  if ([planHost?.node, ...walked?.hops?.map(hop => hop.defaultNode) ?? []]
    .every(node => !node || !containerSelectionArms(levelLiteralThroughIife(node).literal, ctx))) return null;
  const slots = walked?.hops ? mirrorReceiverNodes({
    receiverSources: hostless ? [] : [planHost.node], hops: walked.hops, host, adapter, hostPattern: walked.pattern, hostless,
  })?.receiverNodes : null;
  const metas = (slots ?? []).map(slot => buildDestructuringInitMeta({ initNode: slot, key, ...ctx, resolveStaticKey }));
  if (metas.length < 2 || metas.some(meta => !meta?.object || meta.placement !== 'static')) return null;
  return fallbackDestructureMeta(metas[0], metas[1], adapter);
}

// a leaf under a realm-key level whose default stays live over a constructor core-js implements - under a parameter's
// realm default a caller's object stands in for - still reads that constructor where the realm holds it: a static of
// it the build serves is decided by its own entry, whatever the default, which answers only for the statics the build
// does not serve. usage-global keeps the source, where the default still runs on an empty slot: the slot's static
// joins the default's own there instead of replacing it
function liveSlotStaticMeta({ outerProp, objectPattern }, { key, read, adapter, resolvePure, own, unionSink }) {
  if (outerProp?.node?.value?.type !== 'AssignmentPattern') return null;
  const slot = resolveNestedDestructureReceiver(outerProp, adapter, null,
    { innerDefault: false, leafPattern: objectPattern, slotStatics: true });
  if (!slot || !resolveBuiltIn({ kind: 'global', name: slot })?.desc?.pure || adapter.isMutatedStatic?.(slot, key, read)) return null;
  // `slotStatic`: the slot answers for it, whatever the default - a route reading the default's receiver leaves it
  const meta = {
    kind: 'property',
    object: slot,
    key,
    placement: 'static',
    receiverHint: staticReceiverHint('static', slot),
    slotStatic: true,
  };
  const served = adapter.method === 'usage-pure' ? resolvePure?.(meta)?.kind === 'static'
    : adapter.defined?.(meta) !== false && resolveBuiltIn(meta)?.kind === 'static';
  if (!served) return null;
  // ... a default naming the slot's own constructor reads the same static (`= Map`)
  if (slot === own?.object) return { ...own, slotStatic: true };
  if (adapter.method === 'usage-pure' || !own?.object || !unionSink) return meta;
  if (!unionSink.includes(slot)) unionSink.push(slot);
  return null;
}

// ONE meta rule over the classified host - the same answer on either leg. the canonical
// fallbacks live here once: an unresolvable receiver yields a TYPELESS meta (`object:
// null`, the instance dispatcher's degrade - dropping the leaf instead lost the polyfill
// on one leg), and a mutated static yields NO meta on every host shape (the receiver then
// routes through the identifier machinery, so the patch and the read share one object)
export function buildDestructureLeafMeta({
  descriptor, key, adapter, resolvePure = null, unionSink = null, resolveStaticKey = null, parameterCallSites = null,
}) {
  const objectPattern = descriptor.objectPattern ?? (descriptor.host === 'param-default' ? descriptor.pattern.get('left') : null);
  if (adapter.method === 'usage-pure' && objectPattern
    && (patternHasRestReadBeforeNestedBinding(objectPattern.node, adapter)
      || hasObjectRestAncestor(objectPattern, pattern => patternHasRestReadBeforeNestedBinding(pattern, adapter)))) return null;
  // A replaced iterator may select a value unrelated to the array's stored slot.
  // Pure keeps that selection native; global still owes generic instance imports.
  if (objectPattern && adapter.isMutatedStatic?.('Array.prototype', 'Symbol.iterator')
    && destructureHostThroughWrappers(objectPattern, adapter, true)?.indices.length) {
    return adapter.method === 'usage-global' && key ? { kind: 'property', object: null, key, placement: null } : null;
  }
  // A selected constructor is only one possible receiver; retain the other arm's instance claims.
  if ((descriptor.host === 'nested' || descriptor.host === 'array') && selectingMirrorPair(objectPattern)) {
    return pairedBindingLeafMeta(objectPattern, { key, adapter, unionSink, resolveStaticKey, parameterCallSites, resolvePure });
  }
  // A known caller and the default can name different receivers. Global owes each selected
  // static even when the default already resolves; the caller census can then keep it local.
  const argumentMeta = adapter.method === 'usage-global' && unionSink && objectPattern
    ? parameterArgumentDestructureMeta(objectPattern, { key, adapter, parameterCallSites, resolvePure, unionSink }) : null;
  switch (descriptor.host) {
    case 'none':
      return null;
    case 'parameter': {
      const meta = argumentMeta
        ?? parameterArgumentDestructureMeta(descriptor.objectPattern, { key, adapter, parameterCallSites, resolvePure });
      // A receiver with no complete caller census still owes an instance dispatch. Pure may
      // capture that whole receiver at function entry; other shapes keep their native parameter.
      if (meta) return meta;
    }
    // break omitted
    case 'opaque':
      return key ? { kind: 'property', object: null, key, placement: null } : null;
    case 'init':
      if (!key) return null;
      // A mixed literal has no single receiver type. Each element can still carry its own
      // static claim: this meta reaches the head mirror, which rechecks every element.
      if (!descriptor.initNode && adapter.method === 'usage-pure' && resolvePure) {
        for (const element of forOfHeadIterableElements(descriptor.path) ?? []) {
          const meta = buildDestructuringInitMeta({
            initNode: element, key, scope: descriptor.scope, adapter, path: descriptor.path, resolveStaticKey,
          });
          const pure = meta?.placement === 'static' && resolvePure(meta);
          if (pure && pure.kind !== 'instance') return meta;
        }
      }
      return buildDestructuringInitMeta({
        initNode: descriptor.initNode, key, scope: descriptor.scope, adapter, path: descriptor.path, unionSink,
        resolveStaticKey,
      });
    case 'param-default': {
      if (!key) return null;
      const { pattern } = descriptor;
      // caller-arg wins over the default when it is a usable fallback receiver; a
      // non-receiver arg (notably `undefined`, where the runtime applies the default)
      // keeps the default. the winning call-arg evaluates AT THE CALL SITE - resolve it
      // against the call-site scope and path, or a param shadowing the arg's name would
      // swallow the receiver
      const site = resolveFallbackReceiver(pattern, pattern.node, adapter?.isMutatedStaticSlot ?? adapter?.isMutatedStatic);
      const argNode = site?.callPath ? unwrapSafeSequenceTail(site.rhsNode) : null;
      const receiverNode = chooseFallbackReceiverNode({
        argNode,
        defaultNode: pattern.node.right,
        objectPattern: pattern.node.left,
        scope: pattern.scope,
        adapter,
        path: pattern,
        resolvePure,
        argScope: site?.callPath?.scope ?? pattern.scope,
        argPath: site?.callPath ?? pattern,
      });
      const argWins = argNode !== null && receiverNode === argNode;
      const meta = buildDestructuringInitMeta({
        initNode: receiverNode,
        key,
        scope: argWins ? site.callPath.scope : pattern.scope,
        adapter,
        path: argWins ? site.callPath : pattern,
        unionSink,
        paramDefault: argWins ? { node: pattern.node.right, scope: pattern.scope, path: pattern } : null,
      });
      // An opaque default cannot authorize a rewrite, but a known caller can still supply
      // the static. This claim authorizes only that caller's argument mirror.
      if (meta && meta.object === null && !meta.fromFallback && !meta.guardOnly && !resolveBuiltIn(meta)) {
        return argumentMeta ?? parameterArgumentDestructureMeta(pattern.get('left'), {
          key, adapter, parameterCallSites, resolvePure,
        }) ?? meta;
      }
      return meta;
    }
    case 'nested': {
      const candidates = unionSink ?? [];
      const perElement = headElementsStaticMeta({
        elements: forOfHeadIterableElements(destructureHostThroughWrappers(descriptor.objectPattern, adapter, true)?.host),
        resolveElement: element => resolveNestedDestructureReceiver(descriptor.outerProp, adapter, null,
          { leafPattern: descriptor.objectPattern, element }),
        key,
        adapter,
        resolvePure,
        objectPattern: descriptor.objectPattern,
        unionSink,
      });
      if (perElement) return perElement;
      const constructor = resolveNestedDestructureReceiver(descriptor.outerProp, adapter, candidates,
        { leafPattern: descriptor.objectPattern });
      // a BRANCHING inner key rides a null-key carrier keeping the resolved receiver - the
      // union pairs the arm keys with it as statics
      if (!key) {
        return constructor !== null ? {
          kind: 'property', object: constructor, key: null, placement: 'static',
          receiverHint: staticReceiverHint('static', constructor),
        } : null;
      }
      // the leaf's own pattern reads the slot, ahead of a write of it or not
      const read = { node: descriptor.objectPattern.node, path: descriptor.objectPattern };
      if (constructor !== null && adapter.isMutatedStatic?.(constructor, key, read)) return null;
      const guarded = adapter.method === 'usage-pure' && constructor === null
        ? candidates.filter(name => !adapter.isMutatedStatic?.(name, key, read)) : [];
      if (guarded.length) return {
        kind: 'property',
        object: null,
        key,
        placement: 'static',
        receiverHint: null,
        guardedAliasHint: guarded[0],
        guardedWriteObjects: guarded,
        guardOnly: true,
      };
      // the receiver HINT rides along, the way the flat init meta carries it: without it a key the
      // resolved receiver does not have falls through to the placement-agnostic instance ladder and
      // the hop claims a dispatcher its flat twin never claims (`{ w: { at } } = { w: globalThis }`
      // answered `instance/at` where `{ at } = globalThis` answers nothing - and in usage-pure that
      // turns a binding the source leaves undefined into a function)
      const own = constructor !== null
        ? importedStaticReadMeta({ objectPattern: descriptor.objectPattern, adapter,
          meta: { kind: 'property', object: constructor, key, placement: 'static',
            receiverHint: staticReceiverHint('static', constructor) } })
        : selectedContainerSlotMeta(descriptor.objectPattern, { key, adapter, resolveStaticKey })
          ?? pairedBindingLeafMeta(descriptor.objectPattern, {
            key, adapter, unionSink, resolveStaticKey, parameterCallSites, resolvePure,
          });
      return liveSlotStaticMeta(descriptor, { key, read, adapter, resolvePure, own, unionSink }) ?? own;
    }
    case 'array': {
      if (!key) return null;
      const perElement = headElementsStaticMeta({
        elements: forOfHeadIterableElements(peelDestructureWrappers(descriptor.objectPattern).parent),
        resolveElement: element => resolveArrayWrapperedDestructureReceiver(descriptor.objectPattern, adapter, null, element),
        key,
        adapter,
        resolvePure,
        objectPattern: descriptor.objectPattern,
        unionSink,
      });
      if (perElement) return perElement;
      const constructor = resolveArrayWrapperedDestructureReceiver(descriptor.objectPattern, adapter, unionSink);
      if (constructor && adapter.isMutatedStatic?.(constructor, key)) return null;
      // the receiver HINT rides along here for the same reason it does in the nested arm above: a key
      // the resolved receiver does not have must not fall through to the instance ladder
      return constructor
        ? importedStaticReadMeta({
          objectPattern: descriptor.objectPattern,
          adapter,
          meta: { kind: 'property', object: constructor, key, placement: 'static',
            receiverHint: staticReceiverHint('static', constructor) },
        })
        : pairedBindingLeafMeta(descriptor.objectPattern, { key, adapter, unionSink, resolveStaticKey, parameterCallSites, resolvePure });
    }
    case 'iife': {
      if (!key) return null;
      const initNode = resolveCallArgument(
        descriptor.callPath.node.arguments ?? [],
        descriptor.paramIndex,
        adapter.isMutatedStaticSlot ?? adapter.isMutatedStatic,
      ) ?? null;
      return buildDestructuringInitMeta({ initNode, key, scope: descriptor.callPath.scope, adapter, path: descriptor.callPath, unionSink });
    }
  }
  return null;
}

// does a destructure key RUN code where it stands: a member target's setter, a nested pattern's reads,
// a default or a computed key that runs? a plain binding write only ever observes
export function destructureKeyRunsCode(item, ctx = null) {
  if (!isPropertyNode(item)) return true;
  if (computedKeyHasSideEffects(item, ctx)) return true;
  if (item.value?.type === 'AssignmentPattern' && mayHaveSideEffects(item.value.right, ctx)) return true;
  return patternSlotTarget(item.value)?.type !== 'Identifier';
}

// Delaying a paired read requires stable identity and the initializer-reach canon's no-TDZ proof.
function inertPairedLiteralRead(value, ctx) {
  const node = unwrapRuntimeExpr(value);
  if (node?.type !== 'Identifier') return node?.type !== 'ThisExpression'
    && isReusableReceiver(node, { interveningEffects: true, ctx });
  const binding = ctx?.adapter?.getBinding?.({ scope: ctx.scope, name: node.name, path: ctx.path, read: node });
  const declaration = bindingDeclarationPath(binding)?.node;
  return declaration?.type === 'VariableDeclarator' && isReReferenceableAcrossReads(node, ctx)
    && initializerReachesRead({ adapter: ctx.adapter, binding, declaratorNode: declaration, usagePath: ctx.path, usageNode: node });
}

// Split an object-pattern hop chain at its innermost binding when a computed key must stay
// between the outer reads and a leaf dispatch, or a guarded read needs the receiver's identity.
// Any effectful key on the way counts, not only the first leaf's: a plain read ahead of it runs
// before the key, which only the captured, level-split pattern keeps in order.
// A guard can supply its ancestor path to retain ordinary siblings at each outer level.
// The source outer pattern keeps its coercions,
// keys and getters; only the inner pattern moves onto the captured value. `allowArray`
// lets a retained capture delegate an array level to the positional capture planner.
// `plansLeaf`: the caller plans every leaf property on its own (one it cannot plan stays a
// native fragment), so a forced capture also admits a computed key, a defaulted binding or a
// member target beside the claim there; a nested pattern in the leaf level still declines.
// `leafKeyRuns` also splits where a leaf-level item runs code - a default, a member target - which
// an extraction behind its residual would overtake.
// A rest level captures whatever leads it - only an instance's inline leaf reads `leaf` - so a member
// claim there is written ahead of the rest copy, which a write into the copied object would change.
// `holdsReceiver`: the capture holds the receiver's one read - the host's value is read (the capture
// yields it) or a guarded realm selection throws there (`guardedRealmSelection`) - so the hop chain
// captures even without a key effect, a level with siblings split around its hop, and a member target
// the extraction canon admits may lead its leaf level.
// `hostRest`: the host level keeps its rest beside the hop it captures, both read by one pattern - a hop
// an effectful getter answers has no second read to spare for the rest's exclusion.
// `sharedLeaf`: a leaf level of several properties over sole hops shares one receiver,
// retaining declaration reads in order or fitting a host without a statement for the flat twin.
// `storedValue`: the init STORES the value it yields, and every other route would drop the store or
// read the slot again, so a leaf level of any size over sole hops captures off what the store keeps.
// `prop`, the claim, picks its own copy of a REPEATED hop key: both copies read one slot, so the
// other stays a sibling read of it. An ordered leaf write (`leafKeyRuns`, `holdsReceiver`) can select its
// own distinct hop, retaining every other hop as a native sibling around it.
// A claim kind admits only its own leaf: instance or effectful static. Anchored iterator slots keep their raw key read.
// An ordinary singleton leaf can pass its receiver directly to the final ordered read;
// defaults, computed keys and symbol or sibling reads keep their captured receiver.
// The ordinary instance consumer keeps kind unset for its existing hop selection and supplies
// entry/plansLeaf after rejecting statics. Other untyped callers supply no entry.
export function planNestedKeyedPatternCapture({
  pattern,
  init,
  force = false,
  ancestors: sourceAncestors = null,
  allowArray = false,
  plansLeaf = false,
  leafKeyRuns = false,
  holdsReceiver = false,
  sharedLeaf = false,
  storedValue = false,
  hostRest = false,
  prop: claim = null,
  kind = null,
  entry = null,
  anchored = false,
  ctx = null,
}) {
  if (!init || (kind !== null && (kind !== 'instance'
    && !(kind === 'static' && computedKeyHasSideEffects(claim, ctx))))
    || (entry === 'get-iterator-method' && anchored)) return null;
  const ancestors = [];
  let inner = pattern;
  if (force && sourceAncestors?.length) {
    for (const level of sourceAncestors) {
      if (level.pattern.properties.some(prop => prop.type === 'RestElement')) return null;
      ancestors.push(level);
      inner = level.prop.value;
    }
  }
  while (inner?.type === 'ObjectPattern') {
    if (force && inner.properties.length !== 1) break;
    if (inner.properties.some(prop => prop.type === 'RestElement') && !(hostRest && inner === pattern)) break;
    let nested = inner.properties.filter(prop => {
      const value = !force && prop.value?.type === 'AssignmentPattern' ? prop.value.left : prop.value;
      return value?.type === 'ObjectPattern' || (allowArray && value?.type === 'ArrayPattern');
    });
    if (nested.length > 1 && claim) {
      const own = nested.filter(prop => subtreeContainsNode(prop.value, claim));
      const key = own.length === 1 ? foldedPropertyKeyName(own[0]) : null;
      if (key !== null && (((leafKeyRuns || holdsReceiver) && kind !== 'instance')
        || nested.every(prop => foldedPropertyKeyName(prop) === key))) nested = own;
    }
    if (nested.length !== 1) break;
    const [prop] = nested;
    if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') return null;
    const defaultValue = !force && prop.value?.type === 'AssignmentPattern' ? prop.value : null;
    const value = defaultValue ? defaultValue.left : prop.value;
    if (value?.type !== 'ObjectPattern' && !(allowArray && value?.type === 'ArrayPattern')) break;
    ancestors.push({ pattern: inner, prop, defaultValue });
    inner = value;
  }
  const splitCapture = !hostRest
    && ancestors.some(level => level.pattern.properties.length > 1 || computedKeyHasSideEffects(level.prop, ctx));
  if (allowArray && inner?.type === 'ArrayPattern' && ancestors.length) {
    return { pattern, init, ancestors, leafPattern: inner, leaf: null, rest: false, splitCapture, ctx };
  }
  const leaf = inner?.properties?.[0];
  const rest = !force && inner?.properties?.at(-1)?.type === 'RestElement';
  // a member target beside the claim: one more native fragment of a forced capture
  function fragmentMember(item) {
    return force && plansLeaf && item !== claim && !!memberTargetTakesExtraction(item.value);
  }
  if (!ancestors.length || inner?.type !== 'ObjectPattern' || !inner.properties.length
    || (leaf?.type !== 'Property' && leaf?.type !== 'ObjectProperty')
    || !(rest || propBindingIdentifier(leaf.value) || fragmentMember(leaf)
      || (holdsReceiver && !force && memberTargetTakesExtraction(leaf.value)))
    || (force && inner.properties.some(prop => (prop.type !== 'Property' && prop.type !== 'ObjectProperty')
      || (plansLeaf ? patternSlotTarget(prop.value)?.type !== 'Identifier' && !fragmentMember(prop)
        : prop.computed || prop.value?.type !== 'Identifier')))
    || (!force && !rest && !hostRest && !(holdsReceiver
      || ((storedValue || (sharedLeaf && inner.properties.length > 1)) && ancestors.every(level => level.pattern.properties.length === 1)))
      && [...ancestors.flatMap(level => level.pattern.properties), ...inner.properties]
        .every(prop => !computedKeyHasSideEffects(prop, ctx))
      && !(leafKeyRuns && inner.properties.some(prop => destructureKeyRunsCode(prop, ctx))))) return null;
  if (kind !== null && !inner.properties.includes(claim)) return null;
  const inlineLeaf = plansLeaf && splitCapture && (kind === 'instance' || !force && kind === null)
    && !!entry && entry !== 'get-iterator-method'
    && inner.properties.length === 1 && leaf === claim && !leaf.computed && leaf.value.type === 'Identifier'
    && !rest && ancestors.every(level => !level.defaultValue && !level.prop.computed);
  let pairedRoot = null;
  let pairedInit = init;
  for (const level of inlineLeaf ? ancestors : []) {
    const root = unwrapRuntimeExpr(pairedInit);
    if (root?.type !== 'ObjectExpression' || level.pattern.properties[0] !== level.prop
      || patternHasAnyDefault(level.pattern)
      || root.properties.length !== level.pattern.properties.length
      || root.properties.some(item => !isPropertyNode(item)
        || item.computed && (computedKeyHasSideEffects(item, ctx) || foldedPropertyKeyName(item) === null)
        || objectPropertyReadValue(item) !== item.value
        || foldedPropertyKeyName(item) === '__proto__' && !item.computed && !item.shorthand)
      || level.pattern.properties.some(item => !isPropertyNode(item) || item.computed)
      || new Set(root.properties.map(foldedPropertyKeyName)).size !== root.properties.length
      || new Set(level.pattern.properties.map(foldedPropertyKeyName)).size !== level.pattern.properties.length) break;
    const pairs = new Map(level.pattern.properties.map(item => [item,
      objectLevelPairedProperty(root, foldedPropertyKeyName(item))?.read]));
    const selected = pairs.get(level.prop);
    if (!selected || !receiverPerformsEveryInitEffect(pairedInit, selected, ctx)
      || [...pairs].some(([item, value]) => !value || (item !== level.prop
        && !inertPairedLiteralRead(value, ctx)))) break;
    pairedRoot ??= new Map();
    for (const [prop, value] of pairs) pairedRoot.set(prop, value);
    pairedInit = selected;
  }
  return { pattern, init, ancestors, leafPattern: inner, leaf, rest, splitCapture, inlineLeaf, hostRest, ctx, pairedRoot };
}

// The ordered capture a nested claim takes (`planRetainedObjectCapture` renders it), or null: a static
// claim under a rest in its leaf level, on an assignment whose value is read (the capture yields it),
// under a guarded realm selection in any host (`guardedRealmSelection`: the capture keeps the read the
// guard throws at), or on a discarded assignment wherever a leaf-level item runs code and no leaf-level
// item is claimed yet (`isClaimedProp`); an instance claim where the chain splits. It writes the leaf
// level in source order, after every level above it. Under a guarded realm selection a hop's default is
// live - the guard reads it instead of the constructor - so a chain with one takes no capture.
// A declaration's static claim takes it off a constructor the build may inject: one the build is told
// not to inject is read like a constructor-less global, its statics extracted beside the rest.
// A flat instance key/default takes the ordered read without moving its forward references;
// every leaf binds a plain name, with no rest. Other flat targets keep their bound route.
// An instance capture over sole hops also takes a host whose value is read, a literal init whose
// effects no carried receiver performs, an init storing a value no
// global names whose slot no overwrite re-spells (`= kw = box`), and - unless it runs without its own
// var slot - a leaf level of several properties in a declaration or where the host holds no statement
// for the flat twin (a discarded sequence element, a bodyless slot).
export function orderedClaimCapture({
  pattern,
  init,
  prop,
  kind,
  entry = null,
  assignment,
  meta = null,
  hostPath = null,
  isClaimedProp = null,
  adapter = null,
  injectorState = null,
}) {
  if (!prop || !pattern?.properties) return null;
  if (pattern.properties.includes(prop)) return kind === 'instance' && entry && entry !== 'get-iterator-method'
    && (assignment || hostPath?.node?.type === 'VariableDeclarator')
    && pattern.properties.every(item => propBindingIdentifier(item.value))
    && patternPropReadsBindings({ prop, assignmentTarget: assignment,
      names: pattern.properties.slice(pattern.properties.indexOf(prop) + 1).map(item => propBindingIdentifier(item.value).name) })
    ? { flat: true } : null;
  const guardedRealm = kind === 'static' && guardedRealmSelection(init, { scope: hostPath?.scope, adapter, path: hostPath });
  if (kind === 'static' ? !(assignment || guardedRealm || hasConstructorEntry(meta?.object)
    && adapter?.available?.({ kind: 'global', name: meta.object }) !== false) || !meta?.object || meta.guardedAliasHint
    : kind !== 'instance' || entry === 'get-iterator-method'
      || (!assignment && hostPath?.node?.type !== 'VariableDeclarator')) return null;
  if (kind === 'static') {
    const discarded = assignment && !!hostPath && assignmentValueDiscarded(hostPath);
    const holdsReceiver = (assignment && !!hostPath && !discarded) || guardedRealm;
    const capture = planNestedKeyedPatternCapture({
      pattern,
      init,
      prop,
      leafKeyRuns: discarded,
      holdsReceiver,
      ctx: { scope: hostPath?.scope, adapter, path: hostPath },
    });
    if (!capture?.leafPattern.properties.includes(prop)
      || (guardedRealm && capture.ancestors.some(level => level.defaultValue))) return null;
    return capture.rest || holdsReceiver
      || (discarded && capture.leafPattern.properties.every(item => !isClaimedProp?.(item))) ? capture : null;
  }
  const retainsResult = assignment && !!hostPath && !assignmentValueDiscarded(hostPath);
  const statement = hostPath ? peelToExpressionStatement(hostPath)?.exprStmt : null;
  const sharedLeaf = !!hostPath && (!assignment || retainsResult || discardedSequenceElement(hostPath)
    || !!statement && isBodylessStatementSlot(statement.parentPath?.node, statement.node)) && !runsWithoutOwnVarSlot(hostPath);
  const ctx = { scope: hostPath?.scope, adapter, path: hostPath, injectorState };
  // A store in the init (`= kw = box`, behind a prefix too) keeps the value it installs; the hop is read
  // off it after the store. A stored global keeps its own channels, and an assignment's overwrite
  // re-spells a paired slot it can read twice behind the statement.
  const { prefix, tail } = peelNestedSequenceExpressions(init);
  const store = peelChainAssignment(tail).outer;
  const storeLeafPath = store && assignment && adapter && hostPath ? pathOfNode(hostPath, prop) : null;
  // A sole leaf cannot leave an effectful initializer behind its receiver read. Split patterns
  // already keep their ordered slots; a receiver carrying every init effect needs no capture.
  const effectInit = hostPath && soleChainToProp(pattern, prop) && mayHaveSideEffects(init, ctx)
    ? unwrapRuntimeExpr(tail) : null;
  // Ordinary statement hosts carry a sole receiver prefix through their flat extraction.
  // Assignments and loop initializers retain the capture needed to serve a nested user receiver.
  const effectLeaf = effectInit && (effectInit.type === 'ObjectExpression'
    || prefix.length && !isSeFreeMemberReceiver(effectInit)
      && (assignment || isForInitDeclaration(hostPath.parentPath?.parentPath?.node, hostPath.parentPath?.node)))
    ? pathOfNode(hostPath, prop) : null;
  const effectReceiver = effectLeaf && resolveNestedReceiverNode(effectLeaf,
    { allowSeFreeSingleRead: true, allowInitCarriedEffects: true, adapter });
  // Ordinary declarations can share a literal memo or repeat a source name. A prefix must
  // run before the capture, and a for initializer keeps the receiver in its own declarator.
  const retainsInit = !!effectLeaf && (prefix.length > 0 || !isReReferenceableReceiver(effectReceiver)
    || isForInitDeclaration(hostPath.parentPath?.parentPath?.node, hostPath.parentPath?.node))
    && !receiverPerformsEveryInitEffect(init, effectReceiver, ctx);
  // A mirrored iterator slot still owns its function leaf. Capture its single read before
  // the ordinary symbol route dispatches on it; defaults and several leaves keep that route's boundary.
  const symbolReceiver = !assignment && pattern.properties.length > 1 && prop.value?.type === 'Identifier'
    && pattern.properties.some(item => item.computed && item.value?.type === 'ObjectPattern'
      && item.value.properties.length === 1 && item.value.properties[0] === prop
      && computedKeyWellKnownSymbolName({ keyNode: item.key, ...ctx }) === 'iterator');
  // Keep this capture's untyped hop admission; the instance consumer supplies its final read.
  // An allocator-owned receiver already holds the root. Its branching declaration still splits
  // before a plain nested binding; defaults and quiet singleton chains keep their ordinary extraction.
  let capture = planNestedKeyedPatternCapture({
    pattern,
    init,
    prop,
    entry,
    plansLeaf: true,
    holdsReceiver: retainsResult || retainsInit || symbolReceiver
      || !assignment && sharedLeaf && prop.value?.type === 'Identifier' && init?.type === 'Identifier'
        && injectorState?.isOwnPassGeneratedName?.(init.name) && !soleChainToProp(pattern, prop)
      || assignment && pattern.properties.length > 1
      && (prefix.length > 0 || unwrapRuntimeExpr(tail)?.type !== 'ObjectExpression'
        || patternHasAnyDefault(pattern) || patternKeepsEffectfulKey(pattern, ctx)),
    sharedLeaf,
    storedValue: !!store && !!hostPath && !resolveObjectName({ objectNode: installedWriteValue(store), ...ctx })
      && !(storeLeafPath && isReReferenceableAcrossReads(resolveNestedReceiverNode(storeLeafPath,
        { allowSePeeledFragment: true, adapter }), ctx)),
    ctx,
  });
  // Refusing a second GetValue must retain the claim through the source's ordered slots.
  // The host walk supplies those slots; no receiver nav is invented for an opaque source.
  // A slot that runs code is one of them where a level above the claim's keeps another key
  // (`{ y: arr.flat(), o: 1 }`): the capture builds the literal once, where the source does,
  // and the claim reads the slot off it. Over sole hops the flat twin's memo reads it once.
  if (!capture && assignment && adapter && hostPath) {
    const leafPath = pathOfNode(hostPath, prop);
    const receiver = leafPath && !consumedAssignmentSlotDropsHost(leafPath)
      && (resolveNestedReceiverNode(leafPath, { allowSeFreeSingleRead: true, allowSePeeledFragment: true, adapter })
        ?? (consumedAssignmentSlotLevels(leafPath).levels.slice(1).some(level => level.props > 1)
          ? resolveNestedReceiverNode(leafPath, { allowSePeeledFragment: true, allowInitCarriedEffects: true, adapter }) : null));
    const root = unwrapRuntimeExpr(init);
    // An earlier queued claim already performs its paired source read. If every other
    // literal value is inert, the later claim does not need to retain the wrapper for it.
    const paired = isClaimedProp && root?.type === 'ObjectExpression'
      && root.properties.length === pattern.properties.length
      && root.properties.every((item, index) => isPropertyNode(item) && !item.computed
        && objectPropertyReadValue(item) === item.value && foldedPropertyKeyName(item) !== '__proto__'
        && isPropertyNode(pattern.properties[index]) && !pattern.properties[index].computed
        && foldedPropertyKeyName(item) === foldedPropertyKeyName(pattern.properties[index]))
      && new Set(root.properties.map(foldedPropertyKeyName)).size === root.properties.length;
    const reads = paired ? root.properties.filter(item => !inertPairedLiteralRead(item.value, ctx)) : [];
    const prior = reads.length === 1 ? root.properties.indexOf(reads[0]) : -1;
    const queuedRead = prior >= 0 && prior < pattern.properties.findIndex(item => subtreeContainsNode(item, prop))
      && patternFullyConsumed(pattern.properties[prior].value, isClaimedProp, ctx) ? reads[0] : null;
    const retainsRead = root?.type === 'ObjectExpression' && (root.properties.some(item => {
      const node = unwrapRuntimeExpr(item.value);
      return (node?.type === 'Identifier' || node?.type === 'ThisExpression')
        && item !== queuedRead && node !== receiver && !inertPairedLiteralRead(node, ctx);
    }) || !receiverPerformsEveryInitEffect(init, receiver, ctx));
    const hops = receiver && (!isReReferenceableAcrossReads(receiver, ctx) || retainsRead)
      ? destructureHostThroughWrappers(leafPath.parentPath, adapter)?.hops : null;
    if (hops?.length && hops.every(hop => hop.level.type === 'ObjectPattern' && !hop.defaultNode)) {
      capture = planNestedKeyedPatternCapture({
        pattern,
        init,
        force: true,
        plansLeaf: true,
        prop,
        kind,
        entry,
        ctx,
        ancestors: hops.map(hop => ({ pattern: hop.level,
          prop: hop.level.properties.find(item => item.value === hop.pattern) })),
      });
    }
  }
  // Several leaves under an iterator slot keep the symbol plan's native result pattern.
  if (!assignment && capture && (capture.leafPattern.properties.some(item => isClaimedProp?.(item))
    || capture.leafPattern.properties.length > 1 && capture.ancestors.some(level => level.prop.computed && computedKeyWellKnownSymbolName({
      keyNode: level.prop.key,
      scope: hostPath?.scope,
      path: hostPath,
      adapter,
    }) === 'iterator'))) return null;
  return capture?.leafPattern.properties.includes(prop) ? capture : null;
}

const claimOrderVerdicts = createInstanceNodeCache();
// Whether a destructure claim keeps its native read so the pattern's writes stay in source order
// (`orderBoundPatternProps`). Every property of the top pattern is decided at the first ask, off the
// tree as the source wrote it: a binding that rewrites the pattern or braces its statement as claims
// land must not make a later answer depend on which claim landed first. A verdict is kept by the
// property's source location, which a binding's clone carries, and read back from the claim funnel
// (`objectPattern`, with the funnel's own climb of it as `walked` where it made one) and from the
// flatten plan (`top`, with any path inside or at its host) alike
export function claimWriteOrderBound({
  prop,
  objectPattern = null,
  walked = null,
  top = null,
  path,
  adapter,
  resolvePure,
  resolveStaticKey = null,
}) {
  const key = prop.loc ?? prop;
  if (claimOrderVerdicts.has(adapter, key)) return claimOrderVerdicts.get(adapter, key);
  let host = null;
  let topPath;
  if (objectPattern) ({ host, hostPatternPath: topPath } = walked ?? destructureHostThroughWrappers(objectPattern, adapter, true) ?? {});
  else {
    for (let cur = path; cur?.node && !host; cur = cur.parentPath) {
      const { node } = cur;
      if (node.type === 'VariableDeclarator' ? node.id === top : node.left === top) host = cur;
    }
    topPath = host?.get(host.node.type === 'VariableDeclarator' ? 'id' : 'left');
  }
  if (!topPath?.node) return false;
  const pattern = topPath.node;
  const assignment = host.node?.type === 'AssignmentExpression' && host.node.left === pattern;
  const statement = assignment ? peelParenAndTSParentPath(host) : null;
  // only a host the extraction splits reorders: a parameter keeps its pattern and mirrors its default
  const splits = host.node.type === 'VariableDeclarator' || assignment || (isForXStatement(host.node) && host.node.left === pattern);
  const props = new Map();
  // ... and a level under an inner default is mirrored whole into that default
  const mirrored = new Set();
  (function collect(level, underDefault) {
    const defaulted = level?.node?.type === 'AssignmentPattern';
    const node = defaulted ? level.get('left') : level;
    if (node?.node?.type === 'ObjectPattern') {
      for (const item of cachedContainerPaths(node, 'properties')) {
        props.set(item.node, item);
        if (underDefault || defaulted) mirrored.add(item.node);
        collect(item.get(isRestProperty(item.node) ? 'argument' : 'value'), underDefault || defaulted);
      }
    } else if (node?.node?.type === 'ArrayPattern') {
      for (const element of cachedContainerPaths(node, 'elements')) {
        if (element.node) collect(element.node.type === 'RestElement' ? element.get('argument') : element, underDefault || defaulted);
      }
    }
  })(topPath, false);
  const claims = new Map();
  // each property's own claim, asked the way the funnel asks it
  function claimOf(node) {
    const item = props.get(node);
    if (!claims.has(node)) {
      const descriptor = item && isPropertyNode(node) && resolvePure
        ? classifyDestructureLeafHost({ objectPattern: item.parentPath }) : null;
      const name = descriptor && descriptor.host !== 'none' ? sharedResolveKey({
        node: node.key, computed: node.computed, scope: item.scope, adapter, path: item, resolveStaticKey, keepsKeyNode: true,
      }) : null;
      const meta = name === null ? null : buildDestructureLeafMeta({ descriptor, key: name, adapter, resolvePure, resolveStaticKey });
      const pure = meta ? resolvePure(meta, item) : null;
      claims.set(node, pure ? { meta, pure } : null);
    }
    return claims.get(node);
  }
  const bound = !splits ? new Set() : orderBoundPatternProps({
    top: pattern,
    ctx: { scope: topPath.scope, adapter, path: topPath },
    assignmentTarget: assignment || (isForXStatement(host.node) && host.node.left === pattern),
    segmented: assignment && !(statement?.node?.type === 'ExpressionStatement' && statementListOf(statement.parentPath?.node)),
    // a sibling written by its own extraction keeps its turn
    isClaim: node => !!claimOf(node),
    // ... and a claim the ordered capture takes keeps its level in source order: the route's own question
    isCaptured(node) {
      const claim = claimOf(node);
      return claim && orderedClaimCapture({
        pattern,
        init: host.node.init ?? host.node.right,
        prop: node,
        kind: claim.pure.kind,
        entry: claim.pure.entry,
        assignment,
        meta: claim.meta,
        hostPath: host,
        adapter,
      });
    },
  });
  // the write order binds claims only: a leaf with no polyfill keeps its meta for the receiver routes
  function verdict(node) {
    return bound.has(node) && !mirrored.has(node) && !!claimOf(node);
  }
  for (const node of props.keys()) claimOrderVerdicts.set(adapter, node.loc ?? node, verdict(node));
  return verdict(prop);
}

// is a NESTED leaf read through a hop that is an INSTANCE claim on its own receiver (`{ at: { name } } =
// arr`, `{ values: { name, email } = {} } = form`)? no route binds that hop's dispatch for the leaf to
// read: a flat twin spells the hop as a member read, which only a leg walking its own output again
// polyfills, and neither leg extracts the hop over a leaf with a claim of its own (`hopPatternLeafClaims`).
// so in usage-pure the leaf stays native, as the hop does. the key name answers most hops at once, and
// the claim is the hop's own, asked at the hop (a data key paired with a known value claims nothing)
function leafUnderInstanceHop(host, { scope, adapter, resolvePure }) {
  if (adapter.method !== 'usage-pure' || !resolvePure || host.host !== 'nested' || hopComposesSoleLeaf(host.outerProp)) return false;
  const hop = host.outerProp;
  const name = hop.node.computed ? null : plainSynthKeyName(hop.node.key);
  if (name !== null && !resolvePure({ kind: 'property', object: undefined, key: name, placement: 'prototype' })) return false;
  const { meta } = destructurePropLeafMeta({ prop: hop.node, objectPattern: hop.parentPath, scope, path: hop, adapter, resolvePure });
  return !!meta && resolvePure(meta, hop)?.kind === 'instance';
}

// ... the one hop both legs DO bind for its leaf: a hop with a default of its own, on the host's own
// pattern, holding that sole leaf - the leaf dispatch composes over the guarded hop dispatch
// (`_name((_ref = _at(arr)) === void 0 ? {} : _ref)`). the hop's own extraction asks it too
export function hopComposesSoleLeaf(hopPath) {
  return hopPath.node.value?.type === 'AssignmentPattern' && hopPath.node.value.left?.properties?.length === 1
    && classifyDestructureLeafHost({ objectPattern: hopPath.parentPath }).host !== 'nested';
}

// The claim funnel's view of one destructure PROP: its host classification (`descriptor` passes one
// the caller holds for this pattern), its key through the scope-aware canon - kept in place, so a key
// spelled through an identity call folds - and the meta rule above. `meta` is null where no
// destructure host owns the prop. Every asker takes this one path, so a sibling asked ahead of a
// reshaping route answers what its own claim will
export function destructurePropLeafMeta({
  prop,
  objectPattern,
  descriptor = null,
  scope,
  path,
  adapter,
  resolvePure = null,
  resolveStaticKey = null,
  parameterCallSites = null,
  unionSink = null,
}) {
  const host = descriptor ?? classifyDestructureLeafHost({ objectPattern });
  if (host.host === 'none' || leafUnderInstanceHop(host, { scope, adapter, resolvePure })) {
    return { descriptor: host, meta: null };
  }
  // one host climb serves both questions below
  let walked = null;
  // only a leaf standing under a key hop can share that hop's slot
  if (adapter.method === 'usage-pure' && host.host === 'nested') {
    walked = destructureHostThroughWrappers(objectPattern, adapter, true);
    const owner = walked?.host;
    const top = walked?.hostPatternPath?.node;
    const receivers = forOfHeadIterableElements(owner)
      ?? [(owner?.node?.type === 'VariableDeclarator' ? ownRelocatedHeadElement(owner) : null) ?? destructureReceiverNode(
        owner,
        top,
        adapter?.isMutatedStaticSlot ?? adapter?.isMutatedStatic,
      )];
    if (top && claimUnderSharedHopSlot({ top, receivers, prop, scope, adapter, path })) return { descriptor: host, meta: null };
  }
  if (adapter.method === 'usage-pure' && claimWriteOrderBound({ prop, objectPattern, walked, adapter, resolvePure, resolveStaticKey })) {
    return { descriptor: host, meta: null };
  }
  const key = sharedResolveKey({
    node: prop.key, computed: prop.computed, scope, adapter, path, resolveStaticKey, keepsKeyNode: true,
  });
  return { descriptor: host, meta: buildDestructureLeafMeta({
    descriptor: host, key, adapter, resolvePure, unionSink, resolveStaticKey, parameterCallSites,
  }) };
}
