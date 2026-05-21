import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// SequenceExpression `(side(), typeof x === 'string')` carries the guard in its tail.
// parseTypeGuard now peels SequenceExpression after peelNegation - without the peel
// the BinaryExpression branch never sees the typeof comparison and the narrow drops.
// fixture combines a side-effect expression with a typeof tail in the if-condition
declare const x: string | string[];
declare function ping(): void;
if ((ping(), typeof x === 'string')) {
  _atMaybeString(x).call(x, 0);
}