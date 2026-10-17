import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a SEQUENCE evaluates to its last element, so a probe nav sitting there is the receiver's value
// and owes the guard render. by the time the nav's own rewrite runs, the chain ROOT is already
// substituted - the rewrite must still claim the nav under the renamed head rather than skip
// it as a phantom, which is what keeps the ponyfillable hop off a native read here
_globalThis.seqBox = {
  list: ['ab', 'cd'],
  n: 7
};
export const seqValue = ('x', null == _globalThis.window ? void 0 : _self.seqBox.n);