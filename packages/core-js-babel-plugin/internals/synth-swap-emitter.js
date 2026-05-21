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
import { isViableBranchForKey } from '@core-js/polyfill-provider/detect-usage/destructure';

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
      // accept OptionalMemberExpression too (`{from} = globalThis?.Array`) - symmetric with
      // `isExpandedClassifiableReceiver`'s `globalProxyMemberName` walk which already handles
      // optional-chain shapes. without OME the OME-default silently bails to inline-default
      if (!t.isIdentifier(rightPath.node) && !t.isMemberExpression(rightPath.node)
        && !t.isOptionalMemberExpression(rightPath.node)) return null;
      // IIFE caller-arg overrides only when the default is an Identifier (resolution layer
      // requires a classifiable name); MemberExpression default has no caller-arg path,
      // falls straight through to rightPath
      if (t.isIdentifier(rightPath.node)) {
        const argPath = detectIifeArgPath(wrapper.parentPath, wrapper);
        if (argPath && isClassifiableReceiverArg(argPath.node)) return argPath;
      }
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
  function registerPolyfill({ targetPath, objectPatternPath, key, entry, hintName }) {
    const receiver = targetPath.node;
    // synth-swap owns the receiver chain - for proxy-global MemberExpression receivers
    // (`globalThis.Map`) walk down `.object` so inner Identifier visitors don't emit
    // `_globalThis` etc. into the range that synth-swap will replace
    markSynthReceiverSkipped(receiver, skippedNodes);
    let pending = synthSwapByReceiver.get(receiver);
    if (!pending) {
      // capture the ObjectPattern NODE (not path) for the same node-identity reason -
      // we don't need the live path; the captured key set is final at registration
      // time and apply() emits synth properties from the captured properties array
      pending = {
        objectPatternNode: objectPatternPath.node,
        polyfills: new Map(),
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
      const pure = isViableBranchForKey({ branch, key, scope: branchPath.scope, adapter, resolvePure, path: branchPath });
      if (!pure) continue;
      registerPolyfill({ targetPath: branchPath, objectPatternPath: objectPattern, key, entry: pure.entry, hintName: pure.hintName });
      registered = true;
    }
    return registered;
  }

  // accept Identifier (`Array`) and (Optional)MemberExpression (`window.Array`,
  // `globalThis?.Array`) receivers. for member-chain shapes, unpolyfilled keys still re-read
  // through the chain (`window.Array.other`) - each clone re-evaluates the receiver expression.
  // trade-off: lifting the chain to a temp would change AST shape (require IIFE wrap or
  // explicit binding) and for usage-pure mode the typical pattern is all-polyfilled keys,
  // single re-evaluation. accepting OptionalMemberExpression mirrors `isViableBranchForKey`
  // (in destructure.js) so per-branch synth-swap doesn't bail on `cond ? A : opt?.A` shapes
  function isReplaceableReceiver(node) {
    return t.isIdentifier(node) || t.isMemberExpression(node) || t.isOptionalMemberExpression(node);
  }

  // build the synth `{key: _polyfill, otherKey: R.otherKey}` literal that swaps the
  // receiver. polyfilled keys come from `pending.polyfills` (lazy import via
  // `injectPureImport`); unpolyfilled keys fall back to a member access through the
  // receiver - injected as `_Receiver` polyfill alias when the receiver is itself a
  // polyfillable global, raw Identifier otherwise. all-polyfilled cases never call
  // `getReceiverRef`, keeping the import set clean
  function buildSynthLiteral(receiver, { objectPatternNode, polyfills }) {
    // `isExpandedClassifiableReceiver` accepts both bare Identifier (`Array`) and proxy-global
    // MemberExpression (`globalThis.Array`). only the Identifier shape has a `.name` slot worth
    // probing `resolvePure` against; MemberExpression receivers fall through to the as-is
    // member-access fallback below without spending a polyfill lookup on `undefined`
    const receiverPure = receiver.type === 'Identifier'
      ? resolvePure({ kind: 'global', name: receiver.name }) : null;
    const isPolyfillableGlobal = receiverPure && receiverPure.kind !== 'instance';
    let receiverRef = null;

    function getReceiverRef() {
      return receiverRef ??= isPolyfillableGlobal
        ? injectPureImport(receiverPure.entry, receiverPure.hintName) : receiver;
    }

    const properties = [];
    for (const property of objectPatternNode.properties) {
      if (!t.isObjectProperty(property) || property.computed || !t.isIdentifier(property.key)) continue;
      const queued = polyfills.get(property.key.name);
      // injectPureImport already returns a fresh clone; another cloneNode here would be a no-op copy
      const value = queued
        ? injectPureImport(queued.entry, queued.hintName)
        : t.memberExpression(t.cloneNode(getReceiverRef()), t.identifier(property.key.name));
      properties.push(t.objectProperty(t.identifier(property.key.name), value));
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
        if (!isReplaceableReceiver(path.node) || pending.objectPatternNode?.type !== 'ObjectPattern') return;
        // mark `applied` AFTER `replaceWith` returns. setting BEFORE means a thrown
        // replaceWith (sibling-plugin claimed the path mid-traversal, AST-validation
        // failure inside buildSynthLiteral) leaves the swap permanently locked but with
        // the imports for its polyfill keys already injected by `buildSynthLiteral` -
        // dead imports + missing rewrite. ordering after the call leaves `applied: false`
        // on failure so a subsequent `apply` pass can retry
        path.replaceWith(buildSynthLiteral(path.node, pending));
        pending.applied = true;
        path.skip();
      },
    });
  }

  return { apply, findTargetPath, registerPolyfill, tryRegisterPerBranchSynth };
}
