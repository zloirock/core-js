import _at from "@core-js/pure/actual/instance/at";
// Returning an own method exposes it to a receiver with a different field type.
function pick(o) {
  return o.read;
}
const box = {
  rows: [8, 9],
  read() {
    var _ref;
    return _at(_ref = this.rows).call(_ref, -1);
  }
};
const read = pick(box);
use(read.call({
  rows: "ab"
}));