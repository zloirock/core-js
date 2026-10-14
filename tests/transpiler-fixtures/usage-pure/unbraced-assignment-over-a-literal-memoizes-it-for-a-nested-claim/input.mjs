// An assignment over an object literal in an unbraced body memoizes the literal in the block the extraction
// builds: the nested claim reads its slot off the memo, and the sibling rides the residual.
let at, z; const o = { list: [1, 2] };
if (c) ({ y: { at }, z } = { y: o.list, z: 1 });
export { at, z };
