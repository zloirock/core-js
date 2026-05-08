import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3;
// Optional access through paren-wrapped TS expressions (`(...) as any`, `arr!`) must allocate `_ref`.
// Paren peel cannot bypass the TS-wrapper rule, otherwise the wrapped receiver would be re-evaluated.
const a = null == (_ref = (((arr) as any))) ? void 0 : _at(_ref)?.call(_ref, 0);
const b = null == (_ref2 = ((arr! as any))) ? void 0 : _flatMaybeArray(_ref2)?.call(_ref2);
const c = null == (_ref3 = (((arr as any) as any))) ? void 0 : _includes(_ref3)?.call(_ref3, 'x');
export { a, b, c };