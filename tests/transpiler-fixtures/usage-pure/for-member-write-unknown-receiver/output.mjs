import _at from "@core-js/pure/actual/instance/at";
import _values from "@core-js/pure/actual/instance/values";
// An unknown intermediate property can be a getter or a Proxy read.
// Its next value may need a polyfill independently of the written one.
function read(box) {
  for (_values(box).at of [0]) {
    var _ref;
    return _at(_ref = _values(box)).call(_ref, -1);
  }
}
consume(read);