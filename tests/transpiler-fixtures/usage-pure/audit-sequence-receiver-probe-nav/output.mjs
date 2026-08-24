import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11, _ref12;
// a SEQUENCE evaluates to its last element, so a probe nav sitting there is the receiver's value
// and owes the guard render. by the time the nav's own rewrite runs, the chain ROOT is already
// substituted - the rewrite must still claim the nav under the renamed head rather than skip
// it as a phantom, which is what keeps the ponyfillable hop off a native read here
_globalThis.seqBox = {
  list: ['ab', 'cd'],
  n: 7
};
export const seqValue = ('x', null == _globalThis.window ? void 0 : _self.seqBox.n);
export const seqMember = ('x', null == _globalThis.window ? void 0 : _self.seqBox).n;
export const seqLeading = (null == _globalThis.window ? void 0 : _self.seqBox.n, 'x');
export const seqOptionalDispatch = null == (_ref = ('x', null == _globalThis.window ? void 0 : _self.seqBox.list)) ? void 0 : _at(_ref).call(_ref, 0);
export const seqMemberDispatch = null == (_ref2 = ('x', null == _globalThis.window ? void 0 : _self.seqBox).list) ? void 0 : _at(_ref2).call(_ref2, 0);
export const seqLeafDispatch = null == (_ref3 = ('x', null == _globalThis.window ? void 0 : _self).seqBox.list) ? void 0 : _at(_ref3).call(_ref3, 0);

// a PLAIN dispatch over the same receiver reaches the render through another path - the negative
// that pins the optional one as the discriminator
export const seqPlainDispatch = _at(_ref4 = ('x', null == _globalThis.window ? void 0 : _self.seqBox.list)).call(_ref4, 0);
export const seqInnerDispatch = ('x', null == (_ref5 = _globalThis.window) ? void 0 : _at(_ref6 = _ref5.seqBox.list).call(_ref6, 0));

// a root whose EFFECT the guard test carries, inside the same sequence: the emitter spells that
// receiver with the root resolved AND its proven `?.` dropped, so the nav's own rewrite has to be
// recognised through both spellings rather than by a raw source match
const cr = () => _globalThis;
let held;
export const seqCallRootDispatch = null == (_ref7 = ('x', null == cr().window ? void 0 : _self.seqBox.list)) ? void 0 : _at(_ref7).call(_ref7, 0);
export const seqAssignRootDispatch = null == (_ref8 = ('x', null == (held = _globalThis).window ? void 0 : _self.seqBox.list)) ? void 0 : _at(_ref8).call(_ref8, 0);
export const seqAssignRootMember = null == (_ref9 = ('x', null == (held = _globalThis).window ? void 0 : _self.seqBox).list) ? void 0 : _at(_ref9).call(_ref9, 0);
export const seqAssignRootLeaf = null == (_ref10 = ('x', null == (held = _globalThis).window ? void 0 : _self).seqBox.list) ? void 0 : _at(_ref10).call(_ref10, 0);
export { held };

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = null == (_ref11 = _atMaybeArray(_ref12 = ['ab', 'cd']).call(_ref12, (null == _globalThis.window ? void 0 : _self.seqBox.list) ? 0 : 1)) ? void 0 : _includesMaybeString(_ref11).call(_ref11, 'a');