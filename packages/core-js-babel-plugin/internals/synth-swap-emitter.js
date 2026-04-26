// receiver-targeted synth-swap pipeline. covers two detection shapes:
//   - param-default `function({p} = R) {}`: receiver = AssignmentPattern.right
//   - arrow IIFE `(({p}) => body)(R)`: receiver = CallExpression.arguments[i]
// receivers are accumulated as the visitor walks (`registerPolyfill` /
// `tryRegisterPerBranchSynth`) and drained at programExit (`apply`) once the polyfill
// set per receiver is final - swapping mid-traverse would route later sibling props to
// the partial synth and miss their polyfill. keyed on receiver AST node identity:
// sibling plugins that clone nodes via `t.cloneNode` produce fresh identities and
// fragment the swap. under standard babel plugin ordering this is safe; coexistence
// with plugins that clone a common ancestor is not supported
import {
  findIifeCallSite,
  getFallbackBranchSlots,
  isClassifiableReceiverArg,
  isSynthSimpleObjectPattern,
  mayHaveSideEffects,
  TS_EXPR_WRAPPERS,
} from '@core-js/polyfill-provider/helpers';
import { isViableBranchForKey } from '@core-js/polyfill-provider/detect-usage';

export default function createSynthSwapEmitter({
  adapter,
  injectPureImport,
  isOrphaned,
  resolvePure,
  skippedNodes,
  t,
}) {
  const synthSwapByReceiver = new WeakMap();
  const pendingSwaps = [];

  // `(fn, R)` as an IIFE arg evaluates to its last expression. side-effect-free preceding
  // expressions can be dropped from the synth target resolution (R becomes the receiver);
  // preceding effects leave the path as-is so synth-swap bails back to inline-default
  function unwrapSequenceTail(argPath) {
    if (!argPath?.isSequenceExpression()) return argPath;
    const exprs = argPath.get('expressions');
    if (exprs.slice(0, -1).some(e => mayHaveSideEffects(e.node))) return argPath;
    return exprs.at(-1) ?? argPath;
  }

  // path-iteration with inline-spread expansion + `unwrapSequenceTail`. arrow IIFE only -
  // FunctionExpression has its own `this` binding, so receiver semantics differ enough
  // that synth-swap would be unsafe
  function detectIifeArgPath(wrapper, objectPattern) {
    if (!wrapper?.isArrowFunctionExpression()) return null;
    const site = findIifeCallSite(wrapper, objectPattern.node);
    if (!site) return null;
    let i = 0;
    for (const aP of site.callPath.get('arguments')) {
      if (aP.isSpreadElement()) {
        if (!aP.get('argument').isArrayExpression()) return null;
        for (const elP of aP.get('argument').get('elements')) {
          if (i === site.paramIndex) return unwrapSequenceTail(elP);
          i++;
        }
        continue;
      }
      if (i === site.paramIndex) return unwrapSequenceTail(aP);
      i++;
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
    if (objectPattern.node.properties.some(p => t.isRestElement(p))) return null;
    if (wrapper?.isAssignmentPattern() && t.isIdentifier(wrapper.node.right)) {
      const argPath = detectIifeArgPath(wrapper.parentPath, wrapper);
      if (argPath && isClassifiableReceiverArg(argPath.node)) return argPath;
      return wrapper.get('right');
    }
    const argPath = detectIifeArgPath(wrapper, objectPattern);
    return argPath && isClassifiableReceiverArg(argPath.node) ? argPath : null;
  }

  // register a polyfill for a single key on a synth target. ensures the pending entry
  // exists, marks the receiver in `skippedNodes` (identifier visitor would race on the
  // same node and emit a parallel `_Receiver` import that gets dropped post-swap)
  function registerPolyfill(targetPath, objectPatternPath, key, entry, hintName) {
    const receiver = targetPath.node;
    skippedNodes.add(receiver);
    let pending = synthSwapByReceiver.get(receiver);
    if (!pending) {
      // keep the ObjectPattern's PATH (not just node) so apply() can verify it's still
      // live in the AST: a sibling plugin may `replaceWith` the pattern between enqueue
      // and emission, leaving our captured node stale. path identity + orphan check is
      // the only safe way to detect "pattern still installed at the same slot"
      pending = {
        targetPath,
        objectPatternPath,
        objectPatternNode: objectPatternPath.node,
        polyfills: new Map(),
      };
      synthSwapByReceiver.set(receiver, pending);
      pendingSwaps.push(pending);
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
    if (!objectPattern || !isSynthSimpleObjectPattern(objectPattern.node)) return false;
    if (prop.node.computed || !t.isIdentifier(prop.node.key)) return false;
    // peel TS wrappers (`(cond ? A : B) as any`) so the conditional underneath reaches
    // the slot resolver. babel parser strips parens but keeps TSAsExpression / `!` as
    // first-class wrappers. NOTE: do NOT peel chain-assignment here - `foo = cond ? A : B`
    // is intentional escape hatch (rewriting branches as synth literals would change
    // `foo`'s runtime value, see `audit-per-branch-chain-assignment`)
    let innerPath = rhsPath;
    while (innerPath?.node && TS_EXPR_WRAPPERS.has(innerPath.node.type)) {
      innerPath = innerPath.get('expression');
    }
    const slots = getFallbackBranchSlots(innerPath?.node);
    if (!slots) return false;
    const key = prop.node.key.name;
    let registered = false;
    for (const slot of slots) {
      const branchPath = innerPath.get(slot);
      const branch = branchPath.node;
      const pure = isViableBranchForKey(branch, key, branchPath.scope, adapter, resolvePure);
      if (!pure) continue;
      registerPolyfill(branchPath, objectPattern, key, pure.entry, pure.hintName);
      registered = true;
    }
    return registered;
  }

  // drain: swap deferred destructure receivers with synthesized polyfill-backed objects.
  // all sibling props have now been visited against the original receiver, so the key set
  // is final. synth covers every destructured key: polyfilled -> polyfill id; native ->
  // `R.key` ref. skip if the shape was mutated by another plugin (orphaned / non-Identifier
  // receiver / non-ObjectPattern) - losing the polyfill is preferable to emitting against
  // an unexpected shape
  function apply() {
    for (const { targetPath, objectPatternPath, objectPatternNode, polyfills } of pendingSwaps) {
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
        // injectPureImport already returns a fresh clone; another cloneNode here would be a no-op copy
        const value = pending
          ? injectPureImport(pending.entry, pending.hintName)
          : t.memberExpression(t.cloneNode(getReceiverRef()), t.identifier(p.key.name));
        synthProps.push(t.objectProperty(t.identifier(p.key.name), value));
      }
      targetPath.replaceWith(t.objectExpression(synthProps));
    }
  }

  return { apply, findTargetPath, registerPolyfill, tryRegisterPerBranchSynth };
}
