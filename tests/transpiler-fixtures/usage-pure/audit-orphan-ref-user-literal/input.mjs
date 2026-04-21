// `isComplexOrphanRhs` filters out user `_ref = literal` sloppy-mode assignments so they
// aren't treated as pipeline leftovers by the post-pass orphan adoption heuristic.
// our emitted `_ref = foo()` always has a complex RHS
_ref = 42;
Array.from(x);
