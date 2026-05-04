import _at from "@core-js/pure/actual/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3;
// paren + TS combinations under createParenthesizedExpressions. `isSafeToReuse` peels
// ParenthesizedExpression but deliberately keeps TS_EXPR_WRAPPERS in the check (to stay
// in sync with unplugin's source-text regex). so:
//   - `(((arr) as any))?.at?.(0)` peels outer paren -> TSAsExpression -> NOT safe -> _ref
//   - `((arr! as any))?.flat?.()` paren -> TSNonNullExpression -> NOT safe -> _ref
//   - `(((arr as any) as any))?.includes?.('x')` paren -> nested TS -> NOT safe -> _ref
// all three allocate `_ref` exactly once - paren peel doesn't bypass the TS-wrapper rule.
// the paren-peel fix surfaces in `audit-optional-paren-wraps-inner-member` (paren-only,
// `(arr)` -> NO _ref); this fixture locks the paren+TS asymmetry
const a = null == (_ref = (((arr) as any))) ? void 0 : _at(_ref)?.call(_ref, 0);
const b = null == (_ref2 = ((arr! as any))) ? void 0 : _flatMaybeArray(_ref2)?.call(_ref2);
const c = null == (_ref3 = (((arr as any) as any))) ? void 0 : _includes(_ref3)?.call(_ref3, 'x');
export { a, b, c };