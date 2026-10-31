import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// A var binding survives loop iterations: the first arm can initialize the second.
// That reaching realm value needs the static polyfill; pure keeps a constructor guard.
function read() {
  for (let i = 0; i < 2; i++) {
    if (!i) {
      var held = _globalThis;
    } else {
      var _ref;
      return _ref = held.Array, _ref === Array ? _Array$of(7) : _ref.of(7);
    }
  }
}