// the same 3+ sibling set with the assertion predicate off the first header, discriminated by a
// LITERAL argument the call spells itself: that refutes the boolean-returning header on a fact no
// narrowing can stale, the assertion header is selected, and the receiver narrows through it
function isStr(x: unknown, kind: 1): boolean;
function isStr(x: unknown, kind: 2): asserts x is string;
function isStr(x: unknown, kind: number) {}
function probe(x: unknown) {
  isStr(x, 2);
  return x.at(0);
}
