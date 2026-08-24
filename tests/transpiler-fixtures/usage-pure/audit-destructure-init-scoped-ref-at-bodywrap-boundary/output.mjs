import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
(() => {
  var _ref;
  var x = _atMaybeArray(_ref = [1, 2, 3]).call(_ref, 0);
  return Array;
})();
// the block-scoped `var _ref;` anchors immediately after the block's `{`, and for tight
// nested-block shapes that anchor coincides with the wrapped body's own start. the ref must
// stay INSIDE the block either way - dropping it at the boundary leaves _ref undeclared
const from = _Array$from;
console.log(from);