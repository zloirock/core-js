// Nested assignment leaves read function names from the served static methods.
// Their receiver, defaults and residual siblings stay ordered across statement and expression hosts.
let name, junk, arity;
({ Array: { of: { name }, junk } } = globalThis);
({ Array: { of: { name } } } = globalThis);
(arity = 1, ({ Array: { of: { name } } } = globalThis));
if (arity) ({ Array: { of: { name } } } = globalThis);
[{ Array: { of: { name } } }] = [globalThis];
({ Array: { of: { name = 'd' } } } = globalThis);
({ Map: { groupBy: { name } } } = globalThis);
export { name, junk, arity };
