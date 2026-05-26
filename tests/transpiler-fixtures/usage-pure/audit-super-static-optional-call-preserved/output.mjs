import _Array$from from "@core-js/pure/actual/array/from";
// `super.from?.(args)` inside a subclass static method. polyfill-always-defined
// contract: the polyfill binding is never nullish, so the `?.` is dead and gets
// stripped at rewrite time. confirms the call site folds into a non-optional
// `_Array$from.call(this, ...)` and no defensive runtime nullish-check remains.
class C extends Array {
  static factory() {
    return _Array$from.call(this, [1, 2]);
  }
}
C.factory();