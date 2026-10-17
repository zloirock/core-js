import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// Each nested iterator pattern reads its receiver once: an array literal, a member,
// a conditional receiver and a call result. Sibling reads share the selected value.
const {
  length: litArity,
  call: litCall
} = _getIteratorMethod([7]);
export { litArity };
export { litCall };