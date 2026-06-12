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
  getFallbackBranchSlots,
  isSynthSimpleObjectPattern,
  TRANSPARENT_EXPR_WRAPPER_TYPES,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import {
  isClassifiableReceiverArg,
  isExpandedClassifiableReceiver,
  markSynthReceiverSkipped,
} from '@core-js/polyfill-provider/helpers/class-walk';
import { classifyCallBranchForSynth, isViableBranchForKey } from '@core-js/polyfill-provider/detect-usage/destructure';
import { findProxyGlobal, maximalProxyGlobalPrefix, resolveSynthKeys } from '@core-js/polyfill-provider/detect-usage/resolve';
import { patternComputedKeysSynthSafe } from './synth-key-utils.js';

export default function createSynthSwapEmitter({
  adapter,
  injectPureImport,
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
  // nested SpreadElement inside the spread array (`f(...[a, ...rest])`) is variadic at
  // compile-time - `rest` may expand to any number of positions. counting it as `1` shifts
  // every subsequent positional, breaking paramIndex match. bail rather than miscount
  function detectIifeArgPath(wrapper, objectPattern) {
    if (!wrapper?.isArrowFunctionExpression() && !wrapper?.isFunctionExpression()) return null;
    const site = findIifeCallSite(wrapper, objectPattern.node);
    if (!site) return null;
    let positionIndex = 0;
    for (const argPath of site.callPath.get('arguments')) {
      if (argPath.isSpreadElement()) {
        if (!argPath.get('argument').isArrayExpression()) return null;
        for (const elementPath of argPath.get('argument').get('elements')) {
          if (elementPath?.isSpreadElement()) return null;
          if (positionIndex === site.paramIndex) return unwrapSequenceTail(elementPath);
          positionIndex++;
        }
        continue;
      }
      if (positionIndex === site.paramIndex) return unwrapSequenceTail(argPath);
      positionIndex++;
    }
    return null;
  }

  // NodePath whose `.node` becomes the synth object; null means inline-default fallback.
  // mirrors the resolution-layer narrowing in detect-usage.js: caller-arg replaces
  // wrapper-default ONLY when caller-arg is statically classifiable (Identifier). for
  // non-Identifier caller-arg (`(...)(globalThis.X)`, `(...)(call())`) wrapper-default
  // remains the synth target, which makes the runtime fallback path (caller-arg evaluates
  // to undefined -> wrapper-default fires) carry the polyfill
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
    // `_globalThis` etc. into the range that synth-swap will replace. a fallback-logical
    // receiver is replaced WHOLE - skip its full subtree or the identifier visitor leaks a
    // dead import for the short-circuited right global
    if (receiver.type === 'LogicalExpression') t.traverseFast(receiver, node => { skippedNodes.add(node); });
    else markSynthReceiverSkipped(receiver, skippedNodes);
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
    // and synths them rather than dropping the polyfill (resolveSynthKeys folds the key to its value)
    if (!objectPattern || !isSynthSimpleObjectPattern(objectPattern.node, { allowLiteralComputedKeys: true })) return false;
    // bail when any computed-key sibling is a generated import (polyfill-rewritten symbol) rather
    // than a user const-key, so per-branch synth stays aligned with unplugin (which bails on the
    // original `Symbol.iterator` MemberExpression)
    if (!patternComputedKeysSynthSafe(t, objectPattern.node, objectPattern.scope)) return false;
    // a user-const computed key (`const k = 'from'; [k]`) resolves to its static name for the branch
    // viability lookup but registers under its synth SLOT key (`[k]`), so buildSynthLiteral emits
    // `[k]: _polyfill` instead of dropping the polyfill. the resolved value also polyfills a sibling-
    // aliasing computed key (`{ from, [k]: x }` with k='from' -> both get `_Array$from`), avoiding the
    // overwrite that dropped the shorthand polyfill. a dynamic key (lookupKey null) bails
    const { lookupKey, slotKey } = resolveSynthKeys({ node: prop.node, scope: objectPattern.scope, adapter });
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
  function collapseProxyGlobalReceiver(receiver) {
    if (!t.isMemberExpression(receiver) && !t.isOptionalMemberExpression(receiver)) return null;
    // collapsible only when the whole `.object` is the pure-proxy navigation (its full span is the
    // prefix) and `.property` is the constructor leaf
    if (maximalProxyGlobalPrefix(receiver) !== receiver.object) return null;
    const root = findProxyGlobal(receiver);
    const rootPure = root && resolvePure({ kind: 'global', name: root.name });
    if (!rootPure || rootPure.kind === 'instance') return null;
    // SE prefixes buried along the hop chain keep evaluating (root-first order):
    // `(eff(), globalThis).self.X` collapses to `(eff(), _globalThis).X`, not `_globalThis.X`
    const prefixes = collectBuriedChainSePrefixes(receiver.object);
    const rootBinding = injectPureImport(rootPure.entry, rootPure.hintName);
    const rootNode = prefixes.length
      ? t.sequenceExpression([...prefixes.map(expr => t.cloneNode(expr)), rootBinding])
      : rootBinding;
    // keep the leaf's own computed flag: `globalThis.self['Object']` collapses to
    // `_globalThis['Object']` - leaving the hop verbatim reads `.self` off the global
    // object, which is undefined on hosts without it (ie:11 pure, Node)
    return t.memberExpression(rootNode, t.cloneNode(receiver.property), receiver.computed);
  }

  // build the synth `{key: _polyfill, otherKey: R.otherKey}` literal that swaps the
  // receiver. polyfilled keys come from `pending.polyfills` (lazy import via
  // `injectPureImport`); unpolyfilled keys fall back to a member access through the
  // receiver - injected as a pure import when the receiver is itself a polyfillable global,
  // collapsed to the polyfilled root for a proxy-global member chain, raw otherwise.
  // all-polyfilled cases never call `getReceiverRef`, keeping the import set clean
  function buildSynthLiteral(receiver, { objectPatternNode, polyfills }, memoParam = null) {
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
      return receiverRef = collapseProxyGlobalReceiver(readReceiver) ?? readReceiver;
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
        const literal = buildSynthLiteral(path.node, pending, memoParam);
        path.replaceWith(needMemo
          ? t.callExpression(
            t.functionExpression(null, [memoParam], t.blockStatement([t.returnStatement(literal)])),
            [t.cloneNode(path.node, true)])
          : pending.rescueSe
            ? t.sequenceExpression([t.cloneNode(path.node, true), literal])
            : literal);
        pending.applied = true;
        path.skip();
      },
    });
  }

  return { apply, collapseProxyGlobalReceiver, findTargetPath, registerPolyfill, tryRegisterPerBranchSynth };
}
