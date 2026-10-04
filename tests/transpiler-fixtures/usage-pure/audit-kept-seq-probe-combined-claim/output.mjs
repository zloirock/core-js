import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2;
// a combined ctor claim (an instance read off the pure ctor) whose receiver is a sequence-carried
// environment probe under a live `?.`: the ordinary split owns it - the sequence rides the guard
// test whole and the combined render the alternate. the instance route used to stand down over the
// harvested prefix and no inner claim could re-drive it, shipping the claim raw with no polyfill.
const g = _globalThis;
let c = 0,
  d = 0;
export const nestedSeq = null == (d++, c++, _globalThis.window) ? void 0 : _nameMaybeFunction(_Map);
export const singleSeq = null == (d++, _globalThis.window) ? void 0 : _nameMaybeFunction(_Map);
// an instance claim ABOVE a call still owns the chain: both prefixes stay in its guard
// and the alias root folds to the stable leaf ponyfill. The call result keeps its own
// receiver capture for the trailing instance dispatch.
export const callThenAt = null == (d++, c++, _self) ? void 0 : _at(_ref = _self.foo()).call(_ref, 0);
export const callThenAtDirect = null == (d++, c++, _self) ? void 0 : _at(_ref2 = _self.foo()).call(_ref2, 0);

// NEGATIVE: the bare spelling has no harvested prefix and always took the split
export const bareTwin = null == _globalThis.window ? void 0 : _nameMaybeFunction(_Map);