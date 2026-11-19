import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// The guarded delete keeps its reference and evaluates the key only on the live branch.
export function remove() {
  return null == _globalThis.window ? true : delete _self.guardTailBox[_Array$of(3)[0], 'kept'];
}