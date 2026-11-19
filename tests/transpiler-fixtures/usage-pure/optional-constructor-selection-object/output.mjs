import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
var _ref;
// The optional static retains its polyfill through a constructor carrier.
// A continuing instance read must not leave the static native.
export const effects = [];
let held;
let other;
export const r = null == _globalThis.Object ? void 0 : _atMaybeArray(_ref = _Object$entries({
  a: 1
})).call(_ref, 0)[0];