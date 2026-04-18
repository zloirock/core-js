import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
class MyArr extends Array<string> {}
function foo(x: MyArr) {
  _atMaybeArray(x).call(x, 0);
}