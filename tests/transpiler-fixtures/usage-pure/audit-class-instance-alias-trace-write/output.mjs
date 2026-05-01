import _at from "@core-js/pure/actual/instance/at";
// `const alias = inst` aliases a class instance. the write `alias.arr = ...` previously
// went undetected: `receiverIsClassInstance` only matched Identifier whose direct binding
// init was `new C()`, missing the `alias`-binding-init = `inst` (Identifier) case. the
// resulting unsound narrow emitted `_atMaybeArray`, which crashes at runtime on engines
// without `Array.prototype.at` when the field has been reassigned to String. the alias
// chain walker now follows binding-init Identifier links transitively to detect this
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