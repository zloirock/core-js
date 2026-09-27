import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// Literal receiver keys identify the same written slot in either parser.
// Body reads must retain the functions assigned by the loop, including through a dispatcher.
// The mutation census conservatively treats these non-string computed keys as unknown slots.
const o = {
  true: [],
  null: []
};
for (o[true].at of functions) {
  var _ref;
  consume(_at(_ref = o[true]).call(_ref, 0));
}
for (o[null].includes of functions) {
  var _ref2;
  consume(_includes(_ref2 = o[null]).call(_ref2, 0));
}