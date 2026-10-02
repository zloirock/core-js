import _at from "@core-js/pure/actual/instance/at";
var _ref;
// A write beyond a getter still invokes its body before touching the returned array.
// Deleting the getter exposes the inherited string on the next read.
const inner = {
  __proto__: {
    value: "pq"
  },
  get value() {
    delete this.value;
    return [3, 4];
  }
};
const box = {
  inner
};
box.inner.value.at = 0;
consume(_at(_ref = box.inner.value).call(_ref, -1));