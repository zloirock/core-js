// Sequence effects beginning with a regexp or unary operator keep their statement boundary.
// Neither a declaration nor an assignment rewrite may fuse with the preceding expression.

// flatten host (declaration): a `/`-leading lifted SE after a `;`-less `i++`
i++
const { Array: { from } } = (/x/.test(s), globalThis);

// cascade host (assignment): a `+`-leading lifted SE after a `;`-less `i--`, distinct static
let m;
i--
({ Map: { groupBy: m } } = (+log(), globalThis));
