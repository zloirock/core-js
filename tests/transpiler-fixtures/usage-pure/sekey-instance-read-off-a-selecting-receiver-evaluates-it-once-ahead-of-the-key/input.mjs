// an instance read under an effectful computed key, off a selecting receiver - a ternary, a `||`, `??` or
// `&&`, an effectful arm or a sequence - evaluates that receiver once, ahead of the key's effect: a decided
// selection re-reads its live operand, any other is captured, guarded to throw on a nullish value before
// the key runs where it may be one, and a user arm reads through the Maybe dispatch
let k1 = 0;
var { [(k1++, 'at')]: a1, other1 } = Promise.prototype ? [7, 8] : [];
export const r1 = [typeof a1, k1];
let k2 = 0;
const arr2 = [1];
var { [(k2++, 'flat')]: f2, other2 } = arr2 || [];
export const r2 = [typeof f2, k2];
let k3 = 0;
const arr3 = [2];
var { [(k3++, 'includes')]: inc3, other3 } = arr3 ?? [];
export const r3 = [typeof inc3, k3];
let k4 = 0;
const arr4 = [3], arr5 = [4];
var { [(k4++, 'findLast')]: fl4, other4 } = arr4 && arr5;
export const r4 = [typeof fl4, k4];
let k5 = 0;
const userObj = { flatMap: undefined };
function pick(c) {
  var { [(k5++, 'flatMap')]: fm, other5 } = c ? [5] : userObj;
  return typeof fm;
}
export const r5 = [pick(true), pick(false), k5];
let k10 = 0;
var { [(k10++, 'toReversed')]: f10, other10 } = k10 >= 0 ? Array.of([1]) : [];
export const r10 = [typeof f10, k10];
let k11 = 0, s11 = 0;
var { [(k11++, 'findLastIndex')]: inc11, other11 } = (s11++, s11 > 0 ? Array.of(2) : []);
export const r11 = [typeof inc11, k11, s11];
