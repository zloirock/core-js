// `const alias = inst` aliases a class instance, then `alias.arr = ...` writes the field.
// matching only Identifiers whose binding-init is `new C()` misses the alias whose init is
// another Identifier (`inst`), emitting an unsound `_atMaybeArray` that crashes on engines
// without `Array.prototype.at`. the alias chain must follow binding-init links transitively
class C {
  arr = [1, 2, 3];
  test() {
    return this.arr.at(0);
  }
}
const inst = new C();
const alias = inst;
alias.arr = "stringified";
inst.test();
