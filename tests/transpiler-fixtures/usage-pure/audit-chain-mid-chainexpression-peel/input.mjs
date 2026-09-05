// `(arr?.flat())?.at(0)`: paren-wrapped inner optional call followed by an outer
// optional member-call. oxc emits a nested ChainExpression for the inner segment
// inside the parens. each chain is handled as its own unit: outer chain stops at
// the paren boundary, inner chain visits independently. both polyfills land.
const arr: number[] = [1, 2];
(arr?.flat())?.at(0);
