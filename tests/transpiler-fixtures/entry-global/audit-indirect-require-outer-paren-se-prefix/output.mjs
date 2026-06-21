import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// outer-paren-wrapped whole indirect require: `((sideEffect(), require)('...'))`. oxc keeps
// the outer paren as a ParenthesizedExpression; entry detection still removes the require, so
// the SequenceExpression prefix's side effect must survive (the paren is peeled to reach it)
function logRequire() {
  return 'logged';
}
logRequire();