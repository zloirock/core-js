import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
// a slot the source writes holds the user's object, and the read off a probe run reaches it there
// whichever spelling writes it and wherever: with no ponyfill to stand in for the slot, the guarded
// read composes with the probe's one test. a slot a ponyfill serves keeps the read its patch reaches
_globalThis.assigned = [[1]];
_globalThis.compounded += [];
delete _globalThis.deleted;
[_globalThis.destructured] = [[2]];
_self.throughSelf = [3];
window.throughWindow = [4];
const g = _globalThis;
g.throughAlias = [5];
_globalThis.Map = [[6]];
export const assignedRead = null == _globalThis.window ? void 0 : _flatMaybeArray(_ref = _self.assigned).call(_ref);
export const compoundedRead = null == _globalThis.window ? void 0 : _at(_ref2 = _self.compounded).call(_ref2, 0);
export const deletedRead = null == _globalThis.window ? void 0 : _includes(_ref3 = _self.deleted).call(_ref3, 1);
export const destructuredRead = null == _globalThis.window ? void 0 : _findLastMaybeArray(_ref4 = _self.destructured).call(_ref4, Boolean);
export const selfRead = null == _globalThis.window ? void 0 : _findLastIndexMaybeArray(_ref5 = _self.throughSelf).call(_ref5, Boolean);
export const windowRead = null == _globalThis.window ? void 0 : _toReversedMaybeArray(_ref6 = _self.throughWindow).call(_ref6);
export const aliasRead = null == _globalThis.window ? void 0 : _toSortedMaybeArray(_ref7 = _self.throughAlias).call(_ref7);
export const runRead = null == _globalThis.window ? void 0 : _flatMapMaybeArray(_ref8 = _globalThis.assigned).call(_ref8, x => x);
export const laterRead = null == _globalThis.window ? void 0 : _fillMaybeArray(_ref9 = _self.later).call(_ref9, 0);
export const ponyfilledRead = null == _globalThis.window ? void 0 : _self.Map.copyWithin(0);
_globalThis.later = [7];