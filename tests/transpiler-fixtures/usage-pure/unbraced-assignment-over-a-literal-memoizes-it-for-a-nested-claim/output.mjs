import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// An assignment over an object literal in an unbraced body memoizes the literal in the block the extraction
// builds: the nested claim reads its slot off the memo, and the sibling rides the residual.
let at, z;
const o = {
  list: [1, 2]
};
if (c) {
  _ref = {
    y: o.list,
    z: 1
  };
  at = _atMaybeArray(_ref.y);
  ({
    z
  } = _ref);
}
export { at, z };