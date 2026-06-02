import _Array$from from "@core-js/pure/actual/array/from";
// the superclass is a proxy-global member produced by an immediately-invoked wrapper
// (`(function(){return globalThis})().Array`); `super.from` must still rewrite to the pure
// static import, exactly as a bare `globalThis.Array` superclass would
class X extends function () {
  return globalThis;
}().Array {
  static make() {
    return _Array$from.call(this, [1, 2, 3]);
  }
}
X.make();