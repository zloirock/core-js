// `Array.isArray(x as unknown)` - KNOWN_STATIC_TYPE_GUARDS arg lookup used `unwrapParens`
// which strips only ParenthesizedExpression. TSAsExpression / `<T>cast` / `!` survive the
// peel and `arg0.type === 'Identifier'` check fails, so the known-static-guard never
// activates and the narrow drops. switched to `unwrapRuntimeExpr` - symmetric with the
// user-predicate path (matchPredicateArg). `Array.isArray(x as unknown)` now narrows the
// element-access through the array branch
declare const x: string | string[];
if (Array.isArray(x as unknown)) {
  x.at(0);
}
