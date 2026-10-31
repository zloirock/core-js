import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// `this.X?.()` resolves like `super.X?.()` ONLY inside a static method, where `this` is the
// constructor and `this.from` reads the inherited static `Array.from` -> always-defined polyfill, so
// the `?.` deoptimizes and the call-split binds `this`. inside an INSTANCE method `this.from` is a
// plain (own / prototype) lookup that is NOT always-defined, so the optional guard is kept
export class C extends Array {
  static a() {
    var _ref;
    return _at(_ref = _Array$from.call(this)).call(_ref, 0);
  }
  b() {
    var _ref2, _ref3;
    return null == (_ref2 = this.from) ? void 0 : _flatMaybeArray(_ref3 = _ref2.call(this)).call(_ref3);
  }
}