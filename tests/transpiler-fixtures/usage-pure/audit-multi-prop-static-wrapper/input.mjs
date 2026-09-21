// Sibling constructor slots in one local container each resolve their own static.
// Rewriting the first slot must preserve the second claim.
const w = { a: Array, b: Promise };
const { a: { from }, b: { resolve } } = w;
from([1]);
resolve(2);
