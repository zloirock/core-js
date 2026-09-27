import _at from "@core-js/pure/actual/instance/at";
// A changed key selects a receiver the loop head did not write.
const o = [[], [3, 4]];
let key = 0;
for (o[key].at of functions) {
  var _ref;
  key = 1;
  consume(_at(_ref = o[key]).call(_ref, -1));
}