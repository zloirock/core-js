import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// boolean options accept `null` symmetric to `undefined` (`isEmpty` predicate).
// build configs commonly use conditional spreads like
// `{ debug: dev ? true : null }` to clear an option without removing it - this
// fixture documents that `null` passes validation cleanly and the option-type
// error message now reflects "null, or undefined" instead of the stale
// "or undefined"-only phrasing
_atMaybeArray(_ref = [1, 2, 3]).call(_ref, -1);