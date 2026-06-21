// usage-pure: the inline-callee `g` is conditionally reassigned BEFORE the use. both arrows
// return the same globalThis, but pure can't prove the reassignment value-equivalent (a
// receiver-dropping rewrite would be wrong if branches differed), so it conservatively bails -
// no `_Array$from`, only bare `globalThis` becomes `_globalThis`. usage-global over-injects and resolves
function f(c) {
  let g = () => globalThis;
  if (c) {
    g = () => globalThis;
  }
  return g().Array.from([1, 2, 3]);
}
