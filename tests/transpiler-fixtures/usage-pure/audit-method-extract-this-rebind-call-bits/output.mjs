import _at from "@core-js/pure/actual/instance/at";
class Proto {
  bits = [4];
  poke() {
    var _ref;
    return _at(_ref = this.bits).call(_ref, 4);
  }
}
const m4 = Proto.prototype.poke;
m4.call({
  bits: 'bb'
});