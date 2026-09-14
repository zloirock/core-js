import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
const soleResidual = _nameMaybeFunction(_Array$of);
// The claims consumed out of a ctor hop leave a residual whose sole prop is that hop; the residual
// re-anchors at the ctor the way an untouched host does, on both legs, after the extractions drained.
const {
  junk: soleResidualJunk
} = _globalThis.Array;
const soleInstanceResidual = _atMaybeArray(_globalThis.Array.prototype);
const {
  junk: soleInstanceJunk
} = _globalThis.Array;
export { soleResidual, soleResidualJunk, soleInstanceResidual, soleInstanceJunk };