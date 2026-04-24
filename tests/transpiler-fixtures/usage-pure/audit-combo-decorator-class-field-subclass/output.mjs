import _at from "@core-js/pure/actual/instance/at";
// combo: TC39 decorator on a class field + subclass widens the field's flow type via
// `this.box = "x"` + outer class reads `this.box.at(0)`. generic instance.at polyfill fires
// because the union Array|string collapses past the Array-specific narrowing
function dec(t, ctx) {
  return t;
}
class C {
  @dec
  box = [1];
  first() {
    var _ref;
    return _at(_ref = this.box).call(_ref, 0);
  }
}
class D extends C {
  stringify() {
    this.box = "x";
  }
}