// pure path/AST helpers for destructure-receiver classification. depend only on shared
// helpers from polyfill-provider, no file-scope state - callers pass paths / nodes directly
import {
  findIifeArgForParam,
  isClassifiableReceiverArg,
  unwrapRuntimeExpr,
  unwrapSafeSequenceTail,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { canTransformDestructuring as sharedCanTransformDestructuring } from '@core-js/polyfill-provider/detect-usage/destructure';

// intermediate slots permitted on the walk from an inner Property up to the enclosing
// VariableDeclaration. any other shape -> foreign wrapper, bail safely
const NESTED_DESTRUCTURE_WALK_TYPES = new Set(['ObjectPattern', 'Property', 'VariableDeclarator']);

// walk Property/ObjectPattern pairs up to the enclosing VariableDeclaration. 2-level
// nest is 5 hops, every additional alias-hop adds 2. returns the declaration's path
// or null when the chain leaves the allowed-types set
export function walkUpNestedDestructureToDeclaration(startPath) {
  let current = startPath;
  while (current && current.node?.type !== 'VariableDeclaration') {
    if (!NESTED_DESTRUCTURE_WALK_TYPES.has(current.node?.type)) return null;
    current = current.parentPath;
  }
  return current;
}

// walk up the nested-destructure chain to the outer ObjectPattern, then to the host
// (AssignmentExpression). returns the host path or null. mirror of
// `walkUpNestedDestructureToDeclaration` but terminating at AssignmentExpression
export function walkUpNestedDestructureToAssignment(startPath) {
  let current = startPath;
  while (current && current.node?.type !== 'AssignmentExpression') {
    if (!NESTED_DESTRUCTURE_WALK_TYPES.has(current.node?.type)) return null;
    current = current.parentPath;
  }
  return current;
}

// gate `metaPath` for destructure rewrite: skip Property-of-Property nesting (handled by
// the nested-proxy flatten path), accept CatchClause (treated as variable-decl with
// generated ref), and apply the shared shape filter on the parent declarator/assignment.
// ESTree-specific: assignment-target form must sit inside ExpressionStatement (oxc keeps
// ParenthesizedExpression around `({p} = R)`, peel before checking)
export function canTransformDestructuring(metaPath) {
  const objectPattern = metaPath.parent;
  if (!objectPattern) return false;
  const declaratorPath = metaPath.parentPath?.parentPath;
  if (!declaratorPath?.node) return false;
  if (declaratorPath.node.type === 'Property') return false;
  // catch ({ includes }) {} - treat like a variable declarator with generated ref
  if (declaratorPath.node.type === 'CatchClause') return true;
  if (!sharedCanTransformDestructuring({
    parentType: declaratorPath.node.type,
    parentInit: declaratorPath.node.init,
    grandParentType: declaratorPath.parentPath?.parentPath?.node?.type,
  })) return false;
  if (declaratorPath.node.type === 'AssignmentExpression') {
    let exprParent = declaratorPath.parentPath;
    while (exprParent?.node?.type === 'ParenthesizedExpression') exprParent = exprParent.parentPath;
    if (exprParent?.node?.type !== 'ExpressionStatement') return false;
  }
  return true;
}

// find the call-arg node a bare-ObjectPattern IIFE param resolves to. arrow-only on
// purpose - FunctionExpression IIFE has its own `this` binding, so destructure-receiver
// semantics differ enough that synth-swap would be unsafe. expands inline-array spreads
// (`...[R]`) the same way `resolveCallArgument` does; non-literal spread returns null
// (static index unknown). arrow-only is a deliberate narrowing on top of the shared
// `findIifeArgForParam` (which accepts both arrow and FunctionExpression for
// resolution-layer use). SE-tail peel (`(0, (1, R))` -> `R`) so nested + flat
// SequenceExpression args classify identically
export function detectIifeArgReceiver(wrapperPath, objectPattern) {
  if (wrapperPath?.node?.type !== 'ArrowFunctionExpression') return null;
  const arg = findIifeArgForParam(wrapperPath, objectPattern);
  return arg ? unwrapSafeSequenceTail(arg) : arg;
}

// receiver node to swap; null means inline-default fallback. handles
// `function({p} = R)` (AssignmentPattern.right) and arrow IIFE `(({p}) => body)(R)`
// (call-arg node, expanding inline-array spreads).
// mirrors babel-plugin's `findSynthSwapTargetPath` and the resolution-layer narrowing:
// caller-arg replaces wrapper-default ONLY when statically classifiable (Identifier).
// for non-Identifier caller-arg, wrapper-default remains the synth target so the
// runtime fallback path carries the polyfill
export function findSynthSwapReceiver(wrapperPath, objectPattern) {
  if (objectPattern?.properties?.some(p => p.type === 'RestElement' || p.type === 'SpreadElement')) return null;
  const wrapper = wrapperPath?.node;
  if (wrapper?.type === 'AssignmentPattern' && wrapper.left === objectPattern) {
    // peel ParenthesizedExpression / TS expression wrappers (`as`, `satisfies`, `!`) /
    // chain so `function f({from} = (Array))`, `function f({from} = Array as any)`,
    // `function f({from} = Array!)` all match the bare-`Array` synth-swap path. mirrors
    // babel-plugin's `peelTransparentPath` (synth-swap-emitter.js) - both pipelines now
    // emit the same shape (`{from: _Array$from} as any`)
    const peeled = unwrapRuntimeExpr(wrapper.right);
    if (peeled?.type === 'Identifier') {
      const argReceiver = detectIifeArgReceiver(wrapperPath.parentPath, wrapperPath.node);
      return isClassifiableReceiverArg(argReceiver) ? argReceiver : peeled;
    }
  }
  const argReceiver = detectIifeArgReceiver(wrapperPath, objectPattern);
  return isClassifiableReceiverArg(argReceiver) ? argReceiver : null;
}
