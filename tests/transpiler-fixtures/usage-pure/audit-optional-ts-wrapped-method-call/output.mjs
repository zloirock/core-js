import _at from "@core-js/pure/actual/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref2;
// TS-wrapped object expression in optional call: `((obj as any)?.at)?.(0)`. tests
// `normalizeOptionalChain`'s walk past TS wrappers between the replaced inner member
// and the outer optional. distinct second method on the next line for observable dispatch
const a = null == (_ref = obj as any) ? void 0 : _at(_ref)?.call(_ref, 0);
const b = null == (_ref2 = obj as any) ? void 0 : _flatMaybeArray(_ref2)?.call(_ref2);