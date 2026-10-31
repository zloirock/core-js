import _Array$from from "@core-js/pure/actual/array/from";
// The computed method name reads global Array.from outside the parameter scope.
// The method body keeps the supplied receiver and its own from method.
class Box {
  [_Array$from([1])[0]](Array) {
    return Array.from([2]);
  }
}
new Box()[1]({
  from(value) {
    return value[0] + 10;
  }
});