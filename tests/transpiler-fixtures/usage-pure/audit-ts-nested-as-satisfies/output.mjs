import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// nested TS `as` and `satisfies` casts on a single expression: both wrappers are
// peeled so the polyfill rewrite recognises the underlying expression.
const x = _atMaybeArray(_ref = arr as string[]).call(_ref, 0) satisfies string;
const y = _includesMaybeArray(_ref2 = arr as string[]).call(_ref2, 'test');