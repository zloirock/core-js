import _Promise from "@core-js/pure/actual/promise/constructor";
class A extends _Promise {
  f() {
    return super.resolve(1);
  }
}