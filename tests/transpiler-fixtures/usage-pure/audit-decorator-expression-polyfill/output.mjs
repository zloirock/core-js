import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Array$from from "@core-js/pure/actual/array/from";
// decorator expression itself uses a polyfilled built-in: the call inside the
// decorator parens is scanned and rewritten.
@_Promise$resolve(decorator)
class A {
  @_Array$from([1, 2, 3])
  method() {}
}