import _Promise from "@core-js/pure/actual/promise/constructor";
// a dynamic computed static field `[k]` (k resolves to "Promise") redefines the literal
// `static Promise = Promise` at runtime, so `Box.Promise` is Object - super.try must stay native
// (NO promise/try inject). only the field initializer `= Promise` resolves to the pure constructor
const k = "Promise";
class Box {
  static Promise = _Promise;
  static [k] = Object;
}
class C extends Box.Promise {
  static run() {
    return super.try(() => 1);
  }
}