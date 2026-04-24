// combo: TC39 decorator on a class field + subclass widens the field's flow type via
// `this.box = "x"` + outer class reads `this.box.at(0)`. generic instance.at polyfill fires
// because the union Array|string collapses past the Array-specific narrowing
function dec(t, ctx) { return t; }
class C {
  @dec box = [1];
  first() { return this.box.at(0); }
}
class D extends C {
  stringify() { this.box = "x"; }
}
