import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A consumed pattern retains the sealed receiver read in its default slot.
// An explicit argument bypasses that slot, including its source exception.
function read({
  of
} = ((null == _globalThis.window ? void 0 : _self).Array, {
  of: _Array$of
})) {
  return of(effect());
}
read();
read({
  of: value => [value]
});