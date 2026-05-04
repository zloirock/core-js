// paren + TS combinations under createParenthesizedExpressions. `isSafeToReuse` peels
// ParenthesizedExpression but deliberately keeps TS_EXPR_WRAPPERS in the check (to stay
// in sync with unplugin's source-text regex). so:
//   - `(((arr) as any))?.at?.(0)` peels outer paren -> TSAsExpression -> NOT safe -> _ref
//   - `((arr! as any))?.flat?.()` paren -> TSNonNullExpression -> NOT safe -> _ref
//   - `(((arr as any) as any))?.includes?.('x')` paren -> nested TS -> NOT safe -> _ref
// all three allocate `_ref` exactly once - paren peel doesn't bypass the TS-wrapper rule.
// the paren-peel fix surfaces in `audit-optional-paren-wraps-inner-member` (paren-only,
// `(arr)` -> NO _ref); this fixture locks the paren+TS asymmetry
const a = (((arr) as any))?.at?.(0);
const b = ((arr! as any))?.flat?.();
const c = (((arr as any) as any))?.includes?.('x');
export { a, b, c };
