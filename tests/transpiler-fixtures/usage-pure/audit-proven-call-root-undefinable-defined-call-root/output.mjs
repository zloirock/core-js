import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
_globalThis.callRootBox = {
  list: [[1]]
};
const provenRoot = () => _globalThis;
// NEGATIVE: the call yields the always-defined root, so its `?.` is dead text and the nav collapses
export const definedCallRoot = _self.callRootBox.list;