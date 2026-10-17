import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// element precision recurses through nested literal layers
const nested = [[[1]], [[2]]];
export const viaNestedRead = _includesMaybeArray(_ref = nested[0][0]).call(_ref, 1);