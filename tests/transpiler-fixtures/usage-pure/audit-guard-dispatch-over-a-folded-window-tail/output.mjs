import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// an instance dispatch whose receiver reads off a guarded tail past `self`: the probe read and the
// sequence effect stay ahead of the dispatched call, which takes the folded tail as its receiver.
// the `window` hop past `self` denotes the same realm object and collapses in both emitters.
let rc = 0;
const rt = () => _globalThis;
export const renderTailInstanceRecv = _includesMaybeArray((rc++, null == rt().window ? void 0 : _self).Array.prototype).call([5], 5);
export { rc };