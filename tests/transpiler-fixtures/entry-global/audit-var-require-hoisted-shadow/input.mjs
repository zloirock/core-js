// `var require` inside a nested non-function scope (here ForOfStatement's binding head)
// hoists to program scope per JS semantics, shadowing the global `require`. detection
// must classify this as a shadow and leave the user `require(...)` call alone, which
// needs a recursive walk over hoistable `var` decls, not just direct program body.
for (var require of [() => null]) {}
require('core-js/actual/array/from');
