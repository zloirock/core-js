import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// The switch case may initialize the hoisted realm alias before the read outside it.
// Pure guards the live constructor read: the taken case receives the static polyfill,
// while an uninitialized alias keeps its native TypeError.
function f() {
  var _ref;
  switch (x) {
    case 1:
      var M = _globalThis;
  }
  _ref = M.Array, _ref === Array ? _Array$from([1]) : _ref.from([1]);
}