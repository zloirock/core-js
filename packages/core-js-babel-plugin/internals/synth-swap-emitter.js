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
  TRANSPARENT_EXPR_WRAPPER_TYPES,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { isViableBranchForKey } from '@core-js/polyfill-provider/detect-usage/destructure';

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

  // `(fn, R)` as an IIFE arg evaluates to its last expression. side-effect-free preceding
  // expressions can be dropped from the synth target resolution (R becomes the receiver);
  // preceding effects leave the path as-is so synth-swap bails back to inline-default.
  // recurse into nested SequenceExpression tails (`(a, (b, R))`) so the inner peeling lands
  // on the actual receiver Identifier - flat / nested forms must classify identically.
  // also peel ParenthesizedExpression at every step (createParens=true preserves them);
  // shared `unwrapSafeSequenceTail` (node-version in `helpers/ast-patterns.js`) does the
  // same so flat / paren-wrapped forms classify identically across both runners
  function unwrapSequenceTail(argPath) {
    while (argPath?.node) {
      argPath = peelTransparentPath(argPath);
      if (!argPath?.isSequenceExpression()) return argPath;
      const expressions = argPath.get('expressions');
      if (expressions.slice(0, -1).some(expressionPath => mayHaveSideEffects(expressionPath.node))) return argPath;
      const tail = expressions.at(-1);
      if (!tail) return argPath;
      argPath = tail;
    }
    return argPath;
  }

  // path-iteration with inline-spread expansion + `unwrapSequenceTail`. arrow IIFE only -
  // FunctionExpression has its own `this` binding, so receiver semantics differ enough
  // that synth-swap would be unsafe.
  // nested SpreadElement inside the spread array (`f(...[a, ...rest])`) is variadic at
  // compile-time - `rest` may expand to any number of positions. counting it as `1` shifts
  // every subsequent positional, breaking paramIndex match. bail rather than miscount
  function detectIifeArgPath(wrapper, objectPattern) {
    if (!wrapper?.isArrowFunctionExpression()) return null;
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
      // peel parens / TS wrappers: `({from} = (Array)) => ...` (createParens=true) and
      // `({from} = Array as any) => ...` both must reach the inner Identifier so the
      // synth-swap fires instead of falling back to inline-default. mirrors unplugin's
      // `unwrapParens(wrapper.right)` in `destructure-emit-utils.js`
      const rightPath = peelTransparentPath(wrapper.get('right'));
      if (t.isIdentifier(rightPath.node)) {
        const argPath = detectIifeArgPath(wrapper.parentPath, wrapper);
        if (argPath && isClassifiableReceiverArg(argPath.node)) return argPath;
        return rightPath;
      }
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
    // first-class wrappers; createParens=true preserves ParenthesizedExpression too.
    // NOTE: do NOT peel chain-assignment here - `foo = cond ? A : B` is intentional
    // escape hatch (rewriting branches as synth literals would change `foo`'s runtime
    // value, see `audit-per-branch-chain-assignment`)
    const innerPath = peelTransparentPath(rhsPath);
    const slots = getFallbackBranchSlots(innerPath?.node);
    if (!slots) return false;
    const key = prop.node.key.name;
    let registered = false;
    for (const slot of slots) {
      // peel TS wrappers / parens from each branch BEFORE register so apply()'s
      // `t.isIdentifier(receiver)` invariant holds. without the peel `cond ? Array as any
      // : Iterator as any` registers a TSAsExpression-wrapped path; apply() then bails
      // non-deterministically (works only when a sibling constructor-polyfill happens to
      // replace the slot with a fresh Identifier)
      const branchPath = peelTransparentPath(innerPath.get(slot));
      if (!branchPath?.node) continue;
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
      // pattern-shape check: bail when the pattern was REPLACED with anything other than
      // an `_ref` Identifier (the only legitimate sibling-plugin rewrite is
      // `transform-destructuring`, which replaces ObjectPattern with `_ref` Identifier and
      // lifts `var from = _ref.from` into the body - synth-swap on the RECEIVER stays
      // semantically correct since `_ref.from` reads from the synthesized object).
      // a fresh ObjectPattern (different identity) might have different keys than the
      // original we cached - emitting synth with original keys would orphan the new bindings;
      // safer to bail
      if (isOrphaned(objectPatternPath)) continue;
      const currentPattern = objectPatternPath.node;
      if (currentPattern !== objectPatternNode && currentPattern?.type !== 'Identifier') continue;
      // lazy: only inject the receiver's pure import if a sibling prop needs the raw
      // receiver read (`_Promise.custom`). all-polyfilled destructures never call through,
      // keeping the import set clean; fallback is the original identifier when no pure
      // polyfill exists for the receiver
      const receiverPure = resolvePure({ kind: 'global', name: receiver.name });
      const isPolyfillableGlobal = receiverPure && receiverPure.kind !== 'instance';
      let receiverRef = null;
      const getReceiverRef = () => receiverRef ??= isPolyfillableGlobal
        ? injectPureImport(receiverPure.entry, receiverPure.hintName) : receiver;
      const synthProperties = [];
      for (const property of objectPatternNode.properties) {
        if (!t.isObjectProperty(property) || property.computed || !t.isIdentifier(property.key)) continue;
        const pending = polyfills.get(property.key.name);
        // injectPureImport already returns a fresh clone; another cloneNode here would be a no-op copy
        const value = pending
          ? injectPureImport(pending.entry, pending.hintName)
          : t.memberExpression(t.cloneNode(getReceiverRef()), t.identifier(property.key.name));
        synthProperties.push(t.objectProperty(t.identifier(property.key.name), value));
      }
      targetPath.replaceWith(t.objectExpression(synthProperties));
    }
  }

  return { apply, findTargetPath, registerPolyfill, tryRegisterPerBranchSynth };
}
