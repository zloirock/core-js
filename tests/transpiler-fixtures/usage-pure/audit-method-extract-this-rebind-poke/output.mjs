import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
class Proto {
  bits = [4];
  poke() {
    var _ref;
    return _atMaybeArray(_ref = this.bits).call(_ref, 4);
  }
}
new Proto().poke();