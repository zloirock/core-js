// `var require` inside a nested non-function scope (here ForOfStatement's binding head)
// hoists to program scope per JS semantics. polyfill-provider must classify this as a
// shadow and leave the user `require(...)` call alone. babel's scope tracker hoists
// vars natively; unplugin's `declaresRequireBinding` walks only direct program.body so
// needs an explicit recursive walk over hoistable `var` decls.
for (var require of [() => null]) {}
require('core-js/actual/array/from');