import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Map from "@core-js/pure/actual/map/constructor";
// DUPLICATED receiver path (the residual SURVIVES): a multi-binding destructure extracts a nested
// instance method while a sibling binding keeps the residual alive, so the receiver is BOTH copied into
// the extraction AND kept in place. the receiver carries a FUNCTION value whose body references a
// polyfillable global / makes an instance call - those must substitute in the copy AND the residual
// (visitor-driven, scope-aware), like babel's clone+re-traverse, not left raw as a global-only walk would.
// distinct multi-type instance methods per line so each copy is attributable.
const a = _atMaybeArray([() => _Map]);
const { y: { at: _unused }, k } = { y: [() => _Map], k: 1 };
const b = _includesMaybeArray([() => { var _ref; return _flatMaybeArray(_ref = [1, 2]).call(_ref); }]);
const { z: { includes: _unused2 }, j } = { z: [() => { var _ref; return _flatMaybeArray(_ref = [1, 2]).call(_ref); }], j: 2 };
export const r = [a, b, k, j];