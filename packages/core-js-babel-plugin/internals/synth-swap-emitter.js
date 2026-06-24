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
  collectBuriedChainSePrefixes,
  isReceiverShapedNode,
  peelNestedSequenceExpressions,
  buildFlatSynthEntries,
  findIifeCallSite,
  resolveCallArgumentCoords,
  getFallbackBranchSlots,
  isSynthSimpleObjectPattern,
  TRANSPARENT_EXPR_WRAPPER_TYPES,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import {
  isAliasProxyRoot,
  isClassifiableReceiverArg,
  isExpandedClassifiableReceiver,
  markReplacedReceiverSkipped,
  markSynthReceiverSkipped,
  memberKeyName,
} from '@core-js/polyfill-provider/helpers/class-walk';
import {
  classifyCallBranchForSynth,
  isViableBranchForKey,
  resolvableArgSupersedesDeadDefault,
} from '@core-js/polyfill-provider/detect-usage/destructure';
import {
  collectFallbackCollapseLeftSe,
  resolveCallRootedProxyCollapse,
  shouldDropRescueReceiver,
} from '@core-js/polyfill-provider/detect-usage/members';
import {
  findProxyGlobal, maximalProxyGlobalHop, maximalProxyGlobalPrefix, PROXY_HOP_VALUE_CARRIERS,
  proxyGlobalMemberCtorPure, resolveSynthKeys,
} from '@core-js/polyfill-provider/detect-usage/resolve';
import { patternComputedKeysSynthSafe } from './synth-key-utils.js';

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

  // peel runtime-transparent expression wrappers (TS `as` / `satisfies` / `!` / ... and
  // `ParenthesizedExpression` for `createParenthesizedExpressions: true`) so synth-target
  // detection lands on the meaningful inner node. default parser tracks parens via the
  // `extra.parenthesized` flag instead of nodes - that flag is checked separately at the
  // relevant call sites (`isWrappedInParens` in babel-compat.js)
  function peelTransparentPath(path) {
    while (path?.node && TRANSPARENT_EXPR_WRAPPER_TYPES.has(path.node.type)) {
      path = path.get('expression');
    }
    return path;
  }

  // `(fn, R)` SE evaluates to its tail. peel SE prefixes recursively through paren wrappers
  // so flat / nested forms (`(0, R)` vs `(0, (1, R))`) classify identically. peel is
  // unconditional including for side-effecting prefixes: synth-swap's `replaceWith` mutates
  // ONLY the tail node, so prefix expressions stay in the SE structure and run at runtime.
  // path-version companion of node-version `unwrapSafeSequenceTail` (`helpers/ast-patterns.js`)
  function unwrapSequenceTail(argPath) {
    while (argPath?.node) {
      argPath = peelTransparentPath(argPath);
      if (!argPath?.isSequenceExpression()) return argPath;
      const tail = argPath.get('expressions').at(-1);
      if (!tail) return argPath;
      argPath = tail;
    }
    return argPath;
  }

  // path-iteration with inline-spread expansion + `unwrapSequenceTail`. accepts both
  // ArrowFunctionExpression and FunctionExpression IIFE: arrow lacks `arguments`, function
  // has its own - swapping caller-arg with the synth `{key: _polyfill}` literal is observable
  // via `arguments[0]` only when body reads it (rare pattern). polyfill-always-wins contract
  // for usage-pure mode wins the trade-off vs preserving original arg in `arguments`.
  // the spread-expansion + nested-spread bail (`f(...[a, ...rest])` is variadic, can't locate a
  // later positional) is the canonical `resolveCallArgumentCoords` semantics - delegate it and only
  // LOCATE the resolved coordinate as a path here, so babel and unplugin can't drift on the rules
  function detectIifeArgPath(wrapper, objectPattern) {
    if (!wrapper?.isArrowFunctionExpression() && !wrapper?.isFunctionExpression()) return null;
    const site = findIifeCallSite(wrapper, objectPattern.node);
    if (!site) return null;
    const coords = resolveCallArgumentCoords(site.callPath.node.arguments ?? [], site.paramIndex);
    if (!coords) return null;
    const argPath = site.callPath.get('arguments')[coords.argIndex];
    const elementPath = coords.elementIndex < 0
      ? argPath : argPath.get('argument').get('elements')[coords.elementIndex];
    return unwrapSequenceTail(elementPath);
  }

  // NodePath whose `.node` becomes the synth object; null means inline-default fallback.
  // mirrors the resolution-layer choice in detect-usage.js: a classifiable bare-Identifier
  // caller-arg wins first; then a RESOLVABLE non-Identifier arg (proxy-global member
  // `globalThis.X`, inline-resolvable call `(() => Array)()`) wins over a polyfill-DEAD-END
  // default via `resolvableArgSupersedesDeadDefault` - its SE is rescued ahead of the synth.
  // otherwise the wrapper-default stays the synth target (the live fallback for the
  // undefined-arg runtime path); an opaque non-resolvable arg yields nothing and keeps it
  function findTargetPath(wrapper, objectPattern) {
    if (objectPattern.node.properties.some(property => t.isRestElement(property))) return null;
    if (wrapper?.isAssignmentPattern()) {
      // peel parens / TS wrappers / SE-tail through `unwrapSequenceTail` so all these
      // shapes reach the inner receiver and synth-swap fires:
      //   `({from} = (Array)) => ...`            - createParens=true
      //   `({from} = Array as any) => ...`        - TS cast wrapper
      //   `({from} = (0, Array)) => ...`          - SE tail (minified / TS-emit form)
      //   `({from} = (logCall(), Array)) => ...`  - SE tail with side-effecting prefix
      // synth-swap's `replaceWith` mutates ONLY the tail Identifier - the SE prefix
      // expressions stay in the AST and run at runtime exactly as written. caller's
      // `({from: customFn})` still beats the synth-emitted default (default fires only
      // when caller-arg is undefined), preserving caller-passed values
      const rightPath = unwrapSequenceTail(wrapper.get('right'));
      // IIFE caller-arg consult comes FIRST (mirroring the meta layer's order): a classifiable
      // live arg wins regardless of the wrapper-default's shape - gating on the default first
      // bailed `(({ from } = []) => ...)(Array)` to a native-first inline default even though
      // the live receiver was statically known. the default fires only on caller-omitted
      // invocation; (Optional)MemberExpression defaults included (`({of} = globalThis.Iterator)
      // (Array)`) - synthesising onto the dead default would leave the live caller-arg native
      const argPath = detectIifeArgPath(wrapper.parentPath, wrapper);
      if (argPath && isClassifiableReceiverArg(argPath.node, argPath.scope, adapter)) return argPath;
      // a resolvable non-Identifier arg (proxy-global member `globalThis.Array`, inline-resolvable call)
      // supersedes the default when the default is a polyfill dead-end - mirrors `chooseFallbackReceiverNode`
      if (argPath && resolvableArgSupersedesDeadDefault({
        argNode: argPath.node, defaultNode: rightPath.node, objectPattern: objectPattern.node,
        scope: argPath.scope, adapter, path: argPath, resolvePure,
      })) return argPath;
      // a fallback-shaped default (`Array || Iterator`, `Array ?? Iterator`) resolves its meta
      // through the LEFT branch (detection peels fallback wrappers deterministically), so the
      // synth replaces the WHOLE expression with the literal - the same left-collapse the
      // declarator flatten applies. `&&` selects its RIGHT side at runtime and stays out;
      // unresolved keys re-read through the original expression, whose left bias short-circuits
      // before the (possibly absent) right global evaluates
      const fallbackCollapse = rightPath.isLogicalExpression() && rightPath.node.operator !== '&&'
        && isReceiverShapedNode(unwrapSequenceTail(rightPath.get('left')).node);
      // accept OptionalMemberExpression too (`{from} = globalThis?.Array`) - symmetric with
      // `isExpandedClassifiableReceiver`'s `globalProxyMemberName` walk which already handles
      // optional-chain shapes. without OME the OME-default silently bails to inline-default
      if (!fallbackCollapse && !isReceiverShapedNode(rightPath.node)) return null;
      return rightPath;
    }
    // no wrapper-default: no fallback target to preserve, so accept any statically-classifiable
    // receiver (bare Identifier OR proxy-global MemberExpression like `globalThis.Map`).
    // mismatched non-resolvable receiver is harmless - synth-swap drains only when resolution
    // succeeds, otherwise destructure-emitter falls through to inline-default
    const argPath = detectIifeArgPath(wrapper, objectPattern);
    return argPath && isExpandedClassifiableReceiver({ node: argPath.node }) ? argPath : null;
  }

  // register a polyfill for a single key on a synth target. ensures the pending entry
  // exists, marks the receiver in `skippedNodes` (identifier visitor would race on the
  // same node and emit a parallel `_Receiver` import that gets dropped post-swap).
  // metadata is keyed on the receiver NODE (not path) so apply() locates the receiver
  // by walking the program - survives sibling-plugin moves that orphan the original path
  function registerPolyfill({ targetPath, objectPatternPath, key, entry, hintName, callBranch = false, rescueSe = null }) {
    const receiver = targetPath.node;
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
      t.traverseFast(receiver.right, node => { skippedNodes.add(node); });
      const keepSe = collectFallbackCollapseLeftSe({
        leftNode: receiver.left, scope: targetPath.scope, adapter, path: targetPath,
      });
      markReplacedReceiverSkipped({ receiver: receiver.left, keepSe, skippedNodes, walkNode: t.traverseFast });
    } else if (!rescueSe || shouldDropRescueReceiver(receiver)) {
      // case 3 (plain replace) + case 1 (rescue-drop): the synth literal supplants the receiver value
      // (a drop re-emits only its harvested SE ahead). skip the WHOLE receiver - a spine-only skip stops
      // at a sequence and leaves the prefix's dropped globals visible, injecting a dead `_globalThis`
      // import. the harvested SE is re-exposed so its globals still polyfill in the live tree before
      // apply clones them into the re-emitted prefix. keeps the import set identical to the text emitter
      const keepSe = rescueSe ? collectFallbackCollapseLeftSe({
        leftNode: receiver, scope: targetPath.scope, adapter, path: targetPath,
      }) : [];
      markReplacedReceiverSkipped({ receiver, keepSe, skippedNodes, walkNode: t.traverseFast });
    } else markSynthReceiverSkipped(receiver, skippedNodes);
    let pending = synthSwapByReceiver.get(receiver);
    if (!pending) {
      // capture the ObjectPattern NODE (not path) for the same node-identity reason -
      // we don't need the live path; the captured key set is final at registration
      // time and apply() emits synth properties from the captured properties array
      pending = {
        objectPatternNode: objectPatternPath.node,
        polyfills: new Map(),
        callBranch,
        rescueSe,
      };
      synthSwapByReceiver.set(receiver, pending);
    }
    pending.polyfills.set(key, { entry, hintName });
  }

  // ConditionalExpression / LogicalExpression in destructure-receiver position
  // (`= cond ? Array : Set` / `= Array || Set`). when `meta.fromFallback` flags the
  // resolved meta as ambiguous (runtime picks per-call), try per-branch synth-swap so
  // each viable branch becomes its own `{key: _Branch$key}` literal. branches without
  // a viable polyfill stay raw - identifier visitor still emits `_Set` etc. via the
  // standard global rewrite, so user gets correct constructor at runtime
  function tryRegisterPerBranchSynth(rhsPath, prop) {
    const objectPattern = prop.parentPath;
    // per-branch has no body-extract fallback, so it accepts static-literal computed keys (`['from']`)
    // and synths them rather than dropping the polyfill (resolveSynthKeys folds the key to its value).
    // a SIDE-EFFECTING computed key (`[(eff(), 'from')]`) is accepted too: synthSwapPropKey folds it to
    // its static `["from"]` slot (no effect in the synth literal) while the effect stays in the residual
    // LHS pattern and runs exactly once - so the proxy branch polyfills instead of bailing to native
    if (!objectPattern || !isSynthSimpleObjectPattern(objectPattern.node, {
      allowLiteralComputedKeys: true, allowSideEffectComputedKeys: true,
    })) return false;
    // bail when any computed-key sibling is a generated import (polyfill-rewritten symbol) rather
    // than a user const-key, so per-branch synth stays aligned with unplugin (which bails on the
    // original `Symbol.iterator` MemberExpression)
    if (!patternComputedKeysSynthSafe(t, objectPattern.node, objectPattern.scope, node => injector.isInjectedReference(node))) return false;
    // a user-const computed key (`const k = 'from'; [k]`) resolves to its static name for the branch
    // viability lookup but registers under its synth SLOT key (`[k]`), so buildSynthLiteral emits
    // `[k]: _polyfill` instead of dropping the polyfill. the resolved value also polyfills a sibling-
    // aliasing computed key (`{ from, [k]: x }` with k='from' -> both get `_Array$from`), avoiding the
    // overwrite that dropped the shorthand polyfill. a dynamic key (lookupKey null) bails
    const { lookupKey, slotKey } = resolveSynthKeys({ node: prop.node, scope: objectPattern.scope, adapter, path: prop });
    if (!lookupKey) return false;
    // peel TS wrappers (`(cond ? A : B) as any`) so the conditional underneath reaches
    // the slot resolver. babel parser strips parens but keeps TSAsExpression / `!` as
    // first-class wrappers; createParens=true preserves ParenthesizedExpression too.
    // NOTE: do NOT peel chain-assignment here - `foo = cond ? A : B` is intentional
    // escape hatch (rewriting branches as synth literals would change `foo`'s runtime value)
    return registerBranchTreeForKey(peelTransparentPath(rhsPath), objectPattern, lookupKey, slotKey);
  }

  // recurse into nested ConditionalExpression / LogicalExpression branches so every leaf
  // gets per-branch synth-swap. `unwrapSequenceTail` peels paren / TS / chain AND SE tail
  // so `(logCall(), cond ? A : B)` reaches the inner conditional, slot detection finds the
  // branches, and recursion registers each leaf. SE prefix stays in the AST around the
  // substitution target so side-effects run at runtime
  function registerBranchTreeForKey(branchPath, objectPattern, lookupKey, slotKey) {
    const peeled = unwrapSequenceTail(branchPath);
    if (!peeled?.node) return false;
    const slots = getFallbackBranchSlots(peeled.node);
    if (slots) {
      let any = false;
      for (const slot of slots) {
        if (registerBranchTreeForKey(peeled.get(slot), objectPattern, lookupKey, slotKey)) any = true;
      }
      return any;
    }
    const branch = peeled.node;
    // `lookupKey` is the resolved static name (probes the branch for a polyfillable static); `slotKey`
    // is the synth-literal slot (`[k]` for a computed key) the polyfill is registered + emitted under
    const pure = isViableBranchForKey({ branch, key: lookupKey, scope: peeled.scope, adapter, resolvePure, path: peeled });
    if (!pure) return false;
    const innerPath = unwrapSequenceTail(peeled);
    // call-branch policy (single fully-polyfilled key + SE rescue) lives in the shared
    // `classifyCallBranchForSynth`
    const callPolicy = classifyCallBranchForSynth({
      inner: innerPath.node, scope: innerPath.scope, adapter, path: innerPath,
    });
    registerPolyfill({
      targetPath: innerPath, objectPatternPath: objectPattern, key: slotKey,
      entry: pure.entry, hintName: pure.hintName, callBranch: callPolicy.callBranch, rescueSe: callPolicy.rescueSe,
    });
    return true;
  }

  // accept Identifier (`Array`) and (Optional)MemberExpression (`window.Array`,
  // `globalThis?.Array`) receivers. for member-chain shapes, unpolyfilled keys still re-read
  // through the chain (`window.Array.other`) - each clone re-evaluates the receiver expression.
  // trade-off: lifting the chain to a temp would change AST shape (require IIFE wrap or
  // explicit binding) and for usage-pure mode the typical pattern is all-polyfilled keys,
  // single re-evaluation. accepting OptionalMemberExpression mirrors `isViableBranchForKey`
  // (in destructure.js) so per-branch synth-swap doesn't bail on `cond ? A : opt?.A` shapes

  // proxy-global member receiver (`globalThis.self.Array`): collapse the proxy navigation (root +
  // intermediate proxy hops) to the substituted root, so an unpolyfilled-key fallback reads the
  // constructor off the global object directly. keeping `.self` would read an undefined property
  // off the global object on hosts without it (ie:11 pure, non-browser). the constructor sits
  // directly on the pure-proxy prefix here (a non-proxy hop breaks resolution before synth-swap),
  // so the collapsed form is `<polyfilled root>.<constructor>`. null when not a collapsible chain
  // a call/IIFE-rooted proxy navigation (`(() => globalThis)().self.Array`): `findProxyGlobal` validates
  // only bare-Identifier roots, so the Identifier collapse below bails. resolve the root global (inlining
  // the call) and drop the proxy hop, preserving an SE-bearing chain-root call as a sequence prefix:
  // `(callSe, _root).leaf`. without this the verbatim `.self` hop is undefined off-browser (ie:11 / Node)
  function collapseCallRootedProxyReceiver(receiver, aliasCtx) {
    if (!aliasCtx) return null;
    const plan = resolveCallRootedProxyCollapse({ receiver, ...aliasCtx });
    if (!plan) return null;
    // a pure-ctor leaf (`(() => globalThis)().self.Map`) is whole-swapped to the pure ctor elsewhere
    const leafName = memberKeyName(receiver);
    if (leafName && resolvePure({ kind: 'global', name: leafName })) return null;
    const rootPure = resolvePure({ kind: 'global', name: plan.rootName });
    if (!rootPure || rootPure.kind === 'instance') return null;
    const rootBinding = injectPureImport(rootPure.entry, rootPure.hintName);
    const rootNode = plan.callSe
      ? t.sequenceExpression([t.cloneNode(plan.callSe), rootBinding]) : rootBinding;
    return t.memberExpression(rootNode, t.cloneNode(receiver.property), receiver.computed);
  }

  function collapseProxyGlobalReceiver(receiver, aliasCtx = null) {
    if (!t.isMemberExpression(receiver) && !t.isOptionalMemberExpression(receiver)) return null;
    // collapsible only when the whole `.object` is the pure-proxy navigation (its full span is the
    // prefix) and `.property` is the constructor leaf
    if (maximalProxyGlobalPrefix(receiver, aliasCtx) !== receiver.object) return collapseCallRootedProxyReceiver(receiver, aliasCtx);
    // a pure-ctor leaf (`globalThis.self.Map`) is whole-swapped to the pure ctor by the synth-swap /
    // leaf path; a root-collapse here would emit the NATIVE `_globalThis.Map` and inject a dead
    // `_globalThis`. skip it - only a NON-pure leaf (`.Array`, a user member) root-collapses its hops
    const leafName = memberKeyName(receiver);
    if (leafName && resolvePure({ kind: 'global', name: leafName })) return null;
    const root = findProxyGlobal(receiver, aliasCtx);
    const rootPure = root && resolvePure({ kind: 'global', name: root.name });
    // an ALIAS root (`const g = globalThis; g.self.X`) keeps its (already-rewritten) identifier and
    // only drops the redundant proxy hops (`g.self.X` -> `g.X`); a direct root swaps to its pure ctor
    const isAliasRoot = isAliasProxyRoot(root, aliasCtx);
    if ((!rootPure || rootPure.kind === 'instance') && !isAliasRoot) return null;
    // SE prefixes buried along the hop chain keep evaluating (root-first order):
    // `(eff(), globalThis).self.X` collapses to `(eff(), _globalThis).X`, not `_globalThis.X`
    const prefixes = collectBuriedChainSePrefixes(receiver.object);
    const rootBinding = isAliasRoot ? t.cloneNode(root) : injectPureImport(rootPure.entry, rootPure.hintName);
    const rootNode = prefixes.length
      ? t.sequenceExpression([...prefixes.map(expr => t.cloneNode(expr)), rootBinding])
      : rootBinding;
    // keep the leaf's own computed flag: `globalThis.self['Object']` collapses to
    // `_globalThis['Object']` - leaving the hop verbatim reads `.self` off the global
    // object, which is undefined on hosts without it (ie:11 pure, Node)
    return t.memberExpression(rootNode, t.cloneNode(receiver.property), receiver.computed);
  }

  // the global-usage rewrite reaches a proxy-global ROOT identifier (`globalThis`) that is the base
  // of a member chain carrying redundant proxy hops (`globalThis.self.Array`, where the leaf is NOT a
  // pure-substituted global). rewriting only the identifier leaves `_globalThis.self.Array`, which
  // reads an undefined `.self` off the global on hosts without it (ie:11 / Node). climb to the leaf
  // member that consumes the maximal proxy-hop prefix and collapse it through the shared receiver
  // collapse - `_globalThis.Array`. returns true when it rewrote (the caller skips the bare swap);
  // false for a bare root (`globalThis.Array`, no hop) so the natural identifier swap handles it
  function collapseProxyHopRoot(idPath, aliasCtx) {
    // fire for a proxy-global NAME root (`globalThis` / `self` / ...) OR an alias of one (`const g =
    // globalThis; g.self.X` -> `g.X`): the alias-aware `findProxyGlobal` follows the binding so an
    // alias root collapses its hops too. a non-proxy global (`Map`) resolves to false (no hop); a
    // self-referential `var Map = Map` no longer recurses - the cycle-guard returns the node name
    if (!findProxyGlobal(idPath.node, aliasCtx)) return false;
    let recPath = idPath.parentPath;
    // advance while the member is ENTIRELY proxy navigation (its own maximal prefix spans the whole
    // node), so we stop at the first member whose leaf is non-proxy - the collapse receiver
    while ((recPath?.isMemberExpression() || recPath?.isOptionalMemberExpression())
      && maximalProxyGlobalPrefix(recPath.node, aliasCtx) === recPath.node) {
      recPath = recPath.parentPath;
    }
    if (!recPath?.isMemberExpression() && !recPath?.isOptionalMemberExpression()) return false;
    // only a REAL intermediate hop collapses; a bare root has nothing to drop (no over-collapse)
    if (!maximalProxyGlobalHop(recPath.node, aliasCtx)) return false;
    // the destructure-emitter OWNS the collapse when the chain is an OBJECT-pattern destructure SOURCE
    // (named props feed a synth literal `{ from: _Array$from }`); collapsing here too double-injects a dead
    // `_globalThis`, even when the source sits under value carriers (`{from} = (se, chain) || Set`). climb
    // the carriers to the binding context and skip an OBJECT-pattern target. an ARRAY pattern binds by
    // index / iteration, NEVER a named static the emitter could synth-swap, so the emitter never owns it -
    // collapse the hop HERE (else a residual `_globalThis.self.Array` reads an undefined hop off-engine). a
    // plain default VALUE (`{ x = chain }`, target Identifier) is not a source. mirrors the unplugin gate
    let ctxPath = recPath.parentPath;
    while (PROXY_HOP_VALUE_CARRIERS.has(ctxPath?.node?.type)) ctxPath = ctxPath.parentPath;
    const ctx = ctxPath?.node;
    const target = ctx?.type === 'VariableDeclarator' ? ctx.id
      : ctx?.type === 'AssignmentPattern' || ctx?.type === 'AssignmentExpression' ? ctx.left : null;
    if (target?.type === 'ObjectPattern') return false;
    const collapsed = collapseProxyGlobalReceiver(recPath.node, aliasCtx);
    if (!collapsed) return false;
    recPath.replaceWith(collapsed);
    return true;
  }

  // build the synth `{key: _polyfill, otherKey: R.otherKey}` literal that swaps the
  // receiver. polyfilled keys come from `pending.polyfills` (lazy import via
  // `injectPureImport`); unpolyfilled keys fall back to a member access through the
  // receiver - injected as a pure import when the receiver is itself a polyfillable global,
  // collapsed to the polyfilled root for a proxy-global member chain, raw otherwise.
  // all-polyfilled cases never call `getReceiverRef`, keeping the import set clean
  function buildSynthLiteral(receiver, { objectPatternNode, polyfills }, memoParam = null, aliasCtx = null) {
    // `isExpandedClassifiableReceiver` accepts both bare Identifier (`Array`) and proxy-global
    // MemberExpression (`globalThis.Array`). only the Identifier shape has a `.name` slot worth
    // probing `resolvePure` against; MemberExpression receivers fall through to the as-is
    // member-access fallback below without spending a polyfill lookup on `undefined`
    // a fallback-logical receiver reads through its peeled LEFT branch - the left decides the
    // value under short-circuit, and referencing the dead right global would leak its import
    const readReceiver = receiver.type === 'LogicalExpression'
      ? peelNestedSequenceExpressions(receiver.left).tail : receiver;
    const receiverPure = readReceiver.type === 'Identifier'
      ? resolvePure({ kind: 'global', name: readReceiver.name }) : null;
    const isPolyfillableGlobal = receiverPure && receiverPure.kind !== 'instance';
    let receiverRef = null;

    function getReceiverRef() {
      if (receiverRef) return receiverRef;
      // a memo param (call-branch) replaces every receiver read - cloning the call would re-run it
      if (memoParam) return receiverRef = memoParam;
      if (isPolyfillableGlobal) return receiverRef = injectPureImport(receiverPure.entry, receiverPure.hintName);
      // a proxy-global member with a pure-CTOR leaf (`globalThis.Map`) whole-swaps to the pure ctor, so
      // an unpolyfilled sibling reads off it (`_Map.foo`) - the nested partial-mirror canon. without this
      // the re-traverse of the raw receiver collapses inconsistently per chain depth (and diverges from
      // unplugin); a non-ctor leaf falls through to the proxy-root collapse below
      const ctorPure = proxyGlobalMemberCtorPure({ receiver: readReceiver, aliasCtx, resolvePure });
      if (ctorPure) return receiverRef = injectPureImport(ctorPure.entry, ctorPure.hintName);
      return receiverRef = collapseProxyGlobalReceiver(readReceiver, aliasCtx) ?? readReceiver;
    }

    // the per-property classification lives in the shared `buildFlatSynthEntries`; this loop
    // only renders the entries as AST. injectPureImport already returns a fresh clone
    const properties = [];
    for (const { keyNode, computed, seName, polyfill } of buildFlatSynthEntries(objectPatternNode, polyfills)) {
      const value = polyfill ? injectPureImport(polyfill.entry, polyfill.hintName)
        : seName !== null ? t.memberExpression(t.cloneNode(getReceiverRef()), t.stringLiteral(seName), true)
        : t.memberExpression(t.cloneNode(getReceiverRef()), t.cloneNode(keyNode), computed);
      const synthKey = seName !== null ? t.stringLiteral(seName) : t.cloneNode(keyNode);
      properties.push(t.objectProperty(synthKey, value, computed));
    }
    return t.objectExpression(properties);
  }

  // walk the program and swap each registered receiver with its synth literal. lookup
  // is by node identity (WeakMap), so sibling plugins that MOVE the receiver
  // (`transform-parameters` extracts `function f({from} = R)` defaults to
  // `var _ref = ... : R; var {from} = _ref` - same R node, new path) keep it findable.
  // receivers removed from the tree are simply not encountered. `applied` flag makes
  // re-entry safe (called once at end of pre-traverse to outrun sibling-plugin clones,
  // again at programExit to catch helper-injected registrations from `reTraverseHelperBodies`)
  function apply(programPath) {
    if (!programPath?.node) return;
    programPath.traverse({
      enter(path) {
        const pending = synthSwapByReceiver.get(path.node);
        if (!pending || pending.applied) return;
        if ((!isReceiverShapedNode(path.node) && !pending.callBranch && path.node.type !== 'LogicalExpression')
          || pending.objectPatternNode?.type !== 'ObjectPattern') return;
        // mark `applied` AFTER `replaceWith` returns. setting BEFORE means a thrown
        // replaceWith (sibling-plugin claimed the path mid-traversal, AST-validation
        // failure inside buildSynthLiteral) leaves the swap permanently locked but with
        // the imports for its polyfill keys already injected by `buildSynthLiteral` -
        // dead imports + missing rewrite. ordering after the call leaves `applied: false`
        // on failure so a subsequent `apply` pass can retry.
        // an SE-bearing call branch is rescued ahead of the literal: the clone carries the
        // already-substituted inner references (`return _Promise`), so the taken branch still
        // runs its setup AND yields polyfilled statics
        // a call branch with a key left unresolved memoizes the call result through a
        // function-IIFE param: the call runs exactly once (as the argument) and unresolved
        // keys read the memo instead of re-running the call per read
        const needMemo = pending.callBranch
          && buildFlatSynthEntries(pending.objectPatternNode, pending.polyfills).some(entry => !entry.polyfill);
        const memoParam = needMemo ? path.scope.generateUidIdentifier('ref') : null;
        const aliasCtx = path.scope ? { scope: path.scope, adapter, path } : null;
        const literal = buildSynthLiteral(path.node, pending, memoParam, aliasCtx);
        // a fallback-logical receiver memoizes its resolved LEFT, not the whole `||` / `??`: the left
        // is the always-truthy receiver, so the dead right operand short-circuits and must not survive
        // into the memo argument (cloning the whole logical would re-substitute the right global on
        // re-traversal, leaking a dead `_Set` import and diverging from the text emitter). matches the
        // all-resolved leftSe path, which likewise collapses to the left
        const memoReceiver = path.node.type === 'LogicalExpression' ? path.node.left : path.node;
        // a multi-hop proxy rescue receiver is DROPPED (re-emit only the harvested SE): keeping it would
        // collapse `globalThis[(eff(), 'self')].Array` to `_self.Array`, importing a `self` proxy that is
        // undefined off-browser, and diverging from the text emitter which can't AST-restructure the
        // computed hop. shared `shouldDropRescueReceiver` keeps the drop decision identical across emitters
        const dropRescueReceiver = pending.rescueSe && shouldDropRescueReceiver(path.node);
        let replacement = needMemo
          ? t.callExpression(
            t.functionExpression(null, [memoParam], t.blockStatement([t.returnStatement(literal)])),
            // collapse a proxy hop in the memoized receiver too (`(() => globalThis)().self.Array` ->
            // `(call, _self).Array`): the memo argument reads the receiver value once, so a verbatim
            // `.self` hop would throw off-browser before the memo body runs
            [collapseProxyGlobalReceiver(memoReceiver, aliasCtx) ?? t.cloneNode(memoReceiver, true)])
          : dropRescueReceiver
            ? t.sequenceExpression([
              ...collectFallbackCollapseLeftSe({ leftNode: path.node, scope: path.scope, adapter, path })
                .map(n => t.cloneNode(n, true)),
              literal,
            ])
            : pending.rescueSe
              ? t.sequenceExpression([t.cloneNode(path.node, true), literal])
              : literal;
        // fallbackCollapse (`(logSE(), Array) || Set`, `IIFE().Array || Set`): the whole `||` / `??`
        // default collapses to the synth literal (its left is the always-resolved receiver, its right
        // short-circuits), but the left's side effects must still run when the default fires. preserve
        // them ahead of the literal in source order via the shared `collectFallbackCollapseLeftSe` plan
        // (structural prefixes + a call-rooted left's chain-root call). harvested from the LIVE tree
        // here, AFTER the identifier / instance visitors mutated the left in place, so a polyfillable
        // left effect (`[1].at(0)`, an IIFE reading `globalThis`) carries its rewrite. a pure left
        // plans nothing, so the clean collapse is unchanged (no fixture churn). suppressed when
        // memoizing - the memo argument is the whole receiver, so the left's SE already runs once there
        if (!needMemo && path.node.type === 'LogicalExpression') {
          const leftSe = collectFallbackCollapseLeftSe({ leftNode: path.node.left, scope: path.scope, adapter, path });
          if (leftSe.length) replacement = t.sequenceExpression([...leftSe.map(n => t.cloneNode(n, true)), replacement]);
        }
        path.replaceWith(replacement);
        pending.applied = true;
        path.skip();
      },
    });
  }

  return { apply, collapseProxyGlobalReceiver, collapseProxyHopRoot, findTargetPath, registerPolyfill, tryRegisterPerBranchSynth };
}
