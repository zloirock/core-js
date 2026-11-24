import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
(() => {
  var _ref;
  if (Math.random() < 0) _atMaybeArray(_ref = [1, 2, 3]).call(_ref, 0);
  return Array;
})();
// The unbraced if keeps the dispatch in its expression statement. Its receiver temporary
// belongs to the surrounding function and is assigned only when the condition holds.
const from = _Array$from;
console.log(from);