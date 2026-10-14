import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11, _ref12;
// a `delete` of a member the continuation of a combined dispatch runs on into takes the whole
// operator into the guard: a short-circuit answers true, and otherwise the member is deleted for
// real - absorbed into the alternate it was only read. the dispatch's own result is no member, so
// deleting it keeps the operator around the guard
const box = _globalThis.box;
export const plainReceiver = null == (_ref = _flatMaybeArray(_ref2 = box.list)) ? true : delete _at(_ref3 = _ref.call(_ref2)).call(_ref3, 0).k;
export const liveLink = null == box || null == (_ref4 = _toSortedMaybeArray(_ref5 = box.list)) ? true : delete _findLastMaybeArray(_ref6 = _ref4.call(_ref5)).call(_ref6, Boolean).k;
export const optionalTail = null == (_ref7 = _toReversedMaybeArray(_ref8 = box.list)) ? true : delete _findMaybeArray(_ref9 = _ref7.call(_ref8)).call(_ref9, Boolean)?.k;
// NEGATIVE: the dispatch's own result is deleted as written
export const ownResult = delete (null == (_ref10 = _flatMapMaybeArray(_ref11 = box.list)) ? void 0 : _includes(_ref12 = _ref10.call(_ref11, x => [x])).call(_ref12, 1));