import _at from "@core-js/pure/actual/instance/at";
var _ref;
// A parameter default can supply the constructor whose named static the body patches.
// The later at call must allow the replacement to return either an array or a string.
// The write alone does not release Array; pure retains the patched Array.from read.
const xs = [];
function withDefault(ctor = Array) {
  ctor.from = patch;
}
withDefault();
_at(_ref = Array.from(xs)).call(_ref, 0);