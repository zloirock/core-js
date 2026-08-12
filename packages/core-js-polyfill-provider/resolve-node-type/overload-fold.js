import { discriminateOverloads } from './ast-shapes.js';
import { callArgumentPaths } from './base.js';

// TS overload selection + fold, shared by every call-return site that resolves a set of same-named call
// signatures (interface/class methods, ambient functions). literal/kind-match the call args to ONE overload
// (resolveOne it); otherwise fold the arms the args leave possible - convergent / compatible containers widen,
// a DIVERGENT set folds to null (generic), NEVER the first/last arm (which would emit a type-specific Maybe that
// throws on a foreign return). a NON-nullable arm we couldn't resolve (bare generic `<T>`, complex type) makes
// the whole set uncertain -> widen too; only a nullable / never arm is empty and stays skippable.
//   getParams(overload)          -> the param node list (for arg-discrimination)
//   resolveOne(overload)         -> the resolved return type, or null
//   getReturnAnnotation(overload)-> the raw return annotation (for the nullable check on a null resolveOne)
export function createOverloadFold({ resolveNodeType, isNullableOrNeverAnnotation, unwrapTypeAnnotation, foldUnionTypes }) {
  return function foldOverloadReturns(overloads, getParams, resolveOne, getReturnAnnotation, callPath) {
    const { selected, candidates } =
      discriminateOverloads(overloads, getParams, callArgumentPaths(callPath), resolveNodeType);
    const returns = [];
    for (const ov of selected ? [selected] : candidates) {
      const r = resolveOne(ov);
      if (r) {
        returns.push(r);
        continue;
      }
      if (!isNullableOrNeverAnnotation(unwrapTypeAnnotation(getReturnAnnotation(ov)))) return null;
    }
    if (!returns.length) return null;
    return foldUnionTypes(returns, r => r);
  };
}
