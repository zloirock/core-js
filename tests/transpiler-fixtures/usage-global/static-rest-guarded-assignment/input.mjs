// A guarded nested assignment rejects a missing receiver before binding the static.
// Rest copies the original receiver and excludes the claimed key.
let of, rest;
({ Array: { of, ...rest } } = cond && globalThis);
use(of, rest);
