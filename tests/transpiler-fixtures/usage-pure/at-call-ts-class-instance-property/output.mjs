import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
class C {
  items: number[] = [];
}
function f(c: C) {
  var _ref;
  _atMaybeArray(_ref = c.items).call(_ref, 0);
}