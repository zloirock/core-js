import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// Record<K, V> member access — getTypeMembers synthesizes a TSIndexSignature with V.
// Plugin should resolve `rec.anything.at` to V-typed receiver. V = string[], so Array.at.
declare const rec: Record<string, string[]>;
_atMaybeArray(_ref = rec.foo).call(_ref, 0);
_includesMaybeArray(_ref2 = rec.bar).call(_ref2, 'x');