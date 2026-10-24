// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
let from;
({ from } = Array);
export const r1 = from([1, 2]).at(0);
let keys, rest;
({ keys, ...rest } = Object);
export const r2 = keys({ a: 1 }).at(0);
let of2;
({ of: of2 } = Array);
of2 = somethingElse;
export const r3 = of2(3).at(0);
let from3;
({ a: { from: from3 } } = { a: Array });
export const r4 = from3([1]).includes(2);
