import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// Writing a member of a getter result keeps the owner's getter installed.
// Each read returns a fresh array, so the later call needs only the array polyfill.
const inner = {
  get value() {
    return [3, 4];
  }
};
const box = {
  inner
};
box.inner.value.at = 0;
consume(_atMaybeArray(_ref = box.inner.value).call(_ref, -1));