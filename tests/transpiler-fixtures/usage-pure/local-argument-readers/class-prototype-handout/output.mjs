import _at from "@core-js/pure/actual/instance/at";
// A local reader returning the class prototype still exposes methods to foreign receivers.
function pick(o) {
  return o.prototype;
}
class Box {
  data = [8, 9];
  read() {
    var _ref;
    return _at(_ref = this.data).call(_ref, -1);
  }
}
const held = pick(Box);
use(held.read.call({
  data: "ab"
}));