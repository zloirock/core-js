import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11, _ref12;
// stress test for substring poisoning of `_ref` UIDs. chain enough polyfills to push
// numbering past `_ref9` to `_ref10` - the `_ref` substring lives inside `_ref10`, so
// whole-identifier matching must distinguish needle position when multiple identifiers
// share the prefix. distinct methods per line ensure separate emission slots, so any
// cross-contamination would surface in the fixture diff
const a = _includes(_ref = _at(_ref2 = _flatMaybeArray(arr).call(arr)).call(_ref2, 0)).call(_ref, 1);
const b = _findLastMaybeArray(_ref3 = _at(_ref4 = _flatMaybeArray(arr).call(arr)).call(_ref4, 0)).call(_ref3, p);
const c = _findLastIndexMaybeArray(_ref5 = _at(_ref6 = _flatMaybeArray(arr).call(arr)).call(_ref6, 0)).call(_ref5, p);
const d = _at(_ref7 = _findLastMaybeArray(_ref8 = _flatMaybeArray(arr).call(arr)).call(_ref8, p)).call(_ref7, 0);
const e = _at(_ref9 = _findLastIndexMaybeArray(_ref10 = _flatMaybeArray(arr).call(arr)).call(_ref10, p)).call(_ref9, 0);
const f = _at(_ref11 = _flatMaybeArray(_ref12 = _findLastMaybeArray(arr).call(arr, p)).call(_ref12)).call(_ref11, 0);