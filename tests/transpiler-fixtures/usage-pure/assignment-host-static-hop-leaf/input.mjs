// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
let name, junk, arity;
({ Array: { of: { name }, junk } } = globalThis);
({ Array: { of: { name } } } = globalThis);
(arity = 1, ({ Array: { of: { name } } } = globalThis));
if (arity) ({ Array: { of: { name } } } = globalThis);
[{ Array: { of: { name } } }] = [globalThis];
({ Array: { of: { name = 'd' } } } = globalThis);
({ Map: { groupBy: { name } } } = globalThis);
export { name, junk, arity };
