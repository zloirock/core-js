import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
// a claim read optionally off an optional call to a method the build does not serve memoizes that
// call as written: every `?.` it carries, a live link below it included, short-circuits inside the memo
// and the claim reads the result. a callee the build serves is a lookup of its own and takes its own
// test in the chain instead
const box = _globalThis.box;
export const liveLinkBelow = null == (_ref = box?.list.pick?.()) ? void 0 : _at(_ref).call(_ref, 0);
export const optionalCallee = null == (_ref2 = box?.pick?.()) ? void 0 : _includes(_ref2).call(_ref2, 1);
export const callLinkBelow = null == (_ref3 = _flatMaybeArray(_ref4 = box.list)?.call(_ref4).pick?.()) ? void 0 : _findLastMaybeArray(_ref3).call(_ref3, Boolean);
// NEGATIVE: a served callee is a lookup of its own
export const servedCallee = null == box || null == (_ref5 = _toSortedMaybeArray(_ref6 = box.list)?.call(_ref6)) ? void 0 : _withMaybeArray(_ref5).call(_ref5, 0, 1);