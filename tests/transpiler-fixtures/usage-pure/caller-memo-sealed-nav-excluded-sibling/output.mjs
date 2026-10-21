import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A caller argument retains its guarded navigation when one static is excluded.
// Its live receiver call is shared by the served and native pattern slots.
(({
  of,
  from
}) => [of(3), from([4])])(function (_ref) {
  return {
    of: _ref.of,
    from: _Array$from
  };
}((null == (() => {
  var _ref2;
  _atMaybeArray(_ref2 = [7]).call(_ref2, 0);
  return _globalThis.window;
})() ? void 0 : _self).Array));