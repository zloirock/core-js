// realistic factory wrapper: `arg => { logSetup(arg); return arg; }`. body is a
// BlockStatement with a side-effect ExpressionStatement prefix preceding `return arg;`.
// `iifeBodyReturn` accepts multi-statement bodies where intermediates are
// ExpressionStatements (no control flow / bindings), and `bodyPrefixReassignsParams`
// verifies none of the intermediates rebind a param. since `logSetup(arg)` only
// READS arg (passes it to a nested call -- doesn't reassign), identity peel proceeds
// and `Result` resolves to `Array`. `es.array.from` polyfill emits.
const Result = (arg => { logSetup(arg); return arg; })(Array);
const { from } = Result;
from([1, 2]);
