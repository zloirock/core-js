import _Array$of from "@core-js/pure/actual/array/of";
var _ref;
// A conditionally installed forwarder either yields its fixed literal or is absent.
// Keep its optional call and argument short-circuit while serving the forwarded static.
let forward;
if (flag) forward = () => ({
  window: {
    Array
  }
});
export const value = (_ref = forward?.()?.window?.Array, null == _ref ? void 0 : _ref === Array ? _Array$of(observe()) : _ref.of(observe()));