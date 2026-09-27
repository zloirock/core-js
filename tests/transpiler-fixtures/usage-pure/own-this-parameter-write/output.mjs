import _at from "@core-js/pure/actual/instance/at";
var _ref;
// A parameter default can replace a field before the method body runs.
const holder = {
  rows: [],
  touch(value = this.rows = "abc") {
    return value;
  }
};
holder.touch();
_at(_ref = holder.rows).call(_ref, 0);