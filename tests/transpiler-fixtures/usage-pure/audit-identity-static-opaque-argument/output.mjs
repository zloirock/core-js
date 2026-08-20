import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
import _Object$freeze from "@core-js/pure/actual/object/freeze";
var _ref, _ref2;
// an identity static returns its argument, so an unresolvable argument makes the call
// unresolvable too - the registry's generic Object hint would suppress the instance polyfill
// outright, which is a missed polyfill on the target rather than a lost narrow
declare const opaque: any;
_at(_ref = _Object$freeze(opaque)).call(_ref, 0);
_includesMaybeArray(_ref2 = Object.freeze([1, 2])).call(_ref2, 1);