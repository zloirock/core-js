import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A local function with a literal return proves the computed key overrides rows.
// Only the resulting string supplies the at receiver.
const log = [];
function key(value) {
  _pushMaybeArray(log).call(log, "key");
  return "rows";
}
const box = {
  rows: [8, 9],
  [key(this)]: "ab",
  read() {
    var _ref;
    return _atMaybeString(_ref = this.rows).call(_ref, -1);
  }
};
const r = box.read();
export { r };
export const effects = log;