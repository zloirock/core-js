// PrivateIdentifier #from is rejected by staticKeyName in class-walk - private members
// can't shadow public globals with the same textual name. super.from() should still
// dispatch to the static polyfill since #from is unrelated
class C extends Array {
  static #from = 'private';
  static use() {
    return super.from([1, 2]);
  }
}
C.use();
