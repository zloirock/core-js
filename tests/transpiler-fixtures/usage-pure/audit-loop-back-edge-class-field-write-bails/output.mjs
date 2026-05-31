import _at from "@core-js/pure/actual/instance/at";
// loop back-edge: an external write to the instance field inside the loop body feeds back through the
// loop to the next-iteration method call, so the field-init narrow is stale from iteration 2 - the
// `this.data.at()` polyfill degrades to the generic instance variant.
declare function cond(): boolean;
class C {
  data = [1, 2, 3];
  m() {
    var _ref;
    return _at(_ref = this.data).call(_ref, -1);
  }
}
const c = new C();
while (cond()) {
  c.m();
  c.data = "s";
}