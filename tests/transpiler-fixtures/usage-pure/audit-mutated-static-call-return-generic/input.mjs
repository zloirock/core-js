// A user-monkey-patched static no longer returns its known type, so the static-call return narrow must
// drop to generic: patched `Array.from(x)` could return anything, so `.at(0)` resolves through the generic
// `_at`, not a type-locked `_atMaybeArray`. The aliased `const af = Array.from; af(...)` path shares the
// root and also drops to generic (`_includes`). The gate is per-static - the unpatched `Array.of` still
// narrows to Array (`_atMaybeArray`)
Array.from = function (x) { return x; };
Array.from([1, 2]).at(0);
const af = Array.from;
af([3, 4]).includes(5);
Array.of(7, 8).at(0);
