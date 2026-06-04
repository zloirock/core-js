import _at from "@core-js/pure/actual/instance/at";
// a callable field CALL follows its declared signature: a union return spanning differing families
// (`() => number[] | string`) is ambiguous, so the call result resolves to the generic helper -
// the init function body alone (number[]) would be unsound after the reset() reassignment
class C {
  make: () => number[] | string = () => [1, 2, 3];
  read() {
    var _ref;
    return _at(_ref = this.make()).call(_ref, 0);
  }
  reset() {
    this.make = () => "s";
  }
}
new C().read();