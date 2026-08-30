import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2;
// the detector marks a claimed receiver's hops handled because the claim's render owns them - so an
// instance dispatch that re-emits that receiver has to hand it on as a COPY, the way the receiver-less
// arm does. memoizing the source node itself carried the marking into the rebuilt tree and every claim
// inside the receiver was suppressed on the re-visit, leaving a sealed proxy nav spelled raw where the
// read twin below renders the guard. a receiver the plugin BUILT keeps its identity: the nested
// dispatch's type record lives on that node, and a copy would drop it to the untyped helper
const ga = _globalThis;
const nested = [[1]];
let out, read, dispatched, built;
read = _atMaybeArray((null == ga.window ? void 0 : _self).Array.prototype);
dispatched = _atMaybeArray(_ref = (null == ga.window ? void 0 : _self).Array.prototype).call(_ref, 1);
built = _atMaybeArray(_ref2 = _flatMaybeArray(nested).call(nested)).call(_ref2, 0);
out = [read, dispatched, built];
export const value = out;