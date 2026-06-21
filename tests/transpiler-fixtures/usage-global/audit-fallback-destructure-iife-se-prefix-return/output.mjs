import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// realistic factory wrapper: `arg => { logSetup(arg); return arg; }`. body is a
// BlockStatement with a side-effect ExpressionStatement prefix before `return arg;`.
// the identity lift accepts multi-statement bodies whose intermediates are plain
// ExpressionStatements that don't rebind a param (no control flow / bindings). since
// `logSetup(arg)` only READS arg, the lift proceeds: `Result` resolves to `Array` and
// `es.array.from` emits.
const Result = (arg => {
  logSetup(arg);
  return arg;
})(Array);
const {
  from
} = Result;
from([1, 2]);