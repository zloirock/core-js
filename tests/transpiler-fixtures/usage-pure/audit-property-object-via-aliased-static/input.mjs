// resolvePropertyObjectType walks `path.get('object')` for member access. When `arr` is
// the result of an aliased static-method call (`from(...)` with `from = Array.from`),
// the `object` resolution must follow through the alias to recognise Array. Tests that
// optional chaining shape (arr?.method) routes through the same path, and the receiver
// is narrowed at both call sites with distinct methods.
const from = Array.from;
const arr = from('xyz');
arr?.at(-1);
arr?.findLast(x => x);
