// outer-paren-wrapped whole indirect require: `((sideEffect(), require)('...'))`. oxc keeps
// the outer paren as a ParenthesizedExpression; entry detection still removes the require, so
// the SequenceExpression prefix's side effect must survive (peeled like `getEntrySource` does)
function logRequire() { return 'logged'; }
((logRequire(), require)('core-js/actual/array/from'));
