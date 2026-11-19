class A extends Array {
  static f() {
    return super.from(/* none */);
  }
  // `this` in a static context resolves through the same inherited-static machinery
  static g() {
    return this.of(/* none */);
  }
}
export const inheritedViaThis = A.g();
