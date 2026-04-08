import _at from "@core-js/pure/actual/instance/at";
class C extends Array {
  at() {
    return 'override';
  }
  toFn() {
    return function () {
      return _at(this).call(this, 0);
    };
  }
}