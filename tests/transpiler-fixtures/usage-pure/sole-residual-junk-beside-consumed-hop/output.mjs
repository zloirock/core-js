import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
// The claims consumed out of a ctor hop leave a residual whose sole prop is that hop; the residual
// re-anchors at the ctor the way an untouched host does, on both legs, after the extractions drained.
const {
  Array: {
    of: {
      name: soleResidual
    },
    junk: soleResidualJunk
  }
} = {
  Array: {
    of: {
      name: _nameMaybeFunction(_Array$of)
    },
    junk: _globalThis.Array.junk
  }
};
const soleInstanceResidual = _atMaybeArray(_globalThis.Array.prototype);
const {
  junk: soleInstanceJunk
} = _globalThis.Array;
export { soleResidual, soleResidualJunk, soleInstanceResidual, soleInstanceJunk };