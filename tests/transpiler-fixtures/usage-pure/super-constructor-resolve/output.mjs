import _Promise from "@core-js/pure/actual/promise/constructor";
class A extends _Promise {
  constructor() {
    super(r => r);
    super.resolve(1);
  }
}