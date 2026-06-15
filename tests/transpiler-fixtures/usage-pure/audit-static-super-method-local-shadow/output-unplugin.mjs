import _Array$from from "@core-js/pure/actual/array/from";
// the `extends` superclass is captured where the class is defined, so a method-local `const Array`
// cannot change `super.from` resolution. the inherited-static lookup must resolve the superclass in
// the class scope, not the method-body scope, or the local shadow follows the wrong binding and
// drops the polyfill.
class C extends Array {
  static make() {
    const Array = Object;
    return _Array$from.call(this, [1]);
  }
}
C.make();
