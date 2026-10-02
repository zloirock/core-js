import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// A getter ends the receiver chain even inside a nested object carrier.
// Parentheses and a computed read preserve that invocation boundary.
const inner = {
  get value() {
    return [3, 4];
  }
};
const box = {
  wrap: {
    inner
  }
};
const key = "value";
box.wrap.inner[key].at = 0;
consume(_atMaybeArray(_ref = box.wrap.inner.value).call(_ref, -1));