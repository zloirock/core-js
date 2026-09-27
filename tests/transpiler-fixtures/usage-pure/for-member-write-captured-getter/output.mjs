import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A captured object keeps its declaration scope despite a same-named local at the read.
function read() {
  const inner = {
    value: []
  };
  for (box.inner.value.at of [0]) {
    var _ref;
    return [_atMaybeArray(_ref = box.inner.value).call(_ref, -1), inner.value.length];
  }
}
const inner = {
  get value() {
    return [3, 4];
  }
};
const box = {
  inner
};
consume(read());