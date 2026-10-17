// An assignment over a literal in an unbraced body reads its nested method once before
// assigning the quiet sibling value. Both writes stay inside the conditional body.
let at, z; const o = { list: [1, 2] };
if (c) ({ y: { at }, z } = { y: o.list, z: 1 });
export { at, z };
