import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A partial pattern keeps its guarded native receiver for the unresolved sibling.
// The array static remains served when the optional realm is present.
function read({
  of,
  length
} = {
  of: _Array$of,
  length: (null == _globalThis.window ? void 0 : _self.Array).length
}) {
  return [of(effect()), length];
}
read();