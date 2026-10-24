// receiver is `cond1 ? (cond2 ? Array : Iterator) : Set` after a chain assignment - all
// four constructors must be polyfilled because the destructured `from` could land on any
// of them. `foo`, declared nowhere, is the realm's slot: the selection it stores leaves
// the file, so each constructor core-js polyfills loads its whole family, and `Array` the `from` named here
const { from } = foo = cond1 ? (cond2 ? Array : Iterator) : Set;
from([1, 2]);
