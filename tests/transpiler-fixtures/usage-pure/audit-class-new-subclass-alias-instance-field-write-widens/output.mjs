import _at from "@core-js/pure/actual/instance/at";
// `const D = Sub` aliases a SUBCLASS of C; `new D()` instantiates a C-descendant, so the unbound
// write `new D().items = "string"` must count toward C's inherited instance field-flow fold. the
// read in C's getFirst() then sees `number[] | string` and resolves generic `_at`, not an
// array-specific Maybe that would crash on the String value at runtime
class C {
  items = [1, 2, 3];
  getFirst() {
    var _ref;
    return _at(_ref = this.items).call(_ref, 0);
  }
}
class Sub extends C {}
const D = Sub;
new D().items = "string";
new C().getFirst();