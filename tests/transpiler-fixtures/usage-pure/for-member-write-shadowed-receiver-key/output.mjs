import _at from "@core-js/pure/actual/instance/at";
// A body-local key names a different receiver from the loop head.
const o = [[], [3, 4]];
const key = 0;
for (o[key].at of functions) {
  var _ref;
  const key = 1;
  consume(_at(_ref = o[key]).call(_ref, -1));
}