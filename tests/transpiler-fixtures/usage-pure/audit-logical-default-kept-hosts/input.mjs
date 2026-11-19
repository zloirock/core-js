// the realm logical default a READ claim stands over collapses into that claim; a WRITE and a
// DELETE address the realm's own slot with no claim over them, and their dead default folds like
// any user fallback, as an `&&` over the realm folds to the RIGHT operand it always yields. a SHADOWED
// name is the user's binding with a live right side and `global` has no pure entry - those keep the
// raw shape
(self ?? {}).Array = 1;
delete (self ?? {}).Array;
export function viaShadow(self) {
  return (self ?? { Number: { MAX_SAFE_INTEGER: 0 } }).Number.MAX_SAFE_INTEGER;
}
export const viaAnd = (self && {}).Number;
export const viaGlobal = (global ?? {}).Number;
