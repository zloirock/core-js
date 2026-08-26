import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref3;
// a DEFAULTED instance leaf over a NAV receiver: the guard the extraction renders reads that
// receiver exactly once, which is what the source's own read does, so a proxy-rooted nav and a
// side-effect-free member both serve it. left in the residual the claim shipped native, and on a
// target without the method the source's default won over the ponyfill - the stripped realm reads
// that as the default's value where native reads a function
const flat = (_ref = _flatMaybeArray(_globalThis.Array.prototype)) === void 0 ? null : _ref;
const bareAt = (_ref2 = _atMaybeArray(Array.prototype)) === void 0 ? null : _ref2;
let assigned;
assigned = (_ref3 = _flatMaybeArray(_globalThis.Array.prototype)) === void 0 ? null : _ref3;
// NEGATIVE: an opaque receiver keeps the residual - its dispatch may answer undefined and the
// default the source wrote must still fire
function opaque() {
  return {
    flat: undefined
  };
}
const {
  flat: fromOpaque = null
} = opaque();
export { flat, bareAt, assigned, fromOpaque };