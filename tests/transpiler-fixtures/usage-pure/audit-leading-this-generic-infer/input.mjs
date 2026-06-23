// Generic inference pairs each declared param against the matching call argument. a leading `this`
// pseudo-param fills no runtime arg, so the param list must be this-dropped before pairing - else
// `x: T` lines up against no argument and `T` never binds, losing the type-specific helper. with the
// drop, `g([1, 2])` binds `T` to number[] and `g("hi")` binds `T` to string. distinct methods on the
// two results keep each inference identifiable.
function g<T>(this: Window, x: T): T {
  return x;
}
const arr = g([1, 2]);
const str = g("hi");
export const r1 = arr.at(0);
export const r2 = str.includes("h");
