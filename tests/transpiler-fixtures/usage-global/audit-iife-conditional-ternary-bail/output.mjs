import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// IIFE assignment wrapped in a ConditionalExpression - the assignment runs in exactly
// one branch of the ternary, so it is NOT guaranteed to execute. lift-through-IIFE walks
// the chain from the call to the enclosing ExpressionStatement and rejects when
// ConditionalExpression sits in between. without the bail the resolver would narrow
// `x` to the IIFE-written string, missing the array.at polyfill for the alternate path
let x = [];
cond ? (() => {
  x = 'hello';
})() : 0;
x.at(-1);