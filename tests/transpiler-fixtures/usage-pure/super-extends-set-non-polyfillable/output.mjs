import _Set from "@core-js/pure/actual/set/constructor";
class A extends _Set {
  static f(it) {
    return super.from(it);
  }
}