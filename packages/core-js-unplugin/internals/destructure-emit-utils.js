// path/AST helpers for destructure-receiver classification, plus the FRAME stamp a receiver the
// channel pulls in from elsewhere carries. depend only on shared helpers from polyfill-provider -
// callers pass paths / nodes directly; the one piece of file-scope state is the node-keyed stamp
// registry below, which lives and dies with the parse
import {
  isReceiverShapedNode,
  findIifeArgForParam,
  findIifeCallSite,
  unwrapSafeSequenceTail,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { isClassifiableReceiverArg, isExpandedClassifiableReceiver } from '@core-js/polyfill-provider/helpers/class-walk';
import { nodeSite, stampNodeSite } from './nav-spine.js';
import {
  resolvableArgSupersedesDeadDefault,
} from '@core-js/polyfill-provider/detect-usage/destructure';

// find the call-arg node a bare-ObjectPattern IIFE param resolves to. `findIifeArgForParam`
// itself gates on `FN_NODE_TYPES` (ArrowFunctionExpression / FunctionExpression) and returns
// null for foreign wrapper types - no separate type guard needed here. expands inline-array
// spreads (`...[R]`) via `resolveCallArgument`; non-literal spread returns null (static
// index unknown). SE-tail peel (`(0, (1, R))` -> `R`) so nested + flat SequenceExpression
// args classify identically. exported for the IIFE-argument instance clause, which needs the
// raw argument node ahead of the classifiable-receiver gate this file's own callers apply
export function detectIifeArgReceiver(wrapperPath, objectPattern) {
  const arg = findIifeArgForParam(wrapperPath, objectPattern);
  if (!arg) return arg;
  const callPath = findIifeCallSite(wrapperPath, objectPattern)?.callPath;
  return stampNodeSite(unwrapSafeSequenceTail(arg), callPath && { scope: callPath.scope, path: callPath });
}

// receiver node to swap; null means inline-default fallback. handles
// `function({p} = R)` (AssignmentPattern.right) and arrow IIFE `(({p}) => body)(R)`
// (call-arg node, expanding inline-array spreads).
// mirrors babel-plugin's `findTargetPath` and the resolution-layer choice: a classifiable
// bare-Identifier caller-arg wins first; then a RESOLVABLE non-Identifier arg (proxy-global
// member, inline-resolvable call) wins over a polyfill-DEAD-END default via
// `resolvableArgSupersedesDeadDefault`; otherwise the wrapper-default stays the synth target
export function findSynthSwapReceiver(wrapperPath, objectPattern, scope, adapter, resolvePure = null) {
  if (objectPattern?.properties?.some(p => p.type === 'RestElement' || p.type === 'SpreadElement')) return null;
  const wrapper = wrapperPath?.node;
  if (wrapper?.type === 'AssignmentPattern' && wrapper.left === objectPattern) {
    // peel parens / TS wrappers / SE-tail through `unwrapSafeSequenceTail` (alternates
    // wrapper peel and SE-tail extraction internally) so all shapes reach the inner
    // receiver:
    //   `function f({from} = (Array))`            - parens
    //   `function f({from} = Array as any)`       - TS cast
    //   `function f({from} = (0, Array))`         - SE tail (minified)
    //   `function f({from} = (logCall(), Array))` - SE tail with side-effecting prefix
    // SE peel is unconditional - synth replaces only the tail node, prefix runs at
    // runtime as written. caller's `({from: customFn})` beats the synth (default fires
    // only when caller-arg is undefined), preserving caller-passed values
    const peeled = unwrapSafeSequenceTail(wrapper.right);
    // IIFE caller-arg consult comes FIRST (mirroring the meta layer's order, babel-twin
    // contract): a classifiable live arg wins regardless of the wrapper-default's shape -
    // gating on the default first bailed `(({ from } = []) => ...)(Array)` to a native-first
    // inline default even though the live receiver was statically known
    const argReceiver = detectIifeArgReceiver(wrapperPath.parentPath, wrapperPath.node);
    // the arg is classified and resolved WHERE IT EVALUATES - the detector stamped that frame on it
    const { scope: argScope, path: argPath } = nodeSite(argReceiver, wrapperPath);
    if (isClassifiableReceiverArg(argReceiver, argScope, adapter)) return argReceiver;
    // a resolvable non-Identifier arg (proxy-global member `globalThis.Array`, inline-resolvable call)
    // supersedes the default when the default is a polyfill dead-end - mirrors `chooseFallbackReceiverNode`
    if (resolvableArgSupersedesDeadDefault({
      argNode: argReceiver,
      defaultNode: peeled,
      objectPattern,
      scope,
      adapter,
      path: wrapperPath,
      resolvePure,
      argScope,
      argPath,
    })) return argReceiver;
    // a fallback-shaped default (`Array || Iterator`, `?? Iterator`) collapses LEFT - the synth
    // replaces the whole expression (babel-twin contract); `&&` selects its right side and stays out
    const fallbackCollapse = peeled?.type === 'LogicalExpression' && peeled.operator !== '&&'
      && isReceiverShapedNode(unwrapSafeSequenceTail(peeled.left));
    // a `this` default inside a STATIC method reads the inherited static surface: the meta
    // funnel already resolved it against the extends host (resolution is the drain gate -
    // an unresolved `this` never reaches the synth registration), so the shape is admitted
    if (!fallbackCollapse && !isReceiverShapedNode(peeled) && peeled?.type !== 'ThisExpression') return null;
    return peeled;
  }
  // no wrapper-default: no fallback target to preserve, so accept any statically-classifiable
  // receiver (bare Identifier OR proxy-global MemberExpression like `globalThis.Map`).
  // mismatched non-resolvable receiver is harmless - synth-swap drains only when resolution
  // succeeds, otherwise destructure-emitter falls through to inline-default
  const argReceiver = detectIifeArgReceiver(wrapperPath, objectPattern);
  return isExpandedClassifiableReceiver({ node: argReceiver }) ? argReceiver : null;
}
