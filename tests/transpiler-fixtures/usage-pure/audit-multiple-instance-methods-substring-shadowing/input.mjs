// Identifier `arr1` is a prefix of `arr10` - different bindings, same string prefix.
// nth-occurrence must locate `.at(...)` on the right receiver. Three different methods
// to ensure each polyfill picks its own emission slot
arr1.at(-1);
arr10.findLast(p);
arr1.flat();
