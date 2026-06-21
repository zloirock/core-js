import _at from "@core-js/pure/actual/instance/at";
// `const alias = inst` aliases a class instance, then `alias.arr = ...` writes the field.
// matching only Identifiers whose binding-init is `new C()` misses the alias whose init is
// another Identifier (`inst`), emitting an unsound `_atMaybeArray` that crashes on engines
// without `Array.prototype.at`. the alias chain must follow binding-init links transitively
class C {
  arr = [1, 2, 3];
  test() {
    var _ref;
    return _at(_ref = this.arr).call(_ref, 0);
  }
}
const inst = new C();
const alias = inst;
alias.arr = "stringified";
inst.test();