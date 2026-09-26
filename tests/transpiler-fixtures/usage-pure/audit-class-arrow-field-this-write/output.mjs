import _at from "@core-js/pure/actual/instance/at";
// arrow-fn class field rewrites `this.box` after init - dispatch must widen
// from array-narrow to generic since runtime field type diverges from init
class C {
  box = [1, 2, 3];
  reset = () => {
    this.box = "x";
  };
  first() {
    var _ref;
    return _at(_ref = this.box).call(_ref, 0);
  }
}
const c = new C();
c.reset();
c.first();