// a callable field CALL follows its declared signature: a union return spanning differing families
// (`() => number[] | string`) is ambiguous, so the call result resolves to the generic helper -
// the init function body alone (number[]) would be unsound after the reset() reassignment
class C {
  make: () => number[] | string = () => [1, 2, 3];
  read() {
    return this.make().at(0);
  }
  reset() {
    this.make = () => "s";
  }
}
new C().read();
