import "core-js/modules/es.string.at";
// IIFE assignment in the MIDDLE of a SequenceExpression - all sequence elements are
// unconditionally evaluated (the `(a, b, c)` operator evaluates a, then b, then c).
// the chain walker treats SequenceExpression as transparent, so the lift succeeds and
// the resolver correctly narrows `x` to the IIFE-written string. only es.string.at
// emitted - array.at would be over-injection (the IIFE always runs)
let x = [];
side(), (() => {
  x = 'hello';
})(), side2();
x.at(-1);