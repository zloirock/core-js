import _self from "@core-js/pure/actual/self";
// the realm logical default collapses only where a READ claim stands over it: a WRITE and a
// DELETE address the realm's own slot and keep the carrier, a SHADOWED name is the user's
// binding with a live right side, `&&` yields its RIGHT operand, and `global` has no pure
// entry - every one keeps the raw shape
(_self ?? {}).Array = 1;
delete (_self ?? {}).Array;
export function viaShadow(self) {
  return (self ?? {
    Number: {
      MAX_SAFE_INTEGER: 0
    }
  }).Number.MAX_SAFE_INTEGER;
}
export const viaAnd = (_self && {}).Number;
export const viaGlobal = (global ?? {}).Number;