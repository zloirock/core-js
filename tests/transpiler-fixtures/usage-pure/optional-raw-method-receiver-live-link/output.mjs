import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16;
// a method the build does not serve takes the same split under a claim above it: the receiver's live
// `?.` is tested at its link and the method is read plainly off the receiver past it, so a receiver
// that comes out nullish below the link throws at that read. a `?.` on the method member itself reads
// the method optionally off the tested receiver instead
const box = _globalThis.box;
const key = 'pick';
export const plainOuter = null == box || null == (_ref = box.list, _ref2 = _ref.pick) ? void 0 : _at(_ref3 = _ref2.call(_ref)).call(_ref3, 0);
export const computedMethod = null == box || null == (_ref4 = box.list, _ref5 = _ref4[key]) ? void 0 : _flatMaybeArray(_ref6 = _ref5.call(_ref4)).call(_ref6);
export const deeperLink = null == (_ref7 = box?.inner) || null == (_ref8 = _ref7.list, _ref9 = _ref8.pick) ? void 0 : _findLastMaybeArray(_ref10 = _ref9.call(_ref8)).call(_ref10, Boolean);
export const optionalOuter = null == box || null == (_ref11 = box.list, _ref12 = _ref11.pick) ? void 0 : _toSortedMaybeArray(_ref13 = _ref12.call(_ref11))?.call(_ref13);
// NEGATIVE: the method member's own `?.` tests the receiver value
export const ownOptional = null == (_ref14 = box?.list, _ref15 = _ref14?.pick) ? void 0 : _includes(_ref16 = _ref15.call(_ref14)).call(_ref16, 1);