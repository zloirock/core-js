import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
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
consume(box.inner.value.at(-1));