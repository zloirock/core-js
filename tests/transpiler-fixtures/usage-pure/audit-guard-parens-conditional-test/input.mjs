// polyfill guard parenthesised inside a conditional expression test: the rewrite
// must thread through the parens to recognise the receiver.
const x = arr?.at(0) ? 1 : 2;
