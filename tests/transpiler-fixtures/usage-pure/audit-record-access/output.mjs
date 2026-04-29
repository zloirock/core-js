import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// Record<K, V> member access - utility-type member lookup synthesizes an index signature
// returning V. `rec.anything.at` resolves with the V-typed receiver, so V = string[]
// routes to the Array.at instance polyfill.
declare const rec: Record<string, string[]>;
_atMaybeArray(_ref = rec.foo).call(_ref, 0);
_includesMaybeArray(_ref2 = rec.bar).call(_ref2, 'x');