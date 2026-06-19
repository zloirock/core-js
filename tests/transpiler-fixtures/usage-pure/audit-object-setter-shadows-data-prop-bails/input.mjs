// the LAST declaration for an object-literal key decides its type (later members override). a setter
// as that last declaration makes the key a setter-only accessor whose read yields undefined, so the
// shadowed earlier data property must NOT narrow the access - it bails to the generic instance helper.
// a getter+setter PAIR is different: reading yields the getter's value, which keeps its precise narrow.
const shadowed = { list: [1, 2], set list(v) {} };
const paired = { get list() { return [1, 2]; }, set list(v) {} };
export const a = shadowed.list.at(0);
export const b = paired.list.includes(1);
