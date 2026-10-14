import _Array$from from "@core-js/pure/actual/array/from";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$values from "@core-js/pure/actual/object/values";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
// a guarded receiver reading a probe run on tests the environment probe alone: every realm hop
// past the probe names the realm the probe read, so a second test of one re-tests the same value -
// with a backed hop after it or none, and through a seal. a member of its own `?.` past the run
// is a value of its own
export const noBackedHop = null == _globalThis.window ? void 0 : _flatMaybeArray(_ref = _Array$of(2)).call(_ref);
export const unbackedOverBacked = null == _globalThis.window ? void 0 : _findLastMaybeArray(_ref2 = _Array$from([3])).call(_ref2, x => x);
export const deepRun = null == _globalThis.window ? void 0 : _includesMaybeArray(_ref3 = _Object$values({
  v: 4
})).call(_ref3, 4);
export const plainReadOff = null == _globalThis.window ? void 0 : _at(_ref4 = _globalThis.box).call(_ref4, 0);
export const sealedRun = null == _globalThis.window ? void 0 : _flatMapMaybeArray(_ref5 = _Object$entries({
  e: 5
})).call(_ref5, x => x);
export const ownOptional = null == (_ref6 = _globalThis.window?.window?.list) ? void 0 : _findLastIndexMaybeArray(_ref6).call(_ref6, x => x);