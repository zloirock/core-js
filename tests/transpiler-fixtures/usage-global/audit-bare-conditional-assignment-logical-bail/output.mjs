import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// bare assignment (no IIFE wrap) inside a LogicalExpression - the assignment runs only
// when the LHS short-circuits to evaluate its RHS, so it is NOT straight-line and the
// narrow must bail. without the bail the resolver would narrow `x` to the string the
// assignment writes, missing es.array.at for the case where `x` keeps its array value
let x = [];
false && (x = 'hello');
x.at(-1);