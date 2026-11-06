// IIFE-prefix-SE body uses MULTIPLE distinct global constructors in ExpressionStatement
// position alongside the return. The outer static call subsumes the chain into a
// SequenceExpression that re-emits the IIFE body verbatim, so every inner Identifier
// (Map, Set, Promise) must receive its own polyfill substitution.
let calls = 0;
const r = (() => { calls++; void Map; void Set; return Promise; })().resolve(1);
[r, calls];
