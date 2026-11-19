// A nested static under a stored realm selection that may yield the user's object loads its own module, on an
// assignment and a declaration, through a ternary, `||` and `??`, the store inside parens or behind a sequence
// prefix, both emitters alike.
let held, from, fromEntries;
({ Array: { from } } = held = c ? globalThis : shim);
const { Array: { of } } = (held = shim || globalThis);
({ Object: { fromEntries } } = (log(), held = shim ?? globalThis));
export { held, from, of, fromEntries };
