import _keys from "@core-js/pure/actual/instance/keys";
import _Map from "@core-js/pure/actual/map";
import _Object$keys from "@core-js/pure/actual/object/keys";
// An async callee receives the container and can replace its constructor slot before the read.
const escapedByAsyncCallee = function () {
  const asyncEscape = {
    k: Object
  };
  async function takeAsync(t) {
    t.k = _Map;
  }
  void takeAsync(asyncEscape);
  const {
      k: _ref
    } = asyncEscape,
    keys = _ref === Object ? _Object$keys : _keys(_ref);
  return keys;
}();
export { escapedByAsyncCallee };