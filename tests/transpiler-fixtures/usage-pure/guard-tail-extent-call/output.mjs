import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A guarded realm read retains its method receiver and the argument's nested claim.
// A seal ends the short-circuit without detaching the method reference.
export function open() {
  return null == _globalThis.window ? void 0 : _self.guardTailBox.read?.(_Array$of(3)[0]).value;
}
export function sealed() {
  return ((null == _globalThis.window ? void 0 : _self)?.guardTailBox.read)(_Array$of(3)[0]).value;
}