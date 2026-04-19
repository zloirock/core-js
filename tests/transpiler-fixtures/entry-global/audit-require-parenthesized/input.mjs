// outer paren `(require('core-js/...'))` with preserved `ParenthesizedExpression` —
// `getEntrySource` now unwraps `node.expression` so the require call surfaces
(require('core-js/actual/array/from'));
