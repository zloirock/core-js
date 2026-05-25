import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// for-init nested-proxy flatten where the tail receiver is NOT a polyfillable proxy global
// (`globalThis` / `self`). Without a pure import for the receiver, for-init SE-sink injection
// falls through to `ref splice baking(receiverTail, refSplices)` for the synth tail
// source - exercise that branch in addition to the SE-prefix arrow body bake. Distinct
// .values polyfill in the SE prefix vs .at narrow on the result of `from` keeps both
// receiver-tail and prefix bakes observable.
const userGlobal = {
  Array
};
for (const from = _Array$from, _unused = ((() => {
    var _ref;
    return _valuesMaybeArray(_ref = []).call(_ref);
  })(), userGlobal); false;) {
  var _ref2;
  _atMaybeArray(_ref2 = from([])).call(_ref2, 0);
}