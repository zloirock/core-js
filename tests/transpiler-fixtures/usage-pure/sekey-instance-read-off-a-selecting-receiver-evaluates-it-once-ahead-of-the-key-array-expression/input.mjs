// an instance read under an effectful computed key, off a selecting receiver - a ternary, a `||`, `??` or
// `&&`, an effectful arm or a sequence - evaluates that receiver once, ahead of the key's effect: a decided
// selection re-reads its live operand, any other is captured, guarded to throw on a nullish value before
// the key runs where it may be one, and a user arm reads through the Maybe dispatch
let k1 = 0;
var { [(k1++, 'at')]: a1, other1 } = Promise.prototype ? [7, 8] : [];
export const r1 = [typeof a1, k1];
