import _at from "@core-js/pure/actual/instance/at";
class Inst {
  chars = ['c'];
  look() {
    var _ref;
    return _at(_ref = this.chars).call(_ref, 2);
  }
}
const inst = new Inst();
const m2 = inst.look;
m2.call({
  chars: 7
});