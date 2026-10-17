// a `var` of the same name in a DEEPER nested function is not a shadow at the writing
// function's level: the write there still counts and widens the member to generic
let D;
({ Map: D } = globalThis);
function outer() {
  function inner() {
    var D = 0;
    return D;
  }
  D = ['d'];
  return inner;
}
export const r4 = [D.includes('d'), outer()];
