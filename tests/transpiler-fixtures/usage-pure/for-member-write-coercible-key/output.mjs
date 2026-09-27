import _at from "@core-js/pure/actual/instance/at";
// A const object can select a different property on each key coercion.
const values = [[], [3, 4]];
let index = 0;
const key = {
  toString() {
    return String(index);
  }
};
for (values[key].at of [0]) {
  var _ref;
  index = 1;
  consume(_at(_ref = values[key]).call(_ref, -1));
}