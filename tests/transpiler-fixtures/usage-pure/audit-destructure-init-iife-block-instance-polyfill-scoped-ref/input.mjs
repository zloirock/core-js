// destructure init is an SE-tail-to-known-static (`(..., Array).from`), so polyfill fires on
// the outer destructure. the SE prefix is a nested IIFE: an outer expression-body arrow wraps
// an inner block-body arrow whose `[1].at(0)` needs a scoped `var _z;`. the outer replace must
// absorb that inner scoped var, else the inner insert lands inside the overwrite range and drops.
const { from } = ((() => ((() => { var z = [1, 2, 3].at(0); return z; })(), [4, 5, 6].at(0)))(), Array);
console.log(from);
