import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// control: when the function explicitly returns an OBJECT, `new f()` evaluates to that object
// (the construct keeps an object return), so the array return narrows the instance and `.at`
// resolves to the array-instance polyfill
function f() {
  return [1, 2];
}
_atMaybeArray(_ref = new f()).call(_ref, 0);