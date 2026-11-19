// Each nested iterator pattern reads its receiver once: an array literal, a member,
// a conditional receiver and a call result. Sibling reads share the selected value.
const { [Symbol.iterator]: { length: litArity, call: litCall } } = [7];
export { litArity };
export { litCall };
