// pure path/AST helpers for destructure-receiver classification. depend only on shared
// helpers from polyfill-provider, no file-scope state - callers pass paths / nodes directly
import {
  findIifeArgForParam,
  unwrapSafeSequenceTail,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import {
  isClassifiableReceiverArg,
  isExpandedClassifiableReceiver,
} from '@core-js/polyfill-provider/helpers/class-walk';
import { canTransformDestructuring as sharedCanTransformDestructuring } from '@core-js/polyfill-provider/detect-usage/destructure';

// intermediate slots permitted on the walk from an inner Property up to the enclosing
// VariableDeclaration. any other shape -> foreign wrapper, bail safely.
// AssignmentPattern allowed for inner-default wrappers (`{...} = {}`) - proxy-global
// receivers are always defined so the default never fires; ArrayPattern allowed for
// single-element wrappers (`[{...}] = [globalThis]`) - walker drops the whole declaration
// and the wrapper / its array literal init together
const NESTED_DESTRUCTURE_WALK_TYPES = new Set([
  'ObjectPattern',
  'Property',
  'VariableDeclarator',
  'AssignmentPattern',
  'ArrayPattern',
]);

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

// find the call-arg node a bare-ObjectPattern IIFE param resolves to. accepts both
// ArrowFunctionExpression and FunctionExpression: arrow lacks `arguments`, function has
// its own - swapping caller-arg with the synth `{key: _polyfill}` literal is observable
// via `arguments[0]` only when body reads it (niche pattern). polyfill-always-wins contract
// for usage-pure mode wins the trade-off vs preserving original arg in `arguments`. expands
// inline-array spreads (`...[R]`) the same way `resolveCallArgument` does; non-literal
// spread returns null (static index unknown). SE-tail peel (`(0, (1, R))` -> `R`) so
// nested + flat SequenceExpression args classify identically
export function detectIifeArgReceiver(wrapperPath, objectPattern) {
  const t = wrapperPath?.node?.type;
  if (t !== 'ArrowFunctionExpression' && t !== 'FunctionExpression') return null;
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
    if (peeled?.type !== 'Identifier' && peeled?.type !== 'MemberExpression') return null;
    // IIFE caller-arg overrides only when default is an Identifier (resolution layer needs
    // a classifiable name); MemberExpression default has no caller-arg path, falls through
    // to peeled. trade-off accepted: side effect of receiver chain evaluation (`window`)
    // is skipped on caller-omitted invocation, polyfill always wins
    if (peeled.type === 'Identifier') {
      const argReceiver = detectIifeArgReceiver(wrapperPath.parentPath, wrapperPath.node);
      if (isClassifiableReceiverArg(argReceiver)) return argReceiver;
    }
    return peeled;
  }
  // no wrapper-default: no fallback target to preserve, so accept any statically-classifiable
  // receiver (bare Identifier OR proxy-global MemberExpression like `globalThis.Map`).
  // mismatched non-resolvable receiver is harmless - synth-swap drains only when resolution
  // succeeds, otherwise destructure-emitter falls through to inline-default
  const argReceiver = detectIifeArgReceiver(wrapperPath, objectPattern);
  return isExpandedClassifiableReceiver(argReceiver) ? argReceiver : null;
}
