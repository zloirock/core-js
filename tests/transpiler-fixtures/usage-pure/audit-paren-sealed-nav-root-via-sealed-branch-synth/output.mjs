import _globalThis from "@core-js/pure/actual/global-this";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _self from "@core-js/pure/actual/self";
let cond1 = true;
export function viaSealedBranchSynth({
  assign: sb1
} = cond1 ? ((null == _globalThis.window ? void 0 : _self.window).Object, {
  assign: _Object$assign
}) : Object) {
  return sb1;
}