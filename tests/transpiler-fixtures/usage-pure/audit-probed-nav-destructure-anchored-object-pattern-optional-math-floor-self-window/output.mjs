import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// for-init hosts ride the same guard renders (member-read anchor in the for-head, SE-key
// leaf via the trailing sink declarator)
let f2 = 0;
for (const {
  floor: viaForInitAnchor
} = (null == _globalThis.window ? void 0 : _self).Math; f2 < 1; f2++) {
  void viaForInitAnchor;
}
export { f2 };