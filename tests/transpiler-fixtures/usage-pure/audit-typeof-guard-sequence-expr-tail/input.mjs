// SequenceExpression `(side(), typeof x === 'string')` carries the guard in its tail.
// condition guard parsing now peels SequenceExpression after negation - without the peel
// the BinaryExpression branch never sees the typeof comparison and the narrow drops.
// fixture combines a side-effect expression with a typeof tail in the if-condition
declare const x: string | string[];
declare function ping(): void;
if ((ping(), typeof x === 'string')) {
  x.at(0);
}
