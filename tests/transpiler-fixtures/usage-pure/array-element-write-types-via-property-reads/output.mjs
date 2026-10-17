import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// non-method member reads stay plain reads - element precision survives
const measured = [[1], [2]];
export const viaPropertyReads = _includesMaybeArray(_ref = measured[0]).call(_ref, 7);