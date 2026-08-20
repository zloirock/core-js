// a computed own static member `static [k]` (k resolves to "from") shadows the inherited Array.from,
// so this.from in a static method must NOT be rewritten to the pure helper - it is the own member
const k = "from";
class C extends Array {
  static [k] = () => "local";
  static m() {
    return this.from([1, 2, 3]);
  }
}