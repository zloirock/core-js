import _at from "@core-js/pure/actual/instance/at";
// `({ v: this.items } = src)` inside a method is a destructuring write to the instance field
// `items` through an opaque source - an internal `this`-write the bare-`this.items = ...` scan
// misses. Folding it into the field flow widens `items` away from its array initializer, so `.at`
// gets the generic polyfill.
class C {
  items = [1, 2, 3];
  setIt(src: {
    v: string;
  }) {
    ({
      v: this.items
    } = src);
  }
  getFirst() {
    var _ref;
    return _at(_ref = this.items).call(_ref, 0);
  }
}
new C().getFirst();