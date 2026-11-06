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
// a root whose EFFECT the guard test carries, inside the same sequence: the emitter spells that
// receiver with the root resolved AND its proven `?.` dropped, so the nav's own rewrite has to be
// recognised through both spellings rather than by a raw source match
const cr = () => _globalThis;
export const seqCallRootDispatch = null == (_ref = ('x', null == cr().window ? void 0 : _self.seqBox.list)) ? void 0 : _at(_ref).call(_ref, 0);