// outer paren `(require('core-js/...'))` with preserved parenthesized wrapper -
// the entry resolver now unwraps the wrapper so the require call surfaces
(require('core-js/actual/array/from'));
