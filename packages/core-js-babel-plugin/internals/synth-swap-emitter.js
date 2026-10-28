// receiver-targeted synth-swap pipeline. covers two detection shapes:
//   - param-default `function({p} = R) {}`: receiver = AssignmentPattern.right
//   - arrow IIFE `(({p}) => body)(R)`: receiver = CallExpression.arguments[i]
// receivers are accumulated as the visitor walks (`registerPolyfill` /
// `tryRegisterPerBranchSynth`) and drained at programExit (`apply`) once the polyfill
// set per receiver is final - swapping mid-traverse would route later sibling props to
// the partial synth and miss their polyfill. metadata is keyed on receiver AST node
// identity (WeakMap), so sibling plugins that move nodes (`transform-parameters`
// extracts param defaults to body var declarations) keep them resolvable: `apply` walks
// the program and looks up nodes by identity, finding receivers wherever they currently
// live - independent of whether ancestor paths got orphaned. clones (`t.cloneNode`)
// produce fresh identity and fragment the swap; coexistence with plugins that clone a
// common ancestor remains unsupported
import {
  planSynthReceiverActivation, renderSynthLiteral, renderSynthReplacement,
} from '@core-js/polyfill-provider/detect-usage/destructure-plan';
import {
  nestedSequenceValueSpelling,
  peelTransparentWrapperPath,
  isMemberWriteHost,
  isReceiverShapedNode,
  findIifeArgPath,
  unwrapSafeSequenceTailPath,
  isSynthSimpleObjectPattern,
  deleteHostAboveChain,
  unwrapRuntimeExpr,
  isDestructurePattern,
  POSSIBLE_GLOBAL_OBJECTS,
  bindingPolyfillHint,
  trustedIdentifierAliasWrite,
  peelChainAssignment,
  runtimeChainRoot,
  pathOfNode,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import {
  markReplacedReceiverSkipped,
  markSynthReceiverSkipped,
} from '@core-js/polyfill-provider/helpers/class-walk';
import {
  synthPropDedupKey,
  findSynthSwapReceiverPath,
  buildPatternRenderPlan,
  patternComputedKeysSynthSafe,
  undefinedArmEffectiveReceiver,
  classifyCallBranchForSynth,
  fallbackBranchSwapKeepsSelection,
  fallbackBranchWalk,
  isViableBranchForKey,
  instanceSynthSpellsReceiver,
} from '@core-js/polyfill-provider/detect-usage/destructure';
import estreeToBabel from './estree-to-babel.js';
import {
  chainExpression,
  hostSlot,
  renderMemoReadTarget,
  renderProxyReceiverPlan,
  renderClaimProbe,
} from '@core-js/polyfill-provider/render';
import {
  planMemoReadTarget,
  dispatchConsumesRun,
  planProxyReceiver,
  proxyRunLandingPure,
  shouldDropRescueReceiver,
} from '@core-js/polyfill-provider/detect-usage/members';
import {
  unbackedProxyHopKey,
  descendToChainRoot,
  discardRescueNodes,
  findProxyGlobal,
  maximalProxyGlobalHop,
  maximalProxyGlobalPrefix,
  keptProbeStore,
  navHasUnresolvableProxyHop,
  navValueCanShortCircuit,
  ownChainOptionalObjects,
  PROXY_HOP_VALUE_CARRIERS,
  proxyGlobalMemberCtorPure,
  proxyReceiverValueCanBeUndefined,
  resolveSynthKeys,
  peelReceiverSequenceTail,
  directClaimProbePlan,
  directClaimProbeEffects,
} from '@core-js/polyfill-provider/detect-usage/resolve';
import { disableDirectiveKind } from '@core-js/polyfill-provider/helpers/source-scan';

// does the run swallow a hop pure cannot back that reads a KEPT WRITE whose value the collapse
// cannot serve? a store whose value ends on a hop pure cannot back (`v = globalThis.window`) hands
// on the raw host read - the probe itself - and folding the run over it answers the ponyfill where
// the source reads the host. a store of the bare root, or of a navigation whose LEAF a pure entry
// backs (`v = ga.window?.self` - the collapse renders it as the guarded ponyfill), hands on a value
// the doctrine speaks for, and the hops over it fold like any other - whichever spelling roots the
// probe. hops BELOW the write live inside its own value and keep their own verdict, which the
// store canon spells (the unplugin leg's `proxyStoreIsSpellable` is this rule on its renders)
function runSwallowsStoreProbe(runNode, resolvePure) {
  for (let hop = runNode; hop?.type === 'MemberExpression' || hop?.type === 'OptionalMemberExpression';) {
    const inner = unwrapRuntimeExpr(hop.object);
    if (inner?.type !== 'AssignmentExpression') {
      hop = inner;
      continue;
    }
    if (!unbackedProxyHopKey(hop, resolvePure)) return false;
    // definedness of a sequence value is decided by its TAIL - the store canon's own peel
    const value = unwrapRuntimeExpr(peelReceiverSequenceTail(peelChainAssignment(inner).value ?? inner.right));
    if (value?.type === 'Identifier') return false;
    if (value?.type === 'MemberExpression' || value?.type === 'OptionalMemberExpression') {
      return unbackedProxyHopKey(value, resolvePure);
    }
    return true;
  }
  return false;
}

export default function createSynthSwapEmitter({
  adapter,
  injectPureImport,
  injector,
  resolvePure,
  skippedNodes,
  t,
}) {
  // receiver-node -> { entries: [{key, binding, ...}], applied: boolean }. one pending entry
  // collects ALL polyfill props destructured from the SAME receiver across sibling visits,
  // so `const { from, of } = Array; const { from: from2 } = Array;` builds ONE pending list
  // per Array-receiver-node and flushes via single apply() walk. multi-receiver invariant:
  // distinct AST receiver nodes (even semantically same global, like two `Array` Identifiers
  // at different source positions) MUST get distinct WeakMap keys - the receiver is the
  // node-identity key, not a string name. node-cloning sibling plugins MUST preserve receiver
  // identity through their transform; replacing the receiver node breaks the lookup at flush
  const synthSwapByReceiver = new WeakMap();
  // registrations not yet applied: `apply` is a whole-program walk probing EVERY node
  // against the WeakMap, so a file with nothing pending must skip it outright (the walk
  // runs twice per file - end of pre-traverse and programExit)
  let pendingSwapCount = 0;

  // path-iteration with inline-spread expansion + `unwrapSafeSequenceTailPath`. accepts both
  // ArrowFunctionExpression and FunctionExpression IIFE: arrow lacks `arguments`, function
  // has its own - swapping caller-arg with the synth `{key: _polyfill}` literal is observable
  // via `arguments[0]` only when body reads it (rare pattern). polyfill-always-wins contract
  // for usage-pure mode wins the trade-off vs preserving original arg in `arguments`.
  // locating the argument is the shared `findIifeArgPath` (call site + spread-expanding
  // coordinates); the shared trailing peel retains every prefix outside the replaced slot
  function detectIifeArgPath(wrapper, objectPattern) {
    const argPath = findIifeArgPath(wrapper, objectPattern.node, adapter?.isMutatedStaticSlot ?? adapter?.isMutatedStatic);
    return argPath ? unwrapSafeSequenceTailPath(argPath) : null;
  }

  // register a polyfill for a single key on a synth target. ensures the pending entry
  // exists, marks the receiver in `skippedNodes` (identifier visitor would race on the
  // same node and emit a parallel `_Receiver` import that gets dropped post-swap).
  // metadata is keyed on the receiver NODE (not path) so apply() locates the receiver
  // by walking the program - survives sibling-plugin moves that orphan the original path
  function registerPolyfill({
    targetPath, objectPatternPath, key, entry, hintName, callBranch = false, rescueSe = null, instance = false,
  }) {
    const receiver = targetPath.node;
    let pending = synthSwapByReceiver.get(receiver);
    const activation = pending ?? planSynthReceiverActivation({
      receiver, scope: targetPath.scope, adapter, path: targetPath, resolvePure,
    });
    const { synthGuard } = activation;
    // synth-swap owns the receiver chain - for proxy-global MemberExpression receivers
    // (`globalThis.Map`) walk down `.object` so inner Identifier visitors don't emit
    // `_globalThis` etc. into the range that synth-swap will replace.
    if (receiver.type === 'LogicalExpression') {
      // a fallback-logical default collapses to the literal; skip the parts the literal supplants - the
      // dead RIGHT operand (short-circuited away, its global would leak a dead import) and the resolved-
      // left TAIL receiver chain. the tail is skipped WHOLE (a spine-only skip stops at a tail sequence
      // and leaves its prefix's dropped globals - `(eff(), globalThis).Array` - to leak a dead import);
      // its harvested SE is re-exposed so the live left PREFIX (`([1].at(0), Array)`, an IIFE body's
      // globals) still polyfills in place, for apply() to harvest into the rescued leftSe sequence
      if (!synthGuard) {
        t.traverseFast(receiver.right, node => { skippedNodes.add(node); });
      }
      const keepSe = discardRescueNodes({
        node: receiver.left, scope: targetPath.scope, adapter, path: targetPath,
      });
      if (synthGuard) keepSe.push(synthGuard.probe);
      markReplacedReceiverSkipped({ receiver: receiver.left, keepSe, skippedNodes, walkNode: t.traverseFast });
    } else if ((receiver.type === 'MemberExpression' && !rescueSe && !synthGuard
      && !POSSIBLE_GLOBAL_OBJECTS.has(runtimeChainRoot(receiver)?.name)
      && !proxyGlobalMemberCtorPure({ receiver, aliasCtx: { scope: targetPath.scope, adapter, path: targetPath }, resolvePure })
      && !planProxyReceiver(receiver, { aliasCtx: { scope: targetPath.scope, adapter, path: targetPath }, resolvePure }))
      // ... and an INVOCATION or a literal an instance slot dispatches on: the literal spells it whole
      || (instance && instanceSynthSpellsReceiver(receiver))) {
      // a receiver over a literal or a name keeps its own inner claims live; one over the realm is
      // rendered through the proxy collapse whole, as the unplugin twin renders it
      skippedNodes.add(receiver);
    } else if (!rescueSe || shouldDropRescueReceiver(receiver)) {
      // case 3 (plain replace) + case 1 (rescue-drop): the synth literal supplants the receiver value
      // (a drop re-emits only its harvested SE ahead). skip the WHOLE receiver - a spine-only skip stops
      // at a sequence and leaves the prefix's dropped globals visible, injecting a dead `_globalThis`
      // import. the harvested SE is re-exposed so its globals still polyfill in the live tree before
      // apply clones them into the re-emitted prefix. keeps the import set identical to the unplugin emitter
      const keepSe = rescueSe || synthGuard ? discardRescueNodes({
        node: receiver, scope: targetPath.scope, adapter, path: targetPath,
      }) : [];
      if (synthGuard) keepSe.push(synthGuard.probe);
      markReplacedReceiverSkipped({ receiver, keepSe, skippedNodes, walkNode: t.traverseFast });
    } else markSynthReceiverSkipped(receiver, skippedNodes);
    if (!pending) {
      // Decide once on the source. Native slots keep child claims live until apply, while
      // the source identities decide which effects the read owns before any rewrite.
      const probeSource = receiver.type === 'LogicalExpression' ? receiver.left : receiver;
      const probePlan = directClaimProbePlan(probeSource, resolvePure,
        { scope: targetPath.scope, adapter, path: targetPath });
      const probeEffects = probePlan && directClaimProbeEffects({ decision: probePlan, node: null },
        discardRescueNodes({ node: probeSource, scope: targetPath.scope, adapter, path: targetPath }));
      const probeSlots = probePlan && new Map([
        ...probePlan.retained, ...probePlan.prefix ?? [], ...probePlan.alternateEffects ?? [], ...probeEffects.filter(Boolean),
      ].map(node => [node, pathOfNode(targetPath, node)]));
      // Keep the source slot decisions when a sibling extraction removes its property.
      // Their live key slots carry nested claims without reclassifying generated keys.
      pending = {
        entries: buildPatternRenderPlan(objectPatternPath.node, { scope: targetPath.scope, path: targetPath, adapter }) ?? [],
        polyfills: new Map(),
        callBranch,
        rescueSe,
        probePlan,
        probeEffects,
        probeSlots,
        ...activation,
        memoRead: callBranch ? planMemoReadTarget(probeSource, {
          aliasCtx: { scope: targetPath.scope, adapter, path: targetPath }, resolvePure,
        }) : null,
      };
      synthSwapByReceiver.set(receiver, pending);
      pendingSwapCount++;
    }
    pending.polyfills.set(key, { entry, hintName, instance });
  }

  // ConditionalExpression / LogicalExpression in destructure-receiver position
  // (`= cond ? Array : Set` / `= Array || Set`). when `meta.fromFallback` flags the
  // resolved meta as ambiguous (runtime picks per-call), try per-branch synth-swap so
  // each viable branch becomes its own `{key: _Branch$key}` literal. branches without
  // a viable polyfill stay raw - identifier visitor still emits `_Set` etc. via the
  // standard global rewrite, so user gets correct constructor at runtime
  function tryRegisterPerBranchSynth(rhsPath, prop, { undefinedArmFallback = null } = {}) {
    const objectPattern = prop.parentPath;
    // per-branch has no body-extract fallback, so it accepts static-literal computed keys (`['from']`)
    // and synths them rather than dropping the polyfill (resolveSynthKeys folds the key to its value).
    // a SIDE-EFFECTING computed key (`[(eff(), 'from')]`) is accepted too: synthSwapPropKey folds it to
    // its static `["from"]` slot (no effect in the synth literal) while the effect stays in the residual
    // LHS pattern and runs exactly once - so the proxy branch polyfills instead of bailing to native
    if (!objectPattern || !isSynthSimpleObjectPattern(objectPattern.node)) return false;
    // Unknown keys can overwrite a polyfilled sibling. The shared proof also recognizes
    // well-known symbols before and after the emitter replaces their spelling.
    if (!patternComputedKeysSynthSafe({
      objectPatternNode: objectPattern.node,
      scope: objectPattern.scope,
      adapter,
      path: objectPattern,
    })) return false;
    // a user-const computed key (`const k = 'from'; [k]`) resolves to its static name for the branch
    // viability lookup but registers under its synth SLOT key (`[k]`), so buildSynthLiteral emits
    // `[k]: _polyfill` instead of dropping the polyfill. the resolved value also polyfills a sibling-
    // aliasing computed key (`{ from, [k]: x }` with k='from' -> both get `_Array$from`), avoiding the
    // overwrite that dropped the shorthand polyfill. a dynamic key (lookupKey null) bails
    const { lookupKey } = resolveSynthKeys({ node: prop.node, scope: objectPattern.scope, adapter, path: prop });
    // the SLOT this branch registers under is the shared dedup key - the same one the render
    // plan looks the polyfill up by, and the same one the unplugin leg registers
    const slotKey = synthPropDedupKey(prop.node, { scope: objectPattern.scope, path: prop, adapter });
    if (!lookupKey || !slotKey) return false;
    // peel TS wrappers (`(cond ? A : B) as any`) so the conditional underneath reaches
    // the slot resolver. babel parser strips parens but keeps TSAsExpression / `!` as
    // first-class wrappers; createParens=true preserves ParenthesizedExpression too.
    // NOTE: do NOT peel chain-assignment here - `foo = cond ? A : B` is intentional
    // escape hatch (rewriting branches as synth literals would change `foo`'s runtime value)
    return registerBranchTreeForKey({
      branchPath: peelTransparentWrapperPath(rhsPath), objectPattern, lookupKey, slotKey, undefinedArmFallback,
    });
  }

  // recurse into nested ConditionalExpression / LogicalExpression branches so every leaf
  // gets per-branch synth-swap. `unwrapSafeSequenceTailPath` peels paren / TS / chain AND SE tail
  // so `(logCall(), cond ? A : B)` reaches the inner conditional, slot detection finds the
  // branches, and recursion registers each leaf. SE prefix stays in the AST around the
  // substitution target so side-effects run at runtime
  function registerBranchTreeForKey({ branchPath, objectPattern, lookupKey, slotKey, undefinedArmFallback = null }) {
    const peeled = unwrapSafeSequenceTailPath(branchPath);
    if (!peeled?.node) return false;
    const walk = fallbackBranchWalk(peeled.node, { scope: peeled.scope, adapter, path: peeled });
    if (walk) {
      let any = false;
      for (const slot of walk.slots) {
        // a value-selecting operand that can be nullish must not become an always-defined
        // literal - the swap would flip which branch runs (the shared predicate's contract).
        // the undefined-shaped arm under a live PARAM DEFAULT is the one exception: the
        // shared rule substitutes the default there (same branch, same value)
        if (!undefinedArmEffectiveReceiver({ branch: peeled.node[slot], paramDefaultNode: undefinedArmFallback })
          && !fallbackBranchSwapKeepsSelection({
            hostNode: peeled.node, slot, branchNode: peeled.node[slot], scope: peeled.scope, adapter, path: peeled, resolvePure,
          })) continue;
        if (registerBranchTreeForKey({
          branchPath: peeled.get(slot), objectPattern, lookupKey, slotKey, undefinedArmFallback,
        })) any = true;
      }
      // a selection whose left this walk mirrored gives way to that left, the dead right with it -
      // unless a swap owns the selection whole and replaces it later
      if (any && walk.deadRight && !synthSwapByReceiver.has(peeled.node)) {
        t.traverseFast(peeled.node.right, node => { skippedNodes.add(node); });
        peeled.replaceWith(peeled.node.left);
      }
      return any;
    }
    const branch = undefinedArmEffectiveReceiver({ branch: peeled.node, paramDefaultNode: undefinedArmFallback })
      ?? peeled.node;
    // `lookupKey` is the resolved static name (probes the branch for a polyfillable static);
    // `slotKey` is the shared dedup slot the polyfill is registered + looked up under
    const pure = isViableBranchForKey({ branch, key: lookupKey, scope: peeled.scope, adapter, resolvePure, path: peeled });
    if (!pure) return false;
    // call-branch policy (single fully-polyfilled key + SE rescue) lives in the shared
    // `classifyCallBranchForSynth`
    const callPolicy = classifyCallBranchForSynth({
      inner: peeled.node, scope: peeled.scope, adapter, path: peeled,
    });
    registerPolyfill({
      targetPath: peeled, objectPatternPath: objectPattern, key: slotKey,
      entry: pure.entry, hintName: pure.hintName, callBranch: callPolicy.callBranch, rescueSe: callPolicy.rescueSe,
    });
    return true;
  }

  // `hopsOnly`: take the collapse ONLY when it drops redundant hops off a root that is already
  // spelled (a memo ref, an alias). a plan that resolves a PURE root injects an import, which is a
  // claim decision - a caller asking merely to drop hops must not make one behind the resolver's back
  // the canon spells the collapse in ESTree and this leg's own nodes ride host slots. an
  // `optional` link is canonical only inside a `ChainExpression` - the converter refuses one
  // outside a chain - so a guard-bearing plan is wrapped before conversion, and babel then
  // types every link from the first `?.` upward as `Optional*`. the printed text and the
  // downstream optional-chaining lowering are the same either way (both were measured): the
  // wrapper is what makes the canonical render CONVERTIBLE, not a spelling choice
  function renderCollapsePlan(plan, { carrySource = false } = {}) {
    const rendered = renderProxyReceiverPlan(plan, {
      injectImport: (entry, hintName) => injectPureImport(entry, hintName).name,
      embed: hostSlot,
      carrySource,
    });
    if (!rendered) return null;
    return estreeToBabel(plan.kind === 'member' || plan.optional ? chainExpression(rendered) : rendered);
  }

  function collapseProxyGlobalReceiver(receiver, {
    aliasCtx = null,
    isWriteTarget = false,
    throughChainAssign = false,
    hopsOnly = false,
    carrySource = false,
  } = {}) {
    const plan = planProxyReceiver(receiver, { aliasCtx, isWriteTarget, throughChainAssign, resolvePure });
    if (!plan) return null;
    if (hopsOnly && plan.rootBinding?.pure) return null;
    return renderCollapsePlan(plan, { carrySource });
  }

  // the kept-sequence boundary refuses the whole-collapse (a `?.` reading a NESTED sequence
  // stays live), but a backed all-proxy run in the sequence tail still owes its fold: drop
  // the plain dotted hops onto the root pure binding in place - an ALIAS root keeps its
  // identifier, the drive's alias rule - leaving the sequence and its `?.` alone: the
  // kept-seq spelling of the plain fold, the unplugin leg's shape. through the PATH, so the
  // replace requeues what survives; claim-consuming shapes never reach this - their outer
  // claim renders first and detaches the chain
  function foldKeptSeqHopRun(recPath, aliasCtx) {
    if (ownChainOptionalObjects(recPath.node).every(object => !nestedSequenceValueSpelling(object))) return false;
    // a chain still carrying a claim that DISPATCHES off this run is not claim-less residue: that
    // claim's route renders it - and MEMOIZES the sequence, whose value slot the kept-value canon
    // then owns (an alias root folds to the leaf there, not to this fold's alias-keep). asked of
    // the shared canon, which walks the member run up from here and answers in both tenses - the
    // claim still spelled as a member, and the dispatch a claim already rendered around the run
    if (dispatchConsumesRun({ path: recPath, resolvePure, aliasCtx })) return false;
    let runPath = recPath.get('object');
    for (;;) {
      const runNode = runPath.node;
      if (runNode?.type === 'SequenceExpression' && runNode.expressions.length) {
        runPath = runPath.get(`expressions.${ runNode.expressions.length - 1 }`);
        continue;
      }
      if (runNode && unwrapRuntimeExpr(runNode) !== runNode) {
        runPath = runPath.get('expression');
        continue;
      }
      break;
    }
    if (!runPath.isMemberExpression()) return false;
    // the single terminal probe reading directly off the root keeps its read - the `?.` is the
    // environment test the source asked for; every LONGER all-proxy run folds whole under the
    // navigation, probes included - the deep-nav canon the flat twins of this shape lock
    if (unwrapRuntimeExpr(runPath.node.object)?.type === 'Identifier'
      && unbackedProxyHopKey(runPath.node, resolvePure)) return false;
    let rootNode = runPath.node;
    while (rootNode?.type === 'MemberExpression') {
      if (rootNode.computed || rootNode.optional || !POSSIBLE_GLOBAL_OBJECTS.has(rootNode.property?.name)) return false;
      rootNode = rootNode.object;
    }
    if (rootNode?.type !== 'Identifier'
      || maximalProxyGlobalPrefix(runPath.node, aliasCtx) !== runPath.node
      || !findProxyGlobal(runPath.node, aliasCtx, true)) return false;
    // an ALIAS root keeps its identifier (the drive's alias rule), so the deepest-landing canon is
    // asked only where the root itself spells a realm name pure can back
    const runPure = POSSIBLE_GLOBAL_OBJECTS.has(rootNode.name)
      ? proxyRunLandingPure({ navNode: runPath.node, ctx: aliasCtx, resolvePure, rootName: rootNode.name })
      : resolvePure({ kind: 'global', name: rootNode.name });
    runPath.replaceWith(runPure
      ? injectPureImport(runPure.entry, runPure.hintName) : t.cloneNode(rootNode));
    return true;
  }

  // a kept STORE a run is written through, swapped in place for a fresh copy: the claim standing over
  // the run subsumed the store's own claims (its root, a call's inner global), and they fire on the copy
  // - the copy the swap's own effect slots take
  function refreshKeptStore(runPath, store) {
    let storePath = runPath.get('object');
    while (storePath.node !== store) {
      const { node } = storePath;
      if (node?.type === 'SequenceExpression') storePath = storePath.get(`expressions.${ node.expressions.length - 1 }`);
      else if (node && unwrapRuntimeExpr(node) !== node) storePath = storePath.get('expression');
      else if (node?.type === 'MemberExpression' || node?.type === 'OptionalMemberExpression') storePath = storePath.get('object');
      else return;
    }
    storePath.replaceWith(t.cloneWithoutRetiring(store));
  }

  // the global-usage rewrite reaches a proxy-global ROOT identifier (`globalThis`) that is the base
  // of a member chain carrying redundant proxy hops (`globalThis.self.Array`, where the leaf is NOT a
  // pure-substituted global). rewriting only the identifier leaves `_globalThis.self.Array`, which
  // reads an undefined `.self` off the global on hosts without it (ie:11 / Node). climb to the leaf
  // member that consumes the maximal proxy-hop prefix and collapse it through the shared receiver
  // collapse - `_globalThis.Array`. returns true when it rewrote (the caller skips the bare swap);
  // false for a bare root (`globalThis.Array`, no hop) so the natural identifier swap handles it
  // eslint-disable-next-line max-statements -- one verdict per consumer the drive may stand under
  function collapseProxyHopRoot(idPath, aliasCtx, { keptSeqHopFold = false } = {}) {
    // fire for a proxy-global NAME root (`globalThis` / `self` / ...) OR an alias of one (`const g =
    // globalThis; g.self.X` -> `g.X`): the alias-aware `findProxyGlobal` follows the binding so an
    // alias root collapses its hops too. a non-proxy global (`Map`) resolves to false (no hop); a
    // self-referential `var Map = Map` no longer recurses - the cycle-guard returns the node name
    if (!findProxyGlobal(idPath.node, aliasCtx, true)) return false;
    // a MULTIPLY-written user binding at the chain root authorizes this collapse only through its
    // TRUSTED write: the weaker resolutions answer "which global the name refers to", never "it holds
    // that global HERE", and a hop dropped on that answer moved with an unrelated EARLIER statement's
    // write to the same name - two identical source expressions in one file collapsed differently,
    // the first keeping the hop its twins below dropped
    if (!collapseRootHoldsItsGlobal(descendToChainRoot(idPath.node, true).root, aliasCtx)) return false;
    // the climb's guard compares ROOT to ROOT: the canonical descent always peels to the innermost
    // identifier, while the anchor may be an Identifier, the chain-assign EXPRESSION, or a member the
    // assign stores (`(k = globalThis.self)?...` anchors at `globalThis.self`). comparing the descent's
    // root against the anchor NODE only ever matched the Identifier case - every other anchor shape made
    // the climb die at its first non-member parent, leaving the redundant hop raw
    const anchorRoot = descendToChainRoot(idPath.node, true).root ?? idPath.node;
    let recPath = idPath.parentPath;
    // track the DEEPEST all-proxy member: a chain with a non-proxy leaf breaks AT that leaf (`.self.window
    // .foo` -> collapse `.foo`), but an ALL-proxy chain with no non-proxy leaf (`globalThis.self.window` as a
    // bare destructure SOURCE) has nothing to break at - the climb walks past it to a non-member parent. fall
    // back to the deepest all-proxy member so the whole chain still collapses to the root (`_globalThis`)
    let allProxyMember = null;
    let allProxyEnd = false;
    // climb to the leaf member consuming the maximal proxy-hop prefix (stop at the first member
    // whose leaf is non-proxy), stepping THROUGH any construct the chain-walk canon peels on the
    // way down - chain-assignments (`(a = globalThis).self.X`), sequence tails, TS casts,
    // including MID-CHAIN wrappers (`((a = globalThis).self as any).Array`) - by alternating the
    // wrapper step with the member step; mirroring the canonical descent (which must terminate at
    // exactly this identifier) keeps the two walks in lockstep, and a non-peelable parent (call
    // argument, unary operand, ...) self-limits the loop.
    for (;;) {
      if (recPath?.isMemberExpression() || recPath?.isOptionalMemberExpression()) {
        if (maximalProxyGlobalPrefix(recPath.node, aliasCtx,
          { throughChainAssign: true }) !== recPath.node) break;
        allProxyMember = recPath;
      } else if (!recPath?.node || descendToChainRoot(recPath.node, true).root !== anchorRoot) {
        if (allProxyMember) {
          recPath = allProxyMember;
          allProxyEnd = true;
        }
        break;
      }
      recPath = recPath.parentPath;
    }
    if (!recPath?.isMemberExpression() && !recPath?.isOptionalMemberExpression()) return false;
    // only a REAL intermediate hop collapses; a bare root has nothing to drop (no over-collapse)
    if (!maximalProxyGlobalHop(recPath.node, aliasCtx, { throughChainAssign: true })) return false;
    // a LIVE `?.` in the collapsed span testing a short-circuitable value (`(globalThis.window
    // ?.self.window)?.X` - the sealed nav CAN be undefined) may not erase: the render drops the
    // `?.` with the hops and runs the member where native short-circuits. the guard channels own
    // the shape. the seal-aware canon keeps a PLAIN read over the same sealed nav collapsing
    // (`(nav).X` - the locked erase) and an all-plain span deopting as before
    // a `delete` consumer is the exception: the member it names is never READ, so no `?.` over the nav
    // is load-bearing and the navigation collapses whole (the unplugin leg's twin gate)
    // the walk peels transparent wrappers: under `createParenthesizedExpressions` a paren NODE sits
    // between the chain and the `delete`, and an identity peel read it as an opaque consumer - the rule
    // then fired in one paren spelling and not the other, which the area allows only cosmetically
    if (!deleteHostAboveChain(recPath, recPath.node, unwrapRuntimeExpr)
      && navValueCanShortCircuit(recPath.node, resolvePure, aliasCtx)) return false;
    if (runSwallowsStoreProbe(recPath.node, resolvePure)) return false;
    // a destructure SOURCE is a receiver like any other: the hop collapse owns it here, and the
    // pattern's own render - where one fires - replaces the whole source with its synth literal, so
    // the two never spell the same node. a pattern-shaped target was once deferred to that render on
    // the strength of a CLAIM census, which answered differently on the two legs and left a raw
    // `_globalThis.self.X` standing on one of them - undefined off-engine, where the polyfilled
    // product answers. a plain default VALUE (`{ x = chain }`, target Identifier) is not a source
    let ctxPath = recPath.parentPath;
    // a value-OBSERVING carrier (`??` / `||` / `&&` / ternary) between the receiver and the binding OBSERVES
    // the receiver's undefined/falsy: `{x} = globalThis.window ?? {}` reads `undefined ?? {}` = `{}` off-engine.
    // the all-proxy root-collapse below (`.window` -> `_globalThis`, DEFINED) would defeat that fallback
    let valueObservingCarrier = false;
    while (PROXY_HOP_VALUE_CARRIERS.has(ctxPath?.node?.type)) {
      if (ctxPath.node.type === 'LogicalExpression' || ctxPath.node.type === 'ConditionalExpression') valueObservingCarrier = true;
      ctxPath = ctxPath.parentPath;
    }
    const ctx = ctxPath?.node;
    const target = ctx?.type === 'VariableDeclarator' ? ctx.id
      : ctx?.type === 'AssignmentPattern' || ctx?.type === 'AssignmentExpression' ? ctx.left : null;
    // an ALL-proxy chain END (`globalThis.self.window`, no non-proxy leaf) collapses to the bare root ONLY as
    // a DISCARDED destructure SOURCE whose value the canon calls DEFINED - a deep unresolvable hop is a
    // realm self-reference, invariant of which global names it, safe to drop (`{Object:OD} = _globalThis`);
    // an absent-able value is the environment PROBE and declines below. a value-USE (`const x =
    // globalThis.self.window`) keeps the raw hops: it reads `window`, which throws off-browser exactly as
    // the source does (finding-e faithful-throw)
    if (allProxyEnd && !isDestructurePattern(target)) return false;
    // the all-proxy chain's LAST hop is itself a proxy. only collapse when SOME hop is UNRESOLVABLE
    // (`.window`, no `_window` - `collapseProxyGlobalReceiver` keeps it as `_globalThis.window`, undefined
    // off-engine): drop every hop onto the binding the landing canon names - the deepest one pure can
    // back, the root when none of them is (`{x} = globalThis.window.self` reads `_self`, `{x} =
    // globalThis.window` reads `_globalThis`). when every hop resolves (`.self` -> `_self`) keep the
    // natural per-hop resolution (`{x} = globalThis.self` -> `_self`). a computed hop key may carry SE
    // (`globalThis[(c++,'self')].window`) - out of scope for this bare drop, defer
    if (allProxyEnd) {
      if (valueObservingCarrier) return false;
      // ... and only where the value canon calls the nav DEFINED (a deep unresolvable hop is a
      // realm self-reference): a value that can be absent is the environment PROBE, and the
      // always-defined root would destructure where native throws - decline to the natural
      // root swap, whose kept raw hop keeps the throw (`= _globalThis.window`)
      if (!navHasUnresolvableProxyHop(recPath.node, resolvePure, aliasCtx)
        || proxyReceiverValueCanBeUndefined(recPath.node, resolvePure, aliasCtx)) return false;
      const rootIdent = findProxyGlobal(recPath.node, aliasCtx, true);
      const rootPure = rootIdent && proxyRunLandingPure({
        navNode: recPath.node, ctx: aliasCtx, resolvePure, rootName: rootIdent.name,
      });
      if (!rootPure) return false;
      for (let n = recPath.node; n?.type === 'MemberExpression' || n?.type === 'OptionalMemberExpression'; n = n.object) {
        if (n.computed) return false;
      }
      recPath.replaceWith(injectPureImport(rootPure.entry, rootPure.hintName));
      return true;
    }
    // a mutation TARGET (`globalThis.{self,window}.Map = fn` / `delete ...` / `...++`, the canonical
    // `isMemberWriteHost` covers `=` / update / `delete` / destructuring / wrappers) collapses through a pure-ctor
    // leaf - the leaf is the write slot, not a read whole-swap. unplugin's natural visitor resolves a hop that
    // HAS a pure entry (`globalThis.self` -> `_self`) but leaves one WITHOUT (`globalThis.window`, no `_window`)
    // raw; this guard reproduces that per-hop behaviour so babel matches unplugin: keep the natural `_self`
    // resolution when every hop resolves, force the full root-collapse when ANY hop is raw (`.window` -> a
    // `_globalThis.window` slot is undefined off-engine -> crash). without it babel would always collapse to
    // `_globalThis`, diverging from unplugin (whose `_self` resolution is embedded too deep to re-route cheaply)
    const isWriteTarget = isMemberWriteHost(recPath);
    // a `delete` host is the exception: its navigation collapses whole, and the natural per-hop rewrite
    // would land on the LEAF ponyfill (`_self.X`) where the same nav READ collapses to the root
    // (`_globalThis.X`) - one source, two import sets, decided by the consumer
    // ... EXCEPT over a kept chain-assign: there the store is the observable (`(d = gw).X` keeps what
    // the source wrote into `d`), and collapsing through it read the tail off the STORE instead of the
    // ponyfill - `delete (d = _globalThis.window)?.X`, which deletes nothing off-window
    function navCarriesChainAssign(node) {
      for (let cur = unwrapRuntimeExpr(node); cur;) {
        if (peelChainAssignment(cur).outer) return true;
        if (cur.type !== 'MemberExpression' && cur.type !== 'OptionalMemberExpression') return false;
        cur = unwrapRuntimeExpr(cur.object);
      }
      return false;
    }
    const deleted = deleteHostAboveChain(recPath, recPath.node, unwrapRuntimeExpr);
    const deleteHost = deleted && !navCarriesChainAssign(recPath.node);
    // ... and a write through a kept store of the environment probe takes that store as its base,
    // the read's own landing: the natural rewrite performs it on the realm where the source throws.
    // a `delete` names its slot off the run's root whatever the store holds
    const keptStore = isWriteTarget && !deleted ? keptProbeStore(recPath.node.object, resolvePure, aliasCtx) : null;
    if (isWriteTarget && !deleteHost
      && !navHasUnresolvableProxyHop(recPath.node.object, resolvePure, aliasCtx) && !keptStore) return false;
    // a WRITTEN run lands on its kept store, whose own claims the claim driving this subsumed where
    // the source wraps the store (`(eff(), w = globalThis.window).self.k = v`): the store travels as a
    // fresh copy, the swap's own effect-slot copy, and its claims fire on that
    if (keptStore) refreshKeptStore(recPath, keptStore);
    // this drive REPLACES the receiver subtree, so the render carries the kept user nodes by
    // identity - a cloned kept write stranded the scope tracker's violation records on the
    // detached original, and every later placement-gated trust ask about its alias failed
    const collapsed = collapseProxyGlobalReceiver(recPath.node,
      { aliasCtx, isWriteTarget, throughChainAssign: true, carrySource: true });
    if (!collapsed) {
      return keptSeqHopFold && !isWriteTarget && !deleteHost
        && foldKeptSeqHopRun(recPath, aliasCtx);
    }
    recPath.replaceWith(collapsed);
    // the replacement is a FINISHED render of the outer member (root substituted, hops dropped) -
    // this drive only fires when the member's own callback declined the nav (a write target, a
    // for-x aliased read), so the re-visit of the synthetic member must not re-enter detection:
    // the well-known-symbol strand would collapse the deliberately-deopted read (the for-x
    // signature no longer matches the rebuilt shape). children stay live - the kept key still
    // needs its own static swap (`Symbol.iterator` -> `_Symbol$iterator`)
    const collapsedMember = collapsed.type === 'SequenceExpression' ? collapsed.expressions.at(-1) : collapsed;
    if (collapsedMember.type === 'MemberExpression' || collapsedMember.type === 'OptionalMemberExpression') {
      skippedNodes.add(collapsedMember);
    }
    return true;
  }

  // a proxy-global PONYFILL import at the chain root ends the collapse: the hop above it is one a
  // guard render deliberately kept (a computed key and its effects - the alternate of a probe), and
  // folding it drops the effects that read owes. asked of the SHAPE, never of a per-pass
  // registry: re-run over its own output this emitter has no memory of what it rendered, and the fold
  // then ran once more each pass - a user's own import of the same entry reads the same way
  function proxyPureImportRoot(root, aliasCtx) {
    const binding = adapter.getBinding?.({ scope: aliasCtx.scope, name: root.name, path: aliasCtx.path });
    if (!binding?.importSource) return false;
    const hint = bindingPolyfillHint({ binding, scope: aliasCtx.scope, name: root.name, adapter });
    return !!hint && POSSIBLE_GLOBAL_OBJECTS.has(hint);
  }

  // does a MULTIPLY-written user binding at a chain root actually HOLD its global at this read? only its
  // TRUSTED write says so: the weaker resolutions answer which global the name refers to, never that it
  // holds it HERE, and a hop dropped on that answer moved with an unrelated EARLIER statement's write to
  // the same name - two identical source expressions in one file collapsed differently, the first keeping
  // the hop its twins below dropped. a single-write binding keeps the ordinary resolution
  function collapseRootHoldsItsGlobal(root, aliasCtx) {
    if (root?.type !== 'Identifier' || POSSIBLE_GLOBAL_OBJECTS.has(root.name)) return true;
    if (proxyPureImportRoot(root, aliasCtx)) return false;
    const binding = adapter.getBinding?.({ scope: aliasCtx.scope, name: root.name, path: aliasCtx.path });
    if ((binding?.constantViolations?.length ?? 0) <= 1) return true;
    return !!trustedIdentifierAliasWrite({
      scope: aliasCtx.scope, name: root.name, adapter, path: aliasCtx.path, readNode: root,
    });
  }

  // Native source clones retain directive anchors; the provider selects all literal values.
  function buildSynthLiteral({ receiver, entries, memoParam = null, aliasCtx = null, guardedReceiverPlan = null }) {
    const literal = renderSynthLiteral(
      entries,
      {
        receiver,
        memo: memoParam,
        aliasCtx,
        guardedReceiverPlan,
        resolvePure,
        injectImport: (entry, hint) => injectPureImport(entry, hint).name,
        embed: hostSlot,
        cloneHost: t.cloneNode,
        cloneKey(source, entry) {
          const key = t.cloneNode(source);
          for (const field of t.COMMENT_KEYS) {
            const directives = entry.optedOut ? key[field]?.filter(comment => disableDirectiveKind(comment.value)) : null;
            if (directives?.length) key[field] = directives;
            else delete key[field];
          }
          return key;
        },
      },
    );
    if (!literal) return null;
    const result = estreeToBabel(literal);
    entries.forEach(
      (entry, index) => {
        if (entry.optedOut) t.traverseFast(result.properties[index].value, node => { skippedNodes.add(node); });
      },
    );
    return result;
  }

  // walk the program and swap each registered receiver with its synth literal. lookup
  // is by node identity (WeakMap), so sibling plugins that MOVE the receiver
  // (`transform-parameters` extracts `function f({from} = R)` defaults to
  // `var _ref = ... : R; var {from} = _ref` - same R node, new path) keep it findable.
  // receivers removed from the tree are simply not encountered. `applied` flag makes
  // re-entry safe (called once at end of pre-traverse to outrun sibling-plugin clones,
  // again at programExit to catch helper-injected registrations from `reTraverseHelperBodies`)
  function apply(programPath) {
    if (!programPath?.node || !pendingSwapCount) return;
    programPath.traverse({
      enter(path) {
        const pending = synthSwapByReceiver.get(path.node);
        if (!pending || pending.applied) return;
        // an INSTANCE param-default registration additionally admits `this` / constant-literal
        // receivers (`= [1, 2]`) - its own registration gate already bounded the shape
        const hasInstanceEntry = pending.polyfills.values().some(p => p.instance);
        if (!isReceiverShapedNode(path.node) && !pending.callBranch && path.node.type !== 'LogicalExpression'
          && path.node.type !== 'ThisExpression' && !hasInstanceEntry) return;
        const entries = pending.entries.map(planEntry => ({ ...planEntry, polyfill: pending.polyfills.get(planEntry.dedupKey) ?? null }));
        const aliasCtx = { scope: path.scope, adapter, path, injectorState: injector };
        function cloneProbeSource(source) {
          const slot = pending.probeSlots?.get(source);
          return t.cloneNode(slot?.container[slot.key] ?? source, true);
        }
        const renderCtx = {
          injectImport: (entry, hintName) => injectPureImport(entry, hintName).name,
          embed: hostSlot, cloneHost: node => t.cloneNode(node, true),
        };
        const rendered = renderSynthReplacement(entries, {
          receiver: path.node, callBranch: pending.callBranch, rescueSe: pending.rescueSe,
          guard: pending.synthGuard, aliasCtx, ...renderCtx,
          renderLiteral: ({ receiver, memo }) => buildSynthLiteral({
            receiver, entries, memoParam: memo, aliasCtx, guardedReceiverPlan: pending.guardedReceiverPlan,
          }),
          renderMemoArgument: () => {
            const argument = renderMemoReadTarget(pending.memoRead, renderCtx);
            return argument && estreeToBabel(argument);
          },
          renderProbe: () => {
            if (!pending.probePlan) return null;
            const node = estreeToBabel(renderClaimProbe(pending.probePlan, { ...renderCtx, cloneHost: cloneProbeSource }));
            return { node, effects: pending.probeEffects.map(effect => effect ? cloneProbeSource(effect) : node) };
          },
          // An activation parameter shares injector numbering but must not enter its
          // declared-ref set: arrow normalization would move it into the function body.
          createMemo: () => t.identifier(injector.generateRefName(name => path.scope.hasBinding(name))),
        });
        if (!rendered) return;
        const replacement = estreeToBabel(rendered);
        // Commit ownership only after native replacement succeeds; a failed apply can retry.
        path.replaceWith(replacement);
        pending.applied = true;
        pendingSwapCount--;
        path.skip();
      },
    });
  }

  return {
    apply, collapseProxyGlobalReceiver, collapseProxyHopRoot, refreshKeptStore,
    findTargetPath: (wrapper, pattern) => findSynthSwapReceiverPath(wrapper, pattern.node, adapter, resolvePure),
    detectIifeArgPath, registerPolyfill, tryRegisterPerBranchSynth,
    // a suppressed-hop drive must not detach a receiver this ledger will replace at apply().
    ownsReceiver: node => !!synthSwapByReceiver.get(node) && !synthSwapByReceiver.get(node).applied,
  };
}
