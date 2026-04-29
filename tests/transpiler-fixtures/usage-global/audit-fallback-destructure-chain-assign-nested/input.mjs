// receiver is `cond1 ? (cond2 ? Array : Iterator) : Set` after a chain assignment - all
// four constructors must be polyfilled because the destructured `from` could land on any
// of them.
const { from } = foo = cond1 ? (cond2 ? Array : Iterator) : Set;
from([1, 2]);
