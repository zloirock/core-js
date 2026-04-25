// user-authored sloppy-mode `_ref = 42` with a simple literal RHS. plugin's own memo refs
// always have a complex RHS (function call / member access / object literal), so the
// literal-RHS shape here rejects the orphan-adoption heuristic. plugin allocates its own
// ref name separately, leaving the user's global-write untouched
_ref = 42;
Array.from(x);
