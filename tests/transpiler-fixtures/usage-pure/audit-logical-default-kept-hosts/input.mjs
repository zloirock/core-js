// the realm logical default collapses only where a READ claim stands over it: a WRITE and a
// DELETE address the realm's own slot and keep the carrier, a SHADOWED name is the user's
// binding with a live right side, `&&` yields its RIGHT operand, and `global` has no pure
// entry - every one keeps the raw shape
(self ?? {}).Array = 1;
delete (self ?? {}).Array;
export function viaShadow(self) {
  return (self ?? { Number: { MAX_SAFE_INTEGER: 0 } }).Number.MAX_SAFE_INTEGER;
}
export const viaAnd = (self && {}).Number;
export const viaGlobal = (global ?? {}).Number;
