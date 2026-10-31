import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
var _ref;
// a SEQUENCE evaluates to its last element, so a probe nav sitting there is the receiver's value
// and owes the guard render. by the time the nav's own rewrite runs, the chain ROOT is already
// substituted - the rewrite must still claim the nav under the renamed head rather than skip
// it as a phantom, which is what keeps the ponyfillable hop off a native read here
_globalThis.seqBox = {
  list: ['ab', 'cd'],
  n: 7
};
// a PLAIN dispatch over the same receiver reaches the render through another path - the negative
// that pins the optional one as the discriminator
export const seqPlainDispatch = _at(_ref = ('x', null == _globalThis.window ? void 0 : _self.seqBox.list)).call(_ref, 0);