import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
// The implicit read may fall back on an open receiver.
// A claim inside the source RHS still needs its own polyfill.
export function install(receiver) {
  _at(receiver) || (receiver.at = () => {
    var _ref;
    return _includesMaybeArray(_ref = [7]).call(_ref, 7);
  });
}