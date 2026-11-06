import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A getter can return a fresh receiver even when its body has no effects.
const box = {
  get values() {
    return [3, 4];
  }
};
for (box.values.at of [0]) {
  var _ref;
  consume(_atMaybeArray(_ref = box.values).call(_ref, -1));
}