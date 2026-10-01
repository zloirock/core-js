// A spread argument at or before a defaulted parameter slot can supply the parameter from the
// spread iterable, so the default may be overridden - the binding must widen to the generic helper
// rather than narrow to the default array literal type (which `_atMaybeArray` would assume).
function f(a: any, b = [1, 2, 3]) {
  return b.at(0);
}
declare const args: any[];
f(...args);
